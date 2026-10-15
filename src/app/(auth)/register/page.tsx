'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Send, Sparkles, Lock, Mail, Phone, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!phone.trim()) {
      setError('Nomor HP wajib diisi untuk menghubungkan akun Anda dengan Telegram Bot.');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Sinkronisasi data pengguna ke Backend Store TataDana
      let userProfile = null;
      try {
        const res = await fetch('/api/users/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            full_name: fullName,
            email,
            phone_number: phone,
            plan: 'starter',
            isLogin: false,
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

      // 2. Simpan session user lokal & storage agar konsisten di semua halaman
      localStorage.setItem('tatadana_user_id', userId);
      localStorage.setItem('tatadana_user', email);
      localStorage.setItem('tatadana_reg_name', fullName);
      localStorage.setItem('tatadana_reg_email', email);
      localStorage.setItem('tatadana_reg_phone', phone);
      localStorage.setItem(
        'tatadana_current_user',
        JSON.stringify(userProfile || { id: userId, full_name: fullName, email, phone_number: phone, plan: 'starter' })
      );

      sessionStorage.setItem('tatadana_user_id', userId);
      sessionStorage.setItem('tatadana_user', email);
      sessionStorage.setItem('tatadana_reg_name', fullName);
      sessionStorage.setItem('tatadana_reg_email', email);
      sessionStorage.setItem('tatadana_reg_phone', phone);

      // 3. Simpan juga ke cache daftar semua user untuk Admin Panel instant sync
      try {
        const existingUsersStr = localStorage.getItem('tatadana_all_users') || '[]';
        const existingUsers = JSON.parse(existingUsersStr);
        const updatedUsers = [
          {
            id: userId,
            full_name: fullName,
            email,
            phone_number: phone,
            plan: 'starter',
            telegram_connected: false,
            monthly_tx_count: 0,
            total_balance: 1500000,
            created_at: new Date().toISOString(),
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

      // 5. Hubungkan ke Supabase Auth jika backend aktif (opsional sandbox)
      try {
        const supabase = createClient();
        await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              phone_number: phone,
            },
          },
        });
      } catch (authErr) {
        // Fallback untuk offline/sandbox
        console.log('Supabase offline or fallback active:', authErr);
      }

      setSuccess(true);

      // Langsung arahkan ke Dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar akun.');
    } finally {
      setIsLoading(false);
    }
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
            <Sparkles className="w-3.5 h-3.5" /> Registrasi Cepat & Praktis
          </div>
          <h2 className="text-4xl font-black leading-tight text-white tracking-tight">
            Mulai Catat. <br />
            Kendalikan Hidupmu.
          </h2>
          <p className="text-sm text-orange-100 leading-relaxed max-w-sm">
            Daftar langsung dalam satu langkah. AI akan otomatis menyiapkan kategori keuangan dan dompet default untuk Telegrammu.
          </p>
        </div>

        <div className="relative z-10 text-xs text-orange-200">
          © {new Date().getFullYear()} TataDana. Bebas ribet & data terenkripsi.
        </div>
      </div>

      {/* Kanan (60%) — Form Register (Langsung Aktif Tanpa OTP) */}
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

            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Buat Akun TataDana</h2>
            <p className="text-xs md:text-sm text-slate-500 mt-1">
              Daftar instan dalam 30 detik tanpa perlu verifikasi kode OTP.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Akun berhasil dibuat! Mengalihkan langsung ke dashboard...</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-medium"
                />
              </div>
            </div>

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
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Nomor WhatsApp / HP (Kunci Telegram)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  placeholder="081234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-medium font-mono"
                />
              </div>
              <p className="text-[11px] text-slate-400 mt-1">
                Nomor ini langsung terhubung dengan akun Telegram kamu (@TataDanaBot).
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Buat Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 text-sm outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 transition-all font-medium"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" size="lg" className="w-full shadow-brand" isLoading={isLoading} disabled={success}>
                <span>Daftar & Masuk ke Dashboard</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </form>

          <p className="text-center text-xs text-slate-500 font-medium">
            Sudah memiliki akun?{' '}
            <Link href="/login" className="text-orange-600 font-bold hover:underline">
              Masuk di Sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
