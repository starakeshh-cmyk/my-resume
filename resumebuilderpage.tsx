import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Save,
  Sparkles,
  FileText,
  Briefcase,
  GraduationCap,
  Award,
  FolderGit2,
  Phone,
  Mail,
  MapPin,
  Globe,
  Linkedin,
  Loader2,
  CheckCircle2,
  Download,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import type { Resume, ResumeContent, ExperienceEntry, EducationEntry } from '@/lib/types';
import { emptyResumeContent } from '@/lib/types';
import { calculateResumeCompletion } from '@/lib/scoring';
import { PageHeader, Breadcrumb, Spinner } from '@/components/ui/Layout';
import { ProgressBar } from '@/components/ui/ProgressBar';

export function ResumeBuilderPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resume, setResume] = useState<Resume | null>(null);
  const [content, setContent] = useState<ResumeContent>(emptyResumeContent());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<'summary' | 'experience' | 'education' | 'skills' | 'projects' | 'contact'>('summary');

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
      }
      setLoading(false);
    }
    loadResume();
  }, [user]);

  const completion = calculateResumeCompletion(content);

  const handleSave = useCallback(async () => {
    if (!user) return;
    setSaving(true);
    setSaved(false);
    const completionPct = calculateResumeCompletion(content);
    if (resume) {
      const { error } = await supabase
        .from('resumes')
        .update({
          content,
          completion_percentage: completionPct,
          updated_at: new Date().toISOString(),
        })
        .eq('id', resume.id);
      if (!error) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } else {
      const { data, error } = await supabase
        .from('resumes')
        .insert({
          user_id: user.id,
          title: 'My Resume',
          is_active: true,
          content,
          completion_percentage: completionPct,
        })
        .select('*')
        .maybeSingle();
      if (data) setResume(data as Resume);
    }
    setSaving(false);
  }, [user, resume, content]);

  const updateContent = (updates: Partial<ResumeContent>) => {
    setContent((prev) => ({ ...prev, ...updates }));
  };

  const addExperience = () => {
    updateContent({
      experience: [...content.experience, { title: '', company: '', start_date: '', end_date: '', current: false, description: '' }],
    });
  };

  const updateExperience = (index: number, updates: Partial<ExperienceEntry>) => {
    const exp = [...content.experience];
    exp[index] = { ...exp[index], ...updates };
    updateContent({ experience: exp });
  };

  const removeExperience = (index: number) => {
    updateContent({ experience: content.experience.filter((_, i) => i !== index) });
  };

  const addEducation = () => {
    updateContent({
      education: [...content.education, { degree: '', institution: '', year: '', field: '' }],
    });
  };

  const updateEducation = (index: number, updates: Partial<EducationEntry>) => {
    const edu = [...content.education];
    edu[index] = { ...edu[index], ...updates };
    updateContent({ education: edu });
  };

  const removeEducation = (index: number) => {
    updateContent({ education: content.education.filter((_, i) => i !== index) });
  };

  const addProject = () => {
    updateContent({
      projects: [...content.projects, { name: '', description: '', url: '' }],
    });
  };

  const removeProject = (index: number) => {
    updateContent({ projects: content.projects.filter((_, i) => i !== index) });
  };

  const tabs = [
    { id: 'summary', label: 'Summary', icon: FileText },
    { id: 'experience', label: 'Experience', icon: Briefcase },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Award },
    { id: 'projects', label: 'Projects', icon: FolderGit2 },
    { id: 'contact', label: 'Contact', icon: Phone },
  ] as const;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Resume Builder' }]} />
      <PageHeader
        title="Resume Builder"
        subtitle="Build a professional, ATS-friendly resume step by step"
        actions={
          <>
            <Link to="/analyzer" className="btn-secondary">
              <Sparkles className="w-4 h-4" />
              Scan Resume
            </Link>
            <button onClick={handleSave} disabled={saving} className="btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : saved ? 'Saved!' : 'Save'}
            </button>
          </>
        }
      />

      {/* Progress bar */}
      <div className="card p-5 mb-6">
        <ProgressBar value={completion} label="Resume Completion" color={completion >= 80 ? 'emerald' : 'brand'} />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-600/20'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab content */}
      <div className="card p-6">
        {activeTab === 'summary' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="label">Professional Summary</label>
              <textarea
                value={content.summary}
                onChange={(e) => updateContent({ summary: e.target.value })}
                rows={6}
                placeholder="Write a 3-4 sentence summary highlighting your experience, key skills, and what you bring to the table. Example: 'Senior frontend engineer with 6+ years building scalable web applications. Specialized in React, TypeScript, and performance optimization. Led teams of 5+ developers to deliver products used by millions...'"
                className="input resize-none"
              />
              <p className="text-xs text-gray-400 mt-1">{content.summary.length} characters — aim for 200+ for best ATS results</p>
            </div>
          </div>
        )}

        {activeTab === 'experience' && (
          <div className="space-y-4 animate-fade-in">
            {content.experience.map((exp, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">Experience #{i + 1}</span>
                  <button onClick={() => removeExperience(i)} className="text-rose-500 hover:text-rose-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Job Title</label>
                    <input value={exp.title} onChange={(e) => updateExperience(i, { title: e.target.value })} placeholder="Senior Engineer" className="input" />
                  </div>
                  <div>
                    <label className="label">Company</label>
                    <input value={exp.company} onChange={(e) => updateExperience(i, { company: e.target.value })} placeholder="Acme Inc." className="input" />
                  </div>
                  <div>
                    <label className="label">Start Date</label>
                    <input value={exp.start_date} onChange={(e) => updateExperience(i, { start_date: e.target.value })} placeholder="Jan 2022" className="input" />
                  </div>
                  <div>
                    <label className="label">End Date</label>
                    <input
                      value={exp.current ? 'Present' : exp.end_date}
                      onChange={(e) => updateExperience(i, { end_date: e.target.value })}
                      disabled={exp.current}
                      placeholder="Dec 2023"
                      className="input disabled:bg-gray-50"
                    />
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(i, { current: e.target.checked })} className="rounded border-gray-300 text-brand-600" />
                  I currently work here
                </label>
                <div>
                  <label className="label">Description & Achievements</label>
                  <textarea
                    value={exp.description}
                    onChange={(e) => updateExperience(i, { description: e.target.value })}
                    rows={4}
                    placeholder="Led development of... • Improved performance by 40% • Managed a team of 5 engineers..."
                    className="input resize-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Use action verbs and quantify achievements (e.g., "Increased by 30%")</p>
                </div>
              </div>
            ))}
            <button onClick={addExperience} className="btn-secondary w-full">
              <Plus className="w-4 h-4" />
              Add Experience
            </button>
          </div>
        )}

        {activeTab === 'education' && (
          <div className="space-y-4 animate-fade-in">
            {content.education.map((edu, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">Education #{i + 1}</span>
                  <button onClick={() => removeEducation(i)} className="text-rose-500 hover:text-rose-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Degree</label>
                    <input value={edu.degree} onChange={(e) => updateEducation(i, { degree: e.target.value })} placeholder="B.S. Computer Science" className="input" />
                  </div>
                  <div>
                    <label className="label">Institution</label>
                    <input value={edu.institution} onChange={(e) => updateEducation(i, { institution: e.target.value })} placeholder="Stanford University" className="input" />
                  </div>
                  <div>
                    <label className="label">Field of Study</label>
                    <input value={edu.field} onChange={(e) => updateEducation(i, { field: e.target.value })} placeholder="Computer Science" className="input" />
                  </div>
                  <div>
                    <label className="label">Graduation Year</label>
                    <input value={edu.year} onChange={(e) => updateEducation(i, { year: e.target.value })} placeholder="2020" className="input" />
                  </div>
                </div>
              </div>
            ))}
            <button onClick={addEducation} className="btn-secondary w-full">
              <Plus className="w-4 h-4" />
              Add Education
            </button>
          </div>
        )}

        {activeTab === 'skills' && (
          <div className="space-y-4 animate-fade-in">
            <div>
              <label className="label">Skills (press Enter to add)</label>
              <SkillInput
                skills={content.skills}
                onChange={(skills) => updateContent({ skills })}
              />
            </div>
            <div>
              <label className="label">Certifications (press Enter to add)</label>
              <SkillInput
                skills={content.certifications}
                onChange={(certs) => updateContent({ certifications: certs })}
                placeholder="AWS Certified, PMP..."
              />
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-4 animate-fade-in">
            {content.projects.map((proj, i) => (
              <div key={i} className="p-4 rounded-xl border border-gray-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-500">Project #{i + 1}</span>
                  <button onClick={() => removeProject(i)} className="text-rose-500 hover:text-rose-600 p-1">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div>
                  <label className="label">Project Name</label>
                  <input
                    value={proj.name}
                    onChange={(e) => {
                      const projects = [...content.projects];
                      projects[i] = { ...projects[i], name: e.target.value };
                      updateContent({ projects });
                    }}
                    placeholder="E-commerce Platform"
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Description</label>
                  <textarea
                    value={proj.description}
                    onChange={(e) => {
                      const projects = [...content.projects];
                      projects[i] = { ...projects[i], description: e.target.value };
                      updateContent({ projects });
                    }}
                    rows={3}
                    placeholder="Built a full-stack e-commerce platform with React, Node.js, and PostgreSQL..."
                    className="input resize-none"
                  />
                </div>
                <div>
                  <label className="label">URL (optional)</label>
                  <input
                    value={proj.url}
                    onChange={(e) => {
                      const projects = [...content.projects];
                      projects[i] = { ...projects[i], url: e.target.value };
                      updateContent({ projects });
                    }}
                    placeholder="https://github.com/..."
                    className="input"
                  />
                </div>
              </div>
            ))}
            <button onClick={addProject} className="btn-secondary w-full">
              <Plus className="w-4 h-4" />
              Add Project
            </button>
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={content.contact.email} onChange={(e) => updateContent({ contact: { ...content.contact, email: e.target.value } })} placeholder="you@example.com" className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="label">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={content.contact.phone} onChange={(e) => updateContent({ contact: { ...content.contact, phone: e.target.value } })} placeholder="+1 (555) 123-4567" className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="label">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={content.contact.location} onChange={(e) => updateContent({ contact: { ...content.contact, location: e.target.value } })} placeholder="San Francisco, CA" className="input pl-10" />
                </div>
              </div>
              <div>
                <label className="label">Website</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={content.contact.website} onChange={(e) => updateContent({ contact: { ...content.contact, website: e.target.value } })} placeholder="https://yoursite.com" className="input pl-10" />
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="label">LinkedIn</label>
                <div className="relative">
                  <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={content.contact.linkedin} onChange={(e) => updateContent({ contact: { ...content.contact, linkedin: e.target.value } })} placeholder="https://linkedin.com/in/..." className="input pl-10" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Preview link */}
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Resume
        </button>
      </div>
    </div>
  );
}

function SkillInput({ skills, onChange, placeholder }: { skills: string[]; onChange: (skills: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');

  const addSkill = () => {
    const trimmed = input.trim();
    if (trimmed && !skills.includes(trimmed)) {
      onChange([...skills, trimmed]);
    }
    setInput('');
  };

  return (
    <div>
      <div className="flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              addSkill();
            }
          }}
          placeholder={placeholder || 'Type a skill and press Enter...'}
          className="input"
        />
        <button onClick={addSkill} className="btn-secondary flex-shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {skills.map((skill, i) => (
            <span key={i} className="badge bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              {skill}
              <button onClick={() => onChange(skills.filter((_, j) => j !== i))} className="ml-1 hover:text-brand-900">
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
