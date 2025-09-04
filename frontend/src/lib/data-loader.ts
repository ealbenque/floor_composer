// Data loading utilities for Floor Composer

import { GeometryData, MaterialPalette, ExampleOption } from '@/types/geometry';

export const EXAMPLES: ExampleOption[] = [
  {
    value: 'curves',
    label: 'Default Floor Section',
    file: '/data/curves.json'
  },
  {
    value: 'floor_profile',
    label: 'Floor Profile',
    file: '/data/floor_profile.json'
  },
  {
    value: 'building_section',
    label: 'Building Section',
    file: '/data/building_section.json'
  },
  {
    value: 'corrugated_system',
    label: 'Corrugated System',
    file: '/data/corrugated_system.json'
  }
];

export async function loadGeometryData(filename: string): Promise<GeometryData> {
  try {
    const response = await fetch(filename);
    if (!response.ok) {
      throw new Error(`Failed to load geometry data: ${response.statusText}`);
    }
    const data = await response.json();
    return data as GeometryData;
  } catch (error) {
    console.error('Error loading geometry data:', error);
    throw error;
  }
}

export async function loadMaterialPalette(): Promise<MaterialPalette> {
  try {
    const response = await fetch('/data/materials.json');
    if (!response.ok) {
      throw new Error(`Failed to load material palette: ${response.statusText}`);
    }
    const data = await response.json();
    return data as MaterialPalette;
  } catch (error) {
    console.error('Error loading material palette:', error);
    throw error;
  }
}

export function getExampleByValue(value: string): ExampleOption | undefined {
  return EXAMPLES.find(example => example.value === value);
}

export function getAllMaterialNames(data: GeometryData): string[] {
  const materials = new Set<string>();
  data.curves.forEach(curve => {
    if (curve.material?.name) {
      materials.add(curve.material.name);
    }
  });
  return Array.from(materials);
}