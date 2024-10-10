const Avatar = ({ username }: { username: string }) => (
  <figure>
    <a
      href={`/project2/user/${username}`}
      className="flex size-8 select-none items-center justify-center rounded-full border border-zinc-300 bg-zinc-200 text-center dark:border-zinc-700 dark:bg-zinc-900"
    >
      <p>{username[0].toUpperCase()}</p>
    </a>
  </figure>
);

export default Avatar;
