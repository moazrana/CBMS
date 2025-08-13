import React, { useEffect, useState } from 'react';
import Layout from '../../../layouts/layout';
import DataTable from '../../../components/DataTable/DataTable';
import { useApiRequest } from '../../../hooks/useApiRequest';
import home from '../../../assets/safeguarding/home.svg';
import extractDateAndTime  from '../../../functions/formatTimeRange';
import beat from '../../../assets/safeguarding/beat.svg'
import './index.scss'
import ListComponent from '../../../components/safeguarding/listComponent/listComponent';
import ComponentHeader from '../../../components/safeguarding/componrnt-header/componentHeader';
import FilterSec from '../../../components/FilterSec/FilterSec';
import Input from '../../../components/input/Input';
import Select from '../../../components/Select/Select';
import Student from '../../../assets/safeguarding/student.svg';
import Victim from '../../../assets/safeguarding/victim.svg';
import Staff from '../../../assets/safeguarding/staff.svg';
import KeyStage from '../../../assets/safeguarding/keyStage.svg';
import YearGroup from '../../../assets/safeguarding/yearGroup.svg';
import Form from '../../../assets/safeguarding/form.svg';
import Subject from '../../../assets/safeguarding/subject.svg';
import Class from '../../../assets/safeguarding/class.svg';
import SortBy from '../../../assets/safeguarding/sortBy.svg';
import SortType from '../../../assets/safeguarding/sortType.svg';
import ShowTop from '../../../assets/safeguarding/showTop.svg';
import Gender from '../../../assets/safeguarding/gender.svg';
import FirstLanguage from '../../../assets/safeguarding/firstLanguage.svg'
import Religion from '../../../assets/safeguarding/religion.svg'
import Ethnicity from '../../../assets/safeguarding/enthnicity.svg'
import Postcode from '../../../assets/safeguarding/postcode.svg'
import FreeMeals from '../../../assets/safeguarding/freeMeals.svg'
import EAL from '../../../assets/safeguarding/eal.svg'
import InCare from '../../../assets/safeguarding/inCare.svg'
import PupilPremium from '../../../assets/safeguarding/pupilPremium.svg'
import Slip from '../../../assets/safeguarding/slip.svg'
import Positivity from '../../../assets/safeguarding/positivity.svg'
import Field from '../../../assets/safeguarding/fields.svg'
import Category from '../../../assets/safeguarding/category.svg'
import Printed from '../../../assets/safeguarding/printed.svg'
import Origin from '../../../assets/safeguarding/origin.svg'
import Detention from '../../../assets/safeguarding/detention.svg'
import Show from '../../../assets/safeguarding/show.svg'
import Admission from '../../../assets/safeguarding/admission.svg'
import Status from '../../../assets/safeguarding/status.svg'
import Location from '../../../assets/safeguarding/location.svg'
import Period from '../../../assets/safeguarding/period.svg'
import SENStatus from '../../../assets/safeguarding/senStatus.svg'
import SENType from '../../../assets/safeguarding/senType.svg'
import For from '../../../assets/safeguarding/for.svg'
import BroaderStatus from '../../../assets/safeguarding/broaderStatus.svg'
import ReportName from '../../../assets/safeguarding/reportName.svg'
import Description from '../../../assets/safeguarding/description.svg'
import Commentary from '../../../assets/safeguarding/commentary.svg'
import Clip from '../../../assets/safeguarding/clip.svg'
import SidebarPopup from '../../../components/SidebarPopup/SidebarPopup';
import TextField from '../../../components/textField/TextField';
import ContentBox from '../../../components/contentBox/ContentBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import Print from '../../../assets/safeguarding/printed.svg'
import Email from '../../../assets/safeguarding/email.svg'
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
    data?:any
}
const Index=()=>{
    const [view,setView]=useState<string>('component')
    const { executeRequest} = useApiRequest();
    const [incidents,setIncidents]=useState<incident[]>([]);
    const [negativeIncidents,setNegativeIncidents]=useState<incident[]>([]);
    const [poitiveIncidents,setPoitiveIncidents]=useState<incident[]>([]);
    const [safeguardingIncidents,setSafeguardingIncidents]=useState<incident[]>([]);
    

    const Columns=[
        { 
            header: 'Student', 
            accessor: 'student', 
            sortable: false, 
            type: 'template' as const,
            template:(row: Record<string, any>) => {
                return( 
                <>
                    <p>{row.student}</p>
                    <p className='bracket-text'>({row.location} - {row.subject})</p>
                    <div className='boxed-location'><img src={home} alt="icon" style={{ width: 15, height: 15, marginRight: 8 }} />{row.location}</div>
                </>
                )
            } 
        },
        {
            header:'Event Time',
            accessor:'eventTime',
            sortable:false,
            type:'template'as const,
            template:(row:Record<string,any>) => {
                return (
                    <>
                        <p>{extractDateAndTime(row.eventTime).date}</p>
                        <p>{extractDateAndTime(row.eventTime).time}</p>
                    </>
                    )
            }
        },
        {
            header:'Period',
            accessor:'period',
            sortable:false,
            type:'string' as const
        },
        {
            header:'Subject',
            accessor:'subject',
            sortable:false,
            type:'string' as const
        },
        {
            header:'Brief Description',
            accessor:'description',
            sortable:false,
            type:'tenChars' as const
        },
        {
            header:'Staff Name',
            accessor:'staff',
            sortable:false,
            type:'string' as const
        },
        {
            header:'Location',
            accessor:'location',
            sortable:false,
            type:'string' as const
        },
        {
            header:'Book Day ID',
            accessor:'bookDay',
            sortable:false,
            type:'template'as const,
            template:(row:Record<string,any>)=>{
                return (
                    <div className='b-day'>
                        <p>{row.student}</p>
                        <div className="status-div">
                            <img src={beat} alt="icon" style={{ width: 15, height: 15, marginRight: 8,filter: 'var(--status-color)' }} />Open
                        </div>
                    </div>
                )
            }
        }
    ]
    const fetchSafeguards=async()=>{
        console.log('fetching!!!!')
        const res= await executeRequest('get','/incidents');
        setIncidents([])
        res.forEach((element:any) => {
            const incident:incident={
                student:'',
                location:'',
                eventTime:new Date(),
                period:'',
                subject:'Construction',
                description:'',
                staff:'',
                id:'',
                status:false
            };
            incident.student=element.student.name
            incident.location=element.location.name
            incident.eventTime=element.dateAndTime
            incident.period=element.period.name
            incident.description=element.description
            incident.staff=element.staff.name
            incident.status=element.status
            incident.data=element
            setIncidents(perv=>[...perv,incident])
        });
        
    }
    useEffect(()=>{
        fetchSafeguards()
        const getUsers=async(role:string)=>{
            const res= await executeRequest('get',`/users/role/${role}`)
            switch(role){
                case 'Student':
                    setStudents(res)
                    setRsStudents(res)
                    break
                case 'Staff':
                    setStaffs(res)
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
        setVictims([])
        setHouses([])
        setKeyStages([])
        setYearGroups([])
        setForms([])
        setSubjects([])
        setClasses([])
        setSortByes([])
        setSortTypes([])
        setShowTops([])
        setGenders([])
        setFirstLanguages([])
        setReligions([])
        setEnthnicities([])
        setPostcodes([])
        setFreeMeals([])
        setEals([])
        setInCares([])
        setPupilPremiums([])
        setSlips([])
        setPositivites([])
        setFields([])
        setCategories([])
        setPrinteds([])
        setOrigins([])
        setDetentions([])
        setShows([])
        setAdmissions([])
        setStatuses([])
        setLocations([])
        setPeriods([])
        setSenStatuses([])
        setSenTypes([])
        setFors([])
        setbroaderStatuses([])
        setReportNames([])
        
    },[])
    // -------------------------END OF USE EFFECT-----------------------------------------

    // -------------------------START OF FILTERS------------------------------------------
    const [students,setStudents]=useState<any[]>([])
    const [student,setStudent]=useState<any>()

    const [victims,setVictims]=useState<any[]>([])
    const [victim,setVictim]=useState<any>()

    const [staffs,setStaffs]=useState<any[]>([])
    const [staff,setStaff]=useState<any>()
    
    const thoseInvolved=(
        <>
            <div className="inputs-div" style={{height:100}}>
                <Select
                    name='students'
                    options={students}
                    value={student}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setStudent(e.target.value)}}
                    label='Student'
                    icon={Student}
                />

                <Select
                    name='victims'
                    options={victims}
                    value={victim}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setVictim(e.target.value)}}
                    label='Victim'
                    icon={Victim}
                />

                <Select
                    name='staffs'
                    options={staffs}
                    value={staff}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setVictim(e.target.value)}}
                    label='Staff'
                    icon={Staff}
                />
            </div>
        </>
    )

    const [houses,setHouses]=useState<any[]>([])
    const [house,setHouse]=useState<any>()

    const [keyStages,setKeyStages]=useState<any[]>([])
    const [keyStage,setKeyStage]=useState<any>()

    const [yearGroups,setYearGroups]=useState<any[]>([])
    const [yearGroup,setYearGroup]=useState<any>()

    const [forms,setForms]=useState<any[]>([])
    const [form,setForm]=useState<any>()

    const [subjects,setSubjects]=useState<any[]>([])
    const [subject,setSubject]=useState<any>()

    const [classes,setClasses]=useState<any[]>([])
    const [varClass,setVarClass]=useState<any>()


    const grouping=(
        <>
            <div className="inputs-div" style={{height:100}}>
                <Select
                    name='house'
                    options={houses}
                    value={house}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setHouse(e.target.value)}}
                    label='House'
                    icon={home}
                />

                <Select
                    name='keyStage'
                    options={keyStages}
                    value={keyStage}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setKeyStage(e.target.value)}}
                    label='Key Stage'
                    icon={KeyStage}
                />

                <Select
                    name='yearGroup'
                    options={yearGroups}
                    value={yearGroup}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setYearGroup(e.target.value)}}
                    label='Year Group'
                    icon={YearGroup}
                />
            </div>
            <div className="inputs-div" style={{height:100}}>
                <Select
                    name='form'
                    options={forms}
                    value={form}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setForm(e.target.value)}}
                    label='Form'
                    icon={Form}
                />
                <Select
                    name='subject'
                    options={subjects}
                    value={subject}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setSubject(e.target.value)}}
                    label='Subject'
                    icon={Subject}
                />
                <Select
                    name='Class'
                    options={classes}
                    value={varClass}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setVarClass(e.target.value)}}
                    label='Class'
                    icon={Class}
                />
            </div>
        </>
    )

    const [sortByes,setSortByes]=useState<any[]>([]);
    const [sortBy,setSortBy]=useState<any>();

    const [sortTypes,setSortTypes]=useState<any[]>([]);
    const [sortType,setSortType]=useState<any>();

    const [showTops,setShowTops]=useState<any[]>([]);
    const [showTop,setShowTop]=useState<any>([])

    const show=(
        <>
            <div className="inputs-div" style={{height:100}}>
                <Select
                    name='sortBy'
                    options={sortByes}
                    value={sortBy}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setSortBy(e.target.value)}}
                    label='Sort By'
                    icon={SortBy}
                />

                <Select
                    name='sortType'
                    options={sortTypes}
                    value={sortType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setSortType(e.target.value)}}
                    label='Sort Type'
                    icon={SortType}
                />

                <Select
                    name='showTop'
                    options={showTops}
                    value={showTop}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setShowTop(e.target.value)}}
                    label='Show Top'
                    icon={ShowTop}
                />
            </div>
        </>
    )

    const [genders,setGenders]=useState<any[]>([]);
    const [gender,setGender]=useState<any>();

    const [firstLanguages,setFirstLanguages]=useState<any[]>([]);
    const [firstLanguage,setFirstLanguage]=useState<any>();

    const [religions,setReligions]=useState<any[]>([]);
    const [religion,setReligion]=useState<any>();

    const [enthnicities,setEnthnicities]=useState<any[]>([]);
    const [enthnicity,setEnthnicity]=useState<any>();

    const [postcodes,setPostcodes]=useState<any[]>([]);
    const [postcode,setpostcode]=useState<any>();

    const [freeMeals,setFreeMeals]=useState<any[]>([]);
    const [freeMeal,setFreeMeal]=useState<any>();

    const [eals,setEals]=useState<any[]>([]);
    const [eal,setEal]=useState<any>();

    const [inCares,setInCares]=useState<any[]>([]);
    const [inCare,setInCare]=useState<any>();

    const [pupilPremiums,setPupilPremiums]=useState<any[]>([]);
    const [pupilPremium,setPupilPremium]=useState<any>();

    const context=(
        <>
            <div className="inputs-div" style={{height:100}}>
                <Select
                    name='genders'
                    options={genders}
                    value={gender}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setGender(e.target.value)}}
                    label='Gender'
                    icon={Gender}
                />

                <Select
                    name='firstLanguage'
                    options={firstLanguages}
                    value={firstLanguage}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setFirstLanguage(e.target.value)}}
                    label='First Language'
                    icon={FirstLanguage}
                />

                <Select
                    name='religion'
                    options={religions}
                    value={religion}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setReligion(e.target.value)}}
                    label='Religion'
                    icon={Religion}
                />
            </div>

            <div className="inputs-div" style={{height:100}}>
                <Select
                    name='ethnicity'
                    options={enthnicities}
                    value={enthnicity}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setEnthnicity(e.target.value)}}
                    label='Ethnicity'
                    icon={Ethnicity}
                />

                <Select
                    name='postcode'
                    options={postcodes}
                    value={postcode}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setpostcode(e.target.value)}}
                    label='Postcode'
                    icon={Postcode}
                />

                <Select
                    name='freeMeal'
                    options={freeMeals}
                    value={freeMeal}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setFreeMeal(e.target.value)}}
                    label='Free Meal'
                    icon={FreeMeals}
                />
            </div>

            <div className="inputs-div" style={{height:100}}>
                <Select
                    name='eal'
                    options={eals}
                    value={eal}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setEal(e.target.value)}}
                    label='EAL'
                    icon={EAL}
                />

                <Select
                    name='inCare'
                    options={inCares}
                    value={inCare}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setInCare(e.target.value)}}
                    label='In Care'
                    icon={InCare}
                />

                <Select
                    name='pupilPremium'
                    options={pupilPremiums}
                    value={pupilPremium}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setPupilPremium(e.target.value)}}
                    label='Pupil Premium'
                    icon={PupilPremium}
                />
            </div>
        </>
    )

    const [slips,setSlips]=useState<any[]>([]);
    const [slip,setSlip]=useState<any>();

    const [positivites,setPositivites]=useState<any[]>([]);
    const [positivity,setPositivity]=useState<any>();

    const [fields,setFields]=useState<any[]>([]);
    const [field,setField]=useState<any>();

    const [categories,setCategories]=useState<any[]>([]);
    const [category,setCategory]=useState<any>();

    
    const elements=(
        <>
            <div className="inputs-div" style={{height:100}}>
                <Select
                    name='slip'
                    options={slips}
                    value={slip}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setSlip(e.target.value)}}
                    label='Slip'
                    icon={Slip}
                />

                <Select
                    name='positivity'
                    options={positivites}
                    value={positivity}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setPositivity(e.target.value)}}
                    label='Positivity'
                    icon={Positivity}
                />

                <Select
                    name='field'
                    options={fields}
                    value={field}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setField(e.target.value)}}
                    label='Field'
                    icon={Field}
                />
            </div>

            <div className="inputs-div" style={{height:100}}>
                <Select
                    name='category'
                    options={categories}
                    value={category}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setCategory(e.target.value)}}
                    label='Category'
                    icon={Category}
                />
                <div className='empty-input-div'></div>
                <div className='empty-input-div'></div>
            </div>

        </>
    )

    const [printeds,setPrinteds]=useState<any[]>([])
    const [printed,setPrinted]=useState<any>()

    const [origins,setOrigins]=useState<any[]>([])
    const [origin,setOrigin]=useState<any>()

    const [detentions,setDetentions]=useState<any[]>([])
    const [detention,setDetention]=useState<any>()

    const [shows,setShows]=useState<any[]>([])
    const [showValue,setShowValue]=useState<any>()

    const [admissions,setAdmissions]=useState<any[]>([])
    const [admission,setAdmission]=useState<any>()

    const [statuses,setStatuses]=useState<any[]>([])
    const [status,setStatus]=useState<any>()


    const tracking=(
        <>
            <div className="inputs-div" style={{height:100}}>
                <Select
                    name='printed'
                    options={printeds}
                    value={printed}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setPrinted(e.target.value)}}
                    label='Printed'
                    icon={Printed}
                />

                <Select
                    name='origin'
                    options={origins}
                    value={origin}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setOrigin(e.target.value)}}
                    label='Origin'
                    icon={Origin}
                />

                <Select
                    name='detention'
                    options={detentions}
                    value={detention}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setDetention(e.target.value)}}
                    label='Detention'
                    icon={Detention}
                />
            </div>
            <div className="inputs-div" style={{height:100}}>
                <Select
                    name='show'
                    options={shows}
                    value={showValue}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setShowValue(e.target.value)}}
                    label='Show'
                    icon={Show}
                />
                <Select
                    name='admission'
                    options={admissions}
                    value={admission}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setAdmission(e.target.value)}}
                    label='Admission'
                    icon={Admission}
                />
                <Select
                    name='status'
                    options={statuses}
                    value={status}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setStatus(e.target.value)}}
                    label='Status'
                    icon={Status}
                />
            </div>
        </>
    )

    const [locations,setLocations]=useState<any[]>([])
    const [location,setLocation]=useState<any>()

    const [periods,setPeriods]=useState<any[]>([])
    const [period,setPeriod]=useState<any>()


    const timeTable=(
        <>
            <Select
                name='location'
                options={locations}
                value={location}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setLocation(e.target.value)}}
                label='Location'
                icon={Location}
            />

            <Select
                name='period'
                options={periods}
                value={period}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setPeriod(e.target.value)}}
                label='Period'
                icon={Period}
            />  
        </>
    )

    const [senStatuses,setSenStatuses]=useState<any[]>([])
    const [senStatus,setSenStatus]=useState<any>()

    const [senTypes,setSenTypes]=useState<any[]>([])
    const [senType,setSenType]=useState<any>()


    const sen=(
        <>
            <Select
                name='senStatus'
                options={senStatuses}
                value={senStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setSenStatus(e.target.value)}}
                label='SEN Status'
                icon={SENStatus}
            />

            <Select
                name='senType'
                options={senTypes}
                value={senType}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setSenType(e.target.value)}}
                label='SEN Type'
                icon={SENType}
            />  
        </>
    )

    const [fors,setFors]=useState<any[]>([])
    const [forVar,setForVar]=useState<any>()


    const when=(
        <>
            <Select
                name='for'
                options={fors}
                value={forVar}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setForVar(e.target.value)}}
                label='For'
                icon={For}
            />
        </>
    )

    const [broaderStatuses,setbroaderStatuses]=useState<any[]>([])
    const [broaderStatus,setBroaderStatus]=useState<any>()


    const broader=(
        <>
            <Select
                name='broader'
                options={broaderStatuses}
                value={broaderStatus}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setBroaderStatus(e.target.value)}}
                label='Broder Status'
                icon={BroaderStatus}
            />
        </>
    )

    const [reportNames,setReportNames]=useState<any[]>([])
    const [reportName,setreportName]=useState<any>()
    

    const save=(
        <>
            <div className="inputs-div" style={{height:100}}>
                <div className="single-input-div">
                    <Select
                        name='reportName'
                        options={reportNames}
                        value={reportName}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setreportName(e.target.value)}}
                        label='Report Name'
                        icon={ReportName}
                    />
                </div>
                <div className="filter-save-btns">
                    <div className='btns' style={{ marginTop: 50,marginLeft:50 }}>
                        <div className="btns-container" style={{width:'100%'}}>
                            <button type="button" className='cancel-btn'>Savev As</button>
                            <button  className='save-btn'>Save</button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )


    const safeguardFilters=(
        <>
            <FilterSec
                secName='Those Involved'
                content={thoseInvolved}
            />
            <FilterSec
                secName='Grouping'
                content={grouping}
            />
            <FilterSec
                secName='Show'
                content={show}
            />
            <FilterSec
                secName='Context'
                content={context}
            />
            <FilterSec
                secName='Elements'
                content={elements}
            />
            <FilterSec
                secName='Tracking'
                content={tracking}
            />
            <div className="two-fsecs">
                <div className="small-fsec">
                    <FilterSec
                        secName='TimeTable'
                        content={timeTable}
                    />
                </div>
                <div className="small-fsec">
                <FilterSec
                    secName='SEN'
                    content={sen}
                />
                </div>
            </div>
            <div className="two-fsecs">
                <div className="small-fsec">
                    <FilterSec
                        secName='When'
                        content={when}
                    />
                </div>
                <div className="small-fsec">
                <FilterSec
                    secName='Broader'
                    content={broader}
                />
                </div>
            </div>
            <FilterSec
                secName='Save & Load'
                content={save}
            />
        </>
    )
    // -------------------------END OF FILTERS-----------------------------------------

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
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setStudent(e.target.value)}}
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
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setStaff(e.target.value)}}
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
        </div> 
        </>
    )
    const handleSave = async () => {
        try {
            const formData = new FormData();
            formData.append('student', student);
            formData.append('staff', staff);
            formData.append('status', status);
            formData.append('location', location);
            // formData.append('dateAndTime', `${doi}T${toi}`);
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
        
        setRsStudent(incident.data.student._id)
        setRsStaff(incident.data.staff._id)
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
    
    const [openFilter,setOpenFilter]=useState<boolean>(false)
    // const [selectedSafeguard,setSelectedSafeguard]=useState<safeguard|null>(null)
    const [openRS,setOpenRS]=useState<boolean>(false)

    

    return (
        <>
            <Layout
                heading='Incident Management'
                note='Log Track, & Resolve Student Incidents With Ease.'
                showNew={true}
                showPagination={true}
                showFilter={true}
                showViewType={true}
                createLink='/incidents/add'
                view={view}
                changeView={()=>{ setView((prev) => (prev === 'table' ? 'component' : 'table'))}}
                openFilters={openFilter}
                filters={safeguardFilters}
                filtersBtnClicked={()=>setOpenFilter((prev)=>(!prev))}
            >
                <div>
                    {view=='table'&&(
                        <DataTable
                            columns={Columns}
                            data={incidents}
                            title=''
                            onEdit={()=>{}}
                            onDelete={()=>{}}
                            showActions={false}
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