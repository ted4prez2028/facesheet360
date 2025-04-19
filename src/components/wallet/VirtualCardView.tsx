
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useVirtualCard } from '@/hooks/useVirtualCard';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Credit, CreditCard, PlusCircle, User } from 'lucide-react';
import { CareCoinsCard } from '@/types';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const CardDisplay = ({ card }: { card: CareCoinsCard }) => {
  const statusColors = {
    'active': 'bg-green-500',
    'pending': 'bg-yellow-500',
    'suspended': 'bg-red-500',
    'canceled': 'bg-gray-500'
  };

  return (
    <div className="relative rounded-lg overflow-hidden p-6 bg-gradient-to-r from-blue-600 to-violet-600 text-white">
      <div className="absolute top-2 right-2">
        <div className={`inline-flex items-center text-xs font-medium rounded px-2 py-1 ${statusColors[card.status as keyof typeof statusColors]} bg-opacity-80`}>
          {card.status?.toUpperCase()}
        </div>
      </div>
      <div className="flex flex-col h-36 justify-between">
        <div className="flex justify-between items-center">
          <CreditCard size={32} />
          <p className="text-xs opacity-80">CareCoin Medical</p>
        </div>
        <div className="mt-4 text-xl tracking-widest">
          {card.card_number ? 
            card.card_number.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4') : 
            '•••• •••• •••• ••••'}
        </div>
        <div className="flex justify-between items-center mt-4">
          <div className="text-xs">
            <p className="opacity-80">VALID THRU</p>
            <p>{card.expiration_date || 'MM/YY'}</p>
          </div>
          <div className="text-xs text-right">
            <p className="opacity-80">LIMIT</p>
            <p>{card.limit_amount} CC</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export const VirtualCardView = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cardType, setCardType] = useState<'virtual' | 'physical'>('virtual');
  const [limitAmount, setLimitAmount] = useState<number>(1000);
  const {
    activeCards,
    pendingCards,
    isLoading,
    isRequestingCard,
    requestNewCard
  } = useVirtualCard();

  const handleRequestCard = async () => {
    await requestNewCard(cardType, limitAmount);
    setIsOpen(false);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          CareCoins Virtual Cards
        </CardTitle>
        <CardDescription>
          Manage your virtual cards for spending CareCoins
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {activeCards.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Active Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeCards.map(card => (
                <CardDisplay key={card.id} card={card} />
              ))}
            </div>
          </div>
        )}

        {pendingCards.length > 0 && (
          <div>
            <h3 className="text-sm font-medium mb-3">Pending Cards</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingCards.map(card => (
                <CardDisplay key={card.id} card={card} />
              ))}
            </div>
          </div>
        )}

        {activeCards.length === 0 && pendingCards.length === 0 && (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
            <p className="text-muted-foreground">You don't have any cards yet</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full">
              <PlusCircle className="mr-2 h-4 w-4" />
              Request New Card
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Request New CareCoins Card</DialogTitle>
              <DialogDescription>
                Get a card to spend your CareCoins in the real world
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="card-type">Card Type</Label>
                <Select 
                  value={cardType} 
                  onValueChange={(value: 'virtual' | 'physical') => setCardType(value)}
                >
                  <SelectTrigger id="card-type">
                    <SelectValue placeholder="Select card type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="virtual">Virtual Card</SelectItem>
                    <SelectItem value="physical">Physical Card</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="limit">Card Limit (CareCoins)</Label>
                <Input 
                  id="limit"
                  type="number"
                  value={limitAmount}
                  onChange={(e) => setLimitAmount(Number(e.target.value))}
                  min={100}
                  max={10000}
                />
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mt-2">
                  {cardType === 'virtual' ? 
                    'Virtual cards are issued immediately and can be used for online purchases.' : 
                    'Physical cards will be mailed to your address on file within 7-10 business days.'}
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                onClick={handleRequestCard}
                disabled={isRequestingCard}
              >
                {isRequestingCard ? 'Processing...' : 'Request Card'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardFooter>
    </Card>
  );
};
