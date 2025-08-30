'use client';

import { useViewerStore } from '@/lib/store';
import { getAllMaterialNames } from '@/lib/data-loader';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function MaterialControls() {
  const { 
    geometryData, 
    materialPalette, 
    visibleMaterials, 
    toggleMaterialVisibility, 
    setAllMaterialsVisible 
  } = useViewerStore();

  if (!geometryData) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-900">Material Styles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">No materials to display</p>
        </CardContent>
      </Card>
    );
  }

  const materialNames = getAllMaterialNames(geometryData);
  
  if (materialNames.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-900">Material Styles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">No materials found</p>
        </CardContent>
      </Card>
    );
  }

  const allVisible = materialNames.every(name => visibleMaterials.has(name));
  const someVisible = materialNames.some(name => visibleMaterials.has(name));

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-900">Material Styles</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Toggle All Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={() => setAllMaterialsVisible(true)}
            variant="outline" 
            size="sm"
            className="flex-1 text-xs h-8 text-slate-700 hover:text-slate-900"
            disabled={allVisible}
          >
            Show All
          </Button>
          <Button 
            onClick={() => setAllMaterialsVisible(false)}
            variant="outline" 
            size="sm"
            className="flex-1 text-xs h-8 text-slate-700 hover:text-slate-900"
            disabled={!someVisible}
          >
            Hide All
          </Button>
        </div>

        {/* Individual Material Controls */}
        <div className="space-y-3">
          {materialNames.map((materialName) => {
            const isVisible = visibleMaterials.has(materialName);
            const materialStyle = materialPalette?.[materialName];
            
            return (
              <div key={materialName} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div className="flex items-center space-x-3">
                  {/* Color indicator */}
                  <div 
                    className="w-4 h-4 rounded border border-slate-300"
                    style={{ 
                      backgroundColor: materialStyle?.fill || '#6b7280' 
                    }}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-slate-900 capitalize">
                        {materialName.replace(/_/g, ' ')}
                      </span>
                      {materialStyle?.pattern && materialStyle.pattern !== 'solid' && (
                        <Badge variant="secondary" className="text-xs">
                          {materialStyle.pattern}
                        </Badge>
                      )}
                    </div>
                    {materialStyle?.description && (
                      <p className="text-xs text-slate-500 truncate">
                        {materialStyle.description}
                      </p>
                    )}
                  </div>
                </div>
                
                <Switch 
                  checked={isVisible}
                  onCheckedChange={() => toggleMaterialVisibility(materialName)}
                  className="ml-2"
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}