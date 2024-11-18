import { useAuth } from "@/components/AuthContext";
import CreatePostField from "@/components/CreatePostField";
import Post from "@/components/Post/Post";
import Divider from "@/components/ui/Divider";
import { HashtagType, PostType, UserType } from "@/lib/types";
import { GET_TRENDING_HASHTAGS } from "@/queries/hashtags";
import { CREATE_POST, GET_POSTS } from "@/queries/posts";
import { GET_USERS } from "@/queries/user";
import { NetworkStatus, useMutation, useQuery } from "@apollo/client";
import { HashtagIcon } from "@heroicons/react/24/outline";
import { Users } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import HashTagCard from "./components/HashtagCard";
import ProfileCard from "./components/ProfileCard";
import { ToggleGroup, ToggleGroupItem } from "./components/ui/ToggleGroup";
import PostSkeleton from "./components/Skeletons/PostSkeleton";

const PAGE_SIZE = 10;

type FilterType = "LATEST" | "FOLLOWING" | "POPULAR" | "CONTROVERSIAL";

const HomePage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [postBody, setPostBody] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [file, setFile] = useState<File | null>(null);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [filter, setFilter] = useState<FilterType>("LATEST");

  const { data, loading, error, fetchMore, networkStatus, refetch } = useQuery<{
    getPosts: PostType[];
  }>(GET_POSTS, {
    variables: { page: 1, filter },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
    skip: filter === "FOLLOWING" && !user,
  });

  const { data: usersData, error: usersError } = useQuery<{
    getUsers: UserType[];
  }>(GET_USERS, {
    variables: { page: 1 },
  });

  const { data: hashtagsData, error: hashtagsError } = useQuery<{
    getTrendingHashtags: HashtagType[];
  }>(GET_TRENDING_HASHTAGS, {
    variables: { page: 1 },
  });

  const [createPost, { loading: createLoading }] = useMutation<
    { createPost: PostType },
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
      refetch();
    },
    refetchQueries: [{ query: GET_POSTS, variables: { page: 1 } }],
  });

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postBody.trim() === "" && file === null) {
      toast.error("Post content cannot be empty.");
      return;
    }

    try {
      await createPost({
        variables: {
          body: postBody,
          file: file,
        },
      });
    } catch (error) {
      toast.error(`Error adding post: ${(error as Error).message}`);
    }
  };

  // Infinite scroll to load more posts
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const { data: fetchMoreData } = await fetchMore({
        variables: { page: page + 1 },
      });

      if (fetchMoreData?.getPosts) {
        if (fetchMoreData.getPosts.length < PAGE_SIZE) {
          setHasMore(false);
        }
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more posts: ${(error as Error).message}`);
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
        loadMorePosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, page, hasMore, networkStatus, loadMorePosts]);

  useEffect(() => {
    setPage(1);
    setHasMore(true);
    refetch({ page: 1, filter });
  }, [filter, refetch]);

  useEffect(() => {
    if (filter !== "FOLLOWING") {
      setShowLoginPrompt(false);
    }
  }, [filter]);

  if (error || usersError)
    return (
      <p className="mt-4 text-center text-red-500">
        Error loading posts:{" "}
        {(error?.message ?? usersError?.message) || "Unknown error"}
      </p>
    );

  const posts = data?.getPosts || [];

  return (
    <div className="max-w-screen-3xl mx-auto flex w-full justify-center px-5 py-5 lg:justify-evenly lg:gap-4">
      <aside className="hidden w-full max-w-64 py-8 lg:flex">
        {hashtagsError && (
          <p className="mt-4 text-center text-red-500">
            Error loading hashtags: {hashtagsError.message}
          </p>
        )}

        {hashtagsData && (
          <div className="flex w-full flex-col items-center gap-5">
            <h1 className="text-3xl">Trending Hashtags</h1>
            {hashtagsData.getTrendingHashtags.map((hashtag) => (
              <HashTagCard hashtag={hashtag} key={hashtag.tag} />
            ))}
            <a
              href={`/project2/hashtag`}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <HashtagIcon className="mr-2 h-5 w-5" aria-hidden="true" />
              <span>View All Hashtags</span>
            </a>
          </div>
        )}
      </aside>

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
            className={
              (postBody || file) && user
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
            }
          />
        </form>

        <Divider />

        <section>
          <ToggleGroup
            value={filter}
            onValueChange={(newFilter: FilterType) => setFilter(newFilter)}
            type="single"
            variant="outline"
            className="mb-4 grid w-full grid-cols-2 gap-2 p-2 text-lg md:grid-cols-4"
          >
            <ToggleGroupItem
              value="LATEST"
              aria-label="Latest"
              aria-pressed={filter === "LATEST"}
              className="text-center"
            >
              <p>Latest</p>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="FOLLOWING"
              aria-label="Following"
              aria-pressed={filter === "FOLLOWING"}
              className="text-center"
              onClick={() => {
                if (!user) setShowLoginPrompt(true);
              }}
            >
              <p>Following</p>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="POPULAR"
              aria-label="Popular"
              aria-pressed={filter === "POPULAR"}
              className="text-center"
            >
              <p>Popular</p>
            </ToggleGroupItem>
            <ToggleGroupItem
              value="CONTROVERSIAL"
              aria-label="Controversial"
              aria-pressed={filter === "CONTROVERSIAL"}
              className="text-center"
            >
              <p>Controversial</p>
            </ToggleGroupItem>
          </ToggleGroup>
        </section>

        {showLoginPrompt && (
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
        )}

        {!showLoginPrompt && (
          <div className="flex flex-col gap-4">
            {posts.length === 0
              ? Array.from({ length: 10 }).map((_, index) => (
                  <PostSkeleton key={index} />
                ))
              : posts.map((post) => <Post key={post.id} post={post} />)}
          </div>
        )}

        {!hasMore && (
          <p className="mt-4 justify-self-center text-gray-500 dark:text-gray-400">
            You've reached the end of the posts.
          </p>
        )}

        {!loading && data?.getPosts.length === 0 && (
          <p className="mt-4">No posts available.</p>
        )}
      </main>

      <aside className="hidden w-full max-w-64 py-8 lg:flex">
        <div className="flex w-full flex-col items-center gap-5">
          <h1 className="text-3xl">People to follow</h1>
          {usersData?.getUsers.map((recommendedUser) => (
            <ProfileCard user={recommendedUser} key={recommendedUser.id} />
          ))}
          <a
            href={`/project2/users`}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Users className="mr-2 h-5 w-5" aria-hidden="true" />
            <span>View All Users</span>
          </a>
        </div>
      </aside>
    </div>
  );
};

export default HomePage;
