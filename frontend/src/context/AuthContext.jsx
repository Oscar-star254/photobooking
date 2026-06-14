import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (token && savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        setUser(parsedUser);
      } catch (e) {
        console.error("Error parsing saved user:", e);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } finally {
        setLoading(false);
      }
    } else if (token) {
      // Token exists but no saved user, fetch profile
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      api.get("/auth/profile")
        .then(res => {
          const userData = res.data.user;
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        })
        .catch((err) => {
          console.error("Error fetching profile:", err);
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          delete api.defaults.headers.common["Authorization"];
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });
      const { token, user } = res.data;
      
      if (!token || !user) {
        throw new Error("Invalid response: missing token or user data");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (error) {
      // Clean up on failure
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      // normalize error message from server
      const serverMessage = error?.response?.data?.error || error.message || "Login failed";
      const err = new Error(serverMessage);
      err.original = error;
      throw err;
    }
  };

  const register = async (data) => {
    try {
      const res = await api.post("/auth/register", data);
      const { token, user } = res.data;

      if (!token || !user) {
        throw new Error("Invalid response: missing token or user data");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (error) {
      // Clean up on failure
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      delete api.defaults.headers.common["Authorization"];
      const serverMessage = error?.response?.data?.error || error.message || "Registration failed";
      const err = new Error(serverMessage);
      err.original = error;
      throw err;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};