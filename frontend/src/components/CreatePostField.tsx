import TextInput from "@/form/TextInput";
import { PaperAirplaneIcon } from "@heroicons/react/24/outline";

interface CreatePostFieldProps {
  placeholder: string;
  value: string;
  setValue: (value: string) => void;
  loading: boolean;
  className?: string;
}
const CreatePostField = ({
  placeholder,
  value,
  setValue,
  loading,
  className,
}: CreatePostFieldProps) => (
  <div className="my-2 flex w-full max-w-xl flex-col rounded-md border-gray-900 bg-gray-200 p-2 shadow-sm dark:border-gray-300 dark:bg-gray-700">
    <TextInput
      value={value}
      onChange={(e) => setValue(e.target.value)}
      placeholder={placeholder}
    />
    <div className="flex justify-end">
      <button
        type="submit"
        disabled={loading}
        className={`flex w-fit gap-1 rounded-md border border-transparent p-1 font-thin text-white outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 ${className}`}
      >
        <p className="font-semibold">Post</p>
        <PaperAirplaneIcon className="size-6" />
      </button>
    </div>
  </div>
);

export default CreatePostField;
