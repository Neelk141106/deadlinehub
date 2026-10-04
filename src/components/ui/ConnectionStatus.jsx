import React from 'react';
import { useSocket } from '../../context/SocketContext';

export function ConnectionStatus({ showLabel = true, className = '' }) {
  const { status } = useSocket();

  const isConnected = status === 'connected';
  const isReconnecting = status === 'reconnecting' || status === 'connecting';

  let config = {
    dot: 'bg-emerald-500',
    pulse: 'bg-emerald-400',
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200/80 dark:border-emerald-900/40',
    label: 'Connected',
  };

  if (isReconnecting) {
    config = {
      dot: 'bg-amber-500',
      pulse: 'bg-amber-400',
      text: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200/80 dark:border-amber-900/40',
      label: 'Reconnecting...',
    };
  } else if (!isConnected) {
    config = {
      dot: 'bg-red-500',
      pulse: 'bg-red-400',
      text: 'text-red-700 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-950/40 border-red-200/80 dark:border-red-900/40',
      label: 'Disconnected',
    };
  }

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium border ${config.bg} ${config.text} ${className}`}
      title={`Real-time status: ${config.label}`}
      role="status"
      aria-live="polite"
    >
      <span className="relative flex h-2 w-2">
        {(isConnected || isReconnecting) && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${config.pulse} opacity-75`}></span>
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${config.dot}`}></span>
      </span>
      {showLabel && <span>{config.label}</span>}
    </div>
  );
}

export default ConnectionStatus;
