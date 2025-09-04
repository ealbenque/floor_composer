'use client'

import { Header } from '@/components/Header'
import { CLTConfigurator } from '@/components/viewer/CLTConfigurator'

export default function CLTDatabasePage() {
  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <Header />
      
      <div className="flex-1 overflow-auto">
        <div className="container mx-auto p-6 max-w-7xl">
          <CLTConfigurator />
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 px-6 py-3">
        <p className="text-sm text-slate-600 text-center">
          CLT Database Configurator - Cross-Laminated Timber Product Selection
        </p>
      </footer>
    </div>
  )
}