import { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Timer, Flame, CheckCircle2, Volume2, VolumeX, Sparkles, Clock } from 'lucide-react';
import { usePomodoro } from '@/context/PomodoroContext';
import { useTheme } from '@/context/ThemeContext';

export default function PomodoroPage() {
  const { isDark, isNotion } = useTheme();
  const {
    mode,
    timeLeft,
    isRunning,
    sessionsCompleted,
    soundEnabled,
    setSoundEnabled,
    switchMode,
    toggleTimer,
    resetTimer,
    formattedTime,
    progressPercent,
    durations,
    updateDuration,
  } = usePomodoro();

  const [pomodoroMinsInput, setPomodoroMinsInput] = useState(25);
  const [breakMinsInput, setBreakMinsInput] = useState(5);

  const handleApplyCustomTime = (e) => {
    e.preventDefault();
    updateDuration(Number(pomodoroMinsInput) || 25, Number(breakMinsInput) || 5);
  };

  const activeModeBtnStyle = isNotion
    ? isDark
      ? 'bg-[#2F2F2F] text-white border border-[#373737] shadow-md'
      : 'bg-[#37352F] text-white shadow-md'
    : 'bg-[#B46A72] text-white shadow-md';

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-inherit">
        <div>
          <div className="flex items-center gap-2">
            <span className={`p-2 rounded-xl text-white shadow-sm ${isNotion ? (isDark ? 'bg-[#2F2F2F] border border-[#373737]' : 'bg-[#37352F]') : 'bg-[#B46A72]'}`}>
              <Timer size={22} />
            </span>
            <h1 className="text-3xl font-display font-bold tracking-tight text-inherit">Study Timer & Stopwatch</h1>
          </div>
          <p className="text-sm opacity-70 mt-1">
            Boost your study focus with structured intervals or study as long as you want with the stopwatch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-xs font-semibold ${
              isNotion
                ? isDark
                  ? 'bg-[#202020] border-[#373737] text-[#D4D4D4]'
                  : 'bg-white border-[#E9E9E7] text-[#37352F] shadow-sm'
                : isDark
                ? 'bg-[#3B1319]/70 border-[#7B694E]/40 text-[#C6B39A]'
                : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
            }`}
          >
            <Flame size={16} className={isNotion ? (isDark ? 'text-amber-400' : 'text-[#37352F]') : 'text-[#B46A72]'} />
            <span>{sessionsCompleted} Sessions Completed Today</span>
          </div>

          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
              isNotion
                ? isDark
                  ? 'bg-[#202020] border-[#373737] text-[#D4D4D4] hover:bg-[#2F2F2F]'
                  : 'bg-white border-[#E9E9E7] text-[#37352F] hover:bg-[#EFEFED] shadow-sm'
                : isDark
                ? 'bg-[#3B1319]/70 border-[#7B694E]/40 text-[#C6B39A]'
                : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
            }`}
            title={soundEnabled ? 'Mute sound' : 'Enable sound'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>
      </div>

      {/* Main Timer Widget Card */}
      <div
        className={`p-8 md:p-12 rounded-3xl border text-center relative overflow-hidden transition-all shadow-lg ${
          isNotion
            ? isDark
              ? 'bg-[#202020] border-[#373737] text-[#D4D4D4]'
              : 'bg-white border-[#E9E9E7] text-[#37352F]'
            : isDark
            ? 'bg-gradient-to-br from-[#280B0F] to-[#3B1319]/80 border-[#3B1319] text-[#C6B39A]'
            : 'bg-gradient-to-br from-white to-[#FFF5F6] border-[#F7C8D3] text-[#2D3A47]'
        }`}
      >
        {/* Mode Selector Tabs (Replaced long break with open stopwatch timer) */}
        <div className="inline-flex p-1.5 rounded-2xl bg-black/10 dark:bg-black/30 mb-8 backdrop-blur-sm gap-1">
          <button
            type="button"
            onClick={() => switchMode('pomodoro')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'pomodoro' ? activeModeBtnStyle : 'opacity-70 hover:opacity-100'
            }`}
          >
            Study Focus ({Math.round(durations.pomodoro / 60)}m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('shortBreak')}
            disabled={isRunning && mode === 'pomodoro'}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              isRunning && mode === 'pomodoro' ? 'opacity-40 cursor-not-allowed' : ''
            } ${
              mode === 'shortBreak' ? activeModeBtnStyle : 'opacity-70 hover:opacity-100'
            }`}
          >
            Break ({Math.round(durations.shortBreak / 60)}m)
          </button>
          <button
            type="button"
            onClick={() => switchMode('stopwatch')}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              mode === 'stopwatch' ? activeModeBtnStyle : 'opacity-70 hover:opacity-100'
            }`}
          >
            ⏱️ Unlimited Stopwatch
          </button>
        </div>

        {isRunning && (
          <div className="text-xs text-amber-500 font-semibold mb-4">
            ⚠️ Timer is active. Pause or stop to switch modes or adjust settings.
          </div>
        )}

        {/* Big Countdown / Stopwatch Display */}
        <div className="my-6 relative">
          <div className="text-7xl md:text-9xl font-mono font-black tracking-wider text-inherit drop-shadow-sm">
            {formattedTime}
          </div>
          <p className="text-xs uppercase tracking-widest opacity-60 mt-3 font-semibold">
            {mode === 'pomodoro'
              ? 'Stay focused on your task'
              : mode === 'shortBreak'
              ? 'Time to relax & recharge'
              : 'Study as long as you want (Counts up)'}
          </p>
        </div>

        {/* Progress Bar */}
        {mode !== 'stopwatch' && (
          <div className="max-w-md mx-auto w-full h-2 rounded-full bg-black/10 dark:bg-black/30 mb-8 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isNotion ? (isDark ? 'bg-[#D4D4D4]' : 'bg-[#37352F]') : 'bg-[#B46A72]'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}

        {/* Custom Duration Settings (Option 2: Customizable Duration Picker) */}
        {mode !== 'stopwatch' && !isRunning && (
          <form onSubmit={handleApplyCustomTime} className="max-w-sm mx-auto mb-8 p-4 rounded-2xl border border-inherit bg-black/5 dark:bg-black/20 flex items-center justify-center gap-3">
            <div className="text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 block mb-1">Focus Mins</label>
              <input
                type="number"
                min="1"
                max="180"
                value={pomodoroMinsInput}
                onChange={(e) => setPomodoroMinsInput(e.target.value)}
                className={`w-20 px-3 py-1.5 rounded-xl text-xs border border-inherit text-inherit font-bold outline-none ${
                  isNotion ? (isDark ? 'bg-[#191919]' : 'bg-white') : (isDark ? 'bg-[#1E080C]' : 'bg-white')
                }`}
              />
            </div>
            <div className="text-left">
              <label className="text-[10px] font-bold uppercase tracking-wider opacity-70 block mb-1">Break Mins</label>
              <input
                type="number"
                min="1"
                max="60"
                value={breakMinsInput}
                onChange={(e) => setBreakMinsInput(e.target.value)}
                className={`w-20 px-3 py-1.5 rounded-xl text-xs border border-inherit text-inherit font-bold outline-none ${
                  isNotion ? (isDark ? 'bg-[#191919]' : 'bg-white') : (isDark ? 'bg-[#1E080C]' : 'bg-white')
                }`}
              />
            </div>
            <button
              type="submit"
              className={`self-end px-4 py-2 rounded-xl text-white text-xs font-semibold hover:opacity-90 shadow-sm cursor-pointer ${
                isNotion ? (isDark ? 'bg-[#2F2F2F] border border-[#373737]' : 'bg-[#37352F]') : 'bg-[#B46A72]'
              }`}
            >
              Set
            </button>
          </form>
        )}

        {/* Action Controls */}
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={toggleTimer}
            className={`px-8 py-4 rounded-2xl font-bold text-base shadow-lg transition-all flex items-center gap-3 cursor-pointer ${
              isRunning
                ? 'bg-amber-600 hover:bg-amber-700 text-white'
                : isNotion
                ? isDark
                  ? 'bg-[#2F2F2F] hover:bg-[#373737] text-white border border-[#373737] scale-105'
                  : 'bg-[#37352F] hover:bg-[#202020] text-white scale-105'
                : 'bg-[#B46A72] hover:bg-[#9f5961] text-white scale-105'
            }`}
          >
            {isRunning ? (
              <>
                <Pause size={20} /> Pause {mode === 'pomodoro' ? 'Focus' : mode === 'shortBreak' ? 'Break' : 'Stopwatch'}
              </>
            ) : (
              <>
                <Play size={20} /> Start / Resume {mode === 'pomodoro' ? 'Focus' : mode === 'shortBreak' ? 'Break' : 'Stopwatch'}
              </>
            )}
          </button>

          <button
            type="button"
            onClick={resetTimer}
            className={`px-6 py-4 rounded-2xl font-bold text-base border transition-all cursor-pointer flex items-center gap-2 ${
              isNotion
                ? isDark
                  ? 'border-[#373737] hover:bg-[#2F2F2F] text-[#D4D4D4]'
                  : 'border-[#E9E9E7] hover:bg-[#EFEFED] text-[#37352F]'
                : isDark
                ? 'border-[#7B694E]/40 hover:bg-[#3B1319] text-[#C6B39A]'
                : 'border-[#2D3A47]/20 hover:bg-[#F7C8D3]/30 text-[#2D3A47]'
            }`}
            title="Reset timer"
          >
            <RotateCcw size={18} /> {mode === 'stopwatch' ? 'Save & Reset' : 'Reset Timer'}
          </button>
        </div>
      </div>

      {/* Quick Tips & Streak Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`p-6 rounded-2xl border transition-all space-y-2 ${
            isNotion
              ? isDark
                ? 'bg-[#202020] border-[#373737] text-[#D4D4D4]'
                : 'bg-white border-[#E9E9E7] text-[#37352F] shadow-sm'
              : isDark
              ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
              : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
          }`}
        >
          <div className={`flex items-center gap-2 font-bold ${isNotion ? (isDark ? 'text-amber-400' : 'text-[#37352F]') : 'text-[#B46A72]'}`}>
            <Sparkles size={18} />
            <h3>Custom Durations</h3>
          </div>
          <p className="text-xs opacity-80 leading-relaxed">
            You can now customize your study focus duration and break duration minutes directly above before starting!
          </p>
        </div>

        <div
          className={`p-6 rounded-2xl border transition-all space-y-2 ${
            isNotion
              ? isDark
                ? 'bg-[#202020] border-[#373737] text-[#D4D4D4]'
                : 'bg-white border-[#E9E9E7] text-[#37352F] shadow-sm'
              : isDark
              ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
              : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
          }`}
        >
          <div className={`flex items-center gap-2 font-bold ${isNotion ? (isDark ? 'text-blue-400' : 'text-[#37352F]') : 'text-[#B46A72]'}`}>
            <Clock size={18} />
            <h3>Unlimited Stopwatch</h3>
          </div>
          <p className="text-xs opacity-80 leading-relaxed">
            Switch to the stopwatch tab to study as long as you want without time limits. Clicking reset saves your study time!
          </p>
        </div>

        <div
          className={`p-6 rounded-2xl border transition-all space-y-2 ${
            isNotion
              ? isDark
                ? 'bg-[#202020] border-[#373737] text-[#D4D4D4]'
                : 'bg-white border-[#E9E9E7] text-[#37352F] shadow-sm'
              : isDark
              ? 'bg-[#280B0F]/70 border-[#3B1319] text-[#C6B39A]'
              : 'bg-white border-[#F7C8D3] text-[#2D3A47] shadow-sm'
          }`}
        >
          <div className={`flex items-center gap-2 font-bold ${isNotion ? (isDark ? 'text-emerald-400' : 'text-[#37352F]') : 'text-[#B46A72]'}`}>
            <CheckCircle2 size={18} />
            <h3>Task Linked Focus</h3>
          </div>
          <p className="text-xs opacity-80 leading-relaxed">
            Every session completed today counts towards your daily syllabus goals and revision mastery score.
          </p>
        </div>
      </div>
    </div>
  );
}
