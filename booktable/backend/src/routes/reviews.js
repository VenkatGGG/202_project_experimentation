const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  createReview,
  getRestaurantReviews,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');

router.post('/', auth, createReview);
router.get('/restaurant/:restaurantId', getRestaurantReviews);
router.put('/:id', auth, updateReview);
router.delete('/:id', auth, deleteReview);

module.exports = router;
