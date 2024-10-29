import Comment from "@/components/Comment";
import Post from "@/components/Post";
import { Button } from "@/components/ui/button";
import TextInput from "@/form/TextInput";
import { CommentType, PostType } from "@/lib/types";
import { GET_POST } from "@/queries/posts";
import { useQuery } from "@apollo/client";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);

  const {
    data: post,
    loading,
    error,
  } = useQuery<{
    getPost: PostType;
  }>(GET_POST, {
    variables: { id },
    notifyOnNetworkStatusChange: true,
  });

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() === "") return;

    //TODO
  };

  if (loading) {
    return <p>Loading...</p>;
  }
  if (error) {
    return <p>Error loading post: {error.message}</p>;
  }

  if (!post || !post.getPost) {
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
        <Post post={post?.getPost} />
        <form
          className="flex w-full flex-col items-center gap-2"
          onSubmit={handleAddComment}
        >
          <div className="w-full max-w-md">
            <TextInput
              id={"commentText"}
              label={"Write a comment"}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          {comment && (
            <button
              type="submit"
              className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Add comment
            </button>
          )}
        </form>
        <div className="mt-4 flex w-full max-w-md flex-col gap-2">
          {comments.length > 0 ? (
            comments.map((comment) => (
              <Comment key={comment.id} comment={comment} />
            ))
          ) : (
            <h1>No comments</h1>
          )}
        </div>
      </main>
    </>
  );
};

export default PostPage;
