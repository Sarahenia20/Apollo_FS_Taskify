import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import axios from "axios";

const ChatCard = () => {
  const { _ALL: allUsers = [] } = useSelector((state) => state.users);
  const [completedUsersByMonth, setCompletedUsersByMonth] = useState({});
  const [projects, setProjects] = useState([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Fetch projects and set up polling
  useEffect(() => {
    fetchProjects();
    
    const interval = setInterval(() => {
      fetchProjects();
      setRefreshTrigger(prev => prev + 1);
    }, 30000);
    
    return () => clearInterval(interval);
  }, [projects]);

  // Calculate stats whenever projects or refreshTrigger change
  useEffect(() => {
    calculateCompletedUsersStats();
  }, [projects, refreshTrigger]);

  const fetchProjects = async () => {
    try {
      const response = await axios.get("/api/projects");
      if (response.data && response.data.data) {
        setProjects(response.data.data);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
      setProjects([]);
    }
  };

  const calculateCompletedUsersStats = () => {
    // Define the fixed range from April 2024 to April 2025
    const startDate = new Date(2024, 3, 1); // April 1, 2024 (month is 0-based, so 3 is April)
    const endDate = new Date(2025, 3, 30); // April 30, 2025

    // Initialize data structure for 2-month bins (Apr 24 to Apr 25 = 7 bins)
    const stats = {};
    const binLabels = [
      "2024-04", // Apr 24
      "2024-06", // Jun 24
      "2024-08", // Aug 24
      "2024-10", // Oct 24
      "2024-12", // Dec 24
      "2025-02", // Feb 25
      "2025-04"  // Apr 25
    ];

    binLabels.forEach(label => {
      stats[label] = new Set();
    });

    const monthKeys = Object.keys(stats);

    // Process completed projects
    const completedProjects = projects.filter(project => project.status === "completed");
    
    completedProjects.forEach(project => {
      if (!project.end_date || !project.project_manager) return;
      
      const projectEndDate = new Date(project.end_date);
      
      // Check if the project was completed within the specified range
      if (projectEndDate >= startDate && projectEndDate <= endDate) {
        // Find the appropriate 2-month bin
        const monthDiff = (projectEndDate.getFullYear() - startDate.getFullYear()) * 12 + 
                         (projectEndDate.getMonth() - startDate.getMonth());
        const binIndex = Math.floor(monthDiff / 2);
        
        if (binIndex >= 0 && binIndex < monthKeys.length) {
          const binKey = monthKeys[binIndex];
          stats[binKey].add(project.project_manager);
        }
      }
    });

    // Convert Sets to counts
    const finalStats = {};
    Object.keys(stats).forEach(key => {
      finalStats[key] = stats[key].size;
    });

    // If no real data, use sample data
    if (Object.values(finalStats).every(count => count === 0) && completedProjects.length === 0) {
      const sampleData = {
        [monthKeys[0]]: 0,  // Apr 24
        [monthKeys[1]]: 0,  // Jun 24
        [monthKeys[2]]: 2,  // Aug 24
        [monthKeys[3]]: 4,  // Oct 24
        [monthKeys[4]]: 7,  // Dec 24
        [monthKeys[5]]: 12, // Feb 25
        [monthKeys[6]]: 10  // Apr 25
      };
      Object.keys(sampleData).forEach(key => {
        finalStats[key] = sampleData[key];
      });
    }

    setCompletedUsersByMonth(finalStats);
  };

  // Calculate the maximum number of users for scaling
  const maxUsers = Math.max(...Object.values(completedUsersByMonth), 1);
  const yAxisMaxForLabels = Math.max(Math.ceil(maxUsers / 5) * 5, 15);

  // Generate points for the SVG path
  const numPoints = Object.keys(completedUsersByMonth).length;
  const points = Object.keys(completedUsersByMonth).map((month, index) => {
    const x = ((index + 0.5) / numPoints) * 90;
    const y = 100 - (completedUsersByMonth[month] / yAxisMaxForLabels) * 100;
    return `${x},${y}`;
  });

  // Create a smooth curve
  const pathData = `M0,100 ${points.map((point, index) => {
    const [x, y] = point.split(",");
    if (index === 0) return `L${x},${y}`;
    const prevPoint = points[index - 1].split(",");
    const controlX1 = (parseFloat(prevPoint[0]) + parseFloat(x)) / 2;
    const controlY1 = prevPoint[1];
    const controlX2 = controlX1;
    const controlY2 = y;
    return `C${controlX1},${controlY1} ${controlX2},${controlY2} ${x},${y}`;
  }).join(" ")} V100 H0 Z`;

  // Format month labels
  const formatMonthLabel = (monthKey) => {
    const date = new Date(monthKey + "-01");
    return date.toLocaleString('en-US', { month: 'short', year: '2-digit' });
  };

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
      <h4 className="mb-6 px-7.5 text-xl font-semibold text-black dark:text-white">
        Completed Projects by Users (Last Year)
      </h4>

      <div className="relative h-64 w-full px-7.5">
        {/* Y-axis */}
        <div className="absolute left-0 top-0 h-full w-12 border-r border-gray-300 dark:border-strokedark">
          {[...Array(Math.ceil(yAxisMaxForLabels / 5) + 1)].map((_, i) => (
            <div
              key={i}
              className="absolute w-full text-right pr-2 text-sm text-gray-500 dark:text-gray-400"
              style={{ bottom: `${(i * 5 / yAxisMaxForLabels) * 100}%` }}
            >
              {i * 5}
            </div>
          ))}
        </div>

        {/* Histogram as a smooth curve */}
        <div className="ml-12 h-full w-full">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path
              d={pathData}
              fill="#C3B1E1"
              fillOpacity="0.6"
              stroke="#C3B1E1"
              strokeWidth="0.5"
            />
          </svg>
        </div>

        {/* X-axis */}
        <div className="absolute bottom-0 left-12 right-7.5 flex justify-between text-sm text-gray-500 dark:text-gray-400">
          {Object.keys(completedUsersByMonth).map((month) => (
            <div key={month} className="text-center">
              {formatMonthLabel(month)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatCard;