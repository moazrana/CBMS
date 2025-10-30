import React, { useState, useEffect } from 'react';
import Layout from '../../../layouts/layout';
// import api from '../../../services/api';
import Select from '../../../components/Select/Select';
import Student from '../../../assets/safeguarding/student.svg';
import Staff from '../../../assets/safeguarding/staff.svg';
import Status from '../../../assets/safeguarding/status.svg';
import Location from '../../../assets/safeguarding/location.svg';
import Calender from '../../../assets/safeguarding/calendar.svg';
import Clock from '../../../assets/safeguarding/clock.svg';
import Period from '../../../assets/safeguarding/period.svg';
import Description from '../../../assets/safeguarding/description.svg'
import Commentary from '../../../assets/safeguarding/commentary.svg'
import Clip from '../../../assets/safeguarding/clip.svg'
import './new.scss'
import Input from '../../../components/input/Input';
import TextField from '../../../components/textField/TextField';
import ContentBox from '../../../components/contentBox/ContentBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useApiRequest } from '../../../hooks/useApiRequest';
import { useLocation,useParams } from 'react-router-dom';

import BodyMapComponent from '../../../components/safeguarding/bodyMap/bodyMap';

const New=()=>{
    const [students,setStudents]=useState<any[]>([])
    const [student,setStudent]=useState<any>()

    const [staffs,setStaffs]=useState<any[]>([])
    const [staff,setStaff]=useState<any>()

    const [statuses]=useState<any[]>([{value:'1',label:'Open'},{value:'0',label:'Close'}])
    const [status,setStatus]=useState<any>()

    const [locations,setLocations]=useState<any[]>([])
    const [location,setLocation]=useState<any>()

    const [doi,setDoi]=useState<string>('')

    const [toi,setToi]=useState<string>('')

    const [periods,setPeriods]=useState<any[]>([])
    const [period,setPeriod]=useState<any>()

    const [description,setDescription]=useState<string>('')

    const [severity,setSeverity]=useState<number>(1);
    const [idt,setIdt]=useState<string>('');
    const [behaviour,setBehavior]=useState<string>('');
    const { executeRequest, loading } = useApiRequest();
    const [file, setFile] = useState<File | undefined>(undefined);
    const [concernTypes, setConcernTypes] = useState<string[]>([]);
    const [accountChecks, setAccountChecks] = useState<string[]>([]);
    const [bodyMap, setBodyMap] = useState(false);
    const [socialCare, setSocialCare] = useState<string[]>([]);
    const [refferal, setRefferal] = useState<string[]>([]);
    const [attachment, setAttachment] = useState<boolean>(false);

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

    // Checkbox handlers
    const handleCheckbox = (value: string, state: string[], setState: any) => {
        if (state.includes(value)) {
            setState(state.filter(v => v !== value));
        } else {
            setState([...state, value]);
        }
    };
    // File handler
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };
    // Save handler
    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('student', student);
            formData.append('staff', staff);
            formData.append('status', status);
            formData.append('location', location);
            formData.append('dateAndTime', `${doi}T${toi}`);
            formData.append('period', period);
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
            const url = '/safeguards';
            const method = 'post';
            await executeRequest(method, url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Safeguard saved successfully');
        } catch {
            alert('Error saving safeguard');
        }
    };
    // Cancel handler
    const handleCancel = () => {
        setStudent('');
        setStaff('');
        setStatus('');
        setLocation('');
        setDoi('');
        setToi('');
        setPeriod('');
        setDescription('');
        setSeverity(1);
        setIdt('');
        setBehavior('');
        setFile(undefined);
        setConcernTypes([]);
        setAccountChecks([]);
        setBodyMap(false);
        setSocialCare([]);
    }
    const url = useLocation();
    const { id } = useParams();
    const openSafeguard=async(safeguard:any)=>{
        setStudent(safeguard.student._id)
        setStaff(safeguard.staff._id)
        setDescription(safeguard.description)
        setSeverity(safeguard.commentary.severity)
        setIdt(safeguard.commentary.direction)
        setBehavior(safeguard.commentary.behaviour)
        setMeetings(safeguard.meetings)
        setConcernTypes(safeguard.type)
        setAccountChecks(safeguard.your_account)
        setBodyMap(safeguard.body_mapping)
        setSocialCare(safeguard.early_help)
        setRefferal(safeguard.referral_type)
        setConclusion(safeguard.conclusion)
    }
    const getSafeguard=async ()=>{
        const address = '/safeguards/'+id;
        const method = 'get';
        const res=await executeRequest(method, address);
        openSafeguard(res)
    }
    useEffect(() => {
        const fetchLocations = async () => {
            try {
                const res = await executeRequest('get', '/locations');
                if (Array.isArray(res)) {
                    setLocations(res.map((loc: any) => ({ value: loc._id, label: loc.name })));
                }
            } catch {
                // Optionally handle error
            }
        };
        fetchLocations();
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
        const getUsers=async(role:string)=>{
            const res= await executeRequest('get',`/users/role/${role}`)
            switch(role){
                case 'Student':
                    setStudents(res)
                    break
                case 'Staff':
                    setStaffs(res)
                    break
                default:
                    return
            }
        }
        getUsers('Student')
        getUsers('Staff')
        if(url.pathname.includes('safeguard')){
            getSafeguard()
            return
        }
        if(url.pathname.includes('add')){
            return
        }
    }, []);

    //for body mapp
    
    

    return (
        <Layout
            heading='SAFEGUARDING'
            note='SAFEGUARDING FORM'
            showFilter={false}
            showNew={false}
            showPagination={false}
            showViewType={false}
        >
            <div className="main-div">
                <p className='main-heading'>Create New.</p>
                <hr className='hr-line'/>
                <div className="all-inputs-div-safeguard">
                    <div className="dropdowns">
                        <div className="inputs-div">
                            <div className="input-div">
                                <Select
                                    key={'student'}
                                    name="student"
                                    value={student}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setStudent(e.target.value)}}
                                    options={students}
                                    label="Student"
                                    placeholder="Select..."
                                    icon={Student}
                                />
                            </div>
                            <div className="input-div">
                                <Select
                                    name="staff"
                                    value={staff}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setStaff(e.target.value)}}
                                    options={staffs}
                                    label="Staff"
                                    placeholder="Select..."
                                    icon={Staff}
                                />
                            </div>
                            <div className="input-div">
                                <Select
                                    name="status"
                                    value={status}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setStatus(e.target.value)}}
                                    options={statuses}
                                    label="Status"
                                    placeholder="Select..."
                                    icon={Status}
                                />
                            </div>
                        </div>
                        {/* ------------------------- */}
                        <div className="inputs-div">
                            <div className="input-div">
                                <Select
                                    key={'location'}
                                    name="location"
                                    value={location}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setLocation(e.target.value)}}
                                    options={locations}
                                    label="Location"
                                    placeholder="Select..."
                                    icon={Location}
                                />
                            </div>
                            <div className="input-div">
                                <Input
                                    name='doi'
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setDoi(e.target.value)}}
                                    type='date'
                                    value={doi}
                                    label='Date of incident'
                                    icon={Calender}
                                    labelFont={15}
                                />
                            </div>
                            <div className="input-div">
                                <Input
                                    name='toi'
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setToi(e.target.value)}}
                                    type='time'
                                    value={toi}
                                    icon={Clock}
                                    label='Time'
                                    labelFont={15}
                                />
                            </div>
                        </div>
                        {/* ------------------------- */}
                        <div className="inputs-div">
                            <div className="input-div">
                                <Select
                                    name="period"
                                    value={period}
                                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setPeriod(e.target.value)}}
                                    options={periods}
                                    label="Period"
                                    placeholder="Select..."
                                    icon={Period}
                                />
                            </div>
                            
                        </div>
                    </div>
                    <div className="sub-heading">
                        <p className='main-heading'>Incident Description.</p>
                        <hr className='hr-line'/>
                    </div>
                    <div className="description">
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
                                <div className="inputs-div">
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
                                        <div className="comentary-input-div">
                                            <Input
                                                name='behavior'
                                                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setBehavior(e.target.value)}}
                                                value={behaviour}
                                                label='Incident Directed Toward'
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
                                <p>Refferal Type</p>
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
                                <p className='main-heading'>Meeting Notes {idx+1} </p>
                                <hr className='hr-line'/>
                            </div>
                            <div className='sub-content'>
                                <div className="pink-box">
                                    <div className='pink-content'>
                                        <p>Follow Up Meeting Notes</p>
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
                                                <Input
                                                    type="date"
                                                    name={`meeting-date-${idx}`}
                                                    value={meeting.date}
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
                                            Meeting Notes (What Is To Be Done, By Who & When?)
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
                                            }}><FontAwesomeIcon icon={faAdd}/>Add New Meeting</button>
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
                    {/*  */}
                    
                </div>
            </div>
            <div className='btns' style={{ marginTop: 20 }}>
                {/* <input type="file" onChange={handleFileChange} /> */}
                <div className="empty"></div>
                <div className="btns-container">
                    <button type="button" onClick={handleCancel} disabled={loading} className='cancel-btn'>Cancel</button>
                    <button onClick={handleSave} disabled={loading} className='save-btn'>Save</button>
                </div>
            </div>
        </Layout>  
    )
}
export default New