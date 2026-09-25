import { Outlet } from 'react-router-dom';
import Topbar from './components/layout/Topbar';
import Sidebar from './components/layout/Sidebar';
import CommandPalette from './components/layout/CommandPalette';
import { exportJSON, importJSON } from './lib/exportImport';

export default function AppLayout() {
  const handleExport = async () => {
    try {
      await exportJSON();
    } catch (err) {
      console.error('Export failed', err);
      alert('Export failed. Check console for details.');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importJSON(file);
      window.location.reload();
    } catch (err) {
      console.error('Import failed', err);
      alert('Import failed. Make sure the file is a valid PlacementPrep backup.');
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-100 overflow-hidden">
      <Topbar onExport={handleExport} onImport={handleImport} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      <CommandPalette />
    </div>
  );
}
