
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PatientFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  medicalRecordNumber: string;
  insuranceProvider: string;
  policyNumber: string;
  address: string;
}

interface PatientFormFieldsProps {
  formData: PatientFormData;
  onChange: (field: keyof PatientFormData, value: string) => void;
}

const PatientFormFields: React.FC<PatientFormFieldsProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name *</Label>
        <Input
          id="firstName"
          value={formData.firstName}
          onChange={(e) => onChange("firstName", e.target.value)}
          placeholder="John"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name *</Label>
        <Input
          id="lastName"
          value={formData.lastName}
          onChange={(e) => onChange("lastName", e.target.value)}
          placeholder="Doe"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => onChange("email", e.target.value)}
          placeholder="john.doe@example.com"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => onChange("phone", e.target.value)}
          placeholder="(123) 456-7890"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => onChange("dateOfBirth", e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="gender">Gender</Label>
        <Select 
          value={formData.gender} 
          onValueChange={(value) => onChange("gender", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Male">Male</SelectItem>
            <SelectItem value="Female">Female</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
            <SelectItem value="Unknown">Unknown</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="medicalRecordNumber">Medical Record Number</Label>
        <Input
          id="medicalRecordNumber"
          value={formData.medicalRecordNumber}
          onChange={(e) => onChange("medicalRecordNumber", e.target.value)}
          placeholder="MRN123456"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="insuranceProvider">Insurance Provider</Label>
        <Input
          id="insuranceProvider"
          value={formData.insuranceProvider}
          onChange={(e) => onChange("insuranceProvider", e.target.value)}
          placeholder="Insurance Company"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="policyNumber">Policy Number</Label>
        <Input
          id="policyNumber"
          value={formData.policyNumber}
          onChange={(e) => onChange("policyNumber", e.target.value)}
          placeholder="POL123456"
        />
      </div>
      <div className="space-y-2 col-span-1 md:col-span-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address}
          onChange={(e) => onChange("address", e.target.value)}
          placeholder="123 Main St, City, State, ZIP"
          className="resize-none"
        />
      </div>
    </div>
  );
};

export default PatientFormFields;
