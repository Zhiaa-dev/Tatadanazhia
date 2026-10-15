'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Send, Sparkles, Lock, Mail, ArrowRight, User, CheckCircle2, UserCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [detectedUser, setDetectedUser] = useState<{ name: string; email: string } | null>(null);

  // Auto-detect registered user when email is typed
  useEffect(() => {
    if (!email.trim() || !email.includes('@')) {
      setDetectedUser(null);
      return;
    }

    const clean = email.trim().toLowerCase();

    // Check localStorage cached users
    try {
      const allUsersStr = localStorage.getItem('tatadana_all_users');
      if (allUsersStr) {
        const allUsers = JSON.parse(allUsersStr);
        const found = allUsers.find((u: any) => u.email && u.email.toLowerCase() === clean);
        if (found) {
          setDetectedUser({ name: found.full_name, email: found.email });
          if (!fullName) setFullName(found.full_name);
          return;
        }
      }
    } catch (e) {}

    // Check last registered user in sessionStorage
    const lastRegEmail = sessionStorage.getItem('tatadana_reg_email');
    const lastRegName = sessionStorage.getItem('tatadana_reg_name');
    if (lastRegEmail && lastRegEmail.toLowerCase() === clean && lastRegName) {
      setDetectedUser({ name: lastRegName, email: lastRegEmail });
      if (!fullName) setFullName(lastRegName);
    } else {
      setDetectedUser(null);
    }
  }, [email]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (!email.trim() || !password.trim()) {
        setError('Harap isi email dan password.');
        setIsLoading(false);
        return;
      }

      // 1. Sinkronisasi data login ke Backend Store TataDana
      let userProfile: any = null;
      try {
        const res = await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            full_name: detectedUser?.name || fullName.trim() || undefined,
            isLogin: true,
          }),
        });
        const data = await res.json();
        if (data.ok && data.profile) {
          userProfile = data.profile;
        }
      } catch (syncErr) {
        console.warn('API sync fallback active:', syncErr);
      }

      const userId = userProfile?.id || 'usr_' + Date.now();
      const resolvedName =
        userProfile?.full_name ||
        detectedUser?.name ||
        fullName.trim() ||
        sessionStorage.getItem('tatadana_reg_name') ||
        email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

      const resolvedPhone = userProfile?.phone_number || sessionStorage.getItem('tatadana_reg_phone') || '+6281234567890';

      // 2. Simpan session user lokal & storage agar dashboard user menampilkan nama yang sesuai
      localStorage.setItem('tatadana_user_id', userId);
      localStorage.setItem('tatadana_user', email);
      localStorage.setItem('tatadana_reg_name', resolvedName);
      localStorage.setItem('tatadana_reg_email', email);
      localStorage.setItem('tatadana_reg_phone', resolvedPhone);
      localStorage.setItem(
        'tatadana_current_user',
        JSON.stringify(
          userProfile || {
            id: userId,
            full_name: resolvedName,
            email,
            phone_number: resolvedPhone,
            plan: userProfile?.plan || 'pro',
          }
        )
      );

      sessionStorage.setItem('tatadana_user_id', userId);
      sessionStorage.setItem('tatadana_user', email);
      sessionStorage.setItem('tatadana_reg_name', resolvedName);
      sessionStorage.setItem('tatadana_reg_email', email);
      sessionStorage.setItem('tatadana_reg_phone', resolvedPhone);

      // 3. Simpan juga ke cache daftar semua user untuk Admin Panel instant sync
      try {
        const existingUsersStr = localStorage.getItem('tatadana_all_users') || '[]';
        const existingUsers = JSON.parse(existingUsersStr);
        const updatedUsers = [
          {
            id: userId,
            full_name: resolvedName,
            email,
            phone_number: resolvedPhone,
            plan: userProfile?.plan || 'pro',
            telegram_connected: true,
            monthly_tx_count: userProfile?.monthly_transaction_count || 12,
            total_balance: userProfile?.total_balance || 1450000,
            created_at: userProfile?.created_at || new Date().toISOString(),
            last_login_at: new Date().toISOString(),
          },
          ...existingUsers.filter((u: any) => u.email !== email),
        ];
        localStorage.setItem('tatadana_all_users', JSON.stringify(updatedUsers));
      } catch (e) {
        console.error(e);
      }

      // 4. Trigger event reaktif ke seluruh aplikasi
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('tatadana_profile_updated'));
        window.dispatchEvent(new CustomEvent('tatadana_users_updated'));
      }

      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Gagal masuk akun');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (demoEmail: string, demoName: string) => {
    setEmail(demoEmail);
    setFullName(demoName);
    setPassword('tatadana123');
    setDetectedUser({ name: demoName, email: demoEmail });
  };

  return (
    <div className="min-h-screen flex bg-white font-sans">
      {/* Kiri (40%) — Branding Panel */}
      <div className="hidden lg:flex lg:w-[40%] bg-gradient-to-br from-orange-500 via-orange-600 to-amber-700 p-12 text-white flex-col justify-between relative overflow-hidden select-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-white text-orange-600 flex items-center justify-center font-bold shadow-lg">
              <Send className="w-5 h-5 -rotate-12 translate-x-0.5" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">TataDana</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-orange-100">
            <Sparkles className="w-3.5 h-3.5" /> Fintech Personal Indonesia
          </div>
          <h2 className="text-4xl font-black leading-tight text-white tracking-tight">
            Keuanganmu. <br />
            Terkontrol.
          </h2>
          <p className="text-sm text-orange-100 leading-relaxed max-w-sm">
            Catat pengeluaran semudah kirim pesan Telegram. Dapatkan insight finansial otomatis tanpa ribet.
          </p>
        </div>

        <div className="relative z-10 text-xs text-orange-200">
          © {new Date().getFullYear()} TataDana. Aman dan terenkripsi.
        </div>
      </div>

      {/* Kanan (60%) — Form Login */}
      <div className="w-full lg:w-[60%] flex items-center justify-center p-6 md:p-12 lg:p-20 overflow-y-auto">
        <div className="w-full max-w-md space-y-6">
          <div>
            <div className="lg:hidden flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold shadow-brand">
                <Send className="w-4 h-4 -rotate-12 translate-x-0.5" />
              </div>
              <span className="text-xl font-black text-slate-900">
                Tata<span className="text-orange-500">Dana</span>
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Selamat Datang Kembali</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">Masuk untuk melihat laporan dan saldo keuanganmu.</p>
          </div>

          {/* Quick Demo Selector */}
          <div className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-2xl text-xs space-y-2">
            <span className="text-[11px] font-bold text-orange-900 block">Akun Contoh Cepat:</span>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('budi.santoso@gmail.com', 'Budi Santoso')}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-orange-100 text-orange-800 border border-orange-200 font-bold transition-colors"
              >
                👤 Budi Santoso
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('siti.rahmawati@gmail.com', 'Siti Rahmawati')}
                className="px-2.5 py-1 rounded-xl bg-white hover:bg-orange-100 text-orange-800 border border-orange-200 font-bold transition-colors"
              >
                👤 Siti Rahmawati
              </button>
            </div>
          </div>

          {detectedUser && (
            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Akun terdeteksi: <strong>{detectedUser.name}</strong></span>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Alamat Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  placeholder="nama@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Nama Pengguna (Opsional / Otomatis)</label>
              </div>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={detectedUser?.name || 'Sesuai pendaftaran / isi untuk akun baru'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-slate-700">Password</label>
                <a href="#" className="text-xs font-semibold text-orange-600 hover:text-orange-700">
                  Lupa password?
                </a>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full shadow-brand" isLoading={isLoading}>
                <span>Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>

          {/* Social Login Divider */}
          <div className="relative my-4 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <span className="relative bg-white px-3 text-xs text-slate-400 font-semibold uppercase">atau</span>
          </div>

          <button
            type="button"
            onClick={async () => {
              const googleEmail = 'google_user@gmail.com';
              const googleName = 'Pengguna Google';
              try {
                await fetch('/api/users/sync', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: googleEmail, full_name: googleName, isLogin: true }),
                });
              } catch (e) {}

              localStorage.setItem('tatadana_user', googleEmail);
              localStorage.setItem('tatadana_reg_name', googleName);
              sessionStorage.setItem('tatadana_user', googleEmail);
              sessionStorage.setItem('tatadana_reg_name', googleName);

              if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('tatadana_profile_updated'));
                window.dispatchEvent(new CustomEvent('tatadana_users_updated'));
              }
              router.push('/dashboard');
            }}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white font-bold text-xs text-slate-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Lanjutkan dengan Google</span>
          </button>

          <p className="text-center text-xs text-slate-500 font-medium pt-2">
            Belum punya akun TataDana?{' '}
            <Link href="/register" className="text-orange-600 font-bold hover:underline">
              Daftar Sekarang
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
