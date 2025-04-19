
import { useParams, useNavigate } from 'react-router-dom';
import { usePatient } from '@/hooks/usePatient';
import { useWoundCare } from '@/hooks/useWoundCare';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Plus, Image, FileType, Send } from 'lucide-react';
import { Spinner } from '@/components/ui/spinner';
import { useState, useRef } from 'react';
import { toast } from 'sonner';

const WoundCare = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { patient, isLoading: patientLoading } = usePatient(id || '');
  const { 
    woundRecords, 
    isLoading: woundLoading, 
    createWound, 
    uploadImage
  } = useWoundCare(id || '');
  
  const [activeTab, setActiveTab] = useState('records');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedImage(e.target.files[0]);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !selectedImage || !description || !location) {
      toast.error('Please fill all required fields');
      return;
    }
    
    try {
      setIsUploading(true);
      // Upload image first
      const imageUrl = await uploadImage(selectedImage);
      if (!imageUrl) {
        toast.error('Failed to upload image');
        return;
      }
      
      // Create wound record with image URL
      await createWound.mutateAsync({
        patient_id: id,
        description,
        location,
        image_url: imageUrl
      });
      
      // Reset form
      setSelectedImage(null);
      setDescription('');
      setLocation('');
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Switch to records tab
      setActiveTab('records');
      
      toast.success('Wound record created successfully');
    } catch (error) {
      console.error('Error creating wound record:', error);
      toast.error('Failed to create wound record');
    } finally {
      setIsUploading(false);
    }
  };
  
  const isLoading = patientLoading || woundLoading;

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-96">
          <Spinner size="lg" />
        </div>
      </DashboardLayout>
    );
  }

  if (!patient) {
    navigate('/patients');
    return null;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate(`/patients/${id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patient
          </Button>
          <h1 className="text-2xl font-bold">
            Wound Care - {patient.first_name} {patient.last_name}
          </h1>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="records">Wound Records</TabsTrigger>
            <TabsTrigger value="add">Add New Record</TabsTrigger>
          </TabsList>
          
          <TabsContent value="records" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {woundRecords.length === 0 ? (
                <div className="col-span-full text-center py-10 text-gray-500">
                  No wound records found. Add a new record to get started.
                </div>
              ) : (
                woundRecords.map(record => (
                  <Card key={record.id}>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">{record.location}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {new Date(record.created_at).toLocaleDateString()}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="aspect-square w-full mb-3 rounded-md overflow-hidden bg-gray-100">
                        <img 
                          src={record.image_url} 
                          alt={`Wound at ${record.location}`} 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <p className="text-sm">{record.description}</p>
                      {record.healing_status && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Healing status:</span> {record.healing_status}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="add" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Add New Wound Record</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium">
                      Wound Image <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-4">
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Image className="h-4 w-4 mr-2" />
                        Select Image
                      </Button>
                      <input 
                        type="file" 
                        ref={fileInputRef}
                        accept="image/*" 
                        onChange={handleFileChange}
                        className="hidden" 
                      />
                      {selectedImage && (
                        <span className="text-sm text-muted-foreground">
                          {selectedImage.name}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="location" className="block text-sm font-medium">
                      Wound Location <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      id="location"
                      className="w-full rounded-md border border-input px-3 py-2"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Left heel"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="description" className="block text-sm font-medium">
                      Description <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      id="description"
                      className="w-full rounded-md border border-input px-3 py-2 min-h-[100px]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the wound condition"
                      required
                    />
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => setActiveTab('records')}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={!selectedImage || !description || !location || isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Spinner className="mr-2 h-4 w-4" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Save Record
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default WoundCare;
