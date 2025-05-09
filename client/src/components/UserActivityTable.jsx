// components/UserActivityTable.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserActivities } from '../redux/actions/activityActions';

const UserActivityTable = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { activities, loading } = useSelector(state => state.activity);
  
  // Local state for filtering and pagination
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  
  // Load activities when filter or page changes
  useEffect(() => {
    if (user?._id) {
      const skip = (page - 1) * limit;
      dispatch(fetchUserActivities(user._id, filter, limit, skip));
    }
  }, [dispatch, user, filter, page, limit]);
  
  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_created':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'task_completed':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-success/10 text-success">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'task_updated':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-warning/10 text-warning">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'login':
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-info/10 text-info">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-bodydark/10 text-bodydark">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };
  
  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex flex-wrap items-center justify-between border-b border-stroke dark:border-strokedark">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Activity History
        </h4>
        
        {/* Activity Filter */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-bodydark">Filter:</span>
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1); // Reset to first page when filter changes
            }}
            className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-5 outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-boxdark"
          >
            <option value="all">All Activities</option>
            <option value="task">Task Activities</option>
            <option value="login">Login Events</option>
            <option value="task_created">Task Created</option>
            <option value="task_updated">Task Updated</option>
            <option value="task_completed">Task Completed</option>
          </select>
        </div>
      </div>
      
      {/* Activity Table */}
      <div className="max-w-full overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                Activity
              </th>
              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                Type
              </th>
              <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                Time
              </th>
              <th className="py-4 px-4 font-medium text-black dark:text-white">
                Details
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" className="text-center py-6">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                  <p className="mt-2 text-bodydark">Loading activities...</p>
                </td>
              </tr>
            ) : activities.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center py-6 text-bodydark">
                  No activities found. Complete some tasks to see your activity history.
                </td>
              </tr>
            ) : (
              activities.map((activity) => (
                <tr key={activity.id}>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <div className="flex items-center gap-3">
                      {getActivityIcon(activity.type)}
                      <span className="text-black dark:text-white">
                        {activity.action}
                      </span>
                    </div>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <span className="inline-flex rounded-full bg-opacity-10 py-1 px-3 text-sm font-medium">
                      {activity.type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <span className="text-black dark:text-white">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </td>
                  <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                    <p className="text-black dark:text-white">
                      {activity.details}
                    </p>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      <div className="flex flex-wrap items-center justify-between py-4 px-6 border-t border-stroke dark:border-strokedark">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-bodydark">Show:</span>
          <select
            value={limit}
            onChange={(e) => {
              setLimit(Number(e.target.value));
              setPage(1); // Reset to first page when limit changes
            }}
            className="w-16 rounded border border-stroke bg-transparent py-1 px-2 outline-none focus:border-primary dark:border-strokedark"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="20">20</option>
            <option value="50">50</option>
          </select>
          <span className="text-sm text-bodydark">entries</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="flex items-center justify-center rounded py-1 px-3 border border-stroke bg-transparent text-bodydark disabled:opacity-50 dark:border-strokedark"
          >
            Previous
          </button>
          <button
            className="flex items-center justify-center rounded py-1 px-3 bg-primary text-white"
          >
            {page}
          </button>
          <button
            onClick={() => setPage(page + 1)}
            disabled={activities.length < limit}
            className="flex items-center justify-center rounded py-1 px-3 border border-stroke bg-transparent text-bodydark disabled:opacity-50 dark:border-strokedark"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserActivityTable;