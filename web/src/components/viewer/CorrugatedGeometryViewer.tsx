'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

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

  useEffect(() => {
    if (!svgRef.current || !geometryData) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    // Chart dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }
    const width = 600 - margin.left - margin.right
    const height = 300 - margin.bottom - margin.top

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Calculate scales based on bounds
    const bounds = geometryData.bounds
    const dataWidth = bounds.max_x - bounds.min_x
    const dataHeight = bounds.max_y - bounds.min_y
    
    // Add padding
    const padding = Math.max(dataWidth, dataHeight) * 0.1
    
    const xScale = d3.scaleLinear()
      .domain([bounds.min_x - padding, bounds.max_x + padding])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([bounds.min_y - padding, bounds.max_y + padding])
      .range([height, 0]) // Flip Y axis for proper SVG rendering

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

    // Transform SVG paths to fit the scales
    const transformPath = (svgPath: string) => {
      // Parse SVG path and transform coordinates
      return svgPath.replace(/([ML])\s*([\d.-]+)\s+([\d.-]+)/g, (match, command, x, y) => {
        const transformedX = xScale(parseFloat(x) / 1000) // Convert from mm to m
        const transformedY = yScale(parseFloat(y) / 1000) // Convert from mm to m
        return `${command} ${transformedX} ${transformedY}`
      })
    }

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
      .attr("x", width / 2 + margin.left)
      .attr("y", 15)
      .attr("text-anchor", "middle")
      .attr("fill", "currentColor")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Composite Section - Side View")

  }, [geometryData, materialPalette])

  return (
    <div className={`flex justify-center ${className}`}>
      <svg
        ref={svgRef}
        width={600}
        height={300}
        className="border border-slate-200 rounded bg-white"
      />
    </div>
  )
}