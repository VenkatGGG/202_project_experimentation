const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createBooking,
  getUserBookings,
  getRestaurantBookings,
  cancelBooking,
  getBookingAnalytics
} = require('../controllers/bookingController');

// Customer routes
router.post('/', auth, createBooking);
router.get('/user', auth, getUserBookings);
router.patch('/:id/cancel', auth, cancelBooking);

// Restaurant manager routes
router.get('/restaurant/:restaurantId', auth, authorize('manager'), getRestaurantBookings);

// Admin routes
router.get('/analytics', auth, authorize('admin'), getBookingAnalytics);

module.exports = router;
