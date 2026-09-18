export type AssignmentStatus =
  | 'draft'
  | 'analysis'
  | 'research'
  | 'outline'
  | 'drafting'
  | 'review'
  | 'completed'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  nurse_role: 'student' | 'intern' | 'professional' | 'other' | null
  institution: string | null
  phone: string | null
  bio: string | null
  avatar_url: string | null
  onboarding: Record<string, string>
  preferences: {
    email_notifications?: boolean
    ai_suggestions?: boolean
    autosave?: boolean
    grammar_check?: boolean
  }
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  user_id: string
  title: string
  description: string | null
  status: 'active' | 'archived'
  created_at: string
  updated_at: string
}

export interface NursingAssignment {
  id: string
  project_id: string
  user_id: string
  topic: string
  assignment_question: string
  academic_level: string | null
  word_count: number | null
  due_date: string | null
  institution: string | null
  referencing_style: string | null
  lecturer_details: string | null
  additional_instructions: string | null
  status: AssignmentStatus
  created_at: string
  updated_at: string
}

export interface AssignmentAnalysis {
  id: string
  assignment_id: string
  user_id: string
  command_word: string | null
  subject: string | null
  scope: string | null
  key_requirements: string[]
  recommended_structure: string[]
  important_concepts: string[]
  analysis_text: string | null
  created_at: string
  updated_at: string
}

export interface AssignmentResearchItem {
  id: string
  assignment_id: string
  user_id: string
  research_question: string | null
  findings: string | null
  source_type: 'ai_generated' | 'verified_source' | 'user_uploaded'
  source_citation: string | null
  source_url: string | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface OutlineSection {
  title: string
  wordAllocation: number
  notes?: string
}

export interface AssignmentOutline {
  id: string
  assignment_id: string
  user_id: string
  sections: OutlineSection[]
  is_approved: boolean
  approved_at: string | null
  created_at: string
  updated_at: string
}

export interface AssignmentDraft {
  id: string
  assignment_id: string
  user_id: string
  version: number
  content: string | null
  word_count: number
  target_word_count: number | null
  created_at: string
  updated_at: string
}

export interface AssignmentReview {
  id: string
  assignment_id: string
  user_id: string
  draft_id: string | null
  review_summary: string | null
  issues: { text: string; type: 'warning' | 'info' }[]
  requirements_met: boolean | null
  score: number | null
  created_at: string
}

export interface AiCreditBalance {
  user_id: string
  included_credits_remaining: number
  topup_credits_remaining: number
  updated_at: string
}
