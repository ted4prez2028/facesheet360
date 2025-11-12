import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { MapPin } from 'lucide-react';

interface Location {
  display_name: string;
  lat: string;
  lon: string;
  place_id: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (lat: number, lon: number) => void;
  placeholder: string;
}

export const AddressAutocomplete = ({ 
  value, 
  onChange, 
  onLocationSelect,
  placeholder 
}: AddressAutocompleteProps) => {
  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchAddress = async () => {
      if (value.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoading(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`,
          {
            headers: {
              'Accept': 'application/json',
            }
          }
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(searchAddress, 300);
    return () => clearTimeout(debounce);
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
        />
      </PopoverTrigger>
      {suggestions.length > 0 && (
        <PopoverContent className="p-0 w-[400px]" align="start">
          <Command>
            <CommandList>
              {loading && <CommandEmpty>Searching...</CommandEmpty>}
              {!loading && suggestions.length === 0 && (
                <CommandEmpty>No locations found.</CommandEmpty>
              )}
              <CommandGroup>
                {suggestions.map((location) => (
                  <CommandItem
                    key={location.place_id}
                    onSelect={() => {
                      onChange(location.display_name);
                      onLocationSelect(parseFloat(location.lat), parseFloat(location.lon));
                      setOpen(false);
                    }}
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    {location.display_name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      )}
    </Popover>
  );
};
