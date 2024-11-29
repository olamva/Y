const BlockSkeleton = () => (
  <div className="flex w-full flex-col items-start bg-gray-100 p-3 transition-colors dark:bg-gray-900/50">
    <div className="mb-2 h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
    <div className="h-4 w-16 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
  </div>
);

export default BlockSkeleton;
