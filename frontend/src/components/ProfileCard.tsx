import Avatar from "@/components/Profile/Avatar";
import { UserType } from "@/lib/types";
import CoverPhoto from "/coverphoto.jpg";

interface Props {
  user: UserType;
  large?: boolean;
}

const ProfileCard = ({ user, large }: Props) => {
  if (large) {
    return (
      <a
        style={{
          backgroundImage: `url('${user.backgroundPicture || CoverPhoto}')`,
          backgroundSize: "100% 50%",
          backgroundPosition: "center top",
        }}
        href={`/project2/user/${user.username}`}
        className="flex h-64 w-full flex-col items-center justify-center rounded-lg border border-gray-400 bg-zinc-200 bg-cover bg-no-repeat shadow-xl hover:opacity-80 dark:border-gray-600 dark:bg-zinc-800"
      >
        <div className="flex flex-col items-center gap-2">
          <div className="flex-shrink-0">
            <Avatar noHref user={user} large={true} />
          </div>
          <div className="flex-grow">
            <h2 className="text-2xl font-bold">{user.username}</h2>
          </div>
        </div>
      </a>
    );
  }

  return (
    <a
      href={`/project2/user/${user.username}`}
      className="mx-2 my-2 w-full max-w-sm overflow-hidden rounded-lg border-gray-300 shadow-lg hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
    >
      <div className="flex flex-col items-center gap-2 p-6">
        <div className="flex-shrink-0">
          <Avatar noHref user={user} />
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
