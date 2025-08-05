import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface MaintenanceResult {
  task: string;
  status: 'success' | 'error';
  message: string;
  duration: number;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const results: MaintenanceResult[] = [];
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('🔧 Starting system maintenance cron job...');

    // Task 1: Clean up old notifications (older than 30 days)
    const cleanupStart = Date.now();
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { count } = await supabase
        .from('notifications')
        .delete()
        .lt('created_at', thirtyDaysAgo.toISOString());
        
      results.push({
        task: 'Notification Cleanup',
        status: 'success',
        message: `Cleaned up ${count || 0} old notifications`,
        duration: Date.now() - cleanupStart
      });
    } catch (error) {
      results.push({
        task: 'Notification Cleanup',
        status: 'error',
        message: `Error: ${error.message}`,
        duration: Date.now() - cleanupStart
      });
    }

    // Task 2: Update system health metrics
    const healthStart = Date.now();
    try {
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      const { count: todayAppointments } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true })
        .gte('appointment_date', new Date().toISOString().split('T')[0]);

      // Store health metrics
      await supabase
        .from('system_health_metrics')
        .upsert({
          metric_date: new Date().toISOString().split('T')[0],
          total_users: totalUsers || 0,
          total_patients: totalPatients || 0,
          daily_appointments: todayAppointments || 0,
          last_updated: new Date().toISOString()
        }, { onConflict: 'metric_date' });

      results.push({
        task: 'Health Metrics Update',
        status: 'success',
        message: `Updated metrics: ${totalUsers} users, ${totalPatients} patients, ${todayAppointments} appointments today`,
        duration: Date.now() - healthStart
      });
    } catch (error) {
      results.push({
        task: 'Health Metrics Update',
        status: 'error',
        message: `Error: ${error.message}`,
        duration: Date.now() - healthStart
      });
    }

    // Task 3: Optimize database performance
    const optimizeStart = Date.now();
    try {
      // Update statistics for query optimization
      const { error: analyzeError } = await supabase.rpc('analyze_tables');
      
      results.push({
        task: 'Database Optimization',
        status: analyzeError ? 'error' : 'success',
        message: analyzeError ? `Error: ${analyzeError.message}` : 'Database statistics updated',
        duration: Date.now() - optimizeStart
      });
    } catch (error) {
      results.push({
        task: 'Database Optimization',
        status: 'error',
        message: `Error: ${error.message}`,
        duration: Date.now() - optimizeStart
      });
    }

    // Task 4: Check for system anomalies
    const anomalyStart = Date.now();
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

      // Check for unusual activity patterns
      const { count: recentErrors } = await supabase
        .from('error_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', oneHourAgo.toISOString());

      const { count: failedLogins } = await supabase
        .from('auth_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('success', false)
        .gte('created_at', oneHourAgo.toISOString());

      let anomalyMessage = 'System operating normally';
      if ((recentErrors || 0) > 10) {
        anomalyMessage = `⚠️ High error rate detected: ${recentErrors} errors in last hour`;
      }
      if ((failedLogins || 0) > 20) {
        anomalyMessage += ` | High failed login attempts: ${failedLogins}`;
      }

      results.push({
        task: 'Anomaly Detection',
        status: (recentErrors || 0) > 10 || (failedLogins || 0) > 20 ? 'error' : 'success',
        message: anomalyMessage,
        duration: Date.now() - anomalyStart
      });
    } catch (error) {
      results.push({
        task: 'Anomaly Detection',
        status: 'error',
        message: `Error: ${error.message}`,
        duration: Date.now() - anomalyStart
      });
    }

    // Task 5: Send admin notification
    const notifyStart = Date.now();
    try {
      const successCount = results.filter(r => r.status === 'success').length;
      const errorCount = results.filter(r => r.status === 'error').length;
      const totalDuration = Date.now() - startTime;

      // Get admin user ID
      const { data: adminUser } = await supabase
        .from('users')
        .select('id')
        .eq('email', 'tdicusmurray@gmail.com')
        .single();

      if (adminUser) {
        await supabase
          .from('notifications')
          .insert({
            user_id: adminUser.id,
            title: '🔧 System Maintenance Complete',
            message: `Maintenance completed in ${totalDuration}ms. ${successCount} tasks successful, ${errorCount} errors.`,
            type: 'system',
            read: false
          });
      }

      results.push({
        task: 'Admin Notification',
        status: 'success',
        message: 'Admin notified of maintenance completion',
        duration: Date.now() - notifyStart
      });
    } catch (error) {
      results.push({
        task: 'Admin Notification',
        status: 'error',
        message: `Error: ${error.message}`,
        duration: Date.now() - notifyStart
      });
    }

    const totalDuration = Date.now() - startTime;
    console.log(`✅ System maintenance completed in ${totalDuration}ms`);
    console.log('Results:', results);

    return new Response(JSON.stringify({
      success: true,
      message: 'System maintenance completed',
      duration: totalDuration,
      results
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });

  } catch (error) {
    console.error('❌ System maintenance failed:', error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      duration: Date.now() - startTime,
      results
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders,
      },
    });
  }
};

serve(handler);