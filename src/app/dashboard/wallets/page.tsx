'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Wallet as WalletIcon, Plus, Check, Star, ArrowRightLeft, CreditCard, Smartphone } from 'lucide-react';
import { formatRupiah } from '@/lib/date-utils';
import { Wallet } from '@/lib/types';

export default function WalletsPage() {
  const [wallets, setWallets] = useState<Wallet[]>([
    {
      id: 'w_cash',
      user_id: 'usr_budi_01',
      name: 'Cash',
      balance: 1450000,
      color: '#F97316',
      icon: 'wallet',
      is_default: true,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'w_bca',
      user_id: 'usr_budi_01',
      name: 'BCA',
      balance: 8750000,
      color: '#3B82F6',
      icon: 'credit-card',
      is_default: false,
      created_at: '',
      updated_at: '',
    },
    {
      id: 'w_gopay',
      user_id: 'usr_budi_01',
      name: 'GoPay',
      balance: 320000,
      color: '#10B981',
      icon: 'smartphone',
      is_default: false,
      created_at: '',
      updated_at: '',
    },
  ]);

  React.useEffect(() => {
    loadWallets();
    const handleUpdate = () => loadWallets();
    window.addEventListener('tatadana_transaction_added', handleUpdate);
    return () => window.removeEventListener('tatadana_transaction_added', handleUpdate);
  }, []);

  const loadWallets = async () => {
    try {
      const res = await fetch('/api/data/wallets');
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.wallets && json.wallets.length > 0) {
          setWallets(json.wallets);
        }
      }
    } catch (e) {}
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletBalance, setNewWalletBalance] = useState('');
  const [newWalletColor, setNewWalletColor] = useState('#F97316');

  const handleSetDefault = (walletId: string) => {
    setWallets((prev) =>
      prev.map((w) => ({
        ...w,
        is_default: w.id === walletId,
      }))
    );
  };

  const handleAddWallet = (e: React.FormEvent) => {
    e.preventDefault();
    const balance = parseFloat(newWalletBalance.replace(/[^\d]/g, '')) || 0;
    if (!newWalletName) return;

    const newW: Wallet = {
      id: 'w_' + Date.now(),
      user_id: '1',
      name: newWalletName,
      balance,
      color: newWalletColor,
      icon: 'wallet',
      is_default: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setWallets((prev) => [...prev, newW]);
    setIsModalOpen(false);
    setNewWalletName('');
    setNewWalletBalance('');
  };

  const totalBalance = wallets.reduce((acc, w) => acc + Number(w.balance), 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Multi Dompet & Rekening</h2>
          <p className="text-sm text-slate-500">
            Kelola saldo terpisah untuk Cash, Bank, dan E-Wallet. Tentukan dompet default untuk transaksi Telegram.
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Tambah Dompet Baru</span>
        </Button>
      </div>

      {/* Summary Total */}
      <Card className="p-6 bg-slate-900 text-white rounded-3xl">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Kekayaan Likuid</span>
        <div className="text-3xl md:text-4xl font-black tracking-tight mt-1 text-white">
          {formatRupiah(totalBalance)}
        </div>
        <p className="text-xs text-slate-400 mt-2">
          Dari {wallets.length} dompet aktif • Transaksi Telegram otomatis memotong dompet dengan tanda Utama
        </p>
      </Card>

      {/* Wallets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {wallets.map((w) => {
          return (
            <Card key={w.id} className="p-6 relative overflow-hidden group hover:border-orange-300 transition-all">
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: w.color }}
              />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm"
                    style={{ backgroundColor: w.color }}
                  >
                    <WalletIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{w.name}</h4>
                    {w.is_default && (
                      <Badge variant="orange" size="sm" className="mt-0.5">
                        <Star className="w-3 h-3 fill-orange-500" /> Dompet Utama Telegram
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="my-4">
                <span className="text-xs text-slate-400 font-semibold block">Saldo Saat Ini</span>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatRupiah(Number(w.balance))}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                {!w.is_default ? (
                  <button
                    onClick={() => handleSetDefault(w.id)}
                    className="text-xs font-bold text-slate-600 hover:text-orange-600 transition-colors"
                  >
                    Set Jadi Dompet Utama
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                    <Check className="w-4 h-4" /> Default Telegram
                  </span>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Wallet Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah Dompet Baru"
        description="Buat rekening bank, e-wallet, atau pos dana kas baru."
      >
        <form onSubmit={handleAddWallet} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Dompet</label>
            <input
              type="text"
              placeholder="Contoh: Mandiri Livin, ShopeePay, Tabungan Emas"
              value={newWalletName}
              onChange={(e) => setNewWalletName(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Saldo Awal (Rp)</label>
            <input
              type="text"
              placeholder="0"
              value={newWalletBalance}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, '');
                setNewWalletBalance(val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : '');
              }}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-lg font-bold outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Warna Aksen</label>
            <div className="flex items-center gap-3">
              {['#F97316', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444', '#0F172A'].map((col) => (
                <button
                  key={col}
                  type="button"
                  onClick={() => setNewWalletColor(col)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform ${
                    newWalletColor === col ? 'scale-110 border-slate-900 shadow-md' : 'border-transparent'
                  }`}
                  style={{ backgroundColor: col }}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Tambah Dompet</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
