import React, { useState, useEffect } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';

interface PatientAutocompleteProps {
  value?: string;
  onSelect: (patientId: string) => void;
  placeholder?: string;
  className?: string;
}

export const PatientAutocomplete: React.FC<PatientAutocompleteProps> = ({
  value,
  onSelect,
  placeholder = "Select patient...",
  className
}) => {
  const [open, setOpen] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  useEffect(() => {
    if (value) {
      fetchSelectedPatient(value);
    }
  }, [value]);

  useEffect(() => {
    fetchPatients(searchTerm);
  }, [searchTerm]);

  const fetchSelectedPatient = async (patientId: string) => {
    const { data } = await supabase
      .from('patients')
      .select('*')
      .eq('id', patientId)
      .single();
    
    if (data) {
      setSelectedPatient(data as any as Patient);
    }
  };

  const fetchPatients = async (search: string) => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('patients')
        .select('*')
        .order('name');

      if (search) {
        query = query.or(`name.ilike.%${search}%,medical_record_number.ilike.%${search}%`);
      }

      query = query.limit(50);

      const { data, error } = await query;

      if (!error && data) {
        setPatients(data as any as Patient[]);
      }
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    onSelect(patient.id);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          {selectedPatient
            ? `${selectedPatient.name} - ${selectedPatient.medical_record_number}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by name or MRN..."
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandEmpty>
            {isLoading ? "Loading..." : "No patient found."}
          </CommandEmpty>
          <CommandList>
            <CommandGroup>
              {patients.map((patient) => (
                <CommandItem
                  key={patient.id}
                  value={patient.id}
                  onSelect={() => handleSelect(patient)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedPatient?.id === patient.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{patient.name}</span>
                    <span className="text-xs text-muted-foreground">
                      MRN: {patient.medical_record_number} | DOB: {patient.date_of_birth}
                    </span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};