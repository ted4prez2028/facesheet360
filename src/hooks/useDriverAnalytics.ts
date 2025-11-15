// @ts-nocheck
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns';

interface AnalyticsDataPoint {
  date: string;
  rides: number;
  earnings: number;
  rating: number;
}

export const useDriverAnalytics = (timeframe: 'daily' | 'weekly' | 'monthly') => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['driver-analytics', user?.id, timeframe],
    queryFn: async () => {
      if (!user) return [];

      // Get driver ID
      const { data: driver } = await supabase
        .from('drivers')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!driver) return [];

      // Calculate date range
      const now = new Date();
      let startDate: Date;
      let intervals: Date[];

      switch (timeframe) {
        case 'daily':
          startDate = subDays(now, 30);
          intervals = eachDayOfInterval({ start: startDate, end: now });
          break;
        case 'weekly':
          startDate = subWeeks(now, 12);
          intervals = eachWeekOfInterval({ start: startDate, end: now });
          break;
        case 'monthly':
          startDate = subMonths(now, 12);
          intervals = eachMonthOfInterval({ start: startDate, end: now });
          break;
      }

      // Fetch completed rides
      const { data: rides, error } = await supabase
        .from('rides')
        .select('actual_dropoff_time, driver_earnings')
        .eq('driver_id', driver.id)
        .eq('status', 'completed')
        .gte('actual_dropoff_time', startDate.toISOString());

      if (error) throw error;

      // Fetch ratings
      const { data: ratings, error: ratingsError } = await supabase
        .from('driver_ratings')
        .select('rating, created_at')
        .eq('driver_id', driver.id)
        .gte('created_at', startDate.toISOString());

      if (ratingsError) throw ratingsError;

      // Group data by interval
      const dataPoints: AnalyticsDataPoint[] = intervals.map(intervalDate => {
        let intervalStart: Date;
        let intervalEnd: Date;

        switch (timeframe) {
          case 'daily':
            intervalStart = startOfDay(intervalDate);
            intervalEnd = new Date(intervalStart);
            intervalEnd.setDate(intervalEnd.getDate() + 1);
            break;
          case 'weekly':
            intervalStart = startOfWeek(intervalDate);
            intervalEnd = new Date(intervalStart);
            intervalEnd.setDate(intervalEnd.getDate() + 7);
            break;
          case 'monthly':
            intervalStart = startOfMonth(intervalDate);
            intervalEnd = new Date(intervalStart);
            intervalEnd.setMonth(intervalEnd.getMonth() + 1);
            break;
        }

        const intervalRides = rides?.filter(ride => {
          if (!ride.actual_dropoff_time) return false;
          const rideDate = new Date(ride.actual_dropoff_time);
          return rideDate >= intervalStart && rideDate < intervalEnd;
        }) || [];

        const intervalRatings = ratings?.filter(rating => {
          const ratingDate = new Date(rating.created_at);
          return ratingDate >= intervalStart && ratingDate < intervalEnd;
        }) || [];

        const totalEarnings = intervalRides.reduce((sum, ride) => sum + (ride.driver_earnings || 0), 0);
        const avgRating = intervalRatings.length > 0
          ? intervalRatings.reduce((sum, r) => sum + r.rating, 0) / intervalRatings.length
          : 0;

        return {
          date: intervalStart.toISOString().split('T')[0],
          rides: intervalRides.length,
          earnings: totalEarnings,
          rating: avgRating,
        };
      });

      return dataPoints;
    },
    enabled: !!user,
  });
};