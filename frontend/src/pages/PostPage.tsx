import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/client";
import Comment from "@/components/Comment";
import Post from "@/components/Post";
import { Button } from "@/components/ui/button";
import TextInput from "@/form/TextInput";
import { CommentType, PostType } from "@/lib/types";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { GET_POST } from "@/queries/posts";
import { CREATE_COMMENT, GET_COMMENTS } from "@/queries/comments";
import toast from "react-hot-toast";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [comment, setComment] = useState("");

  const {
    data: postData,
    loading: postLoading,
    error: postError,
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
    <>
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
        <Post post={postData.getPost} />
        <form
          className="flex w-full flex-col items-center gap-2"
          onSubmit={handleAddComment}
        >
          <div className="w-full max-w-md">
            <TextInput
              id="commentText"
              label="Write a comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={createLoading}
            className={`rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
              comment
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "cursor-not-allowed bg-gray-400"
            }`}
          >
            {createLoading ? "Adding..." : "Add Comment"}
          </button>
          {createError && (
            <p className="text-red-500">
              Error adding comment: {createError.message}
            </p>
          )}
        </form>

        {commentsLoading ? (
          <p>Loading comments...</p>
        ) : commentsError ? (
          <p>Error loading comments: {commentsError.message}</p>
        ) : (
          <div className="mt-4 flex w-full max-w-md flex-col gap-2">
            {commentsData?.getComments &&
            commentsData.getComments.length > 0 ? (
              commentsData.getComments.map((comment) => (
                <Comment key={comment.id} comment={comment} />
              ))
            ) : (
              <h1>No comments</h1>
            )}
          </div>
        )}
      </main>
    </>
  );
};

export default PostPage;
