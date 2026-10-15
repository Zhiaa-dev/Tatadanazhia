import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { normalizePhoneNumber } from '@/lib/telegram/handler';

export async function POST(req: NextRequest) {
  try {
    const { phoneNumber, otpCode, userId } = await req.json();

    if (!phoneNumber || !otpCode) {
      return NextResponse.json({ error: 'Nomor HP dan kode OTP wajib diisi.' }, { status: 400 });
    }

    const normalizedPhone = normalizePhoneNumber(phoneNumber);

    // Development & Production OTP Check
    // Sandbox default: '123456' allows full end-to-end testing without external SMS gateway charges
    const isValidOtp = otpCode === '123456' || (process.env.TEST_OTP && otpCode === process.env.TEST_OTP);

    if (!isValidOtp) {
      return NextResponse.json({ error: 'Kode OTP salah atau sudah kedaluwarsa. (Gunakan OTP Sandbox: 123456)' }, { status: 400 });
    }

    const supabase = createAdminClient();

    if (userId) {
      // Update existing profile
      const { error } = await supabase
        .from('profiles')
        .update({
          phone_number: normalizedPhone,
          phone_verified: true,
        })
        .eq('id', userId);

      if (error) throw error;
    }

    return NextResponse.json({
      success: true,
      phoneNumber: normalizedPhone,
      message: 'Nomor HP berhasil diverifikasi! Sekarang siap dihubungkan ke bot Telegram.',
    });
  } catch (error: any) {
    console.error('Phone verification error:', error);
    return NextResponse.json({ error: error.message || 'Gagal memverifikasi OTP.' }, { status: 500 });
  }
}
