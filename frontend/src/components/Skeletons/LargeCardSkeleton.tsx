const LargeCardSkeleton = () => (
  <div className="w-full min-w-24 max-w-40 sm:max-w-48 md:min-w-64 md:max-w-72">
    <div className="flex min-h-48 w-full flex-col items-center justify-center rounded-lg border border-gray-400 bg-zinc-200 bg-cover bg-no-repeat shadow-xl hover:opacity-80 dark:border-gray-600 dark:bg-zinc-800 md:min-h-64">
      <div className="flex flex-col items-center justify-center gap-2 break-words">
        <div className="flex-shrink-0">
          <div className="h-24 w-24 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700"></div>
        </div>
        <div className="h-6 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-8 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);

export default LargeCardSkeleton;
