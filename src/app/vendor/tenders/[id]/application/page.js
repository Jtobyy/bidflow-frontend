"use client";
import React, { useEffect, useState } from "react";
import { Briefcase, FileCheck, Clock } from "lucide-react";
import { useApi } from "@/app/services/axios";
import { useRouter, useParams } from "next/navigation";
import dayjs from "dayjs";
import { useError } from "@/app/hooks/useError";
import { toast } from "react-toastify";

const statusMap = {
  open:    { label: "Open",   color: "#10B981", bg: "#dcfce7" },
  closed:  { label: "Closed", color: "#EF4444", bg: "#fde8e8" },
  draft:   { label: "Draft",  color: "#F59E0B", bg: "#FFFBEA" },
};

export default function BidApplicationPage() {
  const { id } = useParams(); // /vendor/tenders/[id]
  const { api } = useApi();
  const router = useRouter();
  const { handleApiError } = useError();

  // States
  const [tender, setTender] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    price: "",
    comments: "",
    files: {}, // {CAC: file, ...} for NEW uploads
    otherFiles: [], // [{file, customName}]
  });
  const [myBid, setMyBid] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Fetch tender details (with has_submitted_bid, my_bid_id)
  useEffect(() => {
    api.get(`/tenders/${id}/`)
      .then(({ data }) => {
        setTender(data);
        setLoading(false);
        if (data.has_submitted_bid && data.my_bid_id) {
          api.get(`/bids/${data.my_bid_id}/`).then(({ data: bid }) => {
            setMyBid(bid);
            setForm(f => ({
              ...f,
              price: bid.price || "",
              comments: bid.comments || "",
            }));
          });
        }
      })
      .catch(() => { setLoading(false); handleApiError(); });
  }, [id]);

  // Helper: Is the tender closed?
  const tenderIsClosed = tender &&
    (tender.status === "closed" || dayjs(tender.deadline).isBefore(dayjs()));

  // Helper: Can user update their bid?
  const userCanEdit = tender && tender.has_submitted_bid && !tenderIsClosed;

  // --- Handlers ---

  // Required doc file
  const handleFileChange = (docType, file) => {
    setForm(f => ({
      ...f,
      files: { ...f.files, [docType]: file }
    }));
  };

  // Other docs multi-upload
  const handleMultiOtherFiles = files => {
    setForm(f => ({
      ...f,
      otherFiles: [
        ...f.otherFiles,
        ...Array.from(files).map(file => ({ file, customName: "" }))
      ]
    }));
  };

  // Custom name per "Other" file
  const handleOtherDocNameChange = (idx, name) => {
    setForm(f => {
      const arr = [...f.otherFiles];
      arr[idx].customName = name;
      return { ...f, otherFiles: arr };
    });
  };

  // Comments & price
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  // Remove an 'Other' file before submitting
  const handleRemoveOtherFile = idx => {
    setForm(f => {
      const arr = [...f.otherFiles];
      arr.splice(idx, 1);
      return { ...f, otherFiles: arr };
    });
  };

  // Handle form (create/update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const data = new FormData();
      data.append("price", form.price);
      data.append("comments", form.comments);
      data.append("tender", id);

      // Required doc uploads
      if (tender && Array.isArray(tender.required_documents)) {
        tender.required_documents.forEach(docType => {
          if (form.files[docType]) {
            data.append("documents", form.files[docType], form.files[docType].name);
            data.append("documents[document_type]", docType);
          }
        });
      }

      // NEW 'Other' docs
      form.otherFiles.forEach(({ file, customName }) => {
        data.append("documents", file, file.name);
        data.append("documents[document_type]", "OTHER");
        data.append("documents[custom_document_name]", customName);
      });

      if (myBid && userCanEdit) {
        await api.patch(`/bids/${myBid.id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Bid updated successfully");
      } else {
        await api.post(`/bids/`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        toast.success("Bid submitted successfully");
      }
      router.push("/vendor/bids");
    } catch (err) {
      handleApiError(err);
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
      <div className="flex items-center justify-center h-full bg-[#fffce8]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-[#08305e]"></div>
      </div>
    );
  }

  const statusObj = statusMap[getTenderStatus(tender)] || statusMap.draft;
  const uploadedDocs = myBid?.uploaded_documents || [];
  const isLocked = !!myBid && !userCanEdit;
  const isSubmitDisabled = submitting || isLocked;

  console.log('uploaded docs ', uploadedDocs)
  // Button color
  const btnClass = isLocked
    ? "bg-[#b7c7de] text-[#406087] cursor-not-allowed"
    : "bg-[#38a0f7] hover:bg-[#256bb7] cursor-pointer text-white";

  // Button text
  let btnText = "Submit Bid";
  if (myBid && userCanEdit) btnText = submitting ? "Updating..." : "Update Your Bid";
  else if (isLocked) btnText = "Bid Locked";
  else if (submitting) btnText = "Submitting...";

  // UI: If user has already submitted a bid and can't edit
  if (tender.has_submitted_bid && !userCanEdit) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* ... tender details, unchanged ... */}
        <div className="mb-8 bg-[rgba(8,48,94,0.10)] border border-[#254c7c] rounded-xl px-6 py-6">
          {/* ... */}
        </div>
        <div className="bg-[#dcfce7] border border-[#10B981] rounded-xl p-6 text-center flex flex-col items-center">
          <FileCheck size={40} className="mb-2 text-[#10B981]" />
          <div className="text-lg font-bold text-[#08305e] mb-1">
            You&apos;ve already submitted a bid for this tender!
          </div>
          <div className="text-[#406087] mb-4">
            The tender is now closed. You cannot update your bid, but you can view your submission.
          </div>
          <button
            className="bg-[#38a0f7] hover:bg-[#256bb7] text-white font-semibold px-6 py-2 rounded cursor-pointer"
            onClick={() => router.push(`/vendor/bids/${tender.my_bid_id}`)}
          >
            View Your Bid
          </button>
        </div>
      </div>
    );
  }

  // Show form: Create or Update
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {/* Tender Details Header */}
      <div className="mb-8 bg-[rgba(8,48,94,0.10)] border border-[#254c7c] rounded-xl px-6 py-6">
        {/* ... same tender details as before ... */}
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

      <form
        onSubmit={handleSubmit}
        className="bg-[#fffce8] border border-[#254c7c] rounded-xl px-8 py-8 shadow-md space-y-6"
      >
        {/* Bid Price */}
        <div className="hidden">
          <label className="block mb-2 font-medium text-[#254c7c]">
            Bid Price
          </label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-[#08305e] text-[#08305e]"
            placeholder="Enter your bid price"
            required
            disabled={!userCanEdit && myBid}
          />
        </div>

        {/* Required Docs Upload */}
        {Array.isArray(tender.required_documents) && tender.required_documents.length > 0 && (
          <div>
            <label className="block mb-2 font-medium text-[#254c7c]">Upload Required Documents</label>
            <div className="grid gap-4 md:grid-cols-2">
              {tender.required_documents.map(docType => {
                // Find uploaded doc (not "OTHER")
                const uploadedDoc = uploadedDocs.find(doc => doc.document_type === docType);
                return (
                  <div key={docType} className="flex flex-col gap-1">
                    <span className="text-sm font-semibold text-[#08305e]">{docType}</span>
                    {uploadedDoc && (
                      <a
                        href={uploadedDoc.file}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-[#38a0f7] underline mb-1"
                      >
                        View Uploaded ({uploadedDoc.custom_document_name || docType})
                      </a>
                    )}
                    <input
                      type="file"
                      accept=".pdf,.jpg,.png"
                      onChange={e => handleFileChange(docType, e.target.files[0])}
                      className="block w-full text-sm text-[#08305e] bg-[#f4f8ff] border border-[#b7c7de] rounded"
                      disabled={!userCanEdit && myBid}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EXISTING 'Other' Docs */}
        {uploadedDocs.filter(doc => doc.document_type === "OTHER").length > 0 && (
          <div className="mt-4">
            <label className="block mb-2 font-medium text-[#254c7c]">Other Documents (Previously Uploaded)</label>
            {uploadedDocs.filter(doc => doc.document_type === "OTHER").map((doc, i) => (
              <div key={doc.id} className="flex flex-col gap-1 mt-2">
                <span className="text-sm font-semibold text-[#08305e]">
                  {doc.custom_document_name || "Other"}&nbsp;
                  <a href={doc.file} target="_blank" rel="noopener noreferrer" className="text-xs text-[#38a0f7] underline">(View)</a>
                </span>
              </div>
            ))}
          </div>
        )}

        {/* NEW 'Other' Docs */}
        <div className="mt-4">
          <label className="block mb-2 font-medium text-[#254c7c]">Add More Documents (Other)</label>
          <input
            type="file"
            multiple
            accept=".pdf,.jpg,.png"
            onChange={e => handleMultiOtherFiles(e.target.files)}
            className="block w-full text-sm text-[#08305e] bg-[#f4f8ff] border border-[#b7c7de] rounded"
            disabled={!userCanEdit && myBid}
          />
          {/* For each new OTHER file, specify name */}
          {form.otherFiles.map((fileObj, idx) => (
            <div key={idx} className="flex items-center gap-2 mt-1">
              <input
                type="text"
                placeholder="Custom Document Name"
                value={fileObj.customName}
                onChange={e => handleOtherDocNameChange(idx, e.target.value)}
                className="px-2 py-1 border rounded text-sm text-[#08305e]"
                disabled={!userCanEdit && myBid}
              />
              <span className="text-xs text-[#406087]">{fileObj.file?.name}</span>
              <button
                type="button"
                className="text-xs text-red-500 ml-2"
                onClick={() => handleRemoveOtherFile(idx)}
                disabled={!userCanEdit && myBid}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`${btnClass} font-bold px-6 py-2 rounded shadow`}
          >
            {btnText}
          </button>
        </div>
        <div className="mt-6 text-sm text-[#2b5f1b] bg-[#ebfaea] border-l-4 border-[#10B981] px-4 py-3 rounded">
          <strong>Info:</strong> You can re-upload any document to replace it, or add more supporting documents as needed. Existing uploads remain unless replaced or deleted.
        </div>
      </form>
    </div>
  );
}
