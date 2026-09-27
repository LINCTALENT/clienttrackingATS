import React, { useState } from 'react';
import { Company, Job, Candidate } from '../../types';
import { Plus, Building2, Trash2, Edit2, X, Briefcase, Users, Mail, MapPin } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

interface AdminCompaniesProps {
  companies: Company[];
  jobs: Job[];
  candidates: Candidate[];
  onCompanyChange: () => void;
  onFilterCandidatesByCompany: (companyId: string) => void;
}

export const AdminCompanies: React.FC<AdminCompaniesProps> = ({
  companies,
  jobs,
  candidates,
  onCompanyChange,
  onFilterCandidatesByCompany,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [deletingCompany, setDeletingCompany] = useState<{ id: string; name: string } | null>(null);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [contactEmail, setContactEmail] = useState('');

  const handleOpenAdd = () => {
    setCompanyName('');
    setIndustry('');
    setLocation('');
    setContactEmail('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (comp: Company) => {
    setEditingCompany(comp);
    setCompanyName(comp.companyName);
    setIndustry(comp.industry);
    setLocation(comp.location);
    setContactEmail(comp.contactEmail || '');
  };

  const handleAddCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    StorageService.addCompany({
      companyName: companyName.trim(),
      industry: industry.trim() || 'General Business',
      location: location.trim() || 'Jakarta',
      contactEmail: contactEmail.trim() || 'contact@company.com',
    });

    setShowAddModal(false);
    onCompanyChange();
  };

  const handleUpdateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCompany || !companyName.trim()) return;

    StorageService.updateCompany(editingCompany.id, {
      companyName: companyName.trim(),
      industry: industry.trim() || 'General Business',
      location: location.trim() || 'Jakarta',
      contactEmail: contactEmail.trim(),
    });

    setEditingCompany(null);
    onCompanyChange();
  };

  const handleConfirmDeleteCompany = () => {
    if (!deletingCompany) return;
    StorageService.deleteCompany(deletingCompany.id);
    setDeletingCompany(null);
    onCompanyChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-neutral-900">Perusahaan Klien</h2>
          <p className="text-xs text-neutral-500 font-normal mt-0.5">
            Daftar korporasi mitra Linchub untuk penugasan rekrutmen dan Client Portal.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-3 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 font-medium cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Tambah Perusahaan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {companies.map((comp) => {
          const compJobs = jobs.filter((j) => j.companyId === comp.id);
          const compCandidates = candidates.filter((c) => c.companyId === comp.id);

          return (
            <div
              key={comp.id}
              className="p-4 bg-white rounded-lg border border-neutral-100 flex flex-col justify-between space-y-3 hover:border-neutral-200 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded bg-neutral-50 border border-neutral-200 flex items-center justify-center text-neutral-600">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-medium text-neutral-900 text-xs leading-tight">
                        {comp.companyName}
                      </h3>
                      <div className="text-[11px] text-neutral-400 font-normal">
                        {comp.industry}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Hapus */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(comp)}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                      title="Edit perusahaan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeletingCompany({ id: comp.id, name: comp.companyName })}
                      className="p-1 rounded text-neutral-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus perusahaan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-neutral-500 font-normal">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{comp.location}</span>
                  </div>
                  {comp.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{comp.contactEmail}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-normal">
                <div className="flex items-center gap-3 text-neutral-600">
                  <span className="flex items-center gap-1 font-mono">
                    <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{compJobs.length} Job</span>
                  </span>
                  <span className="flex items-center gap-1 font-mono">
                    <Users className="w-3.5 h-3.5 text-neutral-400" />
                    <span>{compCandidates.length} CDD</span>
                  </span>
                </div>

                <button
                  onClick={() => onFilterCandidatesByCompany(comp.id)}
                  className="text-xs text-neutral-900 font-medium hover:underline cursor-pointer"
                >
                  Lihat Kandidat →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Company Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl w-full max-w-md p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-medium text-neutral-900">
                Tambah Perusahaan Klien
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddCompany} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nama Perusahaan *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Contoh: PT Solusi Fintek Digital"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Bidang Industri
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  placeholder="Contoh: Financial Services & Banking"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Lokasi / Kantor
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Jakarta Selatan"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Kontak HRD
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="hrd@perusahaan.com"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 font-medium cursor-pointer"
                >
                  Simpan Perusahaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {editingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl w-full max-w-md p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-medium text-neutral-900">
                Edit Perusahaan Klien
              </h3>
              <button
                onClick={() => setEditingCompany(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCompany} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nama Perusahaan *
                </label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Nama Perusahaan"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Bidang Industri
                </label>
                <input
                  type="text"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Lokasi / Kantor
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email Kontak HRD
                </label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="px-3 py-1.5 text-xs rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 font-medium cursor-pointer"
                >
                  Perbarui Perusahaan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingCompany}
        title="Hapus Perusahaan Klien"
        message="Apakah Anda yakin ingin menghapus perusahaan ini? Seluruh lowongan pekerjaan, kandidat, dan catatan aktivitas yang terhubung dengan perusahaan ini akan terhapus secara permanen dari sistem."
        itemName={deletingCompany?.name}
        confirmLabel="Hapus Perusahaan"
        onConfirm={handleConfirmDeleteCompany}
        onCancel={() => setDeletingCompany(null)}
      />
    </div>
  );
};
