/**
 * Format a date for display as dd/mm/yyyy across the project.
 */
export function formatDateDisplay(
  date: string | Date | undefined | null
): string {
  if (date == null) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Parse dd/mm/yyyy or d/m/yyyy string to YYYY-MM-DD for storage/API.
 * Returns empty string if invalid.
 */
export function parseDDMMYYYYToYYYYMMDD(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const parts = trimmed.split('/').map((p) => p.trim());
  if (parts.length !== 3) return '';
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || isNaN(month) || isNaN(year)) return '';
  if (year < 100) return ''; // require 4-digit year
  const d = new Date(year, month, day);
  if (d.getFullYear() !== year || d.getMonth() !== month || d.getDate() !== day) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

/**
 * Format a date for display as dd/mm/yyyy, hh:mm.
 */
export function formatDateTimeDisplay(
  date: string | Date | undefined | null
): string {
  if (date == null) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
