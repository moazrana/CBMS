import React, { useState } from 'react';
import Layout from '../../../layouts/layout';
import DataTable from '../../../components/DataTable/DataTable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faTimesCircle, faHourglassHalf,faDownload } from '@fortawesome/free-solid-svg-icons';
import { useApiRequest } from '../../../hooks/useApiRequest';
import api from '../../../services/api';
import Popup from '../../../components/Popup/Popup';
import Input from '../../../components/input/Input';
import DateInput from '../../../components/dateInput/DateInput';
const AdminPageList = () => {
  const { executeRequest } = useApiRequest<Record<string, unknown>[]>();
  const [certificates, setCertificates] = useState<Record<string, unknown>[]>([]);
  const [isPopupOpen,setIsPopupOpen]=useState<boolean>(false);
  
  const [rejectionReason,setRejectionReason]=useState<string>('');
  const [expiry,setExpiry]=useState<string>('');

  const fetchCompliances = async () => {
    try {
      const response = await executeRequest('get', '/users/certificates/all');
      setCertificates(response);
    } catch (error) {
      console.error('Failed to fetch certificates:', error);
      setCertificates([]);
    }
  };
  const handleDownload=async(userId: string,fileId:string,fileName:string)=>{
    try {
      const response = await api.get(`/certificates/download/${userId}/${fileId}`, {
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
  }
  const [popupOp,setPopupOp]=useState<boolean>(false)//false for reject and true for accept
  const [userId,setUserId]=useState<string>('');
  const [certificateId,setCertificateId]=useState<string>('');
  const handlePopupSubmition=()=>{
    if(popupOp)
      handleAccept()
    else
      handleReject()
  }
  const openReject=(userId: string, certificateId: string)=>{
    setPopupOp(false)
    setUserId(userId)
    setCertificateId(certificateId)
    setIsPopupOpen(true)
  }
  const openAccept=(userId: string, certificateId: string)=>{
    setPopupOp(true)
    setUserId(userId)
    setCertificateId(certificateId)
    setIsPopupOpen(true)
  }
 
  const handleAccept = async () => {
    try {
      await api.post(`/certificates/approve/${userId}/${certificateId}/${expiry}`);
      setIsPopupOpen(false)
      fetchCompliances();
    } catch {
      alert('Failed to approve certificate.');
    }
  };

  const handleReject = async () => {
    try {
      await api.post(`/certificates/reject/${userId}/${certificateId}`, { reason:rejectionReason });
      setIsPopupOpen(false)
      fetchCompliances();
    } catch {
      alert('Failed to reject certificate.');
    }
  };
  const cols = [
    { header: 'Teacher', accessor: 'teacher', sortable: true, type: 'string' as const },
    { header: 'File Name', accessor: 'fileName', sortable: true, type: 'tenChars' as const},
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
    { header: 'Approved / Rejected By', accessor: 'approvedBy', sortable: true, type: 'string' as const },
    { header: 'Rejection Reason', accessor: 'rejectionReason', sortable: true, type: 'tenChars' as const },
    { header:'Expiry',accessor:'expiry',sortable:true,type:'string' as const},
    { header: 'Download', accessor: 'download', sortable: true, type: 'template' as const,template:(row:Record<string,unknown>)=>{
      return(
        <FontAwesomeIcon 
          className='downloadIcon'
          icon={faDownload}
          onClick={() => handleDownload(row.userId as string, row.certificateId as string,row.fileName as string)}
        />
      )
    } },
    { header: 'Created', accessor: 'createdAt', sortable: true, type: 'date' as const },
    { header: 'Updated', accessor: 'updatedAt', sortable: true, type: 'date' as const },
    { header: 'Action', accessor: 'action', sortable: true, type: 'template' as const, template: (row: Record<string, unknown>) => {
      const status = row.status as string;
      return (
        <div>
          {status !== 'approved' && (
            <button className='action-button' title='Approve' onClick={() => openAccept(row.userId as string, row.certificateId as string)}>
              <FontAwesomeIcon icon={faCheckCircle} style={{ color: 'green' }} />
            </button>
          )}
          {status !== 'rejected' && (
            <button className='action-button' title='Reject' onClick={() => openReject(row.userId as string, row.certificateId as string)}>
              <FontAwesomeIcon icon={faTimesCircle} style={{ color: 'red' }} />
            </button>
          )}
        </div>
      )
    } },
  ];
  
  React.useEffect(() => {
    fetchCompliances();
  }, []);
  
  return (
    <>
    <Layout>
      <DataTable
        columns={cols}
        data={certificates}
        title='Certificates'
        onEdit={() => {}}
        onDelete={() => {}}
        showActions={false}
        addButton={false}
      />
    </Layout>
    <Popup
      isOpen={isPopupOpen}
      onClose={() => setIsPopupOpen(false)}
      title={popupOp?'Enter Expiry of document':'Enter Rejection Reason'}
      width="600px"
      confirmText={popupOp?'Submit Expiry':'Reject'}
      cancelText='Cancel'
      onConfirm={() => handlePopupSubmition()}
      >
        <form >
          {!popupOp&&(
            <Input 
              label='Rejection Reason' 
              name='rejectionReason' 
              value={rejectionReason} 
              onChange={(e) => setRejectionReason(e.target.value)} 
            />  
          )}
          {popupOp&&(
            <DateInput
              label='Expiry'
              name='expiry'
              value={expiry}
              onChange={(e)=>setExpiry(e.target.value)}
            />
          )}
        </form>
    </Popup>
    </>
  );
};

export default AdminPageList;