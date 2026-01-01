import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { UserQuest, QuestDefinition, QuestType, QuestStatus, getQuestTypeIcon, getQuestStatusLabel, getBadgeLabel } from '@/types/career-quest';
import { useCompleteQuest, useUpdateQuestProgress } from '@/hooks/use-career-quests';
import { StaticHashtagSuggestions } from '@/components/brand-quests/static-hashtag-suggestions';
import { PostSuggestionDisplay } from '@/components/brand-quests/post-suggestion-display';

interface QuestCardProps {
  quest: UserQuest;
  onActionClick?: (quest: UserQuest) => void;
}

export function QuestCard({ quest, onActionClick }: QuestCardProps) {
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);
  
  const completeQuestMutation = useCompleteQuest();
  const updateProgressMutation = useUpdateQuestProgress();
  
  // Handle all possible API data structures:
  // 1. quest.questDefinition (original format)
  // 2. quest.definition (direct DB query format)
  // 3. Flattened properties (direct from new API)
  
  // Extract base definition from available sources
  const baseDefinition = quest.questDefinition || quest.definition || {};
  
  // Final emergency check for fields that might be directly on the quest object with slightly different names
  Object.keys(quest).forEach(key => {
    const val = (quest as any)[key];
    if (!val) return;
    
    const lowerKey = key.toLowerCase();
    // Prioritize title mapping
    if (!questDefinition.title && (lowerKey === 'title' || lowerKey === 'label' || lowerKey.includes('questtitle') || lowerKey.includes('personalizedtitle') || lowerKey.includes('deftitle') || lowerKey.includes('gentitle'))) {
      questDefinition.title = val;
    }
    // Prioritize description mapping
    if (!questDefinition.description && (lowerKey === 'description' || lowerKey.includes('content') || lowerKey.includes('questdescription') || lowerKey.includes('personalizeddescription') || lowerKey.includes('defdescription') || lowerKey.includes('gendescription'))) {
      questDefinition.description = val;
    }
    // Prioritize muskTip mapping
    if (!questDefinition.muskTip && (lowerKey === 'musktip' || lowerKey === 'tip' || lowerKey.includes('response') || lowerKey.includes('guidance') || lowerKey.includes('musk_tip') || lowerKey.includes('gen_musk_tip'))) {
      questDefinition.muskTip = val;
    }
  });

  // LOG THE QUEST OBJECT TO SEE ITS STRUCTURE
  if (!questDefinition.title || !questDefinition.description) {
    console.log('[QUEST CARD] Missing Field Debug:', {
      id: quest.id,
      questObject: quest,
      mappedDefinition: questDefinition,
      topLevelKeys: Object.keys(quest)
    });
  }

  // Merge definition with top-level properties to ensure we get personalized data
  // We prioritize the properties found directly on the quest object first, then the definition
  // We use both camelCase and snake_case to handle different API response formats
  // AND we check both with and without prefixes (questTitle vs title)
  const questDefinition = {
    id: (quest as any).questDefinitionId || (quest as any).quest_definition_id || (baseDefinition as any).id || (quest as any).id,
    title: (quest as any).title || (quest as any).personalizedTitle || (quest as any).questTitle || (quest as any).quest_title || (quest as any).personalized_title || (baseDefinition as any).title || (baseDefinition as any).questTitle || (baseDefinition as any).quest_title || (quest as any).def_title || (quest as any).defTitle || (quest as any).gen_title || (quest as any).genTitle || '',
    description: (quest as any).description || (quest as any).personalizedDescription || (quest as any).questDescription || (quest as any).quest_description || (quest as any).personalized_description || (baseDefinition as any).description || (baseDefinition as any).questDescription || (baseDefinition as any).quest_description || (quest as any).def_description || (quest as any).defDescription || (quest as any).gen_description || (quest as any).genDescription || '',
    type: (quest as any).type || (quest as any).questType || (quest as any).quest_type || (baseDefinition as any).type || (baseDefinition as any).quest_type || (quest as any).def_type || (quest as any).defType || 'social_quest',
    targetCount: (quest as any).targetCount || (quest as any).target_count || (quest as any).def_target_count || (quest as any).defTargetCount || (quest as any).target_action_count || (baseDefinition as any).targetCount || (baseDefinition as any).target_count || 1,
    targetAction: (quest as any).targetAction || (quest as any).target_action || (quest as any).def_target_action || (quest as any).defTargetAction || (baseDefinition as any).targetAction || (baseDefinition as any).target_action || '',
    xpReward: (quest as any).xpReward || (quest as any).xp_reward || (quest as any).xpRewardEarned || (quest as any).xp_reward_earned || (quest as any).def_xp_reward || (quest as any).defXpReward || (baseDefinition as any).xpReward || (baseDefinition as any).xp_reward || 0,
    badgeReward: (quest as any).badgeReward || (quest as any).badge_reward || (baseDefinition as any).badgeReward || (baseDefinition as any).badge_reward || (quest as any).defBadgeReward || undefined,
    muskTip: (quest as any).muskTip || (quest as any).musk_tip || (quest as any).personalizedMuskTip || (quest as any).personalized_musk_tip || (quest as any).questMuskTip || (quest as any).muskResponse || (quest as any).musk_response || (quest as any).def_musk_tip || (quest as any).defMuskTip || (quest as any).gen_musk_tip || (quest as any).genMuskTip || (baseDefinition as any).muskTip || (baseDefinition as any).musk_tip || '',
    isActive: (quest as any).isActive !== undefined ? (quest as any).isActive : ((baseDefinition as any).isActive !== undefined ? (baseDefinition as any).isActive : true),
    createdAt: (quest as any).createdAt || (quest as any).assignedAt || (quest as any).assigned_at || (quest as any).created_at || (baseDefinition as any).createdAt || '',
    updatedAt: (quest as any).updatedAt || (quest as any).updated_at || (baseDefinition as any).updatedAt || ''
  };

  // Final emergency mapping using Object.keys to handle any dynamic field variations
  Object.keys(quest).forEach(key => {
    const val = (quest as any)[key];
    if (!val || typeof val !== 'string') return;
    const lowerKey = key.toLowerCase();
    if (!questDefinition.title && (lowerKey.includes('title') || lowerKey === 'label')) questDefinition.title = val;
    if (!questDefinition.description && (lowerKey.includes('description') || lowerKey.includes('content'))) questDefinition.description = val;
    if (!questDefinition.muskTip && (lowerKey.includes('tip') || lowerKey.includes('response') || lowerKey.includes('guidance'))) questDefinition.muskTip = val;
  });

  // Add more robust platform check for social quests
  const platform = (quest as any).platform || (quest as any).socialPlatform || (quest as any).social_platform || '';
  if (platform && !questDefinition.targetAction) {
    questDefinition.targetAction = `post_${platform.toLowerCase()}_suggestion`;
  }
  
  // Ensure targetCount has a minimum value of 1 to prevent division by zero
  const targetCount = questDefinition.targetCount || 1;
  const isComplete = quest.status?.toLowerCase() === 'completed';
  const isExpired = quest.status?.toLowerCase() === 'expired';
  const isActive = quest.status?.toLowerCase() === 'active';
  
  // Fix progress display logic: if completed, show full progress regardless of database value
  const displayProgress = isComplete ? targetCount : quest.progress;
  const progressPercentage = Math.min(100, Math.floor((displayProgress / targetCount) * 100));
  
  const handleActionClick = () => {
    if (onActionClick) {
      onActionClick(quest);
    } else {
      // Default action to increment progress by 1
      if (isActive && quest.progress < questDefinition.targetCount) {
        updateProgressMutation.mutate({
          questId: quest.id,
          progress: quest.progress + 1,
          userId: quest.userId
        }, {
          onSuccess: () => {
            toast({
              title: 'Progress updated',
              description: `Progress on "${questDefinition.title}" has been updated.`,
            });
          },
          onError: (error) => {
            toast({
              title: 'Error',
              description: `Failed to update progress: ${error.message}`,
              variant: 'destructive',
            });
          }
        });
      }
    }
  };
  
  const handleComplete = () => {
    // Prevent multiple clicks by checking if already pending
    if (completeQuestMutation.isPending) {
      return; // Ignore if already processing
    }
    
    setConfirmOpen(false);
    
    // Execute the mutation with optimistic updates for immediate UI response
    completeQuestMutation.mutate({
      questId: quest.id,
      userId: quest.userId
    }, {
      onSuccess: () => {
        // Show success feedback only after successful server response
        toast({
          title: 'Quest completed!',
          description: `You've completed "${questDefinition.title}" and earned ${questDefinition.xpReward} XP!`,
        });
      },
      onError: (error) => {
        // Show error toast if the server request fails
        toast({
          title: 'Error',
          description: `Failed to complete quest: ${error.message}`,
          variant: 'destructive',
        });
      }
    });
  };
  
  // Convert UTC time window to user's local timezone
  const formatRecommendedTime = (utcTimeWindow: string): { local: string; utc: string } => {
    try {
      // Parse time window like "14:00-16:00 UTC"
      const match = utcTimeWindow.match(/(\d{2}):(\d{2})-(\d{2}):(\d{2})\s*UTC/i);
      if (!match) return { local: utcTimeWindow, utc: utcTimeWindow };
      
      const [, startHour, startMin, endHour, endMin] = match;
      
      // Create Date objects for today at the specified UTC times
      const now = new Date();
      const startDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 
        parseInt(startHour), parseInt(startMin), 0));
      const endDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 
        parseInt(endHour), parseInt(endMin), 0));
      
      // Format to user's local time
      const timeFormat = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short'
      });
      
      const startLocal = timeFormat.format(startDate);
      const endLocal = timeFormat.format(endDate);
      
      // Extract just the time part for end (without timezone)
      const endTimeOnly = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(endDate);
      
      return {
        local: `${startLocal.split(' ')[0]} - ${endTimeOnly} ${startLocal.split(' ').slice(1).join(' ')}`,
        utc: utcTimeWindow
      };
    } catch (error) {
      console.error('Error formatting time:', error);
      return { local: utcTimeWindow, utc: utcTimeWindow };
    }
  };
  
  const formattedPostTime = quest.recommendedPostTime 
    ? formatRecommendedTime(quest.recommendedPostTime) 
    : null;
  
  // Get the Musk tip content from any available source in priority order
  const rawMuskTipContent = 
    // Check definition first as it's the standard source
    questDefinition.muskTip ||
    // Then check direct properties from social quest V2
    (quest as any).personalizedMuskTip ||
    (quest as any).muskTip ||
    (quest as any).musk_tip ||
    (quest as any).muskResponse ||
    (quest as any).musk_response ||
    // Then check definition properties (API response structure)
    quest.definition?.muskTip ||
    quest.definition?.musk_tip ||
    // Then check questDefinition
    quest.questDefinition?.muskTip ||
    // Then check direct properties
    quest.muskTip || 
    // Final fallback for debugging
    (quest.definition && (quest.definition as any).muskTip ? (quest.definition as any).muskTip : null) ||
    (quest as any).def_musk_tip ||
    (quest as any).gen_musk_tip;

  // Extract hashtag suggestions and clean the tip content
  const extractHashtagsAndCleanTip = (content: string) => {
    if (!content) return { cleanContent: '', hashtags: [] };
    
    // Pattern to match both "hashtag suggestions" and "strategic hashtags"
    const hashtagPattern = /💡 Musk's (hashtag suggestions|strategic hashtags):\s*([#\w\s,]+)/mi;
    const match = content.match(hashtagPattern);
    
    if (match) {
      const hashtagsText = match[2].trim(); 
      const hashtags = hashtagsText
        .split(/[,\s]+/)
        .filter(tag => tag.trim().startsWith('#'))
        .map(tag => tag.trim().substring(1)); // Remove the # symbol
      
      const cleanContent = content.replace(hashtagPattern, '').trim();
      return { cleanContent, hashtags };
    }
    
    // Check for hashtags anywhere in the content if no prefix is found
    // This is more aggressive than just looking at the end
    const anyHashtagsPattern = /#\w+/g;
    const allMatches = content.match(anyHashtagsPattern);
    
    // Check if the content is JUST hashtags (often happens with generated social quests)
    const justHashtagsPattern = /^([#]\w+[\s,]*)+$/;
    if (justHashtagsPattern.test(content.trim()) && allMatches) {
       return { cleanContent: '', hashtags: allMatches.map(tag => tag.substring(1)) };
    }

    if (allMatches && allMatches.length > 0) {
       const hashtags = allMatches.map(tag => tag.substring(1));
       return { cleanContent: content, hashtags };
    }

    return { cleanContent: content, hashtags: [] };
  };

  const { cleanContent: muskTipContent, hashtags: extractedHashtags } = extractHashtagsAndCleanTip(rawMuskTipContent || '');
  
  // Get hashtags from database or extracted from tip
  const displayHashtags = (quest as any).suggestedHashtags && (quest as any).suggestedHashtags.length > 0 
    ? (quest as any).suggestedHashtags 
    : (extractedHashtags.length > 0 ? extractedHashtags : ((questDefinition as any).suggestedHashtags || []));
  
  // Check if this is a Social Quest (platform-specific social media quest)
  // Check both targetAction and quest title patterns since targetAction might be empty
  const socialQuestActions = ['post_linkedin_suggestion', 'post_instagram_suggestion', 'post_twitter_suggestion', 'post_youtube_suggestion', 'post_facebook_suggestion', 'post_tiktok_suggestion'];
  const socialQuestTitles = ['LinkedIn', 'Instagram', 'Twitter', 'YouTube', 'Facebook', 'TikTok'];
  
  const questType = (questDefinition.type as string)?.toLowerCase() || '';
  
  const isSocialQuest = socialQuestActions.includes(questDefinition.targetAction || '') ||
    socialQuestTitles.some(platform => questDefinition.title?.includes(platform)) ||
    displayHashtags.length > 0 ||
    questType === 'social_quest' ||
    questType === 'social_post' ||
    questType.includes('social'); // Added more flexible check
  
  // Ensure hashtags are always present for social quests if possible
  if (isSocialQuest && displayHashtags.length === 0) {
    const combinedContent = `${questDefinition.title} ${questDefinition.description} ${rawMuskTipContent}`;
    const autoHashtags = combinedContent.match(/#\w+/g);
    if (autoHashtags) {
      displayHashtags = Array.from(new Set(autoHashtags.map(tag => tag.substring(1))));
    }
  }

  // Final check: if title is STILL empty but we have a platform, create a default title
  if (!questDefinition.title && platform) {
    questDefinition.title = `Post on ${platform}`;
  }


  // Get platform-specific icon based on quest title
  const getPlatformIconFromTitle = (title: string): string => {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('linkedin')) return '💼';
    if (titleLower.includes('instagram')) return '📸'; 
    if (titleLower.includes('twitter')) return '🐦';
    if (titleLower.includes('facebook')) return '📘';
    if (titleLower.includes('tiktok')) return '🎵';
    if (titleLower.includes('youtube')) return '📺';
    if (titleLower.includes('pinterest')) return '📌';
    if (titleLower.includes('medium')) return '📝';
    return '📱'; // Default social media icon
  };

  // Get platform-specific icon for social_post quests (legacy)
  const getPlatformIcon = (targetAction: string): string => {
    const platformIcons: { [key: string]: string } = {
      'post_linkedin_suggestion': '💼',
      'post_instagram_suggestion': '📸', 
      'post_twitter_suggestion': '🐦',
      'post_youtube_suggestion': '📺',
      'post_facebook_suggestion': '👥',
      'post_tiktok_suggestion': '🎵',
      'post_multi_platform_suggestion': '🌐',
      'post_hashtag_optimized_suggestion': '🏷️',
      'post_visual_content_suggestion': '🖼️',
      'post_engagement_optimized_suggestion': '🎯'
    };
    return platformIcons[targetAction] || '📱';
  };

  // Determine which icon to show
  const getQuestIcon = (): string => {
    const questType = questDefinition?.type || quest.questType || 'pulse_creation';
    const targetAction = questDefinition?.targetAction || quest.targetAction;
    const title = questDefinition?.title || '';
    
    // For social quests, use platform-specific icons based on title
    if (isSocialQuest || questType === 'social_quest') {
      return getPlatformIconFromTitle(title);
    }
    
    if (questType === 'social_post' && targetAction) {
      return getPlatformIcon(targetAction);
    }
    return getQuestTypeIcon(questType);
  };
  
  return (
    <div className="w-full bg-black/20 backdrop-blur-md border border-white/10 rounded-xl p-5 shadow-lg transition-all hover:shadow-xl hover:bg-black/30 hover:scale-[1.02] duration-300">
      <div className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              {/* Show platform badge for social quests instead of generic icon */}
              {((questDefinition as any)?.platform || (quest.definition as any)?.platform) ? (
                <Badge variant="outline" className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 font-semibold px-3 py-1 text-sm">
                  {((questDefinition as any)?.platform || (quest.definition as any)?.platform)?.charAt(0).toUpperCase() + 
                   ((questDefinition as any)?.platform || (quest.definition as any)?.platform)?.slice(1)}
                </Badge>
              ) : (
                <span className="text-xl text-white">{getQuestIcon()}</span>
              )}
              <h3 className="text-lg font-semibold text-white">{questDefinition?.title}</h3>
            </div>
            {questDefinition?.badgeReward && (
              <Badge variant="outline" className="ml-7 mt-1 bg-black/30 text-white border-white/10 backdrop-blur-sm">
                Award: {getBadgeLabel(questDefinition?.badgeReward)}
              </Badge>
            )}
          </div>
          <Badge 
            className={
              isComplete ? "bg-black/40 text-green-300 hover:bg-black/50 border-white/10 backdrop-blur-sm" : 
              isExpired ? "bg-black/40 text-red-300 border-white/10 hover:bg-black/50 backdrop-blur-sm" : 
              "bg-black/40 text-blue-300 border-white/10 hover:bg-black/50 backdrop-blur-sm"
            }
          >
            {getQuestStatusLabel(quest.status)}
          </Badge>
        </div>
        <p className="ml-7 mt-1 text-white/80 text-sm">
          {questDefinition?.description}
        </p>
        
        {/* Deliverable Specifications - New specific quest metadata */}
        {((questDefinition as any)?.deliverableFormat || (questDefinition as any)?.quantityType || (quest as any).deliverableFormat) && (
          <div className="ml-7 mt-3 bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 space-y-1.5">
            {((questDefinition as any)?.deliverableFormat || (quest as any).deliverableFormat) && (
              <div className="flex items-start gap-2 text-xs text-blue-200">
                <span className="font-semibold">📋 Deliverable:</span>
                <span>{(questDefinition as any).deliverableFormat || (quest as any).deliverableFormat}</span>
              </div>
            )}
            {((questDefinition as any)?.quantityValue || (quest as any).quantityValue) && ((questDefinition as any)?.quantityType || (quest as any).quantityType) && (
              <div className="flex items-start gap-2 text-xs text-blue-200">
                <span className="font-semibold">🎯 Requirement:</span>
                <span>{(questDefinition as any).quantityValue || (quest as any).quantityValue} {(questDefinition as any).quantityType || (quest as any).quantityType}</span>
              </div>
            )}
            {/* Show detailed Type for career quests, Platform for social quests */}
            {questDefinition.type && (
              <div className="flex items-start gap-2 text-xs text-blue-200">
                {questDefinition.type === 'social_quest' || questDefinition.type === 'social_post' ? (
                  <>
                    <span className="font-semibold">📱 Platform:</span>
                    <span>{(questDefinition as any).platformConstraints || (questDefinition as any).platform || (quest as any).platform || 'Social Media'}</span>
                  </>
                ) : (
                  <>
                    <span className="font-semibold">📋 Type:</span>
                    <span className="capitalize">
                      {questDefinition.type.replace(/_/g, ' ')}
                      {questDefinition.targetAction && questDefinition.targetAction !== 'default' && (
                        <span className="text-blue-300"> - {questDefinition.targetAction.replace(/_/g, ' ').replace(/add |create |update /gi, '').split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}</span>
                      )}
                    </span>
                  </>
                )}
              </div>
            )}
            {((questDefinition as any)?.guidanceSnippet || (quest as any).guidanceSnippet) && (
              <div className="flex items-start gap-2 text-xs text-blue-200">
                <span className="font-semibold">💡 How:</span>
                <span>{(questDefinition as any).guidanceSnippet || (quest as any).guidanceSnippet}</span>
              </div>
            )}
          </div>
        )}
        
        {/* Quest Date and Posting Time Info */}
        <div className="ml-7 mt-3 space-y-2">
          {quest.assignedDate && (
            <div className="flex items-center gap-2 text-xs text-white/60">
              <span>📅</span>
              <span>Assigned: {new Date(quest.assignedDate).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}</span>
            </div>
          )}
          
          {quest.recommendedPostTime && (
            <div className="flex items-center gap-2 text-xs">
              <span>⏰</span>
              <span className="text-emerald-400 font-medium">
                Best time to post: {quest.recommendedPostTime}
              </span>
              {quest.confidenceScore && quest.confidenceScore > 70 && (
                <span className="text-xs text-white/50">
                  ({quest.confidenceScore}% confidence)
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="py-3">
        <div className="space-y-3">
          <div className="flex justify-between text-sm text-white/70 mb-2">
            <span className="font-medium">Progress: {displayProgress} / {questDefinition?.targetCount || 1}</span>
            <span className="text-blue-300 font-medium">+{questDefinition?.xpReward || 50} XP</span>
          </div>
          <div className="relative">
            <div className="w-full bg-white/10 rounded-full h-2 backdrop-blur-sm border border-white/20">
              <div 
                className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full transition-all duration-500 shadow-lg shadow-blue-500/20"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          
          {muskTipContent && (
            <div className="mt-3 bg-white/5 p-3 rounded-lg border border-white/20 backdrop-blur-md shadow-inner">
              <div className="flex items-center gap-2 text-sm font-medium mb-2 text-white">
                <span className="text-yellow-400">⚡</span>
                <span>Musk's Tip</span>
              </div>
              <p className="text-sm text-white/80 leading-relaxed">{muskTipContent}</p>
              
              {/* Add StaticHashtagSuggestions component for pulse creation quests */}
              {(questDefinition.type === 'pulse_creation' || 
                questDefinition.targetAction === 'create_pulse' || 
                (questDefinition.description && questDefinition.description.toLowerCase().includes('pulse'))) && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-white/70 mb-2">
                    <span className="mr-1">💡</span> Musk's hashtag suggestions:
                  </div>
                  <StaticHashtagSuggestions 
                    questType="pulse_creation"
                    count={7}
                    onHashtagClick={(hashtag) => {
                      navigator.clipboard.writeText(hashtag);
                      toast({
                        title: "Hashtag copied",
                        description: `#${hashtag} copied to clipboard`
                      });
                    }}
                  />
                </div>
              )}
              
              {/* Add StaticHashtagSuggestions component for Social Quests */}
              {isSocialQuest && displayHashtags.length > 0 && (
                <div className="mt-3">
                  <div className="text-sm font-medium text-white/70 mb-2">
                    <span className="mr-1">💡</span> Musk's hashtag suggestions:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {displayHashtags.map((hashtag: string, index: number) => (
                      <button
                        key={index}
                        onClick={() => {
                          navigator.clipboard.writeText(`#${hashtag}`);
                          toast({
                            title: "Hashtag copied",
                            description: `#${hashtag} copied to clipboard`
                          });
                        }}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-300 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/30 transition-all duration-200 cursor-pointer"
                      >
                        #{hashtag}
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
      <div className="pt-3 flex flex-col border-t border-white/5">
        {/* Quest progress info badge */}
        <div className="w-full flex justify-between items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={`text-xs rounded px-2 py-1 ${
                  isComplete ? "bg-white/10 text-white" : 
                  isExpired ? "bg-red-500/10 text-white" : 
                  "bg-blue-500/10 text-white"
                }`}>
                  {isComplete 
                    ? `Completed on ${new Date(quest.completedAt || '').toLocaleDateString()}`
                    : isExpired 
                      ? `Missed ${questDefinition.xpReward} XP`
                      : `Auto-tracking: ${quest.progress}/${questDefinition.targetCount} completed`}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-gray-900/90 text-white border-white/10">
                {isComplete && quest.xpEarned 
                  ? `You earned ${quest.xpEarned} XP and ${quest.badgeEarned ? `the ${getBadgeLabel(quest.badgeEarned)} badge` : 'no badge'}`
                  : isComplete 
                    ? 'Completed successfully'
                    : isExpired 
                      ? `This quest expired at the end of week ${quest.weekNumber}. You missed out on earning ${questDefinition.xpReward} XP.`
                      : 'Progress is tracked automatically as you engage with the platform'}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Manual completion button and XP reward */}
          <div className="flex items-center gap-2">
            {/* Manual completion button for active quests */}
            {isActive && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setConfirmOpen(true)}
                className="text-xs px-2 py-1 h-auto bg-white/5 border-white/20 text-white/80 hover:bg-white/10 hover:border-white/30 hover:text-white"
                disabled={completeQuestMutation.isPending}
              >
                {completeQuestMutation.isPending ? 'Completing...' : 'Mark Complete'}
              </Button>
            )}
            
            {/* Show XP reward for active or expired quests */}
            {!isComplete && (
              <span className="text-xs font-semibold text-white/80">
                {isExpired ? 'Missed ' : 'Reward: '}{questDefinition.xpReward} XP
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Confirmation Dialog for Completion */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent className="bg-gray-900/90 border-white/10 text-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Complete Quest</AlertDialogTitle>
            <AlertDialogDescription className="text-white/70">
              Are you sure you want to mark this quest as complete? You will earn {questDefinition.xpReward} XP
              {questDefinition.badgeReward ? ` and the ${getBadgeLabel(questDefinition.badgeReward)} badge` : ''}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-800 text-white border-white/10 hover:bg-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleComplete} className="bg-white/20 text-white hover:bg-white/30">
              Complete Quest
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}