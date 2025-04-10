import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { FindUsers } from "../redux/actions/users";
import { AddTaskAction, UpdateTaskAction } from "../redux/actions/tasks";
import { _FindOneTask } from "../redux/reducers/tasks";
import { setRefresh } from "../redux/reducers/commons";
import SelectGroup from "./form/SelectGroup";
import InputGroup from "./form/InputGroup";
import { MOCK_DATA, MOCK_PRIORITY, MOCK_STATUS, MOCK_TYPE } from "../data/mock";

const TaskPopup = ({ popupOpen, setPopupOpen, taskData = null, isEditMode = false }) => {
  const [users, setUsers] = useState([]);
  const [files, setFiles] = useState([]);
  
  // Redux state
  const { roles } = useSelector(s => s.auth.user);
  const { _ALL } = useSelector((state) => state.users);
  const { _ONE } = useSelector((state) => state.tasks);
  const { content } = useSelector((state) => state.errors);
  const { refresh } = useSelector((state) => state.commons);
  const dispatch = useDispatch();

  // Form state with better initial values
  const [form, setForm] = useState({
    title: "",
    description: "",
    is_all_day: true,
    start_date: "",
    end_date: "",
    priority: "2",
    status: "1",
    type: "1",
    assigns: [],
    project: null
  });

  // Format data for select dropdowns
  const projects = MOCK_DATA.map(p => ({ value: p.project_id, label: p.project_name }));
  const types = MOCK_TYPE.map(p => ({ value: p.value, label: p.label }));
  const priority = MOCK_PRIORITY.map(p => ({ label: p.label, value: p.value }));
  const status = MOCK_STATUS.map(p => ({ value: p.value, label: p.label }));

  // Initialize form when popup opens or taskData changes
  // In TaskPopup component
useEffect(() => {
  if (popupOpen) {
    if (isEditMode) {
      console.log("Initializing edit form with taskData:", taskData);
      const sourceData = taskData || _ONE;
      
      if (sourceData && sourceData._id) {
        const formattedData = {
          ...sourceData,
          start_date: sourceData.start_date 
            ? new Date(sourceData.start_date).toISOString().slice(0, 16)
            : '',
          end_date: sourceData.end_date 
            ? new Date(sourceData.end_date).toISOString().slice(0, 16)
            : '',
          project: sourceData.project 
            ? { value: sourceData.project._id, label: sourceData.project.name }
            : null,
          assigns: sourceData.assigns 
            ? sourceData.assigns.map(a => ({ 
                value: a._id, 
                label: a.name,
                ...a 
              }))
            : []
        };
        console.log("Formatted edit data:", formattedData);
        setForm(formattedData);
      }
    } else {
      // New task defaults
      setForm({
        title: "",
        description: "",
        is_all_day: true,
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        priority: "2",
        status: "1",
        type: "1",
        assigns: [],
        project: null
      });
    }
  }
}, [popupOpen, isEditMode, taskData, _ONE]);

  // Format task data for form inputs
  const formatTaskDataForForm = (task) => {
    const formatted = { ...task };
    
    // Format dates
    if (formatted.start_date) {
      formatted.start_date = new Date(formatted.start_date).toISOString().slice(0, 16);
    }
    if (formatted.end_date) {
      formatted.end_date = new Date(formatted.end_date).toISOString().slice(0, 16);
    }
    
    // Ensure required fields exist
    formatted.is_all_day = formatted.is_all_day !== undefined ? formatted.is_all_day : true;
    formatted.priority = formatted.priority || "2";
    formatted.status = formatted.status || "1";
    formatted.type = formatted.type || "1";
    
    return formatted;
  };

  // Fetch users when component mounts
  useEffect(() => {
    dispatch(FindUsers());
  }, [dispatch]);

  // Format users for select dropdown
  useEffect(() => {
    if (_ALL?.length > 0) {
      const formattedUsers = _ALL.map(u => ({
        value: u._id,
        label: (
          <p className="flex h-[30px] items-center space-x-2 p-1">
            <img
              src={u.picture ? 
                (u.picture.includes("https") ? u.picture : `http://localhost:5500/${u.picture}`) 
                : ""}
              alt={u.fullName}
              className="h-[30px] w-auto rounded-full"
            />
            {u.fullName}
          </p>
        ),
      }));
      setUsers(formattedUsers);
    }
  }, [_ALL]);
// Improved form initialization
useEffect(() => {
  if (popupOpen) {
    if (isEditMode) {
      console.log("Initializing edit form with taskData:", taskData);
      const sourceData = taskData || _ONE;
      
      if (sourceData && sourceData._id) {
        const formattedData = {
          ...sourceData,
          // Convert dates to local format
          start_date: sourceData.start_date 
            ? new Date(sourceData.start_date).toISOString().slice(0, 16)
            : '',
          end_date: sourceData.end_date 
            ? new Date(sourceData.end_date).toISOString().slice(0, 16)
            : '',
          // Ensure selects have proper format
          project: sourceData.project 
            ? { value: sourceData.project._id, label: sourceData.project.name }
            : null,
          assigns: sourceData.assigns 
            ? sourceData.assigns.map(a => ({ 
                value: a._id, 
                label: a.name,
                ...a 
              }))
            : []
        };
        console.log("Formatted edit data:", formattedData);
        setForm(formattedData);
      }
    } else {
      // New task defaults
      setForm({
        title: "",
        description: "",
        is_all_day: true,
        start_date: new Date().toISOString().slice(0, 16),
        end_date: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
        priority: "2",
        status: "1",
        type: "1",
        assigns: [],
        project: null
      });
    }
  }
}, [popupOpen, isEditMode, taskData, _ONE]);
  // Check if field should be disabled based on user role
  const isDisabled = (field, userRoles) => {
    if (!Array.isArray(userRoles)) return false;
    if (userRoles.includes("ADMIN")) return false;
    if (userRoles.includes("MANAGER") && field === "assigns") return false;
    if (userRoles.includes("DESIGNER") && field === "status") return false;
    if (userRoles.includes("CM")) return false;
    return true;
  };

  // Reset form when popup closes
  const clearForm = () => {
    setForm({
      title: "",
      description: "",
      is_all_day: true,
      start_date: "",
      end_date: "",
      priority: "2",
      status: "1",
      type: "1",
      assigns: [],
      project: null
    });
    setFiles([]);
    dispatch(_FindOneTask({}));
  };

  // Form field handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (selected, name) => {
    setForm(prev => ({ ...prev, [name]: selected }));
  };

  // File upload handlers
  const handleFileUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    const uniqueFiles = newFiles.filter(
      newFile => !files.some(existingFile => existingFile.name === newFile.name)
    );
    setFiles(prev => [...prev, ...uniqueFiles]);
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    dispatch(setRefresh(true));

    try {
      // Prepare form data
      const formattedData = prepareFormData(form);
      
      if (isEditMode) {
        const taskId = formattedData._id || (taskData && taskData._id) || (_ONE && _ONE._id);
        if (!taskId) throw new Error("Missing task ID for update");
        
        await dispatch(UpdateTaskAction(
          formattedData, 
          taskId, 
          files.length > 0 ? [files[0]] : [], 
          setPopupOpen
        ));
      } else {
        await dispatch(AddTaskAction(
          formattedData, 
          files.length > 0 ? [files[0]] : [], 
          setPopupOpen
        ));
      }
      
      // Close popup on success
      setPopupOpen(false);
      clearForm();
    } catch (error) {
      console.error("Task operation failed:", error);
    } finally {
      dispatch(setRefresh(false));
    }
  };

  // Prepare form data for API submission
  const prepareFormData = (formData) => {
    const prepared = { ...formData };
    
    // Handle select fields
    ['project', 'priority', 'status', 'type'].forEach(field => {
      if (prepared[field] && typeof prepared[field] === 'object') {
        prepared[field] = prepared[field].value;
      }
    });
    
    // Handle assigns field
    if (prepared.assigns) {
      prepared.assigns = Array.isArray(prepared.assigns) 
        ? prepared.assigns.map(a => a._id || a.value || a)
        : [prepared.assigns._id || prepared.assigns.value || prepared.assigns];
    }
    
    // Handle dates based on all-day setting
    if (prepared.is_all_day) {
      if (prepared.start_date) {
        const datePart = prepared.start_date.split('T')[0];
        prepared.start_date = `${datePart}T00:00:00`;
      }
      if (prepared.end_date) {
        const datePart = prepared.end_date.split('T')[0];
        prepared.end_date = `${datePart}T23:59:59`;
      }
    } else {
      // Ensure time is included for non-all-day events
      if (prepared.start_date && !prepared.start_date.includes('T')) {
        prepared.start_date = `${prepared.start_date}T09:00:00`;
      }
      if (prepared.end_date && !prepared.end_date.includes('T')) {
        prepared.end_date = `${prepared.end_date}T17:00:00`;
      }
    }
    
    return prepared;
  };

  if (!popupOpen) return null;

  return (
    <div className="fixed left-0 top-0 z-99999 flex h-screen w-full justify-center overflow-y-auto bg-black/80 px-4 py-5">
      <div className="relative m-auto w-full max-w-180 rounded-sm border border-stroke bg-gray p-4 shadow-default dark:border-strokedark dark:bg-meta-4 sm:p-8 xl:p-10">
        <button
          onClick={() => {
            setPopupOpen(false);
            clearForm();
          }}
          className="absolute right-1 top-1 sm:right-5 sm:top-5"
        >
          <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" clipRule="evenodd" d="M11.8913 9.99599L19.5043 2.38635C20.032 1.85888 20.032 1.02306 19.5043 0.495589C18.9768 -0.0317329 18.141 -0.0317329 17.6135 0.495589L10.0001 8.10559L2.38673 0.495589C1.85917 -0.0317329 1.02343 -0.0317329 0.495873 0.495589C-0.0318274 1.02306 -0.0318274 1.85888 0.495873 2.38635L8.10887 9.99599L0.495873 17.6056C-0.0318274 18.1331 -0.0318274 18.9689 0.495873 19.4964C0.717307 19.7177 1.05898 19.9001 1.4413 19.9001C1.75372 19.9001 2.13282 19.7971 2.40606 19.4771L10.0001 11.8864L17.6135 19.4964C17.8349 19.7177 18.1766 19.9001 18.5589 19.9001C18.8724 19.9001 19.2531 19.7964 19.5265 19.4737C20.0319 18.9452 20.0245 18.1256 19.5043 17.6056L11.8913 9.99599Z" fill="" />
          </svg>
        </button>
        
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white">
          {isEditMode ? "Edit Task" : "Add New Task"}
        </h2>
        
        {!refresh ? (
          <div className="max-h-[80vh] overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Project Select */}
              <SelectGroup
                label="Projects"
                options={projects}
                disabled={isDisabled("project", roles)}
                name="project"
                action={handleSelectChange}
                required={true}
                errors={content.project}
                isMulti={false}
                defaultValue={form.project ? projects.filter(p => p.value == form.project) : []}
              />
              
              {/* Assignees Select */}
              <SelectGroup
                label="Assign to"
                options={users}
                name="assigns"
                action={handleSelectChange}
                isMulti={true}
                required={true}
                disabled={isDisabled("assigns", roles)}
                errors={content.assigns}
                defaultValue={
                  form.assigns
                    ? users.filter(u => 
                        Array.isArray(form.assigns)
                          ? form.assigns.some(a => (a._id || a) === u.value)
                          : (form.assigns._id || form.assigns) === u.value
                      )
                    : []
                }
              />

              {/* Title Input */}
              <InputGroup
                label="Title"
                name="title"
                placeholder="Task title"
                disabled={isDisabled("title", roles)}
                action={handleInputChange}
                required={true}
                errors={content.title}
                value={form.title || ""}
              />

              {/* Description Textarea */}
              <div className="mb-5">
                <label htmlFor="description" className="mb-2.5 block font-medium text-black dark:text-white">
                  Task description <span className="text-meta-1">*</span>
                </label>
                <textarea
                  name="description"
                  onChange={handleInputChange}
                  cols="30"
                  rows="7"
                  value={form.description || ""}
                  placeholder="Enter task description"
                  disabled={isDisabled("description", roles)}
                  className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                />
                {content.description && <div className="text-sm text-red">{content.description}</div>}
              </div>

              {/* All Day Toggle */}
              <div className="mb-5">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  All Day Event
                </label>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={form.is_all_day}
                    onChange={(e) => setForm(prev => ({ ...prev, is_all_day: e.target.checked }))}
                    className="mr-2 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Task spans the entire day
                  </span>
                </div>
              </div>

              {/* Date/Time Fields */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Start Date/Time */}
                <div className="mb-5">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    Start Date
                  </label>
                  <div className={form.is_all_day ? '' : 'grid grid-cols-2 gap-2'}>
                    <input
                      type="date"
                      name="start_date"
                      value={form.start_date ? form.start_date.split('T')[0] : ""}
                      onChange={handleInputChange}
                      disabled={isDisabled("start_date", roles)}
                      className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                    />
                    {!form.is_all_day && (
                      <input
                        type="time"
                        value={
                          form.start_date && form.start_date.includes('T') 
                            ? form.start_date.split('T')[1].substring(0, 5) 
                            : "09:00"
                        }
                        onChange={(e) => {
                          const datePart = form.start_date?.split('T')[0] || new Date().toISOString().split('T')[0];
                          setForm(prev => ({
                            ...prev,
                            start_date: `${datePart}T${e.target.value}:00`
                          }));
                        }}
                        disabled={isDisabled("start_date", roles)}
                        className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                      />
                    )}
                  </div>
                </div>
                
                {/* End Date/Time */}
                <div className="mb-5">
                  <label className="mb-2.5 block font-medium text-black dark:text-white">
                    End Date
                  </label>
                  <div className={form.is_all_day ? '' : 'grid grid-cols-2 gap-2'}>
                    <input
                      type="date"
                      name="end_date"
                      value={form.end_date ? form.end_date.split('T')[0] : ""}
                      onChange={handleInputChange}
                      disabled={isDisabled("end_date", roles)}
                      className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                    />
                    {!form.is_all_day && (
                      <input
                        type="time"
                        value={
                          form.end_date && form.end_date.includes('T') 
                            ? form.end_date.split('T')[1].substring(0, 5) 
                            : "17:00"
                        }
                        onChange={(e) => {
                          const datePart = form.end_date?.split('T')[0] || new Date().toISOString().split('T')[0];
                          setForm(prev => ({
                            ...prev,
                            end_date: `${datePart}T${e.target.value}:00`
                          }));
                        }}
                        disabled={isDisabled("end_date", roles)}
                        className="w-full rounded-sm border border-stroke bg-white px-4.5 py-3 focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark dark:focus:border-primary"
                      />
                    )}
                  </div>
                </div>
              </div>
              
              {/* Priority and Status */}
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <SelectGroup
                  label="Priority"
                  options={priority}
                  name="priority"
                  action={handleSelectChange}
                  disabled={isDisabled("priority", roles)}
                  required={true}
                  defaultValue={form.priority ? priority.filter(p => p.value == form.priority) : []}
                  errors={content.priority}
                />

                <SelectGroup
                  label="Status"
                  options={status}
                  name="status"
                  disabled={isDisabled("status", roles)}
                  action={handleSelectChange}
                  required={true}
                  defaultValue={form.status ? status.filter(p => p.value == form.status) : []}
                  errors={content.status}
                />
              </div>

              {/* File Upload Section */}
              <div className="mb-5">
                <label className="mb-2.5 block font-medium text-black dark:text-white">
                  Add attachments
                </label>
                <div className="relative block w-full appearance-none rounded-sm border border-dashed border-stroke bg-white px-4 py-4 dark:border-strokedark dark:bg-boxdark sm:py-7">
                  <input
                    type="file"
                    multiple
                    className="absolute inset-0 z-50 m-0 h-full w-full cursor-pointer p-0 opacity-0 outline-none"
                    onChange={handleFileUpload}
                  />
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <span className="flex h-11.5 w-11.5 items-center justify-center rounded-full border border-stroke bg-primary/5 dark:border-strokedark">
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <g clipPath="url(#clip0_75_12841)">
                          <path d="M2.5 15.8333H17.5V17.5H2.5V15.8333ZM10.8333 4.85663V14.1666H9.16667V4.85663L4.1075 9.91663L2.92917 8.73829L10 1.66663L17.0708 8.73746L15.8925 9.91579L10.8333 4.85829V4.85663Z" fill="#3C50E0" />
                        </g>
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
                {files.length > 0 && (
                  <div className="mt-4.5 max-h-60 overflow-y-auto">
                    {files.map((file, index) => (
                      <div key={index} className="mb-2 flex items-center justify-between border border-stroke bg-white px-4 py-3 dark:border-strokedark dark:bg-boxdark">
                        <div className="flex items-center space-x-3">
                          <span className="truncate max-w-xs">{file.name}</span>
                          <span className="text-xs text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                        </div>
                        <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                          <svg className="fill-current" width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0.279337 0.279338C0.651787 -0.0931121 1.25565 -0.0931121 1.6281 0.279338L9.72066 8.3719C10.0931 8.74435 10.0931 9.34821 9.72066 9.72066C9.34821 10.0931 8.74435 10.0931 8.3719 9.72066L0.279337 1.6281C-0.0931125 1.25565 -0.0931125 0.651788 0.279337 0.279338Z" fill="" />
                            <path fillRule="evenodd" clipRule="evenodd" d="M0.279337 9.72066C-0.0931125 9.34821 -0.0931125 8.74435 0.279337 8.3719L8.3719 0.279338C8.74435 -0.0317329 9.34821 -0.0317323 9.72066 0.279338C10.0931 0.651787 10.0931 1.25565 9.72066 1.6281L1.6281 9.72066C1.25565 10.0931 0.651787 10.0931 0.279337 9.72066Z" fill="" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Task Type */}
              <SelectGroup
                label="Type"
                options={types}
                name="type"
                disabled={isDisabled("type", roles)}
                action={handleSelectChange}
                required={true}
                defaultValue={form.type ? types.filter(p => p.value == form.type) : []}
                errors={content.type}
              />

              {/* Submit Button */}
              <button
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded bg-primary px-4.5 py-2.5 font-medium text-white hover:bg-primary-dark transition-colors duration-300"
              >
                {isEditMode ? "Update Task" : "Create Task"}
              </button>
            </form>
          </div>
        ) : (
          <div className="flex min-h-screen items-center justify-center bg-gray-900">
            <div className="w-[200px]">
              <div className="space-y-5 rounded-2xl bg-white/5 p-4 shadow-xl shadow-black/5">
                <div className="h-24 rounded-lg bg-rose-100/10"></div>
                <div className="space-y-3">
                  <div className="h-3 w-3/5 rounded-lg bg-rose-100/10"></div>
                  <div className="h-3 w-4/5 rounded-lg bg-rose-100/20"></div>
                  <div className="h-3 w-2/5 rounded-lg bg-rose-100/20"></div>
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