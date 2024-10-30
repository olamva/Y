import { useAuth } from "@/components/AuthContext";
import CreatePostField from "@/components/CreatePostField";
import Comment from "@/components/Post/Comment";
import Post from "@/components/Post/Post";
import { Button } from "@/components/ui/button";
import Divider from "@/components/ui/Divider";
import { CommentType, PostType } from "@/lib/types";
import { CREATE_COMMENT, GET_COMMENTS } from "@/queries/comments";
import { GET_POST } from "@/queries/posts";
import { useMutation, useQuery } from "@apollo/client";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
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

  const handleAddComment = async (e: React.FormEvent) => {
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
      <main className="flex flex-col items-center pt-5">
        <Post post={postData.getPost} doesntRedirect />
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

        <Divider />

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
