import React, { useState, useEffect } from "react";
import DefaultLayout from "../layout/DefaultLayout";
import Breadcrumb from "../components/Breadcrumb";
import EnhancedCalendar from "../components/elements/Calendar";
import ScheduleCallModal from "../components/VideoCall/ScheduleCallForm";
import VideoCallModal from "../components/VideoCall/VideoCallModal";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useDispatch, useSelector } from "react-redux";
import { FindTaskAction } from "../redux/actions/tasks";
import { getCallsByParticipantId, checkUpcomingCalls, setActiveCall, generateRoomName, markCallAsStarted } from "../redux/actions/VideoCalls";
import moment from "moment";

const Calendar = () => {
  const dispatch = useDispatch();
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedCallData, setSelectedCallData] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [upcomingCalls, setUpcomingCalls] = useState([]);
  const [videoCallState, setVideoCallState] = useState({
    open: false,
    roomName: null
  });

  // Get current user ID from auth state
  const authState = useSelector((state) => state.auth || {});
  const currentUserId = authState.user?._id || 
                      authState.user?.id || 
                      authState.data?._id || 
                      authState._id || 
                      authState.id || 
                      null;

  // Get video calls from Redux state
  const videoCalls = useSelector((state) => state.videoCalls?._ALL || []);

  // Fetch tasks for the current user
  useEffect(() => {
    if (currentUserId) {
      dispatch(FindTaskAction(currentUserId));
    }
  }, [dispatch, currentUserId]);

  // Check for upcoming calls and update local state
  useEffect(() => {
    const checkForUpcomingCalls = () => {
      const currentTime = new Date();
      const upcoming = videoCalls.filter(call => {
        const callStartTime = new Date(call.start_time);
        const timeDiff = (callStartTime - currentTime) / (1000 * 60); // Difference in minutes
        return timeDiff > 0 && timeDiff <= 60; // Calls starting in the next 60 minutes
      }).sort((a, b) => new Date(a.start_time) - new Date(b.start_time));
      
      setUpcomingCalls(upcoming);
    };

    checkForUpcomingCalls();
    const interval = setInterval(checkForUpcomingCalls, 30000);
    return () => clearInterval(interval);
  }, [videoCalls]);

  // Set up interval to check for upcoming calls
  useEffect(() => {
    dispatch(checkUpcomingCalls());
    const intervalId = setInterval(() => {
      dispatch(checkUpcomingCalls());
    }, 60000);
    return () => clearInterval(intervalId);
  }, [dispatch]);

  // Function to handle scheduling a new call from the calendar
  const handleScheduleCall = (callData = null) => {
    if (callData) {
      setSelectedCallData(callData);
      setEditMode(true);
    } else {
      setSelectedCallData(null);
      setEditMode(false);
    }
    setShowScheduleModal(true);
  };

  // Function to refresh calls after creating or updating a call
  const handleCallUpdated = () => {
    if (currentUserId) {
      dispatch(getCallsByParticipantId(currentUserId));
    } else {
      console.warn("No user ID found, fetching all calls");
      dispatch(getAllScheduledCalls());
    }
  };

  // Function to join a call
  const handleJoinCall = (call) => {
    dispatch(setActiveCall(call));
    const roomName = generateRoomName(call._id, call.call_name);
    dispatch(markCallAsStarted(call._id));
    
    setVideoCallState({
      open: true,
      roomName: roomName
    });
  };

  // Format time difference for display
  const formatTimeDiff = (call) => {
    const now = new Date();
    const startTime = new Date(call.start_time);
    const diffMinutes = Math.floor((startTime - now) / (1000 * 60));
    
    if (diffMinutes < 1) return "starting now";
    if (diffMinutes === 1) return "in 1 minute";
    if (diffMinutes < 60) return `in ${diffMinutes} minutes`;
    
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours === 1 && minutes === 0) return "in 1 hour";
    if (hours === 1) return `in 1 hour ${minutes} minutes`;
    if (minutes === 0) return `in ${hours} hours`;
    return `in ${hours} hours ${minutes} minutes`;
  };

  return (
    <DefaultLayout>
      <Breadcrumb pageName="Calendar" />

      {/* Upcoming Calls Notification Banner */}
      {upcomingCalls.length > 0 && (
        <div className="mb-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-800 dark:text-blue-200">
                Upcoming Calls
              </h3>
              <p className="text-sm text-blue-600 dark:text-blue-300">
                You have {upcomingCalls.length} call{upcomingCalls.length !== 1 ? 's' : ''} scheduled in the next hour
              </p>
            </div>
          </div>
          
          <div className="mt-3 space-y-2">
            {upcomingCalls.map((call) => (
              <div 
                key={call._id} 
                className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded-md shadow-sm"
              >
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {call.call_name}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatTimeDiff(call)} • {moment(call.start_time).format('h:mm A')}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleJoinCall(call)}
                  className="ml-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Join Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-black dark:text-white">Schedule</h2>
        
        <button
          onClick={() => handleScheduleCall()}
          className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded flex items-center"
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-5 w-5 mr-2" 
            viewBox="0 0 20 20" 
            fill="currentColor"
          >
            <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
          </svg>
          Schedule Video Call
        </button>
      </div>

      {/* Calendar Tabs */}
      <div className="mb-4 border-b border-stroke dark:border-strokedark">
        <ul className="flex flex-wrap -mb-px text-sm font-medium text-center">
          <li className="mr-2">
            <a 
              href="#" 
              className="inline-block p-4 text-primary border-b-2 border-primary rounded-t-lg dark:text-primary dark:border-primary"
              aria-current="page"
            >
              Calendar
            </a>
          </li>
        </ul>
      </div>

      {/* Enhanced Calendar Component */}
      <EnhancedCalendar onScheduleCall={handleScheduleCall} />
      
      {/* Schedule Call Modal */}
      {showScheduleModal && (
        <ScheduleCallModal
          onClose={() => {
            setShowScheduleModal(false);
            setSelectedCallData(null);
            setEditMode(false);
            handleCallUpdated();
          }}
          initialData={selectedCallData}
          mode={editMode ? 'edit' : 'create'}
        />
      )}

      {/* Video Call Modal */}
      {videoCallState.open && (
        <VideoCallModal
          roomName={videoCallState.roomName}
          onClose={() => setVideoCallState({open: false, roomName: null})}
        />
      )}
    </DefaultLayout>
  );
};

export default Calendar;