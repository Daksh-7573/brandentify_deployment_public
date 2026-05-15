import { BrandQuestWeeklyCalendar } from './BrandQuestWeeklyCalendar';

interface WeeklyQuestCalendarProps {
  userId?: number;
  className?: string;
}

// Compatibility wrapper that keeps the existing implementation and styling.
export function WeeklyQuestCalendar({ userId, className }: WeeklyQuestCalendarProps) {
  return <BrandQuestWeeklyCalendar userId={userId} className={className} />;
}
