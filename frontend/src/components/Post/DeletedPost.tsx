import { AlertTriangleIcon } from "lucide-react";

const DeletedPost = () => (
  <article className="mt-2 flex w-full max-w-xl gap-2 rounded-md border-2 border-zinc-200/80 bg-zinc-200 px-4 py-8 text-black shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-white">
    <AlertTriangleIcon className="text-red-700 dark:text-red-500" />
    <p>Original post was deleted by the author.</p>
  </article>
);

export default DeletedPost;
