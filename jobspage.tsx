import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building2,
  Briefcase,
  Filter,
  X,
  Bookmark,
  BookmarkCheck,
  Clock,
  DollarSign,
  Loader2,
  SlidersHorizontal,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Job, Resume, SavedJob } from '@/lib/types';
import { calculateJobMatch, formatSalary, timeAgo, getMatchStrength } from '@/lib/scoring';
import { PageHeader, Breadcrumb, Spinner, EmptyState } from '@/components/ui/Layout';
import { MatchBadge } from '@/components/ui/Badges';

export function JobsPage() {
  const { user, profile } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [resume, setResume] = useState<Resume | null>(null);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [workModeFilter, setWorkModeFilter] = useState('all');
  const [jobTypeFilter, setJobTypeFilter] = useState('all');
  const [expLevelFilter, setExpLevelFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'match' | 'recent' | 'salary'>('match');
  const [showFilters, setShowFilters] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const [jobsRes, resumeRes, savedRes] = await Promise.all([
        supabase.from('jobs').select('*').eq('is_active', true).order('posted_at', { ascending: false }),
        supabase.from('resumes').select('*').eq('user_id', user.id).eq('is_active', true).maybeSingle(),
        supabase.from('saved_jobs').select('*, job:jobs(*)').eq('user_id', user.id),
      ]);
      if (jobsRes.data) setJobs(jobsRes.data as Job[]);
      if (resumeRes.data) setResume(resumeRes.data as Resume);
      if (savedRes.data) setSavedJobs(savedRes.data as SavedJob[]);
      setLoading(false);
    }
    loadData();
  }, [user]);

  const savedJobIds = useMemo(() => new Set(savedJobs.map((sj) => sj.job_id)), [savedJobs]);

  const filteredJobs = useMemo(() => {
    let result = jobs;

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company.toLowerCase().includes(q) ||
          j.description.toLowerCase().includes(q) ||
          j.required_skills.some((s) => s.toLowerCase().includes(q))
      );
    }
    if (locationFilter) {
      const l = locationFilter.toLowerCase();
      result = result.filter((j) => j.location.toLowerCase().includes(l));
    }
    if (workModeFilter !== 'all') result = result.filter((j) => j.work_mode === workModeFilter);
    if (jobTypeFilter !== 'all') result = result.filter((j) => j.job_type === jobTypeFilter);
    if (expLevelFilter !== 'all') result = result.filter((j) => j.experience_level === expLevelFilter);

    const withMatches = result.map((job) => ({
      job,
      match: calculateJobMatch(job, resume, profile),
    }));

    if (sortBy === 'match') withMatches.sort((a, b) => b.match.overall - a.match.overall);
    else if (sortBy === 'salary') withMatches.sort((a, b) => b.job.salary_max - a.job.salary_max);
    else withMatches.sort((a, b) => new Date(b.job.posted_at).getTime() - new Date(a.job.posted_at).getTime());

    return withMatches;
  }, [jobs, search, locationFilter, workModeFilter, jobTypeFilter, expLevelFilter, sortBy, resume, profile]);

  const toggleSave = async (jobId: string) => {
    if (!user) return;
    setSavingId(jobId);
    if (savedJobIds.has(jobId)) {
      await supabase.from('saved_jobs').delete().eq('user_id', user.id).eq('job_id', jobId);
      setSavedJobs((prev) => prev.filter((sj) => sj.job_id !== jobId));
    } else {
      const { data } = await supabase
        .from('saved_jobs')
        .insert({ user_id: user.id, job_id: jobId })
        .select('*, job:jobs(*)')
        .maybeSingle();
      if (data) setSavedJobs((prev) => [...prev, data as SavedJob]);
    }
    setSavingId(null);
  };

  const clearFilters = () => {
    setSearch('');
    setLocationFilter('');
    setWorkModeFilter('all');
    setJobTypeFilter('all');
    setExpLevelFilter('all');
  };

  const hasActiveFilters = search || locationFilter || workModeFilter !== 'all' || jobTypeFilter !== 'all' || expLevelFilter !== 'all';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Find Jobs' }]} />
      <PageHeader
        title="Find Jobs"
        subtitle={`${filteredJobs.length} jobs matched to your profile`}
      />

      {/* Search bar */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title, company, or skill..."
              className="input pl-10"
            />
          </div>
          <div className="relative sm:w-48">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="Location"
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary ${showFilters ? 'border-brand-300 bg-brand-50' : ''}`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {/* Expandable filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
            <div>
              <label className="label">Work Mode</label>
              <select value={workModeFilter} onChange={(e) => setWorkModeFilter(e.target.value)} className="input">
                <option value="all">All modes</option>
                <option value="remote">Remote</option>
                <option value="hybrid">Hybrid</option>
                <option value="onsite">On-site</option>
              </select>
            </div>
            <div>
              <label className="label">Job Type</label>
              <select value={jobTypeFilter} onChange={(e) => setJobTypeFilter(e.target.value)} className="input">
                <option value="all">All types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="label">Experience Level</label>
              <select value={expLevelFilter} onChange={(e) => setExpLevelFilter(e.target.value)} className="input">
                <option value="all">All levels</option>
                <option value="entry">Entry</option>
                <option value="mid">Mid</option>
                <option value="senior">Senior</option>
                <option value="lead">Lead</option>
                <option value="executive">Executive</option>
              </select>
            </div>
          </div>
        )}

        {/* Sort + clear */}
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Sort by:</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white">
              <option value="match">Best Match</option>
              <option value="recent">Most Recent</option>
              <option value="salary">Highest Salary</option>
            </select>
          </div>
          {hasActiveFilters && (
            <button onClick={clearFilters} className="text-sm text-brand-600 hover:text-brand-700 flex items-center gap-1">
              <X className="w-3.5 h-3.5" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Job list */}
      {filteredJobs.length === 0 ? (
        <EmptyState
          icon={<Search className="w-8 h-8" />}
          title="No jobs found"
          description={hasActiveFilters ? "Try adjusting your filters or search terms." : "Check back later for new opportunities."}
          action={hasActiveFilters ? <button onClick={clearFilters} className="btn-secondary">Clear filters</button> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredJobs.map(({ job, match }) => {
            const strength = getMatchStrength(match.overall);
            const isSaved = savedJobIds.has(job.id);
            return (
              <div key={job.id} className="card p-5 hover:shadow-md transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {job.company.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link to={`/jobs/${job.id}`}>
                      <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors line-clamp-1">{job.title}</h3>
                    </Link>
                    <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500 mt-1">
                      <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{job.company}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleSave(job.id)}
                    disabled={savingId === job.id}
                    className={`p-2 rounded-lg transition-colors flex-shrink-0 ${
                      isSaved ? 'text-brand-600 bg-brand-50' : 'text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {savingId === job.id ? <Loader2 className="w-4 h-4 animate-spin" /> : isSaved ? <BookmarkCheck className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                  </button>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <MatchBadge score={match.overall} size="sm" />
                  <span className={`text-xs font-medium ${strength.textColor}`}>{strength.label} match</span>
                </div>

                {/* Skills preview */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {job.required_skills.slice(0, 4).map((skill) => {
                    const has = match.matchedSkills.includes(skill.toLowerCase());
                    return (
                      <span
                        key={skill}
                        className={`badge text-xs ${
                          has ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {skill}
                      </span>
                    );
                  })}
                  {job.required_skills.length > 4 && (
                    <span className="badge text-xs bg-gray-100 text-gray-400">
                      +{job.required_skills.length - 4} more
                    </span>
                  )}
                </div>

                {/* Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" />{formatSalary(job.salary_min, job.salary_max)}</span>
                    <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{job.job_type}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{timeAgo(job.posted_at)}</span>
                  </div>
                  <Link to={`/jobs/${job.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">
                    View Details →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
