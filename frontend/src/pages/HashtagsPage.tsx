import BackButton from "@/components/BackButton";
import HashTagCard from "@/components/HashtagCard";
import CardSkeleton from "@/components/Skeletons/CardSkeleton";
import Divider from "@/components/ui/Divider";
import { HashtagType } from "@/lib/types";
import { GET_TRENDING_HASHTAGS } from "@/queries/hashtags";
import { NetworkStatus, useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";

const PAGE_SIZE = 32;

const HashtagsPage = () => {
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    document.title = "Y · Trending";
  }, []);

  const { data, loading, error, fetchMore, networkStatus } = useQuery<{
    getTrendingHashtags: HashtagType[];
  }>(GET_TRENDING_HASHTAGS, {
    variables: { page: 1, limit: PAGE_SIZE },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const loadMoreHashtags = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const { data: fetchMoreData } = await fetchMore({
        variables: { page: page + 1 },
      });

      if (fetchMoreData?.getTrendingHashtags) {
        if (fetchMoreData.getTrendingHashtags.length < PAGE_SIZE) {
          setHasMore(false);
        }
        if (fetchMoreData.getTrendingHashtags.length > 0) {
          setPage((prev) => prev + 1);
        }
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more users: ${(error as Error).message}`);
    }
  }, [fetchMore, hasMore, loading, page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        networkStatus !== NetworkStatus.fetchMore &&
        hasMore
      ) {
        loadMoreHashtags();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreHashtags, hasMore, networkStatus]);

  const hashtags = data?.getTrendingHashtags || [];

  return (
    <div className="mx-auto min-h-screen w-full max-w-screen-xl px-5">
      <BackButton />
      <main className="flex w-full flex-col items-center justify-center">
        <h1 className="my-4 text-3xl font-bold">All hashtags</h1>
        <Divider />
        <div className="flex w-full flex-wrap justify-evenly gap-x-2 gap-y-4">
          {error && (
            <p className="mt-4 text-center text-red-500">
              Error loading hashtags: {error.message}
            </p>
          )}
          {loading && networkStatus === NetworkStatus.loading
            ? Array.from({ length: 16 }).map((_, index) => (
                <div
                  className="w-full min-w-24 max-w-40 sm:max-w-48 md:min-w-64 md:max-w-72"
                  key={index}
                >
                  <CardSkeleton />
                </div>
              ))
            : hashtags.map((hashtag) => (
                <div
                  className="w-full min-w-24 max-w-40 sm:max-w-48 md:min-w-64 md:max-w-72"
                  key={hashtag.tag}
                >
                  <HashTagCard hashtag={hashtag} />
                </div>
              ))}
        </div>

        {loading && networkStatus === NetworkStatus.fetchMore && (
          <p className="mt-4 text-center">Loading more hashtags...</p>
        )}
        {!hasMore && (
          <p className="mt-4 text-center text-gray-500">
            You've reached the end of the hashtags.
          </p>
        )}
        {hashtags.length === 0 && !loading && (
          <p className="mt-4 text-center text-gray-500">
            No hashtags available
          </p>
        )}
      </main>
    </div>
  );
};

export default HashtagsPage;
