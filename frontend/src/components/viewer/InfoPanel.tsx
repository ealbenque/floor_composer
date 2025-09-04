'use client';

import { useViewerStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export function InfoPanel() {
  const { geometryData } = useViewerStore();

  if (!geometryData) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-slate-900">Geometry Info</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-500">Hover over geometries for details</p>
        </CardContent>
      </Card>
    );
  }

  const { bounds, total_length, curves } = geometryData;
  const materialCount = new Set(curves.map(curve => curve.material?.name).filter(Boolean)).size;
  const curveCount = curves.length;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-900">Geometry Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-slate-900">{curveCount}</div>
            <div className="text-xs text-slate-600">Curves</div>
          </div>
          <div className="text-center p-2 bg-slate-50 rounded-lg">
            <div className="text-lg font-bold text-slate-900">{materialCount}</div>
            <div className="text-xs text-slate-600">Materials</div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="space-y-3">
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Total Length
            </label>
            <div className="text-sm font-mono text-slate-900 bg-slate-50 rounded px-2 py-1 mt-1">
              {total_length.toFixed(3)} units
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Bounds
            </label>
            <div className="text-sm font-mono text-slate-900 bg-slate-50 rounded px-2 py-1 mt-1 space-y-1">
              <div>X: {bounds.min_x.toFixed(2)} → {bounds.max_x.toFixed(2)}</div>
              <div>Y: {bounds.min_y.toFixed(2)} → {bounds.max_y.toFixed(2)}</div>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Dimensions
            </label>
            <div className="text-sm font-mono text-slate-900 bg-slate-50 rounded px-2 py-1 mt-1">
              {(bounds.max_x - bounds.min_x).toFixed(2)} × {(bounds.max_y - bounds.min_y).toFixed(2)}
            </div>
          </div>

          {/* Curve Types */}
          <div>
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wide">
              Curve Types
            </label>
            <div className="flex flex-wrap gap-1 mt-1">
              {Array.from(new Set(curves.map(curve => curve.curve_type))).map(type => (
                <Badge key={type} variant="secondary" className="text-xs capitalize">
                  {type}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Interactive Help */}
        <div className="pt-2 border-t border-slate-200">
          <p className="text-xs text-slate-500 leading-relaxed">
            💡 Use mouse wheel to zoom, drag to pan. Hover over curves to see details.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}