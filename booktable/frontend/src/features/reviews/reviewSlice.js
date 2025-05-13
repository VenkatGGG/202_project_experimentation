import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async thunks
export const createReview = createAsyncThunk(
  'reviews/create',
  async (reviewData, { rejectWithValue }) => {
    try {
      const response = await api.post('/reviews', reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getRestaurantReviews = createAsyncThunk(
  'reviews/getRestaurantReviews',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/reviews/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateReview = createAsyncThunk(
  'reviews/update',
  async ({ reviewId, reviewData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, reviewData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'reviews/delete',
  async (reviewId, { rejectWithValue }) => {
    try {
      await api.delete(`/reviews/${reviewId}`);
      return reviewId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  restaurantReviews: [],
  loading: false,
  error: null
};

const reviewSlice = createSlice({
  name: 'reviews',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Review
      .addCase(createReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createReview.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurantReviews.unshift(action.payload);
      })
      .addCase(createReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Restaurant Reviews
      .addCase(getRestaurantReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRestaurantReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurantReviews = action.payload;
      })
      .addCase(getRestaurantReviews.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Review
      .addCase(updateReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateReview.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurantReviews = state.restaurantReviews.map(review =>
          review._id === action.payload._id ? action.payload : review
        );
      })
      .addCase(updateReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Review
      .addCase(deleteReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurantReviews = state.restaurantReviews.filter(
          review => review._id !== action.payload
        );
      })
      .addCase(deleteReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearError } = reviewSlice.actions;
export default reviewSlice.reducer;
