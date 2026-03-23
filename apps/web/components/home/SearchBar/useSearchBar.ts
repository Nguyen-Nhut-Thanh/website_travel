"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

export type BudgetOption = {
  label: string;
  min_price?: string;
  max_price?: string;
};

export const BUDGET_OPTIONS: BudgetOption[] = [
  { label: "Chọn mức giá" },
  { label: "Dưới 5 triệu", max_price: "5000000" },
  { label: "Từ 5 - 10 triệu", min_price: "5000000", max_price: "10000000" },
  { label: "Từ 10 - 20 triệu", min_price: "10000000", max_price: "20000000" },
  { label: "Trên 20 triệu", min_price: "20000000" },
];

export const WEEKDAY_LABELS = ["CN", "Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7"];
export const WEEKDAY_HEADERS = ["Th 2", "Th 3", "Th 4", "Th 5", "Th 6", "Th 7", "CN"];
export const MONTH_LABELS = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

export type CalendarDay = {
  key: string;
  date: Date | null;
  dayNumber: number | null;
  isCurrentMonth: boolean;
};

export function formatDateString(date: Date) {
  const yyyy = date.getFullYear();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function parseDateString(value: string) {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function getTodayDate() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
}

export function getTomorrowDate() {
  const tomorrow = getTodayDate();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

export function isSameDate(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function formatDisplayDate(date: Date) {
  const weekdayIndex = date.getDay();
  const weekdayText = WEEKDAY_LABELS[weekdayIndex];
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  return `${weekdayText}, ${day} tháng ${month}, ${year}`;
}

export function buildCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const firstDayWeekIndex = firstDayOfMonth.getDay();
  const mondayBasedOffset = (firstDayWeekIndex + 6) % 7;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: CalendarDay[] = [];

  for (let i = 0; i < mondayBasedOffset; i += 1) {
    cells.push({
      key: `empty-start-${i}`,
      date: null,
      dayNumber: null,
      isCurrentMonth: false,
    });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    cells.push({
      key: formatDateString(date),
      date,
      dayNumber: day,
      isCurrentMonth: true,
    });
  }

  while (cells.length % 7 !== 0) {
    const index = cells.length;
    cells.push({
      key: `empty-end-${index}`,
      date: null,
      dayNumber: null,
      isCurrentMonth: false,
    });
  }

  return cells;
}

interface UseSearchBarProps {
  budgetDropdownRef: React.RefObject<HTMLDivElement | null>;
  calendarDropdownRef: React.RefObject<HTMLDivElement | null>;
}

export function useSearchBar({ budgetDropdownRef, calendarDropdownRef }: UseSearchBarProps) {
  const router = useRouter();

  const todayDate = useMemo(() => getTodayDate(), []);
  const tomorrowDate = useMemo(() => getTomorrowDate(), []);
  const tomorrowString = useMemo(() => formatDateString(tomorrowDate), [tomorrowDate]);

  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState(tomorrowString);
  const [budgetIndex, setBudgetIndex] = useState(0);
  const [isBudgetOpen, setIsBudgetOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState<Date>(
    new Date(tomorrowDate.getFullYear(), tomorrowDate.getMonth(), 1),
  );

  const budget = BUDGET_OPTIONS[budgetIndex];
  const selectedDate = useMemo(() => parseDateString(dateFrom), [dateFrom]);
  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth]);

  const isFormValid = useMemo(() => {
    return (
      search.trim().length > 0 &&
      dateFrom.length > 0 &&
      budgetIndex > 0 // index 0 is "Chọn mức giá"
    );
  }, [search, dateFrom, budgetIndex]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (budgetDropdownRef.current && !budgetDropdownRef.current.contains(target)) setIsBudgetOpen(false);
      if (calendarDropdownRef.current && !calendarDropdownRef.current.contains(target)) setIsCalendarOpen(false);
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsBudgetOpen(false);
        setIsCalendarOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [budgetDropdownRef, calendarDropdownRef]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid) return;

    const params = new URLSearchParams();
    if (search.trim()) params.set("destination", search.trim()); // Changed from 'search' to 'destination'
    if (dateFrom) params.set("date_from", dateFrom);
    if (budget.min_price) params.set("min_price", budget.min_price);
    if (budget.max_price) params.set("max_price", budget.max_price);
    router.push(`/tours?${params.toString()}`);
  };

  const handleBudgetSelect = (selectedLabel: string) => {
    const nextIndex = BUDGET_OPTIONS.findIndex((item) => item.label === selectedLabel);
    if (nextIndex >= 0) setBudgetIndex(nextIndex);
    setIsBudgetOpen(false);
  };

  const handleSelectDate = (date: Date) => {
    if (date < todayDate) return;
    setDateFrom(formatDateString(date));
    setCalendarMonth(new Date(date.getFullYear(), date.getMonth(), 1));
    setIsCalendarOpen(false);
  };

  const handleOpenCalendar = () => {
    setCalendarMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1));
    setIsCalendarOpen((prev) => !prev);
  };

  const goToPreviousMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCalendarMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  return {
    state: { search, dateFrom, budgetIndex, isBudgetOpen, isCalendarOpen, calendarMonth, budget, selectedDate, calendarDays, todayDate, isFormValid },
    actions: { setSearch, handleOpenCalendar, goToPreviousMonth, goToNextMonth, handleSelectDate, handleBudgetSelect, setIsBudgetOpen, handleSubmit }
  };
}
