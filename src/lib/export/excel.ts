import * as XLSX from 'xlsx';
import { Transaction } from '@/lib/types';
import { formatRupiah, formatFullDate, formatTimeWIB } from '@/lib/date-utils';

export interface ReportSummary {
  totalIncome: number;
  totalExpense: number;
  netCashflow: number;
  periodStart: string;
  periodEnd: string;
  topCategories: Array<{ name: string; amount: number; percentage: number }>;
}

/**
 * Generates Excel (.xlsx) workbook buffer for transactions report
 */
export function generateExcelReport(
  transactions: Transaction[],
  summary: ReportSummary,
  userName: string = 'Pengguna TataDana'
): Buffer {
  // 1. Transactions Sheet Data
  const txRows = transactions.map((t, index) => {
    let typeIndo = 'Pengeluaran';
    if (t.type === 'income') typeIndo = 'Pemasukan';
    if (t.type === 'transfer') typeIndo = 'Transfer';

    let rincianItems = '-';
    if (t.items && t.items.length > 0) {
      rincianItems = t.items.map(i => `${i.item_name} (${i.quantity}x @ ${formatRupiah(i.price)})`).join('; ');
    }

    return {
      'No': index + 1,
      'Tanggal (WIB)': `${formatFullDate(t.transaction_time)} ${formatTimeWIB(t.transaction_time)}`,
      'Jenis': typeIndo,
      'Kategori': t.category ? `${t.category.emoji} ${t.category.name}` : '-',
      'Dompet': t.wallet?.name || '-',
      'Nominal (Rp)': Number(t.amount),
      'Catatan': t.description || '-',
      'Rincian Item Struk': rincianItems,
      'Sumber Transaksi': t.source,
    };
  });

  const txSheet = XLSX.utils.json_to_sheet(txRows);

  // Set column widths
  txSheet['!cols'] = [
    { wch: 6 },  // No
    { wch: 25 }, // Tanggal
    { wch: 15 }, // Jenis
    { wch: 20 }, // Kategori
    { wch: 15 }, // Dompet
    { wch: 18 }, // Nominal
    { wch: 30 }, // Catatan
    { wch: 40 }, // Rincian Item Struk
    { wch: 18 }, // Sumber
  ];

  // 2. Summary Sheet Data
  const summaryRows = [
    { 'Metrik': 'Nama Pengguna', 'Nilai': userName },
    { 'Metrik': 'Periode Laporan', 'Nilai': `${formatFullDate(summary.periodStart)} s/d ${formatFullDate(summary.periodEnd)}` },
    { 'Metrik': 'Jumlah Transaksi', 'Nilai': transactions.length },
    { 'Metrik': 'Total Pemasukan', 'Nilai': summary.totalIncome },
    { 'Metrik': 'Total Pengeluaran', 'Nilai': summary.totalExpense },
    { 'Metrik': 'Arus Kas Bersih (Net Cashflow)', 'Nilai': summary.netCashflow },
    { 'Metrik': '', 'Nilai': '' },
    { 'Metrik': '--- TOP 5 PENGELUARAN ---', 'Nilai': '' },
    ...summary.topCategories.map(c => ({
      'Metrik': c.name,
      'Nilai': `${formatRupiah(c.amount)} (${c.percentage}%)`,
    })),
  ];

  const summarySheet = XLSX.utils.json_to_sheet(summaryRows);
  summarySheet['!cols'] = [{ wch: 30 }, { wch: 35 }];

  // 3. Create Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Ringkasan');
  XLSX.utils.book_append_sheet(workbook, txSheet, 'Daftar Transaksi');

  // 4. Output buffer
  const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  return excelBuffer as Buffer;
}
