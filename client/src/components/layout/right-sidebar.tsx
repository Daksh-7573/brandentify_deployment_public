import { useAuth } from "@/hooks/use-auth";
import { Card } from "@/components/ui/card";
import SkillBar from "@/components/common/skill-bar";

export default function RightSidebar() {
  const { user } = useAuth();

  return (
    <div className="bg-white w-80 border-l border-gray-200 p-5 overflow-y-auto">
      <div className="mb-6">
        <div className="flex items-center">
          <img 
            className="h-12 w-12 rounded-full" 
            src={user?.photoURL || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"} 
            alt="User profile" 
          />
          <div className="ml-3">
            <h2 className="text-base font-medium text-gray-900">{user?.name || 'User'}</h2>
            <p className="text-sm text-gray-500">Data Analyst</p>
          </div>
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Resume Score</h3>
        <div className="flex items-center">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: '72%' }}></div>
          </div>
          <span className="ml-3 text-sm font-medium text-gray-900">72/100</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">Your resume outperforms 65% of professionals in your field.</p>
      </div>
      
      <div className="border-t border-gray-200 pt-4 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Skill Development</h3>
        <div className="space-y-3">
          <SkillBar name="Data Analysis" level="Advanced" percentage={85} color="green" />
          <SkillBar name="SQL" level="Intermediate" percentage={60} color="yellow" />
          <SkillBar name="Data Visualization" level="Beginner" percentage={30} color="red" />
        </div>
      </div>
      
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-sm font-medium text-gray-900 mb-3">Notifications</h3>
        <div className="space-y-3">
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-bell text-primary"></i>
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-900">Your profile was viewed by 3 recruiters this week</p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="flex">
            <div className="flex-shrink-0">
              <i className="fas fa-briefcase text-primary"></i>
            </div>
            <div className="ml-3">
              <p className="text-xs text-gray-900">5 new jobs match your profile</p>
              <p className="text-xs text-gray-500 mt-1">Yesterday</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
