
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import { useVirtualCard } from "@/hooks/useVirtualCard";

export const VirtualCardView = () => {
  const { requestNewCard, cards, isRequestingCard } = useVirtualCard();

  const handleRequestCard = async () => {
    await requestNewCard('virtual', 500);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Virtual Cards
          </CardTitle>
          <CardDescription>
            Request virtual cards for secure online transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button 
              onClick={handleRequestCard} 
              disabled={isRequestingCard}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              {isRequestingCard ? "Requesting..." : "Request New Virtual Card"}
            </Button>
            
            {cards.length > 0 && (
              <div className="space-y-2">
                <h3 className="font-medium">Your Cards</h3>
                {cards.map((card) => (
                  <div key={card.id} className="p-4 border rounded-lg bg-gradient-to-br from-primary/10 to-primary/5">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{card.card_type === 'virtual' ? 'Virtual Card' : 'Physical Card'}</p>
                        <p className="font-mono font-bold text-lg">**** **** **** {card.last_four}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                        card.status === 'active' 
                          ? 'bg-green-500 text-white' 
                          : card.status === 'pending'
                          ? 'bg-yellow-500 text-white'
                          : 'bg-gray-500 text-white'
                      }`}>
                        {card.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground">Balance</p>
                        <p className="font-semibold">${Number(card.current_balance).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Limit</p>
                        <p className="font-semibold">${Number(card.limit_amount).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
