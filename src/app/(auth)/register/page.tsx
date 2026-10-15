'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Send, Sparkles, Lock, Mail, Phone, User, ArrowRight, CheckCircle2, Clock, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Pending approval state
  const [isPendingApproval, setIsPendingApproval] = useState(false);
  const [registeredData, setRegisteredData] = useState<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    registeredAt: string;
    status: 'pending' | 'approved' | 'rejected';
  } | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [checkStatusMessage, setCheckStatusMessage] = useState<{ type: 'pending' | 'approved' | 'rejected'; text: string } | null>(null);

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
      // 1. Sinkronisasi data pengguna ke Backend Store TataDana dengan status 'pending'
      let userProfile: any = null;
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
      const nowIso = new Date().toISOString();

      // 2. Simpan ke cache daftar semua user untuk Admin Panel instant sync dengan status 'pending'
      try {
        const existingUsersStr = localStorage.getItem('tatadana_all_users') || '[]';
        const existingUsers = JSON.parse(existingUsersStr);
        const newUserEntry = {
          id: userId,
          full_name: fullName,
          email,
          phone_number: phone,
          plan: 'starter',
          approval_status: userProfile?.approval_status || 'pending',
          telegram_connected: false,
          monthly_tx_count: 0,
          total_balance: 1500000,
          created_at: nowIso,
          last_login_at: nowIso,
        };
        const updatedUsers = [newUserEntry, ...existingUsers.filter((u: any) => u.email !== email)];
        localStorage.setItem('tatadana_all_users', JSON.stringify(updatedUsers));
      } catch (e) {
        console.error(e);
      }

      // 3. Simpan data registrasi pending untuk referensi tampilan
      sessionStorage.setItem('tatadana_pending_email', email);
      sessionStorage.setItem('tatadana_pending_name', fullName);
      sessionStorage.setItem('tatadana_pending_phone', phone);
      sessionStorage.setItem('tatadana_pending_id', userId);

      // 4. Trigger event reaktif ke admin panel jika sedang terbuka di tab lain
      if (typeof window !== 'undefined') {
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
        console.log('Supabase offline or fallback active:', authErr);
      }

      setRegisteredData({
        id: userId,
        fullName,
        email,
        phone,
        registeredAt: nowIso,
        status: userProfile?.approval_status || 'pending',
      });
      setIsPendingApproval(true);
    } catch (err: any) {
      setError(err.message || 'Gagal mendaftar akun.');
    } finally {
      setIsLoading(false);
    }
  };

  const checkApprovalStatus = async () => {
    if (!registeredData?.email) return;
    setIsCheckingStatus(true);
    setCheckStatusMessage(null);

    try {
      // 1. Cek dari backend API
      let currentStatus: 'pending' | 'approved' | 'rejected' = 'pending';
      let profileFromApi: any = null;

      try {
        const res = await fetch(`/api/users/sync?email=${encodeURIComponent(registeredData.email)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.ok && data.profile) {
            profileFromApi = data.profile;
            if (data.profile.approval_status) {
              currentStatus = data.profile.approval_status;
            }
          }
        }
      } catch (e) {}

      // 2. Cek juga dari localStorage jika admin menyetujui di browser yang sama
      try {
        const allUsersStr = localStorage.getItem('tatadana_all_users');
        if (allUsersStr) {
          const allUsers = JSON.parse(allUsersStr);
          const found = allUsers.find((u: any) => u.email && u.email.toLowerCase() === registeredData.email.toLowerCase());
          if (found && found.approval_status) {
            currentStatus = found.approval_status;
          }
        }
      } catch (e) {}

      if (currentStatus === 'approved') {
        setCheckStatusMessage({
          type: 'approved',
          text: '🎉 Selamat! Akun Anda telah disetujui oleh Administrator. Anda akan dialihkan ke Dashboard dalam sekejap...',
        });

        // Set session login aktif
        localStorage.setItem('tatadana_user_id', registeredData.id);
        localStorage.setItem('tatadana_user', registeredData.email);
        localStorage.setItem('tatadana_reg_name', registeredData.fullName);
        localStorage.setItem('tatadana_reg_email', registeredData.email);
        localStorage.setItem('tatadana_reg_phone', registeredData.phone);
        localStorage.setItem(
          'tatadana_current_user',
          JSON.stringify(
            profileFromApi || {
              id: registeredData.id,
              full_name: registeredData.fullName,
              email: registeredData.email,
              phone_number: registeredData.phone,
              plan: 'starter',
              approval_status: 'approved',
            }
          )
        );

        sessionStorage.setItem('tatadana_user_id', registeredData.id);
        sessionStorage.setItem('tatadana_user', registeredData.email);
        sessionStorage.setItem('tatadana_reg_name', registeredData.fullName);

        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('tatadana_profile_updated'));
        }

        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else if (currentStatus === 'rejected') {
        setCheckStatusMessage({
          type: 'rejected',
          text: 'Pendaftaran akun Anda ditolak oleh Administrator. Silakan hubungi admin untuk informasi lebih lanjut.',
        });
      } else {
        setCheckStatusMessage({
          type: 'pending',
          text: 'Akun Anda masih dalam antrean persetujuan admin. Silakan tunggu beberapa saat lagi atau hubungi admin.',
        });
      }
    } catch (e: any) {
      setCheckStatusMessage({
        type: 'pending',
        text: 'Sedang menunggu persetujuan admin. Silakan cek kembali nanti.',
      });
    } finally {
      setIsCheckingStatus(false);
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

      {/* Kanan (60%) — Form Register / Menunggu Approval */}
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

            {isPendingApproval ? (
              <div className="text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold mb-3">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                  <span>Verifikasi Keamanan</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Pendaftaran Berhasil!
                </h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Akun Anda sedang menunggu persetujuan (approval) dari Administrator.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Buat Akun TataDana</h2>
                <p className="text-xs md:text-sm text-slate-500 mt-1">
                  Daftar instan dalam 30 detik. Akun baru akan diverifikasi oleh admin sebelum dapat digunakan.
                </p>
              </div>
            )}
          </div>

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isPendingApproval ? (
            /* Tampilan Khusus Menunggu Approval Admin */
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-5 rounded-3xl bg-amber-50/60 border border-amber-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-amber-200/60">
                  <span className="text-xs font-bold text-amber-900 uppercase tracking-wider">Status Akun Anda</span>
                  <Badge variant="orange" className="bg-amber-100 text-amber-800 border-amber-300 text-[11px] font-bold">
                    🟡 Menunggu Persetujuan
                  </Badge>
                </div>

                <div className="space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-amber-100/80">
                    <span className="text-slate-500">Nama Lengkap:</span>
                    <span className="font-bold text-slate-800">{registeredData?.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100/80">
                    <span className="text-slate-500">Alamat Email:</span>
                    <span className="font-bold text-slate-800 font-mono">{registeredData?.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-amber-100/80">
                    <span className="text-slate-500">Nomor WhatsApp / HP:</span>
                    <span className="font-bold text-slate-800 font-mono">{registeredData?.phone}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500">Waktu Mendaftar:</span>
                    <span className="font-semibold text-slate-700">Baru saja</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <p>
                  Data pendaftaran Anda telah otomatis masuk ke menu <strong>Kelola Pengguna</strong> di Dashboard Admin. Administrator akan meninjau dan menyetujui akun Anda.
                </p>
              </div>

              {checkStatusMessage && (
                <div
                  className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                    checkStatusMessage.type === 'approved'
                      ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                      : checkStatusMessage.type === 'rejected'
                      ? 'bg-rose-50 border border-rose-200 text-rose-700'
                      : 'bg-amber-50 border border-amber-200 text-amber-800'
                  }`}
                >
                  {checkStatusMessage.type === 'approved' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : checkStatusMessage.type === 'rejected' ? (
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  ) : (
                    <Clock className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  )}
                  <span>{checkStatusMessage.text}</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <Button
                  onClick={checkApprovalStatus}
                  size="lg"
                  className="w-full shadow-brand gap-2"
                  isLoading={isCheckingStatus}
                >
                  <RefreshCw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} />
                  <span>Cek Status Persetujuan</span>
                </Button>

                <Link href="/login" className="block">
                  <Button variant="outline" size="lg" className="w-full border-slate-200 text-slate-700">
                    Masuk ke Halaman Login
                  </Button>
                </Link>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsPendingApproval(false);
                    setCheckStatusMessage(null);
                    setFullName('');
                    setEmail('');
                    setPhone('');
                    setPassword('');
                  }}
                  className="text-xs text-slate-400 hover:text-orange-600 font-medium transition-colors"
                >
                  ← Daftar dengan akun atau email lain
                </button>
              </div>
            </div>
          ) : (
            /* Formulir Pendaftaran */
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
                <Button type="submit" size="lg" className="w-full shadow-brand" isLoading={isLoading}>
                  <span>Daftar Akun TataDana</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <p className="text-center text-xs text-slate-500 font-medium">
                Sudah memiliki akun?{' '}
                <Link href="/login" className="text-orange-600 font-bold hover:underline">
                  Masuk di Sini
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
