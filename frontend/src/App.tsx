import { useAuth } from "@/components/AuthContext";
import CreatePostField from "@/components/CreatePostField";
import Post from "@/components/Post/Post";
import { PostType, UserType } from "@/lib/types";
import { CREATE_POST, GET_POSTS } from "@/queries/posts";
import { NetworkStatus, useMutation, useQuery } from "@apollo/client";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Divider from "./components/ui/Divider";
import Avatar from "./components/Avatar";
import FollowButton from "./components/FollowButton";
import { GET_USERS } from "./queries/user";

const PAGE_SIZE = 10;

const HomePage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [postBody, setPostBody] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, error, fetchMore, networkStatus } = useQuery<{
    getPosts: PostType[];
  }>(GET_POSTS, {
    variables: { page: 1, limit: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const { data: usersData, error: usersError } = useQuery<{
    getUsers: UserType[];
  }>(GET_USERS, {
    variables: { page: 1, limit: 1 },
  });

  const [createPost, { loading: createLoading }] = useMutation<
    { createPost: PostType },
    { body: string }
  >(CREATE_POST, {
    variables: { body: postBody },

    onError: (err) => {
      console.error("Error creating post:", err);
      toast.error(`Error adding post: ${err.message}`);
    },
    onCompleted: () => {
      setPostBody("");
      toast.success("Post added successfully!");
    },
    refetchQueries: [
      { query: GET_POSTS, variables: { page: 1, limit: PAGE_SIZE } },
    ],
  });

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postBody.trim() === "") {
      toast.error("Post content cannot be empty.");
      return;
    }

    try {
      await createPost();
    } catch (error) {
      toast.error(`Error adding post: ${(error as Error).message}`);
    }
  };

  // Infinite scroll to load more posts
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const { data: fetchMoreData } = await fetchMore({
        variables: { page: page + 1, limit: PAGE_SIZE },
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

  if (networkStatus === NetworkStatus.loading)
    return <p className="mt-4 text-center">Loading...</p>;

  if (error)
    return (
      <p className="mt-4 text-center text-red-500">
        Error loading posts: {error.message}
      </p>
    );

  return (
    <div className="mx-auto grid w-full max-w-screen-xl grid-cols-4 gap-4">
      <div className="col-start-1 row-span-5 row-start-1"></div>

      <main className="col-span-2 col-start-2 row-span-5">
        <form
          className="flex w-full max-w-xl items-center gap-2"
          onSubmit={handleAddPost}
        >
          <CreatePostField
            placeholder="What's on your mind?"
            value={postBody}
            setValue={setPostBody}
            loading={createLoading}
            className={
              postBody && user
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
            }
          />
        </form>

        <Divider />

        {data?.getPosts.map((post) => <Post key={post.id} post={post} />)}

        {!hasMore && (
          <p className="mt-4 text-gray-500 dark:text-gray-400">
            You've reached the end of the posts.
          </p>
        )}

        {!loading && data?.getPosts.length === 0 && (
          <p className="mt-4">No posts available.</p>
        )}
      </main>

      <aside className="col-start-4 hidden py-8 md:flex">
        <div className="flex w-full flex-col gap-5">
          <h1 className="text-3xl">People to follow</h1>
          {usersData?.getUsers.map((recommendedUser) => (
            <a
              href={`/project2/user/${recommendedUser.username}`}
              className="w-full rounded-lg bg-gray-900/50 px-2 py-6 hover:scale-105"
            >
              <div className="flex flex-row items-center gap-2">
                <Avatar username={recommendedUser.username} />
                <h1>{recommendedUser.username}</h1>
                {user?.username !== recommendedUser.username && (
                  <FollowButton targetUsername={recommendedUser.username} />
                )}
              </div>
            </a>
          ))}
        </div>
      </aside>
    </div>
  );
};

export default HomePage;
