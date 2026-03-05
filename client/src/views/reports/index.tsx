import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../layouts/layout';
import { Tabs } from '../../components/Tabs/Tabs';
import DataTable from '../../components/DataTable/DataTable';
import { useApiRequest } from '../../hooks/useApiRequest';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faCheck, faDownload } from '@fortawesome/free-solid-svg-icons';
import { IncidentReportPopup, downloadIncidentReportPdf, formatParentGuardian, formatExternalContact, type ReportType } from './IncidentReportPopup';
import './index.scss';

const SEVERITY_LABELS: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' };
const SEVERITY_COLORS: Record<number, string> = { 1: '#22c55e', 2: '#f97316', 3: '#ef4444' };

type IncidentRecord = {
  _id: string;
  number?: number;
  location?: string;
  dateAndTime?: string;
  description?: string;
  status?: boolean;
  body_mapping?: boolean;
  commentary?: { severity?: number; direction?: string; behavior?: string };
  restrainDescription?: string;
  action?: string[];
  actionDescription?: string;
  conclusion?: string[];
  period?: { name?: string };
  staff?: { name?: string; profile?: { firstName?: string; lastName?: string } };
  staffList?: Array<{ name?: string; profile?: { firstName?: string; lastName?: string } }>;
  students?: Array<{ personalInfo?: { legalFirstName?: string; lastName?: string; middleName?: string }; name?: string }>;
  student?: { personalInfo?: { legalFirstName?: string; lastName?: string }; name?: string };
  /** Details tab "Others" dropdown value */
  involved?: string[];
};

function formatStudentName(s: { personalInfo?: { legalFirstName?: string; lastName?: string; middleName?: string }; name?: string } | null | undefined): string {
  if (!s) return '';
  const p = s.personalInfo || {};
  const first = (p.legalFirstName || '').trim();
  const last = (p.lastName || '').trim();
  if (first || last) return [first, last].filter(Boolean).join(' ');
  return s.name ?? '';
}

function getInvolvedStudents(incident: IncidentRecord): string[] {
  const list = Array.isArray(incident.students) ? incident.students : (incident.student ? [incident.student] : []);
  return list.map(formatStudentName).filter(Boolean);
}

type StaffLike = { name?: string; profile?: { firstName?: string; lastName?: string } };

function formatStaffName(s: StaffLike | null | undefined): string {
  if (!s) return '';
  if (s.name?.trim()) return s.name.trim();
  if (s.profile) {
    const first = (s.profile.firstName || '').trim();
    const last = (s.profile.lastName || '').trim();
    if (first || last) return [first, last].filter(Boolean).join(' ');
  }
  return '';
}

function getInvolvedStaff(incident: IncidentRecord): string[] {
  const list = Array.isArray(incident.staffList) && incident.staffList.length
    ? incident.staffList
    : incident.staff
      ? [incident.staff]
      : [];
  return list.map((s) => formatStaffName(s as StaffLike)).filter(Boolean);
}

