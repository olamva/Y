import Comment from "@/components/Post/Comment";
import DeletedPost from "@/components/Post/DeletedPost";
import Post from "@/components/Post/Post";
import { CommentType, PostType } from "@/lib/types";
import PostSkeleton from "../Skeletons/PostSkeleton";

interface PostWithReplyProps {
  post: PostType | CommentType | undefined;
  reply: CommentType;
  replyDoesntRedirect?: boolean;
  parentsLoading?: boolean;
}
const PostWithReply = ({
  post,
  reply,
  replyDoesntRedirect = false,
  parentsLoading = false,
}: PostWithReplyProps) => (
  <div className="flex w-full flex-col items-center">
    {!post ? (
      parentsLoading ? (
        <PostSkeleton />
      ) : (
        <DeletedPost />
      )
    ) : "parentID" in post ? (
      <Comment comment={post} disableBottomMargin />
    ) : (
      <Post post={post} disableBottomMargin />
    )}
    <div className="h-4 w-1 bg-gray-300 dark:bg-gray-700"></div>
    <Comment
      comment={reply}
      doesntRedirect={replyDoesntRedirect}
      redirectToParentOnDelete={!!post}
      disableTopMargin
      maxWidth="max-w-lg"
    />
  </div>
);

export default PostWithReply;
