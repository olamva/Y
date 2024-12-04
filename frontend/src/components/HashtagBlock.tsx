import { HashtagType } from "@/lib/types";

const HashtagBlock = ({ hashtag }: { hashtag: HashtagType }) => (
  <a
    key={hashtag.tag}
    href={`/project2/hashtag/${hashtag.tag}`}
    className="flex w-full flex-col items-start bg-gray-100 p-2 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-900"
  >
    <h1 className="break-all text-base font-semibold xl:text-lg">
      #{hashtag.tag}
    </h1>
    <p className="text-sm text-gray-600 dark:text-gray-400 xl:text-base">
      {hashtag.count}
      {hashtag.count <= 1 ? " post" : " posts"}
    </p>
  </a>
);

export default HashtagBlock;
