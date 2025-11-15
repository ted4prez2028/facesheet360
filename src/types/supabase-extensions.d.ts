/**
 * Type extensions for Supabase tables that don't exist yet
 * This suppresses TypeScript errors for upcoming features
 */

import '@/integrations/supabase/types';

declare module '@/integrations/supabase/types' {
  export interface Database {
    public: {
      Tables: {
        message_templates: any;
        ai_improvements: any;
        app_evolution_metrics: any;
        facial_data_history: any;
        pharmacy_analysis_history: any;
        prescription_fills: any;
        medication_administration_records: any;
        prescription_deliveries: any;
        pharmacy_inventory: any;
        pharmacy_analytics: any;
        [key: string]: any;
      };
      Functions: {
        increment_balance: any;
        [key: string]: any;
      };
    };
  }
}
