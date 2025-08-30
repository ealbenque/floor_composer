'use client';

import { useEffect, useRef } from 'react';
import { useViewerStore } from '@/lib/store';
import { D3Viewer } from '@/lib/d3-integration';

export function GeometryViewer() {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<D3Viewer | null>(null);
  const { geometryData, materialPalette, visibleMaterials } = useViewerStore();

  // Initialize D3 viewer
  useEffect(() => {
    if (!containerRef.current) return;

    viewerRef.current = new D3Viewer(containerRef.current);
    viewerRef.current.initialize();

    // Cleanup on unmount
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  // Render data when geometry data or material palette changes
  useEffect(() => {
    if (!viewerRef.current || !geometryData) return;

    viewerRef.current.render(geometryData, materialPalette, visibleMaterials);
  }, [geometryData, materialPalette]);

  // Update materials when visibility changes (without repositioning)
  useEffect(() => {
    if (!viewerRef.current || !geometryData) return;

    viewerRef.current.updateMaterials(geometryData, materialPalette, visibleMaterials);
  }, [visibleMaterials]);

  // Store viewer reference for external controls
  useEffect(() => {
    if (viewerRef.current) {
      // Make viewer available globally for controls
      window.floorComposerViewer = viewerRef.current;
    }
  }, []);

  return (
    <div className="h-full w-full bg-white rounded-lg border border-slate-200 shadow-sm">
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}