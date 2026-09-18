import { supabase } from './supabase'
import type {
  AiCreditBalance,
  AssignmentAnalysis,
  AssignmentDraft,
  AssignmentOutline,
  AssignmentResearchItem,
  AssignmentReview,
  AssignmentStatus,
  NursingAssignment,
  OutlineSection,
  Profile,
  Project,
} from './types'

// ---------- Projects ----------

export async function listProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data as Project[]
}

export async function createProject(title: string, description?: string): Promise<Project> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('projects')
    .insert({ user_id: user.id, title, description: description ?? null })
    .select()
    .single()
  if (error) throw error
  return data as Project
}

// ---------- Assignments ----------

export interface CreateAssignmentInput {
  projectTitle: string
  topic: string
  assignment_question: string
  academic_level?: string
  word_count?: number
  due_date?: string
  institution?: string
  referencing_style?: string
  lecturer_details?: string
  additional_instructions?: string
}

/** Creates a project + assignment together, the flow NewDocument.tsx drives. */
export async function createAssignment(input: CreateAssignmentInput): Promise<NursingAssignment> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Not signed in')

  const project = await createProject(input.projectTitle)

  const { data, error } = await supabase
    .from('nursing_assignments')
    .insert({
      project_id: project.id,
      user_id: user.id,
      topic: input.topic,
      assignment_question: input.assignment_question,
      academic_level: input.academic_level ?? null,
      word_count: input.word_count ?? null,
      due_date: input.due_date ?? null,
      institution: input.institution ?? null,
      referencing_style: input.referencing_style ?? null,
      lecturer_details: input.lecturer_details ?? null,
      additional_instructions: input.additional_instructions ?? null,
      status: 'draft',
    })
    .select()
    .single()
  if (error) throw error
  return data as NursingAssignment
}

export async function listAssignments(): Promise<NursingAssignment[]> {
  const { data, error } = await supabase
    .from('nursing_assignments')
    .select('*')
    .order('updated_at', { ascending: false })
  if (error) throw error
  return data as NursingAssignment[]
}

export async function getAssignment(id: string): Promise<NursingAssignment> {
  const { data, error } = await supabase.from('nursing_assignments').select('*').eq('id', id).single()
  if (error) throw error
  return data as NursingAssignment
}

export async function updateAssignmentStatus(id: string, status: AssignmentStatus): Promise<void> {
  const { error } = await supabase.from('nursing_assignments').update({ status }).eq('id', id)
  if (error) throw error
}

// ---------- Analysis ----------

export async function getAnalysis(assignmentId: string): Promise<AssignmentAnalysis | null> {
  const { data, error } = await supabase
    .from('nursing_assignment_analysis')
    .select('*')
    .eq('assignment_id', assignmentId)
    .maybeSingle()
  if (error) throw error
  return data as AssignmentAnalysis | null
}

export interface SaveAnalysisInput {
  command_word?: string
  subject?: string
  scope?: string
  key_requirements?: string[]
  recommended_structure?: string[]
  important_concepts?: string[]
  analysis_text?: string
}

/** Upserts the analysis row for an assignment and advances its status. */
export async function saveAnalysis(
  assignmentId: string,
  input: SaveAnalysisInput
): Promise<AssignmentAnalysis> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Not signed in')

  const existing = await getAnalysis(assignmentId)

  if (existing) {
    const { data, error } = await supabase
      .from('nursing_assignment_analysis')
      .update(input)
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data as AssignmentAnalysis
  }

  const { data, error } = await supabase
    .from('nursing_assignment_analysis')
    .insert({ assignment_id: assignmentId, user_id: user.id, ...input })
    .select()
    .single()
  if (error) throw error

  await updateAssignmentStatus(assignmentId, 'analysis')
  return data as AssignmentAnalysis
}

// ---------- Research ----------

