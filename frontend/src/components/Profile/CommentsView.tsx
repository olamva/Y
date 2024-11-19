import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery } from "@apollo/client";
import PostWithReply from "@/components/Post/PostWithReply";
import { GET_COMMENTS_BY_IDS } from "@/queries/comments";
import { GET_PARENTS_BY_IDS } from "@/queries/posts";
import { CommentType, PostType } from "@/lib/types";

interface CommentsViewProps {
  commentIds: string[];
}

const CommentsView: React.FC<CommentsViewProps> = ({ commentIds }) => {
  const currentPage = useRef(1);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, fetchMore } = useQuery(GET_COMMENTS_BY_IDS, {
    variables: { ids: commentIds, page: 1 },
    skip: !commentIds.length,
    notifyOnNetworkStatusChange: true,
  });

  const comments: CommentType[] = data?.getCommentsByIds || [];

  const parents = comments.map((comment) => ({
    id: comment.parentID,
    type: comment.parentType,
  }));

  const { data: parentData } = useQuery(GET_PARENTS_BY_IDS, {
    variables: { parents },
    skip: !parents.length,
  });

  const parentPosts: (PostType | CommentType)[] =
    parentData?.getParentsByIds || [];

  const loadMoreComments = useCallback(() => {
    if (loading || !hasMore) return;

    fetchMore({
      variables: {
        ids: commentIds,
        page: currentPage.current + 1,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult || fetchMoreResult.getCommentsByIds.length === 0) {
          setHasMore(false);
          return prev;
        }
        currentPage.current += 1;
        return {
          getCommentsByIds: [
            ...prev.getCommentsByIds,
            ...fetchMoreResult.getCommentsByIds,
          ],
        };
      },
    }).catch((e) => {
      console.error("Error fetching more posts:", e);
      setHasMore(false);
    });
  }, [fetchMore, hasMore, loading, commentIds]);

  const handleScroll = useCallback(() => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    const threshold = 300;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMoreComments();
    }
  }, [loadMoreComments]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      {comments.map((comment) => (
        <PostWithReply
          key={comment.id}
          post={parentPosts.find((post) => post.id === comment.parentID)}
          reply={comment}
        />
      ))}
      {loading && <p>Loading more comments...</p>}
      {!hasMore && <p>No more comments to load.</p>}
    </>
  );
};

export default CommentsView;
