import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  MapPin,
  Building2,
  Clock,
  DollarSign,
  Briefcase,
  Bookmark,
  BookmarkCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lightbulb,
  Target,
  GraduationCap,
  TrendingUp,
  Loader2,
  Send,
  Star,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Job, Resume, Application, SavedJob, MatchBreakdown } from '@/lib/types';
import { calculateJobMatch, formatSalary, timeAgo, getMatchStrength } from '@/lib/scoring';
import { Breadcrumb, Spinner, EmptyState } from '@/components/ui/Layout';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MatchBadge } from '@/components/ui/Badges';

export function JobDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [resume, setResume] = useState<Resume | null>(null);
  const [application, setApplication] = useState<Application | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [match, setMatch] = useState<MatchBreakdown | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user || !id) return;
      const [jobRes, resumeRes, appRes, savedRes] = await Promise.all([
        supabase.from('jobs').select('*').eq('id', id).maybeSingle(),
        supabase.from('resumes').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
        supabase.from('applications').select('*').eq('user_id', user.id).eq('job_id', id).maybeSingle(),
        supabase.from('saved_jobs').select('id').eq('user_id', user.id).eq('job_id', id).maybeSingle(),
      ]);
      if (jobRes.data) setJob(jobRes.data as Job);
      if (resumeRes.data) setResume(resumeRes.data as Resume);
      if (appRes.data) setApplication(appRes.data as Application);
      if (savedRes.data) setIsSaved(true);
      setLoading(false);
    }
    loadData();
  }, [user, id]);

  useEffect(() => {
    if (job && profile) {
      setMatch(calculateJobMatch(job, resume, profile));
    }
  }, [job, resume, profile]);

  const handleApply = async () => {
    if (!user || !job || !match) return;
    setActionLoading(true);
    const { data } = await supabase
      .from('applications')
      .insert({
        user_id: user.id,
        job_id: job.id,
        resume_id: resume?.id || null,
        status: 'applied',
        match_score: match.overall,
        match_breakdown: match,
        applied_at: new Date().toISOString(),
      })
      .select('*')
      .maybeSingle();
    if (data) setApplication(data as Application);
    setActionLoading(false);
  };

  const handleSave = async () => {
    if (!user || !job) return;
    setActionLoading(true);
    if (isSaved) {
      await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', job.id);
      setIsSaved(false);
    } else {
      await supabase.from('saved_jobs').insert({ user_id: user.id, job_id: job.id });
      setIsSaved(true);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <EmptyState
          icon={<Briefcase className="w-8 h-8" />}
          title="Job not found"
          description="This job may have been removed or is no longer available."
          action={<Link to="/jobs" className="btn-primary">Back to Jobs</Link>}
        />
      </div>
    );
  }

  const strength = getMatchStrength(match?.overall || 0);

  const matchCategories = match
    ? [
        { label: 'Skills', value: match.skillsMatch, icon: Target, weight: '40%' },
        { label: 'Experience', value: match.experienceMatch, icon: TrendingUp, weight: '25%' },
        { label: 'Education', value: match.educationMatch, icon: GraduationCap, weight: '15%' },
        { label: 'Location', value: match.locationMatch, icon: MapPin, weight: '10%' },
        { label: 'Salary', value: match.salaryMatch, icon: DollarSign, weight: '5%' },
        { label: 'Work Mode', value: match.workModeMatch, icon: Briefcase, weight: '5%' },
      ]
    : [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Jobs', href: '/jobs' }, { label: job.title }]} />

      {/* Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
            {job.company.charAt(0)}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1"><Building2 className="w-4 h-4" />{job.company}</span>
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" />{job.work_mode}</span>
              <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{timeAgo(job.posted_at)}</span>
            </div>
            <div className="flex items-center flex-wrap gap-2 mt-3">
              <span className="badge bg-brand-50 text-brand-700">{job.job_type}</span>
              <span className="badge bg-accent-50 text-accent-700 capitalize">{job.experience_level} level</span>
              <span className="badge bg-emerald-50 text-emerald-700">{job.industry}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:items-end">
            <div className="flex gap-2">
              <button onClick={handleSave} disabled={actionLoading} className="btn-secondary">
                {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                {isSaved ? 'Saved' : 'Save'}
              </button>
              {application ? (
                <span className="btn-primary bg-emerald-600 hover:bg-emerald-700 pointer-events-none">
                  <CheckCircle2 className="w-4 h-4" />
                  Applied
                </span>
              ) : (
                <button onClick={handleApply} disabled={actionLoading} className="btn-primary">
                  {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Job details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Job Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed">{job.description}</p>
          </div>

          {/* Requirements */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h2>
            <ul className="space-y-2">
              {job.requirements.map((req, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                  {req}
                </li>
              ))}
            </ul>
          </div>

          {/* Skills */}
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Required Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {job.required_skills.map((skill) => {
                const has = match?.matchedSkills.includes(skill.toLowerCase());
                return (
                  <span
                    key={skill}
                    className={`badge ${
                      has ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {has && <CheckCircle2 className="w-3 h-3" />}
                    {skill}
                  </span>
                );
              })}
            </div>
            {job.preferred_skills.length > 0 && (
              <>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Preferred Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {job.preferred_skills.map((skill) => (
                    <span key={skill} className="badge bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                      <Star className="w-3 h-3" />
                      {skill}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right: Match analysis */}
        <div className="space-y-6">
          {match && (
            <>
              {/* Overall match */}
              <div className="card p-6 flex flex-col items-center">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">Your Match Score</h3>
                <ProgressRing value={match.overall} label={`${match.overall}`} sublabel="/ 100" size={140} />
                <div className={`mt-3 px-3 py-1 rounded-lg text-sm font-bold ${strength.bgColor} ${strength.textColor}`}>
                  {strength.label}
                </div>
                {application ? (
                  <p className="text-xs text-emerald-600 mt-3 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Application submitted
                  </p>
                ) : (
                  <button onClick={handleApply} disabled={actionLoading} className="btn-primary w-full mt-4">
                    {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Apply Now
                  </button>
                )}
              </div>

              {/* Match breakdown */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Match Breakdown</h3>
                <div className="space-y-3">
                  {matchCategories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <div key={cat.label}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1.5 text-sm text-gray-600">
                            <Icon className="w-3.5 h-3.5" />
                            {cat.label}
                            <span className="text-xs text-gray-400">({cat.weight})</span>
                          </div>
                          <span className={`text-sm font-semibold ${
                            cat.value >= 75 ? 'text-emerald-600' : cat.value >= 50 ? 'text-amber-600' : 'text-rose-600'
                          }`}>
                            {cat.value}%
                          </span>
                        </div>
                        <ProgressBar value={cat.value} color={cat.value >= 75 ? 'emerald' : cat.value >= 50 ? 'amber' : 'rose'} size="sm" showValue={false} />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Why you match */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Why You Match</h3>
                <div className="space-y-2">
                  {match.reasons.map((reason, i) => {
                    const Icon = reason.type === 'positive' ? CheckCircle2 : reason.type === 'negative' ? XCircle : AlertCircle;
                    const color = reason.type === 'positive' ? 'text-emerald-600' : reason.type === 'negative' ? 'text-rose-600' : 'text-amber-600';
                    return (
                      <div key={i} className="flex items-start gap-2 text-sm">
                        <Icon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${color}`} />
                        <span className="text-gray-600">{reason.text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Recommendations */}
              <div className="card p-6">
                <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Recommendations
                </h3>
                <div className="space-y-2">
                  {match.recommendations.map((rec, i) => (
                    <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-amber-50/50">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {i + 1}
                      </span>
                      <p className="text-xs text-gray-700">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
