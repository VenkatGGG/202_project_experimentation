import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  Box,
  Typography,
  Button,
  Divider,
  Rating,
  Avatar,
  Stack
} from '@mui/material';
import moment from 'moment';
import ReviewForm from './ReviewForm';

const ReviewList = ({ reviews, restaurantId }) => {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const hasUserReviewed = () => {
    return reviews.some(review => review.userId._id === user?._id);
  };

  const getAverageRating = () => {
    if (reviews.length === 0) return 0;
    const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
    return (sum / reviews.length).toFixed(1);
  };

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating]++;
    });
    return distribution;
  };

  const distribution = getRatingDistribution();

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Reviews & Ratings
        </Typography>
        
        <Stack direction="row" spacing={4} alignItems="center" sx={{ mb: 3 }}>
          <Box textAlign="center">
            <Typography variant="h3" component="div" color="primary">
              {getAverageRating()}
            </Typography>
            <Rating
              value={parseFloat(getAverageRating())}
              readOnly
              precision={0.5}
              sx={{ mb: 1 }}
            />
            <Typography variant="body2" color="text.secondary">
              {reviews.length} reviews
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1 }}>
            {[5, 4, 3, 2, 1].map((rating) => (
              <Box
                key={rating}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  mb: 0.5
                }}
              >
                <Typography variant="body2" sx={{ minWidth: 20 }}>
                  {rating}
                </Typography>
                <Box
                  sx={{
                    flexGrow: 1,
                    mx: 1,
                    height: 8,
                    bgcolor: 'grey.200',
                    borderRadius: 1,
                    overflow: 'hidden'
                  }}
                >
                  <Box
                    sx={{
                      width: `${(distribution[rating] / reviews.length) * 100}%`,
                      height: '100%',
                      bgcolor: 'primary.main'
                    }}
                  />
                </Box>
                <Typography variant="body2" sx={{ minWidth: 30 }}>
                  {distribution[rating]}
                </Typography>
              </Box>
            ))}
          </Box>
        </Stack>

        {isAuthenticated && !hasUserReviewed() && (
          <Button
            variant="contained"
            onClick={() => setShowReviewForm(true)}
            sx={{ mb: 2 }}
          >
            Write a Review
          </Button>
        )}

        {showReviewForm && (
          <Box sx={{ mb: 3 }}>
            <ReviewForm
              restaurantId={restaurantId}
              onClose={() => setShowReviewForm(false)}
            />
          </Box>
        )}
      </Box>

      <Divider />

      {reviews.length > 0 ? (
        <Box sx={{ mt: 3 }}>
          {reviews.map((review) => (
            <Box key={review._id} sx={{ mb: 3 }}>
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  {review.userId.firstName.charAt(0)}
                </Avatar>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1">
                    {`${review.userId.firstName} ${review.userId.lastName}`}
                  </Typography>
                  <Rating value={review.rating} readOnly size="small" />
                  <Typography variant="body2" color="text.secondary" sx={{ my: 1 }}>
                    {moment(review.reviewDate).format('MMMM D, YYYY')}
                  </Typography>
                  <Typography variant="body1">
                    {review.comment}
                  </Typography>
                </Box>
              </Stack>
              <Divider sx={{ mt: 3 }} />
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="body1" color="text.secondary" sx={{ mt: 3 }}>
          No reviews yet. Be the first to review!
        </Typography>
      )}
    </Box>
  );
};

export default ReviewList;
