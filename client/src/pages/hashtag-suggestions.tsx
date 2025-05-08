import React from 'react';
import { HashtagSuggestionsDemo } from '@/components/demo/hashtag-suggestions-demo';
import { PageLayout } from '@/components/ui/page-layout';

/**
 * Page component that displays the hashtag suggestions demo
 */
export function HashtagSuggestionsPage() {
  return (
    <PageLayout title="Musk AI Hashtag Suggestions">
      <div className="container py-8 flex flex-col items-center">
        <h1 className="text-3xl font-bold tracking-tight mb-8 text-center">
          Musk AI Hashtag Suggestions
        </h1>
        
        <div className="max-w-4xl mx-auto space-y-4">
          <p className="text-lg text-center mb-8 text-muted-foreground">
            Musk AI helps professionals increase content visibility with intelligent hashtag suggestions tailored to their industry, domain, and post content.
          </p>
          
          <HashtagSuggestionsDemo />
        </div>
      </div>
    </PageLayout>
  );
}