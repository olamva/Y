import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import PostWithReply from "@/components/Post/PostWithReply";
import { GET_COMMENTS_BY_IDS } from "@/queries/comments";
import { GET_PARENTS_BY_IDS } from "@/queries/posts";
import { CommentType, PostType } from "@/lib/types";

interface CommentsViewProps {
  commentIds: string[];
}

const CommentsView: React.FC<CommentsViewProps> = ({ commentIds }) => {
  const [page, setPage] = useState(1);

  const { data, loading, fetchMore } = useQuery(GET_COMMENTS_BY_IDS, {
    variables: { ids: commentIds, page },
    skip: !commentIds.length,
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

  const loadMoreComments = () => {
    if (loading || !data?.getCommentsByIds.length) return;
    const nextPage = page + 1;
    fetchMore({
      variables: { page: nextPage },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          getCommentsByIds: [
            ...prev.getCommentsByIds,
            ...fetchMoreResult.getCommentsByIds,
          ],
        };
      },
    });
    setPage(nextPage);
  };

  const handleScroll = () => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    if (scrollHeight - scrollTop === clientHeight) {
      loadMoreComments();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    </>
  );
};

export default CommentsView;
