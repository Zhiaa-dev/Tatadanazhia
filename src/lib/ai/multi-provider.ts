import { createAdminClient } from '@/lib/supabase/admin';
import { AIProviderConfig } from '@/lib/types';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface AICompletionOptions {
  temperature?: number;
  response_format?: 'json' | 'text';
  action_type?: 'parse_text' | 'ocr_receipt' | 'speech_to_text' | 'advisor' | 'onboarding_recommendation';
  user_id?: string;
}

export interface AIResponse {
  text: string;
  provider: string;
  model: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
}

/**
 * Fetch active AI providers from Supabase DB or fallback to environment variables
 */
export async function getActiveProviders(): Promise<AIProviderConfig[]> {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('ai_providers')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as AIProviderConfig[];
    }
  } catch (err) {
    // If DB fails, fallback to environment variables below
  }

  // Fallback default list from .env
  const fallbackList: AIProviderConfig[] = [];

  if (process.env.GEMINI_API_KEY) {
    fallbackList.push({
      id: 'env-gemini',
      provider: 'gemini',
      model_name: 'gemini-1.5-flash',
      api_key_encrypted: process.env.GEMINI_API_KEY,
      priority: 1,
      is_active: true,
      mode: 'single',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  if (process.env.OPENAI_API_KEY) {
    fallbackList.push({
      id: 'env-openai',
      provider: 'openai',
      model_name: 'gpt-4o-mini',
      api_key_encrypted: process.env.OPENAI_API_KEY,
      priority: 2,
      is_active: true,
      mode: 'single',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  if (process.env.DEEPSEEK_API_KEY) {
    fallbackList.push({
      id: 'env-deepseek',
      provider: 'deepseek',
      model_name: 'deepseek-chat',
      api_key_encrypted: process.env.DEEPSEEK_API_KEY,
      priority: 3,
      is_active: true,
      mode: 'single',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  }

  return fallbackList;
}

/**
 * Log AI call to Supabase ai_logs table for audit & cost tracking
 */
export async function logAICall(log: {
  user_id?: string;
  provider: string;
  model: string;
  action_type: string;
  prompt_tokens: number;
  completion_tokens: number;
  latency_ms: number;
  status: 'success' | 'failed';
  error_message?: string;
}) {
  try {
    const supabase = createAdminClient();
    await supabase.from('ai_logs').insert([log]);
  } catch (err) {
    console.error('Failed to log AI call:', err);
  }
}

/**
 * Call Gemini API
 */
async function callGemini(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  jsonMode: boolean = false
): Promise<{ text: string; prompt_tokens: number; completion_tokens: number }> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  // Format messages for Gemini
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.role === 'system' ? `SYSTEM INSTRUCTION: ${m.content}` : m.content }]
  }));

  const payload: any = { contents };
  if (jsonMode) {
    payload.generationConfig = {
      responseMimeType: 'application/json'
    };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const prompt_tokens = data.usageMetadata?.promptTokenCount || 0;
  const completion_tokens = data.usageMetadata?.candidatesTokenCount || 0;

  return { text, prompt_tokens, completion_tokens };
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  jsonMode: boolean = false
): Promise<{ text: string; prompt_tokens: number; completion_tokens: number }> {
  const url = 'https://api.openai.com/v1/chat/completions';
  const body: any = {
    model,
    messages,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenAI API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  const prompt_tokens = data.usage?.prompt_tokens || 0;
  const completion_tokens = data.usage?.completion_tokens || 0;

  return { text, prompt_tokens, completion_tokens };
}

/**
 * Call DeepSeek API
 */
async function callDeepSeek(
  apiKey: string,
  model: string,
  messages: ChatMessage[],
  jsonMode: boolean = false
): Promise<{ text: string; prompt_tokens: number; completion_tokens: number }> {
  const url = 'https://api.deepseek.com/chat/completions';
  const body: any = {
    model: model || 'deepseek-chat',
    messages,
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API error ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  const prompt_tokens = data.usage?.prompt_tokens || 0;
  const completion_tokens = data.usage?.completion_tokens || 0;

  return { text, prompt_tokens, completion_tokens };
}

/**
 * Execute chat completion with multi-provider failover
 */
export async function executeAICompletion(
  messages: ChatMessage[],
  options: AICompletionOptions = {}
): Promise<AIResponse> {
  const providers = await getActiveProviders();
  const actionType = options.action_type || 'parse_text';
  const isJson = options.response_format === 'json';

  let lastError: any = null;

  for (const p of providers) {
    const startTime = Date.now();
    try {
      let result: { text: string; prompt_tokens: number; completion_tokens: number };

      if (p.provider === 'gemini') {
        result = await callGemini(p.api_key_encrypted, p.model_name, messages, isJson);
      } else if (p.provider === 'openai') {
        result = await callOpenAI(p.api_key_encrypted, p.model_name, messages, isJson);
      } else if (p.provider === 'deepseek') {
        result = await callDeepSeek(p.api_key_encrypted, p.model_name, messages, isJson);
      } else {
        throw new Error(`Unknown provider: ${p.provider}`);
      }

      const latency_ms = Date.now() - startTime;

      // Log success
      await logAICall({
        user_id: options.user_id,
        provider: p.provider,
        model: p.model_name,
        action_type: actionType,
        prompt_tokens: result.prompt_tokens,
        completion_tokens: result.completion_tokens,
        latency_ms,
        status: 'success',
      });

      return {
        text: result.text,
        provider: p.provider,
        model: p.model_name,
        prompt_tokens: result.prompt_tokens,
        completion_tokens: result.completion_tokens,
        latency_ms,
      };
    } catch (err: any) {
      const latency_ms = Date.now() - startTime;
      lastError = err;
      console.warn(`[AI Failover] Provider ${p.provider} failed:`, err?.message);

      // Log failure
      await logAICall({
        user_id: options.user_id,
        provider: p.provider,
        model: p.model_name,
        action_type: actionType,
        prompt_tokens: 0,
        completion_tokens: 0,
        latency_ms,
        status: 'failed',
        error_message: err?.message || String(err),
      });

      // Continue to next provider in failover loop
    }
  }

  throw new Error(`Semua provider AI gagal memproses permintaan: ${lastError?.message || 'Tidak ada provider aktif'}`);
}
