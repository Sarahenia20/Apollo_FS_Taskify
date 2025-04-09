import React from "react";
import Select from "react-select";

const SelectGroup = ({
  label,
  name,
  disabled = false,
  error = null,
  onChange,  // Changed from 'action' to standard 'onChange'
  required = false,
  value,     // Changed from 'defaultValue' to 'value' for controlled component
  options = [],
  className = "",
  isMulti = false,
  loading = false,
  ...props  // Capture any additional props
}) => {
  return (
    <div className="mb-4.5">
      {label && (
        <label className="mb-2.5 block font-medium text-black dark:text-white">
          {label} {required && <span className="text-meta-1">*</span>}
        </label>
      )}

      <div className="relative">
        <Select
          options={options}
          name={name}
          isClearable={true}
          isDisabled={disabled}
          onChange={onChange}
          value={value}
          isLoading={loading}
          isMulti={isMulti}
          classNamePrefix="react-select"
          className={
            className ||
            `react-select-container w-full rounded border border-stroke bg-transparent outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input`
          }
          {...props}
        />
      </div>
      {error && <div className="mt-1 text-sm text-red">{error}</div>}
    </div>
  );
};

export default SelectGroup;