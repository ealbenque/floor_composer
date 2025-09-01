// D3.js integration utilities for React

import * as d3 from 'd3';
import { GeometryData, MaterialPalette } from '@/types/geometry';

export interface D3Config {
  margin: { top: number; right: number; bottom: number; left: number };
  minZoom: number;
  maxZoom: number;
  transitionDuration: number;
  fixedSize?: { width: number; height: number };
}

export const DEFAULT_CONFIG: D3Config = {
  margin: { top: 40, right: 40, bottom: 40, left: 40 },
  minZoom: 0.1,
  maxZoom: 10,
  transitionDuration: 750,
};

export const FIXED_SIZE_CONFIG: D3Config = {
  margin: { top: 30, right: 30, bottom: 30, left: 30 },
  minZoom: 0.1,
  maxZoom: 10,
  transitionDuration: 750,
  fixedSize: { width: 600, height: 300 },
};

export class D3Viewer {
  private svg: d3.Selection<SVGSVGElement, unknown, null, undefined> | null = null;
  private mainGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private gridGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private curvesGroup: d3.Selection<SVGGElement, unknown, null, undefined> | null = null;
  private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
  private width = 0;
  private height = 0;
  private config: D3Config = DEFAULT_CONFIG;

  constructor(private containerRef: HTMLDivElement, config?: Partial<D3Config>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  initialize(): void {
    // Clear any existing content
    d3.select(this.containerRef).selectAll('*').remove();

    // Determine dimensions (fixed size or responsive)
    let svgWidth: number, svgHeight: number;
    if (this.config.fixedSize) {
      svgWidth = this.config.fixedSize.width;
      svgHeight = this.config.fixedSize.height;
    } else {
      const containerRect = this.containerRef.getBoundingClientRect();
      svgWidth = containerRect.width;
      svgHeight = containerRect.height;
    }
    
    this.width = svgWidth - this.config.margin.left - this.config.margin.right;
    this.height = svgHeight - this.config.margin.top - this.config.margin.bottom;

    // Create SVG
    this.svg = d3
      .select(this.containerRef)
      .append('svg')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .style('background', 'white')
      .style('border', '1px solid #e5e7eb')
      .style('border-radius', '0.5rem');

    // Create main group with margins
    this.mainGroup = this.svg
      .append('g')
      .attr('transform', `translate(${this.config.margin.left},${this.config.margin.top})`);

    // Create sub-groups
    this.gridGroup = this.mainGroup.append('g').attr('class', 'grid-group');
    this.curvesGroup = this.mainGroup.append('g').attr('class', 'curves-group');
    
    // Add pattern definitions
    this.createPatternDefinitions();

    // Setup zoom behavior
    this.zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([this.config.minZoom, this.config.maxZoom])
      .on('zoom', (event) => {
        if (this.mainGroup) {
          const { transform } = event;
          this.mainGroup
            .select('.grid-group')
            .attr('transform', transform);
          this.mainGroup
            .select('.curves-group')
            .attr('transform', transform);
        }
      });

    this.svg.call(this.zoom);
  }

  render(
    data: GeometryData,
    materialPalette: MaterialPalette | null,
    visibleMaterials: Set<string>
  ): void {
    if (!this.svg || !this.mainGroup || !this.gridGroup || !this.curvesGroup) {
      console.error('D3Viewer not initialized');
      return;
    }

    console.log('D3Viewer rendering data:', data);
    console.log('Material palette:', materialPalette);
    console.log('Visible materials:', visibleMaterials);

    // Clear existing content
    this.gridGroup.selectAll('*').remove();
    this.curvesGroup.selectAll('*').remove();

    // Draw grid
    this.drawGrid(data.bounds);

    // Draw curves
    this.drawCurves(data.curves, materialPalette, visibleMaterials);

    // Center the view immediately (without transition) - only for new data
    setTimeout(() => {
      this.resetViewImmediate();
    }, 100); // Small delay to ensure DOM is updated
  }

  updateMaterials(
    data: GeometryData,
    materialPalette: MaterialPalette | null,
    visibleMaterials: Set<string>
  ): void {
    if (!this.svg || !this.mainGroup || !this.gridGroup || !this.curvesGroup) {
      console.error('D3Viewer not initialized');
      return;
    }

    console.log('D3Viewer updating materials:', visibleMaterials);

    // Only redraw curves without clearing everything or repositioning
    this.curvesGroup.selectAll('*').remove();
    this.drawCurves(data.curves, materialPalette, visibleMaterials);
  }

  private drawGrid(bounds: { min_x: number; max_x: number; min_y: number; max_y: number }): void {
    if (!this.gridGroup) return;

    const gridSpacing = this.calculateGridSpacing(bounds);

    // Vertical lines
    const startX = Math.floor(bounds.min_x / gridSpacing) * gridSpacing;
    for (let x = startX; x <= bounds.max_x; x += gridSpacing) {
      this.gridGroup
        .append('line')
        .attr('class', 'grid-line')
        .attr('x1', x)
        .attr('y1', bounds.min_y)
        .attr('x2', x)
        .attr('y2', bounds.max_y)
        .style('stroke', '#e5e7eb')
        .style('stroke-width', 0.5)
        .style('opacity', 0.7);
    }

    // Horizontal lines
    const startY = Math.floor(bounds.min_y / gridSpacing) * gridSpacing;
    for (let y = startY; y <= bounds.max_y; y += gridSpacing) {
      this.gridGroup
        .append('line')
        .attr('class', 'grid-line')
        .attr('x1', bounds.min_x)
        .attr('y1', y)
        .attr('x2', bounds.max_x)
        .attr('y2', y)
        .style('stroke', '#e5e7eb')
        .style('stroke-width', 0.5)
        .style('opacity', 0.7);
    }
  }

  private drawCurves(
    curves: GeometryData['curves'],
    materialPalette: MaterialPalette | null,
    visibleMaterials: Set<string>
  ): void {
    if (!this.curvesGroup) return;

    curves.forEach((curve) => {
      const materialName = curve.material?.name;
      const isVisible = !materialName || visibleMaterials.has(materialName);
      
      console.log(`Processing curve ${curve.id}:`, {
        materialName,
        isVisible,
        geometry: curve.geometry,
        svg_path: (curve.geometry as { svg_path?: string })?.svg_path
      });
      
      if (!isVisible) return;

      const materialStyle = materialName && materialPalette 
        ? materialPalette[materialName]
        : { fill: '#6b7280', stroke: '#374151', pattern: 'solid' as const };

      // Get SVG path from geometry or fallback to curve level
      const svgPath = (curve.geometry as { svg_path?: string })?.svg_path || curve.svg_path || '';
      
      console.log(`Using SVG path for ${curve.id}:`, svgPath);
      
      // Apply pattern fill if needed
      let fillValue = materialStyle.fill;
      if (materialStyle.pattern === 'diagonal_hatch') {
        fillValue = 'url(#diagonal-hatch)';
      } else if (materialStyle.fill === 'none') {
        fillValue = 'none';
      }

      const path = this.curvesGroup!
        .append('path')
        .attr('class', 'geometry-path')
        .attr('id', curve.id)
        .attr('d', svgPath)
        .style('fill', fillValue)
        .style('stroke', materialStyle.stroke)
        .style('stroke-width', 1.5)
        .style('cursor', 'pointer');

      // Add hover effects
      path
        .on('mouseover', function() {
          d3.select(this).style('stroke-width', 3);
        })
        .on('mouseout', function() {
          d3.select(this).style('stroke-width', 1.5);
        });
    });
  }

  private calculateGridSpacing(bounds: { min_x: number; max_x: number; min_y: number; max_y: number }): number {
    const dataWidth = bounds.max_x - bounds.min_x;
    const dataHeight = bounds.max_y - bounds.min_y;
    const maxDimension = Math.max(dataWidth, dataHeight);

    // Target approximately 10-20 grid lines
    const targetLines = 15;
    const rawSpacing = maxDimension / targetLines;

    // Round to nice numbers
    const magnitude = Math.pow(10, Math.floor(Math.log10(rawSpacing)));
    const normalized = rawSpacing / magnitude;

    let spacing;
    if (normalized <= 1) {
      spacing = magnitude;
    } else if (normalized <= 2) {
      spacing = 2 * magnitude;
    } else if (normalized <= 5) {
      spacing = 5 * magnitude;
    } else {
      spacing = 10 * magnitude;
    }

    return Math.max(spacing, 0.1); // Minimum spacing
  }

  resetViewImmediate(): void {
    if (!this.svg || !this.zoom || !this.curvesGroup) return;

    try {
      // Get the actual bounds of the rendered SVG paths
      const bbox = (this.curvesGroup.node() as SVGGElement).getBBox();
      
      if (bbox.width === 0 || bbox.height === 0) {
        // Fallback to identity transform if no geometry
        this.svg.call(this.zoom.transform, d3.zoomIdentity);
        return;
      }

      // Center the geometry without scaling
      const centerX = bbox.x + bbox.width / 2;
      const centerY = bbox.y + bbox.height / 2;

      const translateX = this.width / 2 - centerX;
      const translateY = this.height / 2 - centerY;

      console.log('Reset view immediate:', { bbox, translateX, translateY });

      // Apply transform immediately without transition
      this.svg.call(
        this.zoom.transform,
        d3.zoomIdentity.translate(translateX, translateY)
      );
    } catch (error) {
      console.error('Error resetting view:', error);
      // Fallback to identity transform
      this.svg.call(this.zoom.transform, d3.zoomIdentity);
    }
  }

  resetView(): void {
    if (!this.svg || !this.zoom || !this.curvesGroup) return;

    try {
      // Get the actual bounds of the rendered SVG paths
      const bbox = (this.curvesGroup.node() as SVGGElement).getBBox();
      
      if (bbox.width === 0 || bbox.height === 0) {
        // Fallback to identity transform if no geometry
        this.svg
          .transition()
          .duration(this.config.transitionDuration)
          .call(this.zoom.transform, d3.zoomIdentity);
        return;
      }

      // Center the geometry without scaling
      const centerX = bbox.x + bbox.width / 2;
      const centerY = bbox.y + bbox.height / 2;

      const translateX = this.width / 2 - centerX;
      const translateY = this.height / 2 - centerY;

      console.log('Reset view:', { bbox, translateX, translateY });

      this.svg
        .transition()
        .duration(this.config.transitionDuration)
        .call(
          this.zoom.transform,
          d3.zoomIdentity.translate(translateX, translateY)
        );
    } catch (error) {
      console.error('Error resetting view:', error);
      // Fallback to identity transform
      this.svg
        .transition()
        .duration(this.config.transitionDuration)
        .call(this.zoom.transform, d3.zoomIdentity);
    }
  }

  fitToBounds(): void {
    if (!this.svg || !this.zoom || !this.curvesGroup) return;

    // Get the actual bounds of the rendered SVG paths
    try {
      const bbox = (this.curvesGroup.node() as SVGGElement).getBBox();
      
      if (bbox.width === 0 || bbox.height === 0) {
        console.warn('No geometry found for fit to bounds');
        this.resetView();
        return;
      }

      // Add padding
      const padding = 50; // Fixed pixel padding
      const effectiveWidth = bbox.width + padding * 2;
      const effectiveHeight = bbox.height + padding * 2;

      // Calculate scale to fit
      const scale = Math.min(
        this.width / effectiveWidth,
        this.height / effectiveHeight
      );

      // Calculate center position
      const centerX = bbox.x + bbox.width / 2;
      const centerY = bbox.y + bbox.height / 2;

      const translateX = this.width / 2 - centerX * scale;
      const translateY = this.height / 2 - centerY * scale;

      console.log('Fit to bounds:', { bbox, scale, translateX, translateY });

      this.svg
        .transition()
        .duration(this.config.transitionDuration)
        .call(
          this.zoom.transform,
          d3.zoomIdentity.translate(translateX, translateY).scale(scale)
        );
    } catch (error) {
      console.error('Error calculating bounds:', error);
      this.resetView();
    }
  }

  private createPatternDefinitions(): void {
    if (!this.svg) return;

    // Create defs element
    const defs = this.svg.append('defs');

    // Diagonal hatch pattern (alternating full and dashed lines like AutoCAD ANSI 33)
    const diagonalHatch = defs
      .append('pattern')
      .attr('id', 'diagonal-hatch')
      .attr('patternUnits', 'userSpaceOnUse')
      .attr('width', 8)
      .attr('height', 8);

    // Full diagonal line
    diagonalHatch
      .append('line')
      .attr('x1', 0)
      .attr('y1', 0)
      .attr('x2', 8)
      .attr('y2', 8)
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 0.5);

    // Dashed diagonal line (offset by half pattern size)
    diagonalHatch
      .append('line')
      .attr('x1', -4)
      .attr('y1', 4)
      .attr('x2', 4)
      .attr('y2', 12)
      .attr('stroke', '#6b7280')
      .attr('stroke-width', 0.5)
      .attr('stroke-dasharray', '1,1');
  }

  destroy(): void {
    if (this.containerRef) {
      d3.select(this.containerRef).selectAll('*').remove();
    }
    this.svg = null;
    this.mainGroup = null;
    this.gridGroup = null;
    this.curvesGroup = null;
    this.zoom = null;
  }
}