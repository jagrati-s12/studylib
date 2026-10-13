import { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Check,
  X,
  Clock,
  Users,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

// Mock calendar events data
const mockEvents = [
  {
    id: '1',
    title: 'UX Huddle Call',
    start: '2026-06-18T09:00:00',
    end: '2026-06-18T09:30:00',
    color: '#A8B58A',
    attendees: 2,
    day: 'Wednesday',
  },
  {
    id: '2',
    title: 'Analytics Kickoff – Formix Insights',
    start: '2026-06-19T09:00:00',
    end: '2026-06-19T10:00:00',
    color: '#F7C8D3',
    attendees: 3,
    day: 'Thursday',
  },
  {
    id: '3',
    title: 'Standup Meeting – NovaBoard Team',
    start: '2026-06-16T09:45:00',
    end: '2026-06-16T10:45:00',
    color: '#A9B7C6',
    attendees: 5,
    day: 'Monday',
  },
  {
    id: '4',
    title: 'Frontend Dev Sync – API Mapping Task',
    start: '2026-06-17T10:00:00',
    end: '2026-06-17T11:45:00',
    color: '#F7C8D3',
    attendees: 4,
    day: 'Tuesday',
  },
  {
    id: '5',
    title: 'Design Sync – Website Revamp',
    start: '2026-06-18T10:00:00',
    end: '2026-06-18T10:45:00',
    color: '#A9B7C6',
    attendees: 3,
    day: 'Wednesday',
  },
  {
    id: '6',
    title: 'UX Audit Sync – Waveflow Studio',
    start: '2026-06-16T11:00:00',
    end: '2026-06-16T11:45:00',
    color: '#A8B58A',
    attendees: 2,
    day: 'Monday',
  },
  {
    id: '7',
    title: 'Sprint Check-in – Tasklio',
    start: '2026-06-17T11:00:00',
    end: '2026-06-17T12:00:00',
    color: '#F7C8D3',
    attendees: 4,
    day: 'Tuesday',
  },
  {
    id: '8',
    title: 'Team Feedback Loop: Task Management UI',
    start: '2026-06-19T11:00:00',
    end: '2026-06-19T12:00:00',
    color: '#A9B7C6',
    attendees: 3,
    day: 'Thursday',
  },
  {
    id: '9',
    title: 'Design Review: Dark Mode UI',
    start: '2026-06-16T13:00:00',
    end: '2026-06-16T14:15:00',
    color: '#A8B58A',
    attendees: 5,
    day: 'Monday',
  },
  {
    id: '10',
    title: 'Client Review Call – Waveflow Studio',
    start: '2026-06-18T13:00:00',
    end: '2026-06-18T14:00:00',
    color: '#F7C8D3',
    attendees: 2,
    day: 'Wednesday',
  },
  {
    id: '11',
    title: 'Dev Tools Demo + Q&A',
    start: '2026-06-19T13:00:00',
    end: '2026-06-19T13:30:00',
    color: '#A9B7C6',
    attendees: 6,
    day: 'Thursday',
  },
];

export default function SchedulePage() {
  const { isDark } = useTheme();
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [filters, setFilters] = useState({
    meetings: true,
    taskDueDates: false,
    milestones: false,
    deadlines: false,
    personalEvents: false,
    birthdays: false,
  });

  const timeSlots = ['09 AM', '10 AM', '11 AM', '12 PM', '01 PM'];
  const weekDays = [
    { date: 16, day: 'Monday' },
    { date: 17, day: 'Tuesday' },
    { date: 18, day: 'Wednesday' },
    { date: 19, day: 'Thursday' },
  ];

  const getEventsForSlot = (day: string, hour: number) => {
    return mockEvents.filter((event) => {
      const eventStart = new Date(event.start);
      const eventHour = eventStart.getHours();
      return event.day === day && eventHour === hour;
    });
  };

  return (
    <div
      className={`min-h-screen p-6 ${
        isDark ? 'bg-[#280B0F] text-[#F7EFE6]' : 'bg-[var(--color-bg-base)] text-[#2D3A47]'
      }`}
    >
      <div className="flex gap-6">
        {/* Left Sidebar */}
        <aside className="w-80 space-y-5">
          {/* Search Bar */}
          <div className="relative">
            <Search
              size={16}
              className={`absolute left-3 top-1/2 -translate-y-1/2 ${
                isDark ? 'text-[#C6B39A]/50' : 'text-[#2D3A47]/40'
              }`}
            />
            <input
              type="text"
              placeholder="Search a task... ⌘S"
              className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-[#3B1319] border-[#7B694E]/40 text-[#F7EFE6] placeholder:text-[#C6B39A]/50 focus:border-[#C6B39A] focus:ring-[#C6B39A]/20'
                  : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] placeholder:text-[#2D3A47]/40 focus:border-[#B46A72] focus:ring-[#B46A72]/20'
              }`}
            />
          </div>

          {/* Mini Calendar */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40'
                : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display font-bold text-base">June 2025</h3>
              <div className="flex gap-1">
                <button className="p-1 rounded hover:bg-black/5">
                  <ChevronLeft size={16} />
                </button>
                <button className="p-1 rounded hover:bg-black/5">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2 font-semibold opacity-60">
              <div>S</div>
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {Array.from({ length: 30 }, (_, i) => i + 1).map((day) => (
                <button
                  key={day}
                  className={`h-8 rounded-lg transition-colors ${
                    day === 18
                      ? 'bg-[#A8B58A] text-white font-bold'
                      : isDark
                      ? 'hover:bg-[#7B694E]/30'
                      : 'hover:bg-[#F7C8D3]/30'
                  }`}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          {/* Meeting Reminder Card */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40'
                : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <h4 className="text-xs font-bold uppercase tracking-wide opacity-60 mb-2">
              Meeting reminder
            </h4>
            <h5 className="font-bold text-sm mb-2">UX Huddle Call</h5>
            <div className="flex items-center gap-2 text-xs opacity-80 mb-3">
              <Clock size={12} />
              <span>09:00 - 09:30</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#B46A72] border-2 border-white" />
                <div className="w-6 h-6 rounded-full bg-[#A8B58A] border-2 border-white flex items-center justify-center text-[9px] font-bold">
                  +2
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-1.5 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20">
                  <X size={14} />
                </button>
                <button className="p-1.5 rounded-lg bg-[#A8B58A]/10 text-[#A8B58A] hover:bg-[#A8B58A]/20">
                  <Check size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40'
                : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <h4 className="font-bold text-sm mb-3">Filters</h4>
            <div className="space-y-2 text-sm">
              {Object.entries(filters).map(([key, checked]) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                    className="w-4 h-4 rounded accent-[#A8B58A]"
                  />
                  <span className="capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>

            <h4 className="font-bold text-sm mt-4 mb-2 opacity-60">
              Other Calendars
            </h4>
          </div>
        </aside>

        {/* Main Calendar View */}
        <main className="flex-1">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button className="p-2 rounded-lg hover:bg-black/5">
                <ChevronLeft size={18} />
              </button>
              <h2 className="font-display text-2xl font-bold">June, 18 2025</h2>
              <button className="p-2 rounded-lg hover:bg-black/5">
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              {/* View Toggle */}
              <div
                className={`inline-flex rounded-xl p-1 ${
                  isDark ? 'bg-[#3B1319]' : 'bg-[#F7C8D3]/30'
                }`}
              >
                {(['daily', 'weekly', 'monthly'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-colors ${
                      view === v
                        ? 'bg-[#B46A72] text-white shadow-sm'
                        : isDark
                        ? 'text-[#C6B39A] hover:text-[#F7EFE6]'
                        : 'text-[#2D3A47] hover:text-[#B46A72]'
                    }`}
                  >
                    {v}
                  </button>
                ))}
              </div>

              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B46A72] text-white font-semibold text-sm shadow-sm hover:bg-[#A05563] transition-all">
                <Plus size={16} />
                Create Event
              </button>
            </div>
          </div>

          {/* Weekly Calendar Grid */}
          <div
            className={`rounded-2xl border overflow-hidden ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40'
                : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            {/* Column Headers */}
            <div className="grid grid-cols-[80px_repeat(4,1fr)] border-b border-inherit">
              <div
                className={`p-3 text-xs font-semibold opacity-60 ${
                  isDark ? 'bg-[#280B0F]/60' : 'bg-[#F7C8D3]/20'
                }`}
              >
                GMT+07
              </div>
              {weekDays.map((d) => (
                <div
                  key={d.date}
                  className={`p-3 text-center border-l border-inherit ${
                    d.date === 18
                      ? isDark
                        ? 'bg-[#A8B58A]/10'
                        : 'bg-[#A8B58A]/5'
                      : ''
                  }`}
                >
                  <div className="font-bold text-sm">{d.day}</div>
                  <div
                    className={`text-xl font-display font-bold mt-1 ${
                      d.date === 18 ? 'text-[#A8B58A]' : ''
                    }`}
                  >
                    {d.date}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots */}
            {timeSlots.map((time, idx) => (
              <div
                key={time}
                className="grid grid-cols-[80px_repeat(4,1fr)] border-b border-inherit last:border-0"
              >
                <div
                  className={`p-3 text-xs font-semibold opacity-60 border-r border-inherit ${
                    isDark ? 'bg-[#280B0F]/60' : 'bg-[#F7C8D3]/20'
                  }`}
                >
                  {time}
                </div>
                {weekDays.map((d) => {
                  const hour = idx + 9;
                  const events = getEventsForSlot(d.day, hour);
                  return (
                    <div
                      key={`${d.date}-${time}`}
                      className={`p-2 min-h-[100px] border-l border-inherit ${
                        d.date === 18
                          ? isDark
                            ? 'bg-[#A8B58A]/5'
                            : 'bg-[#A8B58A]/[0.02]'
                          : ''
                      }`}
                    >
                      {events.map((event) => (
                        <div
                          key={event.id}
                          className="p-2.5 rounded-xl text-xs mb-2 cursor-pointer hover:shadow-md transition-shadow"
                          style={{
                            backgroundColor: isDark
                              ? `${event.color}20`
                              : `${event.color}40`,
                            borderLeft: `3px solid ${event.color}`,
                          }}
                        >
                          <div className="font-bold text-inherit mb-1 line-clamp-2">
                            {event.title}
                          </div>
                          <div className="flex items-center gap-2 opacity-70">
                            <Clock size={10} />
                            <span className="text-[10px]">
                              {new Date(event.start).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}{' '}
                              -{' '}
                              {new Date(event.end).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          {event.attendees > 0 && (
                            <div className="flex items-center gap-1 mt-1.5">
                              <Users size={10} />
                              <span className="text-[10px] font-semibold">
                                +{event.attendees}
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
