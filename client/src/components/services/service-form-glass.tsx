import React, { useState } from "react";
import { Loader2, DollarSign, Package, Clock, CheckCircle, MessageSquareQuote } from "lucide-react";
import { Service } from "@shared/schema";

interface ServiceFormGlassProps {
  service?: Service;
  initialData?: Service | null;
  onSubmit: (data: any) => void;
  isPending: boolean;
  existingServicesCount?: number;
}

export default function ServiceFormGlass({ 
  service, 
  initialData, 
  onSubmit, 
  isPending, 
  existingServicesCount = 0 
}: ServiceFormGlassProps) {
  // Use initialData if provided, otherwise fall back to service
  const serviceData = initialData || service;
  const MAX_SERVICES = 6;
  const isEditing = !!serviceData;
  const canAddService = isEditing || existingServicesCount < MAX_SERVICES;

  // Form state
  const [title, setTitle] = useState(serviceData?.title || "");
  const [description, setDescription] = useState(serviceData?.description || "");
  const [currency, setCurrency] = useState(serviceData ? (serviceData.priceUsd ? "USD" : "INR") : "USD");
  const [price, setPrice] = useState(
    serviceData 
      ? (serviceData.priceUsd ? serviceData.priceUsd.toString() : 
         serviceData.priceInr ? serviceData.priceInr.toString() : "")
      : ""
  );
  const [isHourly, setIsHourly] = useState(serviceData?.isHourly || false);
  const [isActive, setIsActive] = useState(serviceData?.isActive !== false);

  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = "Service title is required";
    }

    if (price && isNaN(parseFloat(price))) {
      newErrors.price = "Please enter a valid price";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle price input
  const handlePriceChange = (value: string) => {
    // Allow numbers and a single decimal point
    if (value === '' || /^[0-9]*\.?[0-9]*$/.test(value)) {
      setPrice(value);
      // Clear price error when user starts typing
      if (errors.price) {
        setErrors(prev => ({ ...prev, price: "" }));
      }
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    // Prepare price data
    let priceValue: number | null = null;
    if (price && price.trim() !== '') {
      const parsed = parseFloat(price);
      priceValue = isNaN(parsed) ? null : Math.round(parsed * 100) / 100;
    }

    const priceData = {
      priceInr: currency === 'INR' && priceValue !== null ? priceValue : null,
      priceUsd: currency === 'USD' && priceValue !== null ? priceValue : null,
    };

    // Transform form data
    const transformedData = {
      features: [],
      title: title.trim(),
      description: description.trim() || undefined,
      isHourly,
      isActive,
      ...priceData,
      ...(serviceData ? { id: serviceData.id, userId: serviceData.userId } : {})
    };

    // Add userId if not editing
    if (!transformedData.userId) {
      const firebaseUid = localStorage.getItem('firebaseUid');
      const numericUserId = localStorage.getItem('numericUserId');
      
      if (numericUserId) {
        transformedData.userId = parseInt(numericUserId, 10);
      } else if (firebaseUid) {
        transformedData.userId = firebaseUid as unknown as number;
      }
    }

    console.log("Glass Service form - submitting:", transformedData);
    onSubmit(transformedData);
  };

  // Maximum services reached message
  if (!canAddService && !isEditing) {
    return (
      <div className="p-6 text-center border border-amber-500/30 rounded-lg bg-amber-500/10 backdrop-blur-sm">
        <Package className="mx-auto h-8 w-8 text-amber-400 mb-3" />
        <p className="text-amber-400 font-medium mb-2">Maximum of 6 services reached</p>
        <p className="text-gray-300 text-sm">
          Please delete an existing service before adding a new one.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Service Title */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm flex items-center gap-2">
            <Package className="h-4 w-4" />
            Service Title*
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors(prev => ({ ...prev, title: "" }));
              }
            }}
            placeholder="Enter your service title..."
            className="neo-glass-input"
          />
          {errors.title && (
            <p className="text-red-400 text-sm">{errors.title}</p>
          )}
        </div>

        {/* Service Description */}
        <div className="space-y-2">
          <label className="text-white font-medium text-sm flex items-center gap-2">
            <MessageSquareQuote className="h-4 w-4" />
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) {
                setErrors(prev => ({ ...prev, description: "" }));
              }
            }}
            placeholder="Describe your service..."
            rows={4}
            className="neo-glass-input resize-none"
          />
          {errors.description && (
            <p className="text-red-400 text-sm">{errors.description}</p>
          )}
        </div>

        {/* Pricing Section */}
        <div className="space-y-4 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10">
          <h3 className="text-white font-medium text-sm flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing Details
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Currency Selection */}
            <div className="space-y-2">
              <label className="text-white/80 text-sm">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
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
                <option value="USD" style={{backgroundColor: '#1a1a1a', color: 'white'}}>USD (US Dollar)</option>
                <option value="INR" style={{backgroundColor: '#1a1a1a', color: 'white'}}>INR (Indian Rupee)</option>
              </select>
            </div>

            {/* Price Amount */}
            <div className="space-y-2">
              <label className="text-white/80 text-sm">Rate Amount</label>
              <input
                type="text"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="Enter service price..."
                className="neo-glass-input"
              />
              {errors.price && (
                <p className="text-red-400 text-sm">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Hourly Rate Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 backdrop-blur-sm p-4 transition-all hover:border-white/30">
            <div className="space-y-0.5">
              <div className="text-white text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hourly Rate
              </div>
              <p className="text-white/60 text-xs">
                Toggle on if you charge per hour, off for fixed rate
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsHourly(!isHourly)}
              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/30 ${
                isHourly 
                  ? 'bg-blue-600 border-blue-500/50' 
                  : 'bg-black/50 border-white/20'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                  isHourly ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>



        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full neo-glass-button text-white font-medium py-3 px-4 rounded-md shadow-lg transition-all hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              <span>{serviceData ? "Updating..." : "Adding..."}</span>
            </>
          ) : (
            <span>{serviceData ? "Update Service" : "Add Service"}</span>
          )}
        </button>
      </form>
    </div>
  );
}