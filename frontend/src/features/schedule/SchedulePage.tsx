import { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  X,
  Clock,
  Users,
  Calendar as CalendarIcon,
  RefreshCw,
  ExternalLink,
  CheckCircle,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

interface CalendarEvent {
  id: string;
  title: string;
  start: string;
  end: string;
  color: string;
  attendees: number;
  day: string;
  isGoogle?: boolean;
}

const INITIAL_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'UX Huddle Call',
    start: '2026-06-18T09:00:00',
    end: '2026-06-18T09:30:00',
    color: '#768E78', // Fern
    attendees: 2,
    day: 'Wednesday',
  },
  {
    id: '2',
    title: 'Analytics Kickoff – Formix Insights',
    start: '2026-06-19T09:00:00',
    end: '2026-06-19T10:00:00',
    color: '#FECDBE', // Cherry Blossom
    attendees: 3,
    day: 'Thursday',
  },
  {
    id: '3',
    title: 'Standup Meeting – NovaBoard Team',
    start: '2026-06-16T09:45:00',
    end: '2026-06-16T10:45:00',
    color: '#B7CBDB', // Bluebell
    attendees: 5,
    day: 'Monday',
  },
  {
    id: '4',
    title: 'Frontend Dev Sync – API Mapping Task',
    start: '2026-06-17T10:00:00',
    end: '2026-06-17T11:45:00',
    color: '#FCC88A', // Honey
    attendees: 4,
    day: 'Tuesday',
  },
  {
    id: '5',
    title: 'Design Sync – Website Revamp',
    start: '2026-06-18T10:00:00',
    end: '2026-06-18T10:45:00',
    color: '#E79897', // Peony
    attendees: 3,
    day: 'Wednesday',
  },
];

const GOOGLE_CALENDAR_SAMPLE_EVENTS: CalendarEvent[] = [
  {
    id: 'g-1',
    title: 'Google Calendar: Machine Learning Lecture',
    start: '2026-06-16T11:00:00',
    end: '2026-06-16T12:30:00',
    color: '#4285F4',
    attendees: 45,
    day: 'Monday',
    isGoogle: true,
  },
  {
    id: 'g-2',
    title: 'Google Calendar: Study Group - React App',
    start: '2026-06-17T13:00:00',
    end: '2026-06-17T14:30:00',
    color: '#4285F4',
    attendees: 4,
    day: 'Tuesday',
    isGoogle: true,
  },
  {
    id: 'g-3',
    title: 'Google Calendar: Project Milestone Review',
    start: '2026-06-18T14:00:00',
    end: '2026-06-18T15:00:00',
    color: '#4285F4',
    attendees: 8,
    day: 'Wednesday',
    isGoogle: true,
  },
];

