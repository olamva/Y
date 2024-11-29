const ProfileBlockSkeleton = () => (
  <div className="flex w-full justify-between bg-gray-100 p-2 transition-colors dark:bg-gray-900/50">
    <div className="flex items-center">
      <div className="mr-3 h-10 w-10 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700"></div>
      <div className="flex flex-col">
        <div className="mb-1 h-4 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-3 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);

export default ProfileBlockSkeleton;
