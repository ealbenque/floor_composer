'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { CLTChartProps } from '@/types/clt'

export function CLTPreDesignChart({ 
  data, 
  width = 800, 
  height = 500,
  onPointHover,
  onPointClick,
  selectedPoints = new Set(),
  className = "" 
}: CLTChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !data.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    // Chart dimensions
    const margin = { top: 20, right: 120, bottom: 60, left: 80 }
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Scales
    const xExtent = d3.extent(data, d => d.x) as [number, number]
    const yExtent = d3.extent(data, d => d.y) as [number, number]
    
    // Add padding to scales
    const xPadding = (xExtent[1] - xExtent[0]) * 0.05
    const yPadding = (yExtent[1] - yExtent[0]) * 0.05

    const xScale = d3.scaleLinear()
      .domain([xExtent[0] - xPadding, xExtent[1] + xPadding])
      .range([0, chartWidth])

    const yScale = d3.scaleLinear()
      .domain([yExtent[0] - yPadding, yExtent[1] + yPadding])
      .range([chartHeight, 0])

    // Size scale for points based on q values
    const sizeExtent = d3.extent(data, d => d.size) as [number, number]
    const sizeScale = d3.scaleSqrt()
      .domain(sizeExtent)
      .range([3, 12])

    // Color mapping for live load categories
    const colorMap = {
      'A': '#22c55e',      // green
      'B': '#3b82f6',      // blue  
      'C': '#ef4444',      // red
      'Toiture': '#a855f7' // purple
    }

    // Shape mapping for type_chape
    const getSymbol = (shape: string) => {
      switch (shape) {
        case 'Criteres_Eleves_Chape_Humide': return d3.symbolCircle
        case 'Criteres_Eleves_Chape_Seche': return d3.symbolSquare
        case 'Criteres_Faibles': return d3.symbolTriangle
        case 'Toiture': return d3.symbolDiamond
        default: return d3.symbolCircle
      }
    }

    // Add grid lines
    const xTicks = xScale.ticks(8)
    const yTicks = yScale.ticks(8)

    g.selectAll(".grid-line-x")
      .data(xTicks)
      .enter()
      .append("line")
      .attr("class", "grid-line-x")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", chartHeight)
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)

    g.selectAll(".grid-line-y")
      .data(yTicks)
      .enter()
      .append("line")
      .attr("class", "grid-line-y")
      .attr("x1", 0)
      .attr("x2", chartWidth)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)

    // Add axes
    const xAxis = g.append("g")
      .attr("transform", `translate(0,${chartHeight})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}m`))

    xAxis.append("text")
      .attr("x", chartWidth / 2)
      .attr("y", 40)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Span Length L (m)")

    const yAxis = g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => {
        const value = d as number
        if (value >= 1000) {
          return `${(value / 1000).toFixed(0)}k N/m²`
        }
        return `${value} N/m²`
      }))

    yAxis.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -50)
      .attr("x", -chartHeight / 2)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .style("font-weight", "500")
      .text("Dead Load g (N/m²)")

    // Create tooltip
    const tooltip = d3.select("body").selectAll(".clt-chart-tooltip")
      .data([0])
      .join("div")
      .attr("class", "clt-chart-tooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.9)")
      .style("color", "white")
      .style("padding", "12px 16px")
      .style("border-radius", "8px")
      .style("font-size", "12px")
      .style("line-height", "1.4")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("z-index", 1000)
      .style("max-width", "220px")

    // Add data points
    const points = g.selectAll(".data-point")
      .data(data)
      .enter()
      .append("path")
      .attr("class", "data-point")
      .attr("transform", d => `translate(${xScale(d.x)}, ${yScale(d.y)})`)
      .attr("d", d => {
        const symbolGenerator = d3.symbol()
          .type(getSymbol(d.shape))
          .size(sizeScale(d.size) ** 2)
        return symbolGenerator() || ''
      })
      .attr("fill", d => {
        const category = d.entry.live_load_category || 'Toiture'
        return colorMap[category as keyof typeof colorMap] || '#6b7280'
      })
      .attr("stroke", "#374151")
      .attr("stroke-width", d => selectedPoints.has(`${d.productKey}-${data.indexOf(d)}`) ? 2 : 0.5)
      .attr("opacity", d => selectedPoints.has(`${d.productKey}-${data.indexOf(d)}`) ? 1 : 0.8)
      .style("cursor", "pointer")

    // Add interactions
    points
      .on("mouseover", function(event, d) {
        d3.select(this)
          .transition()
          .duration(150)
          .attr("stroke-width", 2)
          .attr("opacity", 1)

        const category = d.entry.live_load_category || 'Toiture'
        const chapeType = d.entry.type_chape.replace(/_/g, ' ')
        
        tooltip
          .style("opacity", 1)
          .html(`
            <div style="font-weight: 600; margin-bottom: 8px;">${d.productKey}</div>
            <div><strong>Span:</strong> ${d.x}m</div>
            <div><strong>Dead Load (g):</strong> ${d.y.toLocaleString()} N/m²</div>
            <div><strong>Live Load (q):</strong> ${d.entry.q.toLocaleString()} N/m²</div>
            <div><strong>Category:</strong> ${category}</div>
            <div><strong>Type:</strong> ${chapeType}</div>
          `)
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 80) + "px")

        onPointHover?.(d)
      })
      .on("mousemove", function(event) {
        tooltip
          .style("left", (event.pageX + 15) + "px")
          .style("top", (event.pageY - 80) + "px")
      })
      .on("mouseout", function(event, d) {
        const isSelected = selectedPoints.has(`${d.productKey}-${data.indexOf(d)}`)
        
        d3.select(this)
          .transition()
          .duration(150)
          .attr("stroke-width", isSelected ? 2 : 0.5)
          .attr("opacity", isSelected ? 1 : 0.8)

        tooltip.style("opacity", 0)
        onPointHover?.(null)
      })
      .on("click", function(event, d) {
        onPointClick?.(d)
      })

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`)

    // Color legend for live load categories
    const colorLegend = legend.append("g")
    
    colorLegend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .attr("fill", "currentColor")
      .text("Load Category")

    Object.entries(colorMap).forEach(([category, color], i) => {
      const legendItem = colorLegend.append("g")
        .attr("transform", `translate(0, ${20 + i * 18})`)

      legendItem.append("circle")
        .attr("cx", 6)
        .attr("cy", 0)
        .attr("r", 4)
        .attr("fill", color)
        .attr("stroke", "#374151")
        .attr("stroke-width", 0.5)

      legendItem.append("text")
        .attr("x", 15)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("font-size", "11px")
        .attr("fill", "currentColor")
        .text(category === '' ? 'Toiture' : category)
    })

    // Shape legend for type_chape
    const shapeLegend = legend.append("g")
      .attr("transform", `translate(0, ${120})`)

    shapeLegend.append("text")
      .attr("x", 0)
      .attr("y", 0)
      .style("font-size", "12px")
      .style("font-weight", "600")
      .attr("fill", "currentColor")
      .text("Floor Type")

    const shapeTypes = [
      { key: 'Criteres_Eleves_Chape_Humide', label: 'Wet Screed', symbol: d3.symbolCircle },
      { key: 'Criteres_Eleves_Chape_Seche', label: 'Dry Screed', symbol: d3.symbolSquare },
      { key: 'Criteres_Faibles', label: 'Low Criteria', symbol: d3.symbolTriangle },
      { key: 'Toiture', label: 'Roof', symbol: d3.symbolDiamond }
    ]

    shapeTypes.forEach((type, i) => {
      const legendItem = shapeLegend.append("g")
        .attr("transform", `translate(0, ${20 + i * 18})`)

      legendItem.append("path")
        .attr("transform", "translate(6, 0)")
        .attr("d", d3.symbol().type(type.symbol).size(40)())
        .attr("fill", "#6b7280")
        .attr("stroke", "#374151")
        .attr("stroke-width", 0.5)

      legendItem.append("text")
        .attr("x", 15)
        .attr("y", 0)
        .attr("dy", "0.35em")
        .style("font-size", "11px")
        .attr("fill", "currentColor")
        .text(type.label)
    })

  }, [data, width, height, selectedPoints, onPointHover, onPointClick])

  if (!data.length) {
    return (
      <div className={`flex items-center justify-center ${className}`} style={{ width, height }}>
        <div className="text-center">
          <p className="text-muted-foreground">No data to display</p>
          <p className="text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex justify-center ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="text-slate-600"
      />
    </div>
  )
}