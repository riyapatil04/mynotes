import { Moon, Sun, Monitor } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import type { Theme } from '../../types';

const OPTIONS: { value: Theme; icon: React.ReactNode; label: string }[] = [
  { value: 'light',  icon: <Sun  size={14} />, label: 'Light' },
  { value: 'system', icon: <Monitor size={14} />, label: 'System' },
  { value: 'dark',   icon: <Moon size={14} />, label: 'Dark' },
];

export default function ThemeToggle() {
  const { settings, setTheme } = useSettingsStore();

  return (
    <div className="flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
      {OPTIONS.map(opt => (
        <button
          key={opt.value}
          onClick={() => setTheme(opt.value)}
          aria-label={`Switch to ${opt.label} theme`}
          title={opt.label}
          className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
            settings.theme === opt.value
              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
          }`}
        >
          {opt.icon}
          <span className="hidden sm:inline">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
