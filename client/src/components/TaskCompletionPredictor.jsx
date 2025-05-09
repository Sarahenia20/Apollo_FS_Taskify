// src/components/TaskCompletionPredictor.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FindTaskAction } from '../redux/actions/tasks';
import { SET_ALL_TASK_PREDICTIONS, SET_USER_PRODUCTIVITY } from '../redux/reducers/predictions';

const TaskCompletionPredictor = () => {
  const dispatch = useDispatch();
  
  // Get data from Redux
  const tasks = useSelector(state => state.tasks._ALL || []);
  const users = useSelector(state => state.users._ALL || []);
  const refresh = useSelector(state => state.commons?.refresh);
  
  // Local state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  // Fetch tasks once on component mount
  useEffect(() => {
    const loadData = async () => {
      if (tasks.length === 0 || refresh) {
        console.log("Fetching tasks for prediction...");
        setLoading(true);
        
        try {
          await dispatch(FindTaskAction());
          setError(null);
        } catch (err) {
          console.error("Error fetching tasks:", err);
          setError("Error loading task data");
        } finally {
          setLoading(false);
          setInitialized(true);
        }
      } else {
        // If we already have tasks
        setLoading(false);
        setInitialized(true);
      }
    };
    
    loadData();
  }, [dispatch, refresh]);
  
  // Generate predictions only once when data is available and after initialization
  useEffect(() => {
    if (initialized && tasks.length > 0 && users.length > 0) {
      console.log(`Generating predictions once from ${tasks.length} tasks and ${users.length} users`);
      generatePredictionsFromData();
    }
  }, [initialized, tasks.length, users.length]);
  
  // Use memoization to prevent unnecessary calculations
  const taskAssignmentMap = useMemo(() => {
    // Create a map of user IDs to their assigned tasks
    const assignmentMap = {};
    
    tasks.forEach(task => {
      if (task.assigns && Array.isArray(task.assigns)) {
        task.assigns.forEach(userId => {
          if (!assignmentMap[userId]) {
            assignmentMap[userId] = [];
          }
          assignmentMap[userId].push(task);
        });
      }
    });
    
    return assignmentMap;
  }, [tasks]);
  
  // This function handles generating predictions from available data
  const generatePredictionsFromData = () => {
    // Filter active tasks (not completed)
    const activeTasks = tasks.filter(task => task.status !== '4');
    
    // Generate task predictions
    const taskPredictions = activeTasks.map(task => {
      // Base duration by task type (days)
      const typeFactor = {
        '1': 2, // Bug - 2 days
        '2': 4, // Feature - 4 days
        '3': 3, // Improvement - 3 days
        '4': 1, // Documentation - 1 day
        '5': 5, // Research - 5 days
        '6': 3, // Testing - 3 days
        '7': 2, // Maintenance - 2 days
        '8': 4, // Deployment - 4 days
        '9': 7  // Project - 7 days
      }[task.type] || 3;
      
      // Priority adjustment
      const priorityFactor = {
        '1': 0.7, // High priority - faster
        '2': 1.0, // Medium priority - normal 
        '3': 1.2, // Low priority - slower
        '4': 1.5  // Lowest - even slower
      }[task.priority] || 1.0;
      
      // Calculate predicted days
      const predictedDays = Math.round(typeFactor * priorityFactor * 10) / 10;
      
      // Calculate predicted completion date
      const startDate = task.start_date ? new Date(task.start_date) : new Date();
      const predictedDate = new Date(startDate);
      predictedDate.setDate(predictedDate.getDate() + predictedDays);
      
      return {
        taskId: task._id,
        title: task.title,
        predictedCompletionDate: predictedDate.toISOString(),
        predictedDurationDays: predictedDays,
        confidenceScore: 7 // Default confidence
      };
    });
    
    // Log the assignment map for debugging
    console.log("User task assignment map created:", Object.keys(taskAssignmentMap).length, "users have assignments");
    
    // Generate productivity scores with more randomization for testing
    const productivityData = users.map(user => {
      // Get tasks assigned to this user
      const userTasks = taskAssignmentMap[user._id] || [];
      
      console.log(`User ${user.fullName} (${user._id}) has ${userTasks.length} assigned tasks`);
      
      // Count completed tasks
      const completedTasks = userTasks.filter(task => task.status === '4');
      const completedCount = completedTasks.length;
      
      // Calculate completion ratio
      const completionRatio = userTasks.length > 0 
        ? completedCount / userTasks.length 
        : 0;
      
      // Generate more varied productivity scores based on tasks and completion ratio
      let productivityScore;
      
      if (userTasks.length === 0) {
        // No tasks assigned - default score with slight randomization
        productivityScore = 5 + (Math.random() * 2 - 1); // 4-6 range
      } else if (userTasks.length < 3) {
        // Few tasks - medium confidence score with more randomization
        productivityScore = 5 + (completionRatio * 3) + (Math.random() * 2 - 1); // 4-9 range
      } else {
        // More tasks - higher confidence score based on completion ratio
        productivityScore = 3 + (completionRatio * 7) + (Math.random() * 1 - 0.5); // 2.5-10 range
      }
      
      // Make sure score is within 1-10 range with one decimal place
      productivityScore = Math.min(Math.max(Math.round(productivityScore * 10) / 10, 1), 10);
      
      console.log(`User ${user.fullName} productivity: ${productivityScore} (${completedCount}/${userTasks.length} tasks completed)`);
      
      // Get user's skills and top task types
      const strengths = [];
      
      // Add skills-based strengths
      if (user.skills && user.skills.length > 0) {
        strengths.push(...user.skills.slice(0, 2));
      }
      
      // Add task completion strengths if relevant
      if (completionRatio > 0.7 && userTasks.length >= 3) {
        strengths.push("High task completion rate");
      }
      
      // Add task type strengths
      const taskTypeCount = {};
      completedTasks.forEach(task => {
        if (!taskTypeCount[task.type]) {
          taskTypeCount[task.type] = 0;
        }
        taskTypeCount[task.type]++;
      });
      
      // Find top task type
      let topTaskType = null;
      let topTaskCount = 0;
      
      Object.entries(taskTypeCount).forEach(([type, count]) => {
        if (count > topTaskCount) {
          topTaskType = type;
          topTaskCount = count;
        }
      });
      
      if (topTaskType && topTaskCount >= 2) {
        // Add task type strength
        const typeLabels = {
          '1': "Bug fixing",
          '2': "Feature development",
          '3': "Improvements",
          '4': "Documentation",
          '5': "Research",
          '6': "Testing",
          '7': "Maintenance",
          '8': "Deployment",
          '9': "Project management"
        };
        
        strengths.push(`Strong at ${typeLabels[topTaskType] || `Type ${topTaskType}`}`);
      }
      
      // Ensure at least one strength
      if (strengths.length === 0) {
        strengths.push("Task management");
      }
      
      // Areas for improvement
      let improvements = [];
      
      if (completionRatio < 0.5 && userTasks.length >= 3) {
        improvements.push("Task completion rate");
      }
      
      if (userTasks.length > 0 && userTasks.filter(t => t.status === '2').length > 3) {
        improvements.push("Too many tasks in progress");
      }
      
      // Ensure at least one improvement area
      if (improvements.length === 0) {
        improvements.push("Time management");
        improvements.push("Documentation");
      }
      
      return {
        userId: user._id,
        fullName: user.fullName,
        productivityScore,
        strengths: strengths.slice(0, 3),
        areasForImprovement: improvements.slice(0, 2)
      };
    });
    
    // Update Redux store
    dispatch(SET_ALL_TASK_PREDICTIONS(taskPredictions));
    dispatch(SET_USER_PRODUCTIVITY(productivityData));
    
    console.log(`Predictions generated: ${taskPredictions.length} tasks, ${productivityData.length} users`);
  };
  
  // Get prediction data from Redux
  const predictions = useSelector(state => state.predictions?.allPredictions || []);
  const productivity = useSelector(state => state.predictions?.userProductivity || []);
  
  // Helper function to get status color
  const getStatusColor = (daysDiff) => {
    if (daysDiff < 0) return 'text-danger';
    if (daysDiff <= 2) return 'text-warning';
    return 'text-success';
  };
  
  // Sort predictions by date
  const sortedPredictions = useMemo(() => {
    return [...predictions].sort((a, b) => 
      new Date(a.predictedCompletionDate) - new Date(b.predictedCompletionDate)
    );
  }, [predictions]);
  
  if (loading) {
    return (
      <div className="rounded-sm border border-stroke bg-white p-8 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-3">Loading task data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
        <h3 className="font-medium text-black dark:text-white">
          Task Completion Predictor
        </h3>
        <p className="text-sm text-body">
          AI-predicted completion timelines based on task complexity
          {error && <span className="text-danger ml-2">({error})</span>}
        </p>
      </div>
      
      <div className="p-6.5">
        {/* Upcoming Task Completions */}
        <div className="mb-8">
          <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
            Upcoming Task Completions
          </h4>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                    Task
                  </th>
                  <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                    Predicted Date
                  </th>
                  <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                    Timeline
                  </th>
                  <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                    Confidence
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedPredictions.length > 0 ? (
                  sortedPredictions.slice(0, 5).map((prediction) => {
                    const today = new Date();
                    const predictedDate = new Date(prediction.predictedCompletionDate);
                    const daysDiff = Math.round((predictedDate - today) / (1000 * 60 * 60 * 24));
                    
                    const statusColor = getStatusColor(daysDiff);
                    const statusBg = statusColor.replace('text-', 'bg-');
                    
                    return (
                      <tr key={prediction.taskId}>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <h5 className="font-medium text-black dark:text-white">
                            {prediction.title}
                          </h5>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          {predictedDate.toLocaleDateString()}
                        </td>
                        <td className={`border-b border-[#eee] py-5 px-4 dark:border-strokedark ${statusColor}`}>
                          {daysDiff < 0 
                            ? `${Math.abs(daysDiff)} days overdue` 
                            : daysDiff === 0 
                              ? 'Today' 
                              : `In ${daysDiff} days`}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <div className="relative h-3 w-full rounded-full bg-stroke dark:bg-strokedark">
                            <div 
                              className={`absolute left-0 h-full rounded-full ${statusBg}`}
                              style={{ width: `${prediction.confidenceScore * 10}%` }}
                            ></div>
                          </div>
                          <p className="mt-1 text-xs">{prediction.confidenceScore}/10</p>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td 
                      colSpan="4" 
                      className="border-b border-[#eee] py-5 px-4 dark:border-strokedark text-center"
                    >
                      {error || "No active tasks found. Create some tasks to see predictions."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* User Productivity */}
        <div>
          <h4 className="text-xl font-semibold text-black dark:text-white mb-4">
            User Productivity Ratings
          </h4>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {productivity.length > 0 ? (
              productivity.map((user) => {
                // Determine color based on productivity score
                let scoreColor = 'bg-success';
                if (user.productivityScore < 4) {
                  scoreColor = 'bg-danger';
                } else if (user.productivityScore < 7) {
                  scoreColor = 'bg-warning';
                }
                
                return (
                  <div 
                    key={user.userId}
                    className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 rounded-full bg-primary bg-opacity-10 flex items-center justify-center">
                        <span className="text-xl font-bold text-primary">
                          {user.fullName?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <h5 className="font-medium text-black dark:text-white">
                        {user.fullName || 'Unknown User'}
                      </h5>
                    </div>
                    
                    <div className="relative h-2 w-full rounded-full bg-stroke dark:bg-strokedark mb-1">
                      <div
                        className={`absolute left-0 h-full rounded-full ${scoreColor}`}
                        style={{ width: `${user.productivityScore * 10}%` }}
                      ></div>
                    </div>
                    
                    <div className="flex justify-between text-xs">
                      <span>Productivity Score</span>
                      <span className="font-medium">{user.productivityScore}/10</span>
                    </div>
                    
                    <div className="mt-4">
                      <h6 className="text-sm font-medium mb-2">Strengths:</h6>
                      <ul className="list-disc list-inside text-xs space-y-1">
                        {user.strengths?.slice(0, 2).map((strength, index) => (
                          <li key={index}>{strength}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="col-span-full text-center py-4 text-body">
                {error || "No users found. Add users to see productivity data."}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskCompletionPredictor;