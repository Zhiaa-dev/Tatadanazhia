import { NextRequest, NextResponse } from 'next/server';
import { getTataDanaStore } from '@/lib/store/tatadana-store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const store = getTataDanaStore();
    const transactions = store.getTransactions();
    return NextResponse.json({ ok: true, transactions });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const store = getTataDanaStore();

    const newTx = store.addTransaction({
      user_id: body.user_id || 'usr_budi_01',
      wallet_id: body.wallet_id || 'w_cash',
      category_id: body.category_id || null,
      type: body.type || 'expense',
      amount: Number(body.amount) || 0,
      description: body.description || '',
      source: body.source || 'web',
      transaction_time: body.transaction_time || new Date().toISOString(),
      has_receipt_items: false,
    });

    return NextResponse.json({ ok: true, transaction: newTx });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
