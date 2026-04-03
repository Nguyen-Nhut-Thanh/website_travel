"use client";

import { type ReactNode, useMemo, useState } from "react";
import { Edit, Trash2 } from "lucide-react";
import { AdminIconActionButton } from "@/components/admin/AdminIconActionButton";
import { AdminPagination } from "@/components/admin/AdminPagination";

interface Column<T> {
  header: string;
  render: (item: T, index: number) => ReactNode;
  className?: string;
  align?: "left" | "center" | "right";
}

interface TableAction<T> {
  icon: ReactNode | ((item: T) => ReactNode);
  title: string | ((item: T) => string);
  tone?: "neutral" | "primary" | "danger";
  onClick: (item: T) => void;
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
  extraActions?: TableAction<T>[];
}

function AdminTableSkeleton({
  columnCount,
  showActions,
}: {
  columnCount: number;
  showActions: boolean;
}) {
  const totalColumns = showActions ? columnCount + 1 : columnCount;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
              {Array.from({ length: totalColumns }).map((_, index) => (
                <th key={index} className="px-6 py-4">
                  <div className="h-3 w-20 animate-pulse rounded-full bg-slate-200" />
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {Array.from({ length: 6 }).map((_, rowIndex) => (
              <tr key={rowIndex}>
                {Array.from({ length: totalColumns }).map((__, columnIndex) => (
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

function getAlignmentClass(alignment?: "left" | "center" | "right") {
  if (alignment === "center") return "text-center";
  if (alignment === "right") return "text-right";
  return "text-left";
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
  extraActions = [],
}: AdminTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const page = Math.min(currentPage, totalPages);
  const hasActions = Boolean(onEdit || onDelete || extraActions.length);

  const paginatedItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  if (loading) {
    return (
      <AdminTableSkeleton
        columnCount={columns.length}
        showActions={hasActions}
      />
    );
  }

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-20 text-center font-medium italic text-slate-400 shadow-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-collapse text-left">
          <thead>
            <tr className="bg-slate-50/50 text-xs uppercase tracking-wider text-slate-500">
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 font-bold ${getAlignmentClass(column.align)} ${column.className || ""}`}
                >
                  {column.header}
                </th>
              ))}
              {hasActions ? (
                <th className="w-[140px] whitespace-nowrap px-6 py-4 text-right font-bold">
                  Thao tác
                </th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {paginatedItems.map((item, index) => (
              <tr
                key={rowKey(item)}
                className="group transition-colors hover:bg-slate-50/50"
              >
                {columns.map((column, columnIndex) => (
                  <td
                    key={columnIndex}
                    className={`px-6 py-4 ${getAlignmentClass(column.align)} ${column.className || ""}`}
                  >
                    {column.render(item, (page - 1) * pageSize + index)}
                  </td>
                ))}
                {hasActions ? (
                  <td className="w-[140px] whitespace-nowrap px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2 whitespace-nowrap opacity-0 transition-opacity group-hover:opacity-100">
                      {onEdit ? (
                        <AdminIconActionButton
                          onClick={() => onEdit(item)}
                          icon={<Edit size={16} />}
                          title="Chỉnh sửa"
                        />
                      ) : null}
                      {extraActions.map((action, actionIndex) => (
                        <AdminIconActionButton
                          key={`${rowKey(item)}-${actionIndex}`}
                          onClick={() => action.onClick(item)}
                          icon={
                            typeof action.icon === "function"
                              ? action.icon(item)
                              : action.icon
                          }
                          title={
                            typeof action.title === "function"
                              ? action.title(item)
                              : action.title
                          }
                          tone={action.tone}
                        />
                      ))}
                      {onDelete ? (
                        <AdminIconActionButton
                          onClick={() => onDelete(item)}
                          icon={<Trash2 size={16} />}
                          title="Xóa"
                          tone="danger"
                        />
                      ) : null}
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        totalItems={items.length}
        pageSize={pageSize}
        itemLabel={itemLabel}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
