import { useState, useMemo, useEffect } from 'react';
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
  AlertCircle,
  Key,
  Info,
  MapPin,
  Trash2,
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

// Helper to generate dynamic sample dates relative to current date
const getSampleDate = (dayOffset, hour, minute = 0) => {
  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const h = String(hour).padStart(2, '0');
  const m = String(minute).padStart(2, '0');
  return `${year}-${month}-${day}T${h}:${m}:00`;
};

const INITIAL_EVENTS = [
  {
    id: '1',
    title: 'UX Huddle Call',
    start: getSampleDate(0, 9, 0),
    end: getSampleDate(0, 9, 30),
    color: '#768E78', // Fern
    attendees: 2,
    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  },
  {
    id: '2',
    title: 'Analytics Kickoff – Formix Insights',
    start: getSampleDate(1, 10, 0),
    end: getSampleDate(1, 11, 0),
    color: '#FECDBE', // Cherry Blossom
    attendees: 3,
    day: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long' }),
  },
  {
    id: '3',
    title: 'Standup Meeting – NovaBoard Team',
    start: getSampleDate(-1, 9, 45),
    end: getSampleDate(-1, 10, 45),
    color: '#B7CBDB', // Bluebell
    attendees: 5,
    day: new Date(Date.now() - 86400000).toLocaleDateString('en-US', { weekday: 'long' }),
  },
  {
    id: '4',
    title: 'Frontend Dev Sync – API Mapping Task',
    start: getSampleDate(2, 10, 0),
    end: getSampleDate(2, 11, 45),
    color: '#FCC88A', // Honey
    attendees: 4,
    day: new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-US', { weekday: 'long' }),
  },
  {
    id: '5',
    title: 'Design Sync – Website Revamp',
    start: getSampleDate(0, 14, 0),
    end: getSampleDate(0, 14, 45),
    color: '#E79897', // Peony
    attendees: 3,
    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
  },
];

const GOOGLE_CALENDAR_SAMPLE_EVENTS = [
  {
    id: 'g-1',
    title: 'Google Calendar: Machine Learning Lecture',
    start: getSampleDate(0, 11, 0),
    end: getSampleDate(0, 12, 30),
    color: '#4285F4',
    attendees: 45,
    day: new Date().toLocaleDateString('en-US', { weekday: 'long' }),
    isGoogle: true,
    location: 'Auditorium Hall B & Google Meet',
    description: 'Weekly CS504 lecture covering Neural Networks and Backpropagation.',
    htmlLink: 'https://calendar.google.com',
  },
  {
    id: 'g-2',
    title: 'Google Calendar: Study Group - React App',
    start: getSampleDate(1, 14, 0),
    end: getSampleDate(1, 15, 30),
    color: '#4285F4',
    attendees: 4,
    day: new Date(Date.now() + 86400000).toLocaleDateString('en-US', { weekday: 'long' }),
    isGoogle: true,
    location: 'Google Meet (meet.google.com/abc-defg-hij)',
    description: 'Discussing state management and API routes.',
    htmlLink: 'https://calendar.google.com',
  },
  {
    id: 'g-3',
    title: 'Google Calendar: Project Milestone Review',
    start: getSampleDate(2, 13, 0),
    end: getSampleDate(2, 14, 0),
    color: '#4285F4',
    attendees: 8,
    day: new Date(Date.now() + 2 * 86400000).toLocaleDateString('en-US', { weekday: 'long' }),
    isGoogle: true,
    location: 'Conference Room 3',
    description: 'Milestone 2 progress sign-off with advisors.',
    htmlLink: 'https://calendar.google.com',
  },
];

