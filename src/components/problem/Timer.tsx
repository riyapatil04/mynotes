import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Square } from 'lucide-react';
import { formatSeconds } from '../../lib/dateUtils';

interface TimerProps {
  initialSeconds: number;
  onStop: (totalSeconds: number) => void;
}

export default function Timer({ initialSeconds, onStop }: TimerProps) {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => setElapsed(s => s + 1), 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running]);

  const handleStop = () => {
    setRunning(false);
    onStop(initialSeconds + elapsed);
    setElapsed(0);
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="font-mono text-gray-700 dark:text-gray-300 min-w-[4rem]">
        {formatSeconds(initialSeconds + elapsed)}
      </span>
      <button
        onClick={() => setRunning(r => !r)}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        aria-label={running ? 'Pause timer' : 'Start timer'}
        title={running ? 'Pause' : 'Start'}
      >
        {running ? <Pause size={14} /> : <Play size={14} />}
      </button>
      <button
        onClick={handleStop}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        aria-label="Stop and save timer"
        title="Stop & save"
      >
        <Square size={14} />
      </button>
    </div>
  );
}
