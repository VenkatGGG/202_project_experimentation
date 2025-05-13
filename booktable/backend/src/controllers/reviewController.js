const Review = require('../models/Review');
const Booking = require('../models/Booking');

exports.createReview = async (req, res) => {
  try {
    const { restaurantId, rating, comment } = req.body;

    // Check if user has booked this restaurant before
    const hasBooked = await Booking.findOne({
      userId: req.user._id,
      restaurantId,
      status: 'confirmed'
    });

    if (!hasBooked) {
      return res.status(403).json({ error: 'You can only review restaurants you have booked' });
    }

    // Check if user has already reviewed this restaurant
    const existingReview = await Review.findOne({
      userId: req.user._id,
      restaurantId
    });

    if (existingReview) {
      return res.status(400).json({ error: 'You have already reviewed this restaurant' });
    }

    const review = new Review({
      restaurantId,
      userId: req.user._id,
      rating,
      comment
    });

    await review.save();
    res.status(201).json(review);
  } catch (error) {
    res.status(500).json({ error: 'Error creating review' });
  }
};

exports.getRestaurantReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ restaurantId: req.params.restaurantId })
      .populate('userId', 'firstName lastName')
      .sort({ reviewDate: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
};

exports.updateReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const review = await Review.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    review.rating = rating;
    review.comment = comment;
    await review.save();

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Error updating review' });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting review' });
  }
};
