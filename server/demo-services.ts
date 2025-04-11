import { IStorage } from './storage';
import { InsertService } from '../shared/schema';

/**
 * Helper function that adds services to all demo profiles
 * Each profile gets relevant professional services based on their expertise
 */
export async function addDemoServices(storage: IStorage) {
  
  // Get user IDs from storage
  const elonMusk = await storage.getUserByUsername("elon_musk");
  const techExec = await storage.getUserByUsername("alex_johnson");
  const designer = await storage.getUserByUsername("maya_rodriguez");
  const dataScientist = await storage.getUserByUsername("david_patel");
  
  if (!elonMusk || !techExec || !designer || !dataScientist) {
    console.log("Demo profiles not found. Create them first using createDemoProfiles()");
    return;
  }

  // Services for Elon Musk (Industry Leader)
  const muskServices: InsertService[] = [
    {
      userId: elonMusk.id,
      title: "Executive Mentorship for Tech Leaders",
      description: "One-on-one mentorship sessions for C-suite executives and high-potential leaders in tech companies. Sharing insights on disruptive innovation, scaling operations, and creating a culture of engineering excellence.",
      category: "coaching",
      priceUsd: "5000",
      isHourly: false,
      features: JSON.stringify([
        "Strategic vision development", 
        "Leadership during hypergrowth", 
        "First principles thinking approach", 
        "Disruption strategy"
      ]),
      imageUrl: "/images/demo/mentorship-service.png",
      order: 1,
      isActive: true
    },
    {
      userId: elonMusk.id,
      title: "Strategic Advisory for Space Ventures",
      description: "Advisory services for companies developing space technologies or planning commercial space operations. Includes technical review, business model evaluation, and strategic roadmap development.",
      category: "consulting",
      priceUsd: "25000",
      isHourly: false,
      features: JSON.stringify([
        "Technical feasibility assessment", 
        "Cost optimization strategies", 
        "Regulatory navigation", 
        "Long-term vision alignment"
      ]),
      imageUrl: "/images/demo/space-consulting.png",
      order: 2,
      isActive: true
    }
  ];

  // Services for Tech Executive (Alex Johnson)
  const techExecServices: InsertService[] = [
    {
      userId: techExec.id,
      title: "Engineering Leadership Coaching",
      description: "Personalized coaching for engineering managers and directors looking to level up their leadership skills. From building high-performing teams to implementing effective engineering processes, I'll help you navigate leadership challenges based on 15+ years of experience.",
      category: "coaching",
      priceUsd: "350",
      isHourly: true,
      features: JSON.stringify([
        "Leadership assessment and personalized growth plan",
        "Technical organization structure consulting",
        "Engineering process optimization",
        "Team culture development strategies",
        "Crisis management and difficult conversations"
      ]),
      imageUrl: "/images/demo/leadership-coaching.png",
      order: 1,
      isActive: true
    },
    {
      userId: techExec.id,
      title: "Cloud Architecture Consulting",
      description: "Expert consulting for organizations looking to optimize their cloud infrastructure or migrate to cloud-native architectures. I specialize in designing scalable, secure, and cost-effective solutions across AWS, Azure, and GCP.",
      category: "consulting",
      priceUsd: "5000",
      isHourly: false,
      features: JSON.stringify([
        "Cloud architecture assessment",
        "Migration planning and strategy",
        "Cost optimization recommendations",
        "Security and compliance review",
        "Performance tuning and scalability design"
      ]),
      imageUrl: "/images/demo/cloud-consulting.png",
      order: 2,
      isActive: true
    }
  ];

  // Services for UX Designer (Maya Rodriguez)
  const designerServices: InsertService[] = [
    {
      userId: designer.id,
      title: "UX Design System Development",
      description: "Create a comprehensive, scalable design system for your product. From component libraries to usage guidelines, I'll build a foundation that improves design consistency and accelerates your product development process.",
      category: "design",
      priceUsd: "7500",
      isHourly: false,
      features: JSON.stringify([
        "Component library creation",
        "Design tokens & style guide",
        "Documentation & usage guidelines",
        "Figma organization & file structure",
        "Dev handoff specifications"
      ]),
      imageUrl: "/images/demo/design-system.png",
      order: 1,
      isActive: true
    },
    {
      userId: designer.id,
      title: "Product UX Audit & Recommendations",
      description: "Comprehensive review of your existing digital product's user experience. I'll identify pain points, accessibility issues, and conversion blockers, then provide prioritized recommendations for improvement.",
      category: "consulting",
      priceUsd: "2500",
      isHourly: false,
      features: JSON.stringify([
        "Usability evaluation",
        "Accessibility assessment (WCAG)",
        "Conversion path analysis",
        "Information architecture review",
        "Prioritized improvement roadmap"
      ]),
      imageUrl: "/images/demo/ux-audit.png",
      order: 2,
      isActive: true
    },
    {
      userId: designer.id,
      title: "UX/UI Design Workshops",
      description: "Interactive workshops for product teams to learn and apply user-centered design principles. Perfect for teams looking to level up their design thinking skills or tackle a specific product challenge.",
      category: "teaching",
      priceUsd: "400",
      isHourly: true,
      features: JSON.stringify([
        "Custom workshop design based on team needs",
        "Interactive exercises and activities",
        "Practical design thinking frameworks",
        "Follow-up materials and resources",
        "Post-workshop implementation guidance"
      ]),
      imageUrl: "/images/demo/design-workshop.png",
      order: 3,
      isActive: true
    }
  ];

  // Services for Data Scientist (David Patel)
  const dataScientistServices: InsertService[] = [
    {
      userId: dataScientist.id,
      title: "ML Model Development & Deployment",
      description: "End-to-end development of custom machine learning models tailored to your business needs. From initial data exploration to model deployment and monitoring, I'll build solutions that drive real business value.",
      category: "development",
      priceUsd: "10000",
      isHourly: false,
      features: JSON.stringify([
        "Custom ML model development",
        "Data preprocessing pipeline",
        "Model training & optimization",
        "Deployment architecture design",
        "Monitoring & maintenance plan"
      ]),
      imageUrl: "/images/demo/ml-development.png",
      order: 1,
      isActive: true
    },
    {
      userId: dataScientist.id,
      title: "Data Strategy Consulting",
      description: "Strategic planning to help your organization leverage data more effectively. I'll work with your team to identify opportunities, define data requirements, and create a roadmap for implementing data science initiatives.",
      category: "consulting",
      priceUsd: "450",
      isHourly: true,
      features: JSON.stringify([
        "Data maturity assessment",
        "Opportunity identification",
        "Technology stack recommendations",
        "Team structure & hiring guidance",
        "Implementation roadmap"
      ]),
      imageUrl: "/images/demo/data-strategy.png",
      order: 2,
      isActive: true
    },
    {
      userId: dataScientist.id,
      title: "Healthcare ML Research Collaboration",
      description: "Research partnership to explore applications of machine learning in healthcare. Ideal for healthcare providers, researchers, or startups looking to leverage cutting-edge ML techniques for medical applications.",
      category: "consulting",
      priceUsd: "20000",
      isHourly: false,
      features: JSON.stringify([
        "Literature review & state-of-the-art analysis",
        "Dataset curation & annotation",
        "Custom algorithm development",
        "Validation against clinical standards",
        "Publication-ready research materials"
      ]),
      imageUrl: "/images/demo/healthcare-ml.png",
      order: 3,
      isActive: true
    }
  ];

  // Create all services
  console.log("Adding services for Elon Musk...");
  for (const service of muskServices) {
    await storage.createService(service);
  }

  console.log("Adding services for Alex Johnson...");
  for (const service of techExecServices) {
    await storage.createService(service);
  }

  console.log("Adding services for Maya Rodriguez...");
  for (const service of designerServices) {
    await storage.createService(service);
  }

  console.log("Adding services for David Patel...");
  for (const service of dataScientistServices) {
    await storage.createService(service);
  }

  console.log("Successfully added all demo services!");
}