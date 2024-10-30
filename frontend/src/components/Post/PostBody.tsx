import { MouseEvent, useEffect, useRef, useState } from "react";

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
      }
      if (lines > 3) {
        setShowReadMore(true);
      }
    }
  }, []);
  
  return (
    <div>
      <p
        ref={bodyRef}
        className={`mx-1 my-2 whitespace-pre-wrap ${isExpanded ? "" : "line-clamp-3"}`}
      >
        {text}
      </p>
      {showReadMore && (
        <button
          onClick={toggleExpand}
          className="mx-1 text-gray-500 hover:underline focus:outline-none dark:text-gray-300"
        >
          {isExpanded ? "Hide" : "Read more..."}
        </button>
      )}
    </div>
  );
};

export default PostBody;
