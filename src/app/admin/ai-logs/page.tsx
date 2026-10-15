'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Activity, Clock, Cpu, CheckCircle2, XCircle } from 'lucide-react';
import { AILog } from '@/lib/types';
import { formatTimeWIB } from '@/lib/date-utils';

export default function AdminAILogsPage() {
  const [logs] = useState<AILog[]>([
    {
      id: 'l1',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      action_type: 'parse_text',
      prompt_tokens: 340,
      completion_tokens: 42,
      latency_ms: 412,
      status: 'success',
      created_at: new Date().toISOString(),
    },
    {
      id: 'l2',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      action_type: 'ocr_receipt',
      prompt_tokens: 1250,
      completion_tokens: 180,
      latency_ms: 1850,
      status: 'success',
      created_at: new Date(Date.now() - 60000 * 5).toISOString(),
    },
    {
      id: 'l3',
      provider: 'openai',
      model: 'whisper-1',
      action_type: 'speech_to_text',
      prompt_tokens: 0,
      completion_tokens: 0,
      latency_ms: 890,
      status: 'success',
      created_at: new Date(Date.now() - 60000 * 12).toISOString(),
    },
    {
      id: 'l4',
      provider: 'gemini',
      model: 'gemini-1.5-flash',
      action_type: 'advisor',
      prompt_tokens: 410,
      completion_tokens: 95,
      latency_ms: 620,
      status: 'success',
      created_at: new Date(Date.now() - 60000 * 30).toISOString(),
    },
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Log Pemanggilan AI Engine</h2>
        <p className="text-sm text-slate-400">
          Riwayat eksekusi LLM parser, Vision OCR struk, Speech-to-Text, dan latency monitoring biaya.
        </p>
      </div>

      <div className="bg-slate-900 rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-4 px-6">Timestamp (WIB)</th>
                <th className="py-4 px-4">Action Type</th>
                <th className="py-4 px-4">Provider / Model</th>
                <th className="py-4 px-4">Tokens (Prompt / Comp)</th>
                <th className="py-4 px-4">Latency</th>
                <th className="py-4 px-6 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-4 px-6 font-mono text-slate-400 whitespace-nowrap">
                    {formatTimeWIB(log.created_at)}
                  </td>
                  <td className="py-4 px-4 whitespace-nowrap">
                    <span className="font-bold text-white capitalize">{log.action_type.replace('_', ' ')}</span>
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-400 whitespace-nowrap">
                    <span className="text-orange-400 font-bold capitalize">{log.provider}</span> • {log.model}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-300">
                    {log.prompt_tokens} / {log.completion_tokens}
                  </td>
                  <td className="py-4 px-4 font-mono text-slate-400">{log.latency_ms} ms</td>
                  <td className="py-4 px-6 text-right whitespace-nowrap">
                    {log.status === 'success' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Berhasil
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-400 font-bold">
                        <XCircle className="w-3.5 h-3.5" /> Gagal
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
