import { create } from 'zustand';

interface FilterState {
  searchQuery: string;
  sortBy: string;
  filters: Record<string, any>;
  setSearchQuery: (query: string) => void;
  setSortBy: (sort: string) => void;
  setFilters: (filters: Record<string, any>) => void;
  reset: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: '',
  sortBy: 'recent',
  filters: {},
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSortBy: (sort) => set({ sortBy: sort }),
  setFilters: (filters) => set({ filters }),
  reset: () => set({ searchQuery: '', sortBy: 'recent', filters: {} }),
}));
