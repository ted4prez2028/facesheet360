import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Video, FileText, Heart, Brain, Activity, Pill } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const PatientEducation = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { icon: Heart, title: 'Cardiovascular Health', count: 24, color: 'text-red-500' },
    { icon: Brain, title: 'Mental Health', count: 18, color: 'text-purple-500' },
    { icon: Activity, title: 'Diabetes Management', count: 32, color: 'text-blue-500' },
    { icon: Pill, title: 'Medication Guides', count: 45, color: 'text-green-500' },
  ];

  const resources = [
    {
      id: '1',
      title: 'Understanding High Blood Pressure',
      type: 'article',
      duration: '5 min read',
      category: 'Cardiovascular'
    },
    {
      id: '2',
      title: 'How to Use Your Insulin Pen',
      type: 'video',
      duration: '3 min',
      category: 'Diabetes'
    },
    {
      id: '3',
      title: 'Managing Anxiety: A Patient Guide',
      type: 'article',
      duration: '8 min read',
      category: 'Mental Health'
    },
  ];

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Patient Education Library</h1>
        <p className="text-muted-foreground">
          Evidence-based health education resources for patients
        </p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search education materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse Library</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="custom">Custom Materials</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <div className="grid gap-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      {resource.type === 'video' ? (
                        <Video className="h-5 w-5 text-primary mt-1" />
                      ) : (
                        <FileText className="h-5 w-5 text-primary mt-1" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{resource.title}</CardTitle>
                        <CardDescription>
                          {resource.category} • {resource.duration}
                        </CardDescription>
                      </div>
                    </div>
                    <Button size="sm">View</Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card key={category.title} className="cursor-pointer hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`rounded-lg bg-background p-3 ${category.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle>{category.title}</CardTitle>
                        <CardDescription>{category.count} resources</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Create Custom Educational Material</CardTitle>
              <CardDescription>
                Generate personalized patient education handouts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full" size="lg">
                  <BookOpen className="mr-2 h-4 w-4" />
                  Create New Handout
                </Button>
                <div className="rounded-lg border bg-muted p-4">
                  <p className="text-sm text-muted-foreground">
                    Custom materials can be:
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                    <li>• Tailored to patient's reading level</li>
                    <li>• Translated into multiple languages</li>
                    <li>• Branded with your practice information</li>
                    <li>• Shared via patient portal or email</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientEducation;
