
import React from 'react';
import ChatWindow from './ChatWindow';
import VideoCall from './VideoCall';
import GroupVideoCall from './GroupVideoCall';
import { useCommunication } from '@/context/communication/CommunicationContext';

export const CommunicationContainer = () => {
  const { chatWindows, isCallActive, isGroupCall } = useCommunication();
  
  return (
    <>
      {/* Render individual chat windows */}
      <div className="fixed bottom-0 right-0 flex flex-row-reverse gap-4 z-30 pr-4">
        {chatWindows.map((window) => (
          <ChatWindow
            key={window.userId}
            userId={window.userId}
            userName={window.userName}
            minimized={window.minimized}
            messages={window.messages}
          />
        ))}
      </div>
      
      {/* Render the active video/audio call */}
      {isCallActive && !isGroupCall && <VideoCall />}
      
      {/* Render the group call if active */}
      {isGroupCall && <GroupVideoCall />}
    </>
  );
};

export default CommunicationContainer;
