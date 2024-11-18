import { useAuth } from "@/components/AuthContext";
import BackButton from "@/components/BackButton";
import FollowButton from "@/components/FollowButton";
import FollowingUsersModal from "@/components/FollowingUsersModal";
import Post from "@/components/Post/Post";
import PostWithReply from "@/components/Post/PostWithReply";
import Avatar from "@/components/Profile/Avatar";
import EditProfile from "@/components/Profile/EditProfile";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import { CommentType, PostType, UserType } from "@/lib/types";
import { GET_COMMENTS_BY_IDS } from "@/queries/comments";
import { GET_PARENTS_BY_IDS, GET_POSTS_BY_IDS } from "@/queries/posts";
import { GET_USER_QUERY } from "@/queries/user";
import { useQuery } from "@apollo/client";
import { UserIcon, UsersIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CoverPhoto from "/coverphoto.jpg";

type ViewState = "posts" | "comments" | "mentions" | "likes";

const Profile = () => {
  const { username: paramUsername, view } = useParams<{
    username: string;
    view: ViewState;
  }>();
  const { user: loggedInUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [modalContent, setModalContent] = useState<{ title: string } | null>(
    null,
  );

  const [postsPage, setPostsPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [likesPage, setLikesPage] = useState(1);
  const [mentionsPage, setMentionsPage] = useState(1);

  const [currentView, setCurrentView] = useState<ViewState>(view ?? "posts");

  const handleViewChange = (value: ViewState) => {
    setCurrentView(value);
    navigate(
      location.pathname.replace(/\/(posts|comments|mentions|likes)$/, "") +
        (value === "posts" ? "" : `/${value}`),
    );
  };

  const openModal = (title: string) => {
    setModalContent({ title });
  };

  const closeModal = () => {
    setModalContent(null);
  };

  const username = paramUsername ?? loggedInUser?.username;
  const BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL || "http://localhost:3001";

  if (!paramUsername && username) {
    window.location.href = `/project2/user/${username}`;
  }

  const {
    data: userData,
    loading: userLoading,
    error: userError,
  } = useQuery(GET_USER_QUERY, {
    variables: { username },
    skip: !username,
  });

  const user: UserType | undefined = userData?.getUser;

  const {
    data: postsData,
    loading: postsLoading,
    fetchMore: fetchMorePosts,
  } = useQuery<{
    getPostsByIds: PostType[];
  }>(GET_POSTS_BY_IDS, {
    variables: { ids: user?.postIds || [], page: postsPage },
    skip: !user || !user.postIds.length,
  });

  const posts: PostType[] = postsData?.getPostsByIds || [];

  const {
    data: commentsData,
    loading: commentsLoading,
    fetchMore: fetchMoreComments,
  } = useQuery<{
    getCommentsByIds: CommentType[];
  }>(GET_COMMENTS_BY_IDS, {
    variables: { ids: user?.commentIds || [], page: commentsPage },
    skip: !user || !user.commentIds.length,
  });

  const comments: CommentType[] = commentsData?.getCommentsByIds || [];

  const {
    data: likedPostsData,
    loading: likedPostsLoading,
    fetchMore: fetchMoreLikedPosts,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: user?.likedPostIds || [], page: likesPage },
    skip: !user || !user.likedPostIds.length,
  });

  const likedPosts: PostType[] = likedPostsData?.getPostsByIds || [];

  const {
    data: likedCommentsData,
    loading: likedCommentsLoading,
    fetchMore: fetchMoreLikedComments,
  } = useQuery(GET_COMMENTS_BY_IDS, {
    variables: { ids: user?.likedCommentIds || [], page: likesPage },
    skip: !user || !user.likedCommentIds.length,
  });

  const likedComments: CommentType[] =
    likedCommentsData?.getCommentsByIds || [];

  const likedContent: (PostType | CommentType)[] = [
    ...likedPosts,
    ...likedComments,
  ].sort(
    (a, b) =>
      new Date(parseInt(b.createdAt)).getTime() -
      new Date(parseInt(a.createdAt)).getTime(),
  );
  const {
    data: mentionedPostsData,
    loading: mentionedPostsLoading,
    fetchMore: fetchMoreMentionedPosts,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: user?.mentionedPostIds || [], page: mentionsPage },
    skip: !user || !user.mentionedPostIds.length,
  });

  const mentionedPosts: PostType[] = mentionedPostsData?.getPostsByIds || [];
  const {
    data: mentionedCommentsData,
    loading: mentionedCommentsLoading,
    fetchMore: fetchMoreMentionedComments,
  } = useQuery(GET_COMMENTS_BY_IDS, {
    variables: {
      ids: user?.mentionedCommentIds || [],
      page: mentionsPage,
    },
    skip: !user || !user.mentionedCommentIds.length,
  });

  const mentionedComments: CommentType[] =
    mentionedCommentsData?.getCommentsByIds || [];
  const mentionedContent: (PostType | CommentType)[] = [
    ...mentionedPosts,
    ...mentionedComments,
  ].sort(
    (a, b) =>
      new Date(parseInt(b.createdAt)).getTime() -
      new Date(parseInt(a.createdAt)).getTime(),
  );
  const parents = comments.map((comment) => ({
    id: comment.parentID,
    type: comment.parentType,
  }));

  const { data: parentPostsData } = useQuery<{
    getParentsByIds: (PostType | CommentType)[];
  }>(GET_PARENTS_BY_IDS, {
    variables: { parents, page: commentsPage },
    skip: !parents.length,
  });

  const parentPosts: (PostType | CommentType)[] =
    parentPostsData?.getParentsByIds ?? [];
  const likedParents = likedComments.map((comment) => ({
    id: comment.parentID,
    type: comment.parentType,
  }));

  const { data: likedParentsData } = useQuery<{
    getParentsByIds: (PostType | CommentType)[];
  }>(GET_PARENTS_BY_IDS, {
    variables: { parents: likedParents, page: likesPage },
    skip: !likedParents.length,
  });

  const likedParentPosts: (PostType | CommentType)[] =
    likedParentsData?.getParentsByIds ?? [];
  const mentionedParents = mentionedComments.map((comment) => ({
    id: comment.parentID,
    type: comment.parentType,
  }));

  const { data: mentionedParentsData } = useQuery<{
    getParentsByIds: (PostType | CommentType)[];
  }>(GET_PARENTS_BY_IDS, {
    variables: { parents: mentionedParents, page: mentionsPage },
    skip: !mentionedParents.length,
  });

  const mentionedParentPosts: (PostType | CommentType)[] =
    mentionedParentsData?.getParentsByIds ?? [];
  const loadMorePosts = () => {
    if (postsLoading || !postsData?.getPostsByIds.length) return;
    fetchMorePosts({
      variables: { page: postsPage + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        setPostsPage(postsPage + 1);
        return {
          getPostsByIds: [
            ...prev.getPostsByIds,
            ...fetchMoreResult.getPostsByIds,
          ],
        };
      },
    });
  };

  const loadMoreComments = () => {
    if (commentsLoading || !commentsData?.getCommentsByIds.length) return;
    fetchMoreComments({
      variables: { page: commentsPage + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        setCommentsPage(commentsPage + 1);
        return {
          getCommentsByIds: [
            ...prev.getCommentsByIds,
            ...fetchMoreResult.getCommentsByIds,
          ],
        };
      },
    });
  };

  const loadMoreLikes = () => {
    if (
      likedPostsLoading ||
      likedCommentsLoading ||
      (!likedPostsData?.getPostsByIds.length &&
        !likedCommentsData?.getCommentsByIds.length)
    )
      return;

    fetchMoreLikedPosts({
      variables: { page: likesPage + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        setLikesPage(likesPage + 1);
        return {
          getPostsByIds: [
            ...prev.getPostsByIds,
            ...fetchMoreResult.getPostsByIds,
          ],
        };
      },
    });

    fetchMoreLikedComments({
      variables: { page: likesPage + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          getCommentsByIds: [
            ...prev.getCommentsByIds,
            ...fetchMoreResult.getCommentsByIds,
          ],
        };
      },
    });
  };

  const loadMoreMentions = () => {
    if (
      mentionedPostsLoading ||
      mentionedCommentsLoading ||
      (!mentionedPostsData?.getPostsByIds.length &&
        !mentionedCommentsData?.getCommentsByIds.length)
    )
      return;

    fetchMoreMentionedPosts({
      variables: { page: mentionsPage + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        setMentionsPage(mentionsPage + 1);
        return {
          getPostsByIds: [
            ...prev.getPostsByIds,
            ...fetchMoreResult.getPostsByIds,
          ],
        };
      },
    });

    fetchMoreMentionedComments({
      variables: { page: mentionsPage + 1 },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult) return prev;
        return {
          getCommentsByIds: [
            ...prev.getCommentsByIds,
            ...fetchMoreResult.getCommentsByIds,
          ],
        };
      },
    });
  };
  const handleScroll = () => {
    const { scrollHeight, scrollTop, clientHeight } = document.documentElement;
    if (scrollHeight - scrollTop === clientHeight) {
      if (currentView === "posts") {
        loadMorePosts();
      } else if (currentView === "comments") {
        loadMoreComments();
      } else if (currentView === "likes") {
        loadMoreLikes();
      } else if (currentView === "mentions") {
        loadMoreMentions();
      }
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [currentView]);

  if (userLoading) return <p>Loading user...</p>;
  if (userError) return <p>Error loading user: {userError.message}</p>;
  if (!user) return <p>User not found.</p>;

  return (
    <div className="w-full px-5">
      <BackButton overrideRedirect="/project2/" />
      {loggedInUser && loggedInUser.username === username && (
        <div className="mb-8 pt-5 text-center">
          <h2 className="mt-2 break-words text-3xl font-bold">
            Welcome,{" "}
            {loggedInUser.firstName
              ? loggedInUser.firstName
              : loggedInUser.username}
          </h2>
        </div>
      )}
      {username ? (
        <>
          <section className="mb-8">
            <div className="relative h-64 md:h-96">
              <img
                src={
                  user.backgroundPicture
                    ? `${BACKEND_URL}${user.backgroundPicture}`
                    : CoverPhoto
                }
                alt="Background"
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="mx-auto max-w-5xl">
              <div className="relative -mt-12 sm:-mt-16 sm:flex sm:items-end sm:space-x-5">
                <Avatar user={user} large={true} />
                <div className="mt-6 sm:flex sm:min-w-0 sm:flex-1 sm:items-center sm:justify-end sm:space-x-6 sm:pb-1">
                  <div className="mt-6 hidden min-w-0 flex-1 flex-col md:flex">
                    <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
                      {user?.firstName} {user?.lastName}
                    </h1>
                    <div className="flex flex-row gap-2">
                      <p className="text-md text-gray-500">@{user.username}</p>
                      {loggedInUser?.username !== username && (
                        <FollowButton targetUsername={username || ""} />
                      )}
                    </div>
                  </div>
                  {loggedInUser && loggedInUser.username === username && (
                    <EditProfile user={user} />
                  )}
                </div>
              </div>
              <div className="mt-6 min-w-0 flex-1 sm:block md:hidden">
                <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </h1>
                <div className="flex flex-row gap-2">
                  <p className="text-md text-gray-500">@{user.username}</p>
                  {loggedInUser?.username !== username && (
                    <FollowButton targetUsername={username || ""} />
                  )}
                </div>
              </div>
              <div className="my-2 mt-4 rounded-lg bg-gray-100 p-4 shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl dark:bg-gray-700">
                <div className="flex flex-col items-center justify-around sm:flex-row">
                  <button
                    onClick={() => openModal("Followers")}
                    className="flex items-center space-x-2 rounded p-2 transition-colors duration-200 hover:bg-gray-400 hover:bg-opacity-20"
                    aria-label={`View ${user?.followers.length} followers`}
                  >
                    <UserIcon className="h-5 w-5" />
                    <span className="text-lg font-semibold">
                      {user?.followers.length}
                    </span>
                    <span className="text-sm">Followers</span>
                  </button>

                  <button
                    onClick={() => openModal("Following")}
                    className="flex items-center space-x-2 rounded p-2 transition-colors duration-200 hover:bg-gray-400 hover:bg-opacity-20"
                    aria-label={`View ${user?.following.length} following`}
                  >
                    <UsersIcon className="h-5 w-5" />
                    <span className="text-lg font-semibold">
                      {user?.following.length}
                    </span>
                    <span className="text-sm">Following</span>
                  </button>
                </div>
              </div>
              <div className="mb-8 mt-6 rounded-lg bg-white p-6 shadow dark:bg-gray-600">
                <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-200">
                  Biography
                </h2>
                <p className="text-gray-600 dark:text-gray-200">
                  {user?.biography}
                </p>
              </div>
            </div>
          </section>
          <section className="w-full max-w-5xl justify-self-center">
            <ToggleGroup
              value={currentView}
              onValueChange={(value: ViewState) => {
                if (value) {
                  handleViewChange(value);
                }
              }}
              type="single"
              variant="outline"
              className="grid grid-cols-2 gap-2 p-2 md:grid-cols-4"
            >
              <ToggleGroupItem
                value="posts"
                aria-label="View Posts"
                className="text-center"
              >
                <p>{user?.postIds.length} Posts</p>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="comments"
                aria-label="View Comments"
                className="text-center"
              >
                <p>{user?.commentIds.length} Comments</p>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="mentions"
                aria-label="View Mentions"
                className="text-center"
              >
                <p>
                  {user?.mentionedPostIds.length +
                    user.mentionedCommentIds.length}{" "}
                  Mentions
                </p>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="likes"
                aria-label="View Likes"
                className="text-center"
              >
                <p>
                  {user?.likedPostIds.length + user.likedCommentIds.length}{" "}
                  Likes
                </p>
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="mt-4 flex w-full flex-col items-center">
              {currentView === "posts" && (
                <>
                  {posts.map((post) => (
                    <Post post={post} key={post.id} />
                  ))}
                  {postsLoading && <p>Loading more posts...</p>}
                </>
              )}
              {currentView === "comments" && (
                <>
                  {comments.map((comment) => (
                    <PostWithReply
                      key={comment.id}
                      post={parentPosts.find(
                        (post) => post.id === comment.parentID,
                      )}
                      reply={comment}
                    />
                  ))}
                  {commentsLoading && <p>Loading more comments...</p>}
                </>
              )}
              {currentView === "mentions" && (
                <>
                  {mentionedContent.map((item) =>
                    item.__typename === "Post" ? (
                      <Post post={item} key={item.id} />
                    ) : (
                      <PostWithReply
                        key={item.id}
                        post={mentionedParentPosts.find(
                          (parent) => parent.id === item.parentID,
                        )}
                        reply={item}
                      />
                    ),
                  )}
                  {(mentionedPostsLoading || mentionedCommentsLoading) && (
                    <p>Loading more mentions...</p>
                  )}
                </>
              )}
              {currentView === "likes" && (
                <>
                  {likedContent.map((item) =>
                    item.__typename === "Post" ? (
                      <Post post={item} key={item.id} />
                    ) : (
                      <PostWithReply
                        key={item.id}
                        post={likedParentPosts.find(
                          (parent) => parent.id === item.parentID,
                        )}
                        reply={item}
                      />
                    ),
                  )}
                  {(likedPostsLoading || likedCommentsLoading) && (
                    <p>Loading more likes...</p>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Followers and Following Modal */}
          <FollowingUsersModal
            isOpen={!!modalContent}
            onClose={closeModal}
            title={modalContent?.title || ""}
            users={
              modalContent?.title === "Followers"
                ? (user?.followers ?? [])
                : modalContent?.title === "Following"
                  ? (user?.following ?? [])
                  : []
            }
          />
        </>
      ) : (
        <div className="flex w-full flex-col items-center gap-4">
          <h1 className="text-4xl">You are not logged in</h1>
          <button
            onClick={() => {
              window.location.href = "/project2/login";
            }}
            className="rounded-md bg-green-500 px-6 py-4 text-xl font-semibold text-white hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700"
          >
            Log in
          </button>
        </div>
      )}
    </div>
  );
};

export default Profile;
