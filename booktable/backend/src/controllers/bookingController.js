const Booking = require('../models/Booking');
const Restaurant = require('../models/Restaurant');
const moment = require('moment');
const User = require('../models/User'); 
const { sendBookingConfirmationEmail, sendBookingCancellationEmail } = require('../utils/emailService'); 
const Notification = require('../models/Notification'); 

exports.createBooking = async (req, res) => {
  try {
    console.log('Creating booking with data:', req.body);
    const { restaurantId, date, time, partySize } = req.body;
    const userId = req.user._id;

    if (!restaurantId || !date || !time || !partySize) {
      console.log('Missing required booking information:', { restaurantId, date, time, partySize });
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
      tableSize: suitableTable.tableSize,
      bookedTableDefinitionId: suitableTable._id,
      status: 'confirmed'
    });

    console.log('Saving new booking:', booking);
    await booking.save();
    console.log('Booking saved successfully');

    suitableTable.availableTimes = suitableTable.availableTimes.filter(t => t !== time);
    restaurant.markModified('availableTables'); 
    await restaurant.save();

    await Restaurant.findByIdAndUpdate(restaurantId, {
      $inc: { timesBookedToday: 1 }
    });

    console.log('Fetching populated booking details for email');
    const populatedBooking = await Booking.findById(booking._id)
                                      .populate('userId', 'firstName lastName email')
                                      .populate('restaurantId', 'name address');

    console.log('Populated booking details:', {
      hasUser: !!populatedBooking?.userId,
      hasRestaurant: !!populatedBooking?.restaurantId,
      userEmail: populatedBooking?.userId?.email,
      restaurantName: populatedBooking?.restaurantId?.name
    });

    // Send booking confirmation email
    if (populatedBooking && populatedBooking.userId && populatedBooking.restaurantId) {
      console.log('Attempting to send confirmation email to:', populatedBooking.userId.email);
      try {
        const emailResult = await sendBookingConfirmationEmail(
          populatedBooking.userId,
          populatedBooking,
          populatedBooking.restaurantId
        );
        console.log('Email sent successfully:', emailResult);
      } catch (emailError) {
        console.error('Failed to send booking confirmation email. Error details:', {
          message: emailError.message,
          code: emailError.code,
          stack: emailError.stack
        });
      }
    } else {
      console.error('Cannot send email - missing required data:', {
        hasBooking: !!populatedBooking,
        hasUser: !!populatedBooking?.userId,
        hasRestaurant: !!populatedBooking?.restaurantId
      });
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
    console.log('Attempting to cancel booking:', req.params.id);
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      console.log('Booking not found:', req.params.id);
      return res.status(404).json({ error: 'Booking not found' });
    }

    console.log('Found booking:', {
      id: booking._id,
      userId: booking.userId,
      status: booking.status,
      date: booking.date,
      time: booking.time
    });

    // Check if the user is authorized to cancel this booking
    if (booking.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      console.log('Unauthorized cancellation attempt:', {
        bookingUserId: booking.userId.toString(),
        requestUserId: req.user._id.toString(),
        userRole: req.user.role
      });
      return res.status(403).json({ error: 'Not authorized to cancel this booking' });
    }

    // Check if the booking is already cancelled
    if (booking.status === 'cancelled') {
      console.log('Booking already cancelled:', booking._id);
      return res.status(400).json({ error: 'Booking is already cancelled' });
    }

    // Update booking status
    console.log('Updating booking status to cancelled');
    booking.status = 'cancelled';
    await booking.save();
    console.log('Booking status updated successfully');

    // Update restaurant's available tables
    console.log('Updating restaurant tables for booking:', booking.restaurantId);
    const restaurant = await Restaurant.findById(booking.restaurantId);
    if (restaurant) {
      const dateStr = moment(booking.date).format('YYYY-MM-DD');
      const availabilityForDate = restaurant.availableTables.find(entry => 
        moment(entry.date).format('YYYY-MM-DD') === dateStr
      );

      if (availabilityForDate) {
        const table = availabilityForDate.tables.find(t => t._id.toString() === booking.bookedTableDefinitionId.toString());
        if (table) {
          console.log('Adding back time slot to table:', booking.time);
          table.availableTimes.push(booking.time);
          restaurant.markModified('availableTables');
          await restaurant.save();
          console.log('Restaurant tables updated successfully');
        } else {
          console.log('Table not found in availability:', booking.bookedTableDefinitionId);
        }
      } else {
        console.log('No availability found for date:', dateStr);
      }
    } else {
      console.log('Restaurant not found:', booking.restaurantId);
    }

    // Get populated booking details for email and notification
    console.log('Fetching populated booking details for cancellation email');
    const populatedBooking = await Booking.findById(booking._id)
                                      .populate('userId', 'firstName lastName email')
                                      .populate('restaurantId', 'name address');

    console.log('Populated booking details:', {
      hasUser: !!populatedBooking?.userId,
      hasRestaurant: !!populatedBooking?.restaurantId,
      userEmail: populatedBooking?.userId?.email,
      restaurantName: populatedBooking?.restaurantId?.name
    });

    // Send cancellation email
    if (populatedBooking && populatedBooking.userId && populatedBooking.restaurantId) {
      console.log('Attempting to send cancellation email to:', populatedBooking.userId.email);
      try {
        const emailResult = await sendBookingCancellationEmail(
          populatedBooking.userId,
          populatedBooking,
          populatedBooking.restaurantId
        );
        console.log('Cancellation email sent successfully:', emailResult);
      } catch (emailError) {
        console.error('Failed to send booking cancellation email. Error details:', {
          message: emailError.message,
          code: emailError.code,
          stack: emailError.stack
        });
      }
    } else {
      console.error('Cannot send cancellation email - missing required data:', {
        hasBooking: !!populatedBooking,
        hasUser: !!populatedBooking?.userId,
        hasRestaurant: !!populatedBooking?.restaurantId
      });
    }

    // Create a notification for successful cancellation
    try {
      if (populatedBooking && populatedBooking.userId && populatedBooking.restaurantId) {
        console.log('Creating cancellation notification');
        await Notification.create({
          userId: populatedBooking.userId._id,
          message: `Your booking at ${populatedBooking.restaurantId.name} for ${moment(populatedBooking.date).format('MMMM Do YYYY')} at ${populatedBooking.time} has been cancelled.`,
          type: 'booking_cancelled',
          bookingId: populatedBooking._id
        });
        console.log('Cancellation notification created successfully');
      }
    } catch (notificationError) {
      console.error('Failed to create booking cancellation notification:', notificationError);
    }

    console.log('Cancellation process completed successfully');
    res.json(populatedBooking || booking);
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
