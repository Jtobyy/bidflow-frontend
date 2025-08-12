// app/procurer/tenders/page.jsx (your TendersList)
"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Briefcase, FileCheck, Clock, Plus, Download, MoreHorizontal } from "lucide-react";
import dayjs from "dayjs";
import { useApi } from "@/app/services/axios";
import { useDebounce } from "use-debounce";
import CreateTenderModal from "@/app/components/procurer/CreateTenderModal";
import EditTenderModal from "@/app/components/procurer/EditTenderModal";
import ConfirmDialog from "@/app/components/shared/ConfirmDialog";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";


const statusMap = {
  draft: { label: "Draft", color: "#b7c7de", bg: "#f4f8ff" },
  published: { label: "Published", color: "#38a0f7", bg: "#e6f2fe" },
  closed: { label: "Closed", color: "#3EBF0F", bg: "#dcfce7" }
};

export default function TendersList() {
  const [summary, setSummary] = useState({ total: 0, draft: 0, published: 0, closed: 0, due_next_month: 0 });
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [reportUrl, setReportUrl] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, id: null, title: "" });
  const [deleting, setDeleting] = useState(false);

  const { api } = useApi();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const showCreate = searchParams.get("action") === "new";
  const showEdit = searchParams.get("action") === "edit";
  const editId = searchParams.get("id");

  const openCreateModal = () => router.push(`${pathname}?action=new`);
  const closeModals = () => router.push(pathname);
  const openEdit = (id) => router.push(`${pathname}?action=edit&id=${id}`);

  useEffect(() => {
    api.get(`/tenders/summary/`)
      .then(({ data }) => {
        setSummary(data);
        setReportUrl(data.report_url || null);
      })
      .catch(() => {});
  }, []);

  useEffect(() => { fetchTenders(); }, [debouncedSearch]);
  useEffect(() => {
    const close = (e) => setOpenMenuId(null);
    if (openMenuId) {
      document.addEventListener('click', close);
      return () => document.removeEventListener('click', close);
    }
  }, [openMenuId]);
  

  const fetchTenders = () => {
    setLoading(true);
    const query = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
    api.get(`/tenders/${query}`)
      .then(({ data }) => {
        setTenders(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  const handleExport = async () => {
    if (!reportUrl) return;
    try {
      const response = await api.get(reportUrl, { responseType: 'blob' });
      let filename = "tender-summary-report.xlsx";
      const cd = response.headers['content-disposition'];
      if (cd) {
        const match = cd.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', filename);
      document.body.appendChild(link); link.click(); link.remove();
      window.URL.revokeObjectURL(url);
    } catch { alert("Export failed."); }
  };

  const handleDuplicate = async (tenderId) => {
    try {
      const { data } = await api.post(`/tenders/${tenderId}/duplicate/`);
      await fetchTenders();
      openEdit(data.id);
      toast.success("Tender duplicated.");
    } catch {
      toast.error("Failed to duplicate tender.");
    } finally {
      setOpenMenuId(null);
    }
  };

  const handleDelete = async (tenderId) => {
    if (!window.confirm("Delete this tender? This cannot be undone.")) return;
    try {
      await api.delete(`/tenders/${tenderId}/`);
      await fetchTenders();
      toast.success("Tender deleted.");
    } catch {
      toast.error("Delete failed.");
    } finally {
      setOpenMenuId(null);
    }
  };

  const openDelete = (t) => {
    setOpenMenuId(null);
    setDeleteState({ open: true, id: t.id, title: t.title });
  };

  const confirmDelete = async () => {
    if (!deleteState.id) return;
    setDeleting(true);
    try {
      await api.delete(`/tenders/${deleteState.id}/`);
      await fetchTenders();
      toast.success("Tender deleted.");
      setDeleteState({ open: false, id: null, title: "" });
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-end mb-6">
        <button onClick={openCreateModal} className="flex items-center gap-2 cursor-pointer bg-[#38a0f7] text-white rounded-lg px-5 py-2 font-semibold shadow hover:bg-[#256bb7]">
          <Plus size={18} /> New Tender
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Draft" count={summary.draft} color="#b7c7de" icon={Clock} />
        <SummaryCard label="Published" count={summary.published} color="#38a0f7" icon={Briefcase} />
        <SummaryCard label="Closed" count={summary.closed} color="#3EBF0F" icon={FileCheck} />
        <SummaryCard label="Due Next Month" count={summary.due_next_month} color="#F59E0B" icon={Clock} />
      </div>

      {/* Search & Export */}
      <div className="flex flex-col md:flex-row items-center justify-between mb-5 gap-3">
        <div className="flex items-center w-full md:w-1/2">
          <input
            type="text"
            className="border  border-[#406087] rounded-lg px-4 py-2 w-full text-[#08305e] placeholder-[#b7c7de] focus:[#08305e] focus:ring-[#08305e] focus:border-[#08305e]"
            placeholder="Search tenders by title or ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <button
          className="flex items-center cursor-pointer gap-2 bg-[#fffce8] text-[#08305e] border border-[#38a0f7] rounded-lg px-4 py-2 font-medium hover:bg-[#38a0f7] hover:text-white transition"
          onClick={handleExport}
          disabled={!reportUrl}
        >
          <Download size={18} /> Export
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl shadow bg-[#fffce8] border border-[#254c7c] overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e0e7ef] text-[#08305e]">
          <thead>
            <tr className="bg-[#08305e]/5">
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Title</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Deadline</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Bids</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Compliant Bids</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Required Docs</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-20 text-center text-[#b7c7de] font-medium">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#08305e] mx-auto" />
              </td></tr>
            ) : tenders.length === 0 ? (
              <tr><td colSpan={8} className="py-20 text-center text-[#b7c7de] font-medium">No tenders found.</td></tr>
            ) : tenders.map(t => (
              <tr key={t.id} className="hover:bg-[#08305e]/5 transition relative">
                <td className="px-6 py-4 font-bold">{t.id}</td>
                <td className="px-6 py-4">{t.title}</td>
                <td className="px-6 py-4">
                  <span
                    className="px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      background: statusMap[t.status]?.bg,
                      color: statusMap[t.status]?.color,
                      borderColor: statusMap[t.status]?.color || "#b7c7de"
                    }}
                  >
                    {statusMap[t.status]?.label || t.status}
                  </span>
                </td>
                <td className="px-6 py-4">{dayjs(t.deadline).format("MMM D, YYYY")}</td>
                <td className="px-6 py-4">{t.total_bids ?? 0}</td>
                <td className="px-6 py-4">{t.compliant_bids ?? 0}</td>
                <td className="px-6 py-4">
                  {Array.isArray(t.required_documents) && t.required_documents.length > 0
                    ? t.required_documents.join(", ")
                    : <span className="text-[#b7c7de]">None</span>}
                </td>
                <td className="px-6 py-4 text-center">
                  <div className="relative inline-block text-left">
                    <button
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === t.id ? null : t.id); }}
                      className="p-2 rounded hover:bg-[#08305e]/10 cursor-pointer"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>

                    {openMenuId === t.id && (
                      <div className="absolute right-0 mt-2 w-44 rounded-md shadow-lg bg-[#fffce8] ring-1 ring-black/5 z-20">
                        <div className="py-1">
                          <button
                            onClick={() => { setOpenMenuId(null); openEdit(t.id); }}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-[#08305e]/10 cursor-pointer"
                          >
                            View / Update
                          </button>
                          <button
                            onClick={() => handleDuplicate(t.id)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-[#08305e]/10 cursor-pointer"
                          >
                            Duplicate
                          </button>
                          <button
                            onClick={() => openDelete(t)}
                            className="block w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-red-600 cursor-pointer"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* pagination if needed */}
      </div>

      {/* Modals */}
      <CreateTenderModal
        isOpen={showCreate}
        onClose={closeModals}
        onCreated={fetchTenders}
      />
      <EditTenderModal
        isOpen={showEdit && !!editId}
        tenderId={editId ? Number(editId) : null}
        onClose={closeModals}
        onUpdated={fetchTenders}
      />
      <ConfirmDialog
        isOpen={deleteState.open}
        onClose={() => !deleting && setDeleteState({ open: false, id: null, title: "" })}
        title="Delete tender?"
        message={
          <>
            This will permanently delete <span className="font-semibold">“{deleteState.title || `Tender #${deleteState.id}`}”</span>.
            <br />This action cannot be undone.
          </>
        }
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

function SummaryCard({ label, count, color, icon: Icon }) {
  return (
    <div className="flex items-center gap-3 bg-[#08305e] rounded-lg px-6 py-5 border border-[#254c7c] shadow">
      <span className="rounded-full p-3" style={{ background: `${color}20` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </span>
      <div>
        <div className="text-2xl font-bold text-[#fffce8]">{count}</div>
        <div className="text-sm text-[#fffce8]">{label}</div>
      </div>
    </div>
  );
}
