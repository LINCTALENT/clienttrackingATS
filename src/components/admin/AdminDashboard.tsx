import React from 'react';
import { Company, Job, Candidate } from '../../types';
import {
  Building2,
  Briefcase,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface AdminDashboardProps {
  companies: Company[];
  jobs: Job[];
  candidates: Candidate[];
  onNavigateTab: (tab: string) => void;
  onSelectCandidate: (candidate: Candidate) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  companies,
  jobs,
  candidates,
  onNavigateTab,
  onSelectCandidate,
}) => {
  const activeJobs = jobs.filter((j) => j.jobStatus === 'Open');
  const hiredCandidates = candidates.filter((c) => c.status === 'Hired');
  const inProcessCandidates = candidates.filter(
    (c) => c.status !== 'Hired' && c.status !== 'Rejected' && c.status !== 'Withdrawn'
  );

  return (
    <div className="space-y-6">
      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div
          onClick={() => onNavigateTab('companies')}
          className="p-3.5 bg-white rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-normal">Total Perusahaan</span>
            <Building2 className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700" />
          </div>
          <div className="mt-2 text-xl font-mono font-medium text-neutral-900 tabular-nums">
            {companies.length}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-normal">
            Klien aktif Linchub
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('jobs')}
          className="p-3.5 bg-white rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-normal">Active Jobs</span>
            <Briefcase className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700" />
          </div>
          <div className="mt-2 text-xl font-mono font-medium text-neutral-900 tabular-nums">
            {activeJobs.length}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-normal">
            Dari total {jobs.length} request
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('candidates')}
          className="p-3.5 bg-white rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-normal">Total Kandidat (CDD)</span>
            <Users className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700" />
          </div>
          <div className="mt-2 text-xl font-mono font-medium text-neutral-900 tabular-nums">
            {candidates.length}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-normal">
            Database tersimpan
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('candidates')}
          className="p-3.5 bg-white rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-normal">Sedang Berproses</span>
            <Clock className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-700" />
          </div>
          <div className="mt-2 text-xl font-mono font-medium text-neutral-900 tabular-nums">
            {inProcessCandidates.length}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-normal">
            Tahap seleksi & interview
          </div>
        </div>

        <div
          onClick={() => onNavigateTab('candidates')}
          className="p-3.5 bg-white rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer group col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-xs font-normal">Kandidat Hired</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="mt-2 text-xl font-mono font-medium text-emerald-700 tabular-nums">
            {hiredCandidates.length}
          </div>
          <div className="mt-1 text-[11px] text-neutral-400 font-normal">
            Penempatan berhasil
          </div>
        </div>
      </div>

      {/* Two Column Layout: Companies & Recent Candidates */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Companies Summary */}
        <div className="bg-white rounded-lg border border-neutral-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
              Perusahaan Klien & Beban Rekrutmen
            </h3>
            <button
              onClick={() => onNavigateTab('companies')}
              className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 font-normal"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {companies.map((comp) => {
              const compJobs = jobs.filter((j) => j.companyId === comp.id);
              const compCandidates = candidates.filter((c) => c.companyId === comp.id);

              return (
                <div key={comp.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-medium text-neutral-800">{comp.companyName}</div>
                    <div className="text-[11px] text-neutral-400 font-normal">
                      {comp.industry} · {comp.location}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-neutral-800">{compCandidates.length} kandidat</span>
                    <div className="text-[11px] text-neutral-400">
                      {compJobs.length} posisi aktif
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Candidates Activity */}
        <div className="bg-white rounded-lg border border-neutral-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
              Kandidat Masuk Terbaru
            </h3>
            <button
              onClick={() => onNavigateTab('candidates')}
              className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 font-normal"
            >
              <span>Database Lengkap</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {candidates.slice(0, 5).map((cdd) => {
              const comp = companies.find((c) => c.id === cdd.companyId);

              return (
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
                      <div className="font-medium text-neutral-800">{cdd.fullName}</div>
                      <div className="text-[11px] text-neutral-400 font-normal">
                        {cdd.position} · {comp?.companyName}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] px-1.5 py-0.5 rounded border border-neutral-200 bg-neutral-50 text-neutral-600">
                      {cdd.status}
                    </span>
                    {cdd.aiScore && (
                      <div className="text-[11px] font-mono text-neutral-500 mt-0.5">
                        AI Score: {cdd.aiScore}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
