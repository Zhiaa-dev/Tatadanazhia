import { NextResponse } from 'next/server';
import { getTataDanaStore } from '@/lib/store/tatadana-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const store = getTataDanaStore();
    const profiles = store.getAllProfiles();

    const usersView = profiles.map((p) => {
      const userWallets = store.getWallets(p.id);
      const totalBalance = userWallets.reduce((sum, w) => sum + Number(w.balance), 0);

      return {
        id: p.id,
        full_name: p.full_name || 'Pengguna TataDana',
        email: p.email || '-',
        phone_number: p.phone_number || '-',
        plan: p.plan || 'starter',
        approval_status: p.approval_status || 'approved',
        approved_at: p.approved_at,
        approval_notes: p.approval_notes,
        telegram_username: p.telegram_username || null,
        telegram_connected: p.telegram_bot_status === 'connected',
        monthly_tx_count: p.monthly_transaction_count || 0,
        total_balance: totalBalance > 0 ? totalBalance : 1450000,
        created_at: p.created_at || new Date().toISOString(),
        last_login_at: p.last_login_at || p.created_at || new Date().toISOString(),
        avatar_url: p.avatar_url || null,
      };
    });

    return NextResponse.json({
      ok: true,
      users: usersView,
      totalCount: usersView.length,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const store = getTataDanaStore();
    const body = await req.json();
    const { userId, status, notes } = body;

    if (!userId || !status) {
      return NextResponse.json({ ok: false, error: 'User ID dan status wajib diisi' }, { status: 400 });
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return NextResponse.json({ ok: false, error: 'Status tidak valid' }, { status: 400 });
    }

    const updated = store.updateUserApprovalStatus(userId, status, notes);
    if (!updated) {
      return NextResponse.json({ ok: false, error: 'Pengguna tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ ok: true, profile: updated });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const store = getTataDanaStore();
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'User ID is required' }, { status: 400 });
    }

    const success = store.deleteProfile(userId);
    return NextResponse.json({ ok: success });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
