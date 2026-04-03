"use client";

import { useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import type { TourPolicy } from "@/types/tour";
import { TOUR_POLICY_DEFINITIONS } from "@/lib/tourPolicyDefinitions";

type Props = {
  policies?: TourPolicy[];
};

export default function TourPolicyAccordion({ policies = [] }: Props) {
  const policyGroups = useMemo(() => {
    return TOUR_POLICY_DEFINITIONS.map((definition) => {
      const matched = policies.find((policy) => policy.policy_type === definition.key);
      if (!matched?.content?.trim()) {
        return null;
      }

      return {
        id: definition.key,
        title: definition.title,
        content: matched.content
          .split(/\r?\n/)
          .map((item) => item.trim())
          .filter(Boolean),
      };
    }).filter(Boolean) as Array<{
      id: string;
      title: string;
      content: string[];
    }>;
  }, [policies]);

  const [openItem, setOpenItem] = useState<string>("");

  if (!policyGroups.length) {
    return null;
  }

  const renderPolicyItem = (policy: (typeof policyGroups)[number]) => {
    const isOpen = openItem === policy.id;

    return (
      <div
        key={policy.id}
        className="overflow-hidden rounded-[22px] border border-slate-200"
      >
        <button
          type="button"
          onClick={() => setOpenItem((current) => (current === policy.id ? "" : policy.id))}
          className={`flex w-full items-center justify-between px-6 py-5 text-left text-base font-bold text-slate-900 transition ${
            isOpen ? "bg-blue-100" : "bg-[#faf9f7]"
          }`}
        >
          <span>{policy.title}</span>
          <ChevronDown
            className={`h-5 w-5 flex-shrink-0 text-slate-500 transition ${
              isOpen ? "rotate-180" : ""
            }`}
          />
        </button>

        {isOpen ? (
          <div className="border-t border-slate-200 bg-white px-6 py-5">
            <ul className="list-disc space-y-2 pl-5 text-base leading-8 text-slate-700">
              {policy.content.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  };

  const leftColumn = policyGroups.filter((_, index) => index % 2 === 0);
  const rightColumn = policyGroups.filter((_, index) => index % 2 === 1);

  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 className="mb-10 text-center text-2xl font-extrabold uppercase text-slate-900">
          Những thông tin cần lưu ý
        </h2>

        <div className="space-y-3 md:hidden">
          {policyGroups.map(renderPolicyItem)}
        </div>

        <div className="hidden gap-6 md:grid md:grid-cols-2 md:items-start">
          <div className="space-y-3">{leftColumn.map(renderPolicyItem)}</div>
          <div className="space-y-3">{rightColumn.map(renderPolicyItem)}</div>
        </div>
      </div>
    </section>
  );
}
