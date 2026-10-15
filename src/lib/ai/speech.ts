import { getActiveProviders, logAICall } from './multi-provider';

/**
 * Transcribes Telegram voice note (OGG / MP3 / WAV) to text using Gemini Audio or OpenAI Whisper
 */
export async function transcribeAudio(
  audioBase64: string,
  mimeType: string = 'audio/ogg',
  durationSeconds?: number,
  userId?: string
): Promise<string> {
  // Check maximum duration limit (60 seconds)
  if (durationSeconds && durationSeconds > 60) {
    throw new Error('Durasi voice note maksimal 60 detik ya. Mohon perpendek rekaman suaramu 🙏');
  }

  const providers = await getActiveProviders();
  const startTime = Date.now();
  let lastError: any = null;

  for (const p of providers) {
    try {
      if (p.provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${p.api_key_encrypted}`;
        const payload = {
          contents: [
            {
              parts: [
                {
                  text: 'Tolong transkrip suara rekaman berbahasa Indonesia ini secara persis ke dalam teks teks. Hanya keluarkan hasil teks transkrip tanpa tambahan komentar apa pun.',
                },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: audioBase64,
                  },
                },
              ],
            },
          ],
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini Audio error: ${errText}`);
        }

        const data = await res.json();
        const transcript = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';

        const latency_ms = Date.now() - startTime;
        await logAICall({
          user_id: userId,
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          action_type: 'speech_to_text',
          prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
          completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
          latency_ms,
          status: 'success',
        });

        if (!transcript) {
          throw new Error('Hasil transkrip kosong atau suara tidak terdengar jelas.');
        }

        return transcript;
      } else if (p.provider === 'openai') {
        // OpenAI Whisper requires multipart/form-data
        const audioBuffer = Buffer.from(audioBase64, 'base64');
        const formData = new FormData();
        const blob = new Blob([audioBuffer], { type: mimeType });
        formData.append('file', blob, 'voice.ogg');
        formData.append('model', 'whisper-1');
        formData.append('language', 'id');

        const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${p.api_key_encrypted}`,
          },
          body: formData,
        });

        if (!res.ok) {
          throw new Error(`Whisper error: ${await res.text()}`);
        }

        const data = await res.json();
        const transcript = data.text?.trim() || '';

        const latency_ms = Date.now() - startTime;
        await logAICall({
          user_id: userId,
          provider: 'openai',
          model: 'whisper-1',
          action_type: 'speech_to_text',
          prompt_tokens: 0,
          completion_tokens: 0,
          latency_ms,
          status: 'success',
        });

        return transcript;
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Speech transcription failed with provider ${p.provider}:`, err?.message);
    }
  }

  throw new Error(
    `Suara tidak terdengar jelas atau gagal ditranskrip. Mohon ulangi voice note dengan lebih jelas atau ketik manual ya 🙏`
  );
}
