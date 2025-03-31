type ProfileCompletionProps = {
  percentage: number;
};

export default function ProfileCompletion({ percentage }: ProfileCompletionProps) {
  return (
    <div className="w-full bg-gray-200 rounded-full h-2.5">
      <div 
        className="bg-primary h-2.5 rounded-full" 
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
}
