"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useApi } from "@/app/services/axios";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import ConfirmDialog from "@/app/components/shared/ConfirmDialog";
import {
  ArrowLeft, CheckCircle2, XCircle, FileDown, Play, Building2, BadgeCheck, FileText, ShieldCheck
} from "lucide-react";

const badge = (text, color, bg) => (
  <span
    className="px-2 py-0.5 rounded-full text-xs font-semibold border"
    style={{ color, background: bg, borderColor: color }}
  >
    {text}
  </span>
);

export default function BidDetailsPage() {
  const { id } = useParams();               // /procurer/bids/[id]
  const router = useRouter();
  const { api } = useApi();

  const [loading, setLoading] = useState(true);
  const [bid, setBid] = useState(null);
  const [docs, setDocs] = useState([]);
  const [compliance, setCompliance] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const statusMap = useMemo(() => ({
    pending:   { label: "Pending",    color: "#F59E0B", bg: "#FFFBEA" },
    reviewed:  { label: "Reviewed",   color: "#38a0f7", bg: "#e6f2fe" },
    accepted:  { label: "Accepted",   color: "#3EBF0F", bg: "#dcfce7" },
    rejected:  { label: "Rejected",   color: "#EF4444", bg: "#fde8e8" },
    disqualified: { label: "Disqualified", color: "#A855F7", bg: "#F3E8FF" },
  }), []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/bids/${id}/`);
        if (!mounted) return;

        setBid(data);
        setDocs(Array.isArray(data.documents) ? data.documents : (data.uploaded_documents || []));
        setCompliance(data.compliance || null);
      } catch {
        toast.error("Failed to load bid.");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const refreshBid = async () => {
    const { data } = await api.get(`/bids/${id}/`);
    setBid(data);
    setDocs(Array.isArray(data.documents) ? data.documents : (data.uploaded_documents || []));
  };


  const verifyDoc = async (id) => {
    try {
      await await api.post(`/bids-documents/${id}/verify/`);
      setDocs(prev => prev.map(d => d.id === id ? { ...d, verification_status: "verified" } : d));
      await refreshBid();
      toast.success("Document verified.");
    } catch {
      toast.error("Failed to verify document.");
    }
  };
  
  const failDoc = async (id) => {
    try {
      await api.post(`/bids-documents/${id}/fail/`);
      setDocs(prev => prev.map(d => d.id === id ? { ...d, verification_status: "failed" } : d));
      await refreshBid();
      toast.success("Marked as failed.");
    } catch {
      toast.error("Failed to update document.");
    }
  };

  const runCompliance = async () => {
    try {
      const { data } = await api.post(`/bids/${id}/generate_report/`);
      setCompliance(data);
      toast.success("Compliance run complete.");
      // optionally refresh bid score/rank if your action updates them
      await refreshBid();
    } catch {
      toast.error("Compliance run failed.");
    }
  };

  const deleteBid = async () => {
    setDeleting(true);
    try {
      await api.delete(`/bids/${id}/`);
      toast.success("Bid deleted.");
      router.push("/procurer/bids");
    } catch {
      toast.error("Delete failed.");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
    }
  };

  const DocBadge = ({ status }) => {
    if (status === "verified")  return badge("Verified",  "#3EBF0F", "#dcfce7");
    if (status === "failed")    return badge("Failed",    "#EF4444", "#fde8e8");
    return badge("Pending", "#F59E0B", "#FFFBEA");
  };

  return (
    <div className="px-8 py-8">
      <button
        onClick={() => router.back()}
        className="mb-4 text-[#38a0f7] hover:underline cursor-pointer flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header */}
      <div className="rounded-xl shadow bg-[#08305e] text-[#fffce8] border border-[#254c7c] p-6 mb-6">
        {loading || !bid ? (
          <div className="py-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#fffce8] mx-auto" />
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-start gap-4">
              {bid.company?.logo ? (
                <img
                    src={bid.company.logo}
                    alt={bid.company?.name || "Company logo"}
                    className="w-12 h-12 rounded-full object-cover border bg-[#fffce8]"
                />
                ) : (
                <div className="w-12 h-12 rounded-full bg-[#08305e] border grid place-items-center">
                    <Building2 className="w-6 h-6 text-[#fffce8]" />
                </div>
                )}

              <div>
                <div className="text-2xl font-extrabold text-[#fffce8]">
                  {bid.company?.name || bid.submitted_by?.username || "Bid"}
                </div>
                <div className="text-sm text-[#fffce8]">
                  For tender: <span className="font-semibold">{bid.tender?.title}</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {badge(statusMap[bid.status]?.label || bid.status, statusMap[bid.status]?.color, statusMap[bid.status]?.bg)}
                  {typeof bid.score === "number" && badge(`Score: ${bid.score}`, "#38a0f7", "#e6f2fe")}
                  {typeof bid.rank === "number" && badge(`Rank: ${bid.rank}`, "#6B7280", "#F3F4F6")}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={runCompliance}
                className="flex items-center gap-2 cursor-pointer bg-[#38a0f7] text-white rounded-lg px-4 py-2 font-semibold shadow hover:bg-[#256bb7]"
              >
                <Play className="w-4 h-4" /> Run Compliance
              </button>
              <button
                onClick={() => setConfirmOpen(true)}
                className="flex items-center gap-2 cursor-pointer bg-red-600 text-white rounded-lg px-4 py-2 font-semibold shadow hover:bg-red-700"
              >
                <XCircle className="w-4 h-4" /> Delete Bid
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two-column content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Overview */}
        <div className="lg:col-span-1 rounded-xl shadow border bg-[#08305e] border-[#254c7c] p-6">
          <h3 className="text-lg font-bold text-[#fffce8] mb-4">Overview</h3>
          {loading || !bid ? (
            <div className="text-[#fffce8]">Loading…</div>
          ) : (
            <div className="space-y-3 text-sm">
              <KV label="Company" value={bid.company?.name || "—"} />
              <KV label="Tender" value={bid.tender?.title || "—"} />
              <KV label="Submitted By" value={bid.submitted_by?.username || "—"} />
              <KV label="Submitted At" value={dayjs(bid.submitted_at).format("MMM D, YYYY h:mm A")} />
              <KV label="Est. Price" value={bid.price ? `₦${Number(bid.price).toLocaleString()}` : "—"} />
              <KV label="Status" value={statusMap[bid.status]?.label || bid.status} />
              <KV label="Score" value={bid.score ?? "—"} />
              <KV label="Rank" value={bid.rank ?? "—"} />
              <KV label="Submission Mode" value={bid.tender?.submission_mode || "—"} />
              {Array.isArray(bid.tender?.required_documents) && (
                <KV
                  label="Required Docs"
                  value={bid.tender.required_documents.join(", ") || "—"}
                />
              )}
              <KV
                label="Last Compliance Run"
                value={compliance?.verified_at
                  ? dayjs(compliance.verified_at).format("MMM D, YYYY h:mm A")
                  : "—"}
              />
            </div>
          )}
        </div>

        {/* Right: Documents & Compliance */}
        <div className="lg:col-span-2 space-y-6">
          {/* Documents */}
          <div className="rounded-xl shadow bg-[#fffce8] border border-[#254c7c] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#08305e] flex items-center gap-2">
                <FileText className="w-5 h-5" /> Documents
              </h3>
              <span className="text-sm text-[#406087]">{docs.length} file(s)</span>
            </div>

            {docs.length === 0 ? (
              <div className="text-[#406087] text-sm">No documents uploaded.</div>
            ) : (
              <div className="space-y-3">
                {docs.map((d) => (
                  <div key={d.id} className="border rounded-lg p-3 bg-[#fffce8] border-[#254c7c]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-semibold text-[#08305e] truncate">
                          {labelForDoc(d)}
                        </div>
                        <div className="text-xs text-[#08305e]">
                          Uploaded {dayjs(d.uploaded_at).format("MMM D, YYYY h:mm A")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DocBadge status={d.verification_status} />
                        <a
                          href={d.file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1 rounded border cursor-pointer flex items-center gap-1 text-sm text-[#08305e] hover:bg-[#08305e]/10"
                        >
                          <FileDown className="w-4 h-4" /> Open
                        </a>
                        <button
                          onClick={() => verifyDoc(d.id)}
                          disabled={d.verification_status === "verified"}
                          className="px-3 py-1 rounded cursor-pointer flex items-center gap-1 text-sm text-white bg-[#3EBF0F] hover:bg-green-600 disabled:opacity-50"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Verify
                        </button>
                        <button
                          onClick={() => failDoc(d.id)}
                          className="px-3 py-1 rounded cursor-pointer flex items-center gap-1 text-sm text-white bg-red-600 hover:bg-red-700"
                        >
                          <XCircle className="w-4 h-4" /> Fail
                        </button>
                      </div>
                    </div>
                    {/* <pre className="mt-3 text-xs bg-[#fffce8]  p-2 rounded border overflow-x-auto"> */}

                    {/* Inside your doc card */}
                        {d.report_text && (
                        <div className="mt-3 text-sm bg-[#fffce8] text-[#406087] font-bold p-3 rounded border whitespace-pre-wrap">
                            {d.report_text}
                        </div>
                        )}

                        {/* Optional: keep JSON collapsed or behind a toggle */}
                        {d.extracted_data && (
                        <details className="mt-2">
                            <summary className="text-xs  text-[#406087] font-bold cursor-pointer">Raw details (JSON)</summary>
                            <pre className="mt-2 text-xs text-[#406087] font-bold bg-[#fffce8] p-2 rounded border overflow-x-auto">
                            {JSON.stringify(d.extracted_data, null, 2)}
                            </pre>
                        </details>
                        )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compliance */}
          <div className="rounded-xl shadow bg-[#fffce8] border border-[#254c7c] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#08305e] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" /> Compliance Report
              </h3>
              <span className="text-xs text-[#406087] font-semibold">
                {compliance?.verified_at
                  ? `Last run: ${dayjs(compliance.verified_at).format("MMM D, YYYY h:mm A")}`
                  : "No report yet"}
              </span>
            </div>
            {!compliance ? (
              <div className="text-[#406087] text-sm">
                Run a compliance check to view results.
              </div>
            ) : (
              <div className="space-y-2 text-sm">
                {"is_compliant" in compliance && (
                  <div>
                    {compliance.is_compliant
                      ? badge("Compliant", "#3EBF0F", "#dcfce7")
                      : badge("Not Compliant", "#EF4444", "#fde8e8")}
                  </div>
                )}
                
                <pre className="bg-[#fffce8] text-[#406087] border-[#254c7c] font-bold p-3 rounded border mt-5 overflow-x-auto">
                  {compliance.report_text}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={confirmOpen}
        onClose={() => !deleting && setConfirmOpen(false)}
        title="Delete this bid?"
        message={
          <>This will permanently delete this bid and its documents. This action cannot be undone.</>
        }
        confirmText="Delete"
        cancelText="Cancel"
        danger
        loading={deleting}
        onConfirm={deleteBid}
      />
    </div>
  );
}

function KV({ label, value }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-[#fffce8]">{label}</span>
      <span className="font-medium text-[#fffce8] text-right">{String(value)}</span>
    </div>
  );
}

function labelForDoc(d) {
  if (d.document_type === "OTHER" && d.custom_document_name) return d.custom_document_name;
  if (d.document_type === "TECHNICAL_PROPOSAL") return "Technical Proposal";
  if (d.document_type === "FINANCIAL_PROPOSAL") return "Financial Proposal";
  return d.document_type || "Document";
}
