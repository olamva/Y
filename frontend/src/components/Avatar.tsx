interface AvatarProps {
  username: string;
  navbar?: boolean;
}
const Avatar = ({ username, navbar }: AvatarProps) => (
  <figure>
    <a
      href={`/project2/user${navbar ? "" : "/" + username}`}
      className="flex size-8 select-none items-center justify-center rounded-full border border-neutral-400 bg-neutral-300 text-center text-gray-900 transition-all hover:scale-105 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
    >
      <p>{username[0].toUpperCase()}</p>
    </a>
  </figure>
);

export default Avatar;