export async function listResearch(assignmentId: string): Promise<AssignmentResearchItem[]> {
  const { data, error } = await supabase
    .from('nursing_assignment_research')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data as AssignmentResearchItem[]
}

export interface AddResearchInput {
  research_question?: string
  findings?: string
  source_type?: 'ai_generated' | 'verified_source' | 'user_uploaded'
  source_citation?: string
  source_url?: string
  is_verified?: boolean
}

export async function addResearchItem(
  assignmentId: string,
  input: AddResearchInput
): Promise<AssignmentResearchItem> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('nursing_assignment_research')
    .insert({ assignment_id: assignmentId, user_id: user.id, ...input })
    .select()
    .single()
  if (error) throw error

  await updateAssignmentStatus(assignmentId, 'research')
  return data as AssignmentResearchItem
}

export async function deleteResearchItem(id: string): Promise<void> {
  const { error } = await supabase.from('nursing_assignment_research').delete().eq('id', id)
  if (error) throw error
}

// ---------- Outline ----------

export async function getOutline(assignmentId: string): Promise<AssignmentOutline | null> {
  const { data, error } = await supabase
    .from('nursing_assignment_outline')
    .select('*')
    .eq('assignment_id', assignmentId)
    .maybeSingle()
  if (error) throw error
  return data as AssignmentOutline | null
}

export async function saveOutline(
  assignmentId: string,
  sections: OutlineSection[]
): Promise<AssignmentOutline> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Not signed in')

  const existing = await getOutline(assignmentId)

  if (existing) {
    const { data, error } = await supabase
      .from('nursing_assignment_outline')
      .update({ sections })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data as AssignmentOutline
  }

  const { data, error } = await supabase
    .from('nursing_assignment_outline')
    .insert({ assignment_id: assignmentId, user_id: user.id, sections })
    .select()
    .single()
  if (error) throw error

  await updateAssignmentStatus(assignmentId, 'outline')
  return data as AssignmentOutline
}

export async function approveOutline(outlineId: string, assignmentId: string): Promise<void> {
  const { error } = await supabase
    .from('nursing_assignment_outline')
    .update({ is_approved: true, approved_at: new Date().toISOString() })
    .eq('id', outlineId)
  if (error) throw error
  await updateAssignmentStatus(assignmentId, 'drafting')
}

// ---------- Drafts ----------

export async function getLatestDraft(assignmentId: string): Promise<AssignmentDraft | null> {
  const { data, error } = await supabase
    .from('nursing_assignment_drafts')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('version', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as AssignmentDraft | null
}

function countWords(html: string): number {
  const text = html.replace(/<[^>]*>/g, ' ')
  return text.split(/\s+/).filter(Boolean).length
}

/** Creates the first draft row, or updates the latest one in place. */
export async function saveDraft(
  assignmentId: string,
  content: string,
  targetWordCount?: number
): Promise<AssignmentDraft> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Not signed in')

  const word_count = countWords(content)
  const existing = await getLatestDraft(assignmentId)

  if (existing) {
    const { data, error } = await supabase
      .from('nursing_assignment_drafts')
      .update({ content, word_count })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data as AssignmentDraft
  }

  const { data, error } = await supabase
    .from('nursing_assignment_drafts')
    .insert({
      assignment_id: assignmentId,
      user_id: user.id,
      version: 1,
      content,
      word_count,
      target_word_count: targetWordCount ?? null,
    })
    .select()
    .single()
  if (error) throw error
  return data as AssignmentDraft
}

// ---------- Reviews ----------

export async function getLatestReview(assignmentId: string): Promise<AssignmentReview | null> {
  const { data, error } = await supabase
    .from('nursing_assignment_reviews')
    .select('*')
    .eq('assignment_id', assignmentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error) throw error
  return data as AssignmentReview | null
}

export interface SaveReviewInput {
  draft_id?: string
  review_summary?: string
  issues?: { text: string; type: 'warning' | 'info' }[]
  requirements_met?: boolean
  score?: number
}

