import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseTimerProps {
  initialTime: number;
  onComplete?: () => void;
  onTick?: (remainingTime: number) => void;
  updateDocumentTitle?: boolean;
  titlePrefix?: string;
  enableSounds?: boolean;
  onStart?: () => void;
}

export interface UseTimerReturn {
  remainingTime: number;
  isRunning: boolean;
  isPaused: boolean;
  start: (time?: number) => void;
  pause: () => void;
  resume: () => void;
  stop: () => void;
  reset: () => void;
  setTime: (time: number) => void;
}

export function useTimer({
  initialTime,
  onComplete,
  onTick,
  updateDocumentTitle = false,
  titlePrefix = '',
  enableSounds = true,
  onStart,
}: UseTimerProps): UseTimerReturn {
  const [remainingTime, setRemainingTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const originalTitleRef = useRef<string | undefined>(undefined);

  // Salva o título original na primeira renderização
  useEffect(() => {
    if (updateDocumentTitle && !originalTitleRef.current) {
      originalTitleRef.current = document.title;
    }
  }, [updateDocumentTitle]);

  const formatTimer = useCallback((time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = time % 60;

    return (time >= 3600 ? `${String(hours).padStart(2, "0")}:` : "").concat(
      `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`,
    );
  }, []);

  const updateTitle = useCallback((time: number) => {
    if (updateDocumentTitle) {
      const formattedTime = formatTimer(time);
      const prefix = titlePrefix ? `${titlePrefix} - ` : '';
      document.title = time > 0 
        ? `${formattedTime} - ${prefix}${originalTitleRef.current}`
        : originalTitleRef.current || '';
    }
  }, [updateDocumentTitle, titlePrefix, formatTimer]);

  const playSound = useCallback((soundFile: string, fallbackFrequencies?: number[]) => {
    if (!enableSounds) return;
    
    try {
      const audio = new Audio(`/sounds/${soundFile}`);
      audio.volume = 0.5;
      audio.play().catch(() => {
        // Fallback: gerar som com Web Audio API
        if (fallbackFrequencies) {
          const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          // Aplicar frequências do fallback
          fallbackFrequencies.forEach((freq, index) => {
            oscillator.frequency.setValueAtTime(freq, audioContext.currentTime + (index * 0.1));
          });
          
          gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + (fallbackFrequencies.length * 0.1));
          
          oscillator.start(audioContext.currentTime);
          oscillator.stop(audioContext.currentTime + (fallbackFrequencies.length * 0.1));
        }
      });
    } catch (error) {
      console.log('Sound notification failed:', error);
    }
  }, [enableSounds]);

  const playStartSound = useCallback(() => {
    playSound('start.mp3', [600, 800]); // Tom ascendente para início
  }, [playSound]);

  const playEndSound = useCallback(() => {
    playSound('end.mp3', [800, 600, 800]); // Tom de notificação para fim
  }, [playSound]);

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  const start = useCallback((time?: number) => {
    const startTime = time ?? initialTime;
    setRemainingTime(startTime);
    setIsRunning(true);
    setIsPaused(false);
    updateTitle(startTime);
    
    // Tocar som de início e chamar callback
    playStartSound();
    onStart?.();
  }, [initialTime, updateTitle, playStartSound, onStart]);

  const pause = useCallback(() => {
    setIsPaused(true);
    setIsRunning(false);
    clearTimer();
  }, [clearTimer]);

  const resume = useCallback(() => {
    setIsPaused(false);
    setIsRunning(true);
  }, []);

  const stop = useCallback(() => {
    setRemainingTime(0);
    setIsRunning(false);
    setIsPaused(false);
    clearTimer();
    updateTitle(0);
  }, [clearTimer, updateTitle]);

  const reset = useCallback(() => {
    stop();
    setRemainingTime(initialTime);
    updateTitle(initialTime);
  }, [stop, initialTime, updateTitle]);

  const setTime = useCallback((time: number) => {
    setRemainingTime(time);
    if (!isRunning) {
      updateTitle(time);
    }
  }, [isRunning, updateTitle]);

  // Effect para gerenciar o timer
  useEffect(() => {
    if (isRunning && !isPaused) {
      intervalRef.current = setInterval(() => {
        setRemainingTime((prevTime) => {
          const newTime = prevTime - 1;
          
          // Atualiza título
          updateTitle(newTime);
          
          // Chama callback de tick
          onTick?.(newTime);
          
          // Verifica se chegou ao fim
          if (newTime <= 0) {
            setIsRunning(false);
            setIsPaused(false);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
              intervalRef.current = undefined;
            }
            
            // Toca som de fim e chama callback
            playEndSound();
            onComplete?.();
            
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      clearTimer();
    }

    return clearTimer;
  }, [isRunning, isPaused, onComplete, onTick, playEndSound, clearTimer, updateTitle]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (updateDocumentTitle && originalTitleRef.current) {
        document.title = originalTitleRef.current;
      }
    };
  }, [clearTimer, updateDocumentTitle]);

  return {
    remainingTime,
    isRunning,
    isPaused,
    start,
    pause,
    resume,
    stop,
    reset,
    setTime,
  };
}