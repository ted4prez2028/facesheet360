// @ts-nocheck - Uses pharmacy tables not yet created
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Truck, CheckCircle, Clock, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { format } from 'date-fns';

interface DeliveryTrackingTabProps {
  onUpdate: () => void;
}

export const DeliveryTrackingTab: React.FC<DeliveryTrackingTabProps> = ({ onUpdate }) => {
  const { user } = useAuth();
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      const { data, error } = await supabase
        .from('prescription_deliveries')
        .select(`
          *,
          prescription_fill:prescription_fill_id (
            medication_name,
            quantity_filled
          ),
          patient:patient_id (
            name,
            room_number
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDeliveries(data || []);
    } catch (error) {
      console.error('Error loading deliveries:', error);
      toast.error('Failed to load deliveries');
    }
  };

  const updateDeliveryStatus = async (deliveryId: string, status: string) => {
    try {
      setIsLoading(true);
      const updates: any = { status };

      if (status === 'in_transit') {
        updates.assigned_to = user?.id;
      } else if (status === 'delivered') {
        updates.actual_delivery_time = new Date().toISOString();
        updates.delivered_by = user?.id;
        updates.signature_obtained = true;
      }

      const { error } = await supabase
        .from('prescription_deliveries')
        .update(updates)
        .eq('id', deliveryId);

      if (error) throw error;

      toast.success(`Delivery ${status}`);
      loadDeliveries();
      onUpdate();
    } catch (error) {
      console.error('Error updating delivery:', error);
      toast.error('Failed to update delivery');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'in_transit': return <Truck className="h-4 w-4" />;
      case 'delivered': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <XCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Delivery Queue</h3>
      
      {deliveries.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center text-muted-foreground">
            No deliveries pending
          </CardContent>
        </Card>
      ) : (
        deliveries.map((delivery) => (
          <Card key={delivery.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">
                      {delivery.prescription_fill?.medication_name}
                    </h4>
                    <Badge className={getStatusColor(delivery.status)}>
                      {getStatusIcon(delivery.status)}
                      <span className="ml-1">{delivery.status}</span>
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <p>
                      <span className="font-medium">Patient:</span> {delivery.patient?.name}
                    </p>
                    <p>
                      <span className="font-medium">Room:</span> {delivery.room_number || delivery.patient?.room_number}
                    </p>
                    <p>
                      <span className="font-medium">Quantity:</span> {delivery.prescription_fill?.quantity_filled}
                    </p>
                    <p>
                      <span className="font-medium">Method:</span> {delivery.delivery_method}
                    </p>
                    {delivery.scheduled_delivery_time && (
                      <p>
                        <span className="font-medium">Scheduled:</span>{' '}
                        {format(new Date(delivery.scheduled_delivery_time), 'MMM d, h:mm a')}
                      </p>
                    )}
                    {delivery.actual_delivery_time && (
                      <p>
                        <span className="font-medium">Delivered:</span>{' '}
                        {format(new Date(delivery.actual_delivery_time), 'MMM d, h:mm a')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  {delivery.status === 'pending' && (
                    <Button
                      size="sm"
                      onClick={() => updateDeliveryStatus(delivery.id, 'in_transit')}
                      disabled={isLoading}
                    >
                      <Truck className="h-4 w-4 mr-1" />
                      Start Delivery
                    </Button>
                  )}
                  {delivery.status === 'in_transit' && (
                    <>
                      <Button
                        size="sm"
                        onClick={() => updateDeliveryStatus(delivery.id, 'delivered')}
                        disabled={isLoading}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Delivered
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateDeliveryStatus(delivery.id, 'failed')}
                        disabled={isLoading}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Failed
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};

export default DeliveryTrackingTab;
