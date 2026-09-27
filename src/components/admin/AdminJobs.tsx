import React, { useState } from 'react';
import { Job, Company, User, Candidate } from '../../types';
import { Plus, Briefcase, Building2, User as UserIcon, X, CheckCircle2, Clock, Edit2, Trash2 } from 'lucide-react';
import { StorageService } from '../../services/storage';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

interface AdminJobsProps {
  jobs: Job[];
  companies: Company[];
  users: User[];
  candidates: Candidate[];
  onJobChange: () => void;
  onFilterCandidatesByJob: (jobId: string) => void;
}

export const AdminJobs: React.FC<AdminJobsProps> = ({
  jobs,
  companies,
  users,
  candidates,
  onJobChange,
  onFilterCandidatesByJob,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [deletingJob, setDeletingJob] = useState<{ id: string; position: string } | null>(null);

  // Form fields
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [position, setPosition] = useState('');
  const [department, setDepartment] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [recruiterId, setRecruiterId] = useState(users.find((u) => u.role === 'recruiter')?.uid || '');
  const [targetHires, setTargetHires] = useState(1);

  const recruiters = users.filter((u) => u.role === 'recruiter' || u.role === 'admin');

  const handleOpenAdd = () => {
    setCompanyId(companies[0]?.id || '');
    setPosition('');
    setDepartment('');
    setJobDescription('');
    setRecruiterId(recruiters[0]?.uid || '');
    setTargetHires(1);
    setShowAddModal(true);
  };

  const handleOpenEdit = (job: Job) => {
    setEditingJob(job);
    setCompanyId(job.companyId);
    setPosition(job.position);
    setDepartment(job.department);
    setJobDescription(job.jobDescription);
    setRecruiterId(job.recruiterId || recruiters[0]?.uid || '');
    setTargetHires(job.targetHires || 1);
  };

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!position.trim()) return;

    StorageService.addJob({
      companyId: companyId || companies[0]?.id || 'comp-1',
      position: position.trim(),
      department: department.trim() || 'General Operations',
      jobDescription: jobDescription.trim() || 'Deskripsi tugas dan tanggung jawab posisi pekerjaan.',
      requirements: ['Memiliki pengalaman kerja relevan', 'Komunikasi profesional'],
      jobStatus: 'Open',
      recruiterId: recruiterId || null,
      targetHires: Number(targetHires) || 1,
    });

    setShowAddModal(false);
    onJobChange();
  };

  const handleUpdateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingJob || !position.trim()) return;

    StorageService.updateJob(editingJob.id, {
      companyId,
      position: position.trim(),
      department: department.trim(),
      jobDescription: jobDescription.trim(),
      recruiterId: recruiterId || null,
      targetHires: Number(targetHires) || 1,
    });

    setEditingJob(null);
    onJobChange();
  };

  const handleConfirmDeleteJob = () => {
    if (!deletingJob) return;
    StorageService.deleteJob(deletingJob.id);
    setDeletingJob(null);
    onJobChange();
  };

  const handleToggleStatus = (job: Job) => {
    const nextStatus = job.jobStatus === 'Open' ? 'Closed' : 'Open';
    StorageService.updateJob(job.id, { jobStatus: nextStatus });
    onJobChange();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium text-neutral-900">
            Recruitment Requests / Lowongan Kerja
          </h2>
          <p className="text-xs text-neutral-500 font-normal mt-0.5">
            Kelola permintaan rekrutmen dari klien dan tetapkan Recruiter PIC penanggung jawab.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-3 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 font-medium cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Buat Recruitment Request</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {jobs.map((job) => {
          const comp = companies.find((c) => c.id === job.companyId);
          const rec = users.find((u) => u.uid === job.recruiterId);
          const jobCandidates = candidates.filter((c) => c.jobId === job.id);
          const hiredCount = jobCandidates.filter((c) => c.status === 'Hired').length;

          return (
            <div
              key={job.id}
              className="p-4 bg-white rounded-lg border border-neutral-100 flex flex-col justify-between space-y-3 hover:border-neutral-200 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-neutral-400 font-normal">
                      {comp?.companyName} · {job.department}
                    </span>
                    <h3 className="text-xs font-medium text-neutral-900 mt-0.5 leading-snug">
                      {job.position}
                    </h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(job)}
                      className={`px-2 py-0.5 text-xs rounded border transition-colors cursor-pointer ${
                        job.jobStatus === 'Open'
                          ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-500'
                      }`}
                    >
                      {job.jobStatus === 'Open' ? 'Open' : 'Closed'}
                    </button>

                    <button
                      onClick={() => handleOpenEdit(job)}
                      className="p-1 rounded text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                      title="Edit lowongan"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setDeletingJob({ id: job.id, position: job.position })}
                      className="p-1 rounded text-neutral-300 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Hapus lowongan"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-600 font-normal line-clamp-2 mt-2 leading-relaxed">
                  {job.jobDescription}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-500 font-normal">
                  <div className="flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                    <span>PIC: {rec?.name || 'Belum ditugaskan'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                    <span>Target: {job.targetHires || 1} Hires</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-normal">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-neutral-800">
                    {jobCandidates.length} Pelamar
                  </span>
                  <span className="text-neutral-300">·</span>
                  <span className="text-emerald-700 font-mono">
                    {hiredCount} Hired
                  </span>
                </div>

                <button
                  onClick={() => onFilterCandidatesByJob(job.id)}
                  className="text-xs text-neutral-900 font-medium hover:underline cursor-pointer"
                >
                  Lihat Pipeline Kandidat →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Job Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl w-full max-w-lg p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-medium text-neutral-900">
                Buat Recruitment Request Baru
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Perusahaan Klien *
                </label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nama Posisi *
                  </label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    placeholder="Contoh: Senior Golang Engineer"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Departemen
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="Contoh: Technology / Sales"
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Recruiter PIC Ditugaskan
                  </label>
                  <select
                    value={recruiterId}
                    onChange={(e) => setRecruiterId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    {recruiters.map((r) => (
                      <option key={r.uid} value={r.uid}>
                        {r.name} ({r.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Target Rekrutmen (Kebutuhan Orang)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={targetHires}
                    onChange={(e) => setTargetHires(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Deskripsi Pekerjaan & Persyaratan (Requirement)
                </label>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Kualifikasi yang dicari, tanggung jawab utama, skill teknis yang wajib dikuasai..."
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
                  Simpan Lowongan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Job Modal */}
      {editingJob && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/40 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-xl w-full max-w-lg p-5 space-y-4 animate-in fade-in duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-sm font-medium text-neutral-900">
                Edit Lowongan Pekerjaan
              </h3>
              <button
                onClick={() => setEditingJob(null)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateJob} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Perusahaan Klien *
                </label>
                <select
                  value={companyId}
                  onChange={(e) => setCompanyId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Nama Posisi *
                  </label>
                  <input
                    type="text"
                    required
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Departemen
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Recruiter PIC Ditugaskan
                  </label>
                  <select
                    value={recruiterId}
                    onChange={(e) => setRecruiterId(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                  >
                    {recruiters.map((r) => (
                      <option key={r.uid} value={r.uid}>
                        {r.name} ({r.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-neutral-700 mb-1">
                    Target Rekrutmen (Kebutuhan Orang)
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={targetHires}
                    onChange={(e) => setTargetHires(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Deskripsi Pekerjaan & Persyaratan
                </label>
                <textarea
                  rows={4}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingJob(null)}
                  className="px-3 py-1.5 text-xs rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 font-medium cursor-pointer"
                >
                  Perbarui Lowongan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingJob}
        title="Hapus Lowongan Pekerjaan"
        message="Apakah Anda yakin ingin menghapus lowongan ini? Seluruh kandidat yang mendaftar pada lowongan ini akan terhapus secara permanen dari sistem."
        itemName={deletingJob?.position}
        confirmLabel="Hapus Lowongan"
        onConfirm={handleConfirmDeleteJob}
        onCancel={() => setDeletingJob(null)}
      />
    </div>
  );
};
