'use client';

import { Header } from '@/components/Header';
import { StructuralConfigurator } from '@/components/viewer/StructuralConfigurator';

export default function StructuralPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Header />
      
      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-slate-900">Structural Configuration</h1>
            <p className="text-slate-600 mt-2">
              Configure building parameters and load calculations for structural analysis
            </p>
          </div>
          
          <StructuralConfigurator />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 px-6 py-3">
        <p className="text-sm text-slate-600 text-center">
          Structural Configuration - Building parameters and load calculations
        </p>
      </footer>
    </div>
  );
}