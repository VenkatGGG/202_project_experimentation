import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async thunks
export const createBooking = createAsyncThunk(
  'bookings/create',
  async (bookingData, { rejectWithValue }) => {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getUserBookings = createAsyncThunk(
  'bookings/getUserBookings',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bookings/user');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getRestaurantBookings = createAsyncThunk(
  'bookings/getRestaurantBookings',
  async (restaurantId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bookings/restaurant/${restaurantId}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancel',
  async (bookingId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/bookings/${bookingId}/cancel`, {});
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const getBookingAnalytics = createAsyncThunk(
  'bookings/analytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bookings/analytics');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  userBookings: [],
  restaurantBookings: [],
  analytics: [],
  loading: false,
  error: null
};

const bookingSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearRestaurantBookings: (state) => {
      state.restaurantBookings = [];
      state.error = null; // Also clear error when clearing bookings for a fresh view
    }
  },
  extraReducers: (builder) => {
    builder
      // Create Booking
      .addCase(createBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings.unshift(action.payload);
      })
      .addCase(createBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to create booking';
      })
      // Get User Bookings
      .addCase(getUserBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings = action.payload;
      })
      .addCase(getUserBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch user bookings';
      })
      // Get Restaurant Bookings
      .addCase(getRestaurantBookings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRestaurantBookings.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurantBookings = action.payload;
      })
      .addCase(getRestaurantBookings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch restaurant bookings';
      })
      // Cancel Booking
      .addCase(cancelBooking.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelBooking.fulfilled, (state, action) => {
        state.loading = false;
        state.userBookings = state.userBookings.map(booking =>
          booking._id === action.payload._id ? action.payload : booking
        );
      })
      .addCase(cancelBooking.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to cancel booking';
      })
      // Get Booking Analytics
      .addCase(getBookingAnalytics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getBookingAnalytics.fulfilled, (state, action) => {
        state.loading = false;
        state.analytics = action.payload;
      })
      .addCase(getBookingAnalytics.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch booking analytics';
      });
  }
});

export const { clearError, clearRestaurantBookings } = bookingSlice.actions;
export default bookingSlice.reducer;
