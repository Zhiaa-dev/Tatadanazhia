'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Shield,
  Home,
  Wallet,
  Cpu,
  Users,
  Activity,
  CreditCard,
  ArrowLeft,
  Bot,
  UserCheck,
  LogOut,
  Sparkles,
  Settings,
} from 'lucide-react';
import { AdminProfile, DEFAULT_ADMIN_PROFILE, adminLogout } from '@/lib/admin-auth';

interface AdminSidebarProps {
  adminProfile?: AdminProfile;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  adminProfile = DEFAULT_ADMIN_PROFILE,
}) => {
  const pathname = usePathname();

  const links = [
    { label: 'Beranda Admin', href: '/admin', icon: Home },
    { label: 'Dompet Admin', href: '/admin/wallets', icon: Wallet, badge: 'Dompet' },
    {
      label: 'Asisten AI Finansial & Kasir',
      href: '/admin/ai-assistant',
      icon: Bot,
      highlight: true,
      badge: 'AI Sinkron',
    },
    { label: 'Edit Profil Admin', href: '/admin/profile', icon: UserCheck },
    { label: 'Kelola Pengguna', href: '/admin/users', icon: Users },
    { label: 'Kelola AI Providers', href: '/admin/ai-providers', icon: Cpu },
    { label: 'Log Pemanggilan AI', href: '/admin/ai-logs', icon: Activity },
    { label: 'Pembayaran & Midtrans', href: '/admin/payments', icon: CreditCard },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col justify-between p-4 h-screen select-none border-r border-slate-800 sticky top-0 flex-shrink-0">
      <div className="space-y-6 overflow-y-auto pr-1">
        {/* Brand */}
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-orange-500 flex items-center justify-center text-white shadow-lg shadow-purple-600/30">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-base font-black tracking-tight text-white flex items-center gap-1.5">
              Tata<span className="text-orange-500">Dana</span>
            </div>
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block">
              Superadmin Hub
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl font-bold text-xs transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{link.label}</span>
                </div>
                {link.badge && !isActive && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-purple-950 text-purple-300 border border-purple-800">
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Admin Profile Footer & Controls */}
      <div className="pt-4 border-t border-slate-800 space-y-3">
        {/* Live Admin Profile Card */}
        <Link
          href="/admin/profile"
          className="flex items-center gap-3 p-2.5 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 transition-all group"
          title="Klik untuk Edit Profil Admin"
        >
          <img
            src={adminProfile.avatarUrl}
            alt={adminProfile.name}
            className="w-9 h-9 rounded-xl object-cover ring-2 ring-purple-500/40 group-hover:ring-purple-400 transition-all flex-shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors truncate">
              {adminProfile.name}
            </div>
            <div className="text-[10px] text-purple-400 truncate font-mono">
              @{adminProfile.username || 'admindana'}
            </div>
          </div>
          <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 transition-colors flex-shrink-0" />
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>App User</span>
          </Link>

          <button
            type="button"
            onClick={adminLogout}
            className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-rose-950/30 hover:bg-rose-950/60 border border-rose-900/50 transition-colors cursor-pointer"
            title="Keluar dari sesi Admin"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
