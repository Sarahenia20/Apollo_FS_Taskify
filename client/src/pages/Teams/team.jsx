import React, { useState, useEffect, useRef } from "react";
import DefaultLayout from "../../layout/DefaultLayout";
import Breadcrumb from "../../components/Breadcrumb";
import { useDispatch, useSelector } from "react-redux";
import { 
  AddTaskAction, 
  UpdateTaskAction, 
  DeleteTaskAction, 
  FindTaskAction,
  FindOneTaskAction
} from "../../redux/actions/tasks";
import { setRefresh } from "../../redux/reducers/commons";
import TaskPopup from "../../components/TaskPopup";
import moment from "moment";

const priorityOptions = [
  { value: "low", label: "Low", color: "bg-green-100 text-green-800" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-800" },
  { value: "high", label: "High", color: "bg-red-100 text-red-800" }
];

const statusOptions = [
  { value: "todo", label: "To Do", color: "bg-gray-100 text-gray-800" },
  { value: "in-progress", label: "In Progress", color: "bg-blue-100 text-blue-800" },
  { value: "done", label: "Done", color: "bg-purple-100 text-purple-800" }
];

const Teams = () => {
  const dispatch = useDispatch();
  const { _ALL: tasks } = useSelector((state) => state.tasks);
  const { roles } = useSelector(state => state.auth.user);

  // Popup state and refs
  const [popupOpen, setPopupOpen] = useState(false);
  const popup = useRef(null);
  const [editingId, setEditingId] = useState(null);

  // Close popup when clicking outside
  useEffect(() => {
    const clickHandler = ({ target }) => {
      if (!popup.current) return;
      if (!popupOpen || popup.current.contains(target)) return;
      setPopupOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // Close popup on ESC key
  useEffect(() => {
    const keyHandler = ({ keyCode }) => {
      if (!popupOpen || keyCode !== 27) return;
      setPopupOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  useEffect(() => {
    dispatch(FindTaskAction());
  }, [dispatch]);

  const handleCreateTask = () => {
    setEditingId(null);
    setPopupOpen(true);
  };

  const handleEditTask = (taskId) => {
    setEditingId(taskId);
    dispatch(FindOneTaskAction(taskId));
    setPopupOpen(true);
  };

  const handleDeleteTask = (taskId) => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      dispatch(DeleteTaskAction(taskId));
    }
  };

  const isDisabled = (field) => {
    if (!Array.isArray(roles) || roles.includes("ADMIN")) return false;
    if (roles.includes("CM") && field === "assigns") return false;
    if (roles.includes("ENGINEER") && field === "status") return false;
    if (roles.includes("CM")) return false;
    return true;
  };

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-5xl">
        <Breadcrumb pageName="TaskList" />

        {/* Task Header with Create Button */}
        <div className="flex flex-col gap-y-4 rounded-sm border border-stroke bg-white p-3 shadow-default dark:border-strokedark dark:bg-boxdark sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="pl-2 text-title-lg font-semibold text-black dark:text-white">
              Tasks
            </h3>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleCreateTask}
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
          </div>
        </div>

        {/* Task List */}
        <div className="mt-4 rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-4 py-4 dark:border-strokedark md:px-6 md:py-6 xl:px-7.5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-title-sm2 font-bold text-black dark:text-white">
                  Tasks List
                </h2>
              </div>
            </div>
          </div>

          <div className="px-4 py-4 md:px-6 md:py-6 xl:px-7.5">
            <div className="flex flex-col gap-6">
              {tasks?.map((task) => (
                <div key={task._id} className="flex items-center justify-between rounded border border-stroke p-4 dark:border-strokedark">
                  <div className="flex flex-grow items-center gap-4.5">
                    <div>
                      <h4 className="mb-2 font-medium text-black dark:text-white">
                        {task.title}
                      </h4>
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-1 text-xs rounded ${
                          task.priority && priorityOptions.find(p => p.value === task.priority)?.color
                        }`}>
                          {task.priority && priorityOptions.find(p => p.value === task.priority)?.label}
                        </span>
                        <span className="flex items-center gap-1 text-xs">
                          <svg
                            className="fill-current"
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M14 2.65002H12.7V2.10002C12.7 1.80002 12.45 1.52502 12.125 1.52502C11.8 1.52502 11.55 1.77502 11.55 2.10002V2.65002H4.42505V2.10002C4.42505 1.80002 4.17505 1.52502 3.85005 1.52502C3.52505 1.52502 3.27505 1.77502 3.27505 2.10002V2.65002H2.00005C1.15005 2.65002 0.425049 3.35002 0.425049 4.22502V12.925C0.425049 13.775 1.12505 14.5 2.00005 14.5H14C14.85 14.5 15.575 13.8 15.575 12.925V4.20002C15.575 3.35002 14.85 2.65002 14 2.65002ZM1.57505 7.30002H3.70005V9.77503H1.57505V7.30002ZM4.82505 7.30002H7.45005V9.77503H4.82505V7.30002ZM7.45005 10.9V13.35H4.82505V10.9H7.45005ZM8.57505 10.9H11.2V13.35H8.57505V10.9ZM8.57505 9.77503V7.30002H11.2V9.77503H8.57505ZM12.3 7.30002H14.425V9.77503H12.3V7.30002ZM2.00005 3.77502H3.30005V4.30002C3.30005 4.60002 3.55005 4.87502 3.87505 4.87502C4.20005 4.87502 4.45005 4.62502 4.45005 4.30002V3.77502H11.6V4.30002C11.6 4.60002 11.85 4.87502 12.175 4.87502C12.5 4.87502 12.75 4.62502 12.75 4.30002V3.77502H14C14.25 3.77502 14.45 3.97502 14.45 4.22502V6.17502H1.57505V4.22502C1.57505 3.97502 1.75005 3.77502 2.00005 3.77502ZM1.57505 12.9V10.875H3.70005V13.325H2.00005C1.75005 13.35 1.57505 13.15 1.57505 12.9ZM14 13.35H12.3V10.9H14.425V12.925C14.45 13.15 14.25 13.35 14 13.35Z"
                              fill=""
                            />
                          </svg>
                          <span>{moment(task.start_date).format("MMM D")} - {moment(task.end_date).format("MMM D, YYYY")}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEditTask(task._id)}
                      className="text-blue-500 hover:text-blue-700"
                      disabled={isDisabled("edit")}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTask(task._id)}
                      className="text-red-500 hover:text-red-700"
                      disabled={isDisabled("delete")}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Task Popup */}
        <TaskPopup
          popupOpen={popupOpen}
          setPopupOpen={setPopupOpen}
          popup={popup}
          editingId={editingId}
        />
      </div>
    </DefaultLayout>
  );
};

export default Teams;