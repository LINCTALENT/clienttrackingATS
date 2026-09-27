import React from 'react';
import { Candidate, Company, Job, User } from '../../types';
import { StageBadge } from '../common/StatusBadge';
import {
  Users,
  Briefcase,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface ClientDashboardProps {
  currentUser: User;
  company: Company | undefined;
  candidates: Candidate[];
  jobs: Job[];
  onNavigateTab: (tab: string) => void;
  onSelectCandidate: (candidate: Candidate) => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({
  currentUser,
  company,
  candidates,
  jobs,
  onNavigateTab,
  onSelectCandidate,
}) => {
  // Filter candidates strictly for this company
  const companyCandidates = candidates.filter((c) => c.companyId === currentUser.companyId);
  const companyJobs = jobs.filter((j) => j.companyId === currentUser.companyId);

  const activeCandidates = companyCandidates.filter(
    (c) => c.status !== 'Hired' && c.status !== 'Rejected' && c.status !== 'Withdrawn'
  );
  const hiredCount = companyCandidates.filter((c) => c.status === 'Hired').length;
  const prelimCount = companyCandidates.filter((c) => c.status === 'Preliminary').length;
  const screeningCount = companyCandidates.filter((c) => c.status === 'Screening').length;
  const interviewHRCount = companyCandidates.filter((c) => c.status === 'Interview HR').length;
  const interviewUserCount = companyCandidates.filter((c) => c.status === 'Interview User').length;
  const offeringCount = companyCandidates.filter((c) => c.status === 'Offering').length;
  const rejectedCount = companyCandidates.filter((c) => c.status === 'Rejected').length;

  return (
    <div className="space-y-6">
      {/* Client Transparency Banner */}
      <div className="p-4 bg-white rounded-lg border border-neutral-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] text-neutral-400 font-normal uppercase tracking-wider">
            Portal Rekrutmen Klien Eksklusif
          </span>
          <h2 className="text-sm font-medium text-neutral-900 mt-0.5">
            {company?.companyName || 'Perusahaan Klien'}
          </h2>
          <p className="text-xs text-neutral-500 font-normal mt-1 leading-relaxed max-w-2xl">
            Akses transparan penuh ke seluruh basis data kandidat yang terhubung dengan perusahaan Anda, mencakup hasil Preliminary Assessment, AI CV Analysis, dan status setiap tahapan wawancara.
          </p>
        </div>

        <button
          onClick={() => onNavigateTab('candidates')}
          className="px-3.5 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 font-medium whitespace-nowrap self-end sm:self-auto"
        >
          <span>Buka Semua Kandidat ({companyCandidates.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Main Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div
          onClick={() => onNavigateTab('candidates')}
          className="p-3.5 bg-white rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-normal">Total Semua Kandidat</span>
            <Users className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700" />
          </div>
          <div className="mt-2 text-xl font-mono font-medium text-neutral-900 tabular-nums">
            {companyCandidates.length}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-normal">
            Database lengkap perusahaan
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('candidates')}
          className="p-3.5 bg-white rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-normal">Kandidat Aktif (Pipeline)</span>
            <Clock className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700" />
          </div>
          <div className="mt-2 text-xl font-mono font-medium text-neutral-900 tabular-nums">
            {activeCandidates.length}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-normal">
            Dalam tahap seleksi
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('candidates')}
          className="p-3.5 bg-white rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-normal">Berhasil Diterima (Hired)</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-mono font-medium text-emerald-700 tabular-nums">
            {hiredCount}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-normal">
            Telah bergabung ke tim Anda
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('jobs')}
          className="p-3.5 bg-white rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-normal">Posisi Terbuka</span>
            <Briefcase className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700" />
          </div>
          <div className="mt-2 text-xl font-mono font-medium text-neutral-900 tabular-nums">
            {companyJobs.length}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-normal">
            Recruitment Request aktif
          </div>
        </div>
      </div>

      {/* Stage Breakdown Grid */}
      <div className="bg-white rounded-lg border border-neutral-100 p-4 space-y-3">
        <h3 className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
          Distribusi Tahapan Rekrutmen
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 pt-1">
          <div className="p-2.5 rounded border border-neutral-100 text-center">
            <div className="text-[11px] text-neutral-400">Preliminary</div>
            <div className="mt-1 font-mono font-medium text-neutral-800 text-sm tabular-nums">
              {prelimCount}
            </div>
          </div>
          <div className="p-2.5 rounded border border-neutral-100 text-center">
            <div className="text-[11px] text-neutral-400">Screening</div>
            <div className="mt-1 font-mono font-medium text-neutral-800 text-sm tabular-nums">
              {screeningCount}
            </div>
          </div>
          <div className="p-2.5 rounded border border-neutral-100 text-center">
            <div className="text-[11px] text-neutral-400">Interview HR</div>
            <div className="mt-1 font-mono font-medium text-neutral-800 text-sm tabular-nums">
              {interviewHRCount}
            </div>
          </div>
          <div className="p-2.5 rounded border border-neutral-100 text-center">
            <div className="text-[11px] text-neutral-400">Interview User</div>
            <div className="mt-1 font-mono font-medium text-neutral-800 text-sm tabular-nums">
              {interviewUserCount}
            </div>
          </div>
          <div className="p-2.5 rounded border border-neutral-100 text-center">
            <div className="text-[11px] text-neutral-400">Offering</div>
            <div className="mt-1 font-mono font-medium text-neutral-800 text-sm tabular-nums">
              {offeringCount}
            </div>
          </div>
          <div className="p-2.5 rounded border border-neutral-100 text-center">
            <div className="text-[11px] text-neutral-400">Hired</div>
            <div className="mt-1 font-mono font-medium text-emerald-700 text-sm tabular-nums">
              {hiredCount}
            </div>
          </div>
          <div className="p-2.5 rounded border border-neutral-100 text-center">
            <div className="text-[11px] text-neutral-400">Rejected</div>
            <div className="mt-1 font-mono font-medium text-neutral-400 text-sm tabular-nums">
              {rejectedCount}
            </div>
          </div>
        </div>
      </div>

      {/* Candidates preview table */}
      <div className="bg-white rounded-lg border border-neutral-100 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
            Kandidat Terbaru Perusahaan Anda
          </h3>
          <button
            onClick={() => onNavigateTab('candidates')}
            className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 font-normal"
          >
            <span>Buka Tabel Lengkap</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="divide-y divide-neutral-100">
          {companyCandidates.length === 0 ? (
            <p className="text-neutral-400 text-xs py-4 text-center">
              Belum ada kandidat yang terhubung dengan perusahaan ini.
            </p>
          ) : (
            companyCandidates.slice(0, 5).map((cdd) => (
              <div
                key={cdd.id}
                onClick={() => onSelectCandidate(cdd)}
                className="py-2.5 flex items-center justify-between text-xs hover:bg-neutral-50 px-1 rounded cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center text-[10px] font-medium text-neutral-700">
                    {cdd.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="font-medium text-neutral-900">{cdd.fullName}</div>
                    <div className="text-[11px] text-neutral-400 font-normal">
                      {cdd.position}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <StageBadge stage={cdd.status} />
                  {cdd.aiScore && (
                    <div className="font-mono text-[11px] text-neutral-700 flex items-center gap-1 tabular-nums">
                      <Sparkles className="w-3 h-3 text-neutral-400" />
                      <span>{cdd.aiScore}/100</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
