
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
      
      // Map database fields to User type fields
      return {
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role,
        specialty: data.specialty,
        licenseNumber: data.license_number,
        profileImage: data.profile_image,
        careCoinsBalance: data.care_coins_balance || 0,
        online_status: data.online_status,
        organization: data.organization,
        created_at: data.created_at,
        updated_at: data.updated_at
      } as User;
    },
    enabled: !!userId,
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, updates }: { id: string, updates: Partial<User> }) => {
      // Convert from User type field names to database field names
      const dbData: any = {};
      if (updates.name) dbData.name = updates.name;
      if (updates.email) dbData.email = updates.email;
      if (updates.specialty) dbData.specialty = updates.specialty;
      if (updates.licenseNumber) dbData.license_number = updates.licenseNumber;
      if (updates.profileImage) dbData.profile_image = updates.profileImage;
      if (updates.careCoinsBalance !== undefined) dbData.care_coins_balance = updates.careCoinsBalance;
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
