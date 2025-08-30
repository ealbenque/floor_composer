'use client';

import { useViewerStore } from '@/lib/store';
import { EXAMPLES, getExampleByValue } from '@/lib/data-loader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function Header() {
  const { selectedExample, setSelectedExample, loadExample } = useViewerStore();
  
  const handleExampleChange = async (value: string) => {
    setSelectedExample(value);
    const example = getExampleByValue(value);
    if (example) {
      await loadExample(example.file);
    }
  };

  const currentExample = getExampleByValue(selectedExample);

  return (
    <header className="bg-slate-900 text-white px-4 lg:px-6 py-4 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center space-x-4 min-w-0">
          <div className="min-w-0">
            <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Floor Composer</h1>
            <p className="text-slate-300 text-sm hidden sm:block">Interactive 2D Geometry Viewer</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 lg:space-x-3 flex-shrink-0">
          <label htmlFor="example-select" className="text-sm font-medium text-slate-300 hidden sm:block">
            Example:
          </label>
          <Select value={selectedExample} onValueChange={handleExampleChange}>
            <SelectTrigger 
              id="example-select"
              className="w-40 sm:w-48 lg:w-64 bg-slate-800 border-slate-700 text-white hover:bg-slate-700 focus:ring-slate-500"
            >
              <SelectValue placeholder="Select an example">
                <span className="truncate">{currentExample?.label}</span>
              </SelectValue>
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {EXAMPLES.map((example) => (
                <SelectItem 
                  key={example.value} 
                  value={example.value}
                  className="text-white hover:bg-slate-700 focus:bg-slate-700"
                >
                  {example.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </header>
  );
}