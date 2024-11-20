import Post from "@/components/Post/Post";
import { PostType, RepostType } from "@/lib/types";
import { GET_POSTS_BY_IDS } from "@/queries/posts";
import { GET_REPOSTS_BY_USER } from "@/queries/reposts";
import { NetworkStatus, useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import Repost from "../Post/Repost";

const PAGE_SIZE = 16;

interface PostsViewProps {
  postIds: string[];
  username?: string;
  fetchReposts?: boolean;
}
const PostsView: React.FC<PostsViewProps> = ({
  postIds,
  username,
  fetchReposts,
}) => {
  const [page, setPage] = useState(1);
  const [repostsPage, setRepostsPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [repostsHasMore, setRepostsHasMore] = useState(true);

  const { data, loading, fetchMore, error, networkStatus } = useQuery<{
    getPostsByIds: PostType[];
  }>(GET_POSTS_BY_IDS, {
    variables: { ids: postIds, page: 1, limit: PAGE_SIZE },
    skip: !postIds.length,
    notifyOnNetworkStatusChange: true,
  });
  const {
    data: repostsData,
    loading: repostsLoading,
    error: repostsError,
    fetchMore: fetchMoreReposts,
    networkStatus: repostsNetworkStatus,
  } = useQuery<{ getRepostsByUser: RepostType[] }>(GET_REPOSTS_BY_USER, {
    variables: { username: username, page: 1, limit: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
    skip: !fetchReposts,
  });

  const posts: PostType[] = data?.getPostsByIds || [];

  const reposts: RepostType[] = repostsData?.getRepostsByUser || [];

  const combinedPosts = [...posts, ...reposts].sort(
    (a, b) =>
      new Date(
        parseInt(b.__typename === "Repost" ? b.repostedAt : b.createdAt),
      ).getTime() -
      new Date(
        parseInt(a.__typename === "Repost" ? a.repostedAt : a.createdAt),
      ).getTime(),
  );

  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const { data: fetchMoreData } = await fetchMore({
        variables: { page: page + 1 },
      });

      if (fetchMoreData?.getPostsByIds) {
        if (fetchMoreData.getPostsByIds.length < PAGE_SIZE) {
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

  const loadMoreReposts = useCallback(async () => {
    if (!repostsHasMore || repostsLoading) return;

    try {
      const { data: fetchMoreData } = await fetchMoreReposts({
        variables: { page: repostsPage + 1 },
      });

      if (fetchMoreData?.getRepostsByUser) {
        if (fetchMoreData.getRepostsByUser.length < PAGE_SIZE) {
          setRepostsHasMore(false);
        }
        setRepostsPage((prev) => prev + 1);
      } else {
        setRepostsHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more posts: ${(error as Error).message}`);
    }
  }, [fetchMoreReposts, repostsHasMore, repostsLoading, repostsPage]);

  const handleScroll = useCallback(() => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    const threshold = 300;

    if (
      scrollHeight - scrollTop - clientHeight < threshold &&
      ((networkStatus !== NetworkStatus.fetchMore && hasMore) ||
        (repostsNetworkStatus !== NetworkStatus.fetchMore && repostsHasMore))
    ) {
      loadMorePosts();
      loadMoreReposts();
    }
  }, [loadMorePosts]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      {(error || repostsError) && (
        <p>Error loading posts:{error?.message || repostsError?.message} </p>
      )}
      {combinedPosts.map((post) =>
        post.__typename === "Post" ? (
          <Post post={post} key={post.id} />
        ) : (
          <Repost repost={post} key={post.id} />
        ),
      )}
      {loading && <p>Loading more posts...</p>}
      {repostsLoading && <p>Loading more reposts...</p>}
      {!hasMore &&
        !repostsHasMore &&
        (combinedPosts.length === 0 ? (
          <p>No posts to show.</p>
        ) : (
          <p>No more posts to load.</p>
        ))}
    </>
  );
};

export default PostsView;
