import Layout from "../../../layouts/layout";
import FilterSec from "../../../components/FilterSec/FilterSec";
import "./index.scss";
import Select from "../../../components/Select/Select";
import { useState, useEffect, useMemo } from "react";
import Student from "../../../assets/safeguarding/calendar.svg";
import Staff from "../../../assets/safeguarding/student.svg";
import Class from "../../../assets/safeguarding/class.svg";
import TimeTableComponent from "../../../components/timeTable/timeTable";
import Popup from "../../../components/Popup/Popup";
import Subject from "../../../assets/safeguarding/subject.svg";
import YearGroup from "../../../assets/safeguarding/yearGroup.svg";
import Calendar from "../../../assets/safeguarding/calendar.svg";
import Period from "../../../assets/safeguarding/period.svg";
import Location from "../../../assets/safeguarding/location.svg";
import Teacher from "../../../assets/dashboard/teachers.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPrint } from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { DropdownOption } from "../../../types/DropDownOption";
import DateInput from "../../../components/dateInput/DateInput";
import SearchableSelect from "../../../components/SearchableSelect/SearchableSelect";
import { useApiRequest } from "../../../hooks/useApiRequest";

const DAY_OPTIONS: DropdownOption[] = [
  { value: "Monday", label: "Monday" },
  { value: "Tuesday", label: "Tuesday" },
  { value: "Wednesday", label: "Wednesday" },
  { value: "Thursday", label: "Thursday" },
  { value: "Friday", label: "Friday" },
];

const LOCATION_OPTIONS: DropdownOption[] = [
  { label: "Warrington", value: "Warrington" },
  { label: "Bury", value: "Bury" },
];

const SITE_OPTIONS: DropdownOption[] = [
  { value: "", label: "All Sites" },
  { value: "Warrington", label: "Warrington" },
  { value: "Bury", label: "Bury" },
];

const SUBJECT_OPTIONS: DropdownOption[] = [
  { value: "Construction", label: "Construction" },
  { value: "Motor Vehicle", label: "Motor Vehicle" },
  { value: "Hairdressing", label: "Hairdressing" },
  { value: "Maths/English", label: "Maths/English" },
  { value: "Outreach / Post 16", label: "Outreach / Post 16" },
];

interface ClassData {
  _id: string;
  location?: string;
  subject?: string;
  yeargroup?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
}

/** Schedule from GET /schedules/timetable (with class and period populated) */
interface TimetableSchedule {
  _id: string;
  class: { _id: string; location?: string; subject?: string; yeargroup?: string; fromDate?: string; toDate?: string };
  day: string;
  period: { _id: string; name: string; startTime?: string; endTime?: string };
  location?: string;
  staff?: { name?: string };
  teacher?: { name?: string };
}

/** Calendar event for TimeTableComponent */
interface CalendarEvent {
  id: number;
  start: Date;
  end: Date;
  events?: { id: number; title: string; eventType: string; category: string; source: string }[];
}

