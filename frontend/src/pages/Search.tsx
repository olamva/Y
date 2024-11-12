import BackButton from "@/components/BackButton";
import Post from "@/components/Post/Post";
import ProfileCard from "@/components/ProfileCard";
import HashtagCard from "@/components/HashtagCard";
import { PostType, UserType, HashtagType } from "@/lib/types";
import { SEARCH_POSTS, SEARCH_USERS, SEARCH_HASHTAGS } from "@/queries/search";
import { useQuery } from "@apollo/client";
import { FilterIcon } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const RESULTS_PAGE_SIZE = 10;

const SearchPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";
  const [filterType, setFilterType] = useState<
    "all" | "post" | "user" | "hashtag"
  >("all");

  const [pagePosts, setPagePosts] = useState(1);
  const [pageUsers, setPageUsers] = useState(1);
  const [pageHashtags, setPageHashtags] = useState(1);

  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreUsers, setHasMoreUsers] = useState(true);
  const [hasMoreHashtags, setHasMoreHashtags] = useState(true);

  const {
    data: postsData,
    loading: postsLoading,
    error: postsError,
    fetchMore: fetchMorePosts,
  } = useQuery<{ searchPosts: PostType[] }>(SEARCH_POSTS, {
    variables: {
      query: searchQuery,
      page: pagePosts,
      limit: RESULTS_PAGE_SIZE,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    skip: filterType === "user" || filterType === "hashtag",
  });

  const {
    data: usersData,
    loading: usersLoading,
    error: usersError,
    fetchMore: fetchMoreUsers,
  } = useQuery<{ searchUsers: UserType[] }>(SEARCH_USERS, {
    variables: {
      query: searchQuery,
      page: pageUsers,
      limit: RESULTS_PAGE_SIZE,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    skip: filterType === "post" || filterType === "hashtag",
  });

  const {
    data: hashtagsData,
    loading: hashtagsLoading,
    error: hashtagsError,
    fetchMore: fetchMoreHashtags,
  } = useQuery<{ searchHashtags: HashtagType[] }>(SEARCH_HASHTAGS, {
    variables: {
      query: searchQuery,
      page: pageHashtags,
      limit: RESULTS_PAGE_SIZE,
    },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    skip: filterType !== "hashtag" && filterType !== "all",
  });

  const loadMoreResults = useCallback(async () => {
    if (
      (filterType === "post" || filterType === "all") &&
      hasMorePosts &&
      !postsLoading
    ) {
      try {
        const { data: fetchMoreData } = await fetchMorePosts({
          variables: {
            query: searchQuery,
            page: pagePosts + 1,
            limit: RESULTS_PAGE_SIZE,
          },
        });

        if (fetchMoreData?.searchPosts.length < RESULTS_PAGE_SIZE) {
          setHasMorePosts(false);
        }
        setPagePosts((prev) => prev + 1);
      } catch (error) {
        toast.error(`Failed to load more posts: ${(error as Error).message}`);
      }
    }

    if (
      (filterType === "user" || filterType === "all") &&
      hasMoreUsers &&
      !usersLoading
    ) {
      try {
        const { data: fetchMoreData } = await fetchMoreUsers({
          variables: {
            query: searchQuery,
            page: pageUsers + 1,
            limit: RESULTS_PAGE_SIZE,
          },
        });

        if (fetchMoreData?.searchUsers.length < RESULTS_PAGE_SIZE) {
          setHasMoreUsers(false);
        }
        setPageUsers((prev) => prev + 1);
      } catch (error) {
        toast.error(`Failed to load more users: ${(error as Error).message}`);
      }
    }

    if (
      (filterType === "hashtag" || filterType === "all") &&
      hasMoreHashtags &&
      !hashtagsLoading
    ) {
      try {
        const { data: fetchMoreData } = await fetchMoreHashtags({
          variables: {
            query: searchQuery,
            page: pageHashtags + 1,
            limit: RESULTS_PAGE_SIZE,
          },
        });

        if (fetchMoreData?.searchHashtags.length < RESULTS_PAGE_SIZE) {
          setHasMoreHashtags(false);
        }
        setPageHashtags((prev) => prev + 1);
      } catch (error) {
        toast.error(
          `Failed to load more hashtags: ${(error as Error).message}`,
        );
      }
    }
  }, [
    fetchMorePosts,
    fetchMoreUsers,
    fetchMoreHashtags,
    hasMorePosts,
    hasMoreUsers,
    hasMoreHashtags,
    postsLoading,
    usersLoading,
    hashtagsLoading,
    filterType,
    pagePosts,
    pageUsers,
    pageHashtags,
    searchQuery,
  ]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        (hasMorePosts || hasMoreUsers || hasMoreHashtags) &&
        !(postsLoading || usersLoading || hashtagsLoading)
      ) {
        loadMoreResults();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    hasMorePosts,
    hasMoreUsers,
    hasMoreHashtags,
    postsLoading,
    usersLoading,
    hashtagsLoading,
    loadMoreResults,
  ]);

  useEffect(() => {
    setPagePosts(1);
    setPageUsers(1);
    setPageHashtags(1);

    setHasMorePosts(true);
    setHasMoreUsers(true);
    setHasMoreHashtags(true);
  }, [searchQuery, filterType]);

  const isAnyLoading = postsLoading || usersLoading || hashtagsLoading;
  const isAnyError = postsError || usersError || hashtagsError;

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
              setFilterType(
                e.target.value as "all" | "post" | "user" | "hashtag",
              )
            }
            className="rounded border border-gray-300 bg-white p-2 outline-none dark:bg-gray-800"
          >
            <option value="all">All</option>
            <option value="post">Posts</option>
            <option value="user">Users</option>
            <option value="hashtag">Hashtags</option>
          </select>
        </div>

        {isAnyError && (
          <div className="mb-4">
            {postsError && (
              <p className="text-center text-red-500">
                Error: {postsError.message}
              </p>
            )}
            {usersError && (
              <p className="text-center text-red-500">
                Error: {usersError.message}
              </p>
            )}
            {hashtagsError && (
              <p className="text-center text-red-500">
                Error: {hashtagsError.message}
              </p>
            )}
          </div>
        )}

        {isAnyLoading && <p className="mb-4 text-center">Loading results...</p>}

        {!isAnyLoading && !isAnyError && (
          <>
            {postsData?.searchPosts.length === 0 &&
              usersData?.searchUsers.length === 0 &&
              hashtagsData?.searchHashtags.length === 0 && (
                <p className="text-center text-gray-500">No results found.</p>
              )}
          </>
        )}
        {/* Hashtags */}
        {(filterType === "all" || filterType === "hashtag") &&
          hashtagsData?.searchHashtags.map((hashtag) => (
            <div key={hashtag.tag} className="my-4 w-full">
              <HashtagCard hashtag={hashtag} />
            </div>
          ))}

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Users */}
          {(filterType === "all" || filterType === "user") &&
            usersData?.searchUsers.map((user) => (
              <div key={user.id} className="col-span-1 flex justify-center">
                <ProfileCard user={user} />
              </div>
            ))}

          {/* Posts */}
          {(filterType === "all" || filterType === "post") &&
            postsData?.searchPosts.map((post) => (
              <div
                key={post.id}
                className="col-span-1 flex justify-center sm:col-span-2 lg:col-span-3"
              >
                <Post post={post} />
              </div>
            ))}

          {!hasMorePosts && !hasMoreUsers && !hasMoreHashtags && (
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
