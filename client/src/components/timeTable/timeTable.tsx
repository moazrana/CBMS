import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./timetable.scss";

// Start week on Monday for the calendar
moment.updateLocale(moment.locale(), { week: { dow: 1 } });

const localizer = momentLocalizer(moment);

// Update your sampleEvents to have overlapping times for the same time slot
type SchoolEvent = {
  id: number;
  title: string;
  eventType: string;
  category: string;
  source: string;
  resource?: string;
};
type Event = {
  id: number;
  start: Date;
  end: Date;
  events?:SchoolEvent[]
};
// const addSlot = () => {
//   console.log("addSlot");
// }
// const sampleEvents: Event[] = [
//   {
//     id: 0,
//     start: new Date(2025, 8, 16, 9, 30, 0),
//     end: new Date(2025, 8, 16, 10, 0, 0),
//     events:[
//       {
//         id: 0,
//         title: "Registration",
//         category: "Registration",
//         eventType: "Training - Classroom",
//         source: "From Mathematics",
//       },
//       {
//         id: 1,
//         title: "Registration",
//         category: "Registration",
//         eventType: "Training - Classroom",
//         source: "From Mathematics",
//       }
//     ]
// }];
interface TimeTableProps {
  propEvents: Event[];
  onTimeSlotButtonPress?: () => void;
}
const TimeTable = ({ propEvents, onTimeSlotButtonPress }: TimeTableProps) => {
  const [events] = useState<Event[]>(propEvents);
  const [currentDate, setCurrentDate] = useState(new Date());

  // Day filter: add a class to Sundays so we can hide them via CSS
  const dayPropGetter = (date: Date) => {
    const isSunday = date.getDay() === 0; // 0=Sunday
    return isSunday ? { className: "hidden-day" } : {};
  };

  // Define fixed time slot durations based on exact ranges
  const getTimeSlotDuration = (time: moment.Moment) => {
    const hour = time.hour();
    const minute = time.minute();

    // Fixed slots: 09:30-10:00 (30m), 10:00-10:15 (15m), 10:15-11:15 (60m), 11:15-11:30 (15m),
    // 11:30-12:30 (60m), 12:30-13:00 (30m), 13:00-14:00 (60m)
    if (hour === 9 && minute === 30) return 30; // Breakfast Club start
    if (hour === 10 && minute === 0) return 15; // transition to Session 1
    if (hour === 10 && minute === 15) return 60; // Session 1
    if (hour === 11 && minute === 15) return 15; // Break
    if (hour === 11 && minute === 30) return 60; // Session 2
    if (hour === 12 && minute === 30) return 30; // Lunch
    if (hour === 13 && minute === 0) return 60; // Session 3

    // Any other minute within range falls back to 15 to keep grid consistent
    return 60;
  };

  // Label for the exact slot starts only
  const getTimeSlotLabel = (time: moment.Moment) => {
    const hour = time.hour();
    const minute = time.minute();
    if (hour === 9 && minute === 30) return "Breakfast Club";
    if (hour === 10 && minute === 15) return "Session 1";
    if (hour === 11 && minute === 15) return "Break";
    if (hour === 11 && minute === 30) return "Session 2";
    if (hour === 12 && minute === 30) return "Lunch";
    if (hour === 13 && minute === 0) return "Session 3";
    return "";
  };

  // Custom Event Component to display structured data
  const EventComponent = ({ event }: { event: Event }) => (
    <div
      className="custom-event"
      style={{
        borderRadius: "4px",
        padding: "4px 8px",
        fontSize: "12px",
        fontWeight: "500",
        height: "auto",
        minHeight: "60px",
        marginBottom: "2px",
      }}
    >
      {event.events?.map((ev) => (
        <>
          <div className="event-container">
            <div style={{ fontSize: "14px", fontWeight: "bold", marginBottom: "4px" }}>
              {ev.category}
            </div>
            <div style={{ borderTop: "1px dashed", paddingTop: "4px", marginBottom: "4px" }}>
              {ev.eventType}
            </div>
            <div style={{ fontSize: "10px"}}>From</div>
            <div style={{ fontSize: "11px", fontWeight: "500" }}>{ev.source}</div>
          </div>
        </>
      ))}
    </div>
  );

  const eventPropGetter = () => ({
    style: { minHeight: 56 } // or whatever fits your design
  });

  return (
    <div id="time-table-div">
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%" }}
        defaultView="week"
        views={["week"]}
        popup
        min={new Date(2025, 8, 10, 9, 30, 0)}
        max={new Date(2025, 8, 10, 14, 0, 0)}
        step={15}
        timeslots={1}
        dayPropGetter={dayPropGetter}
        dayLayoutAlgorithm="no-overlap"
        eventPropGetter={eventPropGetter}
        date={currentDate}
        onNavigate={(d) => setCurrentDate(d)}
        components={{
          timeGutterHeader: () => (
            <div className="gutter-header">
              <div className="gutter-month">Time Table</div>
              <div className="gutter-range">
                {moment(currentDate).format('MMMM')}
              </div>
            </div>
          ),
          timeSlotWrapper: (props: unknown) => {
            const { children, value } = props as { children: React.ReactNode; value: Date };
            const time = moment(value);
            const duration = getTimeSlotDuration(time);
            const nextTime = moment(value).add(duration, 'minutes');
            const label = getTimeSlotLabel(time);

            if (!label) return null; // JS: drop unnamed slot entirely

            const timeRange = `${time.format('HH:mm')}-${nextTime.format('HH:mm')}`;
            return (
              <div className={`rbc-time-slot duration-${duration}`}>
                <div className="time-range">{timeRange}</div>

                <button className="time-slot-button" onClick={onTimeSlotButtonPress}>
                  +
                </button>
                <div className="time-slot-label">{label}</div>
                {children}
              </div>
            );
          },
          event: EventComponent,
          week: {
            header: ({ date }: { date: Date }) => (
              <div className="day-header">
                <div className="day-header-date">{moment(date).format('DD')}</div>
                <div className="day-header-day">{moment(date).format('dddd')}</div>
              </div>
            ),
          },
        }}
      />
    </div>
  );
};

export default TimeTable;
