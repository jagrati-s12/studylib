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
  MoreHorizontal,
  ListTodo,
} from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';


function getMonthKey(dateStr): MonthKey {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function formatMonth(key: MonthKey) {
  const [year, month] = key.split('-');
  const d = new Date(Number(year), Number(month) - 1);
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export default function TodoPage() {
  const { isDark } = useTheme();
  const [allTopics, setAllTopics] = useState<Topic[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTodos, setExpandedTodos] = useState<Set<string>>(new Set());
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

  useEffect(() => {
    api.getAllTopics().then((data) => {
      setAllTopics(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return allTopics;
    const q = searchQuery.toLowerCase();
    return allTopics.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.tags?.some((tag) => tag.toLowerCase().includes(q)) ||
        t.note?.toLowerCase().includes(q)
    );
  }, [allTopics, searchQuery]);

  // Group by month
  const monthGroups = useMemo(() => {
    const groups = new Map<MonthKey, Topic[]>();
    const sorted = [...filtered].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    );
    for (const topic of sorted) {
      const key = getMonthKey(topic.updated_at);
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(topic);
    }
    return groups;
  }, [filtered]);

  const toggleExpand = (id) => {
    setExpandedTodos((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleMonth = (key: MonthKey) => {
    setCollapsedMonths((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  async function handleChecklistToggle(topicId, checklistItemId) {
    const topic = allTopics.find((t) => t.id === topicId);
    if (!topic || !topic.checklist) return;

    const updatedChecklist = topic.checklist.map((item) =>
      item.id === checklistItemId ? { ...item, completed: !item.completed } : item
    );
    const completedCount = updatedChecklist.filter((i) => i.completed).length;
    const newProgress = Math.round((completedCount / updatedChecklist.length) * 100);

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

  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const statusCounts = {
    todo: allTopics.filter((t) => t.status === 'todo').length,
    in_progress: allTopics.filter((t) => t.status === 'in_progress').length,
    done: allTopics.filter((t) => t.status === 'done').length,
  };

  return (
    <div
      className={`min-h-screen p-8 ${
        isDark ? 'bg-[#280B0F] text-[#F7EFE6]' : 'bg-[var(--color-bg-base)] text-[#2D3A47]'
      }`}
    >
      {/* Header */}
      <header className="mb-8">
        <div className="flex items-start justify-between mb-4">
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
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#B46A72] text-white font-semibold text-sm shadow-sm hover:bg-[#A05563] transition-all"
          >
            <Plus size={16} />
            New Todo
          </button>
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4">
          {[
            { label: 'Pending', count: statusCounts.todo, color: '#B46A72' },
            { label: 'In Progress', count: statusCounts.in_progress, color: '#A9B7C6' },
            { label: 'Completed', count: statusCounts.done, color: '#A8B58A' },
          ].map((stat) => (
            <div
              key={stat.label}
              className={`px-4 py-2.5 rounded-xl border flex items-center gap-3 ${
                isDark
                  ? 'bg-[#3B1319] border-[#7B694E]/40'
                  : 'bg-white border-[#F7C8D3]/60'
              }`}
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: stat.color }}
              />
              <span className="text-sm font-semibold">{stat.label}</span>
              <span className="text-lg font-bold">{stat.count}</span>
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

      {/* Month-wise Grouped Todos */}
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
      ) : monthGroups.size === 0 ? (
        <div
          className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed py-20 ${
            isDark
              ? 'border-[#7B694E]/40 bg-[#3B1319]/30'
              : 'border-[#F7C8D3] bg-white/50'
          }`}
        >
          <ListTodo size={48} className="opacity-40 mb-4" />
          <p className="font-semibold mb-1">No todos found</p>
          <p className="text-sm opacity-60">Create your first todo to get started</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Array.from(monthGroups.entries()).map(([monthKey, topics]) => (
            <MonthSection
              key={monthKey}
              monthKey={monthKey}
              topics={topics}
              isDark={isDark}
              collapsed={collapsedMonths.has(monthKey)}
              onToggleMonth={() => toggleMonth(monthKey)}
              expandedTodos={expandedTodos}
              onToggleExpand={toggleExpand}
              onChecklistToggle={handleChecklistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

  monthKey: MonthKey;
  topics: Topic[];
  isDark;
  collapsed;
  onToggleMonth: () => void;
  expandedTodos: Set<string>;
  onToggleExpand: (id) => void;
  onChecklistToggle: (topicId, checklistItemId) => void;
}

function MonthSection({
  monthKey,
  topics,
  isDark,
  collapsed,
  onToggleMonth,
  expandedTodos,
  onToggleExpand,
  onChecklistToggle,
}: MonthSectionProps) {
  const doneCount = topics.filter((t) => t.status === 'done').length;

  return (
    <div>
      {/* Month header */}
      <button
        type="button"
        onClick={onToggleMonth}
        className="flex items-center gap-3 mb-3 group cursor-pointer w-full text-left"
      >
        {collapsed ? (
          <ChevronRight size={18} className="opacity-60" />
        ) : (
          <ChevronDown size={18} className="opacity-60" />
        )}
        <h2 className="font-display text-xl font-bold">{formatMonth(monthKey)}</h2>
        <span
          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            isDark
              ? 'bg-[#7B694E]/40 text-[#C6B39A]'
              : 'bg-[#F7C8D3]/40 text-[#B46A72]'
          }`}
        >
          {doneCount}/{topics.length} done
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-3 ml-2">
          {topics.map((topic) => (
            <TodoItem
              key={topic.id}
              topic={topic}
              isDark={isDark}
              expanded={expandedTodos.has(topic.id)}
              onToggle={() => onToggleExpand(topic.id)}
              onChecklistToggle={onChecklistToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
}

  topic: Topic;
  isDark;
  expanded;
  onToggle: () => void;
  onChecklistToggle: (topicId, checklistItemId) => void;
}

function TodoItem({ topic, isDark, expanded, onToggle, onChecklistToggle }: TodoItemProps) {
  const getStatusConfig = (status: TopicStatus) => {
    switch (status) {
      case 'todo':
        return { icon: Clock, color: isDark ? '#C6B39A' : '#B46A72', label: 'Todo' };
      case 'in_progress':
        return { icon: AlertCircle, color: isDark ? '#A9B7C6' : '#A9B7C6', label: 'In Progress' };
      case 'in_review':
        return { icon: Clock, color: isDark ? '#C6B39A' : '#A8B58A', label: 'In Review' };
      case 'done':
        return { icon: CheckCircle2, color: '#A8B58A', label: 'Done' };
    }
  };

  const statusConfig = getStatusConfig(topic.status || 'todo');
  const StatusIcon = statusConfig.icon;

  return (
    <div
      className={`rounded-2xl border transition-all ${
        isDark
          ? 'bg-[#3B1319] border-[#7B694E]/40 hover:border-[#C6B39A]/60'
          : 'bg-white border-[#F7C8D3]/60 hover:border-[#B46A72]/40'
      } ${expanded ? 'shadow-lg' : 'hover:shadow-md'}`}
    >
      {/* Main row — always visible */}
      <div
        className="flex items-center gap-4 p-4 cursor-pointer"
        onClick={onToggle}
      >
        <StatusIcon size={18} style={{ color: statusConfig.color }} className="shrink-0" />

        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm truncate">{topic.title}</h4>
          {topic.tags && topic.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {topic.tags.slice(0, 3).map((tag, idx) => (
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

        {/* Progress */}
        {topic.progress !== undefined && topic.progress > 0 && (
          <div className="flex items-center gap-2 shrink-0">
            <div
              className={`w-20 h-1.5 rounded-full overflow-hidden ${
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

        {/* Linked notes indicator */}
        {topic.note && (
          <div
            className={`p-1.5 rounded-lg ${
              isDark ? 'bg-[#7B694E]/20' : 'bg-[#F7C8D3]/30'
            }`}
            title="Has linked notes"
          >
            <FileText size={14} className="opacity-60" />
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
            {/* Status + date row */}
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

            {/* Note / linked reference */}
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

            {/* Actions row */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-colors ${
                  isDark
                    ? 'bg-[#7B694E]/30 text-[#C6B39A] hover:bg-[#7B694E]/50'
                    : 'bg-[#F7C8D3]/30 text-[#B46A72] hover:bg-[#F7C8D3]/50'
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <FileText size={12} />
                  Link Notes
                </span>
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
              >
                <MoreHorizontal size={14} className="opacity-60" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



