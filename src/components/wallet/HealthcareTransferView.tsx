
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/context/AuthContext';
import { useTransactionForm } from '@/hooks/useTransactionForm';
import { searchProviders } from '@/lib/api/careCoinsApi';
import { Check, ChevronsUpDown, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useQuery } from '@tanstack/react-query';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const formSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  recipientName: z.string().min(1, "Recipient name is required"),
  amount: z.number().positive("Amount must be positive").int("Amount must be a whole number"),
  note: z.string().optional(),
});

export const HealthcareTransferView = () => {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useAuth();
  
  const { 
    formState: { recipient, recipientName, amount, isLoading },
    setters: { setRecipient, setRecipientName, setAmount },
    handlers: { handlePlatformTransfer }
  } = useTransactionForm();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      recipient: '',
      recipientName: '',
      amount: 0,
      note: '',
    },
  });

  // Mock providers data since database doesn't have role/specialty columns
  const mockProviders = [
    { id: '1', name: 'Dr. Smith', role: 'doctor', specialty: 'cardiology' },
    { id: '2', name: 'Nurse Johnson', role: 'nurse', specialty: 'emergency' },
    { id: '3', name: 'Dr. Wilson', role: 'doctor', specialty: 'pediatrics' }
  ];

  const { data: providers = [], isLoading: isSearching } = useQuery({
    queryKey: ['searchProviders', searchTerm],
    queryFn: async () => {
      // Return mock data filtered by search term
      return mockProviders.filter(provider => 
        provider.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.specialty.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    enabled: searchTerm.length > 1,
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setRecipient(values.recipient);
    setRecipientName(values.recipientName);
    setAmount(values.amount);
    
    const result = await handlePlatformTransfer({
      preventDefault: () => {},
    } as React.FormEvent);
    
    if (result) {
      form.reset();
    }
  };

  const handleProviderSelect = (providerId: string, providerName: string) => {
    form.setValue('recipient', providerId);
    form.setValue('recipientName', providerName);
    setRecipient(providerId);
    setRecipientName(providerName);
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Transfer to Healthcare Provider</CardTitle>
        <CardDescription>
          Send CareCoins to other healthcare professionals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Healthcare Provider</FormLabel>
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={open}
                          className={cn(
                            "w-full justify-between",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value
                            ? form.getValues("recipientName")
                            : "Search and select a provider"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput 
                          placeholder="Search providers..." 
                          onValueChange={(value) => {
                            setSearchTerm(value);
                          }}
                        />
                        {isSearching ? (
                          <div className="py-6 text-center text-sm">Searching...</div>
                        ) : (
                          <>
                            <CommandEmpty>No healthcare provider found.</CommandEmpty>
                            <CommandGroup>
                              {providers.map((provider) => (
                                <CommandItem
                                  key={provider.id}
                                  value={provider.id}
                                  onSelect={() => handleProviderSelect(provider.id, provider.name)}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      provider.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span>{provider.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                      {provider.role} {provider.specialty ? `- ${provider.specialty}` : ''}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      {...field}
                      onChange={(e) => {
                        const value = parseInt(e.target.value);
                        field.onChange(isNaN(value) ? 0 : value);
                      }}
                      min={1}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="note"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Note (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Add a note about this transfer" {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Processing..." : "Send CareCoins"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};
