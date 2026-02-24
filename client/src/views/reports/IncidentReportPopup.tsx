import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import Popup from '../../components/Popup/Popup';
import { useApiRequest } from '../../hooks/useApiRequest';
import './IncidentReportPopup.scss';
import logo from '/logo.png';

type Parent = { firstName?: string; lastName?: string; relationship?: string; mobile?: string; homePhone?: string; workPhone?: string; email?: string; notes?: string };
type EmergencyContact = { name?: string; relationship?: string; dayPhone?: string; eveningPhone?: string; mobile?: string; email?: string; notes?: string };

const SEVERITY_LABELS: Record<number, string> = { 1: 'Low', 2: 'Medium', 3: 'High' };
const SEVERITY_COLOR_NAMES: Record<number, string> = { 1: 'Green', 2: 'Amber', 3: 'Red' };

const PAGE_W = 210;
const MARGIN = 5;
const BOX_GRAY = [1, 1, 1] as [number, number, number];
const HEADER_GRAY = [0.88, 0.88, 0.88] as [number, number, number];
const ATTACH_BG = [0.85, 0.92, 1] as [number, number, number];
const ATTACH_TEXT = [0.2, 0.4, 0.8] as [number, number, number];
const FOOTER_GRAY = [0.35, 0.35, 0.35] as [number, number, number];
const ORG_NAME = 'Achieve Group';

type IncidentForReport = {
  _id: string;
  number?: number;
  location?: string;
  dateAndTime?: string;
  description?: string;
  status?: boolean;
  commentary?: { severity?: number; direction?: string; behavior?: string };
  directedToward?: string[];
  restrainDescription?: string;
  action?: string[];
  actionDescription?: string;
  conclusion?: string[];
  period?: { name?: string };
  staff?: { name?: string; profile?: { firstName?: string; lastName?: string } };
  staffList?: Array<{ name?: string; profile?: { firstName?: string; lastName?: string } }>;
};

export type IncidentReportPopupProps = {
  isOpen: boolean;
  onClose: () => void;
  incident: IncidentForReport | null;
  studentName: string;
  studentId?: string;
};

