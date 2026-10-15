export interface TelegramUser {
  id: number;
  is_bot: boolean;
  first_name: string;
  username?: string;
}

export interface TelegramBotInfo {
  ok: boolean;
  result?: TelegramUser;
  description?: string;
  error_code?: number;
}

export interface TelegramWebhookResult {
  ok: boolean;
  result?: boolean;
  description?: string;
}

/**
 * Sanitizes any string to remove telegram bot tokens, protecting security in logs
 */
export function sanitizeToken(input: string): string {
  if (!input) return '';
  return input.replace(/bot\d+:[A-Za-z0-9_-]+/g, 'bot[REDACTED_TOKEN]');
}

/**
 * Validates bot token with getMe API call
 */
export async function getBotMe(token: string): Promise<TelegramBotInfo> {
  if (!token || token.includes('dummy') || token === 'tatadana_shared_bot' || token === 'demo_token') {
    return {
      ok: true,
      result: {
        id: 789123456,
        is_bot: true,
        first_name: 'TataDana Official Bot',
        username: 'TataDanaBot',
      },
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/getMe`;
    const res = await fetch(url, { method: 'GET' });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      ok: false,
      description: sanitizeToken(err?.message || 'Network request failed'),
    };
  }
}

/**
 * Registers webhook endpoint on Telegram API
 */
export async function setBotWebhook(token: string, webhookUrl: string): Promise<TelegramWebhookResult> {
  if (!token || token.includes('dummy') || token === 'tatadana_shared_bot' || token === 'demo_token') {
    return { ok: true, result: true, description: 'Webhook registered (simulated)' };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/setWebhook?url=${encodeURIComponent(webhookUrl)}`;
    const res = await fetch(url, { method: 'POST' });
    const data = await res.json();
    return data;
  } catch (err: any) {
    return {
      ok: false,
      description: sanitizeToken(err?.message || 'Failed to set webhook'),
    };
  }
}

/**
 * Sends a message to Telegram chat
 * IMPORTANT: Never logs token in any console or error
 */
export async function sendTelegramMessage(
  token: string,
  chatId: number | string,
  text: string,
  replyToMessageId?: number
): Promise<{ ok: boolean; result?: any; description?: string }> {
  // If simulated/test mode or offline token
  if (!token || token.includes('dummy') || token === 'tatadana_shared_bot' || token === 'demo_token') {
    return {
      ok: true,
      result: {
        message_id: Math.floor(Math.random() * 100000) + 1,
        chat: { id: chatId },
        date: Math.floor(Date.now() / 1000),
        text: text,
      },
    };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;
    const payload: any = {
      chat_id: chatId,
      text: text,
    };

    if (replyToMessageId) {
      payload.reply_to_message_id = replyToMessageId;
    }

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    // Return sanitized message, NEVER leaking the token
    return {
      ok: false,
      description: sanitizeToken(err?.message || 'Failed to send message'),
      result: {
        message_id: 0,
        chat: { id: chatId },
        text: text,
      },
    };
  }
}

/**
 * Fetches file path and downloads binary buffer (for voice notes and photo receipts)
 */
export async function downloadTelegramFile(
  token: string,
  fileId: string
): Promise<{ buffer: Buffer; mimeType: string }> {
  const getFileUrl = `https://api.telegram.org/bot${token}/getFile?file_id=${fileId}`;
  const fileRes = await fetch(getFileUrl);
  const fileData = await fileRes.json();

  if (!fileData.ok || !fileData.result?.file_path) {
    throw new Error(`Gagal mengambil file Telegram: ${sanitizeToken(fileData.description || 'File tidak ditemukan')}`);
  }

  const filePath = fileData.result.file_path;
  const downloadUrl = `https://api.telegram.org/file/bot${token}/${filePath}`;

  const dlRes = await fetch(downloadUrl);
  const arrayBuffer = await dlRes.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  let mimeType = 'application/octet-stream';
  if (filePath.endsWith('.oga') || filePath.endsWith('.ogg')) {
    mimeType = 'audio/ogg';
  } else if (filePath.endsWith('.mp3')) {
    mimeType = 'audio/mp3';
  } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
    mimeType = 'image/jpeg';
  } else if (filePath.endsWith('.png')) {
    mimeType = 'image/png';
  }

  return { buffer, mimeType };
}
