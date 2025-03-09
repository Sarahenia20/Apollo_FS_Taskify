import React from "react";
import Select from "react-select";

// Predefined skills categories for better organization
const SKILLS_CATEGORIES = [
  {
    label: "Programming Languages",
    options: [
      { value: "JavaScript", label: "JavaScript" },
      { value: "Python", label: "Python" },
      { value: "Java", label: "Java" },
      { value: "TypeScript", label: "TypeScript" },
      { value: "Ruby", label: "Ruby" }
    ]
  },
  {
    label: "Web Technologies",
    options: [
      { value: "React", label: "React" },
      { value: "Node.js", label: "Node.js" },
      { value: "Angular", label: "Angular" },
      { value: "Vue", label: "Vue.js" },
      { value: "Express", label: "Express" }
    ]
  },
  {
    label: "Cloud & DevOps",
    options: [
      { value: "Docker", label: "Docker" },
      { value: "Kubernetes", label: "Kubernetes" },
      { value: "AWS", label: "AWS" },
      { value: "Azure", label: "Azure" },
      { value: "Google Cloud", label: "Google Cloud" }
    ]
  },
  {
    label: "Databases",
    options: [
      { value: "MongoDB", label: "MongoDB" },
      { value: "PostgreSQL", label: "PostgreSQL" },
      { value: "MySQL", label: "MySQL" },
      { value: "Redis", label: "Redis" },
      { value: "SQLite", label: "SQLite" }
    ]
  },
  {
    label: "Data Science & AI",
    options: [
      { value: "Machine Learning", label: "Machine Learning" },
      { value: "Data Science", label: "Data Science" },
      { value: "TensorFlow", label: "TensorFlow" },
      { value: "PyTorch", label: "PyTorch" },
      { value: "Pandas", label: "Pandas" }
    ]
  }
];

const SkillsSelectGroup = ({
  label = "Skills",
  name = "skills",
  disabled = false,
  errors,
  action,
  required = false,
  defaultValue = [],
  className,
  maxSkills = 10
}) => {
  // Custom styles to match Tailwind CSS and dark mode
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'transparent',
      borderColor: state.isFocused 
        ? 'var(--tw-primary-color)' 
        : 'var(--tw-border-color)',
      boxShadow: 'none',
      '&:hover': {
        borderColor: 'var(--tw-primary-color)'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'white',
      color: 'black'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected 
        ? 'var(--tw-primary-color)' 
        : 'white',
      color: state.isSelected ? 'white' : 'black',
      '&:hover': {
        backgroundColor: 'var(--tw-primary-color-light)'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: 'var(--tw-primary-color-light)',
      color: 'var(--tw-primary-color)'
    })
  };

  return (
    <div className="mb-4.5">
      <label className="mb-2.5 block font-medium text-black dark:text-white">
        {label} {required && <span className="text-meta-1">*</span>}
      </label>

      <div className="relative">
        <Select
          options={SKILLS_CATEGORIES}
          name={name}
          isMulti
          isClearable
          isDisabled={disabled}
          onChange={action}
          defaultValue={defaultValue}
          styles={customStyles}
          placeholder="Select skills..."
          noOptionsMessage={() => "No more skills available"}
          
          // Limit maximum number of skills
          isOptionDisabled={() => 
            defaultValue.length >= maxSkills
          }
        />
      </div>
      
      {/* Error handling */}
      {errors && (
        <div className="text-sm text-meta-1 mt-1">
          {errors}
        </div>
      )}

      {/* Skills count indicator */}
      <div className="text-xs text-gray-500 mt-1">
        {defaultValue.length}/{maxSkills} skills selected
      </div>
    </div>
  );
};

export default SkillsSelectGroup;