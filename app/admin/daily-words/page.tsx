"use client";

import { FC, JSX, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FiEdit2,
  FiTrash2,
  FiSun,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import PageHeader from "@/components/admin/page-header";
import ConfirmDialog from "@/components/admin/confirm-dialog";
import EmptyState from "@/components/admin/empty-state";
import Spinner from "@/components/ui/spinner";
import { useAdminDailyWords, useDeleteDailyWord } from "@/hooks/query/useAdmin";
import toast from "react-hot-toast";

const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const AdminDailyWordsPage: FC = (): JSX.Element => {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const limit = 20;
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    date: string;
  } | null>(null);

  const { data, isLoading } = useAdminDailyWords(page, limit);
  const deleteMutation = useDeleteDailyWord();

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success("Daily word deleted");
      setDeleteTarget(null);
    } catch {
      toast.error("Failed to delete daily word");
    }
  };

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  return (
    <div>
      <PageHeader
        title="Daily Words"
        description="Manage scheduled quotes and words of the day."
        action={{ label: "New Daily Word", href: "/admin/daily-words/create" }}
      />

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Spinner size={28} />
        </div>
      ) : !data || data.dailyWords.length === 0 ? (
        <EmptyState
          icon={<FiSun size={24} />}
          title="No daily words yet"
          description="Schedule a quote to show on your homepage."
          action={{
            label: "Create Daily Word",
            onClick: () => router.push("/admin/daily-words/create"),
          }}
        />
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-5 py-3 font-medium text-gray-500">
                      Date
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500">
                      Quote
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500 hidden md:table-cell">
                      Author
                    </th>
                    <th className="text-left px-5 py-3 font-medium text-gray-500 hidden lg:table-cell">
                      Backgrounds
                    </th>
                    <th className="text-right px-5 py-3 font-medium text-gray-500">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.dailyWords.map((dw) => (
                    <tr
                      key={dw.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(dw.date)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-sm text-gray-700 truncate max-w-xs">
                          {dw.text}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 hidden md:table-cell">
                        {dw.author}
                      </td>
                      <td className="px-5 py-3.5 hidden lg:table-cell">
                        <div className="flex -space-x-1">
                          {dw.backgrounds.slice(0, 3).map((bg) => (
                            <div
                              key={bg.id}
                              className="w-7 h-7 rounded border-2 border-white overflow-hidden"
                            >
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={bg.src}
                                alt={bg.alt}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {dw.backgrounds.length > 3 && (
                            <div className="w-7 h-7 rounded border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                              +{dw.backgrounds.length - 3}
                            </div>
                          )}
                          {dw.backgrounds.length === 0 && (
                            <span className="text-xs text-gray-400">None</span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/admin/daily-words/${dw.id}/edit`}
                            className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                            title="Edit"
                          >
                            <FiEdit2 size={16} />
                          </Link>
                          <button
                            onClick={() =>
                              setDeleteTarget({
                                id: dw.id,
                                date: formatDate(dw.date),
                              })
                            }
                            className="p-2 text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <p className="text-sm text-gray-500">
                Page {page} of {totalPages} · {data.total} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <FiChevronLeft size={18} />
                </button>
                <button
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="p-2 text-gray-400 hover:text-gray-900 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                >
                  <FiChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Daily Word"
        message={`Delete the daily word for ${deleteTarget?.date}? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

export default AdminDailyWordsPage;
