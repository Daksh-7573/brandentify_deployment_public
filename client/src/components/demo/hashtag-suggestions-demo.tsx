import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { HashtagSuggestionTip } from '@/components/musk-tips';

/**
 * Demo component to showcase the Musk hashtag suggestions feature
 */
export function HashtagSuggestionsDemo() {
  const [industry, setIndustry] = useState('Technology');
  const [domain, setDomain] = useState('Software Development');
  const [contentContext, setContentContext] = useState('');
  const [hashtags, setHashtags] = useState<string[]>([]);

  const handleAddHashtag = (hashtag: string) => {
    if (!hashtags.includes(hashtag)) {
      setHashtags([...hashtags, hashtag]);
    }
  };

  const handleRemoveHashtag = (hashtag: string) => {
    setHashtags(hashtags.filter(tag => tag !== hashtag));
  };

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Musk AI Hashtag Suggestions
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Create a Post</CardTitle>
              <CardDescription>
                Compose a professional post with AI-suggested hashtags
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={industry} onValueChange={setIndustry}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Technology">Technology</SelectItem>
                      <SelectItem value="Healthcare">Healthcare</SelectItem>
                      <SelectItem value="Finance">Finance</SelectItem>
                      <SelectItem value="Education">Education</SelectItem>
                      <SelectItem value="Marketing">Marketing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="domain">Domain</Label>
                  <Select value={domain} onValueChange={setDomain}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select domain" />
                    </SelectTrigger>
                    <SelectContent>
                      {industry === 'Technology' && (
                        <>
                          <SelectItem value="Software Development">Software Development</SelectItem>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="Cybersecurity">Cybersecurity</SelectItem>
                          <SelectItem value="Cloud Computing">Cloud Computing</SelectItem>
                        </>
                      )}
                      {industry === 'Healthcare' && (
                        <>
                          <SelectItem value="Medical Research">Medical Research</SelectItem>
                          <SelectItem value="Healthcare IT">Healthcare IT</SelectItem>
                          <SelectItem value="Telemedicine">Telemedicine</SelectItem>
                          <SelectItem value="Public Health">Public Health</SelectItem>
                        </>
                      )}
                      {industry === 'Finance' && (
                        <>
                          <SelectItem value="Investment Banking">Investment Banking</SelectItem>
                          <SelectItem value="FinTech">FinTech</SelectItem>
                          <SelectItem value="Personal Finance">Personal Finance</SelectItem>
                          <SelectItem value="Insurance">Insurance</SelectItem>
                        </>
                      )}
                      {industry === 'Education' && (
                        <>
                          <SelectItem value="Higher Education">Higher Education</SelectItem>
                          <SelectItem value="EdTech">EdTech</SelectItem>
                          <SelectItem value="K-12">K-12</SelectItem>
                          <SelectItem value="Special Education">Special Education</SelectItem>
                        </>
                      )}
                      {industry === 'Marketing' && (
                        <>
                          <SelectItem value="Digital Marketing">Digital Marketing</SelectItem>
                          <SelectItem value="Content Marketing">Content Marketing</SelectItem>
                          <SelectItem value="Social Media Marketing">Social Media Marketing</SelectItem>
                          <SelectItem value="Brand Strategy">Brand Strategy</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="post-content">Post Content</Label>
                  <Textarea 
                    id="post-content" 
                    placeholder="What would you like to share with your network?" 
                    className="min-h-[150px]"
                    value={contentContext}
                    onChange={(e) => setContentContext(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label>Selected Hashtags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {hashtags.length > 0 ? (
                      hashtags.map(tag => (
                        <span 
                          key={tag} 
                          className="bg-blue-100 text-blue-700 px-2 py-1 rounded-md text-sm flex items-center"
                        >
                          {tag}
                          <button 
                            className="ml-2 text-blue-500 hover:text-blue-700"
                            onClick={() => handleRemoveHashtag(tag)}
                          >
                            ×
                          </button>
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500 text-sm italic">No hashtags selected yet</p>
                    )}
                  </div>
                </div>
                
                <Button className="w-full">Post</Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <HashtagSuggestionTip 
            industry={industry}
            domain={domain}
            contentContext={contentContext}
            previouslyUsedHashtags={hashtags}
            count={8}
            onSelectHashtag={handleAddHashtag}
          />
          
          <Card>
            <CardHeader>
              <CardTitle>Why Use Hashtags?</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 list-disc pl-5">
                <li>Increase content visibility by up to 40%</li>
                <li>Connect with professionals in your industry</li>
                <li>Build your personal brand around specific topics</li>
                <li>Make your content discoverable through hashtag searches</li>
                <li>Join trending conversations in your field</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}