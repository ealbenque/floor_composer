// Global type declarations

import { D3Viewer } from '@/lib/d3-integration';

declare global {
  interface Window {
    floorComposerViewer?: D3Viewer;
  }
}

export {};