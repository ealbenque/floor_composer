"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  Settings, 
  Database, 
  RotateCcw, 
  ChevronDown, 
  ChevronRight,
  Download,
  Search
} from 'lucide-react'
import { 
  CLTDatabase, 
  CLTConfiguratorFilters,
  LIVE_LOAD_CATEGORIES,
  FIRE_RESISTANCE_OPTIONS,
  DEFAULT_CLT_CONFIGURATOR_FILTERS
} from '@/types/clt'
import {
  filterCLTProducts,
  extractUniqueTypeChapeOptions,
  getFilteredResultsStats,
  formatHeight,
  formatLoad,
  formatSpan
} from '@/lib/clt-utils'

export function CLTConfigurator() {
  // State
  const [database, setDatabase] = useState<CLTDatabase | null>(null)
  const [filters, setFilters] = useState<CLTConfiguratorFilters>(DEFAULT_CLT_CONFIGURATOR_FILTERS)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())
  const [typeChapeOptions, setTypeChapeOptions] = useState<string[]>([])

  // Load CLT database
  useEffect(() => {
    const loadDatabase = async () => {
      try {
        setLoading(true)
        const response = await fetch('/data/clt_database.json')
        if (!response.ok) throw new Error('Failed to load CLT database')
        
        const data: CLTDatabase = await response.json()
        setDatabase(data)
        
        // Extract available type_chape options
        const chapeOptions = extractUniqueTypeChapeOptions(data)
        setTypeChapeOptions(chapeOptions)
        
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load CLT database')
      } finally {
        setLoading(false)
      }
    }

    loadDatabase()
  }, [])

  // Filter results based on current filters
  const filteredResults = useMemo(() => {
    if (!database) return []
    return filterCLTProducts(database, filters)
  }, [database, filters])

  // Statistics about filtered results
  const stats = useMemo(() => {
    return getFilteredResultsStats(filteredResults)
  }, [filteredResults])

  // Handle filter changes
  const updateFilter = <K extends keyof CLTConfiguratorFilters>(
    key: K, 
    value: CLTConfiguratorFilters[K]
  ) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Reset filters
  const resetFilters = () => {
    setFilters(DEFAULT_CLT_CONFIGURATOR_FILTERS)
  }

  // Toggle row expansion
  const toggleRowExpansion = (productReference: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productReference)) {
        newSet.delete(productReference)
      } else {
        newSet.add(productReference)
      }
      return newSet
    })
  }

  // Export results to CSV
  const exportToCSV = () => {
    if (filteredResults.length === 0) return

    const headers = ['Product Reference', 'Height (mm)', 'Fire Resistance', 'Matching Pre-designs']
    const rows = filteredResults.map(result => [
      result.productReference,
      formatHeight(result.product.h),
      result.product.fire_resistance,
      result.matchingPreDesigns.length.toString()
    ])

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clt-products.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-900"></div>
            <span>Loading CLT database...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-destructive">
            <strong>Error:</strong> {error}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                CLT Product Configurator
              </CardTitle>
              <CardDescription>
                Configure your requirements to find matching CLT products
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={resetFilters}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Span Length */}
            <div className="space-y-2">
              <Label htmlFor="span">Required Span (L) - meters</Label>
              <Input
                id="span"
                type="number"
                step="0.1"
                min="0"
                value={filters.L_user}
                onChange={(e) => updateFilter('L_user', parseFloat(e.target.value) || 0)}
                placeholder="4.0"
              />
            </div>

            {/* Live Load */}
            <div className="space-y-2">
              <Label htmlFor="liveload">Required Live Load (q) - N/m²</Label>
              <Input
                id="liveload"
                type="number"
                min="0"
                step="100"
                value={filters.q_user}
                onChange={(e) => updateFilter('q_user', parseInt(e.target.value) || 0)}
                placeholder="2000"
              />
            </div>

            {/* Dead Load */}
            <div className="space-y-2">
              <Label htmlFor="deadload">Required Dead Load (g) - N/m²</Label>
              <Input
                id="deadload"
                type="number"
                min="0"
                step="100"
                value={filters.g_user}
                onChange={(e) => updateFilter('g_user', parseInt(e.target.value) || 0)}
                placeholder="1500"
              />
            </div>

            {/* Max Height */}
            <div className="space-y-2">
              <Label htmlFor="height">Maximum Height (h) - meters</Label>
              <Input
                id="height"
                type="number"
                step="0.01"
                min="0"
                value={filters.h_user}
                onChange={(e) => updateFilter('h_user', parseFloat(e.target.value) || 0)}
                placeholder="0.25"
              />
            </div>

            {/* Live Load Category */}
            <div className="space-y-2">
              <Label>Live Load Category</Label>
              <Select 
                value={filters.live_load_category_user} 
                onValueChange={(value) => updateFilter('live_load_category_user', value as CLTConfiguratorFilters['live_load_category_user'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category..." />
                </SelectTrigger>
                <SelectContent>
                  {LIVE_LOAD_CATEGORIES.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Fire Resistance */}
            <div className="space-y-2">
              <Label>Minimum Fire Resistance</Label>
              <Select 
                value={filters.fire_resistance_user} 
                onValueChange={(value) => updateFilter('fire_resistance_user', value as CLTConfiguratorFilters['fire_resistance_user'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select fire resistance..." />
                </SelectTrigger>
                <SelectContent>
                  {FIRE_RESISTANCE_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Type Chape */}
            <div className="space-y-2 md:col-span-2 lg:col-span-1">
              <Label>Floor Type (Type Chape)</Label>
              <Select 
                value={filters.type_chape_user} 
                onValueChange={(value) => updateFilter('type_chape_user', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select floor type..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Floor Types</SelectItem>
                  {typeChapeOptions.map(option => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Search Results
              </CardTitle>
              <CardDescription>
                Products matching your requirements
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {stats.totalProducts} products
              </Badge>
              <Badge variant="outline">
                {stats.totalMatchingPreDesigns} configurations
              </Badge>
              {filteredResults.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={exportToCSV}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredResults.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2" />
              <p>No CLT products match your current criteria.</p>
              <p className="text-sm">Try adjusting your requirements or resetting filters.</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]"></TableHead>
                    <TableHead>Product Reference</TableHead>
                    <TableHead>Height</TableHead>
                    <TableHead>Fire Resistance</TableHead>
                    <TableHead>Matching Configs</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((result) => (
                    <React.Fragment key={result.productReference}>
                      <TableRow 
                        className="cursor-pointer hover:bg-muted/50" 
                        onClick={() => toggleRowExpansion(result.productReference)}
                      >
                        <TableCell>
                          {expandedRows.has(result.productReference) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </TableCell>
                        <TableCell className="font-medium">
                          {result.productReference}
                        </TableCell>
                        <TableCell>
                          {formatHeight(result.product.h)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {result.product.fire_resistance}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {result.matchingPreDesigns.length} config{result.matchingPreDesigns.length !== 1 ? 's' : ''}
                          </Badge>
                        </TableCell>
                      </TableRow>
                      {expandedRows.has(result.productReference) && (
                        <TableRow>
                          <TableCell colSpan={5} className="bg-muted/20 p-4">
                            <div className="space-y-3">
                              <h4 className="font-semibold">Matching Pre-design Configurations:</h4>
                              <div className="grid gap-2">
                                {result.matchingPreDesigns.map((preDesign, index) => (
                                  <div 
                                    key={index} 
                                    className="flex items-center gap-4 text-sm bg-background p-3 rounded border"
                                  >
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">Category:</span>
                                      <Badge variant={preDesign.live_load_category ? "default" : "secondary"}>
                                        {preDesign.live_load_category || "Roof"}
                                      </Badge>
                                    </div>
                                    <div>Span: {formatSpan(preDesign.L)}</div>
                                    <div>Live Load: {formatLoad(preDesign.q)}</div>
                                    <div>Dead Load: {formatLoad(preDesign.g)}</div>
                                    <div className="text-muted-foreground">
                                      {preDesign.type_chape}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}