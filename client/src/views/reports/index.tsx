import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { jsPDF } from 'jspdf';
import Layout from '../../layouts/layout';
import { Tabs } from '../../components/Tabs/Tabs';
import DataTable from '../../components/DataTable/DataTable';
import FilterSec from '../../components/FilterSec/FilterSec';
import Select from '../../components/Select/Select';
import Popup from '../../components/Popup/Popup';
import TextField from '../../components/textField/TextField';
import DateInput from '../../components/dateInput/DateInput';
import { useApiRequest } from '../../hooks/useApiRequest';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faChevronRight, faCheck, faDownload, faTimes } from '@fortawesome/free-solid-svg-icons';
import { IncidentReportPopup, downloadIncidentReportPdf, formatParentGuardian, formatExternalContact, type ReportType } from './IncidentReportPopup';
import { DropdownOption } from '../../types/DropDownOption';
import locationIcon from '../../assets/safeguarding/location.svg';
import Class from '../../assets/safeguarding/class.svg';
import Subject from '../../assets/safeguarding/subject.svg';
import logo from '/logo.png';
import './index.scss';

const PAGE_W_MM = 210;
const MARGIN_MM = 20;

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

// Class shape from API (for weekly report filter)
type ClassData = {
  _id: string;
  location?: string;
  subject?: string;
  yeargroup?: string;
  students?: WeeklyReportStudent[];
};

type WeeklyReportStudent = {
  _id: string;
  personalInfo?: {
    legalFirstName?: string;
    middleName?: string;
    lastName?: string;
    yearGroup?: string;
    sex?: string;
    dateOfBirth?: string;
    location?: string;
  };
  medical?: { ehcp?: { hasEHCP?: boolean } };
};

const LOCATION_OPTIONS: DropdownOption[] = [
  { label: 'Warrington', value: 'Warrington' },
  { label: 'Bury', value: 'Bury' },
];

const SUBJECT_OPTIONS: DropdownOption[] = [
  { value: 'Construction', label: 'Construction' },
  { value: 'Motor Vehicle', label: 'Motor Vehicle' },
  { value: 'Hairdressing', label: 'Hairdressing' },
  { value: 'Maths/English', label: 'Maths/English' },
  { value: 'Outreach / Post 16', label: 'Outreach / Post 16' },
];

/** Returns Monday of the week (YYYY-MM-DD) containing the given date string (YYYY-MM-DD). */
function getMondayOfWeek(dateStr: string): string {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return '';
  const day = d.getDay();
  const daysToMonday = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - daysToMonday);
  return d.toISOString().split('T')[0];
}

/** Format Monday date as "Mon DD MMM YYYY – Fri DD MMM YYYY". */
function formatWeekRange(mondayStr: string): string {
  if (!mondayStr) return '';
  const mon = new Date(mondayStr + 'T12:00:00');
  if (Number.isNaN(mon.getTime())) return '';
  const fri = new Date(mon);
  fri.setDate(fri.getDate() + 4);
  const fmt = (date: Date) => date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
  return `${fmt(mon)} – ${fmt(fri)}`;
}

/** Format date for "Report Generated: Wednesday 19th November 2025". */
function formatReportGenerated(mondayStr: string): string {
  if (!mondayStr) return '';
  const d = new Date(mondayStr + 'T12:00:00');
  if (Number.isNaN(d.getTime())) return '';
  const day = d.getDate();
  const ord = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
  const str = d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const parts = str.split(' ');
  if (parts.length >= 2) parts[1] = parts[1] + ord;
  return parts.join(' ');
}

/** Format engagement date as two lines: "Monday" and "2nd Feb 2026". */
function formatEngagementDateTwoLines(date: Date | string): { line1: string; line2: string } {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return { line1: '—', line2: '' };
  const day = d.getDate();
  const ord = day === 1 || day === 21 || day === 31 ? 'st' : day === 2 || day === 22 ? 'nd' : day === 3 || day === 23 ? 'rd' : 'th';
  const line1 = d.toLocaleDateString('en-GB', { weekday: 'long' });
  const line2 = `${day}${ord} ${d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}`;
  return { line1, line2 };
}

