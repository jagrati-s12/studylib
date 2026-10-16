import { useState, useEffect, useMemo } from 'react';
import {
  Plus,
  Search,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  FileText,
  ListTodo,
  Trash2,
  Edit2,
  X,
  Tag,
  Target,
  Zap,
  Layers,
  BookOpen,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import type { Topic, TopicStatus, ChecklistItem } from '@/types';

type TodoCategory = 'projects' | 'goals' | 'habits' | 'categories' | 'study';
type TimeView = 'all' | 'day' | 'week' | 'month';

// Color palette from your design
const SUBJECT_COLORS = {
  fern: '#768E78',
  pistachio: '#C6C09C',
  fennel: '#EBDEC0',
  cherryBlossom: '#FECDBE',
  peony: '#E79897',
  bluebell: '#B7CBDB',
  honey: '#FCC88A',
  clockwork: '#72583E',
  cedar: '#7C7960',
  latte: '#DBC4A5',
  deepOlive: '#44422D',
  mauve: '#755151',
  weathered: '#A08670',
  linen: '#FFF9F3',
  cafeNoir: '#443223',
  deepOlive2: '#444D2D',
};

interface TodoItem extends Topic {
  category?: TodoCategory;
  subjectLink?: string;
  subjectColor?: string;
}

const CATEGORY_CONFIG = {
  projects: { icon: Layers, label: 'Projects', color: '#72583E' },
  goals: { icon: Target, label: 'Goals', color: '#B46A72' },
  habits: { icon: Zap, label: 'Habits', color: '#A8B58A' },
  categories: { icon: Tag, label: 'Categories', color: '#7C7960' },
  study: { icon: BookOpen, label: 'What to Study', color: '#768E78' },
};

const STATUS_SECTIONS = [
  { key: 'todo', label: 'Pending', icon: Clock, color: '#B46A72' },
  { key: 'in_progress', label: 'In Progress', icon: AlertCircle, color: '#A9B7C6' },
  { key: 'done', label: 'Completed', icon: CheckCircle2, color: '#A8B58A' },
] as const;

const getTodayStr = () => new Date().toISOString().split('T')[0];

const isToday = (dateStr?: string) => {
  if (!dateStr) return false;
  return dateStr === getTodayStr();
};

const isThisWeek = (dateStr?: string) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  const diffTime = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 7;
};

const isThisMonth = (dateStr?: string) => {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};

