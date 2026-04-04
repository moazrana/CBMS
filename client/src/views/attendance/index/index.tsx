import { useState, useEffect } from 'react';
import Layout from '../../../layouts/layout';
import Box from '../../../components/box/box';
import calendarIcon from '../../../assets/sidebar/attendance.svg';
import threeDotsIcon from '../../../assets/layout/threeDots.svg';
import './index.scss';
import { BarChart } from '@mui/x-charts/BarChart';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import FilterSec from '../../../components/FilterSec/FilterSec';
import SearchableSelect from '../../../components/SearchableSelect/SearchableSelect';
import locationIcon from '../../../assets/safeguarding/location.svg';
import Select from '../../../components/Select/Select';
import DateInput from '../../../components/dateInput/DateInput';
import { useApiRequest } from '../../../hooks/useApiRequest';
import api from '../../../services/api';
import { DropdownOption } from '../../../types/DropDownOption';


const getWeekRange = (date: Date): { start: Date; end: Date } => {
    const day = date.getDay();
    const diffToMonday = day === 0 ? -6 : 1 - day;
    const monday = new Date(date);
    monday.setDate(date.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);
    return { start: monday, end: sunday };
};

const Index = () => {
    const { executeRequest } = useApiRequest();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [viewMode, setViewMode] = useState<'monthly' | 'weekly'>('monthly');

    // Filter states
    const [location, setLocation] = useState<string>('');
    const [filterStudent, setFilterStudent] = useState<string>('');
    const [filterClass, setFilterClass] = useState<string>('');
    const [locationOptions, setLocationOptions] = useState<DropdownOption[]>([]);
    const [studentOptions, setStudentOptions] = useState<DropdownOption[]>([]);
    const [classOptions, setClassOptions] = useState<DropdownOption[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [allClasses, setAllClasses] = useState<DropdownOption[]>([]);
    const [locationsLoading, setLocationsLoading] = useState(false);
    const [studentsLoading, setStudentsLoading] = useState(false);
    const [classesLoading, setClassesLoading] = useState(false);

    const [dateRangeStart, setDateRangeStart] = useState<string>('');
    const [dateRangeEnd, setDateRangeEnd] = useState<string>('');
    const [dateRangeError, setDateRangeError] = useState<string>('');

    const [graphData, setGraphData] = useState<any[]>([]);

    const isDateRangeActive = !!(dateRangeStart && dateRangeEnd && !dateRangeError);

    const handleDateRangeStartChange = (val: string) => {
        setDateRangeStart(val);
        if (dateRangeEnd && val && val > dateRangeEnd) {
            setDateRangeError('Start date cannot be after end date');
        } else {
            setDateRangeError('');
        }
    };

    const handleDateRangeEndChange = (val: string) => {
        setDateRangeEnd(val);
        if (dateRangeStart && val && val < dateRangeStart) {
            setDateRangeError('End date cannot be before start date');
        } else {
            setDateRangeError('');
        }
    };

    const clearDateRange = () => {
        setDateRangeStart('');
        setDateRangeEnd('');
        setDateRangeError('');
    };

    function valueFormatter(value: number | null) {
        return `${value}`;
    }

    const overviewLeft = () => (
        <div className="header-left-div">
            <p className="header-left-icon">
                <span>
                    <img src={calendarIcon} alt="calendar" />
                </span>
            </p>
            <img className="header-left-icon-three-dots" src={threeDotsIcon} alt="three-dots" />
        </div>
    );

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

    const graph = () => {
        const dataset = graphData.length === 0
            ? [{ day: '', present: 0, absent: 0 }]
            : graphData;
        return (
            <BarChart
                dataset={dataset}
                xAxis={[{ dataKey: 'day', scaleType: 'band' }]}
                series={[
                    { dataKey: 'present', label: 'Present', valueFormatter, color: '#ff7c95' },
                    { dataKey: 'absent',  label: 'Absent',  valueFormatter, color: '#797cff' }
                ]}
                borderRadius={15}
                slotProps={{ bar: { style: { width: '40%' } } }}
                {...chartSetting}
            />
        );
    };

    const getChartHeading = () => {
        if (isDateRangeActive) {
            const fmt = (d: string) => new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            return `${fmt(dateRangeStart)} – ${fmt(dateRangeEnd)}`;
        }
        if (viewMode === 'weekly') {
            const { start, end } = getWeekRange(currentDate);
            const fmt = (d: Date) => d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            return `${fmt(start)} – ${fmt(end)}`;
        }
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        return months[currentDate.getMonth()];
    };

    const currentYear = currentDate.getFullYear();

    const goToPrev = () => {
        if (viewMode === 'monthly') {
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
        } else {
            setCurrentDate(prev => {
                const d = new Date(prev);
                d.setDate(d.getDate() - 7);
                return d;
            });
        }
    };

    const goToNext = () => {
        if (viewMode === 'monthly') {
            setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
        } else {
            setCurrentDate(prev => {
                const d = new Date(prev);
                d.setDate(d.getDate() + 7);
                return d;
            });
        }
    };

    // Calendar navigation always monthly
    const goToPreviousMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goToNextMonth = () => {
        setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    const getFirstDayOfMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();

    const generateCalendarDays = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDayOfMonth = getFirstDayOfMonth(currentDate);
        const days = [];

        for (let i = 0; i < firstDayOfMonth; i++) {
            days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const isToday = day === new Date().getDate() &&
                currentDate.getMonth() === new Date().getMonth() &&
                currentDate.getFullYear() === new Date().getFullYear();

            days.push(
                <div key={day} className={`calendar-day ${isToday ? 'today' : ''}`}>
                    {day}
                </div>
            );
        }

        return days;
    };

    const calendarHeaderLeft = () => (
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
    );

    const calendarBody = () => (
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
    );

    // Fetch locations
    useEffect(() => {
        const fetchLocations = async () => {
            setLocationsLoading(true);
            try {
                const res = await api.get('/locations');
                const response = res.data;
                if (Array.isArray(response)) {
                    const options: DropdownOption[] = response.map((loc: any) => ({
                        value: loc.name,
                        label: loc.name,
                    }));
                    setLocationOptions(options);
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
            } finally {
                setLocationsLoading(false);
            }
        };
        fetchLocations();
    }, []);

    // Fetch all students
    useEffect(() => {
        const fetchAllStudents = async () => {
            setStudentsLoading(true);
            try {
                const res = await api.get('/students?perPage=10000');
                const list = Array.isArray(res.data) ? res.data : [];
                setAllStudents(list);
                const options: DropdownOption[] = list.map((s: any) => {
                    const name = `${s.personalInfo?.legalFirstName || ''} ${s.personalInfo?.lastName || ''}`.trim();
                    return { value: s._id, label: name || s._id };
                });
                setStudentOptions(options);
            } catch (error) {
                console.error('Error fetching students:', error);
            } finally {
                setStudentsLoading(false);
            }
        };
        fetchAllStudents();
    }, []);

    // Fetch classes for selected student
    useEffect(() => {
        if (!filterStudent) {
            setAllClasses([]);
            setClassOptions([]);
            setFilterClass('');
            return;
        }
        const fetchStudentClasses = async () => {
            setClassesLoading(true);
            try {
                const res = await api.get(`/classes/student/${filterStudent}`);
                const list = Array.isArray(res.data) ? res.data : [];
                const options: DropdownOption[] = list.map((cls: any) => ({
                    value: cls._id,
                    label: [cls.subject, cls.yeargroup].filter(Boolean).join(' - '),
                }));
                setAllClasses(options);
                setClassOptions(options);
                setFilterClass('');
            } catch (error) {
                console.error('Error fetching student classes:', error);
            } finally {
                setClassesLoading(false);
            }
        };
        fetchStudentClasses();
    }, [filterStudent]);

    // Compute date range based on viewMode and currentDate
    const getDateRange = () => {
        if (dateRangeStart && dateRangeEnd && !dateRangeError) {
            return { startDate: dateRangeStart, endDate: dateRangeEnd };
        }
        if (viewMode === 'weekly') {
            const { start, end } = getWeekRange(currentDate);
            return {
                startDate: start.toISOString().split('T')[0],
                endDate: end.toISOString().split('T')[0],
            };
        }
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        return {
            startDate: new Date(year, month, 1).toISOString().split('T')[0],
            endDate: new Date(year, month + 1, 0).toISOString().split('T')[0],
        };
    };

    // Fetch chart data whenever filters, viewMode, or date changes
    useEffect(() => {
        const fetchChartData = async () => {
            const { startDate, endDate } = getDateRange();
            const params = new URLSearchParams({ startDate, endDate });
            if (filterStudent) params.set('student', filterStudent);
            if (filterClass) params.set('class', filterClass);

            try {
                const response = await executeRequest('get', `/attendance/chart?${params.toString()}`, undefined, { silent: true });
                const records: { date: string; present: number; absent: number }[] = Array.isArray(response) ? response : [];
                const dataMap: Record<string, { present: number; absent: number }> = {};
                records.forEach(r => { dataMap[r.date] = { present: r.present, absent: r.absent }; });

                const chartData = [];
                if (dateRangeStart && dateRangeEnd && !dateRangeError) {
                    const cur = new Date(dateRangeStart + 'T00:00:00');
                    const end = new Date(dateRangeEnd + 'T00:00:00');
                    while (cur <= end) {
                        const dateStr = cur.toISOString().split('T')[0];
                        const label = cur.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
                        chartData.push({
                            day: label,
                            present: dataMap[dateStr]?.present ?? 0,
                            absent: dataMap[dateStr]?.absent ?? 0,
                        });
                        cur.setDate(cur.getDate() + 1);
                    }
                } else if (viewMode === 'weekly') {
                    const { start } = getWeekRange(currentDate);
                    for (let i = 0; i < 7; i++) {
                        const d = new Date(start);
                        d.setDate(start.getDate() + i);
                        const dateStr = d.toISOString().split('T')[0];
                        const label = d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
                        chartData.push({
                            day: label,
                            present: dataMap[dateStr]?.present ?? 0,
                            absent: dataMap[dateStr]?.absent ?? 0,
                        });
                    }
                } else {
                    const year = currentDate.getFullYear();
                    const month = currentDate.getMonth();
                    const daysInMonth = new Date(year, month + 1, 0).getDate();
                    for (let day = 1; day <= daysInMonth; day++) {
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                        const label = new Date(year, month, day).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
                        chartData.push({
                            day: label,
                            present: dataMap[dateStr]?.present ?? 0,
                            absent: dataMap[dateStr]?.absent ?? 0,
                        });
                    }
                }

                setGraphData(chartData);
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setGraphData([]);
            }
        };

        fetchChartData();
    }, [filterStudent, filterClass, currentDate, viewMode, dateRangeStart, dateRangeEnd]);


    const filterBody = () => (
        <div className='filter-body-att'>
            <div className='inputs-div-att'>
                <div className='input-div-attendance'>
                    <Select
                        name='location'
                        label='Location'
                        options={locationOptions}
                        onChange={(e) => setLocation(e.target.value)}
                        icon={locationIcon}
                        value={location}
                        placeholder='Select Location'
                        loading={locationsLoading}
                    />
                </div>
                <div className='input-div-attendance'>
                    <SearchableSelect
                        name='student'
                        label='Student'
                        value={filterStudent}
                        onChange={(v) => setFilterStudent(String(v))}
                        options={studentOptions}
                        loading={studentsLoading}
                        onSearch={(term) => {
                            const trimmed = term.trim().toLowerCase();
                            const base: DropdownOption[] = allStudents.map((s) => {
                                const name = `${s.personalInfo?.legalFirstName || ''} ${s.personalInfo?.lastName || ''}`.trim();
                                return { value: s._id, label: name || s._id };
                            });
                            if (!trimmed) { setStudentOptions(base); return; }
                            const filtered = base.filter(o => o.label.toLowerCase().includes(trimmed) || String(o.value).includes(trimmed));
                            if (filterStudent) {
                                const selected = base.find(o => o.value === filterStudent);
                                if (selected && !filtered.some(o => o.value === selected.value)) {
                                    setStudentOptions([selected, ...filtered]);
                                    return;
                                }
                            }
                            setStudentOptions(filtered);
                        }}
                        placeholder='Search student...'
                    />
                </div>
                <div className='input-div-attendance'>
                    <SearchableSelect
                        name='class'
                        label='Class/Provision'
                        value={filterClass}
                        onChange={(v) => setFilterClass(String(v))}
                        options={classOptions}
                        loading={classesLoading}
                        onSearch={(term) => {
                            const trimmed = term.trim().toLowerCase();
                            if (!trimmed) { setClassOptions(allClasses); return; }
                            const filtered = allClasses.filter(o => o.label.toLowerCase().includes(trimmed));
                            if (filterClass) {
                                const selected = allClasses.find(o => o.value === filterClass);
                                if (selected && !filtered.some(o => o.value === selected.value)) {
                                    setClassOptions([selected, ...filtered]);
                                    return;
                                }
                            }
                            setClassOptions(filtered);
                        }}
                        placeholder='Search class...'
                        disabled={!filterStudent}
                    />
                </div>
            </div>
            <div className='date-range-row'>
                <div className='date-range-inputs'>
                    <DateInput
                        name='dateRangeStart'
                        label='Start Date'
                        value={dateRangeStart}
                        onChange={(e) => handleDateRangeStartChange(e.target.value)}
                        
                    />
                    <DateInput
                        name='dateRangeEnd'
                        label='End Date'
                        value={dateRangeEnd}
                        min={dateRangeStart || undefined}
                        onChange={(e) => handleDateRangeEndChange(e.target.value)}
                        error={dateRangeError || undefined}
                    />
                    {isDateRangeActive && (
                        <button className='clear-date-range-btn' onClick={clearDateRange}>
                            Remove Date Filter
                        </button>
                    )}
                </div>
            </div>
        </div>
    );

    const currentMonth = (() => {
        const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
        return months[currentDate.getMonth()];
    })();

    return (
        <Layout showPagination={true}>
            <div className="attendance-overview-body">
                <div className="attendance-upper-div">
                    <div className="graph-div">
                        <div className='view-toggle-bar'>
                            <div className='view-toggle'>
                                <button
                                    className={`toggle-btn ${viewMode === 'monthly' ? 'active' : ''} ${isDateRangeActive ? 'toggle-disabled' : ''}`}
                                    onClick={() => !isDateRangeActive && setViewMode('monthly')}
                                    disabled={isDateRangeActive}
                                >
                                    Monthly
                                </button>
                                <button
                                    className={`toggle-btn ${viewMode === 'weekly' ? 'active' : ''} ${isDateRangeActive ? 'toggle-disabled' : ''}`}
                                    onClick={() => !isDateRangeActive && setViewMode('weekly')}
                                    disabled={isDateRangeActive}
                                >
                                    Weekly
                                </button>
                            </div>
                            <div className='chart-nav'>
                                <button className='head-btn circle' onClick={goToPrev} disabled={isDateRangeActive}>
                                    <FontAwesomeIcon icon={faChevronLeft} />
                                </button>
                                <span className='chart-nav-label'>{getChartHeading()} {isDateRangeActive ? '' : currentYear}</span>
                                <button className='head-btn circle' onClick={goToNext} disabled={isDateRangeActive}>
                                    <FontAwesomeIcon icon={faChevronRight} />
                                </button>
                            </div>
                        </div>
                        <div className='graph'>
                            <Box
                                heading='Attendance Overview'
                                subHeading={String(currentYear)}
                                body={graph()}
                                monthsDropdown={false}
                                yearsDropdown={false}
                                headerLeft={overviewLeft()}
                            />
                        </div>
                        <div className='filter-div'>
                            <FilterSec
                                secName='Attendance Filter'
                                year={String(currentYear)}
                                content={filterBody()}
                            />
                        </div>
                    </div>
                    <div className="calendar-div">
                        <Box
                            heading={currentMonth + ' ' + currentYear}
                            subHeading='Calendar'
                            body={calendarBody()}
                            monthsDropdown={false}
                            yearsDropdown={false}
                            headerLeft={calendarHeaderLeft()}
                        />
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default Index;
