import { useLocation } from "wouter";
import { Zap, Search, Sparkles, Briefcase, User, Settings, BookOpen, BarChart } from "lucide-react";

type SidebarProps = {
  activePage: string;
};

export default function Sidebar({ activePage }: SidebarProps) {
  const [_, setLocation] = useLocation();

  const menuItems = [
    { id: "industry-pulse", icon: <Zap size={18} />, label: "Industry Pulse", path: "/industry-pulse" },
    { id: "search", icon: <Search size={18} />, label: "Discover & Connect", path: "/search" },
    { id: "ai-career", icon: <Sparkles size={18} />, label: "AI Career Booster", path: "/ai-career" },
    { id: "services", icon: <Briefcase size={18} />, label: "Services", path: "/services" },
  ];

  const bottomItems = [
    { id: "profile", icon: <User size={18} />, label: "Profile", path: "/profile" },
    { id: "settings", icon: <Settings size={18} />, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="neo-sidebar w-64 flex flex-col h-full z-20">
      <div className="flex items-center justify-center flex-shrink-0 px-4 pt-6 pb-4">
        <span className="text-xl font-semibold text-primary neo-text-glow">Brandentifier</span>
      </div>
      
      <div className="mt-2 px-3">
        <div className="py-2 px-3 bg-primary/10 backdrop-blur-md rounded-lg border border-white/5">
          <div className="flex items-center gap-3 mb-1">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <BarChart size={16} className="text-primary" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Daily Progress</p>
              <p className="text-sm font-medium text-white">65% Complete</p>
            </div>
          </div>
          <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-primary to-primary/70 w-[65%] rounded-full"></div>
          </div>
        </div>
      </div>
      
      <div className="flex-1 flex flex-col overflow-y-auto pt-4">
        <nav className="flex-1 px-3 space-y-1 py-2">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center px-4 py-3 text-sm font-medium rounded-lg cursor-pointer transition-colors ${
                activePage === item.id
                  ? "bg-primary/20 text-white backdrop-blur-sm border border-primary/30"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
              onClick={() => setLocation(item.path)}
            >
              <span className={`mr-3 ${
                activePage === item.id 
                  ? "text-primary neo-text-glow" 
                  : "text-gray-400 group-hover:text-gray-300"
              }`}>
                {item.icon}
              </span>
              <span className={activePage === item.id ? "neo-text-glow" : ""}>
                {item.label}
              </span>
              
              {activePage === item.id && (
                <div className="w-1.5 h-8 bg-primary rounded-full absolute -right-1"></div>
              )}
            </div>
          ))}
        </nav>
      </div>
      
      <div className="px-3 pb-6 pt-2">
        <div className="border-t border-white/5 pt-4 mb-4"></div>
        {bottomItems.map((item) => (
          <div
            key={item.id}
            className="group flex items-center px-4 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors
              text-gray-400 hover:bg-white/5 hover:text-white mb-1"
            onClick={() => setLocation(item.path)}
          >
            <span className="mr-3 text-gray-500 group-hover:text-gray-300">
              {item.icon}
            </span>
            {item.label}
          </div>
        ))}
      </div>
    </div>
  );
}
