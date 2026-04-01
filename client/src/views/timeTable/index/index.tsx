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
import Location from "../../../assets/safeguarding/location.svg";
import Teacher from "../../../assets/dashboard/teachers.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { DropdownOption } from "../../../types/DropDownOption";
import DateInput from "../../../components/dateInput/DateInput";
import SearchableSelect from "../../../components/SearchableSelect/SearchableSelect";
import { useApiRequest } from "../../../hooks/useApiRequest";

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

const EVENT_COLOR_OPTIONS: DropdownOption[] = [
  { value: "#27ae60", label: "Green" },
  { value: "#2e86de", label: "Blue" },
  { value: "#e74c3c", label: "Red" },
  { value: "#8e44ad", label: "Purple" },
  { value: "#f39c12", label: "Orange" },
  { value: "#95a5a6", label: "Gray" },
];

interface ClassData {
  _id: string;
  location?: string;
  subject?: string;
  yeargroup?: string;
  fromDate?: string | Date;
  toDate?: string | Date;
  daysOfWeek?: string[];
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
    const [defaultClassOptions, setDefaultClassOptions] = useState<DropdownOption[]>([]);
    const [filterClass, setFilterClass] = useState<string>("");
    const [filterSite, setFilterSite] = useState<string>("");
    const [filterSubject, setFilterSubject] = useState<string>("");
    const [filterDateFrom, setFilterDateFrom] = useState<string>("");
    const [filterDateTo, setFilterDateTo] = useState<string>("");
    const [classIdsForFilterStudent, setClassIdsForFilterStudent] = useState<string[]>([]);
    const [siteOptions, setSiteOptions] = useState<DropdownOption[]>(SITE_OPTIONS);
    const [subjectOptions, setSubjectOptions] = useState<DropdownOption[]>([{ value: "", label: "All Subjects" }, ...SUBJECT_OPTIONS]);
    const [studentClassOptions, setStudentClassOptions] = useState<DropdownOption[]>([]);
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
    const [periodsFromDb, setPeriodsFromDb] = useState<
        Array<{ _id?: string; name?: string; startTime?: string; endTime?: string }>
    >([]);
    const [slotStaffOptions, setSlotStaffOptions] = useState<DropdownOption[]>([]);
    const [timetableSchedules, setTimetableSchedules] = useState<TimetableSchedule[]>([]);
    const { executeRequest } = useApiRequest();

    const [eventColor, setEventColor] = useState<string>("#27ae60");

