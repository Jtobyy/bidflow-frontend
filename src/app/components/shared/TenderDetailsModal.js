'use client';
import React, { useEffect, useState } from "react";
import Modal from "../shared/Modal";
import { FileText, Briefcase, Clock } from "lucide-react";
import { useApi } from "@/app/services/axios";
import dayjs from "dayjs";

const statusMap = {
  open:    { label: "Open",   color: "#10B981", bg: "#dcfce7" },
  closed:  { label: "Closed", color: "#EF4444", bg: "#fde8e8" },
  draft:   { label: "Draft",  color: "#F59E0B", bg: "#FFFBEA" },
};

export default function TenderDetailsModal({
  isOpen,
  onClose,
  tenderId,
  hasSubmittedBid,
  onApply,
}) {
  const { api } = useApi();
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch on open
  useEffect(() => {
    if (isOpen && tenderId) {
      setLoading(true);
      api.get(`/tenders/${tenderId}/`)
        .then(({ data }) => {
          setTender(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen, tenderId]);

  // Determine computed status (same as in list)
  const computedStatus = (() => {
    if (!tender) return "draft";
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
  })();

  const statusObj = statusMap[computedStatus];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tender?.title || "Tender Details"}
      width="600px"
      showFooter={false}
    >
      {loading || !tender ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#08305e]"></div>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 mb-3">
            <div className="flex items-center gap-3 cursor-pointer">
              <span className="rounded-full p-2" style={{ background: statusObj.bg }}>
                <Briefcase className="w-5 h-5" style={{ color: statusObj.color }} />
              </span>
              <span className="text-xl font-bold">{tender.title}</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm">
              <span className="font-medium text-[#08305e]">Procurer:</span>
              <span className="text-[#406087]">{tender.created_by?.company?.name || tender.created_by?.username || "-"}</span>
              <span className="font-medium ml-4 text-[#08305e]">Status:</span>
              <span
                className="px-3 py-1 rounded-full text-xs font-semibold border"
                style={{
                  background: statusObj.bg,
                  color: statusObj.color,
                  borderColor: statusObj.color,
                }}
              >
                {statusObj.label}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-sm ">
              <Clock className="w-4 h-4 " /> Deadline:{" "}
              <span className="font-semibold">{dayjs(tender.deadline).format("MMM D, YYYY h:mm A")}</span>
            </div>
          </div>
          <hr className="my-3 border-[#b7c7de]" />
          <div className="mb-5">
            <div className="font-semibold text-[#08305e] mb-1">Description</div>
            <div className="text-[#406087] whitespace-pre-line">{tender.description}</div>
          </div>
          <div className="mb-5">
            <div className="font-semibold text-[#08305e] mb-1">Required Documents</div>
            {Array.isArray(tender.required_documents) && tender.required_documents.length > 0 ? (
              <ul className="list-disc ml-6">
                {tender.required_documents.map((doc, idx) => (
                  <li key={idx}>{doc}</li>
                ))}
              </ul>
            ) : (
              <span className="text-[#b7c7de]">None</span>
            )}
          </div>
          {(tender.tender_document || tender.extra_documents) && (
            <div className="mb-5">
              <div className="font-semibold text-[#08305e] mb-1">Downloads</div>
              {tender.tender_document && (
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="w-4 h-4" />
                  <a
                    href={tender.tender_document}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-[#38a0f7] text-sm hover:text-[#08305e]"
                  >
                    Download Tender Document
                  </a>
                </div>
              )}
              {Array.isArray(tender.extra_documents)
                ? tender.extra_documents.map((file, i) =>
                    file ? (
                      <div className="flex items-center gap-2 mb-2" key={i}>
                        <FileText className="w-4 h-4" />
                        <a
                          href={file}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="underline text-[#38a0f7] text-sm hover:text-[#08305e]"
                        >
                          Download Extra Document {i + 1}
                        </a>
                      </div>
                    ) : null
                  )
                : tender.extra_documents && (
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      <a
                        href={tender.extra_documents}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-[#38a0f7] text-sm hover:text-[#08305e]"
                      >
                        Download Extra Document
                      </a>
                    </div>
                  )}
            </div>
          )}
          {/* Footer/Action */}
          <div className="flex flex-col gap-2 mt-4">
            {hasSubmittedBid ? (
              <button
                className="bg-[#b7c7de] text-[#406087] font-semibold py-2 rounded-lg"
                disabled
              >
                Bid Submitted
              </button>
            ) : computedStatus === "open" ? (
              <button
                className="bg-[#10B981] hover:bg-[#059669] text-white font-semibold py-2 rounded-lg cursor-pointer"
                onClick={onApply}
              >
                Apply
              </button>
            ) : (
              <button
                className="bg-[#fde8e8] text-[#EF4444] font-semibold py-2 rounded-lg"
                disabled
              >
                Closed
              </button>
            )}
          </div>
        </>
      )}
    </Modal>
  );
}
