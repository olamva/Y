import { useAuth } from "@/components/AuthContext";
import LoginForm from "@/components/LoginForm";
import Profile from "@/pages/Profile";
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
    <main className="flex w-full flex-col justify-center">
      <div className="pt-5 text-center">
        <h2 className="text-2xl font-bold">Welcome, {data.getUser.username}</h2>
      </div>
      <Profile username={data.getUser.username} />
    </main>
  );
};

export default UserPage;
