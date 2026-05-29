import { create } from 'zustand'
import type { TodoStatus } from '../types/todo'

export type ViewMode = 'list' | 'calendar'

interface FilterState {
  status: TodoStatus | null
  categoryId: string | null
  assigneeId: string | null
  viewMode: ViewMode
  setStatus: (status: TodoStatus | null) => void
  setCategoryId: (categoryId: string | null) => void
  setAssigneeId: (assigneeId: string | null) => void
  setViewMode: (viewMode: ViewMode) => void
  reset: () => void
}

export const useFilterStore = create<FilterState>()((set) => ({
  status: null,
  categoryId: null,
  assigneeId: null,
  viewMode: 'list',
  setStatus: (status) => set({ status }),
  setCategoryId: (categoryId) => set({ categoryId }),
  setAssigneeId: (assigneeId) => set({ assigneeId }),
  setViewMode: (viewMode) => set({ viewMode }),
  reset: () => set({ status: null, categoryId: null, assigneeId: null, viewMode: 'list' }),
}))
