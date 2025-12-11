import Layout from "../../../layouts/layout";
import FilterSec from "../../../components/FilterSec/FilterSec";
import "./index.scss";
import Select from "../../../components/Select/Select";
import { useState,useEffect } from "react";
import Student from "../../../assets/safeguarding/calendar.svg";
import Staff from "../../../assets/safeguarding/student.svg";
import TimeTable from "../../../assets/safeguarding/period.svg";
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
import { faTrash } from "@fortawesome/free-solid-svg-icons";
import { DropdownOption } from "../../../types/DropDownOption";
import DateInput from "../../../components/dateInput/DateInput";
const Index = () => {
    const [studentOptions, setStudentOptions] = useState<any[]>([]);
    const [student, setStudent] = useState<string>("");
    const [staffOptions, setStaffOptions] = useState<any[]>([]);
    const [staff, setStaff] = useState<string>("");
    const [timeTableOptions, setTimeTableOptions] = useState<any[]>([]);
    const [timeTable, setTimeTable] = useState<string>("");
    const [classOptions, setClassOptions] = useState<any[]>([]);
    const [filterClass, setFilterClass] = useState<string>("");
    const [siteOptions, setSiteOptions] = useState<any[]>([]);
    const [site, setSite] = useState<string>("");
    const [subjectOptions, setSubjectOptions] = useState<DropdownOption[]>([]);
    const [subject, setSubject] = useState<string>("");
    const [addSlotShown, setAddSlotShown] = useState<boolean>(false);
    
    const [selectedClass, setSelectedClass] = useState<string>("");
    const [classes,setClasses] = useState<DropdownOption[]>([]);
    const [addSubject, setAddSubject] = useState<string>("");
    const [yearGroupOptions, setYearGroupOptions] = useState<DropdownOption[]>([]);
    const [addYearGroup, setAddYearGroup] = useState<string>("");
    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

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
                    onConfirm={() => {
                        console.log("save");
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
                                        label="Class"
                                        name="class"
                                        value={selectedClass}
                                        onChange={(e) => setSelectedClass(e.target.value)}
                                        options={classes}
                                        placeholder="Select Class"
                                        icon={Class}
                                    />
                                    <Select 
                                        label="Subject"
                                        name="subject"
                                        value={addSubject}
                                        onChange={(e) => setAddSubject(e.target.value)}
                                        options={subjectOptions}
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
                                    <DateInput
                                        label="Start Date"
                                        name="startDate"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        placeholder="Select Start Date"
                                        icon={Calendar}
                                    />
                                </div>
                                <div className="inputs-div">
                                    <div className="input-div">
                                        <DateInput
                                            label="End Date"
                                            name="endDate"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            placeholder="Select End Date"
                                            icon={Calendar}
                                        />
                                    </div>
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
                                        options={[]}
                                        placeholder="Select Day"
                                        icon={Calendar}
                                    />
                                    <Select
                                        label="Period"
                                        name="period"
                                        value={slot.period}
                                        onChange={(e) => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, period: e.target.value } : s))}
                                        options={[]}
                                        placeholder="Select Period"
                                        icon={Period}
                                    />
                                    <Select
                                        label="Location"
                                        name="location"
                                        value={slot.location}
                                        onChange={(e) => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, location: e.target.value } : s))}
                                        options={[]}
                                        placeholder="Select Location"
                                        icon={Location}
                                    />
                                    <Select
                                        label="Staff"
                                        name="staff"
                                        value={slot.staff}
                                        onChange={(e) => setSlots(prev => prev.map((s, i) => i === idx ? { ...s, staff: e.target.value } : s))}
                                        options={[]}
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
                                            options={[]}
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
                    <Select 
                        label="Student"
                        name="student"
                        value={student}
                        onChange={(e) => setStudent(e.target.value)}
                        options={studentOptions}
                        placeholder="Select Student"
                        icon={Student}
                    />
                </div>
                <div className="input-div">
                    <Select 
                        label="Staff"
                        name="staff"
                        value={staff}
                        onChange={(e) => setStaff(e.target.value)}
                        options={staffOptions}
                        placeholder="Select Staff"
                        icon={Staff}
                    />
                </div>
                <div className="input-div">
                    <Select 
                        label="Time Table"
                        name="timeTable"
                        value={timeTable}
                        onChange={(e) => setTimeTable(e.target.value)}
                        options={timeTableOptions}
                        placeholder="Select Time Table"
                        icon={TimeTable}
                    />
                </div>
            </div>
            <div className="inputs-div-tt">
                <div className="input-div">
                    <Select 
                        label="Class/Provision"
                        name="class"
                        value={filterClass}
                        onChange={(e) => setFilterClass(e.target.value)}
                        options={classOptions}
                        placeholder="Select Class/Provision"
                        icon={Class}
                    />
                </div>
                <div className="input-div">
                    <Select 
                        label="Site"
                        name="site"
                        value={site}
                        onChange={(e) => setSite(e.target.value)}
                        options={siteOptions}
                        placeholder="Select Site"
                        icon={Class}
                    />
                </div>
                <div className="input-div">
                    <Select 
                        label="Subject"
                        name="subject"
                        value={subject}
                        onChange={(e) => setTimeTable(e.target.value)}
                        options={timeTableOptions}
                        placeholder="Select Time Table"
                        icon={TimeTable}
                    />
                </div>
            </div>
        </>
    );
    useEffect(() => {
        setStudentOptions([]);
        setStaffOptions([]);
        setTimeTableOptions([]);
        setClassOptions([]);
        setSiteOptions([]);
        setSubjectOptions([]);
        setSubject("");
        setClasses([]);
        setSiteOptions([]);
        setTimeTableOptions([]);
        setFilterClass("");
        setClasses([]);
        setAddSubject("");
        setYearGroupOptions([]);
        setStartDate("");
        setEndDate("");
    }, []);
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
                        <div className="tt-table-header-item">
                            <TimeTableComponent
                                onTimeSlotButtonPress={showAddSlot}
                                propEvents={[]}
                            />
                        </div>
                    </div>
                </div>
                {addPopup()}
            </div>
        </Layout>
    );
};

export default Index;