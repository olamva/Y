import PostBody from "@/components/Post/PostBody";
import FollowButton from "@/components/Users/FollowButton";
import Username from "@/components/Users/Username";
import { useAuth } from "@/hooks/AuthContext";
import { formatTimestamp } from "@/lib/dateUtils";
import { CommentType, PostType, RepostType } from "@/lib/types";
import { REPOST_MUTATION, UNREPOST_MUTATION } from "@/queries/reposts";
import { ApolloError, useMutation } from "@apollo/client";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import { HeartFilledIcon } from "@radix-ui/react-icons";
import {
  HeartIcon,
  PencilIcon,
  Repeat2Icon,
  Share2Icon,
  TrashIcon,
} from "lucide-react";
import { MouseEvent, TouchEvent, useEffect, useState } from "react";
import toast from "react-hot-toast";

interface PostContentProps {
  post: PostType | CommentType;
  toggleLike: (e: MouseEvent<HTMLButtonElement>) => void;
  isLiked: boolean;
  amtLikes: number;
  handleDelete: () => Promise<void>;
  deleteLoading: boolean;
  deleteError: ApolloError | undefined;
  maxWidth?: string;
  className?: string;
  doesntRedirect?: boolean;
  disableTopMargin: boolean;
  disableBottomMargin: boolean;
  expanded: boolean;
}

