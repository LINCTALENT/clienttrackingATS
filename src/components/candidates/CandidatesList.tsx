import React, { useState } from 'react';
import { Candidate, Company, Job, User, PipelineStage, PreliminaryStatus } from '../../types';
import { StageBadge, PreliminaryBadge, AIRecommendationBadge } from '../common/StatusBadge';
import {
  Search,
  Plus,
  Sparkles,
  Building2,
  ChevronRight,
  Filter,
  User as UserIcon,
  Edit2,
  Trash2,
  X,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

interface CandidatesListProps {
  candidates: Candidate[];
  companies: Company[];
  jobs: Job[];
  currentUser: User;
  onSelectCandidate: (candidate: Candidate) => void;
  onOpenAddModal: () => void;
  onCandidateChange?: () => void;
}

export const CandidatesList: React.FC<CandidatesListProps> = ({
  candidates,
  companies,
  jobs,
  currentUser,
  onSelectCandidate,
  onOpenAddModal,
  onCandidateChange,
}) => {
  const isClient = currentUser.role === 'client';
  const isAdminOrRecruiter = currentUser.role === 'admin' || currentUser.role === 'recruiter';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>(
    isClient && currentUser.companyId ? currentUser.companyId : 'all'
  );
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedJobId, setSelectedJobId] = useState<string>('all');

  // Delete Candidate Modal State
  const [deletingCandidate, setDeletingCandidate] = useState<Candidate | null>(null);

  // Edit Candidate Modal State
  const [editingCandidate, setEditingCandidate] = useState<Candidate | null>(null);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCompanyId, setEditCompanyId] = useState('');
  const [editJobId, setEditJobId] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [editStatus, setEditStatus] = useState<PipelineStage>('Applied');
  const [editPrelimScore, setEditPrelimScore] = useState<number>(0);
  const [editPrelimStatus, setEditPrelimStatus] = useState<PreliminaryStatus>('Pending');
  const [editPrelimNotes, setEditPrelimNotes] = useState('');

  const handleOpenEdit = (cdd: Candidate, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingCandidate(cdd);
    setEditFullName(cdd.fullName);
    setEditEmail(cdd.email);
    setEditPhone(cdd.phone);
    setEditCompanyId(cdd.companyId);
    setEditJobId(cdd.jobId);
    setEditPosition(cdd.position);
    setEditStatus(cdd.status);
    setEditPrelimScore(cdd.preliminaryScore ?? 0);
    setEditPrelimStatus(cdd.preliminaryStatus || 'Pending');
    setEditPrelimNotes(cdd.preliminaryNotes || '');
  };

  const handleUpdateCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCandidate || !editFullName.trim()) return;

    StorageService.updateCandidate(editingCandidate.id, {
      fullName: editFullName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      companyId: editCompanyId,
      jobId: editJobId,
      position: editPosition.trim(),
      status: editStatus,
      preliminaryScore: Number(editPrelimScore),
      preliminaryStatus: editPrelimStatus,
      preliminaryNotes: editPrelimNotes,
    });

    setEditingCandidate(null);
    if (onCandidateChange) onCandidateChange();
  };

  const handleDeleteCandidate = (cdd: Candidate, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingCandidate(cdd);
  };

  const handleConfirmDeleteCandidate = () => {
    if (!deletingCandidate) return;
    StorageService.deleteCandidate(deletingCandidate.id);
    setDeletingCandidate(null);
    if (onCandidateChange) onCandidateChange();
  };

  // Filter candidates according to role and search
  const filteredCandidates = candidates.filter((cdd) => {
    // Client strictly sees their own company
    if (isClient && currentUser.companyId && cdd.companyId !== currentUser.companyId) {
      return false;
    }

    if (selectedCompanyId !== 'all' && cdd.companyId !== selectedCompanyId) {
      return false;
    }

    if (selectedStatus !== 'all' && cdd.status !== selectedStatus) {
      return false;
    }

    if (selectedJobId !== 'all' && cdd.jobId !== selectedJobId) {
      return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = cdd.fullName.toLowerCase().includes(q);
      const matchPos = cdd.position.toLowerCase().includes(q);
      const matchEmail = cdd.email.toLowerCase().includes(q);
      if (!matchName && !matchPos && !matchEmail) return false;
    }

    return true;
  });

  const getCompanyName = (id: string) => {
    return companies.find((c) => c.id === id)?.companyName || 'Perusahaan Klien';
  };

  const availableJobsForEdit = jobs.filter((j) => (editCompanyId ? j.companyId === editCompanyId : true));

  return (
    <div className="space-y-4">
      {/* Top Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-neutral-100">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Search box */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari kandidat, posisi, atau email..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
            />
          </div>

          {/* Company filter (hidden for client) */}
          {!isClient && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="py-1.5 px-2 text-xs rounded border border-neutral-200 bg-white focus:outline-none focus:border-neutral-900"
              >
                <option value="all">Semua Perusahaan</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1.5 px-2 text-xs rounded border border-neutral-200 bg-white focus:outline-none focus:border-neutral-900"
            >
              <option value="all">Semua Tahapan Status</option>
              <option value="Applied">Applied</option>
              <option value="Preliminary">Preliminary</option>
              <option value="Screening">Screening</option>
              <option value="Interview HR">Interview HR</option>
              <option value="Interview User">Interview User</option>
              <option value="Offering">Offering</option>
              <option value="Hired">Hired</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Action Button */}
        {!isClient && (
          <button
            onClick={onOpenAddModal}
            className="px-3 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 font-medium whitespace-nowrap self-end sm:self-auto cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kandidat</span>
          </button>
        )}
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-lg border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/50 text-neutral-500 font-normal">
                <th className="py-2.5 px-4 font-normal">Kandidat</th>
                <th className="py-2.5 px-4 font-normal">Posisi & Perusahaan</th>
                <th className="py-2.5 px-4 font-normal">Tahap Rekrutmen</th>
                <th className="py-2.5 px-4 font-normal">Preliminary</th>
                <th className="py-2.5 px-4 font-normal text-right">AI CV Score</th>
                <th className="py-2.5 px-4 font-normal text-right">Tanggal Masuk</th>
                <th className="py-2.5 px-3 font-normal text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700 font-normal">
              {filteredCandidates.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-neutral-400">
                    Tidak ditemukan data kandidat yang cocok dengan filter.
                  </td>
                </tr>
              ) : (
                filteredCandidates.map((cdd) => {
                  return (
                    <tr
                      key={cdd.id}
                      onClick={() => onSelectCandidate(cdd)}
                      className="hover:bg-neutral-50/70 cursor-pointer transition-colors group"
                    >
                      {/* Name & Email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[11px] font-medium text-neutral-700 shrink-0">
                            {cdd.fullName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-medium text-neutral-900 group-hover:text-neutral-950">
                              {cdd.fullName}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-normal">
                              {cdd.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Position & Company */}
                      <td className="py-3 px-4">
                        <div className="font-normal text-neutral-800">{cdd.position}</div>
                        <div className="text-[11px] text-neutral-400 font-normal">
                          {getCompanyName(cdd.companyId)}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        <StageBadge stage={cdd.status} />
                      </td>

                      {/* Preliminary */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <PreliminaryBadge status={cdd.preliminaryStatus} />
                          {cdd.preliminaryScore ? (
                            <span className="font-mono text-neutral-600 text-xs tabular-nums">
                              {cdd.preliminaryScore}
                            </span>
                          ) : null}
                        </div>
                      </td>

                      {/* AI Score */}
                      <td className="py-3 px-4 text-right">
                        {cdd.aiScore ? (
                          <div className="inline-flex items-center gap-1 font-mono font-medium text-neutral-900 tabular-nums">
                            <Sparkles className="w-3 h-3 text-neutral-400" />
                            <span>{cdd.aiScore}</span>
                            <span className="text-[10px] text-neutral-400">/100</span>
                          </div>
                        ) : (
                          <span className="text-neutral-400 text-xs">-</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="py-3 px-4 text-right font-mono text-[11px] text-neutral-400 tabular-nums">
                        {new Date(cdd.createdAt).toLocaleDateString('id-ID', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>

                      {/* Actions: Edit, Hapus, Detail */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {isAdminOrRecruiter && (
                            <>
                              <button
                                onClick={(e) => handleOpenEdit(cdd, e)}
                                className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                                title="Edit kandidat"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={(e) => handleDeleteCandidate(cdd, e)}
                                className="p-1 rounded text-neutral-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Hapus kandidat"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectCandidate(cdd);
                            }}
                            className="p-1 rounded text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Buka detail"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Count */}
        <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50/30 flex items-center justify-between text-[11px] text-neutral-500 font-normal">
          <span>Menampilkan {filteredCandidates.length} dari {candidates.length} kandidat</span>
          <span className="text-neutral-400">ATS Mini Database</span>
        </div>
      </div>

      {/* Edit Candidate Modal */}
      {editingCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl w-full max-w-lg p-5 space-y-4 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-medium text-neutral-900">
                Edit Data Kandidat (CDD)
              </h3>
              <button
                onClick={() => setEditingCandidate(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateCandidate} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nama Lengkap *
                  </label>
                  <input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editEmail}
                    onChange={(e) => setEditEmail(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nomor Telepon
                  </label>
                  <input
                    type="tel"
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Perusahaan Klien *
                  </label>
                  <select
                    value={editCompanyId}
                    onChange={(e) => {
                      setEditCompanyId(e.target.value);
                      const related = jobs.filter((j) => j.companyId === e.target.value);
                      if (related.length > 0) {
                        setEditJobId(related[0].id);
                        setEditPosition(related[0].position);
                      }
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.companyName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Lowongan Terkait *
                  </label>
                  <select
                    value={editJobId}
                    onChange={(e) => {
                      setEditJobId(e.target.value);
                      const found = jobs.find((j) => j.id === e.target.value);
                      if (found) setEditPosition(found.position);
                    }}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    {availableJobsForEdit.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.position}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Posisi (Label)
                  </label>
                  <input
                    type="text"
                    value={editPosition}
                    onChange={(e) => setEditPosition(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Tahapan Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as PipelineStage)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="Applied">Applied</option>
                    <option value="Preliminary">Preliminary</option>
                    <option value="Screening">Screening</option>
                    <option value="Interview HR">Interview HR</option>
                    <option value="Interview User">Interview User</option>
                    <option value="Offering">Offering</option>
                    <option value="Hired">Hired</option>
                    <option value="Rejected">Rejected</option>
                    <option value="Withdrawn">Withdrawn</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Preliminary Score
                  </label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={editPrelimScore}
                    onChange={(e) => setEditPrelimScore(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Preliminary Status
                  </label>
                  <select
                    value={editPrelimStatus}
                    onChange={(e) => setEditPrelimStatus(e.target.value as PreliminaryStatus)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Need Review">Need Review</option>
                    <option value="Not Qualified">Not Qualified</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Catatan Preliminary
                </label>
                <textarea
                  rows={2}
                  value={editPrelimNotes}
                  onChange={(e) => setEditPrelimNotes(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCandidate(null)}
                  className="px-3 py-1.5 text-xs rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 font-medium cursor-pointer"
                >
                  Perbarui Data Kandidat
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Candidate Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingCandidate}
        title="Hapus Data Kandidat"
        message="Apakah Anda yakin ingin menghapus data kandidat ini dari database CDD? Seluruh riwayat dan penilaian terkait akan dihapus secara permanen."
        itemName={deletingCandidate ? `${deletingCandidate.fullName} (${deletingCandidate.position})` : undefined}
        confirmLabel="Hapus Kandidat"
        onConfirm={handleConfirmDeleteCandidate}
        onCancel={() => setDeletingCandidate(null)}
      />
    </div>
  );
};
