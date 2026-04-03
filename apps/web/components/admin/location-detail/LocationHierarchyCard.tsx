"use client";

import { ChevronRight, Loader2, MapPin } from "lucide-react";
import type { AdminLocationItem } from "@/types/admin-location";
import { getLocationHierarchyPreview, type LocationDetailForm } from "@/lib/admin/locationDetail";

type Props = {
  form: LocationDetailForm;
  level3Id: string;
  level4Id: string;
  level5Id: string;
  level6Id: string;
  level3List: AdminLocationItem[];
  level4List: AdminLocationItem[];
  level5List: AdminLocationItem[];
  level6List: AdminLocationItem[];
  loadingL3: boolean;
  loadingL4: boolean;
  loadingL5: boolean;
  loadingL6: boolean;
  onLevel3Change: (value: string) => void;
  onLevel4Change: (value: string) => void;
  onLevel5Change: (value: string) => void;
  onLevel6Change: (value: string) => void;
};

function SelectField({
  label,
  value,
  options,
  disabled,
  loading,
  placeholder,
  onChange,
}: {
  label: string;
  value: string;
  options: AdminLocationItem[];
  disabled?: boolean;
  loading?: boolean;
  placeholder: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <label className="ml-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <div className="relative">
        <select
          disabled={disabled}
          className="w-full appearance-none rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-bold shadow-sm outline-none transition-all focus:border-blue-500 focus:bg-white disabled:opacity-40"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          <option value="">{placeholder}</option>
          {options.map((item) => (
            <option key={item.location_id} value={item.location_id}>
              {item.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2">
          {loading ? (
            <Loader2 size={16} className="animate-spin text-blue-500" />
          ) : (
            <ChevronRight size={16} className="rotate-90 text-slate-400" />
          )}
        </div>
      </div>
    </div>
  );
}

export function LocationHierarchyCard(props: Props) {
  const preview = getLocationHierarchyPreview(props);

  return (
    <div className="animate-in zoom-in-95 overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-sm fade-in duration-500">
      <div className="flex items-center gap-3 border-b border-slate-50 bg-slate-50/30 p-6">
        <div className="rounded-xl bg-emerald-100 p-2 text-emerald-600">
          <MapPin size={18} />
        </div>
        <h3 className="text-sm font-bold text-slate-900">Xác định chuỗi địa điểm cha</h3>
      </div>
      <div className="space-y-6 p-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <SelectField
            label="1. Quốc gia (Cấp 3)"
            value={props.level3Id}
            options={props.level3List}
            loading={props.loadingL3}
            placeholder="-- Chọn quốc gia --"
            onChange={props.onLevel3Change}
          />

          {props.form.level_id > 4 && (
            <div className="animate-in slide-in-from-left-2 fade-in">
              <SelectField
                label="2. Miền (Cấp 4)"
                value={props.level4Id}
                options={props.level4List}
                disabled={!props.level3Id}
                loading={props.loadingL4}
                placeholder="-- Chọn vùng / miền --"
                onChange={props.onLevel4Change}
              />
            </div>
          )}

          {props.form.level_id > 5 && (
            <div className="animate-in slide-in-from-left-2 fade-in">
              <SelectField
                label="3. Tỉnh / Thành phố (Cấp 5)"
                value={props.level5Id}
                options={props.level5List}
                disabled={!props.level4Id}
                loading={props.loadingL5}
                placeholder="-- Chọn tỉnh / thành phố --"
                onChange={props.onLevel5Change}
              />
            </div>
          )}

          {props.form.level_id > 6 && (
            <div className="animate-in slide-in-from-left-2 fade-in">
              <SelectField
                label="4. Thành phố / Điểm đến (Cấp 6)"
                value={props.level6Id}
                options={props.level6List}
                disabled={!props.level5Id}
                loading={props.loadingL6}
                placeholder="-- Chọn thành phố / điểm đến --"
                onChange={props.onLevel6Change}
              />
            </div>
          )}
        </div>

        <div className="rounded-3xl bg-slate-900 p-5 text-white shadow-xl shadow-slate-200">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
            <div className="group flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full bg-slate-500 transition-colors group-hover:bg-white" />
              <span className="text-[11px] font-bold text-slate-400 transition-colors group-hover:text-white">
                Toàn cầu
              </span>
            </div>

            <ChevronRight size={12} className="text-slate-600" />
            <span className={`text-[11px] font-black ${props.level3Id ? "text-blue-400" : "text-slate-600"}`}>
              {preview.level3}
            </span>

            {props.form.level_id >= 4 && (
              <>
                <ChevronRight size={12} className="text-slate-600" />
                <span className={`text-[11px] font-black ${props.level4Id ? "text-emerald-400" : "text-slate-600"}`}>
                  {preview.level4}
                </span>
              </>
            )}

            {props.form.level_id >= 5 && (
              <>
                <ChevronRight size={12} className="text-slate-600" />
                <span className={`text-[11px] font-black ${props.level5Id ? "text-amber-400" : "text-slate-600"}`}>
                  {preview.level5}
                </span>
              </>
            )}

            {props.form.level_id >= 6 && (
              <>
                <ChevronRight size={12} className="text-slate-600" />
                <span className={`text-[11px] font-black ${props.level6Id ? "text-indigo-400" : "text-slate-600"}`}>
                  {preview.level6}
                </span>
              </>
            )}

            {props.form.level_id === 7 && (
              <>
                <ChevronRight size={12} className="text-slate-600" />
                <span className="text-[11px] font-black italic text-rose-400">{preview.level7}</span>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