const Index = () => {
    const [studentOptions, setStudentOptions] = useState<DropdownOption[]>([]);
    const [filterStudent, setFilterStudent] = useState<string>("");
    const [staffOptions, setStaffOptions] = useState<DropdownOption[]>([]);
    const [filterStaff, setFilterStaff] = useState<string>("");
    const [classOptions, setClassOptions] = useState<DropdownOption[]>([]);
    const [filterClass, setFilterClass] = useState<string>("");
    const [filterSite, setFilterSite] = useState<string>("");
    const [filterSubject, setFilterSubject] = useState<string>("");
    const [classIdsForFilterStudent, setClassIdsForFilterStudent] = useState<string[]>([]);
    const [addSlotShown, setAddSlotShown] = useState<boolean>(false);
    
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [classes, setClasses] = useState<DropdownOption[]>([]);
    const [addLocation, setAddLocation] = useState<string>("");
    const [addSubject, setAddSubject] = useState<string>("");
    const [addYearGroup, setAddYearGroup] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");
    const [allClasses, setAllClasses] = useState<ClassData[]>([]);
    const [yearGroupOptions, setYearGroupOptions] = useState<DropdownOption[]>([]);
    const [periodOptions, setPeriodOptions] = useState<DropdownOption[]>([]);
    const [slotStaffOptions, setSlotStaffOptions] = useState<DropdownOption[]>([]);
    const [timetableSchedules, setTimetableSchedules] = useState<TimetableSchedule[]>([]);
    const { executeRequest } = useApiRequest();

    interface Slot{
        day:string,
        period:string,
        location:string,
        staff:string,
        teacher:string
    }
    const [slots,setSlots] = useState<Slot[]>([{day:'',period:'',location:'',staff:'',teacher:''}]);
    const addPopup = () => {
        return (
            <>
                <Popup
                    isOpen={addSlotShown}
                    onClose={() => setAddSlotShown(false)}
                    title="Add Timetable Allocations"
                    width="80%"
                    headerColor="var(--sidebar-heading)"
                    bodyColor="var(--hover-bg)"
                    confirmText="Update"
                    onConfirm={async () => {
                        if (!selectedClass?.trim()) {
                            alert("Please select a class.");
                            return;
                        }
                        const validSlots = slots.filter(
                            (s) =>
                                s.day?.trim() &&
                                s.period?.trim() &&
                                s.location?.trim() &&
                                s.staff?.trim() &&
                                s.teacher?.trim()
                        );
                        try {
                            // await executeRequest("delete", `/schedules/class/${selectedClass}`);
                            if (validSlots.length > 0) {
                                const schedules = validSlots.map((s) => ({
                                    class: selectedClass,
                                    day: s.day.trim(),
                                    period: s.period.trim(),
                                    location: s.location.trim(),
                                    staff: s.staff.trim(),
                                    teacher: s.teacher.trim(),
                                }));
                                await executeRequest("post", "/schedules", { schedules });
                            }
                            setAddSlotShown(false);
                            alert("Schedule saved successfully.");
                        } catch (err) {
                            console.error(err);
                            alert("Failed to save schedule. Please try again.");
                        }
                    }}
                    cancelText="Cancel"
                >
                    <div className="popup-body-div">
                        <div className="popup-body-item">
                            <div className="popup-body-item-header">
                                <p className="popup-body-item-header-text">Timetable Details.</p>
                            </div>
                            <div className="popup-body-item-body">
                                <div className="inputs-div">
                                    <Select
                                        label="Location"
                                        name="location"
                                        value={addLocation}
                                        onChange={(e) => setAddLocation(e.target.value)}
                                        options={LOCATION_OPTIONS}
                                        placeholder="Select Location"
                                        icon={Location}
                                    />
                                    <Select
                                        label="Subject"
                                        name="subject"
                                        value={addSubject}
                                        onChange={(e) => setAddSubject(e.target.value)}
                                        options={SUBJECT_OPTIONS}
                                        placeholder="Select Subject"
                                        icon={Subject}
                                    />
                                    <Select
                                        label="Year Group"
                                        name="yearGroup"
                                        value={addYearGroup}
                                        onChange={(e) => setAddYearGroup(e.target.value)}
                                        options={yearGroupOptions}
                                        placeholder="Select Year Group"
                                        icon={YearGroup}
                                    />
                                </div>
                                <div className="inputs-div">
                                    <DateInput
                                        label="Start Date"
                                        name="startDate"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        placeholder="Select Start Date"
                                        icon={Calendar}
                                    />
                                    <DateInput
                                        label="End Date"
                                        name="endDate"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        placeholder="Select End Date"
                                        icon={Calendar}
                                    />
                                    <Select
                                        label="Class"
                                        name="class"
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        options={classes}
                                        placeholder="Select Class"
                                        icon={Class}
                                        disabled={classes.length === 0}
                                    />
                                </div>
                            </div>
                            <div className="popup-body-item-header">
                                <p className="popup-body-item-header-text">Schedule Slot.</p>
                            </div>
                        {slots.map((slot, idx) => (
                            <div className="slot-div" key={idx}>
                                <div className="inputs-div">
                                    <Select
                                        label="Day"
                                        name="day"
                                        value={slot.day}
                                        onChange={(e) => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, day: e.target.value } : s))}
                                        options={DAY_OPTIONS}
                                        placeholder="Select Day"
                                        icon={Calendar}
                                    />
                                    <Select
                                        label="Period"
                                        name="period"
                                        value={slot.period}
                                        onChange={(e) => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, period: e.target.value } : s))}
                                        options={periodOptions}
                                        placeholder="Select Period"
                                        icon={Period}
                                    />
                                    <Select
                                        label="Location"
                                        name="location"
                                        value={slot.location}
                                        onChange={(e) => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, location: e.target.value } : s))}
                                        options={LOCATION_OPTIONS}
                                        placeholder="Select Location"
                                        icon={Location}
                                    />
                                    <Select
                                        label="Staff"
                                        name="staff"
                                        value={slot.staff}
                                        onChange={(e) => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, staff: e.target.value } : s))}
                                        options={slotStaffOptions}
                                        placeholder="Select Staff"
                                        icon={Staff}
                                    />
                                </div>
                                <div className="inputs-div">
                                    <div className="input-div">
                                        <Select
                                            label="Teacher"
                                            name="teacher"
                                            value={slot.teacher}
                                            onChange={(e) => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, teacher: e.target.value } : s))}
                                            options={slotStaffOptions}
                                            placeholder="Select Teacher"
                                            icon={Teacher}
                                        />
                                    </div>
                                    {idx === slots.length - 1 && (    
                                        <div className="input-div btns-div-tt">
                                            <button
                                                type="button"
                                                className="add-slot-btn"
                                                onClick={() => {
                                                    setSlots(prev => [
                                                        ...prev,
                                                        {
                                                            day: "",
                                                            period: "",
                                                            location: "",
                                                            staff: "",
                                                            teacher: ""
                                                        }
                                                    ]);
                                                }}
                                            >
                                                +
                                            </button>
                                            <button
                                                type="button"
                                                className="remove-slot-btn"
                                                onClick={() => {
                                                    setSlots(prev => prev.length > 1 ? prev.slice(0, -1) : prev);
                                                }}
                                            >
                                            <FontAwesomeIcon icon={faTrash} />
                                            </button>
                                        </div>
                                        
                                    )}
                                </div>
                            </div>
                        ))}
                        </div>
                    </div>
                </Popup>
        </>
        )
    }
    const showAddSlot = () => {
        console.log("showAddSlot");
        setAddSlotShown(true);
    }
    const filterContent = (
        <>
            <div className="inputs-div-tt">
                <div className="input-div">
                    <SearchableSelect
                        label="Student"
                        name="filterStudent"
                        value={filterStudent}
                        onChange={(v) => setFilterStudent(String(v))}
                        options={studentOptions}
                        onSearch={async (term) => {
                            try {
                                const res = await executeRequest("get", `/students?search=${encodeURIComponent(term)}&perPage=100`);
                                const list = Array.isArray(res) ? res : [];
                                setStudentOptions(list.map((s: { _id: string; personalInfo?: { legalFirstName?: string; lastName?: string; preferredName?: string } }) => {
                                    const p = s.personalInfo || {};
                                    const name = [p.preferredName || p.legalFirstName, p.lastName].filter(Boolean).join(" ") || s._id;
                                    return { value: s._id, label: name };
                                }));
                            } catch {
                                setStudentOptions([]);
                            }
                        }}
                        placeholder="Search students..."
                        icon={Student}
                    />
                </div>
                <div className="input-div">
                    <SearchableSelect
                        label="Staff"
                        name="filterStaff"
                        value={filterStaff}
                        onChange={(v) => setFilterStaff(String(v))}
                        options={staffOptions}
                        onSearch={async (term) => {
                            try {
                                const res = await executeRequest("get", `/staff?search=${encodeURIComponent(term)}&perPage=100`);
                                const list = Array.isArray(res) ? res : [];
                                setStaffOptions(list.map((s: { _id: string; name?: string }) => ({ value: s._id, label: s.name || s._id })));
                            } catch {
                                setStaffOptions([]);
                            }
                        }}
                        placeholder="Search staff..."
                        icon={Staff}
                    />
                </div>
                <div className="input-div">
                    <SearchableSelect
                        label="Class/Provision"
                        name="filterClass"
                        value={filterClass}
                        onChange={(v) => setFilterClass(String(v))}
                        options={classOptions}
                        onSearch={async (term) => {
                            try {
                                const res = await executeRequest("get", `/classes?search=${encodeURIComponent(term)}&perPage=100`);
                                const list = Array.isArray(res) ? res : [];
                                setClassOptions(list.map((c: ClassData) => ({ value: c._id, label: `${c.subject ?? ""} - ${c.yeargroup ?? ""}`.trim() || c._id })));
                            } catch {
                                setClassOptions([]);
                            }
                        }}
                        placeholder="Search classes..."
                        icon={Class}
                    />
                </div>
            </div>
            <div className="inputs-div-tt">
                <div className="input-div">
                    <Select
                        label="Site"
                        name="filterSite"
                        value={filterSite}
                        onChange={(e) => setFilterSite(e.target.value)}
                        options={SITE_OPTIONS}
                        placeholder="All Sites"
                        icon={Location}
                    />
                </div>
                <div className="input-div">
                    <Select
                        label="Subject"
                        name="filterSubject"
                        value={filterSubject}
                        onChange={(e) => setFilterSubject(e.target.value)}
                        options={[{ value: "", label: "All Subjects" }, ...SUBJECT_OPTIONS]}
                        placeholder="All Subjects"
                        icon={Subject}
                    />
                </div>
                <div className="input-div" />
            </div>
        </>
    );
    // Fetch classes, year groups, periods (sessions), and staff when Add Timetable Allocations popup opens
    useEffect(() => {
        if (!addSlotShown) return;
        let cancelled = false;
        const fetchData = async () => {
            try {
                const [classesRes, yearGroupsRes, periodsRes, staffRes] = await Promise.all([
                    executeRequest("get", "/classes?perPage=1000"),
                    executeRequest("get", "/year-groups"),
                    executeRequest("get", "/periods"),
                    executeRequest("get", "/staff?perPage=1000"),
                ]);
                if (cancelled) return;
                if (Array.isArray(classesRes)) setAllClasses(classesRes as ClassData[]);
                const ygList = Array.isArray(yearGroupsRes) ? yearGroupsRes : [];
                setYearGroupOptions(ygList.map((yg: { _id: string; name: string }) => ({ value: yg.name, label: yg.name })));
                const periodList = Array.isArray(periodsRes) ? periodsRes : [];
                setPeriodOptions(periodList.map((p: { _id: string; name: string }) => ({ value: p._id, label: p.name })));
                const staffList = Array.isArray(staffRes) ? staffRes : [];
                setSlotStaffOptions(staffList.map((s: { _id: string; name: string }) => ({ value: s._id, label: s.name || s._id })));
            } catch {
                if (!cancelled) {
                    setAllClasses([]);
                    setYearGroupOptions([]);
                    setPeriodOptions([]);
                    setSlotStaffOptions([]);
                }
            }
        };
        fetchData();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only refetch when popup opens
    }, [addSlotShown]);

    // Filter class dropdown by Location, Subject, Year group, Start date, End date
    const filteredClassOptions = useMemo(() => {
        let list = allClasses;
        if (addLocation) {
            list = list.filter((c) => c.location === addLocation);
        }
        if (addSubject) {
            list = list.filter((c) => c.subject === addSubject);
        }
        if (addYearGroup) {
            list = list.filter((c) => c.yeargroup === addYearGroup);
        }
        if (startDate && endDate) {
            const start = new Date(startDate + "T00:00:00").getTime();
            const end = new Date(endDate + "T23:59:59").getTime();
            list = list.filter((c) => {
                const from = c.fromDate ? new Date(c.fromDate).getTime() : 0;
                const to = c.toDate ? new Date(c.toDate).getTime() : 0;
                return from <= end && to >= start;
            });
        } else if (startDate) {
            const start = new Date(startDate + "T00:00:00").getTime();
            list = list.filter((c) => {
                const to = c.toDate ? new Date(c.toDate).getTime() : 0;
                return to >= start;
            });
        } else if (endDate) {
            const end = new Date(endDate + "T23:59:59").getTime();
            list = list.filter((c) => {
                const from = c.fromDate ? new Date(c.fromDate).getTime() : 0;
                return from <= end;
            });
        }
        return list.map((c) => ({
            value: c._id,
            label: `${c.subject ?? ""} - ${c.yeargroup ?? ""}`,
        }));
    }, [allClasses, addLocation, addSubject, addYearGroup, startDate, endDate]);

    // Keep classes state in sync with filtered options; clear selected class if no longer in list
    useEffect(() => {
        setClasses(filteredClassOptions);
        setSelectedClass((prev) => {
            const stillValid = filteredClassOptions.some((opt) => opt.value === prev);
            return stillValid ? prev : "";
        });
    }, [filteredClassOptions]);

    // Load existing schedules when a class is selected in the popup
    useEffect(() => {
        if (!addSlotShown || !selectedClass?.trim()) {
            if (!addSlotShown) return;
            setSlots([{ day: "", period: "", location: "", staff: "", teacher: "" }]);
            return;
        }
        let cancelled = false;
        const loadSchedules = async () => {
            try {
                const list = await executeRequest("get", `/schedules/class/${selectedClass}`);
                if (cancelled) return;
                const arr = Array.isArray(list) ? list : [];
                const toId = (x: unknown) =>
                    x && typeof x === "object" && x !== null && "_id" in x
                        ? String((x as { _id: string })._id)
                        : String(x ?? "");
                if (arr.length === 0) {
                    setSlots([{ day: "", period: "", location: "", staff: "", teacher: "" }]);
                } else {
                    setSlots(
                        arr.map((s: { day?: string; period?: unknown; location?: string; staff?: unknown; teacher?: unknown }) => ({
                            day: s.day ?? "",
                            period: toId(s.period),
                            location: s.location ?? "",
                            staff: toId(s.staff),
                            teacher: toId(s.teacher),
                        }))
                    );
                }
            } catch {
                if (!cancelled)
                    setSlots([{ day: "", period: "", location: "", staff: "", teacher: "" }]);
            }
        };
        loadSchedules();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load when selected class or popup visibility changes
    }, [addSlotShown, selectedClass]);

    useEffect(() => {
        setStudentOptions([]);
        setStaffOptions([]);
        setClassOptions([]);
    }, []);

    // Load all schedules for timetable (filtering is done client-side)
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const schedulesRes = await executeRequest("get", "/schedules/timetable");
                if (cancelled) return;
                if (Array.isArray(schedulesRes)) setTimetableSchedules(schedulesRes as TimetableSchedule[]);
                else setTimetableSchedules([]);
            } catch {
                if (!cancelled) setTimetableSchedules([]);
            }
        };
        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load once on mount
    }, []);

    // When student filter is set, fetch class IDs that contain this student (for schedule filtering)
    useEffect(() => {
        if (!filterStudent) {
            setClassIdsForFilterStudent([]);
            return;
        }
        let cancelled = false;
        const load = async () => {
            try {
                const list = await executeRequest("get", `/classes/student/${filterStudent}`);
                if (cancelled) return;
                const arr = Array.isArray(list) ? list : [];
                setClassIdsForFilterStudent(arr.map((c: { _id: string }) => c._id));
            } catch {
                if (!cancelled) setClassIdsForFilterStudent([]);
            }
        };
        load();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- when filter student changes
    }, [filterStudent]);

    // Apply filters to schedules, then build calendar events (only for class plan dates: fromDate–toDate, by day and session)
    const timetableEvents = useMemo((): CalendarEvent[] => {
        const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
        const parseTime = (s: string | undefined): [number, number] => {
            if (!s || typeof s !== "string") return [9, 0];
            const [h, m] = s.trim().split(/[:\s]/).map(Number);
            return [isNaN(h) ? 9 : h, isNaN(m) ? 0 : m];
        };
        const classId = (c: unknown) => (c && typeof c === "object" && "_id" in c ? String((c as { _id: string })._id) : "");
        const staffId = (x: unknown) => (x && typeof x === "object" && "_id" in x ? String((x as { _id: string })._id) : "");
        let filtered = timetableSchedules;
        if (filterClass) filtered = filtered.filter((s) => classId(s.class) === filterClass);
        if (filterStaff) filtered = filtered.filter((s) => staffId(s.staff) === filterStaff || staffId(s.teacher) === filterStaff);
        if (classIdsForFilterStudent.length) filtered = filtered.filter((s) => classIdsForFilterStudent.includes(classId(s.class)));
        if (filterSite) filtered = filtered.filter((s) => (s.location || "") === filterSite);
        if (filterSubject) filtered = filtered.filter((s) => (s.class && typeof s.class === "object" && "subject" in s.class ? (s.class as { subject?: string }).subject : "") === filterSubject);
        const events: CalendarEvent[] = [];
        let id = 0;
        const now = new Date();
        const startOfThisWeek = new Date(now);
        startOfThisWeek.setDate(now.getDate() - ((now.getDay() + 6) % 7));
        startOfThisWeek.setHours(0, 0, 0, 0);
        const numWeeks = 12;
        for (let w = 0; w < numWeeks; w++) {
            const weekStart = new Date(startOfThisWeek);
            weekStart.setDate(weekStart.getDate() + w * 7);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6);
            weekEnd.setHours(23, 59, 59, 999);
            for (const s of filtered) {
                const cls = s.class;
                if (!cls || typeof cls !== "object") continue;
                const from = cls.fromDate ? new Date(cls.fromDate).getTime() : 0;
                const to = cls.toDate ? new Date(cls.toDate).getTime() : 0;
                if (from === 0 && to === 0) continue;
                if (weekEnd.getTime() < from || weekStart.getTime() > to) continue;
                const dayIdx = DAY_ORDER.indexOf(s.day);
                if (dayIdx < 0) continue;
                const period = s.period && typeof s.period === "object" ? s.period : { name: "Session", startTime: "09:00", endTime: "10:00" };
                const [startH, startM] = parseTime(period.startTime);
                const [endH, endM] = parseTime(period.endTime);
                const eventDate = new Date(weekStart);
                eventDate.setDate(eventDate.getDate() + dayIdx);
                const start = new Date(eventDate);
                start.setHours(startH, startM, 0, 0);
                const end = new Date(eventDate);
                end.setHours(endH, endM, 0, 0);
                const classLabel = [cls.subject, cls.yeargroup].filter(Boolean).join(" - ") || "Class";
                const staffName = s.staff && typeof s.staff === "object" && s.staff.name ? s.staff.name : "";
                events.push({
                    id: ++id,
                    start,
                    end,
                    events: [{
                        id,
                        title: period.name || "Session",
                        category: classLabel,
                        eventType: s.location || "",
                        source: staffName,
                    }],
                });
            }
        }
        return events;
    }, [timetableSchedules, filterClass, filterStaff, classIdsForFilterStudent, filterSite, filterSubject]);

    const [pdfGenerating, setPdfGenerating] = useState(false);
    const handlePrintTimetablePdf = async () => {
        const el = document.getElementById("time-table-div");
        if (!el) return;
        setPdfGenerating(true);
        try {
            const canvas = await html2canvas(el, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: "#ffffff",
            });
            const imgData = canvas.toDataURL("image/png", 1.0);
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4",
            });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const imgW = canvas.width;
            const imgH = canvas.height;
            const ratio = Math.min(pageW / imgW, pageH / imgH) * 0.95;
            const w = imgW * ratio;
            const h = imgH * ratio;
            pdf.addImage(imgData, "PNG", (pageW - w) / 2, (pageH - h) / 2, w, h);
            pdf.save("timetable.pdf");
        } catch (err) {
            console.error(err);
            alert("Failed to generate PDF.");
        } finally {
            setPdfGenerating(false);
        }
    };

    return (
        <Layout
            showNew={false}
            showPagination={true}
        >
            <div className="tt-main-div">
                <div className="tt-filter-div">
                    <FilterSec 
                        secName="Time Table Filter"
                        content={filterContent}
                        retractable={true}
                    />
                </div>
                <div className="tt-table-div">
                    <div className="tt-table-header">
                        <div className="tt-table-header-item tt-table-header-with-print">
                            <TimeTableComponent
                                onTimeSlotButtonPress={showAddSlot}
                                propEvents={timetableEvents}
                            />
                            <button
                                type="button"
                                className="tt-print-pdf-btn"
                                onClick={handlePrintTimetablePdf}
                                disabled={pdfGenerating}
                                title="Download timetable as PDF"
                            >
                                <FontAwesomeIcon icon={faPrint} />
                                {pdfGenerating ? " Generating…" : " Print / PDF"}
                            </button>
                        </div>
                    </div>
                </div>
                {addPopup()}
            </div>
        </Layout>
    );
};

export default Index;