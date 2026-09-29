import { CVExtractionAnalysis, Candidate, Job, Company, User, ActivityLog } from '../types';

export interface GoogleSheetsConfig {
  scriptUrl: string;
  autoSync: boolean;
  lastSync: string | null;
  sheetName?: string;
}

const STORAGE_KEY = 'linchub_google_sheets_config';
const SAVED_ANALYSES_KEY = 'linchub_saved_cv_analyses';

export interface SavedAnalysisRecord {
  id: string;
  timestamp: string;
  candidateName: string;
  position: string;
  email: string;
  phone: string;
  score: number;
  matchStatus: string;
  summary: string;
  skills: string[];
  experience: string;
  education: string;
  strengths: string;
  concerns: string;
  recommendation: string;
  syncedToSheet?: boolean;
}

export const GoogleSheetsService = {
  getConfig(): GoogleSheetsConfig {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch {
      // fallback
    }
    return {
      scriptUrl: '',
      autoSync: false,
      lastSync: null,
      sheetName: 'Linchub ATS Master Database',
    };
  },

  saveConfig(config: GoogleSheetsConfig): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    } catch {
      // ignore
    }
  },

  isConfigured(): boolean {
    const cfg = this.getConfig();
    return Boolean(cfg.scriptUrl && cfg.scriptUrl.trim().startsWith('http'));
  },

  getSavedAnalyses(): SavedAnalysisRecord[] {
    try {
      const raw = localStorage.getItem(SAVED_ANALYSES_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      // fallback
    }
    return [];
  },

  saveLocalAnalysis(analysis: CVExtractionAnalysis, position: string): SavedAnalysisRecord {
    const list = this.getSavedAnalyses();
    const record: SavedAnalysisRecord = {
      id: `analysis-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      candidateName: analysis.fullName || 'Tanpa Nama',
      position: position || analysis.positionApplied || 'Umum',
      email: analysis.email || '-',
      phone: analysis.phone || '-',
      score: analysis.aiScore || 0,
      matchStatus: analysis.aiMatch || '-',
      summary: analysis.aiSummary || '-',
      skills: analysis.aiSkills || [],
      experience: analysis.aiExperience || '-',
      education: analysis.aiEducation || '-',
      strengths: analysis.aiStrengths || '-',
      concerns: analysis.aiConcerns || '-',
      recommendation: analysis.aiRecommendation || '-',
      syncedToSheet: false,
    };

    list.unshift(record);
    const trimmed = list.slice(0, 100);
    localStorage.setItem(SAVED_ANALYSES_KEY, JSON.stringify(trimmed));
    return record;
  },

  updateLocalAnalysisSync(id: string, synced: boolean) {
    const list = this.getSavedAnalyses();
    const updated = list.map((item) => (item.id === id ? { ...item, syncedToSheet: synced } : item));
    localStorage.setItem(SAVED_ANALYSES_KEY, JSON.stringify(updated));
  },

  /**
   * Save a single CV analysis result to Google Sheet
   */
  async saveAnalysisToSheet(
    analysis: CVExtractionAnalysis,
    position: string,
    additionalNotes: string = ''
  ): Promise<{ success: boolean; message: string }> {
    const config = this.getConfig();
    const record = this.saveLocalAnalysis(analysis, position);

    if (!this.isConfigured()) {
      return {
        success: false,
        message: 'Hasil analisis tersimpan di riwayat aplikasi. Hubungkan URL Google Apps Script di menu konfigurasi untuk sinkronisasi otomatis ke Google Sheets.',
      };
    }

    try {
      const payload = {
        action: 'save_analysis',
        data: {
          timestamp: new Date().toLocaleString('id-ID'),
          nama: record.candidateName,
          posisi: record.position,
          email: record.email,
          telepon: record.phone,
          skor: record.score,
          statusCocok: record.matchStatus,
          rekomendasi: record.recommendation,
          ringkasan: record.summary,
          keahlian: record.skills.join(', '),
          pengalaman: record.experience,
          pendidikan: record.education,
          kelebihan: record.strengths,
          catatan: record.concerns,
          catatanTambahan: additionalNotes,
        },
      };

      await fetch(config.scriptUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
        mode: 'no-cors',
      });

      this.updateLocalAnalysisSync(record.id, true);
      this.saveConfig({ ...config, lastSync: new Date().toISOString() });

      return {
        success: true,
        message: 'Hasil analisis CV berhasil disimpan ke tab "Hasil_Analisa_CV" di Google Sheets Anda!',
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Gagal mengirim data ke Google Sheets: ${errMsg}`,
      };
    }
  },

  /**
   * Backup all ATS menus & databases to Google Sheets
   */
  async backupAllToSheet(data: {
    companies: Company[];
    jobs: Job[];
    candidates: Candidate[];
    users: User[];
    logs: ActivityLog[];
  }): Promise<{ success: boolean; message: string; timestamp: string }> {
    const config = this.getConfig();
    if (!this.isConfigured()) {
      throw new Error('URL Google Apps Script belum dikonfigurasi. Silakan isi URL Web App terlebih dahulu.');
    }

    const analyses = this.getSavedAnalyses();

    const payload = {
      action: 'backup_all',
      timestamp: new Date().toLocaleString('id-ID'),
      data: {
        companies: data.companies.map((c) => ({
          ID: c.id,
          Perusahaan: c.companyName,
          Industri: c.industry,
          Lokasi: c.location,
          Kontak_Email: c.contactEmail || '-',
          Total_Lowongan: c.activeJobsCount || 0,
          Total_Kandidat: c.totalCandidatesCount || 0,
          Tanggal_Dibuat: c.createdAt,
        })),
        jobs: data.jobs.map((j) => {
          const comp = data.companies.find((c) => c.id === j.companyId);
          return {
            ID: j.id,
            Perusahaan: comp ? comp.companyName : j.companyId,
            Posisi: j.position,
            Departemen: j.department,
            Status: j.jobStatus,
            Target_Hires: j.targetHires || 1,
            Persyaratan: (j.requirements || []).join('; '),
            Deskripsi: j.jobDescription || '-',
            Tanggal_Posting: j.createdAt,
          };
        }),
        candidates: data.candidates.map((c) => {
          const comp = data.companies.find((compItem) => compItem.id === c.companyId);
          return {
            ID: c.id,
            Nama: c.fullName,
            Perusahaan_Tujuan: comp ? comp.companyName : c.companyId,
            Posisi_Dilamar: c.position,
            Email: c.email,
            No_WhatsApp: c.phone,
            Tahapan_Status: c.status,
            Skor_AI_CV: c.aiScore || '-',
            Status_AI: c.aiMatch || '-',
            Rekomendasi_AI: c.aiRecommendation || '-',
            Skor_Preliminary: c.preliminaryScore || '-',
            Hasil_Preliminary: c.preliminaryStatus || '-',
            Ringkasan_AI: c.aiSummary || '-',
            Tanggal_Masuk: c.createdAt,
          };
        }),
        analyses: analyses.map((a) => ({
          Waktu_Analisis: a.timestamp,
          Nama_Kandidat: a.candidateName,
          Posisi_Target: a.position,
          Email: a.email,
          Telepon: a.phone,
          Skor_Kecocokan: a.score,
          Status_Kesesuaian: a.matchStatus,
          Rekomendasi: a.recommendation,
          Ringkasan: a.summary,
          Keahlian: a.skills.join(', '),
          Pengalaman: a.experience,
          Pendidikan: a.education,
          Kelebihan: a.strengths,
          Catatan_Perhatian: a.concerns,
        })),
        users: data.users.map((u) => {
          const comp = data.companies.find((c) => c.id === u.companyId);
          return {
            UID: u.uid,
            Nama: u.name,
            Email: u.email,
            Role: u.role,
            Jabatan: u.title || '-',
            Perusahaan: comp ? comp.companyName : (u.role === 'client' ? 'Belum ditautkan' : 'Internal Linchub'),
            Tanggal_Daftar: u.createdAt,
          };
        }),
        logs: data.logs.slice(0, 100).map((l) => ({
          Waktu: l.timestamp,
          Pengguna: l.performedBy,
          Role: l.role || '-',
          Kandidat: l.candidateName || '-',
          Aktivitas: l.action,
          Detail: l.details || '-',
        })),
      },
    };

    await fetch(config.scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
      mode: 'no-cors',
    });

    const nowStr = new Date().toISOString();
    this.saveConfig({ ...config, lastSync: nowStr });

    return {
      success: true,
      message: `Seluruh data (${data.candidates.length} kandidat, ${data.jobs.length} lowongan, ${data.companies.length} perusahaan, ${analyses.length} analisis CV) berhasil dibackup ke Google Sheets!`,
      timestamp: nowStr,
    };
  },

  /**
   * Test connection to Google Apps Script Web App
   */
  async testConnection(customUrl?: string): Promise<{ success: boolean; message: string }> {
    const url = customUrl || this.getConfig().scriptUrl;
    if (!url || !url.trim().startsWith('http')) {
      return {
        success: false,
        message: 'URL Web App tidak valid. Pastikan diawali dengan https://script.google.com/...',
      };
    }

    try {
      await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify({ action: 'ping', timestamp: new Date().toISOString() }),
        mode: 'no-cors',
      });

      return {
        success: true,
        message: 'Koneksi ke Google Apps Script Web App berhasil terhubung!',
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      return {
        success: false,
        message: `Koneksi gagal: ${errMsg}`,
      };
    }
  },

  /**
   * Complete Google Apps Script template code
   */
  getAppsScriptTemplate(): string {
    return `/**
 * LINCHUB ATS - GOOGLE APPS SCRIPT WEB APP BACKEND & AUTO-BACKUP
 * 
 * Petunjuk Pemasangan Cepat:
 * 1. Buat Spreadsheet baru di Google Sheets (https://sheets.new)
 * 2. Beri nama spreadsheet, misal: "Linchub ATS Master Database"
 * 3. Klik menu: Ekstensi > Apps Script
 * 4. Hapus seluruh isi kode bawaan, lalu paste (tempel) KODE LENGKAP ini
 * 5. Klik Simpan (ikon disket)
 * 6. Klik tombol "Terapkan" (Deploy) di kanan atas > "Deployment Baru" (New Deployment)
 * 7. Pilih Jenis: "Aplikasi Web" (Web App)
 *    - Deskripsi: "Linchub ATS API"
 *    - Jalankan sebagai: "Saya" (Me)
 *    - Yang memiliki akses: "Siapa saja" (Anyone) -> PENTING agar web ATS bisa mengirim data!
 * 8. Klik "Terapkan", berikan izin akses Google akun Anda jika diminta
 * 9. Salin URL Aplikasi Web yang dihasilkan (berakhiran /exec)
 * 10. Buka Linchub ATS > Menu Konfigurasi Google Sheets > Paste URL Web App tersebut > Klik Simpan!
 */

function doPost(e) {
  try {
    var contents = e.postData.contents;
    var payload = JSON.parse(contents);
    var action = payload.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    if (action === 'ping') {
      return createJsonResponse({ status: 'success', message: 'Linchub ATS Webhook is Online!' });
    }

    // 1. Simpan Single Hasil Analisis CV
    if (action === 'save_analysis') {
      var sheet = getOrCreateSheet(ss, 'Hasil_Analisa_CV', [
        'Waktu_Analisis',
        'Nama_Kandidat',
        'Posisi_Target',
        'Email',
        'No_HP_WhatsApp',
        'Skor_AI',
        'Status_Kesesuaian',
        'Rekomendasi',
        'Ringkasan_AI',
        'Keahlian',
        'Pengalaman',
        'Pendidikan',
        'Kelebihan',
        'Catatan_Gap',
        'Catatan_Tambahan'
      ], '#10b981');

      var d = payload.data;
      sheet.appendRow([
        d.timestamp || new Date().toLocaleString('id-ID'),
        d.nama || '-',
        d.posisi || '-',
        d.email || '-',
        d.telepon || '-',
        d.skor || 0,
        d.statusCocok || '-',
        d.rekomendasi || '-',
        d.ringkasan || '-',
        d.keahlian || '-',
        d.pengalaman || '-',
        d.pendidikan || '-',
        d.kelebihan || '-',
        d.catatan || '-',
        d.catatanTambahan || '-'
      ]);

      return createJsonResponse({ status: 'success', message: 'Analisis CV berhasil dicatat di Sheet.' });
    }

    // 2. Full Backup Semua Data Menu ATS
    if (action === 'backup_all') {
      var allData = payload.data;

      // Tab Hasil Analisis CV
      if (allData.analyses && allData.analyses.length > 0) {
        var sAnalyses = getOrCreateSheet(ss, 'Hasil_Analisa_CV', [
          'Waktu_Analisis', 'Nama_Kandidat', 'Posisi_Target', 'Email', 'No_HP_WhatsApp',
          'Skor_Kecocokan', 'Status_Kesesuaian', 'Rekomendasi', 'Ringkasan', 'Keahlian',
          'Pengalaman', 'Pendidikan', 'Kelebihan', 'Catatan_Perhatian'
        ], '#10b981');
        writeTableData(sAnalyses, allData.analyses);
      }

      // Tab Database Kandidat (CDD)
      if (allData.candidates && allData.candidates.length > 0) {
        var sCandidates = getOrCreateSheet(ss, 'Kandidat_CDD', [
          'ID', 'Nama', 'Perusahaan_Tujuan', 'Posisi_Dilamar', 'Email', 'No_WhatsApp',
          'Tahapan_Status', 'Skor_AI_CV', 'Status_AI', 'Rekomendasi_AI', 'Skor_Preliminary',
          'Hasil_Preliminary', 'Ringkasan_AI', 'Tanggal_Masuk'
        ], '#2563eb');
        writeTableData(sCandidates, allData.candidates);
      }

      // Tab Lowongan Kerja (Jobs)
      if (allData.jobs && allData.jobs.length > 0) {
        var sJobs = getOrCreateSheet(ss, 'Lowongan_Jobs', [
          'ID', 'Perusahaan', 'Posisi', 'Departemen', 'Status', 'Target_Hires',
          'Persyaratan', 'Deskripsi', 'Tanggal_Posting'
        ], '#6366f1');
        writeTableData(sJobs, allData.jobs);
      }

      // Tab Perusahaan (Companies)
      if (allData.companies && allData.companies.length > 0) {
        var sCompanies = getOrCreateSheet(ss, 'Perusahaan_Clients', [
          'ID', 'Perusahaan', 'Industri', 'Lokasi', 'Kontak_Email',
          'Total_Lowongan', 'Total_Kandidat', 'Tanggal_Dibuat'
        ], '#059669');
        writeTableData(sCompanies, allData.companies);
      }

      // Tab Pengguna (Users)
      if (allData.users && allData.users.length > 0) {
        var sUsers = getOrCreateSheet(ss, 'Users_Pengguna', [
          'UID', 'Nama', 'Email', 'Role', 'Jabatan', 'Perusahaan', 'Tanggal_Daftar'
        ], '#475569');
        writeTableData(sUsers, allData.users);
      }

      // Tab Log Aktivitas (Activity Logs)
      if (allData.logs && allData.logs.length > 0) {
        var sLogs = getOrCreateSheet(ss, 'Activity_Logs', [
          'Waktu', 'Pengguna', 'Role', 'Kandidat', 'Aktivitas', 'Detail'
        ], '#d97706');
        writeTableData(sLogs, allData.logs);
      }

      return createJsonResponse({ status: 'success', message: 'Seluruh menu berhasil dibackup ke Google Sheets!' });
    }

    return createJsonResponse({ status: 'error', message: 'Aksi tidak dikenal' });
  } catch (error) {
    return createJsonResponse({ status: 'error', message: error.toString() });
  }
}

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'info';
  if (action === 'ping') {
    return createJsonResponse({ status: 'success', message: 'Linchub ATS Google Apps Script Engine is Running!' });
  }
  return createJsonResponse({
    status: 'success',
    app: 'Linchub ATS Google Sheets Integration',
    version: '2.5.0',
    timestamp: new Date().toISOString()
  });
}

/**
 * Helper: Ambil atau Buat Tab Sheet beserta Format Header
 */
function getOrCreateSheet(ss, name, headers, headerColor) {
  var sheet = ss.getSheetByName(name);
  if (!sheet) {
    sheet = ss.insertSheet(name);
    sheet.appendRow(headers);
    var range = sheet.getRange(1, 1, 1, headers.length);
    range.setBackground(headerColor || '#1e293b');
    range.setFontColor('#ffffff');
    range.setFontWeight('bold');
    range.setFontSize(10);
    range.setHorizontalAlignment('center');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

/**
 * Helper: Tulis Data Array of Object ke Sheet (Replace / Update)
 */
function writeTableData(sheet, dataList) {
  if (!dataList || dataList.length === 0) return;
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();

  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];

  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, lastCol).clearContent();
  }

  var rows = [];
  for (var i = 0; i < dataList.length; i++) {
    var item = dataList[i];
    var row = [];
    for (var h = 0; h < headers.length; h++) {
      var key = headers[h];
      var val = item[key] !== undefined ? item[key] : (item[key.toLowerCase()] !== undefined ? item[key.toLowerCase()] : '');
      row.push(val);
    }
    rows.push(row);
  }

  if (rows.length > 0) {
    sheet.getRange(2, 1, rows.length, headers.length).setValues(rows);
    for (var col = 1; col <= headers.length; col++) {
      sheet.autoResizeColumn(col);
    }
  }
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
  },
};
