import React from 'react';

interface CreatePulseFAQProps {
  contentType?: 'poll' | 'media' | 'project' | null;
}

export default function CreatePulseFAQ({ contentType }: CreatePulseFAQProps) {
  const getFAQContent = () => {
    const baseFAQs = [
      {
        question: "What types of content can I create with Create Pulse?",
        answer: "You can create industry polls for trend insights, share media content for professional updates, and showcase projects to demonstrate your expertise and achievements. Each content type is designed to help you engage with professionals in your industry."
      },
      {
        question: "How do industry-specific pulses work?",
        answer: "Select your industry and domain to categorize your content, ensuring it reaches the right professional audience interested in your specific field. This targeted approach increases engagement and helps you connect with relevant professionals."
      },
      {
        question: "What are the benefits of creating industry content?",
        answer: "Creating industry content helps establish your professional brand, demonstrates expertise, increases visibility in your field, facilitates networking opportunities, and can lead to career advancement through increased recognition."
      },
      {
        question: "How do I create effective industry polls?",
        answer: "Focus on relevant industry topics, keep questions clear and concise, provide meaningful answer options, consider timing for maximum engagement, and follow up with results or insights to encourage participation."
      }
    ];

    const contentTypeFAQs = {
      poll: [
        {
          question: "What makes a good industry poll?",
          answer: "A good industry poll addresses current trends or challenges, provides relevant answer options, targets the right audience, and encourages meaningful discussion. Keep it focused on professional insights rather than personal opinions."
        },
        {
          question: "How can I increase participation in my industry polls?",
          answer: "Share your poll at optimal times, tag relevant professionals or companies, use engaging questions, provide context about why the poll matters, and follow up with results to encourage future participation."
        }
      ],
      media: [
        {
          question: "What type of media content works best for professional networking?",
          answer: "Professional achievements, industry event coverage, thought leadership content, project demonstrations, and industry news analysis perform well. Ensure content is high-quality, relevant, and adds value to your professional network."
        },
        {
          question: "How should I optimize media content for industry engagement?",
          answer: "Use professional captions, include relevant industry hashtags, tag relevant companies or people, post at optimal times for your industry, and engage with comments to build professional relationships."
        }
      ],
      project: [
        {
          question: "What information should I include in my project showcase?",
          answer: "Include project goals, your role and responsibilities, challenges overcome, results achieved, skills demonstrated, and lessons learned. This comprehensive approach demonstrates your expertise and professional growth."
        },
        {
          question: "How can project showcases benefit my career?",
          answer: "Project showcases demonstrate your skills to potential employers, build your professional portfolio, establish you as an expert, provide talking points for interviews, and can lead to new career opportunities."
        }
      ]
    };

    if (contentType && contentTypeFAQs[contentType]) {
      return [...baseFAQs, ...contentTypeFAQs[contentType]];
    }

    return baseFAQs;
  };

  const faqs = getFAQContent();

  return (
    <section id="create-pulse-faq" className="py-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-8 text-center">
          Create Pulse FAQ
        </h2>
        
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg p-6"
              itemScope 
              itemType="https://schema.org/Question"
            >
              <h3 
                className="text-lg font-semibold text-white mb-3 flex items-start"
                itemProp="name"
              >
                <span className="text-blue-400 mr-3">Q{index + 1}:</span>
                {faq.question}
              </h3>
              <div 
                className="text-gray-300 leading-relaxed pl-8"
                itemProp="acceptedAnswer"
                itemScope
                itemType="https://schema.org/Answer"
              >
                <span itemProp="text">
                  {faq.answer}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">
            Need More Help?
          </h3>
          <p className="text-gray-300 text-sm">
            Explore our comprehensive guides on professional content creation, 
            industry networking strategies, and personal branding best practices 
            to maximize your impact on Brandentify.
          </p>
        </div>
      </div>

      {/* Structured Data for FAQ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(faq => ({
              "@type": "Question",
              "name": faq.question,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
              }
            }))
          }, null, 2)
        }}
      />
    </section>
  );
}
