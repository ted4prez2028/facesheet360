import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Star } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface RideRatingProps {
  rideId: string;
  driverId: string;
  driverName: string;
  onComplete?: () => void;
}

export const RideRating = ({ rideId, driverId, driverName, onComplete }: RideRatingProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');

  const submitRating = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not authenticated');
      if (rating === 0) throw new Error('Please select a rating');

      const { error } = await supabase
        .from('driver_ratings')
        .insert({
          ride_id: rideId,
          driver_id: driverId,
          passenger_id: user.id,
          rating,
          review: review.trim() || null
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rides'] });
      queryClient.invalidateQueries({ queryKey: ['driver-ratings'] });
      toast.success('Thank you for rating your driver!');
      if (onComplete) onComplete();
    },
    onError: (error: Error) => {
      if (error.message.includes('duplicate key')) {
        toast.error('You have already rated this ride');
      } else {
        toast.error(`Failed to submit rating: ${error.message}`);
      }
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rate Your Driver</CardTitle>
        <CardDescription>How was your ride with {driverName}?</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="transition-transform hover:scale-110"
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
            >
              <Star
                className={`h-10 w-10 ${
                  star <= (hoverRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
        </div>
        
        {rating > 0 && (
          <div className="text-center text-sm text-muted-foreground">
            {rating === 1 && 'Poor'}
            {rating === 2 && 'Fair'}
            {rating === 3 && 'Good'}
            {rating === 4 && 'Very Good'}
            {rating === 5 && 'Excellent'}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Review (Optional)</label>
          <Textarea
            placeholder="Tell us about your experience..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            rows={4}
          />
        </div>

        <Button 
          className="w-full"
          onClick={() => submitRating.mutate()}
          disabled={rating === 0 || submitRating.isPending}
        >
          {submitRating.isPending ? 'Submitting...' : 'Submit Rating'}
        </Button>
      </CardContent>
    </Card>
  );
};
