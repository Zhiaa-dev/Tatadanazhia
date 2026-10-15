import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  try {
    const { paymentId, adminId, action, notes } = await req.json();

    if (!paymentId || !['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Data approval tidak valid' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Verify adminId
    if (adminId) {
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', adminId)
        .single();

      if (!adminProfile?.is_admin) {
        return NextResponse.json({ error: 'Hanya admin yang memiliki otoritas approval' }, { status: 403 });
      }
    }

    const { data: payment } = await supabase
      .from('payments')
      .select('*')
      .eq('id', paymentId)
      .single();

    if (!payment) {
      return NextResponse.json({ error: 'Pembayaran tidak ditemukan' }, { status: 404 });
    }

    // Update payment status
    await supabase
      .from('payments')
      .update({
        status: action,
        approved_by: adminId || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', paymentId);

    // If approved, upgrade user plan
    if (action === 'approved') {
      await supabase
        .from('profiles')
        .update({
          plan: payment.plan,
          plan_expires_at: payment.plan === 'starter' ? new Date(Date.now() + 30 * 86400000).toISOString() : null,
        })
        .eq('id', payment.user_id);
    }

    // Record admin audit log
    if (adminId) {
      await supabase.from('admin_audit_logs').insert([
        {
          admin_id: adminId,
          target_user_id: payment.user_id,
          action: `PAYMENT_${action.toUpperCase()}`,
          details: { paymentId, plan: payment.plan, amount: payment.amount, notes },
        },
      ]);
    }

    return NextResponse.json({ success: true, status: action });
  } catch (error: any) {
    console.error('Payment approval error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
