import React, { ChangeEvent } from "react";

interface TextInputProps {
  id: string;
  label?: string;
  value: string;
  onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  id,
  label,
  value,
  onChange,
  required = false,
  className = "",
  placeholder = "",
}) => (
  <div className="w-full">
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-800 dark:text-gray-200"
    >
      {label}
    </label>
    <textarea
      id={id}
      value={value}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => {
        onChange(e);
        e.target.style.height = "auto"; // Reset the height
        e.target.style.height = `${e.target.scrollHeight}px`; // Set it to the scrollHeight
      }}
      placeholder={placeholder}
      required={required}
      className={`mt-1 block min-h-12 w-full max-w-xl resize-none rounded-md border-gray-900 bg-gray-200 p-1 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring focus:ring-indigo-200 focus:ring-opacity-50 dark:border-gray-300 dark:bg-gray-700 ${className}`}
    />
  </div>
);

export default TextInput;
