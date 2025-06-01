import { NeoGlassLayout } from "@/components/layout/neo-glass-layout";
import NowboardPanel from "@/components/nowboard/nowboard-panel";

export default function NowboardPage() {
  return (
    <NeoGlassLayout>
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Nowboard</h1>
          <p className="text-white/70 text-lg">
            See what professionals are doing right now
          </p>
        </div>
        <NowboardPanel />
      </div>
    </NeoGlassLayout>
  );
}