import { useAuth } from "@/components/AuthContext";
import LoginForm from "@/components/LoginForm";
import { GET_USER_QUERY } from "@/queries/user";
import { useQuery } from "@apollo/client";

const UserPage = () => {
  const { isLoggedIn, user } = useAuth();

  const { data, loading, error } = useQuery(GET_USER_QUERY, {
    variables: { username: user?.username || "" },
    skip: !isLoggedIn || !user?.username,
  });

  if (!isLoggedIn) {
    return <LoginForm />;
  }

  if (loading) return <p>Loading...</p>;

  if (error) return <p>Error loading user data: {error.message}</p>;

  if (!data || !data.getUser) {
    return <p>User not found.</p>;
  }

  return (
    <main className="flex flex-col justify-center">
      <div>
        <h2>Welcome, {data.getUser.username}</h2>
      </div>
    </main>
  );
};

export default UserPage;
