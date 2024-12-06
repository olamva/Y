import FollowSuggestionsSidebar from "@/components/Landing/FollowSuggestionsSidebar";
import TrendingSidebar from "@/components/Landing/TrendingSidebar";
import Post from "@/components/Post/Post";
import Repost from "@/components/Post/Repost";
import PostSkeleton from "@/components/Skeletons/PostSkeleton";
import Divider from "@/components/ui/Divider";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import CreatePostField from "@/form/CreatePostField";
import { useAuth } from "@/hooks/AuthContext";
import { isFileAllowed } from "@/lib/checkFile";
import { PostItem } from "@/lib/types";
import { CREATE_POST, GET_POSTS } from "@/queries/posts";
import { NetworkStatus, useMutation, useQuery } from "@apollo/client";
import {
  ClockIcon,
  ContactIcon,
  FlameIcon,
  MessageSquareMoreIcon,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const PAGE_SIZE = 16;

type FilterType = "LATEST" | "FOLLOWING" | "POPULAR" | "CONTROVERSIAL";

const HomePage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [postBody, setPostBody] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [filter, setFilter] = useState<FilterType>(
    (localStorage.getItem("postFilter") as FilterType) ?? "LATEST",
  );

  useEffect(() => {
    localStorage.setItem("postFilter", filter);
  }, [filter]);

  useEffect(() => {
    document.title = "Y";
  }, []);

  useEffect(() => {
    setShowLoginPrompt(filter === "FOLLOWING" && !user);
  }, [filter, user]);

  const { data, loading, error, fetchMore, networkStatus, refetch } = useQuery<{
    getPosts: PostItem[];
  }>(GET_POSTS, {
    variables: { page: 1, filter, limit: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "network-only",
    skip: filter === "FOLLOWING" && !user,
  });

  const posts = data?.getPosts || [];

  const [createPost, { loading: createLoading }] = useMutation<
    { createPost: PostItem },
    { body: string; file: File | null }
  >(CREATE_POST, {
    context: {
      headers: {
        "x-apollo-operation-name": "createPost",
      },
    },
    onError: (err) => {
      console.error("Error creating post:", err);
      toast.error(`Error adding post: ${err.message}`);
    },
    onCompleted: () => {
      setPostBody("");
      setFile(null);
      toast.success("Post added successfully!");
      setFilter("LATEST");
      refetch();
    },
  });

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postBody.trim() === "" && file === null) {
      toast.error("Post content cannot be empty.");
      return;
    }

    if (file && !isFileAllowed(file)) return;

    try {
      await createPost({
        variables: {
          body: postBody.trim(),
          file: file,
        },
      });
    } catch (error) {
      toast.error(`Error adding post: ${(error as Error).message}`);
    }
  };

  // Infinite scroll to load more posts
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading || networkStatus === NetworkStatus.fetchMore)
      return;

    try {
      const { data: fetchMoreData } = await fetchMore({
        variables: { page: page + 1 },
      });

      if (fetchMoreData?.getPosts) {
        if (fetchMoreData.getPosts.length < 16) {
          setHasMore(false);
        }
        if (fetchMoreData.getPosts.length > 0) {
          setPage((prev) => prev + 1);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more posts: ${(error as Error).message}`);
    }
  }, [fetchMore, hasMore, loading, page, networkStatus]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 400 &&
        hasMore
      ) {
        loadMorePosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [hasMore, loadMorePosts]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    refetch({ page: 1, filter, limit: PAGE_SIZE });
  }, [filter, refetch]);

  useEffect(() => {
    if (filter !== "FOLLOWING") {
      setShowLoginPrompt(false);
    }
  }, [filter]);

  return (
    <div className="max-w-screen-3xl mx-auto flex w-full justify-center px-2 py-5 lg:justify-evenly lg:gap-4">
      <TrendingSidebar pageSize={PAGE_SIZE} />
      <main className="w-full max-w-xl">
        <form
          className="flex w-full items-center gap-2"
          onSubmit={handleAddPost}
        >
          <CreatePostField
            placeholder="What's on your mind?"
            value={postBody}
            setValue={setPostBody}
            file={file}
            setFile={setFile}
            loading={createLoading}
            enabled={(postBody.trim() !== "" || file !== null) && user !== null}
          />
        </form>
        <Divider />
        <section>
          <ToggleGroup
            value={filter}
            onValueChange={(newFilter: FilterType) => {
              if (newFilter) {
                setFilter(newFilter);
                if (newFilter === "FOLLOWING" && !user) {
                  setShowLoginPrompt(true);
                }
              }
            }}
            type="single"
            variant="outline"
            role="radiogroup"
            className="mb-4 flex items-center justify-evenly gap-2"
          >
            <ToggleGroupItem
              value="LATEST"
              aria-label="Filter by latest posts"
              aria-checked={filter === "LATEST"}
              role="radio"
              className="gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base w-full"
            >
              <ClockIcon className="hidden size-4 sm:block md:size-6" />
              <p>Latest</p>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="FOLLOWING"
              aria-label="Filter by posts from people you follow"
              aria-checked={filter === "FOLLOWING"}
              role="radio"
              className="gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base w-full"
              onClick={() => {
                if (!user) setShowLoginPrompt(true);
              }}
            >
              <ContactIcon className="hidden size-4 sm:block md:size-6" />
              <p>Following</p>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="POPULAR"
              aria-label="Filter by popular posts"
              aria-checked={filter === "POPULAR"}
              role="radio"
              className="gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base w-full"
            >
              <FlameIcon className="hidden size-4 sm:block md:size-6" />
              <p>Popular</p>
            </ToggleGroupItem>

            <ToggleGroupItem
              value="CONTROVERSIAL"
              aria-label="Filter by controversial posts"
              aria-checked={filter === "CONTROVERSIAL"}
              role="radio"
              className="gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base w-full"
            >
              <MessageSquareMoreIcon className="hidden size-4 sm:block md:size-6" />
              <p>Controversial</p>
            </ToggleGroupItem>
          </ToggleGroup>
        </section>
        {showLoginPrompt ? (
          <div className="my-4 flex flex-col justify-center gap-5">
            <p>You need to log in to view following posts</p>
            <button
              onClick={() => {
                window.location.href = "/project2/login";
              }}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <span>Log In</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {error && (
              <p className="mt-4 text-center text-red-500">
                Error loading posts: {error?.message}
              </p>
            )}

            {loading &&
              posts.length === 0 &&
              Array.from({ length: PAGE_SIZE }).map((_, index) => (
                <PostSkeleton key={index} />
              ))}

            {posts &&
              posts.map((post) =>
                post.__typename === "Post" ? (
                  <Post key={post.id} post={post} />
                ) : (
                  <Repost key={post.id} repost={post} />
                ),
              )}
            {loading && posts.length > 0 && hasMore && (
              <p className="mt-4 text-center">Loading more posts...</p>
            )}
            {!loading && posts.length === 0 && (
              <p className="mt-4 text-center">No posts available.</p>
            )}
          </div>
        )}

        {!hasMore && (
          <p className="mt-4 justify-self-center text-gray-500 dark:text-gray-400">
            You've reached the end of the posts.
          </p>
        )}
      </main>
      <FollowSuggestionsSidebar pageSize={PAGE_SIZE} />
    </div>
  );
};

export default HomePage;
