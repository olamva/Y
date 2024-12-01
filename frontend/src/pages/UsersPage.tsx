import BackButton from "@/components/BackButton";
import ProfileCard from "@/components/ProfileCard";
import Divider from "@/components/ui/Divider";
import { UserType } from "@/lib/types";
import { GET_USERS } from "@/queries/user";
import { NetworkStatus, useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const USERS_PER_PAGE = 16;

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    document.title = `Y · All Users`;
  }, []);

  const { data, loading, error, fetchMore, networkStatus } = useQuery<{
    getUsers: UserType[];
  }>(GET_USERS, {
    variables: { page: 1 },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const users = data?.getUsers || [];

  const loadMoreUsers = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const { data: fetchMoreData } = await fetchMore({
        variables: { page: page + 1 },
      });

      if (fetchMoreData?.getUsers) {
        if (fetchMoreData.getUsers.length < USERS_PER_PAGE) {
          setHasMore(false);
        }
        if (fetchMoreData.getUsers.length > 0) {
          setPage((prev) => prev + 1);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more users: ${(error as Error).message}`);
    }
  }, [fetchMore, hasMore, loading, page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        networkStatus !== NetworkStatus.fetchMore &&
        hasMore
      ) {
        loadMoreUsers();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreUsers, hasMore, networkStatus]);

  if (loading && networkStatus === NetworkStatus.loading) {
    return <p className="mt-4 text-center">Loading users...</p>;
  }

  return (
    <div className="mx-auto min-h-screen w-full max-w-screen-xl px-5">
      <BackButton />
      <main className="flex w-full flex-col items-center justify-center">
        <h1 className="my-4 text-3xl font-bold">All users</h1>
        <Divider />
        <div className="flex w-full flex-wrap justify-evenly gap-x-2 gap-y-4">
          {error && (
            <p className="mt-4 text-center text-red-500">
              Error loading users: {error.message}
            </p>
          )}
          {users.map((user) => (
            <div
              className="w-full min-w-24 max-w-40 sm:max-w-48 md:min-w-64 md:max-w-72"
              key={user.id}
            >
              <ProfileCard user={user} large />
            </div>
          ))}
        </div>

        {loading && networkStatus === NetworkStatus.fetchMore && (
          <p className="mt-4 text-center">Loading more users...</p>
        )}
        {!hasMore && (
          <p className="mt-4 text-center text-gray-500">
            You've reached the end of the users.
          </p>
        )}
        {users.length === 0 && !loading && (
          <p className="mt-4 text-center text-gray-500">No users available</p>
        )}
      </main>
    </div>
  );
};

export default UsersPage;
