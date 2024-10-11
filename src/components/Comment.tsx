import { CommentType } from "@/lib/types";
import Avatar from "./Avatar";

const Comment = ({ comment }: { comment: CommentType }) => {
  return (
    <div className="flex w-full flex-col gap-2 rounded-lg border border-gray-400 bg-gray-100 p-4 dark:bg-gray-900">
      <header className="flex items-center gap-2">
        <Avatar username={comment.author} />
        <p className="font-mono">{comment.author}</p>
      </header>
      <p className="text-gray-600 dark:text-gray-200">{comment.body}</p>
    </div>
  );
};

export default Comment;
