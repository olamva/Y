import Comment from "@/components/Post/Comment";
import Post from "@/components/Post/Post";
import { CommentType, PostType } from "@/lib/types";

interface PostWithReplyProps {
  post: PostType | CommentType;
  reply: CommentType;
}
const PostWithReply = ({ post, reply }: PostWithReplyProps) => {
  const isComment = "parentID" in post;
  return (
    <div className="flex w-full flex-col items-center">
      {isComment ? (
        <Comment comment={post} disableBottomMargin />
      ) : (
        <Post post={post} disableBottomMargin />
      )}
      <div className="h-4 w-1 bg-gray-300"></div>
      <Comment comment={reply} disableTopMargin redirects maxWidth="max-w-lg" />
    </div>
  );
};

export default PostWithReply;
