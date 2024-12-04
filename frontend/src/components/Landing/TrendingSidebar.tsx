import HashtagBlock from "@/components/Hashtags/HashtagBlock";
import HashtagBlockSkeleton from "@/components/Skeletons/HashtagBlockSkeleton";
import { HashtagType } from "@/lib/types";
import { GET_TRENDING_HASHTAGS } from "@/queries/hashtags";
import { useQuery } from "@apollo/client";
import { HashtagIcon } from "@heroicons/react/24/outline";

interface TrendingSidebarProps {
  pageSize: number;
}
const TrendingSidebar = ({ pageSize }: TrendingSidebarProps) => {
  const { data: hashtagsData, error: hashtagsError } = useQuery<{
    getTrendingHashtags: HashtagType[];
  }>(GET_TRENDING_HASHTAGS, {
    variables: { page: 1 },
  });

  return (
    <aside className="hidden w-full max-w-64 py-4 lg:flex">
      <div className="flex w-full flex-col items-start gap-1">
        <h1 className="mx-1 text-3xl font-extralight">Trending</h1>
        {hashtagsError && (
          <p className="mt-4 text-center text-red-500">
            Error loading hashtags: {hashtagsError.message}
          </p>
        )}
        <div className="flex w-full flex-col items-center gap-[0.0625rem] bg-gray-300 dark:bg-gray-700">
          {!hashtagsData
            ? Array.from({ length: pageSize }).map((_, index) => (
                <HashtagBlockSkeleton key={index} />
              ))
            : hashtagsData?.getTrendingHashtags.map((hashtag) => (
                <HashtagBlock hashtag={hashtag} key={hashtag.tag} />
              ))}
        </div>
        <a
          href={`/project2/hashtag`}
          className="mt-4 inline-flex items-center justify-center self-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          <HashtagIcon className="mr-2 size-5" aria-hidden="true" />
          <span>View All Hashtags</span>
        </a>
      </div>
    </aside>
  );
};

export default TrendingSidebar;
