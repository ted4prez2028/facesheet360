
import React, { useState } from 'react';
import { useImagingRecords, useImagingRecordsMutation } from '@/hooks/useChartData';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Image, Save, Eye, FileImage } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useAuth } from '@/context/AuthContext';

interface ImagingFormValues {
  imaging_type: string;
  body_area: string;
  findings: string;
  image_url: string;
  notes: string;
}

interface ImagingPanelProps {
  patientId: string | null;
}

const ImagingPanel: React.FC<ImagingPanelProps> = ({ patientId }) => {
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);
  
  const initialValues: ImagingFormValues = {
    imaging_type: '',
    body_area: '',
    findings: '',
    image_url: '',
    notes: ''
  };
  
  const [formValues, setFormValues] = useState<ImagingFormValues>(initialValues);
  
  const { data: imagingRecords, isLoading, refetch } = useImagingRecords(patientId);
  const { saveImagingRecord, isLoading: isSaving } = useImagingRecordsMutation();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId || !user?.id) {
      toast({
        title: "Error",
        description: "Patient ID or provider ID is missing",
        variant: "destructive"
      });
      return;
    }
    
    if (!formValues.imaging_type || !formValues.body_area) {
      toast({
        title: "Required fields missing",
        description: "Please enter imaging type and body area",
        variant: "destructive"
      });
      return;
    }
    
    try {
      await saveImagingRecord({
        patient_id: patientId,
        date_performed: new Date().toISOString(),
        imaging_type: formValues.imaging_type,
        body_area: formValues.body_area,
        findings: formValues.findings || undefined,
        image_url: formValues.image_url || undefined,
        notes: formValues.notes || undefined
      });
      
      toast({
        title: "Success",
        description: "Imaging record saved successfully"
      });
      
      setFormValues(initialValues);
      setIsAdding(false);
      refetch();

      // Mint CareCoins for the provider
      mintCareCoin(user.id, patientId, {
        imaging: formValues,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save imaging record",
        variant: "destructive"
      });
    }
  };

  interface ImagingChartData {
  imaging: ImagingFormValues;
}

  const mintCareCoin = async (providerId: string, patientId: string, chartData: ImagingChartData) => {
    try {
      const response = await fetch("/api/mint-carecoin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ providerId, patientId, chartData }),
      });

      if (!response.ok) {
        throw new Error("Failed to mint CareCoins");
      }

      const data = await response.json();
      toast({
        title: "CareCoins Minted",
        description: `You have been awarded ${data.amount} CareCoins!`,
      });
    } catch (error) {
      console.error("Error minting CareCoins:", error);
      toast({
        title: "Minting Error",
        description: "Could not mint CareCoins at this time.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-pulse text-gray-500">Loading imaging records...</div>
      </div>
    );
  }

  // Sample image URLs for demonstration
  const sampleImages = [
    'https://www.mayoclinic.org/-/media/kcms/gbs/patient-consumer/images/2013/11/15/17/35/ds00537_-ds00726_-ds00738_-my01067_r7_thoraxthu_jpg.jpg',
    'https://www.mymed.com/image/1569/MedicalArticle/700',
    'https://prod-images-static.radiopaedia.org/images/156632/c46dd3726ab3a2aafb5885833ed42b_big_gallery.jpg'
  ];

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Imaging Records</h3>
        {!isAdding && (
          <Button 
            className="gap-2 bg-health-600 hover:bg-health-700"
            size="sm"
            onClick={() => setIsAdding(true)}
          >
            <Image className="h-4 w-4" />
            <span>Add Imaging</span>
          </Button>
        )}
      </div>
      
      {isAdding ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Record Imaging Study</CardTitle>
            <CardDescription>Enter details of the imaging procedure</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="imaging_type">Imaging Type</Label>
                  <Input 
                    id="imaging_type" 
                    name="imaging_type"
                    value={formValues.imaging_type}
                    onChange={handleInputChange}
                    placeholder="e.g., X-Ray, MRI, CT Scan"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="body_area">Body Area</Label>
                  <Input 
                    id="body_area" 
                    name="body_area"
                    value={formValues.body_area}
                    onChange={handleInputChange}
                    placeholder="e.g., Chest, Abdomen, Left Knee"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="findings">Findings</Label>
                <Textarea 
                  id="findings" 
                  name="findings"
                  value={formValues.findings}
                  onChange={handleInputChange}
                  placeholder="Summary of imaging findings..."
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="image_url">Image URL</Label>
                <Input 
                  id="image_url" 
                  name="image_url"
                  value={formValues.image_url}
                  onChange={handleInputChange}
                  placeholder="URL to the stored image (optional)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  For demo purposes, use one of these sample URLs:
                </p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {sampleImages.map((url, index) => (
                    <Button
                      key={index}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setFormValues(prev => ({ ...prev, image_url: url }))}
                      className="text-xs"
                    >
                      Sample {index + 1}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea 
                  id="notes" 
                  name="notes"
                  value={formValues.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes or context..."
                  rows={2}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAdding(false)}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-health-600 hover:bg-health-700"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save Imaging
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      ) : (
        <ScrollArea className="h-[500px]">
          {imagingRecords && imagingRecords.length > 0 ? (
            imagingRecords.map((record) => (
              <Card key={record.id} className="mb-4">
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-base">{record.imaging_type}</CardTitle>
                      <CardDescription>
                        {record.body_area} - {format(new Date(record.date_performed), 'MMMM d, yyyy')}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {record.image_url && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <div className="mb-4 cursor-pointer relative group">
                          <AspectRatio ratio={16 / 9} className="bg-muted rounded-md overflow-hidden">
                            <img 
                              src={record.image_url} 
                              alt={`${record.imaging_type} of ${record.body_area}`}
                              className="object-cover w-full h-full"
                            />
                          </AspectRatio>
                          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all rounded-md">
                            <Button variant="secondary" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <Eye className="h-4 w-4 mr-2" />
                              View Full Size
                            </Button>
                          </div>
                        </div>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <img 
                          src={record.image_url} 
                          alt={`${record.imaging_type} of ${record.body_area}`}
                          className="w-full"
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                  
                  {record.findings && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium mb-1">Findings:</h4>
                      <p className="text-sm text-gray-700">{record.findings}</p>
                    </div>
                  )}
                  
                  {record.notes && (
                    <div>
                      <h4 className="text-sm font-medium mb-1">Notes:</h4>
                      <p className="text-sm text-gray-600">{record.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <FileImage className="mx-auto h-10 w-10 text-gray-300 mb-2" />
              <p>No imaging records for this patient</p>
              <p className="text-sm mt-1">Click "Add Imaging" to record new imaging studies</p>
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};

export default ImagingPanel;
