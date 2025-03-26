import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import DashboardLayout from '@/components/layout/DashboardLayout';
import { usePatient } from '@/hooks/usePatient';
import { Skeleton } from '@/components/ui/skeleton';

export default function PatientProfile() {
  const { patientId } = useParams<{ patientId: string }>();
  const { patient, isLoading, error } = usePatient(patientId || "");
  const [date, setDate] = useState<Date | undefined>(new Date());

  useEffect(() => {
    if (error) {
      console.error("Error fetching patient:", error);
    }
  }, [error]);

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="container py-6 space-y-8">
          <Skeleton className="h-10 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-[100px]" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-[200px]" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>
                  <Skeleton className="h-6 w-[100px]" />
                </CardTitle>
                <CardDescription>
                  <Skeleton className="h-4 w-[200px]" />
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-24 w-full" />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>
                <Skeleton className="h-6 w-[100px]" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Skeleton className="h-40 w-full" />
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="container py-6 space-y-8">
          <div className="text-red-500">Error: {error.message}</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container py-6 space-y-8">
        <div>
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold tracking-tight">{patient?.name}</h1>
            <Badge variant="secondary">
              {patient?.insuranceProvider}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            View and manage patient information, appointments, and medical records
          </p>
        </div>

        {patient && (
          <div className="mt-6">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col rounded-lg border p-3">
                <dt className="text-sm font-medium text-muted-foreground">Status</dt>
                <dd className="mt-1 text-lg font-semibold">
                  {/* @ts-ignore - Checking for possibly non-existent property */}
                  {patient.status || 'Unknown'}
                </dd>
              </div>

              <div className="flex flex-col rounded-lg border p-3">
                <dt className="text-sm font-medium text-muted-foreground">Date of Birth</dt>
                <dd className="mt-1 text-lg font-semibold">{patient.dateOfBirth}</dd>
              </div>

              <div className="flex flex-col rounded-lg border p-3">
                <dt className="text-sm font-medium text-muted-foreground">Gender</dt>
                <dd className="mt-1 text-lg font-semibold">{patient.gender}</dd>
              </div>

              <div className="flex flex-col rounded-lg border p-3">
                <dt className="text-sm font-medium text-muted-foreground">Condition</dt>
                <dd className="mt-1 text-lg font-semibold">
                  {/* @ts-ignore - Checking for possibly non-existent property */}
                  {patient.condition || 'Not specified'}
                </dd>
              </div>

              <div className="flex flex-col rounded-lg border p-3">
                <dt className="text-sm font-medium text-muted-foreground">Contact Number</dt>
                <dd className="mt-1 text-lg font-semibold">{patient.contactNumber}</dd>
              </div>

              <div className="flex flex-col rounded-lg border p-3">
                <dt className="text-sm font-medium text-muted-foreground">Address</dt>
                <dd className="mt-1 text-lg font-semibold">{patient.address}</dd>
              </div>
            </dl>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
            <CardDescription>Schedule and manage appointments</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="relative">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-[280px] justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) =>
                      date > new Date() || date < new Date("1900-01-01")
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label htmlFor="note">Note</Label>
              <Textarea id="note" placeholder="Appointment notes..." />
            </div>
          </CardContent>
        </Card>

        {/* Display Vital Signs */}
        {/* @ts-ignore - Checking for possibly non-existent property */}
        {patient && patient.vitalSigns && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Vital Signs</CardTitle>
              <CardDescription>Latest readings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                <div className="flex flex-col rounded-lg border p-3">
                  <span className="text-sm font-medium text-muted-foreground">Heart Rate</span>
                  {/* @ts-ignore - Accessing possibly non-existent property */}
                  <span className="mt-1 text-lg font-semibold">{patient.vitalSigns.heartRate || 'N/A'} bpm</span>
                </div>

                <div className="flex flex-col rounded-lg border p-3">
                  <span className="text-sm font-medium text-muted-foreground">Blood Pressure</span>
                  {/* @ts-ignore - Accessing possibly non-existent property */}
                  <span className="mt-1 text-lg font-semibold">{patient.vitalSigns.bloodPressure || 'N/A'}</span>
                </div>

                <div className="flex flex-col rounded-lg border p-3">
                  <span className="text-sm font-medium text-muted-foreground">Temperature</span>
                  {/* @ts-ignore - Accessing possibly non-existent property */}
                  <span className="mt-1 text-lg font-semibold">{patient.vitalSigns.temperature || 'N/A'} °C</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Display Medications */}
        {/* @ts-ignore - Checking for possibly non-existent property */}
        {patient && patient.medications && patient.medications.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Current Medications</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {/* @ts-ignore - Accessing possibly non-existent property */}
                {patient.medications.map((med, index) => (
                  <li key={index}>{med}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Display Medical History */}
        {/* @ts-ignore - Checking for possibly non-existent property */}
        {patient && patient.medicalHistory && patient.medicalHistory.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {/* @ts-ignore - Accessing possibly non-existent property */}
                {patient.medicalHistory.map((history, index) => (
                  <li key={index}>{history}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Display Allergies */}
        {/* @ts-ignore - Checking for possibly non-existent property */}
        {patient && patient.allergies && patient.allergies.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Allergies</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-5 space-y-2">
                {/* @ts-ignore - Accessing possibly non-existent property */}
                {patient.allergies.map((allergy, index) => (
                  <li key={index}>{allergy}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
