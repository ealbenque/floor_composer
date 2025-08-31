'use client'

import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'

interface LoadCapacityChartProps {
  singleSpanData: number[]
  multipleSpansData: number[]
  spansRange: { min: number; max: number }
  className?: string
}

export function LoadCapacityChart({ 
  singleSpanData, 
  multipleSpansData, 
  spansRange,
  className = "" 
}: LoadCapacityChartProps) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    if (!svgRef.current || !singleSpanData.length || !multipleSpansData.length) return

    const svg = d3.select(svgRef.current)
    svg.selectAll("*").remove()

    // Chart dimensions
    const margin = { top: 20, right: 80, bottom: 40, left: 60 }
    const width = 400 - margin.left - margin.right
    const height = 200 - margin.bottom - margin.top

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // Generate span values
    const spans = d3.range(spansRange.min, spansRange.max + 0.1, (spansRange.max - spansRange.min) / (singleSpanData.length - 1))
    
    // Prepare data
    const singleSpanPoints = spans.map((span, i) => ({ 
      span, 
      load: singleSpanData[i] || 0 
    }))
    const multipleSpansPoints = spans.map((span, i) => ({ 
      span, 
      load: multipleSpansData[i] || 0 
    }))

    // Scales
    const xScale = d3.scaleLinear()
      .domain(d3.extent(spans) as [number, number])
      .range([0, width])

    const yScale = d3.scaleLinear()
      .domain([0, d3.max([...singleSpanData, ...multipleSpansData]) as number])
      .range([height, 0])

    // Line generators
    const line = d3.line<{ span: number; load: number }>()
      .x(d => xScale(d.span))
      .y(d => yScale(d.load))
      .curve(d3.curveMonotoneX)

    // Add axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).tickFormat(d => `${d}m`))
      .append("text")
      .attr("x", width / 2)
      .attr("y", 35)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Span (m)")

    g.append("g")
      .call(d3.axisLeft(yScale).tickFormat(d => `${Math.round(d3.format(".0s")(d as number))}N/m²`))
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -45)
      .attr("x", -height / 2)
      .attr("fill", "currentColor")
      .attr("text-anchor", "middle")
      .style("font-size", "12px")
      .text("Load Capacity")

    // Add grid lines
    g.selectAll(".grid-line-x")
      .data(xScale.ticks(5))
      .enter()
      .append("line")
      .attr("class", "grid-line-x")
      .attr("x1", d => xScale(d))
      .attr("x2", d => xScale(d))
      .attr("y1", 0)
      .attr("y2", height)
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)

    g.selectAll(".grid-line-y")
      .data(yScale.ticks(5))
      .enter()
      .append("line")
      .attr("class", "grid-line-y")
      .attr("x1", 0)
      .attr("x2", width)
      .attr("y1", d => yScale(d))
      .attr("y2", d => yScale(d))
      .attr("stroke", "currentColor")
      .attr("stroke-opacity", 0.1)

    // Add lines
    g.append("path")
      .datum(singleSpanPoints)
      .attr("fill", "none")
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)
      .attr("d", line)

    g.append("path")
      .datum(multipleSpansPoints)
      .attr("fill", "none")
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)
      .attr("d", line)

    // Add points
    g.selectAll(".single-span-point")
      .data(singleSpanPoints)
      .enter()
      .append("circle")
      .attr("class", "single-span-point")
      .attr("cx", d => xScale(d.span))
      .attr("cy", d => yScale(d.load))
      .attr("r", 3)
      .attr("fill", "#3b82f6")

    g.selectAll(".multiple-spans-point")
      .data(multipleSpansPoints)
      .enter()
      .append("circle")
      .attr("class", "multiple-spans-point")
      .attr("cx", d => xScale(d.span))
      .attr("cy", d => yScale(d.load))
      .attr("r", 3)
      .attr("fill", "#ef4444")

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(${width + margin.left + 10}, ${margin.top + 20})`)

    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 15)
      .attr("y1", 0)
      .attr("y2", 0)
      .attr("stroke", "#3b82f6")
      .attr("stroke-width", 2)

    legend.append("text")
      .attr("x", 20)
      .attr("y", 0)
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .attr("fill", "currentColor")
      .text("Single Span")

    legend.append("line")
      .attr("x1", 0)
      .attr("x2", 15)
      .attr("y1", 20)
      .attr("y2", 20)
      .attr("stroke", "#ef4444")
      .attr("stroke-width", 2)

    legend.append("text")
      .attr("x", 20)
      .attr("y", 20)
      .attr("dy", "0.35em")
      .style("font-size", "11px")
      .attr("fill", "currentColor")
      .text("Multiple Spans")

  }, [singleSpanData, multipleSpansData, spansRange])

  return (
    <div className={`flex justify-center ${className}`}>
      <svg
        ref={svgRef}
        width={400}
        height={200}
        className="text-slate-600"
      />
    </div>
  )
}