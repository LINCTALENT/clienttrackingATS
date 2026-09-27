import React, { useState } from 'react';
import { Candidate, Company, Job, User, PipelineStage, PreliminaryStatus, AIAnalysisResult } from '../../types';
import { StageBadge, PreliminaryBadge, AIRecommendationBadge } from '../common/StatusBadge';
import { AIService } from '../../services/aiService';
import {
  X,
  Mail,
  Phone,
  Building2,
  Briefcase,
  FileText,
  Sparkles,
  CheckCircle2,
  Calendar,
  User as UserIcon,
  ChevronRight,
  Loader2,
  AlertTriangle,
  History,
  Copy,
  Check,
  Edit2,
  Trash2,
} from 'lucide-react';
import { StorageService } from '../../services/storage';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

interface CandidateDetailModalProps {
  candidate: Candidate;
  onClose: () => void;
  currentUser: User;
  companies: Company[];
  jobs: Job[];
  onUpdateCandidate: (updated: Candidate) => void;
  onDeleteCandidate?: (id: string) => void;
}

const ALL_STAGES: PipelineStage[] = [
  'Applied',
  'Preliminary',
  'Screening',
  'Interview HR',
  'Interview User',
  'Offering',
  'Hired',
];

export const CandidateDetailModal: React.FC<CandidateDetailModalProps> = ({
  candidate,
  onClose,
  currentUser,
  companies,
  jobs,
  onUpdateCandidate,
  onDeleteCandidate,
}) => {
  const isReadOnly = currentUser.role === 'client';
  const isAdminOrRecruiter = currentUser.role === 'admin' || currentUser.role === 'recruiter';
  const company = companies.find((c) => c.id === candidate.companyId);
  const job = jobs.find((j) => j.id === candidate.jobId);

  // Delete Candidate Modal State
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  // Edit Candidate State
  const [showEditCandidate, setShowEditCandidate] = useState(false);
  const [editName, setEditName] = useState(candidate.fullName);
  const [editEmail, setEditEmail] = useState(candidate.email);
  const [editPhone, setEditPhone] = useState(candidate.phone);
  const [editPos, setEditPos] = useState(candidate.position);
  const [editCompanyId, setEditCompanyId] = useState(candidate.companyId);

  // Preliminary local edit state
  const [prelimScore, setPrelimScore] = useState<number>(candidate.preliminaryScore ?? 80);
  const [prelimStatus, setPrelimStatus] = useState<PreliminaryStatus>(candidate.preliminaryStatus || 'Pending');
  const [prelimNotes, setPrelimNotes] = useState<string>(candidate.preliminaryNotes || '');
  const [savingPrelim, setSavingPrelim] = useState(false);
  const [prelimSavedMsg, setPrelimSavedMsg] = useState(false);

  // AI Analysis state
  const [analyzingAI, setAnalyzingAI] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'preliminary' | 'ai' | 'timeline' | 'cv'>('profile');
  const [copiedCV, setCopiedCV] = useState(false);

  const logs = StorageService.getLogs(candidate.id);

  // Handle Preliminary Save
  const handleSavePreliminary = () => {
    setSavingPrelim(true);
    setTimeout(() => {
      const updated = StorageService.savePreliminary(candidate.id, {
        score: Number(prelimScore),
        status: prelimStatus,
        notes: prelimNotes,
        performedBy: currentUser.name,
      });
      if (updated) {
        onUpdateCandidate(updated);
        setPrelimSavedMsg(true);
        setTimeout(() => setPrelimSavedMsg(false), 2500);
      }
      setSavingPrelim(false);
    }, 400);
  };

  // Handle Run AI CV Analysis
  const handleRunAIAnalysis = async () => {
    if (!candidate.cvText) {
      setAiError('CV text tidak ditemukan. Unggah atau tempel teks CV terlebih dahulu.');
      return;
    }

    setAnalyzingAI(true);
    setAiError(null);

    try {
      const result: AIAnalysisResult = await AIService.analyzeCV(
        candidate.cvText,
        candidate.position,
        job?.jobDescription
      );

      const updated = StorageService.saveAIAnalysis(candidate.id, result, currentUser.name);
      if (updated) {
        onUpdateCandidate(updated);
        setActiveTab('ai');
      }
    } catch (e: any) {
      setAiError(e.message || 'Gagal memproses analisis Gemini AI');
    } finally {
      setAnalyzingAI(false);
    }
  };

  // Handle Change Stage
  const handleChangeStage = (stage: PipelineStage) => {
    if (isReadOnly) return;
    const updated = StorageService.updateCandidateStatus(candidate.id, stage, currentUser.name);
    if (updated) {
      onUpdateCandidate(updated);
    }
  };

  const handleDeleteThisCandidate = () => {
    setShowConfirmDelete(true);
  };

  const handleExecuteDeleteCandidate = () => {
    StorageService.deleteCandidate(candidate.id);
    if (onDeleteCandidate) {
      onDeleteCandidate(candidate.id);
    }
    setShowConfirmDelete(false);
    onClose();
  };

  const handleSaveEditCandidate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim()) return;

    const updated = StorageService.updateCandidate(candidate.id, {
      fullName: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      position: editPos.trim(),
      companyId: editCompanyId,
    });

    if (updated) {
      onUpdateCandidate(updated);
      setShowEditCandidate(false);
    }
  };

  const handleCopyCV = () => {
    if (!candidate.cvText) return;
    navigator.clipboard.writeText(candidate.cvText);
    setCopiedCV(true);
    setTimeout(() => setCopiedCV(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Top Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-xs font-medium text-neutral-700">
              {candidate.fullName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-neutral-900 leading-tight">
                  {candidate.fullName}
                </h3>
                <StageBadge stage={candidate.status} />
              </div>
              <p className="text-xs text-neutral-500 font-normal mt-0.5">
                {candidate.position} · {company?.companyName || 'Linchub Client'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isReadOnly && (
              <>
                <button
                  onClick={() => setShowEditCandidate(true)}
                  className="px-2.5 py-1 text-xs rounded border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Edit data kandidat"
                >
                  <Edit2 className="w-3.5 h-3.5 text-neutral-500" />
                  <span className="hidden sm:inline">Edit</span>
                </button>

                <button
                  onClick={handleDeleteThisCandidate}
                  className="px-2.5 py-1 text-xs rounded border border-neutral-200 hover:border-rose-200 bg-white hover:bg-rose-50 text-neutral-600 hover:text-rose-600 flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Hapus kandidat"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Hapus</span>
                </button>

                <button
                  onClick={handleRunAIAnalysis}
                  disabled={analyzingAI}
                  className="px-2.5 py-1 text-xs rounded border border-neutral-200 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {analyzingAI ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Menganalisis...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Analisis AI Gemini</span>
                    </>
                  )}
                </button>
              </>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pipeline Stepper Bar */}
        <div className="px-5 py-3 border-b border-neutral-100 bg-neutral-50/50 overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-[620px]">
            {ALL_STAGES.map((stg, i) => {
              const isCurrent = candidate.status === stg;
              const isPassed = ALL_STAGES.indexOf(candidate.status) > i;

              return (
                <React.Fragment key={stg}>
                  <button
                    disabled={isReadOnly}
                    onClick={() => handleChangeStage(stg)}
                    className={`flex items-center gap-1 px-2 py-1 text-[11px] rounded transition-colors ${
                      isCurrent
                        ? 'bg-neutral-900 text-white font-medium shadow-xs'
                        : isPassed
                        ? 'bg-neutral-200/70 text-neutral-700 font-normal hover:bg-neutral-200'
                        : 'text-neutral-400 hover:text-neutral-700 font-normal'
                    } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    {isPassed && <CheckCircle2 className="w-3 h-3 text-neutral-600" />}
                    <span>{stg}</span>
                  </button>
                  {i < ALL_STAGES.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-neutral-300 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}

            {!isReadOnly && (
              <div className="ml-auto flex items-center gap-1 pl-3 border-l border-neutral-200">
                <button
                  onClick={() => handleChangeStage('Rejected')}
                  className={`px-2 py-1 text-[11px] rounded transition-colors ${
                    candidate.status === 'Rejected'
                      ? 'bg-rose-600 text-white'
                      : 'text-rose-600 hover:bg-rose-50'
                  }`}
                >
                  Tolak (Reject)
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 border-b border-neutral-100 flex items-center gap-4 text-xs font-normal">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-neutral-900 text-neutral-900 font-medium'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            Profil & Kontak
          </button>
          <button
            onClick={() => setActiveTab('ai')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'ai'
                ? 'border-neutral-900 text-neutral-900 font-medium'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-neutral-400" />
            <span>Hasil AI Analysis</span>
            {candidate.aiScore && (
              <span className="ml-1 text-[10px] font-mono px-1 rounded bg-neutral-100 text-neutral-700">
                {candidate.aiScore}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('preliminary')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'preliminary'
                ? 'border-neutral-900 text-neutral-900 font-medium'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <span>Preliminary Assessment</span>
            {candidate.preliminaryScore && (
              <span className="ml-1 text-[10px] font-mono px-1 rounded bg-neutral-100 text-neutral-700">
                {candidate.preliminaryScore}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('cv')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'cv'
                ? 'border-neutral-900 text-neutral-900 font-medium'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <FileText className="w-3 h-3" />
            <span>Dokumen CV</span>
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`py-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'timeline'
                ? 'border-neutral-900 text-neutral-900 font-medium'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <History className="w-3 h-3" />
            <span>Riwayat Aktivitas ({logs.length})</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto flex-1 text-xs text-neutral-700">
          {aiError && (
            <div className="mb-4 p-3 rounded border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{aiError}</span>
            </div>
          )}

          {/* TAB 1: PROFIL & KONTAK */}
          {activeTab === 'profile' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded border border-neutral-100 bg-neutral-50/30 space-y-2.5">
                  <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                    Informasi Kontak
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Mail className="w-3.5 h-3.5 text-neutral-400" />
                      <a href={`mailto:${candidate.email}`} className="hover:underline">
                        {candidate.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{candidate.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Masuk: {new Date(candidate.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded border border-neutral-100 bg-neutral-50/30 space-y-2.5">
                  <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                    Penugasan Rekrutmen
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Perusahaan: {company?.companyName || 'N/A'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <Briefcase className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Posisi: {candidate.position}</span>
                    </div>
                    <div className="flex items-center gap-2 text-neutral-600">
                      <UserIcon className="w-3.5 h-3.5 text-neutral-400" />
                      <span>Recruiter PIC: {candidate.preliminaryBy || 'Dimas Pratama (Linchub)'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Requirement context */}
              {job && (
                <div className="p-3.5 rounded border border-neutral-100">
                  <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1.5">
                    Requirement Posisi ({job.position})
                  </div>
                  <p className="text-neutral-600 font-normal leading-relaxed text-xs">
                    {job.jobDescription}
                  </p>
                </div>
              )}

              {/* Quick Status snapshot */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                <div className="p-3 rounded border border-neutral-100 text-center">
                  <div className="text-[11px] text-neutral-400">Status Saat Ini</div>
                  <div className="mt-1 font-medium text-neutral-800">{candidate.status}</div>
                </div>
                <div className="p-3 rounded border border-neutral-100 text-center">
                  <div className="text-[11px] text-neutral-400">Preliminary Score</div>
                  <div className="mt-1 font-mono font-medium text-neutral-800">
                    {candidate.preliminaryScore ? `${candidate.preliminaryScore}/100` : '-'}
                  </div>
                </div>
                <div className="p-3 rounded border border-neutral-100 text-center">
                  <div className="text-[11px] text-neutral-400">AI CV Score</div>
                  <div className="mt-1 font-mono font-medium text-neutral-800">
                    {candidate.aiScore ? `${candidate.aiScore}/100` : 'Belum dianalisis'}
                  </div>
                </div>
                <div className="p-3 rounded border border-neutral-100 text-center">
                  <div className="text-[11px] text-neutral-400">Preliminary Status</div>
                  <div className="mt-1">
                    <PreliminaryBadge status={candidate.preliminaryStatus} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: HASIL AI ANALYSIS */}
          {activeTab === 'ai' && (
            <div className="space-y-4">
              {!candidate.aiSummary ? (
                <div className="p-8 text-center border border-dashed border-neutral-200 rounded-lg space-y-3">
                  <Sparkles className="w-8 h-8 text-neutral-400 mx-auto" />
                  <div>
                    <h4 className="font-medium text-neutral-800 text-sm">
                      Kandidat ini belum dianalisis dengan Gemini AI
                    </h4>
                    <p className="text-neutral-500 font-normal text-xs mt-1 max-w-md mx-auto">
                      AI akan membaca konten CV, mengekstrak keahlian, membandingkan dengan requirement posisi, dan menghasilkan skor serta rekomendasi objektif.
                    </p>
                  </div>
                  {!isReadOnly && (
                    <button
                      onClick={handleRunAIAnalysis}
                      disabled={analyzingAI}
                      className="px-3.5 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-2"
                    >
                      {analyzingAI ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Memproses Analisis...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Jalankan Analisis AI Sekarang</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {/* AI Headline Card */}
                  <div className="p-4 rounded border border-neutral-100 bg-neutral-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-neutral-900">
                          Gemini AI Evaluation
                        </span>
                        <AIRecommendationBadge rec={candidate.aiRecommendation} />
                      </div>
                      <p className="text-xs text-neutral-500 font-normal">
                        {candidate.aiMatch || 'Tingkat kecocokan kualifikasi tinggi'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[11px] text-neutral-400">AI Score</div>
                        <div className="font-mono text-xl font-medium text-neutral-900 tabular-nums">
                          {candidate.aiScore}
                          <span className="text-xs text-neutral-400 font-normal">/100</span>
                        </div>
                      </div>
                      {!isReadOnly && (
                        <button
                          onClick={handleRunAIAnalysis}
                          disabled={analyzingAI}
                          className="px-2 py-1 text-[11px] rounded border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-600 transition-colors flex items-center gap-1"
                        >
                          <Sparkles className="w-3 h-3 text-neutral-400" />
                          <span>Analisis Ulang</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3.5 rounded border border-neutral-100">
                    <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
                      AI Summary
                    </div>
                    <p className="text-xs font-normal text-neutral-700 leading-relaxed">
                      {candidate.aiSummary}
                    </p>
                  </div>

                  {/* Skills tags */}
                  {candidate.aiSkills && candidate.aiSkills.length > 0 && (
                    <div className="p-3.5 rounded border border-neutral-100">
                      <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-2">
                        Keahlian & Kompetensi Terdeteksi
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {candidate.aiSkills.map((sk) => (
                          <span
                            key={sk}
                            className="px-2 py-0.5 text-xs font-normal rounded bg-neutral-50 border border-neutral-200 text-neutral-700"
                          >
                            {sk}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Strengths and Concerns */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded border border-neutral-100">
                      <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kekuatan Utama (Strengths)</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-neutral-600 font-normal">
                        {candidate.aiStrengths?.map((str, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-neutral-400 shrink-0">·</span>
                            <span>{str}</span>
                          </li>
                        )) || <li>Belum ada catatan kekuatan spesifik</li>}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded border border-neutral-100">
                      <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1 text-amber-800">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Area Verifikasi (Potential Concerns)</span>
                      </div>
                      <ul className="space-y-1.5 text-xs text-neutral-600 font-normal">
                        {candidate.aiConcerns?.map((con, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-neutral-400 shrink-0">·</span>
                            <span>{con}</span>
                          </li>
                        )) || <li>Tidak ditemukan catatan resiko kritis</li>}
                      </ul>
                    </div>
                  </div>

                  {/* Experience & Education */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded border border-neutral-100 text-xs">
                      <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Pengalaman Teridentifikasi
                      </div>
                      <p className="text-neutral-600 font-normal">
                        {candidate.aiExperience || '-'}
                      </p>
                    </div>
                    <div className="p-3 rounded border border-neutral-100 text-xs">
                      <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
                        Pendidikan Teridentifikasi
                      </div>
                      <p className="text-neutral-600 font-normal">
                        {candidate.aiEducation || '-'}
                      </p>
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-400">
                    Dianalisis pada: {candidate.aiAnalyzedAt ? new Date(candidate.aiAnalyzedAt).toLocaleString('id-ID') : '-'} · Engine: {candidate.aiAnalysisVersion || 'Gemini 3.8 Flash'}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PRELIMINARY ASSESSMENT */}
          {activeTab === 'preliminary' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded border border-neutral-100 bg-neutral-50/30">
                <div className="text-xs font-medium text-neutral-800 mb-0.5">
                  Preliminary Assessment Linchub
                </div>
                <p className="text-xs text-neutral-500 font-normal leading-relaxed">
                  Penilaian awal sebelum kandidat masuk lebih jauh ke proses rekrutmen. Berfungsi menyaring kesesuaian mendasar terhadap persyaratan lowongan.
                </p>
              </div>

              {isReadOnly ? (
                // Read-only view for Client
                <div className="space-y-4 p-4 border border-neutral-100 rounded">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
                    <div>
                      <div className="text-[11px] text-neutral-400">Status Kelayakan</div>
                      <div className="mt-1">
                        <PreliminaryBadge status={candidate.preliminaryStatus} />
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-neutral-400">Preliminary Score</div>
                      <div className="font-mono text-lg font-medium text-neutral-900 tabular-nums">
                        {candidate.preliminaryScore ? `${candidate.preliminaryScore}/100` : 'Pending'}
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider mb-1">
                      Catatan Penilai (Recruiter)
                    </div>
                    <p className="text-xs text-neutral-700 font-normal leading-relaxed">
                      {candidate.preliminaryNotes || 'Belum ada catatan preliminary.'}
                    </p>
                  </div>

                  <div className="text-[11px] text-neutral-400 pt-2 border-t border-neutral-100">
                    Dinilai oleh: {candidate.preliminaryBy || 'Dimas Pratama'} · Waktu: {candidate.preliminaryAt ? new Date(candidate.preliminaryAt).toLocaleString('id-ID') : '-'}
                  </div>
                </div>
              ) : (
                // Form edit for Recruiter / Admin
                <div className="space-y-4 p-4 border border-neutral-100 rounded">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Preliminary Score (0 - 100)
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={prelimScore}
                        onChange={(e) => setPrelimScore(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 text-xs font-mono rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                        placeholder="Contoh: 85"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-neutral-700 mb-1">
                        Status Kelayakan
                      </label>
                      <select
                        value={prelimStatus}
                        onChange={(e) => setPrelimStatus(e.target.value as PreliminaryStatus)}
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
                      Catatan Evaluasi Awal (Preliminary Notes)
                    </label>
                    <textarea
                      rows={3}
                      value={prelimNotes}
                      onChange={(e) => setPrelimNotes(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                      placeholder="Masukkan catatan kesesuaian pengalaman, komunikasi awal, atau kualifikasi..."
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="text-[11px] text-neutral-400">
                      {candidate.preliminaryAt
                        ? `Terakhir disimpan: ${new Date(candidate.preliminaryAt).toLocaleString('id-ID')} oleh ${candidate.preliminaryBy || 'Recruiter'}`
                        : 'Belum disimpan'}
                    </div>

                    <div className="flex items-center gap-2">
                      {prelimSavedMsg && (
                        <span className="text-xs text-emerald-600 font-medium animate-in fade-in">
                          Tersimpan!
                        </span>
                      )}
                      <button
                        onClick={handleSavePreliminary}
                        disabled={savingPrelim}
                        className="px-3.5 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors disabled:opacity-50"
                      >
                        {savingPrelim ? 'Menyimpan...' : 'Simpan Preliminary'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: DOKUMEN CV */}
          {activeTab === 'cv' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
                <div className="flex items-center gap-2 text-xs text-neutral-600">
                  <FileText className="w-4 h-4 text-neutral-400" />
                  <span className="font-medium text-neutral-800">
                    {candidate.cvFileName || 'Dokumen_CV_Kandidat.pdf'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCV}
                    className="px-2 py-1 text-xs rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-600 flex items-center gap-1 transition-colors"
                  >
                    {copiedCV ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-neutral-400" />
                        <span>Salin Teks CV</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <div className="p-4 rounded border border-neutral-100 bg-neutral-50/50 font-mono text-xs text-neutral-700 whitespace-pre-wrap leading-relaxed max-h-[380px] overflow-y-auto">
                {candidate.cvText || 'Teks CV belum tersedia untuk kandidat ini.'}
              </div>
            </div>
          )}

          {/* TAB 5: RIWAYAT AKTIVITAS */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="text-xs text-neutral-500 font-normal">
                Seluruh aktivitas, perubahan status, dan catatan tersimpan secara permanen untuk audit.
              </div>

              <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-neutral-200">
                {logs.length === 0 ? (
                  <p className="text-neutral-400 text-xs">Belum ada riwayat aktivitas.</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="relative group">
                      <div className="absolute -left-6 top-1 w-2.5 h-2.5 rounded-full bg-white border-2 border-neutral-400 group-hover:border-neutral-900 transition-colors" />
                      <div className="flex items-baseline justify-between">
                        <span className="font-medium text-neutral-800 text-xs">
                          {log.action}
                        </span>
                        <span className="text-[11px] font-mono text-neutral-400">
                          {new Date(log.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="text-neutral-600 text-xs font-normal mt-0.5">
                        {log.details || 'Aktivitas tercatat di sistem'}
                      </div>
                      <div className="text-[10px] text-neutral-400 mt-0.5">
                        Oleh: {log.performedBy} · {new Date(log.timestamp).toLocaleDateString('id-ID')}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Candidate Modal */}
      {showEditCandidate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-neutral-950/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg border border-neutral-200 shadow-2xl w-full max-w-md p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h4 className="text-sm font-medium text-neutral-900">
                Edit Profil Kandidat
              </h4>
              <button
                onClick={() => setShowEditCandidate(false)}
                className="p-1 rounded text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCandidate} className="space-y-3 text-xs">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
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
                  Posisi Pekerjaan
                </label>
                <input
                  type="text"
                  value={editPos}
                  onChange={(e) => setEditPos(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Perusahaan Klien *
                </label>
                <select
                  value={editCompanyId}
                  onChange={(e) => setEditCompanyId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                >
                  {companies.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditCandidate(false)}
                  className="px-3 py-1.5 text-xs rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-600 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 font-medium cursor-pointer"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Candidate Modal */}
      <ConfirmDeleteModal
        isOpen={showConfirmDelete}
        title="Hapus Kandidat"
        message="Apakah Anda yakin ingin menghapus data kandidat ini? Data riwayat tahapan dan catatan assessment akan dihapus permanen."
        itemName={`${candidate.fullName} - ${candidate.position}`}
        confirmLabel="Hapus Kandidat"
        onConfirm={handleExecuteDeleteCandidate}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </div>
  );
};
