'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';

export function Header() {
  const pathname = usePathname();

  return (
    <header className="bg-slate-900 text-white px-4 lg:px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Floor Composer</h1>
            <p className="text-slate-300 text-sm hidden sm:block">Interactive 2D Geometry Viewer</p>
          </div>
        </div>
        
        <nav className="flex items-center space-x-2">
          <Link href="/">
            <Button 
              variant="ghost" 
              size="sm"
              className={pathname === '/' 
                ? "text-white bg-slate-700 hover:bg-slate-600 hover:text-white" 
                : "text-white hover:text-slate-200"
              }
            >
              Examples
            </Button>
          </Link>
          <Link href="/corrugated">
            <Button 
              variant="ghost" 
              size="sm"
              className={pathname === '/corrugated' 
                ? "text-white bg-slate-700 hover:bg-slate-600 hover:text-white" 
                : "text-white hover:text-slate-200"
              }
            >
              Corrugated System
            </Button>
          </Link>
          <Link href="/clt">
            <Button 
              variant="ghost" 
              size="sm"
              className={pathname === '/clt' 
                ? "text-white bg-slate-700 hover:bg-slate-600 hover:text-white" 
                : "text-white hover:text-slate-200"
              }
            >
              CLT Database
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}