import React, { useState } from 'react';
import { ActivityLog, Candidate, Company, User } from '../../types';
import { History, Search, Filter, Clock, User as UserIcon } from 'lucide-react';

interface ActivityLogViewProps {
  logs: ActivityLog[];
  candidates: Candidate[];
  currentUser: User;
}

export const ActivityLogView: React.FC<ActivityLogViewProps> = ({
  logs,
  candidates,
  currentUser,
}) => {
  const [filterAction, setFilterAction] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // If client, only show logs of their candidates
  const visibleLogs = logs.filter((log) => {
    if (currentUser.role === 'client' && currentUser.companyId) {
      const cdd = candidates.find((c) => c.id === log.cddId);
      if (!cdd || cdd.companyId !== currentUser.companyId) return false;
    }

    if (filterAction !== 'all' && log.action !== filterAction) {
      return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchCandidate = log.candidateName?.toLowerCase().includes(q);
      const matchAction = log.action.toLowerCase().includes(q);
      const matchDetails = log.details?.toLowerCase().includes(q);
      if (!matchCandidate && !matchAction && !matchDetails) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-neutral-100">
        <div>
          <h2 className="text-sm font-medium text-neutral-900">
            Riwayat Aktivitas Rekrutmen (Audit Log)
          </h2>
          <p className="text-xs text-neutral-500 font-normal mt-0.5">
            Log permanen untuk seluruh aksi verifikasi, penilaian, analisis AI, dan perpindahan status.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari aktivitas..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded border border-neutral-200 focus:outline-none focus:border-neutral-900"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.target.value)}
              className="py-1.5 px-2 text-xs rounded border border-neutral-200 bg-white focus:outline-none focus:border-neutral-900"
            >
              <option value="all">Semua Aksi</option>
              <option value="Candidate Added">Candidate Added</option>
              <option value="CV Uploaded">CV Uploaded</option>
              <option value="AI Analysis Completed">AI Analysis Completed</option>
              <option value="Preliminary Completed">Preliminary Completed</option>
              <option value="Status Changed">Status Changed</option>
              <option value="Candidate Hired">Candidate Hired</option>
              <option value="Candidate Rejected">Candidate Rejected</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-neutral-100 p-5">
        <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-px before:bg-neutral-200">
          {visibleLogs.length === 0 ? (
            <p className="text-neutral-400 text-xs py-4 text-center">
              Tidak ditemukan catatan log aktivitas.
            </p>
          ) : (
            visibleLogs.map((log) => (
              <div key={log.id} className="relative group">
                <div className="absolute -left-6 top-1.5 w-2.5 h-2.5 rounded-full bg-white border-2 border-neutral-400 group-hover:border-neutral-900 transition-colors" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-900 text-xs">
                      {log.action}
                    </span>
                    {log.candidateName && (
                      <>
                        <span className="text-neutral-300 text-xs">·</span>
                        <span className="font-normal text-neutral-700 text-xs">
                          {log.candidateName}
                        </span>
                      </>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400 tabular-nums">
                    {new Date(log.timestamp).toLocaleString('id-ID', {
                      day: '2-digit',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>

                <div className="text-neutral-600 text-xs font-normal mt-0.5 leading-relaxed">
                  {log.details || 'Aktivitas terekam di sistem Linchub ATS'}
                </div>

                <div className="text-[10px] text-neutral-400 mt-1 flex items-center gap-1.5">
                  <UserIcon className="w-3 h-3 text-neutral-400" />
                  <span>Oleh: {log.performedBy} ({log.role || 'user'})</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
