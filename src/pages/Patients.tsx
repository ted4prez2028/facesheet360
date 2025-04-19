import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Patient } from '@/types';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Edit, Trash2, Plus, Eye, Face } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "@radix-ui/react-icons"
import { addMonths, subMonths } from 'date-fns';
import { useAuth } from '@/context/AuthContext';
import { PatientToolbar } from '@/components/patients/PatientToolbar';

const Patients = () => {
  const [isAddPatientOpen, setIsAddPatientOpen] = useState(false);
  const [isFaceIdDialogOpen, setIsFaceIdDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: patients,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['patients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }
      return data as Patient[];
    },
  });

  const filteredPatients = patients
    ? patients.filter((patient) => {
        const searchStr = `${patient.first_name} ${patient.last_name} ${patient.email || ''} ${patient.phone || ''}`.toLowerCase();
        return searchStr.includes(searchQuery.toLowerCase());
      })
    : [];

  const { toast } = useToast();

  const patientSchema = z.object({
    firstName: z.string().min(2, {
      message: "First name must be at least 2 characters.",
    }),
    lastName: z.string().min(2, {
      message: "Last name must be at least 2 characters.",
    }),
    dateOfBirth: z.date({
      required_error: "A date of birth is required.",
    }),
    gender: z.string().min(1, {
      message: "Please select a gender.",
    }),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    medicalRecordNumber: z.string().optional(),
    insuranceProvider: z.string().optional(),
    policyNumber: z.string().optional(),
  })

  const form = useForm<z.infer<typeof patientSchema>>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: new Date(),
      gender: "",
      email: "",
      phone: "",
      address: "",
      medicalRecordNumber: "",
      insuranceProvider: "",
      policyNumber: "",
    },
  })

  const { mutate: addPatient, isLoading: isSubmitting } = useMutation({
    mutationFn: async (values: z.infer<typeof patientSchema>) => {
      const { firstName, lastName, dateOfBirth, gender, email, phone, address, medicalRecordNumber, insuranceProvider, policyNumber } = values;
      const { data, error } = await supabase
        .from('patients')
        .insert([
          {
            first_name: firstName,
            last_name: lastName,
            date_of_birth: dateOfBirth.toISOString(),
            gender: gender,
            email: email,
            phone: phone,
            address: address,
            medical_record_number: medicalRecordNumber,
            insurance_provider: insuranceProvider,
            policy_number: policyNumber,
          },
        ])
        .select();

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Patient added successfully!",
      })
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      setIsAddPatientOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Uh oh! Something went wrong.",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const { mutate: deletePatient, isLoading: isDeleting } = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('patients')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Patient deleted successfully!",
      })
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    },
    onError: (error: any) => {
      toast({
        title: "Uh oh! Something went wrong.",
        description: error.message,
        variant: "destructive",
      })
    },
  })

  const handleDeletePatient = (id: string) => {
    deletePatient(id);
  };

  const handleFaceId = () => {
    setIsFaceIdDialogOpen(false);
    navigate('/face-id');
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8">
        <PatientToolbar 
          filter={searchQuery}
          onFilterChange={setSearchQuery}
          onAddPatient={() => setIsAddPatientOpen(true)}
          onFaceId={() => setIsFaceIdDialogOpen(true)} 
          isAuthenticated={isAuthenticated}
        />

        <Table>
          <TableCaption>A list of your patients.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">First Name</TableHead>
              <TableHead>Last Name</TableHead>
              <TableHead>Gender</TableHead>
              <TableHead>Date of Birth</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Loading patients...
                </TableCell>
              </TableRow>
            )}
            {error && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  Error: {error.message}
                </TableCell>
              </TableRow>
            )}
            {!isLoading && filteredPatients.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No patients found.
                </TableCell>
              </TableRow>
            )}
            {filteredPatients.map((patient) => (
              <TableRow key={patient.id}>
                <TableCell className="font-medium">{patient.first_name}</TableCell>
                <TableCell>{patient.last_name}</TableCell>
                <TableCell>{patient.gender}</TableCell>
                <TableCell>{new Date(patient.date_of_birth).toLocaleDateString()}</TableCell>
                <TableCell>{patient.email}</TableCell>
                <TableCell>{patient.phone}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => navigate(`/patients/${patient.id}`)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" disabled={isDeleting} onClick={() => handleDeletePatient(patient.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <Dialog open={isAddPatientOpen} onOpenChange={setIsAddPatientOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Patient</DialogTitle>
              <DialogDescription>
                Add a new patient to the system.
              </DialogDescription>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(addPatient)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col space-y-3">
                      <FormLabel>Date of birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-[240px] pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            captionLayout="dropdown"
                            pagedNavigation
                            {...field}
                            className={cn("border-0 rounded-md")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                      <FormDescription>
                        Select your date of birth.
                      </FormDescription>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Gender</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="radio"
                            id="male"
                            value="male"
                            checked={field.value === "male"}
                            onChange={field.onChange}
                          />
                          <Label htmlFor="male">Male</Label>
                        </div>
                      </FormControl>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="radio"
                            id="female"
                            value="female"
                            checked={field.value === "female"}
                            onChange={field.onChange}
                          />
                          <Label htmlFor="female">Female</Label>
                        </div>
                      </FormControl>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="radio"
                            id="other"
                            value="other"
                            checked={field.value === "other"}
                            onChange={field.onChange}
                          />
                          <Label htmlFor="other">Other</Label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="johndoe@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="123-456-7890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Input placeholder="123 Main St" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="medicalRecordNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medical Record Number</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="insuranceProvider"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Insurance Provider</FormLabel>
                      <FormControl>
                        <Input placeholder="Blue Cross" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="policyNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Policy Number</FormLabel>
                      <FormControl>
                        <Input placeholder="123456789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Submitting..." : "Add Patient"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={isFaceIdDialogOpen} onOpenChange={setIsFaceIdDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Face ID</DialogTitle>
              <DialogDescription>
                Use Face ID to identify patients.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <Button onClick={handleFaceId}>
                Go to Face ID
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default Patients;
