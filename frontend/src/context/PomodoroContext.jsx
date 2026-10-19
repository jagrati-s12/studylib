import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const PomodoroContext = createContext(undefined);

const DEFAULT_DURATIONS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  stopwatch: 0, // Count-up study timer mode
};

export function PomodoroProvider({ children }) {
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro' | 'shortBreak' | 'stopwatch'

  // Custom durations editable by user
  const [durations, setDurations] = useState({
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
  });

  // Store individual timer states
  const [times, setTimes] = useState({
    pomodoro: 25 * 60,
    shortBreak: 5 * 60,
    stopwatch: 0, // Elapsed seconds in stopwatch mode
  });

  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [miniDismissed, setMiniDismissed] = useState(false);

  const timerRef = useRef(null);

  const timeLeft = times[mode];

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimes((prevTimes) => {
          if (mode === 'stopwatch') {
            // Count up
            return { ...prevTimes, stopwatch: prevTimes.stopwatch + 1 };
          } else {
            // Countdown (pomodoro or shortBreak)
            const currentModeTime = prevTimes[mode];
            if (currentModeTime <= 1) {
              setIsRunning(false);
              if (mode === 'pomodoro') {
                setSessionsCompleted((c) => c + 1);
              }
              return { ...prevTimes, [mode]: 0 };
            }
            return { ...prevTimes, [mode]: currentModeTime - 1 };
          }
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, mode]);

  const switchMode = (newMode) => {
    if (isRunning) {
      return; // Can't switch mode while timer is actively running
    }
    setMode(newMode);
    setMiniDismissed(false);
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
    setMiniDismissed(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      // Save or record elapsed time if needed, then reset stopwatch to 0
      const elapsed = times.stopwatch;
      if (elapsed > 60) {
        const addedHours = Number((elapsed / 3600).toFixed(1));
        console.log(`Saved stopwatch study session: ${addedHours} hours`);
      }
      setTimes((prev) => ({ ...prev, stopwatch: 0 }));
    } else {
      // If resetting a pomodoro session that was partially completed, log/save partial study time
      const initialTime = durations[mode] || 25 * 60;
      const elapsedSeconds = initialTime - times[mode];
      if (mode === 'pomodoro' && elapsedSeconds > 60) {
        const completedMinutes = Math.round(elapsedSeconds / 60);
        console.log(`Saved partial focus session: ${completedMinutes} minutes`);
        // Optionally increment sessions or record analytics if desired
      }
      setTimes((prev) => ({
        ...prev,
        [mode]: initialTime,
      }));
    }
  };

  const updateDuration = (newPomodoroMins, newBreakMins) => {
    const pSec = newPomodoroMins * 60;
    const bSec = newBreakMins * 60;
    setDurations({ pomodoro: pSec, shortBreak: bSec });
    if (!isRunning) {
      setTimes((prev) => ({
        ...prev,
        pomodoro: pSec,
        shortBreak: bSec,
      }));
    }
  };

  const totalTime = mode === 'stopwatch' ? Math.max(times.stopwatch, 1) : durations[mode] || 25 * 60;
  const progressPercent = mode === 'stopwatch' ? 100 : ((totalTime - timeLeft) / totalTime) * 100;

  const displaySeconds = mode === 'stopwatch' ? times.stopwatch : timeLeft;
  const minutes = Math.floor(displaySeconds / 60);
  const seconds = displaySeconds % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <PomodoroContext.Provider
      value={{
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
        totalTime,
        durations,
        updateDuration,
        miniDismissed,
        setMiniDismissed,
        setSessionsCompleted,
      }}
    >
      {children}
    </PomodoroContext.Provider>
  );
}

export function usePomodoro() {
  const context = useContext(PomodoroContext);
  if (!context) {
    throw new Error('usePomodoro must be used within a PomodoroProvider');
  }
  return context;
}
