'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Shield,
  Lock,
  Mail,
  User,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  KeyRound,
  Eye,
  EyeOff,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import {
  ADMIN_EMAIL,
  ADMIN_USERNAME,
  adminLogin,
  isAdminAuthenticated,
} from '@/lib/admin-auth';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // If already authenticated as admin, redirect directly
  useEffect(() => {
    if (isAdminAuthenticated()) {
      router.replace('/admin');
    }
  }, [router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const res = adminLogin(email, username, password, rememberMe);
      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push('/admin');
        }, 500);
      } else {
        setError(res.error || 'Akses Ditolak! Kredensial Superadmin tidak valid.');
        setIsLoading(false);
      }
    }, 400);
  };

  const handleAutofill = () => {
    setEmail(ADMIN_EMAIL);
    setUsername(ADMIN_USERNAME);
    setPassword('admin123');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 relative overflow-hidden select-none font-sans">
      {/* Background Cybernetic Gradients */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[450px] h-[450px] bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Top Brand & Gateway Badge */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 via-indigo-600 to-orange-500 p-0.5 shadow-2xl shadow-purple-500/20 mx-auto">
            <div className="w-full h-full bg-slate-950 rounded-[22px] flex items-center justify-center text-purple-400">
              <Shield className="w-8 h-8" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-950/80 border border-purple-800 text-purple-300 text-[11px] font-bold tracking-wider uppercase mb-2">
              <KeyRound className="w-3.5 h-3.5" /> Portal Khusus Superadmin TataDana
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
              Login Dashboard Admin
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              Halaman ini terpisah dari dashboard pengguna biasa dan hanya dapat diakses dengan akun otentik.
            </p>
          </div>
        </div>

        {/* Security Warning Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="font-bold flex items-center gap-1.5 text-purple-300">
              <Cpu className="w-4 h-4 text-purple-400" /> Kredensial Resmi Diperlukan:
            </span>
            <span className="text-[10px] bg-purple-900/50 text-purple-200 px-2 py-0.5 rounded-md font-mono font-bold">
              AUTHORIZED ONLY
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs font-mono font-bold">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-emerald-400">
              <span className="text-[10px] text-slate-500 block font-sans font-normal">Email:</span>
              <span className="truncate block">{ADMIN_EMAIL}</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-purple-400">
              <span className="text-[10px] text-slate-500 block font-sans font-normal">Nama Pengguna:</span>
              <span className="truncate block">{ADMIN_USERNAME}</span>
            </div>
          </div>
        </div>

        {/* Login Form Box */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-slate-800 shadow-2xl space-y-5">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-800 text-rose-200 text-xs font-medium space-y-1 animate-shake">
              <div className="flex items-center gap-1.5 font-bold text-rose-400">
                <AlertTriangle className="w-4 h-4" /> Akses Ditolak
              </div>
              <p className="text-rose-200/90 leading-relaxed">{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 animate-spin" />
              <span>Kredensial valid! Mengalihkan ke Dashboard Admin...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Input 1: Alamat Email */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Alamat Email Admin
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="youknowzhia@gmail.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Wajib email: <strong className="text-purple-400 font-mono">{ADMIN_EMAIL}</strong>
              </p>
            </div>

            {/* Input 2: Nama Pengguna (Username) */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nama Pengguna (Username) Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admindana"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Wajib username: <strong className="text-purple-400 font-mono">{ADMIN_USERNAME}</strong>
              </p>
            </div>

            {/* Input 3: Kata Sandi */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Kata Sandi Admin
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white font-mono placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-purple-600 focus:ring-purple-500"
                />
                <span>Ingat Sesi Admin</span>
              </label>

              <span className="text-[11px] text-purple-400 font-semibold flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> 256-Bit SSL
              </span>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={isLoading || success}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 mt-2"
            >
              {isLoading ? (
                <span>Memverifikasi Kredensial...</span>
              ) : (
                <>
                  <span>Masuk ke Dashboard Superadmin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Quick autofill helper */}
          <div className="pt-3 border-t border-slate-800/80 text-center">
            <button
              type="button"
              onClick={handleAutofill}
              className="text-[11px] text-slate-400 hover:text-purple-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Isi Otomatis Kredensial Resmi Admin (youknowzhia & admindana)</span>
            </button>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="text-center pt-2">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-300 transition-colors py-1 px-3 rounded-xl hover:bg-slate-900"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke App Pengguna TataDana</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
