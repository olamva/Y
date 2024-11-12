import { MouseEvent, TouchEvent, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

interface PostBodyProps {
  text: string;
}

const PostBody: React.FC<PostBodyProps> = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [showReadMore, setShowReadMore] = useState(false);

  const toggleExpand = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    event.preventDefault();
    setIsExpanded((prev) => !prev);
  };

  useEffect(() => {
    if (bodyRef.current) {
      const lineHeight = parseFloat(
        getComputedStyle(bodyRef.current).lineHeight,
      );
      const lines = bodyRef.current.scrollHeight / lineHeight;
      if (lines <= 3) {
        setIsExpanded(true);
      } else {
        setShowReadMore(true);
      }
    }
  }, []);

  /**
   * linkify function that converts URLs and hashtags into clickable links.
   * URLs are converted to <a> tags.
   * Hashtags are converted to <Link> components from react-router-dom.
   */
  const linkify = (text: string) => {
    const combinedRegex = /(https?:\/\/[^\s]+)|#(\w+)/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = combinedRegex.exec(text)) !== null) {
      const { index } = match;
      const [fullMatch, url, hashtag] = match;
      if (index > lastIndex) {
        parts.push(text.substring(lastIndex, index));
      }

      if (url) {
        parts.push(
          <a
            key={`url-${index}`}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(
              e: MouseEvent<HTMLAnchorElement> | TouchEvent<HTMLAnchorElement>,
            ) => {
              e.stopPropagation();
            }}
            className="text-blue-500 hover:underline"
          >
            {url}
          </a>,
        );
      } else if (hashtag) {
        parts.push(
          <Link
            key={`hashtag-${index}`}
            to={`/project2/hashtag/${hashtag}`}
            onClick={(
              e: MouseEvent<HTMLAnchorElement> | TouchEvent<HTMLAnchorElement>,
            ) => {
              e.stopPropagation();
            }}
            className="text-blue-500 hover:underline"
          >
            #{hashtag}
          </Link>,
        );
      }

      lastIndex = index + fullMatch.length;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div>
      <p
        ref={bodyRef}
        className={`mx-1 whitespace-pre-wrap break-words ${
          isExpanded ? "" : "line-clamp-3"
        }`}
      >
        {linkify(text)}
      </p>
      {showReadMore && (
        <button
          onClick={toggleExpand}
          className="p-2 pl-1 text-gray-500 hover:underline focus:outline-none dark:text-gray-300"
        >
          {isExpanded ? "Hide" : "Read more..."}
        </button>
      )}
    </div>
  );
};

export default PostBody;
