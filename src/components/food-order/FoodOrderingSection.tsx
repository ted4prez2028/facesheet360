
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useState } from 'react';
import { MenuItem } from '@/types/foodOrder';
import { useFoodOrders } from '@/hooks/useFoodOrders';

interface FoodOrderingSectionProps {
  patientId: string;
  roomNumber?: string;
}

export function FoodOrderingSection({ patientId, roomNumber }: FoodOrderingSectionProps) {
  const { menuItems, createOrder, isLoading } = useFoodOrders(patientId);
  const [selectedItems, setSelectedItems] = useState<{ menuItem: MenuItem; quantity: number; notes?: string }[]>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');

  const handleAddItem = (menuItem: MenuItem) => {
    setSelectedItems(prev => [...prev, { menuItem, quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    setSelectedItems(prev => 
      prev.map((item, i) => 
        i === index ? { ...item, quantity } : item
      )
    );
  };

  const handleSubmitOrder = () => {
    createOrder.mutate({
      patient_id: patientId,
      items: selectedItems.map(item => ({
        menu_item_id: item.menuItem.id,
        quantity: item.quantity,
        notes: item.notes
      })),
      special_instructions: specialInstructions,
      room_number: roomNumber,
      delivery_time: new Date().toISOString()
    });
  };

  if (isLoading) {
    return <div>Loading menu items...</div>;
  }

  const menuCategories = Array.from(new Set(menuItems.map(item => item.category)));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Place Food Order</CardTitle>
          <CardDescription>Select items from our menu to place an order</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Menu</h3>
              <ScrollArea className="h-[400px] rounded-md border p-4">
                {menuCategories.map(category => (
                  <div key={category} className="mb-6">
                    <h4 className="font-medium text-lg mb-2">{category}</h4>
                    <div className="space-y-2">
                      {menuItems
                        .filter(item => item.category === category)
                        .map(item => (
                          <div key={item.id} className="flex items-center justify-between p-2 hover:bg-accent rounded-lg">
                            <div>
                              <p className="font-medium">{item.name}</p>
                              {item.description && (
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              )}
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAddItem(item)}
                            >
                              Add
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Selected Items</h3>
              <div className="space-y-4">
                {selectedItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 p-2 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.menuItem.name}</p>
                    </div>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleUpdateQuantity(index, parseInt(e.target.value))}
                      className="w-20"
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveItem(index)}
                    >
                      Remove
                    </Button>
                  </div>
                ))}

                <div className="space-y-2">
                  <Label htmlFor="special-instructions">Special Instructions</Label>
                  <Textarea
                    id="special-instructions"
                    placeholder="Enter any special instructions..."
                    value={specialInstructions}
                    onChange={(e) => setSpecialInstructions(e.target.value)}
                  />
                </div>

                <Button
                  className="w-full"
                  onClick={handleSubmitOrder}
                  disabled={selectedItems.length === 0 || createOrder.isPending}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
