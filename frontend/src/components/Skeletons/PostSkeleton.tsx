const PostSkeleton = () => {
  return (
    <div className={`rounded-lg bg-white p-4 shadow dark:bg-gray-800`}>
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
