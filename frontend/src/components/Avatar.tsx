interface AvatarProps {
  username: string;
  large: boolean;
  navbar?: boolean;
}
const Avatar = ({ username, large, navbar }: AvatarProps) => (
  <figure>
    <a
      href={`/project2/user${navbar ? "" : "/" + username}`}
      className={`flex select-none items-center justify-center rounded-full border border-neutral-400 bg-neutral-300 text-center text-gray-900 transition-all hover:scale-105 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white ${large ? "size-24 md:size-36" : "size-8"}`}
    >
      <p className={large ? "text-4xl md:text-7xl" : ""}>
        {username[0].toUpperCase()}
      </p>
    </a>
  </figure>
);

export default Avatar;
