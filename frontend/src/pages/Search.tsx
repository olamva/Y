import BackButton from "@/components/BackButton";
import HashtagCard from "@/components/HashtagCard";
import Post from "@/components/Post/Post";
import ProfileCard from "@/components/ProfileCard";
import PostSkeleton from "@/components/Skeletons/PostSkeleton";
import Divider from "@/components/ui/Divider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import { HashtagType, PostType, UserType } from "@/lib/types";
import { SEARCH_HASHTAGS, SEARCH_POSTS, SEARCH_USERS } from "@/queries/search";
import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

const RESULTS_PAGE_SIZE = 10;

type ViewState = "posts" | "users" | "hashtags";

const SearchPage = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const searchQuery = params.get("q") || "";
  const [filterType, setFilterType] = useState<ViewState>("posts");

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
    skip: filterType !== "posts",
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
    skip: filterType !== "users",
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
    skip: filterType !== "hashtags",
  });

  const loadMoreResults = useCallback(async () => {
    if (filterType === "posts" && hasMorePosts && !postsLoading) {
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

    if (filterType === "users" && hasMoreUsers && !usersLoading) {
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

    if (filterType === "hashtags" && hasMoreHashtags && !hashtagsLoading) {
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

  const isAnyLoading = postsLoading || usersLoading || hashtagsLoading;
  const isAnyError = postsError || usersError || hashtagsError;

  return (
    <div className="w-full">
      <BackButton />
      <main className="mx-auto flex w-full max-w-2xl flex-col items-center justify-center px-4">
        <div className="mb-4 flex items-center gap-2">
          <ToggleGroup
            value={filterType}
            onValueChange={(value: ViewState) => {
              setPagePosts(1);
              setPageUsers(1);
              setPageHashtags(1);

              setHasMorePosts(true);
              setHasMoreUsers(true);
              setHasMoreHashtags(true);

              setFilterType(value);
            }}
            type="single"
            variant="outline"
            className="flex items-center justify-center gap-1"
          >
            <ToggleGroupItem
              value="posts"
              aria-label="View Posts"
              className="p-5 text-center text-xl"
            >
              <p>Posts</p>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="users"
              aria-label="View Comments"
              className="p-5 text-center text-xl"
            >
              <p>Users</p>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="hashtags"
              aria-label="View Mentions"
              className="p-5 text-center text-xl"
            >
              <p>Hashtags</p>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Divider />

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

        {isAnyLoading && (
          <div className="flex w-full max-w-xl flex-col gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <PostSkeleton key={index} />
            ))}
          </div>
        )}

        {!isAnyLoading &&
          !isAnyError &&
          postsData?.searchPosts.length === 0 &&
          usersData?.searchUsers.length === 0 &&
          hashtagsData?.searchHashtags.length === 0 && (
            <p className="text-center text-gray-500">No results found.</p>
          )}

        {/* Hashtags */}
        <div className="flex w-full flex-wrap justify-center gap-4">
          {filterType === "hashtags" &&
            hashtagsData?.searchHashtags.map((hashtag) => (
              <div
                key={hashtag.tag}
                className="flex w-[30%] min-w-36 justify-center"
              >
                <HashtagCard hashtag={hashtag} />
              </div>
            ))}
        </div>

        {/* Users */}
        <div className="flex w-full flex-wrap justify-center gap-4">
          {filterType === "users" &&
            usersData?.searchUsers.map((user) => (
              <div
                key={user.id}
                className="flex w-[30%] min-w-36 justify-center"
              >
                <ProfileCard user={user} />
              </div>
            ))}
        </div>

        {/* Posts */}
        <div className="flex w-full flex-col gap-4">
          {filterType === "posts" &&
            postsData?.searchPosts.map((post) => (
              <div key={post.id} className="flex justify-center">
                <Post post={post} />
              </div>
            ))}
        </div>

        {((!hasMorePosts && filterType === "posts") ||
          (!hasMoreUsers && filterType === "users") ||
          (!hasMoreHashtags && filterType === "hashtags")) && (
          <p className="col-span-1 mt-4 justify-self-center text-gray-500 dark:text-gray-400 sm:col-span-2 lg:col-span-3">
            You've reached the end of the search results.
          </p>
        )}
      </main>
    </div>
  );
};

export default SearchPage;