    const [allocationLocation, setAllocationLocation] = useState<string>("");
    const [allocationStaff, setAllocationStaff] = useState<string>("");
    const [allocationTeacher, setAllocationTeacher] = useState<string>("");
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
                        const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
                        if (!allocationLocation?.trim() || !allocationStaff?.trim() || !allocationTeacher?.trim()) {
                            alert("Please select Location, Staff and Teacher.");
                            return;
                        }
                        try {
                            await executeRequest("delete", `/schedules/class/${selectedClass}`);
                            const schedules: { class: string; day: string; period: string; location: string; staff: string; teacher: string }[] = [];
                            for (const day of daysOfWeek) {
                                for (const period of periodOptions) {
                                    schedules.push({
                                        class: selectedClass,
                                        day,
                                        period: period.value,
                                        location: allocationLocation.trim(),
                                        staff: allocationStaff.trim(),
                                        teacher: allocationTeacher.trim(),
                                    });
                                }
                            }
                            if (schedules.length > 0) {
                                await executeRequest("post", "/schedules", { schedules });
                            }
                            setAddSlotShown(false);
                            alert("Schedule saved successfully. Class is scheduled for every session Monday–Friday.");
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
                            {selectedClass && (
                                <>
                                    <div className="popup-body-item-header">
                                        <p className="popup-body-item-header-text">Schedule (all sessions, Mon–Fri)</p>
                                    </div>
                                    <div className="popup-body-item-body">
                                        <p className="tt-days-info">Class will be scheduled for <strong>every session</strong> Monday–Friday.</p>
                                        <div className="inputs-div">
                                            <Select
                                                label="Location"
                                                name="allocationLocation"
                                                value={allocationLocation}
                                                onChange={(e) => setAllocationLocation(e.target.value)}
                                                options={LOCATION_OPTIONS}
                                                placeholder="Select Location"
                                                icon={Location}
                                            />
                                            <Select
                                                label="Staff"
                                                name="allocationStaff"
                                                value={allocationStaff}
                                                onChange={(e) => setAllocationStaff(e.target.value)}
                                                options={slotStaffOptions}
                                                placeholder="Select Staff"
                                                icon={Staff}
                                            />
                                            <Select
                                                label="Teacher"
                                                name="allocationTeacher"
                                                value={allocationTeacher}
                                                onChange={(e) => setAllocationTeacher(e.target.value)}
                                                options={slotStaffOptions}
                                                placeholder="Select Teacher"
                                                icon={Teacher}
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </Popup>
        </>
        )
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
                            if (term.trim() === "" && studentOptions.length > 0) return;
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
                            if (term.trim() === "" && staffOptions.length > 0) return;
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
                        disabled={filterStudent ? studentClassOptions.length === 0 : false}
                        onSearch={async (term) => {
                            const trimmed = term.trim();

                            // When a student is selected, keep options restricted to that student's enrolled classes.
                            if (filterStudent) {
                                const base = studentClassOptions;
                                if (trimmed === "") {
                                    setClassOptions(base);
                                    return;
                                }
                                const lc = trimmed.toLowerCase();
                                const filtered = base.filter(
                                    (o) => o.label.toLowerCase().includes(lc) || String(o.value).includes(lc),
                                );

                                // Ensure the currently selected value stays visible.
                                const selected = base.find((o) => String(o.value) === String(filterClass));
                                if (selected && !filtered.some((o) => String(o.value) === String(selected.value))) {
                                    setClassOptions([selected, ...filtered]);
                                } else {
                                    setClassOptions(filtered);
                                }
                                return;
                            }

                            // No student selected: search across all classes.
                            if (trimmed === "") {
                                setClassOptions(defaultClassOptions);
                                return;
                            }

                            try {
                                const res = await executeRequest("get", `/classes?search=${encodeURIComponent(trimmed)}&perPage=100`);
                                const list = Array.isArray(res) ? res : [];
                                setClassOptions(
                                    list.map((c: ClassData) => ({
                                        value: c._id,
                                        label: `${c.subject ?? ""} - ${c.yeargroup ?? ""}`.trim() || c._id,
                                    })),
                                );
                            } catch {
                                setClassOptions([]);
                            }
                        }}
                        placeholder="Search classes..."
                        icon={Class}
                    />
                </div>
                <div className="input-div">
                    <Select
                        label="Event Color"
                        name="eventColor"
                        value={eventColor}
                        onChange={(e) => setEventColor(e.target.value)}
                        options={EVENT_COLOR_OPTIONS}
                        placeholder="Event Color"
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
                        options={siteOptions}
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
                        options={subjectOptions}
                        placeholder="All Subjects"
                        icon={Subject}
                    />
                </div>
                <div className="input-div">
                    <DateInput
                        label="Date from"
                        name="filterDateFrom"
                        value={filterDateFrom}
                        onChange={(e) => setFilterDateFrom(e.target.value)}
                        placeholder="Select date"
                        icon={Calendar}
                    />
                </div>
                <div className="input-div">
                    <DateInput
                        label="Date to"
                        name="filterDateTo"
                        value={filterDateTo}
                        onChange={(e) => setFilterDateTo(e.target.value)}
                        placeholder="Select date"
                        icon={Calendar}
                    />
                </div>
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

    // Load existing schedules when a class is selected: set location, staff, teacher from first schedule if any
    useEffect(() => {
        if (!addSlotShown || !selectedClass?.trim()) {
            if (!addSlotShown) return;
            setAllocationLocation("");
            setAllocationStaff("");
            setAllocationTeacher("");
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
                    setAllocationLocation("");
                    setAllocationStaff("");
                    setAllocationTeacher("");
                } else {
                    const first = arr[0] as { location?: string; staff?: unknown; teacher?: unknown };
                    setAllocationLocation(first.location ?? "");
                    setAllocationStaff(toId(first.staff));
                    setAllocationTeacher(toId(first.teacher));
                }
            } catch {
                if (!cancelled) {
                    setAllocationLocation("");
                    setAllocationStaff("");
                    setAllocationTeacher("");
                }
            }
        };
        loadSchedules();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- load when selected class or popup visibility changes
    }, [addSlotShown, selectedClass]);

