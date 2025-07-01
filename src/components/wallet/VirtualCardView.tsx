
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreditCard, Plus } from "lucide-react";
import { useVirtualCard } from "@/hooks/useVirtualCard";

export const VirtualCardView = () => {
  const { requestNewCard, cards, isRequestingCard } = useVirtualCard();

  const handleRequestCard = async () => {
    try {
      await requestNewCard('virtual', 500);
    } catch (error) {
      console.error('Failed to request card:', error);
    }
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
                {cards.map((card: any) => (
                  <div key={card.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">**** **** **** {card.last_four}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        card.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {card.status}
                      </span>
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
