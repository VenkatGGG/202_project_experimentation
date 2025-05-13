import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

// Async thunks
export const searchRestaurants = createAsyncThunk(
  'restaurants/search',
  async (searchParams, { rejectWithValue }) => {
    try {
      const response = await api.get('/restaurants/search', { 
        params: {
          ...searchParams
        }
      });
      console.log('API Response:', response.data); // Add this line
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to search restaurants' });
    }
  }
);

export const getAllRestaurants = createAsyncThunk(
  'restaurants/getAll',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await api.get('/restaurants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to get restaurants' });
    }
  }
);

export const getRestaurant = createAsyncThunk(
  'restaurants/getOne',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/restaurants/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to fetch restaurant' });
    }
  }
);

export const createRestaurant = createAsyncThunk(
  'restaurants/create',
  async (restaurantData, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await api.post('/restaurants', restaurantData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': undefined
        }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to create restaurant' });
    }
  }
);

export const updateRestaurant = createAsyncThunk(
  'restaurants/update',
  async ({ id, data }, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await api.put(`/restaurants/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to update restaurant' });
    }
  }
);

export const approveRestaurant = createAsyncThunk(
  'restaurants/approve',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await api.put(
        `/restaurants/${id}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to approve restaurant' });
    }
  }
);

export const deleteRestaurant = createAsyncThunk(
  'restaurants/delete',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      await api.delete(`/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to delete restaurant' });
    }
  }
);

export const fetchManagedRestaurants = createAsyncThunk(
  'restaurants/fetchManaged',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      if (!token) {
        return rejectWithValue({ error: 'Not authenticated' });
      }
      const response = await api.get('/restaurants/my-restaurants', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to fetch managed restaurants' });
    }
  }
);

export const setRestaurantOnHold = createAsyncThunk(
  'restaurants/setOnHold',
  async (id, { getState, rejectWithValue }) => {
    try {
      const { token } = getState().auth;
      const response = await api.put(
        `/restaurants/${id}/hold`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      return response.data; // Expecting the updated restaurant object
    } catch (error) {
      return rejectWithValue(error.response?.data || { error: 'Failed to set restaurant on hold' });
    }
  }
);

const initialState = {
  restaurants: [],
  currentRestaurant: null,
  loading: false,
  error: null
};

const restaurantSlice = createSlice({
  name: 'restaurants',
  initialState,
  reducers: {
    clearError(state) {
      state.error = null;
    },
    clearCurrentRestaurant(state) {
      state.currentRestaurant = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Search Restaurants
      .addCase(searchRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
      })
      .addCase(searchRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to search restaurants';
      })

      // Get All Restaurants
      .addCase(getAllRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload;
      })
      .addCase(getAllRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to get restaurants';
      })

      // Fetch Managed Restaurants
      .addCase(fetchManagedRestaurants.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchManagedRestaurants.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = action.payload; // Replace the list with manager's restaurants
      })
      .addCase(fetchManagedRestaurants.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.error || 'Failed to fetch managed restaurants';
      })

      // Get Restaurant
      .addCase(getRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRestaurant = action.payload;
      })
      .addCase(getRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to fetch restaurant';
      })

      // Create Restaurant
      .addCase(createRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants.push(action.payload); // Add to existing list
        state.currentRestaurant = action.payload; // Optionally set as current
      })
      .addCase(createRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to create restaurant';
      })

      // Update Restaurant
      .addCase(updateRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRestaurant = action.payload;
        const index = state.restaurants.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.restaurants[index] = action.payload;
        }
        // If updating the current restaurant, make sure it's updated
        if (state.currentRestaurant && state.currentRestaurant._id === action.payload._id) {
          state.currentRestaurant = action.payload;
        }
      })
      .addCase(updateRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to update restaurant';
      })

      // Approve Restaurant
      .addCase(approveRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        // action.payload should be the updated restaurant from the backend
        const index = state.restaurants.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.restaurants[index] = action.payload;
        }
        // Also update currentRestaurant if it's the one being approved
        if (state.currentRestaurant && state.currentRestaurant._id === action.payload._id) {
          state.currentRestaurant = action.payload;
        }
      })
      .addCase(approveRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to approve restaurant';
      })

      // Set Restaurant On Hold
      .addCase(setRestaurantOnHold.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(setRestaurantOnHold.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.restaurants.findIndex(r => r._id === action.payload._id);
        if (index !== -1) {
          state.restaurants[index] = action.payload;
        }
        if (state.currentRestaurant && state.currentRestaurant._id === action.payload._id) {
          state.currentRestaurant = action.payload;
        }
      })
      .addCase(setRestaurantOnHold.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to set restaurant on hold';
      })

      // Delete Restaurant
      .addCase(deleteRestaurant.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteRestaurant.fulfilled, (state, action) => {
        state.loading = false;
        state.restaurants = state.restaurants.filter(r => r._id !== action.payload);
        if (state.currentRestaurant && state.currentRestaurant._id === action.payload) {
          state.currentRestaurant = null; // Clear if current deleted
        }
      })
      .addCase(deleteRestaurant.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Failed to delete restaurant';
      });
  }
});

export const { clearError, clearCurrentRestaurant } = restaurantSlice.actions;
export default restaurantSlice.reducer;
