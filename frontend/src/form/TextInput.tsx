import { ChangeEvent, KeyboardEvent, forwardRef } from "react";

interface TextInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}

const TextInput = forwardRef<HTMLTextAreaElement, TextInputProps>(
  ({ value, onChange, placeholder }, ref) => {
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

    return (
      <div className="w-full">
        <textarea
          ref={ref}
          value={value}
          onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
            onChange(e);
            e.target.style.height = "auto";
            e.target.style.height = `${e.target.scrollHeight}px`;
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required
          className="mt-1 block min-h-12 w-full max-w-xl resize-none rounded-md bg-transparent outline-none"
        />
      </div>
    );
  },
);

export default TextInput;
