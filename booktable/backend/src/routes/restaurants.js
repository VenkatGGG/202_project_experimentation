console.log("--- Loading restaurants.js Routes ---");
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
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

// Configure multer for file uploads
const storage = multer.memoryStorage(); // Store files in memory for processing

const fileFilter = (req, file, cb) => {
  // Accept images only
  const filetypes = /jpeg|jpg|png|gif/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed!'));
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter: fileFilter
});

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
router.post('/', auth, authorize('manager'), upload.single('photo'), createRestaurant);
router.put('/:id', auth, authorize('manager'), upload.single('photo'), updateRestaurant);

// Protected routes - Admin specific or mixed (continued)
router.delete('/:id', auth, authorize('manager', 'admin'), deleteRestaurant);
router.put('/:id/approve', auth, authorize('admin'), approveRestaurant);
router.put('/:id/hold', auth, authorize('admin'), setRestaurantOnHold);

module.exports = router;
