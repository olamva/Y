import { formatTimestamp } from "@/lib/dateUtils";
import { CommentType, PostType, RepostType } from "@/lib/types";
import { useAuth } from "../AuthContext";
import FollowButton from "../FollowButton";
import Avatar from "../Profile/Avatar";
import Comment from "./Comment";
import Post from "./Post";

const Repost = ({ repost }: { repost: RepostType }) => {
  const { user } = useAuth();
  const originalPost: PostType | CommentType = {
    id: repost.originalID,
    body: repost.body,
    originalBody: repost.originalBody,
    author: repost.originalAuthor,
    amtLikes: repost.amtLikes,
    amtComments: repost.amtComments,
    amtReposts: repost.amtReposts,
    imageUrl: repost.imageUrl,
    createdAt: repost.createdAt,
    __typename: repost.parentID ? "Comment" : "Post",
    parentID: repost.parentID ?? "",
    parentType: repost.parentType ?? "post",
  };
  return (
    <div className="flex flex-col">
      <header className="mx-1 flex h-fit items-end">
        <div className="h-6 w-4 rounded-tl-lg border-b-0 border-l border-t border-gray-300 dark:border-gray-700"></div>
        <div className="flex items-center gap-2 rounded rounded-b-none bg-gray-200/70 p-2 shadow-lg dark:bg-gray-900/80">
          <Avatar user={repost.author} />
          <a
            href={`/project2/user/${repost.author.username}`}
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <p className="break-words font-mono underline-offset-4 hover:underline">
              <span className="font-sans">@</span>
              {repost.author.username}
            </p>
          </a>
          {repost.author.username !== user?.username && (
            <FollowButton targetUsername={repost.author.username} />
          )}
          <p>reposted</p>
          <p>·</p>
          <p>{formatTimestamp(repost.repostedAt)}</p>
        </div>
      </header>
      {originalPost.__typename === "Post" ? (
        <Post disableTopMargin post={originalPost} />
      ) : (
        <Comment disableTopMargin comment={originalPost} />
      )}
    </div>
  );
};

export default Repost;
