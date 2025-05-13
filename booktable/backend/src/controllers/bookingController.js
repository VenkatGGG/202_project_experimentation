const Booking = require('../models/Booking');
const Restaurant = require('../models/Restaurant');
const moment = require('moment');
const User = require('../models/User'); 
const { sendBookingConfirmationEmail } = require('../utils/emailService'); 
const Notification = require('../models/Notification'); 

exports.createBooking = async (req, res) => {
  try {
    const { restaurantId, date, time, partySize } = req.body;
    const userId = req.user._id;

    if (!restaurantId || !date || !time || !partySize) {
      return res.status(400).json({ error: 'Missing required booking information.' });
    }
    const numericPartySize = parseInt(partySize, 10);
    if (isNaN(numericPartySize) || numericPartySize <= 0) {
      return res.status(400).json({ error: 'Invalid party size.' });
    }

    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant not found' });
    }

    const searchDateStr = moment(date).utc().format('YYYY-MM-DD');
    const availabilityForDate = restaurant.availableTables.find(entry => 
      moment(entry.date).utc().format('YYYY-MM-DD') === searchDateStr
    );

    if (!availabilityForDate) {
      return res.status(400).json({ error: 'No tables available for this date' });
    }

    const suitableTable = availabilityForDate.tables.find(
      table => table.tableSize >= numericPartySize && table.availableTimes.includes(time)
    );

    if (!suitableTable) {
      return res.status(400).json({ error: 'No suitable table available for the requested time and party size' });
    }

    const booking = new Booking({
      userId,
      restaurantId,
      date: moment(date).utc().startOf('day').toDate(),
      time,
      partySize: numericPartySize,
      tableSize: suitableTable.tableSize, // Keep this for quick reference if needed
      bookedTableDefinitionId: suitableTable._id, // Store the specific table definition ID
      status: 'confirmed'
    });

    await booking.save();

    suitableTable.availableTimes = suitableTable.availableTimes.filter(t => t !== time);
    restaurant.markModified('availableTables'); 
    await restaurant.save();

    await Restaurant.findByIdAndUpdate(restaurantId, {
      $inc: { timesBookedToday: 1 }
    });

    const populatedBooking = await Booking.findById(booking._id)
                                        .populate('userId', 'firstName lastName email')
                                        .populate('restaurantId', 'name address');

    // Send booking confirmation email (fire and forget, or await if critical and handle errors)
    if (populatedBooking && populatedBooking.userId && populatedBooking.restaurantId) {
      try {
        await sendBookingConfirmationEmail(
          populatedBooking.userId,      // User object (populated with email, firstName)
          populatedBooking,           // Booking object (has date, time, partySize)
          populatedBooking.restaurantId // Restaurant object (populated with name)
        );
      } catch (emailError) {
        console.error('Failed to send booking confirmation email:', emailError);
        // Do not block the response to the user due to email failure
        // Log this error for monitoring
      }
    }
    
    // Create a notification for successful booking
    try {
      await Notification.create({
        userId: populatedBooking.userId._id, // Assuming userId is populated and has _id
        message: `Your booking at ${populatedBooking.restaurantId.name} for ${moment(populatedBooking.date).format('MMMM Do YYYY')} at ${populatedBooking.time} is confirmed.`,
        type: 'booking_confirmed',
        bookingId: populatedBooking._id
      });
    } catch (notificationError) {
      console.error('Failed to create booking confirmation notification:', notificationError);
      // Log this error for monitoring, do not fail the booking creation
    }

    res.status(201).json(populatedBooking);

  } catch (error) {
    console.error('Error creating booking:', error); 
    res.status(500).json({ error: 'Error creating booking' });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('restaurantId', 'name address')
      .sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching bookings' });
  }
};

