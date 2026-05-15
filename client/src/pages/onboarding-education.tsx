import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { NeoGlassSection } from "@/components/ui/neo-glass/index";
import backgroundImage from "@assets/Brandentifier Landing_1751376023002.png";
import { X, Plus, GraduationCap, Calendar } from "lucide-react";

interface OnboardingEducationProps {
    onComplete: (data: { educations: any[] }) => void;
    onBack: () => void;
    onSkip: () => void;
}

export default function OnboardingEducation({
    onComplete,
    onBack,
    onSkip
}: OnboardingEducationProps) {
    const [educations, setEducations] = useState<any[]>([
        { institution: "", degree: "", field: "", startDate: "", endDate: "", current: false }
    ]);

    const addEducation = () => {
        if (educations.length < 3) {
            setEducations([...educations, { institution: "", degree: "", field: "", startDate: "", endDate: "", current: false }]);
        }
    };

    const removeEducation = (index: number) => {
        if (educations.length > 1) {
            setEducations(educations.filter((_, i) => i !== index));
        }
    };

    const updateEducation = (index: number, field: string, value: any) => {
        const newEducations = [...educations];
        newEducations[index] = { ...newEducations[index], [field]: value };
        setEducations(newEducations);
    };

    const handleContinue = () => {
        const validEducations = educations.filter(e => e.institution.trim() && e.degree.trim());
        onComplete({ educations: validEducations });
    };

    const hasValidEducation = educations.some(e => e.institution.trim() && e.degree.trim());

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
                                🎓 Academic Foundation
                            </h1>
                            <p className="text-lg text-white/80 max-w-xl mx-auto mb-2">
                                Your educational background
                            </p>
                            <p className="text-white/60 max-w-xl mx-auto text-sm">
                                Final step! Adding your education helps us understand your theoretical foundation.
                            </p>
                        </div>

                        <div className="space-y-6 mb-8">
                            {educations.map((edu, index) => (
                                <div key={index} className="border border-white/10 rounded-2xl p-6 bg-white/5 backdrop-blur-md relative">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                                            <GraduationCap className="h-5 w-5 text-purple-400" />
                                        </div>
                                        <h3 className="text-white font-medium">Education {index + 1}</h3>
                                        {educations.length > 1 && (
                                            <Button
                                                onClick={() => removeEducation(index)}
                                                variant="ghost"
                                                size="sm"
                                                className="ml-auto text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-full h-8 w-8 p-0"
                                            >
                                                <X className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>

                                    <div className="space-y-4 mb-4">
                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-sm">Institution / University*</Label>
                                            <Input
                                                value={edu.institution}
                                                onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                                                placeholder="e.g., Stanford University"
                                                className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl"
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-white/70 text-sm">Degree / Qualification*</Label>
                                                <Input
                                                    value={edu.degree}
                                                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                                                    placeholder="e.g., Bachelor of Science"
                                                    className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-white/70 text-sm">Field of Study</Label>
                                                <Input
                                                    value={edu.field}
                                                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                                                    placeholder="e.g., Computer Science"
                                                    className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-white/70 text-sm">Start Date</Label>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    value={edu.startDate}
                                                    onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                                                    placeholder="YYYY"
                                                    className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl pl-9"
                                                />
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex justify-between">
                                                <Label className="text-white/70 text-sm">End Date (Expected)</Label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="checkbox"
                                                        id={`curr-edu-${index}`}
                                                        checked={edu.current}
                                                        onChange={(e) => updateEducation(index, 'current', e.target.checked)}
                                                        className="w-3 h-3 accent-purple-500"
                                                    />
                                                    <Label htmlFor={`curr-edu-${index}`} className="text-white/50 text-[10px] cursor-pointer uppercase tracking-wider">Current</Label>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <Input
                                                    type="text"
                                                    disabled={edu.current}
                                                    value={edu.current ? 'Present' : edu.endDate}
                                                    onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                                                    placeholder="YYYY"
                                                    className="neo-glass-input bg-black/40 border-white/10 text-white rounded-xl pl-9 disabled:opacity-50"
                                                />
                                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            <Button
                                onClick={addEducation}
                                disabled={educations.length >= 3}
                                variant="outline"
                                className="w-full border-dashed border-white/20 bg-white/5 hover:bg-white/10 text-white/70 rounded-2xl py-8 flex flex-col items-center gap-2"
                            >
                                <Plus className="h-6 w-6" />
                                <span>Add More Education</span>
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
                                    size="lg"
                                    className={`px-10 py-6 rounded-full text-lg font-semibold transition-all duration-500 ${hasValidEducation
                                            ? 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] transform hover:scale-105'
                                            : 'bg-white/20 text-white hover:bg-white/30'
                                        }`}
                                >
                                    {hasValidEducation ? 'Complete Setup 🏁' : 'Complete Setup Without Education'}
                                </Button>
                            </div>
                        </div>

                        <div className="text-center mt-12 text-white/40 text-xs">
                            Step 7 of 7 · You're all set!
                        </div>
                    </NeoGlassSection>
                </div>
            </div>
        </div>
    );
}

