import React, { useState, useEffect, useRef } from 'react';
import Layout from '../../../layouts/layout';
// import api from '../../../services/api';
import Select from '../../../components/Select/Select';
import SearchableMultiSelect, { SearchableMultiSelectOption } from '../../../components/SearchableMultiSelect/SearchableMultiSelect';
import Student from '../../../assets/safeguarding/student.svg';
import Staff from '../../../assets/safeguarding/staff.svg';
import Status from '../../../assets/safeguarding/status.svg';
import Location from '../../../assets/safeguarding/location.svg';
import Calender from '../../../assets/safeguarding/calendar.svg';
import Clock from '../../../assets/safeguarding/clock.svg';
import Description from '../../../assets/safeguarding/description.svg'
// import Commentary from '../../../assets/safeguarding/commentary.svg'
// import Clip from '../../../assets/safeguarding/clip.svg'
import './new.scss'
import Input from '../../../components/input/Input';
import TextField from '../../../components/textField/TextField';
// import ContentBox from '../../../components/contentBox/ContentBox';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAdd, faChevronDown, faDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import { useApiRequest } from '../../../hooks/useApiRequest';
import api from '../../../services/api';
import { useLocation,useParams, useNavigate } from 'react-router-dom';
// import BodyMapComponent from '../../../components/safeguarding/bodyMap/bodyMap';
import BodyMapWithSeverity, { SeverityLevel } from '../../../components/safeguarding/bodyMap/bodyMapWithSeverity';
import DateInput from '../../../components/dateInput/DateInput';
import { Tabs } from '../../../components/Tabs/Tabs';
import MultiSelect from '../../../components/MultiSelect/MultiSelect';

export interface NewIncidentProps {
    /** When true, render only the form (no Layout). Used when embedded in incidents index tab. */
    embedded?: boolean;
    /** Called after successful create when embedded. Use to switch tab and refresh list. */
    onSaved?: () => void;
}

