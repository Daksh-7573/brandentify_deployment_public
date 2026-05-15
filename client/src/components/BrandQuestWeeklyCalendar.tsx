import { useEffect, useMemo, useState } from 'react';
import { format, parseISO } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { useUserWeeklyCalendarQuests } from '@/hooks/use-career-quests';
import { QuestCard } from '@/components/brand-quests/quest-card';

interface BrandQuestWeeklyCalendarProps {
  userId?: number;
  className?: string;
}

export function BrandQuestWeeklyCalendar({ userId, className }: BrandQuestWeeklyCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [weeklyQuests, setWeeklyQuests] = useState<any[]>([]);

  const {
    data,
    isLoading,
  } = useUserWeeklyCalendarQuests(userId);

  const normalizeToISODate = (value: unknown): string | null => {
    if (!value) {
      return null;
    }

    const parsed = new Date(String(value));
    if (Number.isNaN(parsed.getTime())) {
      return null;
    }

    return parsed.toISOString().split('T')[0];
  };

  useEffect(() => {
    const days = Array.isArray(data?.days) ? data.days : [];
    setWeeklyQuests(days);
    console.log('Weekly quests:', data);
  }, [data]);

  const days = useMemo(() => {
    return weeklyQuests.map((day: any) => ({
      ...day,
      date: normalizeToISODate(day?.date) || day?.date,
      quests: Array.isArray(day?.quests)
        ? day.quests.map((quest: any) => {
            const scheduledDate = normalizeToISODate(quest?.scheduled_date ?? quest?.assignedDate ?? quest?.assigned_date);
            return {
              ...quest,
              scheduled_date: scheduledDate,
              assignedDate: scheduledDate || quest?.assignedDate,
            };
          })
        : [],
    }));
  }, [weeklyQuests]);

  const todayIso = format(new Date(), 'yyyy-MM-dd');
  const hasAnyWeekQuest = days.some((day: any) => day.quests?.length > 0);

  const selectedDay = useMemo(() => {
    if (!days.length) {
      return null;
    }

    if (!selectedDate) {
      return days.find((day: any) => day.quests?.length > 0) || null;
    }
    return days.find((day: any) => day.date === selectedDate) || null;
  }, [days, selectedDate]);

  const weekDisplayLabel = useMemo(() => {
    if (!data?.weekStartDate || !data?.weekEndDate) {
      return 'N/A';
    }
    try {
      const startDate = parseISO(data.weekStartDate);
      const endDate = parseISO(data.weekEndDate);
      const start = format(startDate, 'MMM d');
      const end = format(endDate, 'MMM d');
      return `${start} - ${end}`;
    } catch {
      return 'N/A';
    }
  }, [data?.weekStartDate, data?.weekEndDate]);

  if (isLoading) {
    return (
      <div className={cn('space-y-3', className)}>
        <Skeleton className="h-24 w-full rounded-md bg-gray-800/60" />
        <Skeleton className="h-52 w-full rounded-md bg-gray-800/60" />
      </div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="rounded-md border border-white/10 bg-white/5 p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-semibold text-white">Weekly Quest Calendar</h3>
            <p className="text-xs text-white/70">
              Week {data?.weekNumber || 'N/A'} • {weekDisplayLabel}
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs text-white/70">
            <span>Completed: {data?.summary?.completed ?? 0}</span>
            <span>Pending: {data?.summary?.pending ?? 0}</span>
            <span>Missed: {data?.summary?.missed ?? 0}</span>
          </div>
        </div>

        {!days.length || !hasAnyWeekQuest ? (
          <div className="mt-3 rounded-md border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            No quests available for this week
          </div>
        ) : null}

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
          {days.map((day: any) => {
            const isSelected = selectedDay?.date === day.date;
            const isToday = day.date === todayIso;
            const showGreen = day.status === 'completed';
            const showRed = day.status === 'missed';

            return (
              <button
                key={day.date}
                type="button"
                onClick={() => setSelectedDate(day.date)}
                className={cn(
                  'rounded-xl border p-2 text-left shadow-sm transition-all',
                  isSelected
                    ? 'border-white/40 bg-white/10'
                    : isToday
                      ? 'border-cyan-300/40 bg-cyan-500/10'
                      : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-white/5 hover:shadow-md'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white">{day.dayName}</span>
                  {showGreen ? <span className="h-2 w-2 rounded-full bg-emerald-400" /> : null}
                  {showRed ? <span className="h-2 w-2 rounded-full bg-red-400" /> : null}
                </div>
                <div className="mt-1 text-xs text-white/70">{day.date}</div>
                {isToday ? <div className="mt-1 text-[10px] uppercase tracking-wide text-cyan-200">Today</div> : null}
                <div className="mt-1 text-xs text-white/60">{day.quests?.length || 0} quest(s)</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="text-xs text-white/70">
          {selectedDay ? `${selectedDay.dayName} (${selectedDay.date})` : 'No quests scheduled this week'}
        </div>

        {selectedDay?.quests?.length ? (
          <div className="space-y-3">
            {selectedDay.quests.map((quest: any) => (
              <div key={quest.id} className="rounded-xl border border-white/10 bg-black/20 p-3 shadow-sm">
                <div className="mb-2 flex items-center justify-between text-xs text-white/70">
                  <div className="flex items-center gap-2">
                    {quest.calendarStatus === 'completed' ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" title="Completed" />
                    ) : quest.calendarStatus === 'missed' ? (
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" title="Missed" />
                    ) : (
                      <span className="h-2.5 w-2.5 rounded-full border border-white/20" title="In progress" />
                    )}
                    <span>
                      {quest.calendarStatus === 'completed'
                        ? 'Completed'
                        : quest.calendarStatus === 'missed'
                          ? 'Missed'
                          : 'In progress'}
                    </span>
                  </div>
                  <span>{quest.definition?.xpReward ?? quest.xpEarned ?? 0} XP</span>
                </div>
                <QuestCard quest={quest} />
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-white/10 bg-black/20 p-4 text-sm text-white/70">
            No quests scheduled for this day.
          </div>
        )}
      </div>
    </div>
  );
}
