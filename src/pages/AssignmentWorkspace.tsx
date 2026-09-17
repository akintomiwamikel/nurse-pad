import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, Sparkles, CheckCircle, Plus, Trash2, ArrowRight,
  ClipboardList, Microscope, ListTree, PenLine, ShieldCheck, Circle, Loader2,
  ShieldAlert, Link as LinkIcon, Paperclip, Download, Upload,
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import {
  addResearchItem, approveOutline, deleteResearchItem, generateAnalysisWithAI, getAnalysis, getAssignment, getOutline,
  listResearch, saveAnalysis, saveOutline,
} from '../lib/api'
import { deleteAssignmentFile, getFileDownloadUrl, listAssignmentFiles, uploadAssignmentFile } from '../lib/storage'
import type { UploadedFile } from '../lib/storage'
import type {
  AssignmentAnalysis, AssignmentOutline, AssignmentResearchItem, AssignmentStatus, NursingAssignment, OutlineSection,
} from '../lib/types'

type Stage = 'analysis' | 'research' | 'outline' | 'files'

const stages: { key: AssignmentStatus; label: string; icon: typeof ClipboardList }[] = [
  { key: 'draft', label: 'Draft', icon: Circle },
  { key: 'analysis', label: 'Analysis', icon: ClipboardList },
  { key: 'research', label: 'Research', icon: Microscope },
  { key: 'outline', label: 'Outline', icon: ListTree },
  { key: 'drafting', label: 'Drafting', icon: PenLine },
  { key: 'review', label: 'Review', icon: ShieldCheck },
  { key: 'completed', label: 'Completed', icon: CheckCircle },
]

function stageIndex(status: AssignmentStatus) {
  return stages.findIndex(s => s.key === status)
}

