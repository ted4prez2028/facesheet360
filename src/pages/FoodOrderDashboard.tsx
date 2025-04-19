
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter, Clock, CheckCircle, X } from 'lucide-react';
import { FoodOrder } from '@/types/foodOrder';
import { Patient } from '@/types';
import { toast } from 'sonner';

const FoodOrderDashboard = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['food-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('food_orders')
        .select(`
          *,
          patients:patient_id (id, first_name, last_name)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data as FoodOrder[];
    }
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      (order.patients && 
       `${order.patients.first_name} ${order.patients.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.room_number && 
       order.room_number.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const pendingOrders = filteredOrders.filter(o => ['pending', 'approved'].includes(o.status));
  const activeOrders = filteredOrders.filter(o => ['preparing', 'delivering'].includes(o.status));
  const completedOrders = filteredOrders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('food_orders')
        .update({ status })
        .eq('id', orderId);
      
      if (error) throw error;
      
      toast.success(`Order ${status}`);
      refetch();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-blue-100 text-blue-800',
      'preparing': 'bg-purple-100 text-purple-800',
      'delivering': 'bg-indigo-100 text-indigo-800',
      'delivered': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={`${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const renderOrderCard = (order: FoodOrder) => {
    return (
      <Card key={order.id} className="mb-4">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-lg">
                {order.patients ? 
                  `${order.patients.first_name} ${order.patients.last_name}` : 
                  "Unknown Patient"}
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Room: {order.room_number || 'N/A'}
              </p>
            </div>
            {getStatusBadge(order.status)}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              <p><span className="font-medium">Ordered:</span> {new Date(order.created_at).toLocaleString()}</p>
              {order.delivery_time && (
                <p><span className="font-medium">Delivery time:</span> {new Date(order.delivery_time).toLocaleString()}</p>
              )}
            </div>
            <div className="flex gap-2">
              {order.status === 'pending' && (
                <>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="text-green-600"
                    onClick={() => updateOrderStatus(order.id, 'approved')}
                  >
                    <CheckCircle className="mr-1 h-4 w-4" />
                    Approve
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    className="text-red-600"
                    onClick={() => updateOrderStatus(order.id, 'cancelled')}
                  >
                    <X className="mr-1 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              )}
              {order.status === 'approved' && (
                <Button 
                  size="sm" 
                  onClick={() => updateOrderStatus(order.id, 'preparing')}
                >
                  Start Preparing
                </Button>
              )}
              {order.status === 'preparing' && (
                <Button 
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, 'delivering')}
                >
                  Start Delivery
                </Button>
              )}
              {order.status === 'delivering' && (
                <Button 
                  size="sm"
                  onClick={() => updateOrderStatus(order.id, 'delivered')}
                >
                  Mark Delivered
                </Button>
              )}
            </div>
          </div>
          {order.special_instructions && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-1">Special Instructions:</h4>
              <p className="text-sm bg-gray-50 p-2 rounded">{order.special_instructions}</p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center py-8">
          <div className="animate-pulse text-gray-500">Loading orders...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Food Order Dashboard</h1>
            <p className="text-gray-600">Manage patient food orders</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0 w-full md:w-auto">
            <div className="relative flex items-center w-full md:w-auto">
              <Search className="absolute left-3 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by patient or room..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full md:w-64"
              />
            </div>
            <Select value={statusFilter || ''} onValueChange={(value) => setStatusFilter(value || null)}>
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="preparing">Preparing</SelectItem>
                <SelectItem value="delivering">Delivering</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Orders awaiting action</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeOrders.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Orders in progress</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Delivered Today</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {completedOrders.filter(o => 
                  new Date(o.created_at).toDateString() === new Date().toDateString() && 
                  o.status === 'delivered'
                ).length}
              </div>
              <p className="text-xs text-muted-foreground mt-1">Orders delivered today</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="pending">
              Pending ({pendingOrders.length})
            </TabsTrigger>
            <TabsTrigger value="active">
              In Progress ({activeOrders.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedOrders.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {pendingOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <p className="text-gray-500 mb-2">No pending orders</p>
                  <p className="text-sm text-gray-400">New orders will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {pendingOrders.map(order => renderOrderCard(order))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="active">
            {activeOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <p className="text-gray-500 mb-2">No orders in progress</p>
                  <p className="text-sm text-gray-400">Active orders will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {activeOrders.map(order => renderOrderCard(order))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="completed">
            {completedOrders.length === 0 ? (
              <Card>
                <CardContent className="py-12 flex flex-col items-center justify-center text-center">
                  <p className="text-gray-500 mb-2">No completed orders</p>
                  <p className="text-sm text-gray-400">Delivered and cancelled orders will appear here</p>
                </CardContent>
              </Card>
            ) : (
              <div>
                {completedOrders.map(order => renderOrderCard(order))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default FoodOrderDashboard;
