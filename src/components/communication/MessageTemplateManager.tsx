import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Plus, Edit, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  variables: string[];
  category: string;
  is_shared: boolean;
  user_id: string;
  created_at: string;
}

interface MessageTemplateManagerProps {
  onSelectTemplate?: (template: MessageTemplate) => void;
}

export const MessageTemplateManager: React.FC<MessageTemplateManagerProps> = ({
  onSelectTemplate
}) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    variables: '',
    category: 'general',
    is_shared: false
  });

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formattedTemplates = data?.map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables as string[] : []
      })) || [];
      
      setTemplates(formattedTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast.error('Failed to load templates');
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in title and content');
      return;
    }

    setLoading(true);
    try {
      const variables = formData.variables
        .split(',')
        .map(v => v.trim())
        .filter(v => v);

      const templateData = {
        title: formData.title,
        content: formData.content,
        variables: variables,
        category: formData.category,
        is_shared: formData.is_shared,
        user_id: user?.id
      };

      if (isEditing && selectedTemplate) {
        const { error } = await supabase
          .from('message_templates')
          .update(templateData)
          .eq('id', selectedTemplate.id);

        if (error) throw error;
        toast.success('Template updated');
      } else {
        const { error } = await supabase
          .from('message_templates')
          .insert([templateData]);

        if (error) throw error;
        toast.success('Template created');
      }

      await fetchTemplates();
      handleClose();
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;

    try {
      const { error } = await supabase
        .from('message_templates')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Template deleted');
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleEdit = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      title: template.title,
      content: template.content,
      variables: template.variables.join(', '),
      category: template.category,
      is_shared: template.is_shared
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setIsEditing(false);
    setSelectedTemplate(null);
    setFormData({
      title: '',
      content: '',
      variables: '',
      category: 'general',
      is_shared: false
    });
  };

  const categories = ['general', 'appointment', 'medication', 'followup', 'emergency', 'discharge'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Message Templates</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setIsEditing(false)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {isEditing ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
              <DialogDescription>
                Create reusable message templates with variables. Use {'{variable_name}'} in content.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Template Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Appointment Reminder"
                />
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content">Template Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Hi {patient_name}, your appointment is scheduled for {date} at {time}."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="variables">Variables (comma-separated)</Label>
                <Input
                  id="variables"
                  value={formData.variables}
                  onChange={(e) => setFormData(prev => ({ ...prev, variables: e.target.value }))}
                  placeholder="patient_name, date, time"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  These will be extracted from the content automatically
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                {loading ? 'Saving...' : 'Save Template'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {templates.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No templates yet. Create your first one!</p>
            </div>
          ) : (
            templates.map((template) => (
              <div
                key={template.id}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => onSelectTemplate?.(template)}>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium truncate">{template.title}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {template.category}
                      </Badge>
                      {template.is_shared && (
                        <Badge variant="outline" className="text-xs">Shared</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.content}
                    </p>
                    {template.variables.length > 0 && (
                      <div className="flex gap-1 mt-2 flex-wrap">
                        {template.variables.map((variable) => (
                          <Badge key={variable} variant="outline" className="text-xs">
                            {'{' + variable + '}'}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                  {template.user_id === user?.id && (
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleEdit(template)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(template.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
