'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-slate-900 text-white px-4 lg:px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between gap-2 sm:gap-4">
        <div className="flex items-center min-w-0 flex-shrink">
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold tracking-tight">Floor Composer</h1>
            <p className="text-slate-300 text-xs sm:text-sm hidden sm:block">Interactive 2D Geometry Viewer</p>
          </div>
        </div>
        
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm"
              className={`whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 ${pathname === '/' 
                ? "text-white bg-slate-700 hover:bg-slate-600 hover:text-white" 
                : "text-white hover:text-slate-200"
              }`}
            >
              <span className="hidden sm:inline">Examples</span>
              <span className="sm:hidden">Ex</span>
            </Button>
          </Link>
          <Link href="/corrugated">
            <Button 
              variant="ghost" 
              size="sm"
              className={`whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 ${pathname === '/corrugated' 
                ? "text-white bg-slate-700 hover:bg-slate-600 hover:text-white" 
                : "text-white hover:text-slate-200"
              }`}
            >
              <span className="hidden sm:inline">Corrugated System</span>
              <span className="sm:hidden">Corrugated</span>
            </Button>
          </Link>
          <Link href="/clt">
            <Button 
              variant="ghost" 
              size="sm"
              className={`whitespace-nowrap text-xs sm:text-sm px-2 sm:px-3 ${pathname === '/clt' 
                ? "text-white bg-slate-700 hover:bg-slate-600 hover:text-white" 
                : "text-white hover:text-slate-200"
              }`}
            >
              CLT
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}