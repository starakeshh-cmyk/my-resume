import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  Bookmark,
  CheckCircle2,
  Clock,
  XCircle,
  Phone,
  FileText,
  Users,
  Trophy,
  ArrowRight,
  Building2,
  MapPin,
  Loader2,
  Calendar,
  StickyNote,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Application, SavedJob } from '@/lib/types';
import { formatSalary, timeAgo } from '@/lib/scoring';
import { PageHeader, Breadcrumb, Spinner, EmptyState } from '@/components/ui/Layout';
import { MatchBadge } from '@/components/ui/Badges';

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Bookmark }> = {
  saved: { label: 'Saved', color: 'bg-amber-50 text-amber-700 ring-amber-100', icon: Bookmark },
  applied: { label: 'Applied', color: 'bg-blue-50 text-blue-700 ring-blue-100', icon: FileText },
  phone_screen: { label: 'Phone Screen', color: 'bg-accent-50 text-accent-700 ring-accent-100', icon: Phone },
  interview: { label: 'Interview', color: 'bg-brand-50 text-brand-700 ring-brand-100', icon: Users },
  offer: { label: 'Offer', color: 'bg-emerald-50 text-emerald-700 ring-emerald-100', icon: Trophy },
  rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 ring-rose-100', icon: XCircle },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-600 ring-gray-200', icon: XCircle },
};

const STATUS_ORDER = ['saved', 'applied', 'phone_screen', 'interview', 'offer', 'rejected', 'withdrawn'];

export function ApplicationsPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'applications' | 'saved'>('applications');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      const [appsRes, savedRes] = await Promise.all([
        supabase.from('applications').select('*, job:jobs(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('saved_jobs').select('*, job:jobs(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      if (appsRes.data) setApplications(appsRes.data as Application[]);
      if (savedRes.data) setSavedJobs(savedRes.data as SavedJob[]);
      setLoading(false);
    }
    loadData();
  }, [user]);

  const updateStatus = async (appId: string, status: string) => {
    setUpdatingId(appId);
    const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
    if (status === 'applied' && !applications.find((a) => a.id === appId)?.applied_at) {
      updates.applied_at = new Date().toISOString();
    }
    await supabase.from('applications').update(updates).eq('id', appId);
    setApplications((prev) =>
      prev.map((a) => (a.id === appId ? { ...a, status, applied_at: updates.applied_at as string | null } : a))
    );
    setUpdatingId(null);
  };

  const stats = useMemo(() => {
    const applied = applications.filter((a) => a.status !== 'saved').length;
    const interviews = applications.filter((a) => a.status === 'interview' || a.status === 'phone_screen').length;
    const offers = applications.filter((a) => a.status === 'offer').length;
    return { applied, interviews, offers, saved: savedJobs.length };
  }, [applications, savedJobs]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Applications' }]} />
      <PageHeader title="Applications" subtitle="Track your job applications and saved opportunities" />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Applied', value: stats.applied, icon: FileText, color: 'text-blue-600 bg-blue-50' },
          { label: 'Interviews', value: stats.interviews, icon: Users, color: 'text-brand-600 bg-brand-50' },
          { label: 'Offers', value: stats.offers, icon: Trophy, color: 'text-emerald-600 bg-emerald-50' },
          { label: 'Saved', value: stats.saved, icon: Bookmark, color: 'text-amber-600 bg-amber-50' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-lg ${s.color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('applications')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'applications' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Applications ({applications.length})
        </button>
        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            activeTab === 'saved' ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
          }`}
        >
          Saved Jobs ({savedJobs.length})
        </button>
      </div>

      {/* Content */}
      {activeTab === 'applications' ? (
        applications.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-8 h-8" />}
            title="No applications yet"
            description="Start applying to jobs and track your progress here. Your application pipeline will appear in this view."
            action={<Link to="/jobs" className="btn-primary">Browse Jobs</Link>}
          />
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const statusCfg = STATUS_CONFIG[app.status] || STATUS_CONFIG.applied;
              const StatusIcon = statusCfg.icon;
              return (
                <div key={app.id} className="card p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                      {app.job?.company?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/jobs/${app.job_id}`}>
                        <h3 className="font-semibold text-gray-900 hover:text-brand-600 transition-colors">
                          {app.job?.title || 'Unknown position'}
                        </h3>
                      </Link>
                      <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{app.job?.company}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{app.job?.location}</span>
                        {app.applied_at && (
                          <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />Applied {timeAgo(app.applied_at)}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col sm:items-end gap-2">
                      {app.match_score !== null && <MatchBadge score={app.match_score} size="sm" />}
                      <span className={`badge ring-1 ${statusCfg.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusCfg.label}
                      </span>
                    </div>
                  </div>

                  {/* Status pipeline */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {STATUS_ORDER.filter((s) => s !== 'withdrawn').map((status) => {
                        const cfg = STATUS_CONFIG[status];
                        const isActive = app.status === status;
                        const isPast = STATUS_ORDER.indexOf(app.status) > STATUS_ORDER.indexOf(status);
                        return (
                          <button
                            key={status}
                            onClick={() => updateStatus(app.id, status)}
                            disabled={updatingId === app.id}
                            className={`badge text-xs transition-all ${
                              isActive
                                ? cfg.color + ' ring-1 scale-105'
                                : isPast
                                ? 'bg-gray-50 text-gray-400'
                                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                            }`}
                          >
                            {updatingId === app.id && isActive ? <Loader2 className="w-3 h-3 animate-spin" /> : <cfg.icon className="w-3 h-3" />}
                            {cfg.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : savedJobs.length === 0 ? (
        <EmptyState
          icon={<Bookmark className="w-8 h-8" />}
          title="No saved jobs"
          description="Bookmark jobs you're interested in to save them for later."
          action={<Link to="/jobs" className="btn-primary">Browse Jobs</Link>}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {savedJobs.map((sj) => (
            <div key={sj.id} className="card p-5 hover:shadow-md transition-all group">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {sj.job?.company?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <Link to={`/jobs/${sj.job_id}`}>
                    <h3 className="font-semibold text-gray-900 group-hover:text-brand-600 transition-colors">{sj.job?.title}</h3>
                  </Link>
                  <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-sm text-gray-500 mt-1">
                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />{sj.job?.company}</span>
                    <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{sj.job?.location}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{sj.job ? timeAgo(sj.job.posted_at) : ''}</span>
                    <span>{sj.job ? formatSalary(sj.job.salary_min, sj.job.salary_max) : ''}</span>
                  </div>
                </div>
                <Link to={`/jobs/${sj.job_id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1 flex-shrink-0">
                  View <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
