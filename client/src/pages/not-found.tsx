import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  const [_, setLocation] = useLocation();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#050505] text-white selection:bg-blue-500/30 font-['Outfit'] relative overflow-hidden">
      {/* Dynamic Background Blobs */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] right-[-5%] w-[35%] h-[35%] bg-purple-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[32px] p-8 md:p-10 shadow-2xl text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center justify-center shadow-lg shadow-red-500/10">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
          </div>

          <h1 className="text-4xl font-black mb-4 tracking-tight">
            404 <span className="text-gray-500 font-medium text-2xl ml-2">Lost in Space</span>
          </h1>

          <p className="text-gray-400 mb-10 leading-relaxed">
            The page you're looking for doesn't exist or has been moved to another coordinate.
          </p>

          <div className="space-y-3">
            <Button
              onClick={() => setLocation("/dashboard")}
              className="w-full bg-white text-black hover:bg-gray-200 rounded-2xl h-14 font-bold text-lg shadow-xl transition-all active:scale-[0.98]"
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Dashboard
            </Button>

            <Button
              variant="outline"
              onClick={() => window.history.back()}
              className="w-full border-white/10 bg-white/5 hover:bg-white/10 rounded-2xl h-14 font-bold text-lg backdrop-blur-sm transition-all"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Go Back
            </Button>
          </div>

          <div className="mt-8 pt-8 border-t border-white/5">
            <p className="text-xs text-gray-600 font-bold uppercase tracking-widest">
              Looking for setup?
              <button
                onClick={() => setLocation("/onboarding")}
                className="text-blue-500 ml-1 hover:underline active:opacity-70"
              >
                Start Onboarding
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
