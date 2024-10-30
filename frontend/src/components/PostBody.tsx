import { useEffect, useRef, useState } from "react";

const PostBody = ({ text }: { text: string }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const bodyRef = useRef<HTMLParagraphElement>(null);

  const toggleExpand = (event: React.MouseEvent<HTMLButtonElement>) => {
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
      {bodyRef.current &&
        bodyRef.current.scrollHeight /
          parseFloat(getComputedStyle(bodyRef.current).lineHeight) >
          3 && (
          <button
            onClick={toggleExpand}
            className="text-blue-500 hover:underline focus:outline-none"
          >
            {isExpanded ? "Hide" : "Read more..."}
          </button>
        )}
    </div>
  );
};

export default PostBody;
