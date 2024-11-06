import { useAuth } from "@/components/AuthContext";
import Avatar from "@/components/Avatar";
import FollowButton from "@/components/FollowButton";
import PostBody from "@/components/Post/PostBody";
import { formatTimestamp } from "@/lib/dateUtils";
import { CommentType, PostType } from "@/lib/types";
import { ApolloError } from "@apollo/client";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import { HeartIcon, PencilIcon, TrashIcon } from "lucide-react";
import { MouseEvent, TouchEvent, useState } from "react";

interface PostContentProps {
  post: PostType | CommentType;
  toggleLike?: (e: MouseEvent<HTMLButtonElement>) => void;
  isLiked?: boolean;
  amtLikes?: number;
  doesntRedirect?: boolean;
  handleDelete: (e: MouseEvent<HTMLButtonElement>) => Promise<void>;
  deleteLoading: boolean;
  deleteError: ApolloError | undefined;
  className?: string;
  disableTopMargin: boolean;
  disableBottomMargin: boolean;
  maxWidth?: string;
}

const PostContent = ({
  post,
  toggleLike,
  isLiked,
  amtLikes,
  doesntRedirect,
  handleDelete,
  deleteLoading,
  deleteError,
  className = "",
  disableTopMargin,
  disableBottomMargin,
  maxWidth,
}: PostContentProps) => {
  const { user } = useAuth();
  const isComment = "parentID" in post;
  const [showOriginal, setShowOriginal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const toggleEditView = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowOriginal((prev) => !prev);
    if (showOriginal) setIsHovering(false);
  };

  return (
    <article
      className={`${
        disableBottomMargin ? "" : "mb-2"
      } ${disableTopMargin ? "" : "mt-2"} flex w-full flex-col gap-2 ${
        maxWidth !== undefined ? maxWidth : "max-w-xl"
      } rounded-md border-2 p-4 ${
        isComment ? "" : "pb-2"
      } text-black shadow-md dark:text-white ${
        doesntRedirect ? "cursor-text" : "cursor-pointer"
      } ${className}`}
      onClick={(e: MouseEvent | TouchEvent) => {
        e.stopPropagation();
        if (!doesntRedirect) {
          document.location.href = `/project2/post/${
            isComment ? post.parentID : post.id
          }`;
        }
      }}
    >
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Avatar username={post.author} />
            <a href={`/project2/user/${post.author}`}>
              <p className="font-mono underline-offset-4 hover:underline">
                <span className="font-sans">@</span>
                {post.author}
              </p>
            </a>
            {post.author !== user?.username && (
              <FollowButton targetUsername={post.author} />
            )}
            <p>·</p>
            <p>{formatTimestamp(post.createdAt)}</p>
            {post.originalBody && (
              <div className="ml-2 hidden sm:block">
                <button
                  className="text-sm text-gray-200 underline-offset-4 hover:text-gray-300 hover:underline"
                  onClick={toggleEditView}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  {showOriginal ? (
                    <p className="font-bold">Show newest version</p>
                  ) : isHovering ? (
                    <p>Show original</p>
                  ) : (
                    <p>(Edited)</p>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            {user && user.username === post.author && (
              <button
                className="text-gray-500 outline-none hover:text-blue-500"
                aria-label="Edit post"
                onClick={(e: MouseEvent | TouchEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/project2/post/${post.id}/edit`;
                }}
              >
                <PencilIcon className="size-5" />
              </button>
            )}
            {user &&
              (user.username === post.author || user.username === "admin") && (
                <button
                  onClick={handleDelete}
                  className="text-gray-500 outline-none hover:text-red-500"
                  aria-label="Delete post"
                  disabled={deleteLoading}
                >
                  <TrashIcon className="size-5" />
                </button>
              )}
          </div>
        </div>
        <div className="flex sm:hidden">
          {post.originalBody && (
            <button
              className="text-sm text-gray-200 underline-offset-4 hover:text-gray-300 hover:underline"
              onClick={toggleEditView}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
            >
              {showOriginal ? (
                <p className="font-bold">Show newest version</p>
              ) : isHovering ? (
                <p>Show original</p>
              ) : (
                <p>(Edited)</p>
              )}
            </button>
          )}
        </div>
      </header>

      <PostBody
        text={showOriginal ? (post.originalBody ?? post.body) : post.body}
      />

      {/* TODO: comment liking and replying  */}
      {!isComment && (
        <footer className="flex w-full justify-around">
          <button
            className="group flex items-center gap-1 p-2"
            onClick={toggleLike}
          >
            {isLiked ? (
              <HeartFilledIcon className="size-6 text-red-600 group-hover:scale-110" />
            ) : (
              <HeartIcon className="size-6 group-hover:scale-110" />
            )}
            <span className="select-none">{amtLikes}</span>
          </button>
          <div className="flex items-center gap-1">
            <ChatBubbleLeftIcon className="size-6" />
            <span className="select-none">{post.amtComments}</span>
          </div>
        </footer>
      )}

      {deleteError && (
        <p className="mt-2 text-sm text-red-500">
          Error deleting post: {deleteError.message}
        </p>
      )}
    </article>
  );
};

export default PostContent;
