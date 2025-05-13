import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  message: null,
  type: null, // 'success', 'error', 'info', 'warning'
  open: false
};

const uiFeedbackSlice = createSlice({
  name: 'uiFeedback',
  initialState,
  reducers: {
    showFeedback: (state, action) => {
      const { message, type = 'info' } = action.payload;
      state.message = message;
      state.type = type;
      state.open = true;
    },
    hideFeedback: (state) => {
      state.open = false;
      state.message = null;
      state.type = null;
    }
  }
});

export const { showFeedback, hideFeedback } = uiFeedbackSlice.actions;

// Selectors
export const selectFeedback = (state) => state.uiFeedback;

export default uiFeedbackSlice.reducer; 