'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { Send, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App Error Boundary caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-rose-500 text-white flex items-center justify-center shadow-lg mb-6">
        <Send className="w-8 h-8 -rotate-12 translate-x-0.5" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-700 text-xs font-bold mb-4">
        Terjadi Kendala Memuat Halaman
      </div>

      <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-3">
        Maaf, Terjadi Kesalahan Sesaat
      </h1>

      <p className="text-slate-500 max-w-md text-sm mb-8 leading-relaxed">
        Sistem mengalami kendala saat memproses halaman ini. Data Anda tetap aman. Silakan coba muat ulang atau kembali ke dashboard.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={() => reset()} variant="primary" className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4" />
          <span>Coba Muat Ulang</span>
        </Button>
        <Link href="/dashboard">
          <Button variant="secondary" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
