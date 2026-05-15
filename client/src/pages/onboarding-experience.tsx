import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { NeoGlassSection } from "@/components/ui/neo-glass/index";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { X, Plus, Briefcase, Calendar } from "lucide-react";

interface OnboardingExperienceProps {
    onComplete: (data: { experiences: any[] }) => void;
    onBack: () => void;
    onSkip: () => void;
}

export default function OnboardingExperience({
    onComplete,
    onBack,
    onSkip
}: OnboardingExperienceProps) {
    const [experiences, setExperiences] = useState<any[]>([
        { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }
    ]);

    const addExperience = () => {
        if (experiences.length < 5) {
            setExperiences([...experiences, { title: "", company: "", location: "", startDate: "", endDate: "", current: false, description: "" }]);
        }
    };

    const removeExperience = (index: number) => {
        if (experiences.length > 1) {
            setExperiences(experiences.filter((_, i) => i !== index));
        }
    };

    const updateExperience = (index: number, field: string, value: any) => {
        const newExperiences = [...experiences];
        newExperiences[index] = { ...newExperiences[index], [field]: value };
        setExperiences(newExperiences);
    };

    const handleContinue = () => {
        const validExperiences = experiences.filter(e => e.title.trim() && e.company.trim());
        onComplete({ experiences: validExperiences });
    };

    const hasValidExperience = experiences.some(e => e.title.trim() && e.company.trim());

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
                                💼 Career Journey
                            </h1>
                            <p className="text-lg text-white/80 max-w-xl mx-auto mb-2">
                                Your professional experience
                            </p>
                            <p className="text-white/60 max-w-xl mx-auto text-sm">
                                Sharing your career history helps our AI tailor your growth strategy.
                            </p>
                        </div>

                        <div className="space-y-6 mb-8">
                            {experiences.map((exp, index) => (
                                <div key={index} className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-md relative">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                                            <Briefcase className="h-5 w-5 text-emerald-400" />
                                        </div>
                                        <h3 className="text-white font-medium">Position {index + 1}</h3>
                                        {experiences.length > 1 && (
                                            <Button
                                                onClick={() => removeExperience(index)}
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
                                            <Label className="text-white/70 text-sm">Job Title*</Label>
                                            <Input
                                                value={exp.title}
                                                onChange={(e) => updateExperience(index, 'title', e.target.value)}
                                                placeholder="e.g., Senior Software Engineer"
                                                className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-sm">Company*</Label>
                                            <Input
                                                value={exp.company}
                                                onChange={(e) => updateExperience(index, 'company', e.target.value)}
                                                placeholder="e.g., Tech Corp Inc."
                                                className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-sm">Start Date</Label>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    value={exp.startDate}
                                                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                                                    placeholder="MM/YYYY"
                                                    className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl pl-9"
                                                />
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label className="text-white/70 text-sm">End Date</Label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`current-${index}`}
                                                        checked={exp.current}
                                                        onChange={(e) => updateExperience(index, 'current', e.target.checked)}
                                                        className="w-3 h-3 accent-emerald-500"
                                                    />
                                                    <Label htmlFor={`current-${index}`} className="text-white/50 text-[10px] cursor-pointer uppercase tracking-wider">Current</Label>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    disabled={exp.current}
                                                    value={exp.current ? 'Present' : exp.endDate}
                                                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                                                    placeholder="MM/YYYY"
                                                    className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl pl-9 disabled:opacity-50"
                                                />
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-white/70 text-sm">Description</Label>
                                        <Textarea
                                            value={exp.description}
                                            onChange={(e) => updateExperience(index, 'description', e.target.value)}
                                            placeholder="What were your key achievements?"
                                            className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl min-h-[80px]"
                                        />
                                    </div>
                                </div>
                            ))}

                            <Button
                                onClick={addExperience}
                                disabled={experiences.length >= 5}
                                variant="outline"
                                className="w-full border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-white/70 rounded-2xl py-8 flex flex-col items-center gap-2"
                            >
                                <Plus className="h-6 w-6" />
                                <span>Add Another Position</span>
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
                                    disabled={!hasValidExperience}
                                    size="lg"
                                    className={`px-10 py-6 rounded-full text-lg font-semibold transition-all duration-500 ${hasValidExperience
                                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] transform hover:scale-105'
                                            : 'bg-white/5 text-white/20 cursor-not-allowed'
                                        }`}
                                >
                                    Continue →
                                </Button>
                            </div>
                        </div>

                        <div className="text-center mt-12 text-white/40 text-xs">
                            Step 6 of 7 · Map your professional path
                        </div>
                    </NeoGlassSection>
                </div>
            </div>
        </div>
    );
}

