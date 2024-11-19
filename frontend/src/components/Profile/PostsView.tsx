import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@apollo/client";
import Post from "@/components/Post/Post";
import { GET_POSTS_BY_IDS } from "@/queries/posts";
import { PostType } from "@/lib/types";

interface PostsViewProps {
  postIds: string[];
}

const PostsView: React.FC<PostsViewProps> = ({ postIds }) => {
  const currentPage = useRef(1);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, fetchMore, error } = useQuery<{
    getPostsByIds: PostType[];
  }>(GET_POSTS_BY_IDS, {
    variables: { ids: postIds, page: 1 },
    skip: !postIds.length,
    notifyOnNetworkStatusChange: true,
  });

  const posts: PostType[] = data?.getPostsByIds || [];

  const loadMorePosts = useCallback(() => {
    if (loading || !hasMore) return;

    fetchMore({
      variables: {
        ids: postIds,
        page: currentPage.current + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.getPostsByIds.length === 0) {
          setHasMore(false);
          return prev;
        }
        currentPage.current += 1;
        return {
          getPostsByIds: [
            ...prev.getPostsByIds,
            ...fetchMoreResult.getPostsByIds,
          ],
        };
      },
    }).catch((e) => {
      console.error("Error fetching more posts:", e);
      setHasMore(false);
    });
  }, [fetchMore, hasMore, loading, postIds]);

  const handleScroll = useCallback(() => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    const threshold = 300;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMorePosts();
    }
  }, [loadMorePosts]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  if (error) {
    return <p>Error loading posts.</p>;
  }

  return (
    <>
      {posts.map((post) => (
        <Post post={post} key={post.id} />
      ))}
      {loading && <p>Loading more posts...</p>}
      {!hasMore && <p>No more posts to load.</p>}
    </>
  );
};

export default PostsView;
