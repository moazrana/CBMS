import React, { useState } from 'react';
import Layout from '../../../layouts/layout';
import DataTable from '../../../components/DataTable/DataTable';
import Input from '../../../components/input/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faHourglassHalf,faDownload } from '@fortawesome/free-solid-svg-icons';
import './uploadFile.scss'
import api from '../../../services/api';
import { useApiRequest } from '../../../hooks/useApiRequest';

interface Column {
  header: string;
  accessor: string;
  sortable?: boolean;
  type?: 'number' | 'string' | 'date' | 'template';
  template?: (row: Record<string, unknown>, rowIndex: number) => React.ReactNode;
}

const TeacherUploadFile=()=>{
    const [certificate,setCertificate]=useState<File | undefined>()
    const [certificates, setCertificates] = useState<Record<string, unknown>[]>([]);
    const { executeRequest } = useApiRequest<Record<string, unknown>[]>();

    const fetchCertificates = async () => {
        try {
            const res = await executeRequest('get', '/users/certificates/my');// await api.get('/users/certificates');
            res.forEach((element: Record<string, unknown>, index: number) => {
               element.count= index+1;
            });
            setCertificates(res);
        } catch {
            setCertificates([]);
        }
    };

    React.useEffect(() => {
        fetchCertificates();
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCertificate(e.target.files?.[0]);
        // Do something with the file
    };

    const handleDownload = async (certificateIndex: unknown, fileName: string) => {
        try {
            const response = await api.get(`/users/certificates/download/${certificateIndex}`, {
                responseType: 'blob'
            });
            
            // Create a blob URL and trigger download
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download file.');
        }
    };

    const cols: Column[] = [
        { header: '#', accessor: 'count', sortable: true, type: 'number' as const },
        { header: 'File Name', accessor: 'fileName', sortable: true, type: 'string' as const },
        {
            header: 'Status',
            accessor: 'status',
            sortable: true,
            type: 'template' as const,
            template: (row: Record<string, unknown>) => {
            const status = row.status as string;
            switch(status) {
                case 'approved':
                return <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green' }} title='Approved' />
                case 'rejected':  
                return <FontAwesomeIcon icon={faTimesCircle} style={{ color: 'red' }} title='Rejected' />
                case 'pending':
                return <FontAwesomeIcon icon={faHourglassHalf} style={{ color: 'yellow' }} title='Pending' />
                default:
                return null
            }
            }
        },
        { 
            header: 'Approved / Rejected By', 
            accessor: 'approvedBy', 
            sortable: true, 
            type: 'template' as const,
            template:(row:Record<string, unknown>)=>{
                const val = row.approvedBy as string | undefined;
                if (!val) return '--';
                const display = val.length > 10 ? val.slice(0, 7) + '...' : val;
                return <span title={val}>{display}</span>;
            } 
        },
        { 
            header: 'Rejection Reason', 
            accessor: 'rejectionReason', 
            sortable: true, 
            type: 'template' as const,
            template:(row:Record<string,unknown>)=>{
                return row.rejectionReason ? String(row.rejectionReason) : '--'
            } 
        },
        {
            header:'Download',
            accessor:'download',
            sortable:false,
            type:'template' as const,
            template:(row: Record<string, unknown>)=>{
                return (
                    <FontAwesomeIcon 
                        className='downloadIcon' 
                        icon={faDownload} 
                        style={{ color: 'var(--main-text)' }} 
                        title='Download'
                        onClick={() => handleDownload(row._id, row.fileName as string)}
                    />
                );
            }
        }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!certificate) {
            alert('Please select a file first.');
            return;
        }
        const formData = new FormData();
        formData.append('file', certificate);
        try {
            await api.post('/users/certificates/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            alert('File uploaded successfully!');
            setCertificate(undefined);
            fetchCertificates();
        } catch {
            alert('Failed to upload file.');
        }
    };

    return (
        <Layout>
            <form onSubmit={handleSubmit}>
                <div className='file-div'>
                    <Input
                        type='file'
                        label='Upload your Certificate'
                        name='certificate'
                        onChange={handleFileChange}
                    />
                    <button className='submit-btn' type='submit'>Submit</button>
                </div>
            </form>
            <DataTable
                columns={cols}
                data={certificates}
                title='Your Certificates'
                onEdit={() => {}}
                onDelete={() => {}}
                showActions={false}
                addButton={false}
            />
        </Layout>
    )
}

export default TeacherUploadFile