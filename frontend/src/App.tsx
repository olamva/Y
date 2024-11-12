import { useAuth } from "@/components/AuthContext";
import CreatePostField from "@/components/CreatePostField";
import FollowButton from "@/components/FollowButton";
import Post from "@/components/Post/Post";
import Avatar from "@/components/Profile/Avatar";
import Divider from "@/components/ui/Divider";
import { HashtagType, PostType, UserType } from "@/lib/types";
import { CREATE_POST, GET_POSTS } from "@/queries/posts";
import { GET_USERS } from "@/queries/user";
import { NetworkStatus, useMutation, useQuery } from "@apollo/client";
import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { GET_TRENDING_HASHTAGS } from "@/queries/hashtags";
import HashTagCard from "./components/HashtagCard";
import { HashtagIcon } from "@heroicons/react/24/outline";
// import { Users } from "lucide-react";

const PAGE_SIZE = 10;

const HomePage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [postBody, setPostBody] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const { data, loading, error, fetchMore, networkStatus } = useQuery<{
    getPosts: PostType[];
  }>(GET_POSTS, {
    variables: { page: 1 },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: "cache-and-network",
  });

  const { data: usersData, error: usersError } = useQuery<{
    getUsers: UserType[];
  }>(GET_USERS, {
    variables: { page: 1 },
  });

  const { data: hashtagsData, error: hashtagsError } = useQuery<{
    getTrendingHashtags: HashtagType[];
  }>(GET_TRENDING_HASHTAGS, {
    variables: { limit: 10 },
  });

  const [createPost, { loading: createLoading }] = useMutation<
    { createPost: PostType },
    { body: string; file: File | null }
  >(CREATE_POST, {
    context: {
      headers: {
        "x-apollo-operation-name": "createPost",
      },
    },
    onError: (err) => {
      console.error("Error creating post:", err);
      toast.error(`Error adding post: ${err.message}`);
    },
    onCompleted: () => {
      setPostBody("");
      setFile(null);
      toast.success("Post added successfully!");
    },
    refetchQueries: [{ query: GET_POSTS, variables: { page: 1 } }],
  });

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (postBody.trim() === "" && file === null) {
      toast.error("Post content cannot be empty.");
      return;
    }

    try {
      await createPost({
        variables: {
          body: postBody,
          file: file,
        },
      });
    } catch (error) {
      toast.error(`Error adding post: ${(error as Error).message}`);
    }
  };

  // Infinite scroll to load more posts
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const { data: fetchMoreData } = await fetchMore({
        variables: { page: page + 1 },
      });

      if (fetchMoreData?.getPosts) {
        if (fetchMoreData.getPosts.length < PAGE_SIZE) {
          setHasMore(false);
        }
        setPage((prev) => prev + 1);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      toast.error(`Failed to load more posts: ${(error as Error).message}`);
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
        loadMorePosts();
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, page, hasMore, networkStatus, loadMorePosts]);

  if (networkStatus === NetworkStatus.loading)
    return <p className="mt-4 text-center">Loading...</p>;

  if (error || usersError)
    return (
      <p className="mt-4 text-center text-red-500">
        Error loading posts:{" "}
        {(error?.message ?? usersError?.message) || "Unknown error"}
      </p>
    );

  return (
    <div className="max-w-screen-3xl mx-auto flex w-full justify-center px-5 py-5 lg:justify-evenly lg:gap-4">
      <aside className="hidden w-full max-w-64 py-8 lg:flex">
        {hashtagsError && (
          <p className="mt-4 text-center text-red-500">
            Error loading hashtags: {hashtagsError.message}
          </p>
        )}

        {hashtagsData && (
          <div className="flex w-full flex-col items-center gap-5">
            <h1 className="text-3xl">Trending Hashtags</h1>
            {hashtagsData.getTrendingHashtags.map((hashtag) => (
              <HashTagCard hashtag={hashtag} key={hashtag.tag} />
            ))}
            <a
              href={`/project2/hashtag`}
              className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <HashtagIcon className="mr-2 h-5 w-5" aria-hidden="true" />
              <span>View All Hashtags</span>
            </a>
          </div>
        )}
      </aside>

      <main className="w-full max-w-xl">
        <form
          className="flex w-full items-center gap-2"
          onSubmit={handleAddPost}
        >
          <CreatePostField
            placeholder="What's on your mind?"
            value={postBody}
            setValue={setPostBody}
            file={file}
            setFile={setFile}
            loading={createLoading}
            className={
              (postBody || file) && user
                ? "bg-indigo-600 hover:bg-indigo-700"
                : "cursor-not-allowed bg-gray-400 dark:bg-gray-600"
            }
          />
        </form>

        <Divider />
        <div className="flex flex-col gap-4">
          {data?.getPosts.map((post) => <Post key={post.id} post={post} />)}
        </div>

        {!hasMore && (
          <p className="mt-4 justify-self-center text-gray-500 dark:text-gray-400">
            You've reached the end of the posts.
          </p>
        )}

        {!loading && data?.getPosts.length === 0 && (
          <p className="mt-4">No posts available.</p>
        )}
      </main>

      <aside className="hidden w-full max-w-64 py-8 lg:flex">
        <div className="flex w-full flex-col items-center gap-5">
          <h1 className="text-3xl">People to follow</h1>
          {usersData?.getUsers.map((recommendedUser) => (
            <a
              key={recommendedUser.id}
              href={`/project2/user/${recommendedUser.username}`}
              className="bg-white-100 flex w-full flex-col items-center gap-2 rounded-lg border px-2 py-6 shadow-lg hover:scale-105 dark:border-gray-700 dark:bg-gray-900/50"
            >
              <div className="flex w-fit flex-row items-center gap-2">
                <Avatar user={recommendedUser} noHref />
                <h1>{recommendedUser.username}</h1>
              </div>
              {user?.username !== recommendedUser.username && (
                <FollowButton targetUsername={recommendedUser.username} />
              )}
            </a>
          ))}
          {/* TODO make a search user page */}
          {/* <a
            href={`/project2/users`}
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Users className="mr-2 h-5 w-5" aria-hidden="true" />
            <span>View All Users</span>
          </a> */}
        </div>
      </aside>
    </div>
  );
};

export default HomePage;
