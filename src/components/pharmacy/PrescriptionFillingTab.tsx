// @ts-nocheck
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, CheckCircle, Package, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface PrescriptionFillingTabProps {
  onUpdate: () => void;
}

export const PrescriptionFillingTab: React.FC<PrescriptionFillingTabProps> = ({ onUpdate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [quantityToFill, setQuantityToFill] = useState('');
  const [selectedInventory, setSelectedInventory] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load medication orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('medication_orders')
        .select(`
          *,
          patient:patient_id (
            id,
            name,
            medical_record_number,
            room_number
          )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      // Load inventory
      const { data: inventoryData, error: inventoryError } = await supabase
        .from('pharmacy_inventory')
        .select('*')
        .order('medication_name');

      if (ordersError) throw ordersError;
      if (inventoryError) throw inventoryError;

      setOrders(ordersData || []);
      setInventory(inventoryData || []);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Failed to load prescription data');
    }
  };

  const handleFillPrescription = async () => {
    if (!selectedOrder || !quantityToFill || !selectedInventory || !user) {
      toast.error('Please fill all fields');
      return;
    }

    try {
      setIsLoading(true);

      const inventoryItem = inventory.find(i => i.id === selectedInventory);
      const quantity = parseFloat(quantityToFill);

      if (!inventoryItem || inventoryItem.quantity < quantity) {
        toast.error('Insufficient inventory');
        return;
      }

      // Create prescription fill record
      const { data: fillData, error: fillError } = await supabase
        .from('prescription_fills')
        .insert({
          medication_order_id: selectedOrder.id,
          patient_id: selectedOrder.patient_id,
          medication_name: selectedOrder.medication_name,
          filled_by: user.id,
          quantity_filled: quantity,
          inventory_id: selectedInventory,
          status: 'filled',
          notes: `Filled ${quantity} ${inventoryItem.unit}`
        })
        .select()
        .single();

      if (fillError) throw fillError;

      // Update inventory
      const { error: inventoryError } = await supabase
        .from('pharmacy_inventory')
        .update({ 
          quantity: inventoryItem.quantity - quantity,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedInventory);

      if (inventoryError) throw inventoryError;

      // Check if inventory is now low
      if ((inventoryItem.quantity - quantity) <= inventoryItem.reorder_threshold) {
        toast.warning(`${inventoryItem.medication_name} is now below reorder threshold!`);
      }

      toast.success('Prescription filled successfully');
      setSelectedOrder(null);
      setQuantityToFill('');
      setSelectedInventory('');
      loadData();
      onUpdate();
    } catch (error) {
      console.error('Error filling prescription:', error);
      toast.error('Failed to fill prescription');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(order =>
    order.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.patient?.medical_record_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search by medication, patient name, or MRN..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Pending Orders</h3>
          {filteredOrders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                No pending orders
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order) => (
              <Card
                key={order.id}
                className={`cursor-pointer transition-colors ${
                  selectedOrder?.id === order.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => {
                  setSelectedOrder(order);
                  // Auto-select matching inventory if available
                  const matchingInventory = inventory.find(
                    i => i.medication_name.toLowerCase() === order.medication_name.toLowerCase()
                  );
                  if (matchingInventory) {
                    setSelectedInventory(matchingInventory.id);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold">{order.medication_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        Patient: {order.patient?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        MRN: {order.patient?.medical_record_number} | Room: {order.patient?.room_number}
                      </p>
                      <div className="mt-2 space-y-1 text-sm">
                        <p><span className="font-medium">Dosage:</span> {order.dosage}</p>
                        <p><span className="font-medium">Frequency:</span> {order.frequency}</p>
                        <p><span className="font-medium">Route:</span> {order.route}</p>
                      </div>
                    </div>
                    <Badge variant="secondary">
                      <Package className="h-3 w-3 mr-1" />
                      {order.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Fill Form */}
        <Card>
          <CardHeader>
            <CardTitle>Fill Prescription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedOrder ? (
              <>
                <div>
                  <h4 className="font-semibold mb-2">{selectedOrder.medication_name}</h4>
                  <p className="text-sm text-muted-foreground">
                    For: {selectedOrder.patient?.name}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Select Inventory Source</label>
                  <Select value={selectedInventory} onValueChange={setSelectedInventory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select inventory item" />
                    </SelectTrigger>
                    <SelectContent>
                      {inventory
                        .filter(item => 
                          item.medication_name.toLowerCase().includes(
                            selectedOrder.medication_name.toLowerCase()
                          )
                        )
                        .map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.medication_name} ({item.quantity} {item.unit} available)
                            {item.location && ` - ${item.location}`}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Quantity to Fill</label>
                  <Input
                    type="number"
                    value={quantityToFill}
                    onChange={(e) => setQuantityToFill(e.target.value)}
                    placeholder="Enter quantity"
                    min="1"
                  />
                </div>

                <Button
                  onClick={handleFillPrescription}
                  disabled={isLoading || !selectedInventory || !quantityToFill}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {isLoading ? 'Filling...' : 'Fill Prescription'}
                </Button>
              </>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Select an order to fill</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrescriptionFillingTab;
