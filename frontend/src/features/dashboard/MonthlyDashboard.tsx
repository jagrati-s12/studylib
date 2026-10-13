import { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Filter,
  Users,
  MoreHorizontal,
  ChevronDown,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

type TaskStatus = 'todo' | 'in_progress' | 'in_review' | 'done';

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  progress: number;
  tags: string[];
  assignees: string[];
  comments: number;
  attachments: number;
}

interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  lightColor: string;
}

const COLUMNS: Column[] = [
  { id: 'todo', title: 'Todo list', color: '#6366F1', lightColor: '#E0E7FF' },
  { id: 'in_progress', title: 'In Progress', color: '#F59E0B', lightColor: '#FEF3C7' },
  { id: 'in_review', title: 'In Review', color: '#EC4899', lightColor: '#FCE7F3' },
  { id: 'done', title: 'Done', color: '#10B981', lightColor: '#D1FAE5' },
];

const SAMPLE_TASKS: Task[] = [
  {
    id: '1',
    title: 'Search inspirations for upcoming project',
    description: 'Research design inspirations and trends',
    status: 'todo',
    progress: 40,
    tags: ['#website', '#client'],
    assignees: ['AS', '#product', 'MD'],
    comments: 12,
    attachments: 8,
  },
  {
    id: '2',
    title: 'Ginko mobile app design',
    description: 'Design mobile app user interface',
    status: 'todo',
    progress: 15,
    tags: ['#mobile app', '#client'],
    assignees: ['MD', '#product', 'MD'],
    comments: 7,
    attachments: 2,
  },
  {
    id: '3',
    title: 'Weihu product task and the task process pages',
    description: 'Complete product task and process documentation',
    status: 'in_progress',
    progress: 80,
    tags: ['#product', '#product'],
    assignees: ['MD', '#product', 'MD'],
    comments: 6,
    attachments: 1,
  },
  {
    id: '4',
    title: 'Crypto product landing page create in webflow',
    description: 'Create landing page in Webflow',
    status: 'in_review',
    progress: 0,
    tags: ['#development', '#client'],
    assignees: ['MD', '#product', 'MD'],
    comments: 12,
    attachments: 8,
  },
  {
    id: '5',
    title: 'Affitto product full service',
    description: 'Full service product design and development',
    status: 'done',
    progress: 100,
    tags: ['#products', '#client'],
    assignees: ['MD', '#product', 'MD'],
    comments: 7,
    attachments: 2,
  },
  {
    id: '6',
    title: 'Design Moli app product page redesign',
    description: 'Redesign product page for Moli app',
    status: 'done',
    progress: 100,
    tags: ['#products', '#client'],
    assignees: ['MD', '#product', 'MD'],
    comments: 12,
    attachments: 8,
  },
];

