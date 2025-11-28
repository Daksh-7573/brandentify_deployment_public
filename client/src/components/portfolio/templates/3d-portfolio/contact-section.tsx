import { useState } from "react";
import { COLORS } from "./types";
import { Mail, Phone, MapPin, Send, Copy, Check, MessageSquare, Linkedin, Globe } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ContactSectionProps {
  contact: {
    email?: string;
    phone?: string;
    location?: string;
    profileUrl?: string;
    linkedin?: string;
  };
  onSubmit?: (values: { name: string; email: string; message: string }) => Promise<void>;
  className?: string;
  isPreview?: boolean;
}

const ContactSection: React.FC<ContactSectionProps> = ({
  contact,
  onSubmit,
  className = "",
  isPreview = false
}) => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: "Copied!",
        description: `${field} copied to clipboard`
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onSubmit) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', email: '', message: '' });
      toast({
        title: "Message sent!",
        description: "Thank you for reaching out. I'll get back to you soon."
      });
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactItems = [
    { icon: Mail, label: 'Email', value: contact.email, field: 'Email' },
    { icon: Phone, label: 'Phone', value: contact.phone, field: 'Phone' },
    { icon: MapPin, label: 'Location', value: contact.location, field: 'Location' },
    { icon: Globe, label: 'Website', value: contact.profileUrl, field: 'Website' }
  ].filter(item => item.value);

  return (
    <section
      className={`relative ${isPreview ? 'py-4' : 'py-16 lg:py-24'} ${className}`}
      style={{
        background: `linear-gradient(180deg, ${COLORS.deepCharcoal} 0%, ${COLORS.charcoalBlack} 100%)`
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(90deg, ${COLORS.subtleGrid} 1px, transparent 1px),
            linear-gradient(0deg, ${COLORS.subtleGrid} 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
          opacity: 0.04
        }}
      />

      <div className={`max-w-6xl mx-auto ${isPreview ? 'px-3' : 'px-6 lg:px-8'} relative z-10`}>
        {!isPreview && (
          <div className="text-center mb-12">
            <h2
              className="text-3xl lg:text-4xl font-bold mb-4"
              style={{
                fontFamily: "'Sora', 'Inter', sans-serif",
                color: COLORS.offWhite
              }}
            >
              Let's Connect
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: COLORS.coolGray }}>
              Have a project in mind? I'd love to hear from you.
            </p>
          </div>
        )}

        <div className={`grid ${isPreview ? 'grid-cols-1 gap-3' : 'lg:grid-cols-2 gap-12'}`}>
          <div className={`space-y-${isPreview ? '2' : '6'}`}>
            {!isPreview && (
              <h3 className="text-xl font-semibold mb-4" style={{ color: COLORS.offWhite }}>
                Get in Touch
              </h3>
            )}

            <div className={`space-y-${isPreview ? '2' : '4'}`}>
              {contactItems.slice(0, isPreview ? 2 : undefined).map((item, i) => {
                const IconComponent = item.icon;
                const isCopied = copiedField === item.field;

                return (
                  <div
                    key={item.field}
                    className={`group flex items-center gap-4 ${isPreview ? 'p-2' : 'p-4'} rounded-lg cursor-pointer transition-all duration-200`}
                    style={{
                      background: `${COLORS.charcoalBlack}80`,
                      border: `1px solid ${COLORS.electricBlue}20`
                    }}
                    onClick={() => item.value && handleCopy(item.value, item.field)}
                  >
                    <div
                      className={`${isPreview ? 'w-8 h-8' : 'w-12 h-12'} rounded-lg flex items-center justify-center`}
                      style={{
                        background: `${COLORS.electricBlue}20`,
                        border: `1px solid ${COLORS.electricBlue}40`
                      }}
                    >
                      <IconComponent
                        className={`${isPreview ? 'h-4 w-4' : 'h-5 w-5'}`}
                        style={{ color: COLORS.electricBlue }}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium" style={{ color: COLORS.coolGray }}>
                        {item.label}
                      </p>
                      <p
                        className={`${isPreview ? 'text-xs' : 'text-sm'} font-medium truncate`}
                        style={{ color: COLORS.offWhite }}
                      >
                        {item.value}
                      </p>
                    </div>
                    {!isPreview && (
                      <button
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        style={{ color: isCopied ? COLORS.mintGreen : COLORS.coolGray }}
                      >
                        {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {!isPreview && (
            <div
              className="p-6 rounded-xl"
              style={{
                background: `linear-gradient(135deg, ${COLORS.charcoalBlack}90, ${COLORS.charcoalBlack}70)`,
                border: `1px solid ${COLORS.electricBlue}30`
              }}
            >
              <h3 className="text-xl font-semibold mb-6" style={{ color: COLORS.offWhite }}>
                Send a Message
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.silverGray }}>
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none transition-all"
                    style={{
                      background: COLORS.charcoalBlack,
                      border: `1px solid ${COLORS.silverGray}30`,
                      color: COLORS.offWhite
                    }}
                    placeholder="John Doe"
                    required
                    data-testid="input-name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.silverGray }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData(f => ({ ...f, email: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none transition-all"
                    style={{
                      background: COLORS.charcoalBlack,
                      border: `1px solid ${COLORS.silverGray}30`,
                      color: COLORS.offWhite
                    }}
                    placeholder="john@example.com"
                    required
                    data-testid="input-email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.silverGray }}>
                    Message
                  </label>
                  <textarea
                    value={formData.message}
                    onChange={e => setFormData(f => ({ ...f, message: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg text-sm focus:outline-none transition-all resize-none"
                    style={{
                      background: COLORS.charcoalBlack,
                      border: `1px solid ${COLORS.silverGray}30`,
                      color: COLORS.offWhite
                    }}
                    placeholder="Tell me about your project..."
                    required
                    data-testid="input-message"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                  style={{
                    background: `linear-gradient(135deg, ${COLORS.electricBlue}, ${COLORS.neonPurple})`,
                    color: COLORS.offWhite,
                    boxShadow: `0 4px 20px ${COLORS.electricBlue}40`
                  }}
                  data-testid="btn-submit"
                >
                  {isSubmitting ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
