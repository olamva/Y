import PostContent from "@/components/Post/PostContent";
import { CommentType, PostType } from "@/lib/types";
import { DELETE_COMMENT, GET_COMMENTS } from "@/queries/comments";
import { GET_POST } from "@/queries/posts";
import { useMutation } from "@apollo/client";
import { useState } from "react";
import toast from "react-hot-toast";

interface CommentProps {
  comment: CommentType;
  disableTopMargin?: boolean;
  disableBottomMargin?: boolean;
  maxWidth?: string;
}
const Comment = ({
  comment,
  disableTopMargin = false,
  disableBottomMargin = false,
  maxWidth = "",
}: CommentProps) => {
  const [isDeleted, setIsDeleted] = useState(false);

  const [deleteComment, { loading: deleteLoading, error: deleteError }] =
    useMutation(DELETE_COMMENT, {
      variables: { id: comment.id },
      update: (cache, { data }) => {
        if (!data) return;
        const deletedComment = data.deleteComment;
        const existingComments = cache.readQuery<{
          getComments: CommentType[];
        }>({
          query: GET_COMMENTS,
          variables: { postID: deletedComment.parentID },
        });

        if (existingComments) {
          cache.writeQuery({
            query: GET_COMMENTS,
            variables: { postID: deletedComment.parentID },
            data: {
              getComments: existingComments.getComments.filter(
                (c) => c.id !== deletedComment.id,
              ),
            },
          });
        }
        const existingPost = cache.readQuery<{ getPost: PostType }>({
          query: GET_POST,
          variables: { id: deletedComment.parentID },
        });

        if (existingPost && existingPost.getPost) {
          cache.writeQuery({
            query: GET_POST,
            variables: { id: deletedComment.parentID },
            data: {
              getPost: {
                ...existingPost.getPost,
                amtComments: existingPost.getPost.amtComments - 1,
              },
            },
          });
        }
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
      doesntRedirect
      disableTopMargin={disableTopMargin}
      disableBottomMargin={disableBottomMargin}
      maxWidth={maxWidth}
    />
  );
};

export default Comment;
