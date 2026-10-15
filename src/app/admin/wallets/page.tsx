'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  Banknote,
  Building2,
  ShieldCheck,
  CreditCard,
  Sparkles,
  Bot,
  Send,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  X,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  getAdminWallets,
  saveAdminWallets,
  getAdminTransactions,
  AdminWallet,
  AdminTransaction,
  formatRupiahAdmin,
  processAdminAITransaction,
} from '@/lib/admin-auth';

export default function AdminWalletsPage() {
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [totalBalance, setTotalBalance] = useState<number>(0);

  // AI Quick Input State
  const [aiInput, setAiInput] = useState('');
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  // Modals
  const [showAddWalletModal, setShowAddWalletModal] = useState(false);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [selectedWalletId, setSelectedWalletId] = useState<string>('');

  // Form States for Add Wallet
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletType, setNewWalletType] = useState<'cash' | 'bank' | 'ewallet' | 'reserve'>('bank');
  const [newWalletInitialBalance, setNewWalletInitialBalance] = useState('');
  const [newWalletAccountNo, setNewWalletAccountNo] = useState('');

  // Form States for Top Up
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpNote, setTopUpNote] = useState('');

  const loadData = () => {
    const w = getAdminWallets();
    const t = getAdminTransactions();
    setWallets(w);
    setTransactions(t);
    const sum = w.reduce((acc, item) => acc + item.balance, 0);
    setTotalBalance(sum);
    if (w.length > 0 && !selectedWalletId) {
      setSelectedWalletId(w[0].id);
    }
  };

  useEffect(() => {
    loadData();

    const handleWalletsUpdate = () => loadData();
    window.addEventListener('tatadana_admin_wallets_updated', handleWalletsUpdate);
    window.addEventListener('tatadana_admin_transactions_updated', handleWalletsUpdate);

    return () => {
      window.removeEventListener('tatadana_admin_wallets_updated', handleWalletsUpdate);
      window.removeEventListener('tatadana_admin_transactions_updated', handleWalletsUpdate);
    };
  }, []);

  // Handle Natural Language AI Input
  const handleAISubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!aiInput.trim()) return;

    setIsProcessingAI(true);
    setAiResponse(null);

    setTimeout(() => {
      const res = processAdminAITransaction(aiInput);
      setAiResponse(res.reply);
      setAiInput('');
      setIsProcessingAI(false);
      loadData();
    }, 450);
  };

  // Handle Add New Wallet
  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim()) return;

    const initial = parseInt(newWalletInitialBalance.replace(/\D/g, ''), 10) || 0;
    const colors = ['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#06B6D4'];
    const randomColor = colors[wallets.length % colors.length];

    const newWallet: AdminWallet = {
      id: `wallet-custom-${Date.now()}`,
      name: newWalletName.trim(),
      type: newWalletType,
      balance: initial,
      accountNumber: newWalletAccountNo.trim() || undefined,
      color: randomColor,
      icon: newWalletType === 'cash' ? 'Banknote' : newWalletType === 'bank' ? 'Building2' : 'Wallet',
    };

    const updated = [...wallets, newWallet];
    saveAdminWallets(updated);
    setWallets(updated);
    setNewWalletName('');
    setNewWalletInitialBalance('');
    setNewWalletAccountNo('');
    setShowAddWalletModal(false);
  };

  // Handle Manual Top Up / Tambah Saldo
  const handleTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(topUpAmount.replace(/\D/g, ''), 10);
    if (!amount || amount <= 0 || !selectedWalletId) return;

    const target = wallets.find((w) => w.id === selectedWalletId);
    if (!target) return;

    const updated = wallets.map((w) =>
      w.id === selectedWalletId ? { ...w, balance: w.balance + amount } : w
    );
    saveAdminWallets(updated);

    // Record Transaction
    const newTx: AdminTransaction = {
      id: `tx-topup-${Date.now()}`,
      description: topUpNote.trim() || `Top Up Saldo ${target.name}`,
      amount,
      type: 'income',
      category: 'Top Up Admin',
      walletId: target.id,
      walletName: target.name,
      date: new Date().toISOString(),
      source: 'manual',
    };

    const currentTxs = getAdminTransactions();
    const { saveAdminTransactions } = require('@/lib/admin-auth');
    saveAdminTransactions([newTx, ...currentTxs]);

    setTopUpAmount('');
    setTopUpNote('');
    setShowTopUpModal(false);
    loadData();
  };

  const getWalletIcon = (w: AdminWallet) => {
    if (w.type === 'cash') return <Banknote className="w-5 h-5 text-orange-400" />;
    if (w.type === 'bank') return <Building2 className="w-5 h-5 text-blue-400" />;
    if (w.type === 'reserve') return <ShieldCheck className="w-5 h-5 text-purple-400" />;
    return <CreditCard className="w-5 h-5 text-emerald-400" />;
  };

  return (
    <div className="space-y-8 max-w-6xl font-sans">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-purple-950 text-purple-300 border-purple-800 text-xs font-bold">
              <Wallet className="w-3.5 h-3.5 mr-1 text-purple-400" />
              Sistem Multi-Dompet Admin
            </Badge>
            <span className="text-xs text-slate-500">• Sinkronisasi Real-Time</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
            Dompet & Kas Superadmin
          </h1>
          <p className="text-xs md:text-sm text-slate-400">
            Kelola kas operasional, rekening bisnis platform, dan dana cadangan server TataDana.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            size="sm"
            onClick={() => setShowTopUpModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1" />
            <span>Tambah Saldo</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowAddWalletModal(true)}
            className="border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white bg-slate-900 text-xs"
          >
            <Wallet className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
            <span>Buat Dompet Baru</span>
          </Button>
        </div>
      </div>

      {/* Spotlight: AI Smart Cashier & Balance Sync Bar */}
      <div className="p-5 md:p-6 rounded-3xl bg-gradient-to-r from-purple-950/80 via-slate-900 to-indigo-950/70 border border-purple-800/80 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-600/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>AI Kasir & Perhitungan Dompet Admin</span>
                <span className="text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800 px-2 py-0.5 rounded-full">
                  SYNC AKTIF
                </span>
              </h3>
              <p className="text-[11px] text-purple-300/80">
                Ketik instruksi pengeluaran/pemasukan, AI akan otomatis menghitung dan mengurangi saldo dompet admin.
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Aset Admin</span>
            <strong className="text-lg font-black text-emerald-400">
              {formatRupiahAdmin(totalBalance)}
            </strong>
          </div>
        </div>

        {/* AI Input Form */}
        <form onSubmit={handleAISubmit} className="flex items-center gap-2">
          <div className="relative flex-1">
            <Sparkles className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={aiInput}
              onChange={(e) => setAiInput(e.target.value)}
              placeholder="Contoh: 'bayar uang makan 50rb', 'beli token listrik 100k', 'terima langganan 500rb'..."
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-purple-800/60 text-xs md:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 transition-all font-sans"
            />
          </div>
          <Button
            type="submit"
            size="md"
            disabled={!aiInput.trim() || isProcessingAI}
            className="bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-2xl px-5 text-xs shadow-lg shadow-purple-600/30 flex items-center gap-1.5 flex-shrink-0"
          >
            {isProcessingAI ? (
              <span>Menghitung...</span>
            ) : (
              <>
                <span>Kirim ke AI</span>
                <Send className="w-3.5 h-3.5 -rotate-12" />
              </>
            )}
          </Button>
        </form>

        {/* Quick Example Chips */}
        <div className="flex items-center gap-2 overflow-x-auto text-[11px] pt-0.5">
          <span className="text-slate-500 flex-shrink-0">Coba cepat:</span>
          <button
            type="button"
            onClick={() => {
              setAiInput('bayar uang makan 50rb');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-purple-950 border border-slate-800 text-purple-300 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
          >
            🍽️ "bayar uang makan 50rb"
          </button>
          <button
            type="button"
            onClick={() => {
              setAiInput('beli bensin motor dinas 30rb');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-purple-950 border border-slate-800 text-purple-300 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
          >
            ⛽ "beli bensin motor dinas 30rb"
          </button>
          <button
            type="button"
            onClick={() => {
              setAiInput('terima pembayaran sponsor 2.5jt ke bca');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-purple-950 border border-slate-800 text-purple-300 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
          >
            💰 "terima pembayaran sponsor 2.5jt ke bca"
          </button>
          <button
            type="button"
            onClick={() => {
              setAiInput('cek sisa saldo');
            }}
            className="px-2.5 py-1 rounded-xl bg-slate-950 hover:bg-purple-950 border border-slate-800 text-purple-300 hover:text-white transition-colors flex-shrink-0 cursor-pointer"
          >
            📊 "cek sisa saldo"
          </button>
        </div>

        {/* AI Response Display Card */}
        {aiResponse && (
          <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-800/80 text-xs md:text-sm text-slate-200 space-y-2 relative animate-fadeIn shadow-xl">
            <div className="flex items-center justify-between text-emerald-400 font-bold border-b border-slate-800 pb-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Respons AI Financial Copilot (Dompet Tersinkron)</span>
              </div>
              <button
                type="button"
                onClick={() => setAiResponse(null)}
                className="text-slate-500 hover:text-slate-300 text-xs"
              >
                Tutup
              </button>
            </div>
            <div className="whitespace-pre-wrap leading-relaxed pt-1">
              {aiResponse}
            </div>
          </div>
        )}
      </div>

      {/* Grid of Admin Wallets */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span>Daftar Dompet Admin ({wallets.length})</span>
          </h2>
          <span className="text-xs text-slate-400">
            Semua dompet otomatis diperbarui saat AI memproses transaksi.
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {wallets.map((wallet) => {
            const percentage = totalBalance > 0 ? ((wallet.balance / totalBalance) * 100).toFixed(1) : '0';

            return (
              <div
                key={wallet.id}
                className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between group hover:border-slate-700 transition-all"
              >
                {/* Accent top line */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: wallet.color }}
                />

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center shadow-inner">
                      {getWalletIcon(wallet)}
                    </div>
                    {wallet.isDefault ? (
                      <span className="text-[10px] font-bold text-orange-400 bg-orange-950/60 border border-orange-800/80 px-2 py-0.5 rounded-full">
                        UTAMA (KAS)
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                        {percentage}% Aset
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-bold text-white text-base truncate">{wallet.name}</h3>
                    {wallet.accountNumber ? (
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        No. Rek: {wallet.accountNumber}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-500 mt-0.5 capitalize">
                        Tipe: {wallet.type}
                      </p>
                    )}
                  </div>

                  <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Saldo Dompet:</span>
                    <strong className="text-2xl font-black text-white tracking-tight">
                      {formatRupiahAdmin(wallet.balance)}
                    </strong>
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {wallet.balance >= 0 ? '🟢 Saldo Positif' : '🔴 Defisit'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedWalletId(wallet.id);
                      setShowTopUpModal(true);
                    }}
                    className="text-purple-400 hover:text-purple-300 font-bold transition-colors cursor-pointer"
                  >
                    + Tambah Dana
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Admin Transactions Ledger */}
      <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h3 className="font-bold text-white text-base">Riwayat Mutasi Saldo Dompet Admin</h3>
            <p className="text-xs text-slate-400">
              Setiap perintah AI kasir seperti "bayar uang makan 50rb" otomatis tercatat di tabel ledger ini.
            </p>
          </div>
          <span className="text-xs text-purple-400 font-mono font-bold bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800">
            Total {transactions.length} Mutasi
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Keterangan</th>
                <th className="py-3 px-3">Dompet</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Sumber</th>
                <th className="py-3 px-3 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.slice(0, 8).map((tx) => {
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
                    <td className="py-3 px-3 text-slate-300 font-semibold whitespace-nowrap">
                      {tx.walletName}
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-[10px] text-slate-300 font-bold">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 whitespace-nowrap">
                      {tx.source === 'ai_bot' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-400 bg-purple-950/60 border border-purple-800 px-2 py-0.5 rounded-full">
                          <Bot className="w-3 h-3" /> AI Kasir
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                          Manual
                        </span>
                      )}
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

      {/* MODAL: Tambah Dompet Baru */}
      {showAddWalletModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowAddWalletModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-purple-400" />
              <span>Tambah Dompet Admin Baru</span>
            </h3>

            <form onSubmit={handleCreateWallet} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Nama Dompet</label>
                <input
                  type="text"
                  value={newWalletName}
                  onChange={(e) => setNewWalletName(e.target.value)}
                  placeholder="Misal: Bank Mandiri Operasional"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Tipe Dompet</label>
                <select
                  value={newWalletType}
                  onChange={(e: any) => setNewWalletType(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                >
                  <option value="bank">Rekening Bank</option>
                  <option value="cash">Kas Fisik / Uang Tunai</option>
                  <option value="ewallet">E-Wallet (GoPay/OVO/Dana)</option>
                  <option value="reserve">Dana Cadangan Khusus</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Nomor Rekening / Catatan (Opsional)</label>
                <input
                  type="text"
                  value={newWalletAccountNo}
                  onChange={(e) => setNewWalletAccountNo(e.target.value)}
                  placeholder="Misal: 140-00-192837"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Saldo Awal (Rp)</label>
                <input
                  type="number"
                  value={newWalletInitialBalance}
                  onChange={(e) => setNewWalletInitialBalance(e.target.value)}
                  placeholder="1000000"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddWalletModal(false)}
                  className="border-slate-800 text-slate-400"
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" className="bg-purple-600 hover:bg-purple-500 text-white font-bold">
                  Simpan Dompet
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Tambah Saldo Manual */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 shadow-2xl relative">
            <button
              onClick={() => setShowTopUpModal(false)}
              className="absolute top-4 right-4 text-slate-500 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              <span>Tambah Saldo Dompet Admin</span>
            </h3>

            <form onSubmit={handleTopUp} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Pilih Dompet Tujuan</label>
                <select
                  value={selectedWalletId}
                  onChange={(e) => setSelectedWalletId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                >
                  {wallets.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.name} ({formatRupiahAdmin(w.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Nominal Tambah Saldo (Rp)</label>
                <input
                  type="number"
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(e.target.value)}
                  placeholder="Misal: 5000000"
                  required
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Keterangan / Sumber Dana</label>
                <input
                  type="text"
                  value={topUpNote}
                  onChange={(e) => setTopUpNote(e.target.value)}
                  placeholder="Misal: Penambahan modal kas operasional"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowTopUpModal(false)}
                  className="border-slate-800 text-slate-400"
                >
                  Batal
                </Button>
                <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                  Tambah Dana Sekarang
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
