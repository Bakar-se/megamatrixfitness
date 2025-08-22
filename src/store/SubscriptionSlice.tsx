import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Feature, Subscription } from '@/types/schema';
interface InitialStateType {
  data: {
    subscriptions: Subscription[];
    features: Feature[];
    count: number;
  };
  loading: boolean;
  error: any;
}
const initialState: InitialStateType = {
  data: {
    subscriptions: [],
    features: [],
    count: 0
  },
  loading: true,
  error: null
};

export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchSubscriptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post(
        '/api/subscriptions/fetchsubscriptions'
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
export const fetchFeatures = createAsyncThunk(
  'subscriptions/fetchFeatures',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/subscriptions/fetchfeatures');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
export const updateSubscription = createAsyncThunk(
  'subscriptions/updateSubscription',
  async (
    { subscription }: { subscription: Subscription },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        '/api/subscriptions/updatesubscription',
        subscription
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
export const addSubscription = createAsyncThunk(
  'subscriptions/addSubscription',
  async (
    { subscription }: { subscription: Subscription },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        '/api/subscriptions/addsubscription',
        subscription
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
export const deleteSubscription = createAsyncThunk(
  'subscriptions/deleteSubscription',
  async (
    params: {
      id: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        '/api/subscriptions/deletesubscription',
        params
      );
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
export const toggleSubscriptionStatus = createAsyncThunk(
  'subscriptions/toggleSubscriptionStatus',
  async (
    params: {
      id: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        '/api/subscriptions/togglesubscriptionstatus',
        params
      );
      return { id: params.id };
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

const SubscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    setSubscriptions: (state, action) => {
      state.data.subscriptions = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.data.subscriptions = action.payload;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchFeatures.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFeatures.fulfilled, (state, action) => {
        state.loading = false;
        state.data.features = action.payload;
      })
      .addCase(fetchFeatures.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.data.subscriptions.unshift(action.payload);
      })
      .addCase(addSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.data.subscriptions = state.data.subscriptions.map((document) =>
          document.id === action.payload.id ? action.payload : document
        );
      })
      .addCase(updateSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(deleteSubscription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.data.subscriptions = state.data.subscriptions.filter(
          (document) => document.id !== action.payload.id
        );
      })
      .addCase(deleteSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(toggleSubscriptionStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleSubscriptionStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.data.subscriptions = state.data.subscriptions.map((document) =>
          document.id === action.payload.id
            ? { ...document, is_active: !document.is_active }
            : document
        );
      })
      .addCase(toggleSubscriptionStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});
export default SubscriptionsSlice.reducer;
