import { jsPDF } from 'jspdf';
import { HistoryItem } from '../types';

/**
 * Export history items as a formatted PDF file using jsPDF
 */
export const exportHistoryToPdf = (items: HistoryItem[], userName?: string) => {
  if (!items || items.length === 0) {
    alert('No usage history available to export.');
    return;
  }

  const doc = new jsPDF();
  let y = 20;

  // Title Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(79, 70, 229); // Indigo
  doc.text('Super Hub AI - User Usage History', 14, y);

  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text(`Account: ${userName || 'User'} | Total Exported Records: ${items.length} | Date: ${new Date().toLocaleDateString()}`, 14, y);

  y += 8;
  doc.setDrawColor(226, 232, 240);
  doc.line(14, y, 196, y);
  y += 10;

  items.forEach((item, index) => {
    if (y > 250) {
      doc.addPage();
      y = 20;
    }

    // Tool Name & Timestamp
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(`${index + 1}. Tool: ${item.toolName}`, 14, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    const dateStr = item.timestamp ? new Date(item.timestamp).toLocaleString() : '';
    doc.text(dateStr, 150, y);
    y += 6;

    // Input Prompt
    if (item.input) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105);
      doc.text('Prompt / Input:', 14, y);
      y += 5;

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(51, 65, 85);
      const splitInput = doc.splitTextToSize(item.input, 175);
      const inputLines = splitInput.slice(0, 5); // limit input height
      doc.text(inputLines, 18, y);
      y += inputLines.length * 4.5 + 3;
    }

    // Generated Output
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(71, 85, 105);
    doc.text('Generated Output:', 14, y);
    y += 5;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    
    // Clean text to standard ASCII for jsPDF rendering safety
    const cleanOutput = (item.output || '').replace(/[^\x00-\x7F]/g, ' ');
    const splitOutput = doc.splitTextToSize(cleanOutput || item.output || '', 175);
    const outputLines = splitOutput.slice(0, 12);
    doc.text(outputLines, 18, y);
    y += outputLines.length * 4.5 + 8;

    // Divider line
    if (y <= 260) {
      doc.setDrawColor(241, 245, 249);
      doc.line(14, y, 196, y);
      y += 6;
    }
  });

  doc.save(`superhub_ai_history_${new Date().toISOString().slice(0, 10)}.pdf`);
};

/**
 * Export history items as a structured JSON file
 */
export const exportHistoryToJson = (items: HistoryItem[]) => {
  if (!items || items.length === 0) {
    alert('No usage history available to export.');
    return;
  }

  const jsonString = JSON.stringify(items, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `superhub_ai_history_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export history items as a structured CSV file
 */
export const exportHistoryToCsv = (items: HistoryItem[]) => {
  if (!items || items.length === 0) {
    alert('No usage history available to export.');
    return;
  }

  const headers = ['Record ID', 'Date & Time', 'Tool Name', 'Tool ID', 'Input Prompt', 'Generated Output'];
  const rows = items.map(item => [
    `"${item.id || ''}"`,
    `"${item.timestamp ? new Date(item.timestamp).toLocaleString().replace(/"/g, '""') : ''}"`,
    `"${(item.toolName || '').replace(/"/g, '""')}"`,
    `"${(item.toolId || '').replace(/"/g, '""')}"`,
    `"${(item.input || '').replace(/"/g, '""')}"`,
    `"${(item.output || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `superhub_ai_history_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
