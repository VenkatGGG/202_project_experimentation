import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import restaurantReducer from '../features/restaurants/restaurantSlice';
import bookingReducer from '../features/bookings/bookingSlice';
import reviewReducer from '../features/reviews/reviewSlice';
import analyticsReducer from '../features/analytics/analyticsSlice';
import notificationReducer from '../features/notifications/notificationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    restaurants: restaurantReducer,
    bookings: bookingReducer,
    reviews: reviewReducer,
    analytics: analyticsReducer,
    notifications: notificationReducer
  }
});
