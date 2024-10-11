const Avatar = ({ username }: { username: string }) => (
  <figure>
    <a
      href={`/project2/user/${username}`}
      className="flex size-8 select-none items-center justify-center rounded-full border border-neutral-50 bg-neutral-300 text-center text-gray-900 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
    >
      <p>{username[0].toUpperCase()}</p>
    </a>
  </figure>
);

export default Avatar;
