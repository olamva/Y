import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useDebounce from "@/hooks/useDebounce"; // Import the debounce hook
import { HashtagType, UserType } from "@/lib/types";
import { SEARCH_HASHTAGS, SEARCH_USERS } from "@/queries/search";
import { useQuery } from "@apollo/client";
import {
  ChangeEvent,
  KeyboardEvent,
  forwardRef,
  useEffect,
  useState,
} from "react";

interface TextInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  maxChars: number;
}

const TextInput = forwardRef<HTMLTextAreaElement, TextInputProps>(
  ({ value, onChange, placeholder, maxChars }, ref) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionType, setSuggestionType] = useState<"users" | "hashtags">(
      "users",
    );
    const [query, setQuery] = useState("");
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);
    const [currentSuggestions, setCurrentSuggestions] = useState<
      (HashtagType | UserType)[]
    >([]);

    const debouncedQuery = useDebounce(query, 300);

    const { data: hashtagsData, loading: hashtagsLoading } = useQuery<{
      searchHashtags: HashtagType[];
    }>(SEARCH_HASHTAGS, {
      variables: { query: debouncedQuery, page: 1, limit: 5 },
      skip: suggestionType !== "hashtags" || debouncedQuery.length < 1,
    });

    const hashtagSuggestions = hashtagsData?.searchHashtags || [];

    const { data: mentionsData, loading: mentionsLoading } = useQuery<{
      searchUsers: UserType[];
    }>(SEARCH_USERS, {
      variables: { query: debouncedQuery, page: 1, limit: 5 },
      skip: suggestionType !== "users" || debouncedQuery.length < 1,
    });

    const mentionSuggestions = mentionsData?.searchUsers || [];

    useEffect(() => {
      if (suggestionType === "users") {
        setCurrentSuggestions(mentionSuggestions);
      } else {
        setCurrentSuggestions(hashtagSuggestions);
      }
    }, [mentionSuggestions, hashtagSuggestions, suggestionType]);

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (showSuggestions) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveSuggestionIndex((prevIndex) =>
            prevIndex === currentSuggestions.length - 1 ? 0 : prevIndex + 1,
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveSuggestionIndex((prevIndex) =>
            prevIndex === 0 ? currentSuggestions.length - 1 : prevIndex - 1,
          );
        } else if (e.key === "Enter" && currentSuggestions.length > 0) {
          e.preventDefault();
          const selectedSuggestion = currentSuggestions[activeSuggestionIndex];
          const currentValue = value.split(" ");
          currentValue.pop();
          const finalSuggestion =
            selectedSuggestion.__typename === "User"
              ? `@${selectedSuggestion.username} `
              : `#${selectedSuggestion.tag} `;
          onChange({
            target: {
              value: currentValue + finalSuggestion,
            },
          } as ChangeEvent<HTMLTextAreaElement>);
          setShowSuggestions(false);
        }
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        const form = e.currentTarget.form;
        if (form) {
          const submitEvent = new Event("submit", {
            bubbles: true,
            cancelable: true,
          });
          form.dispatchEvent(submitEvent);
          e.currentTarget.style.height = "auto";
        }
      }
    };

    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      onChange(e);
      const value = e.target.value;
      const lastWord = value.split(" ").pop();

      if (
        (lastWord?.startsWith("@") || lastWord?.startsWith("#")) &&
        lastWord.length > 1
      ) {
        setShowSuggestions(true);
        setQuery(lastWord?.slice(1));
        setSuggestionType(lastWord?.startsWith("@") ? "users" : "hashtags");
        setActiveSuggestionIndex(0);
      } else {
        setShowSuggestions(false);
        setQuery("");
      }

      e.target.style.height = "auto";
      e.target.style.height = `${e.target.scrollHeight}px`;
    };

    return (
      <div className="relative w-full">
        <Popover open={showSuggestions}>
          <PopoverTrigger asChild>
            <textarea
              ref={ref}
              value={value}
              maxLength={maxChars}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="mt-1 block min-h-12 w-full max-w-xl resize-none rounded-md bg-transparent outline-none"
            />
          </PopoverTrigger>
          <PopoverContent
            onOpenAutoFocus={(e) => e.preventDefault()}
            className="p-0 overflow-hidden"
          >
            {hashtagsLoading || mentionsLoading ? (
              <p className="w-full p-2">Loading...</p>
            ) : currentSuggestions.length > 0 ? (
              <div className="flex w-full appearance-none flex-col overflow-hidden outline-none">
                {currentSuggestions.map((suggestion, index) =>
                  suggestion.__typename === "User" ? (
                    <div
                      key={suggestion.id}
                      className={`w-full p-2 ${
                        index === activeSuggestionIndex
                          ? "bg-blue-500 text-white"
                          : ""
                      }`}
                    >
                      {suggestion.username}
                    </div>
                  ) : (
                    <div
                      key={suggestion.tag}
                      className={`w-full p-2 ${
                        index === activeSuggestionIndex
                          ? "bg-blue-500 text-white"
                          : ""
                      }`}
                    >
                      {suggestion.tag}
                    </div>
                  ),
                )}
              </div>
            ) : (
              <p className="w-full p-2">No matching {suggestionType}</p>
            )}
          </PopoverContent>
        </Popover>
      </div>
    );
  },
);

export default TextInput;
