import React, { useState } from 'react';
import { useField } from 'formik';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  textColor?: string;
  disabled?: boolean;
  value?: string;
  isTextarea?: boolean;
  rows?: number;
  ignoreValue?: boolean;
  icon?: React.ReactNode;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  placeholder = '',
  textColor = 'text-gray-700',
  disabled = false,
  value,
  isTextarea = false,
  rows = 4,
  ignoreValue = false,
  icon,
}) => {
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);

  if (ignoreValue) return null;

  const inputValue = value ?? field.value;
  const isFilled = inputValue !== '';
  const inputType = type === 'password' && showPassword ? 'text' : type;

  return (
    <div className="flex flex-col">
      <label
        htmlFor={name}
        className={`mb-1.5 ${textColor} font-medium text-xs text-gray-500`}
      >
        {label}
      </label>

      <div className="relative w-full">
        {icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
            {icon}
          </span>
        )}
        {isTextarea ? (
          <textarea
            {...field}
            id={name}
            rows={rows}
            placeholder={placeholder}
            className={`w-full py-2 px-3.5 text-[13px] focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 rounded-lg border border-gray-200 transition-all
              ${icon ? 'pl-10' : ''}
              ${meta.touched && meta.error ? 'border-red-400' : ''}
              ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white shadow-sm'}`}
            disabled={disabled}
            value={inputValue}
          />
        ) : (
          <>
            <input
              {...field}
              id={name}
              type={inputType}
              placeholder={placeholder}
              className={`w-full py-2 px-3.5 pr-10 text-[13px] focus:outline-none focus:border-orange-400 focus:ring-1 focus:ring-orange-200 rounded-lg border border-gray-200 transition-all
                ${icon ? 'pl-10' : ''}
                ${meta.touched && meta.error ? 'border-red-400' : ''}
                ${disabled ? 'bg-gray-50 text-gray-400 cursor-not-allowed' : 'bg-white shadow-sm'}`}
              disabled={disabled}
              value={inputValue}
            />
            
            {type === 'password' && !disabled && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-orange-600 focus:outline-none text-[11px] font-medium"
              >
                {showPassword ? 'Ocultar' : 'Ver'}
              </button>
            )}
          </>
        )}
      </div>

      {meta.touched && meta.error ? (
        <div className="text-red-400 text-[11px] mt-1">{meta.error}</div>
      ) : null}
    </div>
  );
};

export default FormInput;