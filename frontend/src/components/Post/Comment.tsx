import PostContent from "@/components/Post/PostContent";
import { CommentType } from "@/lib/types";
import { DELETE_COMMENT } from "@/queries/comments";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import toast from "react-hot-toast";

interface CommentProps {
  comment: CommentType;
  disableTopMargin?: boolean;
  disableBottomMargin?: boolean;
  redirects?: boolean;
  maxWidth?: string;
}
const Comment = ({
  comment,
  disableTopMargin = false,
  disableBottomMargin = false,
  redirects = false,
  maxWidth,
}: CommentProps) => {
  const [isDeleted, setIsDeleted] = useState(false);

  const [deleteComment, { loading: deleteLoading, error: deleteError }] =
    useMutation(DELETE_COMMENT, {
      variables: { id: comment.id },
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
          },
        });
      },
      onError: (err) => {
        toast.error(`Error deleting comment: ${err.message}`);
      },
      onCompleted: () => {
        setIsDeleted(true);
        toast.success("Comment deleted");
      },
    });

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this comment?",
    );
    if (!confirmDelete) return;

    try {
      await deleteComment();
    } catch (error) {
      toast.error(`Error deleting comment: ${(error as Error).message}`);
    }
  };

  if (isDeleted) return null;

  return (
    <PostContent
      post={comment}
      handleDelete={handleDelete}
      deleteLoading={deleteLoading}
      deleteError={deleteError}
      className="bg-gray-100 dark:border-gray-700 dark:bg-gray-900"
      doesntRedirect={!redirects}
      disableTopMargin={disableTopMargin}
      disableBottomMargin={disableBottomMargin}
      maxWidth={maxWidth}
    />
  );
};

export default Comment;
