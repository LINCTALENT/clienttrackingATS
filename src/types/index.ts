export type Role = 'admin' | 'recruiter' | 'client';

export type PipelineStage =
  | 'Applied'
  | 'Preliminary'
  | 'Screening'
  | 'Interview HR'
  | 'Interview User'
  | 'Offering'
  | 'Hired'
  | 'Rejected'
  | 'Withdrawn';

export type PreliminaryStatus = 'Pending' | 'Qualified' | 'Need Review' | 'Not Qualified';

export type AIRecommendation = 'Highly Recommended' | 'Recommended' | 'Conditional' | 'Not Recommended';

export interface User {
  uid: string;
  email: string;
  name: string;
  role: Role;
  companyId: string | null;
  createdAt: string;
  title?: string;
  avatar?: string;
  password?: string;
}

export interface Company {
  id: string;
  companyName: string;
  industry: string;
  location: string;
  contactEmail?: string;
  createdAt: string;
  activeJobsCount?: number;
  totalCandidatesCount?: number;
}

export interface Job {
  id: string;
  companyId: string;
  position: string;
  department: string;
  jobDescription: string;
  requirements: string[];
  jobStatus: 'Open' | 'Closed';
  recruiterId: string | null;
  targetHires?: number;
  createdAt: string;
}

export interface Candidate {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  companyId: string;
  jobId: string;
  position: string;
  recruiterId: string | null;
  cvUrl?: string | null;
  cvFileName?: string;
  cvText?: string;
  status: PipelineStage;
  createdAt: string;
  updatedAt: string;

  // Preliminary Assessment
  preliminaryScore?: number;
  preliminaryStatus: PreliminaryStatus;
  preliminaryNotes?: string;
  preliminaryAt?: string;
  preliminaryBy?: string;

  // AI CV Analysis
  aiSummary?: string;
  aiScore?: number;
  aiSkills?: string[];
  aiExperience?: string;
  aiEducation?: string;
  aiStrengths?: string[];
  aiConcerns?: string[];
  aiMatch?: string;
  aiRecommendation?: AIRecommendation;
  aiAnalyzedAt?: string;
  aiAnalysisVersion?: string;
}

export interface ActivityLog {
  id: string;
  cddId: string;
  candidateName?: string;
  action: string;
  performedBy: string;
  role?: string;
  timestamp: string;
  details?: string;
}

export interface AIAnalysisResult {
  aiSummary: string;
  aiScore: number;
  aiSkills: string[];
  aiExperience: string;
  aiEducation: string;
  aiStrengths: string[];
  aiConcerns: string[];
  aiMatch: string;
  aiRecommendation: AIRecommendation;
}

export interface CVExtractionAnalysis {
  fullName: string;
  email: string;
  phone: string;
  positionApplied: string;
  aiSummary: string;
  aiSkills: string[];
  aiExperience: string;
  aiEducation: string;
  aiScore: number; // 15 to 99
  aiMatch: 'Suitable' | 'Not Suitable' | 'Need Review' | string;
  aiStrengths: string;
  aiConcerns: string;
  aiRecommendation: string;
}

