import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Gym } from '@/types/schema';
import axios from 'axios';

interface GymsState {
  data: {
    gyms: Gym[];
  };
  loading: boolean;
  error: string | null;
}

// Define the error payload type
interface ErrorPayload {
  message: string;
}

const initialState: GymsState = {
  data: {
    gyms: []
  },
  loading: false,
  error: null
};

// Fetch gyms
export const fetchGyms = createAsyncThunk(
  'gyms/fetchGyms',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get('/api/gyms/fetchgyms');
      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to fetch gyms'
      } as ErrorPayload);
    }
  }
);

// Add gym
export const addGym = createAsyncThunk(
  'gyms/addGym',
  async (gym: Partial<Gym>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/gyms/addgym', gym);
      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message:
          error.response?.data?.message || error.message || 'Failed to add gym'
      } as ErrorPayload);
    }
  }
);

// Update gym
export const updateGym = createAsyncThunk(
  'gyms/updateGym',
  async (gym: Partial<Gym>, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/gyms/updategym', gym);
      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to update gym'
      } as ErrorPayload);
    }
  }
);

// Delete gym
export const deleteGym = createAsyncThunk(
  'gyms/deleteGym',
  async (id: string, { rejectWithValue }) => {
    console.log(id);
    try {
      const response = await axios.post('/api/gyms/deletegym', {
        id: id
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to delete gym'
      } as ErrorPayload);
    }
  }
);

// Toggle gym status
export const toggleGymStatus = createAsyncThunk(
  'gyms/toggleGymStatus',
  async (
    { id, status }: { id: string; status: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('/api/gyms/togglegymstatus', {
        id,
        status
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        message:
          error.response?.data?.message ||
          error.message ||
          'Failed to toggle gym status'
      } as ErrorPayload);
    }
  }
);

const gymsSlice = createSlice({
  name: 'gyms',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch gyms
      .addCase(fetchGyms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGyms.fulfilled, (state, action) => {
        state.loading = false;
        state.data.gyms = action.payload.gyms;
      })
      .addCase(fetchGyms.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as ErrorPayload)?.message || 'Failed to fetch gyms';
      })
      // Add gym
      .addCase(addGym.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addGym.fulfilled, (state, action) => {
        state.loading = false;
        state.data.gyms.push(action.payload.gym);
      })
      .addCase(addGym.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as ErrorPayload)?.message || 'Failed to add gym';
      })
      // Update gym
      .addCase(updateGym.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateGym.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.gyms.findIndex(
          (gym) => gym.id === action.payload.gym.id
        );
        if (index !== -1) {
          state.data.gyms[index] = action.payload.gym;
        }
      })
      .addCase(updateGym.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as ErrorPayload)?.message || 'Failed to update gym';
      })
      // Delete gym
      .addCase(deleteGym.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteGym.fulfilled, (state, action) => {
        state.loading = false;
        state.data.gyms = state.data.gyms.filter(
          (gym) => gym.id !== action.payload.id
        );
      })
      .addCase(deleteGym.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as ErrorPayload)?.message || 'Failed to delete gym';
      })
      // Toggle gym status
      .addCase(toggleGymStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleGymStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.gyms.findIndex(
          (gym) => gym.id === action.payload.gym.id
        );
        if (index !== -1) {
          state.data.gyms[index] = action.payload.gym;
        }
      })
      .addCase(toggleGymStatus.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as ErrorPayload)?.message ||
          'Failed to toggle gym status';
      });
  }
});

export const { clearError } = gymsSlice.actions;
export default gymsSlice.reducer;
