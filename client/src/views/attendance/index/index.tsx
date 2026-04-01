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
import { useApiRequest } from '../../../hooks/useApiRequest';
import { DropdownOption } from '../../../types/DropDownOption';

const Index = () => {
    const { executeRequest } = useApiRequest();
    const [currentDate, setCurrentDate] = useState(new Date());

    // Filter states
    const [location, setLocation] = useState<string>('');
    const [filterStudent, setFilterStudent] = useState<string>('');
    const [filterClass, setFilterClass] = useState<string>('');
    const [locationOptions, setLocationOptions] = useState<DropdownOption[]>([]);
    const [studentOptions, setStudentOptions] = useState<DropdownOption[]>([]);
    const [classOptions, setClassOptions] = useState<DropdownOption[]>([]);
    const [allStudents, setAllStudents] = useState<any[]>([]);
    const [allClasses, setAllClasses] = useState<DropdownOption[]>([]);

    const [graphData, setGraphData] = useState<any[]>([]);

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

    const graph = () => (
        <BarChart
            dataset={graphData}
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

    const getCurrentMonthName = () => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[currentDate.getMonth()];
    };

    const currentMonth = getCurrentMonthName();
    const currentYear = currentDate.getFullYear();

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
            try {
                const response = await executeRequest('get', '/locations');
                if (Array.isArray(response)) {
                    const options: DropdownOption[] = response.map((loc: any) => ({
                        value: loc._id || loc.name,
                        label: loc.name
                    }));
                    setLocationOptions(options);
                }
            } catch (error) {
                console.error('Error fetching locations:', error);
            }
        };
        fetchLocations();
    }, []);

    // Fetch all students
    useEffect(() => {
        const fetchAllStudents = async () => {
            try {
                const response = await executeRequest('get', '/students?perPage=10000');
                const list = Array.isArray(response) ? response : response.data || [];
                setAllStudents(list);
                const options: DropdownOption[] = list.map((s: any) => {
                    const name = `${s.personalInfo?.legalFirstName || ''} ${s.personalInfo?.lastName || ''}`.trim();
                    return { value: s._id, label: name || s._id };
                });
                setStudentOptions(options);
            } catch (error) {
                console.error('Error fetching students:', error);
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
            try {
                const response = await executeRequest('get', `/classes/student/${filterStudent}`);
                const list = Array.isArray(response) ? response : response.data || [];
                const options: DropdownOption[] = list.map((cls: any) => ({
                    value: cls._id,
                    label: [cls.subject, cls.yeargroup].filter(Boolean).join(' - ')
                }));
                setAllClasses(options);
                setClassOptions(options);
                setFilterClass('');
            } catch (error) {
                console.error('Error fetching student classes:', error);
            }
        };
        fetchStudentClasses();
    }, [filterStudent]);

    // Fetch chart data whenever filters or month changes
    useEffect(() => {
        const fetchChartData = async () => {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const startDate = new Date(year, month, 1).toISOString().split('T')[0];
            const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];
            const daysInMonth = new Date(year, month + 1, 0).getDate();

            // Build query params
            const params = new URLSearchParams({ startDate, endDate });
            if (filterStudent) params.set('student', filterStudent);
            if (filterClass) params.set('class', filterClass);

            try {
                const response = await executeRequest('get', `/attendance/chart?${params.toString()}`);
                const records: { date: string; present: number; absent: number }[] = Array.isArray(response) ? response : [];

                // Build a map from date string to data
                const dataMap: Record<string, { present: number; absent: number }> = {};
                records.forEach(r => { dataMap[r.date] = { present: r.present, absent: r.absent }; });

                // Fill all days in month
                const chartData = [];
                for (let day = 1; day <= daysInMonth; day++) {
                    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const label = new Date(year, month, day).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric' });
                    chartData.push({
                        day: label,
                        present: dataMap[dateStr]?.present ?? 0,
                        absent:  dataMap[dateStr]?.absent  ?? 0,
                    });
                }

                setGraphData(chartData);
            } catch (error) {
                console.error('Error fetching chart data:', error);
                setGraphData([]);
            }
        };

        fetchChartData();
    }, [filterStudent, filterClass, currentDate]);

    const filterBody = () => (
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
                />
            </div>
            <div className='input-div-attendance'>
                <SearchableSelect
                    name='student'
                    label='Student'
                    value={filterStudent}
                    onChange={(v) => setFilterStudent(String(v))}
                    options={studentOptions}
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
    );

    return (
        <Layout showPagination={true}>
            <div className="attendance-overview-body">
                <div className="attendance-upper-div">
                    <div className="graph-div">
                        <div className='graph'>
                            <Box
                                heading='Attendance Overview'
                                subHeading={String(currentYear)}
                                body={graph()}
                                monthsDropdown={true}
                                yearsDropdown={true}
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