/** Display name for session (e.g. "session1" -> "Session 1", "breakfast club" -> "Breakfast Club"). */
function formatSessionName(session: string): string {
  if (!session) return '—';
  const s = String(session).toLowerCase();
  if (s === 'breakfast club') return 'Breakfast Club';
  if (s === 'session1') return 'Morning Session 1';
  if (s === 'break') return 'Break';
  if (s === 'session2') return 'Morning Session 2';
  if (s === 'lunch') return 'Lunch';
  if (s === 'session3') return 'Afternoon Session';
  return session.charAt(0).toUpperCase() + session.slice(1);
}

const SESSION_ORDER: Record<string, number> = {
  'breakfast club': 0,
  session1: 1,
  break: 2,
  session2: 3,
  lunch: 4,
  session3: 5,
};

const WeeklyReportTab: React.FC = () => {
  const { executeRequest } = useApiRequest();
  const [weekStartDate, setWeekStartDate] = useState<string>(() => getMondayOfWeek(new Date().toISOString().split('T')[0]));
  const [location, setLocation] = useState<string>('');
  const [subject, setSubject] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('');
  const [classOptions, setClassOptions] = useState<DropdownOption[]>([]);
  const [students, setStudents] = useState<WeeklyReportStudent[]>([]);
  const [classMeta, setClassMeta] = useState<{ subject: string; location: string }>({ subject: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [weeklyReportPopupOpen, setWeeklyReportPopupOpen] = useState(false);
  const [weeklyReportStudentName, setWeeklyReportStudentName] = useState('');
  const [weeklyReportStudentId, setWeeklyReportStudentId] = useState<string | null>(null);
  const [weeklyReportNotes, setWeeklyReportNotes] = useState('');

  const closeWeeklyReportPopup = useCallback(() => {
    setWeeklyReportPopupOpen(false);
    setWeeklyReportStudentName('');
    setWeeklyReportStudentId(null);
    setWeeklyReportNotes('');
  }, []);

  type EngagementTableRow = {
    dateLine1: string;
    dateLine2: string;
    period: string;
    engagement: string;
    workUndertaken: string;
    behaviour: string;
  };

  type WeeklyReportSummary = {
    attendance: { present: number; authorised: number; unauthorised: number; total: number };
    engagement: { good: number; fair: number; average: number; poor: number; unmarked: number };
  };

  const generateWeeklyReportPdf = useCallback((engagementRows: EngagementTableRow[], summary: WeeklyReportSummary) => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const margin = MARGIN_MM;
    const lineH = 5;
    let y = margin;

    const printDate = new Date().toLocaleString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(printDate, margin, y);
    doc.text('Print Out', PAGE_W_MM / 2, y, { align: 'center' });
    const logoW = 22;
    const logoH = 12;
    if (typeof logo === 'string' && logo) {
      doc.addImage(logo, 'PNG', PAGE_W_MM - margin - logoW, y - logoH + 3, logoW, logoH);
    }
    y += 10;

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.text('Student: ', margin, y);
    doc.setFont('helvetica', 'bold');
    doc.text(weeklyReportStudentName || '—', margin + doc.getTextWidth('Student: '), y);
    doc.setFont('helvetica', 'normal');
    y += lineH + 2;

    doc.text('Teacher/Mentor: ', margin, y);
    y += lineH + 4;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 128);
    doc.text('WEEKLY REPORT', PAGE_W_MM / 2, y, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    y += lineH + 4;

    const weekRange = weekStartDate ? formatWeekRange(weekStartDate) : '';
    const reportGen = weekStartDate ? formatReportGenerated(weekStartDate) : '';
    doc.text(`Week Commencing: ${weekRange}`, margin, y);
    y += lineH;
    doc.setFont('helvetica', 'bold');
    doc.text(`Report Generated: ${reportGen}`, margin, y);
    doc.setFont('helvetica', 'normal');
    y += lineH + 6;

    if (weeklyReportNotes.trim()) {
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(weeklyReportNotes.trim(), PAGE_W_MM - 2 * margin);
      lines.forEach((line: string) => {
        doc.text(line, margin, y);
        y += lineH;
      });
      y += 6;
    }

    const boxGap = 8;
    const boxWidth = (PAGE_W_MM - 2 * margin - boxGap) / 2;
    const boxLeftX = margin;
    const boxRightX = margin + boxWidth + boxGap;
    const boxHeaderH = 8;
    const rowH = 6;
    const boxRadiusPct = 0.4;
    const kappa = 0.5522847498;

    const rectTopRounded = (xx: number, yy: number, w: number, h: number, r: number, style: 'F' | 'S') => {
      const rad = Math.min(r, h / 2);
      const k = rad * kappa;
      doc.moveTo(xx + rad, yy);
      doc.lineTo(xx + w - rad, yy);
      doc.curveTo(xx + w - rad + k, yy, xx + w, yy + rad - k, xx + w, yy + rad);
      doc.lineTo(xx + w, yy + h);
      doc.lineTo(xx, yy + h);
      doc.lineTo(xx, yy + rad);
      doc.curveTo(xx, yy + rad - k, xx + rad - k, yy, xx + rad, yy);
      if (style === 'F') doc.fill(); else doc.stroke();
    };

    const drawBox = (x: number, title: string, rows: [string, string][]) => {
      const rowCount = rows.length;
      const boxH = boxHeaderH + rowCount * rowH + 4;
      const rFull = Math.min(boxWidth, boxH) * boxRadiusPct;
      const rHeader = Math.min(rFull, boxHeaderH / 2);
      doc.setFillColor(100, 149, 237);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      rectTopRounded(x, y, boxWidth, boxHeaderH, rHeader, 'F');
      doc.text(title, x + 3, y + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const bodyTop = boxHeaderH;
      rows.forEach(([label, value], i) => {
        doc.setFontSize(7);
        doc.text(label, x + 3, y + bodyTop + (i + 1) * rowH);
        doc.text(value, x + boxWidth - 3, y + bodyTop + (i + 1) * rowH, { align: 'right' });
      });
      return boxH;
    };

    const drawEngagementBox = (x: number, title: string, eng: WeeklyReportSummary['engagement']) => {
      const leftRows: [string, string][] = [
        ['Good', String(eng.good)],
        ['Fair', String(eng.fair)],
        ['Average', String(eng.average)],
        ['Poor', String(eng.poor)],
      ];
      const rightRows: [string, string][] = [
        ['Refused', '—'],
        ['Extra Points', '—'],
        ['Total Points', '—'],
        ['Unmarked', String(eng.unmarked)],
      ];
      const rowCount = Math.max(leftRows.length, rightRows.length);
      const boxH = boxHeaderH + rowCount * rowH + 4;
      const rFull = Math.min(boxWidth, boxH) * boxRadiusPct;
      const rHeader = Math.min(rFull, boxHeaderH / 2);
      doc.setFillColor(100, 149, 237);
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      rectTopRounded(x, y, boxWidth, boxHeaderH, rHeader, 'F');
      doc.text(title, x + 3, y + 5.5);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(0, 0, 0);
      const halfW = boxWidth / 2;
      const bodyTop = boxHeaderH;
      leftRows.forEach(([label, value], i) => {
        doc.setFontSize(7);
        doc.text(label, x + 3, y + bodyTop + (i + 1) * rowH);
        doc.text(value, x + halfW - 3, y + bodyTop + (i + 1) * rowH, { align: 'right' });
      });
      rightRows.forEach(([label, value], i) => {
        doc.setFontSize(7);
        doc.text(label, x + halfW + 3, y + bodyTop + (i + 1) * rowH);
        doc.text(value, x + boxWidth - 3, y + bodyTop + (i + 1) * rowH, { align: 'right' });
      });
      return boxH;
    };

    const att = summary.attendance;
    const attendancePct = att.total > 0 ? ((att.present / att.total) * 100).toFixed(1) : '0';
    const attendanceRows: [string, string][] = [
      ['Present', String(att.present)],
      ['Authorised Absences', String(att.authorised)],
      ['Unauthorised Absences', String(att.unauthorised)],
    ];

    const h1 = drawBox(boxLeftX, `Attendance ${attendancePct}%`, attendanceRows);
    const h2 = drawEngagementBox(boxRightX, 'Engagement', summary.engagement);
    y += Math.max(h1, h2) + 6;

    const engCols = ['Date', 'Period', 'Engagement', 'Work undertaken', 'Behaviour'] as const;
    const tableW = PAGE_W_MM - 2 * margin;
    const colW = tableW / engCols.length;
    const tableHeaderH = 7;
    const tableRowH = 6;
    const rTable = Math.min(3, tableHeaderH / 2);
    doc.setFillColor(100, 149, 237);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    rectTopRounded(margin, y, tableW, tableHeaderH, rTable, 'F');
    engCols.forEach((col, i) => {
      doc.text(col, margin + colW * i + 3, y + tableHeaderH / 2 + 1.5);
    });
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    const greenBg = [220, 255, 220] as [number, number, number];
    const beigeBg = [255, 250, 240] as [number, number, number];
    const cellPadX = 4;
    const cellPadY = 1;
    engagementRows.forEach((row, idx) => {
      const bg = idx % 2 === 0 ? greenBg : beigeBg;
      doc.setFillColor(...bg);
      doc.rect(margin, y + tableHeaderH + idx * tableRowH, tableW, tableRowH, 'F');
      doc.setTextColor(0, 0, 0);
      const rowY = y + tableHeaderH + idx * tableRowH;
      doc.text(row.dateLine1 || '—', margin + cellPadX, rowY + cellPadY + 2.5);
      doc.text(row.dateLine2 || '', margin + cellPadX, rowY + cellPadY + 5);
      const periodStr = row.period || '—';
      const engagementStr = row.engagement || '—';
      const workStr = row.workUndertaken ?? '';
      const behaviourStr = row.behaviour ?? '';
      const cellCenterY = rowY + cellPadY + tableRowH / 2 + 1.5;
      doc.text(periodStr, margin + colW + cellPadX, cellCenterY);
      doc.text(engagementStr, margin + colW * 2 + cellPadX, cellCenterY);
      doc.text(workStr, margin + colW * 3 + cellPadX, cellCenterY);
      doc.text(behaviourStr, margin + colW * 4 + cellPadX, cellCenterY);
    });
    if (engagementRows.length === 0) {
      doc.setFillColor(...beigeBg);
      doc.rect(margin, y + tableHeaderH, tableW, tableRowH, 'F');
      doc.text('No engagements recorded for this week.', margin + cellPadX, y + tableHeaderH + cellPadY + tableRowH / 2 + 1.5);
    }
    y += tableHeaderH + Math.max(engagementRows.length, 1) * tableRowH + 4;

    const safeName = (weeklyReportStudentName || 'weekly-report').replace(/\s+/g, '-').replace(/,/g, '');
    doc.save(`weekly-report-${safeName}.pdf`);
    closeWeeklyReportPopup();
  }, [weeklyReportStudentName, weeklyReportNotes, weekStartDate, closeWeeklyReportPopup]);

  const handleGenerateWeeklyReportPdf = useCallback(async () => {
    const studentId = weeklyReportStudentId;
    const monStr = weekStartDate;
    let rows: EngagementTableRow[] = [];
    if (studentId && monStr) {
      try {
        const list = (await executeRequest('get', `/engagements/student/${studentId}`)) as Array<{
          engagementDate?: string | Date;
          session?: string;
          attendance?: boolean;
          absenceType?: string;
          behaviour?: string;
          comment?: string;
          workUndertaken?: string;
        }>;
        if (Array.isArray(list)) {
          const weekStart = new Date(monStr + 'T00:00:00');
          const weekEnd = new Date(weekStart);
          weekEnd.setDate(weekEnd.getDate() + 4);
          weekEnd.setHours(23, 59, 59, 999);
          const inWeek = list.filter((e) => {
            const d = e.engagementDate ? new Date(e.engagementDate) : new Date(0);
            return d >= weekStart && d <= weekEnd;
          });
          const present = inWeek.filter((e) => e.attendance === true).length;
          const authorised = inWeek.filter((e) => e.attendance === false && e.absenceType === 'authorized').length;
          const unauthorised = inWeek.filter((e) => e.attendance === false && e.absenceType === 'unauthorized').length;
          const summary: WeeklyReportSummary = {
            attendance: {
              present,
              authorised,
              unauthorised,
              total: inWeek.length,
            },
            engagement: {
              good: inWeek.filter((e) => e.behaviour === 'Good').length,
              fair: inWeek.filter((e) => e.behaviour === 'Fair').length,
              average: inWeek.filter((e) => e.behaviour === 'Average').length,
              poor: inWeek.filter((e) => e.behaviour === 'Poor').length,
              unmarked: inWeek.filter((e) => !e.behaviour || e.behaviour === 'Unmarked').length,
            },
          };
          rows = inWeek
            .sort((a, b) => {
              const da = a.engagementDate ? new Date(a.engagementDate).getTime() : 0;
              const db = b.engagementDate ? new Date(b.engagementDate).getTime() : 0;
              if (da !== db) return da - db;
              const sa = SESSION_ORDER[String(a.session || '').toLowerCase()] ?? 99;
              const sb = SESSION_ORDER[String(b.session || '').toLowerCase()] ?? 99;
              return sa - sb;
            })
            .map((e) => {
              const { line1, line2 } = formatEngagementDateTwoLines(e.engagementDate ?? '');
              return {
                dateLine1: line1,
                dateLine2: line2,
                period: formatSessionName(e.session ?? ''),
                engagement: e.behaviour ?? '—',
                workUndertaken: e.workUndertaken ?? '',
                behaviour: e.comment ?? '',
              };
            });
          generateWeeklyReportPdf(rows, summary);
          return;
        }
      } catch {
        // fall through to default
      }
    }
    const defaultSummary: WeeklyReportSummary = {
      attendance: { present: 0, authorised: 0, unauthorised: 0, total: 0 },
      engagement: { good: 0, fair: 0, average: 0, poor: 0, unmarked: 0 },
    };
    generateWeeklyReportPdf(rows, defaultSummary);
  }, [weeklyReportStudentId, weekStartDate, executeRequest, generateWeeklyReportPdf]);

  useEffect(() => {
    if (!location && !subject) {
      setClassOptions([]);
      setFilterClass('');
      return;
    }
    const fetchClasses = async () => {
      try {
        const response = await executeRequest('get', '/classes?perPage=1000');
        if (!Array.isArray(response)) return;
        const filtered = (response as ClassData[]).filter((cls) => {
          const matchLoc = !location || cls.location === location;
          const matchSub = !subject || cls.subject === subject;
          return matchLoc && matchSub;
        });
        setClassOptions(
          filtered.map((cls) => ({
            label: `${cls.subject ?? ''} - ${cls.yeargroup ?? ''}`,
            value: cls._id,
          }))
        );
        setFilterClass('');
      } catch {
        setClassOptions([]);
        setFilterClass('');
      }
    };
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, subject]);

  useEffect(() => {
    if (!filterClass) {
      setStudents([]);
      setClassMeta({ subject: '', location: '' });
      return;
    }
    let cancelled = false;
    setLoading(true);
    const fetchClass = async () => {
      try {
        const response = await executeRequest('get', `/classes/${filterClass}`);
        if (cancelled) return;
        const data = response as ClassData;
        const list = Array.isArray(data.students) ? data.students : [];
        setStudents(list);
        setClassMeta({
          subject: data.subject ?? '',
          location: data.location ?? '',
        });
      } catch {
        if (!cancelled) {
          setStudents([]);
          setClassMeta({ subject: '', location: '' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchClass();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterClass]);

  const filterContent = (
    <div className="reports-page__weekly-filters">
      <div className="reports-page__weekly-filter-item">
        <DateInput
          label="Week (Mon–Fri)"
          name="week"
          value={weekStartDate}
          onChange={(e) => setWeekStartDate(getMondayOfWeek(e.target.value || ''))}
        />
        {weekStartDate && (
          <p className="reports-page__weekly-week-range" aria-live="polite">
            {formatWeekRange(weekStartDate)}
          </p>
        )}
      </div>
      <div className="reports-page__weekly-filter-item">
        <Select
          label="Location"
          name="location"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          options={LOCATION_OPTIONS}
          placeholder="Select Location"
          icon={locationIcon}
        />
      </div>
      <div className="reports-page__weekly-filter-item">
        <Select
          label="Subject"
          name="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          options={SUBJECT_OPTIONS}
          placeholder="Select Subject"
          icon={Subject}
        />
      </div>
      <div className="reports-page__weekly-filter-item">
        <Select
          label="Class/Provision"
          name="class"
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
          options={classOptions}
          placeholder="Select Class/Provision"
          icon={Class}
          disabled={classOptions.length === 0}
        />
      </div>
    </div>
  );

  const tableData = useMemo(() => {
    const sub = classMeta.subject;
    const loc = classMeta.location;
    return students.map((s) => {
      const p = s.personalInfo ?? {};
      const name = [p.legalFirstName, p.middleName, p.lastName].filter(Boolean).join(' ').trim() || '—';
      const dob = p.dateOfBirth;
      let dateStr = '—';
      if (dob) {
        const isoDate = typeof dob === 'string' ? (dob.includes('T') ? dob.split('T')[0] : dob) : new Date(dob).toISOString().split('T')[0];
        const [y, m, d] = isoDate.split('-');
        dateStr = d && m && y ? `${d}/${m}/${y}` : isoDate;
      }
      return {
        _id: s._id,
        studentName: name,
        yearGroup: p.yearGroup ?? '—',
        sex: p.sex ?? '—',
        dateOfBirth: dateStr,
        subject: sub || '—',
        location: (p.location ?? loc) || '—',
        hasEHCP: s.medical?.ehcp?.hasEHCP === true,
      };
    });
  }, [students, classMeta]);

  const columns = useMemo(
    () => [
      { header: 'Student name', accessor: 'studentName', sortable: true, type: 'string' as const },
      { header: 'Year group', accessor: 'yearGroup', sortable: true, type: 'string' as const },
      { header: 'Sex', accessor: 'sex', sortable: true, type: 'string' as const },
      { header: 'Date of birth', accessor: 'dateOfBirth', sortable: true, type: 'string' as const },
      { header: 'Subject', accessor: 'subject', sortable: false, type: 'string' as const },
      { header: 'Location', accessor: 'location', sortable: false, type: 'string' as const },
      {
        header: 'EHCP',
        accessor: 'hasEHCP',
        sortable: false,
        type: 'template' as const,
        template: (row: Record<string, unknown>) =>
          row.hasEHCP === true ? (
            <FontAwesomeIcon icon={faCheck} style={{ color: '#22c55e' }} title="Has EHCP" />
          ) : (
            <FontAwesomeIcon icon={faTimes} style={{ color: '#ef4444' }} title="No EHCP" />
          ),
      },
      {
        header: '',
        accessor: 'download',
        sortable: false,
        type: 'template' as const,
        template: (row: Record<string, unknown>) => (
          <button
            type="button"
            className="reports-page__download-row-btn"
            onClick={() => {
              if (!row._id) return;
              setWeeklyReportStudentName((row.studentName as string) ?? '');
              setWeeklyReportStudentId((row._id as string) ?? null);
              setWeeklyReportNotes('');
              setWeeklyReportPopupOpen(true);
            }}
            title="Download weekly report"
            aria-label="Download report"
          >
            <FontAwesomeIcon icon={faDownload} />
          </button>
        ),
      },
    ],
    []
  );

  return (
    <div className="reports-page__panel reports-page__weekly">
      <FilterSec secName="Students filter" content={filterContent} retractable />
      {loading ? (
        <p className="reports-page__incidents-loading">Loading…</p>
      ) : !filterClass ? (
        <p className="reports-page__incidents-empty">Select location, subject and class to view students.</p>
      ) : !students.length ? (
        <p className="reports-page__incidents-empty">No students in this class.</p>
      ) : (
        <div className="reports-page__incidents-table-wrap">
          <DataTable
            columns={columns}
            data={tableData}
            title=""
            onEdit={() => {}}
            showActions={false}
            addButton={false}
            showSearch={true}
          />
        </div>
      )}
      <Popup
        isOpen={weeklyReportPopupOpen}
        onClose={closeWeeklyReportPopup}
        onConfirm={handleGenerateWeeklyReportPdf}
        title={`Weekly report – ${weeklyReportStudentName || 'Student'}`}
        confirmText="OK (Generate PDF)"
        cancelText="Cancel"
        width="480px"
      >
        <div className="reports-page__weekly-report-popup-body">
          <TextField
            label="Notes"
            name="weeklyReportNotes"
            value={weeklyReportNotes}
            onChange={(e) => setWeeklyReportNotes(e.target.value)}
            placeholder="Add notes for the weekly report…"
            rows={6}
          />
        </div>
      </Popup>
    </div>
  );
};

const Reports: React.FC = () => {
  const [activeTab, setActiveTab] = useState('incidents');

  const tabs = [
    { id: 'incidents', label: 'Incidents', content: <ReportsListTab reportType="incident" /> },
    { id: 'safeguarding', label: 'Safeguarding', content: <ReportsListTab reportType="safeguarding" /> },
    { id: 'weekly', label: 'Weekly reports', content: <WeeklyReportTab /> },
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
