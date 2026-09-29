/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Company, Job, Candidate, ActivityLog } from './types';
import { StorageService } from './services/storage';
import { testConnection } from './services/firebase';
import { LoginPage } from './components/auth/LoginPage';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminCompanies } from './components/admin/AdminCompanies';
import { AdminJobs } from './components/admin/AdminJobs';
import { AdminUsers } from './components/admin/AdminUsers';
import { RecruiterDashboard } from './components/recruiter/RecruiterDashboard';
import { ClientDashboard } from './components/client/ClientDashboard';
import { CandidatesList } from './components/candidates/CandidatesList';
import { CandidateDetailModal } from './components/candidates/CandidateDetailModal';
import { AddCandidateModal } from './components/candidates/AddCandidateModal';
import { ActivityLogView } from './components/common/ActivityLogView';
import { ConfirmDeleteModal } from './components/common/ConfirmDeleteModal';
import { CVExtractionAnalyzer } from './components/candidates/CVExtractionAnalyzer';
import { GoogleSheetsModal } from './components/settings/GoogleSheetsModal';
import { GoogleSheetsService } from './services/googleSheetsService';

export default function App() {
  // If not logged in, currentUser is null -> renders LoginPage
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    StorageService.getAuthenticatedUser()
  );

  const [users, setUsers] = useState<User[]>(() => StorageService.getUsers());
  const [companies, setCompanies] = useState<Company[]>(() => StorageService.getCompanies());
  const [jobs, setJobs] = useState<Job[]>(() => StorageService.getJobs());
  const [candidates, setCandidates] = useState<Candidate[]>(() => StorageService.getCandidates());
  const [logs, setLogs] = useState<ActivityLog[]>(() => StorageService.getLogs());

  // Navigation tab (defaults to 'dashboard')
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Selected candidate for detail drawer
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);

  // Add Candidate modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  // Reset Demo Data confirmation modal
  const [showResetModal, setShowResetModal] = useState<boolean>(false);
  const [showGoogleSheetsModal, setShowGoogleSheetsModal] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Initial Firebase Cloud Firestore sync
  useEffect(() => {
    testConnection();
    StorageService.syncFromFirestore().then(() => {
      refreshData();
    });
  }, []);

  // Handle Login
  const handleLoginSuccess = (user: User) => {
    StorageService.setAuthenticatedUser(user);
    setCurrentUser(user);
    setActiveTab('dashboard');
    setSelectedCandidate(null);
  };

  // Handle Logout
  const handleLogout = () => {
    StorageService.logout();
    setCurrentUser(null);
    setSelectedCandidate(null);
  };

  // Handle Role / User Switching while in session
  const handleSelectUser = (user: User) => {
    StorageService.setAuthenticatedUser(user);
    setCurrentUser(user);
    setActiveTab('dashboard');
    setSelectedCandidate(null);
  };

  const refreshData = () => {
    setUsers(StorageService.getUsers());
    setCompanies(StorageService.getCompanies());
    setJobs(StorageService.getJobs());
    setCandidates(StorageService.getCandidates());
    setLogs(StorageService.getLogs());

    if (selectedCandidate) {
      const refreshed = StorageService.getCandidateById(selectedCandidate.id);
      if (refreshed) setSelectedCandidate(refreshed);
    }
  };

  // Comprehensive Refresh & Sync
  const handleFullRefresh = async () => {
    setIsRefreshing(true);
    try {
      await StorageService.syncFromFirestore();
      refreshData();
      if (GoogleSheetsService.isConfigured() && GoogleSheetsService.getConfig().autoSync) {
        await GoogleSheetsService.backupAllToSheet({
          companies: StorageService.getCompanies(),
          jobs: StorageService.getJobs(),
          candidates: StorageService.getCandidates(),
          users: StorageService.getUsers(),
          logs: StorageService.getLogs(),
        });
      }
    } catch (e) {
      console.error('Refresh error:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    refreshData();
    // Auto-sync on feature switch if enabled
    if (GoogleSheetsService.isConfigured() && GoogleSheetsService.getConfig().autoSync) {
      GoogleSheetsService.backupAllToSheet({
        companies,
        jobs,
        candidates,
        users,
        logs,
      }).catch(() => {});
    }
  };

  const handleResetData = () => {
    setShowResetModal(true);
  };

  const handleConfirmResetData = () => {
    StorageService.resetDemoData();
    window.location.reload();
  };

  const handleUpdateCandidate = (updated: Candidate) => {
    setSelectedCandidate(updated);
    refreshData();
  };

  const handleCandidateAdded = (newCdd: Candidate) => {
    const performedBy = currentUser ? currentUser.name : 'Recruiter';
    const saved = StorageService.addCandidate(newCdd, performedBy);
    refreshData();
    setSelectedCandidate(saved);
  };

  // IF NOT AUTHENTICATED: Show Login Page
  if (!currentUser) {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        users={users}
        companies={companies}
      />
    );
  }

  // PROTECTED APPLICATION CONTEXT
  const clientCompany = companies.find((c) => c.id === currentUser.companyId);

  // Role Security Isolation:
  // Client only sees candidates and jobs of their own company
  const relevantCandidates =
    currentUser.role === 'client' && currentUser.companyId
      ? candidates.filter((c) => c.companyId === currentUser.companyId)
      : candidates;

  const relevantJobs =
    currentUser.role === 'client' && currentUser.companyId
      ? jobs.filter((j) => j.companyId === currentUser.companyId)
      : jobs;

  return (
    <div className="min-h-screen bg-white text-neutral-800 flex flex-col font-sans selection:bg-neutral-100">
      {/* Top Bar */}
      <Navbar
        currentUser={currentUser}
        onSelectUser={handleSelectUser}
        users={users}
        companies={companies}
        onResetData={handleResetData}
        onLogout={handleLogout}
        onRefreshAll={handleFullRefresh}
        onOpenGoogleSheets={() => setShowGoogleSheetsModal(true)}
        isRefreshing={isRefreshing}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slender Minimalist Sidebar */}
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          onSelectTab={handleTabChange}
          companies={companies}
          candidatesCount={relevantCandidates.length}
          jobsCount={relevantJobs.length}
          onLogout={handleLogout}
          onOpenGoogleSheets={() => setShowGoogleSheetsModal(true)}
        />

        {/* Dynamic Content Viewport */}
        <main className="flex-1 p-5 md:p-7 overflow-y-auto bg-white">
          <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${currentUser.role}-${activeTab}`}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.15, ease: 'easeOut' }}
              >
                {/* ADMIN PORTAL VIEWS */}
                {currentUser.role === 'admin' && (
                  <>
                    {activeTab === 'dashboard' && (
                      <AdminDashboard
                        companies={companies}
                        jobs={jobs}
                        candidates={candidates}
                        onNavigateTab={setActiveTab}
                        onSelectCandidate={setSelectedCandidate}
                      />
                    )}

                    {activeTab === 'companies' && (
                      <AdminCompanies
                        companies={companies}
                        jobs={jobs}
                        candidates={candidates}
                        onCompanyChange={refreshData}
                        onFilterCandidatesByCompany={() => {
                          setActiveTab('candidates');
                        }}
                      />
                    )}

                    {activeTab === 'jobs' && (
                      <AdminJobs
                        jobs={jobs}
                        companies={companies}
                        users={users}
                        candidates={candidates}
                        onJobChange={refreshData}
                        onFilterCandidatesByJob={() => {
                          setActiveTab('candidates');
                        }}
                      />
                    )}

                    {activeTab === 'candidates' && (
                      <CandidatesList
                        candidates={candidates}
                        companies={companies}
                        jobs={jobs}
                        currentUser={currentUser}
                        onSelectCandidate={setSelectedCandidate}
                        onOpenAddModal={() => setShowAddModal(true)}
                        onCandidateChange={refreshData}
                      />
                    )}

                    {activeTab === 'cvextractor' && (
                      <CVExtractionAnalyzer
                        jobs={jobs}
                        companies={companies}
                        onOpenGoogleSheetsModal={() => setShowGoogleSheetsModal(true)}
                      />
                    )}

                    {activeTab === 'users' && (
                      <AdminUsers
                        users={users}
                        companies={companies}
                        onUserChange={refreshData}
                      />
                    )}
                  </>
                )}

                {/* RECRUITER PORTAL VIEWS */}
                {currentUser.role === 'recruiter' && (
                  <>
                    {activeTab === 'dashboard' && (
                      <RecruiterDashboard
                        currentUser={currentUser}
                        candidates={candidates}
                        jobs={jobs}
                        companies={companies}
                        onSelectCandidate={setSelectedCandidate}
                        onNavigateTab={setActiveTab}
                        onOpenAddModal={() => setShowAddModal(true)}
                      />
                    )}

                    {activeTab === 'cvextractor' && (
                      <CVExtractionAnalyzer
                        jobs={jobs}
                        companies={companies}
                        onOpenGoogleSheetsModal={() => setShowGoogleSheetsModal(true)}
                      />
                    )}

                    {activeTab === 'candidates' && (
                      <CandidatesList
                        candidates={candidates}
                        companies={companies}
                        jobs={jobs}
                        currentUser={currentUser}
                        onSelectCandidate={setSelectedCandidate}
                        onOpenAddModal={() => setShowAddModal(true)}
                        onCandidateChange={refreshData}
                      />
                    )}
                    {activeTab === 'my-jobs' && (
                      <AdminJobs
                        jobs={jobs}
                        companies={companies}
                        users={users}
                        candidates={candidates}
                        onJobChange={refreshData}
                        onFilterCandidatesByJob={() => setActiveTab('candidates')}
                      />
                    )}

                    {activeTab === 'logs' && (
                      <ActivityLogView
                        logs={logs}
                        candidates={candidates}
                        currentUser={currentUser}
                      />
                    )}
                  </>
                )}

                {/* CLIENT PORTAL VIEWS (STRICT READ-ONLY & COMPANY RESTRICTED) */}
                {currentUser.role === 'client' && (
                  <>
                    {activeTab === 'dashboard' && (
                      <ClientDashboard
                        currentUser={currentUser}
                        company={clientCompany}
                        candidates={relevantCandidates}
                        jobs={relevantJobs}
                        onNavigateTab={setActiveTab}
                        onSelectCandidate={setSelectedCandidate}
                      />
                    )}

                    {activeTab === 'candidates' && (
                      <CandidatesList
                        candidates={relevantCandidates}
                        companies={companies}
                        jobs={relevantJobs}
                        currentUser={currentUser}
                        onSelectCandidate={setSelectedCandidate}
                        onOpenAddModal={() => {}}
                        onCandidateChange={refreshData}
                      />
                    )}

                    {activeTab === 'jobs' && (
                      <AdminJobs
                        jobs={relevantJobs}
                        companies={companies}
                        users={users}
                        candidates={relevantCandidates}
                        onJobChange={refreshData}
                        onFilterCandidatesByJob={() => setActiveTab('candidates')}
                      />
                    )}

                    {activeTab === 'logs' && (
                      <ActivityLogView
                        logs={logs}
                        candidates={candidates}
                        currentUser={currentUser}
                      />
                    )}
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Candidate Detail Modal / Drawer */}
      {selectedCandidate && (
        <CandidateDetailModal
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          currentUser={currentUser}
          companies={companies}
          jobs={jobs}
          onUpdateCandidate={handleUpdateCandidate}
          onDeleteCandidate={() => {
            refreshData();
            setSelectedCandidate(null);
          }}
        />
      )}

      {/* Add Candidate Modal */}
      {showAddModal && (
        <AddCandidateModal
          onClose={() => setShowAddModal(false)}
          companies={companies}
          jobs={jobs}
          currentUser={currentUser}
          onCandidateAdded={handleCandidateAdded}
        />
      )}

      {/* Reset Demo Data Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showResetModal}
        title="Reset Data Demo"
        message="Kembalikan semua data ke setelan awal demo Linchub ATS? Semua data yang telah ditambahkan atau diedit akan diatur ulang."
        confirmLabel="Reset Sekarang"
        onConfirm={handleConfirmResetData}
        onCancel={() => setShowResetModal(false)}
      />

      {/* Google Sheets & Apps Script Configuration Modal */}
      <GoogleSheetsModal
        isOpen={showGoogleSheetsModal}
        onClose={() => setShowGoogleSheetsModal(false)}
        data={{
          companies,
          jobs,
          candidates,
          users,
          logs,
        }}
        onDataRefresh={refreshData}
      />
    </div>
  );
}
