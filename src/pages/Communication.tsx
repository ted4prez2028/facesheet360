import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, Building2 } from 'lucide-react';
import CommunicationHub from '@/components/communication/CommunicationHub';
import { InviteProviderDialog } from '@/components/communication/InviteProviderDialog';

export default function Communication() {
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Users className="h-8 w-8" />
            Provider Communication
          </h1>
          <p className="text-muted-foreground">Secure HIPAA-compliant messaging and calling</p>
        </div>
        <Button onClick={() => setIsInviteDialogOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          Invite Provider
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organization Network</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">In-Network</div>
            <p className="text-xs text-muted-foreground">
              Chat with providers in your organization instantly
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cross-Organization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Available</div>
            <p className="text-xs text-muted-foreground">
              Secure communication with external providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">HIPAA</div>
            <p className="text-xs text-muted-foreground">
              End-to-end encrypted communication
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div>
              <h4 className="font-medium">Click the Communication Hub</h4>
              <p className="text-sm text-muted-foreground">
                Look for the floating icon in the bottom right corner to access all providers
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
              2
            </div>
            <div>
              <h4 className="font-medium">Select a Provider</h4>
              <p className="text-sm text-muted-foreground">
                Browse healthcare providers by role, search by name, or filter by organization
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-primary text-primary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
              3
            </div>
            <div>
              <h4 className="font-medium">Start Communicating</h4>
              <p className="text-sm text-muted-foreground">
                Send secure messages or start audio/video calls with one click
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-secondary text-secondary-foreground rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h4 className="font-medium">Cross-Organization Communication</h4>
              <p className="text-sm text-muted-foreground">
                When contacting providers outside your organization, you'll see a warning to ensure proper consent and compliance
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The floating hub is always rendered */}
      <CommunicationHub />

      <InviteProviderDialog 
        open={isInviteDialogOpen} 
        onOpenChange={setIsInviteDialogOpen} 
      />
    </div>
  );
}
