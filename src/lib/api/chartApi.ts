
import { supabase } from '@/integrations/supabase/client';
import { ChartRecord } from '@/types';

export const chartApi = {
  async getChartRecords(patientId: string): Promise<ChartRecord[]> {
    const { data, error } = await supabase
      .from('chart_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('record_date', { ascending: false });

    if (error) {
      console.error('Error fetching chart records:', error);
      throw error;
    }

    return (data || []).map(record => ({
      ...record,
      vital_signs: record.vital_signs as Record<string, unknown> || {},
      vitals: record.vitals as Record<string, unknown> || {},
      medications: record.medications as Record<string, unknown> || {}
    }));
  },

  async getChartRecordById(id: string): Promise<ChartRecord | null> {
    const { data, error } = await supabase
      .from('chart_records')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('Error fetching chart record:', error);
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      ...data,
      vital_signs: data.vital_signs as Record<string, unknown> || {},
      vitals: data.vitals as Record<string, unknown> || {},
      medications: data.medications as Record<string, unknown> || {}
    };
  },

  async createChartRecord(record: Omit<ChartRecord, 'created_at' | 'id'>): Promise<ChartRecord> {
    const recordData = {
      ...record,
      vital_signs: record.vital_signs ? JSON.stringify(record.vital_signs) : null,
      vitals: record.vitals ? JSON.stringify(record.vitals) : null,
      medications: record.medications ? JSON.stringify(record.medications) : null,
    };

    const { data, error } = await supabase
      .from('chart_records')
      .insert(recordData)
      .select()
      .single();

    if (error) {
      console.error('Error creating chart record:', error);
      throw error;
    }

    return {
      ...data,
      vital_signs: data.vital_signs as Record<string, unknown> || {},
      vitals: data.vitals as Record<string, unknown> || {},
      medications: data.medications as Record<string, unknown> || {}
    };
  },

  async updateChartRecord(id: string, updates: Partial<ChartRecord>): Promise<ChartRecord> {
    const updateData = {
      ...updates,
      vital_signs: updates.vital_signs ? JSON.stringify(updates.vital_signs) : undefined,
      vitals: updates.vitals ? JSON.stringify(updates.vitals) : undefined,
      medications: updates.medications ? JSON.stringify(updates.medications) : undefined,
    };

    const { data, error } = await supabase
      .from('chart_records')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating chart record:', error);
      throw error;
    }

    return {
      ...data,
      vital_signs: data.vital_signs as Record<string, unknown> || {},
      vitals: data.vitals as Record<string, unknown> || {},
      medications: data.medications as Record<string, unknown> || {}
    };
  },

  async deleteChartRecord(id: string): Promise<void> {
    const { error } = await supabase
      .from('chart_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting chart record:', error);
      throw error;
    }
  }
};
