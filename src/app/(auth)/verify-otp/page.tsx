'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';

function VerifyOtpContent() {
  const router = useRouter();

  useEffect(() => {
    // Verifikasi OTP telah dinonaktifkan, langsung redirect ke dashboard
    const timer = setTimeout(() => {
      router.replace('/dashboard');
    }, 500);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-premium border border-slate-200/80 text-center space-y-4">
      <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
        <CheckCircle2 className="w-8 h-8" />
      </div>

      <h2 className="text-xl font-black text-slate-900 tracking-tight">Akun Langsung Aktif</h2>
      <p className="text-xs text-slate-500">
        Verifikasi OTP tidak lagi diperlukan. Mengalihkan Anda langsung ke dashboard TataDana...
      </p>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50 font-sans">
      <Suspense fallback={<div className="text-sm font-bold text-slate-500">Memuat...</div>}>
        <VerifyOtpContent />
      </Suspense>
    </div>
  );
}