    // Pre-populate timetable filter dropdowns on initial page load.
    // (SearchableSelect only shows options that are already in `options`.)
    useEffect(() => {
        let cancelled = false;
        const loadInitialFilterOptions = async () => {
            try {
                const [studentsRes, staffRes, classesRes] = await Promise.all([
                    executeRequest("get", "/students?search=&perPage=100"),
                    executeRequest("get", "/staff?search=&perPage=100"),
                    executeRequest("get", "/classes?search=&perPage=200"),
                ]);

                if (cancelled) return;

                const studentsList = Array.isArray(studentsRes) ? studentsRes : [];
                setStudentOptions(
                    studentsList.map((s: { _id: string; personalInfo?: { legalFirstName?: string; lastName?: string; preferredName?: string } }) => {
                        const p = s.personalInfo || {};
                        const name = [p.preferredName || p.legalFirstName, p.lastName].filter(Boolean).join(" ") || s._id;
                        return { value: s._id, label: name };
                    })
                );

                const staffList = Array.isArray(staffRes) ? staffRes : [];
                setStaffOptions(
                    staffList.map((s: { _id: string; name?: string }) => ({
                        value: s._id,
                        label: s.name || s._id,
                    }))
                );

                const classesList = Array.isArray(classesRes) ? classesRes : [];
                const defaultClassesAsOptions = classesList.map((c: ClassData) => ({
                    value: c._id,
                    label: `${c.subject ?? ""} - ${c.yeargroup ?? ""}`.trim() || c._id,
                }));
                setDefaultClassOptions(defaultClassesAsOptions);
                setClassOptions(defaultClassesAsOptions);
            } catch {
                if (!cancelled) {
                    setStudentOptions([]);
                    setStaffOptions([]);
                    setClassOptions([]);
                }
            }
        };

        loadInitialFilterOptions();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- executeRequest isn't stable
    }, []);

    // Fetch periods for dynamic time-axis rendering.
    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            try {
                const res = await executeRequest("get", "/periods");
                if (cancelled) return;
                if (Array.isArray(res)) {
                    setPeriodsFromDb(
                        res as Array<{ _id?: string; name?: string; startTime?: string; endTime?: string }>
                    );
                }
                else setPeriodsFromDb([]);
            } catch {
                if (!cancelled) setPeriodsFromDb([]);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- executeRequest isn't stable
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
        let cancelled = false;

        const resetDerivedFilterOptions = () => {
            setClassIdsForFilterStudent([]);
            setStudentClassOptions([]);
            setClassOptions(defaultClassOptions);
            setSiteOptions(SITE_OPTIONS);
            setSubjectOptions([{ value: "", label: "All Subjects" }, ...SUBJECT_OPTIONS]);
            setFilterSite("");
            setFilterSubject("");
            setFilterClass("");
        };

        if (!filterStudent) {
            resetDerivedFilterOptions();
            return;
        }

        const load = async () => {
            try {
                const list = await executeRequest("get", `/classes/student/${filterStudent}`);
                if (cancelled) return;
                const arr = Array.isArray(list) ? (list as ClassData[]) : [];

                setClassIdsForFilterStudent(arr.map((c) => c._id));

                const siteSet = new Set(arr.map((c) => (c.location ?? "").trim()).filter(Boolean));
                const subjectSet = new Set(arr.map((c) => (c.subject ?? "").trim()).filter(Boolean));

                const derivedSiteOptions: DropdownOption[] = [
                    { value: "", label: "All Sites" },
                    ...Array.from(siteSet).map((s) => ({ value: s, label: s })),
                ];
                const derivedSubjectOptions: DropdownOption[] = [
                    { value: "", label: "All Subjects" },
                    ...Array.from(subjectSet).map((s) => ({ value: s, label: s })),
                ];

                const derivedClassOptions: DropdownOption[] = arr.map((c) => ({
                    value: c._id,
                    label: `${c.subject ?? ""} - ${c.yeargroup ?? ""}`.trim() || c._id,
                }));

                setStudentClassOptions(derivedClassOptions);
                setClassOptions(derivedClassOptions);
                setSiteOptions(derivedSiteOptions);
                setSubjectOptions(derivedSubjectOptions);

                // Sensible defaults: pick the only option if there is exactly one; otherwise keep "All".
                const derivedSiteValues = derivedSiteOptions.map((o) => o.value).filter(Boolean);
                if (derivedSiteValues.length === 1) setFilterSite(derivedSiteValues[0]);
                else if (filterSite && derivedSiteValues.includes(filterSite)) setFilterSite(filterSite);
                else setFilterSite("");

                const derivedSubjectValues = derivedSubjectOptions.map((o) => o.value).filter(Boolean);
                if (derivedSubjectValues.length === 1) setFilterSubject(derivedSubjectValues[0]);
                else if (filterSubject && derivedSubjectValues.includes(filterSubject)) setFilterSubject(filterSubject);
                else setFilterSubject("");

                const derivedClassValues = new Set(derivedClassOptions.map((o) => o.value));
                if (filterClass && derivedClassValues.has(filterClass)) {
                    setFilterClass(filterClass);
                } else {
                    setFilterClass(derivedClassOptions[0]?.value ?? "");
                }
            } catch {
                if (!cancelled) resetDerivedFilterOptions();
            }
        };

        load();
        return () => {
            cancelled = true;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- when filter student changes
    }, [filterStudent]);

