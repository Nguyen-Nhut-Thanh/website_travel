"use client";

import { useRef } from "react";
import { ChevronDown, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchBar, BUDGET_OPTIONS, MONTH_LABELS, WEEKDAY_HEADERS, isSameDate, formatDisplayDate } from "./useSearchBar";

export default function SearchBar() {
  const budgetDropdownRef = useRef<HTMLDivElement | null>(null);
  const calendarDropdownRef = useRef<HTMLDivElement | null>(null);

  const { state, actions } = useSearchBar({ budgetDropdownRef, calendarDropdownRef });
  const visibleBudgetOptions = BUDGET_OPTIONS.filter((_, index) => index !== 0);

  return (
    <section className="relative z-30 -mt-4 sm:px-2 lg:-mt-6 lg:px-2 xl:px-2">
      <div className="mx-auto max-w-7xl">
        <form
          onSubmit={actions.handleSubmit}
          className="rounded-[28px] border border-gray-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)]"
        >
          <div className="grid grid-cols-1 gap-4 p-3 md:grid-cols-12 md:items-center md:gap-0 md:px-8 md:py-4">
            {/* Search Input */}
            <div className="md:col-span-5 md:pr-6">
              <label htmlFor="tour-search" className="text-[15px] font-semibold text-[#1f1f1f]">
                Bạn muốn đi đâu? <span className="text-red-500">*</span>
              </label>
              <input
                id="tour-search"
                type="text"
                value={state.search}
                onChange={(e) => actions.setSearch(e.target.value)}
                placeholder="Tên tour, điểm đến, mã tour..."
                className="mt-3 w-full border-0 bg-transparent px-0 py-0 text-[16px] text-[#1f1f1f] outline-none placeholder:text-[#9a9a9a] focus:ring-0 md:text-[17px]"
              />
            </div>

            {/* Date Picker */}
            <div ref={calendarDropdownRef} className="relative md:col-span-3 md:border-l md:border-gray-200 md:px-6">
              <label htmlFor="tour-date-from-trigger" className="text-[15px] font-semibold text-[#1f1f1f]">Ngày đi</label>
              <button
                id="tour-date-from-trigger"
                type="button"
                onClick={actions.handleOpenCalendar}
                className="mt-3 flex w-full items-center justify-between gap-3 border-0 bg-transparent px-0 py-0 text-left text-[16px] text-[#1f1f1f] outline-none focus:ring-0 md:text-[17px]"
              >
                <span>{formatDisplayDate(state.selectedDate)}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${state.isCalendarOpen ? "rotate-180" : ""}`} />
              </button>

              <div className={`absolute left-0 top-[calc(100%+14px)] z-50 w-[280px] rounded-2xl border border-gray-200 bg-white p-4 shadow-xl transition-all sm:w-[310px] ${state.isCalendarOpen ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"}`}>
                <div className="mb-4 flex items-center justify-between">
                  <button type="button" onClick={actions.goToPreviousMonth} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <div className="text-[15px] font-bold">{MONTH_LABELS[state.calendarMonth.getMonth()]} - {state.calendarMonth.getFullYear()}</div>
                  <button type="button" onClick={actions.goToNextMonth} className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                <div className="mb-3 grid grid-cols-7 text-center text-xs font-medium text-gray-500">
                  {WEEKDAY_HEADERS.map(day => <div key={day} className={day === "CN" ? "text-red-500" : ""}>{day}</div>)}
                </div>
                <div className="grid grid-cols-7 gap-y-2 text-center">
                  {state.calendarDays.map(day => (
                    <button
                      key={day.key}
                      type="button"
                      disabled={!day.date || day.date < state.todayDate}
                      onClick={() => day.date && actions.handleSelectDate(day.date)}
                      className={`mx-auto flex h-9 w-9 items-center justify-center rounded-md text-sm font-semibold transition ${
                        day.date && isSameDate(day.date, state.selectedDate) ? "bg-[#1769c2] text-white" : !day.date || day.date < state.todayDate ? "text-gray-200 cursor-not-allowed" : "hover:bg-sky-50"
                      }`}
                    >
                      {day.dayNumber}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Budget Dropdown */}
            <div ref={budgetDropdownRef} className="relative md:col-span-3 md:border-l md:border-gray-200 md:px-6">
              <label htmlFor="tour-budget-trigger" className="text-[15px] font-semibold text-[#1f1f1f]">Ngân sách</label>
              <button
                id="tour-budget-trigger"
                type="button"
                onClick={() => actions.setIsBudgetOpen(!state.isBudgetOpen)}
                className="mt-3 flex w-full items-center justify-between gap-3 border-0 bg-transparent px-0 py-0 text-left text-[16px] font-semibold focus:ring-0 md:text-[17px]"
              >
                <span>{state.budget.label}</span>
                <ChevronDown className={`h-5 w-5 shrink-0 transition-transform ${state.isBudgetOpen ? "rotate-180" : ""}`} />
              </button>
              <div className={`absolute left-0 top-[calc(100%+14px)] z-50 w-full rounded-2xl border bg-[#f7f7f7] p-4 shadow-xl transition-all md:min-w-[270px] ${state.isBudgetOpen ? "opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"}`}>
                <div className="space-y-3">
                  {visibleBudgetOptions.map(item => (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => actions.handleBudgetSelect(item.label)}
                      className={`w-full rounded-md border px-3 py-3 text-left transition-all ${state.budget.label === item.label ? "border-sky-500 bg-sky-50 text-sky-700" : "bg-white hover:bg-sky-50"}`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="md:col-span-1 md:flex md:justify-end md:pl-4">
              <button 
                type="submit" 
                disabled={!state.isFormValid}
                className={`flex h-14 w-full items-center justify-center rounded-2xl transition md:h-[84px] md:w-[84px] ${
                  state.isFormValid 
                    ? "bg-sky-500 text-white hover:bg-sky-600 shadow-lg shadow-sky-100" 
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <Search className="h-6 w-6" />
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
