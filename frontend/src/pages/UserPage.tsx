import { useAuth } from "@/components/AuthContext";
import LoginForm from "@/components/LoginForm";
import { GET_USER_QUERY } from "@/queries/user";
import { useQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

interface DecodedToken {
  id: string;
  username: string;
  iat: number;
  exp: number;
}

const UserPage = () => {
  const { isLoggedIn } = useAuth();
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded: DecodedToken = jwtDecode(token);
        setUsername(decoded.username);
      } catch (error) {
        console.error("Invalid token:", error);
      }
    }
  }, []);

  const { data, loading, error } = useQuery(GET_USER_QUERY, {
    variables: { username: username || "" },
    skip: !isLoggedIn || !username,
  });

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error loading user data: {error.message}</p>;

  return (
    <main className="flex flex-col justify-center">
      {isLoggedIn ? (
        <div>
          <h2>Welcome, {data.getUser.username}</h2>
        </div>
      ) : (
        <LoginForm />
      )}
    </main>
  );
};

export default UserPage;
