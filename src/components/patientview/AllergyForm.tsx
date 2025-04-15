
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllergies } from '@/hooks/useAllergies';

interface AllergyFormProps {
  patientId: string;
  allergy?: {
    id: string;
    allergen: string;
    reaction: string;
    severity: string;
    dateIdentified: string;
    status: string;
  } | null;
  onSuccess: () => void;
}

const AllergyForm: React.FC<AllergyFormProps> = ({ patientId, allergy, onSuccess }) => {
  const { addAllergy, updateAllergy } = useAllergies(patientId);
  const form = useForm({
    defaultValues: allergy || {
      allergen: '',
      reaction: '',
      severity: 'mild',
      dateIdentified: new Date().toISOString().split('T')[0],
      status: 'active'
    }
  });

  const onSubmit = async (data: any) => {
    try {
      if (allergy) {
        await updateAllergy(allergy.id, { ...data, patientId });
      } else {
        await addAllergy({ ...data, patientId });
      }
      onSuccess();
    } catch (error) {
      console.error('Error saving allergy:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="allergen"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Allergen</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reaction"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reaction</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="severity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Severity</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="dateIdentified"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date Identified</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2">
          <Button type="submit">{allergy ? 'Update' : 'Add'} Allergy</Button>
        </div>
      </form>
    </Form>
  );
};

export default AllergyForm;
