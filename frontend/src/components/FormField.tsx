import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useState } from "react";

interface FormFieldProps {
  label: string;
  id: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autocomplete?: string;
  errors?: { confirmPassword?: string };
}
const FormField = ({
  label,
  id,
  type,
  value,
  onChange,
  autocomplete,
  errors,
}: FormFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700 dark:text-gray-200"
      >
        {label}
      </label>
      {type === "password" ? (
        <div
          className="mt-1 flex w-full items-center overflow-hidden rounded-md border border-gray-300 bg-white text-black shadow-sm focus-within:border-indigo-500 focus-within:outline-none focus-within:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          onClick={() => document.getElementById(id)?.focus()}
        >
          <input
            type={showPassword ? "text" : type}
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            role="input"
            autoComplete={autocomplete}
            className="flex-grow bg-white py-2 pl-3 outline-none dark:bg-gray-900"
            required
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              setShowPassword((prev) => !prev);
            }}
            aria-label="Toggle password visibility"
            className="p-3 text-sm text-indigo-600 hover:text-indigo-400 dark:text-indigo-600 dark:hover:text-indigo-400"
          >
            {showPassword ? (
              <EyeIcon className="size-4" />
            ) : (
              <EyeOffIcon className="size-4" />
            )}
          </button>
        </div>
      ) : (
        <input
          type={type}
          id={id}
          name={id}
          value={value}
          onChange={onChange}
          autoComplete={autocomplete}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-black shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-900 dark:text-white"
          required
        />
      )}
      {errors?.confirmPassword && (
        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
      )}
    </div>
  );
};

export default FormField;
