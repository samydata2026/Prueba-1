/**
 * Utilidades de Exportación (Excel, CSV, Informe PDF) para PriceLab
 */

import * as XLSX from 'xlsx';
import { PricingRecord, ScenarioPoint } from '../types/pricing';

export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) return;
  const worksheet = XLSX.utils.json_to_sheet(data);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(data: any[], sheetName: string, filename: string) {
  if (!data || data.length === 0) return;
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.substring(0, 31));
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportMultiSheetExcel(
  sheets: { name: string; data: any[] }[],
  filename: string
) {
  const workbook = XLSX.utils.book_new();
  for (const s of sheets) {
    if (s.data && s.data.length > 0) {
      const ws = XLSX.utils.json_to_sheet(s.data);
      XLSX.utils.book_append_sheet(workbook, ws, s.name.substring(0, 31));
    }
  }
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

export function exportExecutiveReportPrint() {
  window.print();
}