function formatDate(d: string | undefined): string {
  if (!d) return '';
  try {
    const date = new Date(d);
    return date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function formatStaff(staff: IncidentForReport['staff'], staffList?: IncidentForReport['staffList']): string {
  if (staff?.name) return staff.name;
  if (staff?.profile) return [staff.profile.firstName, staff.profile.lastName].filter(Boolean).join(' ') || '';
  if (staffList?.length) {
    const first = staffList[0];
    if (first?.name) return first.name;
    if (first?.profile) return [first.profile.firstName, first.profile.lastName].filter(Boolean).join(' ') || '';
  }
  return '';
}

function formatParentGuardian(parents: Parent[] | undefined): { name: string; notes: string } {
  if (!parents?.length) return { name: '', notes: '' };
  const names = parents.map((p) => [p.firstName, p.lastName].filter(Boolean).join(' ').trim() + (p.relationship ? ` (${p.relationship})` : '')).filter(Boolean);
  const notes = parents.map((p) => [p.mobile && `Mobile: ${p.mobile}`, p.homePhone && `Home: ${p.homePhone}`, p.workPhone && `Work: ${p.workPhone}`, p.email && `Email: ${p.email}`, p.notes].filter(Boolean).join('; ')).filter(Boolean).join('\n');
  return { name: names.join(', ') || '—', notes: notes || '—' };
}

function formatExternalContact(contacts: EmergencyContact[] | undefined): { name: string; notes: string } {
  if (!contacts?.length) return { name: '', notes: '' };
  const names = contacts.map((c) => (c.name || '—') + (c.relationship ? ` (${c.relationship})` : ''));
  const notes = contacts.map((c) => [c.mobile && `Mobile: ${c.mobile}`, c.dayPhone && `Day: ${c.dayPhone}`, c.eveningPhone && `Evening: ${c.eveningPhone}`, c.email && `Email: ${c.email}`, c.notes].filter(Boolean).join('; ')).filter(Boolean).join('\n');
  return { name: names.join(', ') || '—', notes: notes || '—' };
}

export const IncidentReportPopup: React.FC<IncidentReportPopupProps> = ({
  isOpen,
  onClose,
  incident,
  studentName,
  studentId,
}) => {
  const { executeRequest } = useApiRequest();
  const [form, setForm] = useState({
    studentName: '',
    date: '',
    period: '',
    staff: '',
    location: '',
    status: 'Open',
    description: '',
    dayBookId: '',
    severity: 'Low',
    directedToward: '',
    behaviour: '',
    subject: '',
    restrainDetails: '',
    interventionEffective: '',
    resolutionConsequences: '',
    bestInterestStudent: '',
    studentReflection: '',
    actionDetails: '',
    parentGuardianName: '',
    parentGuardianNotes: '',
    externalContactName: '',
    externalContactNotes: '',
  });

  useEffect(() => {
    if (!incident) return;
    const severity = incident.commentary?.severity ?? 1;
    const conclusion = (incident.conclusion ?? []).filter(Boolean).join('\n');
    const actionDesc = incident.actionDescription ?? '';
    setForm((prev) => ({
      ...prev,
      studentName,
      date: formatDate(incident.dateAndTime),
      period: incident.period?.name ?? '',
      staff: formatStaff(incident.staff, incident.staffList),
      location: incident.location ?? '',
      status: incident.status ? 'Open' : 'Closed',
      description: incident.description ?? '',
      dayBookId: String(incident.number ?? ''),
      severity: SEVERITY_COLOR_NAMES[severity] ?? SEVERITY_LABELS[severity] ?? 'Low',
      directedToward: incident.commentary?.direction?.trim() || (Array.isArray(incident.directedToward) && incident.directedToward.length ? incident.directedToward.join(', ') : '') || '',
      behaviour: incident.commentary?.behavior ?? '',
      subject: prev.subject || '',
      restrainDetails: incident.restrainDescription ?? '',
      interventionEffective: prev.interventionEffective || '',
      resolutionConsequences: conclusion || actionDesc,
      bestInterestStudent: prev.bestInterestStudent || '',
      studentReflection: prev.studentReflection || '',
      actionDetails: (incident.action ?? []).concat(actionDesc).filter(Boolean).join(', ') || '',
      parentGuardianName: '',
      parentGuardianNotes: '',
      externalContactName: '',
      externalContactNotes: '',
    }));
  }, [incident, studentName, isOpen]);

  useEffect(() => {
    if (!isOpen || !studentId) return;
    let cancelled = false;
    const loadStudent = async () => {
      try {
        const student = await executeRequest('get', `/students/${studentId}`, undefined, { silent: true });
        if (cancelled || !student) return;
        const parents = (student as { parents?: Parent[] }).parents;
        const emergencyContacts = (student as { emergencyContacts?: EmergencyContact[] }).emergencyContacts;
        const pg = formatParentGuardian(parents);
        const ext = formatExternalContact(emergencyContacts);
        setForm((prev) => ({
          ...prev,
          parentGuardianName: pg.name || prev.parentGuardianName,
          parentGuardianNotes: pg.notes || prev.parentGuardianNotes,
          externalContactName: ext.name || prev.externalContactName,
          externalContactNotes: ext.notes || prev.externalContactNotes,
        }));
      } catch {
        if (!cancelled) {
          setForm((prev) => ({ ...prev }));
        }
      }
    };
    loadStudent();
    return () => { cancelled = true; };
  }, [isOpen, studentId]);

  const generatePdf = () => {
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageH = 297;
    let y = MARGIN;
    const lineH = 5;
    const boxH = 7;
    const colW = (PAGE_W - MARGIN * 2 - 4) / 2;
    const leftX = MARGIN;
    const rightX = MARGIN + colW + 4;
    form.dayBookId=incident?.number?.toString() ?? '';
    const logoDataUrl = logo;

    const printDate = new Date().toLocaleString(undefined, { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

    // ----- Header: date left, "Slip Print" right
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    doc.text(printDate, leftX, y);
    doc.text('Slip Print', PAGE_W - MARGIN, y, { align: 'right' });
    y += 8;

    // ----- Logo area (simple hexagon placeholder) + Title "Incident" + "Achieve Group"
    doc.setFillColor(...HEADER_GRAY);
    // Draw the logo in the PDF at the leftX position.
    // Make sure to have the logo loaded as a dataUrl image somewhere in scope, e.g., as `logoDataUrl`.
    // Place the logo as a 12x12 mm image (same as the hexagon placeholder was).
    if (typeof logoDataUrl === 'string' && logoDataUrl) {
      doc.addImage(logoDataUrl, 'PNG', leftX, y, 12, 12);
    }
    // doc.roundedRect(leftX, y, 12, 12, 1, 1, 'F');
    doc.setFontSize(18);
    doc.setFont('times new roman', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text('Incident', leftX , y + 20);
    doc.setFontSize(10);
    doc.setFont('times new roman', 'normal');
    doc.text(ORG_NAME, PAGE_W - MARGIN, y + 20, { align: 'right' });
    y += 30;
    
    const drawLabelValueBox = (x: number, label: string, value: string, width: number) => {
      const labelPart = `${label}: `;
      doc.setFontSize(valueFont);
      doc.setTextColor(0, 0, 0);
      doc.setFont('times new roman', 'bold');
      doc.text(labelPart, x, y + 4);
      const labelWidth = doc.getTextWidth(labelPart);
      doc.setFont('times new roman', 'normal');
      const valueStr = value || '—';
      const valueLines = doc.splitTextToSize(valueStr, width - labelWidth);
      valueLines.forEach((line: string, i: number) => {
        doc.text(line, i === 0 ? x + labelWidth : x, y + 4 + i * lineH);
      });
      y += 1 + valueLines.length * lineH;
    };

    // ----- Border with "Slip (5)" in the top border (line interrupted by text)
    const yBoxStart = y;
    const boxPadding = 4;
    const boxWidth = PAGE_W - MARGIN * 2;
    const slipText = `Slip (${form.dayBookId || '—'})`;
    doc.setFontSize(10);
    doc.setFont('times new roman', 'bold');
    doc.setTextColor(60, 60, 60);
    const slipTextWidth = doc.getTextWidth(slipText);
    const slipGap = 4;
    // Draw "Slip (5)" aligned with top border (slightly above the line so it breaks the border)
    doc.text(slipText, leftX + boxPadding, yBoxStart+1 );

    // Content starts below the top border
    y = yBoxStart + 3;

    // ----- Two-column key-value boxes
    const labelFont = 9;
    const valueFont = 9;
    const leftPairs: [string, string][] = [
      ['Student', form.studentName || '—'],
      ['Period', form.period || '—'],
      ['Subject', form.subject || '—'],
      ['Status', form.status || '—'],
      ['Description', form.description || '—'],
      ['Day Book Id', form.dayBookId || '—'],
    ];
    const rightPairs: [string, string][] = [
      ['Date', form.date || '—'],
      ['Staff', form.staff || '—'],
      ['Location', form.location || '—'],
    ];

    const yStartRow = y;
    leftPairs.forEach(([label, value]) => drawLabelValueBox(leftX + boxPadding, label, value, colW - boxPadding));
    const yAfterLeft = y;
    y = yStartRow;
    rightPairs.forEach(([label, value]) => drawLabelValueBox(rightX+15, label, value, colW - boxPadding));
    y = Math.max(y, yAfterLeft);

    const yBottom = y;

    // ----- Border: top in two segments (gap where "Slip (5)" sits), then left, bottom, right
    doc.setDrawColor(180, 180, 180);
    doc.line(leftX, yBoxStart, leftX + boxPadding, yBoxStart);
    doc.line(leftX + boxPadding + slipTextWidth + slipGap, yBoxStart, leftX + boxWidth, yBoxStart);
    doc.line(leftX, yBoxStart, leftX, yBottom);
    doc.line(leftX + boxWidth, yBoxStart, leftX + boxWidth, yBottom);
    doc.line(leftX, yBottom, leftX + boxWidth, yBottom);

    y += 4;

    // ----- Level of Severity box (label in top border, like Slip)
    y += 2;
    const ySeverityStart = y;
    const severityLabel = 'Level of Severity';
    doc.setFontSize(10);
    doc.setFont('times new roman', 'bold');
    doc.setTextColor(60, 60, 60);
    const severityLabelWidth = doc.getTextWidth(severityLabel);
    const severityGap = 4;
    doc.text(severityLabel, leftX + boxPadding, ySeverityStart +1);

    y = ySeverityStart + 6;
    doc.setFontSize(valueFont);
    doc.setTextColor(0, 0, 0);
    doc.text(form.severity || '—', leftX + boxPadding, y + 4);
    y += lineH + boxPadding;

    const ySeverityBottom = y;
    doc.setDrawColor(180, 180, 180);
    doc.line(leftX, ySeverityStart, leftX + boxPadding, ySeverityStart);
    doc.line(leftX + boxPadding + severityLabelWidth + severityGap, ySeverityStart, leftX + boxWidth, ySeverityStart);
    doc.line(leftX, ySeverityStart, leftX, ySeverityBottom);
    doc.line(leftX + boxWidth, ySeverityStart, leftX + boxWidth, ySeverityBottom);
    doc.line(leftX, ySeverityBottom, leftX + boxWidth, ySeverityBottom);

    y += 4;

    // ----- Incident Directed Towards box (label in top border, like Level of Severity)
    y += 4;
    const yDirectedStart = y;
    const directedLabel = 'Incident Directed Towards';
    doc.setFontSize(10);
    doc.setFont('times new roman', 'bold');
    doc.setTextColor(60, 60, 60);
    const directedLabelWidth = doc.getTextWidth(directedLabel);
    doc.text(directedLabel, leftX + boxPadding, yDirectedStart + 1);

    y = yDirectedStart + 6;
    doc.setFontSize(valueFont);
    doc.setFont('times new roman', 'normal');
    doc.setTextColor(0, 0, 0);
    doc.text(form.directedToward || '—', leftX + boxPadding, y + 4);
    y += lineH + boxPadding;

    const yDirectedBottom = y;
    doc.setDrawColor(180, 180, 180);
    doc.line(leftX, yDirectedStart, leftX + boxPadding, yDirectedStart);
    doc.line(leftX + boxPadding + directedLabelWidth + severityGap, yDirectedStart, leftX + boxWidth, yDirectedStart);
    doc.line(leftX, yDirectedStart, leftX, yDirectedBottom);
    doc.line(leftX + boxWidth, yDirectedStart, leftX + boxWidth, yDirectedBottom);
    doc.line(leftX, yDirectedBottom, leftX + boxWidth, yDirectedBottom);

    y += 4;

    // ----- Restraint Details box (label in top border, like Level of Severity)
    y += 4;
    const yRestraintStart = y;
    const restraintLabel = 'Restraint Details';
    doc.setFontSize(10);
    doc.setFont('times new roman', 'bold');
    doc.setTextColor(60, 60, 60);
    const restraintLabelWidth = doc.getTextWidth(restraintLabel);
    doc.text(restraintLabel, leftX + boxPadding, yRestraintStart + 1);

    y = yRestraintStart + 6;
    doc.setFontSize(valueFont);
    doc.setFont('times new roman', 'normal');
    doc.setTextColor(0, 0, 0);
    const restraintParts = [
      form.restrainDetails && `Restraint details: ${form.restrainDetails}`,
      form.interventionEffective && `How effective was the physical intervention? ${form.interventionEffective}`,
      form.resolutionConsequences && `How was the incident resolved and what were the consequences? ${form.resolutionConsequences}`,
      form.bestInterestStudent && `How was the physical intervention in the best interest of the student? ${form.bestInterestStudent}`,
      form.studentReflection && `Student reflection: ${form.studentReflection}`,
    ].filter(Boolean);
    const restraintContent = restraintParts.length ? restraintParts.join('\n\n') : '—';
    const restraintLines = doc.splitTextToSize(restraintContent, boxWidth - boxPadding * 2);
    restraintLines.forEach((line: string, i: number) => {
      doc.text(line, leftX + boxPadding, y + 4 + i * lineH);
    });
    y += 4 + restraintLines.length * lineH + boxPadding;

    const yRestraintBottom = y;
    doc.setDrawColor(180, 180, 180);
    doc.line(leftX, yRestraintStart, leftX + boxPadding, yRestraintStart);
    doc.line(leftX + boxPadding + restraintLabelWidth + severityGap, yRestraintStart, leftX + boxWidth, yRestraintStart);
    doc.line(leftX, yRestraintStart, leftX, yRestraintBottom);
    doc.line(leftX + boxWidth, yRestraintStart, leftX + boxWidth, yRestraintBottom);
    doc.line(leftX, yRestraintBottom, leftX + boxWidth, yRestraintBottom);

    y += 4;

    // ----- Parent/Guardian Contact box (label in top border, like Level of Severity)
    y += 4;
    const yParentStart = y;
    const parentLabel = 'Parent/Guardian Contact';
    doc.setFontSize(10);
    doc.setFont('times new roman', 'bold');
    doc.setTextColor(60, 60, 60);
    const parentLabelWidth = doc.getTextWidth(parentLabel);
    doc.text(parentLabel, leftX + boxPadding, yParentStart + 1);

    y = yParentStart + 6;
    doc.setFontSize(valueFont);
    doc.setFont('times new roman', 'normal');
    doc.setTextColor(0, 0, 0);
    const parentParts = [
      form.parentGuardianName && `Parent/guardian name: ${form.parentGuardianName}`,
      form.parentGuardianNotes && `Parent/guardian contact notes: ${form.parentGuardianNotes}`,
    ].filter(Boolean);
    const parentContent = parentParts.length ? parentParts.join('\n\n') : '—';
    const parentLines = doc.splitTextToSize(parentContent, boxWidth - boxPadding * 2);
    parentLines.forEach((line: string, i: number) => {
      doc.text(line, leftX + boxPadding, y + 4 + i * lineH);
    });
    y += 4 + parentLines.length * lineH + boxPadding;

    const yParentBottom = y;
    doc.setDrawColor(180, 180, 180);
    doc.line(leftX, yParentStart, leftX + boxPadding, yParentStart);
    doc.line(leftX + boxPadding + parentLabelWidth + severityGap, yParentStart, leftX + boxWidth, yParentStart);
    doc.line(leftX, yParentStart, leftX, yParentBottom);
    doc.line(leftX + boxWidth, yParentStart, leftX + boxWidth, yParentBottom);
    doc.line(leftX, yParentBottom, leftX + boxWidth, yParentBottom);

    y += 4;

    // ----- External Contact box (label in top border, like Level of Severity)
    y += 4;
    const yExternalStart = y;
    const externalLabel = 'External Contact';
    doc.setFontSize(10);
    doc.setFont('times new roman', 'bold');
    doc.setTextColor(60, 60, 60);
    const externalLabelWidth = doc.getTextWidth(externalLabel);
    doc.text(externalLabel, leftX + boxPadding, yExternalStart + 1);

    y = yExternalStart + 6;
    doc.setFontSize(valueFont);
    doc.setFont('times new roman', 'normal');
    doc.setTextColor(0, 0, 0);
    const externalParts = [
      form.externalContactName && `Contact name: ${form.externalContactName}`,
      form.externalContactNotes && `External contact notes: ${form.externalContactNotes}`,
    ].filter(Boolean);
    const externalContent = externalParts.length ? externalParts.join('\n\n') : '—';
    const externalLines = doc.splitTextToSize(externalContent, boxWidth - boxPadding * 2);
    externalLines.forEach((line: string, i: number) => {
      doc.text(line, leftX + boxPadding, y + 4 + i * lineH);
    });
    y += 4 + externalLines.length * lineH + boxPadding;

    const yExternalBottom = y;
    doc.setDrawColor(180, 180, 180);
    doc.line(leftX, yExternalStart, leftX + boxPadding, yExternalStart);
    doc.line(leftX + boxPadding + externalLabelWidth + severityGap, yExternalStart, leftX + boxWidth, yExternalStart);
    doc.line(leftX, yExternalStart, leftX, yExternalBottom);
    doc.line(leftX + boxWidth, yExternalStart, leftX + boxWidth, yExternalBottom);
    doc.line(leftX, yExternalBottom, leftX + boxWidth, yExternalBottom);

    y += 4;

    // ----- Action Details box (label in top border, like Level of Severity)
    y += 4;
    const yActionStart = y;
    const actionLabel = 'Action Details';
    doc.setFontSize(10);
    doc.setFont('times new roman', 'bold');
    doc.setTextColor(60, 60, 60);
    const actionLabelWidth = doc.getTextWidth(actionLabel);
    doc.text(actionLabel, leftX + boxPadding, yActionStart + 1);

    y = yActionStart + 6;
    doc.setFontSize(valueFont);
    doc.setFont('times new roman', 'normal');
    doc.setTextColor(0, 0, 0);
    const actionContent = form.actionDetails || '—';
    const actionLines = doc.splitTextToSize(actionContent, boxWidth - boxPadding * 2);
    actionLines.forEach((line: string, i: number) => {
      doc.text(line, leftX + boxPadding, y + 4 + i * lineH);
    });
    y += 4 + actionLines.length * lineH + boxPadding;

    const yActionBottom = y;
    doc.setDrawColor(180, 180, 180);
    doc.line(leftX, yActionStart, leftX + boxPadding, yActionStart);
    doc.line(leftX + boxPadding + actionLabelWidth + severityGap, yActionStart, leftX + boxWidth, yActionStart);
    doc.line(leftX, yActionStart, leftX, yActionBottom);
    doc.line(leftX + boxWidth, yActionStart, leftX + boxWidth, yActionBottom);
    doc.line(leftX, yActionBottom, leftX + boxWidth, yActionBottom);

    y += 4;

    // // ----- Section helper
    // const sectionHeader = (title: string) => {
    //   doc.setFillColor(...HEADER_GRAY);
    //   doc.rect(leftX, y, PAGE_W - MARGIN * 2, 6, 'F');
    //   doc.setFontSize(10);
    //   doc.setFont('helvetica', 'bold');
    //   doc.setTextColor(0, 0, 0);
    //   doc.text(title, leftX + 2, y + 4);
    //   y += 8;
    // };
    // const sectionBox = (content: string, opts?: { height?: number }) => {
    //   const h = opts?.height ?? Math.min(content.split('\n').length * lineH + 4, 25);
    //   doc.setFillColor(...BOX_GRAY);
    //   doc.rect(leftX, y, PAGE_W - MARGIN * 2, h, 'F');
    //   doc.setFontSize(valueFont);
    //   doc.setTextColor(0, 0, 0);
    //   const lines = doc.splitTextToSize(content || '—', PAGE_W - MARGIN * 2 - 4);
    //   lines.slice(0, Math.floor((h - 4) / lineH)).forEach((line: string, i: number) => {
    //     doc.text(line, leftX + 2, y + 4 + i * lineH);
    //   });
    //   y += h + 4;
    // };

    // sectionHeader('Level of Severity');
    // sectionBox(form.severity, { height: boxH });

    // sectionHeader('Incident Directed Towards');
    // sectionBox(form.directedToward || '—', { height: boxH });

    // sectionHeader('Behaviour');
    // sectionBox(form.behaviour || '—', { height: boxH });

    // sectionHeader('Restraint Details');
    // const restraintContent = [
    //   'How effective was the physical intervention?',
    //   form.interventionEffective || '',
    //   'How was the incident resolved and what were the consequences?',
    //   form.resolutionConsequences || '',
    //   'How was the physical intervention in the best interest of the student?',
    //   form.bestInterestStudent || '',
    //   'Student reflection',
    //   form.studentReflection || '',
    // ].join('\n');
    // sectionBox(restraintContent || '—', { height: 32 });

    // sectionHeader('Parent/Guardian Contact');
    // sectionBox(`Parent/guardian name\n${form.parentGuardianName || ''}\nParent/guardian contact notes\n${form.parentGuardianNotes || ''}`, { height: 22 });

    // sectionHeader('External Contact');
    // sectionBox(`Contact name\n${form.externalContactName || ''}\nExternal contact notes\n${form.externalContactNotes || ''}`, { height: 22 });

    // sectionHeader('Action Details');
    // sectionBox(`Action taken and by whom\n${form.actionDetails || '—'}`, { height: 20 });

    // sectionHeader('Attachments');
    // doc.setFillColor(...ATTACH_BG);
    // doc.rect(leftX, y, PAGE_W - MARGIN * 2, 12, 'F');
    // doc.setFontSize(9);
    // doc.setTextColor(...ATTACH_TEXT);
    // doc.text('Please attach any relevant supplemental documents relating to this Behavioural Incident, if required.', leftX + 2, y + 7, { maxWidth: PAGE_W - MARGIN * 2 - 4 });
    // y += 16;

    // // ----- Footer
    // if (y < pageH - 18) {
    //   doc.setFillColor(...FOOTER_GRAY);
    //   doc.rect(0, pageH - 12, PAGE_W, 12, 'F');
    //   doc.setFontSize(9);
    //   doc.setTextColor(255, 255, 255);
    //   doc.text('Page 1 / 1', MARGIN, pageH - 5);
    // }

    const filename = `incident-report-${(form.studentName || 'student').replace(/\s+/g, '-')}-${form.dayBookId || 'report'}.pdf`;
    doc.save(filename);
  };

  const handleConfirm = () => {
    generatePdf();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Popup
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={`Incident Report – ${studentName || 'Student'}`}
      confirmText="OK (Generate PDF)"
      cancelText="Cancel"
      width="70%"
      height="85vh"
    >
      <div className="incident-report-popup">
        <p className="incident-report-popup__hint">Review and edit the report below. Click OK to generate the PDF.</p>
        <div className="incident-report-popup__form">
          <div className="incident-report-popup__row">
            <label>Student</label>
            <input
              type="text"
              value={form.studentName}
              onChange={(e) => setForm((f) => ({ ...f, studentName: e.target.value }))}
            />
          </div>
          <div className="incident-report-popup__row">
            <label>Date</label>
            <input
              type="text"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
            />
          </div>
          <div className="incident-report-popup__row">
            <label>Period</label>
            <input
              type="text"
              value={form.period}
              onChange={(e) => setForm((f) => ({ ...f, period: e.target.value }))}
            />
          </div>
          <div className="incident-report-popup__row">
            <label>Staff</label>
            <input
              type="text"
              value={form.staff}
              onChange={(e) => setForm((f) => ({ ...f, staff: e.target.value }))}
            />
          </div>
          <div className="incident-report-popup__row">
            <label>Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
            />
          </div>
          <div className="incident-report-popup__row">
            <label>Status</label>
            <input
              type="text"
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
            />
          </div>
          <div className="incident-report-popup__row">
            <label>Subject</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
              placeholder="e.g. Motor Vehicle"
            />
          </div>
          <div className="incident-report-popup__row">
            <label>Day Book Id</label>
            <input
              type="text"
              value={form.dayBookId}
              onChange={(e) => setForm((f) => ({ ...f, dayBookId: e.target.value }))}
            />
          </div>
          <div className="incident-report-popup__row incident-report-popup__row--full">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={4}
            />
          </div>
          <div className="incident-report-popup__row">
            <label>Level of Severity</label>
            <input
              type="text"
              value={form.severity}
              onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
              placeholder="e.g. Red, Amber, Green"
            />
          </div>
          <div className="incident-report-popup__row">
            <label>Incident Directed Towards</label>
            <input
              type="text"
              value={form.directedToward}
              onChange={(e) => setForm((f) => ({ ...f, directedToward: e.target.value }))}
            />
          </div>
          <div className="incident-report-popup__row">
            <label>Behaviour</label>
            <input
              type="text"
              value={form.behaviour}
              onChange={(e) => setForm((f) => ({ ...f, behaviour: e.target.value }))}
            />
          </div>
          <div className="incident-report-popup__row incident-report-popup__row--full">
            <label>Restraint Details</label>
            <textarea
              value={form.restrainDetails}
              onChange={(e) => setForm((f) => ({ ...f, restrainDetails: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="incident-report-popup__row incident-report-popup__row--full">
            <label>How effective was the physical intervention?</label>
            <textarea
              value={form.interventionEffective}
              onChange={(e) => setForm((f) => ({ ...f, interventionEffective: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="incident-report-popup__row incident-report-popup__row--full">
            <label>How was the incident resolved and what were the consequences?</label>
            <textarea
              value={form.resolutionConsequences}
              onChange={(e) => setForm((f) => ({ ...f, resolutionConsequences: e.target.value }))}
              rows={3}
            />
          </div>
          <div className="incident-report-popup__row incident-report-popup__row--full">
            <label>How was the physical intervention in the best interest of the student?</label>
            <textarea
              value={form.bestInterestStudent}
              onChange={(e) => setForm((f) => ({ ...f, bestInterestStudent: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="incident-report-popup__row incident-report-popup__row--full">
            <label>Student reflection</label>
            <textarea
              value={form.studentReflection}
              onChange={(e) => setForm((f) => ({ ...f, studentReflection: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="incident-report-popup__row incident-report-popup__row--full">
            <label>Parent/Guardian Contact – Name</label>
            <input
              type="text"
              value={form.parentGuardianName}
              onChange={(e) => setForm((f) => ({ ...f, parentGuardianName: e.target.value }))}
            />
          </div>
          <div className="incident-report-popup__row incident-report-popup__row--full">
            <label>Parent/Guardian Contact – Notes</label>
            <textarea
              value={form.parentGuardianNotes}
              onChange={(e) => setForm((f) => ({ ...f, parentGuardianNotes: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="incident-report-popup__row incident-report-popup__row--full">
            <label>External Contact – Name</label>
            <input
              type="text"
              value={form.externalContactName}
              onChange={(e) => setForm((f) => ({ ...f, externalContactName: e.target.value }))}
            />
          </div>
          <div className="incident-report-popup__row incident-report-popup__row--full">
            <label>External Contact – Notes</label>
            <textarea
              value={form.externalContactNotes}
              onChange={(e) => setForm((f) => ({ ...f, externalContactNotes: e.target.value }))}
              rows={2}
            />
          </div>
          <div className="incident-report-popup__row incident-report-popup__row--full">
            <label>Action Details (Action taken and by whom)</label>
            <textarea
              value={form.actionDetails}
              onChange={(e) => setForm((f) => ({ ...f, actionDetails: e.target.value }))}
              rows={3}
            />
          </div>
        </div>
      </div>
    </Popup>
  );
};
