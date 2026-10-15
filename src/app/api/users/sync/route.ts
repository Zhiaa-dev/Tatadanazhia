import { NextResponse } from 'next/server';
import { getTataDanaStore } from '@/lib/store/tatadana-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const store = getTataDanaStore();
    const body = await req.json();
    const { full_name, email, phone_number, plan, isLogin, avatar_url } = body;

    if (!email) {
      return NextResponse.json({ ok: false, error: 'Alamat email wajib diisi' }, { status: 400 });
    }

    const profile = store.registerOrLoginUser({
      full_name,
      email,
      phone_number,
      plan,
      isLogin: !!isLogin,
      avatar_url,
    });

    return NextResponse.json({
      ok: true,
      message: isLogin ? 'Login berhasil' : 'Registrasi akun berhasil',
      profile,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const store = getTataDanaStore();
    const { searchParams } = new URL(req.url);
    const email = searchParams.get('email');
    const userId = searchParams.get('userId');

    if (email || userId) {
      const profile = store.getProfileByIdOrEmail(userId || email || undefined);
      return NextResponse.json({ ok: true, profile });
    }

    const profiles = store.getAllProfiles();
    return NextResponse.json({ ok: true, profiles });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
