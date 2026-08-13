import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  GraduationCap,
  Target,
  DollarSign,
  Shield,
  Building2,
  Plus,
  X,
  Loader2,
  CheckCircle2,
  Save,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { Profile, EducationEntry } from '@/lib/types';
import { calculateProfileCompletion } from '@/lib/scoring';
import { PageHeader, Breadcrumb, Spinner } from '@/components/ui/Layout';
import { ProgressBar } from '@/components/ui/ProgressBar';

const WORK_MODES = ['any', 'remote', 'hybrid', 'onsite'];
const AUTH_OPTIONS = ['Citizen', 'Green Card', 'H-1B', 'L-1', 'O-1', 'F-1 OPT', 'F-1 CPT', 'TN', 'E-3', 'Other'];
const INDUSTRIES = ['Technology', 'Fintech', 'Healthcare', 'E-commerce', 'SaaS', 'Media', 'Education', 'Finance', 'Cybersecurity', 'AI Research', 'Cloud Infrastructure', 'Travel', 'Streaming', 'Developer Tools', 'Design Tools', 'Productivity Software'];

export function ProfilePage() {
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) setForm({ ...profile });
  }, [profile]);

  const completion = form ? calculateProfileCompletion(form) : 0;

  const update = useCallback((updates: Partial<Profile>) => {
    setForm((prev) => (prev ? { ...prev, ...updates } : prev));
  }, []);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    setSaved(false);
    await updateProfile(form);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!form) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb items={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Profile Settings' }]} />
      <PageHeader
        title="Profile Settings"
        subtitle="Complete your profile for better job matches"
        actions={
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
          </button>
        }
      />

      {/* Completion bar */}
      <div className="card p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Profile Completion</span>
          <span className="text-sm font-bold text-brand-600">{completion}%</span>
        </div>
        <ProgressBar value={completion} color={completion >= 80 ? 'emerald' : 'brand'} showValue={false} />
        {completion < 100 && (
          <p className="text-xs text-gray-400 mt-2">Complete all fields for the best job matching results.</p>
        )}
      </div>

      {/* Personal Info */}
      <Section title="Personal Information" icon={User}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Full Name" icon={User}>
            <input value={form.full_name} onChange={(e) => update({ full_name: e.target.value })} placeholder="John Doe" className="input" />
          </Field>
          <Field label="Email" icon={Mail}>
            <input value={form.email} onChange={(e) => update({ email: e.target.value })} placeholder="you@example.com" className="input" />
          </Field>
          <Field label="Phone" icon={Phone}>
            <input value={form.phone} onChange={(e) => update({ phone: e.target.value })} placeholder="+1 (555) 123-4567" className="input" />
          </Field>
          <Field label="Location" icon={MapPin}>
            <input value={form.location} onChange={(e) => update({ location: e.target.value })} placeholder="San Francisco, CA" className="input" />
          </Field>
          <Field label="Professional Title" icon={Briefcase}>
            <input value={form.professional_title} onChange={(e) => update({ professional_title: e.target.value })} placeholder="Senior Frontend Engineer" className="input" />
          </Field>
          <Field label="Years of Experience" icon={Award}>
            <input type="number" value={form.years_of_experience} onChange={(e) => update({ years_of_experience: parseInt(e.target.value) || 0 })} min={0} max={50} className="input" />
          </Field>
        </div>
      </Section>

      {/* Skills */}
      <Section title="Skills" icon={Award}>
        <TagInput
          values={form.skills}
          onChange={(skills) => update({ skills })}
          placeholder="Type a skill and press Enter (e.g., React, Python, Leadership)..."
        />
      </Section>

      {/* Education */}
      <Section title="Education" icon={GraduationCap}>
        <div className="space-y-3">
          {form.education.map((edu, i) => (
            <div key={i} className="p-4 rounded-xl border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-500">Education #{i + 1}</span>
                <button onClick={() => update({ education: form.education.filter((_, j) => j !== i) })} className="text-rose-500 hover:text-rose-600 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  value={edu.degree}
                  onChange={(e) => {
                    const education = [...form.education];
                    education[i] = { ...education[i], degree: e.target.value };
                    update({ education });
                  }}
                  placeholder="B.S. Computer Science"
                  className="input"
                />
                <input
                  value={edu.institution}
                  onChange={(e) => {
                    const education = [...form.education];
                    education[i] = { ...education[i], institution: e.target.value };
                    update({ education });
                  }}
                  placeholder="Stanford University"
                  className="input"
                />
                <input
                  value={edu.field}
                  onChange={(e) => {
                    const education = [...form.education];
                    education[i] = { ...education[i], field: e.target.value };
                    update({ education });
                  }}
                  placeholder="Computer Science"
                  className="input"
                />
                <input
                  value={edu.year}
                  onChange={(e) => {
                    const education = [...form.education];
                    education[i] = { ...education[i], year: e.target.value };
                    update({ education });
                  }}
                  placeholder="2020"
                  className="input"
                />
              </div>
            </div>
          ))}
          <button
            onClick={() => update({ education: [...form.education, { degree: '', institution: '', year: '', field: '' }] })}
            className="btn-secondary w-full"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        </div>
      </Section>

      {/* Job Preferences */}
      <Section title="Job Preferences" icon={Target}>
        <div className="space-y-4">
          <div>
            <label className="label">Preferred Job Titles</label>
            <TagInput
              values={form.preferred_job_titles}
              onChange={(preferred_job_titles) => update({ preferred_job_titles })}
              placeholder="Senior Engineer, Tech Lead, Product Manager..."
            />
          </div>
          <div>
            <label className="label">Preferred Locations</label>
            <TagInput
              values={form.preferred_locations}
              onChange={(preferred_locations) => update({ preferred_locations })}
              placeholder="San Francisco, Remote, New York..."
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">Work Mode Preference</label>
              <select value={form.work_mode_preference} onChange={(e) => update({ work_mode_preference: e.target.value })} className="input">
                {WORK_MODES.map((mode) => (
                  <option key={mode} value={mode} className="capitalize">{mode === 'any' ? 'Any' : mode.charAt(0).toUpperCase() + mode.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Work Authorization</label>
              <select value={form.work_authorization} onChange={(e) => update({ work_authorization: e.target.value })} className="input">
                <option value="">Select...</option>
                {AUTH_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Expected Salary Min ($)</label>
              <input type="number" value={form.expected_salary_min} onChange={(e) => update({ expected_salary_min: parseInt(e.target.value) || 0 })} placeholder="80000" step={5000} className="input" />
            </div>
            <div>
              <label className="label">Expected Salary Max ($)</label>
              <input type="number" value={form.expected_salary_max} onChange={(e) => update({ expected_salary_max: parseInt(e.target.value) || 0 })} placeholder="150000" step={5000} className="input" />
            </div>
          </div>
        </div>
      </Section>

      {/* Industries */}
      <Section title="Industries of Interest" icon={Building2}>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((industry) => {
            const selected = form.industries_of_interest.includes(industry);
            return (
              <button
                key={industry}
                onClick={() => {
                  if (selected) {
                    update({ industries_of_interest: form.industries_of_interest.filter((i) => i !== industry) });
                  } else {
                    update({ industries_of_interest: [...form.industries_of_interest, industry] });
                  }
                }}
                className={`badge text-sm px-3 py-1.5 transition-all ${
                  selected ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {industry}
              </button>
            );
          })}
        </div>
      </Section>

      {/* Save button */}
      <div className="mt-6 flex justify-end">
        <button onClick={handleSave} disabled={saving} className="btn-primary">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <CheckCircle2 className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Profile'}
        </button>
      </div>
    </div>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="card p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Icon className="w-5 h-5 text-brand-600" />
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ label, icon: Icon, children }: { label: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div>
      <label className="label flex items-center gap-1.5">
        <Icon className="w-3.5 h-3.5 text-gray-400" />
        {label}
      </label>
      {children}
    </div>
  );
}

function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (values: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState('');

  const add = () => {
    const trimmed = input.trim();
    if (trimmed && !values.includes(trimmed)) {
      onChange([...values, trimmed]);
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
              add();
            }
          }}
          placeholder={placeholder}
          className="input"
        />
        <button onClick={add} className="btn-secondary flex-shrink-0">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-3">
          {values.map((val, i) => (
            <span key={i} className="badge bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              {val}
              <button onClick={() => onChange(values.filter((_, j) => j !== i))} className="ml-1 hover:text-brand-900">×</button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
