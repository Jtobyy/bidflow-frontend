"use client";
import React, { useEffect, useState } from "react";
import { Briefcase, FileCheck, Clock } from "lucide-react";
import { useApi } from "@/app/services/axios";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";

// Color map for status
const statusMap = {
  open:    { label: "Open",   color: "#10B981", bg: "#dcfce7" },
  closed:  { label: "Closed", color: "#EF4444", bg: "#fde8e8" },
  draft:   { label: "Draft",  color: "#F59E0B", bg: "#FFFBEA" },
};

export default function BidApplicationPage() {
  const { id } = useParams(); // /vendor/tenders/[id]
  const { api } = useApi();
  const router = useRouter();

  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    price: "",
    comments: "",
    files: {}, // e.g. {CAC: file, TIN: file, ...}
  });
  const [submitting, setSubmitting] = useState(false);

  // Fetch tender details
  useEffect(() => {
    api.get(`/tenders/${id}/`)
      .then(({ data }) => {
        setTender(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  // Handle file upload changes for each doc type
  const handleFileChange = (docType, file) => {
    setForm(f => ({
      ...f,
      files: { ...f.files, [docType]: file }
    }));
  };

  // Handle other field changes
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("price", form.price);
      data.append("comments", form.comments);

      // Append required document files
      if (tender && Array.isArray(tender.required_documents)) {
        tender.required_documents.forEach(docType => {
          if (form.files[docType]) {
            data.append("documents", form.files[docType], form.files[docType].name);
          }
        });
      }

      await api.post(`/bids/`, data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      router.push("/vendor/bids"); // or show a toast/notification
    } catch (err) {
      alert("Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Utility: Status display
  const getTenderStatus = (tender) => {
    if (!tender) return "draft";
    if (
      tender.status === "closed" ||
      (tender.status === "published" && dayjs(tender.deadline).isBefore(dayjs()))
    ) return "closed";
    if (tender.status === "published" && dayjs(tender.deadline).isAfter(dayjs())) return "open";
    return tender.status;
  };

  // LOADING STATE
  if (loading || !tender) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#fffce8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#08305e]"></div>
      </div>
    );
  }

  const statusObj = statusMap[getTenderStatus(tender)] || statusMap.draft;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Tender Details Header */}
      <div className="mb-8 bg-[#f4f8ff] border border-[#254c7c] rounded-xl px-6 py-6">
        <h1 className="text-2xl font-bold mb-1 text-[#08305e]">{tender.title}</h1>
        <div className="flex flex-wrap items-center gap-6 text-[#406087] text-sm mb-2">
          <div className="flex items-center gap-1">
            <Briefcase size={18} /> Procurer:
            <span className="font-semibold text-[#08305e] ml-1">{tender.company?.name || tender.procurer_name || "-"}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock size={16} />
            Deadline: <span className="font-semibold text-[#08305e] ml-1">{dayjs(tender.deadline).format("MMM D, YYYY")}</span>
          </div>
          <div>
            <span
              className="px-3 py-1 rounded-full text-xs font-semibold border"
              style={{
                background: statusObj.bg,
                color: statusObj.color,
                borderColor: statusObj.color
              }}
            >
              {statusObj.label}
            </span>
          </div>
        </div>
        <div className="mb-3 text-[#08305e]">{tender.description}</div>

        {/* Download tender documents if available */}
        {tender.tender_document && (
          <div className="mb-2">
            <a
              href={tender.tender_document}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#38a0f7] hover:underline text-sm"
            >
              Download Tender Document (PDF)
            </a>
          </div>
        )}
      </div>

      {/* Application Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-[#fffce8] border border-[#254c7c] rounded-xl px-8 py-8 shadow-md space-y-6"
      >
        {/* Bid Price */}
        <div>
          <label className="block mb-2 font-medium text-[#254c7c]">Bid Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#08305e] text-[#08305e]"
            placeholder="Enter your bid price"
            required
          />
        </div>

        {/* Required Docs Upload */}
        {Array.isArray(tender.required_documents) && tender.required_documents.length > 0 && (
          <div>
            <label className="block mb-2 font-medium text-[#254c7c]">Upload Required Documents</label>
            <div className="grid gap-4 md:grid-cols-2">
              {tender.required_documents.map(docType => (
                <div key={docType} className="flex flex-col gap-1">
                  <span className="text-sm font-semibold text-[#08305e]">{docType}</span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={e => handleFileChange(docType, e.target.files[0])}
                    className="block w-full text-sm text-[#08305e] bg-[#f4f8ff] border border-[#b7c7de] rounded"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div>
          <label className="block mb-2 font-medium text-[#254c7c]">Comments/Notes (optional)</label>
          <textarea
            name="comments"
            value={form.comments}
            onChange={handleChange}
            rows={3}
            className="w-full px-4 py-2 border rounded focus:outline-none text-[#08305e]"
            placeholder="Add any comments or extra info here..."
          />
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#38a0f7] hover:bg-[#256bb7] cursor-pointer text-white font-bold px-6 py-2 rounded shadow"
          >
            {submitting ? "Submitting..." : "Submit Bid"}
          </button>
        </div>
      </form>
    </div>
  );
}
