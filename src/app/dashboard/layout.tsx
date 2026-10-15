'use client';

import React, { useState, useEffect } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { TopNav } from '@/components/dashboard/TopNav';
import { TransactionModal } from '@/components/dashboard/TransactionModal';
import { Profile, Wallet, Category, TransactionType } from '@/lib/types';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>({
    id: 'usr_budi_01',
    full_name: 'Budi Santoso',
    phone_number: '+6281234567890',
    phone_verified: true,
    plan: 'pro',
    telegram_chat_id: 555123,
    telegram_username: 'budisantoso',
    telegram_bot_status: 'connected',
    default_currency: 'IDR',
    is_admin: true,
    reminder_enabled: true,
    reminder_frequency: 1,
    reminder_time_1: '12:00:00',
    reminder_time_2: '20:00:00',
    monthly_transaction_count: 24,
    monthly_transaction_period: '2026-10-01',
    onboarding_completed: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const [wallets, setWallets] = useState<Wallet[]>([
    { id: 'w_cash', user_id: 'usr_budi_01', name: 'Cash', balance: 1405000, color: '#F97316', icon: 'wallet', is_default: true, created_at: '', updated_at: '' },
    { id: 'w_bca', user_id: 'usr_budi_01', name: 'BCA', balance: 13750000, color: '#3B82F6', icon: 'credit-card', is_default: false, created_at: '', updated_at: '' },
    { id: 'w_gopay', user_id: 'usr_budi_01', name: 'GoPay', balance: 320000, color: '#10B981', icon: 'smartphone', is_default: false, created_at: '', updated_at: '' },
  ]);
  const [categories, setCategories] = useState<Category[]>([
    { id: 'cat_makanan', user_id: 'usr_budi_01', name: 'Makanan', emoji: '🍜', type: 'expense', color: '#F97316', is_default: true, created_at: '' },
    { id: 'cat_transport', user_id: 'usr_budi_01', name: 'Transport', emoji: '🚗', type: 'expense', color: '#3B82F6', is_default: true, created_at: '' },
    { id: 'cat_tagihan', user_id: 'usr_budi_01', name: 'Tagihan', emoji: '🏠', type: 'expense', color: '#EF4444', is_default: true, created_at: '' },
    { id: 'cat_belanja', user_id: 'usr_budi_01', name: 'Belanja', emoji: '👕', type: 'expense', color: '#8B5CF6', is_default: true, created_at: '' },
    { id: 'cat_gaji', user_id: 'usr_budi_01', name: 'Gaji', emoji: '💰', type: 'income', color: '#10B981', is_default: true, created_at: '' },
  ]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isTxModalOpen, setIsTxModalOpen] = useState(false);
  const [impersonatingAdmin, setImpersonatingAdmin] = useState<string | null>(null);

  useEffect(() => {
    // Check impersonation from sessionStorage
    const imp = sessionStorage.getItem('tatadana_impersonation');
    if (imp) {
      setImpersonatingAdmin(imp);
    }

    loadDashboardData();

    const handleProfileUpdate = () => loadDashboardData();
    window.addEventListener('tatadana_profile_updated', handleProfileUpdate);
    return () => window.removeEventListener('tatadana_profile_updated', handleProfileUpdate);
  }, []);

  const loadDashboardData = async () => {
    // 1. Ambil data identitas login dari storage
    const regName =
      (typeof window !== 'undefined' ? localStorage.getItem('tatadana_reg_name') : null) ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('tatadana_reg_name') : null) ||
      '';
    const regEmail =
      (typeof window !== 'undefined' ? localStorage.getItem('tatadana_user') : null) ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('tatadana_user') : null) ||
      '';
    const regUserId =
      (typeof window !== 'undefined' ? localStorage.getItem('tatadana_user_id') : null) ||
      (typeof window !== 'undefined' ? sessionStorage.getItem('tatadana_user_id') : null) ||
      '';
    const localAvatar = typeof window !== 'undefined' ? localStorage.getItem('tatadana_profile_avatar') : null;

    // Fast Initial State agar 0ms menampilkan nama yang baru didaftarkan
    if (regName) {
      setProfile((prev) => ({
        ...(prev || ({} as any)),
        id: regUserId || prev?.id || 'usr_' + Date.now(),
        full_name: regName,
        email: regEmail || prev?.email,
        avatar_url: localAvatar || prev?.avatar_url,
      }));
    }

    try {
      // 2. Fetch live profile & wallets immediately from TataDana API
      const queryParams = new URLSearchParams();
      if (regUserId) queryParams.set('userId', regUserId);
      if (regEmail) queryParams.set('email', regEmail);
      const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

      const [resProf, resOver] = await Promise.allSettled([
        fetch(`/api/data/profile${queryString}`).then((r) => r.json()),
        fetch(`/api/data/overview${queryString}`).then((r) => r.json()),
      ]);

      if (resProf.status === 'fulfilled' && resProf.value?.ok && resProf.value.profile) {
        const p = resProf.value.profile;
        setProfile({
          ...p,
          full_name: regName || p.full_name || 'Pengguna TataDana',
          avatar_url: p.avatar_url || localAvatar || undefined,
        });
      }

      if (resOver.status === 'fulfilled' && resOver.value?.ok) {
        if (resOver.value.wallets?.length > 0) {
          setWallets(resOver.value.wallets);
        }
        if (resOver.value.categories?.length > 0) {
          setCategories(resOver.value.categories);
        }
      }
    } catch (e) {
      // Fallback
    }

    try {
      const regPhone =
        (typeof window !== 'undefined' ? sessionStorage.getItem('tatadana_reg_phone') : null) ||
        (typeof window !== 'undefined' ? localStorage.getItem('tatadana_reg_phone') : null) ||
        '+6281234567890';
      const regAvatar = (typeof window !== 'undefined' ? localStorage.getItem('tatadana_profile_avatar') : null) || undefined;
      const isTgConn = typeof window !== 'undefined' && localStorage.getItem('tatadana_telegram_connected') !== 'false';
      const tgUser = (typeof window !== 'undefined' ? localStorage.getItem('tatadana_telegram_username') : null) || 'TataDanaBot';

      setProfile((prev) => ({
        id: regUserId || prev?.id || 'usr_budi_01',
        full_name: regName || prev?.full_name || 'Budi Santoso',
        email: regEmail || prev?.email || 'budi.santoso@gmail.com',
        avatar_url: regAvatar || prev?.avatar_url,
        phone_number: regPhone,
        phone_verified: true,
        plan: prev?.plan || 'pro',
        telegram_chat_id: 12345678,
        telegram_username: tgUser,
        telegram_bot_status: isTgConn ? 'connected' : 'disconnected',
        default_currency: 'IDR',
        is_admin: true,
        reminder_enabled: true,
        reminder_frequency: 1,
        reminder_time_1: '12:00:00',
        reminder_time_2: '20:00:00',
        monthly_transaction_count: prev?.monthly_transaction_count || 24,
        monthly_transaction_period: '2026-10-01',
        onboarding_completed: true,
        created_at: prev?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    sessionStorage.clear();
    router.push('/login');
  };

  const handleCreateTransaction = async (data: {
    type: TransactionType;
    amount: number;
    wallet_id: string;
    category_id?: string;
    destination_wallet_id?: string;
    description: string;
    transaction_time: string;
  }) => {
    if (!profile) return;
    const supabase = createClient();

    // Check if demo
    if (profile.id === 'demo-user-id') {
      // Local state update for immediate feedback
      setWallets((prev) =>
        prev.map((w) => {
          if (w.id === data.wallet_id) {
            const newBal = data.type === 'expense' ? Number(w.balance) - data.amount : Number(w.balance) + data.amount;
            return { ...w, balance: newBal };
          }
          if (data.type === 'transfer' && w.id === data.destination_wallet_id) {
            return { ...w, balance: Number(w.balance) + data.amount };
          }
          return w;
        })
      );
      // Dispatch custom event so pages can refresh
      window.dispatchEvent(new CustomEvent('tatadana_transaction_added', { detail: data }));
      return;
    }

    const { error } = await supabase.from('transactions').insert([
      {
        user_id: profile.id,
        ...data,
        source: 'web',
      },
    ]);

    if (error) throw error;
    await loadDashboardData();
    window.dispatchEvent(new CustomEvent('tatadana_transaction_added', { detail: data }));
  };

  const stopImpersonation = () => {
    sessionStorage.removeItem('tatadana_impersonation');
    sessionStorage.removeItem('tatadana_impersonating_user_id');
    setImpersonatingAdmin(null);
    router.push('/admin/users');
  };

  return (
    <div className="flex min-h-screen bg-slate-50/60 font-sans text-slate-900">
      {/* Impersonation Banner (Part 10) */}
      {impersonatingAdmin && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-600 to-indigo-700 text-white text-xs font-semibold px-4 py-2 flex items-center justify-between shadow-md">
          <span>
            ⚠️ <strong>MODE IMPERSONATION ADMIN:</strong> Anda sedang melihat dashboard sebagai <u>{profile?.full_name}</u> ({profile?.phone_number}).
          </span>
          <button
            onClick={stopImpersonation}
            className="flex items-center gap-1 bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-lg transition-colors"
          >
            <span>Kembali ke Admin</span>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Desktop Sidebar */}
      <Sidebar
        profile={profile}
        onLogout={handleLogout}
        className={`hidden lg:flex ${impersonatingAdmin ? 'mt-8' : ''}`}
      />

      {/* Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          />
          <Sidebar
            profile={profile}
            onLogout={handleLogout}
            onItemClick={() => setIsSidebarOpen(false)}
            className="relative z-10 w-72 h-full shadow-2xl"
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 ${impersonatingAdmin ? 'mt-8' : ''}`}>
        <TopNav
          title="TataDana"
          subtitle="Catat keuangan semudah chat"
          profile={profile}
          onMenuToggle={() => setIsSidebarOpen(!isSidebarOpen)}
          onNewTransaction={() => setIsTxModalOpen(true)}
        />

        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>

      {/* New Transaction Modal */}
      <TransactionModal
        isOpen={isTxModalOpen}
        onClose={() => setIsTxModalOpen(false)}
        wallets={wallets}
        categories={categories}
        onSubmit={handleCreateTransaction}
      />
    </div>
  );
}
