import { getActiveProviders, logAICall } from './multi-provider';

export interface ExtractedReceiptItem {
  item_name: string;
  price: number;
  quantity: number;
  kategori: string;
}

export interface ExtractedReceiptResult {
  merchant_name: string;
  transaction_date?: string;
  total_amount: number;
  items: ExtractedReceiptItem[];
  kategori_utama: string;
}

/**
 * Extracts itemized details from receipt photo using Gemini Vision or OpenAI GPT-4o
 */
export async function extractReceiptFromImage(
  imageBase64: string,
  mimeType: string = 'image/jpeg',
  userId?: string
): Promise<ExtractedReceiptResult> {
  const providers = await getActiveProviders();
  const startTime = Date.now();

  const prompt = `Anda adalah sistem AI Vision khusus struk/nota belanja Indonesia untuk TataDana.
Analisis gambar struk belanja ini dan ekstrak data rincian transaksi dalam format JSON:

1. merchant_name: nama toko / restoran / minimarket (misal: "Indomaret", "Alfamart", "Kopi Kenangan", "Superindo").
2. total_amount: total nominal akhir belanja (angka integer Rupiah).
3. items: array dari semua item belanjaan yang tertera di struk:
   - item_name: nama barang / makanan
   - price: harga total untuk item tersebut
   - quantity: jumlah unit
   - kategori: pilih kategori yang relevan untuk item ini (contoh: "Makanan", "Belanja", "Kesehatan", dll.)
4. kategori_utama: kategori dominan keseluruhan transaksi (misal: "Belanja" atau "Makanan").

OUTPUT WAJIB FORMAT JSON VALID TANPA MARKDOWN BACKTICKS:
{
  "merchant_name": "Indomaret",
  "total_amount": 45000,
  "kategori_utama": "Belanja",
  "items": [
    { "item_name": "Roti Tawar", "price": 18000, "quantity": 1, "kategori": "Makanan" },
    { "item_name": "Susu UHT", "price": 12000, "quantity": 1, "kategori": "Makanan" },
    { "item_name": "Sabun Mandi", "price": 15000, "quantity": 1, "kategori": "Belanja" }
  ]
}`;

  let lastError: any = null;

  for (const p of providers) {
    try {
      if (p.provider === 'gemini') {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${p.api_key_encrypted}`;
        const payload = {
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType: mimeType,
                    data: imageBase64,
                  },
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        };

        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`Gemini Vision error: ${errText}`);
        }

        const data = await res.json();
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
        const parsed = JSON.parse(rawText);

        const latency_ms = Date.now() - startTime;
        await logAICall({
          user_id: userId,
          provider: 'gemini',
          model: 'gemini-1.5-flash',
          action_type: 'ocr_receipt',
          prompt_tokens: data.usageMetadata?.promptTokenCount || 0,
          completion_tokens: data.usageMetadata?.candidatesTokenCount || 0,
          latency_ms,
          status: 'success',
        });

        return {
          merchant_name: parsed.merchant_name || 'Struk Belanja',
          total_amount: Math.round(Number(parsed.total_amount) || 0),
          kategori_utama: parsed.kategori_utama || 'Belanja',
          items: Array.isArray(parsed.items) ? parsed.items : [],
        };
      } else if (p.provider === 'openai') {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${p.api_key_encrypted}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o',
            messages: [
              {
                role: 'user',
                content: [
                  { type: 'text', text: prompt },
                  {
                    type: 'image_url',
                    image_url: {
                      url: `data:${mimeType};base64,${imageBase64}`,
                    },
                  },
                ],
              },
            ],
            response_format: { type: 'json_object' },
          }),
        });

        if (!res.ok) {
          throw new Error(`OpenAI Vision error: ${await res.text()}`);
        }

        const data = await res.json();
        const parsed = JSON.parse(data.choices?.[0]?.message?.content || '{}');

        const latency_ms = Date.now() - startTime;
        await logAICall({
          user_id: userId,
          provider: 'openai',
          model: 'gpt-4o',
          action_type: 'ocr_receipt',
          prompt_tokens: data.usage?.prompt_tokens || 0,
          completion_tokens: data.usage?.completion_tokens || 0,
          latency_ms,
          status: 'success',
        });

        return {
          merchant_name: parsed.merchant_name || 'Struk Belanja',
          total_amount: Math.round(Number(parsed.total_amount) || 0),
          kategori_utama: parsed.kategori_utama || 'Belanja',
          items: Array.isArray(parsed.items) ? parsed.items : [],
        };
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`Vision OCR failed with provider ${p.provider}:`, err?.message);
    }
  }

  throw new Error(`Gagal membaca struk dengan AI Vision: ${lastError?.message || 'Tidak ada provider vision yang aktif'}`);
}
