import { useEffect } from 'react';
import { Brain, Target, TrendingUp, HelpCircle, Lightbulb, Award } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

function FAQItem({ question, answer, icon }: FAQItemProps) {
  return (
    <div itemScope itemType="https://schema.org/Question" className="mb-6">
      <div className="flex items-start gap-3 mb-2">
        {icon && <div className="text-white/70 mt-1">{icon}</div>}
        <h3 itemProp="name" className="text-lg font-semibold text-white">
          {question}
        </h3>
      </div>
      <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
        <p itemProp="text" className="text-gray-400 leading-relaxed pl-9">
          {answer}
        </p>
      </div>
    </div>
  );
}

export function CareerCapsuleFAQSection() {
  const faqs: FAQItemProps[] = [
    {
      question: "How does AI-generated milestone creation work?",
      answer: "Our AI analyzes your career goals, timeframe, industry, and current skill level to generate personalized, achievable milestones. The system considers market trends, industry best practices, and typical career progression paths to create realistic steps that help you reach your objectives efficiently.",
      icon: <Brain className="h-5 w-5" />
    },
    {
      question: "What types of career goals can I create?",
      answer: "Career Capsule supports various goal types including position changes (promotion, role transition), skill acquisition (technical skills, soft skills), industry switches, entrepreneurship, relocation, education/certification, and custom career objectives. Each goal type gets tailored AI-generated milestones.",
      icon: <Target className="h-5 w-5" />
    },
    {
      question: "How accurate are the AI-generated milestones?",
      answer: "Our AI milestone system is trained on millions of career progression data points and continuously updated with industry trends. While milestones provide excellent guidance, they should be adapted to your personal circumstances and validated with mentors or industry professionals.",
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      question: "Can I modify AI-generated milestones?",
      answer: "Yes, absolutely! All AI-generated milestones are fully customizable. You can edit, add, remove, or reorder milestones based on your preferences, timeline, and changing circumstances. The AI will also suggest adjustments as you progress and achieve milestones.",
      icon: <Lightbulb className="h-5 w-5" />
    },
    {
      question: "How does progress tracking work?",
      answer: "Career Capsule provides real-time progress tracking with visual indicators, completion percentages, and milestone status updates. You can mark milestones as complete, add notes, upload evidence of achievements, and get progress insights to stay motivated and on track.",
      icon: <Award className="h-5 w-5" />
    },
    {
      question: "Is my career data secure and private?",
      answer: "Your career data is encrypted and stored securely with enterprise-grade security. We never share your personal career information with third parties without explicit consent. Your goals and progress are private by default, with options to share achievements selectively.",
      icon: <HelpCircle className="h-5 w-5" />
    }
  ];

  useEffect(() => {
    // FAQ Structured Data for rich snippets
    const faqSchema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };

    let script = document.getElementById('career-capsule-faq-structured-data') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'career-capsule-faq-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(faqSchema);

    return () => {
      const existingScript = document.getElementById('career-capsule-faq-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <section className="mt-12 pt-8 border-t border-white/10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Career Capsule FAQ
        </h2>
        <p className="text-gray-400">
          Common questions about AI-powered career planning and goal setting
        </p>
      </div>
      
      <div 
        itemScope 
        itemType="https://schema.org/FAQPage"
        className="max-w-3xl mx-auto"
      >
        {faqs.map((faq, index) => (
          <FAQItem 
            key={index}
            question={faq.question}
            answer={faq.answer}
            icon={faq.icon}
          />
        ))}
      </div>
      
      {/* Additional trust signals and CTA */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <div className="mb-4">
          <p className="text-sm text-gray-400 mb-2">
            Join thousands of professionals achieving their career goals with AI-powered planning
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <span>🧠 AI-Powered Milestones</span>
            <span>🎯 Smart Goal Setting</span>
            <span>📈 Progress Tracking</span>
            <span>🚀 Career Growth</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Start planning your career journey today with personalized AI-generated milestones
        </p>
      </div>
    </section>
  );
}
