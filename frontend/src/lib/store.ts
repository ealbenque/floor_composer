// Zustand store for Floor Composer state management

import { create } from 'zustand';
import { ViewerState } from '@/types/geometry';
import { loadGeometryData, loadMaterialPalette, getAllMaterialNames } from '@/lib/data-loader';

interface ViewerActions {
  setSelectedExample: (example: string) => void;
  loadExample: (filename: string) => Promise<void>;
  loadMaterials: () => Promise<void>;
  toggleMaterialVisibility: (material: string) => void;
  setAllMaterialsVisible: (visible: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

type ViewerStore = ViewerState & ViewerActions;

const initialState: ViewerState = {
  selectedExample: 'curves',
  geometryData: null,
  materialPalette: null,
  visibleMaterials: new Set(),
  loading: false,
  error: null,
};

export const useViewerStore = create<ViewerStore>((set, get) => ({
  ...initialState,

  setSelectedExample: (example: string) => {
    set({ selectedExample: example });
  },

  loadExample: async (filename: string) => {
    set({ loading: true, error: null });
    
    try {
      const data = await loadGeometryData(filename);
      const materialNames = getAllMaterialNames(data);
      const visibleMaterials = new Set(materialNames); // All materials visible by default
      
      set({
        geometryData: data,
        visibleMaterials,
        loading: false
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to load example',
        loading: false
      });
    }
  },

  loadMaterials: async () => {
    try {
      const palette = await loadMaterialPalette();
      set({ materialPalette: palette });
    } catch (error) {
      console.error('Failed to load material palette:', error);
      // Don't set error state for material palette failures
    }
  },

  toggleMaterialVisibility: (material: string) => {
    const { visibleMaterials } = get();
    const newVisibleMaterials = new Set(visibleMaterials);
    
    if (newVisibleMaterials.has(material)) {
      newVisibleMaterials.delete(material);
    } else {
      newVisibleMaterials.add(material);
    }
    
    set({ visibleMaterials: newVisibleMaterials });
  },

  setAllMaterialsVisible: (visible: boolean) => {
    const { geometryData } = get();
    if (!geometryData) return;
    
    const materialNames = getAllMaterialNames(geometryData);
    const visibleMaterials = visible ? new Set(materialNames) : new Set<string>();
    
    set({ visibleMaterials });
  },

  setLoading: (loading: boolean) => {
    set({ loading });
  },

  setError: (error: string | null) => {
    set({ error });
  },

  reset: () => {
    set(initialState);
  },
}));