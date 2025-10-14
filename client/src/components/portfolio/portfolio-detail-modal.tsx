import { motion, AnimatePresence } from "framer-motion";
import { X, Camera, Aperture, Film, Sparkles, Eye, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface PortfolioDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  portfolio: {
    id: string;
    name: string;
    description: string;
    theme: string;
    features?: string[];
    preview?: string;
  } | null;
  onSelect: (id: string) => void;
}

export function PortfolioDetailModal({ isOpen, onClose, portfolio, onSelect }: PortfolioDetailModalProps) {
  if (!portfolio) return null;

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSelect = () => {
    onSelect(portfolio.id);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop with camera flash effect */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            style={{ cursor: 'pointer' }}
            data-testid="portfolio-modal-backdrop"
          >
            {/* Flash effect */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.3, 0] }}
              transition={{ duration: 0.4 }}
              className="absolute inset-0 bg-white pointer-events-none"
            />
          </motion.div>

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.5, rotateY: -90, opacity: 0 }}
              animate={{ scale: 1, rotateY: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotateY: 90, opacity: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 300, 
                damping: 30,
                opacity: { duration: 0.3 }
              }}
              className="relative w-full max-w-4xl pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Aperture opening effect background */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="absolute inset-0 rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${portfolio.theme}20 0%, transparent 100%)`,
                  filter: 'blur(60px)',
                }}
              />

              {/* Main content card */}
              <div 
                className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-2xl shadow-2xl border overflow-hidden"
                style={{ borderColor: `${portfolio.theme}40` }}
              >
                {/* Film strip decoration */}
                <div className="absolute top-0 left-0 right-0 h-2 flex gap-1 bg-black/50 px-2 py-1">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-2 h-full bg-gray-700" />
                  ))}
                </div>

                {/* Lens flare effect */}
                <motion.div
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                    scale: [1, 1.2, 1],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute top-10 right-10 w-32 h-32 rounded-full pointer-events-none"
                  style={{
                    background: `radial-gradient(circle, ${portfolio.theme}40 0%, transparent 70%)`,
                    filter: 'blur(20px)',
                  }}
                />

                {/* Close button with shutter effect */}
                <motion.button
                  onClick={onClose}
                  className="absolute top-6 right-6 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 transition-colors border"
                  style={{ borderColor: `${portfolio.theme}60` }}
                  whileHover={{ rotate: 90, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  data-testid="button-close-modal"
                  aria-label="Close portfolio details"
                >
                  <X size={24} className="text-white" />
                </motion.button>

                {/* Content */}
                <div className="relative p-4 sm:p-8 pt-12">
                  {/* Header with camera icon */}
                  <div className="flex items-start gap-6 mb-8">
                    {/* Rotating aperture icon */}
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                      className="flex-shrink-0"
                    >
                      <div 
                        className="p-4 rounded-xl"
                        style={{ background: `${portfolio.theme}30` }}
                      >
                        <Aperture size={48} style={{ color: portfolio.theme }} />
                      </div>
                    </motion.div>

                    {/* Title and description */}
                    <div className="flex-1">
                      <motion.h2
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-3xl font-bold text-white mb-3"
                      >
                        {portfolio.name}
                      </motion.h2>
                      
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-300 whitespace-pre-line"
                      >
                        {portfolio.description}
                      </motion.div>
                    </div>
                  </div>

                  {/* Features section with film strip animation */}
                  {portfolio.features && portfolio.features.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className="mb-8"
                    >
                      <div className="flex items-center gap-2 mb-4">
                        <Film style={{ color: portfolio.theme }} />
                        <h3 className="text-xl font-semibold text-white">Key Features</h3>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {portfolio.features.map((feature, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 + index * 0.1 }}
                            className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                          >
                            <CheckCircle2 
                              size={20} 
                              className="flex-shrink-0 mt-0.5"
                              style={{ color: portfolio.theme }} 
                            />
                            <span className="text-sm text-gray-300">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* Preview badge */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="mb-6"
                  >
                    <div 
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full border"
                      style={{ 
                        background: `${portfolio.theme}20`,
                        borderColor: `${portfolio.theme}60`
                      }}
                    >
                      <Eye size={18} style={{ color: portfolio.theme }} />
                      <span className="text-sm font-medium text-white">
                        Preview available in builder
                      </span>
                    </div>
                  </motion.div>

                  {/* Action buttons with camera shutter effect */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="flex flex-wrap gap-4"
                  >
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleSelect}
                        className="px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-semibold text-black relative overflow-hidden group"
                        style={{ background: portfolio.theme }}
                        data-testid="button-select-template"
                      >
                        {/* Shutter animation on hover */}
                        <motion.div
                          className="absolute inset-0 bg-white/30"
                          initial={{ scaleX: 0 }}
                          whileHover={{ scaleX: [0, 1, 0] }}
                          transition={{ duration: 0.5 }}
                        />
                        <span className="relative z-10 flex items-center gap-2">
                          <Camera size={20} className="sm:w-6 sm:h-6" />
                          Select This Template
                        </span>
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={onClose}
                        variant="outline"
                        className="px-4 sm:px-6 py-4 sm:py-6 text-base sm:text-lg border-white/20 bg-white/5 text-white hover:bg-white/10"
                        data-testid="button-view-other-templates"
                      >
                        View Other Templates
                      </Button>
                    </motion.div>
                  </motion.div>
                </div>

                {/* Bottom film strip decoration */}
                <div className="h-2 flex gap-1 bg-black/50 px-2 py-1">
                  {[...Array(20)].map((_, i) => (
                    <div key={i} className="w-2 h-full bg-gray-700" />
                  ))}
                </div>

                {/* Floating sparkles */}
                <motion.div
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.5, 1, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute bottom-20 left-10"
                >
                  <Sparkles size={20} style={{ color: portfolio.theme }} />
                </motion.div>
                
                <motion.div
                  animate={{
                    y: [0, -15, 0],
                    opacity: [0.4, 0.8, 0.4]
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="absolute top-40 right-20"
                >
                  <Sparkles size={16} style={{ color: portfolio.theme }} />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
