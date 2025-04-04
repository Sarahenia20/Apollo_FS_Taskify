import React, { useState, useEffect, useCallback } from "react";
import Select from "react-select";
import axios from "axios";
import debounce from "lodash/debounce";

const SkillsSelectGroup = ({
  label = "Skills",
  name = "skills",
  disabled = false,
  onChange,
  value = [],
  maxSkills = 10
}) => {
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");

  // Pre-defined common skills to ensure we always have relevant options
  const commonSkills = [
    { value: "JavaScript", label: "JavaScript" },
    { value: "Python", label: "Python" },
    { value: "React", label: "React" },
    { value: "Node.js", label: "Node.js" },
    { value: "Java", label: "Java" },
    { value: "CSS", label: "CSS" },
    { value: "HTML", label: "HTML" },
    { value: "TypeScript", label: "TypeScript" },
    { value: "SQL", label: "SQL" },
    { value: "MongoDB", label: "MongoDB" },
    { value: "Express", label: "Express" },
    { value: "Git", label: "Git" },
    { value: "AWS", label: "AWS" },
    { value: "Docker", label: "Docker" },
    { value: "Redux", label: "Redux" }
  ];

  useEffect(() => {
    // Set initial options to common skills
    setOptions(commonSkills);
  }, []);

  // Debounced function to search skills
  const searchSkills = useCallback(
    debounce(async (searchQuery) => {
      if (!searchQuery || searchQuery.length < 2) {
        setOptions(commonSkills);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        // DataMuse API - free, no API key required, returns related words
        const response = await axios.get(
          `https://api.datamuse.com/words?ml=${encodeURIComponent(searchQuery)}&max=15`
        );

        const apiResults = response.data
          .map(item => ({
            value: item.word,
            label: item.word.charAt(0).toUpperCase() + item.word.slice(1) // Capitalize first letter
          }))
          .filter(skill => 
            // Filter out very short words and non-skill-like words
            skill.value.length > 2 && 
            !['the', 'and', 'for', 'that', 'with'].includes(skill.value)
          );

        // Combine API results with our common skills
        // Filter out duplicates (case insensitive)
        const allOptions = [...commonSkills];
        
        // Only add new options that aren't already in our list
        apiResults.forEach(newOption => {
          if (!allOptions.some(existing => 
            existing.value.toLowerCase() === newOption.value.toLowerCase())
          ) {
            allOptions.push(newOption);
          }
        });

        setOptions(allOptions);
      } catch (error) {
        console.error("Error fetching skills:", error);
        // Fall back to common skills if API fails
        setOptions(commonSkills);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    [commonSkills]
  );

  // Handle input change
  const handleInputChange = (newValue) => {
    setInputValue(newValue);
    searchSkills(newValue);
  };

  // Custom styles to match your UI
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#f0f4f8',
      borderColor: state.isFocused ? '#3b82f6' : '#e2e8f0',
      boxShadow: 'none',
      minHeight: '42px',
      borderRadius: '0.375rem',
      '&:hover': {
        borderColor: '#3b82f6'
      }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'white',
      color: 'black',
      zIndex: 10
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#3b82f6' : state.isFocused ? '#dbeafe' : 'white',
      color: state.isSelected ? 'white' : 'black',
      '&:hover': {
        backgroundColor: '#dbeafe'
      }
    }),
    multiValue: (provided) => ({
      ...provided,
      backgroundColor: '#dbeafe',
      borderRadius: '0.25rem'
    }),
    multiValueLabel: (provided) => ({
      ...provided,
      color: '#1e40af'
    }),
    multiValueRemove: (provided) => ({
      ...provided,
      color: '#3b82f6',
      '&:hover': {
        backgroundColor: '#93c5fd',
        color: '#1e3a8a'
      }
    }),
    container: (provided) => ({
      ...provided,
      width: '100%'
    })
  };

  return (
    <div className="mb-4.5">
      <label className="mb-2.5 block font-medium text-black dark:text-white">
        {label}
      </label>

      <div className="relative">
        <Select
          options={options}
          isMulti
          isClearable
          isSearchable
          isDisabled={disabled}
          isLoading={isLoading}
          onChange={onChange}
          onInputChange={handleInputChange}
          inputValue={inputValue}
          value={value}
          styles={customStyles}
          placeholder="Type to search skills..."
          noOptionsMessage={({ inputValue }) => 
            inputValue ? "No skills found" : "Type to search skills"
          }
          className="w-full"
          classNamePrefix="select"
          isOptionDisabled={() => value.length >= maxSkills}
        />
      </div>

      <div className="text-xs text-gray-500 mt-1">
        {value.length}/{maxSkills} skills selected
      </div>
    </div>
  );
};

export default SkillsSelectGroup;