function formatDate(d: string | undefined): string {
  if (!d) return '—';
  try {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

function formatTime(d: string | undefined): string {
  if (!d) return '—';
  try {
    const date = new Date(d);
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  } catch {
    return '—';
  }
}

function formatStaff(
  staff: IncidentRecord['staff'],
  staffList?: IncidentRecord['staffList']
): string {
  if (staff?.name) return staff.name;
  if (staff?.profile) {
    const first = (staff.profile.firstName || '').trim();
    const last = (staff.profile.lastName || '').trim();
    if (first || last) return [first, last].filter(Boolean).join(' ');
  }
  if (staffList?.length) {
    const first = staffList[0];
    if (first?.name) return first.name;
    if (first?.profile) {
      const firstN = (first.profile.firstName || '').trim();
      const lastN = (first.profile.lastName || '').trim();
      if (firstN || lastN) return [firstN, lastN].filter(Boolean).join(' ');
    }
  }
  return '—';
}

type ReportPopupState = { open: boolean; incident: IncidentRecord | null; studentName: string; studentId?: string; reportType?: ReportType };

type ReportsListTabProps = { reportType: ReportType };

const ReportsListTab: React.FC<ReportsListTabProps> = ({ reportType }) => {
  const { executeRequest } = useApiRequest();
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportPopup, setReportPopup] = useState<ReportPopupState>({ open: false, incident: null, studentName: '', studentId: undefined });

  useEffect(() => {
    let cancelled = false;
    const fetchList = async () => {
      setLoading(true);
      try {
        const res = await executeRequest('get', '/incidents');
        if (cancelled) return;
        const list = Array.isArray(res) ? res : [];
        setIncidents(list);
      } catch {
        if (!cancelled) setIncidents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchList();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount; executeRequest is not stable
  }, []);

  const columns = useMemo(
    () => [
      {
        header: '',
        accessor: 'expand',
        sortable: false,
        type: 'template' as const,
        template: (row: Record<string, unknown>) => {
          const isExpanded = expandedId === row._id;
          return (
            <button
              type="button"
              className="reports-page__expand-btn"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedId(isExpanded ? null : (row._id as string));
              }}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              <FontAwesomeIcon icon={isExpanded ? faChevronDown : faChevronRight} />
            </button>
          );
        },
      },
      { header: 'Date', accessor: 'date', sortable: false, type: 'string' as const },
      { header: 'Time', accessor: 'time', sortable: false, type: 'string' as const },
      { header: 'Location', accessor: 'location', sortable: false, type: 'string' as const },
      { header: 'Staff', accessor: 'staff', sortable: false, type: 'string' as const },
      { header: 'Others', accessor: 'others', sortable: false, type: 'string' as const },
      { header: 'No. of students', accessor: 'studentCount', sortable: false, type: 'number' as const },
      {
        header: 'Status',
        accessor: 'status',
        sortable: false,
        type: 'template' as const,
        template: (row: Record<string, unknown>) => (
          <span className="reports-page__incident-status" data-status={String(!!row.status)}>
            {row.status ? 'Open' : 'Closed'}
          </span>
        ),
      },
      {
        header: 'Body map',
        accessor: 'body_mapping',
        sortable: false,
        type: 'template' as const,
        template: (row: Record<string, unknown>) => (
          <span className="reports-page__incident-bodymap" title={row.body_mapping ? 'Body map' : 'No body map'}>
            {row.body_mapping ? (
              <FontAwesomeIcon icon={faCheck} className="reports-page__incident-bodymap-yes" />
            ) : (
              <span className="reports-page__incident-bodymap-no">—</span>
            )}
          </span>
        ),
      },
      {
        header: 'Severity',
        accessor: 'severity',
        sortable: false,
        type: 'template' as const,
        template: (row: Record<string, unknown>) => {
          const s = (row.severity as number) ?? 1;
          const color = SEVERITY_COLORS[s] ?? SEVERITY_COLORS[1];
          return (
            <span
              className="reports-page__incident-severity-dot"
              style={{ backgroundColor: color }}
              title={SEVERITY_LABELS[s]}
            />
          );
        },
      },
      {
        header: '',
        accessor: 'download',
        sortable: false,
        type: 'template' as const,
        template: (row: Record<string, unknown>) => {
          const incident = row.incident as IncidentRecord | undefined;
          const involvedNames = (row.involvedNames as string) || '';
          const involvedStudentIds = (row.involvedStudentIds as string[]) || [];
          const involvedNamesList = (row.involvedNamesList as string[]) || [];
          return (
            <button
              type="button"
              className="reports-page__download-row-btn"
              onClick={async (e) => {
                e.stopPropagation();
                if (!incident) return;
                const parentNames: string[] = [];
                const parentNotes: string[] = [];
                const externalNames: string[] = [];
                const externalNotes: string[] = [];
                if (involvedStudentIds.length > 0 && executeRequest) {
                  try {
                    for (let i = 0; i < involvedStudentIds.length; i++) {
                      const id = involvedStudentIds[i];
                      const name = involvedNamesList[i] || `Student ${i + 1}`;
                      const student = await executeRequest('get', `/students/${id}`, undefined, { silent: true }) as { parents?: Parameters<typeof formatParentGuardian>[0]; emergencyContacts?: Parameters<typeof formatExternalContact>[0] } | null;
                      if (student) {
                        const pg = formatParentGuardian(student.parents);
                        const ext = formatExternalContact(student.emergencyContacts);
                        parentNames.push(`--- ${name} ---\n${pg.name || '—'}`);
                        parentNotes.push(`--- ${name} ---\n${pg.notes || '—'}`);
                        externalNames.push(`--- ${name} ---\n${ext.name || '—'}`);
                        externalNotes.push(`--- ${name} ---\n${ext.notes || '—'}`);
                      }
                    }
                  } catch {
                    // proceed with empty contacts
                  }
                }
                const contactOverrides = parentNames.length
                  ? {
                      parentGuardianName: parentNames.join('\n\n'),
                      parentGuardianNotes: parentNotes.join('\n\n'),
                      externalContactName: externalNames.join('\n\n'),
                      externalContactNotes: externalNotes.join('\n\n'),
                    }
                  : undefined;
                downloadIncidentReportPdf(incident, involvedNames, contactOverrides, reportType);
              }}
              title={reportType === 'safeguarding' ? 'Download safeguarding report' : 'Download incident report (all involved students)'}
              aria-label="Download report"
            >
              <FontAwesomeIcon icon={faDownload} />
            </button>
          );
        },
      },
    ],
    [expandedId, executeRequest, reportType]
  );

  const tableData = useMemo(() => {
    return incidents.map((inc) => {
      const involved = getInvolvedStudents(inc);
      const studentList = Array.isArray(inc.students) ? inc.students : (inc.student ? [inc.student] : []);
      const involvedStudentIds = studentList.map((s) => (s as { _id?: string })?._id).filter(Boolean) as string[];
      return {
        _id: inc._id,
        incident: inc,
        involvedNames: involved.join(', '),
        involvedNamesList: involved,
        involvedStudentIds,
        date: formatDate(inc.dateAndTime),
        time: formatTime(inc.dateAndTime),
        location: inc.location ?? '—',
        staff: formatStaff(inc.staff, inc.staffList),
        others: Array.isArray(inc.involved) && inc.involved.length ? inc.involved.join(', ') : '—',
        studentCount: involved.length,
        // Include involved student names for search (DataTable filters by all row values)
        involvedStudentNames: involved.join(' '),
        status: inc.status,
        body_mapping: inc.body_mapping,
        severity: inc.commentary?.severity ?? 1,
        isExpanded: expandedId === inc._id,
        expandedContent:
          expandedId === inc._id ? (
            <div className="reports-page__incident-detail">
              <div className="reports-page__involved-columns">
                <div className="reports-page__involved-column">
                  <h2 className="reports-page__incident-detail-title">Involved students</h2>
                  {involved.length ? (
                    <ol className="reports-page__involved-list">
                      {involved.map((name, i) => {
                        const studentList = Array.isArray(inc.students) ? inc.students : (inc.student ? [inc.student] : []);
                        const studentId = (studentList[i] as { _id?: string } | undefined)?._id;
                        return (
                          <li key={i} className="reports-page__involved-item">
                            <button
                              type="button"
                              className="reports-page__student-name-btn"
                              onClick={() => setReportPopup({ open: true, incident: inc, studentName: name, studentId, reportType })}
                            >
                              {name}
                            </button>
                          </li>
                        );
                      })}
                    </ol>
                  ) : (
                    <p className="reports-page__involved-empty">No students recorded.</p>
                  )}
                </div>
                <div className="reports-page__involved-column">
                  <h2 className="reports-page__incident-detail-title">Involved staff</h2>
                  {getInvolvedStaff(inc).length ? (
                    <ol className="reports-page__involved-list reports-page__involved-list--staff">
                      {getInvolvedStaff(inc).map((name, i) => (
                        <li key={i} className="reports-page__involved-item">
                          {name}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="reports-page__involved-empty">No staff recorded.</p>
                  )}
                </div>
                <div className="reports-page__involved-column">
                  <h2 className="reports-page__incident-detail-title">Others</h2>
                  {Array.isArray(inc.involved) && inc.involved.length ? (
                    <ol className="reports-page__involved-list reports-page__involved-list--others">
                      {inc.involved.map((item, i) => (
                        <li key={i} className="reports-page__involved-item">
                          {item}
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <p className="reports-page__involved-empty">No others recorded.</p>
                  )}
                </div>
              </div>
            </div>
          ) : null,
      };
    });
  }, [incidents, expandedId, reportType]);

  const loadingMessage = reportType === 'safeguarding' ? 'Loading safeguarding…' : 'Loading incidents…';
  const emptyMessage = reportType === 'safeguarding' ? 'No safeguarding records found.' : 'No incidents found.';

  if (loading) {
    return (
      <div className="reports-page__panel reports-page__incidents">
        <p className="reports-page__incidents-loading">{loadingMessage}</p>
      </div>
    );
  }

  if (!incidents.length) {
    return (
      <div className="reports-page__panel reports-page__incidents">
        <p className="reports-page__incidents-empty">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="reports-page__panel reports-page__incidents">
      <DataTable
        columns={columns}
        data={tableData}
        title=""
        onEdit={() => {}}
        showActions={false}
        addButton={false}
        showSearch={true}
      />
      <IncidentReportPopup
        isOpen={reportPopup.open}
        onClose={() => setReportPopup((p) => ({ ...p, open: false }))}
        incident={reportPopup.incident}
        studentName={reportPopup.studentName}
        studentId={reportPopup.studentId}
        reportType={reportPopup.reportType ?? 'incident'}
      />
    </div>
  );
};

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('incidents');

  const tabs = [
    { id: 'incidents', label: 'Incidents', content: <ReportsListTab reportType="incident" /> },
    { id: 'safeguarding', label: 'Safeguarding', content: <ReportsListTab reportType="safeguarding" /> },
    { id: 'weekly', label: 'Weekly reports', content: <div className="reports-page__panel" /> },
  ];

  return (
    <Layout>
      <div className="reports-page">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </Layout>
  );
};

export default Reports;
