'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Cpu, Plus, Key, ToggleLeft, ToggleRight, Trash2, Check, ShieldCheck } from 'lucide-react';
import { AIProviderConfig } from '@/lib/types';

export default function AdminAIProvidersPage() {
  const [mode, setMode] = useState<'single' | 'parallel_failover'>('parallel_failover');
  const [providers, setProviders] = useState<AIProviderConfig[]>([
    {
      id: 'p1',
      provider: 'gemini',
      model_name: 'gemini-1.5-flash',
      api_key_encrypted: 'AIzaSyD-•••••••••••••••••••••••••••••',
      priority: 1,
      is_active: true,
      mode: 'parallel_failover',
      created_at: '',
      updated_at: '',
    },
    {
      id: 'p2',
      provider: 'openai',
      model_name: 'gpt-4o-mini',
      api_key_encrypted: 'sk-proj-•••••••••••••••••••••••••••••',
      priority: 2,
      is_active: true,
      mode: 'parallel_failover',
      created_at: '',
      updated_at: '',
    },
    {
      id: 'p3',
      provider: 'deepseek',
      model_name: 'deepseek-chat',
      api_key_encrypted: 'sk-dsk-••••••••••••••••••••••••••••••',
      priority: 3,
      is_active: true,
      mode: 'parallel_failover',
      created_at: '',
      updated_at: '',
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newProvider, setNewProvider] = useState<'gemini' | 'openai' | 'deepseek' | 'custom'>('gemini');
  const [newModel, setNewModel] = useState('gemini-1.5-pro');
  const [newApiKey, setNewApiKey] = useState('');

  const handleToggleActive = (id: string) => {
    setProviders((prev) =>
      prev.map((p) => (p.id === id ? { ...p, is_active: !p.is_active } : p))
    );
  };

  const handleAddProvider = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApiKey) return;

    setProviders((prev) => [
      ...prev,
      {
        id: 'p_' + Date.now(),
        provider: newProvider,
        model_name: newModel,
        api_key_encrypted: newApiKey.slice(0, 6) + '••••••••••••••••',
        priority: prev.length + 1,
        is_active: true,
        mode,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    setIsModalOpen(false);
    setNewApiKey('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Manajemen Multi-Provider AI</h2>
          <p className="text-sm text-slate-400">
            Kelola API key terenkripsi dan konfigurasi mode failover otomatis (Gemini → GPT → DeepSeek).
          </p>
        </div>

        <Button onClick={() => setIsModalOpen(true)} className="bg-orange-500 hover:bg-orange-600 text-white gap-2">
          <Plus className="w-4 h-4" />
          <span>Tambah Provider AI</span>
        </Button>
      </div>

      {/* Mode Switcher Banner (Part 2 & Part 10 requirement) */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-orange-400 uppercase tracking-wider block">Mode Eksekusi AI</span>
          <h4 className="font-bold text-white text-base mt-0.5">
            {mode === 'parallel_failover' ? 'Paralel Failover (Rekomendasi)' : 'Mode Tunggal (Single Provider)'}
          </h4>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            {mode === 'parallel_failover'
              ? 'Jika provider utama gagal/rate limited, request otomatis dialihkan ke provider cadangan tanpa kegagalan di sisi pengguna.'
              : 'Semua request hanya diproses oleh provider prioritas 1. Jika down, transaksi gagal.'}
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto">
          <button
            onClick={() => setMode('parallel_failover')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'parallel_failover' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Paralel Failover
          </button>
          <button
            onClick={() => setMode('single')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              mode === 'single' ? 'bg-orange-500 text-white shadow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Mode Tunggal
          </button>
        </div>
      </div>

      {/* Provider List */}
      <div className="space-y-4">
        {providers.map((p, idx) => (
          <div
            key={p.id}
            className={`p-5 rounded-2xl bg-slate-900 border transition-all ${
              p.is_active ? 'border-slate-800' : 'border-slate-800/40 opacity-50'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 text-orange-400 font-black flex items-center justify-center text-sm">
                  #{idx + 1}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-white text-base capitalize">{p.provider}</h4>
                    <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded-md">
                      {p.model_name}
                    </span>
                    {idx === 0 && (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                        Primary
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono text-slate-500 mt-1">
                    <Key className="w-3.5 h-3.5" />
                    <span>{p.api_key_encrypted}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggleActive(p.id)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-colors ${
                    p.is_active
                      ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800'
                      : 'bg-slate-800 text-slate-500 border-slate-700'
                  }`}
                >
                  {p.is_active ? 'Aktif' : 'Non-aktif'}
                </button>

                <button
                  onClick={() => setProviders((prev) => prev.filter((item) => item.id !== p.id))}
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Provider Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tambah AI Provider Baru"
        description="Masukkan API key resmi dari provider untuk dimasukkan ke failover chain."
      >
        <form onSubmit={handleAddProvider} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Provider</label>
            <select
              value={newProvider}
              onChange={(e) => setNewProvider(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm bg-white"
            >
              <option value="gemini">Google Gemini</option>
              <option value="openai">OpenAI</option>
              <option value="deepseek">DeepSeek</option>
              <option value="custom">Custom Endpoint</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Model</label>
            <input
              type="text"
              value={newModel}
              onChange={(e) => setNewModel(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">API Key (Terenkripsi di DB)</label>
            <input
              type="password"
              placeholder="Paste API Key di sini..."
              value={newApiKey}
              onChange={(e) => setNewApiKey(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm font-mono"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit">Simpan & Aktifkan</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
