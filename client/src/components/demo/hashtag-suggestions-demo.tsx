import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { HashtagSuggestionTip } from '@/components/musk-tips';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Demo component to showcase the Musk hashtag suggestions feature
 */
export function HashtagSuggestionsDemo() {
  const [industry, setIndustry] = useState('Technology');
  const [domain, setDomain] = useState('Software Development');
  const [contentContext, setContentContext] = useState('');
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([]);
  const [demoMode, setDemoMode] = useState<'compose' | 'insert'>('compose');

  // Industry options
  const industries = [
    'Technology',
    'Healthcare',
    'Finance',
    'Marketing',
    'Education',
    'Manufacturing',
    'Retail',
    'Hospitality',
    'Media',
    'Consulting'
  ];

  // Domain options based on selected industry
  const domainOptions: Record<string, string[]> = {
    'Technology': [
      'Software Development',
      'Data Science',
      'Cybersecurity',
      'Cloud Computing',
      'UI/UX Design',
      'DevOps',
      'Artificial Intelligence',
      'Blockchain'
    ],
    'Healthcare': [
      'Nursing',
      'Medical Research',
      'Hospital Administration',
      'Public Health',
      'Mental Health',
      'Pharmaceutical',
      'Health Informatics',
      'Telemedicine'
    ],
    'Finance': [
      'Banking',
      'Investment',
      'Financial Planning',
      'Insurance',
      'Accounting',
      'Risk Management',
      'Financial Analysis',
      'FinTech'
    ],
    'Marketing': [
      'Digital Marketing',
      'Content Marketing',
      'Social Media',
      'Brand Management',
      'Market Research',
      'SEO/SEM',
      'Public Relations',
      'Email Marketing'
    ],
    'Education': [
      'K-12 Teaching',
      'Higher Education',
      'Educational Technology',
      'Special Education',
      'Curriculum Development',
      'Educational Administration',
      'Online Learning',
      'Career Counseling'
    ],
    'Manufacturing': [
      'Production',
      'Quality Control',
      'Supply Chain',
      'Industrial Engineering',
      'Product Design',
      'Automation',
      'Operations Management',
      'Lean Manufacturing'
    ],
    'Retail': [
      'Store Management',
      'E-commerce',
      'Merchandising',
      'Retail Operations',
      'Customer Experience',
      'Inventory Management',
      'Retail Analytics',
      'Visual Merchandising'
    ],
    'Hospitality': [
      'Hotel Management',
      'Food & Beverage',
      'Event Planning',
      'Tourism',
      'Customer Service',
      'Revenue Management',
      'Hospitality Marketing',
      'Guest Relations'
    ],
    'Media': [
      'Journalism',
      'Content Creation',
      'Broadcasting',
      'Film Production',
      'Digital Media',
      'Publishing',
      'Social Media Management',
      'Advertising'
    ],
    'Consulting': [
      'Management Consulting',
      'IT Consulting',
      'Strategy Consulting',
      'Human Resources Consulting',
      'Financial Consulting',
      'Healthcare Consulting',
      'Operations Consulting',
      'Marketing Consulting'
    ]
  };

  // Get domains for current industry
  const domains = domainOptions[industry] || [];

  // Handle adding a hashtag to selected list
  const handleSelectHashtag = (hashtag: string) => {
    if (!selectedHashtags.includes(hashtag)) {
      setSelectedHashtags([...selectedHashtags, hashtag]);
    }
  };

  // Handle removing a hashtag from selected list
  const handleRemoveHashtag = (hashtag: string) => {
    setSelectedHashtags(selectedHashtags.filter(tag => tag !== hashtag));
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Musk's Hashtag Suggestions
          <Badge variant="outline" className="ml-2 text-xs font-normal">
            Powered by AI
          </Badge>
        </CardTitle>
        <CardDescription>
          Get intelligent, context-aware hashtag suggestions for your professional posts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={demoMode} onValueChange={(v) => setDemoMode(v as any)} className="mb-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="compose">Compose Post</TabsTrigger>
            <TabsTrigger value="insert">Insert Mode</TabsTrigger>
          </TabsList>
          
          <TabsContent value="compose" className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="industry">Industry</Label>
              <Select 
                value={industry} 
                onValueChange={setIndustry}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="domain">Domain</Label>
              <Select 
                value={domain} 
                onValueChange={setDomain}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map(dom => (
                    <SelectItem key={dom} value={dom}>{dom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <Label htmlFor="content">Post Content</Label>
                <span className="text-xs text-muted-foreground">
                  {contentContext.length} / 500
                </span>
              </div>
              <Textarea
                id="content"
                value={contentContext}
                onChange={(e) => setContentContext(e.target.value)}
                placeholder="Type your post content here..."
                className="min-h-[120px]"
                maxLength={500}
              />
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div className="text-sm font-medium">Selected Hashtags</div>
              <HashtagSuggestionTip
                industry={industry}
                domain={domain}
                contentContext={contentContext}
                previouslyUsedHashtags={selectedHashtags}
                onSelect={handleSelectHashtag}
                tipText={`${selectedHashtags.length > 0 ? 'More' : 'Suggested'} hashtags for your post:`}
              />
            </div>
            
            <div className="flex flex-wrap gap-2 min-h-[50px] pt-2">
              {selectedHashtags.length === 0 ? (
                <div className="text-sm text-muted-foreground italic">
                  No hashtags selected. Click the "Hashtag Ideas" button above to get suggestions.
                </div>
              ) : (
                selectedHashtags.map((hashtag, index) => (
                  <Badge 
                    key={`${hashtag}-${index}`}
                    variant="secondary"
                    className="pl-2 pr-1 py-1 cursor-pointer flex items-center gap-1"
                  >
                    <span>{hashtag}</span>
                    <button 
                      onClick={() => handleRemoveHashtag(hashtag)}
                      className="h-4 w-4 rounded-full hover:bg-muted-foreground/20 inline-flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Remove {hashtag}</span>
                    </button>
                  </Badge>
                ))
              )}
            </div>
            
            <div className="pt-4 border-t">
              <Label className="text-sm text-muted-foreground mb-2 block">Preview:</Label>
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="mb-3">
                  {contentContext || <span className="text-muted-foreground italic">Your post content will appear here...</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedHashtags.map((hashtag, index) => (
                    <Badge 
                      key={`preview-${hashtag}-${index}`}
                      variant="outline"
                      className="bg-background/50"
                    >
                      {hashtag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="insert" className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="industry-insert">Industry</Label>
              <Select 
                value={industry} 
                onValueChange={setIndustry}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(ind => (
                    <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-1">
              <Label htmlFor="domain-insert">Domain</Label>
              <Select 
                value={domain} 
                onValueChange={setDomain}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {domains.map(dom => (
                    <SelectItem key={dom} value={dom}>{dom}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="pt-4">
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium">Post Editor</span>
                  <span className="text-xs text-muted-foreground">
                    (Simulated editor interface)
                  </span>
                </div>
                
                <div className="bg-background p-3 rounded border mb-4">
                  <Textarea
                    value={contentContext}
                    onChange={(e) => setContentContext(e.target.value)}
                    placeholder="Type your post content here..."
                    className="min-h-[120px] border-none focus-visible:ring-0 focus-visible:ring-offset-0 p-0 shadow-none"
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <div className="w-8 h-8 rounded bg-muted"></div>
                    <div className="w-8 h-8 rounded bg-muted"></div>
                    <div className="w-8 h-8 rounded bg-muted"></div>
                  </div>
                  
                  <HashtagSuggestionTip
                    industry={industry}
                    domain={domain}
                    contentContext={contentContext}
                    previouslyUsedHashtags={[]}
                    onSelect={(hashtag) => {
                      setContentContext(prev => 
                        prev + (prev.length > 0 && !prev.endsWith(' ') ? ' ' : '') + hashtag + ' '
                      );
                    }}
                    tipText="Insert hashtags in your post:"
                    className="ml-auto"
                  />
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2">
                In this mode, clicking a hashtag will insert it directly into your post content. Try it!
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className={cn(
          "mt-8 p-4 bg-amber-50 border border-amber-100 rounded-lg",
          "flex items-start gap-3 text-amber-800"
        )}>
          <div className="bg-amber-100 p-1.5 rounded-full h-fit">
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 15 15"
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
              className="text-amber-600"
            >
              <path
                d="M7.5 0.875C5.49797 0.875 3.875 2.49797 3.875 4.5C3.875 6.15288 4.98124 7.54738 6.49373 7.98351C5.2997 8.12901 4.27557 8.55134 3.50407 9.31167C2.52216 10.2794 2 11.6074 2 13.25C2 13.4142 2.13582 13.55 2.3 13.55C2.46418 13.55 2.6 13.4142 2.6 13.25C2.6 11.8074 3.02783 10.7206 3.81093 9.94832C4.59403 9.17603 5.69807 8.75 7 8.75C8.30193 8.75 9.40597 9.17603 10.1891 9.94832C10.9722 10.7206 11.4 11.8074 11.4 13.25C11.4 13.4142 11.5358 13.55 11.7 13.55C11.8642 13.55 12 13.4142 12 13.25C12 11.6074 11.4778 10.2794 10.4959 9.31167C9.72443 8.55134 8.7003 8.12901 7.50627 7.98351C9.01876 7.54738 10.125 6.15288 10.125 4.5C10.125 2.49797 8.50203 0.875 6.5 0.875H7.5ZM4.475 4.5C4.475 2.82911 5.82911 1.475 7.5 1.475C9.17089 1.475 10.525 2.82911 10.525 4.5C10.525 6.17089 9.17089 7.525 7.5 7.525C5.82911 7.525 4.475 6.17089 4.475 4.5Z"
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
              ></path>
            </svg>
          </div>
          <div>
            <div className="text-sm font-medium mb-1">How Musk makes hashtag suggestions</div>
            <div className="text-xs leading-relaxed">
              Musk uses AI to analyze your industry, domain, and post content to suggest relevant hashtags. 
              The suggestions are tailored to professional networking, prioritizing trending industry-specific
              hashtags that will help increase your content's visibility to the right audience.
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}