import Avatar from "@/components/Profile/Avatar";
import { UserType } from "@/lib/types";
import CoverPhoto from "/coverphoto.jpg";

const ProfilePreview = ({ user }: { user: UserType }) => (
  <a
    href={`/project2/user/${user.username}`}
    onClick={(e) => {
      e.stopPropagation();
    }}
    className="flex w-fit min-w-32 flex-col items-center justify-between"
  >
    <div
      style={{
        backgroundImage: `url('${user.backgroundPicture || CoverPhoto}')`,
        backgroundSize: "100% 60%",
        backgroundPosition: "center top",
      }}
      className="flex h-12 w-full items-center justify-center bg-cover bg-no-repeat"
    >
      <Avatar noHref user={user} />
    </div>
    <div className="flex h-full flex-col items-center justify-center gap-1 p-2 pt-0">
      <h2 className="text-lg">
        {user?.firstName} {user?.lastName}
      </h2>
      <p className="text-md break-words font-mono">
        <span className="font-sans">@</span>
        {user.username}
      </p>
    </div>
  </a>
);

export default ProfilePreview;
