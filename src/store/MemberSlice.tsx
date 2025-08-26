import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

// Types
export interface Member {
  id: string;
  user_id: string;
  gym_id: string;
  joinedAt: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    address: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
    date_of_birth: string;
    is_active: boolean;
    role: string;
  };
  gym: {
    id: string;
    name: string;
  };
}

export interface CreateMemberData {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  country: string;
  date_of_birth: string;
  password: string;
  gym_id: string;
}

export interface UpdateMemberData extends Partial<CreateMemberData> {
  id: string;
  user_id: string;
}

// Initial state
interface MemberState {
  data: {
    members: Member[];
    total: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: MemberState = {
  data: {
    members: [],
    total: 0
  },
  loading: false,
  error: null
};

// Async thunks
export const fetchMembers = createAsyncThunk(
  'members/fetchMembers',
  async (gymId: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(
        `/api/members/fetchmembers?gym_id=${gymId}`
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch members'
      );
    }
  }
);

export const addMember = createAsyncThunk(
  'members/addMember',
  async (memberData: CreateMemberData, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/members/addmember', memberData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add member'
      );
    }
  }
);

export const updateMember = createAsyncThunk(
  'members/updateMember',
  async (memberData: UpdateMemberData, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        '/api/members/updatemember',
        memberData
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update member'
      );
    }
  }
);

export const deleteMember = createAsyncThunk(
  'members/deleteMember',
  async (memberId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/members/deletemember', {
        id: memberId
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete member'
      );
    }
  }
);

export const toggleMemberStatus = createAsyncThunk(
  'members/toggleMemberStatus',
  async (
    { id, status }: { id: string; status: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('/api/members/togglememberstatus', {
        id,
        status
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle member status'
      );
    }
  }
);

// Slice
const memberSlice = createSlice({
  name: 'members',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearMembers: (state) => {
      state.data.members = [];
      state.data.total = 0;
    }
  },
  extraReducers: (builder) => {
    // Fetch members
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.data.members = action.payload.members || [];
        state.data.total = action.payload.total || 0;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Add member
    builder
      .addCase(addMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.loading = false;
        state.data.members.unshift(action.payload.member);
        state.data.total += 1;
      })
      .addCase(addMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update member
    builder
      .addCase(updateMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMember.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.members.findIndex(
          (member) => member.id === action.payload.member.id
        );
        if (index !== -1) {
          state.data.members[index] = action.payload.member;
        }
      })
      .addCase(updateMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Delete member
    builder
      .addCase(deleteMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMember.fulfilled, (state, action) => {
        state.loading = false;
        state.data.members = state.data.members.filter(
          (member) => member.id !== action.payload.member.id
        );
        state.data.total -= 1;
      })
      .addCase(deleteMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Toggle member status
    builder
      .addCase(toggleMemberStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleMemberStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.data.members.findIndex(
          (member) => member.id === action.payload.member.id
        );
        if (index !== -1) {
          state.data.members[index] = action.payload.member;
        }
      })
      .addCase(toggleMemberStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError, clearMembers } = memberSlice.actions;
export default memberSlice.reducer;
