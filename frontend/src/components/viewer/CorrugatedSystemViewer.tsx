"use client"

import React, { useState, useEffect, useCallback } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { GeometryViewer } from './GeometryViewer'
import { LoadCapacityChart } from './LoadCapacityChart'
import { Loader2, Settings, Info } from 'lucide-react'
import { CorrugatedGeometry, CorrugatedProperties, ProfileInfo as ProfileInfoType } from '@/types/geometry'

// API Types
interface ProfileInfo {
  key: string
  name: string
  description: string
  steel_thickness_variants: string[]
  concrete_thickness_range: { min: number; max: number }
  spans_range: { min: number; max: number }
}

interface CorrugatedSystemData {
  geometry: CorrugatedGeometry
  properties: CorrugatedProperties
  profile_info: ProfileInfoType
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export function CorrugatedSystemViewer() {
  // State
  const [profiles, setProfiles] = useState<ProfileInfo[]>([])
  const [selectedProfile, setSelectedProfile] = useState<string>('')
  const [selectedSteelThickness, setSelectedSteelThickness] = useState<string>('')
  const [concreteThickness, setConcreteThickness] = useState<number>(0.15)
  const [systemData, setSystemData] = useState<CorrugatedSystemData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showProperties, setShowProperties] = useState(true)

