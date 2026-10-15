'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Receipt,
  Mic,
  Send,
  Calendar,
  Wallet as WalletIcon,
  Plus,
} from 'lucide-react';
import { Transaction, Wallet, Category } from '@/lib/types';
import { formatRupiah, formatFullDate, formatTimeWIB } from '@/lib/date-utils';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expandedTxId, setExpandedTxId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedWallet, setSelectedWallet] = useState<string>('all');

  useEffect(() => {
    loadTransactions();

    const handleUpdate = () => loadTransactions();
    window.addEventListener('tatadana_transaction_added', handleUpdate);
    return () => window.removeEventListener('tatadana_transaction_added', handleUpdate);
  }, []);

  const loadTransactions = async () => {
    try {
      const res = await fetch('/api/data/transactions');
      if (res.ok) {
        const json = await res.json();
        if (json.ok && json.transactions && json.transactions.length > 0) {
          setTransactions(json.transactions);
          return;
        }
      }
    } catch (e) {}

    // Mock sample transactions with multi-item receipt
    const data: Transaction[] = [
      {
        id: 't1',
        user_id: '1',
        wallet_id: 'w1',
        type: 'expense',
        amount: 25000,
        description: 'Nasi Goreng Spesial',
        source: 'telegram_text',
        transaction_time: new Date().toISOString(),
        created_at: new Date().toISOString(),
        has_receipt_items: false,
        category: { id: 'c1', user_id: '1', name: 'Makanan', emoji: '🍜', type: 'expense', color: '#F97316', is_default: true, created_at: '' },
        wallet: { id: 'w1', user_id: '1', name: 'Cash', balance: 1450000, color: '#F97316', icon: '', is_default: true, created_at: '', updated_at: '' },
      },
      {
        id: 't2',
        user_id: '1',
        wallet_id: 'w2',
        type: 'expense',
        amount: 145000,
        description: 'Belanja Mingguan Indomaret',
        source: 'telegram_photo',
        transaction_time: new Date(Date.now() - 3600000 * 4).toISOString(),
        created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        has_receipt_items: true,
        items: [
          { id: 'i1', transaction_id: 't2', item_name: 'Beras 5kg', price: 75000, quantity: 1, created_at: '' },
          { id: 'i2', transaction_id: 't2', item_name: 'Minyak Goreng 2L', price: 34000, quantity: 1, created_at: '' },
          { id: 'i3', transaction_id: 't2', item_name: 'Telur Ayam 1kg', price: 36000, quantity: 1, created_at: '' },
        ],
        category: { id: 'c4', user_id: '1', name: 'Belanja', emoji: '👕', type: 'expense', color: '#8B5CF6', is_default: true, created_at: '' },
        wallet: { id: 'w2', user_id: '1', name: 'BCA', balance: 8750000, color: '#3B82F6', icon: '', is_default: false, created_at: '', updated_at: '' },
      },
      {
        id: 't3',
        user_id: '1',
        wallet_id: 'w3',
        type: 'expense',
        amount: 28000,
        description: 'Kopi Susu Gula Aren',
        source: 'telegram_voice',
        transaction_time: new Date(Date.now() - 3600000 * 9).toISOString(),
        created_at: new Date(Date.now() - 3600000 * 9).toISOString(),
        has_receipt_items: false,
        category: { id: 'c1', user_id: '1', name: 'Makanan', emoji: '🍜', type: 'expense', color: '#F97316', is_default: true, created_at: '' },
        wallet: { id: 'w3', user_id: '1', name: 'GoPay', balance: 320000, color: '#10B981', icon: '', is_default: false, created_at: '', updated_at: '' },
      },
      {
        id: 't4',
        user_id: '1',
        wallet_id: 'w2',
        type: 'income',
        amount: 8500000,
        description: 'Gaji Bulanan Oktober',
        source: 'telegram_text',
        transaction_time: new Date(Date.now() - 86400000 * 3).toISOString(),
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
        has_receipt_items: false,
        category: { id: 'c5', user_id: '1', name: 'Gaji', emoji: '💰', type: 'income', color: '#10B981', is_default: true, created_at: '' },
        wallet: { id: 'w2', user_id: '1', name: 'BCA', balance: 8750000, color: '#3B82F6', icon: '', is_default: false, created_at: '', updated_at: '' },
      },
    ];

    setTransactions(data);
  };

  const filtered = transactions.filter((t) => {
    if (selectedType !== 'all' && t.type !== selectedType) return false;
    if (selectedWallet !== 'all' && t.wallet_id !== selectedWallet) return false;
    if (
      searchQuery &&
      !t.description?.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !t.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Daftar Transaksi</h2>
          <p className="text-sm text-slate-500">Kelola dan telusuri semua riwayat pemasukan, pengeluaran & nota belanja.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari transaksi atau catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none"
            />
          </div>

          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:border-orange-500 outline-none"
            >
              <option value="all">Semua Jenis Transaksi</option>
              <option value="expense">💸 Hanya Pengeluaran</option>
              <option value="income">💰 Hanya Pemasukan</option>
              <option value="transfer">🔄 Transfer Antar Dompet</option>
            </select>
          </div>

          <div>
            <select
              value={selectedWallet}
              onChange={(e) => setSelectedWallet(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:border-orange-500 outline-none"
            >
              <option value="all">Semua Dompet</option>
              <option value="w1">👛 Cash</option>
              <option value="w2">💳 BCA</option>
              <option value="w3">📱 GoPay</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Transaction List with Expandable Receipt Items */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card className="py-16 text-center">
            <div className="w-14 h-14 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-800 text-base">Tidak ada transaksi ditemukan</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Coba sesuaikan filter atau kata kunci pencarian Anda.
            </p>
          </Card>
        ) : (
          filtered.map((t) => {
            const isExpense = t.type === 'expense';
            const isExpanded = expandedTxId === t.id;

            return (
              <Card key={t.id} className="p-4 md:p-5 hover:border-orange-200 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl flex-shrink-0 ${
                        isExpense ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}
                    >
                      {t.category?.emoji || '🏷️'}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm md:text-base font-bold text-slate-900 truncate">
                          {t.description || t.category?.name}
                        </p>
                        {t.has_receipt_items && (
                          <Badge variant="purple" size="sm">
                            <Receipt className="w-3 h-3" /> {t.items?.length || 0} Item Struk
                          </Badge>
                        )}
                        {t.source === 'telegram_voice' && (
                          <Badge variant="blue" size="sm">
                            <Mic className="w-3 h-3" /> VN
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                        <span>{formatFullDate(t.transaction_time)}</span>
                        <span>•</span>
                        <span>{formatTimeWIB(t.transaction_time)}</span>
                        <span>•</span>
                        <span>👛 {t.wallet?.name}</span>
                        <span>•</span>
                        <span className="font-medium text-slate-600">{t.category?.name}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 flex-shrink-0">
                    <div className="text-right">
                      <span
                        className={`text-base md:text-lg font-black ${
                          isExpense ? 'text-slate-900' : 'text-emerald-600'
                        }`}
                      >
                        {isExpense ? '-' : '+'} {formatRupiah(t.amount)}
                      </span>
                    </div>

                    {t.has_receipt_items && (
                      <button
                        onClick={() => setExpandedTxId(isExpanded ? null : t.id)}
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                        title="Lihat Rincian Item"
                      >
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* EXPANDABLE MULTI-ITEM RECEIPT DETAILS (Part 3 requirement) */}
                {t.has_receipt_items && isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-100 bg-slate-50/70 -mx-4 md:-mx-5 -mb-4 md:-mb-5 p-4 md:p-5 rounded-b-2xl animate-in fade-in duration-200">
                    <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5 text-purple-600" />
                      <span>Rincian Item Nota Belanja</span>
                    </h4>

                    <div className="space-y-2">
                      {t.items?.map((item, idx) => (
                        <div
                          key={item.id || idx}
                          className="flex items-center justify-between text-xs py-1.5 px-3 bg-white rounded-xl border border-slate-200/60"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-400">{idx + 1}.</span>
                            <span className="font-semibold text-slate-800">{item.item_name}</span>
                            <span className="text-slate-400">({item.quantity}x)</span>
                          </div>
                          <span className="font-bold text-slate-900">{formatRupiah(item.price)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
