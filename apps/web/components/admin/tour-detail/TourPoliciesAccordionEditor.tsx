"use client";

import { useState } from "react";
import { ChevronDown, Info } from "lucide-react";
import {
  TOUR_POLICY_DEFINITIONS,
  type TourPolicyContentMap,
  type TourPolicyKey,
} from "@/lib/tourPolicyDefinitions";

type Props = {
  value: TourPolicyContentMap | undefined;
  onChange: (next: TourPolicyContentMap) => void;
};

export function TourPoliciesAccordionEditor({ value, onChange }: Props) {
  const policyContents = value || {};
  const [openKeys, setOpenKeys] = useState<TourPolicyKey[]>(["included"]);

  const toggleKey = (key: TourPolicyKey) => {
    setOpenKeys((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    );
  };

  return (
    <div className="space-y-2">
      {TOUR_POLICY_DEFINITIONS.map((policy) => {
        const isOpen = openKeys.includes(policy.key);
        const currentValue = policyContents[policy.key] || "";

        return (
          <div
            key={policy.key}
            className="overflow-hidden rounded-2xl border border-slate-200"
          >
            <button
              type="button"
              onClick={() => toggleKey(policy.key)}
              className={`flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition ${
                isOpen ? "bg-slate-50" : "bg-white hover:bg-slate-50"
              }`}
            >
              <div className="min-w-0">
                <h3 className="text-sm font-bold text-slate-900 md:text-[15px]">
                  {policy.title}
                </h3>
                {!isOpen && currentValue ? (
                  <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                    {currentValue}
                  </p>
                ) : null}
              </div>

              <ChevronDown
                className={`h-5 w-5 flex-shrink-0 text-slate-400 transition ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isOpen ? (
              <div className="border-t border-slate-100 bg-white px-4 py-4 md:px-5">
                <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  <Info size={14} className="text-blue-500" />
                  Nội dung hiển thị
                </div>
                <textarea
                  placeholder={policy.placeholder}
                  className="min-h-[132px] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
                  value={currentValue}
                  onChange={(event) =>
                    onChange({
                      ...policyContents,
                      [policy.key]: event.target.value,
                    })
                  }
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
