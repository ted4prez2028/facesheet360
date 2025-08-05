
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types';

export const useUserProfile = (userId: string) => {
  return useQuery({
    queryKey: ['userProfile', userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as User;
    },
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<User> }) => {
      // Convert user updates to database field names
      const dbData: Partial<User> = {};
      if (updates.name) dbData.name = updates.name;
      if (updates.email) dbData.email = updates.email;
      if (updates.specialty) dbData.specialty = updates.specialty;
      if (updates.specialty) dbData.specialty = updates.specialty;
      if (updates.profile_image) dbData.profile_image = updates.profile_image;
      if (updates.care_coins_balance !== undefined) dbData.care_coins_balance = updates.care_coins_balance;
      if (updates.role) dbData.role = updates.role;
      if (updates.organization) dbData.organization = updates.organization;
      
      const { data, error } = await supabase
        .from('users')
        .update(dbData)
        .eq('id', id)
        .select();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', variables.id] });
    }
  });
};
