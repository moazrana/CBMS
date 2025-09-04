// import React, { useEffect, useState } from 'react';
import React, { useState, useEffect } from 'react';
import Layout from '../../../layouts/layout';
import Box from '../../../components/box/box';
import calendarIcon from '../../../assets/sidebar/attendance.svg';
import threeDotsIcon from '../../../assets/layout/threeDots.svg';
import './index.scss';
import { BarChart } from '@mui/x-charts/BarChart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons';
import FilterSec from '../../../components/FilterSec/FilterSec';
import Input from '../../../components/input/Input';
import Calendar from '../../../assets/safeguarding/calendar.svg';
import Period from '../../../assets/safeguarding/period.svg';
import Staff from '../../../assets/safeguarding/student.svg';
import Class from '../../../assets/attendance/class.svg';
import Home from '../../../assets/safeguarding/home.svg';
import Select from '../../../components/Select/Select';
import DataTable from '../../../components/DataTable/DataTable';
import TimeInput from '../../../components/TimeInput/TimeInput';
import AttendanceDropdown, { AttendanceOption } from '../../../components/AttendanceDropdown/AttendanceDropdown';
import { useApiRequest } from '../../../hooks/useApiRequest';

const Index=()=>{
    const { executeRequest} = useApiRequest();
    const [currentDate, setCurrentDate] = useState(new Date());
    
    const graphData = [
        { month: 'January', present: 100,absent:10 },
        { month: 'February', present: 200,absent:20 },
        { month: 'March', present: 150,absent:300 },
        { month: 'April', present: 250,absent:25 },
        { month: 'May', present: 300,absent:30 },
        { month: 'June', present: 220,absent:22 },
        { month: 'July', present: 180,absent:18 },
        { month: 'August', present: 280,absent:28 },
        { month: 'September', present: 320,absent:32 },
        { month: 'October', present: 260,absent:26 },
        { month: 'November', present: 190,absent:19 },
        { month: 'December', present: 290,absent:29 }
    ];
    
    function valueFormatter(value: number | null) {
        return `${value}`;
    }
    
    const overviewLeft=()=>{
        return (
            <div className="header-left-div">
                <p className="header-left-icon">
                    <span>
                        <img src={calendarIcon} alt="calendar" />
                    </span>
                </p>
                <img className="header-left-icon-three-dots" src={threeDotsIcon} alt="three-dots" />
            </div>
        )
    }
    
    const chartSetting = {
        height: 300,
        sx: {
            '& .MuiChartsAxis-label': { fill: 'var(--secondary-text) !important' },
            '& .MuiChartsAxis-tickLabel': { fill: 'var(--secondary-text) !important' },
            '& .MuiChartsLegend-label': { fill: 'var(--secondary-text) !important' },
            '& .MuiChartsTooltip-label': { fill: 'var(--secondary-text) !important' },
            '& .MuiChartsAxis-line': { stroke: 'var(--secondary-text) !important' },
            '& .MuiChartsAxis-tick': { stroke: 'var(--secondary-text) !important' },
            '& .MuiChartsLegend-root': { color: 'var(--secondary-text) !important' }
        }
    };
    
    const graph=()=>{
        return (
            <BarChart 
                dataset={graphData} 
                xAxis={[{dataKey: 'month'}]}
                series={
                    [
                        {dataKey:'present',label:'Present',valueFormatter:valueFormatter,color:'#ff7c95'},
                        {dataKey:'absent',label:'Absent',valueFormatter:valueFormatter,color:'#797cff'}

                    ]
                }
                borderRadius={15}
                slotProps={{
                    bar: {
                        style: {
                            width: '40%'
                        }
                    }
                }}
               
                {...chartSetting}
            />
        )
    }
    
    const getCurrentMonthName = () => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[currentDate.getMonth()];
    };

    const getCurrentDayName = () => {
        const days = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ];
        const today = new Date();
        const dayName = days[today.getDay()];
        return dayName.substring(0, 3); // Get first three letters
    };

    // Function to get future day name skipping weekends
    // Usage: getFutureDayName(1) returns 'Thu' if today is Wednesday
    // Usage: getFutureDayName(3) returns 'Mon' (skips weekend)
    const getFutureDayName = (daysToAdd: number): string => {
        const days = [
            'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
        ];
        
        let currentDate = new Date();
        let businessDaysAdded = 0;
        let totalDaysAdded = 0;
        
        while (businessDaysAdded < daysToAdd) {
            totalDaysAdded++;
            currentDate = new Date();
            currentDate.setDate(currentDate.getDate() + totalDaysAdded);
            
            const dayOfWeek = currentDate.getDay();
            // Skip weekends (Saturday = 6, Sunday = 0)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                businessDaysAdded++;
            }
        }
        
        const dayName = days[currentDate.getDay()];
        return dayName.substring(0, 3); // Return first three letters
    };
    
    const currentMonth = getCurrentMonthName();
    const currentYear = currentDate.getFullYear();
    const todayDayName = getCurrentDayName();
    
    const goToPreviousMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };
    
    const goToNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };
    
    const getDaysInMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };
    
    const getFirstDayOfMonth = (date: Date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };
    
    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDayOfMonth = getFirstDayOfMonth(currentDate);
        const days = [];
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === new Date().getDate() && 
                           currentDate.getMonth() === new Date().getMonth() && 
                           currentDate.getFullYear() === new Date().getFullYear();
            
            days.push(
                <div 
                    key={day} 
                    className={`calendar-day ${isToday ? 'today' : ''}`}
                >
                    {day}
                </div>
            );
        }
        
        return days;
    };
    
    const calendarHeaderLeft=()=>{
        return (
            <>
                <div className='btn-div'>
                    <div className='pagination-div'>
                        <button className='head-btn circle' onClick={goToPreviousMonth}>
                            <FontAwesomeIcon icon={faChevronLeft} />
                        </button>
                        <button className='head-btn circle' onClick={goToNextMonth}>
                            <FontAwesomeIcon icon={faChevronRight} />
                        </button>
                    </div>
                    
                </div>
            </>
        )
    }
    
    const calendarBody=()=>{
        return (
            <div className='calendar-body'>
                <div className='calendar-header'>
                    <div className='calendar-weekdays'>
                        <div className='weekday'>S</div>
                        <div className='weekday'>M</div>
                        <div className='weekday'>T</div>
                        <div className='weekday'>W</div>
                        <div className='weekday'>T</div>
                        <div className='weekday'>F</div>
                        <div className='weekday'>S</div>
                    </div>
                </div>
                <div className='calendar-grid'>
                    {generateCalendarDays()}
                </div>
            </div>
        )
    }
    const [filterDate,setFilterDate]=useState<any>()
    const [periods,setPeriods]=useState<any[]>([])
    const [period, setPeriod] = useState<any>();
    const [staffs,setStaffs]=useState<any[]>([])
    const [staff,setStaff]=useState<any>()
    const [classes,setClasses]=useState<any[]>([])
    const [filterClass,setFilterClass]=useState<any>()
    const [lateMinutes, setLateMinutes] = useState<number>(10);
    const [attendance, setAttendance] = useState<string>('attended');

    const attendanceOptions: AttendanceOption[] = [
        { value: 'attended', label: 'Attended', color: '#4ade80' },
        { value: 'absent', label: 'Absent', color: '#dc2626' },
        { value: 'late', label: 'Late', color: '#fbbf24' },
        { value: 'none', label: 'None', color: '#ffffff' },
        { value: 'authorized', label: 'Authorized', color: '#a855f7' },
        { value: 'on_report', label: 'On Report', color: '#f9a8d4' },
        { value: 'sen', label: 'SEN', color: '#06b6d4' },
        { value: 'detentions', label: 'Detentions', color: '#a78bfa' },
        { value: 'class_override', label: 'Class Override', color: '#84cc16' }
    ];
    const getClasses=async()=>{
        const res=await executeRequest('get','/classes')
        const classes=res.map((cls: any) => ({ value: cls._id, label: cls.name }))
        setClasses(classes)
    }
    const filterBody=()=>{
        return(
            <>
            <div className='inputs-div-att'>
                <div className='input-div-attendance'>
                    <Input
                        name='date'
                        label='Date'
                        type='date'
                        onChange={(e)=>{setFilterDate(e.target.value)}}
                        value={filterDate}
                        icon={Calendar}
                    />
                </div>
                <div className='input-div-attendance'>
                    <Select
                        name='period'
                        label='Period'
                        options={periods}
                        onChange={(e)=>{setPeriod(e.target.value)}}
                        icon={Period}
                        value={period}
                    />
                </div>
            </div>
            <div className='lower-inputs-div'>
                <div className='inputs-div-att'>
                    <div className='input-div-attendance'>
                        <Select
                            name='staff'
                            label='Staff'
                            options={staffs}
                            onChange={(e)=>{setStaff(e.target.value)}}
                            icon={Staff}
                            value={staff}
                        />
                    </div>
                    <div className='input-div-attendance'>
                        <Select
                            name='class'
                            label='Class/Provision'
                            options={classes}
                            onChange={(e)=>{setFilterClass(e.target.value)}}
                            icon={Class}
                            value={filterClass}
                        />
                    </div>
                </div>
                <div className='search-btn-div'>
                    <button className='search-btn-att'>
                        <FontAwesomeIcon className='nav-icon' icon={faMagnifyingGlass} />
                    </button>
                </div>
            </div>
            </>
        )
    }
    const columns=[
        { 
            header: 'Student Details', 
            accessor: 'student', 
            sortable: false, 
            type: 'template' as const,
            template:(row: Record<string, any>) => {
                return( 
                <>
                    <p>{row.name}</p>
                    <div className='boxed-location'><img src={Home} alt="icon" style={{ width: 15, height: 15, marginRight: 8 }} />{row.location}</div>
                </>
                )
            } 
        },
        {         
            header: `Today's Attendance (${todayDayName})`, 
            accessor: 'todayAtt', 
            sortable: false, 
            type: 'template' as const,
            template:(row: Record<string, any>) => {
                return( 
                <>
                    <div className='attendance-input-div'>
                        <AttendanceDropdown
                            label="Session-1"
                            value={attendance}
                            onChange={setAttendance}
                            options={attendanceOptions}
                        />
                        <AttendanceDropdown
                            label="Session-2"
                            value={attendance}
                            onChange={setAttendance}
                            options={attendanceOptions}
                        />
                    </div>
                </>
                )
            } 
        },
        {         
            header: `Late (Min)`, 
            accessor: 'lateMinutes', 
            sortable: false, 
            type: 'template' as const,
            template:(row: Record<string, any>) => {
                return( 
                    <TimeInput
                        value={lateMinutes}
                        onChange={setLateMinutes}
                        min={0}
                        max={60}
                        step={5}
                        suffix="Mins"
                    />
                )
            } 
        },
        {         
            header: `${getFutureDayName(1)}`, 
            accessor: 'fristAtt', 
            sortable: false, 
            type: 'template' as const,
            template:(row: Record<string, any>) => {
                return( 
                <>
                    <div className='attendance-input-div'>
                        <AttendanceDropdown
                            label="Session-1"
                            value={attendance}
                            onChange={setAttendance}
                            options={attendanceOptions}
                        />
                        <AttendanceDropdown
                            label="Session-2"
                            value={attendance}
                            onChange={setAttendance}
                            options={attendanceOptions}
                        />
                    </div>
                </>
                )
            } 
        },
        {         
            header: `${getFutureDayName(2)}`, 
            accessor: 'secondAtt', 
            sortable: false, 
            type: 'template' as const,
            template:(row: Record<string, any>) => {
                return( 
                <>
                    <div className='attendance-input-div'>
                        <AttendanceDropdown
                            label="Session-1"
                            value={attendance}
                            onChange={setAttendance}
                            options={attendanceOptions}
                        />
                        <AttendanceDropdown
                            label="Session-2"
                            value={attendance}
                            onChange={setAttendance}
                            options={attendanceOptions}
                        />
                    </div>
                </>
                )
            } 
        },
        {         
            header: `${getFutureDayName(3)}`, 
            accessor: 'thirdAtt', 
            sortable: false, 
            type: 'template' as const,
            template:(row: Record<string, any>) => {
                return( 
                <>
                    <div className='attendance-input-div'>
                        <AttendanceDropdown
                            label="Session-1"
                            value={attendance}
                            onChange={setAttendance}
                            options={attendanceOptions}
                        />
                        <AttendanceDropdown
                            label="Session-2"
                            value={attendance}
                            onChange={setAttendance}
                            options={attendanceOptions}
                        />
                    </div>
                </>
                )
            } 
        },
        {         
            header: `${getFutureDayName(4)}`, 
            accessor: 'fourthAtt',  
            sortable: false, 
            type: 'template' as const,
            template:(row: Record<string, any>) => {
                return( 
                <>
                    <div className='attendance-input-div'>
                        <AttendanceDropdown
                            label="Session-1"
                            value={attendance}
                            onChange={setAttendance}
                            options={attendanceOptions}
                        />
                        <AttendanceDropdown
                            label="Session-2"
                            value={attendance}
                            onChange={setAttendance}
                            options={attendanceOptions}
                        />
                    </div>
                </>
                )
            } 
        },
    ]
    const [students,setStudents]=useState<any[]>([])
    
    useEffect(() => {
        const getStaff=async()=>{
            try{
                const res=await executeRequest('get',`/classes/${filterClass}/staffs`)
                if (Array.isArray(res)) {
                    setStaffs(res.map((staff: any) => ({ value: staff._id, label: staff.name })));
                }else{
                    setStaffs([])
                }
            }catch(err){
                console.log(err)
            }
        }
        if (filterClass) {
            getStaff()
        }
    }, [filterClass])

    useEffect(() => {
        
        // Fetch periods
        const fetchPeriods = async () => {
            try {
                const res = await executeRequest('get', '/periods');
                if (Array.isArray(res)) {
                    setPeriods(res.map((period: any) => ({ value: period._id, label: period.name })));
                }
            } catch {
                // Optionally handle error
            }
        };
        fetchPeriods();
        
        
        getClasses()
    }, []);
    return (
        <Layout
            heading='Attendance'
            note='Attendance & Leave Management.'
            showPagination={true}
        >
            <div className="attendance-overview-body">
                <div className="attendance-upper-div">
                    <div className="graph-div">
                        <div className='graph'>
                            <Box
                                heading='Attendance Overview'
                                subHeading='2025'
                                body={graph()}
                                monthsDropdown={true}
                                yearsDropdown={true}
                                headerLeft={overviewLeft()}
                            />
                        </div>
                        <div className='filter-div'>
                            <FilterSec
                                secName='Attendance Filter'
                                year='2025'
                                content={filterBody()}
                            />
                        </div>
                    </div>
                    <div className="calendar-div">
                        <Box
                            heading={currentMonth+' '+currentYear}
                            subHeading='Calendar'
                            body={calendarBody()}
                            monthsDropdown={false}
                            yearsDropdown={false}
                            headerLeft={calendarHeaderLeft()}
                        />
                        
                    </div>
                </div>

            </div>
            <div className='data-table-div'>
                <DataTable
                    columns={columns}
                    data={students}
                    showActions={false}
                    addButton={false}
                    showSearch={false}
                    onEdit={()=>{}}
                    onDelete={()=>{}}
                />
            </div>
        </Layout>
    )
}

export default Index;