import BackButton from "@/components/BackButton";
import Post from "@/components/Post/Post";
import PostWithReply from "@/components/Post/PostWithReply";
import PostSkeleton from "@/components/Skeletons/PostSkeleton";
import Divider from "@/components/ui/Divider";
import { CommentType, PostType } from "@/lib/types";
import { GET_CONTENT_BY_HASHTAG } from "@/queries/hashtags";
import { GET_PARENTS_BY_IDS } from "@/queries/posts";
import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const PAGE_SIZE = 10;
type Content = PostType | CommentType;

const HashtagPage = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, error, fetchMore, networkStatus } = useQuery<{
    getContentByHashtag: Content[];
  }>(GET_CONTENT_BY_HASHTAG, {
    variables: { hashtag, page: 1 },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    document.title = `Y · #${hashtag}`;
  }, [hashtag]);

  const {
    data: parentPostsData,
    loading: parentPostsLoading,
    error: parentPostsError,
    fetchMore: fetchMoreParentPosts,
    networkStatus: parentPostsNetworkStatus,
  } = useQuery<{ getParentsByIds: (PostType | CommentType)[] }>(
    GET_PARENTS_BY_IDS,
    {
      variables: {
        parents: data?.getContentByHashtag
          .filter((post) => post.__typename === "Comment")
          .map((comment) => ({
            id: comment.parentID,
            type: comment.parentType,
          })),
      },
      notifyOnNetworkStatusChange: true,
      skip: !data?.getContentByHashtag.length,
    },
  );

  useEffect(() => {
    if (data && data.getContentByHashtag) {
      setHasMore(data.getContentByHashtag.length === PAGE_SIZE);
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

      if (fetchMoreData?.getContentByHashtag) {
        setHasMore(fetchMoreData.getContentByHashtag.length === PAGE_SIZE);
        setPage(nextPage);
      } else {
        setHasMore(false);
      }

      await fetchMoreParentPosts({
        variables: {
          parents: fetchMoreData.getContentByHashtag
            .filter((post) => post.__typename === "Comment")
            .map((comment) => ({
              id: comment.parentID,
              type: comment.parentType,
            })),
        },
      });
    } catch (error) {
      toast.error(`Failed to load more posts: ${(error as Error).message}`);
    }
  }, [fetchMore, hasMore, loading, page, hashtag, fetchMoreParentPosts]);

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

  const posts = data?.getContentByHashtag || [];
  const parentPosts = parentPostsData?.getParentsByIds || [];

  return (
    <div className="mx-auto w-full max-w-screen-xl px-5">
      <BackButton />
      <main className="flex w-full flex-col items-center justify-center">
        <h1 className="my-4 break-words text-3xl font-bold">
          #{hashtag?.toLowerCase()}
        </h1>
        <Divider />
        <div className="flex w-full flex-col items-center gap-4">
          {(error || parentPostsError) && (
            <p className="mt-4 text-center text-red-500">
              Error loading posts: {error?.message || parentPostsError?.message}
            </p>
          )}
          {(loading && networkStatus === 1) ||
          (parentPostsLoading && parentPostsNetworkStatus === 1)
            ? Array.from({ length: 10 }).map((_, index) => (
                <div className="w-full max-w-xl" key={index}>
                  <PostSkeleton />
                </div>
              ))
            : posts
                .filter(
                  (post) =>
                    !parentPosts.some((parent) => parent.id === post.id),
                )
                .map((post) =>
                  post.__typename === "Post" ? (
                    <Post key={post.id} post={post} />
                  ) : (
                    <PostWithReply
                      key={post.id}
                      post={parentPosts.find(
                        (parent) => parent.id === post.parentID,
                      )}
                      reply={post}
                    />
                  ),
                )}
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
