'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Users,
  Cpu,
  CreditCard,
  Activity,
  ShieldAlert,
  ArrowUpRight,
  CheckCircle2,
  Bot,
  UserCheck,
  Sparkles,
  TrendingUp,
  Settings,
  DollarSign,
  Shield,
  Wallet,
  Home,
  Send,
  Building2,
  Banknote,
  ArrowDownLeft,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import {
  getAdminProfile,
  AdminProfile,
  DEFAULT_ADMIN_PROFILE,
  ADMIN_EMAIL,
  ADMIN_USERNAME,
  getAdminWallets,
  getAdminTransactions,
  AdminWallet,
  AdminTransaction,
  formatRupiahAdmin,
  processAdminAITransaction,
} from '@/lib/admin-auth';

export default function AdminBerandaPage() {
  const [profile, setProfile] = useState<AdminProfile>(DEFAULT_ADMIN_PROFILE);
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  // AI Quick Cashier Bar State
  const [aiInput, setAiInput] = useState('');
  const [aiReply, setAiReply] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const [usersList, setUsersList] = useState<any[]>([]);

  const loadData = () => {
    setProfile(getAdminProfile());
    const w = getAdminWallets();
    const t = getAdminTransactions();
    setWallets(w);
    setTransactions(t);
    setTotalBalance(w.reduce((acc, item) => acc + item.balance, 0));

    // Fetch live users list for admin synchronization
    fetchUsers();
  };

  const fetchUsers = async () => {
    let remote: any[] = [];
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const d = await res.json();
        if (d.ok && Array.isArray(d.users)) {
          remote = d.users;
        }
      }
    } catch (e) {}

    let combined = [...remote];
    try {
      const localUsersStr = typeof window !== 'undefined' ? localStorage.getItem('tatadana_all_users') : null;
      if (localUsersStr) {
        const localUsers = JSON.parse(localUsersStr);
        for (const lu of localUsers) {
          if (!combined.some((u) => u.id === lu.id || (u.email && lu.email && u.email === lu.email))) {
            combined.unshift(lu);
          }
        }
      }
    } catch (e) {}

    setUsersList(combined);
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('tatadana_admin_profile_updated', handleUpdate);
    window.addEventListener('tatadana_admin_wallets_updated', handleUpdate);
    window.addEventListener('tatadana_admin_transactions_updated', handleUpdate);
    window.addEventListener('tatadana_users_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('tatadana_admin_profile_updated', handleUpdate);
      window.removeEventListener('tatadana_admin_wallets_updated', handleUpdate);
      window.removeEventListener('tatadana_admin_transactions_updated', handleUpdate);
      window.removeEventListener('tatadana_users_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const handleAiTransaction = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInput.trim()) return;

    setIsAiLoading(true);
    setAiReply(null);

    setTimeout(() => {
      const res = processAdminAITransaction(aiInput);
      setAiReply(res.reply);
      setAiInput('');
      setIsAiLoading(false);
      loadData();
    }, 450);
  };

  const kasWallet = wallets.find((w) => w.id === 'wallet-kas') || wallets[0];
  const bcaWallet = wallets.find((w) => w.id === 'wallet-bca') || wallets[1];
  const cadanganWallet = wallets.find((w) => w.id === 'wallet-cadangan') || wallets[2];

  return (
    <div className="space-y-8 font-sans max-w-6xl">
      {/* Top Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-purple-400 uppercase tracking-wider">
              Beranda Superadmin • @{profile.username || ADMIN_USERNAME}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Beranda Kontrol & Keuangan Admin
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5">
            Ikhtisar saldo kas admin, transaksi dompet otomatis, dan monitoring sistem TataDana.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/admin/wallets">
            <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30">
              <Wallet className="w-3.5 h-3.5 mr-1.5" />
              <span>Kelola Dompet Admin</span>
            </Button>
          </Link>

          <Link href="/admin/profile">
            <Button size="sm" variant="outline" className="border-slate-800 text-slate-300 hover:text-white bg-slate-900 text-xs">
              <UserCheck className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              <span>Edit Profil</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* AI Financial & Cashier Quick Bar (Synchronized with Wallets) */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/70 border border-purple-800/80 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI Kasir & Perhitungan Saldo Dompet Admin</span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                  SINKRON LIVE
                </span>
              </h3>
              <p className="text-xs text-purple-300/80">
                Ketik pengeluaran/pemasukan seperti: <strong>"bayar uang makan 50rb"</strong>. AI akan menghitung dan menjawab sisa saldo secara langsung.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Saldo Dompet Admin</span>
            <strong className="text-xl font-black text-emerald-400">
              {formatRupiahAdmin(totalBalance)}
            </strong>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAiTransaction} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Contoh: 'bayar uang makan 50rb' atau 'terima uang sponsor 2jt'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-purple-800/60 text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all font-sans"
            />
          </div>
          <Button
            type="submit"
            size="md"
            disabled={!aiInput.trim() || isAiLoading}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl px-5 text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 flex-shrink-0"
          >
            {isAiLoading ? (
              <span>Menghitung...</span>
            ) : (
              <>
                <span>Kirim AI</span>
                <Send className="w-3.5 h-3.5 -rotate-12" />
              </>
            )}
          </Button>
        </form>

        {/* Quick Example Tags */}
        <div className="flex items-center gap-2 overflow-x-auto text-[11px] pt-0.5">
          <span className="text-slate-500 flex-shrink-0">Contoh Cepat:</span>
          <button
            type="button"
            onClick={() => setAiInput('bayar uang makan 50rb')}
            className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-purple-900 border border-slate-800 text-purple-200 transition-colors flex-shrink-0 cursor-pointer"
          >
            🍽️ "bayar uang makan 50rb"
          </button>
          <button
            type="button"
            onClick={() => setAiInput('beli token listrik 100k dari kas')}
            className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-purple-900 border border-slate-800 text-purple-200 transition-colors flex-shrink-0 cursor-pointer"
          >
            💡 "beli token listrik 100k dari kas"
          </button>
          <button
            type="button"
            onClick={() => setAiInput('terima pembayaran langganan 500rb')}
            className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-purple-900 border border-slate-800 text-purple-200 transition-colors flex-shrink-0 cursor-pointer"
          >
            💰 "terima pembayaran langganan 500rb"
          </button>
          <button
            type="button"
            onClick={() => setAiInput('cek sisa saldo admin')}
            className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-purple-900 border border-slate-800 text-purple-200 transition-colors flex-shrink-0 cursor-pointer"
          >
            📊 "cek sisa saldo admin"
          </button>
        </div>

        {/* Result Reply Card */}
        {aiReply && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-800/80 text-xs md:text-sm text-slate-200 space-y-2 relative animate-fadeIn shadow-xl">
            <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Respons AI Kasir (Saldo Berhasil Diperbarui)</span>
              </div>
              <button
                type="button"
                onClick={() => setAiReply(null)}
                className="text-slate-500 hover:text-slate-300 text-xs"
              >
                Tutup
              </button>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed pt-1">
              {aiReply}
            </div>
          </div>
        )}
      </div>

      {/* 3 Main Dompet Cards on Beranda */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span>Saldo Dompet Admin (Tersinkronisasi)</span>
          </h2>
          <Link href="/admin/wallets" className="text-xs text-purple-400 hover:text-purple-300 font-bold flex items-center gap-1">
            <span>Buka Semua Dompet</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Kas Operasional */}
          {kasWallet && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-orange-500" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <Banknote className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-[10px] font-bold text-orange-400 bg-orange-950/60 border border-orange-800/80 px-2 py-0.5 rounded-full">
                    KAS HARIAN
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{kasWallet.name}</h3>
                  <span className="text-[10px] text-slate-400">Target default pengeluaran harian</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Sisa Saldo:</span>
                  <strong className="text-2xl font-black text-white">
                    {formatRupiahAdmin(kasWallet.balance)}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Card 2: Rekening Bisnis BCA */}
          {bcaWallet && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-blue-500" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-400 bg-blue-950/60 border border-blue-800/80 px-2 py-0.5 rounded-full">
                    BANK BISNIS
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{bcaWallet.name}</h3>
                  <span className="text-[10px] text-slate-400 font-mono">Rek: {bcaWallet.accountNumber || '8830-1928-11'}</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Sisa Saldo:</span>
                  <strong className="text-2xl font-black text-white">
                    {formatRupiahAdmin(bcaWallet.balance)}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Card 3: Dana Cadangan */}
          {cadanganWallet && (
            <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-purple-500" />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-[10px] font-bold text-purple-400 bg-purple-950/60 border border-purple-800/80 px-2 py-0.5 rounded-full">
                    RESERVE FUND
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm">{cadanganWallet.name}</h3>
                  <span className="text-[10px] text-slate-400">Alokasi server & scaling emergency</span>
                </div>
                <div>
                  <span className="text-[11px] text-slate-400 block">Sisa Saldo:</span>
                  <strong className="text-2xl font-black text-white">
                    {formatRupiahAdmin(cadanganWallet.balance)}
                  </strong>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Riwayat Mutasi Transaksi Terbaru */}
      <div className="p-6 md:p-7 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">Riwayat Transaksi Admin Terbaru</h3>
            <p className="text-xs text-slate-400">
              Transaksi pemasukan dan pengeluaran yang dicatat oleh AI kasir maupun manual.
            </p>
          </div>
          <Link href="/admin/wallets" className="text-xs text-purple-400 hover:text-purple-300 font-bold">
            Lihat Semua →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Tanggal</th>
                <th className="py-2.5 px-3">Keterangan</th>
                <th className="py-2.5 px-3">Dompet</th>
                <th className="py-2.5 px-3">Kategori</th>
                <th className="py-2.5 px-3 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.slice(0, 5).map((tx) => {
                const isExpense = tx.type === 'expense';
                return (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 text-slate-400 whitespace-nowrap font-mono">
                      {new Date(tx.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3 px-3 font-bold text-white max-w-xs truncate">
                      {tx.description}
                    </td>
                    <td className="py-3 px-3 text-slate-300 whitespace-nowrap font-medium">
                      {tx.walletName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-bold">
                        {tx.category}
                      </span>
                    </td>
                    <td
                      className={`py-3 px-3 font-mono font-black text-right whitespace-nowrap ${
                        isExpense ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {isExpense ? '-' : '+'}
                      {formatRupiahAdmin(tx.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pengguna Baru Masuk & Terdaftar (Sinkron Login User) */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider">
                Sinkronisasi Login Pengguna Live
              </span>
            </div>
            <h3 className="font-bold text-white text-base">Data Pengguna Terbaru Terdaftar & Login</h3>
            <p className="text-xs text-slate-400">
              Setiap user yang login atau mendaftar di halaman autentikasi otomatis tercatat di data pengguna admin.
            </p>
          </div>
          <Link
            href="/admin/users"
            className="text-xs text-purple-400 hover:text-purple-300 font-bold bg-purple-950/60 hover:bg-purple-900/60 px-3.5 py-2 rounded-xl border border-purple-800 inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>Buka Kelola Pengguna</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-3">Nama Pengguna</th>
                <th className="py-2.5 px-3">Alamat Email</th>
                <th className="py-2.5 px-3">Nomor HP</th>
                <th className="py-2.5 px-3">Paket</th>
                <th className="py-2.5 px-3 text-right">Terakhir Login / Terdaftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {usersList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-slate-500">
                    Memuat data pengguna tersinkron...
                  </td>
                </tr>
              ) : (
                usersList.slice(0, 5).map((u, idx) => (
                  <tr key={u.id || idx} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-bold text-white whitespace-nowrap flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-800 text-purple-300 font-bold text-[10px] flex items-center justify-center flex-shrink-0">
                        {u.full_name ? u.full_name.slice(0, 2).toUpperCase() : 'TD'}
                      </div>
                      <span>{u.full_name}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono whitespace-nowrap">{u.email || '-'}</td>
                    <td className="py-3 px-3 text-slate-300 font-mono whitespace-nowrap">{u.phone_number || '-'}</td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-purple-300 font-bold uppercase">
                        {u.plan || 'starter'}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-mono text-slate-400 whitespace-nowrap">
                      {u.last_login_at
                        ? new Date(u.last_login_at).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Baru saja'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4 Superadmin System Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total Pengguna</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-white">{usersList.length || 3}</div>
          <p className="text-xs text-indigo-400 mt-1">↑ Otomatis sinkron dari login user</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pelanggan Pro Aktif</span>
            <CreditCard className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">
            {usersList.filter((u) => u.plan === 'pro').length || 1}
          </div>
          <p className="text-xs text-slate-400 mt-1">Akun Pro Lifetime</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total AI Requests</span>
            <Cpu className="w-5 h-5 text-orange-400" />
          </div>
          <div className="text-3xl font-black text-white">18,940</div>
          <p className="text-xs text-emerald-400 mt-1">Success rate 99.8%</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Approval</span>
            <ShieldAlert className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">3 Transaksi</div>
          <p className="text-xs text-slate-400 mt-1">Perlu verifikasi manual</p>
        </div>
      </div>
    </div>
  );
}
