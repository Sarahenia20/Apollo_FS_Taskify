import React, { useEffect, useState } from "react";
import DefaultLayout from "../layout/DefaultLayout";
import Breadcrumb from "../components/Breadcrumb";
import Dropdownk from "../components/Dropdownk";
import Drag from "../js/drag.js";
import { useDispatch, useSelector } from "react-redux";
import { FindTaskAction } from "../redux/actions/tasks";

const Kanban = () => {
  const dispatch = useDispatch();
  const [tasks, setTasks] = useState([]);
  const { _ALL, loading, error } = useSelector((state) => state.tasks);
  const authState = useSelector((state) => state.auth || {});
  const currentUserId = authState.user?._id || 
                      authState.user?.id || 
                      authState.data?._id || 
                      authState._id || 
                      authState.id || 
                      null;

  useEffect(() => {
    Drag();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      dispatch(FindTaskAction(currentUserId));
    }
  }, [dispatch, currentUserId]);

  useEffect(() => {
    setTasks(_ALL);
  }, [_ALL]);

  const onHold = tasks.filter((task) => task.status === "1");
  const inProgress = tasks.filter((task) => task.status === "2");
  const completed = tasks.filter((task) => task.status === "3");

  return (
    <DefaultLayout>
      <div className="mx-auto max-w-5xl">
        <Breadcrumb pageName="Task Kanban" />
      </div>
      {loading && <p>Loading tasks...</p>}
      {error && <p>Error: {error.message}</p>}
      {/* Task List Wrapper Start */}
      <div className="mt-9 grid grid-cols-1 gap-7.5 sm:grid-cols-2 xl:grid-cols-3">
        {/* Todo list */}
        <div className="swim-lane flex flex-col gap-5.5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            On Hold
          </h4>
          {onHold.map((t) => (
            <div
              key={t._id}
              draggable="true"
              className="task relative flex cursor-move justify-between rounded-sm border border-stroke bg-white p-7 shadow-default dark:border-strokedark dark:bg-boxdark"
            >
              <div>
                <h5 className="mb-4 text-lg font-medium text-black dark:text-white">
                  {t.title}
                </h5>
                <p>{t.start_date ? new Date(t.start_date).toLocaleDateString() : ''}</p>
              </div>
              <div className="absolute right-4 top-4">
                <Dropdownk keepDelete={false} {...t} />
              </div>
            </div>
          ))}
        </div>

        {/* Progress list */}
        <div className="swim-lane flex flex-col gap-5.5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            In Progress
          </h4>
          {inProgress.map((t) => (
            <div
              key={t._id}
              draggable="true"
              className="task relative flex cursor-move justify-between rounded-sm border border-stroke bg-white p-7 shadow-default dark:border-strokedark dark:bg-boxdark"
            >
              <div>
                <h5 className="mb-4 text-lg font-medium text-black dark:text-white">
                  {t.title}
                </h5>
                <p>{t.start_date ? new Date(t.start_date).toLocaleDateString() : ''}</p>
              </div>
              <div className="absolute right-4 top-4">
                <Dropdownk keepDelete={false} {...t} />
              </div>
            </div>
          ))}
        </div>

        {/* QA list */}
        <div className="swim-lane flex flex-col gap-5.5">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Completed
          </h4>
          {completed.map((t) => (
            <div
              key={t._id}
              draggable="true"
              className="task relative flex cursor-move justify-between rounded-sm border border-stroke bg-white p-7 shadow-default dark:border-strokedark dark:bg-boxdark"
            >
              <div>
                <h5 className="mb-4 text-lg font-medium text-black dark:text-white">
                  {t.title}
                </h5>
                <p>{t.start_date ? new Date(t.start_date).toLocaleDateString() : ''}</p>
              </div>
              <div className="absolute right-4 top-4">
                <Dropdownk keepDelete={false} {...t} />
              </div>
            </div>
          ))}
       
        </div>
      </div>
      {/* Task List Wrapper End */}
    </DefaultLayout>
  );
};

export default Kanban;