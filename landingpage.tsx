import { Link } from 'react-router-dom';
import {
  Sparkles,
  FileText,
  Search,
  BarChart3,
  Briefcase,
  CheckCircle2,
  ArrowRight,
  Upload,
  Brain,
  Target,
  Send,
  Star,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Building2,
  MapPin,
  DollarSign,
} from 'lucide-react';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { MatchBadge } from '@/components/ui/Badges';

export function LandingPage() {
  const workflow = [
    { icon: Upload, title: 'Upload Resume', desc: 'Start with your existing resume or build one from scratch', color: 'bg-blue-50 text-blue-600' },
    { icon: Brain, title: 'AI Analysis', desc: 'AI analyzes your resume for ATS compatibility and gaps', color: 'bg-brand-50 text-brand-600' },
    { icon: FileText, title: 'Improve Resume', desc: 'Get actionable suggestions to strengthen your resume', color: 'bg-emerald-50 text-emerald-600' },
    { icon: Target, title: 'Match Jobs', desc: 'Find jobs that match your skills and preferences', color: 'bg-amber-50 text-amber-600' },
    { icon: Send, title: 'Apply', desc: 'Apply with confidence and track your applications', color: 'bg-rose-50 text-rose-600' },
  ];

  const features = [
    {
      icon: FileText,
      title: 'AI Resume Builder',
      desc: 'Create a professional, ATS-friendly resume with our intelligent builder. Get real-time suggestions as you write.',
      color: 'from-brand-500 to-brand-600',
      points: ['Structured templates', 'Real-time ATS feedback', 'One-click export'],
    },
    {
      icon: BarChart3,
      title: 'Resume ATS Scanner',
      desc: 'Upload your resume and get an instant ATS score with detailed analysis of every section and missing keywords.',
      color: 'from-accent-500 to-accent-600',
      points: ['Section-by-section scoring', 'Keyword analysis', 'Actionable improvements'],
    },
    {
      icon: Search,
      title: 'Intelligent Job Matching',
      desc: 'Our AI compares your resume against job listings and gives you a compatibility score with a full breakdown.',
      color: 'from-emerald-500 to-emerald-600',
      points: ['Match score for every job', 'Skill gap analysis', 'Why you match or don\'t'],
    },
    {
      icon: TrendingUp,
      title: 'Personalized Career Insights',
      desc: 'Get tailored recommendations on skills to learn, resume improvements, and career growth opportunities.',
      color: 'from-amber-500 to-amber-600',
      points: ['Skill recommendations', 'Career path guidance', 'Salary insights'],
    },
    {
      icon: Briefcase,
      title: 'Application Tracking',
      desc: 'Track every application from saved to offer. Never lose track of where you stand in the hiring process.',
      color: 'from-rose-500 to-rose-600',
      points: ['Pipeline tracking', 'Status updates', 'Application notes'],
    },
    {
      icon: Shield,
      title: 'Privacy First',
      desc: 'Your data is encrypted and secure. We never share your information with third parties.',
      color: 'from-slate-500 to-slate-600',
      points: ['Bank-level encryption', 'No data selling', 'You own your data'],
    },
  ];

  const stats = [
    { value: '50k+', label: 'Resumes Analyzed' },
    { value: '120k+', label: 'Jobs Matched' },
    { value: '89%', label: 'Interview Rate' },
    { value: '4.9/5', label: 'User Rating' },
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-16">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-100/40 rounded-full blur-3xl" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-accent-100/40 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-6 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              AI-Powered Career Platform
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight tracking-tight animate-fade-in-up">
              Build a Better Resume.
              <br />
              <span className="bg-gradient-to-r from-brand-600 to-accent-600 bg-clip-text text-transparent">
                Find Jobs That Actually Match.
              </span>
            </h1>
            <p className="mt-6 text-lg text-gray-600 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              AI-powered resume optimization and intelligent job matching to help you find your next opportunity faster.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <Link to="/signup" className="btn-primary px-7 py-3.5 text-base w-full sm:w-auto">
                <FileText className="w-5 h-5" />
                Build My Resume
              </Link>
              <Link to="/signup" className="btn-secondary px-7 py-3.5 text-base w-full sm:w-auto">
                <Search className="w-5 h-5" />
                Find Matching Jobs
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Free to start</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Cancel anytime</span>
            </div>
          </div>

          {/* Hero visual */}
          <div className="mt-16 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* ATS Score card */}
              <div className="card p-6 flex flex-col items-center justify-center">
                <p className="text-sm font-medium text-gray-500 mb-3">ATS Score</p>
                <ProgressRing value={86} label="86" sublabel="/ 100" size={120} />
                <p className="text-sm font-semibold text-emerald-600 mt-3">Excellent</p>
              </div>
              {/* Match card */}
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Job Match</p>
                    <p className="text-lg font-bold text-gray-900">Senior Frontend Engineer</p>
                    <p className="text-sm text-gray-500">Stripe</p>
                  </div>
                  <MatchBadge score={92} />
                </div>
                <div className="space-y-2">
                  {['React', 'TypeScript', 'GraphQL'].map((skill) => (
                    <div key={skill} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      <span className="text-gray-700">{skill}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-4 h-4 rounded-full border-2 border-amber-400" />
                    <span className="text-gray-700">Webpack (partial)</span>
                  </div>
                </div>
              </div>
              {/* Stats card */}
              <div className="card p-6">
                <p className="text-sm font-medium text-gray-500 mb-4">Your Dashboard</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Matching Jobs</span>
                    <span className="text-lg font-bold text-brand-600">127</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Applications</span>
                    <span className="text-lg font-bold text-accent-600">14</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Saved Jobs</span>
                    <span className="text-lg font-bold text-emerald-600">23</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Profile</span>
                    <span className="text-lg font-bold text-amber-600">85%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
            <p className="mt-3 text-gray-600">From resume to job offer in five simple steps</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {workflow.map((step, i) => {
              const Icon = step.icon;
              return (
                <div key={i} className="relative">
                  <div className="card p-6 h-full hover:shadow-md transition-shadow animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                    <div className={`w-12 h-12 rounded-xl ${step.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-gray-400 mb-1">STEP {i + 1}</div>
                    <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                    <p className="text-sm text-gray-500">{step.desc}</p>
                  </div>
                  {i < workflow.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                      <ArrowRight className="w-5 h-5 text-gray-300" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium mb-4">
              <Zap className="w-4 h-4" />
              Features
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Everything you need to land your next job</h2>
            <p className="mt-3 text-gray-600 max-w-2xl mx-auto">
              From building a resume that passes ATS scanners to finding jobs that actually match your profile — all in one platform.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="card p-6 hover:shadow-lg transition-all hover:-translate-y-1 animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-sm text-gray-500 mb-4">{feature.desc}</p>
                  <ul className="space-y-1.5">
                    {feature.points.map((point, j) => (
                      <li key={j} className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-gradient-to-br from-brand-600 to-accent-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <div key={i} className="text-center animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <p className="text-4xl lg:text-5xl font-bold text-white">{stat.value}</p>
                <p className="text-sm text-brand-100 mt-2">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Loved by job seekers</h2>
            <p className="mt-3 text-gray-600">Join thousands who found their next role with CareerMatch AI</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Sarah Chen', role: 'Frontend Engineer at Stripe', text: 'The ATS scanner found issues I never knew about. After fixing them, I got 3 interviews in a week!', avatar: 'SC' },
              { name: 'Marcus Johnson', role: 'Product Manager at Linear', text: 'The job matching is spot on. It showed me exactly why I was a good fit and what skills to highlight.', avatar: 'MJ' },
              { name: 'Priya Patel', role: 'Data Scientist at Spotify', text: 'I went from 0 responses to 5 interviews. The resume builder alone was worth it.', avatar: 'PP' },
            ].map((t, i) => (
              <div key={i} className="card p-6 animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-500 to-accent-500 flex items-center justify-center text-white text-sm font-semibold">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-accent-600 px-8 py-16 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
            <div className="relative">
              <h2 className="text-3xl font-bold text-white mb-4">Ready to find your next job?</h2>
              <p className="text-brand-100 mb-8 max-w-xl mx-auto">
                Join thousands of professionals who accelerated their job search with AI-powered tools.
              </p>
              <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-brand-600 font-semibold text-base hover:shadow-xl transition-all active:scale-[0.98]">
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
