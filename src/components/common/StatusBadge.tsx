import React from 'react';
import { PipelineStage, PreliminaryStatus, AIRecommendation } from '../../types';
import { CheckCircle2, Clock, AlertCircle, XCircle, ArrowRight, Sparkles } from 'lucide-react';

export const StageBadge: React.FC<{ stage: PipelineStage }> = ({ stage }) => {
  let color = 'text-neutral-600 bg-neutral-50 border-neutral-200';
  let icon = <Clock className="w-3 h-3 text-neutral-400 shrink-0" />;

  switch (stage) {
    case 'Applied':
      color = 'text-neutral-600 bg-neutral-50 border-neutral-200';
      icon = <Clock className="w-3 h-3 text-neutral-400 shrink-0" />;
      break;
    case 'Preliminary':
      color = 'text-sky-700 bg-sky-50/70 border-sky-200/80';
      icon = <Sparkles className="w-3 h-3 text-sky-500 shrink-0" />;
      break;
    case 'Screening':
      color = 'text-indigo-700 bg-indigo-50/70 border-indigo-200/80';
      icon = <ArrowRight className="w-3 h-3 text-indigo-500 shrink-0" />;
      break;
    case 'Interview HR':
    case 'Interview User':
      color = 'text-amber-800 bg-amber-50/80 border-amber-200/80';
      icon = <Clock className="w-3 h-3 text-amber-600 shrink-0" />;
      break;
    case 'Offering':
      color = 'text-teal-800 bg-teal-50/70 border-teal-200/80';
      icon = <CheckCircle2 className="w-3 h-3 text-teal-600 shrink-0" />;
      break;
    case 'Hired':
      color = 'text-emerald-800 bg-emerald-50/80 border-emerald-200/80';
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />;
      break;
    case 'Rejected':
    case 'Withdrawn':
      color = 'text-rose-700 bg-rose-50/70 border-rose-200/80';
      icon = <XCircle className="w-3 h-3 text-rose-500 shrink-0" />;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 text-xs font-normal rounded border ${color} whitespace-nowrap`}
    >
      {icon}
      <span>{stage}</span>
    </span>
  );
};

export const PreliminaryBadge: React.FC<{ status: PreliminaryStatus }> = ({ status }) => {
  let color = 'text-neutral-600 bg-neutral-50 border-neutral-200';
  let icon = <Clock className="w-3 h-3 text-neutral-400" />;

  switch (status) {
    case 'Qualified':
      color = 'text-emerald-800 bg-emerald-50/80 border-emerald-200';
      icon = <CheckCircle2 className="w-3 h-3 text-emerald-600" />;
      break;
    case 'Need Review':
      color = 'text-amber-800 bg-amber-50/80 border-amber-200';
      icon = <AlertCircle className="w-3 h-3 text-amber-600" />;
      break;
    case 'Not Qualified':
      color = 'text-rose-800 bg-rose-50/80 border-rose-200';
      icon = <XCircle className="w-3 h-3 text-rose-600" />;
      break;
    case 'Pending':
      color = 'text-neutral-600 bg-neutral-50 border-neutral-200';
      icon = <Clock className="w-3 h-3 text-neutral-400" />;
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-normal rounded border ${color} whitespace-nowrap`}
    >
      {icon}
      <span>{status}</span>
    </span>
  );
};

export const AIRecommendationBadge: React.FC<{ rec?: AIRecommendation }> = ({ rec }) => {
  if (!rec) return <span className="text-neutral-400 text-xs">-</span>;

  let color = 'text-neutral-600 bg-neutral-50 border-neutral-200';
  if (rec === 'Highly Recommended') {
    color = 'text-emerald-800 bg-emerald-50 border-emerald-200';
  } else if (rec === 'Recommended') {
    color = 'text-blue-800 bg-blue-50 border-blue-200';
  } else if (rec === 'Conditional') {
    color = 'text-amber-800 bg-amber-50 border-amber-200';
  } else if (rec === 'Not Recommended') {
    color = 'text-rose-800 bg-rose-50 border-rose-200';
  }

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-normal rounded border ${color}`}>
      <Sparkles className="w-3 h-3" />
      <span>{rec}</span>
    </span>
  );
};
