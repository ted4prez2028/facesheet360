
import { useEffect, useState, useRef, useCallback } from 'react';
import Peer, { MediaConnection } from 'peerjs';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export interface PeerConnectionState {
  peer: Peer | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isConnecting: boolean;
  isConnected: boolean;
  error: Error | null;
  participants: string[];
  isGroupCall: boolean;
  roomId: string | null;
}

interface GroupCallParticipant {
  id: string;
  name: string;
  stream: MediaStream | null;
}

export function usePeerConnection() {
  const { user } = useAuth();
  const [state, setState] = useState<PeerConnectionState>({
    peer: null,
    localStream: null,
    remoteStreams: new Map(),
    isConnecting: false,
    isConnected: false,
    error: null,
    participants: [],
    isGroupCall: false,
    roomId: null
  });
  
  const callsRef = useRef<Map<string, MediaConnection>>(new Map());
  const peerId = user?.id || '';
  const organizationRef = useRef<string | null>(null);

  // Set user's organization
  useEffect(() => {
    if (!user?.id) return;
    
    const fetchUserOrganization = async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('organization')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        organizationRef.current = data?.organization || null;
      } catch (err) {
        console.error('Error fetching organization:', err);
      }
    };
    
    fetchUserOrganization();
  }, [user]);

  // Initialize peer connection
  useEffect(() => {
    if (!peerId) return;

    const initPeer = () => {
      try {
        const newPeer = new Peer(peerId, {
          debug: process.env.NODE_ENV === 'development' ? 2 : 0,
          secure: true,
          config: {
            iceServers: [
              { urls: 'stun:stun.l.google.com:19302' },
              { urls: 'stun:global.stun.twilio.com:3478' },
              {
                urls: 'turn:numb.viagenie.ca',
                username: 'webrtc@live.com',
                credential: 'muazkh'
              }
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
          callsRef.current.set(call.peer, call);
          setState(prev => ({ ...prev, isConnecting: true }));
          
          try {
            // Answer automatically if we already have a stream
            const stream = state.localStream || await navigator.mediaDevices.getUserMedia({ 
              video: true, 
              audio: true 
            });
            
            if (!state.localStream) {
              setState(prev => ({ ...prev, localStream: stream }));
            }
            
            call.answer(stream);
            
            call.on('stream', (remoteStream) => {
              setState(prev => {
                const newRemoteStreams = new Map(prev.remoteStreams);
                newRemoteStreams.set(call.peer, remoteStream);
                
                const isGroupCall = newRemoteStreams.size > 1 || prev.isGroupCall;
                const participants = [...prev.participants];
                if (!participants.includes(call.peer)) {
                  participants.push(call.peer);
                }
                
                return {
                  ...prev,
                  remoteStreams: newRemoteStreams,
                  isConnected: true,
                  isConnecting: false,
                  isGroupCall,
                  participants
                };
              });
            });
            
            call.on('close', () => {
              closeCallWithPeer(call.peer);
            });
            
            call.on('error', (err) => {
              console.error('Call error:', err);
              toast.error(`Call error: ${err.message}`);
              setState(prev => ({ ...prev, error: err }));
              closeCallWithPeer(call.peer);
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
      
      callsRef.current.forEach(call => {
        call.close();
      });
      
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
      callsRef.current.set(remotePeerId, call);
      
      call.on('stream', (remoteStream) => {
        setState(prev => {
          const newRemoteStreams = new Map(prev.remoteStreams);
          newRemoteStreams.set(remotePeerId, remoteStream);
          
          const participants = [...prev.participants];
          if (!participants.includes(remotePeerId)) {
            participants.push(remotePeerId);
          }
          
          return {
            ...prev,
            remoteStreams: newRemoteStreams,
            isConnected: true,
            isConnecting: false,
            participants
          };
        });
      });
      
      call.on('close', () => {
        closeCallWithPeer(remotePeerId);
      });
      
      call.on('error', (err) => {
        console.error('Call error:', err);
        toast.error(`Call error: ${err.message}`);
        setState(prev => ({ ...prev, error: err }));
        closeCallWithPeer(remotePeerId);
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

  // Start a group call with multiple peers
  const startGroupCall = useCallback(async (peerIds: string[], isVideo: boolean, roomId: string) => {
    if (!state.peer) {
      toast.error('Peer connection not established');
      return;
    }
    
    if (peerIds.length === 0) {
      toast.error('No peers to call');
      return;
    }
    
    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      isGroupCall: true,
      roomId 
    }));
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isVideo, 
        audio: true 
      });
      
      setState(prev => ({ ...prev, localStream: stream }));
      
      // Call each peer
      for (const peerId of peerIds) {
        const call = state.peer.call(peerId, stream);
        callsRef.current.set(peerId, call);
        
        call.on('stream', (remoteStream) => {
          setState(prev => {
            const newRemoteStreams = new Map(prev.remoteStreams);
            newRemoteStreams.set(peerId, remoteStream);
            
            const participants = [...prev.participants];
            if (!participants.includes(peerId)) {
              participants.push(peerId);
            }
            
            return {
              ...prev,
              remoteStreams: newRemoteStreams,
              isConnected: true,
              isConnecting: false,
              participants
            };
          });
        });
        
        call.on('close', () => {
          closeCallWithPeer(peerId);
        });
        
        call.on('error', (err) => {
          console.error(`Call error with peer ${peerId}:`, err);
          toast.error(`Call error with a participant: ${err.message}`);
        });
      }
    } catch (err) {
      console.error('Error starting group call:', err);
      toast.error('Could not access camera or microphone');
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err : new Error(String(err)),
        isConnecting: false
      }));
    }
  }, [state.peer]);

  // Join an existing group call
  const joinGroupCall = useCallback(async (roomId: string, participantIds: string[], isVideo: boolean) => {
    if (!state.peer) {
      toast.error('Peer connection not established');
      return;
    }
    
    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      isGroupCall: true,
      roomId
    }));
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: isVideo, 
        audio: true 
      });
      
      setState(prev => ({ ...prev, localStream: stream }));
      
      // Call each existing participant
      for (const peerId of participantIds) {
        if (peerId !== user?.id) {
          const call = state.peer.call(peerId, stream);
          callsRef.current.set(peerId, call);
          
          call.on('stream', (remoteStream) => {
            setState(prev => {
              const newRemoteStreams = new Map(prev.remoteStreams);
              newRemoteStreams.set(peerId, remoteStream);
              
              const participants = [...prev.participants];
              if (!participants.includes(peerId)) {
                participants.push(peerId);
              }
              
              return {
                ...prev,
                remoteStreams: newRemoteStreams,
                isConnected: true,
                isConnecting: false,
                participants
              };
            });
          });
          
          call.on('close', () => {
            closeCallWithPeer(peerId);
          });
          
          call.on('error', (err) => {
            console.error(`Call error with peer ${peerId}:`, err);
            toast.error(`Call error with a participant: ${err.message}`);
          });
        }
      }
    } catch (err) {
      console.error('Error joining group call:', err);
      toast.error('Could not access camera or microphone');
      setState(prev => ({ 
        ...prev, 
        error: err instanceof Error ? err : new Error(String(err)),
        isConnecting: false
      }));
    }
  }, [state.peer, user?.id]);

  // Leave group call
  const leaveGroupCall = useCallback(() => {
    if (state.isGroupCall) {
      endCall();
      
      // Notify other participants if needed
      if (state.roomId) {
        // Could implement room-based notification here
      }
    }
  }, [state.isGroupCall, state.roomId]);

  // End the current call
  const endCall = useCallback(() => {
    // Close all calls
    callsRef.current.forEach((call) => {
      call.close();
    });
    callsRef.current.clear();
    
    if (state.localStream) {
      state.localStream.getTracks().forEach(track => track.stop());
    }
    
    setState(prev => ({
      ...prev,
      localStream: null,
      remoteStreams: new Map(),
      isConnected: false,
      isConnecting: false,
      participants: [],
      isGroupCall: false,
      roomId: null
    }));
  }, []);
  
  // Helper to properly close and clean up a call with a specific peer
  const closeCallWithPeer = (peerId: string) => {
    const call = callsRef.current.get(peerId);
    if (call) {
      call.close();
      callsRef.current.delete(peerId);
    }
    
    setState(prev => {
      const newRemoteStreams = new Map(prev.remoteStreams);
      newRemoteStreams.delete(peerId);
      
      const participants = prev.participants.filter(id => id !== peerId);
      const isStillGroupCall = participants.length > 0 && prev.isGroupCall;
      
      // If no more participants, close local stream too
      if (participants.length === 0 && prev.localStream) {
        prev.localStream.getTracks().forEach(track => track.stop());
      }
      
      return {
        ...prev,
        remoteStreams: newRemoteStreams,
        participants,
        isGroupCall: isStillGroupCall,
        isConnected: participants.length > 0,
        localStream: participants.length > 0 ? prev.localStream : null,
        roomId: isStillGroupCall ? prev.roomId : null
      };
    });
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

  // Get organization users for group calls
  const getOrganizationUsers = useCallback(async () => {
    if (!organizationRef.current || !user) return [];
    
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, name, role, online_status')
        .eq('organization', organizationRef.current)
        .neq('id', user.id);
        
      if (error) throw error;
      
      return data || [];
    } catch (err) {
      console.error('Error fetching organization users:', err);
      toast.error('Could not fetch organization members');
      return [];
    }
  }, [user]);

  return {
    ...state,
    startCall,
    endCall,
    toggleAudio,
    toggleVideo,
    startGroupCall,
    joinGroupCall,
    leaveGroupCall,
    getOrganizationUsers,
    organization: organizationRef.current
  };
}
