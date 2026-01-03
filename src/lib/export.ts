import jsPDF from "jspdf";
import * as XLSX from "xlsx";

export function exportJson(filename: string, data: any) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPdfFromJson(filename: string, title: string, payload: any) {
  const doc = new jsPDF();
  doc.setFontSize(14);
  doc.text(title, 14, 18);
  doc.setFontSize(8);
  const json = JSON.stringify(payload, null, 2).split("\n");
  let y = 28;
  json.forEach((line) => {
    if (y > 280) {
      doc.addPage();
      y = 20;
    }
    doc.text(line, 14, y);
    y += 4;
  });
  doc.save(filename);
}

export function exportExcelFromRows(filename: string, rows: Record<string, any>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Results");
  XLSX.writeFile(workbook, filename);
}
