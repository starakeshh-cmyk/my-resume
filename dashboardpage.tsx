import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  Search,
  Briefcase,
  Bookmark,
  TrendingUp,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Target,
  Award,
  Lightbulb,
  MapPin,
  Building2,
  Clock,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Resume, Job, Application, SavedJob } from '@/lib/types';
import {
  calculateJobMatch,
  calculateProfileCompletion,
  getRecommendedSkills,
  getMatchStrength,
  formatSalary,
  timeAgo,
} from '@/lib/scoring';
import { StatCard } from '@/components/ui/StatCard';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { MatchBadge } from '@/components/ui/Badges';
import { PageHeader, Spinner } from '@/components/ui/Layout';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        const [resumeRes, jobsRes, appsRes, savedRes] = await Promise.all([
          supabase.from('resumes').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
          supabase.from('jobs').select('*').eq('is_active', true).order('posted_at', { ascending: false }),
          supabase.from('applications').select('*, job:jobs(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
          supabase.from('saved_jobs').select('*, job:jobs(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        ]);

        if (resumeRes.data) setResume(resumeRes.data as Resume);
        if (jobsRes.data) setJobs(jobsRes.data as Job[]);
        if (appsRes.data) setApplications(appsRes.data as Application[]);
        if (savedRes.data) setSavedJobs(savedRes.data as SavedJob[]);
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  const { matchingJobsCount, recommendedJobs, profileCompletion, atsScore, resumeCompletion, recommendedSkills } = useMemo(() => {
    if (!jobs.length) {
      return {
        matchingJobsCount: 0,
        recommendedJobs: [] as { job: Job; match: ReturnType<typeof calculateJobMatch> }[],
        profileCompletion: profile ? calculateProfileCompletion(profile) : 0,
        atsScore: resume?.ats_score || 0,
        resumeCompletion: resume?.completion_percentage || 0,
        recommendedSkills: [] as { skill: string; jobCount: number }[],
      };
    }

    const jobMatches = jobs
      .map((job) => ({ job, match: calculateJobMatch(job, resume, profile) }))
      .sort((a, b) => b.match.overall - a.match.overall);

    const matching = jobMatches.filter((jm) => jm.match.overall >= 50).length;
    const topJobs = jobMatches.slice(0, 4);
    const skills = getRecommendedSkills(jobs, profile, resume);

    return {
      matchingJobsCount: matching,
      recommendedJobs: topJobs,
      profileCompletion: profile ? calculateProfileCompletion(profile) : 0,
      atsScore: resume?.ats_score || 0,
      resumeCompletion: resume?.completion_percentage || 0,
      recommendedSkills: skills,
    };
  }, [jobs, resume, profile]);

  const matchStrength = getMatchStrength(atsScore);

  const nextSteps = useMemo(() => {
    const steps: { icon: typeof FileText; title: string; desc: string; link: string; cta: string; done: boolean }[] = [];
    if (!resume) {
      steps.push({ icon: FileText, title: 'Build your resume', desc: 'Create your first resume with our AI builder', link: '/resume', cta: 'Build Resume', done: false });
    } else if (resume.completion_percentage < 100) {
      steps.push({ icon: FileText, title: 'Complete your resume', desc: `Your resume is ${resume.completion_percentage}% complete`, link: '/resume', cta: 'Continue', done: false });
    } else {
      steps.push({ icon: FileText, title: 'Resume complete', desc: 'Your resume is fully built', link: '/resume', cta: 'View', done: true });
    }
    if (!resume?.ats_score) {
      steps.push({ icon: Sparkles, title: 'Run ATS scan', desc: 'Analyze your resume for ATS compatibility', link: '/analyzer', cta: 'Scan Now', done: false });
    } else if (resume.ats_score < 80) {
      steps.push({ icon: Sparkles, title: 'Improve ATS score', desc: `Your ATS score is ${resume.ats_score}/100 — aim for 80+`, link: '/analyzer', cta: 'Improve', done: false });
    } else {
      steps.push({ icon: Sparkles, title: 'ATS optimized', desc: `Your ATS score is ${resume.ats_score}/100`, link: '/analyzer', cta: 'View', done: true });
    }
    if (profileCompletion < 100) {
      steps.push({ icon: Target, title: 'Complete your profile', desc: `Profile is ${profileCompletion}% complete — better matches await`, link: '/profile', cta: 'Complete', done: false });
    } else {
      steps.push({ icon: Target, title: 'Profile complete', desc: 'Your profile is fully set up', link: '/profile', cta: 'View', done: true });
    }
    if (applications.length === 0) {
      steps.push({ icon: Search, title: 'Find matching jobs', desc: `${matchingJobsCount} jobs match your profile`, link: '/jobs', cta: 'Browse Jobs', done: false });
    } else {
      steps.push({ icon: Briefcase, title: 'Track applications', desc: `${applications.length} application(s) in progress`, link: '/applications', cta: 'View', done: true });
    }
    return steps;
  }, [resume, profileCompletion, applications.length, matchingJobsCount]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const firstName = profile?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <PageHeader
        title={`Welcome back, ${firstName}`}
        subtitle="Here's your career overview and next steps"
        actions={
          <Link to="/jobs" className="btn-primary">
            <Search className="w-4 h-4" />
            Find Jobs
          </Link>
        }
      />

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<Award className="w-5 h-5" />}
          label="ATS Score"
          value={atsScore > 0 ? `${atsScore}/100` : '—'}
          sublabel={atsScore > 0 ? matchStrength.label : 'Run a scan'}
          color={atsScore >= 80 ? 'emerald' : atsScore >= 60 ? 'blue' : atsScore >= 40 ? 'amber' : 'brand'}
        />
        <StatCard
          icon={<TrendingUp className="w-5 h-5" />}
          label="Matching Jobs"
          value={matchingJobsCount}
          sublabel="Based on your profile"
          color="brand"
        />
        <StatCard
          icon={<Briefcase className="w-5 h-5" />}
          label="Applications"
          value={applications.length}
          sublabel="In progress"
          color="blue"
        />
        <StatCard
          icon={<Bookmark className="w-5 h-5" />}
          label="Saved Jobs"
          value={savedJobs.length}
          sublabel="Bookmarked"
          color="amber"
        />
      </div>

      {/* Profile + Resume completion */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="card p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Resume Completion</h3>
          <ProgressRing value={resumeCompletion} label={`${resumeCompletion}%`} sublabel="complete" />
          <Link to="/resume" className="btn-secondary mt-4 text-xs">
            {resume ? 'Edit Resume' : 'Build Resume'}
          </Link>
        </div>
        <div className="card p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Profile Completeness</h3>
          <ProgressRing value={profileCompletion} label={`${profileCompletion}%`} sublabel="complete" color={profileCompletion >= 80 ? '#10b981' : profileCompletion >= 50 ? '#3b82f6' : '#f59e0b'} />
          <Link to="/profile" className="btn-secondary mt-4 text-xs">
            Complete Profile
          </Link>
        </div>
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Profile Match Strength</h3>
          <div className="flex items-center gap-3 mb-4">
            <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${matchStrength.bgColor} ${matchStrength.textColor}`}>
              {matchStrength.label}
            </div>
          </div>
          <div className="space-y-3">
            <ProgressBar label="Skills" value={profile?.skills?.length || 0} max={10} color="brand" size="sm" />
            <ProgressBar label="Experience" value={profile?.years_of_experience || 0} max={10} color="blue" size="sm" />
            <ProgressBar label="Education" value={profile?.education?.length || 0} max={2} color="emerald" size="sm" />
          </div>
        </div>
      </div>

      {/* Next steps */}
      <div className="card p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">Recommended Next Steps</h3>
        <p className="text-sm text-gray-500 mb-5">Complete these to maximize your job matching potential</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {nextSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={i}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  step.done ? 'bg-emerald-50/50 border-emerald-100' : 'bg-white border-gray-200 hover:border-brand-200 hover:bg-brand-50/30'
                }`}
              >
                <div className={`p-2.5 rounded-lg ${step.done ? 'bg-emerald-100 text-emerald-600' : 'bg-brand-50 text-brand-600'}`}>
                  {step.done ? <CheckCircle2 className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900">{step.title}</p>
                  <p className="text-xs text-gray-500 truncate">{step.desc}</p>
                </div>
                {!step.done && (
                  <Link to={step.link} className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 flex-shrink-0">
                    {step.cta}
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommended jobs + skills */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recommended jobs */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recommended Jobs</h3>
            <Link to="/jobs" className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="space-y-3">
            {recommendedJobs.length > 0 ? (
              recommendedJobs.map(({ job, match }) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="card p-4 flex items-center gap-4 hover:shadow-md transition-all hover:border-brand-200 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {job.company.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate group-hover:text-brand-600 transition-colors">{job.title}</p>
                    <div className="flex items-center gap-3 text-sm text-gray-500 mt-0.5">
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <MatchBadge score={match.overall} size="sm" />
                    <span className="text-xs text-gray-400">{formatSalary(job.salary_min, job.salary_max)}</span>
                  </div>
                </Link>
              ))
            ) : (
              <div className="card p-8 text-center">
                <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No jobs available yet. Complete your profile for better matches.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recommended skills */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            <h3 className="text-lg font-semibold text-gray-900">Skills to Learn</h3>
          </div>
          <div className="card p-5">
            {recommendedSkills.length > 0 ? (
              <div className="space-y-3">
                {recommendedSkills.map((skill, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-amber-50 flex items-center justify-center text-xs font-bold text-amber-600">
                        {i + 1}
                      </div>
                      <span className="text-sm font-medium text-gray-700 capitalize">{skill.skill}</span>
                    </div>
                    <span className="text-xs text-gray-400">{skill.jobCount} jobs</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">All key skills covered!</p>
            )}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-400">
                These skills appear most in matching jobs but aren't on your profile yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
