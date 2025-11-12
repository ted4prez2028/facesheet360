import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Star } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

interface DriverRatingsProps {
  driverId: string;
}

export const DriverRatings = ({ driverId }: DriverRatingsProps) => {
  const { data: ratings = [], isLoading } = useQuery({
    queryKey: ['driver-ratings', driverId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('driver_ratings')
        .select('*')
        .eq('driver_id', driverId)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      
      // Fetch passenger names separately
      const ratingsWithNames = await Promise.all(
        (data || []).map(async (rating) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('name')
            .eq('id', rating.passenger_id)
            .single();
          
          return {
            ...rating,
            passenger_name: profile?.name || 'Anonymous'
          };
        })
      );
      
      return ratingsWithNames;
    }
  });

  if (isLoading) {
    return <div>Loading ratings...</div>;
  }

  if (ratings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Ratings & Reviews</CardTitle>
          <CardDescription>No ratings yet</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const averageRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ratings & Reviews</CardTitle>
        <CardDescription>
          <div className="flex items-center gap-2 mt-2">
            <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            <span className="text-2xl font-bold">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({ratings.length} ratings)</span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.id} className="border-b pb-4 last:border-b-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 ${
                        star <= rating.rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm font-medium">
                  {rating.passenger_name}
                </span>
              </div>
              <span className="text-sm text-muted-foreground">
                {format(new Date(rating.created_at), 'MMM d, yyyy')}
              </span>
            </div>
            {rating.review && (
              <p className="text-sm text-muted-foreground">{rating.review}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