export default function EnhancedTodoPage() {
  const { isDark } = useTheme();
  const [allTopics, setAllTopics] = useState<TodoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = useState<TodoCategory | 'all'>('all');
  const [activeTimeView, setActiveTimeView] = useState<TimeView>('all');
  const [showNewTodoModal, setShowNewTodoModal] = useState(false);
  const [editingTodo, setEditingTodo] = useState<TodoItem | null>(null);

  useEffect(() => {
    api.getAllTopics().then((data) => {
      setAllTopics(data as TodoItem[]);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let items = allTopics;

    if (activeCategory !== 'all') {
      items = items.filter((t) => t.category === activeCategory);
    }

    if (activeTimeView === 'day') {
      items = items.filter((t) => isToday(t.due_date));
    } else if (activeTimeView === 'week') {
      items = items.filter((t) => isThisWeek(t.due_date));
    } else if (activeTimeView === 'month') {
      items = items.filter((t) => isThisMonth(t.due_date));
    }

    if (!searchQuery) return items;
    const q = searchQuery.toLowerCase();
    return items.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
        t.note?.toLowerCase().includes(q)
    );
  }, [allTopics, searchQuery, activeCategory, activeTimeView]);

  // Group by status
  const statusGroups = useMemo(() => {
    const groups = {
      todo: filtered.filter((t) => t.status === 'todo' || !t.status),
      in_progress: filtered.filter((t) => t.status === 'in_progress'),
      done: filtered.filter((t) => t.status === 'done'),
    };
    return groups;
  }, [filtered]);

  const toggleExpand = (id: string) => {
    setExpandedTodos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  async function handleChecklistToggle(topicId: string, checklistItemId: string) {
    const topic = allTopics.find((t) => t.id === topicId);
    if (!topic || !topic.checklist) return;

    const updatedChecklist = topic.checklist.map((item) =>
      item.id === checklistItemId ? { ...item, completed: !item.completed } : item
    );
    const completedCount = updatedChecklist.filter((i) => i.completed).length;
    const newProgress = updatedChecklist.length > 0 ? Math.round((completedCount / updatedChecklist.length) * 100) : topic.progress;

    try {
      await api.updateTopic(topicId, {
        checklist: updatedChecklist,
        progress: newProgress,
      });
      setAllTopics((prev) =>
        prev.map((t) =>
          t.id === topicId
            ? { ...t, checklist: updatedChecklist, progress: newProgress }
            : t
        )
      );
    } catch (err) {
      console.error('Failed to update checklist:', err);
    }
  }

  async function handleDeleteTodo(topicId: string) {
    try {
      await api.deleteTopic(topicId);
      setAllTopics((prev) => prev.filter((t) => t.id !== topicId));
    } catch (err) {
      console.error('Failed to delete todo:', err);
    }
  }

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const statusCounts = {
    todo: filtered.filter((t) => t.status === 'todo' || !t.status).length,
    in_progress: filtered.filter((t) => t.status === 'in_progress').length,
    done: filtered.filter((t) => t.status === 'done').length,
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        isDark ? 'bg-[#280B0F] text-[#F7EFE6]' : 'bg-[var(--color-bg-base)] text-[#2D3A47]'
      }`}
    >
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-display text-4xl font-bold mb-2">Todo</h1>
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${
                isDark
                  ? 'bg-[#3B1319] text-[#C6B39A] border border-[#7B694E]/40'
                  : 'bg-[#F7C8D3]/30 text-[#2D3A47] border border-[#F7C8D3]'
              }`}
            >
              <Calendar size={14} />
              <span>Today is {dateStr}</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowNewTodoModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B46A72] text-white font-semibold text-sm shadow-sm hover:bg-[#A05563] transition-all"
          >
            <Plus size={16} />
            New Todo
          </button>
        </div>

        {/* Time View Filter Tabs (All | Day | Week | Month) */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="text-xs font-bold uppercase opacity-60 mr-2">View Range:</span>
          {(['all', 'day', 'week', 'month'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveTimeView(view)}
              className={`px-4 py-2 rounded-xl font-medium text-xs capitalize transition-all ${
                activeTimeView === view
                  ? 'bg-[#B46A72] text-white shadow-sm font-semibold'
                  : isDark
                  ? 'bg-[#3B1319] text-[#C6B39A] hover:bg-[#3B1319]/80'
                  : 'bg-[#F7C8D3]/30 text-[#2D3A47] hover:bg-[#F7C8D3]/50'
              }`}
            >
              {view === 'all' ? 'All Time' : `${view.charAt(0).toUpperCase() + view.slice(1)} View`}
            </button>
          ))}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all ${
              activeCategory === 'all'
                ? 'bg-[#B46A72] text-white'
                : isDark
                ? 'bg-[#3B1319] text-[#C6B39A] hover:bg-[#3B1319]/80'
                : 'bg-[#F7C8D3]/30 text-[#2D3A47] hover:bg-[#F7C8D3]/50'
            }`}
          >
            All Categories
          </button>
          {(Object.keys(CATEGORY_CONFIG) as TodoCategory[]).map((cat) => {
            const config = CATEGORY_CONFIG[cat];
            const Icon = config.icon;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-full font-medium whitespace-nowrap transition-all flex items-center gap-2 ${
                  activeCategory === cat
                    ? 'text-white'
                    : isDark
                    ? 'bg-[#3B1319] text-[#C6B39A] hover:bg-[#3B1319]/80'
                    : 'bg-[#F7C8D3]/30 text-[#2D3A47] hover:bg-[#F7C8D3]/50'
                }`}
                style={activeCategory === cat ? { backgroundColor: config.color } : {}}
              >
                <Icon size={14} />
                {config.label}
              </button>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-6">
          {STATUS_SECTIONS.map((section) => (
            <div
              key={section.key}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 ${
                isDark
                  ? 'bg-[#3B1319] border-[#7B694E]/40'
                  : 'bg-white border-[#F7C8D3]/60'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: section.color }}
              />
              <span className="text-sm font-semibold">{section.label}</span>
              <span className="text-lg font-bold">{statusCounts[section.key]}</span>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search
            size={18}
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${
              isDark ? 'text-[#C6B39A]/50' : 'text-[#2D3A47]/40'
            }`}
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search todos..."
            className={`w-full pl-12 pr-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40 text-[#F7EFE6] placeholder:text-[#C6B39A]/50 focus:border-[#C6B39A] focus:ring-[#C6B39A]/20'
                : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] placeholder:text-[#2D3A47]/40 focus:border-[#B46A72] focus:ring-[#B46A72]/20'
            }`}
          />
        </div>
      </header>

      {/* Status-wise Grouped Todos - Vertical Layout */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className={`h-24 rounded-2xl animate-pulse ${
                isDark ? 'bg-[#3B1319]' : 'bg-white'
              }`}
            />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 ${
            isDark
              ? 'border-[#7B694E]/40 bg-[#3B1319]/30'
              : 'border-[#F7C8D3] bg-white/50'
          }`}
        >
          <ListTodo size={48} className="opacity-40 mb-4" />
          <p className="font-semibold mb-1">No todos found</p>
          <p className="text-sm opacity-60">Try changing your filters or create a new todo</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-6 min-h-[600px]">
          {STATUS_SECTIONS.map((section) => {
            const topics = statusGroups[section.key];

            return (
              <div
                key={section.key}
                className={`rounded-2xl border p-5 flex flex-col ${
                  isDark
                    ? 'bg-[#3B1319] border-[#7B694E]/40'
                    : 'bg-white border-[#F7C8D3]/60'
                }`}
              >
                {/* Column Header */}
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-inherit">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${section.color}20` }}
                  >
                    {section.icon && <section.icon size={16} style={{ color: section.color }} />}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-lg font-bold">{section.label}</h2>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                      isDark
                        ? 'bg-[#7B694E]/40 text-[#C6B39A]'
                        : 'bg-[#F7C8D3]/40 text-[#B46A72]'
                    }`}
                  >
                    {topics.length}
                  </span>
                </div>

                {/* Column Content - Scrollable */}
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {topics.length === 0 ? (
                    <div
                      className={`flex flex-col items-center justify-center h-40 rounded-xl border-2 border-dashed ${
                        isDark
                          ? 'border-[#7B694E]/20 text-[#C6B39A]/50'
                          : 'border-[#F7C8D3]/30 text-[#2D3A47]/40'
                      }`}
                    >
                      <p className="text-sm font-medium">No tasks</p>
                    </div>
                  ) : (
                    topics.map((topic) => (
                      <TodoItemCard
                        key={topic.id}
                        topic={topic}
                        isDark={isDark}
                        expanded={expandedTodos.has(topic.id)}
                        onToggle={() => toggleExpand(topic.id)}
                        onChecklistToggle={handleChecklistToggle}
                        onDeleteTodo={handleDeleteTodo}
                        onEditTodo={setEditingTodo}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New/Edit Todo Modal */}
      {(showNewTodoModal || editingTodo) && (
        <TodoModal
          isDark={isDark}
          todo={editingTodo}
          onClose={() => {
            setShowNewTodoModal(false);
            setEditingTodo(null);
          }}
          onSave={(todo) => {
            if (editingTodo) {
              setAllTopics((prev) =>
                prev.map((t) => (t.id === todo.id ? todo : t))
              );
            } else {
              setAllTopics((prev) => [todo, ...prev]);
            }
            setShowNewTodoModal(false);
            setEditingTodo(null);
          }}
          categories={CATEGORY_CONFIG}
          subjectColors={SUBJECT_COLORS}
        />
      )}
    </div>
  );
}

interface TodoItemCardProps {
  topic: TodoItem;
  isDark: boolean;
  expanded: boolean;
  onToggle: () => void;
  onChecklistToggle: (topicId: string, checklistItemId: string) => void;
  onDeleteTodo: (topicId: string) => void;
  onEditTodo: (todo: TodoItem) => void;
}

function TodoItemCard({
  topic,
  isDark,
  expanded,
  onToggle,
  onChecklistToggle,
  onDeleteTodo,
  onEditTodo,
}: TodoItemCardProps) {
  const getStatusConfig = (status: TopicStatus) => {
    switch (status) {
      case 'todo':
        return { icon: Clock, color: '#B46A72', label: 'Pending' };
      case 'in_progress':
        return { icon: AlertCircle, color: '#A9B7C6', label: 'In Progress' };
      case 'in_review':
        return { icon: Clock, color: '#A8B58A', label: 'In Review' };
      case 'done':
        return { icon: CheckCircle2, color: '#A8B58A', label: 'Completed' };
    }
  };

  const statusConfig = getStatusConfig(topic.status || 'todo');
  const categoryConfig = topic.category ? CATEGORY_CONFIG[topic.category] : null;
  const CategoryIcon = categoryConfig?.icon;
  const subjectColor = topic.subjectColor || categoryConfig?.color;

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isDark
          ? 'bg-[#3B1319] border-[#7B694E]/40 hover:border-[#C6B39A]/60'
          : 'bg-white border-[#F7C8D3]/60 hover:border-[#B46A72]/40'
      } ${expanded ? 'shadow-lg' : 'hover:shadow-md'}`}
      style={subjectColor ? { borderLeftWidth: '4px', borderLeftColor: subjectColor } : {}}
    >
      {/* Main row */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-sm truncate">{topic.title}</h4>
            {categoryConfig && CategoryIcon && (
              <div
                className="px-2 py-0.5 rounded-full flex items-center gap-1 text-[10px] font-semibold"
                style={{
                  backgroundColor: `${categoryConfig.color}20`,
                  color: categoryConfig.color,
                }}
              >
                <CategoryIcon size={12} />
                {categoryConfig.label}
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2 mt-1">
            {topic.due_date && (
              <span
                className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                  isDark ? 'bg-[#280B0F] text-[#C6B39A]' : 'bg-[#F7C8D3]/35 text-[#B46A72]'
                }`}
              >
                <Calendar size={11} />
                Due: {topic.due_date}
              </span>
            )}
            {topic.tags && topic.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {topic.tags.slice(0, 2).map((tag, idx) => (
                  <span
                    key={idx}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      isDark
                        ? 'bg-[#7B694E]/40 text-[#C6B39A]'
                        : 'bg-[#F7C8D3]/40 text-[#B46A72]'
                    }`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Progress */}
        {topic.progress !== undefined && topic.progress > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-16 h-1.5 rounded-full overflow-hidden ${
                isDark ? 'bg-[#280B0F]' : 'bg-[#F7C8D3]/30'
              }`}
            >
              <div
                className="h-full bg-[#A8B58A] rounded-full transition-all"
                style={{ width: `${topic.progress}%` }}
              />
            </div>
            <span className="text-[10px] font-bold opacity-60">{topic.progress}%</span>
          </div>
        )}

        {expanded ? (
          <ChevronDown size={16} className="opacity-40 shrink-0" />
        ) : (
          <ChevronRight size={16} className="opacity-40 shrink-0" />
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div
          className={`px-4 pb-4 border-t ${
            isDark ? 'border-[#7B694E]/30' : 'border-[#F7C8D3]/40'
          }`}
        >
          <div className="pt-3 space-y-3">
            <div className="flex items-center gap-4 text-xs opacity-70">
              <span
                className="px-2 py-0.5 rounded-full font-semibold capitalize"
                style={{
                  backgroundColor: `${statusConfig.color}20`,
                  color: statusConfig.color,
                }}
              >
                {statusConfig.label}
              </span>
              <span>Updated {new Date(topic.updated_at).toLocaleDateString()}</span>
            </div>

            {topic.note && (
              <div
                className={`p-3 rounded-xl text-xs leading-relaxed flex items-start gap-2 ${
                  isDark
                    ? 'bg-[#280B0F]/60 text-[#C6B39A]/90 border border-[#7B694E]/30'
                    : 'bg-[#F7C8D3]/10 text-[#2D3A47]/80 border border-[#F7C8D3]/40'
                }`}
              >
                <FileText size={14} className="shrink-0 mt-0.5 opacity-60" />
                <div>
                  <span className="font-semibold">Note:</span> {topic.note}
                </div>
              </div>
            )}

            {/* Checklist */}
            {topic.checklist && topic.checklist.length > 0 && (
              <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
                <p className="text-xs font-bold opacity-60">Checklist</p>
                {topic.checklist.map((item) => (
                  <label
                    key={item.id}
                    className="flex items-start gap-2 cursor-pointer group text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => onChecklistToggle(topic.id, item.id)}
                      className="mt-0.5 w-3.5 h-3.5 rounded accent-[#A8B58A] cursor-pointer"
                    />
                    <span
                      className={`flex-1 ${
                        item.completed
                          ? 'line-through opacity-60'
                          : isDark
                          ? 'group-hover:text-[#C6B39A]'
                          : 'group-hover:text-[#B46A72]'
                      }`}
                    >
                      {item.text}
                    </span>
                  </label>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => onEditTodo(topic)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  isDark
                    ? 'bg-[#7B694E]/30 text-[#C6B39A] hover:bg-[#7B694E]/50'
                    : 'bg-[#F7C8D3]/30 text-[#B46A72] hover:bg-[#F7C8D3]/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Edit2 size={12} />
                  Edit
                </span>
              </button>
              <button
                type="button"
                onClick={() => onDeleteTodo(topic.id)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  isDark
                    ? 'bg-[#7B694E]/30 text-[#C6B39A] hover:bg-red-500/20 hover:text-red-400'
                    : 'bg-[#F7C8D3]/30 text-[#B46A72] hover:bg-red-100 hover:text-red-600'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Trash2 size={12} />
                  Delete
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TodoModalProps {
  isDark: boolean;
  todo: TodoItem | null;
  onClose: () => void;
  onSave: (todo: TodoItem) => void;
  categories: typeof CATEGORY_CONFIG;
  subjectColors: typeof SUBJECT_COLORS;
}

function TodoModal({
  isDark,
  todo,
  onClose,
  onSave,
  categories,
  subjectColors,
}: TodoModalProps) {
  const [title, setTitle] = useState(todo?.title || '');
  const [category, setCategory] = useState<TodoCategory>(todo?.category || 'projects');
  const [status, setStatus] = useState<TopicStatus>(todo?.status || 'todo');
  const [dueDate, setDueDate] = useState(todo?.due_date || '');
  const [note, setNote] = useState(todo?.note || '');
  const [subjectColor, setSubjectColor] = useState(todo?.subjectColor || Object.values(subjectColors)[0]);
  const [tags, setTags] = useState<string[]>(todo?.tags || []);
  const [tagInput, setTagInput] = useState('');
  const [checklist, setChecklist] = useState<ChecklistItem[]>(todo?.checklist || []);
  const [checklistItemInput, setChecklistItemInput] = useState('');

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleAddChecklistItem = () => {
    if (checklistItemInput.trim()) {
      setChecklist([
        ...checklist,
        { id: `c-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, text: checklistItemInput.trim(), completed: false },
      ]);
      setChecklistItemInput('');
    }
  };

  const handleRemoveChecklistItem = (id: string) => {
    setChecklist(checklist.filter((item) => item.id !== id));
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    const completedCount = checklist.filter((i) => i.completed).length;
    const progress = checklist.length > 0 ? Math.round((completedCount / checklist.length) * 100) : (status === 'done' ? 100 : 0);

    const newTodo: TodoItem = {
      id: todo?.id || Date.now().toString(),
      subject_id: todo?.subject_id || 'default',
      serial_number: todo?.serial_number || 0,
      sort_order: todo?.sort_order || 0,
      title,
      category,
      status,
      note,
      subjectColor,
      tags,
      checklist,
      due_date: dueDate || undefined,
      progress,
      updated_at: new Date().toISOString(),
    };

    if (todo) {
      await api.updateTopic(todo.id, newTodo);
    } else {
      await api.createTopic(newTodo.subject_id || 'sub-1', {
        serial_number: newTodo.serial_number,
        title: newTodo.title,
        status: newTodo.status,
        tags: newTodo.tags,
        note: newTodo.note,
        checklist: newTodo.checklist,
        due_date: newTodo.due_date,
      });
    }

    onSave(newTodo);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-[#3B1319]' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 border-b ${
            isDark ? 'border-[#7B694E]/30' : 'border-[#F7C8D3]/40'
          }`}
        >
          <h2 className="text-xl font-bold">{todo ? 'Edit Todo' : 'Create New Todo'}</h2>
          <button
            type="button"
            onClick={onClose}
            className={`p-2 rounded-lg transition-colors ${
              isDark
                ? 'hover:bg-[#7B694E]/30 text-[#C6B39A]'
                : 'hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
            }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold mb-2">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter todo title"
              className={`w-full px-4 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-[#280B0F] border-[#7B694E]/40 text-[#F7EFE6] placeholder:text-[#C6B39A]/50 focus:border-[#C6B39A] focus:ring-[#C6B39A]/20'
                  : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] placeholder:text-[#2D3A47]/40 focus:border-[#B46A72] focus:ring-[#B46A72]/20'
              }`}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-semibold mb-2">Category</label>
            <div className="grid grid-cols-2 gap-2">
              {(Object.entries(categories) as [TodoCategory, typeof categories[TodoCategory]][]).map(
                ([cat, config]) => {
                  const Icon = config.icon;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={`p-3 rounded-xl border-2 text-left transition-all flex items-center gap-2 ${
                        category === cat
                          ? 'border-[#B46A72] bg-[#B46A72]/10'
                          : isDark
                          ? 'border-[#7B694E]/40 hover:border-[#7B694E]/60'
                          : 'border-[#F7C8D3]/40 hover:border-[#F7C8D3]/60'
                      }`}
                    >
                      <Icon size={16} style={{ color: config.color }} />
                      <span className="font-medium text-sm">{config.label}</span>
                    </button>
                  );
                }
              )}
            </div>
          </div>

          {/* Status & Due Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TopicStatus)}
                className={`w-full px-4 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#280B0F] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A] focus:ring-[#C6B39A]/20'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72] focus:ring-[#B46A72]/20'
                }`}
              >
                <option value="todo">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Completed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">Due Date</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#280B0F] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A] focus:ring-[#C6B39A]/20'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72] focus:ring-[#B46A72]/20'
                }`}
              />
            </div>
          </div>

          {/* Checklist Builder */}
          <div>
            <label className="block text-sm font-semibold mb-2">Checklist / Subtasks</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={checklistItemInput}
                onChange={(e) => setChecklistItemInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddChecklistItem())}
                placeholder="Add a checklist item"
                className={`flex-1 px-4 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#280B0F] border-[#7B694E]/40 text-[#F7EFE6] placeholder:text-[#C6B39A]/50 focus:border-[#C6B39A] focus:ring-[#C6B39A]/20'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] placeholder:text-[#2D3A47]/40 focus:border-[#B46A72] focus:ring-[#B46A72]/20'
                }`}
              />
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="px-4 py-2.5 rounded-xl bg-[#B46A72] text-white font-semibold hover:bg-[#A05563] transition-colors"
              >
                Add Item
              </button>
            </div>
            {checklist.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {checklist.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border text-sm ${
                      isDark ? 'bg-[#280B0F]/50 border-[#7B694E]/30' : 'bg-[#F7C8D3]/10 border-[#F7C8D3]/30'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => {
                          setChecklist(
                            checklist.map((c) => (c.id === item.id ? { ...c, completed: !c.completed } : c))
                          );
                        }}
                        className="w-4 h-4 rounded accent-[#A8B58A] cursor-pointer"
                      />
                      <span className={item.completed ? 'line-through opacity-60' : ''}>{item.text}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(item.id)}
                      className="text-red-400 hover:text-red-500 p-1"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Subject Color Picker */}
          <div>
            <label className="block text-sm font-semibold mb-2">Subject Color</label>
            <div className="grid grid-cols-7 gap-2">
              {Object.entries(subjectColors).map(([name, color]) => (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSubjectColor(color)}
                  className={`w-10 h-10 rounded-xl transition-all ${
                    subjectColor === color
                      ? 'ring-2 ring-offset-2 ring-[#B46A72] scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color }}
                  title={name}
                />
              ))}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="block text-sm font-semibold mb-2">Notes</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add any notes or details"
              className={`w-full px-4 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 resize-none h-24 ${
                isDark
                  ? 'bg-[#280B0F] border-[#7B694E]/40 text-[#F7EFE6] placeholder:text-[#C6B39A]/50 focus:border-[#C6B39A] focus:ring-[#C6B39A]/20'
                  : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] placeholder:text-[#2D3A47]/40 focus:border-[#B46A72] focus:ring-[#B46A72]/20'
              }`}
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-semibold mb-2">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                placeholder="Add a tag"
                className={`flex-1 px-4 py-2.5 rounded-xl border transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#280B0F] border-[#7B694E]/40 text-[#F7EFE6] placeholder:text-[#C6B39A]/50 focus:border-[#C6B39A] focus:ring-[#C6B39A]/20'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] placeholder:text-[#2D3A47]/40 focus:border-[#B46A72] focus:ring-[#B46A72]/20'
                }`}
              />
              <button
                type="button"
                onClick={handleAddTag}
                className="px-4 py-2.5 rounded-xl bg-[#B46A72] text-white font-semibold hover:bg-[#A05563] transition-colors"
              >
                Add Tag
              </button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className={`px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2 ${
                      isDark
                        ? 'bg-[#7B694E]/40 text-[#C6B39A]'
                        : 'bg-[#F7C8D3]/40 text-[#B46A72]'
                    }`}
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="hover:opacity-70"
                    >
                      <X size={14} />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div
          className={`flex items-center justify-end gap-3 p-6 border-t ${
            isDark ? 'border-[#7B694E]/30' : 'border-[#F7C8D3]/40'
          }`}
        >
          <button
            type="button"
            onClick={onClose}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              isDark
                ? 'bg-[#7B694E]/30 text-[#C6B39A] hover:bg-[#7B694E]/50'
                : 'bg-[#F7C8D3]/30 text-[#B46A72] hover:bg-[#F7C8D3]/50'
            }`}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 rounded-lg bg-[#B46A72] text-white font-semibold hover:bg-[#A05563] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {todo ? 'Update' : 'Create'} Todo
          </button>
        </div>
      </div>
    </div>
  );
}
