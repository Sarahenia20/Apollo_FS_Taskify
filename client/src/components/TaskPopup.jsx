// src/components/TaskPopup.jsx
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FindUsers } from "../redux/actions/users";
import { AddTaskAction, UpdateTaskAction } from "../redux/actions/tasks";
import { _FindOneTask } from "../redux/reducers/tasks";
import { setRefresh } from "../redux/reducers/commons";
import SelectGroup from "./form/SelectGroup";
import InputGroup from "./form/InputGroup";

// Mock data imports
import { MOCK_DATA, MOCK_PRIORITY, MOCK_STATUS, MOCK_TYPE } from "../data/mock";

const TaskPopup = ({ popupOpen, setPopupOpen, taskData = null, isEditMode = false }) => {
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  
  // Redux state
  const { roles } = useSelector(s => s.auth.user);
  const { _ALL } = useSelector((state) => state.users);
  const { _ONE } = useSelector((state) => state.tasks);
  const { content } = useSelector((state) => state.errors);
  const { refresh } = useSelector((state) => state.commons);
  const dispatch = useDispatch();

  // Form state
  const [form, setForm] = useState({
    // Default values
    is_all_day: true,
    priority: "2",
    status: "1",
    type: "1"
  });

  // Set editing mode based on props
  useEffect(() => {
    setIsEditing(isEditMode);
  }, [isEditMode]);

  // When popup opens/closes or taskData changes, handle the form state
  useEffect(() => {
    if (popupOpen) {
      console.log("Popup opened with taskData:", taskData);
      console.log("Is edit mode:", isEditMode);
      console.log("Redux _ONE state:", _ONE);
      
      if (isEditMode && taskData && taskData._id) {
        console.log("Loading task data for editing from props:", taskData);
        
        // Format dates and times for form inputs
        let formattedTask = { ...taskData };
        
        // Process dates to ISO format for form inputs
        if (formattedTask.start_date) {
          try {
            formattedTask.start_date = new Date(formattedTask.start_date).toISOString().slice(0, 16);
          } catch (e) {
            console.error("Error formatting start date:", e);
            formattedTask.start_date = "";
          }
        }
        
        if (formattedTask.end_date) {
          try {
            formattedTask.end_date = new Date(formattedTask.end_date).toISOString().slice(0, 16);
          } catch (e) {
            console.error("Error formatting end date:", e);
            formattedTask.end_date = "";
          }
        }
        
        // Special handling for project data
        if (formattedTask.project) {
          console.log("Initial project data from props:", formattedTask.project);
        }
        
        console.log("Formatted task data:", formattedTask);
        setForm(formattedTask);
        setIsEditing(true);
      } else if (_ONE && _ONE._id) {
        // Fallback to Redux state if taskData is not provided
        console.log("Loading task data from Redux state:", _ONE);
        
        // Format dates for form
        let formattedTask = { ..._ONE };
        
        // Process dates to ISO format for form inputs
        if (formattedTask.start_date) {
          try {
            formattedTask.start_date = new Date(formattedTask.start_date).toISOString().slice(0, 16);
          } catch (e) {
            console.error("Error formatting start date from Redux:", e);
            formattedTask.start_date = "";
          }
        }
        
        if (formattedTask.end_date) {
          try {
            formattedTask.end_date = new Date(formattedTask.end_date).toISOString().slice(0, 16);
          } catch (e) {
            console.error("Error formatting end date from Redux:", e);
            formattedTask.end_date = "";
          }
        }
        
        // Special handling for project data
        if (formattedTask.project) {
          console.log("Initial project data from Redux:", formattedTask.project);
        }
        
        setForm(formattedTask);
        setIsEditing(true);
      } else {
        // Clear form for adding a new task
        console.log("Setting up form for new task");
        setForm({
          is_all_day: true,
          priority: "2",
          status: "1",
          type: "1"
        });
        setIsEditing(false);
      }
    } else {
      // When popup closes, reset everything
      setFiles([]);
    }
  }, [popupOpen, taskData, _ONE, isEditMode]);

  // Fetch users when component mounts
  useEffect(() => {
    dispatch(FindUsers());
  }, [dispatch]);

  // Format users for select dropdown
  useEffect(() => {
    if (_ALL && _ALL.length > 0) {
      const data = _ALL.map((u) => {
        return {
          value: u._id,
          label: (
            <p className="flex h-[30px] items-center space-x-2 p-1">
              <img
                src={`${
                  u.picture
                    ? u.picture.includes("https")
                      ? u.picture
                      : `http://localhost:5500/${u.picture}`
                    : ""
                }`}
                alt={u.fullName}
                className="h-[30px] w-auto rounded-full"
              />
              {`${u.fullName}`}
            </p>
          ),
        };
      });
      setUsers(data);
    }
  }, [_ALL]);

  // Format projects for select dropdown
  const [projects, setProjects] = useState([]);

  // Initialize project options from MOCK_DATA
  useEffect(() => {
    const mockOptions = MOCK_DATA.map((p) => ({
      value: p.project_id.toString(),
      label: p.project_name,
      details: {
        manager: p.project_manager,
        status: p.status,
        priority: p.priority,
        clientName: p.client_name,
      },
    }));
    
    console.log("Setting initial projects from MOCK_DATA:", mockOptions);
    setProjects([...mockOptions]);
  }, []);

  // Create a manual project option if the project ID isn't found in the options
  useEffect(() => {
    if (popupOpen && isEditMode && form?.project) {
      // Get project ID
      const projectId = typeof form.project === 'object' && form.project._id 
        ? form.project._id 
        : (typeof form.project === 'string' ? form.project : null);
      
      if (!projectId) return;
      
      console.log("Checking if project ID exists in options:", projectId);
      
      // Check if this ID exists in current options
      const projectExists = projects.some(p => p.value === projectId);
      
      if (!projectExists) {
        console.log("Project ID not found in options. Creating manual option.");
        // Create a new option for this project
        const projectName = typeof form.project === 'object' && form.project.project_name 
          ? form.project.project_name 
          : `Project ${projectId.substring(0, 8)}...`;
        
        const newProject = {
          value: projectId,
          label: projectName,
          details: {}
        };
        
        // Add this project to options
        setProjects(prev => [...prev, newProject]);
        console.log("Added manual project option:", newProject);
      }
    }
  }, [popupOpen, isEditMode, form?.project, projects]);

  // Format types for select dropdown
  const [types, setTypes] = useState(
    MOCK_TYPE.map((p) => ({
      value: p.value,
      label: p.label,
    }))
  );

  // Format priority for select dropdown
  const [priority, setPriority] = useState(
    MOCK_PRIORITY.map((p) => ({
      label: p.label,
      value: p.value,
    }))
  );

  // Format status for select dropdown
  const [status, setStatus] = useState(
    MOCK_STATUS.map((p) => ({
      value: p.value,
      label: p.label,
    }))
  );

  // Check if field should be disabled based on user role
  const isDisabled = (p, r) => {
    if(!Array.isArray(r) || r.includes("ADMIN")) return false;
    if(r.includes("MANAGER") && p === "assigns") return false;
    else if(r.includes("DESIGNER") && p === "status") return false;
    else if(r.includes("CM")) return false;
    return true;
  };

  // Form handlers
  const clearForm = () => {
    setForm({
      is_all_day: true,
      priority: "2",
      status: "1",
      type: "1"
    });
    setFiles([]);
    setIsEditing(false);
    dispatch(_FindOneTask({}));
  };

  const OnChangeHandler = (e) => {
    const { name, value } = e.target;
    
    // Special handling for dates to preserve time component
    if (name === 'start_date' || name === 'end_date') {
      // Get current date value and extract time part if exists
      const currentValue = form[name] || '';
      let timePart;
      
      if (form.is_all_day) {
        // For all-day events, use the start/end of day
        timePart = name === 'start_date' ? 'T00:00:00' : 'T23:59:59';
      } else {
        // For time-specific events, use current time or defaults
        timePart = currentValue.includes('T') 
          ? 'T' + currentValue.split('T')[1]
          : (name === 'start_date' ? 'T09:00:00' : 'T17:00:00');
      }
      
      // Combine new date with existing time
      setForm({
        ...form,
        [name]: value + timePart
      });
    } else {
      // Normal handling for other fields
      setForm({
        ...form,
        [name]: value,
      });
    }
  };

  const OnChangeSelect = (e, name) => {
    console.log(`Select changed for ${name}:`, e);
    setForm({
      ...form,
      [name]: e,
    });
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    
    // Check for duplicate files
    const uniqueFiles = newFiles.filter(
      newFile => !files.some(existingFile => existingFile.name === newFile.name)
    );

    setFiles([...files, ...uniqueFiles]);
  };

  // Remove file from upload list
  const removeFile = (index) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
  };

  // Helper to find the current project option
  const getCurrentProjectOption = () => {
    if (!form.project) return null;
    
    // If project is an object with value/label
    if (typeof form.project === 'object' && form.project.value) {
      return form.project;
    }
    
    // If project is a string ID
    if (typeof form.project === 'string') {
      // Find in projects array
      const matchingProject = projects.find(p => p.value === form.project);
      if (matchingProject) {
        return matchingProject;
      }
      
      // If not found, create a simple option
      return { value: form.project, label: `Project ${form.project.substring(0, 8)}...` };
    }
    
    // If project is an object with _id
    if (typeof form.project === 'object' && form.project._id) {
      // Find in projects array
      const matchingProject = projects.find(p => p.value === form.project._id);
      if (matchingProject) {
        return matchingProject;
      }
      
      // If not found, create from object data
      return {
        value: form.project._id,
        label: form.project.project_name || form.project.name || `Project ${form.project._id.substring(0, 8)}...`
      };
    }
    
    return null;
  };

  // Fixed and improved onSubmitHandler
  const onSubmitHandler = (e) => {
    e.preventDefault();
    
    // Prepare form data
    const formattedForm = { ...form };
  
    // Handle project field
    if (formattedForm.project) {
      console.log("Formatting project for submission:", formattedForm.project);
      
      // If project is an object with value property (from Select component)
      if (typeof formattedForm.project === 'object' && formattedForm.project.value) {
        console.log("Project is a select object with value:", formattedForm.project.value);
        formattedForm.project = formattedForm.project.value;
      }
      // If project is an object with _id property (from database)
      else if (typeof formattedForm.project === 'object' && formattedForm.project._id) {
        console.log("Project is a database object with _id:", formattedForm.project._id);
        formattedForm.project = formattedForm.project._id;
      }
      // If project is already a string ID, keep it as is
      else if (typeof formattedForm.project === 'string') {
        console.log("Project is already a string ID:", formattedForm.project);
        // No change needed
      }
    }
  
    // Handle other complex select fields
    ['priority', 'status', 'type'].forEach(field => {
      if (formattedForm[field] && typeof formattedForm[field] === 'object') {
        formattedForm[field] = formattedForm[field].value;
      }
    });
  
    // Handle assigns field
    if (formattedForm.assigns) {
      if (Array.isArray(formattedForm.assigns)) {
        // If it's already an array, map it to get IDs
        formattedForm.assigns = formattedForm.assigns.map(a => {
          return typeof a === 'object' ? (a._id || a.value) : a;
        });
      } else if (typeof formattedForm.assigns === 'object' && !Array.isArray(formattedForm.assigns)) {
        // If it's a single object, convert to array with ID
        formattedForm.assigns = [formattedForm.assigns.value || formattedForm.assigns._id];
      }
    }
  
    // Process the dates based on all-day status
    if (formattedForm.is_all_day) {
      // For all-day events, set time to start/end of day
      if (formattedForm.start_date) {
        const datePart = formattedForm.start_date.split('T')[0];
        formattedForm.start_date = `${datePart}T00:00:00`;
      }
      
      if (formattedForm.end_date) {
        const datePart = formattedForm.end_date.split('T')[0];
        formattedForm.end_date = `${datePart}T23:59:59`;
      }
    }
    
    console.log("Submitting form data:", formattedForm);
  
    // Prepare file for upload
    const fileToUpload = files.length > 0 ? files[0] : null;
  
    if (!isEditing) {
      // Create task
      dispatch(AddTaskAction(formattedForm, fileToUpload ? [fileToUpload] : [], setPopupOpen));
    } else {
      // Update task - make sure we have a valid ID
      const taskId = formattedForm._id || (taskData && taskData._id) || (_ONE && _ONE._id);
      if (!taskId) {
        console.error("Missing task ID for update operation");
        return;
      }
      dispatch(UpdateTaskAction(formattedForm, taskId, fileToUpload ? [fileToUpload] : [], setPopupOpen));
    }
  };
  
  return (
    <div
      className={`fixed left-0 top-0 z-99999 flex h-screen w-full justify-center overflow-y-auto bg-black/80 px-4 py-5 ${
        popupOpen === true ? "block" : "hidden"
      }`}
    >
      <div className="relative m-auto w-full max-w-180 rounded-sm border border-stroke bg-gray p-4 shadow-default dark:border-strokedark dark:bg-meta-4 sm:p-8 xl:p-10">
        <button
          onClick={() => {
            setPopupOpen(false);
            clearForm();
            dispatch(setRefresh(false));
          }}
          className="absolute right-1 top-1 sm:right-5 sm:top-5"
        >
          <svg
            className="fill-current"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M11.8913 9.99599L19.5043 2.38635C20.032 1.85888 20.032 1.02306 19.5043 0.495589C18.9768 -0.0317329 18.141 -0.0317329 17.6135 0.495589L10.0001 8.10559L2.38673 0.495589C1.85917 -0.0317329 1.02343 -0.0317329 0.495873 0.495589C-0.0318274 1.02306 -0.0318274 1.85888 0.495873 2.38635L8.10887 9.99599L0.495873 17.6056C-0.0318274 18.1331 -0.0318274 18.9689 0.495873 19.4964C0.717307 19.7177 1.05898 19.9001 1.4413 19.9001C1.75372 19.9001 2.13282 19.7971 2.40606 19.4771L10.0001 11.8864L17.6135 19.4964C17.8349 19.7177 18.1766 19.9001 18.5589 19.9001C18.8724 19.9001 19.2531 19.7964 19.5265 19.4737C20.0319 18.9452 20.0245 18.1256 19.5043 17.6056L11.8913 9.99599Z"
              fill=""
            />
          </svg>
        </button>
        
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white">
          {isEditing ? "Edit Task" : "Add New Task"}
        </h2>
        
        {!refresh ? (
          <div className="max-h-[80vh] overflow-y-auto">
            <form onSubmit={onSubmitHandler} className="space-y-6">
              <SelectGroup
                label={"Projects"}
                options={projects}
                disabled={isDisabled("project", roles)}
                name="project"
                action={(e) => OnChangeSelect(e, "project")}
                required={true}
                errors={content.project}
                isMulti={false}
                defaultValue={getCurrentProjectOption()}
                className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
              />
              
              <SelectGroup
                label={"Assign to"}
                options={users}
                name="assigns"
                action={(e) => OnChangeSelect(e, "assigns")}
                isMulti={true}
                required={true}
                disabled={isDisabled("assigns", roles)}
                errors={content.assigns}
                defaultValue={
                  form?.assigns
                    ? users.filter((obj1) =>
                        Array.isArray(form?.assigns)
                          ? form?.assigns.some((a) => (a._id || a) === obj1.value)
                          : (form?.assigns._id || form?.assigns) === obj1.value
                      )
                    : []
                }
                className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
              />

              <InputGroup
                label="Title"
                name="title"
                placeholder={"Task title"}
                disabled={isDisabled("title", roles)}
                action={OnChangeHandler}
                required={true}
                errors={content.title}
                defaultValue={form?.title}
                value={form?.title || ""}
                className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
              />

              <div className="mb-5">
                <label
                  htmlFor="taskDescription"
                  className="mb-2.5 block font-medium text-black dark:text-white"
                >
                  Task description <span className="text-meta-1">*</span>
                </label>
                <textarea
                  name="description"
                  onChange={OnChangeHandler}
                  cols="30"
                  rows="7"
                  value={form?.description || ""}
                  placeholder="Enter task description"
                  disabled={isDisabled("description", roles)}
                  className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                ></textarea>
                {content.description && (
                  <div className="text-sm text-red">{content.description}</div>
                )}
              </div>

              {/* All Day switch */}
              <div className="mb-5">
                <label
                  htmlFor="is_all_day"
                  className="mb-2.5 block font-medium text-black dark:text-white"
                >
                  All Day Event
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_all_day"
                    name="is_all_day"
                    checked={form?.is_all_day === undefined ? true : form?.is_all_day}
                    onChange={(e) => {
                      setForm({
                        ...form,
                        is_all_day: e.target.checked
                      });
                    }}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label htmlFor="is_all_day" className="text-sm text-gray-600 dark:text-gray-400">
                    Task spans the entire day
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="mb-5">
                  <label
                    htmlFor="start_date"
                    className="mb-2.5 block font-medium text-black dark:text-white"
                  >
                    Start Date
                  </label>
                  <div className={form?.is_all_day ? '' : 'grid grid-cols-2 gap-2'}>
                    <input
                      type="date"
                      name="start_date"
                      value={form?.start_date ? form.start_date.split('T')[0] : ""}
                      onChange={OnChangeHandler}
                      disabled={isDisabled("start_date", roles)}
                      className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                    />
                    
                    {!form?.is_all_day && (
                      <input
                        type="time"
                        name="start_time"
                        value={
                          form?.start_date && form.start_date.includes('T') 
                            ? form.start_date.split('T')[1].substring(0, 5) 
                            : "09:00"
                        }
                        onChange={(e) => {
                          // Combine date and time
                          const datePart = form?.start_date
                            ? form.start_date.split('T')[0]
                            : new Date().toISOString().split('T')[0];
                          
                          setForm({
                            ...form,
                            start_date: `${datePart}T${e.target.value}:00`
                          });
                        }}
                        disabled={isDisabled("start_date", roles)}
                        className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                      />
                    )}
                  </div>
                </div>
                
                <div className="mb-5">
                  <label
                    htmlFor="end_date"
                    className="mb-2.5 block font-medium text-black dark:text-white"
                  >
                    End Date
                  </label>
                  <div className={form?.is_all_day ? '' : 'grid grid-cols-2 gap-2'}>
                    <input
                      type="date"
                      name="end_date"
                      value={form?.end_date ? form.end_date.split('T')[0] : ""}
                      onChange={OnChangeHandler}
                      disabled={isDisabled("end_date", roles)}
                      className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                    />
                    
                    {!form?.is_all_day && (
                      <input
                        type="time"
                        name="end_time"
                        value={
                          form?.end_date && form.end_date.includes('T') 
                            ? form.end_date.split('T')[1].substring(0, 5) 
                            : "17:00"
                        }
                        onChange={(e) => {
                          // Combine date and time
                          const datePart = form?.end_date
                            ? form.end_date.split('T')[0]
                            : new Date().toISOString().split('T')[0];
                          
                          setForm({
                            ...form,
                            end_date: `${datePart}T${e.target.value}:00`
                          });
                        }}
                        disabled={isDisabled("end_date", roles)}
                        className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                      />
                    )}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <SelectGroup
                  label={"Priority"}
                  options={priority}
                  name="priority"
                  action={(e) => OnChangeSelect(e, "priority")}
                  disabled={isDisabled("priority", roles)}
                  required={true}
                  defaultValue={
                    form.priority
                      ? (() => {
                          // If priority is already an object
                          if (typeof form.priority === 'object' && form.priority.value) {
                            return form.priority;
                          }
                          // If priority is a string
                          const match = priority.find(p => p.value === form.priority);
                          return match || null;
                        })()
                      : null
                  }
                  errors={content.priority}
                  className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />

                <SelectGroup
                  label={"Status"}
                  options={status}
                  name="status"
                  disabled={isDisabled("status", roles)}
                  action={(e) => OnChangeSelect(e, "status")}
                  required={true}
                  defaultValue={
                    form.status
                      ? (() => {
                          // If status is already an object
                          if (typeof form.status === 'object' && form.status.value) {
                            return form.status;
                          }
                          // If status is a string
                          const match = status.find(p => p.value === form.status);
                          return match || null;
                        })()
                      : null
                  }
                  errors={content.status}
                  className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
              </div>

              {/* File Upload Section */}
              <div className="mb-5">
                <label
                  htmlFor="taskAttachments"
                  className="mb-2.5 block font-medium text-black dark:text-white"
                >
                  Add attachments
                </label>
                <div
                  id="FileUpload"
                  className="relative block w-full appearance-none rounded-sm border border-dashed border-stroke bg-white px-4 py-4 dark:border-strokedark dark:bg-boxdark sm:py-7"
                >
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                    onChange={handleFileUpload}
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <span className="flex h-11.5 w-11.5 items-center justify-center rounded-full border border-stroke bg-primary/5 dark:border-strokedark">
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <g clipPath="url(#clip0_75_12841)">
                          <path
                            d="M2.5 15.8333H17.5V17.5H2.5V15.8333ZM10.8333 4.85663V14.1666H9.16667V4.85663L4.1075 9.91663L2.92917 8.73829L10 1.66663L17.0708 8.73746L15.8925 9.91579L10.8333 4.85829V4.85663Z"
                            fill="#3C50E0"
                          />
                        </g>
                        <defs>
                          <clipPath id="clip0_75_12841">
                            <rect width="20" height="20" fill="white" />
                          </clipPath>
                        </defs>
                      </svg>
                    </span>
                    <p className="text-xs">
                      <span className="text-primary">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      Max file size: 5MB. Supported formats: .jpg, .png, .pdf
                    </p>
                  </div>
                </div>

                {/* Display selected files */}
                {files && files.length > 0 && (
                  <div className="mt-4.5 max-h-60 overflow-y-auto">
                    {files.map((file, index) => (
                      <div 
                        key={index} 
                        className="mb-2 flex items-center justify-between border border-stroke bg-white px-4 py-3 dark:border-strokedark dark:bg-boxdark"
                      >
                        <div className="flex items-center space-x-3">
                          <span className="truncate max-w-xs">{file.name}</span>
                          <span className="text-xs text-gray-500">
                            {(file.size / 1024).toFixed(2)} KB
                          </span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg
                            className="fill-current"
                            width="10"
                            height="10"
                            viewBox="0 0 10 10"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M0.279337 0.279338C0.651787 -0.0931121 1.25565 -0.0931121 1.6281 0.279338L9.72066 8.3719C10.0931 8.74435 10.0931 9.34821 9.72066 9.72066C9.34821 10.0931 8.74435 10.0931 8.3719 9.72066L0.279337 1.6281C-0.0931125 1.25565 -0.0931125 0.651788 0.279337 0.279338Z"
                              fill=""
                            />
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M0.279337 9.72066C-0.0931125 9.34821 -0.0931125 8.74435 0.279337 8.3719L8.3719 0.279338C8.74435 -0.0317329 9.34821 -0.0317323 9.72066 0.279338C10.0931 0.651787 10.0931 1.25565 9.72066 1.6281L1.6281 9.72066C1.25565 10.0931 0.651787 10.0931 0.279337 9.72066Z"
                              fill=""
                            />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <SelectGroup
                label={"Type"}
                options={types}
                name="type"
                disabled={isDisabled("type", roles)}
                action={(e) => OnChangeSelect(e, "type")}
                required={true}
                defaultValue={
                  form.type
                    ? (() => {
                        // If type is already an object
                        if (typeof form.type === 'object' && form.type.value) {
                          return form.type;
                        }
                        // If type is a string
                        const match = types.find(p => p.value === form.type);
                        return match || null;
                      })()
                    : null
                }
                errors={content.type}
                className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
              />

              <button
                className="flex w-full items-center justify-center gap-2 rounded bg-primary px-4.5 py-2.5 font-medium text-white hover:bg-primary-dark transition-colors duration-300"
                type="submit"
              >
                {isEditing ? "Update" : "Save"} Task
              </button>
            </form>
          </div>
        ) : (
          <div className="bg-gray-900 flex min-h-screen items-center justify-center">
            <div className="w-[200px]">
              <div className="space-y-5 rounded-2xl bg-white/5 p-4 shadow-xl shadow-black/5">
                <div className="bg-rose-100/10 h-24 rounded-lg"></div>
                <div className="space-y-3">
                  <div className="bg-rose-100/10 h-3 w-3/5 rounded-lg"></div>
                  <div className="bg-rose-100/20 h-3 w-4/5 rounded-lg"></div>
                  <div className="bg-rose-100/20 h-3 w-2/5 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskPopup;