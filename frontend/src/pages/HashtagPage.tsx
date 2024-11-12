import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { GET_POSTS_BY_HASHTAG } from "@/queries/posts";
import { PostType } from "@/lib/types";
import Post from "@/components/Post/Post";
import toast from "react-hot-toast";
import Divider from "@/components/ui/Divider";
import BackButton from "@/components/BackButton";

const PAGE_SIZE = 10;

const HashtagPage = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<PostType[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, error, fetchMore, networkStatus } = useQuery<{
    getPostsByHashtag: PostType[];
  }>(GET_POSTS_BY_HASHTAG, {
    variables: { hashtag, page: 1 },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (data && data.getPostsByHashtag) {
      setPosts(data.getPostsByHashtag);
      setHasMore(data.getPostsByHashtag.length === PAGE_SIZE);
      setPage(1);
    }
  }, [data]);

  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = page + 1;
      const { data: fetchMoreData } = await fetchMore({
        variables: { hashtag, page: nextPage },
      });

      if (fetchMoreData?.getPostsByHashtag) {
        setPosts((prevPosts) => [
          ...prevPosts,
          ...fetchMoreData.getPostsByHashtag,
        ]);
        setHasMore(fetchMoreData.getPostsByHashtag.length === PAGE_SIZE);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more posts: ${(error as Error).message}`);
    }
  }, [fetchMore, hasMore, loading, page, hashtag]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        networkStatus !== 3 &&
        hasMore
      ) {
        loadMorePosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMorePosts, hasMore, networkStatus]);

  if (loading && networkStatus === 1) {
    return <p className="mt-4 text-center">Loading posts...</p>;
  }

  if (error) {
    return (
      <p className="mt-4 text-center text-red-500">
        Error loading posts: {error.message}
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-xl px-5">
      <BackButton />
      <main className="flex w-full flex-col items-center justify-center">
        <h1 className="my-4 text-3xl font-bold">#{hashtag}</h1>
        <Divider />
        <div className="flex w-full flex-col items-center gap-4">
          {posts.map((post) => (
            <Post key={post.id} post={post} />
          ))}
        </div>
        {loading && networkStatus === 3 && (
          <p className="mt-4 text-center">Loading more posts...</p>
        )}
        {!hasMore && (
          <p className="mt-4 text-center text-gray-500">
            You've reached the end of the posts.
          </p>
        )}
        {posts.length === 0 && !loading && (
          <p className="mt-4 text-center text-gray-500">
            No posts available for this hashtag.
          </p>
        )}
      </main>
    </div>
  );
};

export default HashtagPage;
