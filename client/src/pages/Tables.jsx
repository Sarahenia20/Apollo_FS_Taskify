// pages/Tables.jsx (or your existing file path)
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import DefaultLayout from '../layout/DefaultLayout';
import Breadcrumb from '../components/Breadcrumb';
import FeaturedCampaigns from '../components/FeaturedCampaigns';
import TopContent from '../components/TopContent';
import UserActivityTable from '../components/UserActivityTable';
import ActivitySummaryChart from '../components/ActivitySummaryChart';
import TaskAnalyticsPanel from '../components/TaskAnalyticsPanel';
import AIInsightsCard from '../components/AIInsightsCard';
import TaskPriorityWizard from '../components/TaskPriorityWizard';
import PersonaAnalyzerCard from '../components/PersonaAnalyzerCard';
import ExportReportCard from '../components/ExportReportCard';
import { 
  fetchUserActivities, 
  fetchActivityStats, 
  fetchUserPersona,
  fetchTaskPriorities,
  fetchDashboardSummary
} from '../redux/actions/activityActions';

const Tables = () => {
  const dispatch = useDispatch();
  const { user } = useSelector(state => state.auth);
  
  useEffect(() => {
    if (user?._id) {
      // Load all activity data when the component mounts
      dispatch(fetchUserActivities(user._id));
      dispatch(fetchActivityStats(user._id));
      dispatch(fetchUserPersona(user._id));
      dispatch(fetchTaskPriorities(user._id));
      dispatch(fetchDashboardSummary(user._id));
    }
  }, [dispatch, user]);
  
  // In Tables.jsx, add this debugging code:
useEffect(() => {
  if (user?._id) {
    console.log("User ID for activity fetch:", user._id);
    
    // Dispatch with tracking
    console.log("Dispatching fetchUserPersona action");
    const personaAction = dispatch(fetchUserPersona(user._id));
    console.log("Persona action dispatched:", personaAction);
    
    console.log("Dispatching fetchUserActivities action");
    const activitiesAction = dispatch(fetchUserActivities(user._id));
    console.log("Activities action dispatched:", activitiesAction);
    
    // Track other dispatches similarly
  }
}, [dispatch, user]);
  return (
    <DefaultLayout>
      <Breadcrumb pageName='Activity Dashboard' />
      <FeaturedCampaigns />
      <TopContent />
      
      <div className='flex flex-col gap-10 mt-6'>
        {/* AI Persona Analysis */}
        <PersonaAnalyzerCard />
        
        {/* Task Priority Wizard */}
        <TaskPriorityWizard />
        
        {/* Activity Charts */}
        <ActivitySummaryChart />
        
        {/* Activity Table */}
        <UserActivityTable />
        
        {/* Export Report Card */}
        <ExportReportCard />
      </div>
    </DefaultLayout>
  );
};

export default Tables;