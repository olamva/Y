import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@apollo/client";
import Post from "@/components/Post/Post";
import PostWithReply from "@/components/Post/PostWithReply";
import { GET_POSTS_BY_IDS } from "@/queries/posts";
import { GET_COMMENTS_BY_IDS } from "@/queries/comments";
import { GET_PARENTS_BY_IDS } from "@/queries/posts";
import { PostType, CommentType } from "@/lib/types";

interface MentionsViewProps {
  mentionedPostIds: string[];
  mentionedCommentIds: string[];
}

const MentionsView: React.FC<MentionsViewProps> = ({
  mentionedPostIds,
  mentionedCommentIds,
}) => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const {
    data: postsData,
    loading: postsLoading,
    fetchMore: fetchMorePosts,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: mentionedPostIds, page },
    skip: !mentionedPostIds.length,
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: commentsData,
    loading: commentsLoading,
    fetchMore: fetchMoreComments,
  } = useQuery(GET_COMMENTS_BY_IDS, {
    variables: { ids: mentionedCommentIds, page },
    skip: !mentionedCommentIds.length,
    notifyOnNetworkStatusChange: true,
  });

  const mentionedPosts: PostType[] = postsData?.getPostsByIds || [];
  const mentionedComments: CommentType[] = commentsData?.getCommentsByIds || [];

  const parents = mentionedComments.map((comment) => ({
    id: comment.parentID,
    type: comment.parentType,
  }));

  const { data: parentsData } = useQuery(GET_PARENTS_BY_IDS, {
    variables: { parents, page },
    skip: !parents.length,
  });

  const parentPosts: (PostType | CommentType)[] =
    parentsData?.getParentsByIds || [];

  const mentionedContent: (PostType | CommentType)[] = [
    ...mentionedPosts,
    ...mentionedComments,
  ].sort(
    (a, b) =>
      new Date(parseInt(b.createdAt)).getTime() -
      new Date(parseInt(a.createdAt)).getTime(),
  );

  const loadMoreMentions = useCallback(async () => {
    if (
      postsLoading ||
      commentsLoading ||
      !hasMore ||
      (mentionedCommentIds.length === 0 && mentionedPostIds.length === 0)
    )
      return;

    try {
      const nextPage = page + 1;

      const postsResult = await fetchMorePosts({
        variables: { page: nextPage },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult.getPostsByIds.length) {
            setHasMore(false);
            return prev;
          }
          setPage((prevPage) => prevPage + 1);
          return {
            getPostsByIds: [
              ...prev.getPostsByIds,
              ...fetchMoreResult.getPostsByIds,
            ],
          };
        },
      });

      const commentsResult = await fetchMoreComments({
        variables: { page: nextPage },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult.getCommentsByIds.length) {
            setHasMore(false);
            return prev;
          }
          return {
            getCommentsByIds: [
              ...prev.getCommentsByIds,
              ...fetchMoreResult.getCommentsByIds,
            ],
          };
        },
      });

      if (
        !postsResult.data.getPostsByIds.length &&
        !commentsResult.data.getCommentsByIds.length
      ) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching more mentions:", error);
    }
  }, [
    postsLoading,
    commentsLoading,
    hasMore,
    fetchMorePosts,
    fetchMoreComments,
    page,
  ]);

  const handleScroll = useCallback(() => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    const threshold = 300;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMoreMentions();
    }
  }, [loadMoreMentions]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      {mentionedContent.map((item) =>
        item.__typename === "Post" ? (
          <Post post={item} key={item.id} />
        ) : (
          <PostWithReply
            key={item.id}
            post={parentPosts.find((parent) => parent.id === item.parentID)}
            reply={item}
          />
        ),
      )}
      {(postsLoading || commentsLoading) && <p>Loading more mentions...</p>}
      {!hasMore && <p>No more mentions to load.</p>}
    </>
  );
};

export default MentionsView;
