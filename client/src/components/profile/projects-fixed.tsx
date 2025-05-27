import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { Plus, Upload, X, FolderKanban, Users, MessageSquare, Award } from 'lucide-react';

interface Project {
  id: number;
  title: string;
  description: string | null;
  category: string | null;
  industry: string | null;
  startDate: string;
  projectUrl: string | null;
  thumbnailUrl: string | null;
  mediaUrls: string[] | string | null;
  userId: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

const ProjectsFixed = () => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const projectForm = useForm();

  const onProjectSubmit = async (values: any) => {
    console.log('Form submitted:', values);
    setIsAddModalOpen(false);
  };

  return (
    <div className="flex-1">
      {/* Header */}
      <div className="flex flex-row items-center justify-between space-y-0 pb-4 mb-4 border-b border-gray-800">
        <div>
          <h2 className="text-xl font-bold text-white">
            Project Showcase
          </h2>
          <p className="text-sm text-gray-300">Highlight your best work and project achievements</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="neo-glass-button flex items-center gap-2 py-1.5 px-3 whitespace-nowrap"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Showcase</span>
        </button>
      </div>

      {/* Projects List - Empty State */}
      <div className="text-center py-8">
        <div className="flex flex-col items-center">
          <FolderKanban className="h-10 w-10 text-gray-400/50 mb-4" />
          <p className="text-gray-400">No projects yet. Add your first showcase project!</p>
        </div>
      </div>

      {/* Add Project Modal */}
      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-hidden neo-glass-card bg-transparent">
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-semibold">Add Showcase</DialogTitle>
          </DialogHeader>
          
          <div className="max-h-[70vh] overflow-y-auto pr-2" style={{
            scrollbarWidth: 'thin',
            scrollbarColor: 'rgba(255,255,255,0.3) rgba(255,255,255,0.1)'
          }}>
            <form onSubmit={projectForm.handleSubmit(onProjectSubmit)} className="space-y-6 py-5">
              <Tabs defaultValue="details" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full mb-6 dark-tabs-list">
                  <TabsTrigger value="details" className="flex-1 dark-tabs-trigger">Details</TabsTrigger>
                  <TabsTrigger value="media" className="flex-1 dark-tabs-trigger">Media</TabsTrigger>
                  <TabsTrigger value="team" className="flex-1 dark-tabs-trigger">Team</TabsTrigger>
                  <TabsTrigger value="endorsements" className="flex-1 dark-tabs-trigger">Clients</TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="space-y-6 pt-6">
                  <div className="space-y-6">
                    {/* Project Title */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        Project Title
                      </label>
                      <input
                        {...projectForm.register('title')}
                        placeholder="Enter project title..."
                        className="neo-glass-input"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        Description
                      </label>
                      <textarea
                        {...projectForm.register('description')}
                        placeholder="Describe your project..."
                        rows={4}
                        className="neo-glass-input resize-none"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        Category
                      </label>
                      <select
                        {...projectForm.register('category')}
                        className="neo-glass-input h-12 px-4 py-3"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='rgba(255,255,255,0.5)' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 1rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          paddingRight: '3rem',
                          paddingLeft: '1rem',
                          appearance: 'none',
                          lineHeight: '1.5'
                        }}
                      >
                        <option value="" style={{backgroundColor: '#1a1a1a', color: 'white'}}>Select category...</option>
                        <option value="web" style={{backgroundColor: '#1a1a1a', color: 'white'}}>Web Development</option>
                        <option value="mobile" style={{backgroundColor: '#1a1a1a', color: 'white'}}>Mobile App</option>
                        <option value="design" style={{backgroundColor: '#1a1a1a', color: 'white'}}>Design</option>
                        <option value="other" style={{backgroundColor: '#1a1a1a', color: 'white'}}>Other</option>
                      </select>
                    </div>

