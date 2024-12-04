import PostContent from "@/components/Post/PostContent";
import { useAuth } from "@/hooks/AuthContext";
import { CommentType } from "@/lib/types";
import {
  DELETE_COMMENT,
  LIKE_COMMENT,
  UNLIKE_COMMENT,
} from "@/queries/comments";
import { useMutation } from "@apollo/client";
import { MouseEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CommentProps {
  comment: CommentType;
  disableTopMargin?: boolean;
  disableBottomMargin?: boolean;
  doesntRedirect?: boolean;
  redirectToParentOnDelete?: boolean;
  maxWidth?: string;
  goHomeOnDelete?: boolean;
  expanded?: boolean;
}
const Comment = ({
  comment,
  disableTopMargin = false,
  disableBottomMargin = false,
  doesntRedirect = false,
  redirectToParentOnDelete = false,
  maxWidth,
  goHomeOnDelete,
  expanded = false,
}: CommentProps) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [amtLikes, setAmtLikes] = useState(comment.amtLikes);
  const [isDeleted, setIsDeleted] = useState(false);

  const [deleteComment, { loading: deleteLoading, error: deleteError }] =
    useMutation(DELETE_COMMENT, {
      variables: {
        id: comment.id,
        parentID: comment.parentID,
        parentType: comment.parentType,
      },
      update: (cache, { data }) => {
        if (!data) return;
        const deletedComment = data.deleteComment;
        cache.modify({
          fields: {
            getComments(existingComments = [], { readField }) {
              return existingComments.filter(
                (c: { __ref: string }) =>
                  deletedComment.id !== readField("id", c),
              );
            },
            getCommentsByIds(existingComments = [], { readField }) {
              return existingComments.filter(
                (c: { __ref: string }) =>
                  deletedComment.id !== readField("id", c),
              );
            },
          },
        });
      },
      onError: (err) => {
        toast.error(`Error deleting comment: ${err.message}`);
      },
      onCompleted: () => {
        setIsDeleted(true);
        toast.success("Comment deleted");
        if (goHomeOnDelete) {
          window.location.href = "/project2";
        }
      },
    });

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?",
    );
    if (!confirmDelete) return;

    try {
      await deleteComment();
      if (redirectToParentOnDelete) {
        window.location.href = `/project2/${comment.parentType}/${comment.parentID}`;
      }
    } catch (error) {
      toast.error(`Error deleting comment: ${(error as Error).message}`);
    }
  };

  useEffect(() => {
    setIsLiked(user?.likedCommentIds.includes(comment.id) ?? false);
  }, [user?.likedCommentIds, comment.id]);

  const [likeComment] = useMutation(LIKE_COMMENT, {
    variables: { id: comment.id },
    onCompleted: (data) => {
      setAmtLikes(data.likeComment.amtLikes);
      setIsLiked(true);
    },
    onError: (error) => {
      toast.error(`Error liking comment: ${error.message}`);
    },
  });

  const [unlikeComment] = useMutation(UNLIKE_COMMENT, {
    variables: { id: comment.id },
    onCompleted: (data) => {
      setAmtLikes(data.unlikeComment.amtLikes);
      setIsLiked(false);
    },
    onError: (error) => {
      toast.error(`Error unliking comment: ${error.message}`);
    },
  });

  const toggleLike = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (isLiked) {
      unlikeComment();
    } else {
      likeComment();
    }
  };

  if (isDeleted) return null;

  return (
    <PostContent
      post={comment}
      isLiked={isLiked}
      amtLikes={amtLikes}
      toggleLike={toggleLike}
      handleDelete={handleDelete}
      deleteLoading={deleteLoading}
      deleteError={deleteError}
      className="bg-gray-100 dark:border-gray-700 dark:bg-gray-900"
      doesntRedirect={doesntRedirect}
      disableTopMargin={disableTopMargin}
      disableBottomMargin={disableBottomMargin}
      maxWidth={maxWidth}
      expanded={expanded}
    />
  );
};

export default Comment;
