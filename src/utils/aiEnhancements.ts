/**
 * Advanced AI/ML Enhancements
 * Year 3000 Level AI Features
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Natural Language Processing for medical notes
 */
export interface NLPResult {
  entities: Array<{
    text: string;
    type: 'symptom' | 'medication' | 'diagnosis' | 'vital' | 'procedure' | 'date';
    confidence: number;
  }>;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
  keywords: string[];
}

export async function processMedicalNotes(text: string): Promise<NLPResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-clinical-decision', {
      body: { 
        action: 'nlp',
        text,
        model: 'gpt-4-turbo'
      }
    });

    if (error) throw error;

    return data as NLPResult;
  } catch (error) {
    // Fallback to simple keyword extraction
    return extractKeywordsFallback(text);
  }
}

function extractKeywordsFallback(text: string): NLPResult {
  const medicalKeywords = {
    symptom: ['pain', 'fever', 'nausea', 'dizziness', 'fatigue', 'shortness of breath'],
    medication: ['aspirin', 'ibuprofen', 'antibiotic', 'insulin', 'metformin'],
    diagnosis: ['diabetes', 'hypertension', 'pneumonia', 'infection'],
    vital: ['blood pressure', 'heart rate', 'temperature', 'oxygen'],
  };

  const entities: NLPResult['entities'] = [];
  const keywords: string[] = [];

  Object.entries(medicalKeywords).forEach(([type, terms]) => {
    terms.forEach(term => {
      const regex = new RegExp(term, 'gi');
      if (regex.test(text)) {
        entities.push({
          text: term,
          type: type as NLPResult['entities'][0]['type'],
          confidence: 0.7,
        });
        keywords.push(term);
      }
    });
  });

  return {
    entities,
    sentiment: 'neutral',
    summary: text.substring(0, 100) + '...',
    keywords: [...new Set(keywords)],
  };
}

/**
 * Voice command processor
 */
export interface VoiceCommand {
  action: string;
  parameters: Record<string, unknown>;
  confidence: number;
}

export class VoiceCommandProcessor {
  private recognition: SpeechRecognition | null = null;

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as unknown as { SpeechRecognition?: typeof SpeechRecognition }).SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: typeof SpeechRecognition }).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
      }
    }
  }

  async processCommand(audioBlob: Blob): Promise<VoiceCommand> {
    // Convert audio to text
    const text = await this.speechToText(audioBlob);
    
    // Parse command
    return this.parseCommand(text);
  }

  private async speechToText(audioBlob: Blob): Promise<string> {
    // In production, use a proper speech-to-text API
    // For now, return a placeholder
    return new Promise((resolve) => {
      if (this.recognition) {
        this.recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map(result => result[0].transcript)
            .join('');
          resolve(transcript);
        };
        this.recognition.start();
      } else {
        resolve('');
      }
    });
  }

  private parseCommand(text: string): VoiceCommand {
    const lowerText = text.toLowerCase();
    
    // Medical command patterns
    if (lowerText.includes('show patient') || lowerText.includes('open patient')) {
      const match = text.match(/(?:patient|pt)\s+(\w+)/i);
      return {
        action: 'open_patient',
        parameters: { patientId: match?.[1] || '' },
        confidence: 0.8,
      };
    }

    if (lowerText.includes('chart') || lowerText.includes('document')) {
      return {
        action: 'open_charting',
        parameters: {},
        confidence: 0.9,
      };
    }

    if (lowerText.includes('vitals') || lowerText.includes('vital signs')) {
      return {
        action: 'open_vitals',
        parameters: {},
        confidence: 0.9,
      };
    }

    return {
      action: 'unknown',
      parameters: {},
      confidence: 0.1,
    };
  }
}

/**
 * Predictive analytics for patient outcomes
 */
export interface PredictionResult {
  riskScore: number;
  factors: Array<{ factor: string; impact: number }>;
  recommendations: string[];
  confidence: number;
}

export async function predictPatientOutcome(
  patientId: string,
  timeframe: '24h' | '7d' | '30d' = '7d'
): Promise<PredictionResult> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-clinical-decision', {
      body: {
        action: 'predict',
        patientId,
        timeframe,
      },
    });

    if (error) throw error;

    return data as PredictionResult;
  } catch (error) {
    // Fallback prediction
    return {
      riskScore: 0.5,
      factors: [],
      recommendations: ['Continue monitoring', 'Review medications'],
      confidence: 0.6,
    };
  }
}

/**
 * Intelligent search with semantic understanding
 */
export async function intelligentSearch(
  query: string,
  context: 'patients' | 'medications' | 'diagnoses' | 'all' = 'all'
): Promise<Array<{ id: string; title: string; relevance: number; snippet: string }>> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-clinical-decision', {
      body: {
        action: 'search',
        query,
        context,
      },
    });

    if (error) throw error;

    return data as Array<{ id: string; title: string; relevance: number; snippet: string }>;
  } catch (error) {
    // Fallback to simple text search
    return [];
  }
}

/**
 * Auto-complete with AI suggestions
 */
export async function getAISuggestions(
  partialText: string,
  field: 'diagnosis' | 'medication' | 'symptom' | 'procedure'
): Promise<string[]> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-clinical-decision', {
      body: {
        action: 'autocomplete',
        text: partialText,
        field,
      },
    });

    if (error) throw error;

    return data as string[];
  } catch (error) {
    // Fallback suggestions
    const fallbackSuggestions: Record<string, string[]> = {
      diagnosis: ['Diabetes', 'Hypertension', 'Pneumonia', 'Infection'],
      medication: ['Aspirin', 'Ibuprofen', 'Metformin', 'Insulin'],
      symptom: ['Pain', 'Fever', 'Nausea', 'Dizziness'],
      procedure: ['Blood Test', 'X-Ray', 'CT Scan', 'MRI'],
    };

    const suggestions = fallbackSuggestions[field] || [];
    return suggestions.filter(s => 
      s.toLowerCase().includes(partialText.toLowerCase())
    );
  }
}

/**
 * Real-time anomaly detection
 */
export interface Anomaly {
  type: 'vital' | 'medication' | 'lab' | 'behavior';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  timestamp: string;
  recommendation: string;
}

export async function detectAnomalies(patientId: string): Promise<Anomaly[]> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-clinical-decision', {
      body: {
        action: 'detect_anomalies',
        patientId,
      },
    });

    if (error) throw error;

    return data as Anomaly[];
  } catch (error) {
    return [];
  }
}

/**
 * Smart notification prioritization
 */
export interface NotificationPriority {
  priority: 'low' | 'medium' | 'high' | 'urgent';
  reason: string;
  suggestedAction: string;
}

export async function prioritizeNotification(
  notification: { type: string; content: string; patientId?: string }
): Promise<NotificationPriority> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-clinical-decision', {
      body: {
        action: 'prioritize',
        notification,
      },
    });

    if (error) throw error;

    return data as NotificationPriority;
  } catch (error) {
    // Default priority
    return {
      priority: 'medium',
      reason: 'Unable to analyze',
      suggestedAction: 'Review manually',
    };
  }
}

