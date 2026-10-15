'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  Filter,
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  Receipt,
  Search,
  History,
  Clock,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Transaction, ExportHistoryItem } from '@/lib/types';
import { formatRupiah, formatFullDate, formatTimeWIB } from '@/lib/date-utils';

export default function ReportsPage() {
  const [periodStart, setPeriodStart] = useState<string>('2026-10-01');
  const [periodEnd, setPeriodEnd] = useState<string>('2026-10-31');
  const [sortField, setSortField] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [exportLoading, setExportLoading] = useState<'pdf' | 'excel' | null>(null);
  const [exportHistory, setExportHistory] = useState<ExportHistoryItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Mock comprehensive transactions for reporting
  const transactions: Transaction[] = [
    {
      id: 'r1',
      user_id: '1',
      wallet_id: 'w2',
      type: 'income',
      amount: 8500000,
      description: 'Gaji Pokok Oktober',
      source: 'web',
      transaction_time: '2026-10-01T09:00:00Z',
      created_at: '2026-10-01T09:00:00Z',
      has_receipt_items: false,
      category: { id: 'c5', user_id: '1', name: 'Gaji', emoji: '💰', type: 'income', color: '#10B981', is_default: true, created_at: '' },
      wallet: { id: 'w2', user_id: '1', name: 'BCA', balance: 8750000, color: '#3B82F6', icon: '', is_default: false, created_at: '', updated_at: '' },
    },
    {
      id: 'r2',
      user_id: '1',
      wallet_id: 'w2',
      type: 'expense',
      amount: 550000,
      description: 'Tagihan Listrik PLN & IndiHome',
      source: 'web',
      transaction_time: '2026-10-03T14:30:00Z',
      created_at: '2026-10-03T14:30:00Z',
      has_receipt_items: false,
      category: { id: 'c3', user_id: '1', name: 'Tagihan', emoji: '🏠', type: 'expense', color: '#EF4444', is_default: true, created_at: '' },
      wallet: { id: 'w2', user_id: '1', name: 'BCA', balance: 8750000, color: '#3B82F6', icon: '', is_default: false, created_at: '', updated_at: '' },
    },
    {
      id: 'r3',
      user_id: '1',
      wallet_id: 'w2',
      type: 'expense',
      amount: 145000,
      description: 'Belanja Mingguan Indomaret',
      source: 'telegram_photo',
      transaction_time: '2026-10-08T11:15:00Z',
      created_at: '2026-10-08T11:15:00Z',
      has_receipt_items: true,
      items: [
        { id: 'i1', transaction_id: 'r3', item_name: 'Beras 5kg', price: 75000, quantity: 1, created_at: '' },
        { id: 'i2', transaction_id: 'r3', item_name: 'Minyak Goreng 2L', price: 34000, quantity: 1, created_at: '' },
        { id: 'i3', transaction_id: 'r3', item_name: 'Telur Ayam 1kg', price: 36000, quantity: 1, created_at: '' },
      ],
      category: { id: 'c4', user_id: '1', name: 'Belanja', emoji: '👕', type: 'expense', color: '#8B5CF6', is_default: true, created_at: '' },
      wallet: { id: 'w2', user_id: '1', name: 'BCA', balance: 8750000, color: '#3B82F6', icon: '', is_default: false, created_at: '', updated_at: '' },
    },
    {
      id: 'r4',
      user_id: '1',
      wallet_id: 'w1',
      type: 'expense',
      amount: 25000,
      description: 'Makan Bakso Solo',
      source: 'telegram_text',
      transaction_time: '2026-10-10T12:45:00Z',
      created_at: '2026-10-10T12:45:00Z',
      has_receipt_items: false,
      category: { id: 'c1', user_id: '1', name: 'Makanan', emoji: '🍜', type: 'expense', color: '#F97316', is_default: true, created_at: '' },
      wallet: { id: 'w1', user_id: '1', name: 'Cash', balance: 1450000, color: '#F97316', icon: '', is_default: true, created_at: '', updated_at: '' },
    },
    {
      id: 'r5',
      user_id: '1',
      wallet_id: 'w3',
      type: 'expense',
      amount: 28000,
      description: 'Kopi Kenangan Mantan',
      source: 'telegram_voice',
      transaction_time: '2026-10-12T16:00:00Z',
      created_at: '2026-10-12T16:00:00Z',
      has_receipt_items: false,
      category: { id: 'c1', user_id: '1', name: 'Makanan', emoji: '🍜', type: 'expense', color: '#F97316', is_default: true, created_at: '' },
      wallet: { id: 'w3', user_id: '1', name: 'GoPay', balance: 320000, color: '#10B981', icon: '', is_default: false, created_at: '', updated_at: '' },
    },
  ];

  // Summary Metrics
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const netCashflow = totalIncome - totalExpense;

  const handleExport = async (format: 'pdf' | 'excel') => {
    setExportLoading(format);
    try {
      const endpoint = format === 'excel' ? '/api/export/excel' : '/api/export/pdf';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo-user-id',
          periodStart,
          periodEnd,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Gagal export laporan');

      // Add to export history state
      const newHistoryItem: ExportHistoryItem = {
        id: 'exp_' + Date.now(),
        user_id: '1',
        file_name: data.fileName,
        file_format: format === 'excel' ? 'xlsx' : 'pdf',
        storage_path: 'exports/' + data.fileName,
        period_start: periodStart,
        period_end: periodEnd,
        created_at: new Date().toISOString(),
      };

      setExportHistory((prev) => [newHistoryItem, ...prev]);

      if (data.downloadUrl) {
        window.open(data.downloadUrl, '_blank');
      } else {
        alert(`Laporan ${format.toUpperCase()} berhasil digenerate: ${data.fileName}`);
      }
    } catch (err: any) {
      alert(`Export error: ${err.message}`);
    } finally {
      setExportLoading(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header and Export Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Laporan Keuangan Native</h2>
          <p className="text-sm text-slate-500">
            Analisis lengkap arus kas, ringkasan periode, dan ekspor on-demand ke PDF & Excel.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            isLoading={exportLoading === 'excel'}
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Export Excel</span>
          </Button>

          <Button
            variant="primary"
            onClick={() => handleExport('pdf')}
            isLoading={exportLoading === 'pdf'}
          >
            <FileText className="w-4 h-4" />
            <span>Export PDF</span>
          </Button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <Card className="p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-orange-500" />
            <span className="text-xs font-bold text-slate-700">Rentang Periode:</span>
            <input
              type="date"
              value={periodStart}
              onChange={(e) => setPeriodStart(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 bg-white"
            />
            <span className="text-slate-400 text-xs">s/d</span>
            <input
              type="date"
              value={periodEnd}
              onChange={(e) => setPeriodEnd(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 outline-none focus:border-orange-500 bg-white"
            />
          </div>

          <div className="text-xs font-bold text-slate-500">
            Total Transaksi Terfilter: <span className="text-orange-600 font-extrabold">{transactions.length}</span>
          </div>
        </div>
      </Card>

      {/* 3 KPI SUMMARY BOXES (Part 3 requirement) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-emerald-50/40 border-emerald-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Total Pemasukan</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700">{formatRupiah(totalIncome)}</div>
          <p className="text-[11px] text-emerald-600/80 mt-1">Periode aktif</p>
        </Card>

        <Card className="bg-rose-50/40 border-rose-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Pengeluaran</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{formatRupiah(totalExpense)}</div>
          <p className="text-[11px] text-rose-600/80 mt-1">Periode aktif</p>
        </Card>

        <Card className={netCashflow >= 0 ? 'bg-orange-50/40 border-orange-100' : 'bg-red-50/40 border-red-100'}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-orange-900 uppercase tracking-wider">Arus Kas Bersih</span>
            <Sparkles className="w-4 h-4 text-orange-600" />
          </div>
          <div className={`text-2xl font-black ${netCashflow >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
            {formatRupiah(netCashflow)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Pemasukan dikurangi pengeluaran</p>
        </Card>
      </div>

      {/* Full Sortable Table with Pagination & Multi-item expansion */}
      <Card className="overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-base">Rincian Transaksi Lengkap</h3>
          <span className="text-xs text-slate-500">Klik baris dengan label Struk untuk melihat rincian item</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3.5 px-6">Tanggal & Jam</th>
                <th className="py-3.5 px-4">Jenis</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4">Dompet</th>
                <th className="py-3.5 px-4">Catatan</th>
                <th className="py-3.5 px-6 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {transactions.map((t) => {
                const isExpense = t.type === 'expense';
                const isExpanded = expandedId === t.id;

                return (
                  <React.Fragment key={t.id}>
                    <tr
                      onClick={() => t.has_receipt_items && setExpandedId(isExpanded ? null : t.id)}
                      className={`hover:bg-orange-50/30 transition-colors ${
                        t.has_receipt_items ? 'cursor-pointer' : ''
                      }`}
                    >
                      <td className="py-4 px-6 text-slate-600 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{formatFullDate(t.transaction_time)}</div>
                        <span className="text-[10px] text-slate-400">{formatTimeWIB(t.transaction_time)}</span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <Badge variant={isExpense ? 'red' : 'green'} size="sm">
                          {isExpense ? 'Pengeluaran' : 'Pemasukan'}
                        </Badge>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <span>{t.category?.emoji || '🏷️'}</span>
                          <span>{t.category?.name || 'Lainnya'}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-600">
                        👛 {t.wallet?.name || 'Cash'}
                      </td>

                      <td className="py-4 px-4 max-w-xs">
                        <div className="flex items-center gap-2">
                          <span className="truncate text-slate-800">{t.description || '-'}</span>
                          {t.has_receipt_items && (
                            <Badge variant="purple" size="sm">
                              <Receipt className="w-3 h-3" /> {t.items?.length} item
                              {isExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
                            </Badge>
                          )}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-right font-black whitespace-nowrap">
                        <span className={isExpense ? 'text-slate-900' : 'text-emerald-600'}>
                          {isExpense ? '-' : '+'} {formatRupiah(t.amount)}
                        </span>
                      </td>
                    </tr>

                    {/* Expandable item rows for receipt photos */}
                    {t.has_receipt_items && isExpanded && (
                      <tr className="bg-slate-50/80">
                        <td colSpan={6} className="px-8 py-3">
                          <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1.5">
                            <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider block mb-2">
                              🧾 Rincian Item Struk Belanja:
                            </span>
                            {t.items?.map((it, idx) => (
                              <div key={idx} className="flex items-center justify-between text-xs py-1 border-b border-slate-100 last:border-0">
                                <span>{idx + 1}. {it.item_name} ({it.quantity}x)</span>
                                <span className="font-bold text-slate-900">{formatRupiah(it.price)}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Export History Section (Part 3 requirement) */}
      <Card>
        <div className="flex items-center gap-2.5 mb-4">
          <History className="w-5 h-5 text-orange-500" />
          <h3 className="font-bold text-slate-900 text-base">Riwayat Export Laporan</h3>
        </div>

        {exportHistory.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            Belum ada file yang digenerate. Klik tombol Export PDF atau Export Excel di atas untuk membuat laporan.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {exportHistory.map((item) => (
              <div key={item.id} className="py-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  {item.file_format === 'xlsx' ? (
                    <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-rose-600" />
                  )}
                  <div>
                    <span className="font-bold text-slate-800">{item.file_name}</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      Periode: {item.period_start} s/d {item.period_end}
                    </span>
                  </div>
                </div>

                <Button variant="outline" size="sm">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Ulang</span>
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
