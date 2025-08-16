import { useState, useEffect, useRef, useCallback } from 'react';
import Peer, { DataConnection, MediaConnection } from 'peerjs';

interface UsePeerConnectionOptions {
  enableVideo?: boolean;
  enableAudio?: boolean;
  onTranscription?: (text: string) => void;
}

export const usePeerConnection = (options: UsePeerConnectionOptions = {}) => {
  const {
    enableVideo = true,
    enableAudio = true,
    onTranscription
  } = options;

  const [peer, setPeer] = useState<Peer | null>(null);
  const [peerId, setPeerId] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callError, setCallError] = useState<string | null>(null);
  const [screenStream, setScreenStream] = useState<MediaStream | null>(null);
  
  const mediaConnectionRef = useRef<MediaConnection | null>(null);
  const dataConnectionRef = useRef<DataConnection | null>(null);
  const recognitionRef = useRef<any>(null);
  const incomingCallRef = useRef<MediaConnection | null>(null);

  // Initialize peer connection
  useEffect(() => {
    const newPeer = new Peer();
    
    newPeer.on('open', (id) => {
      console.log('Peer connected with ID:', id);
      setPeerId(id);
      setIsConnected(true);
      setPeer(newPeer);
    });

    newPeer.on('call', (call) => {
      console.log('Incoming call from:', call.peer);
      incomingCallRef.current = call;
      setIsReceivingCall(true);
    });

    newPeer.on('connection', (conn) => {
      console.log('Data connection established');
      dataConnectionRef.current = conn;
      
      conn.on('data', (data: any) => {
        if (data.type === 'transcription' && onTranscription) {
          onTranscription(data.text);
        }
      });
    });

    newPeer.on('error', (error) => {
      console.error('Peer error:', error);
      setCallError(error.message);
    });

    return () => {
      newPeer.destroy();
    };
  }, [onTranscription]);

  // Setup speech recognition for transcription
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript && dataConnectionRef.current) {
          dataConnectionRef.current.send({
            type: 'transcription',
            text: finalTranscript
          });
        }
      };

      recognitionRef.current = recognition;
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: enableVideo,
        audio: enableAudio
      });
      setLocalStream(stream);
      
      // Start speech recognition for transcription
      if (enableAudio && recognitionRef.current) {
        recognitionRef.current.start();
      }
      
      return stream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      setCallError('Failed to access camera/microphone');
      throw error;
    }
  }, [enableVideo, enableAudio]);

  const makeCall = useCallback(async (remotePeerId: string) => {
    if (!peer) {
      setCallError('Peer not initialized');
      return;
    }

    try {
      const stream = await startLocalStream();
      
      // Establish data connection for transcription
      const dataConn = peer.connect(remotePeerId);
      dataConnectionRef.current = dataConn;
      
      // Make media call
      const call = peer.call(remotePeerId, stream);
      mediaConnectionRef.current = call;
      
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        setRemoteStream(remoteStream);
        setIsCallActive(true);
      });

      call.on('close', () => {
        console.log('Call ended');
        endCall();
      });

      call.on('error', (error) => {
        console.error('Call error:', error);
        setCallError(error.message);
      });

    } catch (error) {
      console.error('Error making call:', error);
      setCallError('Failed to make call');
    }
  }, [peer, startLocalStream, endCall]);

  const answerCall = useCallback(async () => {
    if (!incomingCallRef.current) return;

    try {
      const stream = await startLocalStream();
      
      const call = incomingCallRef.current;
      call.answer(stream);
      mediaConnectionRef.current = call;
      
      call.on('stream', (remoteStream) => {
        console.log('Received remote stream');
        setRemoteStream(remoteStream);
        setIsCallActive(true);
        setIsReceivingCall(false);
      });

      call.on('close', () => {
        console.log('Call ended');
        endCall();
      });

    } catch (error) {
      console.error('Error answering call:', error);
      setCallError('Failed to answer call');
    }
  }, [startLocalStream, endCall]);

  const rejectCall = useCallback(() => {
    if (incomingCallRef.current) {
      incomingCallRef.current.close();
      incomingCallRef.current = null;
    }
    setIsReceivingCall(false);
  }, []);

  const endCall = useCallback(() => {
    // Stop speech recognition
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    // Close media connection
    if (mediaConnectionRef.current) {
      mediaConnectionRef.current.close();
      mediaConnectionRef.current = null;
    }

    // Close data connection
    if (dataConnectionRef.current) {
      dataConnectionRef.current.close();
      dataConnectionRef.current = null;
    }

    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }

    setRemoteStream(null);
    setIsCallActive(false);
    setIsReceivingCall(false);
    setCallError(null);
  }, [localStream]);

  const toggleAudio = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        
        // Toggle speech recognition
        if (recognitionRef.current) {
          if (audioTrack.enabled) {
            recognitionRef.current.start();
          } else {
            recognitionRef.current.stop();
          }
        }
      }
    }
  }, [localStream]);

  const toggleVideo = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  }, [localStream]);

  const stopScreenShare = useCallback(() => {
    if (!screenStream) return;
    const sender = mediaConnectionRef.current?.peerConnection.getSenders().find(s => s.track?.kind === 'video');
    const cameraTrack = localStream?.getVideoTracks()[0];
    if (sender && cameraTrack) {
      sender.replaceTrack(cameraTrack);
    }
    screenStream.getTracks().forEach(track => track.stop());
    setScreenStream(null);
  }, [screenStream, localStream]);

  const startScreenShare = useCallback(async () => {
    if (screenStream) return;
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = stream.getVideoTracks()[0];
      const sender = mediaConnectionRef.current?.peerConnection
        .getSenders()
        .find(s => s.track?.kind === 'video');
      if (sender) {
        sender.replaceTrack(screenTrack);
      }
      screenTrack.onended = () => stopScreenShare();
      setScreenStream(stream);
    } catch (error) {
      console.error('Error starting screen share', error);
      setCallError('Failed to share screen');
    }
  }, [screenStream, stopScreenShare]);

  return {
    peer,
    peerId,
    isConnected,
    isCallActive,
    isReceivingCall,
    localStream,
    remoteStream,
    callError,
    makeCall,
    answerCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    startScreenShare,
    stopScreenShare,
    isScreenSharing: !!screenStream,
    clearError: () => setCallError(null)
  };
};