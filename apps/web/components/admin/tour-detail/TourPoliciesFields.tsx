"use client";

import { Info } from "lucide-react";
import { TOUR_POLICY_DEFINITIONS, type TourPolicyContentMap } from "@/lib/tourPolicyDefinitions";

type Props = {
  value: TourPolicyContentMap | undefined;
  onChange: (next: TourPolicyContentMap) => void;
};

export function TourPoliciesFields({ value, onChange }: Props) {
  const policyContents = value || {};

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
      {TOUR_POLICY_DEFINITIONS.map((policy) => (
        <div key={policy.key} className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-slate-900">
            <Info size={16} className="text-slate-500" /> {policy.title}
          </h3>
          <textarea
            placeholder={policy.placeholder}
            className="min-h-[120px] w-full rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:bg-white"
            value={policyContents[policy.key] || ""}
            onChange={(event) =>
              onChange({
                ...policyContents,
                [policy.key]: event.target.value,
              })
            }
          />
        </div>
      ))}
    </div>
  );
}
