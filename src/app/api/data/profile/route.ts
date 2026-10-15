import { NextResponse } from 'next/server';
import { getTataDanaStore } from '@/lib/store/tatadana-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const store = getTataDanaStore();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    const email = searchParams.get('email');

    let profile;
    if (userId || email) {
      profile = store.getProfileByIdOrEmail(userId || email || undefined);
    } else {
      const all = store.getAllProfiles();
      // Return the most recently logged in or created profile if available
      profile = all[all.length - 1] || all[0];
    }

    if (!profile) {
      return NextResponse.json({ ok: false, error: 'Profile not found' }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      profile,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const store = getTataDanaStore();
    const body = await req.json();
    const { email, full_name, phone_number, avatar_url, plan } = body;

    if (!email && !full_name) {
      return NextResponse.json({ ok: false, error: 'Email atau Nama Pengguna wajib diisi' }, { status: 400 });
    }

    const profile = store.registerOrLoginUser({
      email: email || `${full_name.toLowerCase().replace(/\s+/g, '')}@tatadana.local`,
      full_name,
      phone_number,
      avatar_url,
      plan,
      isLogin: false,
    });

    return NextResponse.json({
      ok: true,
      profile,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
