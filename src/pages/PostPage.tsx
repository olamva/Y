import Comment from "@/components/Comment";
import Post from "@/components/Post";
import { Button } from "@/components/ui/button";
import TextInput from "@/form/TextInput";
import { commentsMock, mockData } from "@/lib/mockupData";
import { CommentType, PostType } from "@/lib/types";
import { ArrowUturnLeftIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const PostPage = () => {
  const { id } = useParams<{ id: string }>();
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState<CommentType[]>([]);

  const post: PostType | undefined = mockData.find((post) => id === post.id);

  useEffect(() => {
    if (comments.length !== 0) return;

    const storedComments = localStorage.getItem(`comments_${id}`);
    if (storedComments) {
      setComments(JSON.parse(storedComments));
    }

    const mockComments = commentsMock.filter(
      (comment) => comment.parentID === id,
    );

    setComments((prevComments) => {
      const newComments = mockComments.filter(
        (mockComment) => !prevComments.some((c) => c.id === mockComment.id),
      );
      return [...prevComments, ...newComments];
    });
  }, [id]);

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (comment.trim() === "") return;

    const newComment: CommentType = {
      id: `${Date.now()}`,
      body: comment,
      author: "Anonymous", // TODO: change to user
      amtLikes: 0,
      amtComments: 0,
      parentID: id as string,
    };

    setComments((prevComments) => {
      const updatedComments = [...prevComments, newComment];
      return updatedComments;
    });

    localStorage.setItem(
      `comments_${id}`,
      JSON.stringify([...comments, newComment]),
    );

    setComment("");
  };

  if (!post) {
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
        <Post post={post} />
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
