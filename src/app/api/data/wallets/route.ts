import { NextRequest, NextResponse } from 'next/server';
import { getTataDanaStore } from '@/lib/store/tatadana-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const store = getTataDanaStore();
    const wallets = store.getWallets('usr_budi_01');
    const totalBalance = wallets.reduce((sum, w) => sum + Number(w.balance), 0);
    return NextResponse.json({ ok: true, wallets, totalBalance });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
