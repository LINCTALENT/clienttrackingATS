import React, { useState } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  DownloadCloud,
  X,
  Code2,
  HelpCircle,
  Sparkles,
} from 'lucide-react';
import { GoogleSheetsService, GoogleSheetsConfig } from '../../services/googleSheetsService';
import { Candidate, Company, Job, User, AuditLog } from '../../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: {
    companies: Company[];
    jobs: Job[];
    candidates: Candidate[];
    users: User[];
    logs: AuditLog[];
  };
  onDataRefresh: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  data,
  onDataRefresh,
}) => {
  const [config, setConfig] = useState<GoogleSheetsConfig>(GoogleSheetsService.getConfig());
  const [scriptUrlInput, setScriptUrlInput] = useState(config.scriptUrl || '');
  const [autoSyncInput, setAutoSyncInput] = useState(config.autoSync || false);

  const [activeTab, setActiveTab] = useState<'config' | 'code' | 'guide'>('config');
  const [testing, setTesting] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [backupResult, setBackupResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  if (!isOpen) return null;

  const scriptCode = GoogleSheetsService.getAppsScriptTemplate();

  const handleSaveConfig = () => {
    const updated: GoogleSheetsConfig = {
      ...config,
      scriptUrl: scriptUrlInput.trim(),
      autoSync: autoSyncInput,
    };
    GoogleSheetsService.saveConfig(updated);
    setConfig(updated);
    setTestResult({ success: true, message: 'Pengaturan Google Sheets berhasil disimpan!' });
  };

  const handleTestConnection = async () => {
    if (!scriptUrlInput.trim()) {
      setTestResult({ success: false, message: 'Silakan isi URL Web App Google Apps Script terlebih dahulu.' });
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await GoogleSheetsService.testConnection(scriptUrlInput.trim());
      setTestResult(res);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setTestResult({ success: false, message: `Gagal: ${msg}` });
    } finally {
      setTesting(false);
    }
  };

  const handleBackupNow = async () => {
    if (!scriptUrlInput.trim()) {
      setBackupResult({ success: false, message: 'Isi URL Web App Google Apps Script sebelum melakukan backup.' });
      return;
    }
    // Save config first
    handleSaveConfig();

    setBackingUp(true);
    setBackupResult(null);
    try {
      const res = await GoogleSheetsService.backupAllToSheet(data);
      setBackupResult(res);
      setConfig(GoogleSheetsService.getConfig());
      onDataRefresh();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setBackupResult({ success: false, message: `Backup gagal: ${msg}` });
    } finally {
      setBackingUp(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
      <div className="w-full max-w-3xl bg-white rounded-xl border border-neutral-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-neutral-100 flex items-center justify-between bg-neutral-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900 flex items-center gap-1.5">
                <span>Integrasi Google Sheets & Apps Script Backend</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  {GoogleSheetsService.isConfigured() ? 'Terkoneksi' : 'Siap Konfigurasi'}
                </span>
              </h2>
              <p className="text-[11px] text-neutral-500 font-normal">
                Simpan hasil analisis CV, backup otomatis database lowongan, kandidat, dan log ke Spreadsheet.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-5 border-b border-neutral-200 flex items-center gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('config')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'config'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Pengaturan & Sinkronisasi
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'code'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Salin Kode Apps Script (Code.gs)</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`py-2.5 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Panduan Pasang (1 Menit)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs">
          {activeTab === 'config' && (
            <div className="space-y-4">
              {/* Status Alert */}
              {backupResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                    backupResult.success
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800'
                  }`}
                >
                  {backupResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{backupResult.message}</span>
                </div>
              )}

              {testResult && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2 ${
                    testResult.success
                      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border-rose-200 bg-rose-50 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}

              {/* Form Input */}
              <div className="p-4 rounded-lg border border-neutral-200 space-y-3 bg-neutral-50/30">
                <div>
                  <label className="block text-xs font-semibold text-neutral-800 mb-1">
                    URL Web App Google Apps Script *
                  </label>
                  <input
                    type="url"
                    value={scriptUrlInput}
                    onChange={(e) => setScriptUrlInput(e.target.value)}
                    placeholder="https://script.google.com/macros/s/.../exec"
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-neutral-300 focus:outline-none focus:border-neutral-900 bg-white"
                  />
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Dapatkan URL ini dari menu Deployment Google Apps Script pada Spreadsheet Anda (lihat tab <b>Panduan Pasang</b>).
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="autoSync"
                    checked={autoSyncInput}
                    onChange={(e) => setAutoSyncInput(e.target.checked)}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-0 cursor-pointer"
                  />
                  <label htmlFor="autoSync" className="text-xs text-neutral-700 cursor-pointer">
                    <b>Aktifkan Auto-Backup:</b> Setiap kali ganti menu fitur atau menambah/mengedit data, otomatis perbarui Google Sheets.
                  </label>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-200/80">
                  <div className="text-[11px] text-neutral-500">
                    Terakhir disinkronkan:{' '}
                    <span className="font-mono text-neutral-700">
                      {config.lastSync ? new Date(config.lastSync).toLocaleString('id-ID') : 'Belum pernah'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={testing}
                      onClick={handleTestConnection}
                      className="px-3 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-medium transition-colors cursor-pointer"
                    >
                      {testing ? 'Menguji...' : 'Uji Koneksi'}
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveConfig}
                      className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium transition-colors cursor-pointer"
                    >
                      Simpan Pengaturan
                    </button>
                  </div>
                </div>
              </div>

              {/* Data Summary & Action Buttons */}
              <div className="p-4 rounded-lg border border-neutral-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold text-neutral-800">
                    Cakupan Sinkronisasi Data Master Linchub
                  </h3>
                  <span className="text-[11px] text-neutral-500">
                    Total: {data.candidates.length} Kandidat · {data.jobs.length} Lowongan · {data.companies.length} Perusahaan
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2.5 rounded bg-emerald-50/60 border border-emerald-100">
                    <div className="font-medium text-emerald-900">Hasil_Analisa_CV</div>
                    <div className="text-emerald-700 text-[10px]">Tersimpan instan saat analisis</div>
                  </div>
                  <div className="p-2.5 rounded bg-blue-50/60 border border-blue-100">
                    <div className="font-medium text-blue-900">Kandidat_CDD ({data.candidates.length})</div>
                    <div className="text-blue-700 text-[10px]">Profil, kontak, tahapan, skor</div>
                  </div>
                  <div className="p-2.5 rounded bg-indigo-50/60 border border-indigo-100">
                    <div className="font-medium text-indigo-900">Lowongan_Jobs ({data.jobs.length})</div>
                    <div className="text-indigo-700 text-[10px]">Posisi, syarat, departemen</div>
                  </div>
                  <div className="p-2.5 rounded bg-teal-50/60 border border-teal-100">
                    <div className="font-medium text-teal-900">Perusahaan_Clients ({data.companies.length})</div>
                    <div className="text-teal-700 text-[10px]">Daftar PT klien dan PIC</div>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <div className="font-medium text-slate-800">Users_Pengguna ({data.users.length})</div>
                    <div className="text-slate-600 text-[10px]">Admin, recruiter, dan akses PT</div>
                  </div>
                  <div className="p-2.5 rounded bg-amber-50/60 border border-amber-100">
                    <div className="font-medium text-amber-900">Activity_Logs</div>
                    <div className="text-amber-700 text-[10px]">Riwayat aktivitas & audit trail</div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-neutral-100">
                  <div className="flex items-center gap-1.5 text-neutral-500 text-[11px]">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Format tabel otomatis rapi dan berwarna sesuai standar spreadsheet.</span>
                  </div>

                  <button
                    type="button"
                    disabled={backingUp || !scriptUrlInput.trim()}
                    onClick={handleBackupNow}
                    className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors flex items-center justify-center gap-1.5 shadow-xs disabled:opacity-50 cursor-pointer"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>{backingUp ? 'Sedang Membackup...' : 'Backup Semua Data Sekarang'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-semibold text-neutral-900">
                    Kode Lengkap Google Apps Script (Code.gs)
                  </h3>
                  <p className="text-[11px] text-neutral-500">
                    Otomatis membuat tab, memberi warna header, mengatur kolom, dan menerima data dari web ATS.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="px-3 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white font-medium transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
                >
                  {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedCode ? 'Tersalin ke Clipboard!' : 'Salin Seluruh Kode'}</span>
                </button>
              </div>

              <div className="relative rounded-lg border border-neutral-200 overflow-hidden bg-neutral-900 text-neutral-100 font-mono text-[11px]">
                <pre className="p-3.5 overflow-x-auto max-h-80 select-all leading-relaxed">
                  {scriptCode}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'guide' && (
            <div className="space-y-3 text-xs leading-relaxed text-neutral-700">
              <div className="p-3 bg-neutral-50 rounded-lg border border-neutral-200 font-medium text-neutral-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Langkah Cepat Memasang Backend Google Sheets (Hanya 1 Menit):</span>
              </div>

              <ol className="list-decimal pl-5 space-y-2 text-[12px]">
                <li>
                  Buka Google Sheets baru di browser Anda melalui{' '}
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 underline font-medium inline-flex items-center gap-0.5"
                  >
                    <span>sheets.new</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  . Beri nama misal <i>Linchub ATS Master Database</i>.
                </li>
                <li>
                  Klik menu atas: <b>Ekstensi (Extensions)</b> &gt; <b>Apps Script</b>.
                </li>
                <li>
                  Buka tab <b>Salin Kode Apps Script</b> di modal ini, klik tombol <b>Salin Seluruh Kode</b>, lalu paste (tempel) di editor Apps Script menggantikan kode bawaan.
                </li>
                <li>
                  Klik tombol <b>Simpan (Save / Ikon Disket)</b>.
                </li>
                <li>
                  Di kanan atas editor Apps Script, klik tombol biru <b>Terapkan (Deploy)</b> &gt; <b>Deployment baru (New deployment)</b>.
                </li>
                <li>
                  Klik ikon gear di sebelah &quot;Pilih jenis&quot; &gt; pilih <b>Aplikasi web (Web app)</b>.
                  <ul className="list-disc pl-5 mt-1 space-y-0.5 text-[11px] text-neutral-600">
                    <li><b>Deskripsi:</b> Linchub ATS API</li>
                    <li><b>Jalankan sebagai:</b> Saya (Me)</li>
                    <li><b>Yang memiliki akses:</b> <b>Siapa saja (Anyone)</b> <i>(Wajib agar web ATS dapat mengirim data tanpa login terpisah)</i>.</li>
                  </ul>
                </li>
                <li>
                  Klik <b>Terapkan (Deploy)</b>, berikan izin akses akun Google Anda jika diminta (Klik <i>Lanjutan / Advanced</i> &gt; <i>Buka project (tidak aman)</i>).
                </li>
                <li>
                  Salin <b>URL Aplikasi Web</b> yang berakhiran <code>/exec</code>, kembali ke menu ini pada tab <b>Pengaturan</b>, paste URL tersebut, dan klik <b>Simpan Pengaturan</b>!
                </li>
              </ol>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
          <div className="text-[11px] text-neutral-500">
            {config.scriptUrl ? '✓ URL Web App Terpasang' : 'Belum Terhubung'}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-neutral-300 hover:bg-neutral-100 text-neutral-700 font-medium transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
