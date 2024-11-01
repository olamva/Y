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
}: FormFieldProps) => (
  <div>
    <label
      htmlFor={id}
      className="block text-sm font-medium text-gray-700 dark:text-gray-200"
    >
      {label}
    </label>
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
    {errors?.confirmPassword && (
      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
    )}
  </div>
);

export default FormField;
