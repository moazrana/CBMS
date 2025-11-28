import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../../layouts/layout';
import DataTable from '../../../components/DataTable/DataTable';
import { useApiRequest } from '../../../hooks/useApiRequest';
import SidebarPopup from '../../../components/SidebarPopup/SidebarPopup';
import StaffView from '../view/StaffView';

interface Staff {
  _id: string;
  name?: string;
  email?: string;
  profile?: {
    firstName?: string;
    middleName?: string;
    lastName?: string;
    preferredName?: string;
    phoneWork?: string;
    phoneMobile?: string;
    jobRole?: string;
    department?: string;
    startDate?: string;
    endDate?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postalCode?: string;
      country?: string;
    };
  };
  emergencyContacts?: Array<{
    name?: string;
    relationship?: string;
    daytimeTelephone?: string;
    eveningTelephone?: string;
    mobile?: string;
    email?: string;
    address?: string;
    notes?: string;
  }>;
  dbs?: {
    staffMember?: string;
    checkLevel?: string;
    applicationSentDate?: string;
    applicationReferenceNumber?: string;
    certificateDateReceived?: string;
    certificateNumber?: string;
    dbsSeenBy?: string;
    dbsCheckedDate?: string;
    updateServiceId?: string;
    updateServiceCheckDate?: string;
    rightToWork?: {
      type?: string;
      verifiedDate?: string;
      verifiedByUserId?: string;
      expiry?: string;
      evidence?: string;
    };
    overseas?: {
      checkNeeded?: boolean;
      evidenceProduced?: boolean;
      checkDate?: string;
      checkedByUserId?: string;
      uploadEvidence?: string;
    };
    childrenBarredListCheck?: {
      completed?: boolean;
      checkDate?: string;
      checkedByUserId?: string;
    };
    prohibitionFromTeaching?: {
      checked?: boolean;
      checkDate?: string;
      checkedByUserId?: string;
    };
    prohibitionFromManagement?: {
      completed?: boolean;
      checkDate?: string;
      checkedByUserId?: string;
      notes?: string;
    };
    disqualificationUnderChildrenAct?: {
      completed?: boolean;
      checkDate?: string;
      checkedByUserId?: string;
    };
    disqualifiedByAssociation?: {
      completed?: boolean;
      checkedDate?: string;
      checkedByUserId?: string;
    };
  };
  cpdTraining?: Array<{
    courseName: string;
    dateCompleted?: string;
    expiryDate?: string;
    status?: string;
    notes?: string;
    uploadCertificate?: string;
  }>;
  safeguardingTraining?: Array<{
    courseName: string;
    dateCompleted?: string;
    expiryDate?: string;
    status?: string;
    notes?: string;
    uploadCertificate?: string;
  }>;
  qualifications?: Array<{
    qualificationName: string;
    qualificationType?: string;
    classOfDegree?: string;
    achievedDate?: string;
    expiryDate?: string;
    subject1?: string;
    subject2?: string;
    qtStatus?: string;
    nqtEctStatus?: string;
    npqhQualification?: boolean;
    ccrsQualification?: boolean;
    notes?: string;
    uploadQualificationEvidence?: string;
  }>;
  hr?: Array<{
    absenceType?: string;
    absenceDate?: string;
    reason?: string;
    evidenceUpload?: string;
  }>;
  medicalNeeds?: {
    medicalDescription?: string;
    conditionsSyndrome?: string;
    medication?: string;
    specialDiet?: string;
    impairments?: string;
    allergies?: string;
    assistanceRequired?: string;
    nhsNumber?: string;
    bloodGroup?: string;
    medicalNotes?: string;
    lastMedicalCheck?: string;
    doctorContactDetails?: Array<{
      name?: string;
      relationship?: string;
      mobile?: string;
      daytimePhone?: string;
      eveningPhone?: string;
      email?: string;
    }>;
  };
  createdAt: string;
  updatedAt: string;
}

const StaffList = () => {
  const [staff, setStaff] = React.useState<Staff[]>([]);
  const { executeRequest } = useApiRequest<Staff[]>();
  const [sort, setSort] = React.useState('createdAt');
  const [order, setOrder] = React.useState('DESC');
  const [search, setSearch] = React.useState('');
  const [page, setPage] = React.useState(1);
  const [perPage, setPerPage] = React.useState(10);
  const [isViewOpen, setIsViewOpen] = React.useState(false);
  const [viewingStaff, setViewingStaff] = React.useState<Staff | null>(null);

  const fetchStaff = async () => {
    try {
      const response = await executeRequest('get', `/staff?sort=${sort}&order=${order}&search=${search}&page=${page}&perPage=${perPage}`);
      console.log({ ...response });
      setStaff(response);
    } catch (error) {
      console.error('Error fetching staff:', error);
    }
  };

  const handleDelete = async (row: Record<string, unknown>) => {
    const staffMember = row as unknown as Staff;
    try {
      await executeRequest('delete', `/staff/${staffMember._id}`);
      await fetchStaff();
    } catch (error) {
      console.error('Error deleting staff:', error);
      alert('Failed to delete staff member. Please try again.');
    }
  };

  const handleSort = async (key: string, direction: 'ASC' | 'DESC') => {
    console.log('sorting: ', key, direction);
    setSort(key);
    setOrder(direction);
    await fetchStaff();
  };

  const handleSearch = async (searchTerm: string) => {
    console.log('searching: ', searchTerm);
    setSearch(searchTerm);
    setPage(1);
    await fetchStaff();
  };

  const navigate = useNavigate();

  const onAdd = async () => {
    navigate('/staff/add');
  };

  const handleEdit = (row: Record<string, unknown>) => {
    const staffMember = row as unknown as Staff;
    navigate(`/staff/edit/${staffMember._id}`);
  };

  const handleView = async (row: Record<string, unknown>) => {
    const staffMember = row as unknown as Staff;
    try {
      const response = await executeRequest('get', `/staff/${staffMember._id}`);
      setViewingStaff(response);
      setIsViewOpen(true);
    } catch (error) {
      console.error('Error fetching staff details:', error);
      alert('Failed to load staff details');
    }
  };

  React.useEffect(() => {
    fetchStaff();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format staff data for display
  const formattedStaff = staff.map((member) => {
    const profile = member.profile || {};
    const firstName = profile.firstName || '';
    const lastName = profile.lastName || '';
    const preferredName = profile.preferredName || '';
    const displayName = preferredName || `${firstName} ${lastName}`.trim() || member.name || 'N/A';
    
    // Calculate DBS expiry
    const getDBSExpiry = (): string => {
      const dbs = member.dbs;
      if (!dbs) return 'N/A';
      
      // Check update service check date (most relevant for ongoing DBS checks)
      if (dbs.updateServiceCheckDate) {
        const expiryDate = new Date(dbs.updateServiceCheckDate);
        expiryDate.setFullYear(expiryDate.getFullYear() + 1); // DBS updates typically valid for 1 year
        return expiryDate.toISOString().split('T')[0];
      }
      
      // Check right to work expiry
      if (dbs.rightToWork?.expiry) {
        return dbs.rightToWork.expiry.split('T')[0];
      }
      
      // Check certificate date received (if no update service, certificate is valid for 3 years)
      if (dbs.certificateDateReceived) {
        const certDate = new Date(dbs.certificateDateReceived);
        certDate.setFullYear(certDate.getFullYear() + 3);
        return certDate.toISOString().split('T')[0];
      }
      
      return 'N/A';
    };
    
    // Calculate CPD/Qualification status
    const getCPDStatus = (): string => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check CPD training
      const cpdTraining = member.cpdTraining || [];
      const safeguardingTraining = member.safeguardingTraining || [];
      const allTraining = [...cpdTraining, ...safeguardingTraining];
      
      // Find pending training (status is 'pending' or no status and no completion date)
      const pendingTraining = allTraining.filter(t => {
        if (t.status === 'pending') return true;
        if (!t.status && !t.dateCompleted) return true;
        return false;
      });
      
      // Find expired training
      const expiredTraining = allTraining.filter(t => {
        if (!t.expiryDate) return false;
        const expiry = new Date(t.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        return expiry < today;
      });
      
      // Check qualifications
      const qualifications = member.qualifications || [];
      const expiredQuals = qualifications.filter(q => {
        if (!q.expiryDate) return false;
        const expiry = new Date(q.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        return expiry < today;
      });
      
      // Determine status - prioritize pending, then expired
      if (pendingTraining.length > 0) {
        return `Pending (${pendingTraining.length})`;
      }
      if (expiredTraining.length > 0) {
        return `Training Expired (${expiredTraining.length})`;
      }
      if (expiredQuals.length > 0) {
        return `Qualification Expired (${expiredQuals.length})`;
      }
      
      // Check for upcoming expiries (within 30 days)
      const upcomingTraining = allTraining.filter(t => {
        if (!t.expiryDate) return false;
        const expiry = new Date(t.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
      });
      
      const upcomingQuals = qualifications.filter(q => {
        if (!q.expiryDate) return false;
        const expiry = new Date(q.expiryDate);
        expiry.setHours(0, 0, 0, 0);
        const daysUntilExpiry = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return daysUntilExpiry > 0 && daysUntilExpiry <= 30;
      });
      
      if (upcomingTraining.length > 0 || upcomingQuals.length > 0) {
        const total = upcomingTraining.length + upcomingQuals.length;
        return `Expiring Soon (${total})`;
      }
      
      return 'Valid';
    };
    
    return {
      ...member,
      displayName: displayName,
      dbsExpiry: getDBSExpiry(),
      cpdStatus: getCPDStatus(),
      id: member._id,
    };
  });

  const columns = [
    { header: 'Display Name', accessor: 'displayName', sortable: true, type: 'string' as const },
    { header: 'DBS Expiry', accessor: 'dbsExpiry', sortable: true, type: 'date' as const },
    { header: 'CPD/Qualification Status', accessor: 'cpdStatus', sortable: true, type: 'string' as const },
    { header: 'Updated', accessor: 'updatedAt', sortable: true, type: 'date' as const },
    { header: 'ID', accessor: 'id', sortable: true, type: 'string' as const }
  ];

  return (
    <>
      <Layout>
        <div className="staff-list">
          <div className="staff-list-content">
            <DataTable
              columns={columns}
              data={formattedStaff}
              title="All Staff"
              onDelete={handleDelete}
              onSort={handleSort}
              onSearch={handleSearch}
              PerPage={setPerPage}
              onEdit={handleEdit}
              onView={handleView}
              onAdd={onAdd}
              addPermission='create_staff'
            />
          </div>
        </div>
      </Layout>
      <SidebarPopup
        isOpen={isViewOpen}
        onClose={() => {
          setIsViewOpen(false);
          setViewingStaff(null);
        }}
        title={viewingStaff?.profile?.preferredName || 
          `${viewingStaff?.profile?.firstName || ''} ${viewingStaff?.profile?.lastName || ''}`.trim() || 
          viewingStaff?.name || 
          'Staff Details'}
        message="Staff Information"
        width="600px"
        link={viewingStaff?._id ? `/staff/edit/${viewingStaff._id}` : undefined}
      >
        {viewingStaff && <StaffView staffData={viewingStaff} />}
      </SidebarPopup>
    </>
  );
};

export default StaffList;

