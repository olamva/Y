interface PostSkeletonProps {
  maxWidth?: string;
  comment?: boolean;
  disableTopMargin?: boolean;
  disableBottomMargin?: boolean;
}
const PostSkeleton = ({
  maxWidth = "max-w-xl",
  comment = false,
  disableTopMargin = false,
  disableBottomMargin = false,
}: PostSkeletonProps) => {
  return (
    <div
      className={`${disableTopMargin ? "" : "mt-2"} ${disableBottomMargin ? "" : "mb-2"} ${maxWidth} w-full rounded-lg p-4 shadow ${comment ? "border bg-gray-100 dark:border-gray-700 dark:bg-gray-900" : "border border-white bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900"}`}
    >
      <div className="mb-4 flex items-center space-x-4">
        <div className="h-12 w-12 animate-pulse rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      </div>
    </div>
  );
};

export default PostSkeleton;