export async function saveReview(
  assignmentId: string,
  input: SaveReviewInput
): Promise<AssignmentReview> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase
    .from('nursing_assignment_reviews')
    .insert({ assignment_id: assignmentId, user_id: user.id, ...input })
    .select()
    .single()
  if (error) throw error

  await updateAssignmentStatus(assignmentId, 'review')
  return data as AssignmentReview
}

export async function completeAssignment(assignmentId: string): Promise<void> {
  await updateAssignmentStatus(assignmentId, 'completed')
}

export async function generateAnalysisWithAI(assignmentId: string): Promise<AssignmentAnalysis> {
  const { data, error } = await supabase.functions.invoke('generate-analysis', {
    body: { assignmentId },
  })
  if (error) {
    // Edge Function errors carry the real message in the response body
    const context = (error as { context?: { json?: () => Promise<{ error?: string }> } }).context
    if (context?.json) {
      try {
        const body = await context.json()
        throw new Error(body.error || error.message)
      } catch {
        throw new Error(error.message)
      }
    }
    throw new Error(error.message)
  }
  return data.analysis as AssignmentAnalysis
}

// ---------- Profile ----------

export async function getMyProfile(): Promise<Profile | null> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) return null

  const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle()
  if (error) throw error
  return data as Profile | null
}

export interface UpdateProfileInput {
  full_name?: string
  nurse_role?: Profile['nurse_role']
  institution?: string
  phone?: string
  bio?: string
  avatar_url?: string
  onboarding?: Record<string, string>
  preferences?: Profile['preferences']
}

export async function updateMyProfile(input: UpdateProfileInput): Promise<Profile> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase.from('profiles').update(input).eq('id', user.id).select().single()
  if (error) throw error
  return data as Profile
}

export interface WritingStats {
  totalWords: number
  averageReviewScore: number | null
  completedCount: number
  totalAssignments: number
}

/** Derived stats for the Profile page — sums real draft word counts and review scores, no fabricated numbers. */
export async function getWritingStats(): Promise<WritingStats> {
  const { data: userData } = await supabase.auth.getUser()
  const user = userData.user
  if (!user) return { totalWords: 0, averageReviewScore: null, completedCount: 0, totalAssignments: 0 }

  const [assignmentsRes, draftsRes, reviewsRes] = await Promise.all([
    supabase.from('nursing_assignments').select('status'),
    supabase.from('nursing_assignment_drafts').select('word_count'),
    supabase.from('nursing_assignment_reviews').select('score'),
  ])
  if (assignmentsRes.error) throw assignmentsRes.error
  if (draftsRes.error) throw draftsRes.error
  if (reviewsRes.error) throw reviewsRes.error

  const totalAssignments = assignmentsRes.data?.length ?? 0
  const completedCount = assignmentsRes.data?.filter(a => a.status === 'completed').length ?? 0
  const totalWords = (draftsRes.data ?? []).reduce((sum, d) => sum + (d.word_count ?? 0), 0)
  const scores = (reviewsRes.data ?? []).map(r => r.score).filter((s): s is number => s !== null)
  const averageReviewScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null

  return { totalWords, averageReviewScore, completedCount, totalAssignments }
}

// ---------- Notifications ----------

export interface NotificationRow {
  id: string
  type: 'success' | 'warning' | 'info'
  title: string
  body: string | null
  link: string | null
  read: boolean
  created_at: string
}

export async function listNotifications(): Promise<NotificationRow[]> {
  const { data, error } = await supabase.from('notifications').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as NotificationRow[]
}

export async function markNotificationRead(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').update({ read: true }).eq('id', id)
  if (error) throw error
}

export async function markAllNotificationsRead(): Promise<void> {
  const { data: userData } = await supabase.auth.getUser()
  if (!userData.user) return
  const { error } = await supabase.from('notifications').update({ read: true }).eq('user_id', userData.user.id).eq('read', false)
  if (error) throw error
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await supabase.from('notifications').delete().eq('id', id)
  if (error) throw error
}

