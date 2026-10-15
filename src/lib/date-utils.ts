/**
 * TataDana Indonesian Localization & WIB Timezone Utilities
 * All timestamps, bot replies, reminders and exports strictly use WIB (Asia/Jakarta / UTC+7).
 */

const INDONESIAN_DAYS = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
];

const INDONESIAN_MONTHS = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const INDONESIAN_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'Mei',
  'Jun',
  'Jul',
  'Agu',
  'Sep',
  'Okt',
  'Nov',
  'Des',
];

/**
 * Returns current Date in WIB (Asia/Jakarta)
 */
export function getWIBDate(dateInput?: Date | string | number): Date {
  const date = dateInput ? new Date(dateInput) : new Date();
  return date;
}

/**
 * Formats a number into Indonesian Rupiah format: Rp15.000 or Rp1.500.000
 */
export function formatRupiah(amount: number): string {
  const rounded = Math.round(amount);
  const formatted = new Intl.NumberFormat('id-ID').format(rounded);
  return `Rp${formatted}`;
}

/**
 * Formats date to Telegram Bot reply style:
 * "Rabu, 14 Oktober 2026 — 18:30 WIB"
 */
export function formatTelegramDateTime(dateInput?: Date | string): string {
  try {
    const date = dateInput ? new Date(dateInput) : new Date();
    if (isNaN(date.getTime())) return 'WIB';
    
    // Format with Asia/Jakarta options
    const formatter = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const findVal = (type: string) => parts.find(p => p.type === type)?.value || '';

    const weekday = findVal('weekday');
    const day = findVal('day');
    const month = findVal('month');
    const year = findVal('year');
    const hour = findVal('hour').padStart(2, '0');
    const minute = findVal('minute').padStart(2, '0');

    return `${weekday}, ${day} ${month} ${year} — ${hour}:${minute} WIB`;
  } catch {
    return 'WIB';
  }
}

/**
 * Formats date to short format: "14 Okt 2026"
 */
export function formatShortDate(dateInput?: Date | string | null): string {
  if (!dateInput) return '-';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return '-';
  }
}

/**
 * Formats date to full format: "14 Oktober 2026"
 */
export function formatFullDate(dateInput?: Date | string | null): string {
  if (!dateInput) return '-';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    return new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return '-';
  }
}

/**
 * Formats time: "18:30 WIB"
 */
export function formatTimeWIB(dateInput?: Date | string | null): string {
  if (!dateInput) return '-';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '-';
    const timeStr = new Intl.DateTimeFormat('id-ID', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(date);
    return `${timeStr} WIB`;
  } catch {
    return '-';
  }
}

/**
 * Returns current month string in YYYY-MM-01 format in WIB
 */
export function getCurrentMonthWIB(): string {
  try {
    const now = new Date();
    const year = now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta', year: 'numeric' });
    const month = now.toLocaleString('en-US', { timeZone: 'Asia/Jakarta', month: '2-digit' });
    return `${year}-${month}-01`;
  } catch {
    return new Date().toISOString().slice(0, 7) + '-01';
  }
}

