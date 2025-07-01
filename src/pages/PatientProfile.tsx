import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { CalendarIcon, CaretSortIcon, ChevronDown, DotsHorizontalIcon, EyeNoneIcon, FileTextIcon, FilterIcon, HomeIcon, PlusCircle, PlusIcon, RefreshCwIcon, SearchIcon, Share2Icon, StarIcon, Trash2Icon, UserIcon, UsersIcon } from 'lucide-react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { toast } from 'sonner';
import { getPatientById } from '@/lib/api/patientApi';
import { Patient } from '@/types';
import PrescriptionList from '@/components/pharmacy/PrescriptionList';

export default function PatientProfile() {
  const router = useRouter();
  const { patientId } = router.query;
  const [patient, setPatient] = useState<Patient | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);

  useEffect(() => {
    const fetchPatient = async () => {
      if (!patientId) return;
      
      setIsLoading(true);
      try {
        const patientData = await getPatientById(patientId as string);
        if (patientData) {
          setPatient(patientData);
        } else {
          setError(new Error('Patient not found'));
        }
      } catch (err) {
        console.error('Error fetching patient:', err);
        setError(new Error(err instanceof Error ? err.message : 'Failed to fetch patient'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchPatient();
  }, [patientId]);

  if (isLoading) {
    return <div className="text-center p-6">Loading patient data...</div>;
  }

  if (error) {
    return <div className="text-center p-6 text-red-500">Error: {error.message}</div>;
  }

  if (!patient) {
    return <div>Patient not found</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">{patient.first_name} {patient.last_name}</h1>
          <p className="text-gray-500">Medical Record Number: {patient.medical_record_number}</p>
        </div>
        <div>
          <Button variant="outline">Edit Profile</Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
          <TabsTrigger value="vitals">Vital Signs</TabsTrigger>
          <TabsTrigger value="history">Medical History</TabsTrigger>
          <TabsTrigger value="care-plan">Care Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600">Date of Birth</p>
                  <p className="font-medium">{patient.date_of_birth}</p>
                </div>
                <div>
                  <p className="text-gray-600">Gender</p>
                  <p className="font-medium">{patient.gender}</p>
                </div>
                <div>
                  <p className="text-gray-600">Contact Number</p>
                  <p className="font-medium">{patient.phone}</p>
                </div>
                <div>
                  <p className="text-gray-600">Address</p>
                  <p className="font-medium">{patient.address}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <p>No appointments scheduled.</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prescriptions</CardTitle>
            </CardHeader>
            <CardContent>
              <PrescriptionList 
                patient_id={patient.id}
                onAddNew={() => setShowPrescriptionForm(true)} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vitals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-sm text-gray-600">Temperature</div>
                  <div className="text-xl font-semibold">98.6°F</div>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="text-sm text-gray-600">Blood Pressure</div>
                  <div className="text-xl font-semibold">120/80</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-sm text-gray-600">Heart Rate</div>
                  <div className="text-xl font-semibold">72 bpm</div>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="text-sm text-gray-600">O2 Saturation</div>
                  <div className="text-xl font-semibold">98%</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {patient.medical_history ? (
                  <p className="text-gray-700">{patient.medical_history}</p>
                ) : (
                  <p className="text-gray-500 italic">No medical history available</p>
                )}
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">Allergies</h4>
                {patient.allergies ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.allergies.split(',').map((allergy, index) => (
                      <Badge key={index} variant="outline" className="bg-red-50">
                        {allergy.trim()}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No known allergies</p>
                )}
              </div>

              <div className="mt-6">
                <h4 className="font-medium mb-2">Current Medications</h4>
                {patient.medications ? (
                  <div className="space-y-2">
                    {patient.medications.split(',').map((medication, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded">
                        {medication.trim()}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No current medications</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={showPrescriptionForm} onOpenChange={setShowPrescriptionForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Prescription</DialogTitle>
            <DialogDescription>
              Create a new prescription for the patient.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Medication Name
              </Label>
              <Input id="name" defaultValue="" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dosage" className="text-right">
                Dosage
              </Label>
              <Input id="dosage" defaultValue="" className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
