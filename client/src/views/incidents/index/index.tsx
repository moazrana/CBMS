import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/layout';
import DataTable from '../../../components/DataTable/DataTable';
import { useApiRequest } from '../../../hooks/useApiRequest';
import extractDateAndTime  from '../../../functions/formatTimeRange';
import './index.scss'
import ListComponent from '../../../components/safeguarding/listComponent/listComponent';
import ComponentHeader from '../../../components/safeguarding/componrnt-header/componentHeader';
// import FilterSec from '../../../components/FilterSec/FilterSec';
import Input from '../../../components/input/Input';
import Select from '../../../components/Select/Select';
import Student from '../../../assets/safeguarding/student.svg';
import Staff from '../../../assets/safeguarding/staff.svg';
import Description from '../../../assets/safeguarding/description.svg';
import Commentary from '../../../assets/safeguarding/commentary.svg';
import Clip from '../../../assets/safeguarding/clip.svg';
import SidebarPopup from '../../../components/SidebarPopup/SidebarPopup';
import TextField from '../../../components/textField/TextField';
import ContentBox from '../../../components/contentBox/ContentBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faCheck, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Print from '../../../assets/safeguarding/printed.svg'
import Email from '../../../assets/safeguarding/email.svg'
import BodyMapComponent from '../../../components/safeguarding/bodyMap/bodyMap';
import DateInput from '../../../components/dateInput/DateInput';
import NewIncident from '../new/new';
interface incident{
    student:string
    location:string
    eventTime:Date
    period:string
    subject:string
    description:string
    staff:string
    id:string
    status:boolean
    severity?:number
    body_mapping?:boolean
    name?:string
    data?:any
}
type IncidentsTab = 'listing' | 'create';

