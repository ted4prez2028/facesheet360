import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { FileImage, Upload, Plus, Trash2, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react';
import { useWoundCare } from '@/hooks/useWoundCare';
import { WoundRecord } from '@/hooks/useWoundCare';
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface WoundCareTabProps {
  patientId: string;
}

const WoundCareTab: React.FC<WoundCareTabProps> = ({ patientId }) => {
  const [isAddWoundOpen, setIsAddWoundOpen] = useState(false);
  const [selectedWound, setSelectedWound] = useState<WoundRecord | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  
  const { 
    woundRecords, 
    isLoading, 
    isUploading,
    isAnalyzing,
    createWound, 
    updateWound,
    deleteWound,
    uploadImage,
    analyzeWoundImage
  } = useWoundCare(patientId);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type.includes('image/')) {
        setSelectedImage(file);
        const reader = new FileReader();
        reader.onload = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        toast.error("Please select an image file");
      }
    }
  };

  const handleAddWound = async () => {
    if (!selectedImage) {
      toast.error("Please select an image");
      return;
    }

    if (!location || !description) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Upload image
    const imageUrl = await uploadImage(selectedImage);
    if (!imageUrl) return;

    // Analyze the wound using OpenAI
    const analysis = await analyzeWoundImage(imageUrl);
    
    // Create the wound record
    await createWound.mutateAsync({
      patient_id: patientId,
      image_url: imageUrl,
      location: location,
      description: description,
      assessment: analysis?.assessment || null,
      stage: analysis?.stage || null,
      infection_status: analysis?.infection_status || null,
      healing_status: analysis?.healing_status || null
    });

    // Reset form
    setSelectedImage(null);
    setImagePreview(null);
    setLocation('');
    setDescription('');
    setIsAddWoundOpen(false);
  };

  const handleDeleteWound = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this wound record?")) {
      await deleteWound.mutateAsync(id);
    }
  };

  const handleReanalyzeWound = async (wound: WoundRecord) => {
    const analysis = await analyzeWoundImage(wound.image_url);
    if (analysis) {
      await updateWound.mutateAsync({
        id: wound.id,
        updates: {
          assessment: analysis.assessment,
          stage: analysis.stage,
          infection_status: analysis.infection_status,
          healing_status: analysis.healing_status
        }
      });
      toast.success("Wound analysis updated");
    }
  };

  const openDetailView = (wound: WoundRecord) => {
    setSelectedWound(wound);
    setIsDetailDialogOpen(true);
  };

  const renderStatusBadge = (status: string | null) => {
    if (!status) return null;
    
    let variant: "default" | "destructive" | "outline" | "secondary" = "default";
    
    if (status.toLowerCase().includes('infected') || 
        status.toLowerCase().includes('severe')) {
      variant = "destructive";
    } else if (status.toLowerCase().includes('healing') || 
               status.toLowerCase().includes('good')) {
      variant = "secondary";
    }
    
    return <Badge variant={variant}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Wound Care Management</h2>
        <Button onClick={() => setIsAddWoundOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Wound Assessment
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : woundRecords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <FileImage className="h-16 w-16 text-muted-foreground mb-4" />
            <p className="text-center text-muted-foreground">
              No wound records found. Click "New Wound Assessment" to add one.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {woundRecords.map((wound) => (
            <Card key={wound.id} className="overflow-hidden">
              <div className="aspect-video w-full overflow-hidden">
                <img 
                  src={wound.image_url} 
                  alt={`Wound at ${wound.location}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => openDetailView(wound)}
                />
              </div>
              <CardContent className="p-4">
                <h3 className="font-medium mb-2">
                  {wound.location}
                  {wound.stage && <span className="ml-2 text-muted-foreground">Stage {wound.stage}</span>}
                </h3>
                <div className="flex flex-wrap gap-2 mb-2">
                  {wound.infection_status && renderStatusBadge(wound.infection_status)}
                  {wound.healing_status && renderStatusBadge(wound.healing_status)}
                </div>
                <p className="text-sm text-muted-foreground truncate">{wound.description}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Created: {format(new Date(wound.created_at), 'PP')}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0 flex justify-between">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openDetailView(wound)}
                >
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteWound(wound.id)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add New Wound Dialog */}
      <Dialog open={isAddWoundOpen} onOpenChange={setIsAddWoundOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>New Wound Assessment</DialogTitle>
            <DialogDescription>
              Upload an image of the wound and provide details. The system will analyze the image.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="image">Wound Image</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="flex-1"
                  />
                </div>
              </div>

              {imagePreview && (
                <div className="border rounded-md overflow-hidden">
                  <img 
                    src={imagePreview} 
                    alt="Wound preview" 
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Left heel, Sacrum"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe the wound characteristics..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddWoundOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWound} disabled={isUploading || isAnalyzing || !selectedImage}>
              {isUploading ? "Uploading..." : isAnalyzing ? "Analyzing..." : "Save & Analyze"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Wound Detail Dialog */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          {selectedWound && (
            <>
              <DialogHeader>
                <DialogTitle>Wound Assessment Details</DialogTitle>
                <DialogDescription>
                  Location: {selectedWound.location} | Created: {format(new Date(selectedWound.created_at), 'PP')}
                </DialogDescription>
              </DialogHeader>
              
              <Tabs defaultValue="image" className="w-full">
                <TabsList className="grid grid-cols-3 mb-4">
                  <TabsTrigger value="image">Image</TabsTrigger>
                  <TabsTrigger value="assessment">AI Assessment</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="image">
                  <div className="border rounded-md overflow-hidden">
                    <img 
                      src={selectedWound.image_url} 
                      alt={`Wound at ${selectedWound.location}`}
                      className="w-full h-auto max-h-[400px] object-contain"
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="assessment">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        AI Assessment
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleReanalyzeWound(selectedWound)}
                          className="ml-auto"
                        >
                          <RefreshCw className="mr-2 h-4 w-4" />
                          Reanalyze
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedWound.stage && (
                        <div>
                          <h4 className="font-medium mb-1">Wound Stage:</h4>
                          <p>{selectedWound.stage}</p>
                        </div>
                      )}
                      
                      {selectedWound.infection_status && (
                        <div>
                          <h4 className="font-medium mb-1">Infection Status:</h4>
                          <div className="flex items-center">
                            {selectedWound.infection_status.toLowerCase().includes('infected') ? (
                              <AlertTriangle className="h-4 w-4 text-destructive mr-2" />
                            ) : (
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                            )}
                            <p>{selectedWound.infection_status}</p>
                          </div>
                        </div>
                      )}
                      
                      {selectedWound.healing_status && (
                        <div>
                          <h4 className="font-medium mb-1">Healing Status:</h4>
                          <p>{selectedWound.healing_status}</p>
                        </div>
                      )}
                      
                      {selectedWound.assessment && (
                        <div>
                          <h4 className="font-medium mb-1">Detailed Assessment:</h4>
                          <p className="text-sm whitespace-pre-line">{selectedWound.assessment}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="details">
                  <Card>
                    <CardContent className="p-4 space-y-4">
                      <div>
                        <h4 className="font-medium mb-1">Location:</h4>
                        <p>{selectedWound.location}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-1">Description:</h4>
                        <p>{selectedWound.description}</p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-1">Created:</h4>
                        <p>{format(new Date(selectedWound.created_at), 'PPpp')}</p>
                      </div>
                      
                      {selectedWound.updated_at && new Date(selectedWound.updated_at).getTime() !== new Date(selectedWound.created_at).getTime() && (
                        <div>
                          <h4 className="font-medium mb-1">Last Updated:</h4>
                          <p>{format(new Date(selectedWound.updated_at), 'PPpp')}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WoundCareTab;
