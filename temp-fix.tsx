// Temporary fix for the duplicate fields issue
// Replace the problematic section with clean conditional rendering

{/* Only show general form fields for non-project pulses to avoid duplication */}
{pulseType !== 'project' && (
  <div className="space-y-6">
    <div className="space-y-2">
      <Label htmlFor="title" className="text-white">Title</Label>
      <Input 
        id="title" 
        placeholder="Enter a title for your pulse" 
        value={pulseTitle}
        onChange={(e) => setPulseTitle(e.target.value)}
        className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20"
      />
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="content" className="text-white">Content</Label>
      <Textarea 
        id="content" 
        placeholder="What's on your mind? Share your professional thoughts, insights, or ask a question." 
        rows={4}
        value={pulseContent}
        onChange={(e) => setPulseContent(e.target.value)}
        className="neo-glass-input bg-[rgba(18,18,18,0.95)] text-white border-white/20"
      />
    </div>
    
    {/* Industry Selection */}
    <div className="space-y-2">
      <Label htmlFor="industry" className="text-white flex items-center gap-2">
        <Briefcase className="h-4 w-4" />
        Industry
      </Label>
      <div className="relative">
        <select
          id="industry"
          value={pulseIndustry}
          onChange={(e) => {
            setPulseIndustry(e.target.value);
            if (e.target.value !== pulseIndustry) {
              setPulseCategory("");
            }
          }}
          className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm leading-relaxed"
        >
          <option value="">Select your industry</option>
          {INDUSTRIES.map((ind) => (
            <option key={ind} value={ind} className="bg-gray-800 text-white">
              {ind}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <svg className="h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
    </div>
    
    {/* Domain/Specialty */}
    {pulseIndustry && INDUSTRY_DOMAINS[pulseIndustry] && (
      <div className="space-y-2">
        <Label htmlFor="domain" className="text-white flex items-center gap-2">
          <Award className="h-4 w-4" />
          Domain Specialty
        </Label>
        <div className="relative">
          <select
            id="domain"
            value={pulseCategory}
            onChange={(e) => setPulseCategory(e.target.value)}
            className="bg-[rgba(18,18,18,0.95)] backdrop-blur-md text-white border-white/20 shadow-md transition-all hover:border-white/30 w-full h-12 px-3 pr-10 rounded-md border appearance-none cursor-pointer focus:border-white/50 focus:ring-2 focus:ring-white/30 focus:outline-none text-sm leading-relaxed"
          >
            <option value="">Select domain specialty</option>
            {INDUSTRY_DOMAINS[pulseIndustry].map((dom) => (
              <option key={dom} value={dom} className="bg-gray-800 text-white">
                {dom}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-4 w-4 text-white/70" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
    )}
  </div>
)}