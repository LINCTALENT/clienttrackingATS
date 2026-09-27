import React, { useState } from 'react';
import { Company, Job, Candidate, User } from '../../types';
import { AIService } from '../../services/aiService';
import {
  X,
  Sparkles,
  Upload,
  FileText,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

interface AddCandidateModalProps {
  onClose: () => void;
  companies: Company[];
  jobs: Job[];
  currentUser: User;
  onCandidateAdded: (newCandidate: Candidate) => void;
}

export const AddCandidateModal: React.FC<AddCandidateModalProps> = ({
  onClose,
  companies,
  jobs,
  currentUser,
  onCandidateAdded,
}) => {
  const [mode, setMode] = useState<'ai' | 'manual'>('ai');
  const [extracting, setExtracting] = useState(false);
  const [extractSuccess, setExtractSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [companyId, setCompanyId] = useState(companies[0]?.id || '');
  const [jobId, setJobId] = useState(jobs[0]?.id || '');
  const [position, setPosition] = useState(jobs[0]?.position || '');
  const [cvFileName, setCvFileName] = useState('');
  const [cvText, setCvText] = useState('');
  const [prelimNotes, setPrelimNotes] = useState('');

  // Handle company change -> filter jobs
  const availableJobs = jobs.filter((j) => (companyId ? j.companyId === companyId : true));

  const handleSelectCompany = (cId: string) => {
    setCompanyId(cId);
    const relatedJobs = jobs.filter((j) => j.companyId === cId);
    if (relatedJobs.length > 0) {
      setJobId(relatedJobs[0].id);
      setPosition(relatedJobs[0].position);
    }
  };

  const handleSelectJob = (jId: string) => {
    setJobId(jId);
    const selected = jobs.find((j) => j.id === jId);
    if (selected) {
      setPosition(selected.position);
      setCompanyId(selected.companyId);
    }
  };

  const handleExtractFromText = async (textToExtract: string, fileName?: string) => {
    if (!textToExtract.trim()) {
      setErrorMsg('Harap masukkan atau unggah dokumen CV terlebih dahulu.');
      return;
    }
    setExtracting(true);
    setErrorMsg(null);

    try {
      const extracted = await AIService.extractCV(textToExtract);
      setFullName(extracted.fullName || '');
      setEmail(extracted.email || '');
      setPhone(extracted.phone || '');
      if (fileName) setCvFileName(fileName);
      setExtractSuccess(true);
      setTimeout(() => setExtractSuccess(false), 3000);
    } catch {
      setErrorMsg('Gagal mengekstrak data dari CV. Anda tetap dapat melengkapi form secara manual.');
    } finally {
      setExtracting(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCvFileName(file.name);
    setErrorMsg(null);

    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setExtracting(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          const extractedText = await AIService.parsePDF(base64Data, file.name);
          setCvText(extractedText);
          await handleExtractFromText(extractedText, file.name);
        } catch (err: any) {
          setErrorMsg('Gagal memproses file PDF: ' + (err.message || 'Kesalahan parsing'));
          setExtracting(false);
        }
      };
      reader.onerror = () => {
        setErrorMsg('Gagal membaca file PDF dari disk.');
        setExtracting(false);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        setCvText(content);
        handleExtractFromText(content, file.name);
      };
      reader.readAsText(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Nama lengkap kandidat wajib diisi.');
      return;
    }

    const newCandidateData = {
      fullName: fullName.trim(),
      email: email.trim() || 'kandidat@linchub.id',
      phone: phone.trim() || '+628123456789',
      companyId: companyId || companies[0]?.id || 'comp-1',
      jobId: jobId || jobs[0]?.id || 'job-1',
      position: position || jobs.find((j) => j.id === jobId)?.position || 'Staff',
      recruiterId: currentUser.uid,
      cvUrl: '#',
      cvFileName: cvFileName || 'CV_Uploaded.pdf',
      cvText: cvText || 'Dokumen CV kandidat.',
      status: 'Applied' as const,
      preliminaryStatus: 'Pending' as const,
      preliminaryScore: 0,
      preliminaryNotes: prelimNotes || '',
    };

    onCandidateAdded(newCandidateData as any);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-neutral-900/40 backdrop-blur-xs">
      <div className="bg-white rounded-lg border border-neutral-200 shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in duration-150">
        {/* Header */}
        <div className="p-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-neutral-900">
              Tambah Kandidat Baru (CDD)
            </h3>
            <p className="text-xs text-neutral-500 font-normal mt-0.5">
              Input manual atau gunakan ekstraksi CV otomatis dengan Gemini AI
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="px-5 pt-3 border-b border-neutral-100 flex items-center gap-4 text-xs font-normal">
          <button
            type="button"
            onClick={() => setMode('ai')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              mode === 'ai'
                ? 'border-neutral-900 text-neutral-900 font-medium'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-neutral-400" />
            <span>AI CV Auto-Extract</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('manual')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              mode === 'manual'
                ? 'border-neutral-900 text-neutral-900 font-medium'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-neutral-400" />
            <span>Input Manual</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {errorMsg && (
            <div className="p-2.5 rounded border border-rose-200 bg-rose-50 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {extractSuccess && (
            <div className="p-2.5 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Data kandidat berhasil diekstrak oleh Gemini AI! Silakan review form di bawah.</span>
            </div>
          )}

          {/* AI Extract Zone */}
          {mode === 'ai' && (
            <div className="p-3.5 rounded border border-neutral-100 bg-neutral-50/50 space-y-3">
              <div>
                <label className="cursor-pointer w-full p-4 rounded-lg border-2 border-dashed border-neutral-300 hover:border-neutral-500 bg-white hover:bg-neutral-50 text-neutral-700 flex flex-col items-center justify-center gap-1.5 transition-colors text-center">
                  <Upload className="w-5 h-5 text-neutral-500" />
                  <span className="font-medium text-xs text-neutral-900">
                    Unggah Dokumen CV Asli (.PDF / .TXT)
                  </span>
                  <span className="text-[11px] text-neutral-400">
                    Sistem akan membaca teks dokumen PDF dan mengisi formulir otomatis
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {cvFileName && (
                  <div className="mt-2 text-xs text-neutral-700 font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>File dimuat: {cvFileName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-neutral-500 text-[11px] mb-1">
                  Atau tempel teks CV langsung di sini:
                </label>
                <textarea
                  rows={4}
                  value={cvText}
                  onChange={(e) => setCvText(e.target.value)}
                  placeholder="Tempel teks CV kandidat di sini untuk dianalisis oleh AI..."
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 font-mono focus:outline-none focus:border-neutral-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => handleExtractFromText(cvText, cvFileName || 'CV_Manual_Paste.txt')}
                  disabled={extracting || !cvText.trim()}
                  className="mt-2 px-3 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 disabled:opacity-50"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Gemini AI sedang mengekstrak...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Ekstrak Data dengan AI</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-3 pt-1">
            <div className="text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
              Data Kandidat
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nama Lengkap *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Contoh: Andi Saputra"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="andi.saputra@gmail.com"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nomor Telepon / WhatsApp
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+6281299887766"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Perusahaan Klien Tujuan *
                </label>
                <select
                  value={companyId}
                  onChange={(e) => handleSelectCompany(e.target.value)}
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
                  Posisi / Recruitment Request *
                </label>
                <select
                  value={jobId}
                  onChange={(e) => handleSelectJob(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
                >
                  {availableJobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.position} ({j.department})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-neutral-700 mb-1">
                  Nama Posisi (Label)
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Contoh: Senior Backend Engineer"
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1">
                Catatan Awal (Opsional)
              </label>
              <textarea
                rows={2}
                value={prelimNotes}
                onChange={(e) => setPrelimNotes(e.target.value)}
                placeholder="Catatan sumber kandidat (misal: rekomendasi internal, LinkedIn, dsb)..."
                className="w-full px-2.5 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
              />
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-neutral-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-600 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors font-medium"
            >
              Simpan Kandidat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
