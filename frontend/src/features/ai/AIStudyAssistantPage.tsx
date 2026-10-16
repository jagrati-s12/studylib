import { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Lightbulb,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';
import type { Subject, Topic } from '@/types';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export default function AIAssistantPage() {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm your AI Study & Note Assistant (Version 2). Ask me anything about your notes, schedule, or request help summarizing topics and generating checklists!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    api.getSubjects().then(setSubjects);
    api.getAllTopics().then(setTopics);
  }, []);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = input.trim();
    setInput('');
    setIsGenerating(true);

    setTimeout(() => {
      let replyText = `I analyzed your study library regarding "${query}". Here is a synthesized summary:`;
      const lowerQ = query.toLowerCase();

      if (lowerQ.includes('summarize') || lowerQ.includes('summary')) {
        replyText = `Based on your notes in Data Mining and Machine Learning, key topics emphasize KDD methodology, feature extraction, decision tree heuristics (Gini & Information Gain), and gradient descent optimization. Ensure you review the indexed chapters!`;
      } else if (lowerQ.includes('todo') || lowerQ.includes('task') || lowerQ.includes('checklist')) {
        replyText = `I recommend breaking your tasks into daily checklists. You currently have several pending items in your study schedule. Would you like me to generate a checklist for your next study block?`;
      } else if (selectedSubjectId) {
        const subj = subjects.find((s) => s.id === selectedSubjectId);
        replyText = `Regarding ${subj?.name || 'the selected subject'}: I scanned your uploaded materials and digital notes. Make sure to review the core formulas and reference papers before your next session.`;
      } else {
        replyText = `That's an insightful question about "${query}". I've indexed your materials across your subjects. You can reference specific subjects or topics directly in your todos or notes for quick redirection!`;
      }

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div
      className={`min-h-screen p-8 flex flex-col transition-colors duration-200 ${
        isDark ? 'bg-[#280B0F] text-[#C6B39A]' : 'bg-[#FFF5F6] text-[#2D3A47]'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-4 border-b border-inherit">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#B46A72] text-white flex items-center justify-center shadow-md">
            <Bot size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-display font-bold tracking-tight text-inherit">
                AI Study Assistant
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#B46A72]/20 text-[#B46A72] border border-[#B46A72]/30">
                v2.0 Beta
              </span>
            </div>
            <p className="text-sm opacity-70">
              Your intelligent companion for notes analysis, summaries, and smart study plans.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedSubjectId}
            onChange={(e) => setSelectedSubjectId(e.target.value)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold border focus:outline-none ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40 text-[#C6B39A]'
                : 'bg-white border-[#F7C8D3] text-[#2D3A47]'
            }`}
          >
            <option value="">All Subjects (Global Context)</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Chat Container */}
      <div
        className={`flex-1 rounded-3xl border shadow-sm flex flex-col overflow-hidden mb-6 ${
          isDark
            ? 'bg-[#3B1319]/40 border-[#7B694E]/30'
            : 'bg-white border-[#F7C8D3]/60'
        }`}
      >
        {/* Messages Feed */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3.5 ${
                msg.sender === 'user' ? 'flex-row-reverse' : ''
              }`}
            >
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#2D3A47] text-white'
                    : 'bg-[#B46A72] text-white'
                }`}
              >
                {msg.sender === 'user' ? <Sparkles size={16} /> : <Bot size={18} />}
              </div>
              <div
                className={`max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                  msg.sender === 'user'
                    ? 'bg-[#2D3A47] text-white rounded-tr-sm'
                    : isDark
                    ? 'bg-[#3B1319] text-[#C6B39A] border border-[#7B694E]/30 rounded-tl-sm'
                    : 'bg-[#FFF5F6] text-[#2D3A47] border border-[#F7C8D3]/50 rounded-tl-sm'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.text}</p>
                <span className="block text-[10px] opacity-60 mt-1 text-right">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isGenerating && (
            <div className="flex items-start gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-[#B46A72] text-white flex items-center justify-center shadow-sm">
                <Bot size={18} />
              </div>
              <div
                className={`px-5 py-3.5 rounded-2xl text-sm shadow-sm flex items-center gap-2 ${
                  isDark ? 'bg-[#3B1319] text-[#C6B39A]' : 'bg-[#FFF5F6] text-[#2D3A47]'
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-[#B46A72] animate-bounce" />
                <div className="w-2 h-2 rounded-full bg-[#B46A72] animate-bounce [animation-delay:0.2s]" />
                <div className="w-2 h-2 rounded-full bg-[#B46A72] animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs opacity-70 ml-2">AI is thinking & analyzing notes...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div
          className={`px-6 py-3 border-t flex items-center gap-2 overflow-x-auto ${
            isDark ? 'border-[#7B694E]/30 bg-[#280B0F]/60' : 'border-[#F7C8D3]/40 bg-[#FFF5F6]/50'
          }`}
        >
          <span className="text-xs font-bold opacity-60 shrink-0 flex items-center gap-1">
            <Lightbulb size={12} className="text-[#B46A72]" /> Quick Prompts:
          </span>
          <button
            onClick={() => setInput('Summarize my key study topics and notes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 border ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40 hover:bg-[#7B694E]/40 text-[#C6B39A]'
                : 'bg-white border-[#F7C8D3] hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
            }`}
          >
            📚 Summarize key study topics
          </button>
          <button
            onClick={() => setInput('Generate a study checklist for my pending tasks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 border ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40 hover:bg-[#7B694E]/40 text-[#C6B39A]'
                : 'bg-white border-[#F7C8D3] hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
            }`}
          >
            ✅ Generate study checklist
          </button>
          <button
            onClick={() => setInput('Explain KDD pipeline and machine learning algorithms')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors shrink-0 border ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40 hover:bg-[#7B694E]/40 text-[#C6B39A]'
                : 'bg-white border-[#F7C8D3] hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
            }`}
          >
            🧠 Explain core ML concepts
          </button>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => handleSend(e)}
          className={`p-4 border-t flex items-center gap-3 ${
            isDark ? 'border-[#7B694E]/30 bg-[#280B0F]' : 'border-[#F7C8D3]/40 bg-white'
          }`}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask AI assistant about your notes, schedule, or study topics..."
            className={`flex-1 px-4 py-3 rounded-2xl border text-sm focus:outline-none transition-all ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40 text-white placeholder-[#C6B39A]/50 focus:border-[#B46A72]'
                : 'bg-[#FFF5F6]/40 border-[#F7C8D3] text-[#2D3A47] placeholder-[#2D3A47]/40 focus:border-[#B46A72]'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isGenerating}
            className="px-6 py-3 rounded-2xl bg-[#B46A72] text-white font-semibold text-sm shadow-md hover:bg-[#A05563] disabled:opacity-50 transition-all flex items-center gap-2"
          >
            <span>Send</span>
            <Send size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}
