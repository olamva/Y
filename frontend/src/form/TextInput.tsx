import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ChangeEvent, KeyboardEvent, forwardRef, useState } from "react";

interface TextInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  maxChars: number;
}

const TextInput = forwardRef<HTMLTextAreaElement, TextInputProps>(
  ({ value, onChange, placeholder, maxChars }, ref) => {
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionType, setSuggestionType] = useState<
      "mentions" | "hashtags"
    >("mentions");
    const [suggestionQuery, setSuggestionQuery] = useState("");
    const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(0);

    const suggestions = ["user1", "user2", "user3"];
    const filteredSuggestions = suggestions.filter((suggestion) =>
      suggestion.includes(suggestionQuery),
    );

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (showSuggestions) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setActiveSuggestionIndex((prevIndex) =>
            prevIndex === filteredSuggestions.length - 1 ? 0 : prevIndex + 1,
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setActiveSuggestionIndex((prevIndex) =>
            prevIndex === 0 ? filteredSuggestions.length - 1 : prevIndex - 1,
          );
        } else if (e.key === "Enter" && filteredSuggestions.length > 0) {
          e.preventDefault();
          const selectedSuggestion = filteredSuggestions[activeSuggestionIndex];
          const currentValue = value.split(" ");
          currentValue.pop();
          onChange({
            target: {
              value:
                currentValue +
                (suggestionType === "mentions" ? "@" : "#") +
                selectedSuggestion +
                " ",
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

      if (lastWord?.startsWith("@") || lastWord?.startsWith("#")) {
        setShowSuggestions(true);
        setSuggestionQuery(lastWord?.slice(1));
        setSuggestionType(lastWord?.startsWith("@") ? "mentions" : "hashtags");
        setActiveSuggestionIndex(0);
      } else {
        setShowSuggestions(false);
        setSuggestionQuery("");
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
            className="p-0"
          >
            {filteredSuggestions.length > 0 ? (
              <div className="flex w-full appearance-none flex-col overflow-hidden outline-none">
                {filteredSuggestions.map((suggestion, index) => (
                  <div
                    key={suggestion}
                    className={`w-full p-2 ${
                      index === activeSuggestionIndex
                        ? "bg-blue-500 text-white"
                        : ""
                    }`}
                  >
                    {suggestion}
                  </div>
                ))}
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
