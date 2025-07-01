
import { useState, useEffect, useRef } from 'react';

interface PeerConnectionOptions {
  video: boolean;
  audio: boolean;
}

export const usePeerConnection = (options: PeerConnectionOptions = { video: true, audio: true }) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const peerConnection = useRef<RTCPeerConnection | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const initializePeerConnection = () => {
    const configuration = {
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };
    
    peerConnection.current = new RTCPeerConnection(configuration);
    
    peerConnection.current.onicecandidate = (event) => {
      if (event.candidate) {
        // Send candidate to remote peer
        console.log('ICE candidate:', event.candidate);
      }
    };

    peerConnection.current.ontrack = (event) => {
      const [stream] = event.streams;
      setRemoteStream(stream);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = stream;
      }
    };

    peerConnection.current.onconnectionstatechange = () => {
      const state = peerConnection.current?.connectionState;
      setIsConnected(state === 'connected');
    };
  };

  const startCall = async () => {
    setIsLoading(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia(options);
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      initializePeerConnection();
      
      stream.getTracks().forEach(track => {
        peerConnection.current?.addTrack(track, stream);
      });

      const offer = await peerConnection.current?.createOffer();
      await peerConnection.current?.setLocalDescription(offer);
      
      // Send offer to remote peer
      console.log('Created offer:', offer);
      
    } catch (error) {
      console.error('Error starting call:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    
    if (peerConnection.current) {
      peerConnection.current.close();
      peerConnection.current = null;
    }
    
    setRemoteStream(null);
    setIsConnected(false);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
      }
    }
  };

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return {
    localStream,
    remoteStream,
    isConnected,
    isLoading,
    localVideoRef,
    remoteVideoRef,
    startCall,
    endCall,
    toggleVideo,
    toggleAudio
  };
};
