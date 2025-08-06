"use client";
import React, { useEffect, useState } from "react";
import { FileText, ShieldCheck, XCircle, Clock, Search } from "lucide-react";
import dayjs from "dayjs";
import { useApi } from "@/app/services/axios";
import { useDebounce } from "use-debounce";

// Map API verification_status to UI display
const statusMap = {
  pending: { label: "Pending", color: "#F59E0B", icon: Clock },
  verified: { label: "Verified", color: "#10B981", icon: ShieldCheck },
  verification_failed: { label: "Failed", color: "#EF4444", icon: XCircle },
  expired_certificate: { label: "Expired", color: "#EF4444", icon: XCircle },
  analyzed: { label: "Analyzed", color: "#38a0f7", icon: FileText },
  // ...add more as needed
};

export default function DocumentsList() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState({ total: 0, pending: 0, verified: 0, failed: 0 });
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const { api } = useApi();

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line
  }, [debouncedSearch]);

  const fetchDocuments = () => {
    setLoading(true);
    const query = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
    api.get(`/bids-documents/${query}`)
      .then(({ data }) => {
        setDocuments(data.results || []);
        // Calculate summary stats (can adjust based on your needs)
        setSummary({
          total: data.count || 0,
          pending: data.results.filter(d => d.verification_status === "pending").length,
          verified: data.results.filter(d => d.verification_status === "verified").length,
          failed: data.results.filter(d =>
            d.verification_status === "verification_failed" ||
            d.verification_status === "expired_certificate"
          ).length,
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Filtered by company or doc type (client-side filter, for demo only)
  const filteredDocs = documents.filter(
    d =>
      (d.custom_document_name || "")
        .toLowerCase()
        .includes(debouncedSearch.toLowerCase()) ||
      d.document_type.toLowerCase().includes(debouncedSearch.toLowerCase())
  );

  return (
    <div className="px-8 py-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
        <SummaryCard label="Total" count={summary.total} color="#f2f2f2" icon={FileText} />
        <SummaryCard label="Pending" count={summary.pending} color="#F59E0B" icon={Clock} />
        <SummaryCard label="Verified" count={summary.verified} color="#10B981" icon={ShieldCheck} />
        <SummaryCard label="Failed" count={summary.failed} color="#EF4444" icon={XCircle} />
      </div>

      {/* Search Bar */}
      <div className="flex px-3  items-center w-full md:w-1/2 mb-6 border border-[#406087]  focus:[#08305e] focus:ring-[#08305e] focus:border-[#08305e] rounded-lg">
        <Search size={18} className="mr-2 text-[#08305e]" />
        <input
          type="text"
          className=" px-4 py-2 w-full text-[#08305e] focus:outline-none placeholder-[#b7c7de]"
          placeholder="Search by type or name"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl shadow bg-[#fffce8] border border-[#254c7c] overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e0e7ef] text-[#08305e]">
          <thead>
            <tr className="bg-[#08305e]/5">
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">ID</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Type</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Custom Name</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">File</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Uploaded At</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Bid</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Status</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="py-20 text-center text-[#b7c7de] font-medium">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#08305e] mx-auto" />
              </td></tr>
            ) : filteredDocs.length === 0 ? (
              <tr><td colSpan={8} className="py-20 text-center text-[#b7c7de] font-medium">No documents found.</td></tr>
            ) : filteredDocs.map(doc => (
              <tr key={doc.id} className="hover:bg-[#08305e]/5 transition">
                <td className="px-6 py-4 font-bold">{doc.id}</td>
                <td className="px-6 py-4">{doc.document_type}</td>
                <td className="px-6 py-4">{doc.custom_document_name || "-"}</td>
                <td className="px-6 py-4">
                  {doc.file?.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                    <a href={doc.file} target="_blank" rel="noopener noreferrer">
                      <img src={doc.file} alt="Document" className="w-8 h-8 object-cover rounded shadow inline-block mr-2" />
                      <span className="text-xs text-[#406087] underline">View</span>
                    </a>
                  ) : doc.file ? (
                    <a href={doc.file} target="_blank" rel="noopener noreferrer" className="text-xs text-[#406087] underline">Open</a>
                  ) : "-"}
                </td>
                <td className="px-6 py-4">{dayjs(doc.uploaded_at).format("MMM D, YYYY")}</td>
                <td className="px-6 py-4">{doc.bid || "-"}</td>
                <td className="px-6 py-4">
                  <span className="flex items-center gap-1 font-medium" style={{ color: statusMap[doc.verification_status]?.color }}>
                    {React.createElement(statusMap[doc.verification_status]?.icon || Clock, { size: 16 })}
                    {statusMap[doc.verification_status]?.label || doc.verification_status}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <button className="text-[#38a0f7] hover:underline text-sm">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Summary Card Subcomponent (reuse your style!)
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
