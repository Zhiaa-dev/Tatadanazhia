'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import {
  isAdminAuthenticated,
  getAdminProfile,
  AdminProfile,
  DEFAULT_ADMIN_PROFILE,
  adminLogout,
  ADMIN_EMAIL,
} from '@/lib/admin-auth';
import {
  ShieldAlert,
  Lock,
  ArrowRight,
  LogOut,
  User,
  Sparkles,
  Bot,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();

  // If on admin login page, bypass layout shell
  const isLoginPage = pathname === '/admin/login';

  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [profile, setProfile] = useState<AdminProfile>(DEFAULT_ADMIN_PROFILE);

  useEffect(() => {
    if (isLoginPage) {
      setIsAuthenticated(true);
      return;
    }

    const checkAuth = () => {
      const auth = isAdminAuthenticated();
      setIsAuthenticated(auth);
      if (auth) {
        setProfile(getAdminProfile());
      } else {
        router.replace('/admin/login');
      }
    };

    checkAuth();

    // Listen for live profile updates
    const handleProfileUpdate = (e: any) => {
      if (e.detail) {
        setProfile(e.detail);
      } else {
        setProfile(getAdminProfile());
      }
    };

    window.addEventListener('tatadana_admin_profile_updated', handleProfileUpdate);
    return () => {
      window.removeEventListener('tatadana_admin_profile_updated', handleProfileUpdate);
    };
  }, [isLoginPage, router, pathname]);

  // If on login page, render bare
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading state during auth check
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 gap-3">
        <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono tracking-wider uppercase text-purple-400">
          Memeriksa Otorisasi Superadmin...
        </span>
      </div>
    );
  }

  // Unauthorized guard screen
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center select-none font-sans">
        <div className="max-w-md p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-rose-950/80 text-rose-500 border border-rose-800 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider bg-rose-950/60 px-3 py-1 rounded-full border border-rose-800">
              403 • Restricted Area
            </span>
            <h2 className="text-2xl font-black text-white">Akses Admin Ditolak</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Halaman ini hanya dapat diakses oleh akun Superadmin TataDana resmi (
              <strong className="text-purple-400 font-mono">{ADMIN_EMAIL}</strong>). Pengguna biasa tidak memiliki akses ke kontrol sistem ini.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 justify-center">
            <Link href="/admin/login" className="w-full sm:w-auto">
              <Button size="md" className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold">
                <Lock className="w-4 h-4" />
                <span>Masuk Sebagai Admin</span>
              </Button>
            </Link>

            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button size="md" variant="outline" className="w-full border-slate-700 text-slate-300">
                Kembali ke App User
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <AdminSidebar adminProfile={profile} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="px-6 md:px-8 py-3.5 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 text-xs font-bold text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="hidden sm:inline">TataDana Production System • Asia/Jakarta (WIB)</span>
              <span className="sm:hidden font-mono text-purple-400">SUPERADMIN</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Link to AI Assistant */}
            <Link
              href="/admin/ai-assistant"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-950/80 border border-purple-800 hover:border-purple-600 text-purple-300 hover:text-white text-xs font-bold transition-colors"
            >
              <Bot className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Financial Advisor</span>
            </Link>

            {/* Admin Profile Badge & Quick Link */}
            <Link
              href="/admin/profile"
              className="flex items-center gap-2.5 p-1.5 pr-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 transition-all group"
              title="Klik untuk Edit Profil Admin"
            >
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-purple-500/50 group-hover:ring-purple-400 transition-all"
              />
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors flex items-center gap-1">
                  <span>{profile.name}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 inline" />
                </div>
                <div className="text-[10px] text-purple-400 font-mono font-semibold">
                  {profile.role}
                </div>
              </div>
            </Link>

            {/* Logout button */}
            <button
              type="button"
              onClick={adminLogout}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900 transition-all"
              title="Keluar dari sesi Admin"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 p-5 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
