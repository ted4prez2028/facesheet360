import { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface VoiceRecorderProps {
  onVoiceRecorded: (audioBlob: Blob, transcription: string, duration: number) => void;
  disabled?: boolean;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onVoiceRecorded, disabled }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startTimeRef = useRef<number>(0);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      startTimeRef.current = Date.now();

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const duration = Math.round((Date.now() - startTimeRef.current) / 1000);
        
        stream.getTracks().forEach(track => track.stop());
        
        await transcribeAndSend(audioBlob, duration);
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.info('Recording started');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Failed to access microphone. Please grant permission.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const transcribeAndSend = async (audioBlob: Blob, duration: number) => {
    setIsProcessing(true);
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      await new Promise((resolve) => {
        reader.onloadend = resolve;
      });

      const base64Audio = (reader.result as string).split(',')[1];

      // Call transcription edge function
      const { data, error } = await supabase.functions.invoke('transcribe-voice', {
        body: { audio: base64Audio }
      });

      if (error) throw error;

      const transcription = data.text || '';
      onVoiceRecorded(audioBlob, transcription, duration);
      toast.success('Voice message recorded');
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Failed to process voice message');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {!isRecording ? (
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0"
          onClick={startRecording}
          disabled={disabled || isProcessing}
          title="Record voice message"
        >
          <Mic className="h-4 w-4" />
        </Button>
      ) : (
        <div className="flex items-center gap-1">
          <div className="flex items-center gap-1 px-2">
            <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
            <span className="text-xs text-muted-foreground">Recording...</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={stopRecording}
            title="Stop recording"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default VoiceRecorder;
