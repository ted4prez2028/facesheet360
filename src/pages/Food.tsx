
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFoodOrders } from '@/hooks/useFoodOrders';
import { useAuth } from '@/hooks/useAuth';

export function FoodPage() {
  const { user } = useAuth();
  const { menuItems, createOrder, isLoading } = useFoodOrders(user?.id);

  const handleOrder = (itemId: string) => {
    if (!user) return;
    createOrder.mutate({
      patient_id: user.id,
      items: [{ menu_item_id: itemId, quantity: 1 }]
    });
  };

  return (
    <div className="container mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Food Menu</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Loading...</p>
          ) : (
            menuItems.map(item => (
              <div key={item.id} className="flex justify-between items-center border-b py-2">
                <div>
                  <p className="font-medium">{item.name}</p>
                  {item.unit_price && (
                    <p className="text-sm text-muted-foreground">${item.unit_price.toFixed(2)}</p>
                  )}
                </div>
                <Button onClick={() => handleOrder(item.id)}>Order</Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default FoodPage;
