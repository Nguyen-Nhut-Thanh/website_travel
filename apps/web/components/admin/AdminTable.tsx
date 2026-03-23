"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { AdminIconActionButton } from "@/components/admin/AdminIconActionButton";
import { AdminPagination } from "@/components/admin/AdminPagination";

interface Column<T> {
  header: string;
  render: (item: T, index: number) => ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

interface AdminTableProps<T> {
  items: T[];
  columns: Column<T>[];
  loading?: boolean;
  emptyMessage?: string;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  rowKey: (item: T) => string | number;
  pageSize?: number;
  itemLabel?: string;
}

function AdminTableSkeleton({
  columnCount,
  showActions,
}: {
  columnCount: number;
  showActions: boolean;
}) {
  const columns = showActions ? columnCount + 1 : columnCount;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
              {Array.from({ length: columns }).map((_, index) => (
                <th key={index} className="px-6 py-4">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: columns }).map((__, columnIndex) => (
                  <td key={columnIndex} className="px-6 py-5">
                    <div
                      className={`animate-pulse rounded-full bg-slate-100 ${
                        columnIndex === 0 ? "h-4 w-40" : "h-4 w-24"
                      }`}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function AdminTable<T>({
  items,
  columns,
  loading,
  emptyMessage = "Không có dữ liệu",
  onEdit,
  onDelete,
  rowKey,
  pageSize = 10,
  itemLabel = "mục",
}: AdminTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setCurrentPage(1);
  }, [items.length]);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [currentPage, items, pageSize]);

  if (loading) {
    return <AdminTableSkeleton columnCount={columns.length} showActions={!!(onEdit || onDelete)} />;
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-20 text-center font-medium italic text-slate-400 shadow-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={`px-6 py-4 font-bold ${
                    col.align === "center"
                      ? "text-center"
                      : col.align === "right"
                        ? "text-right"
                        : "text-left"
                  } ${col.className || ""}`}
                >
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && (
                <th className="px-6 py-4 text-right font-bold">Thao tác</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedItems.map((item, index) => (
              <tr key={rowKey(item)} className="group transition-colors hover:bg-slate-50/50">
                {columns.map((col, idx) => (
                  <td
                    key={idx}
                    className={`px-6 py-4 ${
                      col.align === "center"
                        ? "text-center"
                        : col.align === "right"
                          ? "text-right"
                          : "text-left"
                    } ${col.className || ""}`}
                  >
                    {col.render(item, (currentPage - 1) * pageSize + index)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 opacity-0 transition-opacity group-hover:opacity-100">
                      {onEdit && (
                        <AdminIconActionButton
                          onClick={() => onEdit(item)}
                          icon={<Edit size={16} />}
                          title="Chỉnh sửa"
                        />
                      )}
                      {onDelete && (
                        <AdminIconActionButton
                          onClick={() => onDelete(item)}
                          icon={<Trash2 size={16} />}
                          title="Xóa"
                          tone="danger"
                        />
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={items.length}
        pageSize={pageSize}
        itemLabel={itemLabel}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
