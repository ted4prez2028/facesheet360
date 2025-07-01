
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Video, VideoOff, Mic, MicOff, Phone, Users } from 'lucide-react';

interface Participant {
  id: string;
  name: string;
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

interface GroupVideoCallProps {
  participants: Participant[];
  onEndCall: () => void;
}

const GroupVideoCall: React.FC<GroupVideoCallProps> = ({
  participants,
  onEndCall
}) => {
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  return (
    <div className="h-screen bg-gray-900 text-white p-4">
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-semibold">Group Call ({participants.length + 1})</span>
          </div>
        </div>

        {/* Video Grid */}
        <div className="flex-1 grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
          {/* Local video */}
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-0 aspect-video relative">
              <div className="absolute inset-0 bg-gray-700 rounded-lg flex items-center justify-center">
                {isVideoEnabled ? (
                  <div className="text-gray-400">Your Video</div>
                ) : (
                  <div className="text-gray-400">Video Off</div>
                )}
              </div>
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                You
              </div>
            </CardContent>
          </Card>

          {/* Participant videos */}
          {participants.map((participant) => (
            <Card key={participant.id} className="bg-gray-800 border-gray-700">
              <CardContent className="p-0 aspect-video relative">
                <div className="absolute inset-0 bg-gray-700 rounded-lg flex items-center justify-center">
                  {participant.isVideoEnabled ? (
                    <div className="text-gray-400">{participant.name}'s Video</div>
                  ) : (
                    <div className="text-gray-400">Video Off</div>
                  )}
                </div>
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 px-2 py-1 rounded text-sm">
                  {participant.name}
                </div>
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {!participant.isVideoEnabled && <VideoOff className="h-4 w-4 text-red-400" />}
                  {!participant.isAudioEnabled && <MicOff className="h-4 w-4 text-red-400" />}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant={isVideoEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full h-12 w-12 p-0"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            variant={isAudioEnabled ? "secondary" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full h-12 w-12 p-0"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            variant="destructive"
            size="lg"
            onClick={onEndCall}
            className="rounded-full h-12 w-12 p-0"
          >
            <Phone className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupVideoCall;
