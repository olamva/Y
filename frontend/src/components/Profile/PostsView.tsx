import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import Post from "@/components/Post/Post";
import { GET_POSTS_BY_IDS } from "@/queries/posts";
import { PostType } from "@/lib/types";

interface PostsViewProps {
  postIds: string[];
}

const PostsView: React.FC<PostsViewProps> = ({ postIds }) => {
  const [page, setPage] = useState(1);

  const { data, loading, fetchMore } = useQuery<{
    getPostsByIds: PostType[];
  }>(GET_POSTS_BY_IDS, {
    variables: { ids: postIds, page },
    skip: !postIds.length,
  });

  const posts: PostType[] = data?.getPostsByIds || [];

  const loadMorePosts = () => {
    if (loading || !data?.getPostsByIds.length) return;
    fetchMore({
      variables: { page: page + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        setPage(page + 1);
        return {
          getPostsByIds: [
            ...prev.getPostsByIds,
            ...fetchMoreResult.getPostsByIds,
          ],
        };
      },
    });
  };

  const handleScroll = () => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    if (scrollHeight - scrollTop === clientHeight) {
      loadMorePosts();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [posts]);

  return (
    <>
      {posts.map((post) => (
        <Post post={post} key={post.id} />
      ))}
      {loading && <p>Loading more posts...</p>}
    </>
  );
};

export default PostsView;
