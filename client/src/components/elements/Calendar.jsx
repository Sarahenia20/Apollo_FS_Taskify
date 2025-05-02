// src/components/elements/Calendar.jsx
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { FindTaskAction, RescheduleTaskAction, GetTaskCommentsAction } from "../../redux/actions/tasks"; // Adjusted import path
import { useEffect, useState, useCallback, useMemo } from "react";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import swal from "sweetalert";

// Create the DnD Calendar component
const DnDCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

// Define priority colors and labels
const priorityColors = {
  "1": { color: "#4caf50", label: "Low Priority" },
  "2": { color: "orange", label: "Medium Priority" },
  "3": { color: "#ff3d71", label: "High Priority" },
  "4": { color: "#ff0000", label: "Critical Priority" }
};

// Event component for Agenda view
const AgendaEvent = ({ event }) => {
  const [expandedComments, setExpandedComments] = useState(false);
  
  // Helper function to render comments with toggle functionality
  const renderComments = (comments) => {
    if (!comments || !Array.isArray(comments) || comments.length === 0) return null;

    // Sort comments by date (newest first)
    const sortedComments = [...comments].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    // Display all comments if expanded, otherwise just the first 3
    const commentsToShow = expandedComments ? sortedComments : sortedComments.slice(0, 3);
    
    const hasMoreComments = sortedComments.length > 3;

    return (
      <div className="mt-4">
        <h5 className="text-sm font-medium text-gray-700 mb-2">
          Comments:
        </h5>
        <div className="space-y-3">
          {commentsToShow.map((comment, index) => (
            <div key={comment._id || index} className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between items-start">
                <div className="font-medium text-sm">
                  {comment.by?.fullName || "User"}
                </div>
                <div className="text-xs text-gray-500">
                  {moment(comment.createdAt).fromNow()}
                </div>
              </div>
              <div className="mt-1 text-sm text-gray-700">
                {comment.content}
              </div>
            </div>
          ))}
          
          {hasMoreComments && (
            <button 
              onClick={() => setExpandedComments(!expandedComments)}
              className="text-xs text-blue-600 hover:text-blue-800 hover:underline cursor-pointer font-medium bg-blue-50 px-3 py-1 rounded-full"
            >
              {expandedComments 
                ? "Show fewer comments" 
                : `+ ${sortedComments.length - 3} more comment${sortedComments.length - 3 !== 1 ? 's' : ''}`}
            </button>
          )}
        </div>
      </div>
    );
  };
  
  // Get priority information for this event
  const priorityInfo = priorityColors[event.priority] || priorityColors["2"];
  
  // Basic event information
  const startTime = moment(event.start).format('h:mm A');
  const endTime = moment(event.end).format('h:mm A');
  const duration = moment.duration(moment(event.end).diff(moment(event.start))).asHours();

  // Check for comments
  const hasComments = event.resource?.comments && Array.isArray(event.resource.comments) && event.resource.comments.length > 0;
  
  return (
    <div 
      className="mb-6 bg-white rounded-lg shadow-sm border-l-4" 
      style={{ borderLeftColor: priorityInfo.color }}
    >
      <div className="p-4">
        <div className="flex justify-between">
          <h4 className="font-semibold text-lg">{event.title}</h4>
          <div className="text-xs font-medium px-2 py-1 rounded-full" style={{ 
            backgroundColor: priorityInfo.color + '20',
            color: priorityInfo.color
          }}>
            {priorityInfo.label}
          </div>
        </div>
        
        {event.allDay ? (
          <p className="text-gray-600 mt-2 text-sm">All-day task</p>
        ) : (
          <p className="text-gray-600 mt-2 text-sm">
            {startTime} to {endTime}
            {duration >= 1 
              ? ` (${Math.round(duration * 10) / 10} hour${duration !== 1 ? 's' : ''})`
              : ` (${Math.round(duration * 60)} minutes)`
            }
          </p>
        )}
        
        {event.resource && event.resource.description && (
          <div className="mt-3 text-sm">
            <p className="font-medium text-gray-700">Description:</p>
            <p className="text-gray-700 mt-1">{event.resource.description}</p>
          </div>
        )}

        {/* Show comments if present */}
        {hasComments && renderComments(event.resource.comments)}
        
        <div className="flex flex-wrap gap-2 mt-4">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
            {event.resource?.status === "1" ? "To Do" :
              event.resource?.status === "2" ? "In Progress" :
              event.resource?.status === "3" ? "Testing" :
              event.resource?.status === "4" ? "Completed" : "To Do"}
          </span>
          {hasComments && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
              {event.resource.comments.length} comment{event.resource.comments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// Custom Agenda component for narrative view
const SmartAgenda = ({ events, date }) => {
  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = {};
    
    events.forEach(event => {
      const eventDate = moment(event.start).format('YYYY-MM-DD');
      if (!grouped[eventDate]) {
        grouped[eventDate] = [];
      }
      grouped[eventDate].push(event);
    });
    
    return grouped;
  }, [events]);
  
  // Sort events within each date by start time
  Object.keys(eventsByDate).forEach(date => {
    eventsByDate[date].sort((a, b) => new Date(a.start) - new Date(b.start));
  });
  
  // Format dates for display
  const formattedDates = Object.keys(eventsByDate).map(dateStr => {
    const momentDate = moment(dateStr);
    const isToday = momentDate.isSame(moment(), 'day');
    const isTomorrow = momentDate.isSame(moment().add(1, 'day'), 'day');
    const dayEvents = eventsByDate[dateStr];
    
    let dateHeader;
    if (isToday) {
      dateHeader = "Today";
    } else if (isTomorrow) {
      dateHeader = "Tomorrow";
    } else {
      dateHeader = momentDate.format('dddd, MMMM D, YYYY');
    }
    
    return (
      <div key={dateStr} className="mb-8">
        <h3 className="text-xl font-bold text-primary mb-3">{dateHeader}</h3>
        
        {dayEvents.length === 0 ? (
          <p className="text-gray-500 italic">No tasks scheduled for this day.</p>
        ) : (
          <>
            <p className="text-gray-700 mb-4">
              {isToday 
                ? `You have ${dayEvents.length} task${dayEvents.length > 1 ? 's' : ''} scheduled for today.`
                : `You have ${dayEvents.length} task${dayEvents.length > 1 ? 's' : ''} scheduled for ${momentDate.format('MMM D')}.`
              }
            </p>
            
            {dayEvents.map((event) => (
              <AgendaEvent key={event.id} event={event} />
            ))}
          </>
        )}
      </div>
    );
  });
  
  return (
    <div className="p-4">
      {formattedDates}
    </div>
  );
};

// Calendar Legend Component to explain colors
const CalendarLegend = () => {
  return (
    <div className="bg-white p-4 rounded-md shadow-sm mb-4">
      <h4 className="text-sm font-semibold mb-2">Priority Color Legend</h4>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {Object.entries(priorityColors).map(([key, { color, label }]) => (
          <div key={key} className="flex items-center text-xs">
            <span className="inline-block w-3 h-3 rounded-full mr-2" style={{ backgroundColor: color }}></span>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
};

const Cld = () => {
  const dispatch = useDispatch();
  const { _ALL } = useSelector((state) => state.tasks);
  const { refresh } = useSelector((state) => state.commons);
  const authState = useSelector((state) => state.auth);
  const [currentUser, setCurrentUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [viewType, setViewType] = useState("month");
  
  // Detect and set current user once when component mounts
  useEffect(() => {
    // Try to find user in different places in auth state
    let userFound = null;
    
    if (authState) {
      if (authState.user) {
        userFound = authState.user;
      } else if (authState.currentUser) {
        userFound = authState.currentUser;
      } else if (authState.data) {
        userFound = authState.data;
      } else {
        // If we can't find user in expected places, check if the auth state itself has id/email
        if (authState.id || authState._id) {
          userFound = authState;
        }
      }
    }
    
    setCurrentUser(userFound);
  }, [authState]);
  
  // Fetch tasks on component mount or when refresh is triggered
  useEffect(() => {
    dispatch(FindTaskAction());
  }, [dispatch, refresh]);
  
  // Process tasks into calendar events when tasks or current user change
  useEffect(() => {
    if (!_ALL || !Array.isArray(_ALL) || _ALL.length === 0) {
      return;
    }
    
    // Get current user ID, with fallbacks for different possible structures
    const currentUserId = currentUser ? (currentUser._id || currentUser.id || "").toString() : "";
    
    // Filter tasks based on assignment to current user (or show all if no user is set)
    const filteredTasks = _ALL.filter(task => {
      // Skip invalid tasks
      if (!task) return false;
      
      // Check if task has required date fields
      const hasRequiredDates = task.start_date && task.end_date;
      if (!hasRequiredDates) {
        return false;
      }
      
      // If no current user, show all tasks
      if (!currentUserId) return true;
      
      // Check if task is assigned to current user
      if (!task.assigns) return false;
      
      try {
        // Parse assigns if it's a string
        let assignList = task.assigns;
        if (typeof assignList === 'string') {
          try {
            assignList = JSON.parse(assignList);
          } catch (e) {
            return false;
          }
        }
        
        // Handle assigns based on its type
        if (Array.isArray(assignList)) {
          // Check if user ID exists in the array
          return assignList.some(assignee => {
            // Get assignee ID with fallbacks
            let assigneeId;
            
            if (typeof assignee === 'string' || typeof assignee === 'number') {
              assigneeId = assignee.toString();
            } else if (assignee && typeof assignee === 'object') {
              assigneeId = (assignee._id || assignee.id || "").toString();
            } else {
              return false;
            }
            
            return assigneeId === currentUserId;
          });
        } else if (assignList && typeof assignList === 'object') {
          // If assigns is a single object
          const assigneeId = (assignList._id || assignList.id || "").toString();
          return assigneeId === currentUserId;
        } else if (assignList) {
          // If assigns is a single ID (string/number)
          const assigneeId = assignList.toString();
          return assigneeId === currentUserId;
        }
        
        return false;
      } catch (error) {
        return false;
      }
    });

    // Convert filtered tasks to calendar events with proper time handling
    const calendarEvents = filteredTasks.map(task => {
      try {
        // Parse start/end dates
        let startDate = new Date(task.start_date);
        let endDate = new Date(task.end_date);
        
        // Check if dates are valid
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          // Fallback parsing for YYYY-MM-DD format (without time)
          if (typeof task.start_date === 'string' && task.start_date.includes('-')) {
            const [year, month, day] = task.start_date.split('-').map(Number);
            startDate = new Date(year, month - 1, day, 9, 0); // Default to 9:00 AM
          }
          
          if (typeof task.end_date === 'string' && task.end_date.includes('-')) {
            const [year, month, day] = task.end_date.split('-').map(Number);
            endDate = new Date(year, month - 1, day, 17, 0); // Default to 5:00 PM
          }
          
          // If still invalid, skip this event
          if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return null;
          }
        }
        
        // Determine if it's an all-day event (with fallback)
        const isAllDay = task.is_all_day === undefined ? true : task.is_all_day;
        
        // Create event object
        return {
          id: task._id,
          title: task.title || "Untitled Task",
          start: startDate,
          end: endDate,
          allDay: isAllDay,
          resource: task, // Store the original task as resource for reference
          type: task.type,
          priority: task.priority || "2", // Default to medium priority if not specified
          status: task.status
        };
      } catch (error) {
        return null;
      }
    }).filter(event => event !== null);
    
    setEvents(calendarEvents);
  }, [_ALL, currentUser]);
  
  // Handle event click to show details and potentially load comments
  const handleSelectEvent = (event) => {
    // Try to load comments for the selected task if needed
    if (event.id && (!event.resource.comments || event.resource.comments.length === 0)) {
      dispatch(GetTaskCommentsAction(event.id))
        .then(comments => {
          console.log("Loaded comments for task:", comments);
          
          // If we got comments, update the event resource
          if (comments && comments.length > 0) {
            // This won't update the Redux store, just the local state
            event.resource.comments = comments;
          }
        })
        .catch(err => {
          console.error("Failed to load comments:", err);
        });
    }

    // Check for comments
    let commentsInfo = "";
    if (event.resource?.comments && Array.isArray(event.resource.comments) && event.resource.comments.length > 0) {
      commentsInfo = `\n\nThis task has ${event.resource.comments.length} comment(s).`;
    }

    swal({
      title: event.title,
      text: (event.resource?.description || "No description available") + commentsInfo,
      icon: "info",
      buttons: {
        cancel: "Close",
        edit: {
          text: "Edit Task",
          value: "edit",
        },
      },
    }).then((value) => {
      if (value === "edit") {
        // Navigate to task edit page or open edit popup
        // You can implement this based on your app's navigation
        console.log("Edit task:", event.id);
      }
    });
  };
  
  // Event style getter for color coding based on PRIORITY
  const eventStyleGetter = (event) => {
    // Get color based on priority
    const priorityInfo = priorityColors[event.priority] || priorityColors["2"];
    const backgroundColor = priorityInfo.color;
    
    return {
      style: { 
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.8,
        color: 'white',
        border: '0px',
        display: 'block'
      }
    };
  };
  
  // Handle view change
  const handleViewChange = (view) => {
    setViewType(view);
  };
  
  // Handle event resizing (changing duration)
  const handleEventResize = useCallback(({ event, start, end }) => {
    // Confirm before updating
    swal({
      title: "Update Task Schedule?",
      text: `Do you want to reschedule "${event.title}" to ${moment(start).format('lll')} - ${moment(end).format('lll')}?`,
      icon: "warning",
      buttons: true,
      dangerMode: false,
    })
    .then((willUpdate) => {
      if (willUpdate) {
        // Dispatch action to update task dates
        dispatch(RescheduleTaskAction(event.id, {
          start_date: start.toISOString(),
          end_date: end.toISOString(),
          is_all_day: event.allDay
        }));
      }
    });
  }, [dispatch]);
  
  // Handle event dragging (changing dates/times)
  const handleEventDrop = useCallback(({ event, start, end, allDay }) => {
    // Confirm before updating
    swal({
      title: "Update Task Schedule?",
      text: `Do you want to reschedule "${event.title}" to ${moment(start).format('lll')} - ${moment(end).format('lll')}?`,
      icon: "warning",
      buttons: true,
      dangerMode: false,
    })
    .then((willUpdate) => {
      if (willUpdate) {
        // Dispatch action to update task dates with proper error handling
        try {
          dispatch(RescheduleTaskAction(event.id, {
            start_date: start.toISOString(),
            end_date: end.toISOString(),
            is_all_day: allDay
          }));
        } catch (error) {
          console.error("Error rescheduling task:", error);
          swal("Error", "Failed to reschedule task. Please try again.", "error");
        }
      }
    });
  }, [dispatch]);
  
  // Custom components
  const components = {
    agenda: {
      event: SmartAgenda,
    }
  };
  
  // Format date display in the calendar header
  const formats = {
    dateFormat: 'D',
    dayFormat: 'ddd D/M',
    monthHeaderFormat: 'MMMM YYYY',
    dayHeaderFormat: 'dddd, MMMM D, YYYY',
    dayRangeHeaderFormat: ({ start, end }) => 
      `${moment(start).format('MMM D')} - ${moment(end).format('MMM D, YYYY')}`,
    timeGutterFormat: 'h:mm A'
  };
  
  return (
    <div className="my-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">
          {currentUser ? 
            `Tasks for ${currentUser.fullName || currentUser.name || currentUser.username || currentUser.email || 'Current User'}` 
            : 'All Tasks'}
        </h3>
        
        <div className="flex justify-between items-center mt-2">
          <p className="text-sm text-gray-500">
            {events.length} task{events.length !== 1 ? 's' : ''} scheduled
          </p>
          
          <div className="text-sm text-gray-600 italic">
            <span>Tip: </span>
            <span>Drag tasks to reschedule them, or resize to change duration.</span>
          </div>
        </div>
      </div>
      
      {/* Add priority color legend */}
      <CalendarLegend />
      
      {viewType === 'agenda' ? (
        // Custom agenda view with narrative style
        <SmartAgenda events={events} date={new Date()} />
      ) : (
        // Regular calendar for other views
        <DnDCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          views={["month", "week", "day", "agenda"]}
          view={viewType}
          onView={handleViewChange}
          defaultView="month"
          eventPropGetter={eventStyleGetter}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          onEventResize={handleEventResize}
          formats={formats}
          resizable
          selectable
          popup
          step={15} // 15-minute intervals
          timeslots={4} // 4 slots per hour
          showMultiDayTimes
          // Time range for day/week views - show 7am to 9pm
          min={new Date(new Date().setHours(7, 0, 0))}
          max={new Date(new Date().setHours(21, 0, 0))}
          // Critical fix: Ensure the drag functionality works correctly
          draggableAccessor={() => true}
          resizableAccessor={() => true}
          components={components}
        />
      )}
    </div>
  );
};

export default Cld;