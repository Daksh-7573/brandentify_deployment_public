import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Target,
  Users,
  Brain,
  Zap,
  FileText,
  TrendingUp,
  Building,
  Calendar,
  Trophy,
  Search,
  Heart,
  Newspaper,
  MessageCircle,
  Shield,
  Star,
  Globe,
  Rocket,
  ChevronRight,
} from "lucide-react";
import { Helmet } from "react-helmet";

// Animation Variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    }
  }
};

export default function Landing() {
  const { isLoading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [_, setLocation] = useLocation();

  // Check if user wants to stay on landing page
  const urlParams = new URLSearchParams(window.location.search);
  const stayOnLanding = urlParams.get("stay") === "true";

  useEffect(() => {
    if (isAuthenticated && !stayOnLanding) {
      const timer = setTimeout(() => {
        setLocation("/dashboard");
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, setLocation, stayOnLanding]);

  if (isAuthenticated && !stayOnLanding) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="rounded-full h-16 w-16 border-t-2 border-r-2 border-blue-500"
        />
      </div>
    );
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Brandentify",
    "description": "AI-powered career development platform",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    }
  };

  return (
    <div className="min-h-screen bg-[#121212] text-white selection:bg-white/20 font-['Outfit'] overflow-x-hidden">
      <Helmet>
        <title>Brandentify - AI-Powered Career Platform</title>
        <meta name="description" content="AI-powered career development platform for professional growth, branding, and networking" />
        <meta name="keywords" content="career development, AI mentorship, professional branding, resume builder, networking" />
        <meta property="og:title" content="Brandentify - AI-Powered Career Platform" />
        <meta property="og:description" content="Transform your career with AI-driven insights and personalized guidance" />
        <meta property="og:image" content="https://brandentify.com/og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <link rel="canonical" href="https://brandentify.com/" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      {/* Dynamic Background - Premium Dark Theme */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[20%] left-[-20%] w-[50%] h-[50%] bg-white/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-white/3 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
      </div>

      {/* Brandentify Logo - Top Left */}
      <div className="fixed top-8 left-8 z-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-tr from-white/40 to-white/20 rounded-lg flex items-center justify-center shadow-lg shadow-white/5">
            <Sparkles size={18} className="text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">Brandentify</span>
        </div>
      </div>

      {/* Floating Sign In Button */}
      <div className="fixed top-8 right-8 z-50">
        <Button
          onClick={() => setLocation("/auth")}
          className="neo-glass-button px-6 shadow-lg shadow-white/10"
          style={{ borderRadius: '5px' }}
        >
          Sign In
        </Button>
      </div>

      {/* Main Content */}
      <main className="relative z-10 pt-64">
        {/* Hero Section */}
        <section className="container mx-auto px-6 text-center mb-32">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex flex-col items-center"
          >
            
            <motion.h1
              variants={fadeInUp}
              className="text-5xl md:text-8xl font-extrabold tracking-tight mb-8 max-w-5xl leading-[1.1]"
            >
              Master Your Career <br />
              <span className="bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent">With Intelligent Branding</span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
            >
              The AI-driven career development platform that transforms your professional journey with actionable insights, personalized guidance, and gamified growth.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row items-center gap-4"
            >
              <Button
                onClick={() => setLocation("/auth")}
                size="lg"
                className="neo-glass-button h-14 px-10 text-lg font-bold group"
                style={{ borderRadius: '5px' }}
              >
                Join the Future
                <ArrowRight className="ml-2 transition-transform group-hover:translate-x-1" />
              </Button>
            </motion.div>

            {/* Social Proof Placeholder */}
            <motion.div
              variants={fadeInUp}
              className="mt-20 flex flex-col items-center"
            >
              <p className="text-xs uppercase tracking-widest text-gray-500 mb-6 font-bold">Recommended for builders at</p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-40 grayscale contrast-125">
                <Globe size={32} />
                <Rocket size={32} />
                <Shield size={32} />
                <Brain size={32} />
                <Star size={32} />
              </div>
            </motion.div>
          </motion.div>
        </section>

        {/* Bento Grid Features */}
        <section className="container mx-auto px-6 mt-20 mb-96">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">A complete ecosystem <br /> for modern professionals</h2>
              <p className="text-gray-400">We've combined every tool you need to build, track, and showcase your professional brand in one intelligent platform.</p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-6 auto-rows-[140px] md:auto-rows-[160px] xl:auto-rows-[150px]">
            {/* 1. Career Clarity */}
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full md:col-span-2 xl:col-span-2 md:row-span-2 xl:row-span-3 min-h-[240px] md:min-h-[280px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between group relative overflow-hidden hover:bg-white/8 transition-all"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src="/feature-clarity.png" className="w-full h-full object-cover" alt="Clarity" />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Target className="text-white/70" size={18} />
              </div>
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">Career Clarity</h3>
                <p className="text-xs text-gray-400 leading-tight">Get smart, personalized career advice instantly.</p>
              </div>
            </motion.div>

            {/* 2. AI Mentorship - Wide landscape */}
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full md:col-span-2 xl:col-span-2 md:row-span-1 xl:row-span-1 min-h-[160px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between group relative overflow-hidden hover:bg-white/8 transition-all"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src="/feature-ai.png" className="w-full h-full object-cover" alt="AI Mentor" />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Brain className="text-white/70" size={18} />
              </div>
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">AI Mentorship</h3>
                <p className="text-xs text-gray-400 leading-tight">Talk to AI mentors modeled after legends.</p>
              </div>
            </motion.div>

            {/* 3. Smart Resume */}
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full md:col-span-2 xl:col-span-2 md:row-span-2 xl:row-span-2 min-h-[240px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between group relative overflow-hidden hover:bg-white/8 transition-all"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src="/feature-resume.png" className="w-full h-full object-cover" alt="Resume" />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <FileText className="text-white/70" size={18} />
              </div>
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">Smart Resume</h3>
                <p className="text-xs text-gray-400 leading-tight">Instant feedback, scoring, and styling tips.</p>
              </div>
            </motion.div>

            {/* 4. Skill Matching - Tall portrait */}
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full md:col-span-1 xl:col-span-1 md:row-span-2 xl:row-span-2 min-h-[220px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between group relative overflow-hidden hover:bg-white/8 transition-all"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src="/feature-clarity.png" className="w-full h-full object-cover scale-150 rotate-90" alt="Skills" />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Zap className="text-white/70" size={18} />
              </div>
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">Skill Matching</h3>
                <p className="text-xs text-gray-400 leading-tight">Find out which skills you need to grow.</p>
              </div>
            </motion.div>

            {/* 5. Pro Network - Square */}
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full md:col-span-1 xl:col-span-1 md:row-span-1 xl:row-span-1 min-h-[160px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between group relative overflow-hidden hover:bg-white/8 transition-all"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src="/feature-network.png" className="w-full h-full object-cover" alt="Network" />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Users className="text-white/70" size={18} />
              </div>
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">Pro Network</h3>
                <p className="text-xs text-gray-400 leading-tight">Build a network that actually helps.</p>
              </div>
            </motion.div>

            {/* 6. Portfolio Builder - Wide landscape */}
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full md:col-span-2 xl:col-span-2 md:row-span-1 xl:row-span-1 min-h-[160px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between group relative overflow-hidden hover:bg-white/8 transition-all"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src="/feature-resume.png" className="w-full h-full object-cover scale-125 -rotate-12" alt="Portfolio" />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Building className="text-white/70" size={18} />
              </div>
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">Portfolio Builder</h3>
                <p className="text-xs text-gray-400 leading-tight">Showcase your skills with real projects.</p>
              </div>
            </motion.div>

            {/* 7. Experience Tracker - Tall portrait */}
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full md:col-span-1 xl:col-span-1 md:row-span-2 xl:row-span-2 min-h-[230px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between group relative overflow-hidden hover:bg-white/8 transition-all"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src="/hero-main.png" className="w-full h-full object-cover scale-150 blur-[2px]" alt="Experience" />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Calendar className="text-white/70" size={18} />
              </div>
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">Exp Tracker</h3>
                <p className="text-xs text-gray-400 leading-tight">Add everything that shapes your journey.</p>
              </div>
            </motion.div>

            {/* 8. Goal Planner - Square */}
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full md:col-span-1 xl:col-span-1 md:row-span-1 xl:row-span-1 min-h-[160px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between group relative overflow-hidden hover:bg-white/8 transition-all"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src="/feature-ai.png" className="w-full h-full object-cover scale-125 rotate-45" alt="Goals" />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Rocket className="text-white/70" size={18} />
              </div>
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">Goal Planner</h3>
                <p className="text-xs text-gray-400 leading-tight">AI-guided milestones to reach goals.</p>
              </div>
            </motion.div>

            {/* 9. XP Quests - Wide landscape */}
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full md:col-span-2 xl:col-span-2 md:row-span-1 xl:row-span-1 min-h-[160px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between group relative overflow-hidden hover:bg-white/8 transition-all"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src="/Banner AI Blockchain_1764369150391.gif" className="w-full h-full object-cover" alt="Quests" />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Trophy className="text-white/70" size={18} />
              </div>
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">XP Quests</h3>
                <p className="text-xs text-gray-400 leading-tight">Gamified challenges and career badges.</p>
              </div>
            </motion.div>

            {/* 10. Job Radar - Tall portrait */}
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full md:col-span-1 xl:col-span-1 md:row-span-2 xl:row-span-2 min-h-[230px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between group relative overflow-hidden hover:bg-white/8 transition-all"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src="/feature-network.png" className="w-full h-full object-cover scale-150 rotate-[200deg]" alt="Radar" />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Search className="text-white/70" size={18} />
              </div>
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">Job Radar</h3>
                <p className="text-xs text-gray-400 leading-tight">Track opportunities in your domain.</p>
              </div>
            </motion.div>

            {/* 11. Real Feedback - Square */}
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full md:col-span-1 xl:col-span-1 md:row-span-1 xl:row-span-1 min-h-[160px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between group relative overflow-hidden hover:bg-white/8 transition-all"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity">
                <img src="/feature-network.png" className="w-full h-full object-cover -scale-x-100 rotate-45" alt="Feedback" />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Heart className="text-white/70" size={18} />
              </div>
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">Real Feedback</h3>
                <p className="text-xs text-gray-400 leading-tight">Endorsements that boost credibility.</p>
              </div>
            </motion.div>

            {/* 12. Insight Feed - Wide landscape */}
            <motion.div
              whileHover={{ y: -5 }}
              className="h-full md:col-span-2 xl:col-span-2 md:row-span-1 xl:row-span-1 min-h-[160px] rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 p-5 flex flex-col justify-between group relative overflow-hidden hover:bg-white/8 transition-all"
            >
              <div className="absolute inset-0 opacity-5 group-hover:opacity-10 transition-opacity blur-[1px]">
                <img src="/Banner AI Blockchain_1764369150391.gif" className="w-full h-full object-cover scale-150 rotate-90" alt="News" />
                <div className="absolute inset-0 bg-black/60" />
              </div>
              <div className="relative z-10 w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                <Newspaper className="text-white/70" size={18} />
              </div>
              <div className="relative z-10">
                <h3 className="text-base font-bold mb-1">Insight Feed</h3>
                <p className="text-xs text-gray-400 leading-tight">Personalized news and AI-powered posts.</p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* FAQ Section for SEO */}
        <section id="faq" className="container mx-auto px-6 mb-32 max-w-4xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-400">Everything you need to know about the Brandentify platform.</p>
          </div>
          <div className="space-y-6">
            <div itemScope itemType="https://schema.org/Question" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 itemProp="name" className="text-xl font-bold mb-3">How does AI career guidance work?</h3>
              <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                <p itemProp="text" className="text-gray-400 leading-relaxed">Our AI analyzes your professional profile, skills, and goals to provide personalized career recommendations, resume improvements, and networking strategies tailored specifically to your journey.</p>
              </div>
            </div>
            <div itemScope itemType="https://schema.org/Question" className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl p-6">
              <h3 itemProp="name" className="text-xl font-bold mb-3">Is the platform suitable for beginners?</h3>
              <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                <p itemProp="text" className="text-gray-400 leading-relaxed">Yes! Brandentify is designed for professionals at every stage. Whether you're just starting out or looking to land an executive role, our tools scale with your career progression.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Spacer to prevent overlap */}
      <div className="h-32"></div>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/40 backdrop-blur-sm py-20 mt-32">
        <div className="container mx-auto px-6 text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-6 h-6 bg-gradient-to-tr from-white/40 to-white/20 rounded flex items-center justify-center">
              <Sparkles size={14} className="text-white" />
            </div>
            <span className="text-lg font-bold">Brandentify</span>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
            Empowering the modern professional with AI-driven insights to build, track, and scale their career and personal brand.
          </p>
          <p className="text-xs text-gray-600">© 2026 Brandentify Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

