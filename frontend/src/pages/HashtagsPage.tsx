import HashTagCard from "@/components/HashtagCard";
import Divider from "@/components/ui/Divider";
import { HashtagType } from "@/lib/types";
import { GET_TRENDING_HASHTAGS } from "@/queries/hashtags";
import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const COUNT_SIZE = 10;

const HashTagscount = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  const [count, setCount] = useState(1);
  const [hashtags, setHashTags] = useState<HashtagType[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, error, fetchMore, networkStatus } = useQuery<{
    getTrendingHashtags: HashtagType[];
  }>(GET_TRENDING_HASHTAGS, {
    variables: { hashtag, limit: COUNT_SIZE },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (data && data.getTrendingHashtags) {
      setHashTags(data.getTrendingHashtags);
      setHasMore(data.getTrendingHashtags.length === COUNT_SIZE);
      setCount(1);
    }
  }, [data]);

  const loadMorehashtags = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const nextcount = count + 1;
      const { data: fetchMoreData } = await fetchMore({
        variables: { hashtag, count: nextcount },
      });

      if (fetchMoreData?.getTrendingHashtags) {
        setHashTags((prevhashtags) => [
          ...prevhashtags,
          ...fetchMoreData.getTrendingHashtags,
        ]);
        setHasMore(fetchMoreData.getTrendingHashtags.length === COUNT_SIZE);
        setCount(nextcount);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more hashtags: ${(error as Error).message}`);
    }
  }, [fetchMore, hasMore, loading, count, hashtag]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
          document.body.offsetHeight - 200 &&
        networkStatus !== 3 &&
        hasMore
      ) {
        loadMorehashtags();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMorehashtags, hasMore, networkStatus]);

  if (loading && networkStatus === 1) {
    return <p className="mt-4 text-center">Loading hashtags...</p>;
  }

  if (error) {
    return (
      <p className="mt-4 text-center text-red-500">
        Error loading hashtags: {error.message}
      </p>
    );
  }

  return (
    <div className="mx-auto w-full max-w-screen-xl px-5">
      <main className="flex w-full flex-col items-center justify-center">
        <h1 className="my-4 text-3xl font-bold">All hashtags</h1>
        <Divider />
        <div className="col-span-1 flex w-full justify-center gap-2 sm:col-span-2 lg:col-span-3">
          {hashtags.map((hashtag) => (
            <HashTagCard hashtag={hashtag} />
          ))}
        </div>
        {loading && networkStatus === 3 && (
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

export default HashTagscount;
