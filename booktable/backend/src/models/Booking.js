const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Restaurant',
    required: true
  },
  bookedTableDefinitionId: {
    type: mongoose.Schema.Types.ObjectId, // ID of the specific table definition in Restaurant.availableTables.tables
    // No 'ref' needed here as it's an ID of a subdocument, not a separate collection model
  },
  date: {
    type: String, // Changed from Date to String to prevent timezone conversions
    required: true
  },
  time: {
    type: String,
    required: true
  },
  partySize: {
    type: Number,
    required: true,
    min: 1
  },
  tableSize: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'cancelled'],
    default: 'pending'
  },
  bookingDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for querying user bookings
bookingSchema.index({ userId: 1 });
// Index for restaurant bookings
bookingSchema.index({ restaurantId: 1, date: 1, time: 1, tableSize: 1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;
