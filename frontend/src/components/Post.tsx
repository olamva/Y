import Avatar from "@/components/Avatar";
import { PostType } from "@/lib/types";
import { DELETE_POST, LIKE_POST, UNLIKE_POST } from "@/queries/posts";
import { useMutation } from "@apollo/client";
import { ChatBubbleLeftIcon, HeartIcon } from "@heroicons/react/24/outline";
import { TrashIcon } from "@heroicons/react/24/solid";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { MouseEvent, TouchEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useAuth } from "./AuthContext";

const Post = ({ post }: { post: PostType }) => {
  const { user } = useAuth();
  const [isLiked, setIsLiked] = useState(false);
  const [amtLikes, setAmtLikes] = useState(post.amtLikes);
  const [isDeleted, setIsDeleted] = useState(false);

  useEffect(() => {
    setIsLiked(user?.likedPostIds.includes(post.id) ?? false);
  }, [user?.likedPostIds, post.id]);

  const [likePost] = useMutation(LIKE_POST, {
    variables: { postID: post.id },
    onCompleted: (data) => {
      setAmtLikes(data.likePost.amtLikes);
      setIsLiked(true);
    },
    onError: (error) => {
      toast.error(`Error liking post: ${error.message}`);
    },
  });

  const [unlikePost] = useMutation(UNLIKE_POST, {
    variables: { postID: post.id },
    onCompleted: (data) => {
      setAmtLikes(data.unlikePost.amtLikes);
      setIsLiked(false);
    },
    onError: (error) => {
      toast.error(`Error unliking post: ${error.message}`);
    },
  });

  const [deletePostMutation, { loading: deleteLoading, error: deleteError }] =
    useMutation(DELETE_POST, {
      variables: { id: post.id },
      update: (cache, { data }) => {
        if (!data) return;
        const deletedPostId = data.deletePost.id;
        cache.modify({
          fields: {
            getPosts(existingPosts = []) {
              return existingPosts.filter(
                (postRef: { __ref: string }) =>
                  postRef.__ref !== `Post:${deletedPostId}`,
              );
            },
          },
        });
      },
      onCompleted: () => {
        setIsDeleted(true);
        toast.success("Post deleted successfully");
      },
      onError: (err) => {
        toast.error(`Error deleting post: ${err.message}`);
      },
    });

  const toggleLike = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    if (isLiked) {
      unlikePost();
    } else {
      likePost();
    }
  };

  const handleDelete = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this post?",
    );
    if (!confirmDelete) return;

    try {
      await deletePostMutation();
    } catch (error) {
      toast.error(`Error deleting post: ${(error as Error).message}`);
    }
  };

  if (isDeleted) return null;

  return (
    <article
      className="m-2 w-full max-w-md cursor-pointer rounded-md border-2 border-white bg-zinc-50 p-3 text-black shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
      onClick={(e: MouseEvent | TouchEvent) => {
        e.stopPropagation();
        document.location.href = `/project2/post/${post.id}`;
      }}
    >
      <header className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Avatar username={post.author} />
          <a href={`/project2/user/${post.author}`}>
            <p className="font-mono underline-offset-4 hover:underline">
              {post.author}
            </p>
          </a>
        </div>
        {user &&
          (user.username === post.author || user.username === "admin") && (
            <button
              onClick={handleDelete}
              className="text-gray-500 hover:text-red-500 focus:outline-none"
              aria-label="Delete post"
              disabled={deleteLoading}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
          )}
      </header>

      <p className="mx-1 my-2">{post.body}</p>

      <footer className="flex w-full justify-around">
        <button className="flex items-center gap-1" onClick={toggleLike}>
          {isLiked ? (
            <HeartFilledIcon className="size-6 text-red-600 hover:scale-110" />
          ) : (
            <HeartIcon className="size-6 hover:scale-110" />
          )}
          <span>{amtLikes}</span>
        </button>
        <div className="flex items-center gap-1">
          <ChatBubbleLeftIcon className="size-6" />
          <span>{post.amtComments}</span>
        </div>
      </footer>

      {deleteError && (
        <p className="mt-2 text-sm text-red-500">
          Error deleting post: {deleteError.message}
        </p>
      )}
    </article>
  );
};

export default Post;
