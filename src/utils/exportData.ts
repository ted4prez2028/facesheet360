/**
 * HIPAA-Compliant Data Export Utilities
 * Exports patient data securely in various formats
 */

import { logDataExport } from './auditLogger';

export type ExportFormat = 'csv' | 'json' | 'pdf';

interface ExportOptions {
  format: ExportFormat;
  filename: string;
  userId: string;
  includeTimestamp?: boolean;
}

// Convert data to CSV format
export const convertToCSV = (data: any[]): string => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header => {
        const value = row[header];
        // Escape commas and quotes
        const escaped = String(value).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(',')
    )
  ];

  return csvRows.join('\n');
};

// Download file to user's computer
const downloadFile = (content: string, filename: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

// Export data as CSV
export const exportAsCSV = async (
  data: any[],
  options: ExportOptions
): Promise<void> => {
  const csv = convertToCSV(data);
  const timestamp = options.includeTimestamp 
    ? `_${new Date().toISOString().split('T')[0]}` 
    : '';
  const filename = `${options.filename}${timestamp}.csv`;

  downloadFile(csv, filename, 'text/csv;charset=utf-8;');

  // Log export for audit trail
  await logDataExport(options.userId, 'csv', data.length);
};

// Export data as JSON
export const exportAsJSON = async (
  data: any[],
  options: ExportOptions
): Promise<void> => {
  const json = JSON.stringify(data, null, 2);
  const timestamp = options.includeTimestamp 
    ? `_${new Date().toISOString().split('T')[0]}` 
    : '';
  const filename = `${options.filename}${timestamp}.json`;

  downloadFile(json, filename, 'application/json');

  // Log export for audit trail
  await logDataExport(options.userId, 'json', data.length);
};

// Sanitize data before export (remove sensitive fields if needed)
export const sanitizeForExport = <T extends Record<string, any>>(
  data: T[],
  excludeFields: string[] = []
): Partial<T>[] => {
  return data.map(item => {
    const sanitized = { ...item };
    excludeFields.forEach(field => {
      delete sanitized[field];
    });
    return sanitized;
  });
};

// Export with automatic format detection
export const exportData = async (
  data: any[],
  options: ExportOptions
): Promise<void> => {
  switch (options.format) {
    case 'csv':
      return exportAsCSV(data, options);
    case 'json':
      return exportAsJSON(data, options);
    default:
      throw new Error(`Unsupported export format: ${options.format}`);
  }
};