export default function SchedulePage() {
  const { isDark } = useTheme();
  const [view, setView] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [events, setEvents] = useState<CalendarEvent[]>(INITIAL_EVENTS);
  const [isGoogleSynced, setIsGoogleSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showEventModal, setShowEventModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date(2026, 5, 18)); // June 18, 2026

  const [filters, setFilters] = useState({
    meetings: true,
    taskDueDates: true,
    milestones: true,
    deadlines: true,
    googleCalendar: true,
  });

  const handleSyncGoogleCalendar = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      if (!isGoogleSynced) {
        setIsGoogleSynced(true);
        setEvents((prev) => [...prev, ...GOOGLE_CALENDAR_SAMPLE_EVENTS]);
      } else {
        setIsGoogleSynced(false);
        setEvents((prev) => prev.filter((e) => !e.isGoogle));
      }
    }, 1200);
  };

  // Navigation functions
  const goToPreviousDay = () => {
    setCurrentDate((prev) => new Date(prev.getTime() - 24 * 60 * 60 * 1000));
  };

  const goToNextDay = () => {
    setCurrentDate((prev) => new Date(prev.getTime() + 24 * 60 * 60 * 1000));
  };

  const goToPreviousWeek = () => {
    setCurrentDate((prev) => new Date(prev.getTime() - 7 * 24 * 60 * 60 * 1000));
  };

  const goToNextWeek = () => {
    setCurrentDate((prev) => new Date(prev.getTime() + 7 * 24 * 60 * 60 * 1000));
  };

  const goToPreviousMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Get week dates for weekly view
  const getWeekDates = (date: Date) => {
    const curr = new Date(date);
    const first = curr.getDate() - curr.getDay();
    const weekStart = new Date(curr.setDate(first));

    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(weekStart);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  // Get month dates for monthly view
  const getMonthDates = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const dates = [];
    let current = new Date(startDate);
    while (dates.length < 42) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (event.isGoogle && !filters.googleCalendar) return false;
      if (!searchQuery) return true;
      return event.title.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [events, filters, searchQuery]);

  const getEventsForDate = (date: Date) => {
    const dateKey = formatDateKey(date);
    return filteredEvents.filter((event) => {
      const eventDateKey = event.start.split('T')[0];
      return eventDateKey === dateKey;
    });
  };

  const timeSlots = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8;
    return hour <= 12 ? `${hour.toString().padStart(2, '0')} AM` : `${(hour - 12).toString().padStart(2, '0')} PM`;
  });

  const weekDates = getWeekDates(currentDate);
  const monthDates = getMonthDates(currentDate);

  // Format display
  const formatDateDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const formatMonthDisplay = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const getEventsForSlot = (date: Date, hour: number) => {
    return getEventsForDate(date).filter((event) => {
      const eventStart = new Date(event.start);
      const eventHour = eventStart.getHours();
      return eventHour === hour;
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
          {/* Google Calendar Sync Card */}
          <div
            className={`p-4 rounded-2xl border ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40'
                : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                  G
                </div>
                <div>
                  <h4 className="font-bold text-sm">Google Calendar</h4>
                  <p className="text-[11px] opacity-60">
                    {isGoogleSynced ? 'Synced & Connected' : 'Not Connected'}
                  </p>
                </div>
              </div>
              {isGoogleSynced && (
                <CheckCircle size={18} className="text-emerald-500" />
              )}
            </div>

            <button
              type="button"
              onClick={handleSyncGoogleCalendar}
              disabled={isSyncing}
              className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
                isGoogleSynced
                  ? isDark
                    ? 'bg-[#7B694E]/30 text-[#C6B39A] hover:bg-red-500/20 hover:text-red-400'
                    : 'bg-[#F7C8D3]/30 text-[#2D3A47] hover:bg-red-100 hover:text-red-600'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
              }`}
            >
              {isSyncing ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Connecting to Google...
                </>
              ) : isGoogleSynced ? (
                'Disconnect Google Calendar'
              ) : (
                <>
                  <ExternalLink size={14} />
                  Connect Google Calendar
                </>
              )}
            </button>
          </div>

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
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search schedule..."
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
              <h3 className="font-display font-bold text-base">
                {formatMonthDisplay(currentDate)}
              </h3>
              <div className="flex gap-1">
                <button
                  onClick={goToPreviousMonth}
                  className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-[#7B694E]/30' : 'hover:bg-[#F7C8D3]/30'}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={goToNextMonth}
                  className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-[#7B694E]/30' : 'hover:bg-[#F7C8D3]/30'}`}
                >
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
              {monthDates.map((date, idx) => {
                const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                const isToday = formatDateKey(date) === formatDateKey(new Date());
                const isSelected = formatDateKey(date) === formatDateKey(currentDate);

                return (
                  <button
                    key={idx}
                    onClick={() => setCurrentDate(new Date(date))}
                    className={`h-8 rounded-lg transition-colors font-semibold ${
                      isToday
                        ? 'bg-[#A8B58A] text-white'
                        : isSelected
                        ? isDark
                          ? 'bg-[#B46A72] text-white'
                          : 'bg-[#B46A72] text-white'
                        : isCurrentMonth
                        ? isDark
                          ? 'hover:bg-[#7B694E]/30'
                          : 'hover:bg-[#F7C8D3]/30'
                        : isDark
                        ? 'text-[#C6B39A]/40'
                        : 'text-[#2D3A47]/30'
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
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
          </div>
        </aside>

        {/* Main Calendar View */}
        <main className="flex-1">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <button
                onClick={view === 'daily' ? goToPreviousDay : view === 'weekly' ? goToPreviousWeek : goToPreviousMonth}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#3B1319]' : 'hover:bg-[#F7C8D3]/30'}`}
              >
                <ChevronLeft size={18} />
              </button>
              <div>
                <h2 className="font-display text-2xl font-bold">
                  {view === 'daily'
                    ? formatDateDisplay(currentDate)
                    : view === 'weekly'
                    ? `${formatDateDisplay(weekDates[0])} - ${formatDateDisplay(weekDates[6])}`
                    : formatMonthDisplay(currentDate)
                  }
                </h2>
              </div>
              <button
                onClick={view === 'daily' ? goToNextDay : view === 'weekly' ? goToNextWeek : goToNextMonth}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#3B1319]' : 'hover:bg-[#F7C8D3]/30'}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={goToToday}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                  isDark
                    ? 'bg-[#3B1319] text-[#C6B39A] hover:bg-[#7B694E]/30'
                    : 'bg-[#F7C8D3]/30 text-[#B46A72] hover:bg-[#F7C8D3]/50'
                }`}
              >
                Today
              </button>

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

              <button
                type="button"
                onClick={() => setShowEventModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#B46A72] text-white font-semibold text-sm shadow-sm hover:bg-[#A05563] transition-all"
              >
                <Plus size={16} />
                Create Event
              </button>
            </div>
          </div>

          {/* Calendar Content */}
          {view === 'daily' ? (
            <DailyView isDark={isDark} currentDate={currentDate} getEventsForDate={getEventsForDate} />
          ) : view === 'weekly' ? (
            <WeeklyView isDark={isDark} weekDates={weekDates} getEventsForSlot={getEventsForSlot} timeSlots={timeSlots} />
          ) : (
            <MonthlyView isDark={isDark} monthDates={monthDates} currentDate={currentDate} getEventsForDate={getEventsForDate} />
          )}
        </main>
      </div>

      {/* Create Event Modal */}
      {showEventModal && (
        <EventModal
          isDark={isDark}
          onClose={() => setShowEventModal(false)}
          onSave={(newEvent) => {
            setEvents((prev) => [newEvent, ...prev]);
            setShowEventModal(false);
          }}
        />
      )}
    </div>
  );
}

function DailyView({
  isDark,
  currentDate,
  getEventsForDate,
}: {
  isDark: boolean;
  currentDate: Date;
  getEventsForDate: (date: Date) => CalendarEvent[];
}) {
  const dayEvents = getEventsForDate(currentDate);
  const timeSlots = Array.from({ length: 13 }, (_, i) => i + 8);

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        isDark
          ? 'bg-[#3B1319] border-[#7B694E]/40'
          : 'bg-white border-[#F7C8D3]/60'
      }`}
    >
      {dayEvents.length === 0 ? (
        <div className="p-12 text-center opacity-60">
          <CalendarIcon size={32} className="mx-auto mb-2 opacity-40" />
          <p>No events scheduled for this day</p>
        </div>
      ) : (
        <div className="divide-y divide-inherit">
          {timeSlots.map((hour) => {
            const slotEvents = dayEvents.filter((e) => {
              const eventStart = new Date(e.start);
              return eventStart.getHours() === hour;
            });

            return (
              <div key={hour} className="flex divide-x divide-inherit">
                <div
                  className={`w-24 p-4 text-sm font-semibold opacity-60 ${
                    isDark ? 'bg-[#280B0F]/60' : 'bg-[#F7C8D3]/20'
                  }`}
                >
                  {hour <= 12 ? `${hour} AM` : `${hour - 12} PM`}
                </div>
                <div className="flex-1 p-4">
                  <div className="space-y-2">
                    {slotEvents.map((event) => (
                      <div
                        key={event.id}
                        className="p-3 rounded-xl text-sm cursor-pointer hover:shadow-md transition-shadow"
                        style={{
                          backgroundColor: isDark
                            ? `${event.color}25`
                            : `${event.color}35`,
                          borderLeft: `3px solid ${event.color}`,
                        }}
                      >
                        <div className="font-bold text-inherit mb-1 flex items-center gap-1.5">
                          {event.isGoogle && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
                          {event.title}
                        </div>
                        <div className="flex items-center gap-2 opacity-70 text-xs">
                          <Clock size={12} />
                          <span>
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
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function WeeklyView({
  isDark,
  weekDates,
  getEventsForSlot,
  timeSlots,
}: {
  isDark: boolean;
  weekDates: Date[];
  getEventsForSlot: (date: Date, hour: number) => CalendarEvent[];
  timeSlots: string[];
}) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        isDark
          ? 'bg-[#3B1319] border-[#7B694E]/40'
          : 'bg-white border-[#F7C8D3]/60'
      }`}
    >
      {/* Column Headers */}
      <div className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-inherit">
        <div
          className={`p-3 text-xs font-semibold opacity-60 ${
            isDark ? 'bg-[#280B0F]/60' : 'bg-[#F7C8D3]/20'
          }`}
        >
          GMT+07
        </div>
        {weekDates.map((d) => {
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <div
              key={d.toISOString()}
              className={`p-3 text-center border-l border-inherit ${
                isToday
                  ? isDark
                    ? 'bg-[#A8B58A]/10'
                    : 'bg-[#A8B58A]/5'
                  : ''
              }`}
            >
              <div className="font-bold text-sm">
                {d.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div
                className={`text-xl font-display font-bold mt-1 ${
                  isToday ? 'text-[#A8B58A]' : ''
                }`}
              >
                {d.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Slots */}
      {timeSlots.map((time, idx) => {
        const hour = idx + 8;
        return (
          <div
            key={time}
            className="grid grid-cols-[80px_repeat(7,1fr)] border-b border-inherit last:border-0"
          >
            <div
              className={`p-3 text-xs font-semibold opacity-60 border-r border-inherit ${
                isDark ? 'bg-[#280B0F]/60' : 'bg-[#F7C8D3]/20'
              }`}
            >
              {time}
            </div>
            {weekDates.map((d) => {
              const isToday = d.toDateString() === new Date().toDateString();
              const slotEvents = getEventsForSlot(d, hour);
              return (
                <div
                  key={`${d.toISOString()}-${time}`}
                  className={`p-2 min-h-[100px] border-l border-inherit ${
                    isToday
                      ? isDark
                        ? 'bg-[#A8B58A]/5'
                        : 'bg-[#A8B58A]/[0.02]'
                      : ''
                  }`}
                >
                  {slotEvents.map((event) => (
                    <div
                      key={event.id}
                      className="p-2.5 rounded-xl text-xs mb-2 cursor-pointer hover:shadow-md transition-shadow"
                      style={{
                        backgroundColor: isDark
                          ? `${event.color}25`
                          : `${event.color}35`,
                        borderLeft: `3px solid ${event.color}`,
                      }}
                    >
                      <div className="font-bold text-inherit mb-1 line-clamp-2 flex items-center gap-1.5">
                        {event.isGoogle && <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />}
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
        );
      })}
    </div>
  );
}

function MonthlyView({
  isDark,
  monthDates,
  currentDate,
  getEventsForDate,
}: {
  isDark: boolean;
  monthDates: Date[];
  currentDate: Date;
  getEventsForDate: (date: Date) => CalendarEvent[];
}) {
  return (
    <div
      className={`rounded-2xl border overflow-hidden ${
        isDark
          ? 'bg-[#3B1319] border-[#7B694E]/40'
          : 'bg-white border-[#F7C8D3]/60'
      }`}
    >
      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-inherit">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className={`p-4 text-center font-bold text-sm border-r border-inherit last:border-0 ${
              isDark ? 'bg-[#280B0F]/60' : 'bg-[#F7C8D3]/20'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Month grid */}
      <div className="grid grid-cols-7">
        {monthDates.map((date, idx) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const isToday = date.toDateString() === new Date().toDateString();
          const dayEvents = getEventsForDate(date);

          return (
            <div
              key={idx}
              className={`min-h-24 p-2 border-b border-r border-inherit last:border-0 ${
                isToday
                  ? isDark
                    ? 'bg-[#A8B58A]/10'
                    : 'bg-[#A8B58A]/5'
                  : isCurrentMonth
                  ? ''
                  : isDark
                  ? 'bg-[#280B0F]/30 opacity-40'
                  : 'bg-[#F7C8D3]/10 opacity-40'
              }`}
            >
              <div
                className={`text-sm font-bold mb-1 ${
                  isToday
                    ? 'text-[#A8B58A]'
                    : !isCurrentMonth
                    ? 'opacity-50'
                    : ''
                }`}
              >
                {date.getDate()}
              </div>
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className="px-1.5 py-0.5 rounded text-[10px] font-semibold truncate cursor-pointer hover:shadow-md transition-shadow"
                    style={{
                      backgroundColor: `${event.color}35`,
                      color: event.color,
                    }}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="px-1.5 py-0.5 text-[10px] font-semibold opacity-60">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EventModal({
  isDark,
  onClose,
  onSave,
}: {
  isDark: boolean;
  onClose: () => void;
  onSave: (event: CalendarEvent) => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('10:00');
  const [color, setColor] = useState('#768E78');

  const handleSave = () => {
    if (!title.trim()) return;
    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      title,
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
      start: `${date}T${startTime}:00`,
      end: `${date}T${endTime}:00`,
      color,
      attendees: 1,
    };
    onSave(newEvent);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div
        className={`rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 ${
          isDark ? 'bg-[#3B1319]' : 'bg-white'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-lg">Create Event</h3>
          <button onClick={onClose} className={`p-1 rounded-lg transition-colors ${isDark ? 'hover:bg-[#7B694E]/30' : 'hover:bg-[#F7C8D3]/30'}`}>
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
              Event Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Meeting / Study Session"
              className={`w-full px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-[#280B0F] border-[#7B694E]/40 text-white placeholder:text-[#C6B39A]/50 focus:ring-[#C6B39A]/20'
                  : 'bg-white border-[#F7C8D3]/60 text-gray-900 placeholder:text-[#2D3A47]/40 focus:ring-[#B46A72]/20'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={`w-full px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-[#280B0F] border-[#7B694E]/40 text-white focus:ring-[#C6B39A]/20'
                  : 'bg-white border-[#F7C8D3]/60 text-gray-900 focus:ring-[#B46A72]/20'
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#280B0F] border-[#7B694E]/40 text-white focus:ring-[#C6B39A]/20'
                    : 'bg-white border-[#F7C8D3]/60 text-gray-900 focus:ring-[#B46A72]/20'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#280B0F] border-[#7B694E]/40 text-white focus:ring-[#C6B39A]/20'
                    : 'bg-white border-[#F7C8D3]/60 text-gray-900 focus:ring-[#B46A72]/20'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-70">
              Event Color
            </label>
            <div className="grid grid-cols-5 gap-2">
              {['#768E78', '#FECDBE', '#E79897', '#B7CBDB', '#FCC88A', '#B46A72', '#A8B58A', '#72583E'].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-lg transition-all ${
                    color === c
                      ? 'ring-2 ring-offset-2 ring-[#B46A72] scale-110'
                      : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              isDark
                ? 'bg-[#7B694E]/30 text-[#C6B39A] hover:bg-[#7B694E]/50'
                : 'bg-[#F7C8D3]/30 text-[#B46A72] hover:bg-[#F7C8D3]/50'
            }`}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-4 py-2 rounded-xl bg-[#B46A72] text-white text-sm font-semibold hover:bg-[#A05563] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Event
          </button>
        </div>
      </div>
    </div>
  );
}
