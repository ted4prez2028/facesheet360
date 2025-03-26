import { useEffect, useState, useRef, useCallback } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export interface PeerConnectionState {
  peer: Peer | null;
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: Error | null;
}

export function usePeerConnection() {
  const { user } = useAuth();
  const [state, setState] = useState<PeerConnectionState>({
    peer: null,
    localStream: null,
    remoteStream: null,
    isConnecting: false,
    isConnected: false,
    error: null
  });
  
  const callRef = useRef<MediaConnection | null>(null);
  const peerId = user?.id || '';

  // Initialize peer connection
  useEffect(() => {
    if (!peerId) return;

    const initPeer = () => {
      try {
        const newPeer = new Peer(peerId, {
          debug: process.env.NODE_ENV === 'development' ? 2 : 0,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' }
            ]
          }
        });

        newPeer.on('open', (id) => {
          console.log('PeerJS connection established with ID:', id);
          setState(prev => ({ ...prev, peer: newPeer }));
        });

        newPeer.on('error', (err) => {
          console.error('PeerJS error:', err);
          toast.error(`Connection error: ${err.message}`);
          setState(prev => ({ ...prev, error: err }));
        });

        newPeer.on('call', async (call) => {
          callRef.current = call;
          setState(prev => ({ ...prev, isConnecting: true }));
          
          try {
            // Answer automatically if we already have a stream
            if (state.localStream) {
              call.answer(state.localStream);
            } else {
              // Otherwise get a new stream and answer
              const stream = await navigator.mediaDevices.getUserMedia({ 
                video: true, 
                audio: true 
              });
              setState(prev => ({ ...prev, localStream: stream }));
              call.answer(stream);
            }
            
            call.on('stream', (remoteStream) => {
              setState(prev => ({
                ...prev,
                remoteStream,
                isConnected: true,
                isConnecting: false
              }));
            });
            
            call.on('close', () => {
              closeCall();
            });
            
            call.on('error', (err) => {
              console.error('Call error:', err);
              toast.error(`Call error: ${err.message}`);
              setState(prev => ({ ...prev, error: err }));
              closeCall();
            });
          } catch (err) {
            console.error('Error answering call:', err);
            toast.error('Could not access camera or microphone');
            setState(prev => ({ 
              ...prev, 
              error: err instanceof Error ? err : new Error(String(err)),
              isConnecting: false
            }));
          }
        });

        return newPeer;
      } catch (err) {
        console.error('Error initializing peer:', err);
        toast.error('Could not initialize peer connection');
        setState(prev => ({ 
          ...prev, 
          error: err instanceof Error ? err : new Error(String(err)) 
        }));
        return null;
      }
    };

    const newPeer = initPeer();
    
    // Cleanup function
    return () => {
      if (state.localStream) {
        state.localStream.getTracks().forEach(track => track.stop());
      }
      if (callRef.current) {
        callRef.current.close();
      }
      if (state.peer) {
        state.peer.destroy();
      }
    };
  }, [peerId]);

  // Start a call to another peer
  const startCall = useCallback(async (remotePeerId: string, isVideo: boolean) => {
    if (!state.peer) {
      toast.error('Peer connection not established');
      return;
    }
    
    setState(prev => ({ ...prev, isConnecting: true }));
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isVideo, 
        audio: true 
      });
      
      setState(prev => ({ ...prev, localStream: stream }));
      
      const call = state.peer.call(remotePeerId, stream);
      callRef.current = call;
      
      call.on('stream', (remoteStream) => {
        setState(prev => ({
          ...prev,
          remoteStream,
          isConnected: true,
          isConnecting: false
        }));
      });
      
      call.on('close', () => {
        closeCall();
      });
      
      call.on('error', (err) => {
        console.error('Call error:', err);
        toast.error(`Call error: ${err.message}`);
        setState(prev => ({ ...prev, error: err }));
        closeCall();
      });
    } catch (err) {
      console.error('Error starting call:', err);
      toast.error('Could not access camera or microphone');
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err : new Error(String(err)),
        isConnecting: false
      }));
    }
  }, [state.peer]);

  // End the current call
  const endCall = useCallback(() => {
    closeCall();
  }, []);
  
  // Helper to properly close and clean up a call
  const closeCall = () => {
    if (callRef.current) {
      callRef.current.close();
      callRef.current = null;
    }
    
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    
    setState(prev => ({
      ...prev,
      localStream: null,
      remoteStream: null,
      isConnected: false,
      isConnecting: false
    }));
  };

  // Toggle mute for audio
  const toggleAudio = useCallback((mute: boolean) => {
    if (state.localStream) {
      state.localStream.getAudioTracks().forEach(track => {
        track.enabled = !mute;
      });
    }
  }, [state.localStream]);

  // Toggle video
  const toggleVideo = useCallback((hide: boolean) => {
    if (state.localStream) {
      state.localStream.getVideoTracks().forEach(track => {
        track.enabled = !hide;
      });
    }
  }, [state.localStream]);

  return {
    ...state,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo
  };
}
