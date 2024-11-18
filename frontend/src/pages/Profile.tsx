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
import { useState } from "react";
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
  const [modalContent, setModalContent] = useState<{
    title: string;
  } | null>(null);

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

  const location = useLocation();

  const [currentView, setCurrentView] = useState<ViewState>(view ?? "posts");

  const handleViewChange = (value: ViewState) => {
    setCurrentView(value);
    navigate(
      location.pathname.replace(/\/(posts|comments|mentions|likes)$/, "") +
        (value === "posts" ? "" : `/${value}`),
    );
  };

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
    error: postsError,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: user?.postIds || [] },
    skip: !user || !user.postIds.length,
  });

  const posts: PostType[] = postsData?.getPostsByIds || [];

  const {
    data: likedPostsData,
    loading: likedPostsLoading,
    error: likedPostsError,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: user?.likedPostIds || [] },
    skip: !user || !user.likedPostIds.length,
  });

  const likedPosts: PostType[] = likedPostsData?.getPostsByIds || [];

  const {
    data: likedCommentsData,
    loading: likedCommentsLoading,
    error: likedCommentsError,
  } = useQuery(GET_COMMENTS_BY_IDS, {
    variables: { ids: user?.likedCommentIds || [] },
    skip: !user || !user.likedCommentIds.length,
  });

  const likedComments: CommentType[] =
    likedCommentsData?.getCommentsByIds || [];

  const likedContent: (PostType | CommentType)[] = [
    ...likedPosts,
    ...likedComments,
  ].sort((a, b) => {
    return (
      new Date(parseInt(b.createdAt)).getTime() -
      new Date(parseInt(a.createdAt)).getTime()
    );
  });

  const {
    data: likedParentsData,
    loading: likedParentsLoading,
    error: likedParentsError,
  } = useQuery<{ getParentsByIds: (PostType | CommentType)[] }>(
    GET_PARENTS_BY_IDS,
    {
      variables: {
        parents: likedComments.map((comment) => ({
          id: comment.parentID,
          type: comment.parentType,
        })),
      },
      skip: !likedComments.length,
    },
  );

  const likedParentPosts: (PostType | CommentType)[] =
    likedParentsData?.getParentsByIds ?? [];

  const {
    data: commentsData,
    loading: commentsLoading,
    error: commentsError,
  } = useQuery(GET_COMMENTS_BY_IDS, {
    variables: { ids: user?.commentIds || [] },
    skip: !user || !user.commentIds.length,
  });

  const comments: CommentType[] = commentsData?.getCommentsByIds || [];

  const parents = comments.map((comment) => ({
    id: comment.parentID,
    type: comment.parentType,
  }));

  const {
    data: parentPostsData,
    loading: parentPostsLoading,
    error: parentPostsError,
  } = useQuery<{ getParentsByIds: (PostType | CommentType)[] }>(
    GET_PARENTS_BY_IDS,
    {
      variables: { parents: parents },
      skip: !parents.length,
    },
  );

  const parentPosts: (PostType | CommentType)[] =
    parentPostsData?.getParentsByIds ?? [];

  const {
    data: mentionedPostsData,
    loading: mentionedPostsLoading,
    error: mentionedPostsError,
  } = useQuery(GET_POSTS_BY_IDS, {
    variables: { ids: user?.mentionedPostIds || [] },
    skip: !user || !user.mentionedPostIds.length,
  });

  const mentionedPosts: PostType[] = mentionedPostsData?.getPostsByIds || [];

  const {
    data: mentionedCommentsData,
    loading: mentionedCommentsLoading,
    error: mentionedCommentsError,
  } = useQuery(GET_COMMENTS_BY_IDS, {
    variables: { ids: user?.mentionedCommentIds || [] },
    skip: !user || !user.mentionedCommentIds.length,
  });

  const mentionedComments: CommentType[] =
    mentionedCommentsData?.getCommentsByIds || [];

  const mentionedContent: (PostType | CommentType)[] = [
    ...mentionedPosts,
    ...mentionedComments,
  ].sort((a, b) => {
    return (
      new Date(parseInt(b.createdAt)).getTime() -
      new Date(parseInt(a.createdAt)).getTime()
    );
  });

  const {
    data: mentionedParentsData,
    loading: mentionedParentsLoading,
    error: mentionedParentsError,
  } = useQuery<{ getParentsByIds: (PostType | CommentType)[] }>(
    GET_PARENTS_BY_IDS,
    {
      variables: {
        parents: mentionedComments.map((comment) => ({
          id: comment.parentID,
          type: comment.parentType,
        })),
      },
      skip: !mentionedComments.length,
    },
  );

  const mentionedParentPosts: (PostType | CommentType)[] =
    mentionedParentsData?.getParentsByIds ?? [];

  console.log(mentionedParentPosts, likedParentPosts);

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

          <section>
            <div className="mb-8 rounded-lg bg-gray-100 p-4 shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl dark:bg-gray-700">
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
            <ToggleGroup
              value={currentView}
              onValueChange={(value: ViewState) => handleViewChange(value)}
              type="single"
              variant="outline"
              className="grid grid-cols-2 gap-2 p-2"
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
                  {postsLoading && <p>Loading posts...</p>}
                  {postsError && (
                    <p>Error loading posts: {postsError.message}</p>
                  )}
                  {posts.map((post) => (
                    <Post post={post} key={post.id} />
                  ))}
                  {!postsLoading && posts.length === 0 && (
                    <p>No posts to display.</p>
                  )}
                </>
              )}
              {currentView === "comments" && (
                <>
                  {(commentsLoading || parentPostsLoading) && (
                    <p>Loading comments...</p>
                  )}
                  {commentsError && (
                    <p>Error loading comments: {commentsError.message}</p>
                  )}
                  {parentPostsError && (
                    <p>
                      Error loading parent posts: {parentPostsError.message}
                    </p>
                  )}
                  <div className="flex w-full flex-col gap-6">
                    {comments.map((comment) => (
                      <PostWithReply
                        key={comment.id}
                        post={parentPosts.find(
                          (post) => post.id === comment.parentID,
                        )}
                        reply={comment}
                      />
                    ))}
                  </div>
                  {!commentsLoading && comments.length === 0 && (
                    <p>No comments to display.</p>
                  )}
                </>
              )}
              {currentView === "mentions" && (
                <>
                  {(mentionedPostsLoading ||
                    mentionedCommentsLoading ||
                    mentionedParentsLoading) && <p>Loading liked posts...</p>}
                  {(mentionedPostsError ||
                    mentionedCommentsError ||
                    mentionedParentsError) && (
                    <p>
                      Error loading mentions:{" "}
                      {mentionedPostsError?.message ||
                        mentionedCommentsError?.message ||
                        mentionedParentsError?.message}
                    </p>
                  )}
                  {mentionedContent
                    .filter(
                      (post) =>
                        !mentionedParentPosts.some(
                          (parent) => parent.id === post.id,
                        ),
                    )
                    .map((post) =>
                      post.__typename === "Post" ? (
                        <Post post={post} key={post.id} />
                      ) : (
                        <PostWithReply
                          post={mentionedParentPosts.find(
                            (parent) => parent.id === post.parentID,
                          )}
                          reply={post}
                          key={post.id}
                        />
                      ),
                    )}
                  {!mentionedPostsLoading &&
                    !mentionedCommentsLoading &&
                    mentionedContent.length === 0 && (
                      <p>No mentions to display.</p>
                    )}
                </>
              )}
              {currentView === "likes" && (
                <>
                  {(likedPostsLoading ||
                    likedCommentsLoading ||
                    likedParentsLoading) && <p>Loading liked posts...</p>}
                  {(likedPostsError ||
                    likedCommentsError ||
                    likedParentsError) && (
                    <p>
                      Error loading liked posts:{" "}
                      {likedPostsError?.message ||
                        likedCommentsError?.message ||
                        likedParentsError?.message}
                    </p>
                  )}
                  {likedContent
                    .filter(
                      (post) =>
                        !likedParentPosts.some(
                          (parent) => parent.id === post.id,
                        ),
                    )
                    .map((post) =>
                      post.__typename === "Post" ? (
                        <Post post={post} key={post.id} />
                      ) : (
                        <PostWithReply
                          post={likedParentPosts.find(
                            (parent) => parent.id === post.parentID,
                          )}
                          reply={post}
                          key={post.id}
                        />
                      ),
                    )}
                  {!likedPostsLoading &&
                    !likedCommentsLoading &&
                    likedContent.length === 0 && (
                      <p>No liked posts to display.</p>
                    )}
                </>
              )}
            </div>
          </section>
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
          ></FollowingUsersModal>
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