const PostContent = ({
  post,
  toggleLike,
  isLiked,
  amtLikes,
  handleDelete,
  deleteLoading,
  deleteError,
  maxWidth,
  className = "",
  doesntRedirect,
  disableTopMargin,
  disableBottomMargin,
  expanded,
}: PostContentProps) => {
  const { user } = useAuth();
  const [amtReposts, setAmtReposts] = useState(post.amtReposts);
  const [hasReposted, setHasReposted] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  const toggleEditView = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setShowOriginal((prev) => !prev);
    if (showOriginal) setIsHovering(false);
  };

  useEffect(() => {
    setHasReposted(user?.repostedPostIds.includes(post.id) ?? false);
  }, [user?.repostedPostIds, post.id]);

  const [repost, { loading: repostLoading }] = useMutation<{
    repost: RepostType;
  }>(REPOST_MUTATION, {
    variables: { id: post.id, type: post.__typename },
    onCompleted: () => {
      toast.success("Reposted successfully");
      if (doesntRedirect) {
        setAmtReposts(amtReposts + 1);
        setHasReposted(true);
      } else window.location.reload();
    },
    onError: (error) => {
      toast.error(`Error reposting: ${error.message}`);
    },
  });

  const [unrepost, { loading: unrepostLoading }] = useMutation<{
    unrepost: RepostType;
  }>(UNREPOST_MUTATION, {
    variables: { id: post.id, type: post.__typename },
    onCompleted: () => {
      toast.success("Unreposted successfully");
      if (doesntRedirect) {
        setAmtReposts(amtReposts - 1);
        setHasReposted(false);
      } else window.location.reload();
    },
    onError: (error) => {
      toast.error(`Error unreposting: ${error.message}`);
    },
  });

  function fallbackCopyTextToClipboard(text: string) {
    const textArea = document.createElement("textarea");
    textArea.value = text;

    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);

    textArea.focus();
    textArea.select();

    try {
      const successful = document.execCommand("copy");
      if (successful) {
        toast.success("Link copied to clipboard");
      } else {
        toast.error("Failed to copy link");
      }
    } catch (err) {
      toast.error(`Failed to copy link: ${err}`);
    }

    document.body.removeChild(textArea);
  }

  return (
    <article
      className={`flex w-full flex-col gap-2 rounded-md border-2 p-4 pb-2 text-black shadow-md dark:text-white ${
        disableBottomMargin ? "" : "mb-2"
      } ${disableTopMargin ? "" : "mt-2"} ${
        maxWidth !== undefined ? maxWidth : "max-w-xl"
      } ${doesntRedirect ? "cursor-default" : "cursor-pointer"} ${className}`}
      onClick={(e: MouseEvent | TouchEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const selection = window.getSelection();

        if (
          (!selection || selection.toString().length === 0) &&
          !doesntRedirect
        ) {
          document.location.href = `/project2/${post.__typename === "Comment" ? "reply" : "post"}/${post.id}`;
        }
      }}
    >
      <header className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Username verticalWhenSmall user={post.author} />
            {post.author.username !== user?.username && (
              <FollowButton targetUsername={post.author.username} />
            )}
            <p>·</p>
            <p>{formatTimestamp(post.createdAt)}</p>
            {post.originalBody && (
              <div className="ml-2 hidden sm:block">
                <button
                  className="text-sm text-gray-600 underline-offset-4 hover:text-gray-500 hover:underline dark:text-gray-200 dark:hover:text-gray-300"
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
            {user && user.username === post.author.username && (
              <button
                className="text-gray-500 outline-none hover:text-blue-500"
                aria-label="Edit post"
                onClick={(e: MouseEvent | TouchEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  window.location.href = `/project2/${post.__typename === "Comment" ? "reply" : "post"}/${post.id}/edit`;
                }}
              >
                <PencilIcon className="size-5" />
              </button>
            )}
            {user &&
              (user.username === post.author.username ||
                user.username === "admin") && (
                <button
                  onClick={(e: MouseEvent | TouchEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleDelete();
                  }}
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
              className="text-sm text-gray-600 underline-offset-4 hover:text-gray-500 hover:underline dark:text-gray-200 dark:hover:text-gray-300"
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
        text={
          showOriginal
            ? (post.originalBody ?? post.body ?? "")
            : (post.body ?? "")
        }
        expanded={expanded}
      />

      {post.imageUrl && (
        <img
          src={`${BACKEND_URL}${post.imageUrl}`}
          alt="Post"
          className="h-auto max-h-[36rem] w-full object-contain"
        />
      )}

      <footer className="flex w-full justify-around">
        <button
          className="group flex items-center gap-1 p-2"
          aria-label="Like post"
          aria-pressed={isLiked}
          onClick={toggleLike}
        >
          {isLiked ? (
            <HeartFilledIcon className="size-6 text-red-600 group-hover:scale-110" />
          ) : (
            <HeartIcon className="size-6 group-hover:scale-110" />
          )}
          <span className="flex select-none gap-1">
            <p className="font-extrabold">{amtLikes}</p>{" "}
            <p className="hidden font-extralight md:block">Likes</p>
          </span>
        </button>
        <button
          className="group flex items-center gap-1 p-2"
          disabled={repostLoading || unrepostLoading}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (hasReposted) unrepost();
            else repost();
          }}
        >
          <Repeat2Icon
            className={`size-6 transition-all sm:group-hover:scale-110 ${hasReposted ? "text-green-600 sm:group-hover:text-red-600" : "sm:group-hover:text-green-600"}`}
          />
          <span className="flex select-none gap-1">
            <p className="font-extrabold">{amtReposts}</p>{" "}
            <p className="hidden font-extralight md:block">Reposts</p>
          </span>
        </button>
        <div className="flex items-center gap-1">
          <ChatBubbleLeftIcon className="size-6" />
          <span className="flex select-none gap-1">
            <p className="font-extrabold">{post.amtComments}</p>{" "}
            <p className="hidden font-extralight md:block">Comments</p>
          </span>
        </div>
        <button
          className="group flex items-center gap-1 p-2"
          aria-label="Share post"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            const shareURL = `${window.location.origin}/project2/${post.__typename === "Comment" ? "reply" : "post"}/${post.id}`;

            if (navigator.clipboard) {
              navigator.clipboard
                .writeText(shareURL)
                .then(() => {
                  toast.success("Link copied to clipboard");
                })
                .catch(() => {
                  fallbackCopyTextToClipboard(shareURL);
                });
            } else {
              fallbackCopyTextToClipboard(shareURL);
            }
          }}
        >
          <Share2Icon className="size-6" />
          <p className="hidden select-none font-extralight underline-offset-2 group-hover:underline md:block">
            Share
          </p>
        </button>
      </footer>

      {deleteError && (
        <p className="mt-2 text-sm text-red-500">
          Error deleting post: {deleteError.message}
        </p>
      )}
    </article>
  );
};

export default PostContent;
