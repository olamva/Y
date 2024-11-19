import { formatTimestamp } from "@/lib/dateUtils";
import { PostType, RepostType } from "@/lib/types";
import { useAuth } from "../AuthContext";
import FollowButton from "../FollowButton";
import Avatar from "../Profile/Avatar";
import Post from "./Post";

const Repost = ({ repost }: { repost: RepostType }) => {
  const { user } = useAuth();
  const originalPost: PostType = {
    id: repost.originalID,
    body: repost.body,
    originalBody: repost.originalBody,
    author: repost.originalAuthor,
    amtLikes: repost.amtLikes,
    amtComments: repost.amtComments,
    amtReposts: repost.amtReposts,
    imageUrl: repost.imageUrl,
    createdAt: repost.createdAt,
    __typename: "Post",
  };
  return (
    <div className="flex flex-col">
      <header className="mx-1 flex h-fit items-end">
        <div className="h-6 w-4 rounded-tl-lg border-b-0 border-l border-t border-gray-400"></div>
        <div className="flex items-center gap-2 rounded rounded-b-none bg-gray-200/70 shadow-lg p-2 ">
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
      <Post disableTopMargin post={originalPost} />
    </div>
  );
};

export default Repost;
