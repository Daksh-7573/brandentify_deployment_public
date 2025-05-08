import React from 'react';
import { PageLayout } from '@/components/layout/page-layout';
import { HashtagSuggestionsDemo } from '@/components/demo/hashtag-suggestions-demo';

/**
 * Page component that displays the hashtag suggestions demo
 */
export function HashtagSuggestionsPage() {
  return (
    <PageLayout>
      <HashtagSuggestionsDemo />
    </PageLayout>
  );
}

export default HashtagSuggestionsPage;