import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Paper,
  Typography,
  Rating,
  TextField,
  Button,
  Stack,
  Alert
} from '@mui/material';
import { createReview } from '../../features/reviews/reviewSlice';

const ReviewForm = ({ restaurantId, onClose }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.reviews);

  const [formData, setFormData] = useState({
    rating: 0,
    comment: ''
  });
  const [ratingError, setRatingError] = useState(false);

  const handleRatingChange = (event, newValue) => {
    setFormData({ ...formData, rating: newValue });
    setRatingError(false);
  };

  const handleCommentChange = (event) => {
    setFormData({ ...formData, comment: event.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.rating) {
      setRatingError(true);
      return;
    }

    const reviewData = {
      restaurantId,
      rating: formData.rating,
      comment: formData.comment
    };

    const resultAction = await dispatch(createReview(reviewData));
    if (!resultAction.error) {
      onClose();
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Write a Review
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Box sx={{ mb: 3 }}>
          <Typography component="legend" gutterBottom>
            Your Rating
          </Typography>
          <Rating
            name="rating"
            value={formData.rating}
            onChange={handleRatingChange}
            precision={1}
            size="large"
          />
          {ratingError && (
            <Typography color="error" variant="caption" display="block">
              Please select a rating
            </Typography>
          )}
        </Box>

        <TextField
          fullWidth
          multiline
          rows={4}
          label="Your Review"
          value={formData.comment}
          onChange={handleCommentChange}
          required
          sx={{ mb: 3 }}
        />

        <Stack direction="row" spacing={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Review'}
          </Button>
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </Stack>
      </form>
    </Paper>
  );
};

export default ReviewForm;
