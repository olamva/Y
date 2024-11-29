import FollowButton from "@/components/FollowButton";
import Username from "@/components/Username";
import { UserType } from "@/lib/types";

const ProfileBlock = ({ user }: { user: UserType }) => (
  <a
    key={user.id}
    href={`/project2/user/${user.username}`}
    className="flex w-full justify-between bg-gray-100 h-[4.25rem] py-3 px-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-900"
  >
    <Username vertical user={user} smallBadge noHref />
    <FollowButton targetUsername={user.username} />
  </a>
);

export default ProfileBlock;
