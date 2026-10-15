'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Wallet, Category, TransactionType } from '@/lib/types';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Wallet[];
  categories: Category[];
  onSubmit: (data: {
    type: TransactionType;
    amount: number;
    wallet_id: string;
    category_id?: string;
    destination_wallet_id?: string;
    description: string;
    transaction_time: string;
  }) => Promise<void>;
}

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  wallets,
  categories,
  onSubmit,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [walletId, setWalletId] = useState<string>(wallets[0]?.id || '');
  const [destinationWalletId, setDestinationWalletId] = useState<string>(wallets[1]?.id || '');
  const [categoryId, setCategoryId] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const numAmount = parseFloat(amount.replace(/[^\d]/g, ''));
    if (!numAmount || numAmount <= 0) {
      setError('Masukkan nominal transaksi yang valid.');
      return;
    }

    if (!walletId) {
      setError('Pilih dompet sumber.');
      return;
    }

    if (type === 'transfer' && walletId === destinationWalletId) {
      setError('Dompet tujuan harus berbeda dari dompet sumber.');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        type,
        amount: numAmount,
        wallet_id: walletId,
        category_id: type !== 'transfer' ? categoryId || undefined : undefined,
        destination_wallet_id: type === 'transfer' ? destinationWalletId : undefined,
        description,
        transaction_time: new Date(date).toISOString(),
      });
      onClose();
      // Reset form
      setAmount('');
      setDescription('');
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan transaksi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Catat Transaksi Baru"
      description="Transaksi akan otomatis disinkronkan ke laporan dan saldo dompet."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type Selector Tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setType('expense');
              setCategoryId('');
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>Pengeluaran</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType('income');
              setCategoryId('');
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              type === 'income'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>Pemasukan</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setType('transfer');
            }}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              type === 'transfer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>Transfer</span>
          </button>
        </div>

        {/* Amount Field */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Nominal (Rp)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rp</span>
            <input
              type="text"
              placeholder="0"
              value={amount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, '');
                if (val) {
                  setAmount(new Intl.NumberFormat('id-ID').format(parseInt(val, 10)));
                } else {
                  setAmount('');
                }
              }}
              required
              className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-xl font-extrabold text-slate-900"
            />
          </div>
        </div>

        {/* Category (if not transfer) */}
        {type !== 'transfer' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm text-slate-800 bg-white"
            >
              <option value="">Pilih Kategori...</option>
              {filteredCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Source Wallet */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            {type === 'transfer' ? 'Dari Dompet' : 'Dompet'}
          </label>
          <select
            value={walletId}
            onChange={(e) => setWalletId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm text-slate-800 bg-white"
          >
            {wallets.map((w) => (
              <option key={w.id} value={w.id}>
                👛 {w.name} (Saldo: Rp{new Intl.NumberFormat('id-ID').format(Number(w.balance))})
              </option>
            ))}
          </select>
        </div>

        {/* Destination Wallet (Transfer only) */}
        {type === 'transfer' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Ke Dompet Tujuan</label>
            <select
              value={destinationWalletId}
              onChange={(e) => setDestinationWalletId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm text-slate-800 bg-white"
            >
              {wallets.map((w) => (
                <option key={w.id} value={w.id} disabled={w.id === walletId}>
                  👛 {w.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Description & Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Catatan</label>
            <input
              type="text"
              placeholder="Contoh: Makan siang bakso"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm text-slate-800"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Tanggal</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none text-sm text-slate-800 bg-white"
            />
          </div>
        </div>

        {error && <p className="text-xs text-rose-500 font-semibold">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" isLoading={loading}>
            Simpan Transaksi
          </Button>
        </div>
      </form>
    </Modal>
  );
};
