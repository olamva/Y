import { useAuth } from "@/components/AuthContext";
import LoginForm from "@/components/LoginForm";
import { useState, useEffect } from "react";

const UserPage = () => {
  const { isLoggedIn, logout } = useAuth();
  const [user, setUser] = useState<{ username: string } | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchUserProfile(token);
    }
  }, []);

  const fetchUserProfile = async (token: string) => {
    try {
      const response = await fetch("/project2/graphql", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          query: `
            query GetUser {
              getUser(username: "${user?.username}")
            }
          `,
        }),
      });

      const { data } = await response.json();
      setUser(data.getUser);
    } catch (error) {
      console.error("Error fetching user profile", error);
    }
  };

  return (
    <main className="flex flex-col justify-center">
      {isLoggedIn ? (
        <div>
          <h2>Welcome, {user?.username}</h2>
          <button onClick={logout}>Logout</button>
        </div>
      ) : (
        <LoginForm />
      )}
    </main>
  );
};

export default UserPage;
