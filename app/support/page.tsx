'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Send, Loader2, ArrowLeft, Mail } from 'lucide-react';

type Message = { role: 'user' | 'assistant'; content: string };

const SUGGESTED = [
  '¿Qué pasa cuando instalo la app?',
  'Cómo añado el botón al tema',
  'Cómo empiezo la prueba gratis',
  '¿Cómo funciona el cross-sell?',
  '¿Cuánto cuesta y qué incluye?',
  '¿Cómo cancelo antes del día 7?',
  'What happens after install?',
  'How do I add the button to my theme?',
];

export default function SupportPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content:
        '¡Hola! Soy el asistente de Agalaz. Pregúntame lo que quieras sobre instalación, precios, créditos, privacidad o cualquier duda. / Hi! I\'m the Agalaz assistant — ask me anything about setup, pricing, credits, or privacy.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  async function send(text: string) {
    const q = text.trim();
    if (!q || loading) return;
    const next: Message[] = [...messages, { role: 'user', content: q }];
    setMessages(next);
    setInput('');
    setLoading(true);
    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      const reply =
        data.reply ||
        data.error ||
        'Sorry, something went wrong. Please email infoagalaz@gmail.com.';
      setMessages([...next, { role: 'assistant', content: reply }]);
    } catch {
      setMessages([
        ...next,
        {
          role: 'assistant',
          content:
            'Network error. Please retry or email infoagalaz@gmail.com.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif' }}>
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft size={16} />
            <span className="text-xs font-semibold">Back</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-slate-900">
              Agalaz Support
            </span>
          </div>
          <a
            href="mailto:infoagalaz@gmail.com"
            className="flex items-center gap-1.5 text-slate-500 hover:text-indigo-600 transition-colors"
            title="Email support"
          >
            <Mail size={16} />
          </a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-4 py-4">
        <div
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col"
          style={{ height: 'calc(100vh - 120px)' }}
        >
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-slate-100 text-slate-900 rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-2.5 rounded-2xl bg-slate-100 text-slate-500 text-sm rounded-bl-sm flex items-center gap-2">
                  <Loader2 size={14} className="animate-spin" /> ...
                </div>
              </div>
            )}
          </div>

          {messages.length <= 1 && (
            <div className="px-4 pb-3 flex flex-wrap gap-2">
              {SUGGESTED.map((s, i) => (
                <button
                  key={i}
                  onClick={() => send(s)}
                  disabled={loading}
                  className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-colors disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="border-t border-slate-100 p-3 flex gap-2"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu pregunta... / Ask anything..."
              disabled={loading}
              maxLength={1500}
              className="flex-1 px-4 py-2.5 bg-slate-100 rounded-xl text-sm outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
