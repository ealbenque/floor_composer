// TypeScript interfaces for CLT Database

export interface PreDesignEntry {
  live_load_category: "A" | "B" | "C" | "";  // Empty string for "Toiture" entries
  g: number;                                 // Dead load (N/m²)
  q: number;                                 // Live load (N/m²)
  type_chape: string;                       // Floor type criteria
  L: number;                                // Span length (m)
}

export interface CLTProduct {
  h: number;                                // Thickness in meters
  fire_resistance: string;                  // Fire rating (R60, etc.)
  "pre-design": PreDesignEntry[];          // Array of pre-design configurations
}

export interface CLTDatabase {
  [productKey: string]: CLTProduct;
}

// Filtering and UI state interfaces (existing)
export interface CLTFilters {
  selectedProduct: string;
  liveLoadCategories: Set<string>;         // A, B, C, Toiture (empty string)
  typeChapeCategories: Set<string>;        // Different chape types
  qRange: [number, number];                // Live load range
  gRange: [number, number];                // Dead load range  
  LRange: [number, number];                // Span length range
}

// New interfaces for CLT Configurator
export interface CLTConfiguratorFilters {
  L_user: number; // Required span in meters
  q_user: number; // Required live load in N/m²
  g_user: number; // Required dead load in N/m²
  live_load_category_user: "A" | "B" | "C" | "" | "all";
  fire_resistance_user: "R30" | "R60" | "R90" | "all";
  h_user: number; // Maximum height in meters
  type_chape_user: string | "all";
}

export interface CLTFilteredResult {
  productReference: string;
  product: CLTProduct;
  matchingPreDesigns: PreDesignEntry[];
}

export interface CLTViewerState {
  database: CLTDatabase | null;
  filters: CLTFilters;
  filteredEntries: (PreDesignEntry & { productKey: string })[];
  selectedEntries: Set<string>;            // For highlighting specific points
  loading: boolean;
  error: string | null;
}

// Chart-specific interfaces
export interface CLTChartPoint {
  productKey: string;
  entry: PreDesignEntry;
  x: number;                              // L value (span)
  y: number;                              // g value (dead load)
  size: number;                           // Based on q value
  color: string;                          // Based on live_load_category
  shape: string;                          // Based on type_chape
}

export interface CLTChartProps {
  data: CLTChartPoint[];
  width: number;
  height: number;
  onPointHover?: (point: CLTChartPoint | null) => void;
  onPointClick?: (point: CLTChartPoint) => void;
  selectedPoints?: Set<string>;
  className?: string;
}

// Statistics and analysis
export interface CLTStatistics {
  totalEntries: number;
  gStats: { min: number; max: number; mean: number; std: number };
  qStats: { min: number; max: number; mean: number; std: number };
  LStats: { min: number; max: number; mean: number; std: number };
  categoryDistribution: Record<string, number>;
  chapeTypeDistribution: Record<string, number>;
}

// Available options for configurator dropdowns
export const LIVE_LOAD_CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "A", label: "Category A (Residential)" },
  { value: "B", label: "Category B (Office)" },
  { value: "C", label: "Category C (Assembly)" },
  { value: "roof", label: "Roof/Toiture" }
] as const;

export const FIRE_RESISTANCE_OPTIONS = [
  { value: "all", label: "Any Fire Resistance" },
  { value: "R30", label: "R30 (30 minutes)" },
  { value: "R60", label: "R60 (60 minutes)" },
  { value: "R90", label: "R90 (90 minutes)" }
] as const;

// Default filter values for configurator
export const DEFAULT_CLT_CONFIGURATOR_FILTERS: CLTConfiguratorFilters = {
  L_user: 4.0,
  q_user: 2000,
  g_user: 1500,
  live_load_category_user: "all",
  fire_resistance_user: "all",
  h_user: 0.25,
  type_chape_user: "all"
};