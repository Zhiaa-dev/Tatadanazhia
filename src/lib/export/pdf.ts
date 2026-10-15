import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Transaction } from '@/lib/types';
import { ReportSummary } from './excel';
import { formatRupiah, formatFullDate, formatTimeWIB } from '@/lib/date-utils';

/**
 * Generates branded PDF report buffer for TataDana
 */
export function generatePDFReport(
  transactions: Transaction[],
  summary: ReportSummary,
  userName: string = 'Pengguna TataDana'
): Buffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // --- BRAND HEADER ---
  // Orange top accent line
  doc.setFillColor(249, 115, 22); // Orange #F97316
  doc.rect(0, 0, pageWidth, 5, 'F');

  // TataDana Title
  doc.setFontSize(22);
  doc.setTextColor(234, 88, 12); // #EA580C
  doc.setFont('helvetica', 'bold');
  doc.text('TataDana', 14, 18);

  // Subtitle
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // Slate-500
  doc.setFont('helvetica', 'normal');
  doc.text('Catat keuangan semudah chat — Langsung dari Telegram kamu', 14, 23);

  // Right-aligned report label
  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42); // Slate-900
  doc.setFont('helvetica', 'bold');
  doc.text('LAPORAN KEUANGAN', pageWidth - 14, 18, { align: 'right' });

  // Period
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text(
    `Periode: ${formatFullDate(summary.periodStart)} s/d ${formatFullDate(summary.periodEnd)}`,
    pageWidth - 14,
    23,
    { align: 'right' }
  );

  // Horizontal divider
  doc.setDrawColor(226, 232, 240);
  doc.line(14, 27, pageWidth - 14, 27);

  // User meta
  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85);
  doc.text(`Pemilik Akun: ${userName}`, 14, 33);
  doc.text(`Total Transaksi: ${transactions.length} data`, pageWidth - 14, 33, { align: 'right' });

  // --- 3 SUMMARY KPI BOXES ---
  const boxY = 37;
  const boxWidth = (pageWidth - 28 - 8) / 3;
  const boxHeight = 18;

  // 1. Total Pemasukan Box (Greenish)
  doc.setFillColor(240, 253, 244);
  doc.roundedRect(14, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(22, 101, 52);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PEMASUKAN', 18, boxY + 6);
  doc.setFontSize(11);
  doc.text(formatRupiah(summary.totalIncome), 18, boxY + 13);

  // 2. Total Pengeluaran Box (Rose/Orange)
  const box2X = 14 + boxWidth + 4;
  doc.setFillColor(255, 247, 237);
  doc.roundedRect(box2X, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setTextColor(194, 65, 12);
  doc.setFont('helvetica', 'bold');
  doc.text('TOTAL PENGELUARAN', box2X + 4, boxY + 6);
  doc.setFontSize(11);
  doc.text(formatRupiah(summary.totalExpense), box2X + 4, boxY + 13);

  // 3. Arus Kas Bersih (Net Cashflow)
  const box3X = box2X + boxWidth + 4;
  const isNetPositive = summary.netCashflow >= 0;
  if (isNetPositive) {
    doc.setFillColor(240, 249, 255);
    doc.setTextColor(3, 105, 161);
  } else {
    doc.setFillColor(254, 242, 242);
    doc.setTextColor(185, 28, 28);
  }
  doc.roundedRect(box3X, boxY, boxWidth, boxHeight, 2, 2, 'F');
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('ARUS KAS BERSIH', box3X + 4, boxY + 6);
  doc.setFontSize(11);
  doc.text(formatRupiah(summary.netCashflow), box3X + 4, boxY + 13);

  // --- TRANSACTIONS TABLE ---
  const tableData = transactions.map((t, idx) => {
    let typeLabel = 'Pengeluaran';
    if (t.type === 'income') typeLabel = 'Pemasukan';
    if (t.type === 'transfer') typeLabel = 'Transfer';

    const dateStr = `${formatFullDate(t.transaction_time)}\n${formatTimeWIB(t.transaction_time)}`;
    const catStr = t.category?.name || '-';
    const walletStr = t.wallet?.name || '-';
    const amountStr = `${t.type === 'income' ? '+' : '-'} ${formatRupiah(t.amount)}`;
    let notes = t.description || '-';
    if (t.items && t.items.length > 0) {
      notes += `\n[${t.items.length} item struk: ${t.items.map(i => i.item_name).join(', ')}]`;
    }

    return [idx + 1, dateStr, typeLabel, catStr, walletStr, amountStr, notes];
  });

  autoTable(doc, {
    startY: boxY + boxHeight + 6,
    head: [['No', 'Tanggal', 'Jenis', 'Kategori', 'Dompet', 'Nominal', 'Catatan']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [249, 115, 22],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 26 },
      2: { cellWidth: 18 },
      3: { cellWidth: 22 },
      4: { cellWidth: 18 },
      5: { cellWidth: 26, fontStyle: 'bold', halign: 'right' },
      6: { cellWidth: 'auto' },
    },
    didDrawPage: (data) => {
      // Footer on every page
      const footerY = doc.internal.pageSize.getHeight() - 8;
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184);
      doc.setFont('helvetica', 'normal');
      doc.text(
        'Digenerate otomatis oleh TataDana • https://tatadana.app • Rahasia & Pribadi',
        14,
        footerY
      );
      doc.text(
        `Halaman ${data.pageNumber}`,
        pageWidth - 14,
        footerY,
        { align: 'right' }
      );
    },
  });

  const arrayBuffer = doc.output('arraybuffer');
  return Buffer.from(arrayBuffer);
}
