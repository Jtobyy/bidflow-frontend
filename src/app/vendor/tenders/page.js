"use client";
import React, { useEffect, useState } from "react";
import { Briefcase, Clock, FileCheck } from "lucide-react";
import dayjs from "dayjs";
import { useApi } from "@/app/services/axios";
import { useDebounce } from "use-debounce";
import TenderDetailsModal from "@/app/components/shared/TenderDetailsModal";
import { useRouter, useSearchParams } from "next/navigation";


// Map status for display, but dynamic label/color logic is used below
const statusMap = {
  open:    { label: "Open",   color: "#10B981", bg: "#dcfce7" },    // Green
  closed:  { label: "Closed", color: "#EF4444", bg: "#fde8e8" },    // Red
  draft:   { label: "Draft",  color: "#F59E0B", bg: "#FFFBEA" },    // Yellow
};


export default function VendorTendersList() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 400);
  const { api } = useApi();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [selectedTender, setSelectedTender] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  const detailsId = searchParams.get("action") === "details" ? searchParams.get("id") : null;

  const openDetails = (id) => router.push(`/vendor/tenders?action=details&id=${id}`);
  const closeDetails = () => router.push('/vendor/tenders');

  // Fetch list (first page only for demo)
  useEffect(() => {
    fetchTenders();
    // eslint-disable-next-line
  }, [debouncedSearch]);

  const fetchTenders = () => {
    setLoading(true);
    const query = debouncedSearch ? `?search=${encodeURIComponent(debouncedSearch)}` : "";
    // Show only published tenders
    api.get(`/tenders/?status=published${query ? "&" + query.slice(1) : ""}`)
      .then(({ data }) => {
        setTenders(data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  // Dummy function to check if vendor has already submitted a bid
  const hasSubmittedBid = (tender) => tender.my_bid_status; // boolean or status

  // Determine open/closed status using status and deadline
  const getTenderStatus = (tender) => {
    if (tender.status === "draft") return "draft";
    if (
      tender.status === "closed" ||
      (tender.status === "published" && dayjs(tender.deadline).isBefore(dayjs()))
    ) {
      return "closed";
    }
    if (tender.status === "published" && dayjs(tender.deadline).isAfter(dayjs())) {
      return "open";
    }
    return tender.status;
  };

  return (
    <div className="px-8 py-8">
      {/* Search Bar */}
      <div className="flex items-center w-full md:w-1/2 mb-6">
        <input
          type="text"
          className="border border-[#406087] rounded-lg px-4 py-2 w-full text-[#08305e] placeholder-[#b7c7de] focus:[#08305e] focus:ring-[#08305e] focus:border-[#08305e]"
          placeholder="Search tenders by title or ID"
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
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Title</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Procurer</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Deadline</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Required Docs</th>
              <th className="px-6 py-4 text-left text-xs font-bold uppercase">Status</th>
              <th className="px-6 py-4 text-center text-xs font-bold uppercase">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="py-20 text-center text-[#b7c7de] font-medium">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#08305e] mx-auto" />
                </td>
              </tr>
            ) : tenders.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center text-[#b7c7de] font-medium">No tenders found.</td>
              </tr>
            ) : tenders.map(t => {
              const computedStatus = getTenderStatus(t);
              const statusObj = statusMap[computedStatus] || statusMap.draft;
              return (
                <tr key={t.id} className="hover:bg-[#08305e]/5 transition">
                  <td className="px-6 py-4 font-bold">#{t.id}</td>
                  <td className="px-6 py-4">{t.title}</td>
                  <td className="px-6 py-4">{t.company?.name || t.procurer_name || "-"}</td>
                  <td className="px-6 py-4">{dayjs(t.deadline).format("MMM D, YYYY")}</td>
                  <td className="px-6 py-4">
                    {Array.isArray(t.required_documents) && t.required_documents.length > 0
                      ? t.required_documents.join(", ")
                      : <span className="text-[#b7c7de]">None</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold border"
                      style={{
                        background: statusObj.bg,
                        color: statusObj.color,
                        borderColor: statusObj.color || "#b7c7de"
                      }}
                    >
                      {statusObj.label}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {hasSubmittedBid(t) ? (
                      <button
                        className="text-[#38a0f7] hover:underline text-sm cursor-pointer"
                        onClick={() => router.push(`/vendor/bids/${t.my_bid_id}`)}
                      >
                        View Bid
                      </button>
                    ) : (
                      <button
                        className="text-[#38a0f7] hover:underline text-sm cursor-pointer"
                        onClick={() => openDetails(t.id)}
                      >
                        View
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <TenderDetailsModal
        isOpen={!!detailsId}
        onClose={closeDetails}
        tenderId={detailsId}
        // Pass this as prop or compute in modal if needed
        hasSubmittedBid={
          !!detailsId &&
          tenders.find(t => String(t.id) === String(detailsId))?.my_bid_status
        }
        onApply={() => {
          closeDetails();
          router.push(`/vendor/tenders/${detailsId}/application`);
        }}
      />
      {/* Pagination if needed */}
    </div>
  );
}
