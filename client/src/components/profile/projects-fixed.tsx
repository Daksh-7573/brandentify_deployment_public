import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useForm } from 'react-hook-form';
import { Plus, Upload, X, FolderKanban } from 'lucide-react';

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
          <h2 className="text-xl font-bold text-white flex items-center">
            <FolderKanban className="h-5 w-5 mr-2 text-blue-400" />
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
        <p className="text-gray-500">No projects yet. Add your first showcase project!</p>
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
                <TabsList className="w-full bg-[rgba(18,18,18,0.7)] backdrop-blur-md border-white/20">
                  <TabsTrigger value="details" className="flex-1 text-white data-[state=active]:bg-white/20">Details</TabsTrigger>
                  <TabsTrigger value="media" className="flex-1 text-white data-[state=active]:bg-white/20">Media</TabsTrigger>
                  <TabsTrigger value="team" className="flex-1 text-white data-[state=active]:bg-white/20">Team</TabsTrigger>
                  <TabsTrigger value="endorsements" className="flex-1 text-white data-[state=active]:bg-white/20">Clients</TabsTrigger>
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
                        className="w-full px-4 py-3 bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border border-white/20 rounded-md shadow-md transition-all hover:border-white/30 focus:border-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none placeholder-white/50"
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
                        className="w-full px-4 py-3 bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border border-white/20 rounded-md shadow-md transition-all hover:border-white/30 focus:border-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none placeholder-white/50 resize-none"
                      />
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                      <label className="text-white font-medium text-sm flex items-center gap-2">
                        Category
                      </label>
                      <select
                        {...projectForm.register('category')}
                        className="w-full px-4 py-3 bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border border-white/20 rounded-md shadow-md transition-all hover:border-white/30 focus:border-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none"
                      >
                        <option value="">Select category...</option>
                        <option value="web">Web Development</option>
                        <option value="mobile">Mobile App</option>
                        <option value="design">Design</option>
                        <option value="other">Other</option>
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
                        className="w-full px-4 py-3 bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border border-white/20 rounded-md shadow-md transition-all hover:border-white/30 focus:border-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none placeholder-white/50"
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
                        className="w-full px-4 py-3 bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border border-white/20 rounded-md shadow-md transition-all hover:border-white/30 focus:border-white/40 focus:ring-2 focus:ring-white/30 focus:outline-none placeholder-white/50"
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="space-y-6 pt-6">
                  <div className="text-center py-8">
                    <Upload className="h-12 w-12 text-white/50 mx-auto mb-4" />
                    <p className="text-white/70">Media upload functionality</p>
                  </div>
                </TabsContent>

                <TabsContent value="team" className="space-y-6 pt-6">
                  <div className="text-center py-8">
                    <p className="text-white/70">Team management functionality</p>
                  </div>
                </TabsContent>

                <TabsContent value="endorsements" className="space-y-6 pt-6">
                  <div className="text-center py-8">
                    <p className="text-white/70">Client endorsements functionality</p>
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