const formatDateKey = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '';
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function SchedulePage() {
  const { isDark } = useTheme();
  const [view, setView] = useState('weekly');
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const [isGoogleSynced, setIsGoogleSynced] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState(null);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState(null);
  const [googleUser, setGoogleUser] = useState(null);
  const [storedAccessToken, setStoredAccessToken] = useState(null);

  const [showEventModal, setShowEventModal] = useState(false);
  const [showGoogleConfigModal, setShowGoogleConfigModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentDate, setCurrentDate] = useState(() => new Date());

  // Google Client ID state: check env or localStorage
  const [googleClientId, setGoogleClientId] = useState(() => {
    return import.meta.env.VITE_GOOGLE_CLIENT_ID || (typeof window !== 'undefined' ? localStorage.getItem('gcal_client_id') || '' : '');
  });

  const [filters, setFilters] = useState({
    meetings: true,
    taskDueDates: true,
    milestones: true,
    deadlines: true,
    googleCalendar: true,
  });

  // Re-fetch calendar events with an active access token
  const fetchCalendarEventsWithToken = async (accessToken) => {
    setIsSyncing(true);
    setSyncError(null);
    try {
      const timeMin = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const timeMax = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
      const eventsUrl = `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(timeMin)}&timeMax=${encodeURIComponent(timeMax)}`;

      const response = await fetch(eventsUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `Google Calendar API returned status ${response.status}`);
      }

      const data = await response.json();
      const items = data.items || [];

      const mappedEvents = items.map((item) => {
        const isAllDay = !item.start?.dateTime && Boolean(item.start?.date);
        const startStr = item.start?.dateTime || (item.start?.date ? `${item.start.date}T09:00:00` : new Date().toISOString());
        const endStr = item.end?.dateTime || (item.end?.date ? `${item.end.date}T10:00:00` : new Date().toISOString());
        const startDate = new Date(startStr);

        return {
          id: `gcal-${item.id}`,
          title: item.summary || '(Untitled Event)',
          start: startStr,
          end: endStr,
          color: '#4285F4',
          attendees: item.attendees ? item.attendees.length : 1,
          day: startDate.toLocaleDateString('en-US', { weekday: 'long' }),
          isGoogle: true,
          isAllDay,
          description: item.description || '',
          location: item.location || '',
          htmlLink: item.htmlLink || 'https://calendar.google.com',
        };
      });

      setEvents((prev) => {
        const nonGoogle = prev.filter((ev) => !ev.isGoogle);
        return [...mappedEvents, ...nonGoogle];
      });

      setIsGoogleSynced(true);
      setStoredAccessToken(accessToken);
      setGoogleUser({
        summary: data.summary || 'Google Primary Calendar',
        timeZone: data.timeZone,
        count: mappedEvents.length,
      });

      setSyncSuccessMsg(`Successfully synced ${mappedEvents.length} events from Google Calendar!`);
      setTimeout(() => setSyncSuccessMsg(null), 6000);

      // Move view to first upcoming Google event if present
      if (mappedEvents.length > 0) {
        const firstEventDate = new Date(mappedEvents[0].start);
        if (!isNaN(firstEventDate.getTime())) {
          setCurrentDate(firstEventDate);
        }
      }
    } catch (err) {
      console.error('Failed to fetch events from Google:', err);
      setSyncError(err.message || 'Failed to fetch events from Google Calendar.');
    } finally {
      setIsSyncing(false);
    }
  };

  // Launch GIS OAuth 2.0 Token Client popup
  const triggerGoogleOAuth = (clientIdToUse) => {
    setSyncError(null);
    setIsSyncing(true);

    if (typeof window === 'undefined' || !window.google?.accounts?.oauth2) {
      setSyncError('Google Identity Services script is still loading. Please check your internet connection and refresh.');
      setIsSyncing(false);
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientIdToUse,
        scope: 'https://www.googleapis.com/auth/calendar.events.readonly',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            console.error('Google Auth callback error:', tokenResponse);
            setIsSyncing(false);
            setSyncError(tokenResponse.error_description || tokenResponse.error || 'Google sign-in was closed or failed.');
            return;
          }

          if (tokenResponse.access_token) {
            await fetchCalendarEventsWithToken(tokenResponse.access_token);
          } else {
            setIsSyncing(false);
            setSyncError('No access token returned by Google.');
          }
        },
        error_callback: (err) => {
          console.error('Google Token error:', err);
          setIsSyncing(false);
          setSyncError('Google sign-in popup encountered an error or was closed.');
        },
      });

      // Prompt account selection popup
      tokenClient.requestAccessToken({ prompt: 'select_account' });
    } catch (err) {
      console.error('Failed to initTokenClient:', err);
      setIsSyncing(false);
      setSyncError(err.message || 'Could not launch Google authentication popup.');
    }
  };

  // Handle Connect / Disconnect button click
  const handleSyncGoogleCalendar = () => {
    if (isGoogleSynced) {
      // Disconnect
      setEvents((prev) => prev.filter((ev) => !ev.isGoogle));
      setIsGoogleSynced(false);
      setGoogleUser(null);
      setStoredAccessToken(null);
      setSyncSuccessMsg(null);
      return;
    }

    const activeClientId = googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!activeClientId || !activeClientId.trim()) {
      setShowGoogleConfigModal(true);
      return;
    }

    triggerGoogleOAuth(activeClientId.trim());
  };

  // Instant demo sync fallback
  const handleDemoSync = () => {
    setIsSyncing(true);
    setShowGoogleConfigModal(false);
    setSyncError(null);
    setTimeout(() => {
      setIsSyncing(false);
      setIsGoogleSynced(true);
      setGoogleUser({
        summary: 'Demo Google Calendar',
        count: GOOGLE_CALENDAR_SAMPLE_EVENTS.length,
      });
      setEvents((prev) => {
        const nonGoogle = prev.filter((ev) => !ev.isGoogle);
        return [...GOOGLE_CALENDAR_SAMPLE_EVENTS, ...nonGoogle];
      });
      setSyncSuccessMsg(`Connected! Loaded ${GOOGLE_CALENDAR_SAMPLE_EVENTS.length} preview events from Google Calendar.`);
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    }, 800);
  };

  // Save new client ID and launch OAuth
  const handleSaveClientIdAndConnect = (newId) => {
    if (!newId || !newId.trim()) return;
    const trimmed = newId.trim();
    setGoogleClientId(trimmed);
    try {
      localStorage.setItem('gcal_client_id', trimmed);
    } catch (e) {
      // Ignore storage errors
    }
    setShowGoogleConfigModal(false);
    triggerGoogleOAuth(trimmed);
  };

  // Helper date calculations
  const getWeekDates = (date) => {
    const start = new Date(date);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    const monday = new Date(start);
    monday.setDate(diff);

    const dates = [];
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(monday);
      nextDate.setDate(monday.getDate() + i);
      dates.push(nextDate);
    }
    return dates;
  };

  const getMonthDates = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const lastDay = new Date(year, month + 1, 0).getDate();
    const prevLastDay = new Date(year, month, 0).getDate();

    const dates = [];

    // Previous month filler
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      dates.push(new Date(year, month - 1, prevLastDay - i));
    }

    // Current month
    for (let i = 1; i <= lastDay; i++) {
      dates.push(new Date(year, month, i));
    }

    // Next month filler to complete grid (42 cells)
    const remainingCells = 42 - dates.length;
    for (let i = 1; i <= remainingCells; i++) {
      dates.push(new Date(year, month + 1, i));
    }

    return dates;
  };

  const weekDates = useMemo(() => getWeekDates(currentDate), [currentDate]);
  const monthDates = useMemo(() => getMonthDates(currentDate), [currentDate]);

  const goToPreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const goToNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const goToPreviousDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 1);
    setCurrentDate(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 1);
    setCurrentDate(newDate);
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateDisplay = (date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatMonthDisplay = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const timeSlots = [
    '08:00 AM', '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM',
  ];

  const filteredEvents = useMemo(() => {
    return events.filter((ev) => {
      if (searchQuery && !ev.title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (ev.isGoogle && !filters.googleCalendar) return false;
      return true;
    });
  }, [events, searchQuery, filters]);

  const getEventsForDate = (date) => {
    const targetKey = formatDateKey(date);
    return filteredEvents.filter((ev) => formatDateKey(new Date(ev.start)) === targetKey);
  };

  const getEventsForSlot = (date, hourIndex) => {
    const targetKey = formatDateKey(date);
    const slotHour = 8 + hourIndex;
    return filteredEvents.filter((ev) => {
      const evDate = new Date(ev.start);
      if (formatDateKey(evDate) !== targetKey) return false;
      const evHour = evDate.getHours();
      return evHour === slotHour;
    });
  };

  const handleDeleteEvent = (idToDelete) => {
    setEvents((prev) => prev.filter((e) => e.id !== idToDelete));
    if (selectedEvent?.id === idToDelete) {
      setSelectedEvent(null);
    }
  };

  return (
    <div className="p-8 max-w-[1600px] mx-auto min-h-screen">
      {/* Header Banner */}
      <div
        className={`p-6 rounded-3xl mb-8 border relative overflow-hidden flex items-center justify-between ${
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
              Calendar & Schedule
            </span>
            {isGoogleSynced && (
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-500 flex items-center gap-1.5 border border-blue-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></span>
                Google Calendar Connected
              </span>
            )}
          </div>
          <h1 className="font-display text-3xl font-bold mb-1">Time & Schedule Hub</h1>
          <p className="text-sm opacity-70">
            Manage your academic lectures, project milestones, team calls, and Google Calendar sync seamlessly.
          </p>
        </div>
        <div className="hidden md:flex items-center gap-3">
          <div
            className={`px-4 py-3 rounded-2xl border text-center ${
              isDark ? 'bg-[#3B1319] border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <div className="text-2xl font-bold font-display text-[#B46A72]">
              {events.length}
            </div>
            <div className="text-xs opacity-60">Scheduled Events</div>
          </div>
        </div>
      </div>

      {/* Sync Success & Error Alerts */}
      {syncSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle size={18} />
            <span className="font-medium">{syncSuccessMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncSuccessMsg(null)}
            className="p-1 hover:opacity-75 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {syncError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-sm flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} />
            <span>{syncError}</span>
          </div>
          <button
            type="button"
            onClick={() => setSyncError(null)}
            className="p-1 hover:opacity-75 transition-opacity"
          >
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Controls */}
        <aside className="w-full lg:w-80 space-y-6">
          {/* Google Calendar Sync Widget */}
          <div
            className={`p-5 rounded-2xl border ${
              isDark
                ? 'bg-[#3B1319] border-[#7B694E]/40'
                : 'bg-white border-[#F7C8D3]/60'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold text-sm shadow-sm">
                  G
                </div>
                <div>
                  <h4 className="font-bold text-sm">Google Calendar</h4>
                  <p className="text-[11px] opacity-60">
                    {isGoogleSynced
                      ? googleUser?.summary || 'Connected & Synced'
                      : 'Not Connected'}
                  </p>
                </div>
              </div>
              {isGoogleSynced ? (
                <CheckCircle size={18} className="text-emerald-500" />
              ) : (
                <button
                  type="button"
                  onClick={() => setShowGoogleConfigModal(true)}
                  title="Configure Client ID"
                  className="p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <Key size={15} />
                </button>
              )}
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={handleSyncGoogleCalendar}
                disabled={isSyncing}
                className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 shadow-sm ${
                  isGoogleSynced
                    ? isDark
                      ? 'bg-[#7B694E]/30 text-[#C6B39A] hover:bg-red-500/20 hover:text-red-400'
                      : 'bg-[#F7C8D3]/30 text-[#2D3A47] hover:bg-red-100 hover:text-red-600'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
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

              {isGoogleSynced && storedAccessToken && (
                <button
                  type="button"
                  onClick={() => fetchCalendarEventsWithToken(storedAccessToken)}
                  disabled={isSyncing}
                  className={`w-full py-2 px-3 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-1.5 ${
                    isDark
                      ? 'bg-[#4A1A22] text-[#F7EFE6] hover:bg-[#7B694E]/40'
                      : 'bg-gray-100 text-[#2D3A47] hover:bg-gray-200'
                  }`}
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                  Refresh Calendar Events
                </button>
              )}
            </div>
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
                  type="button"
                  onClick={goToPreviousMonth}
                  className={`p-1 rounded transition-colors ${isDark ? 'hover:bg-[#7B694E]/30' : 'hover:bg-[#F7C8D3]/30'}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  type="button"
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
                    type="button"
                    onClick={() => setCurrentDate(new Date(date))}
                    className={`h-8 rounded-lg transition-colors font-semibold ${
                      isToday
                        ? 'bg-[#A8B58A] text-white'
                        : isSelected
                        ? 'bg-[#B46A72] text-white'
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
                <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                    className="w-4 h-4 rounded accent-[#B46A72]"
                  />
                  <span className="capitalize">
                    {key === 'googleCalendar' ? 'Google Calendar Events' : key.replace(/([A-Z])/g, ' $1').trim()}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Calendar View */}
        <main className="flex-1 min-w-0">
          {/* Calendar Header Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
            <div className="flex items-center gap-3">
              <button
                type="button"
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
                type="button"
                onClick={view === 'daily' ? goToNextDay : view === 'weekly' ? goToNextWeek : goToNextMonth}
                className={`p-2 rounded-lg transition-colors ${isDark ? 'hover:bg-[#3B1319]' : 'hover:bg-[#F7C8D3]/30'}`}
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
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
                {['daily', 'weekly', 'monthly'].map((v) => (
                  <button
                    key={v}
                    type="button"
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

          {/* Calendar Views */}
          {view === 'daily' ? (
            <DailyView
              isDark={isDark}
              currentDate={currentDate}
              getEventsForDate={getEventsForDate}
              onSelectEvent={setSelectedEvent}
            />
          ) : view === 'weekly' ? (
            <WeeklyView
              isDark={isDark}
              weekDates={weekDates}
              getEventsForSlot={getEventsForSlot}
              timeSlots={timeSlots}
              onSelectEvent={setSelectedEvent}
            />
          ) : (
            <MonthlyView
              isDark={isDark}
              monthDates={monthDates}
              currentDate={currentDate}
              getEventsForDate={getEventsForDate}
              onSelectEvent={setSelectedEvent}
            />
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

      {/* Event Details Modal */}
      {selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          isDark={isDark}
          onClose={() => setSelectedEvent(null)}
          onDelete={handleDeleteEvent}
        />
      )}

      {/* Google Config / Setup Modal */}
      {showGoogleConfigModal && (
        <GoogleConfigModal
          isDark={isDark}
          currentClientId={googleClientId}
          onClose={() => setShowGoogleConfigModal(false)}
          onSaveAndConnect={handleSaveClientIdAndConnect}
          onDemoSync={handleDemoSync}
        />
      )}
    </div>
  );
}

function DailyView({ isDark, currentDate, getEventsForDate, onSelectEvent }) {
  const events = getEventsForDate(currentDate);

  return (
    <div
      className={`p-6 rounded-3xl border min-h-[500px] ${
        isDark ? 'bg-[#3B1319] border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]/60'
      }`}
    >
      <h3 className="font-display font-bold text-xl mb-6">
        Events for {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
      </h3>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
          <CalendarIcon size={48} className="mb-3 stroke-1" />
          <p className="font-semibold">No events scheduled for this day</p>
          <p className="text-xs">Click 'Create Event' to add one.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((ev) => (
            <div
              key={ev.id}
              onClick={() => onSelectEvent(ev)}
              className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all hover:scale-[1.01] ${
                isDark ? 'bg-[#4A1A22] border-[#7B694E]/30 hover:border-[#C6B39A]/60' : 'bg-[#FFF6F8] border-[#F7C8D3]/40 hover:border-[#B46A72]/60'
              }`}
            >
              <div className="flex items-center gap-4">
                <div
                  className="w-3.5 h-12 rounded-full shrink-0"
                  style={{ backgroundColor: ev.color }}
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-base">{ev.title}</h4>
                    {ev.isGoogle && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white">
                        Google
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs opacity-70 mt-1">
                    <span className="flex items-center gap-1">
                      <Clock size={14} />
                      {ev.start.includes('T') ? ev.start.split('T')[1].slice(0, 5) : 'All Day'} - {ev.end.includes('T') ? ev.end.split('T')[1].slice(0, 5) : 'All Day'}
                    </span>
                    {ev.attendees && (
                      <span className="flex items-center gap-1">
                        <Users size={14} />
                        {ev.attendees} attendees
                      </span>
                    )}
                    {ev.location && (
                      <span className="flex items-center gap-1 truncate max-w-[200px]">
                        <MapPin size={14} />
                        {ev.location}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeeklyView({ isDark, weekDates, getEventsForSlot, timeSlots, onSelectEvent }) {
  return (
    <div
      className={`rounded-3xl border overflow-hidden ${
        isDark ? 'bg-[#3B1319] border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]/60'
      }`}
    >
      {/* Days Header */}
      <div className="grid grid-cols-8 border-b border-inherit">
        <div className="p-4 text-xs font-semibold opacity-50 text-center border-r border-inherit">
          Time
        </div>
        {weekDates.map((date, i) => {
          const isToday = formatDateKey(date) === formatDateKey(new Date());
          return (
            <div
              key={i}
              className={`p-4 text-center border-r border-inherit last:border-r-0 ${
                isToday ? (isDark ? 'bg-[#7B694E]/20' : 'bg-[#F7C8D3]/20') : ''
              }`}
            >
              <div className="text-xs opacity-60 font-medium">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-lg font-bold font-display ${isToday ? 'text-[#B46A72]' : ''}`}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Slots Grid */}
      <div className="divide-y divide-inherit">
        {timeSlots.map((slot, hourIndex) => (
          <div key={slot} className="grid grid-cols-8 min-h-[92px]">
            <div className="p-3 text-xs font-semibold opacity-50 text-center border-r border-inherit flex items-start justify-center pt-2">
              {slot}
            </div>
            {weekDates.map((date, dayIndex) => {
              const slotEvents = getEventsForSlot(date, hourIndex);
              return (
                <div
                  key={dayIndex}
                  className="p-1.5 border-r border-inherit last:border-r-0 relative group hover:bg-black/5 dark:hover:bg-white/5 transition-colors overflow-hidden"
                >
                  {slotEvents.map((ev) => (
                    <div
                      key={ev.id}
                      onClick={() => onSelectEvent(ev)}
                      className="p-2 rounded-xl text-white text-xs font-semibold shadow-sm mb-1.5 cursor-pointer hover:brightness-110 hover:scale-[1.02] transition-all"
                      style={{ backgroundColor: ev.color }}
                      title={ev.title}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <div className="font-bold truncate">{ev.title}</div>
                        {ev.isGoogle && (
                          <span className="w-2 h-2 rounded-full bg-white shrink-0" title="Google Calendar" />
                        )}
                      </div>
                      <div className="text-[10px] opacity-90 mt-0.5">
                        {ev.start.includes('T') ? ev.start.split('T')[1].slice(0, 5) : 'All Day'}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

function MonthlyView({ isDark, monthDates, currentDate, getEventsForDate, onSelectEvent }) {
  return (
    <div
      className={`rounded-3xl border overflow-hidden ${
        isDark ? 'bg-[#3B1319] border-[#7B694E]/40' : 'bg-white border-[#F7C8D3]/60'
      }`}
    >
      <div className="grid grid-cols-7 border-b border-inherit text-center text-xs font-semibold py-3 opacity-65">
        <div>Sun</div>
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
      </div>

      <div className="grid grid-cols-7 grid-rows-6 h-[720px]">
        {monthDates.map((date, idx) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth();
          const dayEvents = getEventsForDate(date);

          return (
            <div
              key={idx}
              className={`p-2 border-b border-r border-inherit flex flex-col overflow-hidden ${
                isCurrentMonth ? '' : isDark ? 'bg-black/20 opacity-40' : 'bg-gray-50/50 opacity-40'
              }`}
            >
              <div className="text-xs font-bold mb-1 flex items-center justify-between">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center ${
                    formatDateKey(date) === formatDateKey(new Date())
                      ? 'bg-[#A8B58A] text-white'
                      : ''
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] opacity-50">{dayEvents.length}</span>
                )}
              </div>
              <div className="flex-1 overflow-y-auto space-y-1">
                {dayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    onClick={() => onSelectEvent(ev)}
                    className="text-[10px] px-1.5 py-1 rounded text-white font-medium truncate cursor-pointer hover:brightness-110 transition-all flex items-center justify-between gap-1"
                    style={{ backgroundColor: ev.color }}
                    title={ev.title}
                  >
                    <span className="truncate">{ev.title}</span>
                    {ev.isGoogle && <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Event Details View Modal
function EventDetailModal({ event, isDark, onClose, onDelete }) {
  const isGoogle = event.isGoogle;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-md rounded-3xl p-6 border shadow-2xl ${
          isDark ? 'bg-[#3B1319] border-[#7B694E]/50 text-[#F7EFE6]' : 'bg-white border-[#F7C8D3]/80 text-[#2D3A47]'
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div
              className="w-3.5 h-3.5 rounded-full"
              style={{ backgroundColor: event.color }}
            />
            {isGoogle ? (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                Google Calendar
              </span>
            ) : (
              <span className="text-xs font-semibold opacity-60">Personal Schedule</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${isDark ? 'hover:bg-[#7B694E]/30' : 'hover:bg-[#F7C8D3]/30'}`}
          >
            <X size={18} />
          </button>
        </div>

        <h3 className="font-display font-bold text-2xl mb-4 leading-tight">{event.title}</h3>

        <div className="space-y-3 py-2 text-sm">
          <div className="flex items-center gap-3 opacity-80">
            <Clock size={16} className="text-[#B46A72] shrink-0" />
            <div>
              <p className="font-semibold">
                {new Date(event.start).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
              </p>
              <p className="text-xs opacity-75">
                {event.start.includes('T') ? event.start.split('T')[1].slice(0, 5) : 'All Day'} – {event.end.includes('T') ? event.end.split('T')[1].slice(0, 5) : 'All Day'}
              </p>
            </div>
          </div>

          {event.attendees && (
            <div className="flex items-center gap-3 opacity-80">
              <Users size={16} className="text-[#B46A72] shrink-0" />
              <span>{event.attendees} attendees</span>
            </div>
          )}

          {event.location && (
            <div className="flex items-center gap-3 opacity-80">
              <MapPin size={16} className="text-[#B46A72] shrink-0" />
              <span className="break-words">{event.location}</span>
            </div>
          )}

          {event.description && (
            <div className={`p-3 rounded-xl border text-xs mt-3 ${
              isDark ? 'bg-[#4A1A22]/60 border-[#7B694E]/30' : 'bg-[#FFF6F8] border-[#F7C8D3]/50'
            }`}>
              <div className="font-bold mb-1 opacity-70 uppercase tracking-wider text-[10px]">Description</div>
              <p className="whitespace-pre-line opacity-90">{event.description}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 pt-6 mt-4 border-t border-inherit">
          {isGoogle && event.htmlLink ? (
            <a
              href={event.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-500 hover:underline"
            >
              Open in Google Calendar
              <ExternalLink size={13} />
            </a>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onDelete(event.id)}
              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-red-500 hover:bg-red-500/10 transition-colors flex items-center gap-1"
            >
              <Trash2 size={13} />
              Remove
            </button>
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                isDark ? 'bg-[#4A1A22] text-[#C6B39A] hover:bg-[#7B694E]/40' : 'bg-gray-100 text-[#2D3A47] hover:bg-gray-200'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Google Client ID Setup & Instructions Modal
function GoogleConfigModal({ isDark, currentClientId, onClose, onSaveAndConnect, onDemoSync }) {
  const [clientIdInput, setClientIdInput] = useState(currentClientId || '');
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl ${
          isDark ? 'bg-[#3B1319] border-[#7B694E]/50 text-[#F7EFE6]' : 'bg-white border-[#F7C8D3]/80 text-[#2D3A47]'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 text-white flex items-center justify-center font-bold text-lg shadow-md">
              G
            </div>
            <div>
              <h3 className="font-display font-bold text-xl">Connect Google Calendar</h3>
              <p className="text-xs opacity-60">Authorize and sync lectures & meetings via Google OAuth</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${isDark ? 'hover:bg-[#7B694E]/30' : 'hover:bg-[#F7C8D3]/30'}`}
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4 my-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1.5 opacity-80">
              Google Cloud OAuth Client ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={clientIdInput}
                onChange={(e) => setClientIdInput(e.target.value)}
                placeholder="123456789-abcdef.apps.googleusercontent.com"
                className={`w-full px-4 py-2.5 rounded-xl border text-sm font-mono transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A] focus:ring-[#C6B39A]/20'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72] focus:ring-[#B46A72]/20'
                }`}
              />
            </div>
            <p className="text-[11px] opacity-60 mt-1">
              You can also paste this into <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">frontend/.env</code> as <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10">VITE_GOOGLE_CLIENT_ID</code>.
            </p>
          </div>

          {/* Quick Guide Accordion */}
          <div className={`rounded-2xl border p-3.5 text-xs ${
            isDark ? 'bg-[#4A1A22]/50 border-[#7B694E]/30' : 'bg-[#FFF6F8] border-[#F7C8D3]/40'
          }`}>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="flex items-center justify-between w-full font-semibold text-left"
            >
              <span className="flex items-center gap-1.5 text-blue-500">
                <Info size={14} />
                How to get your free Google Client ID in 2 minutes
              </span>
              <ChevronRight
                size={14}
                className={`transition-transform ${showGuide ? 'rotate-90' : ''}`}
              />
            </button>

            {showGuide && (
              <ol className="list-decimal list-inside space-y-1.5 mt-3 pl-1 opacity-90 leading-relaxed border-t border-inherit pt-2.5">
                <li>
                  Open{' '}
                  <a
                    href="https://console.cloud.google.com/apis/credentials"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-500 underline"
                  >
                    Google Cloud Credentials Console
                  </a>
                </li>
                <li>Click <strong>+ CREATE CREDENTIALS</strong> &rarr; <strong>OAuth client ID</strong></li>
                <li>Select Application Type: <strong>Web application</strong></li>
                <li>
                  Under <em>Authorized JavaScript origins</em>, add:{' '}
                  <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono text-[10px]">
                    {typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}
                  </code>
                </li>
                <li>Under <em>Library</em>, ensure <strong>Google Calendar API</strong> is enabled.</li>
                <li>Copy your <strong>Client ID</strong> and paste it into the box above!</li>
              </ol>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-inherit">
          <button
            type="button"
            onClick={onDemoSync}
            className={`w-full sm:w-auto px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all ${
              isDark
                ? 'border-[#7B694E]/50 text-[#C6B39A] hover:bg-[#7B694E]/20'
                : 'border-[#F7C8D3] text-[#2D3A47] hover:bg-[#FFF0F3]'
            }`}
          >
            ⚡ Try Instant Demo Preview
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                isDark ? 'bg-[#4A1A22] text-[#C6B39A] hover:bg-[#7B694E]/30' : 'bg-gray-100 text-[#2D3A47] hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!clientIdInput.trim()}
              onClick={() => onSaveAndConnect(clientIdInput)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              Save & Open Google Sign-In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EventModal({ isDark, onClose, onSave }) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(() => formatDateKey(new Date()));
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [color, setColor] = useState('#B46A72');
  const [attendees, setAttendees] = useState(2);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newEvent = {
      id: 'evt-' + Date.now(),
      title,
      start: `${date}T${startTime}:00`,
      end: `${date}T${endTime}:00`,
      color,
      attendees: Number(attendees),
      location,
      description,
      day: new Date(date).toLocaleDateString('en-US', { weekday: 'long' }),
    };

    onSave(newEvent);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 border shadow-2xl ${
          isDark ? 'bg-[#3B1319] border-[#7B694E]/50 text-[#F7EFE6]' : 'bg-white border-[#F7C8D3]/80 text-[#2D3A47]'
        }`}
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-bold text-xl">Create New Event</h3>
          <button
            type="button"
            onClick={onClose}
            className={`p-1.5 rounded-xl transition-colors ${isDark ? 'hover:bg-[#7B694E]/30' : 'hover:bg-[#F7C8D3]/30'}`}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Event Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Study Group Review Session"
              required
              className={`w-full px-4 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                  : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
              }`}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Date</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
                }`}
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                required
                className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Color Tag</label>
              <div className="flex items-center gap-3 pt-1">
                {['#B46A72', '#768E78', '#A8B58A', '#FCC88A', '#B7CBDB', '#E79897'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-white shadow-md' : 'opacity-80 hover:opacity-100'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Attendees Count</label>
              <input
                type="number"
                min="1"
                max="100"
                value={attendees}
                onChange={(e) => setAttendees(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                  isDark
                    ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                    : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
                }`}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Location / Meeting Link</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Room 402 or Google Meet"
              className={`w-full px-4 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                  : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
              }`}
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70">Notes / Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agenda or topics to discuss..."
              className={`w-full px-4 py-2 rounded-xl border text-sm transition-all focus:outline-none focus:ring-2 ${
                isDark
                  ? 'bg-[#4A1A22] border-[#7B694E]/40 text-[#F7EFE6] focus:border-[#C6B39A]'
                  : 'bg-white border-[#F7C8D3]/60 text-[#2D3A47] focus:border-[#B46A72]'
              }`}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-inherit">
            <button
              type="button"
              onClick={onClose}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                isDark ? 'bg-[#4A1A22] text-[#C6B39A] hover:bg-[#7B694E]/30' : 'bg-gray-100 text-[#2D3A47] hover:bg-gray-200'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#B46A72] text-white font-semibold text-sm shadow-sm hover:bg-[#A05563] transition-all"
            >
              Add Event
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
