
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { Transaction, Budget } from '../types';

interface AiAssistantProps {
  transactions: Transaction[];
  budgets: Budget[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AiAssistant: React.FC<AiAssistantProps> = ({ transactions, budgets }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hello! I'm your CashFlow AI Advisor. How can I help you today?", 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // IMPORTANT: This is a client-side app. Any API key used here will be exposed in the browser.
  // For a safer setup, proxy Gemini requests via a backend/serverless function.
  const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || !apiKey || isLoading) return;
    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthTransactions = transactions.filter(t => t.date.startsWith(currentMonth));
      const summary = monthTransactions.reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {} as Record<string, number>);

      const context = {
        currentMonth,
        totalTransactionsCount: transactions.length,
        monthlySpendingByCategory: summary,
        activeBudgets: budgets.filter(b => b.month === currentMonth),
        recentTransactions: transactions.slice(0, 10).map(t => ({ date: t.date, amount: t.amount, category: t.category, type: t.type, note: t.note }))
      };

      const response = await ai.models.generateContent({
        // If this model name changes on the provider side, update it here.
        model: 'gemini-3-pro-preview',
        contents: `User data context: ${JSON.stringify(context)}. User Question: ${userMessage}`,
        config: {
          systemInstruction: "You are CashFlow AI, a deep financial analysis expert. Use Taka (৳) symbols. Keep formatting clean. If asked about something non-financial, guide the user back.",
          temperature: 0.8,
        }
      });

      const assistantReply = response.text || "I'm sorry, I couldn't process that.";
      setMessages(prev => [...prev, { role: 'assistant', content: assistantReply, timestamp: new Date() }]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Please try again.", timestamp: new Date() }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    "Analyze spending",
    "Find savings",
    "Budget status",
    "Last month vs this"
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-140px)] bg-white rounded-2xl md:rounded-3xl border shadow-xl overflow-hidden">
      <div className="bg-slate-900 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-500 rounded-lg md:rounded-xl flex items-center justify-center text-lg shadow-lg">✨</div>
          <div>
            <h3 className="font-bold text-white text-xs md:text-sm">AI Advisor</h3>
            <span className="text-[9px] md:text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Active</span>
          </div>
        </div>
        <button onClick={() => window.confirm("Clear chat?") && setMessages([messages[0]])} className="text-slate-400 hover:text-white transition-colors text-[10px] font-bold">CLEAR</button>
      </div>

      {!apiKey && (
        <div className="bg-amber-50 border-b border-amber-100 px-4 py-3 text-[11px] text-amber-900">
          <div className="font-bold">AI is disabled</div>
          <div className="opacity-80">
            Add <span className="font-mono">VITE_GEMINI_API_KEY</span> in your environment to enable the AI Advisor.
            Note: keys in a browser app are visible to users.
          </div>
        </div>
      )}

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 bg-slate-50/50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[90%] md:max-w-[85%] p-3 md:p-4 rounded-2xl shadow-sm ${
              msg.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
            }`}>
              <div className="text-xs md:text-sm leading-relaxed prose prose-sm max-w-none">{msg.content}</div>
              <div className="text-[8px] md:text-[9px] mt-1.5 opacity-40 font-bold text-right">
                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 p-3 rounded-2xl rounded-tl-none flex gap-1.5 items-center">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce"></span>
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-150"></span>
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce delay-300"></span>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white border-t p-3 md:p-4 space-y-3 shrink-0">
        {!apiKey && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-900">
            AI is disabled because <span className="font-mono font-bold">VITE_GEMINI_API_KEY</span> is not set.
            Add it to a local <span className="font-mono font-bold">.env.local</span> file, then restart the dev server.
          </div>
        )}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {quickPrompts.map(prompt => (
            <button
              key={prompt}
              onClick={() => setInput(prompt)}
              disabled={isLoading}
              className="whitespace-nowrap px-3 py-1.5 bg-slate-50 text-slate-500 rounded-full text-[10px] md:text-xs font-bold border border-slate-100 transition-all"
            >
              {prompt}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder={apiKey ? "Type your question..." : "Set VITE_GEMINI_API_KEY to enable AI"}
            className="flex-1 px-4 py-2.5 bg-slate-50 border-none rounded-xl outline-none focus:ring-2 focus:ring-emerald-500/20 text-sm"
            disabled={isLoading || !apiKey}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim() || !apiKey}
            className="bg-slate-900 text-white w-10 h-10 rounded-xl flex items-center justify-center shrink-0 disabled:opacity-30"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AiAssistant;
