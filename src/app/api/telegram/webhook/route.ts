import { NextRequest, NextResponse } from 'next/server';
import { processTelegramWebhookUpdate } from '@/lib/telegram/handler';

export async function POST(req: NextRequest) {
  try {
    let payload: any = null;
    try {
      payload = await req.json();
    } catch (parseErr) {
      return NextResponse.json({ ok: false, error: 'invalid_json_payload' }, { status: 400 });
    }

    if (!payload || typeof payload.update_id !== 'number') {
      return NextResponse.json({ ok: false, error: 'invalid_payload_missing_update_id' }, { status: 400 });
    }

    // Process update
    const result = await processTelegramWebhookUpdate(payload);

    return NextResponse.json({ ok: true, result });
  } catch (error: any) {
    console.error('Telegram webhook error:', error);
    // Always return HTTP 200 to Telegram to prevent aggressive retry storms, but log error
    return NextResponse.json({ ok: false, error: error.message }, { status: 200 });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'TataDana Telegram Webhook Engine',
    timezone: 'Asia/Jakarta (WIB)',
    timestamp: new Date().toISOString(),
  });
}
