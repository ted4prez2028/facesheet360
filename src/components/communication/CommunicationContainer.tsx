
import React from 'react';
import ContactsList from './ContactsList';
import CallDialog from './CallDialog';
import VideoCall from './VideoCall';
import ChatWindows from './ChatWindows';

const CommunicationContainer = () => {
  return (
    <>
      <ContactsList />
      <CallDialog />
      <VideoCall />
      <ChatWindows />
    </>
  );
};

export default CommunicationContainer;
