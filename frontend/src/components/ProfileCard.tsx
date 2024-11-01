import Avatar from "@/components/Avatar";
import { UserType } from "@/lib/types";

const ProfileCard = ({ user }: { user: UserType }) => {
  return (
    <a
      href={`/project2/user/${user.username}`}
      className="mx-2 my-2 w-full max-w-sm overflow-hidden rounded-lg border border-gray-300 shadow-lg hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
    >
      <div className="flex flex-col items-center gap-2 p-6">
        <div className="flex-shrink-0">
          <Avatar username={user.username} />
        </div>
        <div className="flex-grow">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            @{user.username}
          </h2>
        </div>
      </div>
    </a>
  );
};

export default ProfileCard;
