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