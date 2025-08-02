
import React from 'react';
import OrganizationalContacts from './OrganizationalContacts';
import CallDialog from './CallDialog';
import VideoCall from './VideoCall';
import ChatWindows from './ChatWindows';

const CommunicationContainer = () => {
  return (
    <>
      <OrganizationalContacts />
      <CallDialog />
      <VideoCall />
      <ChatWindows />
    </>
  );
};

export default CommunicationContainer;
