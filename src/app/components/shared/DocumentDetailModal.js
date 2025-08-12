"use client";
import React, { useEffect, useState } from "react";
import Modal from "@/app/components/shared/Modal";
import dayjs from "dayjs";
import { useApi } from "@/app/services/axios";
import { toast } from "react-toastify";
import { FileDown, CheckCircle2, XCircle, Clock, ShieldCheck, RotateCcw } from "lucide-react";

const statusMap = {
  pending: { label: "Pending", color: "#F59E0B", icon: Clock },
  verified: { label: "Verified", color: "#10B981", icon: ShieldCheck },
  failed:   { label: "Failed",   color: "#EF4444", icon: XCircle },        // ✅ add
  verification_failed: { label: "Failed", color: "#EF4444", icon: XCircle }, // legacy alias
  expired_certificate: { label: "Expired", color: "#EF4444", icon: XCircle },
  analyzed: { label: "Analyzed", color: "#38a0f7", icon: FileDown },
};

const normalizeStatus = (s) => {
  const v = String(s || "").toLowerCase();
  if (v === "verification_failed") return "failed";
  if (!statusMap[v]) return "pending";
  return v;
};

export default function DocumentDetailModal({ isOpen, onClose, docId, onUpdated }) {
  const { api } = useApi();
  const [loading, setLoading] = useState(false);
  const [doc, setDoc] = useState(null);

  const loadDoc = async () => {
    if (!docId) return;
    try {
      setLoading(true);
      const { data } = await api.get(`/bids-documents/${docId}/`);
      setDoc(data);
    } catch {
      toast.error("Failed to load document.");
      onClose?.();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (isOpen) loadDoc(); }, [isOpen, docId]);

  const doAction = async (action) => {
    if (!doc) return;
    try {
      setLoading(true);
      let data;
      if (action === "verify") {
        ({ data } = await api.post(`/bids-documents/${doc.id}/verify/`));
      } else if (action === "fail") {
        ({ data } = await api.post(`/bids-documents/${doc.id}/fail/`));
      } else if (action === "pending") {
        ({ data } = await api.patch(`/bids-documents/${doc.id}/`, { verification_status: "pending" }));
      }
      if (data) setDoc(data);

      toast.success(
        action === "verify" ? "Document verified." :
        action === "fail"   ? "Document marked as failed." :
                              "Document set back to pending."
      );
      onUpdated?.(); // refresh the list page
    } catch {
      toast.error("Update failed.");
    } finally {
      setLoading(false);
    }
  };

  const StatusPill = ({ value }) => {
    const key = normalizeStatus(value);
    const meta = statusMap[key] || statusMap.pending;
    const Icon = meta.icon || Clock;
    return (
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border"
        style={{ color: meta.color, borderColor: meta.color }}
      >
        <Icon size={14} /> {meta.label}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Document #${docId ?? ""}`}
      width="800px"
      showFooter
      footer={
        <div className="flex gap-2">
          <button
            onClick={() => doAction("pending")}
            disabled={loading}
            className="px-4 py-2 rounded cursor-pointer border text-[#08305e] hover:bg-[#08305e]/10 flex items-center gap-2"
          >
            <RotateCcw size={16} /> Set Pending
          </button>
          <button
            onClick={() => doAction("fail")}
            disabled={loading}
            className="px-4 py-2 rounded cursor-pointer bg-red-600 text-white hover:bg-red-700 flex items-center gap-2"
          >
            <XCircle size={16} /> Fail
          </button>
          <button
            onClick={() => doAction("verify")}
            disabled={loading}
            className="px-4 py-2 rounded cursor-pointer bg-[#3EBF0F] text-white hover:bg-green-600 flex items-center gap-2"
          >
            <CheckCircle2 size={16} /> Verify
          </button>
        </div>
      }
    >
      {loading || !doc ? (
        <div className="py-10 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#08305e] mx-auto" />
        </div>
      ) : (
        <div className="space-y-5">
          {/* Top: core info */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-bold text-[#08305e]">
                {doc.custom_document_name || doc.document_type}
              </div>
              <div className="text-sm text-[#406087]">
                Uploaded {dayjs(doc.uploaded_at).format("MMM D, YYYY h:mm A")}
              </div>
            </div>
            <StatusPill value={doc.verification_status} />
          </div>

          {/* Bid context (with links) */}
          {doc.bid && (
            <div className="rounded-lg border p-3 bg-[#fffce8]">
              <div className="text-sm font-semibold text-[#08305e] mb-1">Bid</div>
              <div className="text-sm text-[#08305e]">
                #{doc.bid.id} — {doc.bid.company?.name || doc.bid.submitted_by?.username || "—"}
              </div>
              <div className="text-xs text-[#406087]">
                Tender: {doc.bid.tender?.title} (#{doc.bid.tender?.id})
              </div>
            </div>
          )}

          {/* Open file */}
          <div>
            <a
              href={doc.file}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 py-2 rounded border cursor-pointer text-sm text-[#08305e] hover:bg-[#08305e]/10"
            >
              <FileDown size={16} /> Open File
            </a>
          </div>

          {/* Humanized summary */}
          {doc.report_text && (
            <div>
              <div className="text-sm font-bold text-[#08305e] mb-2">Summary</div>
              <pre className="bg-white/70 p-3 rounded border overflow-x-auto whitespace-pre-wrap text-sm">
                {doc.report_text}
              </pre>
            </div>
          )}

          {/* Raw JSON (toggle) */}
          {doc.extracted_data && (
            <details className="mt-2">
              <summary className="text-xs text-[#406087] font-semibold cursor-pointer">Raw details (JSON)</summary>
              <pre className="mt-2 text-xs bg-[#fffce8] p-2 rounded border overflow-x-auto">
                {JSON.stringify(doc.extracted_data, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </Modal>
  );
}
