import React from 'react';
import { User, Company } from '../../types';
import {
  LayoutDashboard,
  Building2,
  Briefcase,
  Users,
  UserCog,
  History,
  Kanban,
  FileCheck,
  Shield,
  Layers,
  LogOut,
  FileSearch,
  FileSpreadsheet,
} from 'lucide-react';
import { GoogleSheetsService } from '../../services/googleSheetsService';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  companies: Company[];
  candidatesCount: number;
  jobsCount: number;
  onLogout: () => void;
  onOpenGoogleSheets?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  onSelectTab,
  companies,
  candidatesCount,
  jobsCount,
  onLogout,
  onOpenGoogleSheets,
}) => {
  const userCompany = companies.find((c) => c.id === currentUser.companyId);

  const adminNav = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'companies', label: 'Perusahaan / Client', icon: Building2, count: companies.length },
    { id: 'jobs', label: 'Recruitment Request / Jobs', icon: Briefcase, count: jobsCount },
    { id: 'candidates', label: 'Database Kandidat (CDD)', icon: Users, count: candidatesCount },
    { id: 'cvextractor', label: 'Ekstrak & Analisa CV', icon: FileSearch },
    { id: 'users', label: 'Kelola Pengguna', icon: UserCog },
  ];

  const recruiterNav = [
    { id: 'dashboard', label: 'Dashboard & Pipeline', icon: Kanban },
    { id: 'candidates', label: 'Database Kandidat (CDD)', icon: Users, count: candidatesCount },
    { id: 'cvextractor', label: 'Ekstrak & Analisa CV', icon: FileSearch },
    { id: 'my-jobs', label: 'Lowongan Saya', icon: Briefcase, count: jobsCount },
    { id: 'logs', label: 'Aktivitas & Log', icon: History },
  ];

  const clientNav = [
    { id: 'dashboard', label: 'Ringkasan Recruitment', icon: LayoutDashboard },
    { id: 'candidates', label: 'Semua Kandidat', icon: Users, count: candidatesCount },
    { id: 'jobs', label: 'Posisi / Job Request', icon: Briefcase, count: jobsCount },
    { id: 'logs', label: 'Timeline Aktivitas', icon: History },
  ];

  let items = recruiterNav;
  if (currentUser.role === 'admin') items = adminNav;
  if (currentUser.role === 'client') items = clientNav;

  return (
    <aside className="w-64 bg-white border-r border-neutral-100 flex flex-col justify-between shrink-0 select-none">
      <div className="p-3.5 space-y-4">
        {/* Role banner card */}
        <div className="p-2.5 rounded border border-neutral-100 bg-neutral-50/50">
          <div className="flex items-center gap-2">
            {currentUser.role === 'admin' && (
              <Shield className="w-3.5 h-3.5 text-neutral-600" />
            )}
            {currentUser.role === 'recruiter' && (
              <FileCheck className="w-3.5 h-3.5 text-neutral-600" />
            )}
            {currentUser.role === 'client' && (
              <Building2 className="w-3.5 h-3.5 text-neutral-600" />
            )}
            <span className="text-xs font-medium text-neutral-800 uppercase tracking-wider">
              {currentUser.role === 'admin' && 'Admin Portal'}
              {currentUser.role === 'recruiter' && 'Recruiter Portal'}
              {currentUser.role === 'client' && 'Client Portal'}
            </span>
          </div>
          <div className="mt-1 text-xs text-neutral-500 font-normal truncate">
            {currentUser.role === 'client' && userCompany
              ? userCompany.companyName
              : currentUser.title || currentUser.name}
          </div>
        </div>

        {/* Menu items */}
        <nav className="space-y-0.5">
          <div className="px-2 py-1 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
            Navigasi Utama
          </div>
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors ${
                  isActive
                    ? 'bg-neutral-100 text-neutral-900 font-medium'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 font-normal'
                }`}
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-neutral-900' : 'text-neutral-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {typeof item.count === 'number' && (
                  <span className="text-[11px] font-mono text-neutral-400 ml-2">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info & Logout */}
      <div className="p-3.5 border-t border-neutral-100 space-y-2">
        {onOpenGoogleSheets && (
          <button
            onClick={onOpenGoogleSheets}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-medium">Google Sheet Sync</span>
            </div>
            <span className={`w-1.5 h-1.5 rounded-full ${GoogleSheetsService.isConfigured() ? 'bg-emerald-500' : 'bg-neutral-300'}`} />
          </button>
        )}

        <button
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded text-xs text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Keluar (Sign Out)</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-neutral-400 pt-1 border-t border-neutral-50">
          <Layers className="w-3.5 h-3.5" />
          <span className="text-[11px]">Linchub ATS v2.4 · Gemini 3.8</span>
        </div>
      </div>
    </aside>
  );
};
