'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Slider } from '@/components/ui/slider'
import { CLTPreDesignChart } from './CLTPreDesignChart'
import { Loader2, Database, Filter, BarChart3 } from 'lucide-react'
import { CLTDatabase, CLTChartPoint, CLTStatistics } from '@/types/clt'

export function CLTDatabaseViewer() {
  // State
  const [database, setDatabase] = useState<CLTDatabase | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(true)
  const [showStatistics, setShowStatistics] = useState(false)
  
  // Filter state
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set(['A', 'B', 'C', 'Toiture']))
  const [selectedChapeTypes, setSelectedChapeTypes] = useState<Set<string>>(new Set())
  const [selectedQValue, setSelectedQValue] = useState<string>('ALL')
  
  const [qRange, setQRange] = useState<[number, number]>([0, 6000])
  const [gRange, setGRange] = useState<[number, number]>([0, 4000])
  const [LRange, setLRange] = useState<[number, number]>([2, 8])

  // Load database on mount
  useEffect(() => {
    const loadDatabase = async () => {
      try {
        const response = await fetch('/data/clt_database.json')
        if (!response.ok) throw new Error(`Failed to load CLT database: ${response.status} ${response.statusText}`)
        const data: CLTDatabase = await response.json()
        setDatabase(data)
        
        // Auto-select first product
        const productKeys = Object.keys(data)
        if (productKeys.length > 0) {
          setSelectedProduct(productKeys[0])
        }

        // Initialize chape types and q values from data
        const allChapeTypes = new Set<string>()
        const allQValues = new Set<number>()
        Object.values(data).forEach(product => {
          if (product && product["pre-design"] && Array.isArray(product["pre-design"])) {
            product["pre-design"].forEach(entry => {
              if (entry && entry.type_chape) {
                allChapeTypes.add(entry.type_chape)
              }
              if (entry && typeof entry.q === 'number') {
                allQValues.add(entry.q)
              }
            })
          }
        })
        setSelectedChapeTypes(allChapeTypes)
        
      } catch (err) {
        console.error('Error loading CLT database:', err)
        setError(`Failed to load CLT database: ${err instanceof Error ? err.message : 'Unknown error'}`)
      } finally {
        setLoading(false)
      }
    }
    
    loadDatabase()
  }, [])

  // Get current product
  const currentProduct = database && selectedProduct && selectedProduct !== 'ALL_PRODUCTS' ? database[selectedProduct] : null

  // Get available values for filters
  const availableChapeTypes = useMemo(() => {
    if (!database) return []
    const types = new Set<string>()
    Object.values(database).forEach(product => {
      if (product && product["pre-design"] && Array.isArray(product["pre-design"])) {
        product["pre-design"].forEach(entry => {
          if (entry && entry.type_chape) {
            types.add(entry.type_chape)
          }
        })
      }
    })
    return Array.from(types).sort()
  }, [database])

  const availableQValues = useMemo(() => {
    if (!database) return []
    const values = new Set<number>()
    Object.values(database).forEach(product => {
      if (product && product["pre-design"] && Array.isArray(product["pre-design"])) {
        product["pre-design"].forEach(entry => {
          if (entry && typeof entry.q === 'number') {
            values.add(entry.q)
          }
        })
      }
    })
    return Array.from(values).sort((a, b) => a - b)
  }, [database])

  // Filter toggle functions
  const toggleCategory = (category: string) => {
    const newSet = new Set(selectedCategories)
    if (newSet.has(category)) {
      newSet.delete(category)
    } else {
      newSet.add(category)
    }
    setSelectedCategories(newSet)
  }

  const toggleChapeType = (chapeType: string) => {
    const newSet = new Set(selectedChapeTypes)
    if (newSet.has(chapeType)) {
      newSet.delete(chapeType)
    } else {
      newSet.add(chapeType)
    }
    setSelectedChapeTypes(newSet)
  }

  // Process filtered data for chart
  const chartData = useMemo((): CLTChartPoint[] => {
    if (!database) return []

    const points: CLTChartPoint[] = []
    const productsToShow = selectedProduct && selectedProduct !== 'ALL_PRODUCTS' ? [selectedProduct] : Object.keys(database)

    productsToShow.forEach(productKey => {
      const product = database[productKey]
      
      // Add error handling for missing or malformed data
      if (!product) {
        console.warn(`No product data for ${productKey}`)
        return
      }
      
      if (!product["pre-design"]) {
        console.warn(`No pre-design data for ${productKey}:`, product)
        return
      }
      
      if (!Array.isArray(product["pre-design"])) {
        console.warn(`pre-design is not array for ${productKey}:`, typeof product["pre-design"], product["pre-design"])
        return
      }
      

      product["pre-design"].forEach(entry => {
        // Add error handling for malformed entries
        if (!entry || typeof entry.g !== 'number' || typeof entry.q !== 'number' || typeof entry.L !== 'number') {
          console.warn(`Invalid entry data for ${productKey}:`, entry)
          return
        }

        // Apply filters
        const category = entry.live_load_category || 'Toiture'
        
        if (!selectedCategories.has(category)) {
          return
        }
        if (selectedChapeTypes.size > 0 && !selectedChapeTypes.has(entry.type_chape)) {
          return
        }
        if (selectedQValue !== 'ALL' && entry.q !== parseInt(selectedQValue)) {
          return
        }
        if (entry.q < qRange[0] || entry.q > qRange[1]) {
          return
        }
        if (entry.g < gRange[0] || entry.g > gRange[1]) {
          return
        }
        if (entry.L < LRange[0] || entry.L > LRange[1]) {
          return
        }

        points.push({
          productKey,
          entry,
          x: entry.L,
          y: entry.g,
          size: entry.q,
          color: category,
          shape: entry.type_chape
        })
      })
    })

    return points
  }, [database, selectedProduct, selectedCategories, selectedChapeTypes, selectedQValue, qRange, gRange, LRange])

  // Calculate statistics
  const statistics = useMemo((): CLTStatistics | null => {
    if (!chartData.length) return null

    const gValues = chartData.map(p => p.y)
    const qValues = chartData.map(p => p.entry.q)
    const LValues = chartData.map(p => p.x)

    const calculateStats = (values: number[]) => {
      const min = Math.min(...values)
      const max = Math.max(...values)
      const mean = values.reduce((a, b) => a + b, 0) / values.length
      const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length
      const std = Math.sqrt(variance)
      return { min, max, mean, std }
    }

    const categoryDistribution: Record<string, number> = {}
    const chapeTypeDistribution: Record<string, number> = {}

    chartData.forEach(point => {
      const category = point.entry.live_load_category || 'Toiture'
      categoryDistribution[category] = (categoryDistribution[category] || 0) + 1
      chapeTypeDistribution[point.entry.type_chape] = (chapeTypeDistribution[point.entry.type_chape] || 0) + 1
    })

    return {
      totalEntries: chartData.length,
      gStats: calculateStats(gValues),
      qStats: calculateStats(qValues),
      LStats: calculateStats(LValues),
      categoryDistribution,
      chapeTypeDistribution
    }
  }, [chartData])

  // Get unique values for filter options
  const allCategories = useMemo(() => ['A', 'B', 'C', 'Toiture'], [])
  
  const allChapeTypes = useMemo(() => {
    if (!database) return []
    const types = new Set<string>()
    Object.values(database).forEach(product => {
      if (product && product["pre-design"] && Array.isArray(product["pre-design"])) {
        product["pre-design"].forEach(entry => {
          if (entry && entry.type_chape) {
            types.add(entry.type_chape)
          }
        })
      }
    })
    return Array.from(types).sort()
  }, [database])


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading CLT database...</span>
        </div>
      </div>
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

  if (!database) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">No CLT database loaded</p>
        </CardContent>
      </Card>
    )
  }

  const productKeys = Object.keys(database)

  return (
    <div className="space-y-6">
      {/* Controls Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                CLT Database Explorer
              </CardTitle>
              <CardDescription>
                Explore Cross-Laminated Timber products and their pre-design parameters
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowStatistics(!showStatistics)}
              >
                <BarChart3 className="h-4 w-4 mr-1" />
                {showStatistics ? 'Hide' : 'Show'} Stats
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="h-4 w-4 mr-1" />
                {showFilters ? 'Hide' : 'Show'} Filters
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Product Selector */}
            <div className="space-y-2 lg:col-span-2">
              <label className="text-sm font-medium">CLT Product</label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Select product..." />
                </SelectTrigger>
                <SelectContent className="max-h-60">
                  <SelectItem value="ALL_PRODUCTS">All Products</SelectItem>
                  {productKeys.map(key => (
                    <SelectItem key={key} value={key}>
                      <div className="flex flex-col">
                        <span>{key}</span>
                        <span className="text-xs text-muted-foreground">
                          h={(database[key].h * 1000).toFixed(0)}mm, {database[key].fire_resistance}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Product Info */}
            {currentProduct && (
              <div className="space-y-2 lg:col-span-2">
                <label className="text-sm font-medium">Product Details</label>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    Thickness: {(currentProduct.h * 1000).toFixed(0)}mm
                  </Badge>
                  <Badge variant="secondary">
                    {currentProduct.fire_resistance}
                  </Badge>
                  <Badge variant="outline">
                    {currentProduct["pre-design"]?.length || 0} configurations
                  </Badge>
                </div>
              </div>
            )}
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="space-y-4 border-t pt-4">
              <h3 className="text-sm font-medium">Filters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {/* Live Load Categories */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Load Categories</label>
                  <div className="grid grid-cols-2 gap-2">
                    {allCategories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category}`}
                          checked={selectedCategories.has(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label 
                          htmlFor={`category-${category}`}
                          className="text-sm cursor-pointer"
                        >
                          {category === 'Toiture' ? 'Roof' : category}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floor Types (Type Chape) */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Floor Types</label>
                  <div className="grid grid-cols-1 gap-2 max-h-32 overflow-y-auto">
                    {availableChapeTypes.map(chapeType => (
                      <div key={chapeType} className="flex items-center space-x-2">
                        <Checkbox
                          id={`chape-${chapeType}`}
                          checked={selectedChapeTypes.has(chapeType)}
                          onCheckedChange={() => toggleChapeType(chapeType)}
                        />
                        <label 
                          htmlFor={`chape-${chapeType}`}
                          className="text-xs cursor-pointer leading-tight"
                          title={chapeType}
                        >
                          {chapeType.includes('Humide') ? 'Wet Screed' :
                           chapeType.includes('Seche') ? 'Dry Screed' :
                           chapeType.includes('Faible') ? 'Low Criteria' : 
                           chapeType.includes('Toiture') ? 'Roof' : chapeType}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Q Value Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Specific Q Value</label>
                  <Select value={selectedQValue} onValueChange={setSelectedQValue}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select q value" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All Values</SelectItem>
                      {availableQValues.map(qValue => (
                        <SelectItem key={qValue} value={qValue.toString()}>
                          {qValue} N/m²
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Q Range */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Live Load (q)</label>
                    <Badge variant="outline">
                      {qRange[0]}-{qRange[1]} N/m²
                    </Badge>
                  </div>
                  <Slider
                    value={qRange}
                    onValueChange={(value) => setQRange([value[0], value[1]])}
                    min={0}
                    max={6000}
                    step={100}
                    className="w-full"
                  />
                </div>

                {/* G Range */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Dead Load (g)</label>
                    <Badge variant="outline">
                      {gRange[0]}-{gRange[1]} N/m²
                    </Badge>
                  </div>
                  <Slider
                    value={gRange}
                    onValueChange={(value) => setGRange([value[0], value[1]])}
                    min={0}
                    max={4000}
                    step={100}
                    className="w-full"
                  />
                </div>

                {/* L Range */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Span Length (L)</label>
                    <Badge variant="outline">
                      {LRange[0]}-{LRange[1]} m
                    </Badge>
                  </div>
                  <Slider
                    value={LRange}
                    onValueChange={(value) => setLRange([value[0], value[1]])}
                    min={2}
                    max={8}
                    step={0.5}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Chape Types */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Floor Types</label>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                  {allChapeTypes.map(chapeType => (
                    <div key={chapeType} className="flex items-center space-x-2">
                      <Checkbox
                        id={`chape-${chapeType}`}
                        checked={selectedChapeTypes.has(chapeType)}
                        onCheckedChange={() => toggleChapeType(chapeType)}
                      />
                      <label 
                        htmlFor={`chape-${chapeType}`}
                        className="text-xs cursor-pointer"
                      >
                        {chapeType.replace(/_/g, ' ')}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statistics Panel */}
      {showStatistics && statistics && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Data Statistics</CardTitle>
            <CardDescription>
              Statistical summary of {statistics.totalEntries} filtered entries
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium mb-2">Dead Load (g)</h4>
                <div className="space-y-1 text-sm">
                  <div>Range: {statistics.gStats.min.toFixed(0)} - {statistics.gStats.max.toFixed(0)} N/m²</div>
                  <div>Average: {statistics.gStats.mean.toFixed(0)} N/m²</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Live Load (q)</h4>
                <div className="space-y-1 text-sm">
                  <div>Range: {statistics.qStats.min.toFixed(0)} - {statistics.qStats.max.toFixed(0)} N/m²</div>
                  <div>Average: {statistics.qStats.mean.toFixed(0)} N/m²</div>
                </div>
              </div>
              <div>
                <h4 className="font-medium mb-2">Span Length (L)</h4>
                <div className="space-y-1 text-sm">
                  <div>Range: {statistics.LStats.min.toFixed(1)} - {statistics.LStats.max.toFixed(1)} m</div>
                  <div>Average: {statistics.LStats.mean.toFixed(1)} m</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-Design Parameters Visualization</CardTitle>
          <CardDescription>
            Dead Load (g) vs Span Length (L) - Point size represents Live Load (q), 
            color indicates Load Category, shape shows Floor Type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <CLTPreDesignChart
            data={chartData}
            width={900}
            height={500}
            className="py-4"
          />
          
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Showing {chartData.length} configuration{chartData.length !== 1 ? 's' : ''} 
            {selectedProduct && selectedProduct !== 'ALL_PRODUCTS' ? ` for ${selectedProduct}` : ' across all products'}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}