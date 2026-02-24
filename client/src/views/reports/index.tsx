import React, { useState, useEffect, useMemo } from 'react';
import Layout from '../../layouts/layout';
import { Tabs } from '../../components/Tabs/Tabs';
import DataTable from '../../components/DataTable/DataTable';
import { useApiRequest } from '../../hooks/useApiRequest';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { IncidentReportPopup } from './IncidentReportPopup';
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

function formatDate(d: string | undefined): string {
  if (!d) return '—';
  try {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '—';
  }
}

type ReportPopupState = { open: boolean; incident: IncidentRecord | null; studentName: string; studentId?: string };

const ReportsIncidentsTab: React.FC = () => {
  const { executeRequest } = useApiRequest();
  const [incidents, setIncidents] = useState<IncidentRecord[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [reportPopup, setReportPopup] = useState<ReportPopupState>({ open: false, incident: null, studentName: '', studentId: undefined });

  useEffect(() => {
    let cancelled = false;
    const fetchIncidents = async () => {
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
    fetchIncidents();
    return () => { cancelled = true; };
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
      { header: 'Location', accessor: 'location', sortable: false, type: 'string' as const },
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
    ],
    [expandedId]
  );

  const tableData = useMemo(() => {
    return incidents.map((inc) => {
      const involved = getInvolvedStudents(inc);
      return {
        _id: inc._id,
        date: formatDate(inc.dateAndTime),
        location: inc.location ?? '—',
        studentCount: involved.length,
        status: inc.status,
        body_mapping: inc.body_mapping,
        severity: inc.commentary?.severity ?? 1,
        isExpanded: expandedId === inc._id,
        expandedContent:
          expandedId === inc._id ? (
            <div className="reports-page__incident-detail">
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
                          onClick={() => setReportPopup({ open: true, incident: inc, studentName: name, studentId })}
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
          ) : null,
      };
    });
  }, [incidents, expandedId]);

  if (loading) {
    return (
      <div className="reports-page__panel reports-page__incidents">
        <p className="reports-page__incidents-loading">Loading incidents…</p>
      </div>
    );
  }

  if (!incidents.length) {
    return (
      <div className="reports-page__panel reports-page__incidents">
        <p className="reports-page__incidents-empty">No incidents found.</p>
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
      />
    </div>
  );
};

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('incidents');

  const tabs = [
    { id: 'incidents', label: 'Incidents', content: <ReportsIncidentsTab /> },
    { id: 'safeguarding', label: 'Safeguarding', content: <div className="reports-page__panel" /> },
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