exports.getRestaurantBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ restaurantId: req.params.restaurantId })
      .populate('userId', 'firstName lastName')
      .sort({ date: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching restaurant bookings' });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
      status: { $ne: 'cancelled' }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found or already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    const restaurant = await Restaurant.findById(booking.restaurantId);
    if (!restaurant) {
      console.error(`Restaurant not found (ID: ${booking.restaurantId}) during cancellation of booking ${booking._id}`);
      // Not returning error to user, as booking is already cancelled. Log for admin.
      return res.json(booking); // Return the cancelled booking
    }

    // Find the availability entry for the specific date of the booking
    const availabilityEntryForDate = restaurant.availableTables.find(entry => 
      moment(entry.date).utc().isSame(moment(booking.date).utc(), 'day')
    );

    if (availabilityEntryForDate) {
      let specificTableDefinition;
      if (booking.bookedTableDefinitionId) {
        // NEW LOGIC: Find the exact table definition using the stored ID
        specificTableDefinition = availabilityEntryForDate.tables.find(
          table => table._id.equals(booking.bookedTableDefinitionId)
        );
      } else {
        // FALLBACK for older bookings: Find by tableSize (previous logic)
        console.warn(`Booking ${booking._id} does not have bookedTableDefinitionId. Falling back to tableSize match for cancellation.`);
        specificTableDefinition = availabilityEntryForDate.tables.find(
          table => table.tableSize === booking.tableSize && table.availableTimes.indexOf(booking.time) === -1 // Ensure time was actually booked on *a* table of this size
        );
      }

      if (specificTableDefinition) {
        // Add the time slot back to this specific table's availableTimes
        // if it's not already there (to prevent duplicates if somehow cancelled twice)
        if (!specificTableDefinition.availableTimes.includes(booking.time)) {
          specificTableDefinition.availableTimes.push(booking.time);
          // Sort HH:mm times correctly
          specificTableDefinition.availableTimes.sort((a, b) => {
            return moment(a, 'HH:mm').diff(moment(b, 'HH:mm'));
          });
          restaurant.markModified('availableTables'); // IMPORTANT for nested arrays
          await restaurant.save();
        }
      } else {
        // This indicates a potential data inconsistency
        if (booking.bookedTableDefinitionId) {
          console.error(`Consistency Error: Booked table definition ID ${booking.bookedTableDefinitionId} (size ${booking.tableSize}) not found for date ${moment(booking.date).utc().format('YYYY-MM-DD')} in restaurant ${restaurant._id} during cancellation of booking ${booking._id}`);
        } else {
          console.error(`Consistency Error: No table of size ${booking.tableSize} found (or time ${booking.time} not booked on it) for date ${moment(booking.date).utc().format('YYYY-MM-DD')} in restaurant ${restaurant._id} during cancellation of booking ${booking._id} (fallback).`);
        }
      }
    } else {
      // This also indicates a potential data inconsistency
      console.error(`Consistency Error: No availability entry found for date ${moment(booking.date).utc().format('YYYY-MM-DD')} in restaurant ${restaurant._id} during cancellation of booking ${booking._id}`);
    }

    // Create a notification for successful cancellation
    try {
      const cancelledBooking = await Booking.findById(booking._id)
                                       .populate('userId', 'email') // Need user for notification
                                       .populate('restaurantId', 'name'); // Need restaurant name
      if (cancelledBooking && cancelledBooking.userId && cancelledBooking.restaurantId) {
        await Notification.create({
          userId: cancelledBooking.userId._id,
          message: `Your booking at ${cancelledBooking.restaurantId.name} for ${moment(cancelledBooking.date).format('MMMM Do YYYY')} at ${cancelledBooking.time} has been cancelled.`,
          type: 'booking_cancelled',
          bookingId: cancelledBooking._id
        });
      } else {
         console.error('Failed to populate booking details for cancellation notification.');
      }
    } catch (notificationError) {
      console.error('Failed to create booking cancellation notification:', notificationError);
      // Log this error for monitoring
    }

    // Send back the updated booking (status: 'cancelled')
    // res.json(booking); // booking object here is not populated with restaurant name for notification message
    // Instead, send back the populated one if available, or the original if population failed
    const finalBookingResponse = await Booking.findById(booking._id)
                                      .populate('userId', 'firstName lastName email')
                                      .populate('restaurantId', 'name address');

    res.json(finalBookingResponse || booking); 
  } catch (error) {
    console.error('Error cancelling booking:', error); 
    res.status(500).json({ error: 'Error cancelling booking' });
  }
};

exports.getBookingAnalytics = async (req, res) => {
  try {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const analytics = await Booking.aggregate([
      {
        $match: {
          createdAt: { $gte: lastMonth },
          status: 'confirmed'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' }
          },
          totalBookings: { $sum: 1 },
          averagePartySize: { $avg: '$partySize' }
        }
      },
      {
        $sort: { '_id.year': -1, '_id.month': -1, '_id.day': -1 }
      }
    ]);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching booking analytics' });
  }
};
