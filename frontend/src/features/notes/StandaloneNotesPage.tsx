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
import type { Subject, Topic } from '@/types';

export default function StandaloneNotesPage() {
  const { isDark } = useTheme();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopicId, setSelectedTopicId] = useState<string>('');

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
      api.getTopics(selectedSubjectId).then((topicList) => {
        setTopics(topicList);
        if (topicList.length > 0) {
          setSelectedTopicId(topicList[0].id);
          setNoteTitle(topicList[0].title);
        } else {
          setSelectedTopicId('');
          setNoteTitle('New Chapter Note');
        }
      });
    } else {
      setTopics([]);
      setSelectedTopicId('');
    }
  }, [selectedSubjectId]);

  const handleSaveNote = async () => {
    if (!selectedTopicId) return;
    setSaving(true);
    try {
      await api.saveDigitalNote(selectedTopicId, {
        title: noteTitle,
        text: noteContent,
        updated_at: new Date().toISOString(),
      });
      setSaving(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to save note:', err);
      setSaving(false);
    }
  };

  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const selectedTopic = topics.find((t) => t.id === selectedTopicId);

  return (
    <div
      className={`min-h-screen flex flex-col ${
        isDark ? 'bg-[#280B0F] text-[#F7EFE6]' : 'bg-[var(--color-bg-base)] text-[#2D3A47]'
      }`}
    >
      {/* Top Bar */}
      <header
        className={`flex items-center justify-between px-8 py-5 border-b ${
          isDark ? 'border-[#7B694E]/30 bg-[#3B1319]' : 'border-[#F7C8D3]/60 bg-white'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#B46A72] text-white flex items-center justify-center shrink-0 shadow-sm">
            <FileText size={20} />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Class Notes Scratchpad</h1>
            <p className="text-xs opacity-60">Write, organize, and sync notes directly into subject chapter index</p>
          </div>
        </div>

        <button
          onClick={handleSaveNote}
          disabled={!selectedTopicId || saving}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B46A72] text-white font-semibold text-sm shadow-sm hover:bg-[#A05563] transition-all disabled:opacity-50"
        >
          {saving ? (
            <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
          ) : savedSuccess ? (
            <CheckCircle2 size={16} />
          ) : (
            <Save size={16} />
          )}
          {savedSuccess ? 'Saved to Chapter!' : 'Save Note'}
        </button>
      </header>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Selector Sidebar */}
        <aside
          className={`w-80 shrink-0 border-r p-6 space-y-6 overflow-y-auto ${
            isDark ? 'border-[#7B694E]/30 bg-[#280B0F]' : 'border-[#F7C8D3]/40 bg-[#FFF5F6]'
          }`}
        >
          <div>
            <label className="block text-xs font-bold uppercase opacity-60 mb-2">Select Subject</label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium focus:outline-none ${
                isDark ? 'bg-[#3B1319] border-[#7B694E]/40 text-white' : 'bg-white border-[#F7C8D3]'
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
            <label className="block text-xs font-bold uppercase opacity-60 mb-2">Select Chapter / Index Topic</label>
            {topics.length === 0 ? (
              <p className="text-xs opacity-50 italic">No topics available for this subject.</p>
            ) : (
              <div className="space-y-1.5 max-h-[calc(100vh-320px)] overflow-y-auto pr-1">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    onClick={() => {
                      setSelectedTopicId(topic.id);
                      setNoteTitle(topic.title);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-all text-xs font-medium flex items-center gap-3 ${
                      selectedTopicId === topic.id
                        ? 'bg-[#B46A72] text-white border-transparent shadow-sm'
                        : isDark
                        ? 'bg-[#3B1319] border-[#7B694E]/30 text-[#C6B39A] hover:bg-[#7B694E]/20'
                        : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] hover:bg-[#F7C8D3]/20'
                    }`}
                  >
                    <span className="w-6 h-6 rounded-lg bg-black/10 flex items-center justify-center font-bold shrink-0">
                      #{topic.serial_number}
                    </span>
                    <span className="truncate flex-1">{topic.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {selectedSubject && selectedTopic && (
            <div
              className={`p-4 rounded-2xl border text-xs space-y-2 ${
                isDark ? 'bg-[#3B1319]/50 border-[#7B694E]/30 text-[#C6B39A]' : 'bg-white/60 border-[#F7C8D3] text-[#2D3A47]'
              }`}
            >
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles size={14} className="text-[#B46A72]" />
                <span>Sync Destination</span>
              </div>
              <p className="opacity-80">
                Notes will be saved under <strong>{selectedSubject.name}</strong> &gt; Index #{selectedTopic.serial_number}: {selectedTopic.title}.
              </p>
            </div>
          )}
        </aside>

        {/* Editor Area */}
        <div className="flex-1 flex flex-col p-8 overflow-y-auto">
          <div className="max-w-4xl w-full mx-auto space-y-6">
            <div>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Note Title / Chapter Header..."
                className={`w-full px-4 py-3 rounded-2xl border font-display text-2xl font-bold focus:outline-none ${
                  isDark
                    ? 'bg-[#3B1319] border-[#7B694E]/40 text-white placeholder:text-[#C6B39A]/40'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] placeholder:text-[#2D3A47]/40'
                }`}
              />
            </div>

            <div
              className={`rounded-2xl border flex-1 flex flex-col shadow-sm overflow-hidden ${
                isDark ? 'bg-[#3B1319] border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]/60'
              }`}
            >
              <div
                className={`flex items-center justify-between px-4 py-3 border-b text-xs font-semibold ${
                  isDark ? 'border-[#7B694E]/30 bg-[#280B0F]/50' : 'border-[#F7C8D3]/40 bg-[#FFF5F6]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BookOpen size={16} className="opacity-60" />
                  <span>Notion-style Markdown / Rich Notes Editor</span>
                </div>
                <span className="opacity-50">Auto-sync enabled</span>
              </div>

              <textarea
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Type your lecture notes, summaries, formulas, or key insights here... Press Save Note to instantly sync them to your chapter index."
                rows={18}
                className={`w-full p-6 text-sm leading-relaxed focus:outline-none resize-none ${
                  isDark ? 'bg-transparent text-[#F7EFE6] placeholder:text-[#C6B39A]/40' : 'bg-transparent text-[#2D3A47] placeholder:text-[#2D3A47]/40'
                }`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
