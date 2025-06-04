import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { CheckCircle, XCircle, Loader2, X } from 'lucide-react';
import { UserData } from '@/types/user';
import { apiRequest } from '@/lib/queryClient';

const contactInfoSchema = z.object({
  email: z.string().email('Invalid email address'),
  phoneNumber: z.string().optional(),
  brandName: z.string().min(3, 'Brand name must be at least 3 characters').max(20, 'Brand name must be at most 20 characters').optional().or(z.literal('')),
});

type ContactInfoData = z.infer<typeof contactInfoSchema>;

interface EditContactInfoProps {
  userData: UserData;
  onCancel: () => void;
  onSave: () => void;
}

type BrandNameStatus = 'idle' | 'checking' | 'available' | 'taken' | 'invalid';

const EditContactInfo: React.FC<EditContactInfoProps> = ({ userData, onCancel, onSave }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [brandName, setBrandName] = useState(userData.brandName || '');
  const [brandNameStatus, setBrandNameStatus] = useState<BrandNameStatus>('idle');

  const form = useForm<ContactInfoData>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      brandName: userData.brandName || '',
    },
  });

  const validateBrandName = (name: string): boolean => {
    if (!name) return true; // Optional field
    if (name.length < 3 || name.length > 20) return false;
    return /^[a-zA-Z0-9_-]+$/.test(name);
  };

  const checkBrandNameAvailability = async (name: string) => {
    if (!name || !validateBrandName(name)) {
      setBrandNameStatus('invalid');
      return;
    }

    setBrandNameStatus('checking');
    try {
      const currentUserId = userData.id;
      const response = await apiRequest('GET', `/api/users/check-brand-name/${encodeURIComponent(name)}?currentUserId=${currentUserId}`);
      const data = await response.json();
      setBrandNameStatus(data.available ? 'available' : 'taken');
    } catch (error) {
      console.error('Error checking brand name:', error);
      setBrandNameStatus('invalid');
    }
  };

  const handleBrandNameChange = (value: string) => {
    setBrandName(value);
    
    if (!value) {
      setBrandNameStatus('idle');
      return;
    }

    if (!validateBrandName(value)) {
      setBrandNameStatus('invalid');
      return;
    }

    // Debounce API calls
    const timeoutId = setTimeout(() => {
      checkBrandNameAvailability(value);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const getBrandNameStatusMessage = () => {
    switch (brandNameStatus) {
      case 'checking':
        return { message: 'Checking availability...', color: 'text-yellow-600' };
      case 'available':
        return { message: 'This brand name is available', color: 'text-green-600' };
      case 'taken':
        return { message: 'This brand name is already taken', color: 'text-red-600' };
      case 'invalid':
        return { message: 'Brand name must be 3-20 characters, letters, numbers, hyphens and underscores only', color: 'text-red-600' };
      default:
        return null;
    }
  };

  const getBrandNameIcon = () => {
    switch (brandNameStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 animate-spin text-yellow-600" />;
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'taken':
      case 'invalid':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return null;
    }
  };

  const onSubmit = async (data: ContactInfoData) => {
    if (data.brandName && brandNameStatus === 'taken') {
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest('PUT', `/api/users/${userData.id}`, {
        email: data.email,
        phoneNumber: data.phoneNumber || null,
        brandName: data.brandName || null,
      });

      if (response.ok) {
        onSave();
      }
    } catch (error) {
      console.error('Error updating contact info:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const statusMessage = getBrandNameStatusMessage();

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur border border-white/20 shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div>
            <CardTitle className="text-xl font-semibold">Edit Contact Information</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Update your email, phone number, and brand name
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your.email@example.com"
                        className="bg-white/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Phone Number */}
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="tel"
                        placeholder="+1 (555) 123-4567"
                        className="bg-white/50"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Brand Name */}
              <FormField
                control={form.control}
                name="brandName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="your-brand-name"
                          className="bg-white/50 pr-10"
                          onChange={(e) => {
                            field.onChange(e);
                            handleBrandNameChange(e.target.value);
                          }}
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          {getBrandNameIcon()}
                        </div>
                      </div>
                    </FormControl>
                    {statusMessage && (
                      <p className={`text-xs ${statusMessage.color} flex items-center gap-1`}>
                        {statusMessage.message}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Your unique brand identifier for custom URLs
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onCancel}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading || (brandName && brandNameStatus === 'taken')}
                  className="min-w-[100px]"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditContactInfo;