// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Package, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

interface InventoryManagementTabProps {
  onUpdate: () => void;
  lowStockCount: number;
}

export const InventoryManagementTab: React.FC<InventoryManagementTabProps> = ({ onUpdate, lowStockCount }) => {
  const [inventory, setInventory] = useState<any[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [newItem, setNewItem] = useState({
    medication_name: '',
    ndc_code: '',
    quantity: '',
    unit: 'tablets',
    reorder_threshold: '50',
    reorder_quantity: '100',
    location: '',
    expiration_date: '',
    lot_number: '',
    cost_per_unit: ''
  });

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const { data, error } = await supabase
        .from('pharmacy_inventory')
        .select('*')
        .order('medication_name');

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error('Error loading inventory:', error);
      toast.error('Failed to load inventory');
    }
  };

  const handleAddItem = async () => {
    if (!newItem.medication_name || !newItem.quantity) {
      toast.error('Please fill required fields');
      return;
    }

    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('pharmacy_inventory')
        .insert({
          medication_name: newItem.medication_name,
          ndc_code: newItem.ndc_code || null,
          quantity: parseFloat(newItem.quantity),
          unit: newItem.unit,
          reorder_threshold: parseFloat(newItem.reorder_threshold),
          reorder_quantity: parseFloat(newItem.reorder_quantity),
          location: newItem.location || null,
          expiration_date: newItem.expiration_date || null,
          lot_number: newItem.lot_number || null,
          cost_per_unit: newItem.cost_per_unit ? parseFloat(newItem.cost_per_unit) : null,
          last_restocked_at: new Date().toISOString()
        });

      if (error) throw error;

      toast.success('Inventory item added');
      setIsAddDialogOpen(false);
      setNewItem({
        medication_name: '',
        ndc_code: '',
        quantity: '',
        unit: 'tablets',
        reorder_threshold: '50',
        reorder_quantity: '100',
        location: '',
        expiration_date: '',
        lot_number: '',
        cost_per_unit: ''
      });
      loadInventory();
      onUpdate();
    } catch (error) {
      console.error('Error adding item:', error);
      toast.error('Failed to add inventory item');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRestock = async (itemId: string, quantity: number) => {
    try {
      const item = inventory.find(i => i.id === itemId);
      if (!item) return;

      const { error } = await supabase
        .from('pharmacy_inventory')
        .update({
          quantity: item.quantity + quantity,
          last_restocked_at: new Date().toISOString()
        })
        .eq('id', itemId);

      if (error) throw error;

      toast.success(`Restocked ${quantity} ${item.unit}`);
      loadInventory();
      onUpdate();
    } catch (error) {
      console.error('Error restocking:', error);
      toast.error('Failed to restock');
    }
  };

  const isLowStock = (item: any) => item.quantity <= item.reorder_threshold;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Inventory Management</h3>
          {lowStockCount > 0 && (
            <p className="text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              {lowStockCount} item(s) need reordering
            </p>
          )}
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Medication Name *</Label>
                <Input
                  value={newItem.medication_name}
                  onChange={(e) => setNewItem({ ...newItem, medication_name: e.target.value })}
                  placeholder="e.g., Acetaminophen"
                />
              </div>
              <div>
                <Label>NDC Code</Label>
                <Input
                  value={newItem.ndc_code}
                  onChange={(e) => setNewItem({ ...newItem, ndc_code: e.target.value })}
                  placeholder="e.g., 12345-678-90"
                />
              </div>
              <div>
                <Label>Quantity *</Label>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
                  placeholder="e.g., 100"
                />
              </div>
              <div>
                <Label>Unit</Label>
                <Input
                  value={newItem.unit}
                  onChange={(e) => setNewItem({ ...newItem, unit: e.target.value })}
                  placeholder="e.g., tablets, vials, ml"
                />
              </div>
              <div>
                <Label>Reorder Threshold</Label>
                <Input
                  type="number"
                  value={newItem.reorder_threshold}
                  onChange={(e) => setNewItem({ ...newItem, reorder_threshold: e.target.value })}
                />
              </div>
              <div>
                <Label>Reorder Quantity</Label>
                <Input
                  type="number"
                  value={newItem.reorder_quantity}
                  onChange={(e) => setNewItem({ ...newItem, reorder_quantity: e.target.value })}
                />
              </div>
              <div>
                <Label>Pixis Location</Label>
                <Input
                  value={newItem.location}
                  onChange={(e) => setNewItem({ ...newItem, location: e.target.value })}
                  placeholder="e.g., Pixis A, Drawer 3"
                />
              </div>
              <div>
                <Label>Lot Number</Label>
                <Input
                  value={newItem.lot_number}
                  onChange={(e) => setNewItem({ ...newItem, lot_number: e.target.value })}
                />
              </div>
              <div>
                <Label>Expiration Date</Label>
                <Input
                  type="date"
                  value={newItem.expiration_date}
                  onChange={(e) => setNewItem({ ...newItem, expiration_date: e.target.value })}
                />
              </div>
              <div>
                <Label>Cost Per Unit ($)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={newItem.cost_per_unit}
                  onChange={(e) => setNewItem({ ...newItem, cost_per_unit: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleAddItem} disabled={isLoading} className="w-full">
              {isLoading ? 'Adding...' : 'Add Item'}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {inventory.map((item) => (
          <Card key={item.id} className={isLowStock(item) ? 'border-amber-300 bg-amber-50 dark:bg-amber-950' : ''}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <CardTitle className="text-base">{item.medication_name}</CardTitle>
                {isLowStock(item) && (
                  <Badge variant="destructive" className="text-xs">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Low Stock
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold">{item.quantity}</span>
                <span className="text-sm text-muted-foreground">{item.unit}</span>
              </div>
              
              <div className="space-y-1 text-xs text-muted-foreground">
                {item.location && <p><Package className="h-3 w-3 inline mr-1" />{item.location}</p>}
                {item.ndc_code && <p>NDC: {item.ndc_code}</p>}
                {item.lot_number && <p>Lot: {item.lot_number}</p>}
                <p className="flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Reorder at: {item.reorder_threshold}
                </p>
              </div>

              {isLowStock(item) && (
                <Button
                  size="sm"
                  onClick={() => handleRestock(item.id, item.reorder_quantity)}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Restock {item.reorder_quantity} {item.unit}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {inventory.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No inventory items yet</p>
            <p className="text-sm">Click "Add Medication" to get started</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InventoryManagementTab;
