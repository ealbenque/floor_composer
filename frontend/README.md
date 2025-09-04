# Floor Composer - React Frontend

Modern React frontend for Floor Composer geometry visualization with Shadcn UI components and gray theme.

## Features

- **Modern Stack**: Next.js 14, TypeScript, Tailwind CSS, Shadcn UI
- **Gray Theme**: Professional, technical design with neutral colors  
- **Interactive Visualization**: D3.js integration for smooth geometry rendering
- **Material Management**: Toggle visibility with color-coded switches
- **Responsive Design**: Works on desktop and mobile devices
- **Example Dropdown**: Switch between different geometry examples
- **Real-time Controls**: Zoom, pan, reset view, fit to bounds

## Quick Start

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### Production Build
```bash
npm run build
npm start
```

## Architecture

### Component Structure
```
src/
├── app/
│   ├── layout.tsx          # Root layout with gray theme
│   └── page.tsx            # Main application page
├── components/
│   ├── Header.tsx          # App header with example selector
│   ├── ui/                 # Shadcn UI components
│   └── viewer/
│       ├── GeometryViewer.tsx    # Main D3.js visualization
│       ├── MaterialControls.tsx  # Material toggles panel  
│       ├── ViewControls.tsx      # Zoom/pan controls
│       └── InfoPanel.tsx         # Geometry information
├── lib/
│   ├── d3-integration.ts   # D3.js wrapper for React
│   ├── data-loader.ts      # JSON data loading utilities
│   ├── store.ts            # Zustand state management
│   └── utils.ts            # Shadcn utilities
└── types/
    ├── geometry.ts         # TypeScript interfaces
    └── global.d.ts         # Global type declarations
```

### State Management
Uses Zustand for lightweight, TypeScript-first state management:
- **Geometry Data**: Currently loaded curves and bounds
- **Material Palette**: Color and pattern definitions
- **Visibility State**: Which materials are shown/hidden
- **Loading/Error States**: UI feedback

### D3.js Integration
- Wrapped in React hooks for proper lifecycle management
- Supports zoom, pan, fit-to-bounds, and reset view
- SVG rendering with material-aware styling
- Grid background and hover interactions

## Data Format

The application loads JSON files from `public/data/`:
- **curves.json**: Default floor section
- **floor_profile.json**: Multi-layer floor
- **building_section.json**: Complete building section
- **corrugated_system.json**: Corrugated sheet system
- **materials.json**: Material color/pattern definitions

## Design System

### Gray Theme Colors
- **Backgrounds**: `bg-slate-50` (app), `bg-white` (panels), `bg-slate-900` (header)
- **Text**: `text-slate-900` (primary), `text-slate-600` (secondary), `text-slate-500` (muted)
- **Borders**: `border-slate-200`, `border-slate-300`
- **Interactive**: `hover:bg-slate-100`, `focus:ring-slate-500`

### Typography
- **Font**: Inter (system font stack fallback)
- **Scale**: Tailwind default scale with technical monospace for data

### Components
All UI components use Shadcn UI with consistent gray theme:
- `Button`: Outline style with gray hover states
- `Select`: Dark variant for header, light for panels
- `Switch`: Material visibility toggles
- `Card`: Clean panels with subtle shadows
- `Badge`: Material type indicators

## Development

### Adding New Examples
1. Add JSON file to `public/data/`
2. Add entry to `EXAMPLES` array in `src/lib/data-loader.ts`
3. Example will appear in header dropdown

### Customizing Materials
1. Update material definitions in `public/data/materials.json`
2. Add new pattern definitions in `src/lib/d3-integration.ts`
3. Extend pattern types in `src/types/geometry.ts`

### Responsive Behavior
- **Desktop**: Sidebar panel always visible
- **Mobile**: Collapsible overlay panel (can be enhanced with toggle)
- **Header**: Responsive text and dropdown sizing

## Migration from Vanilla JS

This React frontend replaces the original vanilla JS implementation with:
- ✅ **Better State Management**: Zustand vs global variables
- ✅ **Type Safety**: Full TypeScript coverage
- ✅ **Modern UI**: Shadcn components vs custom CSS
- ✅ **Responsive Design**: Mobile-friendly layout
- ✅ **Developer Experience**: Hot reload, linting, builds
- ✅ **Maintainability**: Component-based architecture

## Legacy Support

The original Python development server (`legacy_serve.py`) is kept for reference but not needed. Next.js handles all development and production serving.