  // Load available profiles on mount
  useEffect(() => {
    const loadProfiles = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/profiles`)
        if (!response.ok) throw new Error('Failed to load profiles')
        const data = await response.json()
        setProfiles(data.profiles)
        
        // Auto-select first profile
        if (data.profiles.length > 0) {
          const firstProfile = data.profiles[0]
          setSelectedProfile(firstProfile.key)
          setSelectedSteelThickness(firstProfile.steel_thickness_variants[0])
          setConcreteThickness((firstProfile.concrete_thickness_range.min + firstProfile.concrete_thickness_range.max) / 2)
        }
      } catch {
        setError('Failed to load profiles. Please ensure the API server is running.')
      }
    }
    
    loadProfiles()
  }, [])

  // Generate system when parameters change
  const generateSystem = useCallback(async () => {
    if (!selectedProfile || !selectedSteelThickness) return
    
    setLoading(true)
    setError(null)
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/corrugated-system`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          profile: selectedProfile,
          concrete_thickness: concreteThickness,
          steel_thickness: selectedSteelThickness,
          canvas_width: 800,
          canvas_height: 600
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to generate system')
      }
      
      const data = await response.json()
      setSystemData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate corrugated system')
    } finally {
      setLoading(false)
    }
  }, [selectedProfile, selectedSteelThickness, concreteThickness])

  // Auto-generate when parameters change
  useEffect(() => {
    const timer = setTimeout(generateSystem, 500) // Debounce API calls
    return () => clearTimeout(timer)
  }, [generateSystem])

  // Update concrete thickness when profile changes
  useEffect(() => {
    if (selectedProfile) {
      const profile = profiles.find(p => p.key === selectedProfile)
      if (profile) {
        const midpoint = (profile.concrete_thickness_range.min + profile.concrete_thickness_range.max) / 2
        setConcreteThickness(midpoint)
        // Auto-select first steel thickness
        if (profile.steel_thickness_variants.length > 0) {
          setSelectedSteelThickness(profile.steel_thickness_variants[0])
        }
      }
    }
  }, [selectedProfile, profiles])

  const currentProfile = profiles.find(p => p.key === selectedProfile)

  return (
    <div className="space-y-6">
      {/* Controls Panel */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Corrugated System Configuration
              </CardTitle>
              <CardDescription>
                Configure steel profile and concrete thickness for real-time generation
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowProperties(!showProperties)}
              className="flex items-center gap-1 self-start sm:self-center"
            >
              <Info className="h-4 w-4" />
              <span className="hidden sm:inline">{showProperties ? 'Hide' : 'Show'} Properties</span>
              <span className="sm:hidden">{showProperties ? 'Hide' : 'Show'}</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {/* Profile Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Steel Profile</label>
              <Select value={selectedProfile} onValueChange={setSelectedProfile}>
                <SelectTrigger>
                  <SelectValue placeholder="Select profile..." />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map(profile => (
                    <SelectItem key={profile.key} value={profile.key}>
                      <div className="flex flex-col max-w-full">
                        <span className="font-medium truncate">{profile.name}</span>
                        <span className="text-xs text-muted-foreground line-clamp-2 sm:line-clamp-1">
                          {profile.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Steel Thickness Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Steel Thickness</label>
              <Select value={selectedSteelThickness} onValueChange={setSelectedSteelThickness}>
                <SelectTrigger>
                  <SelectValue placeholder="Select thickness..." />
                </SelectTrigger>
                <SelectContent>
                  {currentProfile?.steel_thickness_variants.map(thickness => (
                    <SelectItem key={thickness} value={thickness}>
                      {thickness}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Concrete Thickness Slider */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Concrete Thickness</label>
                <Badge variant="outline">{(concreteThickness * 1000).toFixed(0)}mm</Badge>
              </div>
              {currentProfile && (
                <div className="px-2">
                  <Slider
                    value={[concreteThickness]}
                    onValueChange={(value) => setConcreteThickness(value[0])}
                    min={currentProfile.concrete_thickness_range.min}
                    max={currentProfile.concrete_thickness_range.max}
                    step={0.01}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{(currentProfile.concrete_thickness_range.min * 1000).toFixed(0)}mm</span>
                    <span>{(currentProfile.concrete_thickness_range.max * 1000).toFixed(0)}mm</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="text-destructive">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating corrugated system...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Geometry Viewer */}
      {systemData && !loading && (
        <Card>
          <CardHeader>
            <CardTitle>{systemData.profile_info.name} - Composite Section</CardTitle>
            <CardDescription>
              {systemData.profile_info.description} • {(concreteThickness * 1000).toFixed(0)}mm concrete thickness
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <GeometryViewer 
                geometryData={systemData.geometry.combined_system}
                materialPalette={{
                  metal_sheet: {
                    fill: "none",
                    stroke: "#374151", 
                    pattern: "none",
                    description: "Steel profile"
                  },
                  concrete: {
                    fill: "#e5e7eb",
                    stroke: "#6b7280",
                    pattern: "diagonal_hatch",
                    description: "Concrete section"
                  }
                }}
                visibleMaterials={new Set(['metal_sheet', 'concrete'])}
                mode="responsive"
                showControls={true}
                title="Composite Section - Side View"
                className="min-w-0"
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Properties Panel */}
      {systemData && showProperties && !loading && (
        <div className="space-y-6">
          {/* Load Capacity Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Load Capacity vs Span</CardTitle>
              <CardDescription>
                Maximum load capacity for different span configurations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LoadCapacityChart
                singleSpanData={systemData.properties.mechanical_performance.single_span_load_capacity_N_m2}
                multipleSpansData={systemData.properties.mechanical_performance.multiple_spans_load_capacity_N_m2}
                spansRange={currentProfile?.spans_range || { min: 2.0, max: 4.0 }}
                className="py-4"
              />
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Fire Resistance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Fire Resistance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Max REI Rating:</span>
                    <Badge variant="secondary">
                      REI {systemData.properties.fire_resistance.REI_minutes}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Standard resistance is REI30, higher resistance requires additional steel reinforcement in the concrete
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Acoustic Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Acoustic Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Rw (C ; Ctr):</span>
                      <Badge variant="secondary">
                        {systemData.properties.acoustic_performance.Rw_dB} ({systemData.properties.acoustic_performance.C_Ctr_dB.C} ; {systemData.properties.acoustic_performance.C_Ctr_dB.Ctr}) dB
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Affaiblissement acoustique pondéré
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Ra = Rw + C:</span>
                      <Badge variant="outline">
                        {systemData.properties.acoustic_performance.Rw_dB + systemData.properties.acoustic_performance.C_Ctr_dB.C} dB
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Affaiblissement acoustique pour les bruits aériens intérieurs
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-sm">Ra,tr = Rw + Ctr:</span>
                      <Badge variant="outline">
                        {systemData.properties.acoustic_performance.Rw_dB + systemData.properties.acoustic_performance.C_Ctr_dB.Ctr} dB
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Affaiblissement acoustique pour les bruits aériens extérieurs
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Weight & Volume */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Physical Properties</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Floor Weight:</span>
                    <Badge variant="secondary">
                      {Math.round(systemData.properties.theoretical_floor_weight_N_m2)} N/m²
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Concrete Volume:</span>
                    <Badge variant="secondary">
                      {systemData.properties.concrete_volume_m3_m2.toFixed(3)} m³/m²
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}