// ---------- Saved resources (personal research library) ----------

export interface SavedResource {
  id: string
  user_id: string
  title: string
  author: string | null
  resource_type: string
  year: number | null
  url: string | null
  notes: string | null
  starred: boolean
  created_at: string
  updated_at: string
}

export interface SaveResourceInput {
  title: string
  author?: string
  resource_type?: string
  year?: number
  url?: string
  notes?: string
  starred?: boolean
}

export async function listSavedResources(): Promise<SavedResource[]> {
  const { data, error } = await supabase.from('saved_resources').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data as SavedResource[]
}

export async function addSavedResource(input: SaveResourceInput): Promise<SavedResource> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase.from('saved_resources').insert({ user_id: user.id, ...input }).select().single()
  if (error) throw error
  return data as SavedResource
}

export async function toggleSavedResourceStar(id: string, starred: boolean): Promise<void> {
  const { error } = await supabase.from('saved_resources').update({ starred }).eq('id', id)
  if (error) throw error
}

export async function deleteSavedResource(id: string): Promise<void> {
  const { error } = await supabase.from('saved_resources').delete().eq('id', id)
  if (error) throw error
}

// ---------- Citations (personal reference library) ----------

export interface Citation {
  id: string
  user_id: string
  authors: string | null
  title: string
  year: number | null
  reference_type: string
  citation_text: string
  style_label: string | null
  source_url: string | null
  created_at: string
  updated_at: string
}

export interface SaveCitationInput {
  authors?: string
  title: string
  year?: number
  reference_type?: string
  citation_text: string
  style_label?: string
  source_url?: string
}

export async function listCitations(): Promise<Citation[]> {
  const { data, error } = await supabase.from('citations').select('*').order('authors', { ascending: true })
  if (error) throw error
  return data as Citation[]
}

export async function addCitation(input: SaveCitationInput): Promise<Citation> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) throw new Error('Not signed in')

  const { data, error } = await supabase.from('citations').insert({ user_id: user.id, ...input }).select().single()
  if (error) throw error
  return data as Citation
}

export async function updateCitation(id: string, input: SaveCitationInput): Promise<Citation> {
  const { data, error } = await supabase.from('citations').update(input).eq('id', id).select().single()
  if (error) throw error
  return data as Citation
}

export async function deleteCitation(id: string): Promise<void> {
  const { error } = await supabase.from('citations').delete().eq('id', id)
  if (error) throw error
}

// ---------- AI operations (usage history) ----------

export interface AiOperationRow {
  id: string
  operation_type: string
  provider: string | null
  model: string | null
  input_tokens: number
  output_tokens: number
  credits_consumed: number
  status: 'pending' | 'completed' | 'failed'
  error_message: string | null
  created_at: string
  assignment_id: string | null
  assignment_topic: string | null
}

export async function listAiOperations(): Promise<AiOperationRow[]> {
  const { data, error } = await supabase
    .from('ai_operations')
    .select('*, nursing_assignments(topic)')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map((row: any) => ({
    ...row,
    assignment_topic: row.nursing_assignments?.topic ?? null,
  }))
}

export async function deleteAiOperation(id: string): Promise<void> {
  const { error } = await supabase.from('ai_operations').delete().eq('id', id)
  if (error) throw error
}

// ---------- AI credits ----------

export async function getCreditBalance(): Promise<AiCreditBalance | null> {
  const { data: userData, error: userErr } = await supabase.auth.getUser()
  if (userErr) throw userErr
  const user = userData.user
  if (!user) return null

  const { data, error } = await supabase
    .from('ai_credit_balances')
    .select('*')
    .eq('user_id', user.id)
    .maybeSingle()
  if (error) throw error
  return data as AiCreditBalance | null
}
