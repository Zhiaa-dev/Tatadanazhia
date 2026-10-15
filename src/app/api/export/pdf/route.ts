import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { generatePDFReport } from '@/lib/export/pdf';
import { ReportSummary } from '@/lib/export/excel';
import { Transaction } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const { userId, periodStart, periodEnd, categoryId, walletId } = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID wajib disertakan' }, { status: 400 });
    }

    const supabase = createAdminClient();

    // Check user plan (Pro feature)
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan, full_name')
      .eq('id', userId)
      .single();

    if (profile?.plan !== 'pro') {
      return NextResponse.json(
        { error: 'Fitur ekspor laporan PDF hanya tersedia untuk paket Pro.' },
        { status: 403 }
      );
    }

    // Query transactions with filters
    let query = supabase
      .from('transactions')
      .select('*, category:categories(*), wallet:wallets(*), items:transaction_items(*)')
      .eq('user_id', userId)
      .order('transaction_time', { ascending: false });

    if (periodStart) query = query.gte('transaction_time', periodStart);
    if (periodEnd) query = query.lte('transaction_time', periodEnd + 'T23:59:59Z');
    if (categoryId) query = query.eq('category_id', categoryId);
    if (walletId) query = query.eq('wallet_id', walletId);

    const { data: txs, error: txError } = await query;
    if (txError) throw txError;

    const transactions = (txs || []) as Transaction[];

    // Calculate Summary
    let totalIncome = 0;
    let totalExpense = 0;
    const catMap: Record<string, number> = {};

    transactions.forEach(t => {
      const amt = Number(t.amount);
      if (t.type === 'income') totalIncome += amt;
      if (t.type === 'expense') {
        totalExpense += amt;
        const cName = t.category?.name || 'Lainnya';
        catMap[cName] = (catMap[cName] || 0) + amt;
      }
    });

    const topCategories = Object.entries(catMap)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
      }));

    const summary: ReportSummary = {
      totalIncome,
      totalExpense,
      netCashflow: totalIncome - totalExpense,
      periodStart: periodStart || '2026-01-01',
      periodEnd: periodEnd || new Date().toISOString().slice(0, 10),
      topCategories,
    };

    // Generate PDF Buffer
    const pdfBuffer = generatePDFReport(transactions, summary, profile?.full_name);

    // Save to Supabase Storage: bucket 'exports'
    const timestamp = Date.now();
    const fileName = `TataDana_Laporan_${periodStart || 'All'}_${periodEnd || 'All'}_${timestamp}.pdf`;
    const storagePath = `${userId}/${fileName}`;

    await supabase.storage.from('exports').upload(storagePath, pdfBuffer, {
      contentType: 'application/pdf',
      upsert: true,
    });

    // Create signed URL valid for 24 hours (86400 seconds)
    const { data: signedUrlData } = await supabase.storage
      .from('exports')
      .createSignedUrl(storagePath, 86400);

    // Record in export_history table
    await supabase.from('export_history').insert([
      {
        user_id: userId,
        file_name: fileName,
        file_format: 'pdf',
        storage_path: storagePath,
        period_start: summary.periodStart,
        period_end: summary.periodEnd,
        filter_meta: { categoryId, walletId },
      },
    ]);

    return NextResponse.json({
      success: true,
      fileName,
      downloadUrl: signedUrlData?.signedUrl,
    });
  } catch (error: any) {
    console.error('PDF Export Error:', error);
    return NextResponse.json({ error: error.message || 'Gagal membuat file PDF' }, { status: 500 });
  }
}
