'use client';

import { Header } from '@/components/Header';
import { CorrugatedSystemViewer } from '@/components/viewer/CorrugatedSystemViewer';

export default function CorrugatedSystemPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Corrugated System Designer</h1>
            <p className="text-slate-600 mt-2">
              Interactive steel deck profile configuration with real-time geometry generation and performance data
            </p>
          </div>
          
          <CorrugatedSystemViewer />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 px-6 py-3">
        <p className="text-sm text-slate-600 text-center">
          Corrugated System Designer - Real-time generation using ArcelorMittal database
        </p>
      </footer>
    </div>
  );
}