const Index=()=>{
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<IncidentsTab>('listing');
    const [view,setView]=useState<string>('table')
    const { executeRequest} = useApiRequest();
    const [incidents,setIncidents]=useState<incident[]>([]);
    const [negativeIncidents,setNegativeIncidents]=useState<incident[]>([]);
    const [poitiveIncidents,setPoitiveIncidents]=useState<incident[]>([]);
    const [safeguardingIncidents,setSafeguardingIncidents]=useState<incident[]>([]);
    

    const SEVERITY_LABELS: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' };
    const SEVERITY_COLORS: Record<number, string> = { 1: '#22c55e', 2: '#f97316', 3: '#ef4444' };

    const Columns=[
        {
            header: 'Date',
            accessor: 'eventTime',
            sortable: false,
            type: 'template' as const,
            template: (row: Record<string, any>) => {
                const { date, time } = extractDateAndTime(row.eventTime);
                return (
                    <>
                        <p>{date}</p>
                        {time && <p className="incidents-table-time">{time}</p>}
                    </>
                );
            },
        },
        {
            header: 'Location',
            accessor: 'location',
            sortable: false,
            type: 'string' as const,
        },
        {
            header: 'Student',
            accessor: 'student',
            sortable: false,
            type: 'string' as const,
        },
        {
            header: 'Staff',
            accessor: 'staff',
            sortable: false,
            type: 'string' as const,
        },
        {
            header: 'Severity',
            accessor: 'severity',
            sortable: false,
            type: 'template' as const,
            template: (row: Record<string, any>) => {
                const s = row.severity ?? 1;
                return <span>{SEVERITY_LABELS[s] ?? 'Low'}</span>;
            },
        },
        {
            header: 'Status',
            accessor: 'status',
            sortable: false,
            type: 'template' as const,
            template: (row: Record<string, any>) => (
                <span className="incidents-table-status">
                    {row.status ? 'Open' : 'Closed'}
                </span>
            ),
        },
        {
            header: 'Body map',
            accessor: 'body_mapping',
            sortable: false,
            type: 'template' as const,
            template: (row: Record<string, any>) => (
                <span className="incidents-table-body-map" title={row.body_mapping ? 'Body map required' : 'Body map not required'}>
                    {row.body_mapping ? (
                        <FontAwesomeIcon icon={faCheck} className="incidents-table-body-map-tick" />
                    ) : (
                        <span className="incidents-table-body-map-none">—</span>
                    )}
                </span>
            ),
        },
        {
            header: 'Severity color',
            accessor: 'severityColor',
            sortable: false,
            type: 'template' as const,
            template: (row: Record<string, any>) => {
                const s = row.severity ?? 1;
                const color = SEVERITY_COLORS[s] ?? SEVERITY_COLORS[1];
                return (
                    <span
                        className="incidents-table-severity-dot"
                        style={{ backgroundColor: color }}
                        title={SEVERITY_LABELS[s]}
                    />
                );
            },
        },
    ]
    const fetchSafeguards=async()=>{
        console.log('fetching!!!!')
        const res = await executeRequest('get', '/incidents');
        setIncidents([]);
        const list: incident[] = (Array.isArray(res) ? res : []).map((element: any) => {
            const studentsList = Array.isArray(element.students) ? element.students : (element.student ? [element.student] : []);
            const staffList = Array.isArray(element.staffList) ? element.staffList : (element.staff ? [element.staff] : []);
            const studentName = studentsList
                .map((s: any) => {
                    if (!s) return '';
                    const p = s.personalInfo || {};
                    const first = (p.legalFirstName || '').trim();
                    const last = (p.lastName || '').trim();
                    if (first || last) return [first, last].filter(Boolean).join(' . ');
                    return s.name ?? '';
                })
                .filter(Boolean)
                .join(', ') || '';
            const staffName = staffList
                .map((u: any) => u?.name || (u?.profile ? [u.profile.firstName, u.profile.lastName].filter(Boolean).join(' ') : ''))
                .filter(Boolean)
                .join(', ') || '';
            const dateStr = element.dateAndTime ? extractDateAndTime(String(element.dateAndTime)).date : '';
            return {
                student: studentName,
                location: typeof element.location === 'string' ? element.location : (element.location?.name ?? ''),
                eventTime: element.dateAndTime ? new Date(element.dateAndTime) : new Date(),
                period: element.period?.name ?? '',
                subject: 'Construction',
                description: element.description ?? '',
                staff: staffName,
                id: element._id ?? '',
                status: element.status ?? false,
                severity: element.commentary?.severity ?? 1,
                body_mapping: element.body_mapping ?? false,
                data: element,
                name: `${studentName || 'Incident'}${dateStr ? ` (${dateStr})` : ''}`,
            };
        });
        setIncidents(list);
        
    }
    useEffect(()=>{
        fetchSafeguards()
        const getUsers=async(role:string)=>{
            const res= await executeRequest('get',`/users/role/${role}`)
            switch(role){
                case 'Student':
                    setRsStudents(res)
                    break
                case 'Staff':
                    setRsStaffs(res)
                    break
                default:
                    return
            }
        }
        getUsers('Student')
        getUsers('Staff')
        setNegativeIncidents([])
        setPoitiveIncidents([])
        setSafeguardingIncidents([])
    },[])
    // -------------------------END OF USE EFFECT-----------------------------------------

    

    // -------------------------START OF RS-----------------------------------------
    const [rsStudents,setRsStudents]=useState<any[]>([])
    const [rsStudent,setRsStudent]=useState<any>()
    const [rsStaffs,setRsStaffs]=useState<any[]>([])
    const [rsStaff,setRsStaff]=useState<any>()
    
    const [description,setDescription]=useState<string>('')
    const [severity,setSeverity]=useState<number>(1);
    const [idt,setIdt]=useState<string>('');
    const [behaviour,setBehavior]=useState<string>('');
    const [concernTypes, setConcernTypes] = useState<string[]>([]);
    const [accountChecks, setAccountChecks] = useState<string[]>([]);
    const [bodyMap, setBodyMap] = useState(false);
    const [socialCare, setSocialCare] = useState<string[]>([]);
    const [refferal, setRefferal] = useState<string[]>([]);
    const [attachment, setAttachment] = useState<boolean>(false);
    const [file, setFile] = useState<File | undefined>(undefined);
    interface meeting{
        haveDate:boolean,
        date?:Date,
        havePersons:boolean,
        persons?:string,
        haveNotes:boolean,
        notes?:string
    }
    const [meetings, setMeetings] = useState<meeting[]>([{haveDate:false, havePersons:false, haveNotes:false}]);
    const [conclusion, setConclusion] = useState<string[]>([]);
    const [locationStr, setLocationStr] = useState<string>('');
    const [periodStr, setPeriodStr] = useState<string>('');
    const [status, setStatus] = useState<boolean>(true);

    const handleCheckbox = (value: string, state: string[], setState: any) => {
        if (state.includes(value)) {
            setState(state.filter(v => v !== value));
        } else {
            setState([...state, value]);
        }
    };
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    const sideBarBody=(
        <>
        <div className="rs-inputs-div">
            <div className="rs-input-div">
                <Select
                    key={'student'}
                    name="student"
                    value={rsStudent}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setRsStudent(e.target.value)}}
                    options={rsStudents}
                    label="Student"
                    placeholder="Select..."
                    icon={Student}
                />
            </div>
            <div className="rs-input-div">
                <Select
                    name="staff"
                    value={rsStaff}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setRsStaff(e.target.value)}}
                    options={rsStaffs}
                    label="Staff"
                    placeholder="Select..."
                    icon={Staff}
                />
            </div>
        </div>
        <hr />
        <div id="rs-body">
            <div className="rs-description">
                <TextField
                    label='Description'
                    name='description'
                    onChange={(e:React.ChangeEvent<HTMLTextAreaElement>)=>{setDescription(e.target.value)}}
                    value={description}
                    icon={Description}
                />
                <ContentBox
                    label='Commentary'
                    icon={Commentary}
                >
                    <div className="commentary-div">
                        <p className='commentary-heading'>Micheal Wright</p>
                        <div className="rs-commentary-inputs-div">
                            <div className="comentary-inputs">
                                <div className="comentary-input-div">
                                    <Input
                                        name='severity'
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setSeverity(Number(e.target.value))}}
                                        value={severity}
                                        label='Level Of Severity'
                                        labelFont={15}
                                    />
                                </div>
                                <div className="comentary-input-div">
                                    <Input
                                        name='idt'
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setIdt(e.target.value)}}
                                        value={idt}
                                        label='Incident Directed Toward'
                                        labelFont={15}
                                    />
                                </div>
                            </div>
                            <div className="comentary-inputs">
                                <div className="comentary-input-div">
                                    <Input
                                        name='behavior'
                                        onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setBehavior(e.target.value)}}
                                        value={behaviour}
                                        label='Behaviour'
                                        labelFont={15}
                                    />
                                </div>
                            </div>
                        </div>
                        <hr className='commentary-hr'/>
                        <p className='commentary-heading'>Updates</p>
                        <div className="commentary-attachment">
                            <img 
                                src={Clip} 
                                alt="icon" 
                                style={{ 
                                    width: 19, 
                                    height: 19, 
                                    marginRight: 8,
                                    filter: `var(--nav-icon-filter)`,
                                    fill: 'var(--nav-icon-filter)'
                                }} 
                            />
                        </div>
                        <div className="commentary-attachment">
                            <img 
                                src={Clip} 
                                alt="icon" 
                                style={{ 
                                    width: 19, 
                                    height: 19, 
                                    marginRight: 8,
                                    filter: `var(--nav-icon-filter)`,
                                    fill: 'var(--nav-icon-filter)'
                                }} 
                            />
                        </div>
                    </div>
                </ContentBox>
            </div>
            <div className="sub-heading">
                <p className='main-heading'>Type</p>
                <hr className='hr-line'/>
            </div>
            <div className='sub-content'>
                <div className="pink-box">
                    <div className='pink-content'>
                        <p>Concern Type</p>
                        <p>
                            <FontAwesomeIcon icon={faChevronDown}/>
                        </p>
                    </div>
                </div>
                <div className='box-content'>
                    <div className='check-boxes'>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={concernTypes.includes('Physical')} onChange={() => handleCheckbox('Physical', concernTypes, setConcernTypes)} />
                            <span className="checkmark"></span>
                            Physical
                        </label>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={concernTypes.includes('Physchological')} onChange={() => handleCheckbox('Physchological', concernTypes, setConcernTypes)} />
                            <span className="checkmark"></span>
                            Physchological
                        </label>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={concernTypes.includes('Neglect')} onChange={() => handleCheckbox('Neglect', concernTypes, setConcernTypes)} />
                            <span className="checkmark"></span>
                            Neglect
                        </label>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={concernTypes.includes('Sexual')} onChange={() => handleCheckbox('Sexual', concernTypes, setConcernTypes)} />
                            <span className="checkmark"></span>
                            Sexual
                        </label>
                    </div>
                </div>
            </div>

            <div className="sub-heading">
                <p className='main-heading'>Account Details</p>
                <hr className='hr-line'/>
            </div>
            <div className='sub-content'>
                <div className="pink-box">
                    <div className='pink-content'>
                        <p>Your Account</p>
                        <p>
                            <FontAwesomeIcon icon={faChevronDown}/>
                        </p>
                    </div>
                </div>
                <div className='box-content'>
                    <div className='check-boxes-column'>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={accountChecks.includes('Tick If This Concern Has Been Raised Before')} onChange={() => handleCheckbox('Tick If This Concern Has Been Raised Before', accountChecks, setAccountChecks)} />
                            <span className="checkmark"></span>
                            Tick If This Concern Has Been Raised Before
                        </label>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={accountChecks.includes('Tick If You Spoken With Child')} onChange={() => handleCheckbox('Tick If You Spoken With Child', accountChecks, setAccountChecks)} />
                            <span className="checkmark"></span>
                            Tick If You Spoken With Child
                        </label>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={accountChecks.includes('Tick If You Have Spoken Wth Parent/Carer')} onChange={() => handleCheckbox('Tick If You Have Spoken Wth Parent/Carer', accountChecks, setAccountChecks)} />
                            <span className="checkmark"></span>
                            Tick If You Have Spoken Wth Parent/Carer
                        </label>
                        
                    </div>
                </div>
            </div> 
            {/*  */}
            <div className="sub-heading">
                <p className='main-heading'>Body Mapping Details</p>
                <hr className='hr-line'/>
            </div>
            <div className='sub-content'>
                <div className="pink-box">
                    <div className='pink-content'>
                        <p>Body Map</p>
                        <p>
                            <FontAwesomeIcon icon={faChevronDown}/>
                        </p>
                    </div>
                </div>
                <div className='box-content'>
                    <div className='check-boxes-column'>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={bodyMap} onChange={() => setBodyMap(!bodyMap)} />
                            <span className="checkmark"></span>
                            Body Map (Tick If Required)
                        </label> 
                        {bodyMap&&<BodyMapComponent />}
                    </div>
                </div>
            </div>  
            {/*  */}
            {/*  */}
            <div className="sub-heading">
                <p className='main-heading'>Social Care </p>
                <hr className='hr-line'/>
            </div>
            <div className='sub-content'>
                <div className="pink-box">
                    <div className='pink-content'>
                        <p>Early Help/Childern's Social Care Status</p>
                        <p>
                            <FontAwesomeIcon icon={faChevronDown}/>
                        </p>
                    </div>
                </div>
                <div className='box-content'>
                    <div className='check-boxes-column'>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={socialCare.includes('Allocated Social Worker')} onChange={() => handleCheckbox('Allocated Social Worker', socialCare, setSocialCare)} />
                            <span className="checkmark"></span>
                            Allocated Social Worker
                        </label> 
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={socialCare.includes('Chlid Protection Plan')} onChange={() => handleCheckbox('Chlid Protection Plan', socialCare, setSocialCare)} />
                            <span className="checkmark"></span>
                            Chlid Protection Plan
                        </label>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={socialCare.includes('CAF')} onChange={() => handleCheckbox('CAF', socialCare, setSocialCare)} />
                            <span className="checkmark"></span>
                            CAF
                        </label>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={socialCare.includes('Known To Social Care')} onChange={() => handleCheckbox('Known To Social Care', socialCare, setSocialCare)} />
                            <span className="checkmark"></span>
                            Known To Social Care 
                        </label>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={socialCare.includes('None')} onChange={() => handleCheckbox('None', socialCare, setSocialCare)} />
                            <span className="checkmark"></span>
                            None 
                        </label> 
                    </div>
                </div>
            </div>  
            {/*  */}
            {/*  */}
            <div className="sub-heading">
                <p className='main-heading'>Referral </p>
                <hr className='hr-line'/>
            </div>
            <div className='sub-content'>
                <div className="pink-box">
                    <div className='pink-content'>
                        <p>Referrals</p>
                        <p>
                            <FontAwesomeIcon icon={faChevronDown}/>
                        </p>
                    </div>
                </div>
                <div className='box-content'>
                    <div className='check-boxes-column'>
                        <div className="check-boxes">
                            <label className="custom-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={refferal.includes('CAF/TAM')} 
                                    onChange={() => handleCheckbox(
                                        'CAF/TAM', 
                                        refferal, 
                                        setRefferal
                                    )} 
                                />
                                <span className="checkmark"></span>
                                CAF/TAM
                            </label> 
                            <label className="custom-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={refferal.includes('Multi-Agency Screening Team')} 
                                    onChange={() => handleCheckbox(
                                        'Multi-Agency Screening Team', 
                                        refferal, 
                                        setRefferal
                                    )} 
                                />
                                <span className="checkmark"></span>
                                Multi-Agency Screening Team
                            </label>
                            <label className="custom-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={refferal.includes('Housing')} 
                                    onChange={() => handleCheckbox(
                                        'Housing', 
                                        refferal, 
                                        setRefferal
                                    )} 
                                />
                                <span className="checkmark"></span>
                                Housing
                            </label>
                            <label className="custom-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={socialCare.includes('Other: (Refferal)')} 
                                    onChange={() => handleCheckbox(
                                        'Other: (Refferal)', 
                                        socialCare, 
                                        setSocialCare
                                    )} 
                                />
                                <span className="checkmark"></span>
                                Other: (Refferal)
                            </label>
                        </div>
                        <div className="check-boxes">
                            <label className="custom-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={refferal.includes('Health Services')} 
                                    onChange={() => handleCheckbox(
                                        'Health Services', 
                                        refferal, 
                                        setRefferal
                                    )} 
                                />
                                <span className="checkmark"></span>
                                Health Services
                            </label> 
                            <label className="custom-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={refferal.includes('Police')} 
                                    onChange={() => handleCheckbox(
                                        'Police', 
                                        refferal, 
                                        setRefferal
                                    )} 
                                />
                                <span className="checkmark"></span>
                                Police
                            </label>
                            <label className="custom-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={refferal.includes('LA Services')} 
                                    onChange={() => handleCheckbox(
                                        'LA Services', 
                                        refferal, 
                                        setRefferal
                                    )} 
                                />
                                <span className="checkmark"></span>
                                LA Services
                            </label>
                            <div style={{width:200}}></div>
                        </div>
                        
                    </div>
                </div>
            </div>  
            {/*  */}
            {/*  */}
            {meetings.map((meeting,idx)=>(
                <>
                    <div className="sub-heading">
                        <p className='main-heading'>Notes {idx+1} </p>
                        <hr className='hr-line'/>
                    </div>
                    <div className='sub-content'>
                        <div className="pink-box">
                            <div className='pink-content'>
                                <p>Follow Up Notes</p>
                                <p>
                                    <FontAwesomeIcon icon={faChevronDown}/>
                                </p>
                            </div>
                        </div>
                        <div className='box-content'>
                            <div className='check-boxes-column'>
                                <label className="custom-checkbox">
                                    <input 
                                        type="checkbox" 
                                        checked={meeting.haveDate} 
                                        onChange={() => {
                                            const updated = [...meetings];
                                            updated[idx] = { ...updated[idx], haveDate: !updated[idx].haveDate };
                                            setMeetings(updated);
                                        }} 
                                    />
                                    <span className="checkmark"></span>
                                    Date
                                </label>
                                {meeting.haveDate && (
                                    <div className='meeting-input-div'>
                                        <DateInput
                                            name={`meeting-date-${idx}`}
                                            value={meeting.date
                                                ? (typeof meeting.date === 'string'
                                                    ? meeting.date
                                                    : meeting.date.toISOString().split('T')[0])
                                                : ''}
                                            onChange={e => {
                                            const updated = [...meetings];
                                            updated[idx] = { ...updated[idx], date: e.target.value ? new Date(e.target.value) : undefined };
                                            setMeetings(updated);
                                            }}
                                            label=""
                                            labelFont={15}
                                        />
                                    </div>
                                )} 
                                <label className="custom-checkbox">
                                    <input 
                                        type="checkbox" 
                                        checked={meeting.havePersons} 
                                        onChange={() => {
                                            const updated = [...meetings];
                                            updated[idx] = { ...updated[idx], havePersons: !updated[idx].havePersons };
                                            setMeetings(updated);
                                        }} 
                                    />
                                    <span className="checkmark"></span>
                                    Persons Attending Meeting
                                </label>
                                {meeting.havePersons && (
                                    <div className='meeting-input-div'>
                                        <Input
                                            type="text"
                                            name={`meeting-names-${idx}`}
                                            value={meeting.persons ? meeting.persons : ''}
                                            onChange={e => {
                                            const updated = [...meetings];
                                            updated[idx] = { ...updated[idx], persons: e.target.value ? e.target.value : '' };
                                            setMeetings(updated);
                                            }}
                                            label=""
                                            labelFont={15}
                                        />
                                    </div>
                                )}
                                <label className="custom-checkbox">
                                    <input 
                                        type="checkbox" 
                                        checked={meeting.haveNotes} 
                                        onChange={() => {
                                            const updated = [...meetings];
                                            updated[idx] = { ...updated[idx], haveNotes: !updated[idx].haveNotes };
                                            setMeetings(updated);
                                        }} 
                                    />
                                    <span className="checkmark"></span>
                                    Notes (What Is To Be Done, By Who & When?)
                                </label>
                                {meeting.haveNotes && (
                                    <div className='meeting-input-div'>
                                        <TextField
                                            label=""
                                            name={`meeting-notes-${idx}`}
                                            value={meeting.notes ? meeting.notes : ''}
                                            onChange={e => {
                                                const updated = [...meetings];
                                                updated[idx] = { ...updated[idx], notes: e.target.value };
                                                setMeetings(updated);
                                            }}
                                            rows={3}
                                        />
                                    </div>
                                )}
                            </div>
                            {idx==meetings.length-1&&(
                                <div className='meeting-add-div'>
                                    <button className='meeting-add-btn' onClick={() => {
                                        setMeetings([...meetings, { haveDate: false, havePersons: false, haveNotes: false }]);
                                    }}><FontAwesomeIcon icon={faAdd}/>Add New Notes</button>
                                </div>  

                            )}
                        </div>
                    </div>
                </>
            ))}
                
            {/*  */}
            {/*  */}
            <div className="sub-heading">
                <p className='main-heading'>Conclusion </p>
                <hr className='hr-line'/>
            </div>
            <div className='sub-content'>
                <div className="pink-box">
                    <div className='pink-content'>
                        <p>Outcome</p>
                        <p>
                            <FontAwesomeIcon icon={faChevronDown}/>
                        </p>
                    </div>
                </div>
                <div className='box-content'>
                    <div className='check-boxes-column'>
                        <div className="check-boxes">
                            <label className="custom-checkbox">
                                <input 
                                    type="checkbox" 
                                    checked={conclusion.includes('Outcome')} 
                                    onChange={() => handleCheckbox(
                                        'Outcome', 
                                        conclusion, 
                                        setConclusion
                                    )} 
                                />
                                <span className="checkmark"></span>
                                Outcome
                            </label> 
                        </div> 
                    </div>
                </div>
            </div>  
            {/*  */}
            {/*  */}
            <div className="sub-heading">
                <p className='main-heading'>Attachments </p>
                <hr className='hr-line'/>
            </div>
            <div className='sub-content'>
                    <div className="pink-box">
                        <div className='pink-content'>
                            <p>Upload Supporting Files</p>
                            <p>
                                <FontAwesomeIcon icon={faChevronDown}/>
                            </p>
                        </div>
                    </div>
                    <div className='box-content'>
                        <div className='check-boxes-column'>
                            <div className="check-boxes">
                                <label className="custom-checkbox">
                                    <input 
                                        type="checkbox" 
                                        checked={attachment} 
                                        onChange={() => {setAttachment(!attachment)}} 
                                    />
                                    <span className="checkmark"></span>
                                    Attachments
                                </label>
                            </div> 
                            <div className="meeting-input-div">
                                {attachment && (
                                    <Input
                                        type="file"
                                        name="attachment"
                                        onChange={handleFileChange}
                                        label=""
                                        labelFont={15}
                                        
                                    />
                                )} 
                            </div>
                        </div>
                    </div>
            </div>
        </div> 
        </>
    )
    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('student', String(rsStudent ?? ''));
            formData.append('staff', String(rsStaff ?? ''));
            formData.append('status', String(status));
            formData.append('location', locationStr);
            formData.append('period', periodStr);
            formData.append('description', description);
            formData.append('commentary[severity]', String(severity));
            formData.append('commentary[direction]', idt);
            formData.append('commentary[behavior]', behaviour);
            concernTypes.forEach((t, i) => formData.append(`type[${i}]`, t));
            accountChecks.forEach((a, i) => formData.append(`your_account[${i}]`, a));
            formData.append('body_mapping', String(bodyMap));
            socialCare.forEach((s, i) => formData.append(`early_help[${i}]`, s));
            if (file) formData.append('file', file);
            formData.append('meetings', JSON.stringify(meetings));
            formData.append('conclusion', JSON.stringify(conclusion));
            // For update, provide safeguardId and PATCH, else POST
            // Example: const safeguardId = ...
            const url = '/incidents';
            const method = 'post';
            await executeRequest(method, url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            // alert('Safeguard saved successfully');
        } catch {
            alert('Error saving safeguard');
        }
    };
    const sideBarFooter=(
        <>
            <div className="sidebar-footer">
                <div className="print-div">
                    <div className="print-logo-div">
                        <img 
                            src={Print} 
                            alt="icon" 
                            style={{ width: 19, height: 19, marginRight: 8,filter:'var(--icon-filter)' }} 
                        />
                    </div>
                    <p>Print</p>
                </div>
                <div className="btns-div">
                    <button id='rs-save-btn' onClick={handleSave}>Save</button>
                    <button id='rs-cancel-btn'>Cancel</button>
                </div>
                <div className="print-div">
                    <div className="print-logo-div">
                        <img 
                            src={Email} 
                            alt="icon" 
                            style={{ width: 19, height: 19, marginRight: 8,filter:'var(--icon-filter)' }} 
                        />
                    </div>
                    <p>Email</p>
                </div>
            </div>
        </>
    )

    const [linkForSafeguard,setLinkForSafeguard]=useState<string>('')
    const openIncident=async(incident:incident)=>{
        // setSelectedSafeguard(safeguard)
        
        const data = incident.data;
        const firstStudent = Array.isArray(data.students) ? data.students[0] : data.student;
        const firstStaff = Array.isArray(data.staffList) ? data.staffList[0] : data.staff;
        setRsStudent(firstStudent?._id ?? firstStudent)
        setRsStaff(firstStaff?._id ?? firstStaff)
        setLocationStr(typeof incident.data.location === 'string' ? incident.data.location : '')
        setPeriodStr(incident.data.period?._id ?? '')
        setStatus(incident.data.status ?? true)
        setDescription(incident.data.description)
        setSeverity(incident.data.commentary.severity)
        setIdt(incident.data.commentary.direction)
        setBehavior(incident.data.commentary.behaviour)
        setMeetings(incident.data.meetings)
        setConcernTypes(incident.data.type)
        setAccountChecks(incident.data.your_account)
        setBodyMap(incident.data.body_mapping)
        setSocialCare(incident.data.early_help)
        setRefferal(incident.data.referral_type)
        setConclusion(incident.data.conclusion)

        setLinkForSafeguard('/incidents/incident/'+incident.data._id)
        setOpenRS(true)
    }
    
    // const [openFilter,setOpenFilter]=useState<boolean>(false)
    // const [selectedSafeguard,setSelectedSafeguard]=useState<safeguard|null>(null)
    const [openRS,setOpenRS]=useState<boolean>(false)

    

    return (
        <>
            <Layout
                showNew={false}
                // showPagination={activeTab === 'listing'}
                // showFilter={activeTab === 'listing'}
                // showViewType={activeTab === 'listing'}
                view={view}
                changeView={()=>{ setView((prev) => (prev === 'table' ? 'component' : 'table'))}}
                // openFilters={openFilter}
                // filters={safeguardFilters}
                // filtersBtnClicked={()=>setOpenFilter((prev)=>(!prev))}
            >
                <div className="incidents-page">
                    <div className="incidents-tabs">
                        <button
                            type="button"
                            className={`incidents-tab ${activeTab === 'listing' ? 'active' : ''}`}
                            onClick={() => setActiveTab('listing')}
                        >
                            Incidents
                        </button>
                        <button
                            type="button"
                            className={`incidents-tab ${activeTab === 'create' ? 'active' : ''}`}
                            onClick={() => setActiveTab('create')}
                        >
                            New incident
                        </button>
                    </div>
                    {activeTab === 'listing' && (
                <div>
                    {view=='table'&&(
                        <DataTable
                            columns={Columns}
                            data={incidents}
                            title=''
                            onEdit={(row) => {
                                const id = row.data?._id ?? row.id;
                                if (id) navigate(`/incidents/incident/${id}`);
                            }}
                            onDelete={async (row) => {
                                const id = row.data?._id ?? row.id;
                                if (!id) return;
                                try {
                                    await executeRequest('delete', `/incidents/${id}`);
                                    fetchSafeguards();
                                } catch {
                                    alert('Error deleting incident');
                                }
                            }}
                            showActions={true}
                            addButton={false}
                            showSearch={false}
                        />
                    )}
                    {view=='component'&&(<>
                        <div className="compo-view">
                            <div className="comps-div">
                                <ComponentHeader
                                    secName='Information'
                                    count={incidents.length}
                                />
                                {incidents.map((incident,index)=>(
                                    <>
                                        {incident.status}
                                        <ListComponent
                                            key={index}
                                            student={incident.student}
                                            subject={incident.subject}
                                            eventTime={incident.eventTime}
                                            description={incident.description}
                                            location={incident.location}
                                            status={incident.status}
                                            onClick={()=>{
                                                openIncident(incident)
                                            }}
                                        />    
                                    </>
                                ))}
                            </div>
                            <div className="comps-div">
                                <ComponentHeader
                                    secName='Negative'
                                    count={negativeIncidents.length}
                                />
                                {negativeIncidents.map((incident,index)=>(
                                    <>
                                    {incident.status}
                                        <ListComponent
                                            key={index}
                                            student={incident.student}
                                            subject={incident.subject}
                                            eventTime={incident.eventTime}
                                            description={incident.description}
                                            location={incident.location}
                                            status={incident.status}
                                        />    
                                    </>
                                ))}
                            </div>
                            <div className="comps-div">
                                <ComponentHeader
                                    secName='Positive'
                                    count={poitiveIncidents.length}
                                />
                                {poitiveIncidents.map((incident,index)=>(
                                    <>
                                    {incident.status}
                                        <ListComponent
                                            key={index}
                                            student={incident.student}
                                            subject={incident.subject}
                                            eventTime={incident.eventTime}
                                            description={incident.description}
                                            location={incident.location}
                                            status={incident.status}
                                        />    
                                    </>
                                ))}
                            </div>
                            <div className="comps-div">
                                <ComponentHeader
                                    secName='Safeguarding'
                                    count={safeguardingIncidents.length}
                                />
                                {safeguardingIncidents.map((incident,index)=>(
                                    <>
                                    {incident.status}
                                        <ListComponent
                                            key={index}
                                            student={incident.student}
                                            subject={incident.subject}
                                            eventTime={incident.eventTime}
                                            description={incident.description}
                                            location={incident.location}
                                            status={incident.status}
                                        />    
                                    </>
                                ))}
                            </div>
                        </div>
                        </>
                    )}
                </div>
                    )}
                    {activeTab === 'create' && (
                        <NewIncident
                            embedded
                            onSaved={() => {
                                setActiveTab('listing');
                                fetchSafeguards();
                            }}
                        />
                    )}
                </div>
            </Layout>
            <SidebarPopup
                isOpen={openRS}
                onClose={()=>setOpenRS(false)}
                title='Safeguarding Details'
                message='All The Incident Details'
                pinkBoxText='12345'
                grayBoxText='fri 09 may 2025-12:34 PM'
                children={sideBarBody}
                footer={sideBarFooter}
                link={linkForSafeguard}
            />
        </>
    )
}

export default Index