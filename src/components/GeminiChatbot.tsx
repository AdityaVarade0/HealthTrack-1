import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, Medication, HealthRecord } from '../types/healthtrack';
import {
  Sparkles,
  Send,
  Bot,
  User,
  Search,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Stethoscope,
  Heart,
  Pill,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  sources?: Array<{ title: string; uri: string }>;
  searchQueries?: string[];
}

interface GeminiChatbotProps {
  currentUser: UserProfile;
  medications: Medication[];
  records: HealthRecord[];
}

const PRESET_QUERIES = [
  'Check interactions between Lisinopril and high-potassium foods',
  'What is the normal target range for fasting blood glucose?',
  'What should I do if I missed my morning medication dose by 3 hours?',
  'How does caffeine affect morning blood pressure readings?',
];

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({
  currentUser,
  medications,
  records,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      content: `Hello ${currentUser.name.split(' ')[0]}! I am **HealthTrack MedAssist**, your personal clinical wellness companion. I can help you check potential drug interactions using live Google Search data, interpret your blood pressure or glucose readings, and prepare questions for your doctor.\n\n*How can I assist your health plan today?*`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingVitals, setAnalyzingVitals] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation payload
      const conversationHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        parts: [{ text: m.content }],
      }));

      const latestRecord = records[0];
      const patientContext = {
        name: currentUser.name,
        medications: medications.map((m) => `${m.name} ${m.dosage} (${m.frequency})`),
        vitals: latestRecord
          ? `BP: ${latestRecord.bp || 'N/A'}, Glucose: ${latestRecord.sugar || 'N/A'} mg/dL, Weight: ${latestRecord.weight || 'N/A'} kg`
          : 'None recorded yet',
        allergies: currentUser.allergies || [],
      };

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: conversationHistory,
          patientContext,
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with ${res.status}`);
      }

      const data = await res.json();
      const modelMsg: ChatMessage = {
        id: `bot_${Date.now()}`,
        role: 'model',
        content: data.reply || 'No response generated.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: data.sources || [],
        searchQueries: data.webSearchQueries || [],
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (err: any) {
      console.error('Chat error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err_${Date.now()}`,
          role: 'model',
          content: `I encountered an issue verifying that information. Please ensure server connectivity or check back in a moment.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickVitalsAnalysis = async () => {
    if (records.length === 0 || analyzingVitals) return;
    setAnalyzingVitals(true);

    const latest = records[0];
    try {
      const res = await fetch('/api/analyze-vitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vitalData: latest,
          patientName: currentUser.name,
        }),
      });

      const data = await res.json();
      if (data.analysis) {
        setMessages((prev) => [
          ...prev,
          {
            id: `usr_${Date.now()}`,
            role: 'user',
            content: `Please analyze my latest vitals: BP ${latest.bp || 'N/A'}, Glucose ${latest.sugar || 'N/A'} mg/dL.`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          {
            id: `bot_${Date.now()}`,
            role: 'model',
            content: `**Clinical Vital Snapshot Review:**\n\n${data.analysis}`,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
    } catch (e) {
      console.warn('Vitals analysis error', e);
    } finally {
      setAnalyzingVitals(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#e8edf4] shadow-xs flex flex-col h-[600px] overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:px-6 border-b border-[#f0f3f8] flex items-center justify-between bg-gradient-to-r from-[#fbfaff] to-[#f4f2ff]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#6558d3] text-white flex items-center justify-center font-bold shadow-md shadow-[#6558d3]/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-[#172b4d]">HealthTrack MedAssist</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <Search className="w-3 h-3" />
                <span>Search Grounded</span>
              </span>
            </div>
            <p className="text-xs text-[#8b96aa]">
              Powered by Gemini 3.8 Flash • Real-time clinical research & drug data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {records.length > 0 && (
            <button
              onClick={handleQuickVitalsAnalysis}
              disabled={analyzingVitals}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#dcd6fc] hover:border-[#6558d3] text-[#6558d3] text-xs font-bold transition flex items-center gap-1.5 shadow-2xs disabled:opacity-50"
            >
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span>{analyzingVitals ? 'Analyzing...' : 'Analyze Vitals'}</span>
            </button>
          )}

          <button
            onClick={() =>
              setMessages([
                {
                  id: 'reset',
                  role: 'model',
                  content: `Conversation refreshed. How can I assist your health and medication questions?`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                },
              ])
            }
            title="Reset conversation"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-white transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Scrollable Message Thread */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';

          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-[#eef1f6] text-[#596780]'
                    : 'bg-[#6558d3] text-white shadow-xs'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[75%] space-y-1.5 ${isUser ? 'items-end' : ''}`}>
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                    isUser
                      ? 'bg-[#6558d3] text-white rounded-tr-xs shadow-md shadow-[#6558d3]/15'
                      : 'bg-[#f8f9fc] text-[#172b4d] border border-[#e8edf4] rounded-tl-xs'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{m.content}</div>

                  {/* Grounding Source Links if present */}
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-3 pt-2.5 border-t border-slate-200/80 space-y-1">
                      <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        <Search className="w-3 h-3 text-[#6558d3]" />
                        <span>Google Search Grounding Sources:</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {m.sources.slice(0, 3).map((src, idx) => (
                          <a
                            key={idx}
                            href={src.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-[#6558d3] font-semibold hover:underline"
                          >
                            <span className="truncate max-w-[180px]">{src.title}</span>
                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className={`text-[10px] text-[#9ca3af] px-1 ${isUser ? 'text-right' : ''}`}>
                  {m.timestamp}
                </div>
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#6558d3] text-white flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#f8f9fc] border border-[#e8edf4] text-xs text-[#6b778c] flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6558d3] animate-ping" />
              <span>Searching clinical sources & synthesizing reply...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts carousel */}
      {messages.length <= 2 && (
        <div className="px-4 sm:px-6 py-2 border-t border-[#f0f3f8] bg-[#fcfdff] overflow-x-auto flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#9ca3af] shrink-0">
            Suggested:
          </span>
          {PRESET_QUERIES.map((q, i) => (
            <button
              key={i}
              onClick={() => handleSend(q)}
              className="px-2.5 py-1 rounded-lg bg-[#f8f9fc] hover:bg-[#f1effe] text-[11px] font-semibold text-[#596780] hover:text-[#6558d3] border border-[#e8edf4] shrink-0 transition"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 sm:p-4 border-t border-[#e8edf4] bg-white flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about medications, food interactions, BP ranges, or dosage..."
          disabled={loading}
          className="flex-1 px-4 py-2.5 rounded-xl border border-[#e2e8f0] focus:border-[#6558d3] text-xs text-[#172b4d] outline-none disabled:bg-slate-50"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-[#6558d3] hover:bg-[#5446c7] text-white transition disabled:opacity-40 shadow-xs"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
