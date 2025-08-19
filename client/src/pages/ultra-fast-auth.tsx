import { UltraFastAuth } from "@/components/auth/UltraFastAuth";

/**
 * Ultra-Fast Authentication Page
 * Minimal overhead, maximum speed
 */
export default function UltraFastAuthPage() {
  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      }}
    >
      {/* Minimal glass card */}
      <div className="w-full max-w-md">
        <div className="bg-black/20 backdrop-blur-sm border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              Brandentifier
            </h1>
            <p className="text-white/80">
              AI-powered career development
            </p>
          </div>

          {/* Auth component */}
          <UltraFastAuth />

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-sm text-white/60">
              By continuing, you agree to our Terms & Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}