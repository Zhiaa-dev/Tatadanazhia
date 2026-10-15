'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CreditCard, Check, X, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatRupiah, formatFullDate } from '@/lib/date-utils';
import { Payment } from '@/lib/types';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([
    {
      id: 'pay_1',
      user_id: 'u2',
      order_id: 'TD-PRO-20261014-001',
      amount: 99000,
      plan: 'pro',
      payment_method: 'Transfer BCA Manual',
      status: 'pending',
      proof_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400',
      created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
      user_name: 'Siti Rahmawati',
      user_email: 'siti@example.com',
    },
    {
      id: 'pay_2',
      user_id: 'u1',
      order_id: 'TD-PRO-20261010-098',
      amount: 99000,
      plan: 'pro',
      payment_method: 'Midtrans QRIS / GoPay',
      status: 'settlement',
      midtrans_transaction_id: 'mid-87391-281',
      created_at: '2026-10-10T14:00:00Z',
      updated_at: '2026-10-10T14:00:00Z',
      user_name: 'Budi Santoso',
      user_email: 'budi@example.com',
    },
  ]);

  const handleAction = async (paymentId: string, action: 'approved' | 'rejected') => {
    try {
      const res = await fetch('/api/payments/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          adminId: 'admin_super',
          action,
          notes: 'Diproses oleh Superadmin via Admin Dashboard',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setPayments((prev) =>
        prev.map((p) => (p.id === paymentId ? { ...p, status: action } : p))
      );
      alert(`Status pembayaran berhasil diperbarui menjadi ${action.toUpperCase()}.`);
    } catch (err: any) {
      alert(`Gagal memproses approval: ${err.message}`);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Persetujuan Pembayaran</h2>
        <p className="text-sm text-slate-400">
          Verifikasi transaksi otomatis Midtrans (QRIS/VA) dan persetujuan transfer bank manual paket Pro.
        </p>
      </div>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-4 px-6">Order ID</th>
                <th className="py-4 px-4">Pengguna</th>
                <th className="py-4 px-4">Paket</th>
                <th className="py-4 px-4">Nominal</th>
                <th className="py-4 px-4">Metode</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Aksi Approval</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {payments.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-mono text-purple-400 font-bold whitespace-nowrap">{p.order_id}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-bold text-white block">{p.user_name}</span>
                    <span className="text-[11px] text-slate-500">{p.user_email}</span>
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase bg-orange-950/60 text-orange-400 border border-orange-800">
                      {p.plan} Sekali Bayar
                    </span>
                  </td>
                  <td className="py-4 px-4 font-black text-white">{formatRupiah(p.amount)}</td>
                  <td className="py-4 px-4 text-slate-400">{p.payment_method}</td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    {p.status === 'pending' && (
                      <span className="text-amber-400 font-bold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Menunggu Approval
                      </span>
                    )}
                    {(p.status === 'settlement' || p.status === 'approved') && (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Berhasil / Aktif
                      </span>
                    )}
                    {p.status === 'rejected' && (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Ditolak
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    {p.status === 'pending' ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleAction(p.id, 'approved')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => handleAction(p.id, 'rejected')}
                          className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-300 font-bold text-xs transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" /> Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="text-slate-500 font-semibold text-[11px]">Selesai</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