export default function AssignmentWorkspace() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [assignment, setAssignment] = useState<NursingAssignment | null>(null)
  const [tab, setTab] = useState<Stage>('analysis')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setLoadError(null)
    getAssignment(id)
      .then(a => {
        setAssignment(a)
        // Land on the tab matching where the assignment already is
        if (a.status === 'draft' || a.status === 'analysis') setTab('analysis')
        else if (a.status === 'research') setTab('research')
        else if (a.status === 'outline' || a.status === 'drafting' || a.status === 'review' || a.status === 'completed') setTab('outline')
      })
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Could not load this assignment'))
      .finally(() => setLoading(false))
  }, [id])

  if (!id) return null

  if (loadError) {
    return (
      <AppLayout>
        <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center gap-3">
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{loadError}</p>
          <button onClick={() => navigate('/documents')} className="btn-secondary text-sm">Back to Documents</button>
        </div>
      </AppLayout>
    )
  }

  if (loading || !assignment) {
    return (
      <AppLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      </AppLayout>
    )
  }

  const currentIdx = stageIndex(assignment.status)

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto p-6">
        {/* Back + title */}
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center gap-1.5 text-sm mb-4 btn-ghost px-0 hover:bg-transparent"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <ArrowLeft size={14} /> Back to Documents
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {assignment.topic}
          </h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
            {assignment.assignment_question}
          </p>
          <div className="flex flex-wrap items-center gap-2 mt-2">
            {assignment.academic_level && <span className="badge badge-primary">{assignment.academic_level}</span>}
            {assignment.word_count && <span className="badge" style={{ backgroundColor: 'var(--muted)' }}>{assignment.word_count} words</span>}
            {assignment.referencing_style && <span className="badge" style={{ backgroundColor: 'var(--muted)' }}>{assignment.referencing_style}</span>}
            {assignment.due_date && (
              <span className="badge" style={{ backgroundColor: 'var(--muted)' }}>
                Due {new Date(assignment.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center mb-8 overflow-x-auto pb-2">
          {stages.map((s, i) => {
            const done = i < currentIdx
            const active = i === currentIdx
            return (
              <div key={s.key} className="flex items-center shrink-0">
                <div className="flex flex-col items-center gap-1.5" style={{ minWidth: 76 }}>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center border-2"
                    style={{
                      borderColor: done || active ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: done ? 'var(--primary)' : active ? 'var(--primary-light)' : 'var(--background)',
                      color: done ? 'white' : active ? 'var(--primary)' : 'var(--muted-foreground)',
                    }}
                  >
                    {done ? <CheckCircle size={16} /> : <s.icon size={15} />}
                  </div>
                  <span
                    className="text-[11px] font-medium text-center"
                    style={{ color: active ? 'var(--primary)' : 'var(--muted-foreground)' }}
                  >
                    {s.label}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <div className="h-0.5 w-8 mx-0.5 mb-4" style={{ backgroundColor: i < currentIdx ? 'var(--primary)' : 'var(--border)' }} />
                )}
              </div>
            )
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b" style={{ borderColor: 'var(--border)' }}>
          {([
            { key: 'analysis', label: 'Analysis', icon: ClipboardList },
            { key: 'research', label: 'Research', icon: Microscope },
            { key: 'outline', label: 'Outline', icon: ListTree },
            { key: 'files', label: 'Files', icon: Paperclip },
          ] as { key: Stage; label: string; icon: typeof ClipboardList }[]).map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors"
              style={{
                borderColor: tab === t.key ? 'var(--primary)' : 'transparent',
                color: tab === t.key ? 'var(--primary)' : 'var(--muted-foreground)',
              }}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'analysis' && <AnalysisTab assignment={assignment} onAdvance={() => setTab('research')} />}
        {tab === 'research' && <ResearchTab assignment={assignment} onAdvance={() => setTab('outline')} />}
        {tab === 'outline' && (
          <OutlineTab
            assignment={assignment}
            onApproved={() => navigate(`/assignment/${assignment.id}/editor`)}
          />
        )}
        {tab === 'files' && <FilesTab assignment={assignment} />}
      </div>
    </AppLayout>
  )
}

// ---------------- Analysis ----------------

function AnalysisTab({ assignment, onAdvance }: { assignment: NursingAssignment; onAdvance: () => void }) {
  const [analysis, setAnalysis] = useState<AssignmentAnalysis | null>(null)
  const [commandWord, setCommandWord] = useState('')
  const [subject, setSubject] = useState('')
  const [scope, setScope] = useState('')
  const [keyRequirements, setKeyRequirements] = useState('')
  const [recommendedStructure, setRecommendedStructure] = useState('')
  const [importantConcepts, setImportantConcepts] = useState('')
  const [analysisText, setAnalysisText] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generateError, setGenerateError] = useState<string | null>(null)

  useEffect(() => {
    getAnalysis(assignment.id)
      .then(a => {
        if (a) {
          setAnalysis(a)
          setCommandWord(a.command_word ?? '')
          setSubject(a.subject ?? '')
          setScope(a.scope ?? '')
          setKeyRequirements((a.key_requirements ?? []).join('\n'))
          setRecommendedStructure((a.recommended_structure ?? []).join('\n'))
          setImportantConcepts((a.important_concepts ?? []).join('\n'))
          setAnalysisText(a.analysis_text ?? '')
        }
      })
      .catch(() => { /* no analysis yet is fine; genuine failures surface on save */ })
      .finally(() => setLoaded(true))
  }, [assignment.id])

  const toLines = (s: string) => s.split('\n').map(x => x.trim()).filter(Boolean)

  const handleGenerate = async () => {
    setGenerating(true)
    setGenerateError(null)
    try {
      const saved = await generateAnalysisWithAI(assignment.id)
      setAnalysis(saved)
      setCommandWord(saved.command_word ?? '')
      setSubject(saved.subject ?? '')
      setScope(saved.scope ?? '')
      setKeyRequirements((saved.key_requirements ?? []).join('\n'))
      setRecommendedStructure((saved.recommended_structure ?? []).join('\n'))
      setImportantConcepts((saved.important_concepts ?? []).join('\n'))
      setAnalysisText(saved.analysis_text ?? '')
    } catch (err) {
      setGenerateError(err instanceof Error ? err.message : 'Could not generate analysis')
    } finally {
      setGenerating(false)
    }
  }

  const handleSave = async (advance: boolean) => {
    setSaving(true)
    setSaveError(null)
    try {
      const saved = await saveAnalysis(assignment.id, {
        command_word: commandWord || undefined,
        subject: subject || undefined,
        scope: scope || undefined,
        key_requirements: toLines(keyRequirements),
        recommended_structure: toLines(recommendedStructure),
        important_concepts: toLines(importantConcepts),
        analysis_text: analysisText || undefined,
      })
      setAnalysis(saved)
      if (advance) onAdvance()
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Could not save analysis')
    } finally {
      setSaving(false)
    }
  }

  if (!loaded) return null

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Break down what the assignment is actually asking for. This becomes the foundation for research, outline, and drafting.
        </p>
        <button onClick={handleGenerate} className="btn-primary text-sm shrink-0" disabled={generating}>
          <Sparkles size={14} /> {generating ? 'Generating...' : analysis ? 'Regenerate with AI' : 'Generate with AI'}
        </button>
      </div>
      {generateError && (
        <div className="text-xs p-2.5 rounded-lg" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>{generateError}</div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Command word</label>
          <input className="input" placeholder="e.g. Discuss, Analyse, Evaluate" value={commandWord} onChange={e => setCommandWord(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Subject</label>
          <input className="input" placeholder="What the assignment is about" value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Scope</label>
        <textarea className="input resize-none" rows={2} placeholder="What should be included and what shouldn't" value={scope} onChange={e => setScope(e.target.value)} />
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1.5">Key requirements</label>
          <textarea className="input resize-none text-sm" rows={5} placeholder={'One per line'} value={keyRequirements} onChange={e => setKeyRequirements(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Recommended structure</label>
          <textarea className="input resize-none text-sm" rows={5} placeholder={'One section per line'} value={recommendedStructure} onChange={e => setRecommendedStructure(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1.5">Important concepts</label>
          <textarea className="input resize-none text-sm" rows={5} placeholder={'One per line'} value={importantConcepts} onChange={e => setImportantConcepts(e.target.value)} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Analysis summary</label>
        <textarea className="input resize-none" rows={4} placeholder="Plain-language interpretation of the assignment" value={analysisText} onChange={e => setAnalysisText(e.target.value)} />
      </div>

      <div className="flex justify-between items-center pt-2">
        <button onClick={() => handleSave(false)} className="btn-secondary" disabled={saving}>
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={() => handleSave(true)} className="btn-primary" disabled={saving}>
          Continue to Research <ArrowRight size={14} />
        </button>
      </div>
      {saveError && <p className="text-xs" style={{ color: '#DC2626' }}>{saveError}</p>}
      {analysis && !saveError && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Last saved {new Date(analysis.updated_at).toLocaleString()}</p>}
    </div>
  )
}

// ---------------- Research ----------------

function ResearchTab({ assignment, onAdvance }: { assignment: NursingAssignment; onAdvance: () => void }) {
  const [items, setItems] = useState<AssignmentResearchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [question, setQuestion] = useState('')
  const [findings, setFindings] = useState('')
  const [sourceType, setSourceType] = useState<'ai_generated' | 'verified_source' | 'user_uploaded'>('verified_source')
  const [citation, setCitation] = useState('')
  const [url, setUrl] = useState('')
  const [saving, setSaving] = useState(false)

  const refresh = () => {
    setLoadError(null)
    return listResearch(assignment.id)
      .then(setItems)
      .catch(err => setLoadError(err instanceof Error ? err.message : 'Could not load research items'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [assignment.id])

  const handleAdd = async () => {
    setSaving(true)
    setLoadError(null)
    try {
      await addResearchItem(assignment.id, {
        research_question: question || undefined,
        findings: findings || undefined,
        source_type: sourceType,
        source_citation: citation || undefined,
        source_url: url || undefined,
        is_verified: sourceType === 'verified_source',
      })
      setQuestion(''); setFindings(''); setCitation(''); setUrl(''); setSourceType('verified_source')
      setShowForm(false)
      refresh()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not add research item')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteResearchItem(id)
      refresh()
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Could not delete research item')
    }
  }

  if (loading) return <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)' }} />

  return (
    <div className="space-y-4">
      {loadError && (
        <div className="text-xs p-2.5 rounded-lg" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>{loadError}</div>
      )}
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Collect evidence for what the analysis requires. Mark each item as a verified source or an AI-generated
        suggestion — AI output is never treated as a confirmed citation on its own.
      </p>

      {items.length === 0 && !showForm && (
        <div className="text-center py-10 rounded-xl border border-dashed" style={{ borderColor: 'var(--border)' }}>
          <Microscope size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No research items yet</p>
        </div>
      )}

      <div className="space-y-3">
        {items.map(item => (
          <div key={item.id} className="rounded-xl border p-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {item.research_question && <p className="text-sm font-semibold mb-1">{item.research_question}</p>}
                {item.findings && <p className="text-sm mb-2" style={{ color: 'var(--foreground)' }}>{item.findings}</p>}
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {item.source_type === 'verified_source' ? (
                    <span className="badge badge-success"><ShieldCheck size={11} /> Verified source</span>
                  ) : item.source_type === 'ai_generated' ? (
                    <span className="badge badge-warning"><ShieldAlert size={11} /> AI-generated — not yet verified</span>
                  ) : (
                    <span className="badge badge-accent">Uploaded material</span>
                  )}
                  {item.source_citation && <span style={{ color: 'var(--muted-foreground)' }}>{item.source_citation}</span>}
                  {item.source_url && (
                    <a href={item.source_url} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline" style={{ color: 'var(--primary)' }}>
                      <LinkIcon size={11} /> Source
                    </a>
                  )}
                </div>
              </div>
              <button onClick={() => handleDelete(item.id)} className="btn-ghost p-1.5 shrink-0" style={{ color: 'var(--muted-foreground)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm ? (
        <div className="rounded-xl border p-4 space-y-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <input className="input" placeholder="Research question (optional)" value={question} onChange={e => setQuestion(e.target.value)} />
          <textarea className="input resize-none text-sm" rows={3} placeholder="Findings / evidence" value={findings} onChange={e => setFindings(e.target.value)} />
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="input" placeholder="Citation (author, year)" value={citation} onChange={e => setCitation(e.target.value)} />
            <input className="input" placeholder="Source URL (optional)" value={url} onChange={e => setUrl(e.target.value)} />
          </div>
          <div className="flex items-center gap-2">
            {(['verified_source', 'ai_generated', 'user_uploaded'] as const).map(t => (
              <button
                key={t}
                onClick={() => setSourceType(t)}
                className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all"
                style={{
                  borderColor: sourceType === t ? 'var(--primary)' : 'var(--border)',
                  backgroundColor: sourceType === t ? 'var(--primary-light)' : 'transparent',
                  color: sourceType === t ? 'var(--primary)' : 'var(--muted-foreground)',
                }}
              >
                {t === 'verified_source' ? 'Verified source' : t === 'ai_generated' ? 'AI-generated' : 'Uploaded'}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowForm(false)} className="btn-ghost text-sm">Cancel</button>
            <button onClick={handleAdd} className="btn-primary text-sm" disabled={saving}>{saving ? 'Adding...' : 'Add item'}</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setShowForm(true)} className="btn-secondary text-sm">
          <Plus size={14} /> Add research item
        </button>
      )}

      <div className="flex justify-end pt-2">
        <button onClick={onAdvance} className="btn-primary" disabled={items.length === 0}>
          Continue to Outline <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}

// ---------------- Outline ----------------

function OutlineTab({ assignment, onApproved }: { assignment: NursingAssignment; onApproved: () => void }) {
  const [outline, setOutline] = useState<AssignmentOutline | null>(null)
  const [sections, setSections] = useState<OutlineSection[]>([
    { title: 'Introduction', wordAllocation: 150 },
    { title: 'Conclusion', wordAllocation: 150 },
  ])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    getOutline(assignment.id)
      .then(o => {
        if (o) {
          setOutline(o)
          if (o.sections?.length) setSections(o.sections)
        }
      })
      .catch(() => { /* no outline yet is fine; genuine failures surface on save */ })
      .finally(() => setLoading(false))
  }, [assignment.id])

  const totalWords = sections.reduce((sum, s) => sum + (Number(s.wordAllocation) || 0), 0)

  const updateSection = (i: number, patch: Partial<OutlineSection>) => {
    setSections(prev => prev.map((s, idx) => (idx === i ? { ...s, ...patch } : s)))
  }

  const addSection = () => {
    const introIdx = sections.length > 0 ? sections.length - 1 : 0
    setSections(prev => {
      const next = [...prev]
      next.splice(Math.max(introIdx, 1), 0, { title: 'New section', wordAllocation: 200 })
      return next
    })
  }

  const removeSection = (i: number) => setSections(prev => prev.filter((_, idx) => idx !== i))

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const saved = await saveOutline(assignment.id, sections)
      setOutline(saved)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save outline')
    } finally {
      setSaving(false)
    }
  }

  const handleApprove = async () => {
    setSaving(true)
    setError(null)
    try {
      const saved = outline ?? (await saveOutline(assignment.id, sections))
      await approveOutline(saved.id, assignment.id)
      onApproved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not approve outline')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)' }} />

  return (
    <div className="space-y-4">
      {error && (
        <div className="text-xs p-2.5 rounded-lg" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>{error}</div>
      )}
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Structure the answer before drafting. Approving the outline moves this assignment into drafting — you stay
        in control of the direction.
      </p>

      <div className="space-y-2">
        {sections.map((s, i) => (
          <div key={i} className="flex items-center gap-2 rounded-xl border p-3" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
            <span className="text-xs font-mono w-5 text-center" style={{ color: 'var(--muted-foreground)' }}>{i + 1}</span>
            <input
              className="input flex-1"
              value={s.title}
              onChange={e => updateSection(i, { title: e.target.value })}
            />
            <input
              type="number"
              className="input w-24 text-right"
              value={s.wordAllocation}
              onChange={e => updateSection(i, { wordAllocation: Number(e.target.value) })}
            />
            <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>words</span>
            <button onClick={() => removeSection(i)} className="btn-ghost p-1.5" style={{ color: 'var(--muted-foreground)' }}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <button onClick={addSection} className="btn-secondary text-sm"><Plus size={14} /> Add section</button>

      <div className="flex items-center justify-between text-sm pt-2 border-t" style={{ borderColor: 'var(--border)' }}>
        <span style={{ color: 'var(--muted-foreground)' }}>
          Allocated: <strong style={{ color: 'var(--foreground)' }}>{totalWords}</strong> words
          {assignment.word_count && <> of target <strong style={{ color: 'var(--foreground)' }}>{assignment.word_count}</strong></>}
        </span>
        {outline?.is_approved && <span className="badge badge-success"><CheckCircle size={11} /> Approved</span>}
      </div>

      <div className="flex justify-between items-center pt-2">
        <button onClick={handleSave} className="btn-secondary" disabled={saving}>{saving ? 'Saving...' : 'Save outline'}</button>
        <button onClick={handleApprove} className="btn-primary" disabled={saving}>
          <Sparkles size={14} /> Approve & Start Drafting
        </button>
      </div>
    </div>
  )
}

// ---------------- Files ----------------

function formatBytes(bytes: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function FilesTab({ assignment }: { assignment: NursingAssignment }) {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => {
    setError(null)
    return listAssignmentFiles(assignment.id)
      .then(setFiles)
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load files'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [assignment.id])

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (!selected || selected.length === 0) return
    setUploading(true)
    setError(null)
    try {
      for (const file of Array.from(selected) as File[]) {
        await uploadAssignmentFile(assignment.id, file)
      }
      await refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const handleDownload = async (file: UploadedFile) => {
    try {
      const url = await getFileDownloadUrl(file.storage_path)
      window.open(url, '_blank', 'noopener')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not open file')
    }
  }

  const handleDelete = async (file: UploadedFile) => {
    try {
      await deleteAssignmentFile(file.id, file.storage_path)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete file')
    }
  }

  if (loading) return <Loader2 size={20} className="animate-spin" style={{ color: 'var(--primary)' }} />

  return (
    <div className="space-y-4">
      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
        Attach the assignment brief, lecturer instructions, articles, or any other source material.
        PDF, Word, text, and images up to 25MB.
      </p>

      {error && (
        <div className="text-xs p-2.5 rounded-lg" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>{error}</div>
      )}

      <label
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 cursor-pointer transition-colors"
        style={{ borderColor: 'var(--border)' }}
      >
        <Upload size={20} style={{ color: 'var(--muted-foreground)' }} />
        <span className="text-sm font-medium">{uploading ? 'Uploading...' : 'Click to upload, or drag files here'}</span>
        <input
          type="file"
          multiple
          className="hidden"
          disabled={uploading}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
          onChange={handleFileInput}
        />
      </label>

      {files.length === 0 ? (
        <div className="text-center py-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>No files uploaded yet</div>
      ) : (
        <div className="space-y-2">
          {files.map(f => (
            <div
              key={f.id}
              className="flex items-center gap-3 rounded-xl border p-3"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <Paperclip size={16} style={{ color: 'var(--muted-foreground)' }} className="shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{f.file_name}</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {formatBytes(f.file_size_bytes)} · {new Date(f.created_at).toLocaleDateString()}
                </p>
              </div>
              <button onClick={() => handleDownload(f)} className="btn-ghost p-1.5" style={{ color: 'var(--muted-foreground)' }}>
                <Download size={14} />
              </button>
              <button onClick={() => handleDelete(f)} className="btn-ghost p-1.5" style={{ color: 'var(--muted-foreground)' }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
