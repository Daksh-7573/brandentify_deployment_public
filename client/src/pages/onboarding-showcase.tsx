import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NeoGlassSection } from "@/components/ui/neo-glass/index";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { X, Plus, Folder, ExternalLink } from "lucide-react";

interface OnboardingShowcaseProps {
    onComplete: (data: { projects: any[] }) => void;
    onBack: () => void;
    onSkip: () => void;
}

export default function OnboardingShowcase({
    onComplete,
    onBack,
    onSkip
}: OnboardingShowcaseProps) {
    const [projects, setProjects] = useState<any[]>([
        { title: "", description: "", projectUrl: "", category: "Professional" }
    ]);

    const addProject = () => {
        if (projects.length < 5) {
            setProjects([...projects, { title: "", description: "", projectUrl: "", category: "Professional" }]);
        }
    };

    const removeProject = (index: number) => {
        if (projects.length > 1) {
            setProjects(projects.filter((_, i) => i !== index));
        }
    };

    const updateProject = (index: number, field: string, value: string) => {
        const newProjects = [...projects];
        newProjects[index] = { ...newProjects[index], [field]: value };
        setProjects(newProjects);
    };

    const handleContinue = () => {
        const validProjects = projects.filter(p => p.title.trim());
        onComplete({ projects: validProjects });
    };

    const hasValidProject = projects.some(p => p.title.trim());

    return (
        <div
            className="fixed inset-0 w-full h-full responsive-background"
            style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundAttachment: 'fixed'
            }}
        >
            <div className="fixed inset-0 bg-gradient-to-br from-gray-900/80 via-black/70 to-gray-800/80 backdrop-blur-sm"></div>

            <div className="relative z-10 w-full h-full flex items-center justify-center p-4 overflow-y-auto py-8">
                <div className="w-full max-w-3xl my-auto">
                    <NeoGlassSection className="p-8 sm:p-12">
                        <div className="text-center mb-8">
                            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
                                🚀 Portfolio Showcase
                            </h1>
                            <p className="text-lg text-white/80 max-w-xl mx-auto mb-2">
                                Highlight your best work
                            </p>
                            <p className="text-white/60 max-w-xl mx-auto text-sm">
                                Adding projects helps demonstrate your skills in action to potential partners.
                            </p>
                        </div>

                        <div className="space-y-6 mb-8">
                            {projects.map((project, index) => (
                                <div key={index} className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-md relative group">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-10 w-10 rounded-full bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                                            <Folder className="h-5 w-5 text-blue-400" />
                                        </div>
                                        <h3 className="text-white font-medium">Project {index + 1}</h3>
                                        {projects.length > 1 && (
                                            <Button
                                                onClick={() => removeProject(index)}
                                                variant="ghost"
                                                size="sm"
                                                className="ml-auto text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full h-8 w-8 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-sm">Project Title*</Label>
                                            <Input
                                                value={project.title}
                                                onChange={(e) => updateProject(index, 'title', e.target.value)}
                                                placeholder="e.g., E-commerce Redesign"
                                                className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-sm">Link (Optional)</Label>
                                            <div className="relative">
                                                <Input
                                                    value={project.projectUrl}
                                                    onChange={(e) => updateProject(index, 'projectUrl', e.target.value)}
                                                    placeholder="https://..."
                                                    className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl pl-9"
                                                />
                                                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white/70 text-sm">Description</Label>
                                        <Textarea
                                            value={project.description}
                                            onChange={(e) => updateProject(index, 'description', e.target.value)}
                                            placeholder="What did you build? What were the results?"
                                            className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl min-h-[80px]"
                                        />
                                    </div>
                                </div>
                            ))}

                            <Button
                                onClick={addProject}
                                disabled={projects.length >= 5}
                                variant="outline"
                                className="w-full border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-white/70 rounded-2xl py-8 flex flex-col items-center gap-2"
                            >
                                <Plus className="h-6 w-6" />
                                <span>Add Another Project</span>
                            </Button>
                        </div>

                        <div className="flex justify-between items-center bg-black/20 -mx-8 -mb-8 sm:-mx-12 sm:-mb-12 p-8 border-t border-white/10 mt-12">
                            <Button
                                onClick={onBack}
                                variant="ghost"
                                className="text-white/70 hover:text-white rounded-full px-6"
                            >
                                ← Back
                            </Button>

                            <div className="flex gap-4">
                                <Button
                                    onClick={onSkip}
                                    variant="ghost"
                                    className="text-white/50 hover:text-white rounded-full"
                                >
                                    Skip
                                </Button>

                                <Button
                                    onClick={handleContinue}
                                    disabled={!hasValidProject}
                                    size="lg"
                                    className={`px-10 py-6 rounded-full text-lg font-semibold transition-all duration-500 ${hasValidProject
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transform hover:scale-105'
                                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                                        }`}
                                >
                                    Continue →
                                </Button>
                            </div>
                        </div>

                        <div className="text-center mt-12 text-white/40 text-xs">
                            Step 5 of 7 · Show off your expertise
                        </div>
                    </NeoGlassSection>
                </div>
            </div>
        </div>
    );
}

