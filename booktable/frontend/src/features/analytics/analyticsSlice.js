import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

const initialState = {
  bookingStats: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunk to fetch booking analytics
export const fetchBookingAnalytics = createAsyncThunk(
  'analytics/fetchBookingAnalytics',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/bookings/analytics');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingAnalytics.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBookingAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookingStats = action.payload;
        state.error = null;
      })
      .addCase(fetchBookingAnalytics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || 'Failed to fetch analytics';
      });
  }
});

export const { clearError } = analyticsSlice.actions;

export default analyticsSlice.reducer;
