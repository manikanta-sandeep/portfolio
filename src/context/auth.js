import { createContext, useContext } from "react";

// { user, ready, login(username, password), logout(), changePassword(current, next) }
export const AuthContext = createContext({ user: null, ready: true });

export function useAuth() {
  return useContext(AuthContext);
}
