type SkillBarProps = {
  name: string;
  level: string;
  percentage: number;
  color: string; // "green", "yellow", or "red"
};

export default function SkillBar({ name, level, percentage, color }: SkillBarProps) {
  // Map color to tailwind classes
  const colorClasses = {
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    red: "bg-red-500"
  };

  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium text-gray-700">{name}</span>
        <span className="text-gray-500">{level}</span>
      </div>
      <div className="bg-gray-200 rounded-full h-1.5">
        <div 
          className={`${colorClasses[color]} h-1.5 rounded-full`} 
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}
