
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from '@/context/AuthContext';
import { useVirtualCard } from '@/hooks/useVirtualCard';
import { CreditCard, Shield, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export const VirtualCardView = () => {
  const { user } = useAuth();
  const { cards, isLoading, requestCard } = useVirtualCard();
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleCardDetails = () => setShowCardDetails(!showCardDetails);
  const toggleExpanded = () => setIsExpanded(!isExpanded);
  
  const handleRequestCard = async () => {
    if (!user?.id) return;
    await requestCard();
  };

  const formatCardNumber = (cardNumber: string) => {
    return cardNumber.replace(/(\d{4})/g, '$1 ').trim();
  };

  const maskCardNumber = (cardNumber: string) => {
    const last4 = cardNumber.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-6 rounded-xl relative overflow-hidden mb-4">
            <Skeleton className="h-8 w-12 absolute top-4 right-4 bg-white/20" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-full bg-white/20" />
              <Skeleton className="h-4 w-20 bg-white/20" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-32 bg-white/20" />
                <Skeleton className="h-6 w-16 bg-white/20" />
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const activeCard = cards && cards.length > 0 ? cards[0] : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Virtual CareCoins Card
        </CardTitle>
        <CardDescription>
          Use your CareCoins for healthcare expenses
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activeCard ? (
          <>
            <div className="bg-gradient-to-r from-blue-600 to-violet-600 p-6 rounded-xl relative overflow-hidden mb-4">
              <div className="absolute top-4 right-4">
                <Shield className="h-8 w-8 text-white/80" />
              </div>
              <div className="space-y-6">
                <p className="text-lg font-medium text-white tracking-wider">
                  {showCardDetails 
                    ? formatCardNumber(activeCard.card_number || '4111111111111111') 
                    : maskCardNumber(activeCard.card_number || '4111111111111111')}
                </p>
                <p className="text-xs text-white/80">
                  VALID THRU: {activeCard.expiration_date || '12/25'}
                </p>
                <div className="flex justify-between">
                  <p className="uppercase text-sm text-white font-medium tracking-wider">
                    {user?.name || 'CARE MEMBER'}
                  </p>
                  <p className="uppercase text-sm text-white font-medium">
                    VISA
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Button 
                variant="outline" 
                className="w-full flex items-center justify-center gap-2"
                onClick={toggleCardDetails}
              >
                {showCardDetails ? <EyeOff size={16} /> : <Eye size={16} />}
                {showCardDetails ? 'Hide Card Details' : 'Show Card Details'}
              </Button>
              
              <div className="border-t pt-4">
                <Button 
                  variant="ghost" 
                  onClick={toggleExpanded}
                  className="w-full flex items-center justify-between text-sm"
                >
                  <span>Card Information</span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </Button>
                
                {isExpanded && (
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Card Type:</span>
                      <span>{activeCard.card_type || 'Virtual'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <span className="capitalize">{activeCard.status || 'Active'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Spend Limit:</span>
                      <span>{activeCard.limit_amount || 1000} CareCoins</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Issued Date:</span>
                      <span>
                        {new Date(activeCard.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <CreditCard className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Virtual Card</h3>
            <p className="text-muted-foreground mb-4">
              You don't have a virtual CareCoins card yet. Request one to start using your CareCoins for healthcare expenses.
            </p>
            <Button onClick={handleRequestCard}>
              Request Virtual Card
            </Button>
          </div>
        )}
      </CardContent>
      {activeCard && (
        <CardFooter className="border-t pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Protected by CareCoins Security</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};
