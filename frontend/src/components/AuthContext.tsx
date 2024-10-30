import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { GET_USER_QUERY } from "@/queries/user";
import { useLazyQuery } from "@apollo/client";
import { UserType } from "@/lib/types";

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  user: UserType | null;
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
  const [user, setUser] = useState<UserType | null>(null);

  const [fetchUser] = useLazyQuery(GET_USER_QUERY, {
    onCompleted: (data) => {
      if (data && data.getUser) {
        setUser(data.getUser);
      }
    },
    onError: (err) => {
      console.error("Error fetching user data:", err);
      logout();
    },
  });

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      try {
        const decoded: DecodedToken = jwtDecode(storedToken);
        if (decoded.exp * 1000 * 24 < Date.now()) {
          logout();
        } else {
          setIsLoggedIn(true);
          setToken(storedToken);
          fetchUser({ variables: { username: decoded.username } });
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
      fetchUser({ variables: { username: decoded.username } });
    } catch (error) {
      console.error("Invalid token:", error);
      logout();
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
