import React from 'react';
import { Candidate, Job, Company, User, PipelineStage } from '../../types';
import { StageBadge, PreliminaryBadge } from '../common/StatusBadge';
import {
  Users,
  Sparkles,
  Briefcase,
  Plus,
  ArrowRight,
  Clock,
  CheckCircle2,
  Filter,
} from 'lucide-react';

interface RecruiterDashboardProps {
  currentUser: User;
  candidates: Candidate[];
  jobs: Job[];
  companies: Company[];
  onSelectCandidate: (candidate: Candidate) => void;
  onNavigateTab: (tab: string) => void;
  onOpenAddModal: () => void;
}

export const RecruiterDashboard: React.FC<RecruiterDashboardProps> = ({
  currentUser,
  candidates,
  jobs,
  companies,
  onSelectCandidate,
  onNavigateTab,
  onOpenAddModal,
}) => {
  const myJobs = jobs.filter((j) => j.recruiterId === currentUser.uid || j.jobStatus === 'Open');

  // Pipeline metrics
  const stages: { stage: PipelineStage; label: string; count: number }[] = [
    {
      stage: 'Applied',
      label: 'Applied',
      count: candidates.filter((c) => c.status === 'Applied').length,
    },
    {
      stage: 'Preliminary',
      label: 'Preliminary',
      count: candidates.filter((c) => c.status === 'Preliminary').length,
    },
    {
      stage: 'Screening',
      label: 'Screening',
      count: candidates.filter((c) => c.status === 'Screening').length,
    },
    {
      stage: 'Interview HR',
      label: 'Interview',
      count: candidates.filter(
        (c) => c.status === 'Interview HR' || c.status === 'Interview User'
      ).length,
    },
    {
      stage: 'Offering',
      label: 'Offering',
      count: candidates.filter((c) => c.status === 'Offering').length,
    },
    {
      stage: 'Hired',
      label: 'Hired',
      count: candidates.filter((c) => c.status === 'Hired').length,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top action banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-lg border border-neutral-100">
        <div>
          <h2 className="text-sm font-medium text-neutral-900">
            Pipeline Rekrutmen Aktif
          </h2>
          <p className="text-xs text-neutral-500 font-normal mt-0.5">
            Kelola alur kandidat dari Preliminary Assessment hingga Offering & Hired.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenAddModal}
            className="px-3 py-1.5 text-xs rounded bg-neutral-900 text-white hover:bg-neutral-800 transition-colors inline-flex items-center gap-1.5 font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Kandidat (AI CV)</span>
          </button>
        </div>
      </div>

      {/* Pipeline Stage Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {stages.map((stg) => {
          return (
            <div
              key={stg.stage}
              onClick={() => onNavigateTab('candidates')}
              className="p-3 bg-white rounded-lg border border-neutral-100 hover:border-neutral-200 transition-colors cursor-pointer group"
            >
              <div className="flex items-center justify-between text-neutral-400">
                <span className="text-xs font-normal text-neutral-600 truncate">{stg.label}</span>
              </div>
              <div className="mt-2 text-xl font-mono font-medium text-neutral-900 tabular-nums">
                {stg.count}
              </div>
              <div className="mt-1 text-[11px] text-neutral-400 font-normal">
                kandidat
              </div>
            </div>
          );
        })}
      </div>

      {/* Two Columns: My Jobs & Candidate Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left Column: Candidates Requiring Attention (Preliminary / Screening) */}
        <div className="lg:col-span-2 bg-white rounded-lg border border-neutral-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
              Kandidat Masuk & Perlu Review
            </h3>
            <button
              onClick={() => onNavigateTab('candidates')}
              className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 font-normal"
            >
              <span>Semua Kandidat ({candidates.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {candidates.slice(0, 6).map((cdd) => {
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
                      <div className="font-medium text-neutral-900">{cdd.fullName}</div>
                      <div className="text-[11px] text-neutral-400 font-normal">
                        {cdd.position} · {comp?.companyName}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StageBadge stage={cdd.status} />

                    {cdd.aiScore ? (
                      <div className="hidden sm:inline-flex items-center gap-1 font-mono text-[11px] text-neutral-700 tabular-nums">
                        <Sparkles className="w-3 h-3 text-neutral-400" />
                        <span>{cdd.aiScore}/100</span>
                      </div>
                    ) : (
                      <span className="hidden sm:inline text-[11px] text-neutral-400">
                        Belum AI
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Lowongan Saya (My Jobs) */}
        <div className="bg-white rounded-lg border border-neutral-100 p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
              Lowongan Aktif ({myJobs.length})
            </h3>
            <button
              onClick={() => onNavigateTab('my-jobs')}
              className="text-xs text-neutral-500 hover:text-neutral-900 inline-flex items-center gap-1 font-normal"
            >
              <span>Detail</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="divide-y divide-neutral-100">
            {myJobs.slice(0, 5).map((job) => {
              const comp = companies.find((c) => c.id === job.companyId);
              const jobCdds = candidates.filter((c) => c.jobId === job.id);

              return (
                <div key={job.id} className="py-2.5 text-xs space-y-1">
                  <div className="font-medium text-neutral-900 leading-tight">
                    {job.position}
                  </div>
                  <div className="text-[11px] text-neutral-400 font-normal flex items-center justify-between">
                    <span>{comp?.companyName}</span>
                    <span className="font-mono text-neutral-700">{jobCdds.length} pelamar</span>
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
