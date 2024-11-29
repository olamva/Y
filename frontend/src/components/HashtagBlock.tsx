import { HashtagType } from "@/lib/types";

const HashtagBlock = ({ hashtag }: { hashtag: HashtagType }) => (
  <a
    key={hashtag.tag}
    href={`/project2/hashtag/${hashtag.tag.toLowerCase()}`}
    className="bg-gray-100 flex w-full flex-col items-start p-2 transition-colors hover:bg-gray-200 dark:bg-gray-900/50"
  >
    <h1 className="break-words text-base font-semibold text-gray-800 md:text-xl">
      #{hashtag.tag}
    </h1>
    <p className="text-gray-600">
      {hashtag.count}
      {hashtag.count <= 1 ? " post" : " posts"}
    </p>
  </a>
);

export default HashtagBlock;
