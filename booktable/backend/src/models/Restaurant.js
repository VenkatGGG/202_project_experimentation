const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zip: String
  },
  contactInfo: {
    phone: String,
    email: String
  },
  hours: {
    opening: String,
    closing: String
  },
  // Physical tables in the restaurant
  tables: [{
    tableSize: {
      type: Number,
      required: true
    },
    count: {
      type: Number,
      required: true,
      default: 0
    }
  }],
  // Available tables for specific dates
  availableTables: [{
    date: {
      type: Date,
      required: true
    },
    tables: [{
      tableSize: Number,
      availableTimes: [String]
    }]
  }],
  // Bookings made at the restaurant
  bookings: [{
    bookingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking'
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    date: Date,
    time: String,
    tableSize: Number,
    numberOfGuests: Number,
    status: {
      type: String,
      enum: ['confirmed', 'cancelled', 'completed', 'no-show'],
      default: 'confirmed'
    }
  }],
  cuisineType: {
    type: String,
    required: true
  },
  costRating: {
    type: Number,
    min: 1,
    max: 4
  },
  description: String,
  photos: [String],
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isPending: {
    type: Boolean,
    default: true
  },
  timesBookedToday: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for text search
restaurantSchema.index({ name: 'text', description: 'text' });
// Index for location-based searches
restaurantSchema.index({ 'address.city': 1, 'address.state': 1 });
// Index for cuisine type
restaurantSchema.index({ cuisineType: 1 });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);
module.exports = Restaurant;
