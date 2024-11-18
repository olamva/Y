import { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import Post from "@/components/Post/Post";
import PostWithReply from "@/components/Post/PostWithReply";
import { GET_POSTS_BY_IDS } from "@/queries/posts";
import { GET_COMMENTS_BY_IDS } from "@/queries/comments";
import { GET_PARENTS_BY_IDS } from "@/queries/posts";
import { PostType, CommentType } from "@/lib/types";

interface LikesViewProps {
  likedPostIds: string[];
  likedCommentIds: string[];
}

const LikesView: React.FC<LikesViewProps> = ({
  likedPostIds,
  likedCommentIds,
}) => {
  const [page, setPage] = useState(1);

  const {
    data: postsData,
    loading: postsLoading,
    fetchMore: fetchMorePosts,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: likedPostIds, page },
    skip: !likedPostIds.length,
  });

  const {
    data: commentsData,
    loading: commentsLoading,
    fetchMore: fetchMoreComments,
  } = useQuery(GET_COMMENTS_BY_IDS, {
    variables: { ids: likedCommentIds, page },
    skip: !likedCommentIds.length,
  });

  const likedPosts: PostType[] = postsData?.getPostsByIds || [];
  const likedComments: CommentType[] = commentsData?.getCommentsByIds || [];

  const parents = likedComments.map((comment) => ({
    id: comment.parentID,
    type: comment.parentType,
  }));

  const { data: parentsData } = useQuery(GET_PARENTS_BY_IDS, {
    variables: { parents, page },
    skip: !parents.length,
  });

  const parentPosts: (PostType | CommentType)[] =
    parentsData?.getParentsByIds || [];

  const likedContent: (PostType | CommentType)[] = [
    ...likedPosts,
    ...likedComments,
  ].sort(
    (a, b) =>
      new Date(parseInt(b.createdAt)).getTime() -
      new Date(parseInt(a.createdAt)).getTime(),
  );

  const loadMoreLikes = () => {
    if (
      postsLoading ||
      commentsLoading ||
      (!postsData?.getPostsByIds.length &&
        !commentsData?.getCommentsByIds.length)
    )
      return;

    fetchMorePosts({
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

    fetchMoreComments({
      variables: { page: page + 1 },
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
  };

  const handleScroll = () => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    if (scrollHeight - scrollTop === clientHeight) {
      loadMoreLikes();
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [likedContent]);

  return (
    <>
      {likedContent.map((item) =>
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
      {(postsLoading || commentsLoading) && <p>Loading more likes...</p>}
    </>
  );
};

export default LikesView;