const New = ({ embedded = false, onSaved }: NewIncidentProps) => {
    const navigate = useNavigate();
    const [studentOptions, setStudentOptions] = useState<SearchableMultiSelectOption[]>([]);
    const [students, setStudents] = useState<string[]>([]);

    const [staffOptions, setStaffOptions] = useState<SearchableMultiSelectOption[]>([]);
    const [staff, setStaff] = useState<string[]>([]);

    const [statuses]=useState<any[]>([{value:'1',label:'Open'},{value:'0',label:'Close'}])
    const [status,setStatus]=useState<any>()

    const locationOptions = [
        { value: 'Warrington', label: 'Warrington' },
        { value: 'Bury', label: 'Bury' },
        {value:'off site',label:'Off site'}
    ];
    const [location, setLocation] = useState<string>('');

    const [doi,setDoi]=useState<string>('')

    const [toi,setToi]=useState<string>('')


    const [description,setDescription]=useState<string>('')
    const [descriptionFiles, setDescriptionFiles] = useState<File[]>([]);
    const [filePreviewUrls, setFilePreviewUrls] = useState<string[]>([]);
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [existingDescriptionFiles, setExistingDescriptionFiles] = useState<{ fileName: string; filePath: string; fileType?: string; fileSize?: number }[]>([]);
    const [existingDescriptionImageUrls, setExistingDescriptionImageUrls] = useState<(string | null)[]>([]);
    const [selectedExistingImageIndex, setSelectedExistingImageIndex] = useState<number | null>(null);

    const [physicalInterventionUsed, setPhysicalInterventionUsed] = useState<boolean>(false);
    const [restrainDescription, setRestrainDescription] = useState<string>('');
    const [restrainFiles, setRestrainFiles] = useState<File[]>([]);
    const [restrainFilePreviewUrls, setRestrainFilePreviewUrls] = useState<string[]>([]);
    const [restrainSelectedImageIndex, setRestrainSelectedImageIndex] = useState<number | null>(null);
    const [existingRestrainFiles, setExistingRestrainFiles] = useState<{ fileName: string; filePath: string; fileType?: string; fileSize?: number }[]>([]);
    const [existingRestrainImageUrls, setExistingRestrainImageUrls] = useState<(string | null)[]>([]);
    const [selectedExistingRestrainImageIndex, setSelectedExistingRestrainImageIndex] = useState<number | null>(null);

    const [severity, setSeverity] = useState<number>(1);
    const [severityDropdownOpen, setSeverityDropdownOpen] = useState(false);
    const severityDropdownRef = useRef<HTMLDivElement>(null);
    const [idt,setIdt]=useState<string>('');
    const [behaviour,setBehavior]=useState<string>('');
    const { executeRequest, loading } = useApiRequest();
    const saveInProgressRef = useRef(false);
    const [file, setFile] = useState<File | undefined>(undefined);
    const [concernTypes, setConcernTypes] = useState<string[]>([]);
    const [accountChecks, setAccountChecks] = useState<string[]>([]);
    const [bodyMapFrontMarkers, setBodyMapFrontMarkers] = useState<Record<string, number>>({});
    const [bodyMapBackMarkers, setBodyMapBackMarkers] = useState<Record<string, number>>({});
    const [bodyMapDescriptions, setBodyMapDescriptions] = useState<Record<string, string>>({});
    const [activeBodyMapRegion, setActiveBodyMapRegion] = useState<{ view: 'front' | 'back'; regionId: string } | null>(null);
    const [bodyMap, setBodyMap] = useState(false);
    const [socialCare, setSocialCare] = useState<string[]>([]);
    const [socialCareOthersDescription, setSocialCareOthersDescription] = useState<string>('');
    const [actionChecks, setActionChecks] = useState<string[]>([]);
    const [actionDescription, setActionDescription] = useState<string>('');
    const [actionOthersDescription, setActionOthersDescription] = useState<string>('');
    const [exclusionChecks, setExclusionChecks] = useState<string[]>([]);
    const [exclusionOthersDescription, setExclusionOthersDescription] = useState<string>('');
    const [refferal, setRefferal] = useState<string[]>([]);
    const [referralOthersDescription, setReferralOthersDescription] = useState<string>('');
    const [attachment, setAttachment] = useState<boolean>(false);

    interface meeting{
        haveDate:boolean,
        date?:Date,
        havePersons:boolean,
        persons?:string,
        haveNotes:boolean,
        notes?:string,
        attachmentFile?: File,
        fileName?: string,
        filePath?: string,
        fileType?: string,
        fileSize?: number
    }
    const [meetings, setMeetings] = useState<meeting[]>([{haveDate:false, havePersons:false, haveNotes:false}]);
    const [conclusion, setConclusion] = useState<string[]>([]);

    // Incident Directed towards (multiselect)
    const DIRECTED_TOWARDS_OPTIONS = [
        { value: 'student', label: 'Student' },
        { value: 'staff', label: 'Staff' },
        { value: 'visitor_public', label: 'Visitor / public' },
        { value: 'unknown', label: 'Unknown' },
        { value: 'parent', label: 'Parent' },
        { value: 'carer', label: 'Carer' },
        { value: 'property', label: 'Property' },
        { value: 'self', label: 'Self' },
        { value: 'none_of_above', label: 'None of above' },
    ];
    const [directedTowards, setDirectedTowards] = useState<string[]>([]);
    const [involved, setInvolved] = useState<string[]>([]);

    const [activeTab, setActiveTab] = useState<string>('details');
    const url = useLocation();
    const { id } = useParams();
    const isEditMode = !embedded && Boolean(id);

    const SEVERITY_OPTIONS = [
        { value: 1, color: 'green' },
        { value: 2, color: 'orange' },
        { value: 3, color: 'red' },
    ] as const;
    const parseSeverity = (v: unknown): number => {
        const n = Number(v);
        return Number.isInteger(n) && n >= 1 && n <= 3 ? n : 1;
    };
    const severityColor = SEVERITY_OPTIONS.find((o) => o.value === severity)?.color ?? 'green';

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (severityDropdownRef.current && !severityDropdownRef.current.contains(e.target as Node)) {
                setSeverityDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isImageFile = (file: File) => file.type.startsWith('image/');
    const isExistingFileImage = (f: { fileName: string; fileType?: string }) =>
        (f.fileType && f.fileType.startsWith('image/')) || /\.(jpg|jpeg|png|gif|webp|bmp)(\?|$)/i.test(f.fileName || '');

    useEffect(() => {
        const urls = descriptionFiles.map((f) => URL.createObjectURL(f));
        setFilePreviewUrls(urls);
        return () => {
            urls.forEach((u) => URL.revokeObjectURL(u));
        };
    }, [descriptionFiles]);

    useEffect(() => {
        const urls = restrainFiles.map((f) => URL.createObjectURL(f));
        setRestrainFilePreviewUrls(urls);
        return () => {
            urls.forEach((u) => URL.revokeObjectURL(u));
        };
    }, [restrainFiles]);

    // Fetch blob URLs for existing description files that are images (for viewer)
    useEffect(() => {
        if (!id || existingDescriptionFiles.length === 0) {
            setExistingDescriptionImageUrls([]);
            return;
        }
        const urls: (string | null)[] = new Array(existingDescriptionFiles.length).fill(null);
        const createdUrls: string[] = [];
        let cancelled = false;
        const load = async () => {
            for (let i = 0; i < existingDescriptionFiles.length; i++) {
                if (cancelled) break;
                const f = existingDescriptionFiles[i];
                if (!isExistingFileImage(f)) continue;
                try {
                    const res = await api.get(`/incidents/${id}/description-files/${i}`, { responseType: 'blob' });
                    if (cancelled) return;
                    const blobUrl = URL.createObjectURL(res.data as Blob);
                    urls[i] = blobUrl;
                    createdUrls.push(blobUrl);
                } catch {
                    // leave null
                }
            }
            if (!cancelled) setExistingDescriptionImageUrls([...urls]);
        };
        load();
        return () => {
            cancelled = true;
            createdUrls.forEach((u) => URL.revokeObjectURL(u));
        };
    }, [id, existingDescriptionFiles]);

    // Fetch blob URLs for existing restrain files that are images (for viewer)
    useEffect(() => {
        if (!id || existingRestrainFiles.length === 0) {
            setExistingRestrainImageUrls([]);
            return;
        }
        const urls: (string | null)[] = new Array(existingRestrainFiles.length).fill(null);
        const createdUrls: string[] = [];
        let cancelled = false;
        const load = async () => {
            for (let i = 0; i < existingRestrainFiles.length; i++) {
                if (cancelled) break;
                const f = existingRestrainFiles[i];
                if (!isExistingFileImage(f)) continue;
                try {
                    const res = await api.get(`/incidents/${id}/restrain-files/${i}`, { responseType: 'blob' });
                    if (cancelled) return;
                    const blobUrl = URL.createObjectURL(res.data as Blob);
                    urls[i] = blobUrl;
                    createdUrls.push(blobUrl);
                } catch {
                    // leave null
                }
            }
            if (!cancelled) setExistingRestrainImageUrls([...urls]);
        };
        load();
        return () => {
            cancelled = true;
            createdUrls.forEach((u) => URL.revokeObjectURL(u));
        };
    }, [id, existingRestrainFiles]);

    // Student display: "first name . last name"
    const getStudentDisplayName = (s: { name?: string; personalInfo?: { legalFirstName?: string; lastName?: string }; _id?: string }) => {
        if (!s) return '';
        const p = s.personalInfo || {};
        const first = (p.legalFirstName || '').trim();
        const last = (p.lastName || '').trim();
        if (first || last) return [first, last].filter(Boolean).join(' . ');
        return (s.name || '').trim() || 'Unknown';
    };
    const studentOptionLabel = (s: { _id: string; personalInfo?: { legalFirstName?: string; lastName?: string; location?: string; yearGroup?: string } }) => {
        const p = s.personalInfo || {};
        const first = (p.legalFirstName || '').trim();
        const last = (p.lastName || '').trim();
        const loc = (p.location || '').trim();
        const yg = (p.yearGroup || '').trim();
        return [first, last, loc, yg].filter(Boolean).join('. ');
    };

    const fetchStudentOptions = async (search: string) => {
        try {
            const res = await executeRequest('get', `/students?perPage=20&page=1&search=${encodeURIComponent(search)}`, undefined, { silent: true });
            const list = Array.isArray(res) ? res : [];
            const fromApi: SearchableMultiSelectOption[] = list.map((s: { _id: string; personalInfo?: { legalFirstName?: string; lastName?: string; location?: string; yearGroup?: string } }) => ({
                value: s._id,
                label: studentOptionLabel(s) || 'Unknown',
            }));
            setStudentOptions((prev) => {
                const selectedSet = new Set(students.map(String));
                const keepFromPrev = prev.filter((o) => selectedSet.has(String(o.value)));
                const combined = [...fromApi];
                for (const o of keepFromPrev) {
                    if (!combined.some((c) => String(c.value) === String(o.value))) combined.push(o);
                }
                return combined;
            });
        } catch {
            setStudentOptions([]);
        }
    };

    // Staff option label: "first name. last name. location"
    const staffOptionLabel = (u: { _id: string; name?: string; profile?: { firstName?: string; lastName?: string; workLocation?: string } }) => {
        const p = u.profile || {};
        const first = (p.firstName || '').trim();
        const last = (p.lastName || '').trim();
        const loc = (p.workLocation || '').trim();
        if (first || last || loc) return [first, last, loc].filter(Boolean).join('. ');
        return (u.name || '').trim() || 'Unknown';
    };

    const fetchStaffOptions = async (search: string) => {
        try {
            const res = await executeRequest('get', `/users/staff/search?perPage=20&page=1&search=${encodeURIComponent(search)}`, undefined, { silent: true });
            const list = Array.isArray(res) ? res : [];
            const fromApi: SearchableMultiSelectOption[] = list.map((u: { _id: string; name?: string; profile?: { firstName?: string; lastName?: string; workLocation?: string } }) => ({
                value: u._id,
                label: staffOptionLabel(u),
            }));
            setStaffOptions((prev) => {
                const selectedSet = new Set(staff.map(String));
                const keepFromPrev = prev.filter((o) => selectedSet.has(String(o.value)));
                const combined = [...fromApi];
                for (const o of keepFromPrev) {
                    if (!combined.some((c) => String(c.value) === String(o.value))) combined.push(o);
                }
                return combined;
            });
        } catch {
            setStaffOptions([]);
        }
    };

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
    const handleDescriptionFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setDescriptionFiles((prev) => [...prev, ...Array.from(files)]);
        }
        e.target.value = '';
        setSelectedImageIndex(null);
    };
    const handleRestrainFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            setRestrainFiles((prev) => [...prev, ...Array.from(files)]);
        }
        e.target.value = '';
        setRestrainSelectedImageIndex(null);
    };
    const removeDescriptionFile = (index: number) => {
        setDescriptionFiles((prev) => prev.filter((_, i) => i !== index));
        if (selectedImageIndex === index) setSelectedImageIndex(null);
        else if (selectedImageIndex !== null && selectedImageIndex > index) setSelectedImageIndex(selectedImageIndex - 1);
    };
    const removeRestrainFile = (index: number) => {
        setRestrainFiles((prev) => prev.filter((_, i) => i !== index));
        if (restrainSelectedImageIndex === index) setRestrainSelectedImageIndex(null);
        else if (restrainSelectedImageIndex !== null && restrainSelectedImageIndex > index) setRestrainSelectedImageIndex(restrainSelectedImageIndex - 1);
    };
    const handleDownloadFile = (file: File, url: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = file.name;
        a.click();
    };
    const downloadExistingDescriptionFile = async (index: number) => {
        if (!id) return;
        try {
            const res = await api.get(`/incidents/${id}/description-files/${index}`, { responseType: 'blob' });
            const f = existingDescriptionFiles[index];
            const fileName = f?.fileName ?? 'download';
            const url = URL.createObjectURL(res.data as Blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert('Error downloading file');
        }
    };
    const downloadExistingRestrainFile = async (index: number) => {
        if (!id) return;
        try {
            const res = await api.get(`/incidents/${id}/restrain-files/${index}`, { responseType: 'blob' });
            const f = existingRestrainFiles[index];
            const fileName = f?.fileName ?? 'download';
            const url = URL.createObjectURL(res.data as Blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert('Error downloading file');
        }
    };
    const downloadNoteFile = async (noteIndex: number) => {
        if (!id) return;
        const meeting = meetings[noteIndex];
        if (!meeting?.fileName) return;
        try {
            const res = await api.get(`/incidents/${id}/note-files/${noteIndex}`, { responseType: 'blob' });
            const url = URL.createObjectURL(res.data as Blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = meeting.fileName;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert('Error downloading file');
        }
    };
    const handleBodyMapRegionClick = (view: 'front' | 'back', regionId: string) => {
        setActiveBodyMapRegion({ view, regionId });
    };
    const handleBodyMapSeveritySelect = (view: 'front' | 'back', regionId: string, severity: SeverityLevel) => {
        if (view === 'front') {
            setBodyMapFrontMarkers((prev) => ({ ...prev, [regionId]: severity }));
        } else {
            setBodyMapBackMarkers((prev) => ({ ...prev, [regionId]: severity }));
        }
        setActiveBodyMapRegion(null);
    };
    // Save handler
    const handleSave = async () => {
        if (saveInProgressRef.current) return;
        saveInProgressRef.current = true;
        try {
            const formData = new FormData();
            formData.append('students', JSON.stringify(students));
            formData.append('staff', JSON.stringify(staff));
            formData.append('status', status);
            formData.append('location', location);
            formData.append('dateAndTime', `${doi}T${toi}`);
            formData.append('description', description);
            formData.append('commentary[severity]', String(severity));
            formData.append('commentary[direction]', idt);
            formData.append('commentary[behavior]', behaviour);
            formData.append('type', JSON.stringify(concernTypes));
            formData.append('your_account', JSON.stringify(accountChecks));
            formData.append('body_mapping', String(bodyMap));
            formData.append('bodyMapFrontMarkers', JSON.stringify(bodyMapFrontMarkers));
            formData.append('bodyMapBackMarkers', JSON.stringify(bodyMapBackMarkers));
            formData.append('bodyMapDescriptions', JSON.stringify(bodyMapDescriptions));
            formData.append('early_help', JSON.stringify(socialCare));
            formData.append('earlyHelpOthersDescription', socialCareOthersDescription);
            formData.append('referral_type', JSON.stringify(refferal));
            formData.append('referralOthersDescription', referralOthersDescription);
            formData.append('action', JSON.stringify(actionChecks));
            formData.append('actionDescription', actionDescription);
            formData.append('actionOthersDescription', actionOthersDescription);
            formData.append('exclusion', JSON.stringify(exclusionChecks));
            formData.append('exclusionOthersDescription', exclusionOthersDescription);
            if (file) formData.append('file', file);
            descriptionFiles.forEach((f) => formData.append('descriptionFiles', f));
            formData.append('physicalInterventionUsed', String(physicalInterventionUsed));
            formData.append('restrainDescription', restrainDescription);
            restrainFiles.forEach((f) => formData.append('restrainFiles', f));
            const meetingsForSubmit = meetings.map(({ attachmentFile: _omit, ...m }) => m);
            formData.append('meetings', JSON.stringify(meetingsForSubmit));
            meetings.forEach((m) => {
                if (m.attachmentFile) formData.append('noteFiles', m.attachmentFile);
            });
            formData.append('conclusion', JSON.stringify(conclusion));
            formData.append('directedToward', JSON.stringify(directedTowards));
            formData.append('involved', JSON.stringify(involved));
            const url = isEditMode ? `/incidents/${id}` : '/incidents';
            const method = isEditMode ? 'patch' : 'post';
            await executeRequest(method, url, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
            if (embedded && onSaved) onSaved();
            else navigate('/incidents');
            // alert('Safeguard saved successfully');
        } catch {
            alert('Error saving safeguard');
        } finally {
            saveInProgressRef.current = false;
        }
    };
    // Cancel handler
    const handleCancel = () => {
        setStudents([]);
        setStaff([]);
        setStatus('');
        setLocation('');
        setDoi('');
        setToi('');
        setDescription('');
        setSeverity(1);
        setDescriptionFiles([]);
        setExistingDescriptionFiles([]);
        setPhysicalInterventionUsed(false);
        setRestrainDescription('');
        setRestrainFiles([]);
        setExistingRestrainFiles([]);
        setIdt('');
        setBehavior('');
        setFile(undefined);
        setConcernTypes([]);
        setAccountChecks([]);
        setBodyMapFrontMarkers({});
        setBodyMapBackMarkers({});
        setBodyMapDescriptions({});
        setActiveBodyMapRegion(null);
        setBodyMap(false);
        setSocialCare([]);
        setSocialCareOthersDescription('');
        setReferralOthersDescription('');
        setActionChecks([]);
        setActionDescription('');
        setActionOthersDescription('');
        setExclusionChecks([]);
        setExclusionOthersDescription('');
        setDirectedTowards([]);
        setInvolved([]);
    };

    const openIncident=async(incident:any)=>{
        // Basic Details: students and staff (arrays), with backward compat for single student/staff
        const studentsList = Array.isArray(incident.students) ? incident.students : (incident.student ? [incident.student] : []);
        const staffList = Array.isArray(incident.staffList) ? incident.staffList : (incident.staff ? [incident.staff] : []);
        const studentIds = studentsList.map((s: { _id?: string }) => s._id ?? s);
        const staffIds = staffList.map((s: { _id?: string }) => s._id ?? s);
        setStudents(studentIds);
        setStaff(staffIds);
        setStudentOptions(studentsList.map((s: { _id?: string; personalInfo?: { legalFirstName?: string; lastName?: string }; name?: string }) => ({
            value: s._id ?? s,
            label: getStudentDisplayName(s) || 'Unknown',
        })));
        setStaffOptions(staffList.map((s: { _id?: string; name?: string; profile?: { firstName?: string; lastName?: string; workLocation?: string } }) => ({
            value: (s._id ?? s) as string,
            label: staffOptionLabel({ _id: String(s._id ?? s), name: s?.name, profile: s?.profile }) || s?.name || 'Unknown',
        })));
        setStatus(incident.status === true || incident.status === '1' ? '1' : '0');
        setLocation(incident.location ?? '');
        if (incident.dateAndTime) {
            const d = new Date(incident.dateAndTime);
            if (!isNaN(d.getTime())) {
                setDoi(d.toISOString().slice(0, 10));
                setToi(d.toISOString().slice(11, 16));
            }
        }
        setDirectedTowards(Array.isArray(incident.directedToward) ? incident.directedToward : []);
        setInvolved(Array.isArray(incident.involved) ? incident.involved : []);

        // Description & Commentary
        setDescription(incident.description ?? '');
        setSeverity(parseSeverity(incident.commentary?.severity));
        setIdt(incident.commentary?.direction ?? '');
        setBehavior(incident.commentary?.behavior ?? incident.commentary?.behaviour ?? '');

        // Type & Account
        setConcernTypes(Array.isArray(incident.type) ? incident.type : []);
        setAccountChecks(Array.isArray(incident.your_account) ? incident.your_account : []);
        setBodyMap(Boolean(incident.body_mapping));
        setBodyMapFrontMarkers(typeof incident.bodyMapFrontMarkers === 'object' && incident.bodyMapFrontMarkers !== null ? incident.bodyMapFrontMarkers : {});
        setBodyMapBackMarkers(typeof incident.bodyMapBackMarkers === 'object' && incident.bodyMapBackMarkers !== null ? incident.bodyMapBackMarkers : {});
        setBodyMapDescriptions(typeof incident.bodyMapDescriptions === 'object' && incident.bodyMapDescriptions !== null ? incident.bodyMapDescriptions : {});

        // Restrain
        setPhysicalInterventionUsed(Boolean(incident.physicalInterventionUsed));
        setRestrainDescription(incident.restrainDescription ?? '');

        // Action
        setActionChecks(Array.isArray(incident.action) ? incident.action : []);
        setActionDescription(incident.actionDescription ?? '');
        setActionOthersDescription(incident.actionOthersDescription ?? '');
        setExclusionChecks(Array.isArray(incident.exclusion) ? incident.exclusion : []);
        setExclusionOthersDescription(incident.exclusionOthersDescription ?? '');

        // Social Care & Referral
        setSocialCare(Array.isArray(incident.early_help) ? incident.early_help : []);
        setSocialCareOthersDescription(incident.earlyHelpOthersDescription ?? '');
        setRefferal(Array.isArray(incident.referral_type) ? incident.referral_type : []);
        setReferralOthersDescription(incident.referralOthersDescription ?? '');

        // Meetings, Conclusion
        setMeetings(Array.isArray(incident.meetings) ? (incident.meetings as meeting[]).map((m: meeting) => ({ ...m, attachmentFile: undefined })) : [{ haveDate: false, havePersons: false, haveNotes: false }]);
        setConclusion(Array.isArray(incident.conclusion) ? incident.conclusion : []);

        // Existing attached files (from server)
        setExistingDescriptionFiles(Array.isArray(incident.descriptionFiles) ? incident.descriptionFiles : []);
        setExistingRestrainFiles(Array.isArray(incident.restrainFiles) ? incident.restrainFiles : []);
    }
    const getIncident=async ()=>{
        const address = '/incidents/'+id;
        const method = 'get';
        const res=await executeRequest(method, address);
        openIncident(res)
    }
    useEffect(() => {
        fetchStudentOptions('');
        fetchStaffOptions('');
        if (!embedded && url.pathname.includes('incident')) {
            getIncident();
            return;
        }
        if (url.pathname.includes('add')) {
            return;
        }
    }, [embedded, url.pathname]);

    const tabs = [
        {
            id: 'details',
            label: 'Details',
            content: (
                <div className="tab-content">
                    <div className="form-section">
                        <div className="form-heading">
                            <h2>Details</h2>
                        </div>
                        <div className="form-row">
                            <SearchableMultiSelect
                                name="students"
                                value={students}
                                onChange={(v) => setStudents(v as string[])}
                                options={studentOptions}
                                onSearch={fetchStudentOptions}
                                label="Students"
                                placeholder="Search by name..."
                                icon={Student}
                            />
                            <SearchableMultiSelect
                                name="staff"
                                value={staff}
                                onChange={(v) => setStaff(v as string[])}
                                options={staffOptions}
                                onSearch={fetchStaffOptions}
                                label="Staff"
                                placeholder="Search by name..."
                                icon={Staff}
                            />
                            <Select
                                name="status"
                                value={status}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setStatus(e.target.value)}}
                                options={statuses}
                                label="Status"
                                placeholder="Select..."
                                icon={Status}
                            />
                            <MultiSelect
                                name="involved"
                                label="Involved"
                                value={involved}
                                onChange={setInvolved}
                                options={DIRECTED_TOWARDS_OPTIONS}
                                placeholder="Select..."
                            />
                            <Select
                                key={'location'}
                                name="location"
                                value={location}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>)=>{setLocation(e.target.value)}}
                                options={locationOptions}
                                label="Location"
                                placeholder="Select..."
                                icon={Location}
                            />
                            <DateInput
                                name='doi'
                                onChange={(e: React.ChangeEvent<HTMLInputElement>)=>{setDoi(e.target.value)}}
                                value={doi}
                                label='Date of incident'
                                icon={Calender}
                                labelFont={15}
                            />
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
                        <div className="incident-directed-section">
                            <div className="form-heading">
                                <h2>Incident Directed towards</h2>
                            </div>
                            <div className="incident-directed-row">
                                <div className="incident-directed-input-wrap">
                                    <MultiSelect
                                        name="directedTowards"
                                        label="Incident Directed towards"
                                        value={directedTowards}
                                        onChange={setDirectedTowards}
                                        options={DIRECTED_TOWARDS_OPTIONS}
                                        placeholder="Select..."
                                    />
                                </div>
                                <div className="comentary-input-div severity-in-basic" ref={severityDropdownRef}>
                                    <label className="severity-label">Level Of Severity</label>
                                    <div
                                        className="severity-dropdown-trigger"
                                        onClick={() => setSeverityDropdownOpen(!severityDropdownOpen)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setSeverityDropdownOpen((v) => !v); }}
                                    >
                                        <span className={`severity-ball severity-ball--${severityColor}`} title={severityColor} />
                                    </div>
                                    {severityDropdownOpen && (
                                        <div className="severity-dropdown">
                                            {SEVERITY_OPTIONS.map((opt) => (
                                                <button
                                                    key={opt.value}
                                                    type="button"
                                                    className={`severity-dropdown-option ${severity === opt.value ? 'selected' : ''}`}
                                                    onClick={() => { setSeverity(opt.value); setSeverityDropdownOpen(false); }}
                                                >
                                                    <span className={`severity-ball severity-ball--${opt.color}`} />
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="form-section">
                            <div className="form-heading" style={{ marginBottom: '0rem' }}>
                                <h2>Description</h2>
                            </div>
                            <div className="description">
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
                                        <label className="custom-checkbox">
                                            <input type="checkbox" checked={concernTypes.includes('Student')} onChange={() => handleCheckbox('Student', concernTypes, setConcernTypes)} />
                                            <span className="checkmark"></span>
                                            Student
                                        </label>
                                        <label className="custom-checkbox">
                                            <input type="checkbox" checked={concernTypes.includes('Staff')} onChange={() => handleCheckbox('Staff', concernTypes, setConcernTypes)} />
                                            <span className="checkmark"></span>
                                            Staff
                                        </label>
                                        <label className="custom-checkbox">
                                            <input type="checkbox" checked={concernTypes.includes('Visitor / public')} onChange={() => handleCheckbox('Visitor / public', concernTypes, setConcernTypes)} />
                                            <span className="checkmark"></span>
                                            Visitor / public
                                        </label>
                                        <label className="custom-checkbox">
                                            <input type="checkbox" checked={concernTypes.includes('Unknown')} onChange={() => handleCheckbox('Unknown', concernTypes, setConcernTypes)} />
                                            <span className="checkmark"></span>
                                            Unknown
                                        </label>
                                        <label className="custom-checkbox">
                                            <input type="checkbox" checked={concernTypes.includes('Parent')} onChange={() => handleCheckbox('Parent', concernTypes, setConcernTypes)} />
                                            <span className="checkmark"></span>
                                            Parent
                                        </label>
                                        <label className="custom-checkbox">
                                            <input type="checkbox" checked={concernTypes.includes('Carer')} onChange={() => handleCheckbox('Carer', concernTypes, setConcernTypes)} />
                                            <span className="checkmark"></span>
                                            Carer
                                        </label>
                                        <label className="custom-checkbox">
                                            <input type="checkbox" checked={concernTypes.includes('Property')} onChange={() => handleCheckbox('Property', concernTypes, setConcernTypes)} />
                                            <span className="checkmark"></span>
                                            Property
                                        </label>
                                        <label className="custom-checkbox">
                                            <input type="checkbox" checked={concernTypes.includes('Self')} onChange={() => handleCheckbox('Self', concernTypes, setConcernTypes)} />
                                            <span className="checkmark"></span>
                                            Self
                                        </label>
                                        <label className="custom-checkbox">
                                            <input type="checkbox" checked={concernTypes.includes('None of above')} onChange={() => handleCheckbox('None of above', concernTypes, setConcernTypes)} />
                                            <span className="checkmark"></span>
                                            None of above
                                        </label>
                                    </div>
                                </div>
                                <TextField
                                    label='Description'
                                    name='description'
                                    onChange={(e:React.ChangeEvent<HTMLTextAreaElement>)=>{setDescription(e.target.value)}}
                                    value={description}
                                    icon={Description}
                                    placeholder='What happened? Who was involved? What was said/done? Witnesses?'
                                />
                        <div className="description-files-wrap">
                            {existingDescriptionFiles.length > 0 && (
                                <div className="existing-files-section">
                                    <label className="description-files-label">Existing attached files</label>
                                    <div className="description-file-viewer">
                                        {existingDescriptionFiles.map((f, index) => {
                                            const imageUrl = existingDescriptionImageUrls[index];
                                            if (isExistingFileImage(f) && imageUrl) {
                                                return (
                                                    <div key={`existing-desc-${index}`} className="description-file-viewer__thumb-wrap">
                                                        <button
                                                            type="button"
                                                            className="description-file-viewer__thumb"
                                                            onClick={() => { setSelectedImageIndex(null); setSelectedExistingImageIndex(index); }}
                                                            title={f.fileName}
                                                        >
                                                            <img src={imageUrl} alt={f.fileName} />
                                                        </button>
                                                        <span className="description-file-viewer__thumb-name">{f.fileName}</span>
                                                        <button
                                                            type="button"
                                                            className="description-file-viewer__download-btn description-file-viewer__download-btn--inline"
                                                            onClick={() => downloadExistingDescriptionFile(index)}
                                                        >
                                                            Download
                                                        </button>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div key={`existing-desc-${index}`} className="description-file-viewer__download-item">
                                                    <FontAwesomeIcon icon={faDownload} className="description-file-viewer__download-icon" />
                                                    <span className="description-file-viewer__download-name">{f.fileName}</span>
                                                    <button
                                                        type="button"
                                                        className="description-file-viewer__download-btn"
                                                        onClick={() => downloadExistingDescriptionFile(index)}
                                                    >
                                                        Download
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <label className="description-files-label">Attach files</label>
                            <input
                                type="file"
                                name="descriptionFiles"
                                multiple
                                onChange={handleDescriptionFilesChange}
                                className="description-files-input"
                            />
                            {descriptionFiles.length > 0 && (
                                <div className="description-file-viewer">
                                    {descriptionFiles.map((file, index) => {
                                        const url = filePreviewUrls[index];
                                        if (!url) return null;
                                        if (isImageFile(file)) {
                                            return (
                                                <div key={`${file.name}-${index}`} className="description-file-viewer__thumb-wrap">
                                                    <button
                                                        type="button"
                                                        className="description-file-viewer__thumb"
                                                        onClick={() => { setSelectedExistingImageIndex(null); setSelectedImageIndex(index); }}
                                                        title={file.name}
                                                    >
                                                        <img src={url} alt={file.name} />
                                                    </button>
                                                    <span className="description-file-viewer__thumb-name">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        className="description-file-viewer__remove-btn"
                                                        onClick={() => removeDescriptionFile(index)}
                                                        title="Remove"
                                                        aria-label="Remove file"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={`${file.name}-${index}`} className="description-file-viewer__download-item">
                                                <FontAwesomeIcon icon={faDownload} className="description-file-viewer__download-icon" />
                                                <span className="description-file-viewer__download-name">{file.name}</span>
                                                <button
                                                    type="button"
                                                    className="description-file-viewer__download-btn"
                                                    onClick={() => handleDownloadFile(file, url)}
                                                >
                                                    Download
                                                </button>
                                                <button
                                                    type="button"
                                                    className="description-file-viewer__remove-btn"
                                                    onClick={() => removeDescriptionFile(index)}
                                                    title="Remove"
                                                    aria-label="Remove file"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {((selectedImageIndex !== null && filePreviewUrls[selectedImageIndex]) || (selectedExistingImageIndex !== null && existingDescriptionImageUrls[selectedExistingImageIndex])) && (
                                <div
                                    className="description-photo-viewer-overlay"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Image viewer"
                                    onClick={() => { setSelectedImageIndex(null); setSelectedExistingImageIndex(null); }}
                                >
                                    <button
                                        type="button"
                                        className="description-photo-viewer-close"
                                        onClick={() => { setSelectedImageIndex(null); setSelectedExistingImageIndex(null); }}
                                        aria-label="Close viewer"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                    <div
                                        className="description-photo-viewer-content"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {selectedExistingImageIndex !== null && existingDescriptionImageUrls[selectedExistingImageIndex] ? (
                                            <>
                                                <img
                                                    src={existingDescriptionImageUrls[selectedExistingImageIndex]!}
                                                    alt={existingDescriptionFiles[selectedExistingImageIndex]?.fileName ?? 'Preview'}
                                                />
                                                <p className="description-photo-viewer-caption">{existingDescriptionFiles[selectedExistingImageIndex]?.fileName}</p>
                                            </>
                                        ) : (
                                            <>
                                                <img
                                                    src={filePreviewUrls[selectedImageIndex!]}
                                                    alt={descriptionFiles[selectedImageIndex!]?.name ?? 'Preview'}
                                                />
                                                <p className="description-photo-viewer-caption">{descriptionFiles[selectedImageIndex!]?.name}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            </div>
                        </div>
                        </div>
                        <div className="form-section">
                            <div className="form-heading">
                                <h2>Restrain</h2>
                            </div>
                            <div className="description">
                                <label className="custom-checkbox restrain-physical-checkbox">
                            <input
                                type="checkbox"
                                checked={physicalInterventionUsed}
                                onChange={(e) => setPhysicalInterventionUsed(e.target.checked)}
                            />
                            <span className="checkmark"></span>
                            Physical intervention used
                        </label>
                        <TextField
                            label='Restrain'
                            name='restrainDescription'
                            onChange={(e:React.ChangeEvent<HTMLTextAreaElement>)=>{setRestrainDescription(e.target.value)}}
                            value={restrainDescription}
                            icon={Description}
                            placeholder='Who performed it / Why / Duration / Witnesses'
                            textFieldWidth='90%'
                        />
                        <div className="description-files-wrap">
                            {existingRestrainFiles.length > 0 && (
                                <div className="existing-files-section">
                                    <label className="description-files-label">Existing attached files</label>
                                    <div className="description-file-viewer">
                                        {existingRestrainFiles.map((f, index) => {
                                            const imageUrl = existingRestrainImageUrls[index];
                                            if (isExistingFileImage(f) && imageUrl) {
                                                return (
                                                    <div key={`existing-restrain-${index}`} className="description-file-viewer__thumb-wrap">
                                                        <button
                                                            type="button"
                                                            className="description-file-viewer__thumb"
                                                            onClick={() => { setRestrainSelectedImageIndex(null); setSelectedExistingRestrainImageIndex(index); }}
                                                            title={f.fileName}
                                                        >
                                                            <img src={imageUrl} alt={f.fileName} />
                                                        </button>
                                                        <span className="description-file-viewer__thumb-name">{f.fileName}</span>
                                                        <button
                                                            type="button"
                                                            className="description-file-viewer__download-btn description-file-viewer__download-btn--inline"
                                                            onClick={() => downloadExistingRestrainFile(index)}
                                                        >
                                                            Download
                                                        </button>
                                                    </div>
                                                );
                                            }
                                            return (
                                                <div key={`existing-restrain-${index}`} className="description-file-viewer__download-item">
                                                    <FontAwesomeIcon icon={faDownload} className="description-file-viewer__download-icon" />
                                                    <span className="description-file-viewer__download-name">{f.fileName}</span>
                                                    <button
                                                        type="button"
                                                        className="description-file-viewer__download-btn"
                                                        onClick={() => downloadExistingRestrainFile(index)}
                                                    >
                                                        Download
                                                    </button>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                            <label className="description-files-label">Attach files</label>
                            <input
                                type="file"
                                name="restrainFiles"
                                multiple
                                onChange={handleRestrainFilesChange}
                                className="description-files-input"
                            />
                            {restrainFiles.length > 0 && (
                                <div className="description-file-viewer">
                                    {restrainFiles.map((file, index) => {
                                        const url = restrainFilePreviewUrls[index];
                                        if (!url) return null;
                                        if (isImageFile(file)) {
                                            return (
                                                <div key={`restrain-${file.name}-${index}`} className="description-file-viewer__thumb-wrap">
                                                    <button
                                                        type="button"
                                                        className="description-file-viewer__thumb"
                                                        onClick={() => { setSelectedExistingRestrainImageIndex(null); setRestrainSelectedImageIndex(index); }}
                                                        title={file.name}
                                                    >
                                                        <img src={url} alt={file.name} />
                                                    </button>
                                                    <span className="description-file-viewer__thumb-name">{file.name}</span>
                                                    <button
                                                        type="button"
                                                        className="description-file-viewer__remove-btn"
                                                        onClick={() => removeRestrainFile(index)}
                                                        title="Remove"
                                                        aria-label="Remove file"
                                                    >
                                                        <FontAwesomeIcon icon={faTimes} />
                                                    </button>
                                                </div>
                                            );
                                        }
                                        return (
                                            <div key={`restrain-${file.name}-${index}`} className="description-file-viewer__download-item">
                                                <FontAwesomeIcon icon={faDownload} className="description-file-viewer__download-icon" />
                                                <span className="description-file-viewer__download-name">{file.name}</span>
                                                <button
                                                    type="button"
                                                    className="description-file-viewer__download-btn"
                                                    onClick={() => handleDownloadFile(file, url)}
                                                >
                                                    Download
                                                </button>
                                                <button
                                                    type="button"
                                                    className="description-file-viewer__remove-btn"
                                                    onClick={() => removeRestrainFile(index)}
                                                    title="Remove"
                                                    aria-label="Remove file"
                                                >
                                                    <FontAwesomeIcon icon={faTimes} />
                                                </button>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                            {((restrainSelectedImageIndex !== null && restrainFilePreviewUrls[restrainSelectedImageIndex]) || (selectedExistingRestrainImageIndex !== null && existingRestrainImageUrls[selectedExistingRestrainImageIndex])) && (
                                <div
                                    className="description-photo-viewer-overlay"
                                    role="dialog"
                                    aria-modal="true"
                                    aria-label="Image viewer"
                                    onClick={() => { setRestrainSelectedImageIndex(null); setSelectedExistingRestrainImageIndex(null); }}
                                >
                                    <button
                                        type="button"
                                        className="description-photo-viewer-close"
                                        onClick={() => { setRestrainSelectedImageIndex(null); setSelectedExistingRestrainImageIndex(null); }}
                                        aria-label="Close viewer"
                                    >
                                        <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                    <div
                                        className="description-photo-viewer-content"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {selectedExistingRestrainImageIndex !== null && existingRestrainImageUrls[selectedExistingRestrainImageIndex] ? (
                                            <>
                                                <img
                                                    src={existingRestrainImageUrls[selectedExistingRestrainImageIndex]!}
                                                    alt={existingRestrainFiles[selectedExistingRestrainImageIndex]?.fileName ?? 'Preview'}
                                                />
                                                <p className="description-photo-viewer-caption">{existingRestrainFiles[selectedExistingRestrainImageIndex]?.fileName}</p>
                                            </>
                                        ) : (
                                            <>
                                                <img
                                                    src={restrainFilePreviewUrls[restrainSelectedImageIndex!]}
                                                    alt={restrainFiles[restrainSelectedImageIndex!]?.name ?? 'Preview'}
                                                />
                                                <p className="description-photo-viewer-caption">{restrainFiles[restrainSelectedImageIndex!]?.name}</p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                            </div>
                            </div>
                        </div>
                    </div>
                </div>
            )},
        {
            id: 'type',
            label: 'Body Map',
            content: (
                <div className="tab-content">
                    <div className="pink-box">
                            <div className='pink-content'>
                                <p>Body Map (Tick If Required)</p>
                                <p>
                                    <FontAwesomeIcon icon={faChevronDown}/>
                                </p>
                            </div>
                        </div>
                    <div className='sub-content type-account-body-maps' style={{ marginTop: '1.5rem' }}>
                        <label className="custom-checkbox">
                            <input type="checkbox" checked={bodyMap} onChange={() => setBodyMap(!bodyMap)} />
                            <span className="checkmark"></span>
                            Body Map (Tick If Required)
                        </label>
                        {bodyMap&&<div className="type-account-body-maps__row">
                            <div className="type-account-body-maps__cell">
                                <p className="type-account-body-maps__title">Front view</p>
                                <BodyMapWithSeverity
                                    view="front"
                                    markers={bodyMapFrontMarkers}
                                    activeRegionId={activeBodyMapRegion?.view === 'front' ? activeBodyMapRegion.regionId : null}
                                    onRegionClick={(regionId) => handleBodyMapRegionClick('front', regionId)}
                                    onSeveritySelect={(regionId, severity) => handleBodyMapSeveritySelect('front', regionId, severity)}
                                    descriptionValue={activeBodyMapRegion?.view === 'front' ? (bodyMapDescriptions['front-' + activeBodyMapRegion.regionId] ?? '') : ''}
                                    onDescriptionChange={(regionId, value) => setBodyMapDescriptions((prev) => ({ ...prev, ['front-' + regionId]: value }))}
                                    width={800}
                                    height={1200}
                                />
                            </div>
                            <div className="type-account-body-maps__cell">
                                <p className="type-account-body-maps__title">Back view</p>
                                <BodyMapWithSeverity
                                    view="back"
                                    markers={bodyMapBackMarkers}
                                    activeRegionId={activeBodyMapRegion?.view === 'back' ? activeBodyMapRegion.regionId : null}
                                    onRegionClick={(regionId) => handleBodyMapRegionClick('back', regionId)}
                                    onSeveritySelect={(regionId, severity) => handleBodyMapSeveritySelect('back', regionId, severity)}
                                    descriptionValue={activeBodyMapRegion?.view === 'back' ? (bodyMapDescriptions['back-' + activeBodyMapRegion.regionId] ?? '') : ''}
                                    onDescriptionChange={(regionId, value) => setBodyMapDescriptions((prev) => ({ ...prev, ['back-' + regionId]: value }))}
                                    width={800}
                                    height={1200}
                                />
                            </div>
                        </div>}
                        
                    </div>  
                </div>
            )},
        {
            id: 'social',
            label: 'Referrals',
            content: (
                <div className="tab-content">
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
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={socialCare.includes('Others')} onChange={() => handleCheckbox('Others', socialCare, setSocialCare)} />
                                    <span className="checkmark"></span>
                                    Others
                                </label>
                            </div>
                        </div>
                        {socialCare.includes('Others') && (
                            <div className="social-care-others-description-wrap" style={{ marginTop: '1rem' }}>
                                <TextField
                                    label="Description (Others)"
                                    name="socialCareOthersDescription"
                                    value={socialCareOthersDescription}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSocialCareOthersDescription(e.target.value)}
                                    placeholder="Describe the other social care status..."
                                />
                            </div>
                        )}
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
                                            checked={refferal.includes('Other: (Refferal)')} 
                                            onChange={() => handleCheckbox(
                                                'Other: (Refferal)', 
                                                refferal, 
                                                setRefferal
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
                                    <label className="custom-checkbox">
                                        <input 
                                            type="checkbox" 
                                            checked={refferal.includes('Others')} 
                                            onChange={() => handleCheckbox(
                                                'Others', 
                                                refferal, 
                                                setRefferal
                                            )} 
                                        />
                                        <span className="checkmark"></span>
                                        Others
                                    </label>
                                    <div style={{width:200}}></div>
                                </div>
                            </div>
                        </div>
                        {refferal.includes('Others') && (
                            <div className="referral-others-description-wrap" style={{ marginTop: '1rem' }}>
                                <TextField
                                    label="Description (Others)"
                                    name="referralOthersDescription"
                                    value={referralOthersDescription}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReferralOthersDescription(e.target.value)}
                                    placeholder="Describe the other referral type..."
                                />
                            </div>
                        )}
                    </div>  
                </div>
            )},
        {
            id: 'meetings',
            label: 'Outcome',
            content: (
                <div className="tab-content">
                    <div className="sub-heading">
                        <p className='main-heading'>Action</p>
                        <hr className='hr-line'/>
                    </div>
                    <div className='sub-content'>
                        <div className="pink-box">
                            <div className='pink-content'>
                                <p>Action</p>
                                <p>
                                    <FontAwesomeIcon icon={faChevronDown}/>
                                </p>
                            </div>
                        </div>
                        <div className='box-content'>
                            <div className='check-boxes-column'>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={actionChecks.includes('Verbal warning')} onChange={() => handleCheckbox('Verbal warning', actionChecks, setActionChecks)} />
                                    <span className="checkmark"></span>
                                    Verbal warning
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={actionChecks.includes('Restorative action')} onChange={() => handleCheckbox('Restorative action', actionChecks, setActionChecks)} />
                                    <span className="checkmark"></span>
                                    Restorative action
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={actionChecks.includes('Out of class')} onChange={() => handleCheckbox('Out of class', actionChecks, setActionChecks)} />
                                    <span className="checkmark"></span>
                                    Out of class
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={actionChecks.includes('Detention')} onChange={() => handleCheckbox('Detention', actionChecks, setActionChecks)} />
                                    <span className="checkmark"></span>
                                    Detention
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={actionChecks.includes('Senior leader informed')} onChange={() => handleCheckbox('Senior leader informed', actionChecks, setActionChecks)} />
                                    <span className="checkmark"></span>
                                    Senior leader informed
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={actionChecks.includes('Parent/guardian contacted')} onChange={() => handleCheckbox('Parent/guardian contacted', actionChecks, setActionChecks)} />
                                    <span className="checkmark"></span>
                                    Parent/guardian contacted
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={actionChecks.includes('Individual Behaviour Plan (IBP)')} onChange={() => handleCheckbox('Individual Behaviour Plan (IBP)', actionChecks, setActionChecks)} />
                                    <span className="checkmark"></span>
                                    Individual Behaviour Plan (IBP)
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={actionChecks.includes('Referral to external agency')} onChange={() => handleCheckbox('Referral to external agency', actionChecks, setActionChecks)} />
                                    <span className="checkmark"></span>
                                    Referral to external agency
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={actionChecks.includes('Reported to Local Authority')} onChange={() => handleCheckbox('Reported to Local Authority', actionChecks, setActionChecks)} />
                                    <span className="checkmark"></span>
                                    Reported to Local Authority
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={actionChecks.includes('Others')} onChange={() => handleCheckbox('Others', actionChecks, setActionChecks)} />
                                    <span className="checkmark"></span>
                                    Others
                                </label>
                            </div>
                        </div>
                        {actionChecks.includes('Others') && (
                            <div className="action-others-description-wrap" style={{ marginTop: '1rem' }}>
                                <TextField
                                    label="Description (Others)"
                                    name="actionOthersDescription"
                                    value={actionOthersDescription}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setActionOthersDescription(e.target.value)}
                                    placeholder="Describe the other action taken..."
                                />
                            </div>
                        )}
                        <div className="pink-box" style={{ marginTop: '1.5rem' }}>
                            <div className='pink-content'>
                                <p>Exclusions</p>
                                <p>
                                    <FontAwesomeIcon icon={faChevronDown}/>
                                </p>
                            </div>
                        </div>
                        <div className='box-content'>
                            <div className='check-boxes-column'>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={exclusionChecks.includes('Internal exclusion')} onChange={() => handleCheckbox('Internal exclusion', exclusionChecks, setExclusionChecks)} />
                                    <span className="checkmark"></span>
                                    Internal exclusion
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={exclusionChecks.includes('External exclusion')} onChange={() => handleCheckbox('External exclusion', exclusionChecks, setExclusionChecks)} />
                                    <span className="checkmark"></span>
                                    External exclusion
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={exclusionChecks.includes('Fixed-term exclusion')} onChange={() => handleCheckbox('Fixed-term exclusion', exclusionChecks, setExclusionChecks)} />
                                    <span className="checkmark"></span>
                                    Fixed-term exclusion
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={exclusionChecks.includes('Permanent exclusion')} onChange={() => handleCheckbox('Permanent exclusion', exclusionChecks, setExclusionChecks)} />
                                    <span className="checkmark"></span>
                                    Permanent exclusion
                                </label>
                                <label className="custom-checkbox">
                                    <input type="checkbox" checked={exclusionChecks.includes('Others')} onChange={() => handleCheckbox('Others', exclusionChecks, setExclusionChecks)} />
                                    <span className="checkmark"></span>
                                    Others
                                </label>
                            </div>
                        </div>
                        {exclusionChecks.includes('Others') && (
                            <div className="exclusion-others-description-wrap" style={{ marginTop: '1rem' }}>
                                <TextField
                                    label="Description (Others)"
                                    name="exclusionOthersDescription"
                                    value={exclusionOthersDescription}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setExclusionOthersDescription(e.target.value)}
                                    placeholder="Describe the other exclusion..."
                                />
                            </div>
                        )}
                        <div className="action-description-wrap" style={{ marginTop: '1.5rem' }}>
                            <TextField
                                label="Description"
                                name="actionDescription"
                                value={actionDescription}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setActionDescription(e.target.value)}
                                placeholder="Describe any additional action taken or notes..."
                            />
                        </div>
                    </div>
                    <div className="sub-heading" style={{ marginTop: '1.5rem' }}>
                        <p className='main-heading'>Your Account</p>
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
                                                    value={meeting.date ? meeting.date.toISOString().split('T')[0] : ''}
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
                                        <div className='meeting-input-div' style={{ marginTop: '0.75rem' }}>
                                            <Input
                                                type="file"
                                                name={`note-file-${idx}`}
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    const updated = [...meetings];
                                                    updated[idx] = { ...updated[idx], attachmentFile: file };
                                                    setMeetings(updated);
                                                }}
                                                label="Attachment"
                                                labelFont={15}
                                            />
                                            {(meeting.attachmentFile || meeting.fileName) && (
                                                <span className="outcome-attachment-filename">
                                                    {meeting.attachmentFile?.name ?? meeting.fileName}
                                                    {id && meeting.filePath && (
                                                        <>
                                                            {' '}
                                                            <button type="button" className="description-file-viewer__download-btn" onClick={() => downloadNoteFile(idx)}>
                                                                <FontAwesomeIcon icon={faDownload} /> Download
                                                            </button>
                                                        </>
                                                    )}
                                                </span>
                                            )}
                                        </div>
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
                </div>
            )},
    ];

    const formContent = (
        <div className="new-staff">
            <div className="new-staff-header">
                <h1>{isEditMode ? 'Edit Incident' : 'Create New Incident'}</h1>
            </div>
            <form
                className="new-staff-form"
                onSubmit={(e) => { e.preventDefault(); handleSave(); }}
            >
                <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
                <div className="form-actions">
                    <button type="button" onClick={handleCancel} className="btn-cancel">
                        Cancel
                    </button>
                    <button type="submit" className="btn-submit" disabled={loading}>
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </form>
        </div>
    );
    if (embedded) return formContent;
    return (
        <Layout showFilter={false} showNew={false} showPagination={false} showViewType={false}>
            {formContent}
        </Layout>
    );
}
export default New