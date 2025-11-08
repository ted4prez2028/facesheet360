import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PatientAvatarUploadProps {
  patientId?: string;
  currentAvatarUrl?: string;
  patientName: string;
  onAvatarChange?: (url: string | null) => void;
}

export const PatientAvatarUpload = ({ 
  patientId, 
  currentAvatarUrl, 
  patientName,
  onAvatarChange 
}: PatientAvatarUploadProps) => {
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [uploading, setUploading] = useState(false);

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploading(true);

    try {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${patientId || Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { data, error: uploadError } = await supabase.storage
        .from('patient-avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('patient-avatars')
        .getPublicUrl(filePath);

      // Update patient record if patientId exists
      if (patientId) {
        const { error: updateError } = await supabase
          .from('patients')
          .update({ avatar_url: publicUrl })
          .eq('id', patientId);

        if (updateError) throw updateError;
      }

      setAvatarUrl(publicUrl);
      onAvatarChange?.(publicUrl);
      toast.success('Avatar uploaded successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!patientId || !avatarUrl) return;

    try {
      // Extract filename from URL
      const urlParts = avatarUrl.split('/');
      const filename = urlParts[urlParts.length - 1];

      // Delete from storage
      const { error: deleteError } = await supabase.storage
        .from('patient-avatars')
        .remove([filename]);

      if (deleteError) throw deleteError;

      // Update patient record
      const { error: updateError } = await supabase
        .from('patients')
        .update({ avatar_url: null })
        .eq('id', patientId);

      if (updateError) throw updateError;

      setAvatarUrl(undefined);
      onAvatarChange?.(null);
      toast.success('Avatar removed successfully');
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar');
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-20 w-20 border-2 border-primary/20">
        <AvatarImage src={avatarUrl} alt={patientName} />
        <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
          {getInitials(patientName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex gap-2">
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          id="avatar-upload"
          disabled={uploading}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => document.getElementById('avatar-upload')?.click()}
          disabled={uploading}
        >
          <Upload className="h-4 w-4 mr-2" />
          {uploading ? 'Uploading...' : 'Upload Photo'}
        </Button>

        {avatarUrl && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={uploading}
          >
            <X className="h-4 w-4 mr-2" />
            Remove
          </Button>
        )}
      </div>
    </div>
  );
};
