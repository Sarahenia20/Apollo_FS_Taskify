// components/ActivitySummaryChart.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityStats } from '../redux/actions/activityActions';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';

const ActivitySummaryChart = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { stats, loading } = useSelector(state => state.activity);
  
  // State for time frame selection
  const [timeFrame, setTimeFrame] = useState('week');
  
  // Load stats when time frame changes
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchActivityStats(user._id, timeFrame));
    }
  }, [dispatch, user, timeFrame]);
  
  // Colors for charts
  const COLORS = ['#38BDF8', '#818CF8', '#FB7185', '#34D399', '#F59E0B', '#6366F1'];
  
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex flex-wrap items-center justify-between border-b border-stroke dark:border-strokedark">
        <h4 className="text-xl font-semibold text-black dark:text-white">
          Activity Analytics
        </h4>
        
        {/* Time Frame Selector */}
        <div className="flex items-center space-x-3">
          <span className="text-sm text-bodydark">Time Period:</span>
          <select
            value={timeFrame}
            onChange={(e) => setTimeFrame(e.target.value)}
            className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-5 outline-none transition focus:border-primary active:border-primary dark:border-strokedark dark:bg-boxdark"
          >
            <option value="day">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
        </div>
      </div>
      
      <div className="p-4 md:p-6 xl:p-7.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-bodydark">Loading activity statistics...</p>
          </div>
        ) : !stats ? (
          <div className="text-center py-16 text-bodydark">
            No activity data available. Complete some tasks to see analytics.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-3 2xl:gap-7.5">
            {/* Hours of Day Activity Chart */}
            <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:col-span-2">
              <div className="mb-3 justify-between gap-4 sm:flex">
                <h5 className="text-xl font-semibold text-black dark:text-white">
                  Activity by Hour of Day
                </h5>
              </div>
              
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.hourlyDistribution}
                    margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`${value} activities`, 'Count']}
                      labelFormatter={(label) => `Hour: ${label}`}
                    />
                    <Bar 
                      dataKey="count" 
                      fill="#38BDF8" 
                      name="Activities" 
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Activity Types Distribution Chart */}
            <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
              <h5 className="mb-3 text-xl font-semibold text-black dark:text-white">
                Activity Types
              </h5>
              
              <div className="h-[350px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.typeDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="type"
                      label={({ type, percent }) => `${type}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {stats.typeDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name, props) => [`${value} activities`, props.payload.type]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Weekday Distribution Chart */}
            {stats.weekdayDistribution && (
              <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark md:col-span-2">
                <h5 className="mb-3 text-xl font-semibold text-black dark:text-white">
                  Activity by Day of Week
                </h5>
                
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={stats.weekdayDistribution}
                      margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value) => [`${value} activities`, 'Count']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="count" 
                        stroke="#6366F1" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                        name="Activities" 
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            {/* Category Distribution Chart */}
            {stats.categoryDistribution && stats.categoryDistribution.length > 0 && (
              <div className="rounded-sm border border-stroke bg-white p-4 shadow-default dark:border-strokedark dark:bg-boxdark">
                <h5 className="mb-3 text-xl font-semibold text-black dark:text-white">
                  Task Categories
                </h5>
                
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.categoryDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="category"
                        label={({ category, percent }) => `${category}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.categoryDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} tasks`, props.payload.category]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivitySummaryChart;