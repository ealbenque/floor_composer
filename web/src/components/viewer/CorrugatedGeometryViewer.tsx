'use client'

import React, { useEffect, useRef, useState, useCallback } from 'react'
import * as d3 from 'd3'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface MaterialPalette {
  [key: string]: {
    fill: string
    stroke: string
    pattern: string
    description: string
  }
}

interface GeometryData {
  curves: Array<{
    id: string
    name: string
    curve_type: 'open' | 'closed'
    material: {
      name: string
      category: string
      density: number
      description: string
    }
    geometry: {
      svg_path: string
      length: number
    }
  }>
  bounds: {
    min_x: number
    max_x: number
    min_y: number
    max_y: number
  }
}

interface CorrugatedGeometryViewerProps {
  geometryData: GeometryData
  materialPalette: MaterialPalette
  className?: string
}

export function CorrugatedGeometryViewer({ 
  geometryData, 
  materialPalette, 
  className = "" 
}: CorrugatedGeometryViewerProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [transform, setTransform] = useState<d3.ZoomTransform>(d3.zoomIdentity)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>()

  const fitToBounds = useCallback(() => {
    if (!svgRef.current || !geometryData) return
    
    const svg = d3.select(svgRef.current)
    const bounds = geometryData.bounds
    
    // Chart dimensions
    const margin = { top: 30, right: 30, bottom: 30, left: 30 }
    const width = 600 - margin.left - margin.right
    const height = 300 - margin.bottom - margin.top
    
    const dataWidth = bounds.max_x - bounds.min_x
    const dataHeight = bounds.max_y - bounds.min_y
    
    if (dataWidth === 0 || dataHeight === 0) return
    
    // Calculate scale to fit bounds with padding
    const padding = 0.1
    const scaleX = width / (dataWidth * (1 + padding * 2))
    const scaleY = height / (dataHeight * (1 + padding * 2))
    const scale = Math.min(scaleX, scaleY)
    
    // Calculate center position
    const centerX = (bounds.min_x + bounds.max_x) / 2
    const centerY = (bounds.min_y + bounds.max_y) / 2
    const translateX = width / 2 - centerX * scale + margin.left
    const translateY = height / 2 - centerY * scale + margin.top
    
    const newTransform = d3.zoomIdentity
      .translate(translateX, translateY)
      .scale(scale)
    
    svg.transition()
      .duration(750)
      .call(zoomRef.current!.transform, newTransform)
  }, [geometryData])

  useEffect(() => {
    if (!svgRef.current || !geometryData) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()
    
    // Setup zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 10])
      .on('zoom', (event) => {
        const { transform } = event
        setTransform(transform)
        svg.select('.main-group')
          .attr('transform', transform.toString())
      })
    
    zoomRef.current = zoom
    svg.call(zoom)

    // Chart dimensions
    const margin = { top: 30, right: 30, bottom: 30, left: 30 }
    const width = 600 - margin.left - margin.right
    const height = 300 - margin.bottom - margin.top

    const g = svg.append("g")
      .attr("class", "main-group")

    // Use identity scale since zoom will handle transforms
    const bounds = geometryData.bounds

    // Create pattern definitions for hatching
    const defs = svg.append("defs")
    
    // Diagonal hatch pattern for concrete
    const diagonalHatch = defs.append("pattern")
      .attr("id", "diagonal-hatch")
      .attr("patternUnits", "userSpaceOnUse")
      .attr("width", 8)
      .attr("height", 8)
    
    diagonalHatch.append("rect")
      .attr("width", 8)
      .attr("height", 8)
      .attr("fill", "#e5e7eb")
    
    diagonalHatch.append("path")
      .attr("d", "M0,8 L8,0 M-2,2 L2,-2 M6,10 L10,6")
      .attr("stroke", "#9ca3af")
      .attr("stroke-width", 1)

    // No transformation needed - use raw coordinates
    const transformPath = (svgPath: string) => svgPath

    // Render each curve
    geometryData.curves.forEach((curve) => {
      const material = materialPalette[curve.material.name]
      if (!material) return

      const transformedPath = transformPath(curve.geometry.svg_path)
      
      const pathElement = g.append("path")
        .attr("d", transformedPath)
        .attr("stroke", material.stroke)
        .attr("stroke-width", curve.curve_type === 'open' ? 2 : 1)

      // Apply fill based on material
      if (curve.curve_type === 'closed') {
        if (material.pattern === "diagonal_hatch") {
          pathElement.attr("fill", "url(#diagonal-hatch)")
        } else {
          pathElement.attr("fill", material.fill !== "none" ? material.fill : "none")
        }
      } else {
        pathElement.attr("fill", "none")
      }
    })

    // Add title
    svg.append("text")
      .attr("x", 300)
      .attr("y", 20)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Composite Section - Side View")
    
    // Auto-fit to bounds on initial load
    setTimeout(() => fitToBounds(), 100)

  }, [geometryData, materialPalette])

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-2">
        <div className="text-sm text-slate-600">
          Use mouse to pan and zoom. Scroll to zoom, drag to pan.
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fitToBounds}
          >
            <RotateCcw className="h-4 w-4 mr-1" />
            Fit to Bounds
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <svg
          ref={svgRef}
          width={600}
          height={300}
          className="border border-slate-200 rounded bg-white cursor-move"
          style={{ userSelect: 'none' }}
        />
      </div>
    </div>
  )
}