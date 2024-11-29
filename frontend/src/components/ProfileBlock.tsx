import FollowButton from "@/components/FollowButton";
import Username from "@/components/Username";
import { UserType } from "@/lib/types";

const ProfileBlock = ({ user }: { user: UserType }) => (
  <a
    key={user.id}
    href={`/project2/user/${user.username}`}
    className="flex w-full justify-between bg-gray-100 py-3 px-2 transition-colors hover:bg-gray-200 dark:bg-gray-900/50"
  >
    <Username vertical user={user} noHref />
    <FollowButton targetUsername={user.username} />
  </a>
);

export default ProfileBlock;
