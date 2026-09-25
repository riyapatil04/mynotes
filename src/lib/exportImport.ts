import { exportAllData, importAllData } from '../db/repositories';
import { settingsRepo } from '../db/repositories';
import { nowISO } from './dateUtils';

export async function exportJSON(): Promise<void> {
  const data = await exportAllData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `placementprep-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);

  // Update last export timestamp
  const settings = await settingsRepo.get();
  await settingsRepo.upsert({ ...settings, lastExportAt: nowISO() });
}

export async function importJSON(file: File): Promise<void> {
  const text = await file.text();
  const data = JSON.parse(text) as Awaited<ReturnType<typeof exportAllData>>;
  await importAllData(data);
}
