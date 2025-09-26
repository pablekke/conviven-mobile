import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
};

export type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ token: string; user: AuthUser }>
    ) => {
      state.accessToken = action.payload.token;
      state.user = action.payload.user;
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { clearCredentials, setCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;
