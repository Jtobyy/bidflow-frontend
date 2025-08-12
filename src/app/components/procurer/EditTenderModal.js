// app/components/procurer/EditTenderModal.jsx
'use client';
import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../shared/Modal';
import { useApi } from '@/app/services/axios';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import CreatableSelect from 'react-select/creatable';
import { components as RSComponents } from 'react-select';

const SYSTEM_DOCS = [
  { label: 'Technical Proposal', value: 'TECHNICAL_PROPOSAL' },
  { label: 'Financial Proposal', value: 'FINANCIAL_PROPOSAL' },
  { label: 'CAC', value: 'CAC' },
  { label: 'TIN', value: 'TIN' },
  { label: 'TCC', value: 'TCC' },
  { label: 'ISO PECB', value: 'ISO_PECB' },
];

const selectStyles = {
  control: (base) => ({ ...base, borderColor: '#ccc', borderRadius: '6px', minHeight: '38px', backgroundColor: '#fffce8', color: '#08305e' }),
  singleValue: (base) => ({ ...base, color: '#08305e' }),
  menu: (base) => ({ ...base, backgroundColor: '#fffce8' }),
  option: (base, state) => ({ ...base, backgroundColor: state.isFocused ? '#a5b1b4' : '#fffce8', color: '#08305e' }),
};

export default function EditTenderModal({ isOpen, onClose, tenderId, onUpdated }) {
  const { api } = useApi();
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    deadline: '',
    submission_mode: 'TWO_ENVELOPE',
    required_documents: ['TECHNICAL_PROPOSAL', 'FINANCIAL_PROPOSAL'],
    custom_required_documents: [],
    tender_document: null,    // replace file
    extra_documents: [],      // replace/additional files
  });

  const PINNED = useMemo(() => new Set(['TECHNICAL_PROPOSAL', 'FINANCIAL_PROPOSAL']), []);
  const MultiValueRemove = (props) => {
    const v = props.data?.value;
    if (PINNED.has(v)) return null;
    return <RSComponents.MultiValueRemove {...props} />;
  };

  // Load existing tender data
  useEffect(() => {
    if (!isOpen || !tenderId) return;
    (async () => {
      setInitLoading(true);
      try {
        const { data } = await api.get(`/tenders/${tenderId}/`);
        const reqDocs = Array.isArray(data.required_documents) ? data.required_documents : [];
        const sys = reqDocs.filter(v => SYSTEM_DOCS.some(o => o.value === v));
        const custom = reqDocs.filter(v => !SYSTEM_DOCS.some(o => o.value === v));
        setForm({
          title: data.title || '',
          description: data.description || '',
          deadline: data.deadline ? dayjs(data.deadline).format('YYYY-MM-DDTHH:mm') : '',
          submission_mode: data.submission_mode || 'TWO_ENVELOPE',
          required_documents: Array.from(new Set([...sys, ...PINNED])),
          custom_required_documents: custom,
          tender_document: null,
          extra_documents: [],
        });
      } catch (e) {
        toast.error('Failed to load tender.');
        onClose?.();
      } finally {
        setInitLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, tenderId]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === 'file') {
      if (name === 'extra_documents') {
        setForm(f => ({ ...f, extra_documents: Array.from(files) }));
      } else {
        setForm(f => ({ ...f, [name]: files[0] }));
      }
    } else {
      setForm(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tenderId) return;
    setLoading(true);
    try {
      const data = new FormData();
      data.append('title', form.title);
      data.append('description', form.description);
      data.append('deadline', form.deadline ? dayjs(form.deadline).toISOString() : '');
      data.append('submission_mode', form.submission_mode);
      form.required_documents.forEach(v => data.append('required_documents', v));
      form.custom_required_documents.forEach(v => data.append('custom_required_documents', v));
      if (form.tender_document) data.append('tender_document', form.tender_document);
      form.extra_documents.forEach(file => data.append('extra_documents', file));

      await api.patch(`/tenders/${tenderId}/`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Tender updated.');
      onUpdated?.();
      onClose?.();
    } catch (e) {
      toast.error('Failed to update tender.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`View/Update Tender #${tenderId ?? ''}`}
      showFooter={false}
      width="700px"
    >
      {initLoading ? (
        <div className="py-16 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#08305e] mx-auto" />
        </div>
      ) : (
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
              <CreatableSelect
                isMulti
                options={SYSTEM_DOCS}
                value={[
                  ...SYSTEM_DOCS.filter(o => form.required_documents.includes(o.value) || ['TECHNICAL_PROPOSAL','FINANCIAL_PROPOSAL'].includes(o.value)),
                  ...(form.custom_required_documents?.map(name => ({ label: name, value: name })) ?? []),
                ]}
                onChange={(selected) => {
                  const PINNED = new Set(['TECHNICAL_PROPOSAL', 'FINANCIAL_PROPOSAL']);
                  const values = (selected || []).map(s => s.value);
                  const withPinned = Array.from(new Set([...values, ...PINNED]));
                  setForm(f => ({
                    ...f,
                    required_documents: withPinned.filter(v => SYSTEM_DOCS.some(o => o.value === v)),
                    custom_required_documents: withPinned.filter(v => !SYSTEM_DOCS.some(o => o.value === v)),
                  }));
                }}
                isClearable={false}
                closeMenuOnSelect={false}
                placeholder="Select or type to create…"
                isOptionDisabled={(option) => ['TECHNICAL_PROPOSAL','FINANCIAL_PROPOSAL'].includes(option.value)}
                menuPortalTarget={typeof window !== 'undefined' ? document.body : null}
                menuPosition="fixed"
                styles={{ ...selectStyles, menuPortal: (b) => ({ ...b, zIndex: 9999 }) }}
                components={{ MultiValueRemove }}
              />
              <p className="text-xs text-[#406087] mt-1">
                Technical & Financial are pinned and cannot be removed.
              </p>
            </div>

            <div>
              <label className="block font-medium mb-2">Replace Tender Document (PDF)</label>
              <input
                name="tender_document"
                type="file"
                accept=".pdf"
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
              />
              <p className="text-xs text-[#406087] mt-1">Leave empty to keep the current file.</p>
            </div>

            <div className="md:col-span-2">
              <label className="block font-medium mb-2">Add Extra Documents (PDFs)</label>
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
              {loading ? 'Saving…' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
