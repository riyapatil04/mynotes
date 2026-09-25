import { useSettingsStore } from '../store/settingsStore';
import { formatDate } from '../lib/dateUtils';
import { exportJSON } from '../lib/exportImport';
import { HardDrive, Download } from 'lucide-react';

export default function SettingsPage() {
  const { settings, setPlacementDate, setDailyGoal } = useSettingsStore();

  return (
    <div className="p-6 max-w-lg mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">⚙️ Settings</h1>

      {/* Data locality notice */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
        <HardDrive size={18} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">Your data stays on this device.</p>
          <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
            All notes, problems, and progress are stored in your browser's IndexedDB.
            They are <strong>not synced</strong> across browsers or devices.
            Use <strong>Export / Import</strong> to move your data to another device or keep a backup.
          </p>
          {settings.lastExportAt && (
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
              Last exported: {formatDate(settings.lastExportAt)}
            </p>
          )}
          <button
            onClick={() => exportJSON().catch(console.error)}
            className="mt-3 flex items-center gap-1.5 text-xs btn-primary"
          >
            <Download size={12} /> Export Backup Now
          </button>
        </div>
      </div>

      {/* Config */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Placement Date
          </label>
          <input
            type="date"
            value={settings.placementDate ?? ''}
            onChange={e => setPlacementDate(e.target.value || undefined)}
            className="input-base w-full"
            aria-label="Placement date"
          />
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Used for the countdown on the dashboard.</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Daily Goal (items)
          </label>
          <input
            type="number" min={1} max={20}
            value={settings.dailyGoal}
            onChange={e => setDailyGoal(Number(e.target.value))}
            className="input-base w-32"
            aria-label="Daily goal"
          />
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
        <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Keyboard Shortcuts</h2>
        <ul className="space-y-1.5 text-sm text-gray-600 dark:text-gray-400">
          {[
            ['Ctrl K', 'Open search (problems + notes)'],
            ['Esc',    'Close modal / command palette'],
          ].map(([key, desc]) => (
            <li key={key} className="flex items-center gap-3">
              <kbd className="font-mono bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-2 py-0.5 rounded text-xs">{key}</kbd>
              <span>{desc}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
