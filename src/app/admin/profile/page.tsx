'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Camera,
  Upload,
  Trash2,
  Check,
  ShieldCheck,
  Sparkles,
  Save,
  CheckCircle2,
  Key,
  Clock,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  ADMIN_EMAIL,
  ADMIN_USERNAME,
  getAdminProfile,
  saveAdminProfile,
  AdminProfile,
  DEFAULT_ADMIN_PROFILE,
} from '@/lib/admin-auth';

// Curated high-res executive avatars for Superadmin
const ADMIN_PRESET_AVATARS = [
  {
    id: 'zhia-1',
    name: 'Executive Dark',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    tag: 'Classic',
  },
  {
    id: 'zhia-2',
    name: 'Cyber Fintech',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
    tag: 'Modern',
  },
  {
    id: 'zhia-3',
    name: 'Professional Blue',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&auto=format&fit=crop&q=80',
    tag: 'Corporate',
  },
  {
    id: 'zhia-4',
    name: 'Minimalist Portrait',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    tag: 'Minimal',
  },
  {
    id: 'zhia-5',
    name: 'Tech Leader',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=300&auto=format&fit=crop&q=80',
    tag: 'Architect',
  },
];

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<AdminProfile>(DEFAULT_ADMIN_PROFILE);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = getAdminProfile();
    setProfile(loaded);
    setName(loaded.name);
    setPhone(loaded.phone);
    setRole(loaded.role);
    setBio(loaded.bio);
    setAvatarUrl(loaded.avatarUrl);
  }, []);

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Format file tidak didukung. Harap pilih gambar (JPG, PNG, atau WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Ukuran foto terlalu besar. Maksimal 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setAvatarUrl(base64);
    };
    reader.readAsDataURL(file);
  };

  // Reset to default photo
  const handleResetPhoto = () => {
    setAvatarUrl(DEFAULT_ADMIN_PROFILE.avatarUrl);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save changes
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const updated = saveAdminProfile({
      name: name.trim() || 'Zhia (Superadmin)',
      phone: phone.trim(),
      role: role.trim() || 'SUPERADMIN',
      bio: bio.trim(),
      avatarUrl: avatarUrl || DEFAULT_ADMIN_PROFILE.avatarUrl,
    });

    setProfile(updated);
    setIsSaving(false);
    setSuccessMsg('🟢 Profil Superadmin berhasil diperbarui dan langsung disinkronkan ke seluruh sistem!');

    setTimeout(() => {
      setSuccessMsg('');
    }, 4500);
  };

  return (
    <div className="space-y-8 max-w-4xl font-sans">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Badge className="bg-purple-950 text-purple-300 border-purple-800 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 mr-1 text-purple-400" />
            Otoritas Superadmin
          </Badge>
          <span className="text-xs text-slate-500">• ID Akun: #SA-001</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
          Edit Profil Superadmin
        </h1>
        <p className="text-xs md:text-sm text-slate-400">
          Kelola informasi identitas, foto profil, dan kontak khusus pengelola sistem TataDana.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs font-bold flex items-center gap-2.5 shadow-lg shadow-emerald-950/50 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Avatar Management */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Foto Profil Superadmin</h3>
              <p className="text-xs text-slate-400">
                Foto ini akan tampil pada header kontrol sistem, log aktivitas audit, dan sidebar admin.
              </p>
            </div>
            <span className="text-[11px] font-mono text-purple-400 font-bold bg-purple-950/60 px-2.5 py-1 rounded-lg border border-purple-800/80">
              Live Preview
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            <div className="relative group flex-shrink-0">
              <img
                src={avatarUrl || DEFAULT_ADMIN_PROFILE.avatarUrl}
                alt={name}
                className="w-28 h-28 rounded-3xl object-cover ring-4 ring-purple-600/40 shadow-xl shadow-purple-950/50"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/60 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs font-bold gap-1 cursor-pointer"
              >
                <Camera className="w-5 h-5 text-purple-400" />
                <span>Ganti Foto</span>
              </button>
            </div>

            <div className="space-y-3 flex-1 text-center sm:text-left">
              <div>
                <h4 className="text-sm font-bold text-white">{name || 'Nama Admin'}</h4>
                <p className="text-xs font-mono text-purple-400">{ADMIN_EMAIL}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{role || 'SUPERADMIN'}</p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handlePhotoUpload}
                  accept="image/png, image/jpeg, image/webp"
                  className="hidden"
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-purple-800 hover:border-purple-600 text-purple-300 hover:text-white bg-purple-950/40 text-xs"
                >
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  <span>Upload Foto Baru</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetPhoto}
                  className="border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-slate-800 text-xs"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  <span>Reset Default</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Preset Executive Avatars */}
          <div className="pt-4 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> Pilih Avatar Preset Eksekutif
              </span>
              <span className="text-[11px] text-slate-500">Klik untuk menerapkan seketika</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {ADMIN_PRESET_AVATARS.map((preset) => {
                const isSelected = avatarUrl === preset.url;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAvatarUrl(preset.url)}
                    className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 relative ${
                      isSelected
                        ? 'border-purple-500 bg-purple-950/60 shadow-lg shadow-purple-950/60 ring-2 ring-purple-500/40'
                        : 'border-slate-800 hover:border-purple-700 hover:bg-slate-800/50 bg-slate-950/50'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5 stroke-[3]" />
                      </div>
                    )}
                    <img
                      src={preset.url}
                      alt={preset.name}
                      className="w-12 h-12 rounded-xl object-cover shadow-sm"
                    />
                    <span className="text-[11px] font-bold text-slate-300 truncate w-full">
                      {preset.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Card 2: Admin Details Form */}
        <div className="p-6 md:p-8 rounded-3xl bg-slate-900 border border-slate-800 space-y-5">
          <div className="pb-4 border-b border-slate-800">
            <h3 className="font-bold text-white text-base">Informasi Akun & Akses</h3>
            <p className="text-xs text-slate-400">
              Data resmi akun Superadmin untuk otorisasi dan kontrol platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nama Lengkap Admin
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nama Lengkap Admin"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Email Superadmin (Identitas Kunci)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={ADMIN_EMAIL}
                  readOnly
                  className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-purple-300 font-mono select-all cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-800">
                  VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Email ini adalah satu-satunya email yang diizinkan masuk ke Dashboard Superadmin.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nama Pengguna (Username Kunci)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={ADMIN_USERNAME}
                  readOnly
                  className="w-full pl-10 pr-24 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-purple-300 font-mono select-all cursor-not-allowed"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-400 bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-800">
                  VERIFIED
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Username resmi untuk login: <strong className="text-purple-400 font-mono">@{ADMIN_USERNAME}</strong>
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nomor Telepon / WhatsApp
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+6281234567890"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white font-mono focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Peran / Jabatan
              </label>
              <div className="relative">
                <Briefcase className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="SUPERADMIN"
                  className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
              Bio / Catatan Eksekutif
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tulis deskripsi tanggung jawab Anda sebagai pengelola sistem..."
              className="w-full p-4 rounded-2xl bg-slate-950 border border-slate-800 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
            />
          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Sesi login terakhir: {new Date(profile.lastLogin || Date.now()).toLocaleDateString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</span>
            </div>

            <Button
              type="submit"
              size="md"
              disabled={isSaving}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-6 rounded-2xl shadow-lg shadow-purple-600/30 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Perubahan Profil</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
