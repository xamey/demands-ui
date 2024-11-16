import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import type { DayOff } from "@/lib/types";
import { cn } from "@/lib/utils";
import { fr } from "date-fns/locale";

interface DayOffCalendarProps {
  dayOffs: DayOff[];
  onSelectDate: (date: Date) => void;
  className?: string;
}

export function DayOffCalendar({
  dayOffs,
  onSelectDate,
  className,
}: DayOffCalendarProps) {
  const [selectedDate, setSelectedDate] = useState<Date>();

  const getDayOffStatus = (date: Date) => {
    const dayOff = dayOffs.find(
      (d) =>
        d.date.toISOString().split("T")[0] === date.toISOString().split("T")[0]
    );
    return dayOff?.status;
  };

  return (
    <Calendar
      mode="single"
      locale={fr}
      selected={selectedDate}
      onSelect={(date) => {
        if (
          date &&
          window.confirm(
            `Voulez-vous demander un jour de TT le ${date.toLocaleDateString()}?`
          )
        ) {
          setSelectedDate(date);
          onSelectDate(date);
        }
      }}
      disabled={dayOffs.map((d) => d.date)}
      className={cn("rounded-md border", className)}
      modifiers={{
        approved: (date) => getDayOffStatus(date) === "approved",
        pending: (date) => getDayOffStatus(date) === "pending",
        refused: (date) => getDayOffStatus(date) === "refused",
      }}
      modifiersClassNames={{
        approved: "bg-green-100 text-green-900",
        pending: "bg-yellow-100 text-yellow-900",
        refused: "bg-red-100 text-red-900",
      }}
    />
  );
}
