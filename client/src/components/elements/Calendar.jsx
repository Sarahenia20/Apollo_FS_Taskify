import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useDispatch, useSelector } from "react-redux";
import { FindTaskAction } from "../../redux/actions/tasks";
import { useEffect, useMemo, useState } from "react";

const localizer = momentLocalizer(moment);

const Cld = () => {
  const dispatch = useDispatch();
  const [tasks, setTasks] = useState([]);
  const { _ALL } = useSelector((state) => state.tasks);
  useEffect(() => {
    dispatch(FindTaskAction());
  }, []);

  useEffect(() => {
    setTasks(_ALL || []);
  }, [_ALL]);

  const events = useMemo(() => {
    return tasks
      .filter(task => task && task.start_date && task.end_date) // Filter out tasks with missing dates
      .map((task) => {
        try {
          return {
            title: task.title,
            type: task.type,
            start: new Date(
              task.start_date.split("-")[0],
              task.start_date.split("-")[1] - 1,
              task.start_date.split("-")[2],
              10,
              0
            ),
            end: new Date(
              task.end_date.split("-")[0],
              task.end_date.split("-")[1] - 1,
              task.end_date.split("-")[2],
              12,
              0
            ),
          };
        } catch (error) {
          console.error("Error processing task:", task, error);
          return null;
        }
      })
      .filter(event => event !== null); // Remove any null events from failed processing
  }, [tasks]);

  const eventStyleGetter = (event, start, end, isSelected) => {
    const colors = {
      "2": "orange",
      "3": "#ff6289"
    }
    
    return {
      style: { backgroundColor: colors[event.type] }
    };
  }

  return (
    <div>
      <Calendar
        localizer={localizer}
        events={events}
        eventPropGetter={eventStyleGetter}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
      />
    </div>
  );
};

export default Cld;