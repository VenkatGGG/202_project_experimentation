import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const initialState = {
  bookingStats: [],
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};

// Async thunk to fetch booking analytics
export const fetchBookingAnalytics = createAsyncThunk(
  'analytics/fetchBookingAnalytics',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth.user; // Assuming user object with token is in auth slice
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await axios.get('/api/bookings/analytics', config); 
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response ? err.response.data : err.message);
    }
  }
);

const analyticsSlice = createSlice({
  name: 'analytics',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookingAnalytics.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBookingAnalytics.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.bookingStats = action.payload;
      })
      .addCase(fetchBookingAnalytics.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload?.error || action.payload || 'Failed to fetch booking analytics';
      });
  },
});

export default analyticsSlice.reducer;
