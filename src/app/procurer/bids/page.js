"use client";
import React, { useEffect, useState } from "react";
import { FileText, Briefcase, CheckCircle, Clock, Eye } from "lucide-react";
import dayjs from "dayjs";
import { useApi } from "@/app/services/axios";
import { useDebounce } from "use-debounce";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";


// Status mapping
const statusMap = {
  pending: { label: "Pending", color: "#F59E0B", bg: "#FFFBEA" },
  reviewed: { label: "Reviewed", color: "#38a0f7", bg: "#e6f2fe" },
  compliant: { label: "Compliant", color: "#3EBF0F", bg: "#dcfce7" },
  rejected: { label: "Rejected", color: "#EF4444", bg: "#fde8e8" },
};

export default function BidsList() {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const { api } = useApi();

  // Fetch list (first page)
  useEffect(() => {
    fetchBids();
  }, [debouncedSearch]);

  const fetchBids = () => {
    setLoading(true);
    const query = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
    api.get(`/bids/${query}`)
      .then(({ data }) => {
        setBids(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  return (
    <div className="px-8 py-8">

      {/* Search */}
      <div className="flex items-center w-full md:w-1/2 mb-5">
        <input
          type="text"
          className="border border-[#406087] rounded-lg px-4 py-2 w-full text-[#08305e] placeholder-[#b7c7de] focus:[#08305e] focus:ring-[#08305e] focus:border-[#08305e]"
          placeholder="Search bids by company or tender"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="rounded-xl shadow bg-[#fffce8] border border-[#254c7c] overflow-x-auto">
        <table className="min-w-full divide-y divide-[#e0e7ef] text-[#08305e]">
          <thead>
            <tr className="bg-[#08305e]/5">
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">#</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Company</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Tender</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Price</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Submitted At</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Status</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Score</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Rank</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Documents</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="py-20 text-center text-[#b7c7de] font-medium">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#08305e] mx-auto" />
                </td>
              </tr>
            ) : bids.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-20 text-center text-[#b7c7de] font-medium">
                  No bids found.
                </td>
              </tr>
            ) : (
              bids.map((b, idx) => (
                <tr key={b.id} className="hover:bg-[#08305e]/5 transition">
                  <td className="px-6 py-4">{idx + 1}</td>
                  <td className="px-6 py-4 flex items-center gap-2">
                    {b.company?.logo ? (
                        <img
                        src={b.company.logo}
                        alt={b.company.name}
                        className="w-8 h-8 rounded-full border bg-white object-cover"
                        />
                    ) : (
                        <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#e5f4fe] border border-[#b7c7de]">
                        <FontAwesomeIcon icon={faBuilding} className="text-[#b7c7de] text-lg" />
                        </span>
                    )}
                    <div>
                        <div className="font-bold">{b.company?.name || 'N/A'}</div>
                        <div className="text-xs text-[#406087]">{b.company?.rc_number}</div>
                    </div>
                </td>
                  <td className="px-6 py-4">
                    <div className="font-bold">{b.tender?.title}</div>
                    <div className="text-xs text-[#406087]">
                      {dayjs(b.tender?.deadline).format("MMM D, YYYY")}
                    </div>
                  </td>
                  <td className="px-6 py-4">{b.price ? `₦${Number(b.price).toLocaleString()}` : '-'}</td>
                  <td className="px-6 py-4">{dayjs(b.submitted_at).format("MMM D, YYYY h:mmA")}</td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold border"
                      style={{
                        background: statusMap[b.status]?.bg,
                        color: statusMap[b.status]?.color,
                        borderColor: statusMap[b.status]?.color || "#b7c7de"
                      }}
                    >
                      {statusMap[b.status]?.label || b.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{b.score !== null ? b.score : (b.bid_scores?.[0]?.score ?? '-')}</td>
                  <td className="px-6 py-4">{b.rank !== null ? b.rank : (b.bid_scores?.[0]?.rank ?? '-')}</td>
                  <td className="px-6 py-4">
                    {(b.uploaded_documents || []).length > 0
                      ? (
                        <div className="flex flex-wrap gap-1">
                          {b.uploaded_documents.map(doc => (
                            <a
                              href={doc.file}
                              key={doc.id}
                              className="underline text-xs text-[#38a0f7]"
                              target="_blank"
                              rel="noopener noreferrer"
                              title={doc.custom_document_name || doc.document_type}
                            >
                              {doc.document_type}
                            </a>
                          ))}
                        </div>
                      )
                      : <span className="text-[#b7c7de]">None</span>
                    }
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button className="text-[#38a0f7] hover:underline text-sm flex items-center gap-1">
                      <Eye size={16} /> View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {/* Pagination goes here if needed */}
      </div>
    </div>
  );
}
