import Comment from "@/components/Post/Comment";
import DeletedPost from "@/components/Post/DeletedPost";
import Post from "@/components/Post/Post";
import PostSkeleton from "@/components/Skeletons/PostSkeleton";
import { CommentType, PostType } from "@/lib/types";

interface PostWithReplyProps {
  post: PostType | CommentType | undefined;
  reply: CommentType;
  replyDoesntRedirect?: boolean;
  parentsLoading?: boolean;
  goHomeOnParentDelete?: boolean;
  expandedReply?: boolean;
  redirectToParentOnDelete?: boolean;
}
const PostWithReply = ({
  post,
  reply,
  replyDoesntRedirect = false,
  parentsLoading = false,
  goHomeOnParentDelete = false,
  expandedReply = false,
  redirectToParentOnDelete = false,
}: PostWithReplyProps) => (
  <div className="flex w-full flex-col items-center">
    {!post ? (
      parentsLoading ? (
        <PostSkeleton />
      ) : (
        <DeletedPost />
      )
    ) : "parentID" in post ? (
      <Comment
        goHomeOnDelete={goHomeOnParentDelete}
        comment={post}
        disableBottomMargin
      />
    ) : (
      <Post
        goHomeOnDelete={goHomeOnParentDelete}
        post={post}
        disableBottomMargin
      />
    )}
    <div className="h-4 w-1 bg-gray-300 dark:bg-gray-700"></div>
    <Comment
      comment={reply}
      doesntRedirect={replyDoesntRedirect}
      redirectToParentOnDelete={!!post && redirectToParentOnDelete}
      disableTopMargin
      goHomeOnDelete={!post}
      maxWidth="max-w-lg"
      expanded={expandedReply}
    />
  </div>
);

export default PostWithReply;
