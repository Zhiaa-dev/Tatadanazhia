'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  CreditCard,
  BarChart3,
  Target,
  Wallet as WalletIcon,
  Settings,
  Sparkles,
  LogOut,
  Send,
  Shield,
} from 'lucide-react';
import { Profile } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface SidebarProps {
  profile?: Profile | null;
  onLogout?: () => void;
  className?: string;
  onItemClick?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  profile,
  onLogout,
  className = '',
  onItemClick,
}) => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Beranda', href: '/dashboard', icon: Home },
    { label: 'Transaksi', href: '/dashboard/transactions', icon: CreditCard },
    { label: 'Laporan', href: '/dashboard/reports', icon: BarChart3 },
    { label: 'Budget', href: '/dashboard/budget', icon: Target },
    { label: 'Dompet', href: '/dashboard/wallets', icon: WalletIcon },
    { label: 'Pengaturan', href: '/dashboard/settings', icon: Settings },
  ];

  const plan = profile?.plan || 'starter';
  const isPro = plan === 'pro';

  return (
    <aside
      className={`flex flex-col justify-between w-64 bg-white border-r border-slate-200/80 p-5 h-screen select-none ${className}`}
    >
      <div>
        {/* Brand Logo */}
        <Link href="/dashboard" className="flex items-center gap-3 px-2 py-3 mb-6 group">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-orange-500 to-orange-600 flex items-center justify-center text-white shadow-brand transition-transform group-hover:scale-105">
            <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight text-slate-900 flex items-center gap-1.5">
              Tata<span className="text-orange-500">Dana</span>
            </div>
            <p className="text-[10px] font-medium text-slate-400 -mt-1 tracking-wider uppercase">Fintech Telegram</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onItemClick}
                className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-brand'
                    : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50/70'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-orange-500'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}


        </nav>
      </div>

      {/* User Plan & Profile Footer */}
      <div className="pt-4 border-t border-slate-100 space-y-3">
        {/* Pro Banner if Starter */}
        {!isPro && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/60 border border-orange-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-orange-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-orange-500" /> Upgrade Pro
              </span>
              <span className="text-[10px] font-extrabold text-orange-600 bg-orange-200/60 px-1.5 py-0.5 rounded-md">Rp99k</span>
            </div>
            <p className="text-[11px] text-orange-800/80 leading-relaxed">
              Scan struk via foto, AI Advisor & export laporan tanpa batas.
            </p>
            <Link
              href="/#pricing"
              className="mt-2.5 block text-center text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white py-1.5 rounded-xl shadow-sm transition-colors"
            >
              Upgrade Sekali Bayar
            </Link>
          </div>
        )}

        {/* User Profile Card */}
        <div className="flex items-center justify-between p-2 rounded-2xl bg-slate-50 border border-slate-200/60">
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-2.5 min-w-0 flex-1 group mr-2"
            title="Buka Pengaturan & Ubah Foto Profil"
          >
            {profile?.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name || 'User'}
                className="w-9 h-9 rounded-xl object-cover border border-orange-300 ring-2 ring-orange-400/20 flex-shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-200 text-orange-600 font-bold flex items-center justify-center text-xs flex-shrink-0 group-hover:bg-orange-500/20 transition-colors">
                {profile?.full_name ? profile.full_name.slice(0, 2).toUpperCase() : 'TD'}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-800 group-hover:text-orange-600 truncate transition-colors">
                {profile?.full_name || 'User TataDana'}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <Badge variant={isPro ? 'orange' : 'gray'} size="sm">
                  {isPro ? 'PRO LIFETIME' : 'STARTER'}
                </Badge>
              </div>
            </div>
          </Link>

          <button
            onClick={onLogout}
            title="Keluar"
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex-shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
