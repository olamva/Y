import BackButton from "@/components/BackButton";
import Post from "@/components/Post/Post";
import ProfileCard from "@/components/ProfileCard";
import { PostType, UserType } from "@/lib/types";
import { SEARCH_POSTS, SEARCH_USERS } from "@/queries/search";
import { NetworkStatus, useQuery } from "@apollo/client";
import { FilterIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const RESULTS_PAGE_SIZE = 10;

const SearchPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const searchQuery = params.get("q") || "";
  const [filterType, setFilterType] = useState<"all" | "post" | "user">("all");

  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
    fetchMore,
    networkStatus,
  } = useQuery<{
    searchPosts: PostType[];
  }>(SEARCH_POSTS, {
    variables: { query: searchQuery, page: 1 },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
  } = useQuery<{ searchUsers: UserType[] }>(SEARCH_USERS, {
    variables: { query: searchQuery },
    skip: !searchQuery,
  });

  const loadMoreResults = useCallback(async () => {
    if (!hasMore || postsLoading) return;

    try {
      const { data: fetchMoreData } = await fetchMore({
        variables: { query: searchQuery, page: page + 1 },
      });

      if (fetchMoreData?.searchPosts) {
        if (fetchMoreData.searchPosts.length < RESULTS_PAGE_SIZE) {
          setHasMore(false);
        }
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more posts: ${(error as Error).message}`);
    }
  }, [fetchMore, hasMore, postsLoading, page, searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        networkStatus !== NetworkStatus.fetchMore &&
        hasMore
      ) {
        loadMoreResults();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [postsLoading, page, hasMore, networkStatus, loadMoreResults]);

  if (usersLoading) {
    return <p>Loading...</p>;
  }
  if (postsError) return <p>Error: {postsError.message}</p>;
  if (usersError) return <p>Error: {usersError.message}</p>;

  return (
    <div className="w-full">
      <BackButton />
      <main className="mx-auto flex w-full max-w-xl flex-col items-center justify-center px-4">
        <h1 className="my-4 text-center text-2xl font-bold">
          Search results for: {searchQuery}
        </h1>
        <div className="mb-4 flex items-center gap-2">
          <FilterIcon className="text-gray-800 dark:text-gray-200" />
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(e.target.value as "all" | "post" | "user")
            }
            className="rounded border border-gray-300 bg-white p-2 outline-none dark:bg-gray-800"
          >
            <option value="all">All</option>
            <option value="post">Posts</option>
            <option value="user">Users</option>
          </select>
        </div>

        {usersData && usersData?.searchUsers.length === 0 && (
          <p className="text-center text-gray-500">No users found.</p>
        )}

        {postsData && postsData?.searchPosts.length === 0 && (
          <p className="text-center text-gray-500">No posts found.</p>
        )}

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filterType !== "post" &&
            usersData?.searchUsers.map((user) => (
              <div key={user.id} className="col-span-1 flex justify-center">
                <ProfileCard user={user} />
              </div>
            ))}

          {filterType !== "user" &&
            postsData?.searchPosts.map((post) => (
              <div
                key={post.id}
                className="col-span-1 flex justify-center sm:col-span-2 lg:col-span-3"
              >
                <Post post={post} />
              </div>
            ))}

          {postsLoading ||
            (networkStatus === NetworkStatus.loading && (
              <p>Loading results...</p>
            ))}

          {!hasMore && (
            <p className="col-span-1 mt-4 justify-self-center text-gray-500 dark:text-gray-400 sm:col-span-2 lg:col-span-3">
              You've reached the end of the search results.
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default SearchPage;
