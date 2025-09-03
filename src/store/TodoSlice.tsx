import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { toast } from 'sonner';

export interface TodoItem {
  id: string;
  title: string;
  description: string;
  is_completed: boolean;
  is_active: boolean;
  is_deleted: boolean;
  user_id: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTodoData {
  title: string;
  description: string;
}

export interface UpdateTodoData {
  id: string;
  title?: string;
  description?: string;
}

interface TodoState {
  data: {
    todos: TodoItem[];
    total: number;
  };
  loading: boolean;
  error: string | null;
}

const initialState: TodoState = {
  data: { todos: [], total: 0 },
  loading: false,
  error: null
};

export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_: void, { rejectWithValue }) => {
    try {
      const res = await axios.get('/api/todo/fetchtodos');
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch todos');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to fetch todos'
      );
    }
  }
);

export const addTodo = createAsyncThunk(
  'todos/addTodo',
  async (data: CreateTodoData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/todo/addtodo', data);
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to add todo');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to add todo'
      );
    }
  }
);

export const updateTodo = createAsyncThunk(
  'todos/updateTodo',
  async (data: UpdateTodoData, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/todo/updatetodo', data);
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update todo');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update todo'
      );
    }
  }
);

export const deleteTodo = createAsyncThunk(
  'todos/deleteTodo',
  async (id: string, { rejectWithValue }) => {
    try {
      const res = await axios.post('/api/todo/deletetodo', { id });
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to delete todo');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to delete todo'
      );
    }
  }
);

export const toggleTodoCompleted = createAsyncThunk(
  'todos/toggleTodoCompleted',
  async (
    { id, completed }: { id: string; completed: boolean },
    { rejectWithValue }
  ) => {
    try {
      const res = await axios.post('/api/todo/toggletodocompleted', {
        id,
        completed
      });
      return res.data;
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle todo');
      return rejectWithValue(
        error.response?.data?.message || 'Failed to toggle todo'
      );
    }
  }
);

const todoSlice = createSlice({
  name: 'todos',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.loading = false;
        state.data.todos = action.payload.todos || [];
        state.data.total = action.payload.total || 0;
      })
      .addCase(fetchTodos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(addTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.data.todos.unshift(action.payload.todo);
        state.data.total += 1;
      })
      .addCase(addTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateTodo.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.data.todos.findIndex(
          (t) => t.id === action.payload.todo.id
        );
        if (idx !== -1) state.data.todos[idx] = action.payload.todo;
      })
      .addCase(updateTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteTodo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTodo.fulfilled, (state, action) => {
        state.loading = false;
        state.data.todos = state.data.todos.filter(
          (t) => t.id !== action.payload.todo.id
        );
        state.data.total -= 1;
      })
      .addCase(deleteTodo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(toggleTodoCompleted.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleTodoCompleted.fulfilled, (state, action) => {
        state.loading = false;
        const idx = state.data.todos.findIndex(
          (t) => t.id === action.payload.todo.id
        );
        if (idx !== -1) state.data.todos[idx] = action.payload.todo;
      })
      .addCase(toggleTodoCompleted.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearError } = todoSlice.actions;
export default todoSlice.reducer;
