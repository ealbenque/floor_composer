import { 
  CLTDatabase, 
  PreDesignEntry, 
  CLTConfiguratorFilters, 
  CLTFilteredResult 
} from '@/types/clt';

/**
 * Convert fire resistance string to numeric value for comparison
 */
export function fireResistanceToNumber(resistance: string): number {
  const match = resistance.match(/R(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

/**
 * Check if fire resistance meets or exceeds the requirement
 */
export function meetsFireResistance(productResistance: string, requiredResistance: string): boolean {
  if (requiredResistance === "all") return true;
  
  const productValue = fireResistanceToNumber(productResistance);
  const requiredValue = fireResistanceToNumber(requiredResistance);
  
  return productValue >= requiredValue;
}

/**
 * Check if a pre-design entry matches the user requirements
 */
export function matchesPreDesignCriteria(
  preDesign: PreDesignEntry, 
  filters: CLTConfiguratorFilters
): boolean {
  // Check span (L >= L_user)
  if (preDesign.L < filters.L_user) return false;
  
  // Check live load (q >= q_user)
  if (preDesign.q < filters.q_user) return false;
  
  // Check dead load (g >= g_user)
  if (preDesign.g < filters.g_user) return false;
  
  // Check live load category (exact match or "all")
  if (filters.live_load_category_user !== "all" && 
      preDesign.live_load_category !== filters.live_load_category_user) {
    return false;
  }
  
  // Check type_chape (exact match or "all")
  if (filters.type_chape_user !== "all" && 
      preDesign.type_chape !== filters.type_chape_user) {
    return false;
  }
  
  return true;
}

/**
 * Filter CLT products based on user criteria
 */
export function filterCLTProducts(
  database: CLTDatabase, 
  filters: CLTConfiguratorFilters
): CLTFilteredResult[] {
  const results: CLTFilteredResult[] = [];
  
  for (const [productReference, product] of Object.entries(database)) {
    // Check height constraint (h <= h_user)
    if (product.h > filters.h_user) continue;
    
    // Check fire resistance constraint
    if (!meetsFireResistance(product.fire_resistance, filters.fire_resistance_user)) {
      continue;
    }
    
    // Find matching pre-designs
    const matchingPreDesigns = product["pre-design"].filter(preDesign => 
      matchesPreDesignCriteria(preDesign, filters)
    );
    
    // Include product only if it has at least one matching pre-design
    if (matchingPreDesigns.length > 0) {
      results.push({
        productReference,
        product,
        matchingPreDesigns
      });
    }
  }
  
  return results;
}

/**
 * Extract unique type_chape values from the database
 */
export function extractUniqueTypeChapeOptions(database: CLTDatabase): string[] {
  const typeChapeSet = new Set<string>();
  
  for (const product of Object.values(database)) {
    for (const preDesign of product["pre-design"]) {
      typeChapeSet.add(preDesign.type_chape);
    }
  }
  
  return Array.from(typeChapeSet).sort();
}

/**
 * Extract unique fire resistance options from the database
 */
export function extractUniqueFireResistanceOptions(database: CLTDatabase): string[] {
  const resistanceSet = new Set<string>();
  
  for (const product of Object.values(database)) {
    resistanceSet.add(product.fire_resistance);
  }
  
  return Array.from(resistanceSet).sort((a, b) => 
    fireResistanceToNumber(b) - fireResistanceToNumber(a)
  );
}

/**
 * Get statistics about the filtered results
 */
export function getFilteredResultsStats(results: CLTFilteredResult[]): {
  totalProducts: number;
  totalMatchingPreDesigns: number;
  heightRange: { min: number; max: number };
  spanRange: { min: number; max: number };
} {
  if (results.length === 0) {
    return {
      totalProducts: 0,
      totalMatchingPreDesigns: 0,
      heightRange: { min: 0, max: 0 },
      spanRange: { min: 0, max: 0 }
    };
  }
  
  const heights = results.map(r => r.product.h);
  const spans = results.flatMap(r => r.matchingPreDesigns.map(pd => pd.L));
  
  return {
    totalProducts: results.length,
    totalMatchingPreDesigns: results.reduce((sum, r) => sum + r.matchingPreDesigns.length, 0),
    heightRange: {
      min: Math.min(...heights),
      max: Math.max(...heights)
    },
    spanRange: {
      min: Math.min(...spans),
      max: Math.max(...spans)
    }
  };
}

/**
 * Format height in mm for display
 */
export function formatHeight(heightInMeters: number): string {
  return `${Math.round(heightInMeters * 1000)} mm`;
}

/**
 * Format load values for display
 */
export function formatLoad(loadInNm2: number): string {
  return `${loadInNm2.toLocaleString()} N/m²`;
}

/**
 * Format span for display
 */
export function formatSpan(spanInMeters: number): string {
  return `${spanInMeters.toFixed(1)} m`;
}