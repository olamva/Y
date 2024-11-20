const CardSkeleton = () => {
  return (
    <div className="relative overflow-hidden w-full rounded-lg bg-white p-4 shadow dark:bg-gray-900">
      <div className="absolute inset-0 animate-pulse bg-white blur-sm dark:bg-gray-900"></div>
      <div className="relative flex h-10 items-center justify-center">
        <div className="h-3 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
      <div className="relative flex h-10 items-center justify-center">
        <div className="h-3 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
      </div>
    </div>
  );
};

export default CardSkeleton;
