import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Package, Truck, ClipboardList, BarChart3, Bell } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import PrescriptionFillingTab from './PrescriptionFillingTab';
import MedicationAdministrationTab from './MedicationAdministrationTab';
import DeliveryTrackingTab from './DeliveryTrackingTab';
import InventoryManagementTab from './InventoryManagementTab';
import PredictiveInsightsTab from './PredictiveInsightsTab';

interface PharmacyStats {
  pendingFills: number;
  dueAdministrations: number;
  pendingDeliveries: number;
  lowStockItems: number;
  upcomingRefills: number;
}

export const ComprehensivePharmacyDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('filling');
  const [stats, setStats] = useState<PharmacyStats>({
    pendingFills: 0,
    dueAdministrations: 0,
    pendingDeliveries: 0,
    lowStockItems: 0,
    upcomingRefills: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [alerts, setAlerts] = useState<string[]>([]);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);

      // Load prescription fills needing attention
      const { data: pendingFills, error: fillsError } = await supabase
        .from('prescription_fills')
        .select('id')
        .in('status', ['filled', 'verified']);

      // Load due medication administrations (within next 2 hours)
      const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
      const { data: dueMAR, error: marError } = await supabase
        .from('medication_administration_records')
        .select('id')
        .lte('scheduled_time', twoHoursFromNow)
        .eq('status', 'given');

      // Load pending deliveries
      const { data: pendingDeliveries, error: deliveriesError } = await supabase
        .from('prescription_deliveries')
        .select('id')
        .in('status', ['pending', 'in_transit']);

      // Load low stock items
      const { data: inventory, error: inventoryError } = await supabase
        .from('pharmacy_inventory')
        .select('*');

      const lowStock = inventory?.filter(
        item => item.quantity <= item.reorder_threshold
      ) || [];

      // Load predictive analytics for upcoming refills
      const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const { data: refillProjections, error: refillsError } = await supabase
        .from('pharmacy_analytics')
        .select('*')
        .eq('metric_type', 'refill_pattern')
        .lte('projection_date', thirtyDaysFromNow.split('T')[0]);

      if (fillsError) console.error('Error loading fills:', fillsError);
      if (marError) console.error('Error loading MAR:', marError);
      if (deliveriesError) console.error('Error loading deliveries:', deliveriesError);
      if (inventoryError) console.error('Error loading inventory:', inventoryError);
      if (refillsError) console.error('Error loading refills:', refillsError);

      setStats({
        pendingFills: pendingFills?.length || 0,
        dueAdministrations: dueMAR?.length || 0,
        pendingDeliveries: pendingDeliveries?.length || 0,
        lowStockItems: lowStock.length,
        upcomingRefills: refillProjections?.length || 0
      });

      // Generate alerts
      const newAlerts: string[] = [];
      if (lowStock.length > 0) {
        newAlerts.push(`${lowStock.length} medication(s) below reorder threshold`);
      }
      if ((dueMAR?.length || 0) > 10) {
        newAlerts.push(`${dueMAR?.length} medications due in next 2 hours`);
      }
      if ((refillProjections?.length || 0) > 0) {
        newAlerts.push(`${refillProjections?.length} refills needed in next 30 days`);
      }
      setAlerts(newAlerts);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Comprehensive Pharmacy Management</h1>
          <p className="text-muted-foreground">End-to-end medication management and predictive analytics</p>
        </div>
      </div>

      {/* Alerts Bar */}
      {alerts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Bell className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100">Active Alerts</h3>
                <ul className="mt-2 space-y-1">
                  {alerts.map((alert, idx) => (
                    <li key={idx} className="text-sm text-amber-800 dark:text-amber-200">
                      • {alert}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Fills</p>
                <p className="text-3xl font-bold">{stats.pendingFills}</p>
              </div>
              <Package className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Due Soon</p>
                <p className="text-3xl font-bold">{stats.dueAdministrations}</p>
              </div>
              <ClipboardList className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-violet-50 to-violet-100 dark:from-violet-950 dark:to-violet-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Delivery</p>
                <p className="text-3xl font-bold">{stats.pendingDeliveries}</p>
              </div>
              <Truck className="h-8 w-8 text-violet-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-3xl font-bold">{stats.lowStockItems}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-950 dark:to-pink-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Refills Due</p>
                <p className="text-3xl font-bold">{stats.upcomingRefills}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-pink-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="filling">
            <Package className="h-4 w-4 mr-2" />
            Fill Prescriptions
          </TabsTrigger>
          <TabsTrigger value="administration">
            <ClipboardList className="h-4 w-4 mr-2" />
            Administer
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <Truck className="h-4 w-4 mr-2" />
            Delivery
          </TabsTrigger>
          <TabsTrigger value="inventory">
            <Package className="h-4 w-4 mr-2" />
            Inventory
          </TabsTrigger>
          <TabsTrigger value="insights">
            <BarChart3 className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filling">
          <PrescriptionFillingTab onUpdate={loadDashboardData} />
        </TabsContent>

        <TabsContent value="administration">
          <MedicationAdministrationTab onUpdate={loadDashboardData} />
        </TabsContent>

        <TabsContent value="delivery">
          <DeliveryTrackingTab onUpdate={loadDashboardData} />
        </TabsContent>

        <TabsContent value="inventory">
          <InventoryManagementTab onUpdate={loadDashboardData} lowStockCount={stats.lowStockItems} />
        </TabsContent>

        <TabsContent value="insights">
          <PredictiveInsightsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComprehensivePharmacyDashboard;
