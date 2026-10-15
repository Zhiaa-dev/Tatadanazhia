import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const notification = await req.json();
    const { order_id, transaction_status, fraud_status, payment_type } = notification;

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check payment row in DB
    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', order_id)
      .single();

    if (!payment) {
      return NextResponse.json({ error: 'Payment order not found' }, { status: 404 });
    }

    let newStatus: 'pending' | 'settlement' | 'approved' | 'rejected' | 'failed' = payment.status;

    if (transaction_status === 'capture' || transaction_status === 'settlement') {
      if (fraud_status === 'accept' || !fraud_status) {
        newStatus = 'settlement';
      }
    } else if (transaction_status === 'cancel' || transaction_status === 'deny' || transaction_status === 'expire') {
      newStatus = 'failed';
    } else if (transaction_status === 'pending') {
      newStatus = 'pending';
    }

    // Update payment record
    await supabase
      .from('payments')
      .update({
        status: newStatus,
        payment_method: payment_type || payment.payment_method,
        midtrans_transaction_id: notification.transaction_id || null,
        updated_at: new Date().toISOString(),
      })
      .eq('order_id', order_id);

    // If settled/approved, upgrade profile plan
    if (newStatus === 'settlement') {
      await supabase
        .from('profiles')
        .update({
          plan: payment.plan,
          plan_expires_at: payment.plan === 'starter' ? new Date(Date.now() + 30 * 86400000).toISOString() : null, // Pro is lifetime
        })
        .eq('id', payment.user_id);
    }

    return NextResponse.json({ ok: true, status: newStatus });
  } catch (error: any) {
    console.error('Midtrans notification error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
