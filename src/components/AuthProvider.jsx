import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { AuthContext } from "../context/auth";
import { api } from "../lib/api";

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    api("/auth/me", { signal: controller.signal })
      .then((data) => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => {
        if (!controller.signal.aborted) {
          setReady(true);
        }
      });
    return () => controller.abort();
  }, []);

  const login = useCallback(async (username, password) => {
    const data = await api("/auth/login", { method: "POST", body: { username, password } });
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api("/auth/logout", { method: "POST" });
    } finally {
      setUser(null);
    }
  }, []);

  const changePassword = useCallback(
    (currentPassword, newPassword) => api("/admin/password", { method: "POST", body: { currentPassword, newPassword } }),
    []
  );

  const value = useMemo(() => ({ user, ready, login, logout, changePassword }), [user, ready, login, logout, changePassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node
};
