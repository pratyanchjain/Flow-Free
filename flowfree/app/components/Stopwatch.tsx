import React, { useState, useEffect, useRef } from 'react';

const Stopwatch = ({isActive} : {isActive: Boolean}) => {
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

  return (
      <h4>{formatTime(time)}</h4>
  );
};

export default Stopwatch;