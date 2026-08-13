import type {
  Resume,
  ResumeContent,
  Job,
  Profile,
  AtsAnalysis,
  MatchBreakdown,
} from './types';

// ============================================================
// ATS SCORE — Analyze resume quality against ATS criteria
// ============================================================
export function calculateAtsScore(resume: ResumeContent): AtsAnalysis {
  const sections: AtsAnalysis['sections'] = [];
  const suggestions: string[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];
  const foundKeywords: string[] = [];
  const missingKeywords: string[] = [];

  // --- Summary (15%) ---
  const summaryText = resume.summary?.trim() || '';
  let summaryScore = 0;
  if (summaryText.length >= 200) summaryScore = 100;
  else if (summaryText.length >= 100) summaryScore = 75;
  else if (summaryText.length >= 50) summaryScore = 50;
  else if (summaryText.length > 0) summaryScore = 25;
  sections.push({
    name: 'Professional Summary',
    score: summaryScore,
    weight: 15,
    status: summaryScore >= 75 ? 'good' : summaryScore >= 50 ? 'warning' : 'critical',
    feedback:
      summaryScore === 0
        ? 'No professional summary detected. Add a 3-4 sentence summary highlighting your value proposition.'
        : summaryScore < 75
        ? 'Your summary is too short. Aim for 3-4 sentences (at least 100 characters) that highlight your key achievements and value.'
        : 'Strong, well-sized professional summary.',
  });
  if (summaryScore === 0) suggestions.push('Add a professional summary at the top of your resume.');
  if (summaryScore >= 75) strengths.push('Well-written professional summary.');
  if (summaryScore < 50) weaknesses.push('Professional summary is missing or too brief.');

  // --- Experience (25%) ---
  const expCount = resume.experience?.length || 0;
  let expScore = 0;
  if (expCount >= 3) expScore = 100;
  else if (expCount === 2) expScore = 80;
  else if (expCount === 1) expScore = 60;
  else expScore = 0;

  // Check for quantified achievements in experience descriptions
  const hasQuantifiedAchievements = resume.experience?.some((e) =>
    /\d+%|\$\d+|\d+\+|increased|decreased|reduced|improved|saved|generated|managed \d+|led \d+/i.test(e.description)
  );
  if (hasQuantifiedAchievements) expScore = Math.min(100, expScore + 10);
  else if (expCount > 0) expScore = Math.max(0, expScore - 10);

  sections.push({
    name: 'Work Experience',
    score: Math.min(100, expScore),
    weight: 25,
    status: expScore >= 75 ? 'good' : expScore >= 50 ? 'warning' : 'critical',
    feedback:
      expCount === 0
        ? 'No work experience entries. Add your professional experience with quantified achievements.'
        : expCount < 3
        ? 'Add more experience entries if available. Employers look for a robust work history.'
        : hasQuantifiedAchievements
        ? 'Excellent — your experience includes quantified achievements.'
        : 'Add quantified achievements (e.g., "Increased sales by 30%") to strengthen your experience section.',
  });
  if (expCount === 0) suggestions.push('Add at least 3 work experience entries with quantified achievements.');
  if (expCount > 0 && !hasQuantifiedAchievements)
    suggestions.push('Quantify your achievements in experience descriptions (e.g., "Improved conversion by 25%").');
  if (expCount >= 3) strengths.push('Strong work history with multiple roles.');
  if (expCount === 0) weaknesses.push('No work experience listed.');

  // --- Skills (20%) ---
  const skillsCount = resume.skills?.length || 0;
  let skillsScore = 0;
  if (skillsCount >= 10) skillsScore = 100;
  else if (skillsCount >= 6) skillsScore = 80;
  else if (skillsCount >= 3) skillsScore = 60;
  else if (skillsCount > 0) skillsScore = 40;
  sections.push({
    name: 'Skills',
    score: skillsScore,
    weight: 20,
    status: skillsScore >= 80 ? 'good' : skillsScore >= 60 ? 'warning' : 'critical',
    feedback:
      skillsCount === 0
        ? 'No skills listed. Add both technical and soft skills relevant to your target roles.'
        : skillsCount < 6
        ? 'Add more skills — aim for at least 10 relevant skills to pass ATS keyword filters.'
        : 'Good range of skills listed.',
  });
  if (skillsCount === 0) suggestions.push('Add at least 10 relevant skills to pass ATS keyword filters.');
  if (skillsCount < 6) suggestions.push('Add more skills — aim for at least 10 to maximize ATS compatibility.');
  if (skillsCount >= 10) strengths.push('Comprehensive skills section.');
  if (skillsCount < 3) weaknesses.push('Skills section is too sparse.');

  // --- Education (10%) ---
  const eduCount = resume.education?.length || 0;
  let eduScore = 0;
  if (eduCount >= 1) eduScore = 100;
  else eduScore = 0;
  sections.push({
    name: 'Education',
    score: eduScore,
    weight: 10,
    status: eduScore >= 100 ? 'good' : 'critical',
    feedback:
      eduCount === 0
        ? 'No education entries. Add your highest degree, institution, and graduation year.'
        : 'Education section is complete.',
  });
  if (eduCount === 0) suggestions.push('Add your education history (degree, institution, year).');
  if (eduCount >= 1) strengths.push('Education section is complete.');

  // --- Contact Info (10%) ---
  const contact = resume.contact || {};
  const contactFields = [contact.email, contact.phone, contact.location, contact.linkedin];
  const filledContact = contactFields.filter((f) => f && f.trim().length > 0).length;
  let contactScore = Math.round((filledContact / 4) * 100);
  sections.push({
    name: 'Contact Information',
    score: contactScore,
    weight: 10,
    status: contactScore >= 75 ? 'good' : contactScore >= 50 ? 'warning' : 'critical',
    feedback:
      contactScore === 100
        ? 'All contact fields are present.'
        : `Missing ${4 - filledContact} contact field(s). Ensure email, phone, location, and LinkedIn are all included.`,
  });
  if (contactScore < 100)
    suggestions.push('Complete all contact fields: email, phone, location, and LinkedIn profile.');
  if (contactScore === 100) strengths.push('Complete contact information.');

  // --- Formatting / Action Verbs (10%) ---
  const allText = [
    resume.summary,
    ...(resume.experience?.map((e) => e.description) || []),
  ].join(' ').toLowerCase();
  const actionVerbs = [
    'led', 'developed', 'built', 'created', 'managed', 'designed',
    'implemented', 'launched', 'optimized', 'drove', 'spearheaded',
    'architected', 'automated', 'streamlined', 'negotiated', 'analyzed',
  ];
  const verbCount = actionVerbs.filter((v) => allText.includes(v)).length;
  let formatScore = Math.min(100, Math.round((verbCount / 5) * 100));
  sections.push({
    name: 'Action Verbs & Impact Language',
    score: formatScore,
    weight: 10,
    status: formatScore >= 60 ? 'good' : formatScore >= 30 ? 'warning' : 'critical',
    feedback:
      verbCount < 3
        ? 'Use strong action verbs (led, built, developed, optimized) to start your bullet points.'
        : 'Good use of action verbs throughout your resume.',
  });
  if (verbCount < 3)
    suggestions.push('Use strong action verbs to start bullet points (e.g., "Led", "Developed", "Optimized").');
  if (verbCount >= 5) strengths.push('Excellent use of action-oriented language.');

  // --- Projects / Certifications (10%) ---
  const projCount = resume.projects?.length || 0;
  const certCount = resume.certifications?.length || 0;
  let projScore = 0;
  if (certCount >= 2 && projCount >= 2) projScore = 100;
  else if (certCount >= 1 && projCount >= 1) projScore = 80;
  else if (certCount >= 1 || projCount >= 1) projScore = 60;
  else projScore = 30;
  sections.push({
    name: 'Projects & Certifications',
    score: projScore,
    weight: 10,
    status: projScore >= 80 ? 'good' : projScore >= 60 ? 'warning' : 'critical',
    feedback:
      projScore < 60
        ? 'Add projects and certifications to showcase practical skills and continuous learning.'
        : 'Good range of projects and certifications.',
  });
  if (projScore < 60)
    suggestions.push('Add relevant projects and professional certifications to strengthen your resume.');
  if (projScore >= 80) strengths.push('Strong portfolio of projects and certifications.');

  // --- Calculate overall score ---
  const overallScore = Math.round(
    sections.reduce((acc, s) => acc + (s.score * s.weight) / 100, 0)
  );

  // --- Keywords ---
  const commonKeywords = [
    'leadership', 'project management', 'agile', 'scrum', 'stakeholder',
    'cross-functional', 'collaboration', 'communication', 'analytical',
    'problem-solving', 'strategic planning', 'budget', 'roadmap',
    'kpi', 'okr', 'stakeholder management', 'presentation',
  ];
  commonKeywords.forEach((kw) => {
    if (allText.includes(kw.toLowerCase())) {
      foundKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  });

  return {
    score: overallScore,
    sections,
    keywords: { found: foundKeywords, missing: missingKeywords.slice(0, 8) },
    suggestions: suggestions.length ? suggestions : ['Your resume is in great shape! Keep it updated with recent achievements.'],
    strengths: strengths.length ? strengths : ['Resume structure is solid.'],
    weaknesses: weaknesses.length ? weaknesses : ['No major weaknesses detected.'],
  };
}

// ============================================================
// RESUME COMPLETION PERCENTAGE
// ============================================================
export function calculateResumeCompletion(content: ResumeContent): number {
  const checks = [
    content.summary && content.summary.length > 50,
    (content.experience?.length || 0) > 0,
    (content.education?.length || 0) > 0,
    (content.skills?.length || 0) >= 3,
    content.contact?.email && content.contact.email.length > 0,
    content.contact?.phone && content.contact.phone.length > 0,
    content.contact?.location && content.contact.location.length > 0,
    (content.certifications?.length || 0) > 0,
    (content.projects?.length || 0) > 0,
    content.contact?.linkedin && content.contact.linkedin.length > 0,
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

// ============================================================
// JOB MATCH SCORE — Compare resume/profile against a job
// ============================================================
export function calculateJobMatch(
  job: Job,
  resume: Resume | null,
  profile: Profile | null
): MatchBreakdown {
  // Gather user's skills from resume + profile
  const resumeSkills = resume?.content?.skills || [];
  const profileSkills = profile?.skills || [];
  const userSkills = Array.from(new Set([...resumeSkills, ...profileSkills])).map((s) =>
    s.toLowerCase().trim()
  );

  const yearsExp = profile?.years_of_experience || 0;
  const userEducation = [
    ...(resume?.content?.education || []),
    ...(profile?.education || []),
  ];
  const userLocation = (profile?.location || resume?.content?.contact?.location || '').toLowerCase();
  const userWorkMode = (profile?.work_mode_preference || 'any').toLowerCase();
  const userSalaryMin = profile?.expected_salary_min || 0;
  const userSalaryMax = profile?.expected_salary_max || 0;

  // --- Skills Match (40%) ---
  const requiredSkills = (job.required_skills || []).map((s) => s.toLowerCase().trim());
  const preferredSkills = (job.preferred_skills || []).map((s) => s.toLowerCase().trim());
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const partialSkills: string[] = [];

  requiredSkills.forEach((skill) => {
    if (userSkills.includes(skill)) {
      matchedSkills.push(skill);
    } else if (userSkills.some((us) => us.includes(skill) || skill.includes(us))) {
      partialSkills.push(skill);
    } else {
      missingSkills.push(skill);
    }
  });

  const preferredMatched = preferredSkills.filter((skill) =>
    userSkills.includes(skill.toLowerCase().trim())
  );

  const requiredMatchPct = requiredSkills.length
    ? (matchedSkills.length / requiredSkills.length) * 100
    : 100;
  const preferredBonus = preferredSkills.length
    ? (preferredMatched.length / preferredSkills.length) * 100 * 0.3
    : 0;
  const partialBonus = partialSkills.length * 5;
  let skillsScore = Math.min(100, Math.round(requiredMatchPct + preferredBonus + partialBonus));

  // --- Experience Match (25%) ---
  let experienceScore = 100;
  if (job.min_years_experience > 0) {
    if (yearsExp >= job.min_years_experience) {
      experienceScore = 100;
    } else {
      const ratio = yearsExp / job.min_years_experience;
      experienceScore = Math.round(ratio * 100);
    }
  }

  // --- Education Match (15%) ---
  let educationScore = 60;
  const eduRequired = (job.education_required || '').toLowerCase();
  if (eduRequired.includes('phd')) {
    educationScore = userEducation.some((e) => /phd|doctorate/i.test(e.degree)) ? 100 : 40;
  } else if (eduRequired.includes('master')) {
    educationScore = userEducation.some((e) => /master|phd|doctorate/i.test(e.degree))
      ? 100
      : userEducation.some((e) => /bachelor/i.test(e.degree))
      ? 70
      : 30;
  } else if (eduRequired.includes('bachelor')) {
    educationScore = userEducation.some((e) => /bachelor|master|phd/i.test(e.degree))
      ? 100
      : userEducation.length > 0
      ? 60
      : 30;
  } else if (userEducation.length > 0) {
    educationScore = 80;
  }

  // --- Location Match (10%) ---
  let locationScore = 50;
  const jobLocation = (job.location || '').toLowerCase();
  const jobWorkMode = (job.work_mode || '').toLowerCase();
  if (jobWorkMode === 'remote') {
    locationScore = 100;
  } else if (userLocation && jobLocation) {
    if (jobLocation.includes(userLocation) || userLocation.includes(jobLocation)) {
      locationScore = 100;
    } else {
      locationScore = 30;
    }
  }

  // --- Salary Match (5%) ---
  let salaryScore = 50;
  if (job.salary_max > 0 && userSalaryMax > 0) {
    if (job.salary_min >= userSalaryMax) {
      salaryScore = 100;
    } else if (job.salary_max >= userSalaryMin) {
      salaryScore = 80;
    } else if (job.salary_max < userSalaryMin) {
      salaryScore = 30;
    }
  } else if (job.salary_max > 0) {
    salaryScore = 70;
  }

  // --- Work Mode Match (5%) ---
  let workModeScore = 50;
  if (userWorkMode === 'any') {
    workModeScore = 100;
  } else if (userWorkMode === jobWorkMode) {
    workModeScore = 100;
  } else if (userWorkMode === 'remote' && jobWorkMode === 'hybrid') {
    workModeScore = 70;
  } else if (userWorkMode === 'onsite' && jobWorkMode === 'hybrid') {
    workModeScore = 80;
  } else {
    workModeScore = 40;
  }

  // --- Overall ---
  const overall = Math.round(
    skillsScore * 0.4 +
    experienceScore * 0.25 +
    educationScore * 0.15 +
    locationScore * 0.1 +
    salaryScore * 0.05 +
    workModeScore * 0.05
  );

  // --- Reasons ---
  const reasons: MatchBreakdown['reasons'] = [];
  if (matchedSkills.length > 0)
    reasons.push({ type: 'positive', text: `You have ${matchedSkills.length} of ${requiredSkills.length} required skills: ${matchedSkills.join(', ')}` });
  if (partialSkills.length > 0)
    reasons.push({ type: 'neutral', text: `Partial match on: ${partialSkills.join(', ')}` });
  if (missingSkills.length > 0)
    reasons.push({ type: 'negative', text: `Missing ${missingSkills.length} key skills: ${missingSkills.join(', ')}` });
  if (yearsExp >= job.min_years_experience)
    reasons.push({ type: 'positive', text: `You meet the experience requirement (${job.min_years_experience}+ years)` });
  else
    reasons.push({ type: 'negative', text: `You need ${job.min_years_experience - yearsExp} more year(s) of experience` });
  if (preferredMatched.length > 0)
    reasons.push({ type: 'positive', text: `You have ${preferredMatched.length} preferred skills that give you an edge` });
  if (jobWorkMode === 'remote')
    reasons.push({ type: 'positive', text: 'This is a fully remote position' });
  else if (locationScore === 100)
    reasons.push({ type: 'positive', text: `The job location matches your area` });
  else if (locationScore < 50)
    reasons.push({ type: 'negative', text: `The job is in ${job.location} — relocation may be needed` });

  // --- Recommendations ---
  const recommendations: string[] = [];
  if (missingSkills.length > 0)
    recommendations.push(`Add these skills to your resume or learn them: ${missingSkills.slice(0, 5).join(', ')}`);
  if (partialSkills.length > 0)
    recommendations.push(`Highlight your experience with: ${partialSkills.join(', ')} — even partial knowledge helps`);
  if (yearsExp < job.min_years_experience)
    recommendations.push(`Gain ${job.min_years_experience - yearsExp} more year(s) of experience or emphasize transferable skills`);
  if (preferredMatched.length < preferredSkills.length)
    recommendations.push(`Develop preferred skills: ${preferredSkills.filter((s) => !preferredMatched.includes(s)).slice(0, 3).join(', ')}`);
  if (recommendations.length === 0)
    recommendations.push('You are a strong match for this role — apply with confidence!');

  return {
    overall,
    skillsMatch: skillsScore,
    experienceMatch: experienceScore,
    educationMatch: educationScore,
    locationMatch: locationScore,
    salaryMatch: salaryScore,
    workModeMatch: workModeScore,
    matchedSkills,
    missingSkills,
    partialSkills,
    reasons,
    recommendations,
  };
}

// ============================================================
// PROFILE COMPLETION PERCENTAGE
// ============================================================
export function calculateProfileCompletion(profile: Profile): number {
  const checks = [
    !!profile.full_name,
    !!profile.email,
    !!profile.phone,
    !!profile.location,
    !!profile.professional_title,
    profile.years_of_experience > 0,
    (profile.skills?.length || 0) >= 3,
    (profile.education?.length || 0) > 0,
    (profile.preferred_job_titles?.length || 0) > 0,
    (profile.preferred_locations?.length || 0) > 0,
    !!profile.work_authorization,
    profile.expected_salary_max > 0,
    (profile.industries_of_interest?.length || 0) > 0,
  profile.work_mode_preference && profile.work_mode_preference !== 'any',
  ];
  const filled = checks.filter(Boolean).length;
  return Math.round((filled / checks.length) * 100);
}

// ============================================================
// RECOMMENDED SKILLS TO LEARN
// ============================================================
export function getRecommendedSkills(
  jobs: Job[],
  profile: Profile | null,
  resume: Resume | null,
  topN = 5
): { skill: string; jobCount: number }[] {
  const userSkills = new Set(
    [...(resume?.content?.skills || []), ...(profile?.skills || [])].map((s) =>
      s.toLowerCase().trim()
    )
  );
  const skillFrequency: Record<string, number> = {};
  jobs.forEach((job) => {
    [...(job.required_skills || []), ...(job.preferred_skills || [])].forEach((skill) => {
      const normalized = skill.toLowerCase().trim();
      if (!userSkills.has(normalized)) {
        skillFrequency[normalized] = (skillFrequency[normalized] || 0) + 1;
      }
    });
  });
  return Object.entries(skillFrequency)
    .map(([skill, jobCount]) => ({ skill, jobCount }))
    .sort((a, b) => b.jobCount - a.jobCount)
    .slice(0, topN);
}

// ============================================================
// MATCH STRENGTH LABEL
// ============================================================
export function getMatchStrength(score: number): {
  label: string;
  color: string;
  textColor: string;
  bgColor: string;
} {
  if (score >= 80) return { label: 'Excellent', color: 'emerald', textColor: 'text-emerald-600', bgColor: 'bg-emerald-50' };
  if (score >= 60) return { label: 'Good', color: 'blue', textColor: 'text-blue-600', bgColor: 'bg-blue-50' };
  if (score >= 40) return { label: 'Fair', color: 'amber', textColor: 'text-amber-600', bgColor: 'bg-amber-50' };
  return { label: 'Low', color: 'rose', textColor: 'text-rose-600', bgColor: 'bg-rose-50' };
}

// ============================================================
// SALARY FORMATTER
// ============================================================
export function formatSalary(min: number, max: number, currency = 'USD'): string {
  const symbol = currency === 'USD' ? '$' : currency + ' ';
  if (min && max) return `${symbol}${(min / 1000).toFixed(0)}k–${(max / 1000).toFixed(0)}k`;
  if (max) return `Up to ${symbol}${(max / 1000).toFixed(0)}k`;
  if (min) return `From ${symbol}${(min / 1000).toFixed(0)}k`;
  return 'Competitive';
}

// ============================================================
// TIME AGO FORMATTER
// ============================================================
export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week(s) ago`;
  return `${Math.floor(days / 30)} month(s) ago`;
}
