import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { QuestType } from "@/types/career-quest";

interface StaticHashtagSuggestionsProps {
  questType: QuestType;
}

export function StaticHashtagSuggestions({ questType }: StaticHashtagSuggestionsProps) {
  const { toast } = useToast();
  
  const copyToClipboard = (hashtag: string) => {
    navigator.clipboard.writeText(hashtag);
    toast({
      title: "Hashtag copied",
      description: `${hashtag} is now in your clipboard`,
      duration: 2000,
    });
  };
  
  return (
    <div className="mt-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <span className="text-sm">✨</span>
        <span>Relevant hashtags to try:</span>
      </div>
      
      <div className="flex flex-wrap gap-1.5">
        {questType === 'pulse_creation' && (
          <>
            <Badge 
              variant="outline"
              className="text-xs font-normal bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => copyToClipboard("#TechInnovation")}
              title="Click to copy"
            >
              #TechInnovation
            </Badge>
            <Badge 
              variant="outline"
              className="text-xs font-normal bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => copyToClipboard("#CareerGrowth")}
              title="Click to copy"
            >
              #CareerGrowth
            </Badge>
            <Badge 
              variant="outline"
              className="text-xs font-normal bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => copyToClipboard("#ProfessionalDevelopment")}
              title="Click to copy"
            >
              #ProfessionalDevelopment
            </Badge>
          </>
        )}
        
        {questType === 'networking' && (
          <>
            <Badge 
              variant="outline"
              className="text-xs font-normal bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => copyToClipboard("#Networking")}
              title="Click to copy"
            >
              #Networking
            </Badge>
            <Badge 
              variant="outline"
              className="text-xs font-normal bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => copyToClipboard("#ConnectAndGrow")}
              title="Click to copy"
            >
              #ConnectAndGrow
            </Badge>
            <Badge 
              variant="outline"
              className="text-xs font-normal bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => copyToClipboard("#CareerConnections")}
              title="Click to copy"
            >
              #CareerConnections
            </Badge>
          </>
        )}
        
        {questType === 'visibility' && (
          <>
            <Badge 
              variant="outline"
              className="text-xs font-normal bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => copyToClipboard("#PersonalBranding")}
              title="Click to copy"
            >
              #PersonalBranding
            </Badge>
            <Badge 
              variant="outline"
              className="text-xs font-normal bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => copyToClipboard("#ThoughtLeadership")}
              title="Click to copy"
            >
              #ThoughtLeadership
            </Badge>
            <Badge 
              variant="outline"
              className="text-xs font-normal bg-muted/40 cursor-pointer hover:bg-muted/60 transition-colors"
              onClick={() => copyToClipboard("#ProfessionalGrowth")}
              title="Click to copy"
            >
              #ProfessionalGrowth
            </Badge>
          </>
        )}
      </div>
    </div>
  );
}