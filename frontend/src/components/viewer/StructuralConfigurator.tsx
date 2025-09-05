'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Settings } from 'lucide-react';

interface FormData {
  buildingCode: string;
  country: string;
  span: string;
  width: string;
  staticSystem: string;
  categoryOfUse: string;
  subCategoryOfUse: string;
  liveLoad: string;
  permanentLoad: string;
  fireResistance: string;
}

const CATEGORY_OPTIONS = [
  { value: 'undefined', label: 'Undefined' },
  { value: 'A', label: 'Category A: Residential, domestic' },
  { value: 'B', label: 'Category B: Offices' },
  { value: 'C', label: 'Category C: Areas where people may gather (e.g. schools, theatres)' },
  { value: 'D', label: 'Category D: Shopping areas' },
];

const SUBCATEGORY_OPTIONS = {
  C: [
    { value: 'C1', label: 'C1: Espaces équipés de tables etc., par exemple : écoles, cafés, restaurants, salles de banquet, salles de lecture, salles de réception' },
    { value: 'C2', label: 'C2: Espaces équipés de sièges fixes, par exemple : églises, théâtres ou cinémas, salles de conférence, amphithéâtres, salles de réunion, salles d\'attente' },
    { value: 'C3', label: 'C3: Espaces ne présentant pas d\'obstacles à la circulation des personnes, par exemple : salles de musée, salles d\'exposition etc. et accès des bâtiments publics et administratifs, hôtels, hôpitaux, gares' },
    { value: 'C4', label: 'C4: Espaces permettant des activités physiques, par exemple : dancings, salles de gymnastique, scènes' },
    { value: 'C5', label: 'C5: Espaces susceptibles d\'accueillir des foules importantes, par exemple : bâtiments destinés à des événements publics tels que salles de concert, salles de sport y compris tribunes, terrasses et aires d\'accès, quais de gare' },
  ],
  D: [
    { value: 'D1', label: 'D1: Commerces de détail courants' },
    { value: 'D2', label: 'D2: Grands magasins' },
  ],
};

// Live load values based on category (kN/m²) - France
const LIVE_LOAD_VALUES: Record<string, string> = {
  'A': '1.5',
  'B': '2.5',
  'C1': '2.5',
  'C2': '4.0',
  'C3': '4.0',
  'C4': '5.0',
  'C5': '5.0',
  'D1': '5.0',
  'D2': '5.0',
};

