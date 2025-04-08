import { useLocation } from "wouter";

type SidebarProps = {
  activePage: string;
};

export default function Sidebar({ activePage }: SidebarProps) {
  const [_, setLocation] = useLocation();

  const menuItems = [
    { id: "dashboard", icon: "fas fa-home", label: "Dashboard", path: "/dashboard" },
    { id: "profile", icon: "fas fa-user", label: "Profile", path: "/profile" },
    { id: "smart-connect", icon: "fas fa-users", label: "Smart Connect", path: "/smart-connect" },
    { id: "search", icon: "fas fa-search", label: "Search", path: "/search" },
    { id: "ai-career", icon: "fas fa-robot", label: "AI Career Booster", path: "/ai-career" },
    { id: "create-pulse", icon: "fas fa-bolt", label: "Create Pulse", path: "/create-pulse" },
    { id: "industry-pulse", icon: "fas fa-newspaper", label: "Industry Pulse", path: "/industry-pulse" },
    { id: "portfolio-builder", icon: "fas fa-briefcase", label: "Portfolio Builder", path: "/portfolio-builder" },
    { id: "services", icon: "fas fa-concierge-bell", label: "Services", path: "/services" },
    { id: "settings", icon: "fas fa-cog", label: "Settings", path: "/dashboard" },
  ];

  return (
    <div className="bg-white w-64 border-r border-gray-200 flex flex-col h-full">
      <div className="flex items-center flex-shrink-0 px-4 pt-4 pb-2">
        <span className="text-lg font-semibold text-gray-900">Dashboard</span>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1 py-2">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                activePage === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
              }`}
              onClick={() => setLocation(item.path)}
            >
              <i className={`${item.icon} mr-3 ${activePage === item.id ? "text-primary" : "text-gray-400 group-hover:text-gray-500"}`}></i>
              {item.label}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
