'use client';

import React from 'react';
import { Menu, Plus, Bell, Send } from 'lucide-react';
import { Button } from '@/components/ui/Button';

import Link from 'next/link';
import { Profile } from '@/lib/types';

interface TopNavProps {
  onMenuToggle: () => void;
  onNewTransaction: () => void;
  title: string;
  subtitle?: string;
  profile?: Profile | null;
}

export const TopNav: React.FC<TopNavProps> = ({
  onMenuToggle,
  onNewTransaction,
  title,
  subtitle,
  profile,
}) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="text-xs text-slate-500 hidden sm:block">{subtitle}</p>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={onNewTransaction} size="sm" className="hidden sm:inline-flex">
          <Plus className="w-4 h-4" />
          <span>Tambah Transaksi</span>
        </Button>

        <Button onClick={onNewTransaction} size="sm" className="sm:hidden px-3">
          <Plus className="w-4 h-4" />
        </Button>

        {/* Profile Avatar Quick Link */}
        <Link
          href="/dashboard/settings"
          className="flex items-center gap-2 p-1 pl-2 pr-1.5 rounded-2xl hover:bg-orange-50 border border-slate-200/80 bg-white shadow-sm transition-all group"
          title="Buka Pengaturan & Ubah Foto Profil"
        >
          <span className="text-xs font-bold text-slate-700 group-hover:text-orange-600 hidden md:block max-w-[110px] truncate">
            {profile?.full_name || 'Budi Santoso'}
          </span>
          {profile?.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="Foto Profil"
              className="w-8 h-8 rounded-xl object-cover border border-orange-300 ring-2 ring-orange-400/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-xl bg-orange-100 border border-orange-200 text-orange-600 font-bold text-xs flex items-center justify-center">
              {profile?.full_name ? profile.full_name.slice(0, 2).toUpperCase() : 'TD'}
            </div>
          )}
        </Link>
      </div>
    </header>
  );
};
