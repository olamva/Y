import BackButton from "@/components/BackButton";
import HashTagCard from "@/components/HashtagCard";
import Divider from "@/components/ui/Divider";
import { HashtagType } from "@/lib/types";
import { GET_TRENDING_HASHTAGS } from "@/queries/hashtags";
import { useQuery } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useParams } from "react-router-dom";

const HashtagsPage = () => {
  const { hashtag } = useParams<{ hashtag: string }>();
  const [page, setPage] = useState(1);
  const [hashtags, setHashTags] = useState<HashtagType[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const { data, loading, error, fetchMore, networkStatus } = useQuery<{
    getTrendingHashtags: HashtagType[];
  }>(GET_TRENDING_HASHTAGS, {
    variables: { hashtag, page: page },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (data && data.getTrendingHashtags && page === 1) {
      setHashTags(data.getTrendingHashtags);
      setHasMore(data.getTrendingHashtags.length > 0);
    }
  }, [data, page]);

  const loadMoreHashtags = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const nextPage = page + 1;
      const { data: fetchMoreData } = await fetchMore({
        variables: { page: nextPage },
      });

      if (fetchMoreData?.getTrendingHashtags) {
        setHashTags((prevHashtags) => [
          ...prevHashtags,
          ...fetchMoreData.getTrendingHashtags,
        ]);
        setHasMore(fetchMoreData.getTrendingHashtags.length > 0);
        setPage(nextPage);
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
        networkStatus !== 3 &&
        hasMore
      ) {
        loadMoreHashtags();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loadMoreHashtags, hasMore, networkStatus]);

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
      <BackButton />
      <main className="flex w-full flex-col items-center justify-center">
        <h1 className="my-4 text-3xl font-bold">All hashtags</h1>
        <Divider />
        <div className="grid w-full gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hashtags.map((hashtag) => (
            <HashTagCard hashtag={hashtag} key={hashtag.tag} />
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

export default HashtagsPage;
