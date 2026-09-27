import {
  Company,
  Job,
  Candidate,
  User,
  ActivityLog,
  PipelineStage,
  PreliminaryStatus,
  AIAnalysisResult,
} from '../types';
import {
  INITIAL_COMPANIES,
  INITIAL_USERS,
  INITIAL_JOBS,
  INITIAL_CANDIDATES,
  INITIAL_LOGS,
} from '../data/initialData';
import { db, handleFirestoreError, OperationType } from './firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
} from 'firebase/firestore';

const STORAGE_KEYS = {
  COMPANIES: 'linchub_ats_companies_v1',
  USERS: 'linchub_ats_users_v1',
  JOBS: 'linchub_ats_jobs_v1',
  CANDIDATES: 'linchub_ats_candidates_v1',
  LOGS: 'linchub_ats_logs_v1',
  CURRENT_USER: 'linchub_ats_current_user_v1',
  AUTH_USER: 'linchub_ats_auth_user_v1',
};

function getItem<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function setItem<T>(key: string, val: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(val));
  } catch (e) {
    console.error(`Error saving ${key} to localStorage:`, e);
  }
}

export const StorageService = {
  // Sync data from Cloud Firestore on startup
  async syncFromFirestore(): Promise<void> {
    try {
      // 1. Companies
      const companiesSnap = await getDocs(collection(db, 'companies'));
      if (!companiesSnap.empty) {
        const comps = companiesSnap.docs.map((d) => d.data() as Company);
        this.saveCompanies(comps);
      } else {
        // Seed initial to Firestore
        const initComps = this.getCompanies();
        for (const c of initComps) {
          setDoc(doc(db, 'companies', c.id), c).catch(() => {});
        }
      }

      // 2. Jobs
      const jobsSnap = await getDocs(collection(db, 'jobs'));
      if (!jobsSnap.empty) {
        const jbs = jobsSnap.docs.map((d) => d.data() as Job);
        this.saveJobs(jbs);
      } else {
        const initJobs = this.getJobs();
        for (const j of initJobs) {
          setDoc(doc(db, 'jobs', j.id), j).catch(() => {});
        }
      }

      // 3. Candidates
      const cddsSnap = await getDocs(collection(db, 'candidates'));
      if (!cddsSnap.empty) {
        const cdds = cddsSnap.docs.map((d) => d.data() as Candidate);
        this.saveCandidates(cdds);
      } else {
        const initCdds = this.getCandidates();
        for (const c of initCdds) {
          setDoc(doc(db, 'candidates', c.id), c).catch(() => {});
        }
      }

      // 4. Users
      const usersSnap = await getDocs(collection(db, 'users'));
      if (!usersSnap.empty) {
        const usrs = usersSnap.docs.map((d) => d.data() as User);
        this.saveUsers(usrs);
      } else {
        const initUsers = this.getUsers();
        for (const u of initUsers) {
          setDoc(doc(db, 'users', u.uid), u).catch(() => {});
        }
      }
    } catch (e) {
      console.warn('Initial Firestore sync fallback to local cache:', e);
    }
  },

  // COMPANIES
  getCompanies(): Company[] {
    return getItem(STORAGE_KEYS.COMPANIES, INITIAL_COMPANIES);
  },

  saveCompanies(companies: Company[]): void {
    setItem(STORAGE_KEYS.COMPANIES, companies);
  },

  addCompany(company: Omit<Company, 'id' | 'createdAt'>): Company {
    const companies = this.getCompanies();
    const newCompany: Company = {
      ...company,
      id: `comp-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    companies.unshift(newCompany);
    this.saveCompanies(companies);

    // Sync to Cloud Firestore
    setDoc(doc(db, 'companies', newCompany.id), newCompany).catch((err) => {
      console.error('Failed to sync added company to Firestore:', err);
    });

    return newCompany;
  },

  updateCompany(id: string, updates: Partial<Company>): Company | null {
    const companies = this.getCompanies();
    const idx = companies.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    companies[idx] = { ...companies[idx], ...updates };
    this.saveCompanies(companies);

    // Sync to Cloud Firestore
    updateDoc(doc(db, 'companies', id), updates).catch((err) => {
      console.error('Failed to sync updated company to Firestore:', err);
    });

    return companies[idx];
  },

  deleteCompany(id: string): boolean {
    const companies = this.getCompanies();
    const filtered = companies.filter((c) => c.id !== id);
    this.saveCompanies(filtered);

    // Cascade delete jobs belonging to this company
    const allJobs = this.getJobs();
    const deletedJobs = allJobs.filter((j) => j.companyId === id);
    const filteredJobs = allJobs.filter((j) => j.companyId !== id);
    this.saveJobs(filteredJobs);

    // Cascade delete candidates belonging to this company and their logs
    const allCandidates = this.getCandidates();
    const deletedCandidates = allCandidates.filter((c) => c.companyId === id);
    const deletedCddIds = new Set(deletedCandidates.map((c) => c.id));
    const filteredCdds = allCandidates.filter((c) => c.companyId !== id);
    this.saveCandidates(filteredCdds);

    const logs = this.getLogs().filter((l) => !deletedCddIds.has(l.cddId));
    this.saveLogs(logs);

    // Cloud Firestore Complete Deletions
    deleteDoc(doc(db, 'companies', id)).catch((err) => {
      console.error('Failed to delete company from Firestore:', err);
    });

    for (const j of deletedJobs) {
      deleteDoc(doc(db, 'jobs', j.id)).catch(() => {});
    }

    for (const c of deletedCandidates) {
      deleteDoc(doc(db, 'candidates', c.id)).catch(() => {});
    }

    return true;
  },

  // USERS
  getUsers(): User[] {
    const list = getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
    // Ensure master admin exists
    const hasMasterAdmin = list.some((u) => u.email.toLowerCase() === 'adminlinchub@cmp.id');
    if (!hasMasterAdmin) {
      const adminEntry: User = {
        uid: 'usr-admin-1',
        email: 'adminlinchub@cmp.id',
        name: 'Admin Linchub',
        role: 'admin',
        companyId: null,
        title: 'Master ATS Administrator',
        password: 'LincTALENTPARTNERS12@',
        createdAt: '2026-01-01T00:00:00.000Z',
      };
      const filtered = list.filter((u) => u.uid !== 'usr-admin-1' && u.email !== 'sarah.lin@linchub.id');
      const updatedList = [adminEntry, ...filtered];
      this.saveUsers(updatedList);
      return updatedList;
    }
    return list;
  },

  saveUsers(users: User[]): void {
    setItem(STORAGE_KEYS.USERS, users);
  },

  addUser(user: Omit<User, 'uid' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      uid: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    this.saveUsers(users);

    // Sync to Cloud Firestore
    setDoc(doc(db, 'users', newUser.uid), newUser).catch((err) => {
      console.error('Failed to sync added user to Firestore:', err);
    });

    return newUser;
  },

  updateUser(uid: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.uid === uid);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...updates };
    this.saveUsers(users);

    // Sync to Cloud Firestore
    updateDoc(doc(db, 'users', uid), updates).catch((err) => {
      console.error('Failed to sync updated user to Firestore:', err);
    });

    return users[idx];
  },

  deleteUser(uid: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter((u) => u.uid !== uid);
    this.saveUsers(filtered);

    // Sync to Cloud Firestore
    deleteDoc(doc(db, 'users', uid)).catch((err) => {
      console.error('Failed to delete user from Firestore:', err);
    });

    return true;
  },

  getCurrentUser(): User {
    const saved = getItem<User | null>(STORAGE_KEYS.CURRENT_USER, null);
    if (saved) return saved;
    const users = this.getUsers();
    return users.find((u) => u.role === 'recruiter') || users[0];
  },

  setCurrentUser(user: User): void {
    setItem(STORAGE_KEYS.CURRENT_USER, user);
  },

  getAuthenticatedUser(): User | null {
    return getItem<User | null>(STORAGE_KEYS.AUTH_USER, null);
  },

  setAuthenticatedUser(user: User | null): void {
    if (!user) {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    } else {
      setItem(STORAGE_KEYS.AUTH_USER, user);
    }
  },

  logout(): void {
    localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
  },

  // JOBS
  getJobs(): Job[] {
    return getItem(STORAGE_KEYS.JOBS, INITIAL_JOBS);
  },

  saveJobs(jobs: Job[]): void {
    setItem(STORAGE_KEYS.JOBS, jobs);
  },

  addJob(job: Omit<Job, 'id' | 'createdAt'>): Job {
    const jobs = this.getJobs();
    const newJob: Job = {
      ...job,
      id: `job-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    jobs.unshift(newJob);
    this.saveJobs(jobs);

    // Sync to Cloud Firestore
    setDoc(doc(db, 'jobs', newJob.id), newJob).catch((err) => {
      console.error('Failed to sync added job to Firestore:', err);
    });

    return newJob;
  },

  updateJob(id: string, updates: Partial<Job>): Job | null {
    const jobs = this.getJobs();
    const idx = jobs.findIndex((j) => j.id === id);
    if (idx === -1) return null;
    jobs[idx] = { ...jobs[idx], ...updates };
    this.saveJobs(jobs);

    // Sync to Cloud Firestore
    updateDoc(doc(db, 'jobs', id), updates).catch((err) => {
      console.error('Failed to sync updated job to Firestore:', err);
    });

    return jobs[idx];
  },

  deleteJob(id: string): boolean {
    const jobs = this.getJobs();
    const filtered = jobs.filter((j) => j.id !== id);
    this.saveJobs(filtered);

    // Cascade delete all candidates belonging to this job
    const allCandidates = this.getCandidates();
    const deletedCandidates = allCandidates.filter((c) => c.jobId === id);
    const deletedCddIds = new Set(deletedCandidates.map((c) => c.id));
    const filteredCdds = allCandidates.filter((c) => c.jobId !== id);
    this.saveCandidates(filteredCdds);

    const logs = this.getLogs().filter((l) => !deletedCddIds.has(l.cddId));
    this.saveLogs(logs);

    // Cloud Firestore Complete Deletions
    deleteDoc(doc(db, 'jobs', id)).catch((err) => {
      console.error('Failed to delete job from Firestore:', err);
    });

    for (const c of deletedCandidates) {
      deleteDoc(doc(db, 'candidates', c.id)).catch(() => {});
    }

    return true;
  },

  // CANDIDATES (CDD)
  getCandidates(): Candidate[] {
    return getItem(STORAGE_KEYS.CANDIDATES, INITIAL_CANDIDATES);
  },

  saveCandidates(candidates: Candidate[]): void {
    setItem(STORAGE_KEYS.CANDIDATES, candidates);
  },

  getCandidateById(id: string): Candidate | undefined {
    return this.getCandidates().find((c) => c.id === id);
  },

  addCandidate(
    candidate: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>,
    performedBy = 'Recruiter'
  ): Candidate {
    const candidates = this.getCandidates();
    const now = new Date().toISOString();
    const newCdd: Candidate = {
      ...candidate,
      id: `cdd-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    candidates.unshift(newCdd);
    this.saveCandidates(candidates);

    // Sync to Cloud Firestore
    setDoc(doc(db, 'candidates', newCdd.id), newCdd).catch((err) => {
      console.error('Failed to sync added candidate to Firestore:', err);
    });

    this.addLog({
      cddId: newCdd.id,
      candidateName: newCdd.fullName,
      action: 'Candidate Added',
      performedBy,
      role: 'recruiter',
      details: `Kandidat ditambahkan untuk posisi ${newCdd.position}`,
    });

    if (newCdd.cvFileName) {
      this.addLog({
        cddId: newCdd.id,
        candidateName: newCdd.fullName,
        action: 'CV Uploaded',
        performedBy,
        role: 'recruiter',
        details: `CV ${newCdd.cvFileName} terunggah ke sistem`,
      });
    }

    return newCdd;
  },

  updateCandidate(id: string, updates: Partial<Candidate>): Candidate | null {
    const candidates = this.getCandidates();
    const idx = candidates.findIndex((c) => c.id === id);
    if (idx === -1) return null;
    candidates[idx] = {
      ...candidates[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.saveCandidates(candidates);

    // Sync to Cloud Firestore
    updateDoc(doc(db, 'candidates', id), updates).catch((err) => {
      console.error('Failed to sync updated candidate to Firestore:', err);
    });

    return candidates[idx];
  },

  deleteCandidate(id: string): boolean {
    const candidates = this.getCandidates();
    const filtered = candidates.filter((c) => c.id !== id);
    this.saveCandidates(filtered);

    // Cascade delete activity logs of this candidate
    const logs = this.getLogs().filter((l) => l.cddId !== id);
    this.saveLogs(logs);

    // Sync to Cloud Firestore
    deleteDoc(doc(db, 'candidates', id)).catch((err) => {
      console.error('Failed to delete candidate from Firestore:', err);
    });

    return true;
  },

  // PRELIMINARY ASSESSMENT
  savePreliminary(
    id: string,
    assessment: {
      score: number;
      status: PreliminaryStatus;
      notes: string;
      performedBy: string;
    }
  ): Candidate | null {
    const cdd = this.updateCandidate(id, {
      preliminaryScore: assessment.score,
      preliminaryStatus: assessment.status,
      preliminaryNotes: assessment.notes,
    });

    if (cdd) {
      this.addLog({
        cddId: id,
        candidateName: cdd.fullName,
        action: 'Preliminary Assessment Updated',
        performedBy: assessment.performedBy,
        role: 'recruiter',
        details: `Skor Preliminary: ${assessment.score}/100 [Status: ${assessment.status}] - ${assessment.notes}`,
      });
    }

    return cdd;
  },

  // AI GEMINI ANALYSIS SAVE
  saveAIAnalysis(id: string, result: AIAnalysisResult, performedBy: string): Candidate | null {
    const cdd = this.updateCandidate(id, {
      aiScore: result.aiScore,
      aiSummary: result.aiSummary,
      aiStrengths: result.aiStrengths,
      aiConcerns: result.aiConcerns,
      aiRecommendation: result.aiRecommendation,
      aiSkills: result.aiSkills,
      aiExperience: result.aiExperience,
      aiEducation: result.aiEducation,
      aiMatch: result.aiMatch,
      aiAnalyzedAt: new Date().toISOString(),
    });

    if (cdd) {
      this.addLog({
        cddId: id,
        candidateName: cdd.fullName,
        action: 'AI Gemini Fit Analysis',
        performedBy,
        role: 'recruiter',
        details: `Hasil analisis AI: Fit Score ${result.aiScore}/100, Rekomendasi: [${result.aiRecommendation}]`,
      });
    }

    return cdd;
  },

  // RECRUITER VERIFY AI
  verifyAIAnalysis(id: string, performedBy: string): Candidate | null {
    const prev = this.getCandidateById(id);
    if (!prev) return null;

    this.addLog({
      cddId: id,
      candidateName: prev.fullName,
      action: 'AI Analysis Verified',
      performedBy,
      role: 'recruiter',
      details: 'Recruiter memvalidasi hasil analisis AI Gemini',
    });

    return prev;
  },

  // PIPELINE STATUS PROGRESSION
  updateCandidateStatus(
    id: string,
    newStatus: PipelineStage,
    performedBy: string
  ): Candidate | null {
    const prevCdd = this.getCandidateById(id);
    if (!prevCdd) return null;
    const oldStatus = prevCdd.status;

    const updated = this.updateCandidate(id, { status: newStatus });

    let actionLabel = 'Status Changed';
    if (newStatus === 'Hired') actionLabel = 'Candidate Hired';
    if (newStatus === 'Rejected') actionLabel = 'Candidate Rejected';

    this.addLog({
      cddId: id,
      candidateName: prevCdd.fullName,
      action: actionLabel,
      performedBy,
      role: 'recruiter',
      details: `Status dipindahkan dari [${oldStatus}] menuju [${newStatus}]`,
    });

    return updated;
  },

  // ACTIVITY LOGS
  getLogs(cddId?: string): ActivityLog[] {
    const logs = getItem(STORAGE_KEYS.LOGS, INITIAL_LOGS);
    if (cddId) {
      return logs
        .filter((l) => l.cddId === cddId)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },

  saveLogs(logs: ActivityLog[]): void {
    setItem(STORAGE_KEYS.LOGS, logs);
  },

  addLog(log: Omit<ActivityLog, 'id' | 'timestamp'>): ActivityLog {
    const logs = getItem<ActivityLog[]>(STORAGE_KEYS.LOGS, INITIAL_LOGS);
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    logs.unshift(newLog);
    setItem(STORAGE_KEYS.LOGS, logs);

    // Sync to Cloud Firestore
    setDoc(doc(db, 'activityLogs', newLog.id), newLog).catch((err) => {
      console.error('Failed to sync added log to Firestore:', err);
    });

    return newLog;
  },

  // RESET
  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.COMPANIES);
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.JOBS);
    localStorage.removeItem(STORAGE_KEYS.CANDIDATES);
    localStorage.removeItem(STORAGE_KEYS.LOGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },
};
