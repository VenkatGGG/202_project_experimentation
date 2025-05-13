import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api'; // Assuming 'api' is your preconfigured axios instance

// Async Thunks
export const fetchUserNotifications = createAsyncThunk(
  'notifications/fetchUserNotifications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/notifications');
      return response.data; // Expected: { notifications: [], unreadCount: 0 }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markNotificationAsRead = createAsyncThunk(
  'notifications/markNotificationAsRead',
  async (notificationId, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/notifications/${notificationId}/read`);
      return response.data; // Expected: updated notification object
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const markAllNotificationsAsRead = createAsyncThunk(
  'notifications/markAllNotificationsAsRead',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.patch('/notifications/read-all');
      return response.data; // Expected: { message: 'All notifications marked as read' }
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const initialState = {
  items: [],
  unreadCount: 0,
  loading: false,
  error: null,
};

const notificationSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationError: (state) => {
      state.error = null;
    },
    // Reducer to decrement unread count locally when a notification is read
    // This can be used for a more immediate UI update if needed,
    // though fetchUserNotifications after marking read also updates it.
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount--;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch User Notifications
      .addCase(fetchUserNotifications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.notifications;
        state.unreadCount = action.payload.unreadCount;
      })
      .addCase(fetchUserNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch notifications';
      })
      // Mark Notification As Read
      .addCase(markNotificationAsRead.pending, (state) => {
        // Optionally set a specific loading state for this item
      })
      .addCase(markNotificationAsRead.fulfilled, (state, action) => {
        const updatedNotification = action.payload;
        const existingItem = state.items.find(item => item._id === updatedNotification._id);
        // Only decrement unreadCount if the notification was genuinely unread before this action
        if (existingItem && !existingItem.isRead && updatedNotification.isRead) {
          if(state.unreadCount > 0) state.unreadCount--;
        }
        state.items = state.items.map(item => 
          item._id === updatedNotification._id ? updatedNotification : item
        );
      })
      .addCase(markNotificationAsRead.rejected, (state, action) => {
        state.error = action.payload?.error || 'Failed to mark notification as read';
      })
      // Mark All Notifications As Read
      .addCase(markAllNotificationsAsRead.pending, (state) => {
        state.loading = true; // Or a more specific loading state
      })
      .addCase(markAllNotificationsAsRead.fulfilled, (state) => {
        state.loading = false;
        state.items = state.items.map(item => ({ ...item, isRead: true }));
        state.unreadCount = 0;
      })
      .addCase(markAllNotificationsAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to mark all notifications as read';
      });
  },
});

export const { clearNotificationError, decrementUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
