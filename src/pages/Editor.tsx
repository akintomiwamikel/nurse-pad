import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Undo2, Redo2, Bold, Italic, Underline, AlignLeft, AlignCenter, List, Table,
  Image, Link, MessageSquare, Clock, Eye, Search, ZoomIn, ZoomOut,
  Sparkles, ArrowLeft, ChevronDown, Save, Download, Share2, X,
  Rewind, Expand, FileText, Languages, PenLine, Microscope, BookOpen, Quote, Plus, Trash2, CheckCircle2,
} from 'lucide-react'
import {
  completeAssignment, getAssignment, getLatestDraft, getLatestReview, saveDraft, saveReview,
} from '../lib/api'
import type { AssignmentDraft, AssignmentReview, NursingAssignment } from '../lib/types'

const sampleContent = `
  <h1>Nursing Care Plan: Type II Diabetes Mellitus</h1>

  <h2>1. Introduction</h2>
  <p>This nursing care plan addresses the holistic management of a 54-year-old male patient admitted to the General Medical Ward with poorly controlled Type II Diabetes Mellitus (T2DM), presenting with a fasting blood glucose of 18.4 mmol/L, polydipsia, polyuria, and fatigue of two weeks' duration.</p>

  <h2>2. Patient Assessment</h2>
  <h3>Subjective Data</h3>
  <p>Patient reports: "I have been feeling very thirsty and weak for the past two weeks. I stopped taking my medications because I ran out." Family history is significant for T2DM (mother, paternal uncle).</p>

  <h3>Objective Data</h3>
  <p>Vital signs: BP 148/92 mmHg, HR 88 bpm, RR 18 breaths/min, Temperature 36.9°C, SpO₂ 97% on room air. FBS: 18.4 mmol/L. HbA1c: 10.2%. BMI: 29.4 kg/m².</p>

  <h2>3. Nursing Diagnoses (NANDA-I)</h2>
  <p><strong>Primary Diagnosis:</strong> Ineffective health management related to knowledge deficit regarding medication adherence and glycemic control, as evidenced by elevated FBS (18.4 mmol/L), HbA1c 10.2%, and self-reported medication non-compliance.</p>

  <h2>4. Planning & Goals</h2>
  <p>Short-term (within 24-48 hours): Blood glucose will be reduced to < 10 mmol/L. Patient will verbalize understanding of the importance of medication adherence.</p>

  <h2>5. Nursing Interventions</h2>
  <p>Monitor blood glucose every 4 hours and report readings above 15 mmol/L to attending physician. Administer insulin as prescribed per sliding scale protocol. Educate patient on signs and symptoms of hypoglycemia and hyperglycemia...</p>
`

const aiTools = [
  { icon: Rewind, label: 'Rewrite', color: '#0F766E' },
  { icon: Expand, label: 'Expand', color: '#10B981' },
  { icon: FileText, label: 'Summarize', color: '#3B82F6' },
  { icon: PenLine, label: 'Academic Tone', color: '#8B5CF6' },
  { icon: Sparkles, label: 'Humanize', color: '#F59E0B' },
  { icon: MessageSquare, label: 'Grammar', color: '#10B981' },
  { icon: Quote, label: 'Citation', color: '#EF4444' },
  { icon: Microscope, label: 'Evidence', color: '#0F766E' },
  { icon: BookOpen, label: 'Explain', color: '#6366F1' },
  { icon: Languages, label: 'Translate', color: '#EC4899' },
  { icon: PenLine, label: 'Continue Writing', color: '#0F766E' },
  { icon: Table, label: 'Generate Table', color: '#14B8A6' },
  { icon: FileText, label: 'Gen. References', color: '#F59E0B' },
  { icon: FileText, label: 'Gen. Abstract', color: '#3B82F6' },
  { icon: FileText, label: 'Gen. Conclusion', color: '#8B5CF6' },
]

export default function Editor() {
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()
  const [aiSidebarOpen, setAiSidebarOpen] = useState(true)
  const [reviewOpen, setReviewOpen] = useState(false)
  const [activeTool, setActiveTool] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [zoom, setZoom] = useState(100)

  const contentRef = useRef<HTMLDivElement>(null)
  const [assignment, setAssignment] = useState<NursingAssignment | null>(null)
  const [draft, setDraft] = useState<AssignmentDraft | null>(null)
  const [review, setReview] = useState<AssignmentReview | null>(null)
  const [editorContent, setEditorContent] = useState(sampleContent)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [reviewFormOpen, setReviewFormOpen] = useState(false)
  const [reviewScore, setReviewScore] = useState(80)
  const [reviewSummary, setReviewSummary] = useState('')
  const [reviewIssues, setReviewIssues] = useState('')

  useEffect(() => {
    if (!id) return
    getAssignment(id).catch(() => null).then(a => a && setAssignment(a))
    getLatestDraft(id).catch(() => null).then(d => {
      if (d) {
        setDraft(d)
        if (d.content) setEditorContent(d.content)
      }
    })
    getLatestReview(id).catch(() => null).then(r => r && setReview(r))
  }, [id])

  const wordCount = editorContent.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length

  const handleSave = async () => {
    const html = contentRef.current?.innerHTML ?? editorContent
    setEditorContent(html)
    if (!id) return
    setSaveState('saving')
    try {
      const saved = await saveDraft(id, html, assignment?.word_count ?? undefined)
      setDraft(saved)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  const [reviewError, setReviewError] = useState<string | null>(null)

  const handleSaveReview = async () => {
    if (!id) return
    setReviewError(null)
    const issues = reviewIssues
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean)
      .map(text => ({ text, type: 'warning' as const }))
    try {
      const saved = await saveReview(id, {
        draft_id: draft?.id,
        review_summary: reviewSummary || undefined,
        issues,
        score: reviewScore,
      })
      setReview(saved)
      setReviewFormOpen(false)
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Could not save review')
    }
  }

  const handleComplete = async () => {
    if (!id) return
    try {
      await completeAssignment(id)
      navigate('/documents')
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : 'Could not mark this assignment complete')
    }
  }

  const handleAiTool = (label: string) => {
    setActiveTool(label)
    setAiLoading(true)
    setTimeout(() => setAiLoading(false), 1800)
  }

  const [customPrompt, setCustomPrompt] = useState('')
  const [customPromptSent, setCustomPromptSent] = useState(false)

  if (focusMode) {
    return (
      <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
        <div className="flex items-center justify-between px-6 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
          <div className="text-sm font-medium" style={{ color: 'var(--muted-foreground)' }}>Focus Mode</div>
          <div className="text-sm" style={{ color: 'var(--muted-foreground)' }}>1,240 words · 5 min read</div>
          <button onClick={() => setFocusMode(false)} className="btn-ghost text-sm">Exit Focus</button>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div
            className="max-w-2xl mx-auto px-6 py-12 prose-sm leading-relaxed"
            style={{ fontSize: `${zoom / 100}em`, color: 'var(--foreground)' }}
            dangerouslySetInnerHTML={{ __html: sampleContent }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Top toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b shrink-0" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <button onClick={() => navigate(id ? `/assignment/${id}` : '/dashboard')} className="btn-ghost p-1.5 mr-1">
          <ArrowLeft size={16} />
        </button>

        {/* File name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-sm font-semibold truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", maxWidth: '300px' }}>
            {assignment?.topic ?? 'Nursing Care Plan: Type II Diabetes Mellitus'}
          </span>
          <span className={`badge text-[10px] ${saveState === 'saving' ? 'badge-warning' : saveState === 'error' ? 'badge-error' : 'badge-success'}`}>
            {saveState === 'saving' ? 'Saving...' : saveState === 'error' ? 'Save failed' : id ? 'Saved' : 'Demo'}
          </span>
        </div>

        {/* Toolbar actions — scrollable so it never eats space from the fixed action buttons below */}
        <div className="flex items-center gap-1 overflow-x-auto min-w-0">
          {[
            { icon: Undo2, label: 'Undo' },
            { icon: Redo2, label: 'Redo' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} title={label} className="btn-ghost p-1.5 text-xs shrink-0">
              <Icon size={15} />
            </button>
          ))}

          <div className="w-px h-4 mx-1 shrink-0" style={{ backgroundColor: 'var(--border)' }} />

          <select className="text-xs border rounded-lg px-2 py-1 h-7 mr-1 shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
            {['Heading 1', 'Heading 2', 'Heading 3', 'Paragraph', 'Caption'].map(h => <option key={h}>{h}</option>)}
          </select>

          <select className="text-xs border rounded-lg px-2 py-1 h-7 mr-1 shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
            {['Plus Jakarta Sans', 'Inter', 'Times New Roman', 'Courier New'].map(f => <option key={f}>{f}</option>)}
          </select>

          {[
            { icon: Bold, label: 'Bold' },
            { icon: Italic, label: 'Italic' },
            { icon: Underline, label: 'Underline' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} title={label} className="btn-ghost p-1.5 shrink-0">
              <Icon size={14} />
            </button>
          ))}

          <div className="w-px h-4 mx-1 shrink-0" style={{ backgroundColor: 'var(--border)' }} />

          {[
            { icon: AlignLeft, label: 'Align Left' },
            { icon: AlignCenter, label: 'Center' },
            { icon: List, label: 'List' },
            { icon: Table, label: 'Table' },
            { icon: Image, label: 'Image' },
            { icon: Link, label: 'Link' },
          ].map(({ icon: Icon, label }) => (
            <button key={label} title={label} className="btn-ghost p-1.5 shrink-0">
              <Icon size={14} />
            </button>
          ))}

          <div className="w-px h-4 mx-1 shrink-0" style={{ backgroundColor: 'var(--border)' }} />

          <button title="Comments" className="btn-ghost p-1.5 shrink-0"><MessageSquare size={14} /></button>
          <button title="Version History" className="btn-ghost p-1.5 shrink-0"><Clock size={14} /></button>
          <button title="Find" className="btn-ghost p-1.5 shrink-0"><Search size={14} /></button>

          <div className="w-px h-4 mx-1 shrink-0" style={{ backgroundColor: 'var(--border)' }} />

          {/* Zoom */}
          <button onClick={() => setZoom(z => Math.max(50, z - 10))} className="btn-ghost p-1 shrink-0"><ZoomOut size={14} /></button>
          <span className="text-xs w-10 text-center font-mono shrink-0">{zoom}%</span>
          <button onClick={() => setZoom(z => Math.min(150, z + 10))} className="btn-ghost p-1 shrink-0"><ZoomIn size={14} /></button>

          <div className="w-px h-4 mx-1 shrink-0" style={{ backgroundColor: 'var(--border)' }} />

          <button onClick={() => setFocusMode(true)} className="btn-ghost text-xs px-2 py-1 gap-1 shrink-0">
            <Eye size={13} /> Focus
          </button>
          <button onClick={() => setReviewOpen(r => !r)} className="btn-ghost text-xs px-2 py-1 gap-1 shrink-0">
            <Microscope size={13} /> Review
          </button>
          <button onClick={() => setAiSidebarOpen(a => !a)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white transition-all ml-1 shrink-0"
            style={{ backgroundColor: aiSidebarOpen ? 'var(--primary)' : 'var(--muted)', color: aiSidebarOpen ? 'white' : 'var(--foreground)' }}>
            <Sparkles size={13} /> AI
          </button>
        </div>

        {/* Fixed action buttons — always visible, never scrolled away */}
        <div className="flex items-center gap-1 shrink-0 ml-1">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }} onClick={handleSave}>
            <Save size={13} /> Save
          </button>

          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold ml-1" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>
            <Download size={13} /> Export
          </button>
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border" style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
            <Share2 size={13} /> Share
          </button>
          {id && (
            <button
              onClick={handleComplete}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border"
              style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
            >
              <CheckCircle2 size={13} /> Mark Complete
            </button>
          )}
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor */}
        <div className="flex-1 overflow-y-auto relative">
          {/* Word count bar */}
          <div className="sticky top-0 z-10 flex items-center gap-4 px-6 py-1.5 text-xs border-b" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            <span>{wordCount.toLocaleString()} words</span>
            <span>{Math.max(1, Math.round(wordCount / 220))} min read</span>
            <span>{saveState === 'saving' ? 'Saving...' : saveState === 'error' ? 'Save failed — try again' : draft ? `Saved · v${draft.version}` : 'Not saved yet'}</span>
            <div className="ml-auto flex items-center gap-2">
              <Save size={12} />
              <span>{saveState === 'saving' ? 'Saving changes...' : saveState === 'error' ? 'Changes not saved' : 'All changes saved'}</span>
            </div>
          </div>

          {/* Document paper */}
          <div className="px-6 py-8 flex justify-center">
            <div
              className="w-full max-w-3xl rounded-xl shadow-md border"
              style={{
                backgroundColor: 'white',
                borderColor: 'var(--border)',
                padding: '48px 64px',
                minHeight: '80vh',
                color: '#1a1a1a',
                fontSize: `${zoom / 100}em`,
              }}
            >
              <div
                ref={contentRef}
                contentEditable
                suppressContentEditableWarning
                className="outline-none leading-relaxed"
                style={{ fontFamily: "'Plus Jakarta Sans', 'Times New Roman', serif", lineHeight: 1.8 }}
                onBlur={handleSave}
                dangerouslySetInnerHTML={{ __html: editorContent }}
              />
            </div>
          </div>
        </div>

        {/* AI Sidebar */}
        {aiSidebarOpen && (
          <div
            className="w-72 shrink-0 border-l flex flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                  <Sparkles size={13} className="text-white" />
                </div>
                <span className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Assistant</span>
              </div>
              <button onClick={() => setAiSidebarOpen(false)} className="btn-ghost p-1">
                <X size={14} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-3">
              {/* Context info */}
              <div className="rounded-xl p-3 mb-3 text-xs" style={{ backgroundColor: 'var(--muted)' }}>
                <p className="font-semibold mb-1">Context:</p>
                <p style={{ color: 'var(--muted-foreground)' }}>Whole document (text-selection targeting isn't built yet)</p>
              </div>

              {/* AI Tools grid */}
              <div className="grid grid-cols-2 gap-2">
                {aiTools.map(tool => (
                  <button
                    key={tool.label}
                    onClick={() => handleAiTool(tool.label)}
                    className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all hover:shadow-sm ${activeTool === tool.label ? 'border-[var(--primary)]' : ''}`}
                    style={{
                      backgroundColor: activeTool === tool.label ? 'var(--primary-light)' : 'var(--background)',
                      borderColor: activeTool === tool.label ? 'var(--primary)' : 'var(--border)',
                      color: activeTool === tool.label ? 'var(--primary)' : 'var(--foreground)',
                    }}
                  >
                    <tool.icon size={13} style={{ color: tool.color, flexShrink: 0 }} />
                    <span className="truncate">{tool.label}</span>
                  </button>
                ))}
              </div>

              {/* AI output area */}
              {activeTool && (
                <div className="mt-4 rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex items-center gap-2 px-3 py-2 border-b text-xs" style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--border)' }}>
                    <Sparkles size={11} className="text-white" />
                    <span className="text-white font-semibold">{activeTool}</span>
                  </div>
                  <div className="p-3">
                    {aiLoading ? (
                      <div className="space-y-2">
                        <div className="h-3 w-full rounded skeleton" />
                        <div className="h-3 w-4/5 rounded skeleton" />
                        <div className="h-3 w-3/5 rounded skeleton" />
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs leading-relaxed mb-1" style={{ color: 'var(--muted-foreground)' }}>
                          AI {activeTool.toLowerCase()} isn't connected to a provider yet, so there's nothing real to show here.
                        </p>
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                          Once your AI backend is wired up, this panel will show real suggestions for your selected text.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Custom prompt */}
              <div className="mt-4">
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>CUSTOM PROMPT</p>
                <textarea
                  className="input resize-none text-xs"
                  rows={3}
                  placeholder="Ask AI anything about this document..."
                  value={customPrompt}
                  onChange={e => { setCustomPrompt(e.target.value); setCustomPromptSent(false) }}
                />
                <button
                  className="btn-primary w-full justify-center mt-2 text-xs py-2"
                  onClick={() => setCustomPromptSent(true)}
                  disabled={!customPrompt.trim()}
                >
                  <Sparkles size={12} /> Ask AI
                </button>
                {customPromptSent && (
                  <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                    This isn't connected to an AI provider yet, so there's no real answer to give you here.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Review Panel */}
        {reviewOpen && (
          <div
            className="w-72 shrink-0 border-l flex flex-col overflow-hidden"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between px-4 py-3.5 border-b" style={{ borderColor: 'var(--border)' }}>
              <span className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Document Review</span>
              <button onClick={() => setReviewOpen(false)} className="btn-ghost p-1"><X size={14} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {!id ? (
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Open this editor from an assignment to save and load real review notes.
                </p>
              ) : review ? (
                <>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium">Overall score</span>
                      <span className="font-bold" style={{ color: 'var(--primary)' }}>{review.score ?? '—'}/100</span>
                    </div>
                    <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                      <div className="h-2 rounded-full" style={{ width: `${review.score ?? 0}%`, backgroundColor: 'var(--primary)' }} />
                    </div>
                  </div>
                  {review.review_summary && (
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--foreground)' }}>{review.review_summary}</p>
                  )}
                  {review.issues?.length > 0 && (
                    <div>
                      <p className="text-xs font-bold mb-2" style={{ color: 'var(--muted-foreground)' }}>ISSUES</p>
                      <div className="space-y-2">
                        {review.issues.map((s, i) => (
                          <div key={i} className="flex gap-2 p-2.5 rounded-lg text-xs badge-warning" style={{ backgroundColor: '#FEF3C7' }}>
                            <span style={{ color: '#92400E' }}>{s.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <p className="text-[10px]" style={{ color: 'var(--muted-foreground)' }}>
                    Reviewed {new Date(review.created_at).toLocaleString()}
                  </p>
                </>
              ) : (
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>No review saved yet for this draft.</p>
              )}

              {id && !reviewFormOpen && (
                <button onClick={() => setReviewFormOpen(true)} className="btn-secondary text-xs w-full justify-center">
                  <Plus size={12} /> {review ? 'Add new review' : 'Add review notes'}
                </button>
              )}

              {id && reviewFormOpen && (
                <div className="space-y-2 rounded-xl border p-3" style={{ borderColor: 'var(--border)' }}>
                  {reviewError && <p className="text-xs" style={{ color: '#DC2626' }}>{reviewError}</p>}
                  <div>
                    <label className="text-xs font-medium block mb-1">Score (0–100)</label>
                    <input
                      type="number" min={0} max={100} className="input text-xs"
                      value={reviewScore} onChange={e => setReviewScore(Number(e.target.value))}
                    />
                  </div>
                  <textarea
                    className="input resize-none text-xs" rows={3} placeholder="Summary"
                    value={reviewSummary} onChange={e => setReviewSummary(e.target.value)}
                  />
                  <textarea
                    className="input resize-none text-xs" rows={3} placeholder={'Issues, one per line'}
                    value={reviewIssues} onChange={e => setReviewIssues(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setReviewFormOpen(false)} className="btn-ghost text-xs flex-1 justify-center">Cancel</button>
                    <button onClick={handleSaveReview} className="btn-primary text-xs flex-1 justify-center">Save</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
