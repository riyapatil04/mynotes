import { create } from 'zustand';

interface UIState {
  sidebarOpen: boolean;
  commandPaletteOpen: boolean;
  expandedSubjects: Set<string>;
  activeProblemId: string | null;

  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleCommandPalette: () => void;
  setCommandPaletteOpen: (open: boolean) => void;
  toggleSubjectExpanded: (subjectId: string) => void;
  setSubjectExpanded: (subjectId: string, expanded: boolean) => void;
  setActiveProblem: (id: string | null) => void;
}

export const useUIStore = create<UIState>((set, get) => ({
  sidebarOpen: true,
  commandPaletteOpen: false,
  expandedSubjects: new Set<string>(),
  activeProblemId: null,

  toggleSidebar: () => set(s => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleCommandPalette: () => set(s => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),

  toggleSubjectExpanded: (subjectId) => {
    const expanded = new Set(get().expandedSubjects);
    if (expanded.has(subjectId)) expanded.delete(subjectId);
    else expanded.add(subjectId);
    set({ expandedSubjects: expanded });
  },

  setSubjectExpanded: (subjectId, expanded) => {
    const s = new Set(get().expandedSubjects);
    if (expanded) s.add(subjectId);
    else s.delete(subjectId);
    set({ expandedSubjects: s });
  },

  setActiveProblem: (id) => set({ activeProblemId: id }),
}));
