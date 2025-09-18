// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from "react";
import { getUser } from "../api/user";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      console.log("user:", user);
    }
  }, [user]);

  const getCurrentUser = async () => {
    try {
      const res = await getUser();
      if (res.status === 200) {
        console.log("curr user:", res);
        setUser(res.data);
      }
    } catch (error) {
      console.log("error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCurrentUser();
  }, []);

  if (loading) {
    return <div>Loading...</div>; // or spinner/skeleton
  }

  return (
    <AuthContext.Provider value={{ user, setUser, loading, isAuth: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const authContext = () => useContext(AuthContext);
