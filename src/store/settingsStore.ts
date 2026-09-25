import { create } from 'zustand';
import { settingsRepo } from '../db/repositories';
import type { Settings, Theme } from '../types';

interface SettingsState {
  settings: Settings;
  loaded: boolean;
  load: () => Promise<void>;
  setTheme: (theme: Theme) => Promise<void>;
  setPlacementDate: (date: string | undefined) => Promise<void>;
  setDailyGoal: (goal: number) => Promise<void>;
  save: (partial: Partial<Settings>) => Promise<void>;
}

const DEFAULT_SETTINGS: Settings = {
  id: 1,
  theme: 'system',
  dailyGoal: 5,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loaded: false,

  load: async () => {
    try {
      const settings = await settingsRepo.get();
      set({ settings, loaded: true });
      applyTheme(settings.theme);
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  },

  setTheme: async (theme: Theme) => {
    await get().save({ theme });
    applyTheme(theme);
  },

  setPlacementDate: async (date: string | undefined) => {
    await get().save({ placementDate: date });
  },

  setDailyGoal: async (dailyGoal: number) => {
    await get().save({ dailyGoal });
  },

  save: async (partial: Partial<Settings>) => {
    const current = get().settings;
    const updated: Settings = { ...current, ...partial };
    set({ settings: updated });
    await settingsRepo.upsert(updated);
  },
}));

export function applyTheme(theme: Theme) {
  const root = document.documentElement;
  localStorage.setItem('ppt-theme', theme);
  if (theme === 'dark') {
    root.classList.add('dark');
  } else if (theme === 'light') {
    root.classList.remove('dark');
  } else {
    // system
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.classList.toggle('dark', prefersDark);
  }
}
