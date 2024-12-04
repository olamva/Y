import FollowButton from "@/components/Users/FollowButton";
import Username from "@/components/Users/Username";
import { UserType } from "@/lib/types";

const ProfileBlock = ({ user }: { user: UserType }) => (
  <a
    key={user.id}
    href={`/project2/user/${user.username}`}
    className="flex h-[3.75rem] w-full justify-between bg-gray-100 px-2 py-3 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-900 xl:h-[4.25rem]"
  >
    <Username noPreview vertical user={user} smallBadge noHref />
    <FollowButton targetUsername={user.username} />
  </a>
);

export default ProfileBlock;