export function StructuralConfigurator() {
  const [formData, setFormData] = useState<FormData>({
    buildingCode: 'Eurocodes',
    country: 'France',
    span: '5.0',
    width: '1.0',
    staticSystem: 'single span',
    categoryOfUse: 'undefined',
    subCategoryOfUse: 'undefined',
    liveLoad: '',
    permanentLoad: '0.0',
    fireResistance: 'undefined',
  });

  const [isLiveLoadOverridden, setIsLiveLoadOverridden] = useState(false);

  // Auto-fill live load based on category selection
  useEffect(() => {
    if (!isLiveLoadOverridden) {
      let loadValue = '';
      
      // Priority: subcategory first, then category
      if (formData.subCategoryOfUse && formData.subCategoryOfUse !== 'undefined') {
        loadValue = LIVE_LOAD_VALUES[formData.subCategoryOfUse] || '';
      } else if (formData.categoryOfUse && formData.categoryOfUse !== 'undefined') {
        loadValue = LIVE_LOAD_VALUES[formData.categoryOfUse] || '';
      }
      
      // Only update if there's a value to set
      if (loadValue) {
        setFormData(prev => ({ ...prev, liveLoad: loadValue }));
      }
    }
  }, [formData.categoryOfUse, formData.subCategoryOfUse, isLiveLoadOverridden]);

  const handleFormChange = (field: keyof FormData, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Reset subcategory when category changes
      if (field === 'categoryOfUse') {
        updated.subCategoryOfUse = 'undefined';
        // Reset live load override when category changes to allow auto-fill
        setIsLiveLoadOverridden(false);
      }
      
      // Reset live load override when subcategory changes to allow auto-fill  
      if (field === 'subCategoryOfUse') {
        setIsLiveLoadOverridden(false);
      }
      
      return updated;
    });
  };

  const handleLiveLoadChange = (value: string) => {
    // Only mark as overridden if user is actually typing something different
    if (value !== formData.liveLoad) {
      setIsLiveLoadOverridden(true);
    }
    setFormData(prev => ({ ...prev, liveLoad: value }));
  };

  const resetLiveLoadOverride = () => {
    setIsLiveLoadOverridden(false);
  };

  const handleSubmit = () => {
    console.log('Form submitted:', formData);
  };

  const showSubCategory = formData.categoryOfUse === 'C' || formData.categoryOfUse === 'D';
  const subCategoryOptions = SUBCATEGORY_OPTIONS[formData.categoryOfUse as 'C' | 'D'] || [];

  return (
    <div className="space-y-6">
      {/* Header with Settings */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Configuration</h2>
          <p className="text-sm text-slate-600 mt-1">
            Configure structural parameters for analysis
          </p>
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64">
            <DropdownMenuLabel>Context Settings</DropdownMenuLabel>
            <DropdownMenuSeparator />
            
            <div className="p-2 space-y-3">
              <div className="space-y-1">
                <Label htmlFor="building-code" className="text-xs font-medium">Building Code</Label>
                <Select value={formData.buildingCode} onValueChange={(value) => handleFormChange('buildingCode', value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select building code" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Eurocodes">Eurocodes</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label htmlFor="country" className="text-xs font-medium">Country</Label>
                <Select value={formData.country} onValueChange={(value) => handleFormChange('country', value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Select country" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="France">France</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Geometry and Static System Section */}
      <Card>
        <CardHeader>
          <CardTitle>Geometry and Static System</CardTitle>
          <CardDescription>
            Structural geometry parameters and system configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="span">Span (m)</Label>
              <Input
                id="span"
                type="number"
                step="0.1"
                value={formData.span}
                onChange={(e) => handleFormChange('span', e.target.value)}
                placeholder="5.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="width">Width (m)</Label>
              <Input
                id="width"
                type="number"
                step="0.1"
                value={formData.width}
                onChange={(e) => handleFormChange('width', e.target.value)}
                placeholder="1.0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="static-system">Static System</Label>
              <Select value={formData.staticSystem} onValueChange={(value) => handleFormChange('staticSystem', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select static system" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single span">Single Span</SelectItem>
                  <SelectItem value="continuous">Continuous</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loads Section */}
      <Card>
        <CardHeader>
          <CardTitle>Loads</CardTitle>
          <CardDescription>
            Load definitions and calculations based on usage categories
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Label htmlFor="category-of-use" className="cursor-help">
                    Category of Use
                  </Label>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Used to define the load category</p>
                </TooltipContent>
              </Tooltip>
              <Select value={formData.categoryOfUse} onValueChange={(value) => handleFormChange('categoryOfUse', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Label htmlFor="live-load" className="cursor-help">
                      Live Load (kN/m²)
                    </Label>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Value based on the selected category of use according to the French national annex to Eurocode 1 - Tableau 6.2</p>
                  </TooltipContent>
                </Tooltip>
                {isLiveLoadOverridden && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={resetLiveLoadOverride}
                    className="text-xs px-2 py-1 h-6"
                  >
                    Reset Auto-fill
                  </Button>
                )}
              </div>
              <Input
                id="live-load"
                type="number"
                step="0.1"
                value={formData.liveLoad}
                onChange={(e) => handleLiveLoadChange(e.target.value)}
                placeholder="Auto-filled based on category"
                className={!isLiveLoadOverridden && formData.liveLoad ? 'bg-blue-50 border-blue-200' : ''}
              />
              <p className="text-xs text-slate-500">
                {!isLiveLoadOverridden && formData.liveLoad 
                  ? 'Auto-filled based on category selection'
                  : 'Enter custom value or select category for auto-fill'
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="permanent-load">Permanent Load of Non Structural Elements (kN/m²)</Label>
              <Input
                id="permanent-load"
                type="number"
                step="0.1"
                value={formData.permanentLoad}
                onChange={(e) => handleFormChange('permanentLoad', e.target.value)}
                placeholder="0.0"
              />
            </div>
          </div>

          {showSubCategory && (
            <div className="space-y-2">
              <Label htmlFor="sub-category-of-use">Sub Category of Use</Label>
              <Select value={formData.subCategoryOfUse} onValueChange={(value) => handleFormChange('subCategoryOfUse', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sub-category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="undefined">Undefined</SelectItem>
                  {subCategoryOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="fire-resistance">Fire Resistance</Label>
            <Select value={formData.fireResistance} onValueChange={(value) => handleFormChange('fireResistance', value)}>
              <SelectTrigger className="w-full md:w-64">
                <SelectValue placeholder="Select fire resistance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="undefined">Undefined</SelectItem>
                <SelectItem value="R30">R30</SelectItem>
                <SelectItem value="R60">R60</SelectItem>
                <SelectItem value="R90">R90</SelectItem>
                <SelectItem value="R120">R120</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button onClick={handleSubmit} className="px-8">
          Calculate
        </Button>
      </div>
    </div>
  );
}