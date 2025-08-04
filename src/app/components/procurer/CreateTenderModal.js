'use client';
import React, { useState } from "react";
import Modal from "../shared/Modal";
import { useApi } from "@/app/services/axios";
import { toast } from "react-toastify";
import dayjs from "dayjs";
import Select from "react-select";


const DOCUMENT_OPTIONS = [
  { label: "CAC", value: "CAC" },
  { label: "TIN", value: "TIN" },
  { label: "TCC", value: "TCC" },
  { label: "ISO_PECB", value: "ISO_PECB" },
  { label: "BID", value: "BID", isDisabled: true },
];

const selectStyles = {
    control: (base) => ({
      ...base,
      borderColor: "#ccc",
      borderRadius: "6px",
      minHeight: "38px",
      backgroundColor: "#fffce8",
      color: "#08305e",
    }),
    singleValue: (base) => ({
      ...base,
      color: "#08305e",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: "#fffce8",
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused
          ? "#a5b1b4"
          : "#fffce8",
      color: "#08305e",
    }),
};

export default function CreateTenderModal({ isOpen, onClose, onCreated }) {
  const { api } = useApi();
  const [form, setForm] = useState({
    title: "",
    description: "",
    deadline: "",
    required_documents: ["BID"],
    tender_document: null,
    extra_documents: []
  });
  const [loading, setLoading] = useState(false);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      if (name === "extra_documents") {
        setForm(f => ({
          ...f,
          extra_documents: Array.from(files)
        }));
      } else {
        setForm(f => ({
          ...f,
          [name]: files[0]
        }));
      }
    } else {
      setForm(f => ({
        ...f,
        [name]: value
      }));
    }
  };

  // Handle multi-select
  const handleDocumentsChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
    setForm(f => ({ ...f, required_documents: options }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", form.title);
      data.append("description", form.description);
      data.append("deadline", form.deadline ? dayjs(form.deadline).toISOString() : "");
      form.required_documents.forEach(doc => data.append("required_documents", doc));
      if (form.tender_document) data.append("tender_document", form.tender_document);
      form.extra_documents.forEach(file => data.append("extra_documents", file));

      await api.post("/tenders/", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Tender created successfully!");
      onClose();
      if (onCreated) onCreated();
    } catch (error) {
      toast.error("Failed to create tender.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="New Tender"
      showFooter={false}
      width="700px"
    >
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block font-medium mb-2">Title</label>
            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
              placeholder="Tender title"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Deadline</label>
            <input
              name="deadline"
              type="datetime-local"
              value={form.deadline}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              required
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium mb-2">Description</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              rows={3}
              required
              placeholder="Tender description"
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Required Documents</label>
            <Select
                isMulti
                options={DOCUMENT_OPTIONS}
                value={DOCUMENT_OPTIONS.filter(
                    (opt) => form.required_documents.includes(opt.value) || opt.value === "BID"
                )}
                onChange={(selected) => {
                    // Always include BID in value
                    setForm((f) => ({
                    ...f,
                    required_documents: [
                        ...selected.map((s) => s.value).filter((v) => v !== "BID"),
                        "BID"
                    ],
                    }));
                }}
                closeMenuOnSelect={false}
                isOptionDisabled={(option) => option.value === "BID"}
                className="react-select-container"
                classNamePrefix="react-select"
                styles={selectStyles}
            />
          </div>
          <div>
            <label className="block font-medium mb-2">Tender Document (PDF)</label>
            <input
              name="tender_document"
              type="file"
              accept=".pdf"
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block font-medium mb-2">Extra Documents (PDFs)</label>
            <input
              name="extra_documents"
              type="file"
              multiple
              accept=".pdf"
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
            />
          </div>
        </div>
        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={loading}
            className="bg-[#38a0f7] hover:bg-[#256bb7] cursor-pointer text-white font-bold px-6 py-2 rounded shadow"
          >
            {loading ? "Creating..." : "Create Tender"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
