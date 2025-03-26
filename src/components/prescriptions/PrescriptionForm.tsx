
import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAddPrescription } from "@/hooks/usePrescriptions";
import { useAuth } from "@/context/AuthContext";

interface PrescriptionFormProps {
  patientId: string;
  onClose: () => void;
}

export const PrescriptionForm = ({ patientId, onClose }: PrescriptionFormProps) => {
  const { user } = useAuth();
  const { mutate: addPrescription, isPending } = useAddPrescription();
  
  const [medicationName, setMedicationName] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [instructions, setInstructions] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) return;
    
    addPrescription({
      patient_id: patientId,
      provider_id: user.id,
      medication_name: medicationName,
      dosage,
      frequency,
      start_date: startDate.toISOString(),
      end_date: endDate?.toISOString(),
      instructions,
      status: "prescribed"
    }, {
      onSuccess: () => {
        onClose();
      }
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Prescription</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medication">Medication Name</Label>
            <Input
              id="medication"
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input
                id="dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                required
                placeholder="e.g., 500mg"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency} required>
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Once daily</SelectItem>
                  <SelectItem value="twice_daily">Twice daily</SelectItem>
                  <SelectItem value="three_times_daily">Three times daily</SelectItem>
                  <SelectItem value="four_times_daily">Four times daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="as_needed">As needed (PRN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !startDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label>End Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date < startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea
              id="instructions"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="Special instructions or notes..."
              rows={3}
            />
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-end gap-2 border-t pt-4">
          <Button variant="outline" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="bg-health-600 hover:bg-health-700"
            disabled={isPending}
          >
            {isPending ? "Prescribing..." : "Prescribe Medication"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default PrescriptionForm;
