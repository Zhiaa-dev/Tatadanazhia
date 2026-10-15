'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  Wallet as WalletIcon,
  TrendingDown,
  TrendingUp,
  Target,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  Send,
  CheckCircle2,
  Circle,
  ChevronRight,
  Sparkles,
  Receipt,
  Mic,
} from 'lucide-react';
import { formatRupiah, formatFullDate, formatTimeWIB } from '@/lib/date-utils';
import { Transaction, Wallet, Budget, Category } from '@/lib/types';
import Link from 'next/link';

export default function DashboardOverviewPage() {
  const [period, setPeriod] = useState<'harian' | 'mingguan' | 'bulanan' | 'tahunan'>('bulanan');
  const [loading, setLoading] = useState(false);
  const [wallets, setWallets] = useState<Wallet[]>([
    { id: 'w_cash', user_id: 'usr_budi_01', name: 'Cash', balance: 1405000, color: '#F97316', icon: 'wallet', is_default: true, created_at: '', updated_at: '' },
    { id: 'w_bca', user_id: 'usr_budi_01', name: 'BCA', balance: 13750000, color: '#3B82F6', icon: 'credit-card', is_default: false, created_at: '', updated_at: '' },
    { id: 'w_gopay', user_id: 'usr_budi_01', name: 'GoPay', balance: 320000, color: '#10B981', icon: 'smartphone', is_default: false, created_at: '', updated_at: '' },
  ]);
  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'tx_init_1',
      user_id: 'usr_budi_01',
      wallet_id: 'w_cash',
      type: 'expense',
      amount: 25000,
      description: 'Nasi Goreng Spesial',
      source: 'telegram_text',
      transaction_time: new Date().toISOString(),
      created_at: new Date().toISOString(),
      has_receipt_items: false,
      category: { id: 'cat_makanan', user_id: 'usr_budi_01', name: 'Makanan', emoji: '🍜', type: 'expense', color: '#F97316', is_default: true, created_at: '' },
      wallet: { id: 'w_cash', user_id: 'usr_budi_01', name: 'Cash', balance: 1405000, color: '#F97316', icon: 'wallet', is_default: true, created_at: '', updated_at: '' },
    },
    {
      id: 'tx_init_2',
      user_id: 'usr_budi_01',
      wallet_id: 'w_bca',
      type: 'income',
      amount: 8500000,
      description: 'Gaji Bulanan',
      source: 'web',
      transaction_time: new Date(Date.now() - 86400000 * 3).toISOString(),
      created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      has_receipt_items: false,
      category: { id: 'cat_gaji', user_id: 'usr_budi_01', name: 'Gaji', emoji: '💰', type: 'income', color: '#10B981', is_default: true, created_at: '' },
      wallet: { id: 'w_bca', user_id: 'usr_budi_01', name: 'BCA', balance: 13750000, color: '#3B82F6', icon: 'credit-card', is_default: false, created_at: '', updated_at: '' },
    },
  ]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'cat_makanan', user_id: 'usr_budi_01', name: 'Makanan', emoji: '🍜', type: 'expense', color: '#F97316', is_default: true, created_at: '' },
    { id: 'cat_transport', user_id: 'usr_budi_01', name: 'Transport', emoji: '🚗', type: 'expense', color: '#3B82F6', is_default: true, created_at: '' },
    { id: 'cat_tagihan', user_id: 'usr_budi_01', name: 'Tagihan', emoji: '🏠', type: 'expense', color: '#EF4444', is_default: true, created_at: '' },
    { id: 'cat_belanja', user_id: 'usr_budi_01', name: 'Belanja', emoji: '👕', type: 'expense', color: '#8B5CF6', is_default: true, created_at: '' },
    { id: 'cat_gaji', user_id: 'usr_budi_01', name: 'Gaji', emoji: '💰', type: 'income', color: '#10B981', is_default: true, created_at: '' },
  ]);
  const [budgets, setBudgets] = useState<Budget[]>([
    { id: 'b_makanan', user_id: 'usr_budi_01', category_id: 'cat_makanan', month: '2026-10-01', amount: 1500000, alert_80_sent: false, alert_100_sent: false, created_at: '', updated_at: '', spent_amount: 885000, category: { id: 'cat_makanan', user_id: 'usr_budi_01', name: 'Makanan', emoji: '🍜', type: 'expense', color: '#F97316', is_default: true, created_at: '' } },
    { id: 'b_belanja', user_id: 'usr_budi_01', category_id: 'cat_belanja', month: '2026-10-01', amount: 1000000, alert_80_sent: false, alert_100_sent: false, created_at: '', updated_at: '', spent_amount: 450000, category: { id: 'cat_belanja', user_id: 'usr_budi_01', name: 'Belanja', emoji: '👕', type: 'expense', color: '#8B5CF6', is_default: true, created_at: '' } },
    { id: 'b_tagihan', user_id: 'usr_budi_01', category_id: 'cat_tagihan', month: '2026-10-01', amount: 800000, alert_80_sent: false, alert_100_sent: false, created_at: '', updated_at: '', spent_amount: 550000, category: { id: 'cat_tagihan', user_id: 'usr_budi_01', name: 'Tagihan', emoji: '🏠', type: 'expense', color: '#EF4444', is_default: true, created_at: '' } },
  ]);
  const [telegramConnected, setTelegramConnected] = useState<boolean>(true);
  const [userName, setUserName] = useState<string>('Budi Santoso');

  useEffect(() => {
    // Initial quick read from storage
    const savedName =
      (typeof window !== 'undefined' ? localStorage.getItem('tatadana_reg_name') : null) ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('tatadana_reg_name') : null);
    if (savedName) setUserName(savedName);

    loadData();

    const handleTxAdded = () => loadData();
    const handleProfileUpdate = () => {
      const updatedName =
        (typeof window !== 'undefined' ? localStorage.getItem('tatadana_reg_name') : null) ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('tatadana_reg_name') : null);
      if (updatedName) setUserName(updatedName);
      loadData();
    };
    window.addEventListener('tatadana_transaction_added', handleTxAdded);
    window.addEventListener('tatadana_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('tatadana_transaction_added', handleTxAdded);
      window.removeEventListener('tatadana_profile_updated', handleProfileUpdate);
    };
  }, [period]);

  const loadData = async () => {
    try {
      const regUserId =
        (typeof window !== 'undefined' ? localStorage.getItem('tatadana_user_id') : null) ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('tatadana_user_id') : null) ||
        '';
      const regEmail =
        (typeof window !== 'undefined' ? localStorage.getItem('tatadana_user') : null) ||
        (typeof window !== 'undefined' ? sessionStorage.getItem('tatadana_user') : null) ||
        '';

      const q = new URLSearchParams();
      if (regUserId) q.set('userId', regUserId);
      if (regEmail) q.set('email', regEmail);
      const qStr = q.toString() ? `?${q.toString()}` : '';

      const res = await fetch(`/api/data/overview${qStr}`);
      if (res.ok) {
        const data = await res.json();
        if (data.ok) {
          if (data.user_name) setUserName(data.user_name);
          if (data.wallets && data.wallets.length > 0) {
            setWallets(data.wallets);
            setTransactions(data.recentTransactions || []);
            setCategories(data.categories || []);
            setBudgets(data.budgets || []);
          }
        }
      }
    } catch (e) {
      console.warn('Overview live fetch error, using cached state:', e);
    } finally {
      setLoading(false);
    }
  };

  // Metrics Calculations
  const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);
  const totalIncome = transactions.filter((t) => t.type === 'income').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalExpense = transactions.filter((t) => t.type === 'expense').reduce((acc, t) => acc + Number(t.amount), 0);
  const totalBudget = budgets.reduce((acc, b) => acc + Number(b.amount), 0);
  const totalBudgetSpent = budgets.reduce((acc, b) => acc + Number(b.spent_amount || 0), 0);
  const remainingBudget = Math.max(0, totalBudget - totalBudgetSpent);

  // Category breakdown for Pie Chart
  const categoryExpenses = [
    { name: 'Makanan', emoji: '🍜', amount: 840000, color: '#F97316', pct: 45 },
    { name: 'Tagihan', emoji: '🏠', amount: 550000, color: '#EF4444', pct: 30 },
    { name: 'Belanja', emoji: '👕', amount: 450000, color: '#8B5CF6', pct: 25 },
  ];

  // 6 Months comparison data
  const monthlyComparison = [
    { month: 'Mei', income: 7800000, expense: 5200000 },
    { month: 'Jun', income: 8000000, expense: 5600000 },
    { month: 'Jul', income: 8200000, expense: 6100000 },
    { month: 'Agu', income: 8000000, expense: 5900000 },
    { month: 'Sep', income: 8500000, expense: 6400000 },
    { month: 'Okt', income: 8500000, expense: totalExpense },
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={120} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton height={320} className="lg:col-span-2" />
          <Skeleton height={320} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header + Period Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-orange-600 bg-orange-100/80 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
              👋 Halo, <strong className="font-extrabold">{userName}</strong>!
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Ringkasan Keuangan</h2>
          <p className="text-sm text-slate-500">Pantau arus kas, sisa saldo, dan performa budget akunmu.</p>
        </div>

        {/* Period Selector Filter */}
        <div className="inline-flex p-1 bg-white border border-slate-200 rounded-2xl shadow-sm self-start sm:self-auto">
          {(['harian', 'mingguan', 'bulanan', 'tahunan'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl capitalize transition-all ${
                period === p
                  ? 'bg-orange-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/50'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Onboarding Checklist if new user or Telegram not connected */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/5 to-transparent border border-orange-200/80">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-orange-500" />
              <h3 className="font-bold text-slate-900 text-base">Checklist Akun TataDana</h3>
            </div>
            <p className="text-xs text-slate-600 mt-1">Selesaikan 3 langkah mudah ini untuk pengalaman keuangan otomatis:</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-orange-50 text-slate-800 px-3 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>1. Telegram: Terhubung (@TataDanaBot)</span>
            </Link>

            <Link
              href="/dashboard/wallets"
              className="flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-orange-50 text-slate-800 px-3 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>2. Atur Dompet</span>
            </Link>

            <Link
              href="/dashboard/budget"
              className="flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-orange-50 text-slate-800 px-3 py-2 rounded-xl border border-slate-200 transition-colors shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>3. Set Target Budget</span>
            </Link>

            <Link
              href="/dashboard/settings"
              className="flex items-center gap-1.5 text-xs font-bold bg-orange-50 hover:bg-orange-100/80 text-orange-800 px-3 py-2 rounded-xl border border-orange-200 transition-colors shadow-sm"
              title="Buka QR Code untuk akses di HP"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>📱 Akses di HP / QR Code</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Saldo */}
        <Card className="relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Saldo Total</span>
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <WalletIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatRupiah(totalBalance)}</div>
          <p className="text-xs text-slate-500 mt-1">Terbagi dalam {wallets.length} dompet aktif</p>
        </Card>

        {/* Pemasukan */}
        <Card className="relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pemasukan Bulan Ini</span>
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 tracking-tight">{formatRupiah(totalIncome)}</div>
          <p className="text-xs text-emerald-700/80 font-medium mt-1">↑ Arus kas masuk sehat</p>
        </Card>

        {/* Pengeluaran */}
        <Card className="relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengeluaran Bulan Ini</span>
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <TrendingDown className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatRupiah(totalExpense)}</div>
          <p className="text-xs text-slate-500 mt-1">{transactions.length} transaksi tercatat</p>
        </Card>

        {/* Budget Tersisa */}
        <Card className="relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Budget Tersisa</span>
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 tracking-tight">{formatRupiah(remainingBudget)}</div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className="bg-orange-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalBudgetSpent / (totalBudget || 1)) * 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 6 Months Bar Chart */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Pemasukan vs Pengeluaran</h3>
              <p className="text-xs text-slate-500">Perbandingan arus kas 6 bulan terakhir</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <span>Pemasukan</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-orange-500" />
                <span>Pengeluaran</span>
              </div>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-64 flex items-end justify-between gap-3 pt-6 px-2 border-b border-slate-100">
            {monthlyComparison.map((m, i) => {
              const maxVal = 10000000;
              const inHeight = (m.income / maxVal) * 100;
              const exHeight = (m.expense / maxVal) * 100;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                  <div className="w-full flex items-end justify-center gap-1.5 h-48">
                    {/* Income Bar */}
                    <div
                      className="w-1/2 max-w-[18px] bg-emerald-500/90 group-hover:bg-emerald-600 rounded-t-lg transition-all"
                      style={{ height: `${inHeight}%` }}
                      title={`Pemasukan: ${formatRupiah(m.income)}`}
                    />
                    {/* Expense Bar */}
                    <div
                      className="w-1/2 max-w-[18px] bg-orange-500/90 group-hover:bg-orange-600 rounded-t-lg transition-all"
                      style={{ height: `${exHeight}%` }}
                      title={`Pengeluaran: ${formatRupiah(m.expense)}`}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">{m.month}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Category Breakdown (Donut / Pie representation) */}
        <Card>
          <div className="mb-4">
            <h3 className="font-bold text-slate-900 text-base">Kategori Pengeluaran</h3>
            <p className="text-xs text-slate-500">Distribusi pengeluaran bulan ini</p>
          </div>

          <div className="space-y-4 pt-2">
            {categoryExpenses.map((cat, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span>{cat.emoji}</span>
                    <span>{cat.name}</span>
                  </span>
                  <span className="font-semibold text-slate-600">
                    {formatRupiah(cat.amount)} ({cat.pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${cat.pct}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/dashboard/reports"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center justify-center gap-1"
            >
              <span>Lihat Laporan Lengkap</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </Card>
      </div>

      {/* 10 TRANSAKSI TERBARU */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-bold text-slate-900 text-base">10 Transaksi Terbaru</h3>
            <p className="text-xs text-slate-500">Dicatat otomatis dari Telegram bot dan web</p>
          </div>
          <Link href="/dashboard/transactions">
            <Button variant="ghost" size="sm">
              <span>Semua Transaksi</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.map((t) => {
            const isExpense = t.type === 'expense';
            return (
              <div
                key={t.id}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 -mx-4 px-4 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-lg ${
                      isExpense ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                    }`}
                  >
                    {t.category?.emoji || (isExpense ? '💸' : '💰')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {t.description || t.category?.name || 'Transaksi'}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{formatFullDate(t.transaction_time)}</span>
                      <span>•</span>
                      <span>👛 {t.wallet?.name || 'Cash'}</span>
                      {t.source === 'telegram_photo' && (
                        <span className="flex items-center gap-0.5 text-purple-600 font-semibold">
                          <Receipt className="w-3 h-3" /> Struk
                        </span>
                      )}
                      {t.source === 'telegram_voice' && (
                        <span className="flex items-center gap-0.5 text-blue-600 font-semibold">
                          <Mic className="w-3 h-3" /> VN
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div
                    className={`text-sm md:text-base font-extrabold ${
                      isExpense ? 'text-slate-900' : 'text-emerald-600'
                    }`}
                  >
                    {isExpense ? '-' : '+'} {formatRupiah(t.amount)}
                  </div>
                  <span className="text-[11px] text-slate-400">{formatTimeWIB(t.transaction_time)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
