import { useAuth } from "@/components/AuthContext";
import CreatePostField from "@/components/CreatePostField";
import Comment from "@/components/Post/Comment";
import Post from "@/components/Post/Post";
import { Button } from "@/components/ui/button";
import Divider from "@/components/ui/Divider";
import { CommentType, PostType } from "@/lib/types";
import { CREATE_COMMENT, GET_COMMENTS } from "@/queries/comments";
import { EDIT_POST, GET_POST } from "@/queries/posts";
import { useMutation, useQuery } from "@apollo/client";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { FormEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const PostPage = () => {
  const { id, edit } = useParams<{ id: string; edit?: string }>();
  const editing = edit === "edit";
  if (!editing && edit) {
    window.location.href = `/project2/post/${id}`;
  }
  const [editBody, setEditBody] = useState("");
  const [comment, setComment] = useState("");
  const user = useAuth();

  const {
    data: postData,
    loading: postLoading,
    error: postError,
    refetch: refetchPost,
  } = useQuery<{ getPost: PostType }>(GET_POST, {
    variables: { id },
    notifyOnNetworkStatusChange: true,
  });

  const {
    data: commentsData,
    loading: commentsLoading,
    error: commentsError,
    refetch: refetchComments,
  } = useQuery<{ getComments: CommentType[] }>(GET_COMMENTS, {
    variables: { postID: id },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    if (postData?.getPost && !postLoading) {
      setEditBody(postData.getPost.body);
    }
  }, [postData, postLoading]);

  const [createComment, { loading: createLoading, error: createError }] =
    useMutation<
      { createComment: CommentType },
      { body: string; parentID: string }
    >(CREATE_COMMENT, {
      onCompleted: () => {
        setComment("");
        refetchComments();
        refetchPost();
      },
      onError: (err) => {
        console.error("Error creating comment:", err);
      },
    });

  const [editPost, { loading: editLoading }] = useMutation<
    { createPost: PostType },
    { id: string; body: string }
  >(EDIT_POST, {
    variables: { id: postData?.getPost.id || "", body: editBody },

    onError: (err) => {
      console.error("Error editing post:", err);
      toast.error(`Error editing post: ${err.message}`);
    },
    onCompleted: () => {
      toast.success("Post edited successfully!");
      window.location.href = `/project2/post/${id}`;
    },
  });

  const handleAddComment = async (e: FormEvent) => {
    e.preventDefault();
    if (comment.trim() === "") return;

    try {
      await createComment({
        variables: {
          body: comment,
          parentID: id!,
        },
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Error adding comment ${error.message}`);
      } else {
        toast.error("Error adding comment");
      }
    } finally {
      toast.success("Comment added");
    }
  };

  const handleEditPost = async (e: FormEvent) => {
    e.preventDefault();
    if (editBody.trim() === "") {
      toast.error("Post content cannot be empty.");
      return;
    }

    if (editBody === postData?.getPost.body) {
      toast.error("Post content is the same as before.");
      return;
    }

    try {
      await editPost();
    } catch (error) {
      toast.error(`Error adding post: ${(error as Error).message}`);
    }
  };

  if (postLoading) {
    return <p>Loading...</p>;
  }
  if (postError) {
    return <p>Error loading post: {postError.message}</p>;
  }

  if (!postData || !postData.getPost) {
    return <h1>Post not found</h1>;
  }

  return (
    <div className="w-full">
      <header>
        <Button
          className="m-2 flex gap-2 text-xl"
          onClick={() => window.history.back()}
          variant="ghost"
        >
          <ArrowUturnLeftIcon className="size-6" />
          <p>Back</p>
        </Button>
      </header>
      <main className="flex flex-col items-center px-4 pt-5">
        {editing ? (
          <form
            className="flex w-full max-w-xl items-center gap-2"
            onSubmit={handleEditPost}
          >
            <CreatePostField
              placeholder="What else is on your mind?"
              value={editBody}
              setValue={setEditBody}
              loading={editLoading}
              className={
                editBody !== postData.getPost.body && user
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
              }
            />
          </form>
        ) : (
          <Post post={postData.getPost} doesntRedirect />
        )}
        <Divider />
        {!editing && (
          <form
            className="flex w-full flex-col items-center gap-2"
            onSubmit={handleAddComment}
          >
            <CreatePostField
              placeholder="Write your reply..."
              value={comment}
              setValue={setComment}
              loading={createLoading}
              className={
                comment && user
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
              }
            />
            {createError && (
              <p className="text-red-500">
                Error adding comment: {createError.message}
              </p>
            )}
          </form>
        )}

        {commentsLoading ? (
          <p>Loading comments...</p>
        ) : commentsError ? (
          <p>Error loading comments: {commentsError.message}</p>
        ) : (
          <>
            {commentsData?.getComments &&
            commentsData.getComments.length > 0 ? (
              commentsData.getComments.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))
            ) : (
              <h1>No comments</h1>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PostPage;
