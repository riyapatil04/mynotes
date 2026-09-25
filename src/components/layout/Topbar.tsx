import { Menu, Search, Download, Upload } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import ThemeToggle from './ThemeToggle';
import { Link } from 'react-router-dom';

interface TopbarProps {
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function Topbar({ onExport, onImport }: TopbarProps) {
  const { toggleSidebar, setCommandPaletteOpen } = useUIStore();

  return (
    <header className="h-14 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0 z-10">
      {/* Left */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
        >
          <Menu size={20} />
        </button>
        <Link to="/" className="flex items-center gap-2 font-semibold text-gray-900 dark:text-gray-100">
          <span className="text-xl">🎯</span>
          <span className="hidden sm:inline">PlacementPrep</span>
        </Link>
      </div>

      {/* Center — Search */}
      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors w-72"
        aria-label="Open search (Ctrl+K)"
      >
        <Search size={14} />
        <span>Search problems...</span>
        <kbd className="ml-auto text-xs bg-white dark:bg-gray-700 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
          Ctrl K
        </kbd>
      </button>

      {/* Right */}
      <div className="flex items-center gap-2">
        <button
          onClick={onExport}
          title="Export data as JSON"
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"
          aria-label="Export data"
        >
          <Download size={18} />
        </button>
        <label
          title="Import data from JSON"
          className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-pointer"
          aria-label="Import data"
        >
          <Upload size={18} />
          <input
            type="file"
            accept=".json"
            className="hidden"
            onChange={onImport as React.ChangeEventHandler<HTMLInputElement>}
          />
        </label>
        <ThemeToggle />
      </div>
    </header>
  );
}
