import React, { useState } from 'react';
import { Job, Company, CVExtractionAnalysis } from '../../types';
import { AIService } from '../../services/aiService';
import {
  FileSearch,
  Sparkles,
  Copy,
  Check,
  Briefcase,
  AlertCircle,
  FileText,
  User,
  Mail,
  Phone,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Upload,
  FileUp,
  X,
  Loader2,
  FileSpreadsheet,
} from 'lucide-react';
import { GoogleSheetsService } from '../../services/googleSheetsService';

interface CVExtractionAnalyzerProps {
  jobs: Job[];
  companies: Company[];
  onOpenGoogleSheetsModal?: () => void;
}

export const CVExtractionAnalyzer: React.FC<CVExtractionAnalyzerProps> = ({
  jobs,
  companies,
  onOpenGoogleSheetsModal,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('custom');
  const [positionInput, setPositionInput] = useState<string>('');
  const [requirementInput, setRequirementInput] = useState<string>('');
  const [cvTextInput, setCvTextInput] = useState<string>('');
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [fileSizeStr, setFileSizeStr] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [parsingPdf, setParsingPdf] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [result, setResult] = useState<CVExtractionAnalysis | null>(null);
  const [activeView, setActiveView] = useState<'visual' | 'json'>('visual');
  const [copied, setCopied] = useState(false);
  const [savingToSheet, setSavingToSheet] = useState(false);
  const [sheetSaveStatus, setSheetSaveStatus] = useState<{ success: boolean; message: string } | null>(null);

  const handleSelectJob = (jobId: string) => {
    setSelectedJobId(jobId);
    if (jobId === 'custom') {
      return;
    }
    const targetJob = jobs.find((j) => j.id === jobId);
    if (targetJob) {
      setPositionInput(targetJob.position);
      const company = companies.find((c) => c.id === targetJob.companyId);
      const reqText = `Perusahaan: ${company ? company.companyName : '-'}\nDepartemen: ${targetJob.department}\nKualifikasi: ${targetJob.jobDescription || targetJob.position}\nPersyaratan: ${(targetJob.requirements || []).join(', ')}`;
      setRequirementInput(reqText);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setUploadedFileName(file.name);
    setFileSizeStr((file.size / 1024).toFixed(1) + ' KB');

    // If PDF file, read as base64 and extract via Gemini Document Parser
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      setParsingPdf(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const base64Data = event.target?.result as string;
          setPdfBase64(base64Data);

          // Extract text from the real PDF document
          const extractedPdfText = await AIService.parsePDF(base64Data, file.name);
          setCvTextInput(extractedPdfText);
        } catch (err: any) {
          setErrorMsg('Gagal membaca dokumen PDF: ' + (err.message || 'Kesalahan parsing'));
        } finally {
          setParsingPdf(false);
        }
      };
      reader.onerror = () => {
        setErrorMsg('Gagal membaca file PDF dari perangkat Anda.');
        setParsingPdf(false);
      };
      reader.readAsDataURL(file);
    } else {
      // Plain text or markdown
      setPdfBase64(null);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCvTextInput(text);
      };
      reader.readAsText(file);
    }
  };

  const handleClearFile = () => {
    setUploadedFileName(null);
    setFileSizeStr(null);
    setPdfBase64(null);
    setCvTextInput('');
  };

  const handleExecuteExtractAndAnalyze = async () => {
    if (!cvTextInput.trim() && !pdfBase64) {
      setErrorMsg('Harap masukkan teks CV atau unggah file CV (PDF).');
      return;
    }
    if (!positionInput.trim()) {
      setErrorMsg('Posisi yang dilamar / kriteria pekerjaan wajib diisi.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSheetSaveStatus(null);

    try {
      const analysis = await AIService.extractAndAnalyzeCV(
        cvTextInput.trim(),
        positionInput.trim(),
        requirementInput.trim(),
        pdfBase64 || undefined
      );
      setResult(analysis);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setErrorMsg(msg || 'Gagal mengekstrak dan menganalisis CV');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyJson = () => {
    if (!result) return;
    const jsonStr = JSON.stringify(result, null, 2);
    navigator.clipboard.writeText(jsonStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveToSheet = async () => {
    if (!result) return;
    setSavingToSheet(true);
    setSheetSaveStatus(null);
    try {
      const res = await GoogleSheetsService.saveAnalysisToSheet(
        result,
        positionInput.trim() || result.candidateProfile.targetPosition || 'Umum'
      );
      setSheetSaveStatus(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setSheetSaveStatus({ success: false, message: `Gagal menyimpan: ${msg}` });
    } finally {
      setSavingToSheet(false);
    }
  };

  const getMatchBadgeColor = (match: string) => {
    const m = match.toLowerCase();
    if (m.includes('suitable') && !m.includes('not')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (m.includes('not suitable')) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-neutral-900 text-white">
                <FileSearch className="w-4 h-4" />
              </span>
              <h2 className="text-base font-semibold text-neutral-900 tracking-tight">
                Ekstrak & Analisa CV (PDF / Teks)
              </h2>
            </div>
            <p className="text-xs text-neutral-500 font-normal">
              Mengekstrak data dari dokumen CV (PDF asli) dan menganalisis kecocokannya dengan kriteria lowongan secara real-time.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-100 border border-neutral-200 text-neutral-700 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Mode Baca Murni: Data CV tidak disimpan ke database</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Input Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Job Requirement Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4.5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
                <span>1. Job Requirement / Posisi</span>
              </h3>
            </div>

            {/* Job selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700">
                Pilih Lowongan atau Ketik Manual
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => handleSelectJob(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 bg-white"
              >
                <option value="custom">-- Ketik Posisi / Kriteria Baru --</option>
                {jobs.map((j) => {
                  const comp = companies.find((c) => c.id === j.companyId);
                  return (
                    <option key={j.id} value={j.id}>
                      {j.position} ({comp ? comp.companyName : '-'})
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700">
                Posisi yang Dibuka *
              </label>
              <input
                type="text"
                value={positionInput}
                onChange={(e) => setPositionInput(e.target.value)}
                placeholder="Masukkan judul posisi (misal: Finance Manager, Frontend Engineer, dll)"
                className="w-full px-3 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-700">
                Kriteria & Kebutuhan Pekerjaan (Job Requirement)
              </label>
              <textarea
                rows={3}
                value={requirementInput}
                onChange={(e) => setRequirementInput(e.target.value)}
                placeholder="Tuliskan kualifikasi teknis, batas pengalaman, atau keahlian yang dicari..."
                className="w-full px-3 py-2 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 resize-none font-mono"
              />
            </div>
          </div>

          {/* Real PDF & CV Text Input Card */}
          <div className="bg-white border border-neutral-200 rounded-xl p-4.5 space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-neutral-100">
              <h3 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-neutral-500" />
                <span>2. Dokumen CV Kandidat (PDF)</span>
              </h3>
            </div>

            {/* Real PDF Upload Dropzone */}
            <div className="space-y-2">
              <label className="block border-2 border-dashed border-neutral-200 hover:border-neutral-400 rounded-xl p-4 text-center cursor-pointer transition-colors bg-neutral-50/50 hover:bg-neutral-50">
                <input
                  type="file"
                  accept=".pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <div className="space-y-1.5">
                  <div className="w-9 h-9 rounded-full bg-white border border-neutral-200 flex items-center justify-center mx-auto text-neutral-600 shadow-2xs">
                    <FileUp className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-neutral-800">
                      Klik untuk Unggah File PDF Asli
                    </span>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      Mendukung format .pdf (dokumen asli) atau .txt
                    </p>
                  </div>
                </div>
              </label>

              {/* Uploaded File Indicator */}
              {uploadedFileName && (
                <div className="p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="w-4 h-4 text-neutral-600 shrink-0" />
                    <div className="truncate">
                      <div className="font-medium text-neutral-900 truncate">
                        {uploadedFileName}
                      </div>
                      <div className="text-[10px] text-neutral-400">
                        {fileSizeStr} · {parsingPdf ? 'Sedang membaca teks PDF...' : 'PDF berhasil dimuat'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleClearFile}
                    className="p-1 text-neutral-400 hover:text-neutral-700 rounded cursor-pointer"
                    title="Hapus file"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {parsingPdf && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 text-amber-900 text-xs flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                  <span>Mengekstrak dan membaca seluruh teks dokumen PDF... Mohon tunggu sebentar.</span>
                </div>
              )}
            </div>

            {/* CV Text Area (Displays real extracted text from PDF or direct paste) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-neutral-700">
                  Teks CV Kandidat (Hasil Baca Dokumen PDF / Paste)
                </label>
                {cvTextInput && (
                  <span className="text-[11px] text-neutral-400 font-mono">
                    {cvTextInput.length} karakter
                  </span>
                )}
              </div>
              <textarea
                rows={9}
                value={cvTextInput}
                onChange={(e) => setCvTextInput(e.target.value)}
                placeholder="Upload file PDF di atas, atau tempel teks CV kandidat langsung di sini..."
                className="w-full px-3 py-2 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900 resize-none font-mono text-neutral-800"
              />
            </div>

            {errorMsg && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleExecuteExtractAndAnalyze}
              disabled={loading || parsingPdf}
              className="w-full py-2.5 px-4 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>Sedang Menganalisis Dokumen PDF...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Ekstrak & Analisa Kecocokan (Tanpa Simpan)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Output / Analysis (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-xs min-h-[580px] flex flex-col justify-between">
            <div>
              {/* Header and Toggle */}
              <div className="flex items-center justify-between pb-3 border-b border-neutral-100 mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-neutral-900 tracking-tight">
                    Hasil Analisis Kecocokan CV
                  </h3>
                  {result && (
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-100 text-neutral-600 font-medium">
                      JSON Valid
                    </span>
                  )}
                </div>

                {result && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center bg-neutral-100 p-0.5 rounded border border-neutral-200">
                      <button
                        onClick={() => setActiveView('visual')}
                        className={`px-2.5 py-1 text-xs rounded transition-colors ${
                          activeView === 'visual'
                            ? 'bg-white text-neutral-900 font-medium shadow-2xs'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        Visual Profil
                      </button>
                      <button
                        onClick={() => setActiveView('json')}
                        className={`px-2.5 py-1 text-xs rounded transition-colors ${
                          activeView === 'json'
                            ? 'bg-white text-neutral-900 font-medium shadow-2xs'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        Format JSON Murni
                      </button>
                    </div>

                    <button
                      onClick={handleCopyJson}
                      className="px-2.5 py-1.5 text-xs rounded border border-neutral-200 hover:bg-neutral-50 text-neutral-700 font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      title="Salin JSON Murni"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-emerald-700">Tersalin!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Salin JSON</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleSaveToSheet}
                      disabled={savingToSheet}
                      className="px-2.5 py-1.5 text-xs rounded bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                      title="Simpan Hasil Analisis ke Google Sheets"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                      <span>{savingToSheet ? 'Menyimpan...' : 'Simpan ke Google Sheet'}</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Google Sheets Save Status Feedback */}
              {sheetSaveStatus && (
                <div
                  className={`mb-4 p-3 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                    sheetSaveStatus.success
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                      : 'border-amber-200 bg-amber-50 text-amber-900'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {sheetSaveStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                    )}
                    <span>{sheetSaveStatus.message}</span>
                  </div>
                  {onOpenGoogleSheetsModal && !GoogleSheetsService.isConfigured() && (
                    <button
                      onClick={onOpenGoogleSheetsModal}
                      className="px-2 py-1 rounded bg-amber-600 text-white text-[11px] font-medium hover:bg-amber-700 whitespace-nowrap cursor-pointer"
                    >
                      Konfigurasi Sheet
                    </button>
                  )}
                </div>
              )}

              {/* Content Area */}
              {!result && !loading && (
                <div className="py-24 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                    <FileSearch className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-neutral-700">
                      Belum Ada Dokumen CV yang Diekstrak
                    </p>
                    <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                      Unggah file PDF asli atau tempelkan teks CV kandidat di sebelah kiri, masukkan posisi yang dibuka, lalu klik <b>Ekstrak & Analisa Kecocokan</b>.
                    </p>
                  </div>
                </div>
              )}

              {loading && (
                <div className="py-24 text-center space-y-4">
                  <div className="w-10 h-10 border-2 border-neutral-200 border-t-neutral-900 rounded-full animate-spin mx-auto" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-neutral-800">
                      Membaca Dokumen PDF & Menganalisis Kecocokan...
                    </p>
                    <p className="text-xs text-neutral-500">
                      Mengevaluasi keselarasan profil, riwayat kerja, dan kompetensi kandidat terhadap Job Requirement.
                    </p>
                  </div>
                </div>
              )}

              {result && !loading && activeView === 'visual' && (
                <div className="space-y-4.5">
                  {/* Score & Match Highlight Card */}
                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/60 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded font-semibold border ${getMatchBadgeColor(
                            result.aiMatch
                          )}`}
                        >
                          {result.aiMatch}
                        </span>
                        <span className="text-xs text-neutral-500 font-mono">
                          Target: {result.positionApplied}
                        </span>
                      </div>
                      <div className="text-xs text-neutral-600 font-normal">
                        Tingkat kecocokan kandidat berdasarkan kriteria lowongan
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-bold font-mono text-neutral-900 tracking-tight">
                        {result.aiScore}
                        <span className="text-xs text-neutral-400 font-normal">/99</span>
                      </div>
                      <div className="text-[11px] text-neutral-500 font-mono">
                        Skor AI (15 s/d 99)
                      </div>
                    </div>
                  </div>

                  {/* Candidate Identity */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                      <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
                        <User className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Nama Lengkap</span>
                      </div>
                      <div className="text-xs font-semibold text-neutral-900 truncate">
                        {result.fullName}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                      <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
                        <Mail className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Email</span>
                      </div>
                      <div className="text-xs font-medium text-neutral-800 font-mono truncate">
                        {result.email}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg border border-neutral-200 bg-white">
                      <div className="text-[11px] text-neutral-400 font-medium flex items-center gap-1.5 mb-1">
                        <Phone className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Nomor HP</span>
                      </div>
                      <div className="text-xs font-medium text-neutral-800 font-mono truncate">
                        {result.phone}
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3.5 rounded-lg border border-neutral-200 bg-white space-y-1">
                    <h4 className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                      Ringkasan Profil (aiSummary)
                    </h4>
                    <p className="text-xs text-neutral-700 leading-relaxed font-normal">
                      {result.aiSummary}
                    </p>
                  </div>

                  {/* Skills tags */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">
                      Keahlian Teridentifikasi (aiSkills)
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {result.aiSkills.map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="px-2.5 py-0.5 rounded bg-neutral-100 border border-neutral-200 text-neutral-800 text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Experience & Education */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-neutral-200 bg-white space-y-1">
                      <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                        <Briefcase className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Pengalaman Kerja (aiExperience)</span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                        {result.aiExperience}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-neutral-200 bg-white space-y-1">
                      <div className="text-xs font-semibold text-neutral-900 flex items-center gap-1.5">
                        <GraduationCap className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Pendidikan Terakhir (aiEducation)</span>
                      </div>
                      <p className="text-xs text-neutral-600 leading-relaxed font-normal">
                        {result.aiEducation}
                      </p>
                    </div>
                  </div>

                  {/* Strengths & Concerns */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/50 space-y-1">
                      <div className="text-xs font-semibold text-emerald-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Kelebihan (aiStrengths)</span>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed font-normal">
                        {result.aiStrengths}
                      </p>
                    </div>

                    <div className="p-3 rounded-lg border border-amber-200 bg-amber-50/50 space-y-1">
                      <div className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Hal Perlu Diwaspadai (aiConcerns)</span>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed font-normal">
                        {result.aiConcerns}
                      </p>
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div className="p-3.5 rounded-lg border border-indigo-200 bg-indigo-50/40 space-y-1">
                    <div className="text-xs font-semibold text-indigo-900 flex items-center gap-1.5">
                      <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Saran untuk Rekruter (aiRecommendation)</span>
                    </div>
                    <p className="text-xs text-indigo-950 font-medium leading-relaxed">
                      {result.aiRecommendation}
                    </p>
                  </div>
                </div>
              )}

              {result && !loading && activeView === 'json' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-neutral-500 font-mono">
                      Output JSON Murni:
                    </span>
                    <button
                      onClick={handleCopyJson}
                      className="px-2.5 py-1 text-xs rounded bg-neutral-900 text-white font-medium inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Tersalin' : 'Salin JSON'}</span>
                    </button>
                  </div>

                  <pre className="p-4 rounded-lg bg-neutral-900 text-neutral-100 font-mono text-xs overflow-x-auto leading-relaxed max-h-[460px] border border-neutral-800 select-all">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Bottom Non-Persistence Notice */}
            <div className="pt-4 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-400">
              <span className="inline-flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tanpa Simpan: Data CV dan analisis ini tidak disimpan ke database.</span>
              </span>
              <span className="font-mono text-[11px]">Format JSON Standar</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
