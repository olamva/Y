const Avatar = ({ username }: { username: string }) => (
  <figure>
    <a
      href="/"
      className="flex size-8 select-none items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-center"
    >
      <p>{username[0].toUpperCase()}</p>
    </a>
  </figure>
);

export default Avatar;
