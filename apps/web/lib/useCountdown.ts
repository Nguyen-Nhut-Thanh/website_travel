"use client";

import { useState, useEffect } from "react";

export function useCountdown(targetDate: string) {
  const calculate = () => {
    const now = Date.now();
    const target = new Date(targetDate).getTime();
    const diff = Math.max(target - now, 0);

    const totalSeconds = Math.floor(diff / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return { days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState(calculate);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setTimeLeft(calculate());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [targetDate]);

  return timeLeft;
}