function ProgressBar({ progress }: { progress: number }) {
  const dots = Array.from({ length: 12 }, (_, i) => i);
  const filledDots = Math.round((progress / 100) * 12);

  return (
    <div className="flex gap-1">
      {dots.map((_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full transition-all ${
            i < filledDots ? 'bg-current opacity-100' : 'bg-current opacity-20'
          }`}
        />
      ))}
    </div>
  );
}

function TaskCard({ task, isDark }: { task: Task; isDark: boolean }) {
  const column = COLUMNS.find((c) => c.id === task.status);
  if (!column) return null;

  return (
    <div
      className={`rounded-2xl border p-4 transition-all hover:shadow-lg ${
        isDark
          ? 'bg-[#1F2937] border-[#374151] hover:border-[#4B5563]'
          : 'bg-white border-[#E5E7EB]'
      }`}
      style={{
        borderTopWidth: '4px',
        borderTopColor: column.color,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          <h3
            className={`font-semibold text-sm leading-snug mb-1 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}
          >
            {task.title}
          </h3>
          {task.description && (
            <p
              className={`text-xs leading-tight ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              {task.description}
            </p>
          )}
        </div>
        <button
          type="button"
          className={`p-1 rounded-lg transition-colors ${
            isDark ? 'hover:bg-[#374151]' : 'hover:bg-gray-100'
          }`}
        >
          <MoreHorizontal size={16} className="opacity-60" />
        </button>
      </div>

      {/* Tags */}
      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {task.tags.slice(0, 2).map((tag, idx) => (
            <span
              key={idx}
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isDark
                  ? 'bg-[#374151] text-gray-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Progress */}
      {task.progress > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`text-xs font-medium ${
                isDark ? 'text-gray-400' : 'text-gray-600'
              }`}
            >
              Progress
            </span>
            <span className="text-xs font-bold opacity-70">{task.progress}%</span>
          </div>
          <div style={{ color: column.color }}>
            <ProgressBar progress={task.progress} />
          </div>
        </div>
      )}

      {/* Assignees and Meta */}
      <div className="flex items-center justify-between pt-2 border-t border-gray-200/20">
        <div className="flex items-center">
          <div className="flex -space-x-2">
            {task.assignees.slice(0, 3).map((assignee, idx) => (
              <div
                key={idx}
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                  idx % 3 === 0
                    ? 'bg-blue-500'
                    : idx % 3 === 1
                    ? 'bg-purple-500'
                    : 'bg-pink-500'
                }`}
              >
                {assignee.substring(0, 2).toUpperCase()}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs opacity-70">
          {task.comments > 0 && (
            <span className="flex items-center gap-1">
              💬 {task.comments}
            </span>
          )}
          {task.attachments > 0 && (
            <span className="flex items-center gap-1">
              📎 {task.attachments}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function KanbanColumn({
  column,
  tasks,
  isDark,
}: {
  column: Column;
  tasks: Task[];
  isDark: boolean;
}) {
  return (
    <div className="flex-1 min-w-80 flex flex-col">
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <h2
              className={`font-semibold text-lg ${isDark ? 'text-white' : 'text-gray-900'}`}
            >
              {column.title}
            </h2>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                isDark
                  ? 'bg-[#374151] text-gray-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tasks.length}
            </span>
          </div>
          <button
            type="button"
            className={`p-1.5 rounded-lg transition-colors ${
              isDark
                ? 'text-gray-400 hover:bg-[#374151]'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* Tasks */}
      <div className="space-y-3 flex-1 pb-4 overflow-y-auto max-h-[calc(100vh-300px)]">
        {tasks.length === 0 ? (
          <div
            className={`flex items-center justify-center h-32 rounded-xl border-2 border-dashed ${
              isDark
                ? 'border-[#374151] text-gray-600'
                : 'border-gray-200 text-gray-400'
            }`}
          >
            <p className="text-sm">No tasks</p>
          </div>
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} isDark={isDark} />)
        )}
      </div>
    </div>
  );
}

export default function MonthlyDashboard() {
  const { isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth] = useState(new Date());

  const monthName = selectedMonth.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return SAMPLE_TASKS;
    const q = searchQuery.toLowerCase();
    return SAMPLE_TASKS.filter(
      (task) =>
        task.title.toLowerCase().includes(q) ||
        task.tags.some((tag) => tag.toLowerCase().includes(q)) ||
        task.description.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const groupedByStatus = useMemo(() => {
    const groups = new Map<TaskStatus, Task[]>();
    COLUMNS.forEach((col) => groups.set(col.id, []));
    filteredTasks.forEach((task) => {
      const col = groups.get(task.status) || [];
      groups.set(task.status, [...col, task]);
    });
    return groups;
  }, [filteredTasks]);

  // Get team member avatars from tasks
  const uniqueAssignees = useMemo(() => {
    const assignees = new Set<string>();
    SAMPLE_TASKS.forEach((task) => {
      task.assignees.forEach((a) => assignees.add(a));
    });
    return Array.from(assignees).slice(0, 4);
  }, []);

  return (
    <div
      className={`min-h-screen overflow-hidden ${
        isDark ? 'bg-[#111827]' : 'bg-gray-50'
      }`}
    >
      {/* Header */}
      <header
        className={`sticky top-0 z-10 border-b ${
          isDark
            ? 'bg-[#1F2937] border-[#374151]'
            : 'bg-white border-gray-200'
        }`}
      >
        <div className="px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1
                className={`text-3xl font-bold mb-1 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                Board
              </h1>
              <p
                className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}
              >
                {monthName}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Team avatars */}
              <div className="flex -space-x-2">
                {uniqueAssignees.slice(0, 4).map((assignee, idx) => (
                  <div
                    key={idx}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 ${
                      isDark ? 'border-[#1F2937]' : 'border-white'
                    } ${
                      idx % 4 === 0
                        ? 'bg-blue-500'
                        : idx % 4 === 1
                        ? 'bg-purple-500'
                        : idx % 4 === 2
                        ? 'bg-pink-500'
                        : 'bg-green-500'
                    }`}
                  >
                    {assignee.substring(0, 2).toUpperCase()}
                  </div>
                ))}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className={`p-2.5 rounded-lg transition-colors ${
                    isDark
                      ? 'text-gray-400 hover:bg-[#374151]'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Filter size={18} />
                </button>
                <button
                  type="button"
                  className="px-4 py-2.5 rounded-lg bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Plus size={16} />
                  Create task
                </button>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="relative max-w-md">
            <Search
              size={18}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-gray-600' : 'text-gray-400'
              }`}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find something"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-[#374151] border-[#4B5563] text-white placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
                  : 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20'
              }`}
            />
          </div>
        </div>
      </header>

      {/* Kanban Board */}
      <div className="overflow-x-auto">
        <div className="px-8 py-6 flex gap-6 min-w-max">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={groupedByStatus.get(column.id) || []}
              isDark={isDark}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
