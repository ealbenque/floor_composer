'use client';

import { useViewerStore } from '@/lib/store';
import { EXAMPLES, getExampleByValue } from '@/lib/data-loader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function ExampleSelector() {
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
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-slate-900">Example</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={selectedExample} onValueChange={handleExampleChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select an example">
              <span className="truncate">{currentExample?.label}</span>
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {EXAMPLES.map((example) => (
              <SelectItem key={example.value} value={example.value}>
                {example.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}