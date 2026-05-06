import { loginUser, loginWithGoogle, logout, registerUser,registerUserNoSession } from './auth';

export const server = {
  // actions

  // Auth
  registerUser,
  logout,
  loginUser,
  loginWithGoogle,
  registerUserNoSession
};
