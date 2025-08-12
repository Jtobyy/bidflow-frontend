"use client";
import React, { useEffect, useState } from "react";
import { FileText, Trophy, Briefcase, Clock, RefreshCw } from "lucide-react";
import { useApi } from "@/app/services/axios";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";

// Only backend statuses!
const statusMap = {
  pending:       { label: "Pending",       color: "#38a0f7",  bg: "#e6f6ff" },
  reviewed:      { label: "Reviewed",      color: "#406087",  bg: "#e6eaff" },
  accepted:      { label: "Accepted",      color: "#10B981",  bg: "#dcfce7" },
  rejected:      { label: "Rejected",      color: "#EF4444",  bg: "#fde8e8" },
  disqualified:  { label: "Disqualified",  color: "#c026d3",  bg: "#f8edfc" },
};

export default function MyBidsPage() {
  const { api } = useApi();
  const router = useRouter();
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get("/bids/")
      .then(({ data }) => {
        setBids(Array.isArray(data) ? data : data.results || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] bg-[#fffce8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#08305e]" />
        <div className="mt-3 text-[#406087]">Loading your bids...</div>
      </div>
    );
  }

  if (bids.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Trophy className="w-14 h-14 text-[#b7c7de]" />
        <div className="mt-4 text-lg text-[#406087] font-semibold">No bids submitted yet</div>
        <div className="mt-1 text-[#b7c7de]">When you submit bids, you'll see them here.</div>
        <button
          onClick={() => router.push("/vendor/tenders")}
          className="mt-6 bg-[#38a0f7] hover:bg-[#256bb7] text-white font-bold px-6 py-2 rounded shadow"
        >
          Explore Tenders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-[#08305e] mb-8">My Bids</h1>
      <div className="space-y-6">
        {bids.map((bid) => {
          const tender = bid.tender;
          const statusObj = statusMap[bid.status] || statusMap.pending;
          const deadlinePassed = dayjs(tender.deadline).isBefore(dayjs());
          const tenderClosed = tender.status === "closed" || deadlinePassed;
          const canEdit = !tenderClosed; // Only if not closed

          return (
            <div
              key={bid.id}
              className="bg-[#08305e] border border-[#b7c7de] rounded-2xl p-6 shadow hover:shadow-lg transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-3">
                  <span className="rounded-full p-2" style={{ background: statusObj.bg }}>
                    <Briefcase className="w-5 h-5" style={{ color: statusObj.color }} />
                  </span>
                  <span className="text-xl font-semibold text-[#fffce8]">
                    {tender.title}
                  </span>
                  <span className="ml-4 px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{
                      background: statusObj.bg,
                      color: statusObj.color,
                      borderColor: statusObj.color,
                    }}
                  >
                    {statusObj.label}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-6 text-sm text-[#fffce8] mb-2">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Submitted: <span className="ml-1 text-[#08305e]">{dayjs(bid.submitted_at).format("MMM D, YYYY h:mm A")}</span>
                </div>
                <div className="flex items-center gap-1">
                  Status: <span className="ml-1">{statusObj.label}</span>
                </div>
                {bid.score && (
                  <div className="flex items-center gap-1">
                    Score: <span className="ml-1 text-[#406087] font-bold">{bid.score}</span>
                  </div>
                )}
              </div>
              {/* Documents */}
              {Array.isArray(bid.uploaded_documents) && bid.uploaded_documents.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {bid.uploaded_documents.map(doc => (
                    <a
                      key={doc.id}
                      href={doc.file}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1 text-xs rounded bg-[#f4f8ff] border border-[#b7c7de] hover:bg-[#e6f6ff] transition"
                    >
                      <FileText className="w-4 h-4" />
                      {doc.document_type}{doc.custom_document_name ? `: ${doc.custom_document_name}` : ""}
                    </a>
                  ))}
                </div>
              )}
              {/* Action Buttons */}
              <div className="flex flex-col gap-3 mt-6 ">
                <button
                    className={`bg-[#38a0f7] w-50 hover:bg-[#256bb7] text-white font-semibold px-5 py-2 rounded-lg shadow cursor-pointer`}
                    onClick={() => router.push(`/vendor/tenders/${tender.id}/application`)}
                    >
                    {canEdit ? "View / Update" : "View"}
                </button>
                <dvi>
                {canEdit ? (
                <p className="text-xs text-[#10B981] mt-2">You can update your bid while the tender is still open.</p>
                ) : (
                <p className="text-xs text-[#b7c7de] mt-2">This tender is closed. Your bid is view-only.</p>
                )}
                </dvi>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
