import Avatar from "@/components/Profile/Avatar";
import { UserType } from "@/lib/types";
import FollowButton from "./FollowButton";
import { useAuth } from "./AuthContext";

const ProfileCard = ({ user }: { user: UserType }) => {
  const { user: currentUser } = useAuth();

  return (
    <a
      key={user.id}
      href={`/project2/user/${user.username}`}
      className="bg-white-100 flex w-full flex-col items-center gap-2 rounded-lg border px-2 py-6 shadow-lg hover:scale-105 dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="flex w-fit flex-row items-center gap-2">
        <Avatar user={user} noHref />
        <h1>{user.username}</h1>
      </div>
      {user?.username !== currentUser?.username && (
        <FollowButton targetUsername={user.username} />
      )}
    </a>
  );
};

export default ProfileCard;
