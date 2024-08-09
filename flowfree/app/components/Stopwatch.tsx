import React, { useState, useEffect, useRef } from 'react';
interface StopwatchProps {
  isActive: boolean;
  onStop?: (time: number) => void; // Add an optional onStop callback
}
const Stopwatch: React.FC<StopwatchProps> = ({isActive, onStop}) => {
  const [time, setTime] = useState<number>(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    startTimeRef.current = Date.now() - time;

    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
        interval = setInterval(() => {
        if (startTimeRef.current !== null) {
            setTime(Date.now() - startTimeRef.current);
        }
        }, 1000 / 60); // Update every 16.67ms (approx. 60fps
    }
    else if (startTimeRef.current !== null && onStop) {
      onStop(time);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive]);

  const formatTime = (time: number) => {
    const getMilliseconds = `0${time % 1000}`.slice(-3);
    const seconds = Math.floor(time / 1000);
    const getSeconds = `0${seconds % 60}`.slice(-2);
    const minutes = Math.floor(seconds / 60);
    const getMinutes = `0${minutes % 60}`.slice(-2);
    return `${getMinutes}:${getSeconds}.${getMilliseconds}`;
  };

  const stopwatchStyle = {
    fontFamily: 'monospace',
    textAlign: 'center' as const,
    width: '200px', // Slightly larger fixed width
    margin: '0 auto',
  };

  return (
      <h4 style={stopwatchStyle}>{formatTime(time)}</h4>
  );
};

export default Stopwatch;