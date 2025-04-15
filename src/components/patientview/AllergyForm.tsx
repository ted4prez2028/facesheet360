
import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormLabel, FormControl } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAllergies, Allergy } from '@/hooks/useAllergies';

interface AllergyFormProps {
  patientId: string;
  allergy?: Allergy | null;
  onSuccess: () => void;
}

const AllergyForm: React.FC<AllergyFormProps> = ({ patientId, allergy, onSuccess }) => {
  const { addAllergy, updateAllergy } = useAllergies(patientId);
  const form = useForm<Allergy>({
    defaultValues: allergy || {
      id: '',
      patient_id: patientId,
      allergen: '',
      reaction: '',
      severity: 'mild',
      date_identified: new Date().toISOString().split('T')[0],
      status: 'active',
      created_at: '',
      updated_at: ''
    }
  });

  const onSubmit = async (data: Allergy) => {
    try {
      if (allergy) {
        await updateAllergy(allergy.id, data);
      } else {
        const { id, created_at, updated_at, ...newAllergyData } = data;
        await addAllergy(newAllergyData);
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
          name="date_identified"
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
