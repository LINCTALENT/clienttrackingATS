import React, { useState } from 'react';
import { User, Company } from '../../types';
import {
  ShieldCheck,
  UserCheck,
  Building2,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Check,
  LogOut,
  RefreshCw,
  FileSpreadsheet,
} from 'lucide-react';
import { GoogleSheetsService } from '../../services/googleSheetsService';

interface NavbarProps {
  currentUser: User;
  onSelectUser: (user: User) => void;
  users: User[];
  companies: Company[];
  onResetData: () => void;
  onLogout: () => void;
  onRefreshAll?: () => void;
  onOpenGoogleSheets?: () => void;
  isRefreshing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  onSelectUser,
  users,
  companies,
  onResetData,
  onLogout,
  onRefreshAll,
  onOpenGoogleSheets,
  isRefreshing,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const isSheetConfigured = GoogleSheetsService.isConfigured();

  const getCompany = (companyId: string | null) => {
    if (!companyId) return null;
    return companies.find((c) => c.id === companyId);
  };

  const currentCompany = getCompany(currentUser.companyId);

  return (
    <header className="h-14 bg-white border-b border-neutral-100 px-5 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Zone 1: Brand Wordmark */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-neutral-900 flex items-center justify-center text-white text-xs font-medium tracking-tight">
            L
          </div>
          <span className="text-sm font-medium tracking-tight text-neutral-900">
            Linchub ATS
          </span>
        </div>
        <span className="text-neutral-300 text-xs">/</span>
        <span className="text-xs font-normal text-neutral-500 hidden sm:inline">
          {currentUser.role === 'admin' && 'Admin Operations'}
          {currentUser.role === 'recruiter' && 'Recruiter Workspace'}
          {currentUser.role === 'client' && (currentCompany ? `${currentCompany.companyName} Portal` : 'Client Portal')}
        </span>
      </div>

      {/* Zone 2: Context indicator */}
      <div className="hidden md:flex items-center gap-2 text-xs text-neutral-500 font-normal">
        <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-neutral-50 border border-neutral-100 text-neutral-600">
          <Sparkles className="w-3 h-3 text-neutral-400" />
          <span>Gemini AI Engine Active</span>
        </span>
      </div>

      {/* Zone 3: Controls, Refresh, Google Sheets & Role Switcher */}
      <div className="flex items-center gap-2">
        {/* Refresh All Button */}
        {onRefreshAll && (
          <button
            onClick={onRefreshAll}
            disabled={isRefreshing}
            title="Refresh semua data & sinkronkan"
            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 text-neutral-700 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-neutral-900' : 'text-neutral-500'}`} />
            <span className="hidden sm:inline">Refresh Data</span>
          </button>
        )}

        {/* Google Sheets Integration Button */}
        {onOpenGoogleSheets && (
          <button
            onClick={onOpenGoogleSheets}
            title="Konfigurasi & Backup Google Sheets"
            className={`px-2.5 py-1.5 rounded-lg border text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
              isSheetConfigured
                ? 'border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800'
                : 'border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 text-neutral-700'
            }`}
          >
            <FileSpreadsheet className={`w-3.5 h-3.5 ${isSheetConfigured ? 'text-emerald-600' : 'text-neutral-500'}`} />
            <span className="hidden sm:inline">Google Sheet</span>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                isSheetConfigured ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-300'
              }`}
            />
          </button>
        )}

        <button
          onClick={onResetData}
          title="Reset ke data awal"
          className="p-1.5 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 rounded transition-colors text-xs flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden lg:inline text-xs">Reset</span>
        </button>

        {/* Role Switcher Popover */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded hover:bg-neutral-50 border border-neutral-200 transition-colors text-xs text-left"
          >
            <div className="w-5 h-5 rounded-full bg-neutral-100 flex items-center justify-center text-[10px] font-medium text-neutral-700">
              {currentUser.name.charAt(0)}
            </div>
            <div className="hidden sm:block">
              <div className="font-medium text-neutral-800 leading-tight">
                {currentUser.name}
              </div>
              <div className="text-[11px] text-neutral-400 capitalize">
                {currentUser.role === 'client' ? 'Client Access' : currentUser.role}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400 ml-1" />
          </button>

          {dropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setDropdownOpen(false)}
              />
              <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-lg border border-neutral-200 shadow-sm py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[11px] font-medium text-neutral-400 uppercase tracking-wider">
                  Ganti Akun & Role
                </div>
                <div className="divide-y divide-neutral-50">
                  {users.map((u) => {
                    const isSelected = u.uid === currentUser.uid;
                    const uCompany = getCompany(u.companyId);

                    return (
                      <button
                        key={u.uid}
                        onClick={() => {
                          onSelectUser(u);
                          setDropdownOpen(false);
                        }}
                        className={`w-full text-left px-3 py-2 flex items-start gap-2.5 hover:bg-neutral-50 text-xs transition-colors ${
                          isSelected ? 'bg-neutral-50/80' : ''
                        }`}
                      >
                        <div className="mt-0.5 w-6 h-6 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center shrink-0 text-neutral-600">
                          {u.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5" />}
                          {u.role === 'recruiter' && <UserCheck className="w-3.5 h-3.5" />}
                          {u.role === 'client' && <Building2 className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-neutral-900 truncate">
                              {u.name}
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0 ml-1" />
                            )}
                          </div>
                          <div className="text-[11px] text-neutral-500 truncate">
                            {u.role === 'client' && uCompany ? uCompany.companyName : u.title || u.role}
                          </div>
                          <div className="text-[10px] text-neutral-400 capitalize mt-0.5">
                            Role: {u.role}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-1 mt-1 border-t border-neutral-100 px-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded hover:bg-rose-50 text-rose-600 text-xs flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Keluar (Sign Out)</span>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        <button
          onClick={onLogout}
          title="Keluar dari akun"
          className="p-1.5 text-neutral-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors text-xs flex items-center gap-1"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden xl:inline text-xs">Logout</span>
        </button>
      </div>
    </header>
  );
};
