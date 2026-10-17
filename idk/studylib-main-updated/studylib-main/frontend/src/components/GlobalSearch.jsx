import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, ListTodo, BookOpen, CalendarDays, Command } from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';

export default function GlobalSearch({ open, onClose }) {
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [topics, setTopics] = useState([]);
  useEffect(() => {
    if (!open) return;
    setQuery('');
    Promise.all([api.getSubjects(), api.getAllTopics()]).then(([s, t]) => { setSubjects(s); setTopics(t); }).catch(() => {});
  }, [open]);
  useEffect(() => {
    if (!open) return undefined;
    const handler = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const subjectResults = subjects.filter(s => s.name.toLowerCase().includes(q)).map(s => ({ id: `subject-${s.id}`, title: s.name, detail: 'Subject', icon: BookOpen, action: () => navigate(`/notes?subjectId=${encodeURIComponent(s.id)}`) }));
    const topicResults = topics.filter(t => `${t.title||''} ${(t.tags||[]).join(' ')} ${t.note||''}`.toLowerCase().includes(q)).map(t => ({ id: `topic-${t.id}`, title: t.title, detail: `Topic${t.subject_id ? ` · ${subjects.find(s => s.id === t.subject_id)?.name || 'Subject'}` : ''}`, icon: FileText, action: () => navigate(`/subjects/${t.subject_id}/topics/${t.id}`) }));
    const nav = [{id:'nav-todo',title:'Todo and tasks',detail:'Open page',icon:ListTodo,path:'/todo'},{id:'nav-schedule',title:'Schedule and calendar',detail:'Open page',icon:CalendarDays,path:'/schedule'},{id:'nav-plan',title:'Exam preparation and study plan',detail:'Open page',icon:CalendarDays,path:'/study-plan'},{id:'nav-analytics',title:'Study dashboard and analytics',detail:'Open page',icon:Command,path:'/study-dashboard'},{id:'nav-flashcards',title:'Flashcards and quizzes',detail:'Open page',icon:BookOpen,path:'/flashcards'}].filter(item=>item.title.toLowerCase().includes(q)).map(item=>({...item,action:()=>navigate(item.path)}));
    return [...nav, ...subjectResults, ...topicResults].slice(0, 12);
  }, [query, subjects, topics, navigate]);
  if (!open) return null;
  return <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/45 px-4 pt-[12vh]" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <div className={`w-full max-w-2xl overflow-hidden rounded-2xl border shadow-2xl ${isDark ? 'bg-[#280B0F] border-[#7B694E]/50 text-[#F7EFE6]' : 'bg-white border-[#F7C8D3] text-[#2D3A47]'}`} role="dialog" aria-modal="true" aria-label="Search your study library">
      <div className="flex items-center gap-3 border-b border-inherit px-4 py-4"><Search size={20} className="text-[#B46A72]"/><input autoFocus value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search subjects, topics, tasks, and pages…" className="min-w-0 flex-1 bg-transparent text-base outline-none"/><kbd className="hidden rounded border px-2 py-1 text-xs opacity-60 sm:block">ESC</kbd><button onClick={onClose} aria-label="Close search" className="rounded-lg p-1.5 opacity-60 hover:opacity-100"><X size={18}/></button></div>
      <div className="max-h-[55vh] overflow-y-auto p-2">{!query.trim()?<div className="px-4 py-8 text-center"><Search size={25} className="mx-auto mb-3 text-[#B46A72]"/><p className="font-semibold">Search your study library</p><p className="mt-1 text-sm opacity-60">Try a subject name, chapter, or “study plan”.</p></div>:results.length===0?<p className="px-4 py-8 text-center text-sm opacity-60">No matching results. Try another keyword.</p>:results.map(result=>{const Icon=result.icon;return <button key={result.id} onClick={()=>{result.action();onClose()}} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors ${isDark?'hover:bg-[#3B1319]':'hover:bg-[#FFF5F6]'}`}><span className="rounded-lg bg-[#B46A72]/15 p-2 text-[#B46A72]"><Icon size={17}/></span><span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold">{result.title}</span><span className="mt-0.5 block text-xs opacity-60">{result.detail}</span></span><span className="text-xs opacity-40">↵</span></button>})}</div>
      <div className={`flex items-center justify-between border-t border-inherit px-4 py-3 text-xs opacity-60`}><span>Search across your local study library</span><span>Ctrl K / ⌘ K</span></div>
    </div>
  </div>;
}
