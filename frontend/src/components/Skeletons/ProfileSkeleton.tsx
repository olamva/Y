import BackButton from "../BackButton";

const ProfileSkeleton = () => (
  <div className="w-full px-5">
    <BackButton />

    <div className="flex flex-col items-center">
      {/* User Profile Section */}
      <section className="mb-8 w-full max-w-5xl">
        {/* Background and Avatar */}
        <div className="relative h-64 md:h-96">
          <div className="absolute inset-0 h-full w-full animate-pulse bg-gray-300 dark:bg-gray-700"></div>
        </div>
        <div className="mx-auto max-w-5xl">
          <div className="-mt-16 flex items-end space-x-5">
            <div className="size-24 animate-pulse rounded-full bg-gray-300 dark:bg-gray-700 md:size-36"></div>
            <div className="flex min-w-0 flex-1 items-center justify-end pb-1">
              <div className="mt-6 hidden min-w-0 flex-1 flex-col md:flex">
                <div className="mb-2 h-6 w-40 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
                <div className="h-4 w-24 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
              </div>
            </div>
          </div>
          {/* Followers and following */}
          <div className="my-2 mt-4 rounded-lg bg-gray-100 p-4 shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl dark:bg-gray-700">
            <div className="flex flex-col items-center justify-around sm:flex-row">
              <div className="flex h-[2.25rem] w-[6rem] animate-pulse items-center rounded bg-gray-300 p-2 dark:bg-gray-700"></div>
              <div className="flex h-[2.25rem] w-[6rem] animate-pulse items-center rounded bg-gray-300 p-2 dark:bg-gray-700"></div>
            </div>
          </div>
          {/* Biography */}
          <div className="mb-8 mt-6 rounded-lg bg-white p-6 shadow dark:bg-gray-600">
            <div className="mb-4 h-6 w-48 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
            <div className="h-4 w-64 animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
          </div>
        </div>
      </section>

      {/* Toggle Group for Views */}
      <section className="w-full max-w-5xl">
        <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-4">
          <div className="h-12 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-12 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-12 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
          <div className="h-12 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
        <div className="mt-4 flex w-full flex-col items-center">
          <div className="h-48 w-full animate-pulse rounded bg-gray-300 dark:bg-gray-700"></div>
        </div>
      </section>
    </div>
  </div>
);

export default ProfileSkeleton;
