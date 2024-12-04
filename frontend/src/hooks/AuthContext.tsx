import { UserType } from "@/lib/types";
import { GET_USER_QUERY } from "@/queries/user";
import { ApolloQueryResult, useLazyQuery } from "@apollo/client";
import { jwtDecode } from "jwt-decode";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import toast from "react-hot-toast";

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  user: UserType | null;
  refetchUser: () => Promise<ApolloQueryResult<{ getUser: UserType }>>;
  login: (token: string) => void;
  logout: () => void;
  following: string[];
  setFollowing: Dispatch<SetStateAction<string[]>>;
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
  const [following, setFollowing] = useState<string[]>([]);

  const [fetchUser, { refetch: refetchUser }] = useLazyQuery(GET_USER_QUERY, {
    onCompleted: (data) => {
      if (data && data.getUser) {
        setUser(data.getUser);
        setFollowing(data.getUser.following.map((u: UserType) => u.username));
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
        if (decoded.exp * 1000 * 24 * 7 < Date.now()) {
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
  }, [fetchUser]);

  const login = (newToken: string) => {
    try {
      const decoded: DecodedToken = jwtDecode(newToken);
      localStorage.setItem("token", newToken);
      setIsLoggedIn(true);
      setToken(newToken);
      fetchUser({ variables: { username: decoded.username } });
    } catch (error) {
      toast.error(`Invalid token: ${(error as Error).message}`);
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    setIsLoggedIn(false);
    setToken(null);
    setUser(null);
    setFollowing([]);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        token,
        user,
        login,
        logout,
        refetchUser,
        following,
        setFollowing,
      }}
    >
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
