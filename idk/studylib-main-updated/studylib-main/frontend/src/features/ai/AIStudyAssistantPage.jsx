import { useState, useEffect } from 'react';
import {
  Sparkles,
  Bot,
  Send,
  Lightbulb,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { api } from '@/lib/api';

export default function AIAssistantPage() {
  const { isDark } = useTheme();
  const [messages, setMessages] = useState([
    {
      id: '1',
      sender: 'ai',
      text: "Hello! I'm your AI Study & Note Assistant (Version 2). Ask me anything about your notes, schedule, or request help summarizing topics and generating checklists!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [, setTopics] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    api.getSubjects().then((data) => {
      setSubjects(data);
      if (data.length > 0) {
        setSelectedSubjectId(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (selectedSubjectId) {
      api.getTopics(selectedSubjectId).then((data) => {
        setTopics(data);
      });
    }
  }, [selectedSubjectId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      id: 'msg-' + Date.now(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    const query = input;
    setInput('');
    setIsGenerating(true);

    setTimeout(() => {
      let aiResponseText = `I analyzed your question regarding "${query}". Based on your study materials and notes library, here is a structured breakdown:\n\n1. Core Concepts & Principles\n2. Key Formulas & Definitions\n3. Recommended Practice Review`;
      if (query.toLowerCase().includes('summary') || query.toLowerCase().includes('summarize')) {
        aiResponseText = `Here is your requested AI Summary:\n\n- The primary study module focuses on hierarchical subject structures and active recall.\n- Subtopics allow granular breakdowns with decimal indices (e.g., 1.1, 1.2).\n- Make sure to review flashcards associated with this section.`;
      }

      const aiMsg = {
        id: 'msg-' + (Date.now() + 1),
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 1000);
  };

  const handleQuickPrompt = (promptText) => {
    setInput(promptText);
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen flex flex-col">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-3xl mb-8 border flex items-center justify-between ${
          isDark
            ? 'bg-gradient-to-r from-[#3B1319] via-[#4A1A22] to-[#3B1319] border-[#7B694E]/40 text-[#F7EFE6]'
            : 'bg-gradient-to-r from-[#FFF6F8] via-[#FFF0F3] to-[#FFF6F8] border-[#F7C8D3]/60 text-[#2D3A47]'
        }`}
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                isDark ? 'bg-[#7B694E]/30 text-[#C6B39A]' : 'bg-[#F7C8D3]/40 text-[#B46A72]'
              }`}
            >
              AI Assistant V2
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-1">AI Study Assistant</h1>
          <p className="text-sm opacity-70">
            Ask questions, summarize lectures, and brainstorm study plans with intelligent context.
          </p>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <div
            className={`px-4 py-3 rounded-2xl border text-center ${
              isDark ? 'bg-[#3B1319] border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <div className="text-2xl font-bold font-display text-[#B46A72] flex items-center justify-center gap-1">
              <Sparkles size={20} />
              Ready
            </div>
            <div className="text-xs opacity-60">LLM Status</div>
          </div>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 flex-1">
        {/* Sidebar Suggestions */}
        <div className="lg:col-span-1 space-y-6">
          <div
            className={`p-5 rounded-3xl border ${
              isDark ? 'bg-[#3B1319] border-[#7B694E]/45' : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <Lightbulb size={16} className="text-[#B46A72]" />
              Quick Prompts
            </h3>

            <div className="space-y-2.5">
              {[
                'Summarize my notes for this subject',
                'Generate 5 flashcards on current topic',
                'Create a weekly study checklist',
                'Explain complex terms in simple words',
              ].map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickPrompt(prompt)}
                  className={`w-full text-left p-3 rounded-2xl border text-xs font-medium transition-all ${
                    isDark
                      ? 'bg-[#4A1A22]/50 border-[#7B694E]/30 hover:border-[#C6B39A] text-[#F7EFE6]'
                      : 'bg-[#FFF6F8] border-[#F7C8D3]/50 hover:border-[#B46A72] text-[#2D3A47]'
                  }`}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Conversation Canvas */}
        <div className="lg:col-span-3 flex flex-col">
          <div
            className={`flex-1 p-6 rounded-3xl border flex flex-col justify-between shadow-sm min-h-[600px] ${
              isDark ? 'bg-[#3B1319] border-[#7B694E]/45' : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            {/* Messages Feed */}
            <div className="space-y-4 mb-6 overflow-y-auto max-h-[500px] pr-2">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                >
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                      msg.sender === 'user'
                        ? 'bg-[#B46A72] text-white font-bold text-xs'
                        : isDark
                        ? 'bg-[#7B694E]/30 text-[#C6B39A]'
                        : 'bg-[#F7C8D3]/40 text-[#B46A72]'
                    }`}
                  >
                    {msg.sender === 'user' ? 'U' : <Bot size={18} />}
                  </div>

                  <div>
                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-[#B46A72] text-white rounded-tr-none'
                          : isDark
                          ? 'bg-[#4A1A22] border border-[#7B694E]/30 text-[#F7EFE6] rounded-tl-none'
                          : 'bg-[#FFF6F8] border border-[#F7C8D3]/50 text-[#2D3A47] rounded-tl-none'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <div className={`text-[10px] opacity-50 mt-1 px-1 ${msg.sender === 'user' ? 'text-right' : ''}`}>
                      {msg.timestamp}
                    </div>
                  </div>
                </div>
              ))}

              {isGenerating && (
                <div className="flex gap-3 items-center">
                  <div className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${isDark ? 'bg-[#7B694E]/30 text-[#C6B39A]' : 'bg-[#F7C8D3]/40 text-[#B46A72]'}`}>
                    <Bot size={18} />
                  </div>
                  <div className={`p-4 rounded-2xl text-sm italic opacity-70 ${isDark ? 'bg-[#4A1A22]' : 'bg-[#FFF6F8]'}`}>
                    AI is thinking and reviewing your study library...
                  </div>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-3 pt-4 border-t border-inherit">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask AI anything about your notes or study schedule..."
                className={`flex-1 px-4 py-3 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] placeholder:text-[#C6B39A]/40 focus:border-[#C6B39A]'
                    : 'bg-gray-50 border-[#F7C8D3]/60 text-[#2D3A47] placeholder:text-[#2D3A47]/40 focus:border-[#B46A72]'
                }`}
              />
              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-[#B46A72] text-white font-semibold text-sm shadow-sm hover:bg-[#A05563] transition-all flex items-center gap-2 shrink-0"
              >
                <Send size={16} />
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
