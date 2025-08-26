import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Equipment types enum
export enum EquipmentType {
  MACHINE = 'MACHINE',
  PLATES = 'PLATES',
  DUMBBELL = 'DUMBBELL',
  BAR = 'BAR',
  KETTLEBELL = 'KETTLEBELL',
  CARDIO = 'CARDIO',
  ACCESSORY = 'ACCESSORY',
  BENCH = 'BENCH',
  RACK = 'RACK',
  CABLE = 'CABLE'
}

// Types
export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  quantity: string;
  weight?: string;
  is_active: boolean;
  is_deleted: boolean;
  gym_id: string;
  gym: {
    id: string;
    name: string;
  };
}

export interface CreateEquipmentData {
  name: string;
  type: EquipmentType;
  quantity: string;
  weight?: string;
  gym_id: string;
}

export interface UpdateEquipmentData extends Partial<CreateEquipmentData> {
  id: string;
}

// Initial state
interface EquipmentState {
  data: {
    equipment: Equipment[];
    total: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: EquipmentState = {
  data: {
    equipment: [],
    total: 0
  },
  loading: false,
  error: null
};

// Async thunks
export const fetchEquipment = createAsyncThunk(
  'equipment/fetchEquipment',
  async (gymId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/equipment/fetchequipment?gym_id=${gymId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch equipment'
      );
    }
  }
);

export const addEquipment = createAsyncThunk(
  'equipment/addEquipment',
  async (equipmentData: CreateEquipmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        '/api/equipment/addequipment',
        equipmentData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add equipment'
      );
    }
  }
);

export const updateEquipment = createAsyncThunk(
  'equipment/updateEquipment',
  async (equipmentData: UpdateEquipmentData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        '/api/equipment/updateequipment',
        equipmentData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update equipment'
      );
    }
  }
);

export const deleteEquipment = createAsyncThunk(
  'equipment/deleteEquipment',
  async (equipmentId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/equipment/deleteequipment', {
        id: equipmentId
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete equipment'
      );
    }
  }
);

export const toggleEquipmentStatus = createAsyncThunk(
  'equipment/toggleEquipmentStatus',
  async (
    { id, status }: { id: string; status: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        '/api/equipment/toggleequipmentstatus',
        { id, status }
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle equipment status'
      );
    }
  }
);

// Slice
const equipmentSlice = createSlice({
  name: 'equipment',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearEquipment: (state) => {
      state.data.equipment = [];
      state.data.total = 0;
    }
  },
  extraReducers: (builder) => {
    // Fetch equipment
    builder
      .addCase(fetchEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.data.equipment = action.payload.equipment || [];
        state.data.total = action.payload.total || 0;
      })
      .addCase(fetchEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add equipment
    builder
      .addCase(addEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.data.equipment.unshift(action.payload.equipment);
        state.data.total += 1;
      })
      .addCase(addEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update equipment
    builder
      .addCase(updateEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateEquipment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.equipment.findIndex(
          (equipment) => equipment.id === action.payload.equipment.id
        );
        if (index !== -1) {
          state.data.equipment[index] = action.payload.equipment;
        }
      })
      .addCase(updateEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete equipment
    builder
      .addCase(deleteEquipment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteEquipment.fulfilled, (state, action) => {
        state.loading = false;
        state.data.equipment = state.data.equipment.filter(
          (equipment) => equipment.id !== action.payload.equipment.id
        );
        state.data.total -= 1;
      })
      .addCase(deleteEquipment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle equipment status
    builder
      .addCase(toggleEquipmentStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleEquipmentStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.equipment.findIndex(
          (equipment) => equipment.id === action.payload.equipment.id
        );
        if (index !== -1) {
          state.data.equipment[index] = action.payload.equipment;
        }
      })
      .addCase(toggleEquipmentStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearEquipment } = equipmentSlice.actions;
export default equipmentSlice.reducer;
