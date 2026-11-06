import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  expiryTimestamp: number; // in seconds
  isRevoked?: boolean;
  onExpire?: () => void;
  compact?: boolean;
}

export const CountdownTimer: React.FC<CountdownTimerProps> = ({
  expiryTimestamp,
  isRevoked = false,
  onExpire,
  compact = false,
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    totalSeconds: number;
    isExpired: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    totalSeconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      if (isRevoked) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true,
        });
        return;
      }

      const now = Math.floor(Date.now() / 1000);
      const diff = expiryTimestamp - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          totalSeconds: 0,
          isExpired: true,
        });
        if (onExpire) onExpire();
      } else {
        const days = Math.floor(diff / 86400);
        const hours = Math.floor((diff % 86400) / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        const seconds = diff % 60;
        setTimeLeft({
          days,
          hours,
          minutes,
          seconds,
          totalSeconds: diff,
          isExpired: false,
        });
      }
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [expiryTimestamp, isRevoked, onExpire]);

  if (isRevoked) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-rose-400 bg-rose-950/40 border border-rose-800/40 px-2.5 py-1 rounded-full">
        Revoked
      </span>
    );
  }

  if (timeLeft.isExpired) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2.5 py-1 rounded-full">
        Expired
      </span>
    );
  }

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-2.5 py-1 rounded-full">
        <Clock className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
        {timeLeft.days > 0 ? `${timeLeft.days}d ` : ''}
        {String(timeLeft.hours).padStart(2, '0')}:
        {String(timeLeft.minutes).padStart(2, '0')}:
        {String(timeLeft.seconds).padStart(2, '0')}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 font-mono">
      {timeLeft.days > 0 && (
        <div className="flex flex-col items-center bg-gray-900/90 border border-gray-800 px-2.5 py-1 rounded-lg">
          <span className="text-sm font-bold text-cyan-400">{timeLeft.days}</span>
          <span className="text-[10px] text-gray-400 uppercase tracking-wider">days</span>
        </div>
      )}
      <div className="flex flex-col items-center bg-gray-900/90 border border-gray-800 px-2.5 py-1 rounded-lg">
        <span className="text-sm font-bold text-cyan-400">
          {String(timeLeft.hours).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">hrs</span>
      </div>
      <span className="text-cyan-400 font-bold">:</span>
      <div className="flex flex-col items-center bg-gray-900/90 border border-gray-800 px-2.5 py-1 rounded-lg">
        <span className="text-sm font-bold text-cyan-400">
          {String(timeLeft.minutes).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">min</span>
      </div>
      <span className="text-cyan-400 font-bold">:</span>
      <div className="flex flex-col items-center bg-gray-900/90 border border-gray-800 px-2.5 py-1 rounded-lg">
        <span className="text-sm font-bold text-cyan-400">
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
        <span className="text-[10px] text-gray-400 uppercase tracking-wider">sec</span>
      </div>
    </div>
  );
};

