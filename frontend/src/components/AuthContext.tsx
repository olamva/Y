import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  user: { id: string; username: string } | null;
  login: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface DecodedToken {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; username: string } | null>(
    null,
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded: DecodedToken = jwtDecode(storedToken);
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          // Token expired
          logout();
        } else {
          setIsLoggedIn(true);
          setToken(storedToken);
          setUser({ id: decoded.id, username: decoded.username });
        }
      } catch (error) {
        console.error("Invalid token:", error);
        logout();
      }
    }
  }, []);

  const login = (newToken: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(newToken);
      localStorage.setItem("token", newToken);
      setIsLoggedIn(true);
      setToken(newToken);
      setUser({ id: decoded.id, username: decoded.username });
    } catch (error) {
      console.error("Invalid token:", error);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
