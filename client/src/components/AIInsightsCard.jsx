// components/AIInsightsCard.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchActivityStats, fetchDashboardSummary } from '../redux/actions/activityActions';

const AIInsightsCard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  const { stats, dashboardSummary, loading } = useSelector(state => state.activity);
  const [insights, setInsights] = useState([]);
  
  // Load necessary data for insights
  useEffect(() => {
    if (user?._id) {
      dispatch(fetchActivityStats(user._id, 'week'));
      dispatch(fetchDashboardSummary(user._id));
    }
  }, [dispatch, user]);
  
  // Generate insights whenever stats or dashboard summary changes
  useEffect(() => {
    if (stats && dashboardSummary && !loading) {
      const generatedInsights = generateInsights(stats, dashboardSummary);
      setInsights(generatedInsights);
    }
  }, [stats, dashboardSummary, loading]);
  
  // This function analyzes the data and generates personalized insights
  const generateInsights = (stats, metrics) => {
    const insights = [];
    
    // Productivity Pattern Insight
    if (stats.hourlyDistribution) {
      const hourlyData = stats.hourlyDistribution;
      const mostActiveHour = hourlyData.reduce((max, hour) => 
        hour.count > max.count ? hour : max, hourlyData[0] || { hour: '00:00', count: 0 });
      
      const morningHours = hourlyData.slice(5, 12).reduce((sum, h) => sum + h.count, 0);
      const afternoonHours = hourlyData.slice(12, 17).reduce((sum, h) => sum + h.count, 0);
      const eveningHours = hourlyData.slice(17, 23).reduce((sum, h) => sum + h.count, 0);
      
      let timePattern = 'balanced';
      let timeInsight = '';
      
      if (morningHours > afternoonHours && morningHours > eveningHours) {
        timePattern = 'morning';
        timeInsight = 'You tend to be most productive in the morning hours. Consider scheduling complex tasks during this time to maximize effectiveness.';
      } else if (afternoonHours > morningHours && afternoonHours > eveningHours) {
        timePattern = 'afternoon';
        timeInsight = 'Your productivity peaks during afternoon hours. This is a great time for collaborative work and meetings.';
      } else if (eveningHours > morningHours && eveningHours > afternoonHours) {
        timePattern = 'evening';
        timeInsight = 'You show a preference for evening work. Consider scheduling creative or deep thinking tasks during these hours.';
      } else {
        timeInsight = 'Your productivity is distributed throughout the day. This balanced approach helps maintain consistent energy levels.';
      }
      
      insights.push({
        title: 'Productivity Pattern',
        icon: '⏰',
        content: `Most active around ${mostActiveHour.hour}. ${timeInsight}`,
        type: timePattern
      });
    }
    
    // Task Completion Insight
    if (metrics && typeof metrics.completionRate === 'number') {
      let completionInsight = '';
      let completionType = '';
      
      if (metrics.completionRate >= 80) {
        completionType = 'excellent';
        completionInsight = 'Your task completion rate is excellent. You consistently finish what you start.';
      } else if (metrics.completionRate >= 60) {
        completionType = 'good';
        completionInsight = 'You have a good completion rate. You balance starting new tasks with finishing existing ones.';
      } else if (metrics.completionRate >= 40) {
        completionType = 'moderate';
        completionInsight = 'Your completion rate shows room for improvement. Try focusing on finishing existing tasks before starting new ones.';
      } else {
        completionType = 'low';
        completionInsight = 'Your task completion rate is relatively low. Consider prioritizing completion of in-progress tasks.';
      }
      
      insights.push({
        title: 'Task Completion',
        icon: '✅',
        content: completionInsight,
        type: completionType
      });
    }
    
    // Work Pattern Insight
    if (stats.weekdayDistribution) {
      const weekdayData = stats.weekdayDistribution;
      const totalActivity = weekdayData.reduce((sum, day) => sum + day.count, 0);
      const avgDailyActivity = totalActivity / weekdayData.length;
      
      // Find peak days
      const peakDays = weekdayData
        .filter(day => day.count > avgDailyActivity * 1.5)
        .map(day => day.day);
      
      // Find low days
      const lowDays = weekdayData
        .filter(day => day.count < avgDailyActivity * 0.5 && day.count > 0)
        .map(day => day.day);
      
      let workPatternInsight = '';
      let patternType = '';
      
      if (peakDays.length === 0 && lowDays.length === 0) {
        patternType = 'consistent';
        workPatternInsight = 'Your work activity is consistent throughout the week. This steady approach helps maintain a sustainable pace.';
      } else if (peakDays.length >= 2) {
        patternType = 'burst';
        workPatternInsight = `You tend to work in bursts, with peak activity on ${peakDays.join(' and ')}. Consider spreading tasks more evenly if you're experiencing burnout on these days.`;
      } else if (lowDays.length >= 3) {
        patternType = 'selective';
        workPatternInsight = `You have significantly lower activity on ${lowDays.join(', ')}. Consider if this pattern aligns with your productivity goals.`;
      } else if (peakDays.length === 1) {
        patternType = 'peak';
        workPatternInsight = `${peakDays[0]} stands out as your most productive day. Schedule your most important tasks for this day when possible.`;
      }
      
      insights.push({
        title: 'Weekly Work Pattern',
        icon: '📊',
        content: workPatternInsight,
        type: patternType
      });
    }
    
    // Task Category Insight
    if (stats.categoryDistribution && stats.categoryDistribution.length > 0) {
      const topCategory = stats.categoryDistribution[0];
      const totalTasks = stats.categoryDistribution.reduce((sum, cat) => sum + cat.count, 0);
      const topCategoryPercentage = Math.round((topCategory.count / totalTasks) * 100);
      
      let categoryInsight = '';
      let categoryType = '';
      
      if (topCategoryPercentage > 70) {
        categoryType = 'specialized';
        categoryInsight = `You're heavily focused on ${topCategory.category} tasks (${topCategoryPercentage}%). This specialization could be making you an expert in this area.`;
      } else if (topCategoryPercentage > 50) {
        categoryType = 'focused';
        categoryInsight = `Your work has a primary focus on ${topCategory.category} tasks (${topCategoryPercentage}%). You maintain a good balance while having a clear specialty.`;
      } else if (stats.categoryDistribution.length >= 3) {
        categoryType = 'diverse';
        categoryInsight = 'You work across diverse task categories. This versatility is valuable for cross-functional roles.';
      } else {
        categoryType = 'balanced';
        categoryInsight = `While ${topCategory.category} is your most common task type, your work is relatively balanced across categories.`;
      }
      
      insights.push({
        title: 'Task Category Focus',
        icon: '🔍',
        content: categoryInsight,
        type: categoryType
      });
    }
    
    // Recent Activity Insight
    if (metrics && metrics.activitiesToday !== undefined) {
      let activityInsight = '';
      let activityType = '';
      
      if (metrics.activitiesToday === 0) {
        activityType = 'inactive';
        activityInsight = 'No activity recorded today. Taking breaks is important, but remember to track your work when you return.';
      } else if (metrics.activitiesToday > 10) {
        activityType = 'very-active';
        activityInsight = `High activity today with ${metrics.activitiesToday} actions. Be mindful of maintaining quality alongside quantity.`;
      } else if (metrics.activitiesToday > 5) {
        activityType = 'active';
        activityInsight = `Good activity level today with ${metrics.activitiesToday} actions. You're making steady progress.`;
      } else {
        activityType = 'moderate';
        activityInsight = `Moderate activity today with ${metrics.activitiesToday} actions. Consider breaking larger tasks into smaller trackable units.`;
      }
      
      insights.push({
        title: 'Today\'s Activity',
        icon: '📈',
        content: activityInsight,
        type: activityType
      });
    }
    
    // If we have enough metrics, add a work-life balance insight
    if (stats.hourlyDistribution) {
      const earlyMorning = stats.hourlyDistribution.slice(0, 6).reduce((sum, h) => sum + h.count, 0);
      const lateNight = stats.hourlyDistribution.slice(22, 24).reduce((sum, h) => sum + h.count, 0);
      const offHours = earlyMorning + lateNight;
      const totalActivity = stats.hourlyDistribution.reduce((sum, h) => sum + h.count, 0);
      
      if (totalActivity > 0) {
        const offHoursPercentage = Math.round((offHours / totalActivity) * 100);
        
        let balanceInsight = '';
        let balanceType = '';
        
        if (offHoursPercentage > 30) {
          balanceType = 'overworking';
          balanceInsight = `${offHoursPercentage}% of your activity occurs outside standard hours (before 6 AM or after 10 PM). Consider establishing clearer work boundaries.`;
        } else if (offHoursPercentage > 15) {
          balanceType = 'flexible';
          balanceInsight = `You occasionally work during off-hours (${offHoursPercentage}% of activity). This flexibility can be beneficial but monitor for burnout.`;
        } else {
          balanceType = 'balanced';
          balanceInsight = 'You maintain healthy work hours, with minimal activity during early morning or late night hours.';
        }
        
        insights.push({
          title: 'Work-Life Balance',
          icon: '⚖️',
          content: balanceInsight,
          type: balanceType
        });
      }
    }
    
    return insights;
  };
  
  // Get background color for insight cards based on type
  const getCardColor = (type) => {
    const colorMap = {
      // Productivity patterns
      morning: 'bg-yellow-50 dark:bg-yellow-900/10',
      afternoon: 'bg-blue-50 dark:bg-blue-900/10',
      evening: 'bg-indigo-50 dark:bg-indigo-900/10',
      balanced: 'bg-green-50 dark:bg-green-900/10',
      
      // Completion insights
      excellent: 'bg-green-50 dark:bg-green-900/10',
      good: 'bg-emerald-50 dark:bg-emerald-900/10',
      moderate: 'bg-yellow-50 dark:bg-yellow-900/10',
      low: 'bg-orange-50 dark:bg-orange-900/10',
      
      // Work patterns
      consistent: 'bg-teal-50 dark:bg-teal-900/10',
      burst: 'bg-purple-50 dark:bg-purple-900/10',
      selective: 'bg-blue-50 dark:bg-blue-900/10',
      peak: 'bg-indigo-50 dark:bg-indigo-900/10',
      
      // Category focus
      specialized: 'bg-amber-50 dark:bg-amber-900/10',
      focused: 'bg-sky-50 dark:bg-sky-900/10',
      diverse: 'bg-violet-50 dark:bg-violet-900/10',
      
      // Activity level
      'very-active': 'bg-green-50 dark:bg-green-900/10',
      active: 'bg-emerald-50 dark:bg-emerald-900/10',
      moderate: 'bg-yellow-50 dark:bg-yellow-900/10',
      inactive: 'bg-gray-50 dark:bg-gray-900/10',
      
      // Work-life balance
      overworking: 'bg-red-50 dark:bg-red-900/10',
      flexible: 'bg-amber-50 dark:bg-amber-900/10'
    };
    
    return colorMap[type] || 'bg-gray-50 dark:bg-gray-900/10';
  };
  
  // Get accent color for insight cards
  const getAccentColor = (type) => {
    const colorMap = {
      // Productivity patterns
      morning: 'border-yellow-500 text-yellow-700 dark:text-yellow-300',
      afternoon: 'border-blue-500 text-blue-700 dark:text-blue-300',
      evening: 'border-indigo-500 text-indigo-700 dark:text-indigo-300',
      balanced: 'border-green-500 text-green-700 dark:text-green-300',
      
      // Completion insights
      excellent: 'border-green-500 text-green-700 dark:text-green-300',
      good: 'border-emerald-500 text-emerald-700 dark:text-emerald-300',
      moderate: 'border-yellow-500 text-yellow-700 dark:text-yellow-300',
      low: 'border-orange-500 text-orange-700 dark:text-orange-300',
      
      // Work patterns
      consistent: 'border-teal-500 text-teal-700 dark:text-teal-300',
      burst: 'border-purple-500 text-purple-700 dark:text-purple-300',
      selective: 'border-blue-500 text-blue-700 dark:text-blue-300',
      peak: 'border-indigo-500 text-indigo-700 dark:text-indigo-300',
      
      // Category focus
      specialized: 'border-amber-500 text-amber-700 dark:text-amber-300',
      focused: 'border-sky-500 text-sky-700 dark:text-sky-300',
      diverse: 'border-violet-500 text-violet-700 dark:text-violet-300',
      
      // Activity level
      'very-active': 'border-green-500 text-green-700 dark:text-green-300',
      active: 'border-emerald-500 text-emerald-700 dark:text-emerald-300',
      moderate: 'border-yellow-500 text-yellow-700 dark:text-yellow-300',
      inactive: 'border-gray-500 text-gray-700 dark:text-gray-300',
      
      // Work-life balance
      overworking: 'border-red-500 text-red-700 dark:text-red-300',
      flexible: 'border-amber-500 text-amber-700 dark:text-amber-300'
    };
    
    return colorMap[type] || 'border-gray-500 text-gray-700 dark:text-gray-300';
  };
  
  return (
    <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="py-6 px-4 md:px-6 xl:px-7.5 flex flex-wrap items-center justify-between border-b border-stroke dark:border-strokedark">
        <h4 className="text-xl font-semibold text-black dark:text-white flex items-center">
          <span className="mr-2">AI Activity Insights</span>
          <span className="text-primary text-sm bg-primary/10 px-2 py-0.5 rounded-full">Powered by AI</span>
        </h4>
        
        <button
          onClick={() => {
            dispatch(fetchActivityStats(user?._id, 'week'));
            dispatch(fetchDashboardSummary(user?._id));
          }}
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
              Refresh Insights
            </>
          )}
        </button>
      </div>
      
      <div className="p-4 md:p-6 xl:p-7.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-bodydark">Analyzing your activity patterns...</p>
          </div>
        ) : insights.length === 0 ? (
          <div className="text-center py-16 text-bodydark">
            <div className="flex justify-center">
              <svg className="w-16 h-16 text-bodydark opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 001.5 2.25m0 0c1.085.258 2.152.426 3.212.5m-3.212-.5a2.25 2.25 0 00-2.25 2.25m0 0c0 .896.168 1.766.5 2.571m0 0a2.25 2.25 0 001.125 1.125m0 0c.85.175 1.726.272 2.616.293m0 0h-.004c1.798 0 3.426-.324 4.624-.894m0 0a3.001 3.001 0 001.504-1.648m0 0c.285-.809.434-1.648.446-2.503m0 0v-.028c0-1.127-.259-2.142-.713-3.028" />
              </svg>
            </div>
            <h4 className="mt-4 text-lg font-medium text-black dark:text-white">
              Not Enough Activity Data
            </h4>
            <p className="mt-2 text-bodydark max-w-md mx-auto">
              Complete more tasks and use Taskify regularly to receive AI-powered insights about your work patterns and productivity.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {insights.map((insight, index) => (
              <div 
                key={index} 
                className={`rounded-lg border-l-4 p-5 ${getCardColor(insight.type)} ${getAccentColor(insight.type)}`}
              >
                <div className="flex items-center mb-3">
                  <span className="text-2xl mr-3">{insight.icon}</span>
                  <h5 className="text-lg font-medium text-black dark:text-white">
                    {insight.title}
                  </h5>
                </div>
                <p className="text-bodydark dark:text-bodydark2">
                  {insight.content}
                </p>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-6 bg-gray-2 dark:bg-meta-4 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg className="w-6 h-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="ml-3">
              <h5 className="text-sm font-medium text-black dark:text-white">
                About AI Insights
              </h5>
              <p className="mt-1 text-xs text-bodydark">
                These insights are generated by analyzing your activity patterns over time. They're designed to help you understand your work habits and identify opportunities for improvement. The more you use Taskify, the more accurate and valuable these insights will become.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsCard;