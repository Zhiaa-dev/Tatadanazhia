import Link from 'next/link';
import { Send, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-3xl bg-orange-500 text-white flex items-center justify-center shadow-brand mb-6">
        <Send className="w-8 h-8 -rotate-12 translate-x-0.5" />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold mb-4">
        404 — Halaman Tidak Ditemukan
      </div>

      <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-3">
        Oops! Halaman Tidak Ada
      </h1>

      <p className="text-slate-500 max-w-md text-sm mb-8 leading-relaxed">
        Halaman yang Anda tuju mungkin sudah dipindahkan, dihapus, atau alamat URL yang dimasukkan kurang tepat.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3">
        <Link href="/dashboard">
          <Button variant="primary" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            <span>Ke Beranda Dashboard</span>
          </Button>
        </Link>
        <Link href="/">
          <Button variant="secondary" className="flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            <span>Halaman Depan</span>
          </Button>
        </Link>
      </div>
    </div>
  );
}
