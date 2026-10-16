import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { User } from './interface/User.interface';
import storage from "redux-persist/lib/storage"; // Importa el storage de redux-persist

interface UserState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      state.loading = false;
      state.error = null;
    },
    
    setLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    
    logout: (state) => {
      state.user = null; // Borra solo el usuario en memoria
    },

    resetState: () => {
      return initialState; // Resetea todo el estado de Redux a su estado inicial
    },
  },
});

export const { setUser, setLoading, setError, logout, resetState } = userSlice.actions;
export default userSlice.reducer;
