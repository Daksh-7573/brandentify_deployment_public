import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface QuestPanelProps {
  userId?: number;
  className?: string;
}

export function QuestPanelSimple({ userId, className }: QuestPanelProps) {
  console.log('💥💥💥 SIMPLE QUEST PANEL COMPONENT LOADED! 💥💥💥');
  console.log('🔥 Cache cleared - component should work now! 🔥');
  const [mainTabValue, setMainTabValue] = useState('brand-quests');
  const [socialQuestTabValue, setSocialQuestTabValue] = useState('weekly');

  return (
    <div className={className}>
      <Tabs value={mainTabValue} onValueChange={setMainTabValue}>
        <TabsList className="grid grid-cols-2 mb-4 dark-tabs-list border border-white/5 w-full h-auto">
          <TabsTrigger value="brand-quests" className="dark-tabs-trigger">Brand Quests</TabsTrigger>
          <TabsTrigger value="social-quests" className="dark-tabs-trigger">Social Quests</TabsTrigger>
        </TabsList>

        <TabsContent value="brand-quests">
          <div className="text-white">Brand Quest Content</div>
        </TabsContent>

        <TabsContent value="social-quests">
          {(() => { console.log('🔥 SOCIAL QUEST TAB CONTENT RENDERING!'); return null; })()}
          <Tabs defaultValue="weekly" value={socialQuestTabValue} onValueChange={setSocialQuestTabValue}>
            <TabsList className="grid grid-cols-3 mb-4 dark-tabs-list border border-white/5 w-full h-auto">
              <TabsTrigger value="weekly" className="dark-tabs-trigger">Weekly (4)</TabsTrigger>
              <TabsTrigger value="completed" className="dark-tabs-trigger">Completed (0)</TabsTrigger>
              <TabsTrigger value="missed" className="dark-tabs-trigger">Missed (0)</TabsTrigger>
            </TabsList>

            <TabsContent value="weekly">
              <div className="text-white">Weekly Social Quests</div>
            </TabsContent>

            <TabsContent value="completed">
              <div className="text-white">Completed Social Quests</div>
            </TabsContent>

            <TabsContent value="missed">
              <div className="text-white">Missed Social Quests</div>
            </TabsContent>
          </Tabs>
        </TabsContent>
      </Tabs>
    </div>
  );
}