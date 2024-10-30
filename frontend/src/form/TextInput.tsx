import { ChangeEvent, FC, KeyboardEvent } from "react";

interface TextInputProps {
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}
const TextInput: FC<TextInputProps> = ({ value, onChange, placeholder }) => {
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
        e.currentTarget.style.height = "auto"; // Reset the height after form submission
      }
    }
  };

  return (
    <div className="w-full">
      <textarea
        value={value}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
          onChange(e);
          e.target.style.height = "auto"; // Reset the height
          e.target.style.height = `${e.target.scrollHeight}px`; // Set it to the scrollHeight
        }}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required
        className="mt-1 block min-h-12 w-full max-w-xl resize-none rounded-md bg-transparent outline-none"
      />
    </div>
  );
};

export default TextInput;
