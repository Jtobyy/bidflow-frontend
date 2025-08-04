"use client";
import React, { useEffect, useState } from "react";
import { Briefcase, FileCheck, Clock, Plus, Download } from "lucide-react";
import dayjs from "dayjs";
import { useApi } from "@/app/services/axios";
import { useDebounce } from "use-debounce";
import CreateTenderModal from "@/app/components/procurer/CreateTenderModal";
import { useRouter, usePathname, useSearchParams } from "next/navigation";


// STATUS MAP
const statusMap = {
  draft: { label: "Draft", color: "#b7c7de", bg: "#f4f8ff" },
  published: { label: "Published", color: "#38a0f7", bg: "#e6f2fe" },
  closed: { label: "Closed", color: "#3EBF0F", bg: "#dcfce7" }
};

export default function TendersList() {
  const [summary, setSummary] = useState({
    total: 0, draft: 0, published: 0, closed: 0, due_next_month: 0
  });
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const [page, setPage] = useState(1);
  const [reportUrl, setReportUrl] = useState(null);
  const { api } = useApi();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const showModal = searchParams.get("action") === "new";
  const handleOpenModal = () => router.push("/procurer/tenders?action=new");

  const handleCloseModal = () => router.push("/procurer/tenders");

  // Fetch summary
  useEffect(() => {
    api.get(`/tenders/summary/`)
      .then(({ data }) => {
        setSummary(data);
        setReportUrl(data.report_url || null);
      })
      .catch(() => {})
  }, []);

  // Fetch list (simple: first page only)
  useEffect(() => {
    fetchTenders()
  }, [debouncedSearch]);

  const fetchTenders = () => {
    setLoading(true);
    const query = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
    api.get(`/tenders/${query}`)
      .then(({ data }) => {
        setTenders(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  const handleExport = async () => {
    if (!reportUrl) return;
    try {
      const response = await api.get(reportUrl, {
        responseType: 'blob'
      });
      // Get filename from Content-Disposition header if available
      let filename = "tender-summary-report.xlsx";
      const cd = response.headers['content-disposition'];
      if (cd) {
        const match = cd.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      alert("Export failed.");
    }
  };

  return (
    <div className="px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#08305e]">Tenders</h1>
        <button onClick={handleOpenModal} className="flex items-center gap-2 cursor-pointer bg-[#38a0f7] text-white rounded-lg px-5 py-2 font-semibold shadow hover:bg-[#256bb7]">
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
              <tr key={t.id} className="hover:bg-[#08305e]/5 transition">
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
                  <button className="text-[#38a0f7] hover:underline text-sm">View</button>
                  {/* Add Edit/Delete as needed */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Add pagination here as needed */}
      </div>
      
      <CreateTenderModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onCreated={fetchTenders}
      />
    </div>
  );
}

// Summary Card Subcomponent
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
