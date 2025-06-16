import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface Profile {
  _id: string;
  alias: string;
  userId: string;
  name: string;
  emailContact: string;
  phoneContact: string;
  companyName: string;
  dob: string;
  address: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

interface User {
  _id: string;
  alias: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  profile: Profile | null;
  token: string | null;
  isAuthenticated: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  profile: null,
  token: null,
  isAuthenticated: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    loginSuccess(state, action: PayloadAction<{ user: User; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
      state.error = null;
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = action.payload;
    },
    logout(state) {
      state.user = null;
      state.profile = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    updateUser(state, action: PayloadAction<User>) {
      state.user = action.payload;
      state.error = null;
    },
    setProfile(state, action: PayloadAction<Profile | null>) {
      state.profile = action.payload;
    },
  },
});

export const { loginSuccess, loginFailure, logout, updateUser, setProfile } = authSlice.actions;
export default authSlice.reducer;