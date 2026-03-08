"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";

type Tour = {
  tour_id: number;
  code: string;
  name: string;
  duration_days: number;
  base_price: string | number;
  status: number;
};

type LocationOption = {
  location_id: number;
  name: string;
};

type TransportOption = {
  transport_id: number;
  name: string;
  transport_type: string;
};

export default function AdminToursPage() {
  const [items, setItems] = useState<Tour[]>([]);
  const [err, setErr] = useState("");

  const [locations, setLocations] = useState<LocationOption[]>([]);
  const [transports, setTransports] = useState<TransportOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [form, setForm] = useState({
    code: "",
    name: "",
    description: "",
    duration_days: 1,
    duration_nights: 0,
    base_price: 0,
    departure_location: 0, // sẽ set sau khi load options
    transport_id: 0, // sẽ set sau khi load options
  });

  async function loadTours() {
    setErr("");
    const res = await adminFetch("/admin/tours", { method: "GET" });
    if (!res.ok) {
      setErr("Cannot load tours (check token/login)");
      return;
    }
    const data = await res.json();
    setItems(data.items || []);
  }

  async function loadOptions() {
    setLoadingOptions(true);
    setErr("");

    const [lRes, tRes] = await Promise.all([
      adminFetch("/admin/locations", { method: "GET" }),
      adminFetch("/admin/transports", { method: "GET" }),
    ]);

    if (!lRes.ok || !tRes.ok) {
      setErr("Cannot load locations/transports options");
      setLoadingOptions(false);
      return;
    }

    const lData = await lRes.json();
    const tData = await tRes.json();

    const locs: LocationOption[] = lData.items || [];
    const trans: TransportOption[] = tData.items || [];

    setLocations(locs);
    setTransports(trans);

    // Set default selected values nếu form đang = 0
    setForm((prev) => ({
      ...prev,
      departure_location:
        prev.departure_location || (locs[0]?.location_id ?? 0),
      transport_id: prev.transport_id || (trans[0]?.transport_id ?? 0),
    }));

    setLoadingOptions(false);
  }

  useEffect(() => {
    loadTours();
    loadOptions();
  }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setErr("");

    if (!form.departure_location || !form.transport_id) {
      setErr("Please select departure location and transport.");
      return;
    }

    const res = await adminFetch("/admin/tours", {
      method: "POST",
      body: JSON.stringify(form),
    });

    if (!res.ok) {
      setErr(await res.text());
      return;
    }

    // reset nhưng giữ selection dropdown
    setForm((prev) => ({
      ...prev,
      code: "",
      name: "",
      description: "",
      duration_days: 1,
      duration_nights: 0,
      base_price: 0,
    }));

    await loadTours();
  }

  async function toggle(tour_id: number) {
    setErr("");
    const res = await adminFetch(`/admin/tours/${tour_id}/status`, {
      method: "PATCH",
    });
    if (!res.ok) {
      setErr("Toggle failed");
      return;
    }
    await loadTours();
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Tours</h1>
        <p className="text-sm text-gray-600">List / Create / Toggle status</p>
      </div>

      {err && (
        <div className="text-sm text-red-600 whitespace-pre-wrap">{err}</div>
      )}

      {/* Table */}
      <div className="border rounded">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-2">Code</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Days</th>
              <th className="text-left p-2">Base price</th>
              <th className="text-left p-2">Status</th>
              <th className="text-left p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((t) => (
              <tr key={t.tour_id} className="border-t">
                <td className="p-2">{t.code}</td>
                <td className="p-2">{t.name}</td>
                <td className="p-2">{t.duration_days}</td>
                <td className="p-2">{t.base_price}</td>
                <td className="p-2">
                  {t.status === 1 ? "Active" : "Inactive"}
                </td>
                <td className="p-2">
                  <button
                    className="border rounded px-3 py-1"
                    onClick={() => toggle(t.tour_id)}
                  >
                    Toggle
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td className="p-4 text-gray-500" colSpan={6}>
                  No tours
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create */}
      <form onSubmit={onCreate} className="border rounded p-4 space-y-3">
        <div className="font-semibold">Create Tour</div>

        <div className="grid grid-cols-2 gap-3">
          <input
            className="border rounded p-2"
            placeholder="code"
            value={form.code}
            onChange={(e) => setForm({ ...form, code: e.target.value })}
          />
          <input
            className="border rounded p-2"
            placeholder="name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>

        <textarea
          className="border rounded p-2 w-full"
          placeholder="description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="grid grid-cols-3 gap-3">
          <input
            className="border rounded p-2"
            type="number"
            min={1}
            placeholder="duration_days"
            value={form.duration_days}
            onChange={(e) =>
              setForm({ ...form, duration_days: Number(e.target.value) })
            }
          />
          <input
            className="border rounded p-2"
            type="number"
            min={0}
            placeholder="duration_nights"
            value={form.duration_nights}
            onChange={(e) =>
              setForm({ ...form, duration_nights: Number(e.target.value) })
            }
          />
          <input
            className="border rounded p-2"
            type="number"
            min={0}
            placeholder="base_price"
            value={form.base_price}
            onChange={(e) =>
              setForm({ ...form, base_price: Number(e.target.value) })
            }
          />
        </div>

        {/* Dropdowns */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-gray-600">Departure location</label>
            <select
              className="border rounded p-2 w-full"
              disabled={loadingOptions || locations.length === 0}
              value={form.departure_location}
              onChange={(e) =>
                setForm({ ...form, departure_location: Number(e.target.value) })
              }
            >
              {locations.length === 0 ? (
                <option value={0}>No locations</option>
              ) : (
                locations.map((l) => (
                  <option key={l.location_id} value={l.location_id}>
                    {l.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-sm text-gray-600">Transport</label>
            <select
              className="border rounded p-2 w-full"
              disabled={loadingOptions || transports.length === 0}
              value={form.transport_id}
              onChange={(e) =>
                setForm({ ...form, transport_id: Number(e.target.value) })
              }
            >
              {transports.length === 0 ? (
                <option value={0}>No transports</option>
              ) : (
                transports.map((t) => (
                  <option key={t.transport_id} value={t.transport_id}>
                    {t.name} ({t.transport_type})
                  </option>
                ))
              )}
            </select>
          </div>
        </div>

        <button
          className="bg-black text-white rounded px-4 py-2"
          disabled={loadingOptions}
        >
          Create
        </button>
      </form>
    </div>
  );
}
