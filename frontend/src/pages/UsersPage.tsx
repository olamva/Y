import LargeCardSkeleton from "@/components/Skeletons/LargeCardSkeleton";
import BackButton from "@/components/ui/BackButton";
import Divider from "@/components/ui/Divider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import ProfileCard from "@/components/Users/ProfileCard";
import { UserType } from "@/lib/types";
import { GET_USERS } from "@/queries/user";
import { NetworkStatus, useQuery } from "@apollo/client";
import { BugIcon, UserIcon, VerifiedIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const USERS_PER_PAGE = 16;

type FilterType = "ALL" | "VERIFIED" | "DEVELOPERS";

const UsersPage = () => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<FilterType>("ALL");

  useEffect(() => {
    switch (filter) {
      case "ALL":
        document.title = "Y · All Users";
        break;
      case "VERIFIED":
        document.title = "Y · All Verified Users";
        break;
      case "DEVELOPERS":
        document.title = "Y · All Developers";
        break;
    }
  }, [filter]);

  const { data, loading, error, fetchMore, networkStatus, refetch } = useQuery<{
    getUsers: UserType[];
  }>(GET_USERS, {
    variables: { page: 1, filter },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      if (data.getUsers.length < USERS_PER_PAGE) {
        setHasMore(false);
      }
    },
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

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    refetch({ page: 1, filter });
  }, [filter, refetch]);

  return (
    <div className="mx-auto min-h-screen w-full max-w-screen-xl px-5">
      <BackButton />
      <main className="flex w-full flex-col items-center justify-center">
        <ToggleGroup
          value={filter}
          onValueChange={(newFilter: FilterType) => {
            if (newFilter) setFilter(newFilter);
          }}
          type="single"
          variant="outline"
          role="radiogroup"
          className="mb-4 flex items-center justify-evenly gap-2"
        >
          <ToggleGroupItem
            value="ALL"
            aria-label="Filter by all users"
            aria-checked={filter === "ALL"}
            role="radio"
            className="gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base"
          >
            <UserIcon className="hidden size-4 sm:block md:size-6" />
            <p>All Users</p>
          </ToggleGroupItem>

          <ToggleGroupItem
            value="VERIFIED"
            aria-label="Filter by verified users"
            aria-checked={filter === "VERIFIED"}
            role="radio"
            className="gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base"
          >
            <VerifiedIcon className="hidden size-4 sm:block md:size-6" />
            <p>Verified Users</p>
          </ToggleGroupItem>

          <ToggleGroupItem
            value="DEVELOPERS"
            aria-label="Filter by developers"
            aria-checked={filter === "DEVELOPERS"}
            role="radio"
            className="gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base"
          >
            <BugIcon className="hidden size-4 sm:block md:size-6" />
            <p>Developers</p>
          </ToggleGroupItem>
        </ToggleGroup>
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

        {loading && (
          <div className="flex w-full flex-wrap justify-evenly gap-x-2 gap-y-4">
            {Array.from({ length: USERS_PER_PAGE }).map((_, index) => (
              <LargeCardSkeleton key={index} />
            ))}
          </div>
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
