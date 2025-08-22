import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Subscription, User } from '@/types/schema';
interface InitialStateType {
  data: {
    clients: User[];
    count: number;
  };
  loading: boolean;
  error: any;
}
const initialState: InitialStateType = {
  data: {
    clients: [],
    count: 0
  },
  loading: true,
  error: null
};

export const fetchClients = createAsyncThunk(
  'clients/fetchClients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/clients/fetchclients');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
export const updateClient = createAsyncThunk(
  'clients/updateClient',
  async ({ client }: { client: User }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/clients/updateclient', client);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
export const addClient = createAsyncThunk(
  'clients/addClient',
  async ({ client }: { client: User }, { rejectWithValue }) => {
    try {
      const response = await axios.post('/api/clients/addclient', client);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
export const deleteClient = createAsyncThunk(
  'clients/deleteClient',
  async (
    params: {
      id: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post('/api/clients/deleteclient', params);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);
export const toggleClientStatus = createAsyncThunk(
  'clients/toggleClientStatus',
  async (
    params: {
      id: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await axios.post(
        '/api/clients/toggleclientstatus',
        params
      );
      return { id: params.id };
    } catch (error: any) {
      return rejectWithValue(error);
    }
  }
);

const ClientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    setClients: (state, action) => {
      state.data.clients = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClients.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.loading = false;
        state.data.clients = action.payload;
      })
      .addCase(fetchClients.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(addClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addClient.fulfilled, (state, action) => {
        state.loading = false;
        state.data.clients.unshift(action.payload);
      })
      .addCase(addClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(updateClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.loading = false;
        state.data.clients = state.data.clients.map((document) =>
          document.id === action.payload.id ? action.payload : document
        );
      })
      .addCase(updateClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(deleteClient.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.loading = false;
        state.data.clients = state.data.clients.filter(
          (document) => document.id !== action.payload.id
        );
      })
      .addCase(deleteClient.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
    builder
      .addCase(toggleClientStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleClientStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.data.clients = state.data.clients.map((document) =>
          document.id === action.payload.id
            ? { ...document, is_active: !document.is_active }
            : document
        );
      })
      .addCase(toggleClientStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});
export default ClientsSlice.reducer;
