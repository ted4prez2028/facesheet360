import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Pill, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  User,
  Calendar,
  Plus,
  Package
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


interface MedicationOrder {
  id: string;
  patient_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  route?: string;
  start_date: string;
  end_date?: string;
  status: string;
  instructions?: string;
  prescribed_by: string;
  patient?: {
    first_name: string;
    last_name: string;
    medical_record_number: string;
  };
}

interface Patient {
  id: string;
  first_name: string;
  last_name: string;
  medical_record_number: string;
  date_of_birth: string;
}

export const EnhancedPharmacyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pending');
  const [medicationOrders, setMedicationOrders] = useState<MedicationOrder[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState('');
  
  const [newOrder, setNewOrder] = useState({
    patient_id: '',
    medication_name: '',
    dosage: '',
    frequency: '',
    route: 'oral',
    instructions: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // Load medication orders with patient information
      const { data: ordersData, error: ordersError } = await supabase
        .from('medication_orders')
        .select(`
          *,
          patients:patient_id (
            first_name,
            last_name,
            medical_record_number
          )
        `)
        .order('created_at', { ascending: false });

      // Load patients
      const { data: patientsData, error: patientsError } = await supabase
        .from('patients')
        .select('id, first_name, last_name, medical_record_number, date_of_birth')
        .order('last_name');

      if (ordersError) throw ordersError;
      if (patientsError) throw patientsError;

      setMedicationOrders(ordersData || []);
      setPatients(patientsData || []);
    } catch (error) {
      console.error('Error loading pharmacy data:', error);
      toast.error('Failed to load pharmacy data');
    } finally {
      setIsLoading(false);
    }
  };

  const createMedicationOrder = async () => {
    if (!user || !newOrder.patient_id || !newOrder.medication_name) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const orderData = {
        patient_id: newOrder.patient_id,
        prescribed_by: user.id,
        medication_name: newOrder.medication_name,
        dosage: newOrder.dosage,
        frequency: newOrder.frequency,
        route: newOrder.route,
        instructions: newOrder.instructions,
        start_date: new Date().toISOString().split('T')[0],
        status: 'active'
      };

      const { error } = await supabase
        .from('medication_orders')
        .insert(orderData);

      if (error) throw error;

      toast.success('Medication order created successfully');
      setNewOrder({
        patient_id: '',
        medication_name: '',
        dosage: '',
        frequency: '',
        route: 'oral',
        instructions: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating medication order:', error);
      toast.error('Failed to create medication order');
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('medication_orders')
        .update({ 
          status: newStatus,
          ...(newStatus === 'administered' && { administered_at: new Date().toISOString() })
        })
        .eq('id', orderId);

      if (error) throw error;

      toast.success(`Medication ${newStatus} successfully`);
      loadData();
    } catch (error) {
      console.error('Error updating medication status:', error);
      toast.error('Failed to update medication status');
    }
  };

  const filteredOrders = medicationOrders.filter(order => {
    const matchesSearch = order.medication_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patient?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patient?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.patient?.medical_record_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'pending' && order.status === 'active') ||
      (activeTab === 'administered' && order.status === 'administered') ||
      (activeTab === 'discontinued' && order.status === 'discontinued');
    
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-yellow-100 text-yellow-800';
      case 'administered': return 'bg-green-100 text-green-800';
      case 'discontinued': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4" />;
      case 'administered': return <CheckCircle className="h-4 w-4" />;
      case 'discontinued': return <AlertTriangle className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-600">Manage medication orders and pharmacy operations</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Package className="h-4 w-4 mr-2" />
            Inventory
          </Button>
        </div>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Clock className="h-8 w-8 text-yellow-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Pending Orders</p>
                  <p className="text-2xl font-bold">{medicationOrders.filter(o => o.status === 'active').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Administered Today</p>
                  <p className="text-2xl font-bold">{medicationOrders.filter(o => o.status === 'administered').length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Pill className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{medicationOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <User className="h-8 w-8 text-purple-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Active Patients</p>
                  <p className="text-2xl font-bold">{new Set(medicationOrders.filter(o => o.status === 'active').map(o => o.patient_id)).size}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search medications, patients, or MRN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="administered">Administered</SelectItem>
              <SelectItem value="discontinued">Discontinued</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="pending">Pending Orders</TabsTrigger>
            <TabsTrigger value="administered">Administered</TabsTrigger>
            <TabsTrigger value="discontinued">Discontinued</TabsTrigger>
            <TabsTrigger value="new-order">New Order</TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading orders...</div>
            ) : filteredOrders.length > 0 ? (
              filteredOrders.map((order) => (
                <Card key={order.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">{order.medication_name}</h3>
                          <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Patient:</span>
                            <div>{order.patient?.first_name} {order.patient?.last_name}</div>
                            <div className="text-xs">MRN: {order.patient?.medical_record_number}</div>
                          </div>
                          <div>
                            <span className="font-medium">Dosage:</span>
                            <div>{order.dosage}</div>
                          </div>
                          <div>
                            <span className="font-medium">Frequency:</span>
                            <div>{order.frequency}</div>
                          </div>
                          <div>
                            <span className="font-medium">Route:</span>
                            <div>{order.route}</div>
                          </div>
                        </div>
                        
                        {order.instructions && (
                          <div className="mt-2 text-sm text-gray-600">
                            <span className="font-medium">Instructions:</span> {order.instructions}
                          </div>
                        )}
                        
                        <div className="mt-2 text-xs text-gray-500">
                          Started: {new Date(order.start_date).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="flex space-x-2 ml-4">
                        {order.status === 'active' && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => updateOrderStatus(order.id, 'administered')}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Administer
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => updateOrderStatus(order.id, 'discontinued')}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Discontinue
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No pending orders found
              </div>
            )}
          </TabsContent>

          <TabsContent value="administered" className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.medication_name}</h3>
                      <p className="text-gray-600">Patient: {order.patient?.first_name} {order.patient?.last_name}</p>
                      <p className="text-sm text-gray-500">Administered on: {new Date(order.start_date).toLocaleDateString()}</p>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Administered</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="discontinued" className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{order.medication_name}</h3>
                      <p className="text-gray-600">Patient: {order.patient?.first_name} {order.patient?.last_name}</p>
                      <p className="text-sm text-gray-500">Discontinued on: {new Date(order.start_date).toLocaleDateString()}</p>
                    </div>
                    <Badge className="bg-red-100 text-red-800">Discontinued</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="new-order">
            <Card>
              <CardHeader>
                <CardTitle>Create New Medication Order</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Patient</label>
                  <Select value={newOrder.patient_id} onValueChange={(value) => setNewOrder({...newOrder, patient_id: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id}>
                          {patient.first_name} {patient.last_name} - MRN: {patient.medical_record_number}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Medication Name</label>
                    <Input
                      value={newOrder.medication_name}
                      onChange={(e) => setNewOrder({...newOrder, medication_name: e.target.value})}
                      placeholder="Lisinopril"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Dosage</label>
                    <Input
                      value={newOrder.dosage}
                      onChange={(e) => setNewOrder({...newOrder, dosage: e.target.value})}
                      placeholder="10mg"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Frequency</label>
                    <Input
                      value={newOrder.frequency}
                      onChange={(e) => setNewOrder({...newOrder, frequency: e.target.value})}
                      placeholder="Once daily"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Route</label>
                    <Select value={newOrder.route} onValueChange={(value) => setNewOrder({...newOrder, route: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oral">Oral</SelectItem>
                        <SelectItem value="IV">IV</SelectItem>
                        <SelectItem value="IM">IM</SelectItem>
                        <SelectItem value="topical">Topical</SelectItem>
                        <SelectItem value="sublingual">Sublingual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Instructions</label>
                  <Input
                    value={newOrder.instructions}
                    onChange={(e) => setNewOrder({...newOrder, instructions: e.target.value})}
                    placeholder="Take with food"
                  />
                </div>

                <Button onClick={createMedicationOrder} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Medication Order
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    );
};