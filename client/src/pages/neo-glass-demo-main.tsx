import React, { useState } from 'react';
import { Link } from 'wouter';
import { 
  NeoGlassContainer, 
  NeoGlassPanel, 
  NeoGlassCard, 
  NeoGlassButton,
  NeoGlassInput,
  NeoGlassSelect,
  NeoGlassTextarea,
  NeoGlassLabel,
  NeoGlassFormGroup,
  NeoGlassForm,
  NeoGlassHeader,
  NeoGlassSidebar,
  NeoGlassAvatar,
  NeoGlassDivider,
  NeoGlassBadge,
  NeoGlassTabs,
  NeoGlassTab,
  NeoGlassModal
} from '@/components/ui/neo-glass';

// Import icons from lucide-react
import { 
  User, 
  Bell, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Search,
  Mail,
  Calendar,
  Star,
  MessageSquare
} from 'lucide-react';

// Mock data
const mockSkills = [
  { id: 1, name: 'JavaScript', level: 'Advanced' },
  { id: 2, name: 'React', level: 'Advanced' },
  { id: 3, name: 'TypeScript', level: 'Intermediate' },
  { id: 4, name: 'Node.js', level: 'Intermediate' },
  { id: 5, name: 'UI/UX Design', level: 'Beginner' },
];

const mockProjects = [
  { id: 1, title: 'E-commerce Platform', description: 'Built a full-stack e-commerce platform with modern technologies' },
  { id: 2, title: 'Portfolio Website', description: 'Designed and developed a responsive portfolio website' },
  { id: 3, title: 'Task Management App', description: 'Created a task management application with drag-and-drop interface' },
];

const mockNotifications = [
  { id: 1, message: 'New quest available', time: '10 min ago' },
  { id: 2, message: 'Jane Smith viewed your profile', time: '1 hour ago' },
  { id: 3, message: 'New message from Alex Johnson', time: '3 hours ago' },
];

