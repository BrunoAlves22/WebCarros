import { ReactNode } from "react";
import { RegisterOptions, UseFormRegister } from "react-hook-form";

interface InputProps {
  type: string;
  placeholder: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  register: UseFormRegister<any>;
  error?: string;
  rules?: RegisterOptions;
  icon?: ReactNode;
  disabled?: boolean;
}

export function Input({
  name,
  placeholder,
  type,
  register,
  rules,
  error,
  icon,
  disabled,
}: InputProps) {
  return (
    <div className="relative">
      <input
        className="w-full border-2 rounded-md h-11 px-2 border-zinc-300 outline-none"
        placeholder={placeholder}
        type={type}
        {...register(name, rules)}
        id={name}
        disabled={disabled}
      />

      <div
        className={`absolute right-2 top-1/2 transform -translate-y-1/2  ${
          error ? "absolute -bottom-[16%] " : ""
        }`}
      >
        {icon}
      </div>

      <div className="my-2">
        {!disabled && error && <p className="text-red-600 font-medium">{error}</p>}
      </div>
    </div>
  );
}
