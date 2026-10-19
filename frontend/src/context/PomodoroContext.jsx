import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const PomodoroContext = createContext(undefined);

const DURATIONS = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function PomodoroProvider({ children }) {
  const [mode, setMode] = useState('pomodoro'); // 'pomodoro' | 'shortBreak' | 'longBreak'
  const [timeLeft, setTimeLeft] = useState(DURATIONS.pomodoro);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(4);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [miniDismissed, setMiniDismissed] = useState(false);

  const timerRef = useRef(null);

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsRunning(false);
            if (mode === 'pomodoro') {
              setSessionsCompleted((c) => c + 1);
            }
            return 0;
          }
          return prev - 1;
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
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(DURATIONS[newMode]);
    setMiniDismissed(false);
  };

  const toggleTimer = () => {
    setIsRunning((prev) => !prev);
    setMiniDismissed(false);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(DURATIONS[mode]);
  };

  const totalTime = DURATIONS[mode];
  const progressPercent = ((totalTime - timeLeft) / totalTime) * 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
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
