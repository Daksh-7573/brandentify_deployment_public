import { useLocation } from "wouter";

type SidebarProps = {
  activePage: string;
};

export default function Sidebar({ activePage }: SidebarProps) {
  const [_, setLocation] = useLocation();

  const menuItems = [
    { id: "industry-pulse", icon: "fas fa-home", label: "Industry Pulse", path: "/industry-pulse" },
    { id: "search", icon: "fas fa-search", label: "Discover & Connect", path: "/search" },
    { id: "services", icon: "fas fa-concierge-bell", label: "Services", path: "/services" },
    { id: "career-capsule", icon: "fas fa-road", label: "Career Capsule", path: "/career-capsule" },
    { id: "career-quests", icon: "fas fa-tasks", label: "Career Quests", path: "/career-quests" },
  ];

  return (
    <div className="bg-[#1a1a2e] w-64 border-r border-white/10 flex flex-col h-full">
      <div className="flex items-center flex-shrink-0 px-4 pt-4 pb-2">
        <span className="text-lg font-semibold text-white">Brandentifier</span>
      </div>
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 space-y-1 py-2">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-md cursor-pointer transition-colors ${
                activePage === item.id
                  ? "bg-primary/10 text-primary"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
              onClick={() => setLocation(item.path)}
            >
              <i className={`${item.icon} mr-3 ${activePage === item.id ? "text-primary" : "text-white/50 group-hover:text-white/70"}`}></i>
              {item.label}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
