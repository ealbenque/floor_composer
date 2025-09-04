'use client';

import { RotateCcw, Maximize2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useViewerStore } from '@/lib/store';

export function ViewControls() {
  const { geometryData } = useViewerStore();

  const handleResetView = () => {
    const viewer = window.floorComposerViewer;
    if (viewer?.resetView) {
      viewer.resetView();
    }
  };

  const handleFitToBounds = () => {
    const viewer = window.floorComposerViewer;
    if (viewer?.fitToBounds && geometryData) {
      viewer.fitToBounds();
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-900">View Controls</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button 
          onClick={handleResetView}
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-slate-700 hover:text-slate-900 hover:bg-slate-100"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset View
        </Button>
        <Button 
          onClick={handleFitToBounds}
          variant="outline" 
          size="sm" 
          className="w-full justify-start text-slate-700 hover:text-slate-900 hover:bg-slate-100"
        >
          <Maximize2 className="w-4 h-4 mr-2" />
          Fit to Bounds
        </Button>
      </CardContent>
    </Card>
  );
}