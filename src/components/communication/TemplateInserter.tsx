import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileText, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  variables: string[];
  category: string;
  is_shared: boolean;
}

interface TemplateInserterProps {
  onInsert: (content: string) => void;
}

export const TemplateInserter: React.FC<TemplateInserterProps> = ({ onInsert }) => {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<MessageTemplate | null>(null);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    filterTemplates();
  }, [templates, searchQuery, categoryFilter]);

  const fetchTemplates = async () => {
    try {
      // @ts-expect-error - message_templates table not yet created
      const { data, error } = await supabase
        .from('message_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // @ts-expect-error - type mismatch with MessageTemplate
      const formattedTemplates = data?.map(t => ({
        ...t,
        variables: Array.isArray(t.variables) ? t.variables as string[] : []
      })) || [];
      
      setTemplates(formattedTemplates as any);
    } catch (error) {
      console.error('Error fetching templates:', error);
    }
  };

  const filterTemplates = () => {
    let filtered = templates;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(t => t.category === categoryFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        t => t.title.toLowerCase().includes(query) ||
             t.content.toLowerCase().includes(query)
      );
    }

    setFilteredTemplates(filtered);
  };

  const handleSelectTemplate = (template: MessageTemplate) => {
    setSelectedTemplate(template);
    // Initialize variable values
    const initialValues: Record<string, string> = {};
    template.variables.forEach(variable => {
      initialValues[variable] = '';
    });
    setVariableValues(initialValues);
  };

  const handleInsert = () => {
    if (!selectedTemplate) return;

    let content = selectedTemplate.content;

    // Replace variables with their values
    selectedTemplate.variables.forEach(variable => {
      const value = variableValues[variable] || `{${variable}}`;
      content = content.replace(new RegExp(`\\{${variable}\\}`, 'g'), value);
    });

    onInsert(content);
    setIsOpen(false);
    setSelectedTemplate(null);
    setVariableValues({});
    toast.success('Template inserted');
  };

  const categories = ['all', 'general', 'appointment', 'medication', 'followup', 'emergency', 'discharge'];

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 w-10 p-0"
          title="Insert template"
        >
          <FileText className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Message Templates</h4>
            {selectedTemplate && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedTemplate(null);
                  setVariableValues({});
                }}
              >
                Back
              </Button>
            )}
          </div>

          {!selectedTemplate ? (
            <>
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <ScrollArea className="h-64">
                <div className="space-y-2">
                  {filteredTemplates.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No templates found
                    </p>
                  ) : (
                    filteredTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="p-3 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleSelectTemplate(template)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <h5 className="font-medium text-sm">{template.title}</h5>
                          <Badge variant="secondary" className="text-xs">
                            {template.category}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.content}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="space-y-3">
              <div>
                <h5 className="font-medium mb-2">{selectedTemplate.title}</h5>
                <p className="text-sm text-muted-foreground mb-3">
                  {selectedTemplate.content}
                </p>
              </div>

              {selectedTemplate.variables.length > 0 ? (
                <>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Fill in variables:</p>
                    {selectedTemplate.variables.map((variable) => (
                      <div key={variable}>
                        <Label htmlFor={variable} className="text-xs">
                          {variable.replace(/_/g, ' ').charAt(0).toUpperCase() + variable.slice(1).replace(/_/g, ' ')}
                        </Label>
                        <Input
                          id={variable}
                          value={variableValues[variable] || ''}
                          onChange={(e) =>
                            setVariableValues(prev => ({
                              ...prev,
                              [variable]: e.target.value
                            }))
                          }
                          placeholder={`Enter ${variable}`}
                          className="text-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <Button onClick={handleInsert} className="w-full">
                    Insert Template
                  </Button>
                </>
              ) : (
                <Button onClick={handleInsert} className="w-full">
                  Insert Template
                </Button>
              )}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
};
