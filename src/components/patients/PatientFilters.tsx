import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X, SlidersHorizontal } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface PatientFilterOptions {
  status?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  assignedProvider?: string;
}

interface PatientFiltersProps {
  onFilterChange: (filters: PatientFilterOptions) => void;
  providers?: Array<{ id: string; name: string }>;
}

export const PatientFilters = ({ onFilterChange, providers = [] }: PatientFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filters, setFilters] = useState<PatientFilterOptions>({});
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  const updateFilter = (key: keyof PatientFilterOptions, value: any) => {
    const newFilters = { ...filters, [key]: value || undefined };
    setFilters(newFilters);
    
    // Count active filters
    const count = Object.values(newFilters).filter(v => v !== undefined && v !== '').length;
    setActiveFiltersCount(count);
    
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setFilters({});
    setActiveFiltersCount(0);
    onFilterChange({});
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <CollapsibleTrigger asChild>
            <Button variant="outline" className="gap-2">
              <SlidersHorizontal className="h-4 w-4" />
              Advanced Filters
              {activeFiltersCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
                  {activeFiltersCount}
                </span>
              )}
            </Button>
          </CollapsibleTrigger>
          
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-2">
              <X className="h-4 w-4" />
              Clear All
            </Button>
          )}
        </div>

        <CollapsibleContent>
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <Select 
                    value={filters.status || ''} 
                    onValueChange={(value) => updateFilter('status', value)}
                  >
                    <SelectTrigger id="status-filter">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                      <SelectItem value="discharged">Discharged</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender-filter">Gender</Label>
                  <Select 
                    value={filters.gender || ''} 
                    onValueChange={(value) => updateFilter('gender', value)}
                  >
                    <SelectTrigger id="gender-filter">
                      <SelectValue placeholder="All Genders" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Genders</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age-min">Min Age</Label>
                  <Input
                    id="age-min"
                    type="number"
                    placeholder="0"
                    min="0"
                    max="120"
                    value={filters.ageMin || ''}
                    onChange={(e) => updateFilter('ageMin', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age-max">Max Age</Label>
                  <Input
                    id="age-max"
                    type="number"
                    placeholder="120"
                    min="0"
                    max="120"
                    value={filters.ageMax || ''}
                    onChange={(e) => updateFilter('ageMax', e.target.value ? parseInt(e.target.value) : undefined)}
                  />
                </div>

                {providers.length > 0 && (
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="provider-filter">Assigned Provider</Label>
                    <Select 
                      value={filters.assignedProvider || ''} 
                      onValueChange={(value) => updateFilter('assignedProvider', value)}
                    >
                      <SelectTrigger id="provider-filter">
                        <SelectValue placeholder="All Providers" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Providers</SelectItem>
                        {providers.map((provider) => (
                          <SelectItem key={provider.id} value={provider.id}>
                            {provider.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
};
