import Post from "@/components/Post";
import TextInput from "@/form/TextInput";
import { PostType } from "@/lib/types";
import { CREATE_POST, GET_POSTS } from "@/queries/posts";
import { NetworkStatus, useMutation, useQuery } from "@apollo/client";
import { PaperAirplaneIcon } from "@heroicons/react/24/solid";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./components/AuthContext";

const PAGE_SIZE = 10;

const HomePage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [postBody, setPostBody] = useState("");
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, error, fetchMore, networkStatus } = useQuery<{
    getPosts: PostType[];
  }>(GET_POSTS, {
    variables: { page, limit: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
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
    <main className="flex w-full flex-col items-center p-4">
      <form
        className="mb-2 flex w-full max-w-xl items-center gap-2"
        onSubmit={handleAddPost}
      >
        <TextInput
          id="postText"
          value={postBody}
          onChange={(e) => setPostBody(e.target.value)}
          required
          placeholder="What's on your mind?"
        />
        <button
          type="submit"
          disabled={createLoading}
          className={`rounded-md border border-transparent p-1 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            postBody && user
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
          }`}
        >
          <PaperAirplaneIcon className="size-6" />
        </button>
      </form>

      {data?.getPosts.map((post) => <Post key={post.id} post={post} />)}
      {!hasMore && (
        <p className="mt-4 text-gray-500">
          You've reached the end of the posts.
        </p>
      )}
      {!loading && data?.getPosts.length === 0 && (
        <p className="mt-4">No posts available.</p>
      )}
    </main>
  );
};

export default HomePage;
