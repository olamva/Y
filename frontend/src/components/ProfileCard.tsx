import { UserType } from "@/lib/types";
import Avatar from "./Avatar";

const ProfileCard = ({ user }: { user: UserType }) => {
  return (
    <a
      href={`/project2/user/${user.username}`}
      className="darK:text-white mx-2 my-2 w-full overflow-hidden rounded-lg border border-gray-300 shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="flex items-center space-x-6 p-6">
        <div className="flex-shrink-0">
          <Avatar username={user.username} />
        </div>
        <div className="flex-grow">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
            {user.username}
          </h2>
        </div>
      </div>
    </a>
  );
};

export default ProfileCard;
