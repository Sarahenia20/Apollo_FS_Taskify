import React, { useState, useRef, useEffect } from "react";
import TaskPopup from "./TaskPopup";
import { useDispatch, useSelector } from "react-redux";
import TaskGenerator from "./taskGenerator";
import { GetProjectsAction } from "../redux/actions/projects";
import { FindUsers } from "../redux/actions/users";
import { MOCK_PRIORITY, MOCK_STATUS, MOCK_TYPE } from "../data/mock";

const TaskHeader = ({ searchTerm, onSearchChange, filters, onFilterChange }) => {
  const [popupOpen, setPopupOpen] = useState(false);
  const [generateTaskIsOpen, setGenerateTask] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const trigger = useRef(null);
  const popup = useRef(null);
  const filterRef = useRef(null);
  const dispatch = useDispatch();
  
  // Get projects and users from Redux store
  const projects = useSelector((state) => state.projects?.projects || []);
  const users = useSelector((state) => state.users?._ALL || []);
  
  // Fetch projects and users when component mounts
  useEffect(() => {
    dispatch(GetProjectsAction());
    dispatch(FindUsers());
  }, [dispatch]);

  // Close on click outside for task popup
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!popup.current) return;
      if (
        !popupOpen ||
        popup.current.contains(target) ||
        trigger.current.contains(target)
      )
        return;
      setPopupOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!filterRef.current) return;
      if (!isFilterOpen || filterRef.current.contains(target)) return;
      setIsFilterOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // Close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!popupOpen || keyCode !== 27) return;
      setPopupOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  return (
    <div className="flex flex-col gap-y-4 rounded-sm border border-stroke bg-white p-3 shadow-default dark:border-strokedark dark:bg-boxdark sm:flex-row sm:items-center sm:justify-between">
      <div className="w-full sm:w-1/3">
        <h3 className="pl-2 text-title-lg font-semibold text-black dark:text-white">
          Tasks
        </h3>
      </div>

      {/* Search Bar */}
      <div className="w-full sm:w-1/3 relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full rounded-sm border border-stroke bg-white pl-10 pr-4 py-2 text-sm focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark"
          />
          <span className="absolute left-3 top-2.5">
            <svg
              className="fill-body dark:fill-bodydark"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.5 14.5L10.5 10.5M6.5 12.5C3.18629 12.5 0.5 9.81371 0.5 6.5C0.5 3.18629 3.18629 0.5 6.5 0.5C9.81371 0.5 12.5 3.18629 12.5 6.5C12.5 9.81371 9.81371 12.5 6.5 12.5Z"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>

      <div className="flex w-full sm:w-1/3 justify-end space-x-2">
        {/* Filter Button */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`flex items-center gap-2 rounded border px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-meta-4 ${
              Object.values(filters).some(value => value !== '') 
                ? "border-primary text-primary bg-primary/10" 
                : "border-stroke dark:border-strokedark"
            }`}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M14.5 2H1.5C1.23478 2 1 2.23478 1 2.5V3.5C1 3.76522 1.23478 4 1.5 4H14.5C14.7652 4 15 3.76522 15 3.5V2.5C15 2.23478 14.7652 2 14.5 2Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M11.5 8H4.5C4.23478 8 4 8.23478 4 8.5V9.5C4 9.76522 4.23478 10 4.5 10H11.5C11.7652 10 12 9.76522 12 9.5V8.5C12 8.23478 11.7652 8 11.5 8Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M8.5 14H7.5C7.23478 14 7 13.7652 7 13.5V12.5C7 12.2348 7.23478 12 7.5 12H8.5C8.76522 12 9 12.2348 9 12.5V13.5C9 13.7652 8.76522 14 8.5 14Z"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Filter
            {Object.values(filters).some(value => value !== '') && (
              <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-white">
                {Object.values(filters).filter(value => value !== '').length}
              </span>
            )}
          </button>

          {/* Filter Dropdown */}
          {isFilterOpen && (
            <div className="absolute right-0 top-full z-40 mt-2 w-60 rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="space-y-4">
                {/* Priority Filter */}
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Priority
                  </label>
                  <select 
                    value={filters.priority}
                    onChange={(e) => onFilterChange('priority', e.target.value)}
                    className="w-full rounded-sm border border-stroke bg-white px-3 py-2 text-sm focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark"
                  >
                    <option value="">All Priorities</option>
                    {MOCK_PRIORITY.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Type Filter */}
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Type
                  </label>
                  <select 
                    value={filters.type}
                    onChange={(e) => onFilterChange('type', e.target.value)}
                    className="w-full rounded-sm border border-stroke bg-white px-3 py-2 text-sm focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark"
                  >
                    <option value="">All Types</option>
                    {MOCK_TYPE.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label || `Type ${type.value}`}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Status Filter */}
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Status
                  </label>
                  <select 
                    value={filters.status}
                    onChange={(e) => onFilterChange('status', e.target.value)}
                    className="w-full rounded-sm border border-stroke bg-white px-3 py-2 text-sm focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark"
                  >
                    <option value="">All Statuses</option>
                    {MOCK_STATUS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Project Filter */}
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Project
                  </label>
                  <select 
                    value={filters.project}
                    onChange={(e) => onFilterChange('project', e.target.value)}
                    className="w-full rounded-sm border border-stroke bg-white px-3 py-2 text-sm focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark"
                  >
                    <option value="">All Projects</option>
                    {/* If API projects are available, use them */}
                    {projects && projects.length > 0 ? (
                      projects.map((project) => (
                        <option key={project._id} value={project._id}>
                          {project.name || project.project_name}
                        </option>
                      ))
                    ) : (
                      // Fallback to mock data if API data is not available
                      MOCK_DATA.map((project) => (
                        <option key={project.project_id} value={project.project_id}>
                          {project.project_name}
                        </option>
                      ))
                    )}
                  </select>
                </div>
                
                {/* Assigned User Filter */}
                <div>
                  <label className="mb-2.5 block text-sm font-medium text-black dark:text-white">
                    Assigned To
                  </label>
                  <select 
                    value={filters.assignedTo}
                    onChange={(e) => onFilterChange('assignedTo', e.target.value)}
                    className="w-full rounded-sm border border-stroke bg-white px-3 py-2 text-sm focus:border-primary focus-visible:outline-none dark:border-strokedark dark:bg-boxdark"
                  >
                    <option value="">All Users</option>
                    {users && users.length > 0 ? (
                      users.map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.fullName}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>Loading users...</option>
                    )}
                  </select>
                </div>
                
                {/* Reset Filters button */}
                <button
                  onClick={() => {
                    onFilterChange('priority', '');
                    onFilterChange('type', '');
                    onFilterChange('status', '');
                    onFilterChange('project', '');
                    onFilterChange('assignedTo', '');
                  }}
                  className="w-full rounded bg-primary py-2 px-4 text-white hover:bg-opacity-90"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Add Task Button */}
        <button
          ref={trigger}
          onClick={() => {
            setPopupOpen(!popupOpen);
          }}
          className="flex items-center gap-2 rounded bg-primary px-4.5 py-2 font-medium text-white hover:bg-opacity-80"
        >
          <svg
            className="fill-current"
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15 7H9V1C9 0.4 8.6 0 8 0C7.4 0 7 0.4 7 1V7H1C0.4 7 0 7.4 0 8C0 8.6 0.4 9 1 9H7V15C7 15.6 7.4 16 8 16C8.6 16 9 15.6 9 15V9H15C15.6 9 16 8.6 16 8C16 7.4 15.6 7 15 7Z"
              fill=""
            />
          </svg>
          Add task
        </button>
        
        {/* Generate Task Button */}
        <button 
          onClick={() => setGenerateTask(true)}
          className="rounded border border-stroke px-4 py-2 text-sm font-medium hover:bg-gray-100 dark:border-strokedark dark:hover:bg-meta-4"
        >
          Generate Task
        </button>
        
        {generateTaskIsOpen && 
          <TaskGenerator setGenerateTask={setGenerateTask} />
        }

        {/* <!-- Task Popup --> */}
        <TaskPopup
          popupOpen={popupOpen}
          setPopupOpen={setPopupOpen}
          popup={popup}
        />
      </div>
    </div>
  );
};

export default TaskHeader;