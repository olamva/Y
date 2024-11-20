import Post from "@/components/Post/Post";
import PostWithReply from "@/components/Post/PostWithReply";
import { useQuery } from "@apollo/client";
import React, { useCallback, useEffect, useMemo, useState } from "react";

import { CommentType, PostType } from "@/lib/types";
import { GET_COMMENTS_BY_IDS } from "@/queries/comments";
import { GET_PARENTS_BY_IDS, GET_POSTS_BY_IDS } from "@/queries/posts";

const PAGE_SIZE = 16;

interface LikesViewProps {
  likedPostIds: string[];
  likedCommentIds: string[];
}

const LikesView: React.FC<LikesViewProps> = ({
  likedPostIds,
  likedCommentIds,
}) => {
  const [postsPage, setPostsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);
  const [hasMoreComments, setHasMoreComments] = useState(true);

  const {
    data: postsData,
    loading: postsLoading,
    fetchMore: fetchMorePosts,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: likedPostIds, page: postsPage, limit: PAGE_SIZE },
    skip: !likedPostIds.length,
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: commentsData,
    loading: commentsLoading,
    fetchMore: fetchMoreComments,
  } = useQuery(GET_COMMENTS_BY_IDS, {
    variables: { ids: likedCommentIds, page: commentsPage },
    skip: !likedCommentIds.length,
    notifyOnNetworkStatusChange: true,
  });

  const likedPosts: PostType[] = useMemo(() => {
    return postsData?.getPostsByIds || [];
  }, [postsData?.getPostsByIds]);

  const likedComments: CommentType[] = useMemo(() => {
    return commentsData?.getCommentsByIds || [];
  }, [commentsData?.getCommentsByIds]);

  const parents = useMemo(() => {
    return likedComments.map((comment) => ({
      id: comment.parentID,
      type: comment.parentType,
    }));
  }, [likedComments]);

  const { data: parentsData } = useQuery(GET_PARENTS_BY_IDS, {
    variables: { parents },
    skip: !parents.length,
    notifyOnNetworkStatusChange: true,
  });

  const parentPosts: (PostType | CommentType)[] = useMemo(() => {
    return parentsData?.getParentsByIds || [];
  }, [parentsData?.getParentsByIds]);

  const parentsMap = useMemo(() => {
    const map = new Map<string, PostType | CommentType>();
    parentPosts.forEach((parent) => map.set(parent.id, parent));
    return map;
  }, [parentPosts]);

  const likedContent: (PostType | CommentType)[] = useMemo(() => {
    const combined = [...likedPosts, ...likedComments];
    const uniqueMap = new Map(
      combined.map((item) => [`${item.__typename}-${item.id}`, item]),
    );
    return Array.from(uniqueMap.values()).sort(
      (a, b) =>
        new Date(parseInt(b.createdAt)).getTime() -
        new Date(parseInt(a.createdAt)).getTime(),
    );
  }, [likedPosts, likedComments]);

  const loadMoreLikes = useCallback(async () => {
    if (
      postsLoading ||
      commentsLoading ||
      (!hasMorePosts && !hasMoreComments) ||
      (likedPostIds.length === 0 && likedCommentIds.length === 0)
    )
      return;

    try {
      await Promise.all([
        hasMorePosts
          ? fetchMorePosts({
              variables: { page: postsPage + 1 },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult?.getPostsByIds?.length) {
                  setHasMorePosts(false);
                  return prev;
                }
                setPostsPage(postsPage + 1);
                return {
                  getPostsByIds: [
                    ...prev.getPostsByIds,
                    ...fetchMoreResult.getPostsByIds,
                  ],
                };
              },
            })
          : Promise.resolve({ data: { getPostsByIds: [] } }),
        hasMoreComments
          ? fetchMoreComments({
              variables: { page: commentsPage + 1 },
              updateQuery: (prev, { fetchMoreResult }) => {
                if (!fetchMoreResult?.getCommentsByIds?.length) {
                  setHasMoreComments(false);
                  return prev;
                }
                setCommentsPage(commentsPage + 1);
                return {
                  getCommentsByIds: [
                    ...prev.getCommentsByIds,
                    ...fetchMoreResult.getCommentsByIds,
                  ],
                };
              },
            })
          : Promise.resolve({ data: { getCommentsByIds: [] } }),
      ]);
    } catch (error) {
      console.error("Error fetching more likes:", error);
    }
  }, [
    postsLoading,
    commentsLoading,
    hasMorePosts,
    hasMoreComments,
    fetchMorePosts,
    fetchMoreComments,
    postsPage,
    commentsPage,
    likedPostIds.length,
    likedCommentIds.length,
  ]);

  const handleScroll = useCallback(() => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    const threshold = 300;

    if (scrollHeight - scrollTop - clientHeight < threshold) {
      loadMoreLikes();
    }
  }, [loadMoreLikes]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return (
    <>
      {likedContent.map((item) =>
        item.__typename === "Post" ? (
          <Post post={item} key={`post-${item.id}`} />
        ) : (
          <PostWithReply
            key={`comment-${item.id}`}
            post={parentsMap.get(item.parentID)}
            reply={item}
          />
        ),
      )}
      {(postsLoading || commentsLoading) && <p>Loading more likes...</p>}
      {!likedContent.length && <p>No likes to show.</p>}
      {!hasMorePosts && !hasMoreComments && (
        <p>You have reached the end of likes</p>
      )}
    </>
  );
};

export default LikesView;
