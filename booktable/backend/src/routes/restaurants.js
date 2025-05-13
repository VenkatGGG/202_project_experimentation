console.log("--- Loading restaurants.js Routes ---");
const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const {
  createRestaurant,
  searchRestaurants,
  getRestaurant,
  updateRestaurant,
  deleteRestaurant,
  getRestaurantStatistics,
  approveRestaurant,
  setRestaurantOnHold,
  getRestaurantsByManager,
  getAllRestaurants,
  getManagedRestaurants
} = require('../controllers/restaurantController');

// Public routes
router.get('/search', searchRestaurants);

// Protected routes - Admin specific or mixed (Specific string routes first)
router.get('/statistics', auth, authorize('admin'), getRestaurantStatistics);
router.get('/', auth, authorize('admin'), getAllRestaurants); // Admin route for all restaurants

// Protected routes - General Users or Managers (Specific string routes first)
router.get('/my-restaurants', auth, authorize('manager'), getManagedRestaurants);

// MUST BE LAST among GET routes with similar path structure:
// Parameterized routes like /:id should come after more specific string routes
router.get('/:id', getRestaurant); // Public route for a single restaurant by ID

// Protected routes - General Users or Managers
router.post('/', auth, authorize('manager'), createRestaurant);
router.put('/:id', auth, authorize('manager'), updateRestaurant);

// Protected routes - Admin specific or mixed (continued)
router.delete('/:id', auth, authorize('manager', 'admin'), deleteRestaurant);
router.put('/:id/approve', auth, authorize('admin'), approveRestaurant);
router.put('/:id/hold', auth, authorize('admin'), setRestaurantOnHold);

module.exports = router;
