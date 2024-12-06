import { Linkify } from "@/components/Post/PostBody";
import CommentsView from "@/components/Profile/CommentsView";
import EditProfile from "@/components/Profile/EditProfile";
import FollowingUsersModal from "@/components/Profile/FollowingUsersModal";
import LikesView from "@/components/Profile/LikesView";
import MentionsView from "@/components/Profile/MentionsView";
import PostsView from "@/components/Profile/PostsView";
import ProfileSkeleton from "@/components/Skeletons/ProfileSkeleton";
import BackButton from "@/components/ui/BackButton";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/ToggleGroup";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import Avatar from "@/components/Users/Avatar";
import FollowButton from "@/components/Users/FollowButton";
import VerificationBadge from "@/components/Users/VerificationBadge";
import { useAuth } from "@/hooks/AuthContext";
import { UserType } from "@/lib/types";
import NotFound from "@/pages/NotFound";
import { DELETE_USER, GET_USER_QUERY } from "@/queries/user";
import { useLazyQuery, useMutation, useQuery } from "@apollo/client";
import { ChatBubbleLeftIcon } from "@heroicons/react/24/outline";
import {
  BookCheckIcon,
  EarthIcon,
  HeartIcon,
  UserIcon,
  Users2Icon,
  UsersIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
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

  const [currentView, setCurrentView] = useState<ViewState>(view ?? "posts");
  const username = paramUsername ?? loggedInUser?.username;

  useEffect(() => {
    document.title = `Y · @${username} / ${currentView.charAt(0).toUpperCase() + currentView.slice(1)}`;
  }, [username, currentView]);

  const [deleteUser, { loading: deleteLoading }] = useMutation(DELETE_USER, {
    variables: { username },
    onCompleted: () => {
      toast.success("User deleted successfully");
      window.location.href = "/project2/";
    },
    onError: (err) => {
      toast.error(`Error deleting user: ${err.message}`);
    },
  });

  const handleDelete = async () => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${loggedInUser?.username === username ? "your" : "this"} user?`,
    );
    if (!confirmDelete) return;

    try {
      await deleteUser();
    } catch (error) {
      toast.error(`Error deleting post: ${(error as Error).message}`);
    }
  };

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

  const [userMentions, setUserMentions] = useState<{
    [key: string]: UserType | null;
  }>({});
  const [fetchUser] = useLazyQuery<{ getUser: UserType }>(GET_USER_QUERY);

  useEffect(() => {
    const fetchUserMentions = async (mentions: string[]) => {
      const results = await Promise.all(
        mentions.map(async (mention) => {
          const { data } = await fetchUser({
            variables: { username: mention },
          });
          return { mention, user: data?.getUser };
        }),
      );
      const userMap: { [key: string]: UserType | null } = {};
      results.forEach(({ mention, user }) => {
        userMap[mention] = user ?? null;
      });
      setUserMentions(userMap);
    };

    const mentions = Array.from(
      new Set(user?.biography?.match(/@(\w+)/g)?.map((m) => m.slice(1)) || []),
    );
    fetchUserMentions(mentions);
  }, [user?.biography, fetchUser]);

  if (userLoading) return <ProfileSkeleton />;
  if (userError) return <p>Error loading user: {userError.message}</p>;
  if (!user) return <NotFound page="user" />;

  return (
    <div className="w-full px-2 sm:px-5">
      <BackButton />
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
        <div className="flex flex-col items-center">
          {/* User Profile Section */}
          <section className="mb-8 w-full max-w-5xl">
            {/* Background and Avatar */}
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
            {/* User Info */}
            <div className="mx-auto max-w-5xl">
              <div className="-mt-16 flex items-end space-x-5 px-1">
                <Avatar user={user} large />
                <div className="flex min-w-0 flex-1 items-center justify-end pb-1">
                  <div className="mt-6 hidden min-w-0 flex-1 flex-col md:flex">
                    <h1 className="flex items-center gap-2 truncate text-2xl font-bold text-gray-900 dark:text-white">
                      <span>
                        {user?.firstName
                          ? user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.firstName
                          : user.username}
                      </span>
                      <VerificationBadge verified={user.verified} />
                    </h1>
                    <div className="flex flex-row gap-2">
                      <p className="text-md text-gray-600 dark:text-gray-300">
                        @{user.username}
                      </p>
                      {loggedInUser?.username !== username && (
                        <FollowButton
                          disableTruncate
                          targetUsername={username || ""}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:mt-0">
                    {(user.username === "Mads" ||
                      user.username === "saraSlag") && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <a
                              href="http://it2810-33.idi.ntnu.no/project2"
                              className="hidden cursor-help hover:text-gray-600 dark:hover:text-gray-400 md:block"
                            >
                              <EarthIcon className="size-8" />
                            </a>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Where to next?</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                    {loggedInUser &&
                      username !== "admin" &&
                      (loggedInUser.username === username ||
                        loggedInUser.username === "admin") && (
                        <button
                          onClick={handleDelete}
                          disabled={deleteLoading}
                          className="transform rounded-md bg-gradient-to-r from-red-500 to-red-600 px-2 py-2 text-sm text-white transition duration-300 ease-in-out hover:-translate-y-1 hover:from-red-600 hover:to-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 dark:from-red-400 dark:to-red-500 dark:hover:from-red-500 dark:hover:to-red-600 sm:px-4 sm:text-base"
                        >
                          Delete User
                        </button>
                      )}
                    {loggedInUser && loggedInUser.username === username && (
                      <EditProfile user={user} />
                    )}
                  </div>
                </div>
              </div>
              {/* Mobile User Info */}
              <div className="mt-6 flex min-w-0 flex-1 justify-between px-1 md:hidden">
                <div>
                  <h1 className="truncate text-2xl font-bold text-gray-900 dark:text-white">
                    {user?.firstName
                      ? user.lastName
                        ? `${user.firstName} ${user.lastName}`
                        : user.firstName
                      : user.username}
                  </h1>
                  <div className="flex flex-row gap-2">
                    <p className="text-md text-gray-600">@{user.username}</p>
                    {loggedInUser?.username !== username && (
                      <FollowButton
                        disableTruncate
                        targetUsername={username || ""}
                      />
                    )}
                  </div>
                </div>
                {(user.username === "Mads" || user.username === "saraSlag") && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <a
                          href="http://it2810-33.idi.ntnu.no/project2"
                          className="cursor-help hover:text-gray-600 dark:hover:text-gray-400 md:hidden"
                        >
                          <EarthIcon className="size-8" />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Where to next?</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
              </div>
              {/* Followers and Following */}
              <div className="my-2 mt-4 rounded-lg bg-gray-100 p-1 shadow-lg transition-shadow duration-300 ease-in-out hover:shadow-xl dark:bg-gray-700 sm:p-4">
                <div className="flex flex-row items-center justify-around">
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
              {/* Biography */}
              {user.biography && (
                <div className="mb-8 mt-6 rounded-lg bg-white p-6 shadow dark:bg-gray-600">
                  <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-200">
                    Biography
                  </h2>
                  <p className="text-gray-600 dark:text-gray-200">
                    {Linkify(user?.biography, userMentions)}
                  </p>
                </div>
              )}
            </div>
          </section>
          {/* Toggle Group for Views */}
          <section className="w-full max-w-5xl">
            <ToggleGroup
              value={currentView}
              onValueChange={(value: ViewState) => {
                if (value) {
                  handleViewChange(value);
                }
              }}
              type="single"
              variant="outline"
              className="flex w-full items-center justify-evenly gap-2"
            >
              <ToggleGroupItem
                value="posts"
                aria-label="View Posts"
                className="w-full gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base"
              >
                <BookCheckIcon className="hidden size-4 sm:block md:size-6" />
                <span className="flex items-center gap-1">
                  <p className="hidden sm:block">
                    {user?.postIds.length + user.repostedPostIds.length}
                  </p>
                  <p>
                    {user?.postIds.length + user.repostedPostIds.length === 1
                      ? "Post"
                      : "Posts"}
                  </p>
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="comments"
                aria-label="View Comments"
                className="w-full gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base"
              >
                <ChatBubbleLeftIcon className="hidden size-4 sm:block md:size-6" />
                <span className="flex gap-1">
                  <p className="hidden sm:block">{user?.commentIds.length}</p>
                  <p>
                    {user?.commentIds.length === 1 ? "Comment" : "Comments"}
                  </p>
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="mentions"
                aria-label="View Mentions"
                className="w-full gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base"
              >
                <Users2Icon className="hidden size-4 sm:block md:size-6" />
                <span className="flex gap-1">
                  <p className="hidden sm:block">
                    {user?.mentionedPostIds.length +
                      user.mentionedCommentIds.length}
                  </p>
                  <p>
                    {user?.mentionedPostIds.length +
                      user.mentionedCommentIds.length ===
                    1
                      ? "Mention"
                      : "Mentions"}
                  </p>
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem
                value="likes"
                aria-label="View Likes"
                className="w-full gap-1 p-1 text-center text-xs sm:p-2 sm:text-sm md:p-5 md:text-base"
              >
                <HeartIcon className="hidden size-4 sm:block md:size-6" />
                <span className="flex gap-1">
                  <p className="hidden sm:block">
                    {user?.likedPostIds.length + user.likedCommentIds.length}
                  </p>
                  <p>
                    {user?.likedPostIds.length + user.likedCommentIds.length ===
                    1
                      ? "Like"
                      : "Likes"}
                  </p>
                </span>
              </ToggleGroupItem>
            </ToggleGroup>
            <div className="mt-4 flex w-full flex-col items-center">
              {currentView === "posts" && (
                <PostsView
                  postIds={user.postIds}
                  fetchReposts={user.repostedPostIds.length > 0}
                  username={user.username}
                />
              )}
              {currentView === "comments" && (
                <CommentsView commentIds={user.commentIds} />
              )}
              {currentView === "mentions" && (
                <MentionsView
                  mentionedPostIds={user.mentionedPostIds}
                  mentionedCommentIds={user.mentionedCommentIds}
                />
              )}
              {currentView === "likes" && (
                <LikesView
                  likedPostIds={user.likedPostIds}
                  likedCommentIds={user.likedCommentIds}
                />
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
          />
        </div>
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
