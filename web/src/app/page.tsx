'use client';

import { useEffect } from 'react';
import { Header } from '@/components/Header';
import { GeometryViewer } from '@/components/viewer/GeometryViewer';
import { ExampleSelector } from '@/components/viewer/ExampleSelector';
import { MaterialControls } from '@/components/viewer/MaterialControls';
import { ViewControls } from '@/components/viewer/ViewControls';
import { InfoPanel } from '@/components/viewer/InfoPanel';
import { useViewerStore } from '@/lib/store';
import { getExampleByValue } from '@/lib/data-loader';

export default function Home() {
  const { selectedExample, loadExample, loadMaterials, loading, error } = useViewerStore();

  // Initialize the application
  useEffect(() => {
    const initialize = async () => {
      // Load material palette
      await loadMaterials();
      
      // Load default example
      const defaultExample = getExampleByValue(selectedExample);
      if (defaultExample) {
        await loadExample(defaultExample.file);
      }
    };

    initialize();
  }, [loadExample, loadMaterials, selectedExample]);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Controls Panel */}
        <div className="w-80 lg:w-96 bg-white border-r border-slate-200 flex flex-col max-lg:hidden">
          <div className="p-4 lg:p-6 space-y-4 lg:space-y-6 overflow-y-auto">
            <ExampleSelector />
            <ViewControls />
            <MaterialControls />
            <InfoPanel />
          </div>
        </div>

        {/* Mobile Controls - Only visible on small screens */}
        <div className="lg:hidden absolute top-20 left-4 right-4 z-10 bg-white rounded-lg shadow-lg border border-slate-200 max-h-96 overflow-y-auto">
          <div className="p-4 space-y-4">
            <ExampleSelector />
            <ViewControls />
            <MaterialControls />
            <InfoPanel />
          </div>
        </div>

        {/* Main Viewer */}
        <div className="flex-1 flex flex-col">
          {loading && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mx-auto"></div>
                <p className="text-slate-600">Loading geometry...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4 max-w-md">
                <div className="text-red-500 text-4xl">⚠️</div>
                <h3 className="text-lg font-semibold text-slate-900">Error Loading Data</h3>
                <p className="text-slate-600">{error}</p>
              </div>
            </div>
          )}
          
          {!loading && !error && (
            <div className="flex-1 p-6">
              <GeometryViewer />
            </div>
          )}
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 px-6 py-3">
        <p className="text-sm text-slate-600 text-center">
          Generated with Floor Composer - Python backend, React + D3.js frontend
        </p>
      </footer>
    </div>
  );
}