    // Apply filters to schedules, then build calendar events (only for class plan dates: fromDate–toDate, by day and session)
    const timetableEvents = useMemo((): CalendarEvent[] => {
        const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

        // Build a lookup from period _id → { startTime, endTime } using the DB periods already fetched
        const periodTimesById: Record<string, { startTime: string; endTime: string }> = {};
        for (const p of periodsFromDb) {
            if (p._id && p.startTime && p.endTime) {
                periodTimesById[p._id] = { startTime: p.startTime, endTime: p.endTime };
            }
        }

        const parseTime = (s: string | undefined): [number, number] => {
            if (!s || typeof s !== "string") return [9, 30];
            const [h, m] = s.trim().split(/[:\s.]/).map(Number);
            return [isNaN(h) ? 9 : h, isNaN(m) ? 0 : m];
        };
        const getPeriodTimes = (period: { _id?: string; name?: string; startTime?: string; endTime?: string }): [number, number, number, number] => {
            // Prefer the times already on the populated period object
            const hasTimes = period.startTime != null && period.startTime !== "" && period.endTime != null && period.endTime !== "";
            if (hasTimes) {
                const [startH, startM] = parseTime(period.startTime);
                const [endH, endM] = parseTime(period.endTime);
                return [startH, startM, endH, endM];
            }
            // Fall back to the periodsFromDb lookup by _id
            if (period._id && periodTimesById[period._id]) {
                const { startTime, endTime } = periodTimesById[period._id];
                const [startH, startM] = parseTime(startTime);
                const [endH, endM] = parseTime(endTime);
                return [startH, startM, endH, endM];
            }
            // Last resort: use a generic default so the event still renders
            return [9, 30, 10, 30];
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
            const rangeStart = filterDateFrom ? new Date(filterDateFrom + "T00:00:00").getTime() : 0;
        const rangeEnd = filterDateTo ? new Date(filterDateTo + "T23:59:59").getTime() : 0;
        for (const s of filtered) {
                const cls = s.class;
                if (!cls || typeof cls !== "object") continue;
                const from = cls.fromDate ? new Date(cls.fromDate).getTime() : 0;
                const to = cls.toDate ? new Date(cls.toDate).getTime() : 0;
                if (from === 0 && to === 0) continue;
                if (weekEnd.getTime() < from || weekStart.getTime() > to) continue;
                const dayIdx = DAY_ORDER.indexOf(s.day);
                if (dayIdx < 0) continue;
                const eventDate = new Date(weekStart);
                eventDate.setDate(eventDate.getDate() + dayIdx);
                if (rangeStart && eventDate.getTime() < rangeStart) continue;
                if (rangeEnd && eventDate.getTime() > rangeEnd) continue;
                const period = s.period && typeof s.period === "object" ? s.period : { name: "Session", startTime: "10:15", endTime: "11:15" };
                const [startH, startM, endH, endM] = getPeriodTimes(period);
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
    }, [timetableSchedules, periodsFromDb, filterClass, filterStaff, classIdsForFilterStudent, filterSite, filterSubject, filterDateFrom, filterDateTo]);

    const [pdfGenerating, setPdfGenerating] = useState(false);
    const [calendarView, setCalendarView] = useState<"week" | "month">("week");

    // When filter date range spans multiple weeks, build week segments for stacked calendars
    const weekSegments = useMemo(() => {
        if (!filterDateFrom || !filterDateTo) return [];
        const from = new Date(filterDateFrom + "T00:00:00");
        const to = new Date(filterDateTo + "T23:59:59");
        if (isNaN(from.getTime()) || isNaN(to.getTime()) || to < from) return [];
        const startOfWeek = (d: Date) => {
            const x = new Date(d);
            x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
            x.setHours(0, 0, 0, 0);
            return x;
        };
        const segments: { label: string; displayDate: Date }[] = [];
        let weekStart = startOfWeek(from);
        let index = 1;
        while (weekStart.getTime() <= to.getTime()) {
            const displayDate = new Date(weekStart);
            segments.push({
                label: `${index} week`,
                displayDate,
            });
            weekStart = new Date(weekStart);
            weekStart.setDate(weekStart.getDate() + 7);
            index += 1;
        }
        return segments;
    }, [filterDateFrom, filterDateTo]);
    const loadLogoAsDataUrl = (): Promise<string | null> =>
        new Promise((resolve) => {
            const img = new Image();
            img.crossOrigin = "anonymous";
            img.onload = () => {
                try {
                    const c = document.createElement("canvas");
                    c.width = img.naturalWidth;
                    c.height = img.naturalHeight;
                    const ctx = c.getContext("2d");
                    if (!ctx) {
                        resolve(null);
                        return;
                    }
                    ctx.drawImage(img, 0, 0);
                    resolve(c.toDataURL("image/png"));
                } catch {
                    resolve(null);
                }
            };
            img.onerror = () => resolve(null);
            img.src = "/logo.svg";
        });

    const handlePrintTimetablePdf = async () => {
        const el = document.getElementById("time-table-div");
        if (!el) return;
        setPdfGenerating(true);
        try {
            const logoDataUrl = await loadLogoAsDataUrl();
            const pdf = new jsPDF({
                orientation: "landscape",
                unit: "mm",
                format: "a4",
            });
            const pageW = pdf.internal.pageSize.getWidth();
            const pageH = pdf.internal.pageSize.getHeight();
            const margin = 8;
            const logoSize = 18;

            const todayStr = new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" });

            const calendarElements: HTMLElement[] =
                weekSegments.length > 1
                    ? (Array.from(el.querySelectorAll<HTMLElement>(".tt-week-block")) ?? []).filter(Boolean)
                    : [el as HTMLElement];

            for (let i = 0; i < calendarElements.length; i++) {
                if (i > 0) pdf.addPage();

                const calendarEl = calendarElements[i];
                const canvas = await html2canvas(calendarEl, {
                    scale: 2,
                    useCORS: true,
                    logging: false,
                    backgroundColor: "#ffffff",
                    onclone: (_, clonedEl) => {
                        const el = clonedEl as HTMLElement;
                        el.style.backgroundColor = "#ffffff";
                        el.style.color = "#000000";
                        [el, ...Array.from(el.querySelectorAll("*"))].forEach((n) => {
                            const node = n as HTMLElement;
                            const isEventContainer = !!node.matches?.(".event-container");
                            const isInsideEventContainer = !isEventContainer && !!node.closest?.(".event-container");
                            node.style.color = "#000000";
                            if (isEventContainer) {
                                // Preserve the user-selected eventColor background (do not override).
                            } else if (!isInsideEventContainer) {
                                node.style.backgroundColor = "#ffffff";
                            } else {
                                node.style.backgroundColor = "";
                            }
                            node.style.borderColor = "#000000";
                            if (node.tagName === "svg" || node.closest?.("svg")) {
                                node.style.fill = "#000000";
                                node.style.stroke = "#000000";
                            }
                        });
                    },
                });

                const imgData = canvas.toDataURL("image/png", 1.0);
                const imgW = canvas.width;
                const imgH = canvas.height;

                let y = margin;
                pdf.setDrawColor(0, 0, 0);
                pdf.setTextColor(0, 0, 0);
                pdf.setFontSize(10);

                if (logoDataUrl) {
                    pdf.addImage(
                        logoDataUrl,
                        "PNG",
                        pageW - margin - logoSize,
                        margin,
                        logoSize,
                        logoSize,
                    );
                }

                pdf.text(`Printed: ${todayStr}`, margin, y);
                y += 6;

                if (filterStudent) {
                    const studentName = studentOptions.find((o) => o.value === filterStudent)?.label ?? "—";
                    const firstClassId = classIdsForFilterStudent[0];
                    const schedule = timetableSchedules.find(
                        (s) => s.class && typeof s.class === "object" && (s.class as { _id: string })._id === firstClassId,
                    );
                    const cls =
                        schedule?.class && typeof schedule.class === "object"
                            ? (schedule.class as { location?: string; subject?: string; yeargroup?: string })
                            : null;
                    const location = schedule?.location ?? cls?.location ?? "—";
                    const subject = cls?.subject ?? "—";
                    const classLabel = cls ? [cls.subject, cls.yeargroup].filter(Boolean).join(" - ") || "—" : "—";

                    pdf.text(`Student: ${studentName}`, margin, y);
                    y += 5;
                    pdf.text(`Location: ${location}  |  Class: ${classLabel}  |  Subject: ${subject}`, margin, y);
                    y += 5;
                    pdf.text(`Date from: ${filterDateFrom || "—"}  |  Date to: ${filterDateTo || "—"}`, margin, y);
                    y += 5;
                }

                // Extra spacing so the calendar starts a bit lower.
                y += 10;

                const maxW = pageW - 2 * margin;
                const maxH = pageH - y - margin;
                const ratio = Math.min(maxW / imgW, maxH / imgH) * 0.98;
                const w = imgW * ratio;
                const h = imgH * ratio;

                pdf.addImage(imgData, "PNG", (pageW - w) / 2, y, w, h);
            }

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
                <div className="tt-filter-row">
                    <div className="tt-filter-div">
                        <FilterSec 
                            secName="Time Table Filter"
                            content={filterContent}
                            retractable={true}
                            defaultRetracted={true}
                        />
                    </div>
                    <div className="tt-filter-actions">
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
                        <div className="tt-view-toggle" role="group" aria-label="Timetable view">
                            <button
                                type="button"
                                className={calendarView === "month" ? "tt-view-btn active" : "tt-view-btn"}
                                onClick={() => setCalendarView("month")}
                            >
                                Month
                            </button>
                            <button
                                type="button"
                                className={calendarView === "week" ? "tt-view-btn active" : "tt-view-btn"}
                                onClick={() => setCalendarView("week")}
                            >
                                Week
                            </button>
                        </div>
                    </div>
                </div>
                <div className="tt-table-div">
                    <div className="tt-table-header">
                        <div className="tt-table-header-item tt-table-header-with-print">
                            <div id="time-table-div">
                                {weekSegments.length > 1 ? (
                                    <div className="tt-stacked-weeks">
                                        {weekSegments.map((seg, idx) => (
                                            <div key={`${seg.label}-${idx}`} className="tt-week-block">
                                                <div className="tt-week-title">
                                                    {calendarView === "month"
                                                        ? `${idx + 1} month`
                                                        : `${idx + 1} week`}
                                                </div>
                                                <TimeTableComponent
                                                    propEvents={timetableEvents}
                                                    initialView="week"
                                                    displayDate={seg.displayDate}
                                                    view={calendarView}
                                                    onViewChange={setCalendarView}
                                                    periods={periodsFromDb}
                                                    eventColor={eventColor}
                                                    hideViewToggle={true}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <TimeTableComponent
                                        propEvents={timetableEvents}
                                        initialView={calendarView}
                                        view={calendarView}
                                        onViewChange={setCalendarView}
                                        periods={periodsFromDb}
                                        eventColor={eventColor}
                                        hideViewToggle={true}
                                    />
                                )}
                            </div>
                        </div>
                    </div>
                </div>
                {addPopup()}
            </div>
        </Layout>
    );
};

export default Index;