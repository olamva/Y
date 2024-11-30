import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import TextInput from "@/form/TextInput";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";
import { ImageIcon, XIcon } from "lucide-react";
import { MouseEvent, useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "./AuthContext";

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
  const { user } = useAuth();
  const [isDragOver, setIsDragOver] = useState(false);

  const MAX_CHARS =
    user?.verified === "VERIFIED" || user?.verified === "DEVELOPER" ? 562 : 281;

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

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handlePaste = useCallback(
    (e: ClipboardEvent) => {
      if (e.clipboardData && e.clipboardData.files.length > 0) {
        const pastedFile = e.clipboardData.files[0];
        if (pastedFile.type.startsWith("image/")) {
          setFile(pastedFile);
        }
      }
    },
    [setFile],
  );

  useEffect(() => {
    const input = textInputRef.current;
    if (input) {
      input.addEventListener(
        "paste",
        handlePaste as (e: ClipboardEvent) => void,
      );
    }
    return () => {
      if (input) {
        input.removeEventListener(
          "paste",
          handlePaste as (e: ClipboardEvent) => void,
        );
      }
    };
  }, [handlePaste]);

  return (
    <TooltipProvider>
      <div
        className={`my-2 flex w-full max-w-xl cursor-text flex-col rounded-md ${isDragOver ? "border-4 border-dotted border-blue-500 dark:border-blue-400" : "border-gray-900 bg-gray-200 dark:border-gray-300 dark:bg-gray-700"} p-2 shadow-sm`}
        onClick={handleDivClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="flex flex-col">
          <TextInput
            ref={textInputRef}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
            }}
            placeholder={isDragOver ? "Drop your image here" : placeholder}
            maxChars={MAX_CHARS}
          />

          {imagePreview && (
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="image preview"
                className="h-auto max-h-[36rem] object-contain w-full p-5"
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

        <div className="flex justify-between">
          <div className="flex flex-grow items-center justify-start gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="h-fit px-1"
                  onClick={() => {
                    const start = textInputRef.current?.selectionStart;
                    const end = textInputRef.current?.selectionEnd;
                    if (start !== undefined && end !== undefined) {
                      if (textInputRef.current) {
                        const newValue =
                          value.substring(0, start) +
                          "@" +
                          value.substring(start, end) +
                          value.substring(end);
                        textInputRef.current.value = newValue;
                        textInputRef.current.dispatchEvent(
                          new Event("input", { bubbles: true }),
                        );
                      }
                    }
                  }}
                >
                  <h3 className="h-fit text-xl text-blue-500 hover:text-blue-700 dark:hover:text-blue-600">
                    @
                  </h3>
                </button>
              </TooltipTrigger>
              <TooltipContent className="border border-gray-300 dark:border-gray-600">
                <p>Want to mention someone?</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="h-fit px-1"
                  onClick={() => {
                    const start = textInputRef.current?.selectionStart;
                    const end = textInputRef.current?.selectionEnd;
                    if (start !== undefined && end !== undefined) {
                      if (textInputRef.current) {
                        const newValue =
                          value.substring(0, start) +
                          "#" +
                          value.substring(start, end) +
                          value.substring(end);
                        textInputRef.current.value = newValue;
                        textInputRef.current.dispatchEvent(
                          new Event("input", { bubbles: true }),
                        );
                      }
                    }
                  }}
                >
                  <h3 className="h-fit text-xl text-blue-500 hover:text-blue-700 dark:hover:text-blue-600">
                    #
                  </h3>
                </button>
              </TooltipTrigger>
              <TooltipContent className="border border-gray-300 dark:border-gray-600">
                <p>Want to add a hashtag?</p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="flex-grow"></div>
          <div className="flex justify-end gap-2">
            <div className="flex items-center gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <ImageIcon className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-600" />
                  </label>
                </TooltipTrigger>
                <TooltipContent className="border border-gray-300 dark:border-gray-600">
                  <p>Want to upload an image?</p>
                </TooltipContent>
              </Tooltip>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files?.[0]) {
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
      </div>
    </TooltipProvider>
  );
};

export default CreatePostField;
