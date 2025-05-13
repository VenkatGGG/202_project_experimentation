import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData);
      localStorage.setItem('token', response.data.token);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Registration failed' });
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials);
      console.log('Login response data:', response.data); // Log the response data
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('Token stored in localStorage:', localStorage.getItem('token')); // Confirm storage
      } else {
        console.error('Token missing in login response:', response.data);
      }
      return response.data;
    } catch (error) {
      console.error('Login API error:', error.response?.data || error);
      return rejectWithValue(error.response?.data || { error: 'Login failed' });
    }
  }
);

export const getProfile = createAsyncThunk(
  'auth/getProfile',
  async (_, { getState, rejectWithValue }) => {
    // Try getting token from state first, then localStorage as fallback
    let token = getState().auth.token;
    if (!token) {
      token = localStorage.getItem('token');
    }

    if (!token) {
      return rejectWithValue({ error: 'No token found' });
    }

    try {
      const response = await api.get('/auth/profile', {
        headers: { Authorization: `Bearer ${token}` } // Use the found token
      });
      return response.data;
    } catch (error) {
      // If profile fetch fails (e.g., invalid token), clear the bad token
      if (error.response?.status === 401) {
         localStorage.removeItem('token');
      }
      return rejectWithValue(error.response?.data || { error: 'Failed to get profile' });
    }
  }
);

const initialState = {
  token: localStorage.getItem('token'),
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Registration failed';
      })

      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Login failed';
      })

      // Get Profile
      .addCase(getProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get profile';
      });
  }
});

export const { clearError, logout } = authSlice.actions;
export default authSlice.reducer;
