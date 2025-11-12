import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { BookOpen, Search, Video, FileText, Heart, Brain, Activity, Pill, Download, Share2, X } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const PatientEducation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [customTitle, setCustomTitle] = useState('');
  const [customContent, setCustomContent] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [readingLevel, setReadingLevel] = useState('standard');
  const [language, setLanguage] = useState('english');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  const categories = [
    { icon: Heart, title: 'Cardiovascular Health', count: 24, color: 'text-red-500', key: 'cardiovascular' },
    { icon: Brain, title: 'Mental Health', count: 18, color: 'text-purple-500', key: 'mental-health' },
    { icon: Activity, title: 'Diabetes Management', count: 32, color: 'text-blue-500', key: 'diabetes' },
    { icon: Pill, title: 'Medication Guides', count: 45, color: 'text-green-500', key: 'medication' },
  ];

  const resources = [
    // Cardiovascular Health
    { id: '1', title: 'Understanding High Blood Pressure', type: 'article', duration: '5 min read', category: 'cardiovascular', content: 'High blood pressure (hypertension) occurs when the force of blood against artery walls is consistently too high. Normal blood pressure is less than 120/80 mmHg. Managing blood pressure involves regular monitoring, healthy diet (low sodium, rich in fruits and vegetables), regular exercise, maintaining healthy weight, limiting alcohol, not smoking, and managing stress. Medications may be prescribed if lifestyle changes are not enough.' },
    { id: '2', title: 'Heart-Healthy Diet Guide', type: 'article', duration: '7 min read', category: 'cardiovascular', content: 'A heart-healthy diet emphasizes: fruits and vegetables (5+ servings daily), whole grains, lean proteins (fish, poultry, legumes), healthy fats (olive oil, avocados, nuts), low-fat dairy. Limit: saturated fats, trans fats, sodium (less than 2,300mg daily), added sugars, and red meat. The Mediterranean and DASH diets are proven heart-healthy approaches.' },
    { id: '3', title: 'Exercise for Heart Health', type: 'video', duration: '4 min', category: 'cardiovascular', content: 'Aim for 150 minutes of moderate aerobic activity weekly. Activities include: brisk walking, swimming, cycling, dancing. Include strength training 2+ days per week. Start slowly and gradually increase intensity. Always warm up and cool down. Consult your doctor before starting new exercise programs, especially if you have heart conditions.' },
    { id: '4', title: 'Recognizing Heart Attack Symptoms', type: 'article', duration: '4 min read', category: 'cardiovascular', content: 'Call 911 immediately if you experience: chest pain or discomfort (pressure, squeezing, fullness), pain in arms, back, neck, jaw or stomach, shortness of breath, cold sweat, nausea, lightheadedness. Women may experience atypical symptoms like fatigue, indigestion. Time is critical - do not wait or drive yourself to the hospital.' },
    { id: '5', title: 'Managing Cholesterol Levels', type: 'article', duration: '6 min read', category: 'cardiovascular', content: 'Healthy cholesterol levels: Total cholesterol <200 mg/dL, LDL (bad) <100 mg/dL, HDL (good) >60 mg/dL, Triglycerides <150 mg/dL. Management includes: eating fiber-rich foods, reducing saturated fats, exercising regularly, maintaining healthy weight, not smoking, limiting alcohol. Statins or other medications may be prescribed when needed.' },
    
    // Mental Health
    { id: '6', title: 'Managing Anxiety: A Patient Guide', type: 'article', duration: '8 min read', category: 'mental-health', content: 'Anxiety management strategies include: deep breathing exercises, progressive muscle relaxation, regular physical activity, adequate sleep (7-9 hours), limiting caffeine and alcohol, mindfulness meditation, cognitive behavioral techniques, social support, and professional therapy when needed. Track triggers and practice self-compassion.' },
    { id: '7', title: 'Understanding Depression', type: 'article', duration: '10 min read', category: 'mental-health', content: 'Depression symptoms include persistent sadness, loss of interest, fatigue, sleep changes, appetite changes, difficulty concentrating, feelings of worthlessness, thoughts of death. Treatment options: psychotherapy (CBT, IPT), medications (antidepressants), lifestyle changes (exercise, sleep hygiene, nutrition), social support. Depression is treatable - seek help from mental health professionals.' },
    { id: '8', title: 'Stress Management Techniques', type: 'video', duration: '5 min', category: 'mental-health', content: 'Effective stress management: identify stressors, practice time management, exercise regularly, maintain healthy relationships, get adequate sleep, practice relaxation techniques (meditation, yoga, deep breathing), set boundaries, engage in hobbies, seek support when needed, consider professional counseling for chronic stress.' },
    { id: '9', title: 'Sleep Hygiene Best Practices', type: 'article', duration: '6 min read', category: 'mental-health', content: 'Good sleep hygiene includes: consistent sleep schedule (same bedtime/wake time daily), comfortable sleep environment (cool, dark, quiet), avoid screens 1 hour before bed, no caffeine after 2pm, regular exercise (but not close to bedtime), relaxation routine before bed, avoid large meals late evening, use bed only for sleep.' },
    { id: '10', title: 'Mindfulness Meditation Guide', type: 'video', duration: '8 min', category: 'mental-health', content: 'Mindfulness meditation involves focusing on the present moment without judgment. Benefits include reduced stress, improved focus, emotional regulation, better sleep. Start with 5 minutes daily, focus on breathing, acknowledge thoughts without engaging, return focus to breath. Use apps or guided meditations for support. Practice regularly for best results.' },
    
    // Diabetes Management
    { id: '11', title: 'How to Use Your Insulin Pen', type: 'video', duration: '3 min', category: 'diabetes', content: 'Insulin pen injection steps: 1) Wash hands 2) Attach new needle 3) Prime pen (dial 2 units, press button until insulin appears) 4) Dial prescribed dose 5) Choose injection site (abdomen, thigh, upper arm - rotate sites) 6) Pinch skin, insert needle at 90° angle 7) Press button fully, hold 10 seconds 8) Remove needle, dispose safely. Store insulin properly and check expiration dates.' },
    { id: '12', title: 'Blood Sugar Monitoring Guide', type: 'article', duration: '7 min read', category: 'diabetes', content: 'Target blood sugar ranges: Before meals 80-130 mg/dL, 2 hours after meals <180 mg/dL, Bedtime 90-150 mg/dL. Monitor frequency as directed by your doctor. Record results in log book. Wash hands before testing, use side of fingertip, rotate fingers, apply enough blood to test strip. Bring logs to medical appointments. Adjust diet, activity or medication as prescribed based on readings.' },
    { id: '13', title: 'Diabetes Meal Planning', type: 'article', duration: '9 min read', category: 'diabetes', content: 'Diabetes meal planning: Use plate method (1/2 non-starchy vegetables, 1/4 lean protein, 1/4 whole grains/starch). Count carbohydrates consistently. Choose high-fiber foods, lean proteins, healthy fats. Limit added sugars, refined carbs, saturated fats. Eat regular meals, avoid skipping. Read nutrition labels. Work with dietitian for personalized meal plan.' },
    { id: '14', title: 'Managing Type 2 Diabetes', type: 'article', duration: '12 min read', category: 'diabetes', content: 'Type 2 diabetes management involves: regular blood sugar monitoring, healthy eating, regular physical activity (150 min/week), maintaining healthy weight, taking medications as prescribed, regular checkups (A1C every 3-6 months), foot care, eye exams, dental care. Monitor for complications and report symptoms promptly. Track blood pressure and cholesterol.' },
    { id: '15', title: 'Preventing Diabetes Complications', type: 'article', duration: '8 min read', category: 'diabetes', content: 'Prevent diabetes complications through: tight blood sugar control (A1C <7%), blood pressure management, cholesterol control, not smoking, regular foot exams, annual eye exams, dental checkups, kidney function monitoring. Warning signs: numbness/tingling, vision changes, slow-healing wounds, frequent infections, chest pain. Report symptoms immediately to prevent serious complications.' },
    
    // Medication Guides
    { id: '16', title: 'Understanding Your Prescriptions', type: 'article', duration: '6 min read', category: 'medication', content: 'Medication safety: Know medication names (generic and brand), understand purpose, take as prescribed (right dose, time, route), know side effects, report adverse reactions, avoid drug interactions, do not share medications, store properly, check expiration dates, use same pharmacy, bring medication list to appointments, ask questions if unsure.' },
    { id: '17', title: 'Blood Pressure Medication Guide', type: 'article', duration: '10 min read', category: 'medication', content: 'Common blood pressure medications: ACE inhibitors (end in -pril), ARBs (end in -sartan), Beta blockers (end in -lol), Calcium channel blockers, Diuretics (water pills). Take consistently at same time daily. Do not skip doses. Report side effects: dizziness, persistent cough, swelling. Continue lifestyle modifications. Do not stop suddenly without consulting doctor.' },
    { id: '18', title: 'Antibiotic Use and Safety', type: 'video', duration: '4 min', category: 'medication', content: 'Antibiotic guidelines: Take full course even if feeling better, take at prescribed intervals, with or without food as directed, avoid alcohol if instructed, watch for allergic reactions (rash, difficulty breathing), report severe diarrhea, complete probiotics if recommended. Do not save for later or share. Antibiotic resistance occurs when not taken properly.' },
    { id: '19', title: 'Pain Medication Safety', type: 'article', duration: '8 min read', category: 'medication', content: 'Pain medication safety: Use lowest effective dose, take as prescribed, never exceed maximum daily dose, avoid alcohol, do not combine with other pain relievers without approval, watch for side effects (nausea, constipation, drowsiness), store securely, dispose properly, discuss concerns with doctor. Opioids require extra caution - risk of dependence.' },
    { id: '20', title: 'Medication Storage Tips', type: 'article', duration: '5 min read', category: 'medication', content: 'Proper medication storage: Store in cool, dry place unless refrigeration required. Avoid bathroom cabinets (humidity). Keep in original containers with labels. Store medications securely away from children and pets. Check expiration dates regularly. Dispose of expired medications properly (pharmacy take-back programs). Never flush unless specifically instructed. Keep list of current medications updated.' },
  ];

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || resource.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleCategoryClick = (categoryKey: string) => {
    setSelectedCategory(selectedCategory === categoryKey ? null : categoryKey);
  };

  const handleCreateCustomMaterial = () => {
    if (!customTitle || !customContent || !customCategory) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Handout Created",
      description: `"${customTitle}" has been created successfully.`,
    });

    setCustomTitle('');
    setCustomContent('');
    setCustomCategory('');
    setReadingLevel('standard');
    setLanguage('english');
    setIsCreateDialogOpen(false);
  };

  const handleDownloadResource = (resource: any) => {
    toast({
      title: "Download Started",
      description: `Downloading "${resource.title}"...`,
    });
  };

  const handleShareResource = (resource: any) => {
    toast({
      title: "Share Link Copied",
      description: `Share link for "${resource.title}" copied to clipboard.`,
    });
  };

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
          {selectedCategory && (
            <div className="mb-4">
              <Badge variant="secondary" className="text-sm">
                Filtered by: {categories.find(c => c.key === selectedCategory)?.title}
                <button onClick={() => setSelectedCategory(null)} className="ml-2">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
          <div className="grid gap-4">
            {filteredResources.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No resources found matching your search criteria.
                </CardContent>
              </Card>
            ) : (
              filteredResources.map((resource) => (
                <Card key={resource.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        {resource.type === 'video' ? (
                          <Video className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        ) : (
                          <FileText className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <CardTitle className="text-lg">{resource.title}</CardTitle>
                          <CardDescription>
                            {categories.find(c => c.key === resource.category)?.title} • {resource.duration}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleDownloadResource(resource)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => handleShareResource(resource)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" onClick={() => setSelectedResource(resource)}>View</Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl max-h-[80vh]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {resource.type === 'video' ? (
                                  <Video className="h-5 w-5 text-primary" />
                                ) : (
                                  <FileText className="h-5 w-5 text-primary" />
                                )}
                                {resource.title}
                              </DialogTitle>
                              <DialogDescription>
                                {categories.find(c => c.key === resource.category)?.title} • {resource.duration}
                              </DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="max-h-[60vh] pr-4">
                              <div className="prose prose-sm max-w-none">
                                <p className="whitespace-pre-line text-foreground">{resource.content}</p>
                              </div>
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="grid gap-4 md:grid-cols-2">
            {categories.map((category) => {
              const Icon = category.icon;
              const isSelected = selectedCategory === category.key;
              return (
                <Card 
                  key={category.title} 
                  className={`cursor-pointer hover:border-primary transition-colors ${isSelected ? 'border-primary bg-primary/5' : ''}`}
                  onClick={() => {
                    handleCategoryClick(category.key);
                    // Switch to browse tab to show filtered results
                    const browseTab = document.querySelector('[value="browse"]') as HTMLButtonElement;
                    browseTab?.click();
                  }}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className={`rounded-lg bg-background p-3 ${category.color}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle>{category.title}</CardTitle>
                        <CardDescription>
                          {resources.filter(r => r.category === category.key).length} resources
                        </CardDescription>
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
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" size="lg">
                      <BookOpen className="mr-2 h-4 w-4" />
                      Create New Handout
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl max-h-[90vh]">
                    <DialogHeader>
                      <DialogTitle>Create Custom Patient Handout</DialogTitle>
                      <DialogDescription>
                        Fill in the details to create a personalized educational material
                      </DialogDescription>
                    </DialogHeader>
                    <ScrollArea className="max-h-[calc(90vh-200px)] pr-4">
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">Handout Title *</Label>
                          <Input
                            id="title"
                            placeholder="e.g., Managing Your Heart Health"
                            value={customTitle}
                            onChange={(e) => setCustomTitle(e.target.value)}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="category">Category *</Label>
                          <Select value={customCategory} onValueChange={setCustomCategory}>
                            <SelectTrigger id="category">
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat.key} value={cat.key}>
                                  {cat.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="reading-level">Reading Level</Label>
                          <Select value={readingLevel} onValueChange={setReadingLevel}>
                            <SelectTrigger id="reading-level">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="elementary">Elementary (Grade 3-5)</SelectItem>
                              <SelectItem value="middle">Middle School (Grade 6-8)</SelectItem>
                              <SelectItem value="standard">Standard (Grade 9-12)</SelectItem>
                              <SelectItem value="advanced">Advanced (College+)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="language">Language</Label>
                          <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger id="language">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="english">English</SelectItem>
                              <SelectItem value="spanish">Spanish</SelectItem>
                              <SelectItem value="french">French</SelectItem>
                              <SelectItem value="chinese">Chinese</SelectItem>
                              <SelectItem value="arabic">Arabic</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="content">Content *</Label>
                          <Textarea
                            id="content"
                            placeholder="Enter the educational content here..."
                            value={customContent}
                            onChange={(e) => setCustomContent(e.target.value)}
                            rows={10}
                            className="resize-none"
                          />
                        </div>
                      </div>
                    </ScrollArea>
                    <div className="flex justify-end gap-2 pt-4 border-t">
                      <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCustomMaterial}>
                        Create Handout
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <div className="rounded-lg border bg-muted p-4">
                  <p className="text-sm font-medium text-foreground mb-2">
                    Custom materials can be:
                  </p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    <li>• Tailored to patient's reading level (Elementary to Advanced)</li>
                    <li>• Translated into multiple languages (English, Spanish, French, Chinese, Arabic)</li>
                    <li>• Branded with your practice information</li>
                    <li>• Shared via patient portal or email</li>
                    <li>• Downloaded as PDF for printing</li>
                    <li>• Customized for specific patient conditions</li>
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