                    {/* Industry */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        Industry
                      </label>
                      <input
                        {...projectForm.register('industry')}
                        placeholder="Enter industry..."
                        className="neo-glass-input"
                      />
                    </div>

                    {/* Project URL */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        Project URL
                      </label>
                      <input
                        {...projectForm.register('projectUrl')}
                        placeholder="https://example.com"
                        className="neo-glass-input"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-6 pt-6">
                  <div className="space-y-6">
                    {/* Thumbnail Upload */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Project Thumbnail
                      </label>
                      <div className="border-2 border-dashed border-white/30 rounded-lg p-6 bg-white/5 backdrop-blur-sm hover:border-white/50 transition-colors">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="thumbnail-upload"
                        />
                        <label htmlFor="thumbnail-upload" className="cursor-pointer block text-center">
                          <Upload className="h-8 w-8 text-white/50 mx-auto mb-2" />
                          <p className="text-white/70 text-sm">Click to upload thumbnail</p>
                          <p className="text-white/50 text-xs mt-1">PNG, JPG up to 5MB</p>
                        </label>
                      </div>
                    </div>

                    {/* Media URLs */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm">
                        Media URLs (Screenshots, Videos)
                      </label>
                      <textarea
                        placeholder="Enter URLs separated by commas&#10;https://example.com/image1.jpg,&#10;https://example.com/video1.mp4"
                        className="neo-glass-input resize-none h-24"
                      />
                      <p className="text-white/50 text-xs">Separate multiple URLs with commas</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="team" className="space-y-6 pt-6">
                  <div className="space-y-6">
                    {/* Team Members */}
                    <div className="space-y-4">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team Members
                      </label>
                      
                      {/* Team Member 1 */}
                      <div className="space-y-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-white/80 text-sm">Name</label>
                            <input
                              placeholder="Team member name"
                              className="neo-glass-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-white/80 text-sm">Role</label>
                            <input
                              placeholder="e.g., Designer, Developer"
                              className="neo-glass-input"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-white/80 text-sm">LinkedIn/Portfolio</label>
                          <input
                            placeholder="https://linkedin.com/in/username"
                            className="neo-glass-input"
                          />
                        </div>
                      </div>

                      {/* Add Team Member Button */}
                      <button
                        type="button"
                        className="w-full p-3 border-2 border-dashed border-white/30 rounded-lg bg-white/5 backdrop-blur-sm hover:border-white/50 hover:bg-white/10 transition-all text-white/70 text-sm flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Team Member
                      </button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="endorsements" className="space-y-6 pt-6">
                  <div className="space-y-6">
                    {/* Client Testimonials */}
                    <div className="space-y-4">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        Client Testimonials
                      </label>
                      
                      {/* Testimonial 1 */}
                      <div className="space-y-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-white/80 text-sm">Client Name</label>
                            <input
                              placeholder="Client or company name"
                              className="neo-glass-input"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-white/80 text-sm">Position</label>
                            <input
                              placeholder="e.g., CEO, Marketing Director"
                              className="neo-glass-input"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-white/80 text-sm">Testimonial</label>
                          <textarea
                            placeholder="What did the client say about your work?"
                            className="neo-glass-input resize-none h-20"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-white/80 text-sm">Company/LinkedIn</label>
                          <input
                            placeholder="https://company.com or LinkedIn profile"
                            className="neo-glass-input"
                          />
                        </div>
                      </div>

                      {/* Add Testimonial Button */}
                      <button
                        type="button"
                        className="w-full p-3 border-2 border-dashed border-white/30 rounded-lg bg-white/5 backdrop-blur-sm hover:border-white/50 hover:bg-white/10 transition-all text-white/70 text-sm flex items-center justify-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Add Testimonial
                      </button>
                    </div>

                    {/* Recognition/Awards */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        <Award className="h-4 w-4" />
                        Recognition & Awards
                      </label>
                      <textarea
                        placeholder="Any awards, recognition, or special mentions for this project..."
                        className="neo-glass-input resize-none h-20"
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
              
              {/* Form Action Buttons */}
              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-6 py-3 bg-[rgba(40,40,40,0.8)] backdrop-blur-md text-white border border-white/20 rounded-md shadow-md transition-all hover:bg-[rgba(60,60,60,0.9)] hover:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 neo-glass-button text-white font-medium rounded-md shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/30"
                >
                  Add Showcase
                </button>
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProjectsFixed;