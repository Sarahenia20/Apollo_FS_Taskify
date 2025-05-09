// components/TaskAnalyticsPanel.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardSummary } from '../redux/actions/activityActions';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';

const TaskAnalyticsPanel = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { dashboardSummary: metrics, loading } = useSelector(state => state.activity);
  
  // Load dashboard metrics when component mounts
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchDashboardSummary(user._id));
    }
  }, [dispatch, user]);
  
  // Chart colors
  const COLORS = ['#38BDF8', '#34D399', '#FB7185', '#F59E0B'];
  
  // Generate task status data for pie chart
  const getTaskStatusData = () => {
    if (!metrics) return [];
    
    return [
      { name: 'Completed', value: metrics.completedTasks || 0, color: '#34D399' },
      { name: 'In Progress', value: metrics.inProgressTasks || 0, color: '#38BDF8' }
    ];
  };
  
  // Generate mock completion trend data if not available from API
  const getCompletionTrendData = () => {
    // In a real implementation, this would come from your API
    return [
      { day: 'Mon', completed: 3, started: 2 },
      { day: 'Tue', completed: 2, started: 4 },
      { day: 'Wed', completed: 5, started: 3 },
      { day: 'Thu', completed: 4, started: 2 },
      { day: 'Fri', completed: 6, started: 4 },
      { day: 'Sat', completed: 2, started: 1 },
      { day: 'Sun', completed: 1, started: 2 }
    ];
  };
  
  // Format metric value with dynamic colors based on value
  const formatMetric = (value, thresholds = { low: 30, medium: 70 }) => {
    if (typeof value !== 'number') return 'N/A';
    
    let colorClass = 'text-success';
    if (value < thresholds.low) {
      colorClass = 'text-danger';
    } else if (value < thresholds.medium) {
      colorClass = 'text-warning';
    }
    
    return <span className={colorClass}>{value}%</span>;
  };
  
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex flex-wrap items-center justify-between border-b border-stroke dark:border-strokedark">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Task Analytics
        </h4>
        
        {/* Time Period Selector (could be added later) */}
      </div>
      
      <div className="p-4 md:p-6 xl:p-7.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-bodydark">Loading analytics...</p>
          </div>
        ) : !metrics ? (
          <div className="text-center py-16 text-bodydark">
            No task analytics available. Complete some tasks to see data.
          </div>
        ) : (
          <>
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {/* Task Completion Rate */}
              <div className="rounded-sm border border-stroke p-4 shadow-default dark:border-strokedark">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-bodydark">Completion Rate</span>
                    <h4 className="text-2xl font-bold text-black dark:text-white mt-1">
                      {formatMetric(metrics.completionRate)}
                    </h4>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="bg-primary/5 text-primary text-xs py-0.5 px-2 rounded-full">
                    {metrics.completedTasks} of {metrics.totalTasks} tasks
                  </span>
                </div>
              </div>
              
              {/* In Progress Tasks */}
              <div className="rounded-sm border border-stroke p-4 shadow-default dark:border-strokedark">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-bodydark">In Progress</span>
                    <h4 className="text-2xl font-bold text-black dark:text-white mt-1">
                      {metrics.inProgressTasks || 0}
                    </h4>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-warning/10 text-warning">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="bg-warning/5 text-warning text-xs py-0.5 px-2 rounded-full">
                    Active tasks
                  </span>
                </div>
              </div>
              
              {/* Activities Today */}
              <div className="rounded-sm border border-stroke p-4 shadow-default dark:border-strokedark">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-bodydark">Activities Today</span>
                    <h4 className="text-2xl font-bold text-black dark:text-white mt-1">
                      {metrics.activitiesToday || 0}
                    </h4>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className={`text-xs py-0.5 px-2 rounded-full ${metrics.activityChange >= 0 ? 'bg-success/5 text-success' : 'bg-danger/5 text-danger'}`}>
                    {metrics.activityChange >= 0 ? '+' : ''}{metrics.activityChange || 0}% vs yesterday
                  </span>
                </div>
              </div>
              
              {/* Latest Activity */}
              <div className="rounded-sm border border-stroke p-4 shadow-default dark:border-strokedark">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm text-bodydark">Latest Activity</span>
                    <h4 className="text-xl font-bold text-black dark:text-white mt-1">
                      {metrics.latestLogin ? new Date(metrics.latestLogin).toLocaleDateString() : 'N/A'}
                    </h4>
                  </div>
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-info/10 text-info">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  <span className="bg-info/5 text-info text-xs py-0.5 px-2 rounded-full">
                    {metrics.latestLogin ? new Date(metrics.latestLogin).toLocaleTimeString() : 'No activity'}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Task Status Distribution */}
              <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h5 className="mb-3 text-lg font-medium text-black dark:text-white">
                  Task Status Distribution
                </h5>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={getTaskStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {getTaskStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center mt-2">
                  <div className="flex items-center gap-x-8">
                    <div className="flex items-center gap-x-2">
                      <span className="block h-3 w-3 rounded-full bg-success"></span>
                      <span className="text-sm font-medium text-black dark:text-white">Completed</span>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <span className="block h-3 w-3 rounded-full bg-primary"></span>
                      <span className="text-sm font-medium text-black dark:text-white">In Progress</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Weekly Task Trends */}
              <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h5 className="mb-3 text-lg font-medium text-black dark:text-white">
                  Weekly Task Trends
                </h5>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={getCompletionTrendData()}
                      margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="completed" stroke="#34D399" activeDot={{ r: 8 }} />
                      <Line type="monotone" dataKey="started" stroke="#38BDF8" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex justify-center mt-2">
                  <div className="flex items-center gap-x-8">
                    <div className="flex items-center gap-x-2">
                      <span className="block h-3 w-3 rounded-full bg-success"></span>
                      <span className="text-sm font-medium text-black dark:text-white">Completed</span>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <span className="block h-3 w-3 rounded-full bg-primary"></span>
                      <span className="text-sm font-medium text-black dark:text-white">Started</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Performance Insights */}
            <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark mt-6">
              <h5 className="mb-3 text-lg font-medium text-black dark:text-white">
                Performance Insights
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col">
                  <span className="text-sm text-bodydark">Completion Efficiency</span>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-bodydark2/30 rounded-full h-2">
                      <div 
                        className="bg-success rounded-full h-2 transition-all duration-500" 
                        style={{ width: `${metrics.completionRate || 0}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {formatMetric(metrics.completionRate)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-bodydark">
                    {metrics.completionRate >= 70 ? 'Excellent completion rate!' : 
                     metrics.completionRate >= 40 ? 'Good progress, keep going!' : 
                     'Focus on completing more tasks'}
                  </p>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-bodydark">Task Velocity</span>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-bodydark2/30 rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-500" 
                        style={{ width: `${Math.min((metrics.activitiesToday || 0) * 10, 100)}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {metrics.activitiesToday || 0} today
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-bodydark">
                    {(metrics.activitiesToday || 0) > 5 ? 'High activity level today!' : 
                     (metrics.activitiesToday || 0) > 2 ? 'Moderate activity today' : 
                     'Low activity today'}
                  </p>
                </div>
                
                <div className="flex flex-col">
                  <span className="text-sm text-bodydark">Task Balance</span>
                  <div className="flex items-center mt-2">
                    <div className="w-full bg-bodydark2/30 rounded-full h-2">
                      <div 
                        className="bg-warning rounded-full h-2 transition-all duration-500" 
                        style={{ width: `${Math.min(((metrics.inProgressTasks || 0) / Math.max((metrics.totalTasks || 1), 1)) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <span className="ml-2 text-sm font-medium">
                      {metrics.inProgressTasks || 0} active
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-bodydark">
                    {(metrics.inProgressTasks || 0) > 5 ? 'Many tasks in progress. Consider focusing.' : 
                     (metrics.inProgressTasks || 0) > 2 ? 'Good number of active tasks' : 
                     'Few active tasks. Room to take on more!'}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskAnalyticsPanel;