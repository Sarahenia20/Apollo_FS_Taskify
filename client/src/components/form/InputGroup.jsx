import React from "react";

const InputGroup = ({
  label,
  name,
  type = "text",
  placeholder,
  icon,
  onChange,  // Changed from 'action' to standard 'onChange'
  error,     // Changed from 'errors' to singular 'error'
  required,
  value,     // Changed from 'defaultValue' to 'value'
  className,
  prependIcon,
  disabled
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-2.5 block font-medium text-black dark:text-white">
          {label} {required && <span className="text-meta-1">*</span>}
        </label>
      )}

      <div className="relative">
        {prependIcon && icon && (
          <span className="absolute right-4 top-4">{icon}</span>
        )}
        <input
          disabled={disabled}
          name={name}
          type={type}
          placeholder={placeholder}
          className={
            className || `w-full rounded-lg border border-stroke bg-transparent py-4 pl-6 pr-10 outline-none focus:border-primary focus-visible:shadow-none dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary`
          }
          onChange={onChange}  // Using standard onChange prop
          value={value || ''}  // Using value prop instead of defaultValue
        />

        {!prependIcon && icon && (
          <span className="absolute right-4 top-4">{icon}</span>
        )}
      </div>
      {error && <div className="text-sm text-red">{error}</div>}
    </div>
  );
};

export default InputGroup;