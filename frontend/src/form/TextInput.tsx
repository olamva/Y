import { ChangeEvent, KeyboardEvent, forwardRef } from "react";

interface TextInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  maxChars: number;
}

const TextInput = forwardRef<HTMLTextAreaElement, TextInputProps>(
  ({ value, onChange, placeholder, maxChars }, ref) => {
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
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

    const percentage = (value.length / maxChars) * 100;

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          value={value}
          maxLength={maxChars}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            onChange(e);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="/* Added padding-right */ /* Added padding-bottom */ mt-1 block min-h-12 w-full max-w-xl resize-none rounded-md bg-transparent pb-4 pr-12 outline-none"
        />
        <div className="absolute bottom-3 right-3 flex items-center">
          <span className="mr-2 text-sm text-gray-500" aria-live="polite">
            {value.length}/{maxChars}
          </span>
          <svg className="h-8 w-8" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-current text-gray-200"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-current text-blue-500"
              strokeWidth="2"
              strokeDasharray="100"
              strokeDashoffset={100 - percentage}
              transform="rotate(-90 18 18)"
            />
          </svg>
        </div>
      </div>
    );
  },
);

export default TextInput;
