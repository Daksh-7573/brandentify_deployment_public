import React from 'react';
import { NeoLayout } from '@/components/layout/neo-layout';
import { NeoCard, NeoButton, NeoSectionTitle, NeoSkillTag, NeoOfferCard, NeoProjectCard, NeoTimeline, NeoTimelineItem } from '@/components/ui/neo-components';
import { Code, Cpu, Database, FileCode, Terminal, Settings, Zap, LineChart, RefreshCw } from 'lucide-react';

export default function NeoThemeDemo() {
  return (
    <NeoLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">Neo-Futuristic Theme Demo</h1>
          <p className="text-neo-text-secondary mb-6">
            A showcase of the Neo-Futuristic meets Soft Minimalism UI components
          </p>

          {/* Buttons Section */}
          <NeoSectionTitle as="h2">Buttons</NeoSectionTitle>
          <div className="flex flex-wrap gap-4 mb-10">
            <NeoButton>Default Button</NeoButton>
            <NeoButton variant="outline">Outline Button</NeoButton>
            <NeoButton variant="ghost">Ghost Button</NeoButton>
            <NeoButton iconLeft={<Zap className="h-4 w-4" />}>
              With Icon
            </NeoButton>
            <NeoButton disabled>Disabled</NeoButton>
          </div>

          {/* Cards Section */}
          <NeoSectionTitle as="h2">Cards</NeoSectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <NeoCard className="neo-glow">
              <h3 className="text-xl font-semibold mb-2">Glowing Card</h3>
              <p className="text-neo-text-secondary">
                This card has a subtle animation that makes it glow.
              </p>
            </NeoCard>
            
            <NeoCard>
              <h3 className="text-xl font-semibold mb-2">Regular Card</h3>
              <p className="text-neo-text-secondary">
                A standard card with hover effects.
              </p>
            </NeoCard>
            
            <NeoCard hoverEffect={false}>
              <h3 className="text-xl font-semibold mb-2">Static Card</h3>
              <p className="text-neo-text-secondary">
                This card doesn't have hover transition effects.
              </p>
            </NeoCard>
          </div>

          {/* Skills Section */}
          <NeoSectionTitle as="h2">Skills & Tags</NeoSectionTitle>
          <div className="flex flex-wrap gap-2 mb-10">
            <NeoSkillTag icon={<Code className="h-4 w-4" />}>
              TypeScript
            </NeoSkillTag>
            <NeoSkillTag icon={<FileCode className="h-4 w-4" />}>
              React
            </NeoSkillTag>
            <NeoSkillTag icon={<Terminal className="h-4 w-4" />}>
              Node.js
            </NeoSkillTag>
            <NeoSkillTag icon={<Database className="h-4 w-4" />}>
              PostgreSQL
            </NeoSkillTag>
            <NeoSkillTag icon={<Settings className="h-4 w-4" />}>
              System Architecture
            </NeoSkillTag>
            <NeoSkillTag icon={<Cpu className="h-4 w-4" />}>
              AI Development
            </NeoSkillTag>
          </div>

          {/* Services/Offers Section */}
          <NeoSectionTitle as="h2">Services & Offerings</NeoSectionTitle>
          <div className="mb-10">
            <NeoOfferCard
              title="Full-Stack Development"
              description="Building scalable web applications from frontend to backend."
              icon={<Code className="h-6 w-6" />}
            />
            
            <NeoOfferCard
              title="Data Analysis"
              description="Extract meaningful insights from complex datasets."
              icon={<LineChart className="h-6 w-6" />}
            />
            
            <NeoOfferCard
              title="System Optimization"
              description="Improve performance and efficiency of existing systems."
              icon={<RefreshCw className="h-6 w-6" />}
            />
          </div>

          {/* Projects Section */}
          <NeoSectionTitle as="h2">Projects</NeoSectionTitle>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            <NeoProjectCard
              title="AI Recommendation Engine"
              description="A personalized content recommendation system powered by machine learning."
              imageSrc="/images/demo/ui-design-1.svg"
              tags={["Machine Learning", "Python", "TensorFlow"]}
            />
            
            <NeoProjectCard
              title="IoT Dashboard"
              description="Real-time monitoring system for connected devices."
              imageSrc="/images/demo/ui-design-2.svg"
              tags={["React", "Node.js", "WebSockets"]}
            />
            
            <NeoProjectCard
              title="E-Commerce Platform"
              description="Full-featured online store with payment processing."
              imageSrc="/images/demo/ui-design-3.svg"
              tags={["TypeScript", "Next.js", "Stripe"]}
            />
          </div>

          {/* Timeline Section */}
          <NeoSectionTitle as="h2">Experience Timeline</NeoSectionTitle>
          <NeoTimeline className="mb-10">
            <NeoTimelineItem
              title="Senior Software Engineer"
              subtitle="Tech Innovations Inc."
              date="2023 - Present"
            >
              <p className="text-neo-text-secondary">
                Leading development of cloud-native applications and mentoring junior developers.
              </p>
            </NeoTimelineItem>
            
            <NeoTimelineItem
              title="Full-Stack Developer"
              subtitle="Digital Solutions Ltd."
              date="2020 - 2023"
            >
              <p className="text-neo-text-secondary">
                Developed scalable web applications using modern JavaScript frameworks.
              </p>
            </NeoTimelineItem>
            
            <NeoTimelineItem
              title="Frontend Engineer"
              subtitle="Creative Web Studio"
              date="2018 - 2020"
            >
              <p className="text-neo-text-secondary">
                Created responsive user interfaces with React and optimized web performance.
              </p>
            </NeoTimelineItem>
          </NeoTimeline>
        </div>
      </div>
    </NeoLayout>
  );
}