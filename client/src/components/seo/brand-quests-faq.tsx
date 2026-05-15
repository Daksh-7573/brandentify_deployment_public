import { useEffect } from 'react';
import { Trophy, Target, Zap, HelpCircle, Star, Award } from 'lucide-react';

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

export function BrandQuestsFAQSection() {
  const faqs: FAQItemProps[] = [
    {
      question: "How do I complete Brand Quests?",
      answer: "Select a quest from your dashboard, review the requirements, complete the professional development tasks, and submit your work. XP points and badges are awarded automatically upon successful completion. Each quest is designed to enhance specific professional skills.",
      icon: <Target className="h-5 w-5" />
    },
    {
      question: "What are XP points used for?",
      answer: "XP points track your professional development progress and unlock new quests, exclusive badges, and career opportunities within the Brandentify platform. Higher XP levels demonstrate your commitment to continuous learning and professional growth.",
      icon: <Zap className="h-5 w-5" />
    },
    {
      question: "How do badges benefit my career?",
      answer: "Badges serve as verifiable proof of your professional skills and achievements. They appear on your profile, making you more discoverable to recruiters and potential employers. Each badge represents specific competencies that are valuable in today's job market.",
      icon: <Award className="h-5 w-5" />
    },
    {
      question: "What types of professional quests are available?",
      answer: "Brand Quests cover various professional development areas including technical skills, leadership, communication, project management, and industry-specific challenges. New quests are added regularly based on market demands and career trends.",
      icon: <Trophy className="h-5 w-5" />
    },
    {
      question: "How long does it take to complete a quest?",
      answer: "Quest completion time varies from 30 minutes for quick skill challenges to several hours for comprehensive projects. Each quest displays an estimated completion time and difficulty level so you can plan your professional development effectively.",
      icon: <Star className="h-5 w-5" />
    },
    {
      question: "Can I earn certificates from completing quests?",
      answer: "While quests award XP and badges, completing multiple quests in a specific track can unlock professional certificates. These certificates validate your expertise and can be shared on LinkedIn and other professional networks.",
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

    let script = document.getElementById('brand-quests-faq-structured-data') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'brand-quests-faq-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(faqSchema);

    return () => {
      const existingScript = document.getElementById('brand-quests-faq-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <section className="mt-12 pt-8 border-t border-white/10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Brand Quests FAQ
        </h2>
        <p className="text-gray-400">
          Common questions about professional development quests and gamified learning
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
            Join thousands of professionals advancing their careers through Brand Quests
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-500">
            <span>🎯 50+ Quest Types</span>
            <span>⚡ Real-time XP Tracking</span>
            <span>🏆 Professional Badges</span>
            <span>📈 Career Growth</span>
          </div>
        </div>
        <p className="text-xs text-gray-500">
          Start your professional development journey today with gamified learning challenges
        </p>
      </div>
    </section>
  );
}
