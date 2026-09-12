import { create } from 'zustand';
import { persist } from 'zustand/middleware';
interface State {
  solved: number[];
  bookmarks: number[];
  drafts: Record<number, string>;
  complete: (id: number) => void;
  bookmark: (id: number) => void;
  draft: (id: number, sql: string) => void;
}
export const useStore = create<State>()(
  persist(
    (set) => ({
      solved: [],
      bookmarks: [],
      drafts: {},
      complete: (id) => set((s) => ({ solved: [...new Set([...s.solved, id])] })),
      bookmark: (id) =>
        set((s) => ({
          bookmarks: s.bookmarks.includes(id)
            ? s.bookmarks.filter((x) => x !== id)
            : [...s.bookmarks, id],
        })),
      draft: (id, sql) => set((s) => ({ drafts: { ...s.drafts, [id]: sql } })),
    }),
    { name: 'sql-trainer-v1' },
  ),
);
