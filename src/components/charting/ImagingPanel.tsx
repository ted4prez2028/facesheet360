import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useImagingStudies, useCreateImagingStudy, useUpdateImagingStudy, useDeleteImagingStudy } from "@/hooks/useImagingStudies";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface ImagingPanelProps {
  patientId: string;
}

const ImagingPanel = ({ patientId }: ImagingPanelProps) => {
  const { user } = useAuth();
  const { data: imaging = [], isLoading } = useImagingStudies(patientId);
  const createStudy = useCreateImagingStudy();
  const updateStudy = useUpdateImagingStudy();
  const deleteStudy = useDeleteImagingStudy();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    study_type: string;
    modality: string;
    body_part: string;
    findings: string;
    impression: string;
    notes: string;
    status: 'scheduled' | 'completed' | 'reviewed' | 'in_progress';
  }>({
    study_type: '',
    modality: '',
    body_part: '',
    findings: '',
    impression: '',
    notes: '',
    status: 'scheduled'
  });

  const handleSave = () => {
    if (!user) return;

    if (editingId) {
      updateStudy.mutate({ 
        id: editingId, 
        updates: formData 
      });
      setEditingId(null);
    } else {
      createStudy.mutate({
        patient_id: patientId,
        ordered_by: user.id,
        performed_at: new Date().toISOString(),
        ...formData
      });
      setIsAdding(false);
    }

    setFormData({
      study_type: '',
      modality: '',
      body_part: '',
      findings: '',
      impression: '',
      notes: '',
      status: 'scheduled'
    });
  };

  const handleEdit = (study: any) => {
    setEditingId(study.id);
    setFormData({
      study_type: study.study_type || '',
      modality: study.modality || '',
      body_part: study.body_part || '',
      findings: study.findings || '',
      impression: study.impression || '',
      notes: study.notes || '',
      status: study.status || 'scheduled'
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      study_type: '',
      modality: '',
      body_part: '',
      findings: '',
      impression: '',
      notes: '',
      status: 'scheduled'
    });
  };

  if (isLoading) {
    return <div>Loading imaging studies...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Imaging Studies</h3>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Imaging Study
          </Button>
        )}
      </div>

      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{editingId ? 'Edit' : 'Add'} Imaging Study</h4>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Study Type</label>
                <Input
                  value={formData.study_type}
                  onChange={(e) => setFormData({...formData, study_type: e.target.value})}
                  placeholder="X-Ray, CT, MRI, etc."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Modality</label>
                <Input
                  value={formData.modality}
                  onChange={(e) => setFormData({...formData, modality: e.target.value})}
                  placeholder="CT, MRI, Ultrasound, etc."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Body Part</label>
                <Input
                  value={formData.body_part}
                  onChange={(e) => setFormData({...formData, body_part: e.target.value})}
                  placeholder="Chest, Abdomen, etc."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'scheduled' | 'completed' | 'reviewed' | 'in_progress'})}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="scheduled">Scheduled</option>
                  <option value="completed">Completed</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Findings</label>
              <Textarea
                value={formData.findings}
                onChange={(e) => setFormData({...formData, findings: e.target.value})}
                placeholder="Detailed findings..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Impression</label>
              <Textarea
                value={formData.impression}
                onChange={(e) => setFormData({...formData, impression: e.target.value})}
                placeholder="Clinical impression..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Additional Notes</label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                placeholder="Additional notes..."
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave}>Save</Button>
              <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3">
        {imaging.map((study: any) => (
          <Card key={study.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{study.study_type}</h4>
                    <Badge variant={study.status === 'completed' ? 'default' : 'secondary'}>
                      {study.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {study.modality && (
                      <div>
                        <span className="font-medium">Modality: </span>
                        {study.modality}
                      </div>
                    )}
                    {study.body_part && (
                      <div>
                        <span className="font-medium">Body Part: </span>
                        {study.body_part}
                      </div>
                    )}
                  </div>
                  {study.findings && (
                    <div>
                      <p className="text-sm font-medium">Findings:</p>
                      <p className="text-sm text-muted-foreground">{study.findings}</p>
                    </div>
                  )}
                  {study.impression && (
                    <div>
                      <p className="text-sm font-medium">Impression:</p>
                      <p className="text-sm text-muted-foreground">{study.impression}</p>
                    </div>
                  )}
                  {study.notes && (
                    <p className="text-sm text-muted-foreground">{study.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {study.performed_at && format(new Date(study.performed_at), 'PPp')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(study)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteStudy.mutate(study.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {imaging.length === 0 && !isAdding && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No imaging studies recorded yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ImagingPanel;
