'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Target, Plus, AlertTriangle, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import { formatRupiah } from '@/lib/date-utils';

interface BudgetItem {
  id: string;
  categoryName: string;
  emoji: string;
  targetAmount: number;
  spentAmount: number;
  alert80: boolean;
  alert100: boolean;
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<BudgetItem[]>([
    {
      id: 'b1',
      categoryName: 'Makanan & Kuliner',
      emoji: '🍜',
      targetAmount: 1500000,
      spentAmount: 840000,
      alert80: false,
      alert100: false,
    },
    {
      id: 'b2',
      categoryName: 'Tagihan Rumah Tangga',
      emoji: '🏠',
      targetAmount: 800000,
      spentAmount: 550000,
      alert80: false,
      alert100: false,
    },
    {
      id: 'b3',
      categoryName: 'Belanja & Keperluan',
      emoji: '👕',
      targetAmount: 1000000,
      spentAmount: 850000,
      alert80: true,
      alert100: false,
    },
    {
      id: 'b4',
      categoryName: 'Transport & Bensin',
      emoji: '🚗',
      targetAmount: 500000,
      spentAmount: 510000,
      alert80: true,
      alert100: true,
    },
  ]);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏷️');
  const [newAmount, setNewAmount] = useState('');

  const handleAddBudget = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newAmount.replace(/[^\d]/g, ''));
    if (!newCatName || !target) return;

    setBudgets((prev) => [
      ...prev,
      {
        id: 'b_' + Date.now(),
        categoryName: newCatName,
        emoji: newEmoji,
        targetAmount: target,
        spentAmount: 0,
        alert80: false,
        alert100: false,
      },
    ]);

    setIsAddModalOpen(false);
    setNewCatName('');
    setNewAmount('');
  };

  const totalTarget = budgets.reduce((acc, b) => acc + b.targetAmount, 0);
  const totalSpent = budgets.reduce((acc, b) => acc + b.spentAmount, 0);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Anggaran Bulanan</h2>
          <p className="text-sm text-slate-500">
            Kendalikan pengeluaranmu. Notifikasi otomatis dikirim ke Telegram saat mencapai 80% & 100%.
          </p>
        </div>

        <Button onClick={() => setIsAddModalOpen(true)} className="gap-2">
          <Plus className="w-4 h-4" />
          <span>Atur Budget Kategori</span>
        </Button>
      </div>

      {/* Overview Metric Banner */}
      <Card className="bg-gradient-to-r from-orange-500 via-orange-600 to-amber-600 text-white p-6 shadow-brand">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs uppercase font-extrabold tracking-wider text-orange-200">Total Budget Bulan Ini</span>
            <div className="text-3xl md:text-4xl font-black tracking-tight mt-1">{formatRupiah(totalTarget)}</div>
            <p className="text-xs text-orange-100 mt-2">
              Sudah terpakai {formatRupiah(totalSpent)} ({Math.round((totalSpent / (totalTarget || 1)) * 100)}%)
            </p>
          </div>

          <div className="text-right">
            <span className="text-xs uppercase font-bold text-orange-200">Sisa Anggaran Aman</span>
            <div className="text-2xl font-black text-white mt-1">
              {formatRupiah(Math.max(0, totalTarget - totalSpent))}
            </div>
          </div>
        </div>
      </Card>

      {/* Budget Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const percentage = Math.round((b.spentAmount / b.targetAmount) * 100);
          const isOver = percentage >= 100;
          const isWarning = percentage >= 80 && !isOver;

          return (
            <Card key={b.id} className="p-5 hover:border-orange-200 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-2xl flex items-center justify-center">
                    {b.emoji}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">{b.categoryName}</h4>
                    <p className="text-xs text-slate-400">Target: {formatRupiah(b.targetAmount)}</p>
                  </div>
                </div>

                {isOver && (
                  <Badge variant="red" size="sm">
                    <AlertTriangle className="w-3 h-3" /> Budget Habis (100%)
                  </Badge>
                )}
                {isWarning && (
                  <Badge variant="orange" size="sm">
                    <AlertTriangle className="w-3 h-3" /> Alert 80% Terlampaui
                  </Badge>
                )}
                {!isOver && !isWarning && (
                  <Badge variant="green" size="sm">
                    <CheckCircle2 className="w-3 h-3" /> Terkendali
                  </Badge>
                )}
              </div>

              {/* Progress Bar Visual */}
              <div className="space-y-1.5 mt-4">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Terpakai: {formatRupiah(b.spentAmount)}</span>
                  <span className={isOver ? 'text-rose-600 font-extrabold' : 'text-slate-900'}>{percentage}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, percentage)}%` }}
                  />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Sisa: {formatRupiah(Math.max(0, b.targetAmount - b.spentAmount))}</span>
                <span className="text-[11px] text-slate-400">Notifikasi Telegram Aktif</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Budget Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Atur Budget Baru"
        description="Tetapkan batas pengeluaran bulanan untuk kategori tertentu."
      >
        <form onSubmit={handleAddBudget} className="space-y-4">
          <div className="grid grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Emoji</label>
              <input
                type="text"
                value={newEmoji}
                onChange={(e) => setNewEmoji(e.target.value)}
                className="w-full text-center py-2.5 rounded-2xl border border-slate-200 text-lg"
              />
            </div>
            <div className="col-span-3">
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Kategori</label>
              <input
                type="text"
                placeholder="Misal: Hiburan & Game"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                required
                className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-orange-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Batas Anggaran Bulanan (Rp)</label>
            <input
              type="text"
              placeholder="Contoh: 1.000.000"
              value={newAmount}
              onChange={(e) => {
                const val = e.target.value.replace(/[^\d]/g, '');
                setNewAmount(val ? new Intl.NumberFormat('id-ID').format(parseInt(val, 10)) : '');
              }}
              required
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-lg font-bold outline-none focus:border-orange-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan Anggaran</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
