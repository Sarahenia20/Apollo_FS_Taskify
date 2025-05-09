// components/TaskPriorityWizard.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTaskPriorities } from '../redux/actions/activityActions';
import { Link } from 'react-router-dom'; // Import this if you're using React Router

const TaskPriorityWizard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { taskPriorities, loading } = useSelector(state => state.activity);
  
  // Load task priorities when component mounts
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchTaskPriorities(user._id));
    }
  }, [dispatch, user]);
  
  // Get priority badge styling
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case "4": // Critical
        return <span className="inline-flex rounded-full bg-danger py-1 px-2 text-xs text-white">Critical</span>;
      case "3": // High
        return <span className="inline-flex rounded-full bg-warning py-1 px-2 text-xs text-white">High</span>;
      case "2": // Medium
        return <span className="inline-flex rounded-full bg-primary py-1 px-2 text-xs text-white">Medium</span>;
      case "1": // Low
        return <span className="inline-flex rounded-full bg-success py-1 px-2 text-xs text-white">Low</span>;
      default:
        return <span className="inline-flex rounded-full bg-gray-2 py-1 px-2 text-xs text-bodydark">Unknown</span>;
    }
  };
  
  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "No due date";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  };
  
  // Calculate days until due
  const getDaysUntilDue = (dateString) => {
    if (!dateString) return null;
    
    const dueDate = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return <span className="text-danger font-medium">Overdue by {Math.abs(diffDays)} days</span>;
    } else if (diffDays === 0) {
      return <span className="text-warning font-medium">Due today</span>;
    } else if (diffDays === 1) {
      return <span className="text-warning font-medium">Due tomorrow</span>;
    } else {
      return <span className="text-success">Due in {diffDays} days</span>;
    }
  };
  
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex flex-wrap items-center justify-between border-b border-stroke px-6 py-4 dark:border-strokedark">
        <h3 className="text-xl font-semibold text-black dark:text-white">
          Task Priority Wizard
        </h3>
        
        <button
          onClick={() => dispatch(fetchTaskPriorities(user?._id))}
          disabled={loading}
          className="inline-flex items-center justify-center rounded-full bg-primary/10 py-2 px-4 text-sm font-medium text-primary hover:bg-opacity-90 disabled:bg-opacity-50"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Analyzing
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh Priorities
            </>
          )}
        </button>
      </div>
      
      <div className="p-6">
        <div className="mb-6">
          <p className="text-base text-bodydark">
            Our AI analyzes your tasks based on due dates, priority levels, and task relationships to recommend what you should focus on next.
          </p>
        </div>
        
        {loading ? (
          <div className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-sm text-bodydark">Analyzing your tasks...</p>
          </div>
        ) : taskPriorities.length === 0 ? (
          <div className="bg-gray-2 dark:bg-meta-4 rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-bodydark" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h4 className="mt-4 text-lg font-medium text-black dark:text-white">
              No In-Progress Tasks
            </h4>
            <p className="mt-2 text-bodydark">
              You don't have any in-progress tasks to prioritize.
            </p>
            <Link
              to="/projects/task-list" // Adjust this to your task creation page route
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-white transition hover:bg-opacity-90"
            >
              Create a Task
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-primary/5 rounded-lg p-4 border-l-4 border-primary">
              <h4 className="text-lg font-medium text-black dark:text-white mb-1">
                Task Priority Recommendations
              </h4>
              <p className="text-sm text-bodydark mb-2">
                Here are your tasks in recommended order of completion:
              </p>
            </div>
            
            {taskPriorities.map((task, index) => (
              <div 
                key={task.id}
                className={`rounded-lg border ${index === 0 ? 'border-primary' : 'border-stroke dark:border-strokedark'} p-4 transition-all hover:shadow-sm`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <h5 className="text-base font-medium text-black dark:text-white">
                    {index === 0 && (
                      <span className="inline-flex rounded-full bg-primary py-1 px-2 text-xs text-white mr-2">
                        Recommended
                      </span>
                    )}
                    {task.title}
                  </h5>
                  {getPriorityBadge(task.priority)}
                </div>
                
                <div className="flex flex-wrap gap-x-8 gap-y-2 mt-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-bodydark mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-bodydark">
                      {formatDate(task.dueDate)}
                    </span>
                  </div>
                  
                  {task.dueDate && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-bodydark mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-sm">
                        {getDaysUntilDue(task.dueDate)}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-sm text-bodydark">
                  <span className="font-medium text-black dark:text-white">Why prioritize this: </span>
                  {task.reason}
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Link
                    to={`/tasks/${task.id}`} // Adjust this to your task details page route
                    className="inline-flex items-center justify-center rounded border border-primary py-1 px-3 text-sm font-medium text-primary hover:bg-primary hover:text-white"
                  >
                    View Task
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskPriorityWizard;