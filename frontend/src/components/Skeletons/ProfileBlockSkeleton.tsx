const ProfileBlockSkeleton = () => (
  <div className="flex h-[4.25rem] w-full justify-between bg-gray-100 px-2 py-3 transition-colors dark:bg-gray-800">
    <div className="flex items-center">
      <div className="mr-2 size-8 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700"></div>
      <div className="flex flex-col">
        <div className="mb-1 h-4 w-32 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
        <div className="h-3 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
    </div>
  </div>
);

export default ProfileBlockSkeleton;
