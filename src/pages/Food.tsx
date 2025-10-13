
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useFoodOrders } from '@/hooks/useFoodOrders';
import { useAuth } from '@/hooks/useAuth';
import { Search, Plus, Clock, CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

export function FoodPage() {
  const { user } = useAuth();
  const { menuItems, orders, createOrder, isLoading } = useFoodOrders(user?.id);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [orderDialogOpen, setOrderDialogOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<{id: string, name: string, quantity: number}[]>([]);
  const [roomNumber, setRoomNumber] = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');

  const categories = ['all', ...Array.from(new Set(menuItems.map(item => item.category)))];

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory && item.is_available;
  });

  const handleAddToOrder = (itemId: string, itemName: string) => {
    const existing = selectedItems.find(i => i.id === itemId);
    if (existing) {
      setSelectedItems(selectedItems.map(i => 
        i.id === itemId ? {...i, quantity: i.quantity + 1} : i
      ));
    } else {
      setSelectedItems([...selectedItems, {id: itemId, name: itemName, quantity: 1}]);
    }
  };

  const handleSubmitOrder = () => {
    if (!user || selectedItems.length === 0) return;
    
    createOrder.mutate({
      patient_id: user.id,
      items: selectedItems.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity
      })),
      room_number: roomNumber,
      special_instructions: specialInstructions
    });
    
    setSelectedItems([]);
    setRoomNumber('');
    setSpecialInstructions('');
    setOrderDialogOpen(false);
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-destructive" />;
      default: return <Clock className="h-4 w-4 text-warning" />;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Food Ordering</h1>
          <p className="text-muted-foreground">Order meals for patients</p>
        </div>
        <Dialog open={orderDialogOpen} onOpenChange={setOrderDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Order
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Food Order</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Room Number</Label>
                <Input 
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g., 301B"
                />
              </div>
              
              <div>
                <Label>Special Instructions</Label>
                <Textarea 
                  value={specialInstructions}
                  onChange={(e) => setSpecialInstructions(e.target.value)}
                  placeholder="Allergies, dietary restrictions, etc."
                />
              </div>

              <div>
                <Label className="mb-2 block">Selected Items ({selectedItems.length})</Label>
                {selectedItems.map(item => (
                  <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded mb-2">
                    <span>{item.name}</span>
                    <Badge>{item.quantity}x</Badge>
                  </div>
                ))}
              </div>

              <Button onClick={handleSubmitOrder} className="w-full" disabled={selectedItems.length === 0}>
                Submit Order
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="menu" className="w-full">
        <TabsList>
          <TabsTrigger value="menu">Menu</TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="menu" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              className="border rounded-md px-4"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenuItems.map(item => (
              <Card key={item.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{item.name}</CardTitle>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                  {item.description && (
                    <CardDescription>{item.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  {item.dietary_info && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {item.dietary_info.vegan && <Badge variant="secondary" className="text-xs">Vegan</Badge>}
                      {item.dietary_info.vegetarian && <Badge variant="secondary" className="text-xs">Vegetarian</Badge>}
                      {item.dietary_info.gluten_free && <Badge variant="secondary" className="text-xs">Gluten-Free</Badge>}
                      {item.dietary_info.dairy_free && <Badge variant="secondary" className="text-xs">Dairy-Free</Badge>}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    {item.unit_price && (
                      <span className="font-semibold">${item.unit_price.toFixed(2)}</span>
                    )}
                    <Button 
                      size="sm" 
                      onClick={() => handleAddToOrder(item.id, item.name)}
                    >
                      Add to Order
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No orders yet</p>
              </CardContent>
            </Card>
          ) : (
            orders.map((order: any) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>Order #{order.id.slice(0, 8)}</CardTitle>
                      <CardDescription>
                        {format(new Date(order.created_at), 'PPp')}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(order.status)}
                      <Badge>{order.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {order.room_number && (
                    <p className="text-sm mb-2">Room: {order.room_number}</p>
                  )}
                  <div className="space-y-1">
                    {order.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span>{item.quantity}x Item</span>
                      </div>
                    ))}
                  </div>
                  {order.special_instructions && (
                    <p className="text-sm text-muted-foreground mt-3">
                      Note: {order.special_instructions}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default FoodPage;
