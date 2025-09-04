'use client';

import { useEffect, useRef } from 'react';
import { useViewerStore } from '@/lib/store';
import { D3Viewer, DEFAULT_CONFIG, FIXED_SIZE_CONFIG } from '@/lib/d3-integration';
import { GeometryData, MaterialPalette } from '@/types/geometry';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface GeometryViewerProps {
  // For external data (corrugated system)
  geometryData?: GeometryData;
  materialPalette?: MaterialPalette;
  visibleMaterials?: Set<string>;
  
  // Configuration
  mode?: 'responsive' | 'fixed';
  showControls?: boolean;
  className?: string;
  title?: string;
}

export function GeometryViewer({ 
  geometryData: externalGeometryData,
  materialPalette: externalMaterialPalette,
  visibleMaterials: externalVisibleMaterials,
  mode = 'responsive',
  showControls = false,
  className = '',
  title
}: GeometryViewerProps = {}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<D3Viewer | null>(null);
  const storeData = useViewerStore();
  
  // Use external data if provided, otherwise use store data
  const geometryData = externalGeometryData || storeData.geometryData;
  const materialPalette = externalMaterialPalette || storeData.materialPalette;
  const visibleMaterials = externalVisibleMaterials || storeData.visibleMaterials;

  // Initialize D3 viewer
  useEffect(() => {
    if (!containerRef.current) return;

    const config = mode === 'fixed' ? FIXED_SIZE_CONFIG : DEFAULT_CONFIG;
    viewerRef.current = new D3Viewer(containerRef.current, config);
    viewerRef.current.initialize();

    // Cleanup on unmount
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [mode]);

  // Render data when geometry data or material palette changes
  useEffect(() => {
    if (!viewerRef.current || !geometryData) return;

    viewerRef.current.render(geometryData, materialPalette, visibleMaterials);
  }, [geometryData, materialPalette, visibleMaterials]);

  // Update materials when visibility changes (without repositioning)
  useEffect(() => {
    if (!viewerRef.current || !geometryData) return;

    viewerRef.current.updateMaterials(geometryData, materialPalette, visibleMaterials);
  }, [visibleMaterials, geometryData, materialPalette]);

  // Store viewer reference for external controls
  useEffect(() => {
    if (viewerRef.current) {
      // Make viewer available globally for controls
      window.floorComposerViewer = viewerRef.current;
    }
  }, []);

  const handleFitToBounds = () => {
    if (viewerRef.current) {
      viewerRef.current.fitToBounds();
    }
  };


  return (
    <div className={className}>
      {showControls && (
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-2">
          <div className="text-xs sm:text-sm text-slate-600">
            <span className="hidden sm:inline">Use mouse to pan and zoom. Scroll to zoom, drag to pan.</span>
            <span className="sm:hidden">Touch to pan and zoom.</span>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleFitToBounds}
              className="text-xs sm:text-sm"
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Fit to Bounds</span>
              <span className="sm:hidden">Fit</span>
            </Button>
          </div>
        </div>
      )}
      
      {title && (
        <div className="text-center mb-2">
          <h3 className="text-sm font-medium text-slate-700">{title}</h3>
        </div>
      )}
      
      <div className={mode === 'fixed' ? 'flex justify-center' : 'h-full w-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden'}>
        <div 
          ref={containerRef} 
          className={mode === 'fixed' ? 'w-auto h-auto' : 'w-full h-full'}
          style={mode === 'responsive' ? { minHeight: '300px' } : {}}
        />
      </div>
    </div>
  );
}