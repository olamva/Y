import Post from "@/components/Post";
import { useQuery } from "@apollo/client";
import { useState, useEffect } from "react";
import { PostType } from "./lib/types";
import { GET_POSTS } from "./queries/posts";

const HomePage = () => {
  const [page, setPage] = useState(1);
  const { data, loading, error, fetchMore } = useQuery<{
    getPosts: PostType[];
  }>(GET_POSTS, {
    variables: { page },
    notifyOnNetworkStatusChange: true,
  });

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

  // Infinite scroll
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
  }, [loading]);

  if (loading && page === 1) return <p>Loading...</p>;
  if (error) return <p>Error loading posts: {error.message}</p>;

  return (
    <main className="flex w-full flex-col items-center">
      {data?.getPosts.map((post) => <Post key={post.id} post={post} />)}
      {loading && <p>Loading more posts...</p>}
    </main>
  );
};

export default HomePage;
