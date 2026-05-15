import { Radar, Clock3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SmartRadarComingSoon() {
  return (
    <div className="min-h-[60vh] w-full flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-2xl bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-white shadow-2xl">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-11 w-11 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <Radar className="h-6 w-6" />
          </div>
          <Badge className="bg-white/15 text-white border border-white/25">Coming Soon</Badge>
        </div>

        <h1 className="text-3xl font-bold mb-2">Smart Radar</h1>
        <p className="text-white/80 text-lg mb-5">This feature is currently under development.</p>
        <p className="text-white/70 leading-relaxed mb-6">
          Smart Radar is coming soon. We&apos;re building powerful insights to help you discover opportunities and trends.
        </p>

        <div className="flex items-center gap-2 text-white/60 text-sm">
          <Clock3 className="h-4 w-4" />
          <span>Estimated launch: To be announced</span>
        </div>
      </div>
    </div>
  );
}
