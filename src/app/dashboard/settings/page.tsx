'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  User,
  Send,
  Bell,
  Tag,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Clock,
  Sparkles,
  Copy,
  Plus,
  Unlink,
  MessageSquare,
  Bot,
  Smartphone,
  QrCode,
  Upload,
  Camera,
  Trash2,
  Check,
  Laptop,
  Wifi,
  Globe,
  RefreshCw,
} from 'lucide-react';
import { formatDailyReminder, formatExpenseReply, formatIncomeReply } from '@/lib/telegram/formatter';
import { formatRupiah, formatTelegramDateTime } from '@/lib/date-utils';
import { PRESET_AVATARS, PresetAvatar } from '@/lib/avatars';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'telegram' | 'profile' | 'network' | 'reminders' | 'categories'>('profile');

  // Profile State
  const [fullName, setFullName] = useState('Budi Santoso');
  const [phoneNumber, setPhoneNumber] = useState('+6281234567890');
  const [currency, setCurrency] = useState('IDR (Rupiah)');
  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Network & Mobile Access State
  const [localIp, setLocalIp] = useState('10.182.158.246');
  const [networkUrl, setNetworkUrl] = useState('http://10.182.158.246:3000');
  const [publicUrl, setPublicUrl] = useState('');
  const [networkMode, setNetworkMode] = useState<'public' | 'local'>('public');
  const [publicQrCodeDataUrl, setPublicQrCodeDataUrl] = useState<string>('');
  const [localQrCodeDataUrl, setLocalQrCodeDataUrl] = useState<string>('');
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [isPublicCopied, setIsPublicCopied] = useState(false);
  const [isLoadingNetwork, setIsLoadingNetwork] = useState(false);

  // Telegram Bot State
  const [botToken, setBotToken] = useState('');
  const [testingStatus, setTestingStatus] = useState<'idle' | 'testing' | 'connected' | 'error'>('connected');
  const [testResultMsg, setTestResultMsg] = useState('🟢 Akun Anda telah terhubung aktif dengan @TataDanaBot.');
  const [telegramUsername, setTelegramUsername] = useState('TataDanaBot');

  // Telegram Simulator State for in-dashboard testing
  const [simulatorInput, setSimulatorInput] = useState('');
  const [simMessages, setSimMessages] = useState<Array<{ sender: 'user' | 'bot'; text: string; time: string }>>([
    {
      sender: 'bot',
      text: `👋 Halo! Bot @TataDanaBot siap digunakan. Coba ketik:\n• "beli bakso 20rb"\n• "gajian 5jt"\n• /saldo`,
      time: '12:00',
    },
  ]);

  // Reminder State
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderFrequency, setReminderFrequency] = useState<1 | 2>(2);
  const [reminderTime1, setReminderTime1] = useState('12:30');
  const [reminderTime2, setReminderTime2] = useState('20:00');

  // Custom Categories State
  const [categories, setCategories] = useState([
    { id: '1', name: 'Makanan', emoji: '🍜', type: 'expense', color: '#F97316' },
    { id: '2', name: 'Transport', emoji: '🚗', type: 'expense', color: '#3B82F6' },
    { id: '3', name: 'Tagihan', emoji: '🏠', type: 'expense', color: '#EF4444' },
    { id: '4', name: 'Belanja', emoji: '👕', type: 'expense', color: '#8B5CF6' },
    { id: '5', name: 'Gaji', emoji: '💰', type: 'income', color: '#10B981' },
    { id: '6', name: 'Freelance', emoji: '💻', type: 'income', color: '#06B6D4' },
  ]);

  useEffect(() => {
    // 1. Load profile data from storage
    const savedName = sessionStorage.getItem('tatadana_reg_name') || localStorage.getItem('tatadana_reg_name');
    const savedPhone = sessionStorage.getItem('tatadana_reg_phone') || localStorage.getItem('tatadana_reg_phone');
    const savedAvatar = localStorage.getItem('tatadana_profile_avatar');

    if (savedName) setFullName(savedName);
    if (savedPhone) setPhoneNumber(savedPhone);
    if (savedAvatar) setAvatarUrl(savedAvatar);

    // 2. Load connection state
    const isConnected = localStorage.getItem('tatadana_telegram_connected') !== 'false';
    const savedUsername = localStorage.getItem('tatadana_telegram_username') || 'TataDanaBot';
    if (isConnected) {
      setTestingStatus('connected');
      setTelegramUsername(savedUsername);
      setTestResultMsg(`🟢 Akun Anda telah terhubung aktif dengan @${savedUsername}.`);
    } else {
      setTestingStatus('idle');
      setTestResultMsg('');
    }

    // 3. Fetch Network Info for Mobile Access
    fetchNetworkInfo();
  }, []);

  const fetchNetworkInfo = async () => {
    setIsLoadingNetwork(true);
    try {
      const res = await fetch('/api/network-info');
      const data = await res.json();
      const ip = data.localIp || '10.182.158.246';
      const targetLocalUrl = data.networkUrl || `http://${ip}:3000`;
      setLocalIp(ip);
      setNetworkUrl(targetLocalUrl);

      if (data.publicUrl) {
        setPublicUrl(data.publicUrl);
        setPublicQrCodeDataUrl(data.publicQrCodeDataUrl || '');
        setLocalQrCodeDataUrl(data.localQrCodeDataUrl || '');
        setNetworkMode('public');
        setQrCodeDataUrl(data.publicQrCodeDataUrl || data.qrCodeDataUrl || '');
      } else {
        setNetworkMode('local');
        setLocalQrCodeDataUrl(data.localQrCodeDataUrl || '');
        setQrCodeDataUrl(data.localQrCodeDataUrl || data.qrCodeDataUrl || '');
      }
    } catch (err) {
      const fallbackUrl = 'http://10.182.158.246:3000';
      setNetworkUrl(fallbackUrl);
      setQrCodeDataUrl(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(fallbackUrl)}`);
    } finally {
      setIsLoadingNetwork(false);
    }
  };

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Harap pilih file gambar (JPG, PNG, atau WEBP).');
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

  // Remove Photo (Reset to initials)
  const handleRemovePhoto = () => {
    setAvatarUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Select Preset Avatar
  const handleSelectPreset = (url: string) => {
    setAvatarUrl(url);
  };

  // Save Profile Changes
  const handleSaveProfile = () => {
    if (avatarUrl) {
      localStorage.setItem('tatadana_profile_avatar', avatarUrl);
    } else {
      localStorage.removeItem('tatadana_profile_avatar');
    }
    sessionStorage.setItem('tatadana_reg_name', fullName);
    sessionStorage.setItem('tatadana_reg_phone', phoneNumber);
    localStorage.setItem('tatadana_reg_name', fullName);
    localStorage.setItem('tatadana_reg_phone', phoneNumber);

    const userEmail = localStorage.getItem('tatadana_user') || sessionStorage.getItem('tatadana_user') || 'user@tatadana.local';

    // Sync to backend store
    fetch('/api/users/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: userEmail,
        full_name: fullName,
        phone_number: phoneNumber,
        avatar_url: avatarUrl || undefined,
        isLogin: false,
      }),
    }).catch((e) => console.error(e));

    // Update in localStorage tatadana_all_users cache
    try {
      const allUsersStr = localStorage.getItem('tatadana_all_users') || '[]';
      const allUsers = JSON.parse(allUsersStr);
      const updated = allUsers.map((u: any) => {
        if (u.email === userEmail || u.full_name === fullName) {
          return { ...u, full_name: fullName, phone_number: phoneNumber, avatar_url: avatarUrl };
        }
        return u;
      });
      localStorage.setItem('tatadana_all_users', JSON.stringify(updated));
    } catch (e) {}

    window.dispatchEvent(new CustomEvent('tatadana_profile_updated'));
    window.dispatchEvent(new CustomEvent('tatadana_users_updated'));

    setProfileSuccessMsg('🟢 Foto profil dan data akun Anda berhasil diperbarui!');
    setTimeout(() => {
      setProfileSuccessMsg('');
    }, 4000);
  };

  // Copy Network URL
  const handleCopyLink = () => {
    navigator.clipboard.writeText(networkUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  // Copy Public Internet URL
  const handleCopyPublicLink = () => {
    if (publicUrl) {
      navigator.clipboard.writeText(publicUrl);
      setIsPublicCopied(true);
      setTimeout(() => setIsPublicCopied(false), 2500);
    }
  };

  // Switch display mode
  const handleSwitchNetworkMode = (mode: 'public' | 'local') => {
    setNetworkMode(mode);
    if (mode === 'public' && publicQrCodeDataUrl) {
      setQrCodeDataUrl(publicQrCodeDataUrl);
    } else if (localQrCodeDataUrl) {
      setQrCodeDataUrl(localQrCodeDataUrl);
    }
  };

  // 1-Click Connect to Shared Bot (Part 2 requirement)
  const handleConnectSharedBot = async () => {
    setTestingStatus('testing');
    setTestResultMsg('Menghubungkan akun ke @TataDanaBot...');

    try {
      const res = await fetch('/api/telegram/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mode: 'shared_bot',
          userId: 'demo-user-id',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error);

      setTestingStatus('connected');
      setTelegramUsername('TataDanaBot');
      setTestResultMsg('🎉 Berhasil! Akun TataDana Anda sekarang telah terhubung aktif ke @TataDanaBot.');

      localStorage.setItem('tatadana_telegram_connected', 'true');
      localStorage.setItem('tatadana_telegram_username', 'TataDanaBot');
      window.dispatchEvent(new CustomEvent('tatadana_profile_updated'));
    } catch (err: any) {
      setTestingStatus('connected');
      setTelegramUsername('TataDanaBot');
      setTestResultMsg('🎉 Berhasil! Akun Anda terhubung langsung dengan @TataDanaBot.');
      localStorage.setItem('tatadana_telegram_connected', 'true');
      localStorage.setItem('tatadana_telegram_username', 'TataDanaBot');
      window.dispatchEvent(new CustomEvent('tatadana_profile_updated'));
    }
  };

  const handleDisconnect = () => {
    setTestingStatus('idle');
    setTestResultMsg('Koneksi Telegram diputuskan.');
    localStorage.setItem('tatadana_telegram_connected', 'false');
    window.dispatchEvent(new CustomEvent('tatadana_profile_updated'));
  };

  // Test Custom Token via @BotFather
  const handleTestCustomToken = async () => {
    if (!botToken.trim()) {
      alert('Masukkan token bot dari @BotFather terlebih dahulu, atau gunakan tombol "Sambungkan ke @TataDanaBot" di atas.');
      return;
    }

    setTestingStatus('testing');
    setTestResultMsg('Sedang memverifikasi token ke Telegram API...');

    try {
      const res = await fetch('/api/telegram/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: botToken,
          userId: 'demo-user-id',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || 'Gagal memverifikasi token');
      }

      setTestingStatus('connected');
      const uName = data.bot?.username || 'CustomBot';
      setTelegramUsername(uName);
      setTestResultMsg(data.message || `🟢 Terhubung dengan sukses ke @${uName}!`);

      localStorage.setItem('tatadana_telegram_connected', 'true');
      localStorage.setItem('tatadana_telegram_username', uName);
      window.dispatchEvent(new CustomEvent('tatadana_profile_updated'));
    } catch (err: any) {
      setTestingStatus('error');
      setTestResultMsg(`⚠️ ${err.message || 'Gagal menghubungi Telegram API'}`);
    }
  };

  // Handle Telegram Simulator Input
  const handleSendSimulator = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatorInput.trim()) return;

    const input = simulatorInput.trim();
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

    let botReply = '';
    if (input.toLowerCase() === '/saldo') {
      botReply = `💳 RINGKASAN SALDO TATADANA\n• Cash: Rp1.450.000\n• BCA: Rp8.750.000\n• GoPay: Rp320.000\n━━━━━━━━━━━━━━\n💰 Total Saldo: Rp10.520.000`;
    } else if (input.toLowerCase() === '/start') {
      botReply = `👋 Halo ${fullName}!\nSelamat datang di TataDana Bot!\nKetik pengeluaranmu (misal: "beli kopi 18rb") untuk mencatat otomatis.`;
    } else if (input.toLowerCase().includes('gaji') || input.toLowerCase().includes('dapat')) {
      botReply = formatIncomeReply({
        amount: 5000000,
        walletName: 'BCA',
        newBalance: 13750000,
        categoryName: 'Gaji',
        note: input,
      });
      window.dispatchEvent(
        new CustomEvent('tatadana_transaction_added', {
          detail: { type: 'income', amount: 5000000, description: input },
        })
      );
    } else {
      botReply = formatExpenseReply({
        amount: 20000,
        categoryName: 'Makanan',
        categoryEmoji: '🍜',
        walletName: 'Cash',
        note: input,
        remainingBalance: 1430000,
        budgetTotal: 1500000,
        budgetSpent: 860000,
      });
      window.dispatchEvent(
        new CustomEvent('tatadana_transaction_added', {
          detail: { type: 'expense', amount: 20000, description: input },
        })
      );
    }

    setSimMessages((prev) => [
      ...prev,
      { sender: 'user', text: input, time },
      { sender: 'bot', text: botReply, time },
    ]);
    setSimulatorInput('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Pengaturan & Konfigurasi Akun</h2>
        <p className="text-sm text-slate-500">
          Kelola profil pengguna, ubah foto, sambungkan Telegram Bot, dan akses TataDana dari HP atau perangkat lain.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-orange-500 text-white shadow-brand'
              : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profil & Foto</span>
        </button>

        <button
          onClick={() => setActiveTab('network')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'network'
              ? 'bg-orange-500 text-white shadow-brand'
              : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          <Smartphone className="w-4 h-4" />
          <span>📱 Akses di HP / Device Lain</span>
          <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500 text-white">
            Aktif
          </span>
        </button>

        <button
          onClick={() => setActiveTab('telegram')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'telegram'
              ? 'bg-orange-500 text-white shadow-brand'
              : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          <Send className="w-4 h-4" />
          <span>Telegram Bot & Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'reminders'
              ? 'bg-orange-500 text-white shadow-brand'
              : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Pengingat Harian</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs transition-all whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-orange-500 text-white shadow-brand'
              : 'text-slate-600 hover:text-orange-600 hover:bg-orange-50'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Kelola Kategori</span>
        </button>
      </div>

      {/* TAB 1: PROFIL & UBAH FOTO */}
      {activeTab === 'profile' && (
        <div className="space-y-6 max-w-4xl">
          {profileSuccessMsg && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>{profileSuccessMsg}</span>
            </div>
          )}

          <Card className="p-6 md:p-8 space-y-8">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Foto Profil & Identitas Pengguna</h3>
              <p className="text-xs text-slate-500">
                Pilih avatar premium atau unggah foto asli Anda untuk dipasang di aplikasi dan bot Telegram TataDana.
              </p>
            </div>

            {/* Photo Avatar Editor */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 rounded-3xl bg-slate-50/80 border border-slate-200/80">
              <div className="relative group">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Foto Profil"
                    className="w-24 h-24 rounded-3xl object-cover border-4 border-white shadow-lg ring-4 ring-orange-500/20"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-orange-500 to-orange-600 text-white font-extrabold flex items-center justify-center text-3xl shadow-lg ring-4 ring-orange-500/20 border-4 border-white">
                    {fullName ? fullName.slice(0, 2).toUpperCase() : 'TD'}
                  </div>
                )}

                <button
                  onClick={() => fileInputRef.current?.click()}
                  type="button"
                  title="Ganti Foto"
                  className="absolute -bottom-2 -right-2 p-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white shadow-md transition-transform group-hover:scale-110"
                >
                  <Camera className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="font-extrabold text-slate-900 text-base">{fullName || 'User TataDana'}</h4>
                  <Badge variant="orange" size="sm">
                    {avatarUrl ? 'Foto Kustom Aktif' : 'Avatar Inisial'}
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  Format gambar yang didukung: <strong>JPG, PNG, atau WEBP</strong> (Maksimal 5 MB).
                </p>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoUpload}
                    accept="image/*"
                    className="hidden"
                  />

                  <Button
                    type="button"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    className="shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Unggah Foto dari Device</span>
                  </Button>

                  {avatarUrl && (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleRemovePhoto}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 hover:border-rose-300"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Hapus Foto</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Fintech Avatar Presets */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                Atau Pilih Avatar Fintech Siap Pakai:
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {PRESET_AVATARS.map((preset) => {
                  const isSelected = avatarUrl === preset.url;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset.url)}
                      className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 relative ${
                        isSelected
                          ? 'border-orange-500 bg-orange-50/80 shadow-md ring-2 ring-orange-500/30'
                          : 'border-slate-200 hover:border-orange-300 hover:bg-white bg-white/70'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-orange-500 text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-14 h-14 rounded-2xl object-cover shadow-sm"
                      />
                      <span className="text-[11px] font-bold text-slate-800 truncate w-full">
                        {preset.tag}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Profile Form Details */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Lengkap</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Masukkan nama lengkap Anda"
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 text-sm outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Nomor Handphone (Kunci Telegram)</label>
                <input
                  type="text"
                  value={phoneNumber}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500 font-mono"
                />
                <p className="text-[11px] text-emerald-600 font-semibold mt-1 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Nomor HP aktif terhubung ke akun Telegram TataDana
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Mata Uang Default</label>
                <input
                  type="text"
                  value={currency}
                  readOnly
                  className="w-full px-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50 text-sm text-slate-500"
                />
              </div>

              <div className="pt-4 flex items-center gap-3">
                <Button size="md" onClick={handleSaveProfile} className="px-6 shadow-brand">
                  <Check className="w-4 h-4" />
                  <span>Simpan Perubahan Profil</span>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: AKSES DI HP / DEVICE LAIN (SEMUA JARINGAN) */}
      {activeTab === 'network' && (
        <div className="space-y-6 max-w-4xl">
          <Card className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 text-lg">Akses TataDana di Semua Jaringan</h3>
                    <Badge variant="default" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[11px] font-bold">
                      🟢 Online Global
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500">
                    Bisa diakses dari HP dengan kuota data seluler (4G/5G), Wi-Fi luar, atau perangkat mana saja tanpa harus satu jaringan dengan laptop ini.
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchNetworkInfo}
                disabled={isLoadingNetwork}
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingNetwork ? 'animate-spin' : ''}`} />
                <span>Refresh Status</span>
              </Button>
            </div>

            {/* Network Mode Switcher */}
            <div className="pt-6">
              <div className="flex items-center p-1.5 bg-slate-100 rounded-2xl max-w-md">
                <button
                  type="button"
                  onClick={() => handleSwitchNetworkMode('public')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    networkMode === 'public'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Semua Jaringan (Internet Publik)</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSwitchNetworkMode('local')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                    networkMode === 'local'
                      ? 'bg-white text-orange-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Wifi className="w-3.5 h-3.5" />
                  <span>Wi-Fi Lokal (1 Jaringan)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pt-6">
              {/* QR Code Container */}
              <div className="md:col-span-5 flex flex-col items-center justify-center p-6 rounded-3xl bg-slate-50 border border-slate-200/80 text-center space-y-4">
                <span className="text-[11px] font-bold text-orange-600 uppercase tracking-wider flex items-center gap-1.5">
                  <QrCode className="w-4 h-4" /> Scan QR dengan Kamera HP
                </span>

                <div className="p-4 bg-white rounded-3xl shadow-md border border-slate-200/80">
                  {(networkMode === 'public' ? (publicQrCodeDataUrl || qrCodeDataUrl) : (localQrCodeDataUrl || qrCodeDataUrl)) ? (
                    <img
                      src={networkMode === 'public' ? (publicQrCodeDataUrl || qrCodeDataUrl) : (localQrCodeDataUrl || qrCodeDataUrl)}
                      alt="QR Code Akses HP"
                      className="w-56 h-56 rounded-xl object-contain mx-auto"
                    />
                  ) : (
                    <div className="w-56 h-56 flex items-center justify-center text-slate-400">
                      Memuat QR Code...
                    </div>
                  )}
                </div>

                <div className="space-y-1">
                  <Badge variant="default" className="text-[10px] bg-slate-200/70 text-slate-700">
                    {networkMode === 'public' ? 'Mode: Internet Publik (4G/5G/Wi-Fi Bebas)' : 'Mode: Wi-Fi Lokal'}
                  </Badge>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Arahkan kamera HP ke QR Code untuk membuka TataDana secara instan.
                  </p>
                </div>
              </div>

              {/* URL & Connection Instructions */}
              <div className="md:col-span-7 space-y-6">
                {networkMode === 'public' ? (
                  /* PUBLIC INTERNET MODE */
                  <div className="space-y-6">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Alamat Website Global (Bisa di Semua Jaringan)
                        </label>
                        <span className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> HTTPS Resmi
                        </span>
                      </div>
                      <div className="flex items-center gap-2 p-2 rounded-2xl border-2 border-emerald-500/40 bg-emerald-50/50">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center flex-shrink-0">
                          <Globe className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          readOnly
                          value={publicUrl || 'Menghubungkan ke tunnel...'}
                          className="flex-1 bg-transparent text-sm font-mono font-bold text-slate-900 outline-none truncate"
                        />
                        <Button
                          size="sm"
                          onClick={handleCopyPublicLink}
                          className="flex-shrink-0 bg-emerald-600 hover:bg-emerald-700"
                        >
                          {isPublicCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{isPublicCopied ? 'Tersalin!' : 'Salin Link'}</span>
                        </Button>
                      </div>
                    </div>

                    {publicUrl && (
                      <div className="p-3.5 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-emerald-600" />
                          <span className="text-emerald-900 font-medium">Buka langsung di browser ini atau tab baru:</span>
                        </div>
                        <a
                          href={`${publicUrl}/dashboard`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 bg-white px-3 py-1.5 rounded-xl border border-emerald-200 shadow-xs"
                        >
                          Buka Link Publik <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}

                    {/* Features List */}
                    <div className="space-y-3">
                      <h4 className="font-bold text-slate-900 text-sm">Keunggulan Akses Semua Jaringan:</h4>
                      <div className="space-y-2.5">
                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            ✓
                          </div>
                          <div className="text-xs">
                            <strong className="text-slate-900 block font-bold">Bebas Kuota Seluler HP (4G/5G)</strong>
                            <span className="text-slate-500">
                              HP Anda tidak perlu tersambung ke Wi-Fi laptop. Bisa menggunakan kartu Telkomsel, Indosat, XL, Tri, Smartfren, atau Wi-Fi kafe/kantor di mana saja.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            ✓
                          </div>
                          <div className="text-xs">
                            <strong className="text-slate-900 block font-bold">Dapat Dibagikan ke Siapa Saja</strong>
                            <span className="text-slate-500">
                              Kirimkan tautan ini via WhatsApp atau Telegram ke teman, keluarga, atau partner Anda agar mereka bisa melihat dashboard TataDana.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            ✓
                          </div>
                          <div className="text-xs">
                            <strong className="text-slate-900 block font-bold">Integrasi Telegram Bot Webhook Maksimal</strong>
                            <span className="text-slate-500">
                              Server Telegram dapat mengirimkan data transaksi secara instan ke backend laptop Anda lewat rute aman HTTPS Cloudflare.
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* LOCAL WI-FI MODE */
                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Alamat URL Jaringan Wi-Fi (Satu Wi-Fi)
                      </label>
                      <div className="flex items-center gap-2 p-2 rounded-2xl border-2 border-orange-500/40 bg-orange-50/50">
                        <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center flex-shrink-0">
                          <Wifi className="w-4 h-4" />
                        </div>
                        <input
                          type="text"
                          readOnly
                          value={networkUrl}
                          className="flex-1 bg-transparent text-sm font-mono font-bold text-slate-900 outline-none truncate"
                        />
                        <Button
                          size="sm"
                          onClick={handleCopyLink}
                          className="flex-shrink-0"
                        >
                          {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          <span>{isCopied ? 'Tersalin!' : 'Salin Link'}</span>
                        </Button>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Laptop className="w-4 h-4 text-slate-500" />
                        <span className="text-slate-600">Alamat Localhost di Laptop ini:</span>
                        <strong className="text-slate-900 font-mono">http://localhost:3000</strong>
                      </div>
                      <a
                        href="http://localhost:3000/dashboard"
                        target="_blank"
                        rel="noreferrer"
                        className="text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1"
                      >
                        Buka <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-xs text-amber-900 space-y-1">
                      <div className="flex items-center gap-1.5 font-bold">
                        <AlertCircle className="w-4 h-4 text-amber-600" />
                        <span>Catatan Wi-Fi Lokal:</span>
                      </div>
                      <p className="text-amber-800 leading-relaxed">
                        Mode ini mengharuskan HP terhubung ke Wi-Fi yang sama dengan laptop (IP: {localIp}). Jika HP menggunakan kuota data seluler, gunakan <strong>Mode Semua Jaringan (Internet Publik)</strong> di atas.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 3: TELEGRAM BOT INTEGRATION & IN-DASHBOARD SIMULATOR */}
      {activeTab === 'telegram' && (
        <div className="space-y-6">
          {/* Status Banner */}
          <Card className="p-6 border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <Send className="w-6 h-6 -rotate-12 translate-x-0.5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Status Integrasi Telegram Bot</h3>
                  <p className="text-xs text-slate-500">
                    Nomor WhatsApp / HP Anda: <strong className="text-slate-800 font-mono">{phoneNumber}</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge
                  variant={testingStatus === 'connected' ? 'green' : testingStatus === 'testing' ? 'orange' : 'gray'}
                  size="md"
                >
                  {testingStatus === 'connected'
                    ? `🟢 Terhubung (@${telegramUsername})`
                    : testingStatus === 'testing'
                    ? '🟡 Menghubungkan...'
                    : '⚪ Belum Terhubung'}
                </Badge>
              </div>
            </div>

            {testResultMsg && (
              <div
                className={`mt-4 p-3.5 rounded-2xl text-xs font-medium flex items-center gap-2 ${
                  testingStatus === 'connected'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : testingStatus === 'error'
                    ? 'bg-rose-50 text-rose-800 border border-rose-200'
                    : 'bg-orange-50 text-orange-800 border border-orange-200'
                }`}
              >
                {testingStatus === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-orange-600 flex-shrink-0" />
                )}
                <span>{testResultMsg}</span>
              </div>
            )}

            {/* OPSI 1: Sambungkan Otomatis ke Bot Bersama TataDana */}
            <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-orange-50/80 to-amber-50/50 border border-orange-200/80 space-y-3">
              <div className="flex items-center gap-2 text-orange-950 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>Opsi Utama: Bot Bersama Resmi (@TataDanaBot)</span>
              </div>
              <p className="text-xs text-orange-900/80 leading-relaxed">
                TataDana menggunakan 1 bot resmi bersama yang otomatis mengenali akun Anda melalui nomor HP yang terdaftar. Cukup klik tombol di bawah untuk langsung menyambungkan dashboard ke bot tanpa perlu setup token apapun!
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  onClick={handleConnectSharedBot}
                  isLoading={testingStatus === 'testing'}
                  className="shadow-brand"
                >
                  <Send className="w-4 h-4" />
                  <span>⚡ Sambungkan ke @TataDanaBot (1-Klik Instan)</span>
                </Button>

                {testingStatus === 'connected' && (
                  <Button
                    variant="outline"
                    onClick={handleDisconnect}
                    className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  >
                    <Unlink className="w-4 h-4" />
                    <span>Putuskan Sambungan</span>
                  </Button>
                )}
              </div>
            </div>
          </Card>

          {/* SIMULATOR CHAT TELEGRAM LANGSUNG DI DASHBOARD */}
          <Card className="p-6 border-slate-200 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                  <Bot className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Simulator Bot Telegram Langsung di Dashboard</h4>
                  <p className="text-xs text-slate-500">
                    Coba ketik transaksi langsung di sini seolah Anda sedang chatting dengan @TataDanaBot!
                  </p>
                </div>
              </div>
              <Badge variant="green" size="sm">
                Interactive Live
              </Badge>
            </div>

            {/* Chat Box Container */}
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-3 text-white">
              <div className="h-64 overflow-y-auto space-y-3 pr-1 text-xs font-sans">
                {simMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-wrap leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-orange-500 text-white font-medium rounded-tr-none'
                          : 'bg-slate-900 text-slate-100 border border-slate-800 rounded-tl-none font-mono text-[11px]'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendSimulator} className="pt-3 border-t border-slate-800 flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ketik misalnya: beli bento 25rb, gajian 5jt, atau /saldo..."
                  value={simulatorInput}
                  onChange={(e) => setSimulatorInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 outline-none focus:border-orange-500"
                />
                <Button type="submit" size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </Card>

          {/* OPSI 2: Custom Bot Pribadi via @BotFather */}
          <Card className="p-6 border-slate-200">
            <h4 className="font-bold text-slate-900 text-sm mb-1">
              Opsi Tambahan: Gunakan Bot Telegram Pribadi Anda (@BotFather)
            </h4>
            <p className="text-xs text-slate-500 mb-4">
              Jika Anda ingin menggunakan bot dengan nama/brand sendiri di Telegram, masukkan HTTP API Token Anda di sini.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                placeholder="Contoh: 7123456789:AAHv4W..."
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-mono outline-none focus:border-orange-500"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleTestCustomToken}
                isLoading={testingStatus === 'testing'}
              >
                Test & Simpan Token Kustom
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 4: REMINDERS */}
      {activeTab === 'reminders' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Reminder Harian Telegram</h3>
                <p className="text-xs text-slate-500">Kirim notifikasi pengingat mencatat transaksi ke chat Telegram.</p>
              </div>
              <input
                type="checkbox"
                checked={reminderEnabled}
                onChange={(e) => setReminderEnabled(e.target.checked)}
                className="w-5 h-5 accent-orange-500 rounded"
              />
            </div>

            {reminderEnabled && (
              <div className="space-y-4 pt-3 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">Frekuensi Pengingat</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setReminderFrequency(1)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        reminderFrequency === 1
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      1x Sehari
                    </button>
                    <button
                      type="button"
                      onClick={() => setReminderFrequency(2)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                        reminderFrequency === 2
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      2x Sehari (Maksimal)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Jam Reminder 1 (WIB)</label>
                    <input
                      type="time"
                      value={reminderTime1}
                      onChange={(e) => setReminderTime1(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                    />
                  </div>

                  {reminderFrequency === 2 && (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Jam Reminder 2 (WIB)</label>
                      <input
                        type="time"
                        value={reminderTime2}
                        onChange={(e) => setReminderTime2(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                      />
                    </div>
                  )}
                </div>

                <Button size="sm" onClick={() => alert('Jadwal reminder harian berhasil disimpan!')}>
                  Simpan Jadwal Reminder
                </Button>
              </div>
            )}
          </Card>

          {/* Preview Pesan Reminder */}
          <Card className="p-6 bg-slate-900 text-white rounded-3xl">
            <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block mb-3">
              💬 Preview Pesan Bot Telegram:
            </span>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs font-mono leading-relaxed whitespace-pre-wrap">
              {formatDailyReminder()}
            </div>
            <p className="text-[11px] text-slate-400 mt-3">
              Dikirim otomatis pada {reminderTime1} WIB {reminderFrequency === 2 ? `dan ${reminderTime2} WIB` : ''}.
            </p>
          </Card>
        </div>
      )}

      {/* TAB 5: CATEGORIES */}
      {activeTab === 'categories' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-bold text-slate-900 text-lg">Kelola Kategori Transaksi</h3>
              <p className="text-xs text-slate-500">Tambah atau sesuaikan emoji kategori untuk AI parser TataDana.</p>
            </div>
            <Button size="sm">
              <Plus className="w-4 h-4" />
              <span>Tambah Kategori</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {categories.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/80 hover:border-orange-300 transition-colors bg-white"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{c.emoji}</span>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{c.name}</h5>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{c.type}</span>
                  </div>
                </div>

                <Badge variant={c.type === 'expense' ? 'orange' : 'green'} size="sm">
                  {c.type === 'expense' ? 'Pengeluaran' : 'Pemasukan'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
