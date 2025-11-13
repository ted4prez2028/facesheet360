import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, X } from "lucide-react";
import { useLabResults, useCreateLabResult, useUpdateLabResult, useDeleteLabResult } from "@/hooks/useLabResults";
import { useAuth } from "@/context/AuthContext";
import { format } from "date-fns";

interface LabResultsPanelProps {
  patientId: string;
}

const LabResultsPanel = ({ patientId }: LabResultsPanelProps) => {
  const { user } = useAuth();
  const { data: labs = [], isLoading } = useLabResults(patientId);
  const createLab = useCreateLabResult();
  const updateLab = useUpdateLabResult();
  const deleteLab = useDeleteLabResult();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<{
    test_name: string;
    test_category: string;
    result_value: string;
    result_unit: string;
    reference_range: string;
    notes: string;
    status: 'pending' | 'completed' | 'reviewed';
  }>({
    test_name: '',
    test_category: '',
    result_value: '',
    result_unit: '',
    reference_range: '',
    notes: '',
    status: 'pending'
  });

  const handleSave = () => {
    if (!user) return;

    if (editingId) {
      updateLab.mutate({ 
        id: editingId, 
        updates: formData 
      });
      setEditingId(null);
    } else {
      createLab.mutate({
        patient_id: patientId,
        ordered_by: user.id,
        performed_at: new Date().toISOString(),
        ...formData
      });
      setIsAdding(false);
    }

    setFormData({
      test_name: '',
      test_category: '',
      result_value: '',
      result_unit: '',
      reference_range: '',
      notes: '',
      status: 'pending'
    });
  };

  const handleEdit = (lab: any) => {
    setEditingId(lab.id);
    setFormData({
      test_name: lab.test_name || '',
      test_category: lab.test_category || '',
      result_value: lab.result_value || '',
      result_unit: lab.result_unit || '',
      reference_range: lab.reference_range || '',
      notes: lab.notes || '',
      status: lab.status || 'pending'
    });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({
      test_name: '',
      test_category: '',
      result_value: '',
      result_unit: '',
      reference_range: '',
      notes: '',
      status: 'pending'
    });
  };

  if (isLoading) {
    return <div>Loading lab results...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Lab Results</h3>
        {!isAdding && !editingId && (
          <Button onClick={() => setIsAdding(true)} size="sm">
            <Plus className="h-4 w-4 mr-1" />
            Add Lab Result
          </Button>
        )}
      </div>

      {(isAdding || editingId) && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <h4 className="font-medium">{editingId ? 'Edit' : 'Add'} Lab Result</h4>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Test Name</label>
                <Input
                  value={formData.test_name}
                  onChange={(e) => setFormData({...formData, test_name: e.target.value})}
                  placeholder="CBC, BMP, etc."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Input
                  value={formData.test_category}
                  onChange={(e) => setFormData({...formData, test_category: e.target.value})}
                  placeholder="Hematology, Chemistry, etc."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Result Value</label>
                <Input
                  value={formData.result_value}
                  onChange={(e) => setFormData({...formData, result_value: e.target.value})}
                  placeholder="12.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Unit</label>
                <Input
                  value={formData.result_unit}
                  onChange={(e) => setFormData({...formData, result_unit: e.target.value})}
                  placeholder="g/dL, mmol/L, etc."
                />
              </div>
              <div>
                <label className="text-sm font-medium">Reference Range</label>
                <Input
                  value={formData.reference_range}
                  onChange={(e) => setFormData({...formData, reference_range: e.target.value})}
                  placeholder="12-16"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value as 'pending' | 'completed' | 'reviewed'})}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                  <option value="reviewed">Reviewed</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Notes</label>
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
        {labs.map((lab: any) => (
          <Card key={lab.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{lab.test_name}</h4>
                    <Badge variant={lab.status === 'completed' ? 'default' : 'secondary'}>
                      {lab.status}
                    </Badge>
                  </div>
                  {lab.test_category && (
                    <p className="text-sm text-muted-foreground">{lab.test_category}</p>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium">Result: </span>
                      {lab.result_value} {lab.result_unit}
                    </div>
                    {lab.reference_range && (
                      <div>
                        <span className="font-medium">Reference: </span>
                        {lab.reference_range}
                      </div>
                    )}
                  </div>
                  {lab.notes && (
                    <p className="text-sm text-muted-foreground">{lab.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    {lab.performed_at && format(new Date(lab.performed_at), 'PPp')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEdit(lab)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteLab.mutate(lab.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {labs.length === 0 && !isAdding && (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              No lab results recorded yet
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default LabResultsPanel;
