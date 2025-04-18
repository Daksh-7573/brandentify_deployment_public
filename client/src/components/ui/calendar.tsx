import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

// Custom caption component with year selector
function CustomCaption(props: any) { 
  const { displayMonth, goToMonth } = props;
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ]
  
  // Default year range
  const fromYear = 1950
  const toYear = 2035
  
  // Generate years
  const years = []
  for (let year = fromYear; year <= toYear; year++) {
    years.push(year)
  }
  
  const handleYearChange = (year: string) => {
    const newMonth = new Date(displayMonth)
    newMonth.setFullYear(parseInt(year))
    goToMonth(newMonth)
  }
  
  const handleMonthChange = (month: string) => {
    const newMonth = new Date(displayMonth)
    newMonth.setMonth(months.indexOf(month))
    goToMonth(newMonth)
  }
  
  const handlePrevYear = () => {
    const newMonth = new Date(displayMonth)
    newMonth.setFullYear(displayMonth.getFullYear() - 1)
    goToMonth(newMonth)
  }
  
  const handleNextYear = () => {
    const newMonth = new Date(displayMonth)
    newMonth.setFullYear(displayMonth.getFullYear() + 1)
    goToMonth(newMonth)
  }
  
  return (
    <div className="flex justify-center items-center gap-1">
      <div className="flex items-center">
        <button
          onClick={handlePrevYear}
          aria-label="Previous Year"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronsLeft className="h-4 w-4" />
        </button>
      </div>
      
      <Select
        value={displayMonth.getFullYear().toString()}
        onValueChange={handleYearChange}
      >
        <SelectTrigger className="h-7 w-[4.5rem] border-0 bg-transparent px-2 text-center font-medium">
          <SelectValue placeholder={displayMonth.getFullYear().toString()} />
        </SelectTrigger>
        <SelectContent className="max-h-[250px]">
          {years.map((year) => (
            <SelectItem key={year} value={year.toString()}>
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Select
        value={months[displayMonth.getMonth()]}
        onValueChange={handleMonthChange}
      >
        <SelectTrigger className="h-7 w-[6.5rem] border-0 bg-transparent px-2 text-center font-medium">
          <SelectValue placeholder={months[displayMonth.getMonth()]} />
        </SelectTrigger>
        <SelectContent>
          {months.map((month) => (
            <SelectItem key={month} value={month}>
              {month}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <div className="flex items-center">
        <button
          onClick={handleNextYear}
          aria-label="Next Year"
          className={cn(
            buttonVariants({ variant: "outline" }),
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          )}
        >
          <ChevronsRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        caption: "flex justify-center pt-1 relative items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        nav_button: cn(
          buttonVariants({ variant: "outline" }),
          "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
        ),
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "flex",
        head_cell:
          "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem]",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day: cn(
          buttonVariants({ variant: "ghost" }),
          "h-9 w-9 p-0 font-normal aria-selected:opacity-100"
        ),
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        IconLeft: () => <ChevronLeft className="h-4 w-4" />,
        IconRight: () => <ChevronRight className="h-4 w-4" />,
        Caption: CustomCaption as any
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }