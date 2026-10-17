import { useState, useEffect } from 'react';
import {
  FileText,
  Save,
  CheckCircle2,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

export default function StandaloneNotesPage() {
  const { isDark } = useTheme();
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState('');

  const [noteTitle, setNoteTitle] = useState('Untitled Lecture Note');
  const [noteContent, setNoteContent] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

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
        if (data.length > 0) {
          setSelectedTopicId(data[0].id);
        } else {
          setSelectedTopicId('');
        }
      });
    }
  }, [selectedSubjectId]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }, 800);
  };

  const handleGenerateAI = () => {
    setNoteContent((prev) => prev + '\n\n### AI Summary & Key Takeaways\n- Focus on core conceptual definitions and practical examples.\n- Review associated flashcards and quiz questions.');
  };

  return (
    <div className="p-8 max-w-[1400px] mx-auto min-h-screen">
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
              Notes Studio
            </span>
          </div>
          <h1 className="font-display text-3xl font-bold mb-1">Standalone Lecture Notes</h1>
          <p className="text-sm opacity-70">
            Draft, edit, and enrich your study materials with AI-powered summaries and topic organization.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleGenerateAI}
            className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center gap-2 ${
              isDark
                ? 'bg-[#7B694E]/30 text-[#C6B39A] hover:bg-[#7B694E]/50'
                : 'bg-[#F7C8D3]/40 text-[#B46A72] hover:bg-[#F7C8D3]/60'
            }`}
          >
            <Sparkles size={16} />
            Enhance with AI
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2.5 rounded-xl bg-[#B46A72] text-white font-semibold text-sm shadow-sm hover:bg-[#A05563] transition-all flex items-center gap-2"
          >
            {saving ? (
              'Saving...'
            ) : savedSuccess ? (
              <>
                <CheckCircle2 size={16} />
                Saved Successfully
              </>
            ) : (
              <>
                <Save size={16} />
                Save Note
              </>
            )}
          </button>
        </div>
      </div>

      {/* Editor & Selectors Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Settings */}
        <div className="lg:col-span-1 space-y-6">
          <div
            className={`p-5 rounded-3xl border ${
              isDark ? 'bg-[#3B1319] border-[#7B694E]/45' : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-[#B46A72]" />
              Note Associations
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-70">Subject</label>
                <select
                  value={selectedSubjectId}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                      : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
                  }`}
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-70">Topic / Lecture</label>
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                    isDark
                      ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                      : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
                  }`}
                >
                  {topics.map((top) => (
                    <option key={top.id} value={top.id}>
                      {top.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Editor Canvas */}
        <div className="lg:col-span-3">
          <div
            className={`p-6 rounded-3xl border shadow-sm ${
              isDark ? 'bg-[#3B1319] border-[#7B694E]/45' : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <div className="mb-4">
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                className={`w-full font-display text-2xl font-bold bg-transparent border-b pb-2 focus:outline-none ${
                  isDark ? 'border-[#7B694E]/40 text-[#F7EFE6]' : 'border-[#F7C8D3]/60 text-[#2D3A47]'
                }`}
              />
            </div>

            <textarea
              rows="16"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="Start typing your comprehensive study notes here..."
              className={`w-full p-4 rounded-2xl border text-sm font-mono leading-relaxed transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-[#4A1A22]/50 border-[#7B694E]/40 text-[#F7EFE6] placeholder:text-[#C6B39A]/40 focus:border-[#C6B39A]'
                  : 'bg-gray-50/50 border-[#F7C8D3]/60 text-[#2D3A47] placeholder:text-[#2D3A47]/40 focus:border-[#B46A72]'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
