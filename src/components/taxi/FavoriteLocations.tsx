import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/hooks/useAuth';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Home, Briefcase, Building2, MapPin, Plus, Trash2, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FavoriteLocation {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  location_type: string;
}

interface FavoriteLocationsProps {
  onSelectLocation?: (location: FavoriteLocation) => void;
  compact?: boolean;
}

export const FavoriteLocations = ({ onSelectLocation, compact = false }: FavoriteLocationsProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [locationType, setLocationType] = useState('other');

  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ['favorite-locations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('favorite_locations')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as FavoriteLocation[];
    },
    enabled: !!user,
  });

  const addFavorite = useMutation({
    mutationFn: async (location: Omit<FavoriteLocation, 'id'>) => {
      if (!user) throw new Error('User not authenticated');

      // Geocode the address
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(location.address)}`
      );
      const results = await response.json();

      if (!results || results.length === 0) {
        throw new Error('Could not find location');
      }

      const { data, error } = await supabase
        .from('favorite_locations')
        .insert([{
          user_id: user.id,
          name: location.name,
          address: location.address,
          latitude: parseFloat(results[0].lat),
          longitude: parseFloat(results[0].lon),
          location_type: location.location_type,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-locations'] });
      toast.success('Location saved successfully');
      setIsDialogOpen(false);
      setName('');
      setAddress('');
      setLocationType('other');
    },
    onError: (error: Error) => {
      toast.error(`Failed to save location: ${error.message}`);
    },
  });

  const deleteFavorite = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('favorite_locations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-locations'] });
      toast.success('Location removed');
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove location: ${error.message}`);
    },
  });

  const getLocationIcon = (type: string) => {
    switch (type) {
      case 'home':
        return <Home className="h-4 w-4" />;
      case 'work':
        return <Briefcase className="h-4 w-4" />;
      case 'hospital':
        return <Building2 className="h-4 w-4" />;
      default:
        return <MapPin className="h-4 w-4" />;
    }
  };

  if (compact) {
    return (
      <div className="space-y-2">
        <Label className="flex items-center gap-2">
          <Star className="h-4 w-4" />
          Favorite Locations
        </Label>
        <div className="grid grid-cols-1 gap-2">
          {favorites.map((location) => (
            <Button
              key={location.id}
              variant="outline"
              className="justify-start"
              onClick={() => onSelectLocation?.(location)}
            >
              {getLocationIcon(location.location_type)}
              <span className="ml-2">{location.name}</span>
            </Button>
          ))}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="justify-start">
                <Plus className="h-4 w-4 mr-2" />
                Add New Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Favorite Location</DialogTitle>
                <DialogDescription>
                  Save frequently used addresses for quick selection
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Home, Office, General Hospital"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full address"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Location Type</Label>
                  <Select value={locationType} onValueChange={setLocationType}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => addFavorite.mutate({ name, address, latitude: 0, longitude: 0, location_type: locationType })}
                  disabled={!name || !address || addFavorite.isPending}
                  className="w-full"
                >
                  {addFavorite.isPending ? 'Saving...' : 'Save Location'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Favorite Locations
            </CardTitle>
            <CardDescription>
              Manage your frequently used addresses
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Favorite Location</DialogTitle>
                <DialogDescription>
                  Save frequently used addresses for quick selection
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Location Name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Home, Office, General Hospital"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter full address"
                  />
                </div>
                <div>
                  <Label htmlFor="type">Location Type</Label>
                  <Select value={locationType} onValueChange={setLocationType}>
                    <SelectTrigger id="type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="hospital">Hospital</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  onClick={() => addFavorite.mutate({ name, address, latitude: 0, longitude: 0, location_type: locationType })}
                  disabled={!name || !address || addFavorite.isPending}
                  className="w-full"
                >
                  {addFavorite.isPending ? 'Saving...' : 'Save Location'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : favorites.length === 0 ? (
          <p className="text-sm text-muted-foreground">No favorite locations saved yet</p>
        ) : (
          <div className="space-y-2">
            {favorites.map((location) => (
              <div
                key={location.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => onSelectLocation?.(location)}
              >
                <div className="flex items-start gap-3 flex-1">
                  <div className="mt-1">
                    {getLocationIcon(location.location_type)}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-muted-foreground">{location.address}</div>
                    <Badge variant="secondary" className="mt-1 capitalize">
                      {location.location_type}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFavorite.mutate(location.id);
                  }}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};