import PostBody from "@/components/PostBody";
import { CommentType, PostType } from "@/lib/types";
import { DELETE_COMMENT, GET_COMMENTS } from "@/queries/comments";
import { GET_POST } from "@/queries/posts";
import { useMutation } from "@apollo/client";
import { TrashIcon } from "@heroicons/react/24/solid";
import { useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";
import Avatar from "./Avatar";

const Comment = ({ comment }: { comment: CommentType }) => {
  const { user } = useAuth();
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
    <article className="relative flex w-full flex-col rounded-lg border border-gray-400 bg-gray-100 p-4 dark:bg-gray-900">
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar username={comment.author} />
          <p className="font-mono">
            <span className="font-sans">@</span>
            {comment.author}
          </p>
        </div>
        {user &&
          (user.username === comment.author || user.username === "admin") && (
            <button
              onClick={handleDelete}
              className="text-gray-500 hover:text-red-500 focus:outline-none"
              aria-label="Delete comment"
              disabled={deleteLoading}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
      </header>
      <PostBody text={comment.body} />

      {deleteError && (
        <p className="text-sm text-red-500">
          Error deleting comment: {deleteError.message}
        </p>
      )}
    </article>
  );
};

export default Comment;
