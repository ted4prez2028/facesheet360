
import { ChartRecord } from '@/types';

// NOTE: chart_records table doesn't exist in database
// Using patient_notes as a fallback for charting functionality
export const chartApi = {
  async getChartRecords(patientId: string): Promise<ChartRecord[]> {
    // Mock implementation - return empty array
    console.warn('chart_records table does not exist, returning empty array');
    return [];
  },

  async getChartRecordById(id: string): Promise<ChartRecord | null> {
    console.warn('chart_records table does not exist, returning null');
    return null;
  },

  async createChartRecord(record: Omit<ChartRecord, 'created_at' | 'id'>): Promise<ChartRecord> {
    console.warn('chart_records table does not exist, mocking response');
    return {
      id: 'mock-id',
      created_at: new Date().toISOString(),
      ...record,
      vital_signs: record.vital_signs || {},
      vitals: record.vitals || {},
      medications: record.medications || {}
    } as ChartRecord;
  },

  async updateChartRecord(id: string, updates: Partial<ChartRecord>): Promise<ChartRecord> {
    console.warn('chart_records table does not exist, mocking response');
    return {
      id,
      created_at: new Date().toISOString(),
      patient_id: '',
      provider_id: '',
      record_type: '',
      record_date: new Date().toISOString(),
      ...updates,
      vital_signs: updates.vital_signs || {},
      vitals: updates.vitals || {},
      medications: updates.medications || {}
    } as ChartRecord;
  },

  async deleteChartRecord(id: string): Promise<void> {
    console.warn('chart_records table does not exist, mock delete');
  }
};
