
import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { MenuItem, DietaryRestrictions } from '@/types/foodOrder';
import { useFoodOrders } from '@/hooks/useFoodOrders';
import { MenuCategory } from './MenuCategory';
import { OrderSummary } from './OrderSummary';
import { DietaryRestrictionsAlert } from './DietaryRestrictionsAlert';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface FoodOrderingSectionProps {
  patientId: string;
  roomNumber?: string;
  dietaryRestrictions?: DietaryRestrictions | null;
}

export function FoodOrderingSection({ 
  patientId, 
  roomNumber,
  dietaryRestrictions 
}: FoodOrderingSectionProps) {
  const [selectedItems, setSelectedItems] = useState<Array<{
    menuItem: MenuItem;
    quantity: number;
    notes?: string;
  }>>([]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const { menuItems, createOrder, isLoading } = useFoodOrders(patientId);

  // Group menu items by category
  const menuCategories = React.useMemo(() => {
    const categories = menuItems.reduce((acc, item) => {
      if (!acc[item.category]) {
        acc[item.category] = [];
      }
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, MenuItem[]>);

    return Object.entries(categories).sort(([a], [b]) => a.localeCompare(b));
  }, [menuItems]);

  const handleAddItem = (menuItem: MenuItem) => {
    setSelectedItems(prev => [...prev, { menuItem, quantity: 1 }]);
    toast.success(`Added ${menuItem.name} to order`);
  };

  const handleUpdateQuantity = (index: number, quantity: number) => {
    if (quantity < 1) return;
    setSelectedItems(prev => 
      prev.map((item, i) => i === index ? { ...item, quantity } : item)
    );
  };

  const handleUpdateNotes = (index: number, notes: string) => {
    setSelectedItems(prev =>
      prev.map((item, i) => i === index ? { ...item, notes } : item)
    );
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(prev => prev.filter((_, i) => i !== index));
    toast.success("Item removed from order");
  };

  const handleSubmitOrder = async () => {
    try {
      await createOrder.mutateAsync({
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

      setSelectedItems([]);
      setSpecialInstructions('');
      toast.success("Order submitted successfully");
    } catch (error) {
      toast.error("Failed to submit order");
      console.error('Order submission error:', error);
    }
  };

  return (
    <div className="space-y-6">
      <DietaryRestrictionsAlert
        restrictions={dietaryRestrictions}
        selectedItems={selectedItems}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Tabs defaultValue={menuCategories[0]?.[0] || ''}>
            <TabsList className="w-full h-auto flex-wrap">
              {menuCategories.map(([category]) => (
                <TabsTrigger key={category} value={category} className="flex-grow">
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>

            {menuCategories.map(([category, items]) => (
              <TabsContent key={category} value={category}>
                <MenuCategory
                  category={category}
                  items={items}
                  onAddItem={handleAddItem}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>

        <OrderSummary
          selectedItems={selectedItems}
          onUpdateQuantity={handleUpdateQuantity}
          onUpdateNotes={handleUpdateNotes}
          onRemoveItem={handleRemoveItem}
          onSubmitOrder={handleSubmitOrder}
          isSubmitting={createOrder.isPending}
          specialInstructions={specialInstructions}
          onSpecialInstructionsChange={setSpecialInstructions}
        />
      </div>
    </div>
  );
}