const NeoGlassDemoMain: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Senior Frontend Developer with 5 years of experience in building modern web applications.',
    role: 'developer'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setModalOpen(true);
  };

  return (
    <NeoGlassContainer>
      {/* Header */}
      <NeoGlassHeader className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold">Brandentifier</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-white/10">
            <Bell size={20} />
          </button>
          <button className="p-2 rounded-full hover:bg-white/10">
            <Settings size={20} />
          </button>
          <NeoGlassAvatar 
            src="https://i.pravatar.cc/150?img=4" 
            alt="John Doe" 
            className="cursor-pointer"
          />
        </div>
      </NeoGlassHeader>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar */}
        <NeoGlassSidebar className="w-full md:w-64 rounded-xl">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4 p-2">
              <NeoGlassAvatar 
                src="https://i.pravatar.cc/150?img=4" 
                alt="John Doe" 
              />
              <div>
                <p className="font-semibold">John Doe</p>
                <p className="text-sm text-white/70">Senior Developer</p>
              </div>
            </div>

            <NeoGlassDivider />

            <nav className="flex flex-col gap-2">
              <Link href="#">
                <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition">
                  <User size={18} />
                  <span>Profile</span>
                </a>
              </Link>
              <Link href="#">
                <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition">
                  <Star size={18} />
                  <span>Brand Quests</span>
                </a>
              </Link>
              <Link href="#">
                <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition">
                  <Calendar size={18} />
                  <span>Career Capsule</span>
                </a>
              </Link>
              <Link href="#">
                <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition">
                  <MessageSquare size={18} />
                  <span>Mentorship</span>
                </a>
              </Link>
              <Link href="#">
                <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition">
                  <Mail size={18} />
                  <span>Messages</span>
                </a>
              </Link>
              <Link href="#">
                <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition">
                  <Settings size={18} />
                  <span>Settings</span>
                </a>
              </Link>
            </nav>

            <NeoGlassDivider />

            <div className="mt-auto">
              <Link href="#">
                <a className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition text-red-300">
                  <LogOut size={18} />
                  <span>Sign Out</span>
                </a>
              </Link>
            </div>
          </div>
        </NeoGlassSidebar>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Welcome Card */}
          <NeoGlassPanel className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold mb-2">Welcome back, John!</h2>
                <p className="text-white/70 mb-4">Here's what's happening with your professional growth today.</p>
                <NeoGlassButton>View Your Profile</NeoGlassButton>
              </div>
              <NeoGlassBadge>82% Profile Strength</NeoGlassBadge>
            </div>
          </NeoGlassPanel>

          {/* Tabs and Content */}
          <NeoGlassPanel className="p-6">
            <NeoGlassTabs>
              <NeoGlassTab 
                active={activeTab === 0} 
                onClick={() => setActiveTab(0)}
              >
                Profile
              </NeoGlassTab>
              <NeoGlassTab 
                active={activeTab === 1} 
                onClick={() => setActiveTab(1)}
              >
                Skills
              </NeoGlassTab>
              <NeoGlassTab 
                active={activeTab === 2} 
                onClick={() => setActiveTab(2)}
              >
                Projects
              </NeoGlassTab>
              <NeoGlassTab 
                active={activeTab === 3} 
                onClick={() => setActiveTab(3)}
              >
                Notifications
              </NeoGlassTab>
            </NeoGlassTabs>

            <div className="mt-6">
              {activeTab === 0 && (
                <NeoGlassForm onSubmit={handleSubmit}>
                  <NeoGlassFormGroup>
                    <NeoGlassLabel htmlFor="name">Name</NeoGlassLabel>
                    <NeoGlassInput
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                    />
                  </NeoGlassFormGroup>

                  <NeoGlassFormGroup>
                    <NeoGlassLabel htmlFor="email">Email</NeoGlassLabel>
                    <NeoGlassInput
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                    />
                  </NeoGlassFormGroup>

                  <NeoGlassFormGroup>
                    <NeoGlassLabel htmlFor="role">Professional Role</NeoGlassLabel>
                    <NeoGlassSelect
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                    >
                      <option value="developer">Developer</option>
                      <option value="designer">Designer</option>
                      <option value="manager">Product Manager</option>
                      <option value="marketer">Marketer</option>
                      <option value="other">Other</option>
                    </NeoGlassSelect>
                  </NeoGlassFormGroup>

                  <NeoGlassFormGroup>
                    <NeoGlassLabel htmlFor="bio">Bio</NeoGlassLabel>
                    <NeoGlassTextarea
                      id="bio"
                      name="bio"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell us about yourself"
                      rows={4}
                    />
                  </NeoGlassFormGroup>

                  <div className="flex justify-end mt-6">
                    <NeoGlassButton variant="secondary" className="mr-4">
                      Cancel
                    </NeoGlassButton>
                    <NeoGlassButton type="submit">
                      Save Changes
                    </NeoGlassButton>
                  </div>
                </NeoGlassForm>
              )}

              {activeTab === 1 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">My Skills</h3>
                    <NeoGlassButton variant="secondary" className="text-sm py-2">
                      Add New Skill
                    </NeoGlassButton>
                  </div>
                  
                  {mockSkills.map(skill => (
                    <NeoGlassCard key={skill.id} className="p-4 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{skill.name}</h4>
                        <p className="text-sm text-white/70">{skill.level}</p>
                      </div>
                      <div className="flex gap-2">
                        <button className="p-2 rounded-full hover:bg-white/10">
                          <Star size={16} />
                        </button>
                        <button className="p-2 rounded-full hover:bg-white/10">
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </NeoGlassCard>
                  ))}
                </div>
              )}

              {activeTab === 2 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-semibold">My Projects</h3>
                    <NeoGlassButton variant="secondary" className="text-sm py-2">
                      Add New Project
                    </NeoGlassButton>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mockProjects.map(project => (
                      <NeoGlassCard key={project.id} className="p-4">
                        <h4 className="font-medium mb-2">{project.title}</h4>
                        <p className="text-sm text-white/70 mb-4">{project.description}</p>
                        <div className="flex justify-end">
                          <NeoGlassButton variant="secondary" className="text-xs">
                            View Details
                          </NeoGlassButton>
                        </div>
                      </NeoGlassCard>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 3 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold mb-6">Notifications</h3>
                  
                  {mockNotifications.map(notification => (
                    <NeoGlassCard key={notification.id} className="p-4 flex justify-between items-center">
                      <div>
                        <p className="font-medium">{notification.message}</p>
                        <p className="text-sm text-white/70">{notification.time}</p>
                      </div>
                      <NeoGlassButton variant="secondary" className="text-xs py-1 px-2">
                        View
                      </NeoGlassButton>
                    </NeoGlassCard>
                  ))}
                </div>
              )}
            </div>
          </NeoGlassPanel>

          {/* Career Capsule Preview */}
          <NeoGlassPanel className="p-6">
            <h3 className="text-xl font-semibold mb-4">Career Capsule</h3>
            <p className="text-white/70 mb-4">
              Plan your next 5 years with clarity. Musk turns your dreams into doable steps.
            </p>
            <div className="flex justify-end">
              <NeoGlassButton>
                Open Career Capsule
              </NeoGlassButton>
            </div>
          </NeoGlassPanel>
        </div>
      </div>

      {/* Modal */}
      <NeoGlassModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Success"
      >
        <p className="mb-6">Your profile has been updated successfully!</p>
        <div className="flex justify-end">
          <NeoGlassButton onClick={() => setModalOpen(false)}>
            Close
          </NeoGlassButton>
        </div>
      </NeoGlassModal>
    </NeoGlassContainer>
  );
};

export default NeoGlassDemoMain;