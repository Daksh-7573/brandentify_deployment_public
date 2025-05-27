import React, { useState } from "react";
import { Loader2, DollarSign, Package, Clock, CheckCircle } from "lucide-react";
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
      category: "other",
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
    <div className="space-y-6 p-6 bg-transparent">
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Service Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white flex items-center gap-2">
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
            className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 px-3 py-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
          />
          {errors.title && (
            <p className="text-red-400 text-sm">{errors.title}</p>
          )}
          <p className="text-gray-400 text-xs">Enter a single professional service you offer.</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-white flex items-center gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14,2 14,8 20,8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10,9 9,9 8,9"></polyline>
            </svg>
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your service..."
            rows={3}
            className="!bg-[rgba(18,18,18,0.95)] !backdrop-blur-md !text-white !border-white/20 shadow-md transition-all hover:!border-white/30 w-full min-h-[80px] px-3 py-3 rounded-md border !placeholder-white/50 focus:!border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none resize-none"
            style={{ 
              backgroundColor: 'rgba(18,18,18,0.95) !important', 
              color: 'white !important',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(255,255,255,0.2) !important'
            }}
          />
          <p className="text-gray-400 text-xs">Enter a brief description of your service.</p>
        </div>

        {/* Pricing Section */}
        <div className="space-y-4 border border-white/20 bg-[rgba(18,18,18,0.95)] backdrop-blur-md rounded-lg p-5 shadow-md transition-all hover:border-white/30">
          <h3 className="text-white text-base font-medium flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Pricing Details
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            {/* Currency Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Currency</label>
              <div className="relative">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
                >
                  <option value="USD" className="bg-gray-800 text-white">USD (US Dollar)</option>
                  <option value="INR" className="bg-gray-800 text-white">INR (Indian Rupee)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Price Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-white">Rate Amount</label>
              <input
                type="text"
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
                placeholder="Enter service price (e.g. 24.99)"
                className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 px-3 rounded-md border placeholder-white/50 focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none"
              />
              {errors.price && (
                <p className="text-red-400 text-sm">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Hourly Rate Toggle */}
          <div className="flex items-center justify-between rounded-lg border border-white/20 bg-[rgba(18,18,18,0.95)] backdrop-blur-md p-4 transition-all hover:border-white/30 shadow-md">
            <div className="space-y-0.5">
              <div className="text-white text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Hourly Rate
              </div>
              <p className="text-gray-300 text-xs">
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

        {/* Active Status Toggle */}
        <div className="flex items-center justify-between rounded-lg border border-white/20 bg-[rgba(18,18,18,0.95)] backdrop-blur-md p-4 transition-all hover:border-white/30 shadow-md">
          <div className="space-y-0.5">
            <div className="text-white text-base flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active Status
            </div>
            <p className="text-gray-300 text-xs">
              Is this service currently available?
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsActive(!isActive)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white/30 ${
              isActive 
                ? 'bg-blue-600 border-blue-500/50' 
                : 'bg-black/50 border-white/20'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md bg-white/10 text-white border border-white/20 backdrop-blur-md shadow-md transition-all hover:bg-white/20 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{serviceData ? "Updating..." : "Creating..."}</span>
            </>
          ) : (
            <span>{serviceData ? "Update Service" : "Add Service"}</span>
          )}
        </button>
      </form>
    </div>
  );
}