import { create } from 'zustand';
import { Provider } from '@/types/provider';

interface ProviderStore {
  provider: Provider | null;
  setProvider: (provider: Provider | null) => void;
}

export const useProviderStore = create<ProviderStore>((set) => ({
  provider: null,
  setProvider: (provider) => set({ provider }),
}));
