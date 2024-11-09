import TextInput from "@/form/TextInput";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { ImageIcon, XIcon } from "lucide-react";
import { MouseEvent, useEffect, useRef, useState } from "react";

const MAX_CHARS = 281;

interface CreatePostFieldProps {
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  file: File | null;
  setFile: (file: File | null) => void;
  loading: boolean;
  className?: string;
  existingImageURL?: string;
}
const CreatePostField = ({
  placeholder,
  value,
  setValue,
  file,
  setFile,
  loading,
  className,
  existingImageURL,
}: CreatePostFieldProps) => {
  const textInputRef = useRef<HTMLTextAreaElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleDivClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== textInputRef.current) {
      textInputRef.current?.focus();
    }
  };

  const imagePreviewRef = useRef<string | null>(null);

  useEffect(() => {
    if (file) {
      const newImagePreview = URL.createObjectURL(file);
      setImagePreview(newImagePreview);
      if (imagePreviewRef.current) {
        URL.revokeObjectURL(imagePreviewRef.current);
      }
      imagePreviewRef.current = newImagePreview;
    } else if (existingImageURL) {
      setImagePreview(existingImageURL);
    } else {
      if (imagePreviewRef.current) {
        URL.revokeObjectURL(imagePreviewRef.current);
        imagePreviewRef.current = null;
      }
      setImagePreview(null);
    }
  }, [file, existingImageURL]);

  const percentage = (value.length / MAX_CHARS) * 100;

  return (
    <div
      className="my-2 flex w-full max-w-xl cursor-text flex-col rounded-md border-gray-900 bg-gray-200 p-2 shadow-sm dark:border-gray-300 dark:bg-gray-700"
      onClick={handleDivClick}
    >
      <div className="flex flex-col">
        <TextInput
          ref={textInputRef}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
          }}
          placeholder={placeholder}
          maxChars={MAX_CHARS}
        />
        {imagePreview && (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="image preview"
              className="h-auto w-full p-5"
            />
            {!existingImageURL && (
              <button
                type="button"
                onClick={() => {
                  setFile(null);
                }}
                className="absolute right-5 top-5"
              >
                <XIcon className="size-8 text-red-500 hover:text-red-700" />
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2">
        <div className="flex items-center gap-1">
          <label htmlFor="image-upload" className="cursor-pointer">
            <ImageIcon className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-500" />
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setFile(e.target.files[0]);
              }
            }}
            className="hidden"
          />

          <span
            className="ml-1 select-none text-sm text-black dark:text-gray-500"
            aria-live="polite"
          >
            {value.length}/{MAX_CHARS}
          </span>
          <svg className="size-8" viewBox="0 0 36 36">
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className="stroke-gray-300 dark:stroke-gray-600"
              strokeWidth="2"
            />
            <circle
              cx="18"
              cy="18"
              r="16"
              fill="none"
              className={
                percentage === 100
                  ? "stroke-red-600 dark:stroke-red-500"
                  : percentage >= 90
                    ? "stroke-yellow-600 dark:stroke-yellow-500"
                    : "stroke-blue-600 dark:stroke-blue-500"
              }
              strokeWidth="2"
              strokeDasharray="101"
              strokeDashoffset={Math.ceil(101 - percentage * 1.01)}
              transform="rotate(-90 18 18)"
            />
            <text
              x="18"
              y="22"
              textAnchor="middle"
              className="fill-current text-sm text-black dark:text-gray-500"
            >
              {percentage >= 90 ? MAX_CHARS - value.length : ""}
            </text>
          </svg>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`flex w-fit select-none gap-1 rounded-md border border-transparent p-1 font-thin text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${className}`}
        >
          <p className="font-semibold">Post</p>
          <PaperAirplaneIcon className="size-6" />
        </button>
      </div>
    </div>
  );
};

export default CreatePostField;
