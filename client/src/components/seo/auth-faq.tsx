import { useEffect } from 'react';
import { Shield, Lock, Mail, HelpCircle } from 'lucide-react';

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

export function AuthFAQSection() {
  const faqs: FAQItemProps[] = [
    {
      question: "Is Brandentify sign-in secure?",
      answer: "Yes, Brandentify uses industry-standard encryption and secure authentication protocols. We implement Google OAuth 2.0 for secure sign-in, and all data is transmitted over HTTPS with TLS encryption. Your credentials are never stored on our servers.",
      icon: <Shield className="h-5 w-5" />
    },
    {
      question: "What authentication methods are available?",
      answer: "Brandentify currently supports Google Sign-In for secure and seamless authentication. We're working on additional methods including email/password and SMS authentication to provide more options for our users.",
      icon: <Mail className="h-5 w-5" />
    },
    {
      question: "How is my data protected?",
      answer: "We take data security seriously. Your information is encrypted at rest and in transit, stored in secure cloud infrastructure with regular backups. We never share your personal data with third parties without your explicit consent.",
      icon: <Lock className="h-5 w-5" />
    },
    {
      question: "What if I encounter sign-in issues?",
      answer: "If you experience authentication problems, try clearing your browser cache and cookies, or use an incognito window. Our system automatically detects and resolves common issues. For persistent problems, contact our support team.",
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

    let script = document.getElementById('faq-structured-data') as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement('script');
      script.id = 'faq-structured-data';
      script.type = 'application/ld+json';
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(faqSchema);

    return () => {
      const existingScript = document.getElementById('faq-structured-data');
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);

  return (
    <section className="mt-12 pt-8 border-t border-white/10">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">
          Frequently Asked Questions
        </h2>
        <p className="text-gray-400">
          Common questions about authentication and security
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
      
      {/* Additional trust signals */}
      <div className="mt-8 pt-6 border-t border-white/10 text-center">
        <p className="text-sm text-gray-500">
          By signing in, you agree to our Terms of Service and Privacy Policy.
          <br />
          Brandentify uses bank-level security to protect your data.
        </p>
      </div>
    </section>
  );
}
