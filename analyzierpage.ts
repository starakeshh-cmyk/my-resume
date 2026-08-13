import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Lightbulb,
  TrendingUp,
  TrendingDown,
  Loader2,
  ArrowRight,
  FileText,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Resume, ResumeContent, AtsAnalysis } from '@/lib/types';
import { emptyResumeContent } from '@/lib/types';
import { calculateAtsScore, calculateResumeCompletion } from '@/lib/scoring';
import { PageHeader, Breadcrumb, Spinner, EmptyState } from '@/components/ui/Layout';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function AnalyzerPage() {
  const { user } = useAuth();
  const [resume, setResume] = useState<Resume | null>(null);
  const [content, setContent] = useState<ResumeContent>(emptyResumeContent());
  const [analysis, setAnalysis] = useState<AtsAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [hasScanned, setHasScanned] = useState(false);

  useEffect(() => {
    async function loadResume() {
      if (!user) return;
      const { data } = await supabase
        .from('resumes')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .maybeSingle();
      if (data) {
        setResume(data as Resume);
        setContent({ ...emptyResumeContent(), ...(data.content as ResumeContent) });
        if (data.ats_analysis) {
          setAnalysis(data.ats_analysis as AtsAnalysis);
          setHasScanned(true);
        }
      }
      setLoading(false);
    }
    loadResume();
  }, [user]);

  const runScan = async () => {
    setScanning(true);
    // Simulate AI analysis delay for UX
    await new Promise((r) => setTimeout(r, 1200));
    const result = calculateAtsScore(content);
    setAnalysis(result);
    setHasScanned(true);
    setScanning(false);

    // Save to database
    if (resume && user) {
      await supabase
        .from('resumes')
        .update({
          ats_score: result.score,
          ats_analysis: result,
          completion_percentage: calculateResumeCompletion(content),
          updated_at: new Date().toISOString(),
        })
        .eq('id', resume.id);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  const hasContent = content.summary || content.experience.length > 0 || content.skills.length > 0;

  if (!hasContent && !resume) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'ATS Scanner' }]} />
        <PageHeader title="ATS Scanner" subtitle="Analyze your resume for ATS compatibility" />
        <EmptyState
          icon={<FileText className="w-8 h-8" />}
          title="No resume to analyze"
          description="Build your resume first, then come back to scan it for ATS compatibility and get your score."
          action={
            <Link to="/resume" className="btn-primary">
              <FileText className="w-4 h-4" />
              Build Your Resume
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'ATS Scanner' }]} />
      <PageHeader
        title="ATS Scanner"
        subtitle="AI-powered analysis of your resume's ATS compatibility"
        actions={
          <button onClick={runScan} disabled={scanning || !hasContent} className="btn-primary">
            {scanning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {scanning ? 'Scanning...' : hasScanned ? 'Re-scan' : 'Run Scan'}
          </button>
        }
      />

      {/* Scanning animation */}
      {scanning && (
        <div className="card p-12 flex flex-col items-center justify-center animate-fade-in">
          <div className="relative">
            <ProgressRing value={100} size={120} label="" />
            <Sparkles className="w-8 h-8 text-brand-500 absolute inset-0 m-auto animate-pulse" />
          </div>
          <p className="mt-6 text-lg font-semibold text-gray-900">AI is analyzing your resume...</p>
          <p className="text-sm text-gray-500 mt-1">Checking ATS compatibility, keywords, and formatting</p>
        </div>
      )}

      {/* Results */}
      {!scanning && analysis && (
        <div className="space-y-6 animate-fade-in">
          {/* Overall score */}
          <div className="card p-8">
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="flex flex-col items-center">
                <ProgressRing value={analysis.score} label={`${analysis.score}`} sublabel="/ 100" size={140} />
                <p className="text-sm font-semibold text-gray-500 mt-2">Overall ATS Score</p>
              </div>
              <div className="flex-1 w-full">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-emerald-50">
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsUp className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-semibold text-emerald-700">Strengths</span>
                    </div>
                    <ul className="space-y-1">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="text-xs text-emerald-600 flex items-start gap-1.5">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl bg-rose-50">
                    <div className="flex items-center gap-2 mb-2">
                      <ThumbsDown className="w-4 h-4 text-rose-600" />
                      <span className="text-sm font-semibold text-rose-700">Weaknesses</span>
                    </div>
                    <ul className="space-y-1">
                      {analysis.weaknesses.map((w, i) => (
                        <li key={i} className="text-xs text-rose-600 flex items-start gap-1.5">
                          <XCircle className="w-3 h-3 mt-0.5 flex-shrink-0" />
                          {w}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section breakdown */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-5">Section-by-Section Analysis</h3>
            <div className="space-y-4">
              {analysis.sections.map((section, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {section.status === 'good' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : section.status === 'warning' ? (
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                      <span className="text-sm font-medium text-gray-900">{section.name}</span>
                      <span className="text-xs text-gray-400">({section.weight}% weight)</span>
                    </div>
                    <span className={`text-sm font-bold ${
                      section.score >= 75 ? 'text-emerald-600' : section.score >= 50 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {section.score}/100
                    </span>
                  </div>
                  <ProgressBar value={section.score} color={section.score >= 75 ? 'emerald' : section.score >= 50 ? 'amber' : 'rose'} size="sm" showValue={false} />
                  <p className="text-xs text-gray-500 mt-1.5">{section.feedback}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Keywords Found ({analysis.keywords.found.length})
              </h3>
              {analysis.keywords.found.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.found.map((kw, i) => (
                    <span key={i} className="badge bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No common keywords detected yet.</p>
              )}
            </div>
            <div className="card p-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                Missing Keywords ({analysis.keywords.missing.length})
              </h3>
              {analysis.keywords.missing.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.keywords.missing.map((kw, i) => (
                    <span key={i} className="badge bg-amber-50 text-amber-700 ring-1 ring-amber-100">
                      {kw}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-400">All common keywords are present!</p>
              )}
            </div>
          </div>

          {/* Suggestions */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              Recommendations to Improve
            </h3>
            <div className="space-y-2">
              {analysis.suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-amber-50/50">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-sm text-gray-700">{s}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="card p-6 bg-gradient-to-br from-brand-50 to-accent-50 border-brand-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold text-gray-900">Ready to improve your resume?</h3>
                <p className="text-sm text-gray-600 mt-1">Use the resume builder to apply these recommendations and boost your ATS score.</p>
              </div>
              <Link to="/resume" className="btn-primary flex-shrink-0">
                Edit Resume
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Pre-scan state */}
      {!scanning && !analysis && hasContent && (
        <div className="card p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-brand-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to scan</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            We found your resume. Click "Run Scan" to get your ATS score, section-by-section analysis, and personalized recommendations.
          </p>
          <button onClick={runScan} className="btn-primary">
            <Sparkles className="w-4 h-4" />
            Run Scan
          </button>
        </div>
      )}
    </div>
  );
}
