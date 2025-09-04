// TypeScript interfaces for Floor Composer geometry data

export interface Point {
  x: number;
  y: number;
}

export interface Material {
  name: string;
  category: string;
  density: number;
  description: string;
}

export interface LineElement {
  type: 'line';
  start: Point;
  end: Point;
}

export interface ArcElement {
  type: 'arc';
  start: Point;
  end: Point;
  center: Point;
  clockwise: boolean;
}

export type GeometryElement = LineElement | ArcElement;

export interface CurveGeometry {
  elements: GeometryElement[];
  svg_path?: string;
  length?: number;
}

export interface Curve {
  id: string;
  name: string;
  curve_type: 'open' | 'closed';
  material?: Material;
  geometry: CurveGeometry;
  svg_path?: string;
}

export interface Bounds {
  min_x: number;
  max_x: number;
  min_y: number;
  max_y: number;
}

export interface Canvas {
  width: number;
  height: number;
}

export interface GeometryData {
  name: string;
  curves: Curve[];
  bounds: Bounds;
  total_length: number;
  canvas: Canvas;
}

export interface MaterialStyle {
  fill: string;
  stroke: string;
  pattern: 'solid' | 'diagonal' | 'dots' | 'brick' | 'wood_grain' | 'corrugated' | 'diagonal_hatch' | 'none';
  description: string;
}

export interface MaterialPalette {
  [key: string]: MaterialStyle;
}

export interface ExampleOption {
  value: string;
  label: string;
  file: string;
}

export interface ViewerState {
  selectedExample: string;
  geometryData: GeometryData | null;
  materialPalette: MaterialPalette | null;
  visibleMaterials: Set<string>;
  loading: boolean;
  error: string | null;
}

// Corrugated System Specific Types
export interface CorrugatedGeometry {
  steel_profile: GeometryData;
  concrete_section: GeometryData;
  combined_system: GeometryData;
}

export interface FireResistance {
  REI_minutes: number;
  default_rating: string;
  note: string;
}

export interface AcousticPerformance {
  Rw_dB: number;
  C_Ctr_dB: {
    C: number;
    Ctr: number;
  };
}

export interface MechanicalPerformance {
  single_span_load_capacity_N_m2: number[];
  multiple_spans_load_capacity_N_m2: number[];
}

export interface CorrugatedProperties {
  slab_thickness_m: number;
  concrete_volume_m3_m2: number;
  theoretical_floor_weight_N_m2: number;
  fire_resistance: FireResistance;
  acoustic_performance: AcousticPerformance;
  mechanical_performance: MechanicalPerformance;
}

export interface ProfileGeometry {
  profile_width_m: number;
  profile_height_m: number;
  rib_spacing_m: number;
  rib_width_m: number;
  top_width_m: number;
}

export interface SteelProperties {
  thickness: string;
  weight_kg_m2: number;
  section_modulus_cm3_m: number;
  moment_of_inertia_cm4_m: number;
}

export interface ProfileInfo {
  name: string;
  description: string;
  manufacturer: string;
  geometry: ProfileGeometry;
  steel_properties: SteelProperties;
}