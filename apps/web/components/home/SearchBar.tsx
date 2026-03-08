"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type BudgetOption = {
  label: string;
  min_price?: string;
  max_price?: string;
};

const BUDGET_OPTIONS: BudgetOption[] = [
  { label: "Chọn mức giá" },
  { label: "Dưới 5 triệu", max_price: "5000000" },
  { label: "Từ 5 - 10 triệu", min_price: "5000000", max_price: "10000000" },
  { label: "Từ 10 - 20 triệu", min_price: "10000000", max_price: "20000000" },
  { label: "Trên 20 triệu", min_price: "20000000" },
];

function getTodayString() {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = `${today.getMonth() + 1}`.padStart(2, "0");
  const dd = `${today.getDate()}`.padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export default function SearchBar() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [destination, setDestination] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [budgetIndex, setBudgetIndex] = useState(0);

  const budget = BUDGET_OPTIONS[budgetIndex];
  const today = getTodayString();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const params = new URLSearchParams();

    if (search.trim()) params.set("search", search.trim());
    if (destination.trim()) params.set("destination", destination.trim());
    if (dateFrom) params.set("date_from", dateFrom);
    if (budget.min_price) params.set("min_price", budget.min_price);
    if (budget.max_price) params.set("max_price", budget.max_price);

    router.push(`/tours${params.toString() ? `?${params.toString()}` : ""}`);
  };

  return (
    <section className="relative z-30 -mt-4 px-4 pb-12 sm:px-6 lg:-mt-6 lg:px-10 xl:px-16">
      <div className="mx-auto max-w-7xl">
        <form
          onSubmit={handleSubmit}
          className="rounded-[28px] border border-gray-200 bg-white shadow-[0_18px_60px_rgba(15,23,42,0.12)]"
        >
          <div className="grid grid-cols-1 gap-4 p-5 md:grid-cols-12 md:items-center md:gap-0 md:px-8 md:py-7">
            <div className="md:col-span-4 md:pr-6">
              <label
                htmlFor="tour-search"
                className="text-[15px] font-semibold text-[#1f1f1f]"
              >
                Bạn muốn đi đâu? <span className="text-red-500">*</span>
              </label>

              <input
                id="tour-search"
                name="search"
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Tên tour, mã tour, nơi khởi hành..."
                className="mt-3 w-full border-0 bg-transparent px-0 py-0 text-[16px] text-[#1f1f1f] outline-none placeholder:text-[#9a9a9a] focus:ring-0 md:text-[17px]"
              />
            </div>

            <div className="md:col-span-2 md:border-l md:border-gray-200 md:px-6">
              <label
                htmlFor="tour-destination"
                className="text-[15px] font-semibold text-[#1f1f1f]"
              >
                Điểm đến
              </label>

              <input
                id="tour-destination"
                name="destination"
                type="text"
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                placeholder="Ví dụ: Đà Lạt"
                className="mt-3 w-full border-0 bg-transparent px-0 py-0 text-[16px] text-[#1f1f1f] outline-none placeholder:text-[#9a9a9a] focus:ring-0 md:text-[17px]"
              />
            </div>

            <div className="md:col-span-2 md:border-l md:border-gray-200 md:px-6">
              <label
                htmlFor="tour-date-from"
                className="text-[15px] font-semibold text-[#1f1f1f]"
              >
                Ngày đi
              </label>

              <input
                id="tour-date-from"
                name="date_from"
                type="date"
                min={today}
                value={dateFrom}
                onChange={(event) => setDateFrom(event.target.value)}
                className="mt-3 w-full rounded-xl border border-gray-200 px-3 py-2.5 text-[15px] font-medium text-[#1f1f1f] outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-100 md:border-0 md:px-0 md:py-0 md:text-[17px] md:[color-scheme:light] md:focus:ring-0"
              />
            </div>

            <div className="md:col-span-3 md:border-l md:border-gray-200 md:px-6">
              <label
                htmlFor="tour-budget"
                className="text-[15px] font-semibold text-[#1f1f1f]"
              >
                Ngân sách
              </label>

              <select
                id="tour-budget"
                name="budget"
                value={budgetIndex}
                onChange={(event) => setBudgetIndex(Number(event.target.value))}
                className="mt-3 w-full border-0 bg-transparent px-0 py-0 text-[16px] font-semibold text-[#1f1f1f] outline-none focus:ring-0 md:text-[17px]"
              >
                {BUDGET_OPTIONS.map((item, index) => (
                  <option key={`${item.label}-${index}`} value={index}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-1 md:flex md:justify-end md:pl-4">
              <button
                type="submit"
                className="flex h-14 w-full items-center justify-center rounded-2xl bg-[#169ce3] text-white transition hover:bg-[#0f8fd2] md:h-[84px] md:w-[84px]"
                aria-label="Tìm tour"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 md:h-6 md:w-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
