import React, { useState } from "react";
import { Calendar, Views, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./timetable.scss";

// Start week on Monday for the calendar
moment.updateLocale(moment.locale(), { week: { dow: 1 } });

const localizer = momentLocalizer(moment);

// Mapping between known period/session labels and their corresponding time ranges.
// Kept at module scope so React hook memoization doesn't need this object as a dependency.
const PERIOD_NAME_TO_TIME: Record<string, [string, string]> = {
  "Breakfast Club": ["09:30", "10:00"],
  "Breakfast Club (AM Reg)": ["10:00", "10:15"],
  "Achieve Training": ["10:15", "11:15"],
  "Stanley House": ["11:30", "12:30"],
  "Break": ["11:15", "11:30"],
  "Lunch": ["12:30", "13:00"],
  "Session 1": ["10:15", "11:15"],
  "Session 2": ["11:30", "12:30"],
  "Session 3": ["13:00", "14:00"],
  "Session 3 - 13.00 - 14.00": ["13:00", "14:00"],
};

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

type CalendarView = 'month' | 'week';

interface TimeTableProps {
  propEvents: Event[];
  /** Optional initial view for this calendar instance */
  initialView?: CalendarView;
  /** Optional date to centre this calendar instance on */
  displayDate?: Date;
  /** Optional controlled view (shared across multiple calendars) */
  view?: CalendarView;
  /** Optional callback when view changes */
  onViewChange?: (view: CalendarView) => void;
  /** Hide the month/week toggle buttons (use external toggle). */
  hideViewToggle?: boolean;
  /** DB periods to render timetable sessions (labels + time axis). */
  periods?: Array<{
    _id?: string;
    name?: string;
    startTime?: string;
    endTime?: string;
  }>;
  /** Background color for timetable event containers */
  eventColor?: string;
}
const TimeTable = ({
  propEvents,
  initialView = 'week',
  displayDate,
  view,
  onViewChange,
  hideViewToggle = false,
  periods = [],
  eventColor = "#27ae60",
}: TimeTableProps) => {
  const events = propEvents ?? [];
  const [currentDate, setCurrentDate] = useState<Date>(displayDate ?? new Date());
  const [internalView, setInternalView] = useState<CalendarView>(initialView);

  const effectiveView: CalendarView = view ?? internalView;

  // Keep internal date/view in sync when props change (for stacked calendars)
  React.useEffect(() => {
    if (displayDate) {
      setCurrentDate(displayDate);
    }
  }, [displayDate]);

  React.useEffect(() => {
    setInternalView(initialView);
  }, [initialView]);

  const handleViewChange = (newView: CalendarView) => {
    setInternalView(newView);
    if (onViewChange) onViewChange(newView);
  };

  // Under the hood, show Mon–Fri only for "week" by using react-big-calendar's work_week view.
  const rbcView = effectiveView === 'week' ? Views.WORK_WEEK : Views.MONTH;

  // Build timetable session slots from DB periods (fallback to hardcoded defaults).
  // These slots drive the time-axis labels and the wrapper heights for each session.
  const parseTimeToMinutes = (s?: string) => {
    if (!s || typeof s !== "string") return null;
    // Accept: HH:mm or HH.MM
    const cleaned = s.trim();
    const parts = cleaned.includes(":") ? cleaned.split(":") : cleaned.split(".");
    if (parts.length < 2) return null;
    const h = Number(parts[0]);
    const m = Number(parts[1]);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    return h * 60 + m;
  };

  type PeriodSlot = {
    name: string;
    startMinutes: number;
    endMinutes: number;
    durationMinutes: number;
  };

  const periodSlots: PeriodSlot[] = React.useMemo(() => {
    const slots: PeriodSlot[] = [];

    for (const p of periods ?? []) {
      const name = (p?.name ?? '').toString().trim();

      const startMinutes = parseTimeToMinutes(p?.startTime);
      const endMinutes = parseTimeToMinutes(p?.endTime);

      // If DB has explicit start/end times, trust them.
      if (startMinutes != null && endMinutes != null && endMinutes > startMinutes) {
        slots.push({
          name: name || 'Session',
          startMinutes,
          endMinutes,
          durationMinutes: endMinutes - startMinutes,
        });
        continue;
      }

      // Otherwise, fall back to known name-to-time mapping.
      const mapped = name ? PERIOD_NAME_TO_TIME[name] : undefined;
      if (mapped) {
        const [startStr, endStr] = mapped;
        const start = parseTimeToMinutes(startStr);
        const end = parseTimeToMinutes(endStr);
        if (start != null && end != null && end > start) {
          slots.push({
            name: name || 'Session',
            startMinutes: start,
            endMinutes: end,
            durationMinutes: end - start,
          });
        }
      }
    }

    // If nothing comes from DB, use fallback hardcoded slots.
    if (slots.length === 0) {
      const fallback: PeriodSlot[] = [
        { name: "Breakfast Club", startMinutes: 9 * 60 + 30, endMinutes: 10 * 60 + 0, durationMinutes: 30 },
        { name: "Breakfast Club (AM Reg)", startMinutes: 10 * 60 + 0, endMinutes: 10 * 60 + 15, durationMinutes: 15 },
        { name: "Achieve Training", startMinutes: 10 * 60 + 15, endMinutes: 11 * 60 + 15, durationMinutes: 60 },
        { name: "Break", startMinutes: 11 * 60 + 15, endMinutes: 11 * 60 + 30, durationMinutes: 15 },
        { name: "Stanley House", startMinutes: 11 * 60 + 30, endMinutes: 12 * 60 + 30, durationMinutes: 60 },
        { name: "Lunch", startMinutes: 12 * 60 + 30, endMinutes: 13 * 60 + 0, durationMinutes: 30 },
        { name: "Session 3", startMinutes: 13 * 60 + 0, endMinutes: 14 * 60 + 0, durationMinutes: 60 },
      ];
      return fallback;
    }

    // Ensure correct ordering for time-axis and label lookup.
    slots.sort((a, b) => a.startMinutes - b.startMinutes);
    return slots;
  }, [periods]);

  // Day filter: add a class to Sundays so we can hide them via CSS
  const dayPropGetter = (date: Date) => {
    const isSunday = date.getDay() === 0; // 0=Sunday
    return isSunday ? { className: "hidden-day" } : {};
  };

  const slotsByStartMinutes = React.useMemo(() => {
    const map = new Map<number, PeriodSlot>();
    for (const slot of periodSlots) map.set(slot.startMinutes, slot);
    return map;
  }, [periodSlots]);

  // Define time-axis slot duration/labels based on DB periods.
  const getTimeSlotDuration = (time: moment.Moment) => {
    const minutes = time.hour() * 60 + time.minute();
    return slotsByStartMinutes.get(minutes)?.durationMinutes ?? 60;
  };

  // Label for the exact slot starts only.
  const getTimeSlotLabel = (time: moment.Moment) => {
    const minutes = time.hour() * 60 + time.minute();
    return slotsByStartMinutes.get(minutes)?.name ?? "";
  };

  const slotMinMax = React.useMemo(() => {
    const fallback: PeriodSlot[] = [
      { name: "Breakfast Club", startMinutes: 9 * 60 + 30, endMinutes: 10 * 60 + 0, durationMinutes: 30 },
      { name: "Breakfast Club (AM Reg)", startMinutes: 10 * 60 + 0, endMinutes: 10 * 60 + 15, durationMinutes: 15 },
      { name: "Achieve Training", startMinutes: 10 * 60 + 15, endMinutes: 11 * 60 + 15, durationMinutes: 60 },
      { name: "Break", startMinutes: 11 * 60 + 15, endMinutes: 11 * 60 + 30, durationMinutes: 15 },
      { name: "Stanley House", startMinutes: 11 * 60 + 30, endMinutes: 12 * 60 + 30, durationMinutes: 60 },
      { name: "Lunch", startMinutes: 12 * 60 + 30, endMinutes: 13 * 60 + 0, durationMinutes: 30 },
      { name: "Session 3", startMinutes: 13 * 60 + 0, endMinutes: 14 * 60 + 0, durationMinutes: 60 },
    ];

    const slots = periodSlots.length ? periodSlots : fallback;
    const minSlot = slots.reduce((a, b) => (b.startMinutes < a.startMinutes ? b : a), slots[0]);
    const maxSlot = slots.reduce((a, b) => (b.endMinutes > a.endMinutes ? b : a), slots[0]);

    const base = new Date(currentDate);
    const slotMin = new Date(base);
    slotMin.setHours(Math.floor(minSlot.startMinutes / 60), minSlot.startMinutes % 60, 0, 0);
    const slotMax = new Date(base);
    slotMax.setHours(Math.floor(maxSlot.endMinutes / 60), maxSlot.endMinutes % 60, 0, 0);
    return { slotMin, slotMax };
  }, [periodSlots, currentDate]);

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
        minHeight: "44px",
        marginBottom: "2px",
      }}
    >
      {event.events?.map((ev) => (
        <>
          <div className="event-container" style={{ backgroundColor: eventColor }}>
            <div style={{ fontSize: "12px", fontWeight: "bold", marginBottom: "1px" }}>
              {ev.category}
            </div>
            <div style={{ borderTop: "1px dashed", paddingTop: "2px", marginBottom: "2px" }}>
              {ev.eventType}
            </div>
            <div style={{ fontSize: "7px"}}>From</div>
            <div style={{ fontSize: "9px", fontWeight: "500" }}>{ev.source}</div>
          </div>
        </>
      ))}
    </div>
  );

  const eventPropGetter = () => ({
    style: { minHeight: 40 }
  });

  return (
    <div className={effectiveView === "month" ? "tt-view-month" : ""}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%", width: "100%" }}
        view={rbcView}
        onView={(newView) => handleViewChange(String(newView) === 'month' ? 'month' : 'week')}
        defaultView={initialView}
        views={{ month: true, work_week: true }}
        popup
        min={slotMinMax.slotMin}
        max={slotMinMax.slotMax}
        step={15}
        timeslots={1}
        dayPropGetter={dayPropGetter}
        dayLayoutAlgorithm="no-overlap"
        eventPropGetter={eventPropGetter}
        date={currentDate}
        onNavigate={(d) => setCurrentDate(d)}
        components={{
          toolbar: () => (
            <div className="rbc-toolbar tt-custom-toolbar">
              {effectiveView === "month" && (
                <div className="tt-month-name">
                  {moment(currentDate).format("MMMM YYYY")}
                </div>
              )}
              {!hideViewToggle && (
                <span className="rbc-btn-group">
                  <button type="button" onClick={() => handleViewChange("month")} className={effectiveView === "month" ? "rbc-active" : ""}>
                    Month
                  </button>
                  <button type="button" onClick={() => handleViewChange("week")} className={effectiveView === "week" ? "rbc-active" : ""}>
                    Week
                  </button>
                </span>
              )}
            </div>
          ),
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
                <div className="time-slot-label">{label}</div>
                {children}
              </div>
            );
          },
          event: EventComponent,
          work_week: {
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
