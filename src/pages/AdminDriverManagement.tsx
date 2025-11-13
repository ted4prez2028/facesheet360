import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  CheckCircle, XCircle, Star, TrendingUp, DollarSign,
  Search, Eye, Ban, UserCheck 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';

interface Driver {
  id: string;
  driver_name: string;
  driver_email: string;
  vehicle_type: string;
  vehicle_make: string;
  vehicle_model: string;
  license_plate: string;
  status: string;
  verification_status: string;
  average_rating: number;
  total_ratings: number;
  total_rides: number;
  total_earnings: number;
  completed_rides: number;
  cancelled_rides: number;
  avg_earnings_per_ride: number;
  last_ride_date: string;
}

export default function AdminDriverManagement() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [verificationAction, setVerificationAction] = useState<'approve' | 'reject' | 'suspend' | null>(null);
  const [verificationNotes, setVerificationNotes] = useState('');

  // Fetch all drivers with performance data
  const { data: drivers = [], isLoading } = useQuery({
    queryKey: ['admin-drivers', statusFilter, verificationFilter],
    queryFn: async () => {
      let query = supabase
        .from('driver_performance')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }
      if (verificationFilter !== 'all') {
        query = query.eq('verification_status', verificationFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Driver[];
    },
    refetchInterval: 10000,
  });

  // Update driver verification status
  const updateVerification = useMutation({
    mutationFn: async ({ 
      driverId, 
      status, 
      notes 
    }: { 
      driverId: string; 
      status: string; 
      notes: string;
    }) => {
      const updateData: any = {
        verification_status: status,
        verification_notes: notes,
        updated_at: new Date().toISOString()
      };

      if (status === 'approved') {
        updateData.is_verified = true;
        updateData.verified_at = new Date().toISOString();
        updateData.verified_by = user?.id;
      }

      const { error } = await supabase
        .from('drivers')
        .update(updateData)
        .eq('id', driverId);

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });
      setSelectedDriver(null);
      setVerificationAction(null);
      setVerificationNotes('');
      
      const messages = {
        approved: 'Driver approved successfully',
        rejected: 'Driver application rejected',
        suspended: 'Driver suspended'
      };
      
      toast.success(messages[variables.status as keyof typeof messages]);
    },
    onError: (error: Error) => {
      toast.error(`Failed to update driver: ${error.message}`);
    }
  });

  const filteredDrivers = drivers.filter(driver => {
    const matchesSearch = driver.driver_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.driver_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         driver.license_plate?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const getVerificationBadge = (status: string) => {
    const variants: Record<string, { color: string; label: string }> = {
      pending: { color: 'bg-yellow-500', label: 'Pending' },
      approved: { color: 'bg-green-500', label: 'Approved' },
      rejected: { color: 'bg-red-500', label: 'Rejected' },
      suspended: { color: 'bg-gray-500', label: 'Suspended' }
    };
    
    const config = variants[status] || variants.pending;
    return <Badge className={`${config.color} text-white`}>{config.label}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      online: 'bg-green-500',
      offline: 'bg-gray-500',
      busy: 'bg-orange-500'
    };
    
    return <Badge className={`${variants[status] || 'bg-gray-500'} text-white`}>{status}</Badge>;
  };

  const handleVerificationAction = (driver: Driver, action: 'approve' | 'reject' | 'suspend') => {
    setSelectedDriver(driver);
    setVerificationAction(action);
  };

  const confirmVerificationAction = () => {
    if (!selectedDriver || !verificationAction) return;
    
    updateVerification.mutate({
      driverId: selectedDriver.id,
      status: verificationAction === 'approve' ? 'approved' : 
              verificationAction === 'reject' ? 'rejected' : 'suspended',
      notes: verificationNotes
    });
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Driver Management</h1>
        <p className="text-muted-foreground">Manage driver verification, approval, and performance</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{drivers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {drivers.filter(d => d.verification_status === 'pending').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {drivers.filter(d => d.status === 'online' && d.verification_status === 'approved').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              {drivers.length > 0 
                ? (drivers.reduce((sum, d) => sum + d.average_rating, 0) / drivers.length).toFixed(2)
                : '5.00'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="online">Online</SelectItem>
                <SelectItem value="offline">Offline</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={verificationFilter} onValueChange={setVerificationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Verification" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Verification</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <Card>
        <CardHeader>
          <CardTitle>Drivers</CardTitle>
          <CardDescription>Manage driver accounts and performance</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Loading drivers...</div>
          ) : filteredDrivers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No drivers found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Driver</TableHead>
                  <TableHead>Vehicle</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Verification</TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Rides</TableHead>
                  <TableHead>Earnings</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDrivers.map((driver) => (
                  <TableRow key={driver.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{driver.driver_name || 'N/A'}</div>
                        <div className="text-sm text-muted-foreground">{driver.driver_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{driver.vehicle_make} {driver.vehicle_model}</div>
                        <div className="text-sm text-muted-foreground">{driver.license_plate}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(driver.status)}</TableCell>
                    <TableCell>{getVerificationBadge(driver.verification_status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        <span>{driver.average_rating?.toFixed(1) || '5.0'}</span>
                        <span className="text-sm text-muted-foreground">({driver.total_ratings || 0})</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{driver.total_rides || 0} total</div>
                        <div className="text-muted-foreground">{driver.completed_rides || 0} completed</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{driver.total_earnings?.toFixed(2) || '0.00'} CC</div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {driver.verification_status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerificationAction(driver, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleVerificationAction(driver, 'reject')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        {driver.verification_status === 'approved' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleVerificationAction(driver, 'suspend')}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={!!verificationAction} onOpenChange={() => {
        setVerificationAction(null);
        setSelectedDriver(null);
        setVerificationNotes('');
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {verificationAction === 'approve' && 'Approve Driver'}
              {verificationAction === 'reject' && 'Reject Driver'}
              {verificationAction === 'suspend' && 'Suspend Driver'}
            </DialogTitle>
            <DialogDescription>
              {selectedDriver && `${selectedDriver.driver_name} - ${selectedDriver.driver_email}`}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Add notes about this action..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setVerificationAction(null);
              setSelectedDriver(null);
              setVerificationNotes('');
            }}>
              Cancel
            </Button>
            <Button 
              onClick={confirmVerificationAction}
              disabled={updateVerification.isPending}
            >
              {updateVerification.isPending ? 'Processing...' : 'Confirm'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
