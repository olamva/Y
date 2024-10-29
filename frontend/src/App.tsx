import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import Post from "@/components/Post";
import TextInput from "@/form/TextInput";
import { PostType } from "@/lib/types";
import { CREATE_POST, GET_POSTS } from "@/queries/posts";
import { Button } from "@/components/ui/button";
import toast from "react-hot-toast";
import { useAuth } from "./components/AuthContext";

const HomePage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [postBody, setPostBody] = useState("");

  const { data, loading, error, fetchMore } = useQuery<{
    getPosts: PostType[];
  }>(GET_POSTS, {
    variables: { page },
    notifyOnNetworkStatusChange: true,
  });

  const [createPost, { loading: createLoading, error: createError }] =
    useMutation<{ createPost: PostType }, { body: string }>(CREATE_POST, {
      variables: { body: postBody },
      update: (cache, { data }) => {
        if (!data) return;

        const existingPosts = cache.readQuery<{ getPosts: PostType[] }>({
          query: GET_POSTS,
          variables: { page: 1 },
        });

        if (existingPosts) {
          cache.writeQuery({
            query: GET_POSTS,
            variables: { page: 1 },
            data: {
              getPosts: [data.createPost, ...existingPosts.getPosts],
            },
          });
        }
      },
      optimisticResponse: {
        createPost: {
          id: `temp-id-${Math.random().toString(36).substr(2, 9)}`,
          body: postBody,
          author: user?.username || "Anonymous",
          amtLikes: 0,
          amtComments: 0,
          createdAt: new Date(),
          __typename: "Post",
        },
      },
      onError: (err) => {
        console.error("Error creating post:", err);
        toast.error(`Error adding post: ${err.message}`);
      },
      onCompleted: () => {
        setPostBody("");
        toast.success("Post added successfully!");
      },
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
  const loadMorePosts = () => {
    fetchMore({
      variables: { page: page + 1 },
      updateQuery: (prevResult, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prevResult;
        return {
          getPosts: [...prevResult.getPosts, ...fetchMoreResult.getPosts],
        };
      },
    });
    setPage((prev) => prev + 1);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        !loading
      ) {
        loadMorePosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, page]);

  if (loading && page === 1)
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
        className="mb-8 flex w-full max-w-md flex-col items-center gap-4"
        onSubmit={handleAddPost}
      >
        <TextInput
          id="postText"
          label="Write a post"
          value={postBody}
          onChange={(e) => setPostBody(e.target.value)}
          required
          placeholder="What's on your mind?"
        />
        <Button
          type="submit"
          disabled={createLoading || postBody.trim() === ""}
          className={`w-full max-w-md ${
            postBody.trim()
              ? "bg-indigo-600 hover:bg-indigo-700"
              : "cursor-not-allowed bg-gray-400"
          } rounded-md py-2 text-white`}
        >
          {createLoading ? "Adding..." : "Add Post"}
        </Button>
        {createError && (
          <p className="text-sm text-red-500">
            Error adding post: {createError.message}
          </p>
        )}
      </form>
      {data?.getPosts.map((post) => <Post key={post.id} post={post} />)}
      {loading && page > 1 && <p className="mt-4">Loading more posts...</p>}
      {!loading && data?.getPosts.length === 0 && (
        <p className="mt-4">No posts available.</p>
      )}
    </main>
  );
};

export default HomePage;
