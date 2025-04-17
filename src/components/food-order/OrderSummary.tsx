
import React from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MenuItem } from '@/types/foodOrder';

interface OrderSummaryProps {
  selectedItems: Array<{
    menuItem: MenuItem;
    quantity: number;
    notes?: string;
  }>;
  onUpdateQuantity: (index: number, quantity: number) => void;
  onUpdateNotes: (index: number, notes: string) => void;
  onRemoveItem: (index: number) => void;
  onSubmitOrder: () => void;
  isSubmitting: boolean;
  specialInstructions: string;
  onSpecialInstructionsChange: (instructions: string) => void;
}

export function OrderSummary({
  selectedItems,
  onUpdateQuantity,
  onUpdateNotes,
  onRemoveItem,
  onSubmitOrder,
  isSubmitting,
  specialInstructions,
  onSpecialInstructionsChange,
}: OrderSummaryProps) {
  const totalCalories = selectedItems.reduce((total, item) => {
    return total + (item.menuItem.dietary_info?.calories || 0) * item.quantity;
  }, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {selectedItems.length === 0 ? (
          <p className="text-center text-muted-foreground">No items selected</p>
        ) : (
          <>
            {selectedItems.map((item, index) => (
              <div key={index} className="space-y-2 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.menuItem.name}</p>
                    {item.menuItem.dietary_info?.calories && (
                      <Badge variant="secondary" className="mt-1">
                        {item.menuItem.dietary_info.calories * item.quantity} cal
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onUpdateQuantity(index, parseInt(e.target.value))}
                      className="w-20"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => onRemoveItem(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <Textarea
                  placeholder="Special instructions for this item..."
                  value={item.notes || ''}
                  onChange={(e) => onUpdateNotes(index, e.target.value)}
                  className="text-sm"
                  rows={2}
                />
              </div>
            ))}

            <div className="space-y-4 pt-4">
              <div>
                <p className="text-sm font-medium mb-2">Special Instructions</p>
                <Textarea
                  placeholder="Any additional instructions for the entire order..."
                  value={specialInstructions}
                  onChange={(e) => onSpecialInstructionsChange(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex justify-between items-center py-2 border-t">
                <p className="font-medium">Total Calories:</p>
                <p>{totalCalories} cal</p>
              </div>

              <Button
                className="w-full"
                onClick={onSubmitOrder}
                disabled={selectedItems.length === 0 || isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Place Order"}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
