"use client";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

function getStartOfWeek(date: Date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(d.setDate(diff));
}

function getWeekDays(startDate: Date) {
  const days = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(startDate);
    day.setDate(startDate.getDate() + i);
    days.push(day);
  }
  return days;
}

type WeekNavigatorProps = {
  weekStart: Date;
  setWeekStart: React.Dispatch<React.SetStateAction<Date>>;
};

export default function WeekNavigator({ weekStart, setWeekStart }: WeekNavigatorProps) {
  const [pickerValue, setPickerValue] = useState(weekStart.toISOString().slice(0, 10));

  const handlePrev = () => {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    setWeekStart(prev);
    setPickerValue(prev.toISOString().slice(0, 10));
  };
  const handleNext = () => {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    setWeekStart(next);
    setPickerValue(next.toISOString().slice(0, 10));
  };
  const handlePicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = new Date(e.target.value);
    const start = getStartOfWeek(picked);
    setWeekStart(start);
    setPickerValue(start.toISOString().slice(0, 10));
  };

  const weekRange = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const label = useMemo(() => `${weekRange[0].toLocaleDateString()} - ${weekRange[6].toLocaleDateString()}`, [weekRange]);

  return (
    <div className="flex items-center gap-4 mb-4">
      <Button variant="outline" onClick={handlePrev}>
        Previous Week
      </Button>
      <div className="flex flex-col items-center">
        {/* <span className="font-semibold">{label}</span> */}
        <input
          type="date"
          value={pickerValue}
          onChange={handlePicker}
          className="border rounded p-1 mt-1"
        />
      </div>
      <Button variant="outline" onClick={handleNext}>
        Next Week
      </Button>
    </div>
  );
}
