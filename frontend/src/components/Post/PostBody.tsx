import { MouseEvent, TouchEvent, useEffect, useRef, useState } from "react";

const PostBody = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [showReadMore, setShowReadMore] = useState(false);

  const toggleExpand = (event: MouseEvent) => {
    event.stopPropagation();
    event.preventDefault();
    setIsExpanded(!isExpanded);
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

  const linkify = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          rel="noopener noreferrer"
          onClick={(e: MouseEvent | TouchEvent) => e.stopPropagation()}
          className="text-blue-500 hover:underline"
        >
          {part}
        </a>
      ) : (
        part
      ),
    );
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
