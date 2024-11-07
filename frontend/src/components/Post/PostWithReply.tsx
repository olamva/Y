import Comment from "@/components/Post/Comment";
import Post from "@/components/Post/Post";
import { CommentType, PostType } from "@/lib/types";

interface PostWithReplyProps {
  post: PostType | CommentType;
  reply: CommentType;
  replyDoesntRedirect?: boolean;
}
const PostWithReply = ({
  post,
  reply,
  replyDoesntRedirect = false,
}: PostWithReplyProps) => (
  <div className="flex w-full flex-col items-center">
    {post &&
      ("parentID" in post ? (
        <Comment comment={post} disableBottomMargin />
      ) : (
        <Post post={post} disableBottomMargin />
      ))}
    <div className="h-4 w-1 bg-gray-300 dark:bg-gray-700"></div>
    <Comment
      comment={reply}
      doesntRedirect={replyDoesntRedirect}
      redirectToParentOnDelete
      disableTopMargin
      maxWidth="max-w-lg"
    />
  </div>
);

export default PostWithReply;
