export interface Profile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  professional_title: string;
  years_of_experience: number;
  skills: string[];
  education: EducationEntry[];
  preferred_job_titles: string[];
  preferred_locations: string[];
  work_mode_preference: string;
  expected_salary_min: number;
  expected_salary_max: number;
  work_authorization: string;
  industries_of_interest: string[];
  avatar_url: string;
  created_at: string;
  updated_at: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  year: string;
  field: string;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  start_date: string;
  end_date: string;
  current: boolean;
  description: string;
}

export interface ResumeContent {
  summary: string;
  experience: ExperienceEntry[];
  education: EducationEntry[];
  skills: string[];
  certifications: string[];
  projects: { name: string; description: string; url: string }[];
  contact: {
    phone: string;
    email: string;
    location: string;
    website: string;
    linkedin: string;
  };
}

export interface Resume {
  id: string;
  user_id: string;
  title: string;
  is_active: boolean;
  content: ResumeContent;
  ats_score: number | null;
  ats_analysis: AtsAnalysis | null;
  completion_percentage: number;
  created_at: string;
  updated_at: string;
}

export interface AtsAnalysis {
  score: number;
  sections: {
    name: string;
    score: number;
    weight: number;
    status: 'good' | 'warning' | 'critical';
    feedback: string;
  }[];
  keywords: {
    found: string[];
    missing: string[];
  };
  suggestions: string[];
  strengths: string[];
  weaknesses: string[];
}

export interface Job {
  id: string;
  title: string;
  company: string;
  company_logo: string;
  description: string;
  requirements: string[];
  required_skills: string[];
  preferred_skills: string[];
  location: string;
  work_mode: string;
  salary_min: number;
  salary_max: number;
  salary_currency: string;
  job_type: string;
  experience_level: string;
  min_years_experience: number;
  industry: string;
  education_required: string;
  posted_at: string;
  is_active: boolean;
}

export interface MatchBreakdown {
  overall: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  locationMatch: number;
  salaryMatch: number;
  workModeMatch: number;
  matchedSkills: string[];
  missingSkills: string[];
  partialSkills: string[];
  reasons: { type: 'positive' | 'negative' | 'neutral'; text: string }[];
  recommendations: string[];
}

export interface Application {
  id: string;
  user_id: string;
  job_id: string;
  resume_id: string | null;
  status: string;
  match_score: number | null;
  match_breakdown: MatchBreakdown | null;
  applied_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
  job?: Job;
}

export interface SavedJob {
  id: string;
  user_id: string;
  job_id: string;
  created_at: string;
  job?: Job;
}

export const emptyResumeContent = (): ResumeContent => ({
  summary: '',
  experience: [],
  education: [],
  skills: [],
  certifications: [],
  projects: [],
  contact: {
    phone: '',
    email: '',
    location: '',
    website: '',
    linkedin: '',
  },
});
