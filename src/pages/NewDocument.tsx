import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, AlertTriangle, Sparkles, PenLine, Upload, CheckCircle } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { createAssignment, getMyProfile } from '../lib/api'
import { uploadAssignmentFile } from '../lib/storage'

const steps = [
  'Document Type',
  'Project Title',
  'Institution',
  'Department',
  'Supervisor',
  'Objectives',
  'Research Questions',
  'Methodology',
  'Keywords',
  'Writing Style',
  'Upload Documents',
]

const docTypes = [
  { name: 'Care Plan', icon: '🩺', desc: 'Patient-centered nursing care documentation' },
  { name: 'Drug Study', icon: '💊', desc: 'Pharmacological analysis & nursing implications' },
  { name: 'Case Study', icon: '🔬', desc: 'Detailed clinical case analysis' },
  { name: 'Clinical Report', icon: '📋', desc: 'Clinical posting or rotation report' },
  { name: 'Research Paper', icon: '📄', desc: 'Academic research and findings' },
  { name: 'Assignment', icon: '📝', desc: 'Course assignment or test submission' },
  { name: 'Literature Review', icon: '📚', desc: 'Evidence-based literature synthesis' },
  { name: 'Reflection Journal', icon: '📔', desc: 'Personal clinical experience reflection' },
  { name: 'Seminar Paper', icon: '🎓', desc: 'Seminar or conference paper' },
  { name: 'Proposal', icon: '📊', desc: 'Research or project proposal' },
  { name: 'Presentation', icon: '🖥', desc: 'Academic or clinical presentation' },
  { name: 'Health Education', icon: '🏥', desc: 'Patient or community health education' },
]

const writingStyles = ['APA 7th Edition', 'Harvard', 'MLA 9th', 'Vancouver', 'Chicago 17th']
const methodologies = ['Qualitative', 'Quantitative', 'Mixed Methods', 'Case Study', 'Descriptive', 'Experimental']

export default function NewDocument() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})

  useEffect(() => {
    getMyProfile().then(profile => {
      if (!profile) return
      setValues(v => {
        const next = { ...v }
        if (profile.institution && !next.step2) next.step2 = profile.institution
        const onboardingCitation = profile.onboarding?.citation
        if (onboardingCitation && !next.style) {
          const match = writingStyles.find(s => s.startsWith(onboardingCitation.split(' ')[0]))
          if (match) next.style = match
        }
        const onboardingLevel = profile.onboarding?.level
        if (onboardingLevel && !next.academicLevel) {
          // Onboarding captures e.g. "300 Level" / "Postgraduate" / "Professional" — map loosely to the wizard's own options
          if (/postgraduate|m\.sc|ph\.d/i.test(onboardingLevel)) next.academicLevel = 'Graduate / Masters'
          else if (/professional/i.test(onboardingLevel)) next.academicLevel = 'Diploma / Certificate'
          else next.academicLevel = 'Undergraduate'
        }
        return next
      })
    }).catch(() => { /* pre-fill is a nice-to-have; silently skip on failure */ })
  }, [])
  const [aiMode, setAiMode] = useState<Record<string, boolean>>({})
  const [aiWarningShown, setAiWarningShown] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [titleAiDescription, setTitleAiDescription] = useState('')
  const [titleAiRequested, setTitleAiRequested] = useState(false)
  const navigate = useNavigate()

  const progress = ((step + 1) / steps.length) * 100

  const handleAiToggle = (key: string, val: boolean) => {
    if (val && !aiWarningShown[key]) {
      setAiWarningShown(w => ({ ...w, [key]: true }))
    }
    setAiMode(m => ({ ...m, [key]: val }))
  }

  const handleNext = async () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const additionalInstructions = [
        values.step3 ? `Department: ${values.step3}` : null,
        values.keywords ? `Keywords: ${values.keywords}` : null,
        values.methodology ? `Methodology: ${values.methodology}` : null,
      ].filter(Boolean).join('\n')

      const assignment = await createAssignment({
        projectTitle: values.title || values.type || 'Untitled Project',
        topic: values.title || values.type || 'Untitled assignment',
        assignment_question: values.questions || values.objectives || values.title || `${values.type} assignment`,
        academic_level: values.academicLevel || undefined,
        word_count: values.wordCount ? Number(values.wordCount) : undefined,
        due_date: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
        institution: values.step2 || undefined,
        referencing_style: values.style || undefined,
        lecturer_details: values.step4 || undefined,
        additional_instructions: additionalInstructions || undefined,
      })

      if (pendingFiles.length > 0) {
        for (let i = 0; i < pendingFiles.length; i++) {
          setUploadStatus(`Uploading file ${i + 1} of ${pendingFiles.length}...`)
          try {
            await uploadAssignmentFile(assignment.id, pendingFiles[i])
          } catch {
            // Don't block navigation over one failed file — the assignment itself
            // was created successfully; they can retry the upload from the Files tab.
          }
        }
      }

      navigate(`/assignment/${assignment.id}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create assignment')
    } finally {
      setLoading(false)
      setUploadStatus(null)
    }
  }

  const AiToggle = ({ fieldKey }: { fieldKey: string }) => (
    <div className="flex items-center gap-2 mb-3">
      <button
        onClick={() => handleAiToggle(fieldKey, false)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${!aiMode[fieldKey] ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-light)]' : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}
      >
        <PenLine size={12} /> Write myself
      </button>
      <button
        onClick={() => handleAiToggle(fieldKey, true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${aiMode[fieldKey] ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-light)]' : 'border-[var(--border)] text-[var(--muted-foreground)]'}`}
      >
        <Sparkles size={12} /> Generate with AI
      </button>
    </div>
  )

  const AiWarning = ({ fieldKey }: { fieldKey: string }) => (
    aiMode[fieldKey] && aiWarningShown[fieldKey] ? (
      <div className="flex gap-2 p-3 rounded-xl mb-3 text-xs" style={{ backgroundColor: '#FEF3C7', color: '#92400E' }}>
        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
        <p><strong>Important:</strong> Your own information produces the highest-quality and most accurate document. AI-generated suggestions should always be reviewed before submission.</p>
      </div>
    ) : null
  )

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto p-6">
        {/* Back */}
        <button onClick={() => step === 0 ? navigate('/dashboard') : setStep(s => s - 1)}
          className="flex items-center gap-1.5 text-sm mb-6 btn-ghost px-0 hover:bg-transparent"
          style={{ color: 'var(--muted-foreground)' }}>
          <ArrowLeft size={14} /> Back
        </button>

        {/* Progress */}
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            Step {step + 1} of {steps.length}: {steps[step]}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 rounded-full mb-8" style={{ backgroundColor: 'var(--border)' }}>
          <div className="h-2 rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: 'var(--primary)' }} />
        </div>

        {/* Step 0: Document Type */}
        {step === 0 && (
          <div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>What type of document?</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Choose the format that best fits your assignment</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {docTypes.map(dt => (
                <button
                  key={dt.name}
                  onClick={() => setValues(v => ({ ...v, type: dt.name }))}
                  className="flex flex-col items-start gap-2 p-4 rounded-xl border text-left transition-all"
                  style={{
                    borderColor: values.type === dt.name ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: values.type === dt.name ? 'var(--primary-light)' : 'var(--card)',
                    boxShadow: values.type === dt.name ? '0 0 0 2px var(--primary)' : 'none',
                  }}
                >
                  <span className="text-2xl">{dt.icon}</span>
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: values.type === dt.name ? 'var(--primary)' : 'var(--foreground)' }}>{dt.name}</p>
                    <p className="text-xs mt-0.5 leading-snug" style={{ color: 'var(--muted-foreground)' }}>{dt.desc}</p>
                  </div>
                  {values.type === dt.name && <CheckCircle size={14} style={{ color: 'var(--primary)' }} />}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Project Title */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Project title</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Give your document a descriptive, specific title</p>
            <AiToggle fieldKey="title" />
            <AiWarning fieldKey="title" />
            {!aiMode.title ? (
              <input className="input text-base py-3" placeholder="e.g. Nursing Care Plan for a Patient with Type II Diabetes Mellitus"
                value={values.title || ''} onChange={e => setValues(v => ({ ...v, title: e.target.value }))} autoFocus />
            ) : (
              <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>Describe your topic briefly and AI will suggest a title:</p>
                <textarea
                  className="input resize-none"
                  rows={3}
                  placeholder="e.g. care plan for diabetic patient admitted for hyperglycemia..."
                  value={titleAiDescription}
                  onChange={e => { setTitleAiDescription(e.target.value); setTitleAiRequested(false) }}
                />
                <button
                  className="btn-primary mt-3 text-sm"
                  onClick={() => setTitleAiRequested(true)}
                  disabled={!titleAiDescription.trim()}
                >
                  Generate Title <Sparkles size={13} />
                </button>
                {titleAiRequested && (
                  <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                    AI title generation isn't connected to a provider yet. Switch to "Write myself" for now.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Steps 2-4: Institution, Department, Supervisor */}
        {[2, 3, 4].includes(step) && (
          <div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {step === 2 ? 'Your institution' : step === 3 ? 'Your department' : 'Supervisor name'}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
              {step === 2 ? 'For title page and formatting' : step === 3 ? 'Department-specific formatting rules' : 'Will appear on the title page'}
            </p>
            <input
              className="input text-base py-3"
              placeholder={step === 2 ? 'e.g. University of Lagos' : step === 3 ? 'e.g. Department of Nursing Science' : 'e.g. Dr. Adebayo Okonkwo (optional)'}
              value={values[`step${step}`] || ''}
              onChange={e => setValues(v => ({ ...v, [`step${step}`]: e.target.value }))}
              autoFocus
            />
          </div>
        )}

        {/* Step 5: Objectives */}
        {step === 5 && (
          <div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Objectives</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>What are the aims of this document?</p>
            <AiToggle fieldKey="objectives" />
            <AiWarning fieldKey="objectives" />
            <textarea className="input resize-none text-sm" rows={5}
              placeholder="1. To assess the patient's current health status&#10;2. To identify nursing diagnoses&#10;3. To plan evidence-based nursing interventions..."
              value={values.objectives || ''} onChange={e => setValues(v => ({ ...v, objectives: e.target.value }))} />
          </div>
        )}

        {/* Step 6: Research Questions */}
        {step === 6 && (
          <div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Research questions</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>What questions does your document seek to answer?</p>
            <AiToggle fieldKey="questions" />
            <AiWarning fieldKey="questions" />
            <textarea className="input resize-none text-sm" rows={5}
              placeholder="1. What are the nursing interventions for glycemic control?&#10;2. How does patient education impact adherence to treatment?..."
              value={values.questions || ''} onChange={e => setValues(v => ({ ...v, questions: e.target.value }))} />
          </div>
        )}

        {/* Step 7: Methodology */}
        {step === 7 && (
          <div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Methodology</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Select your research approach</p>
            <div className="grid grid-cols-3 gap-3">
              {methodologies.map(m => (
                <button key={m} onClick={() => setValues(v => ({ ...v, methodology: m }))}
                  className="p-3 rounded-xl border text-sm font-medium transition-all"
                  style={{
                    borderColor: values.methodology === m ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: values.methodology === m ? 'var(--primary-light)' : 'var(--card)',
                    color: values.methodology === m ? 'var(--primary)' : 'var(--foreground)',
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 8: Keywords */}
        {step === 8 && (
          <div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Keywords</h2>
            <p className="text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>Add 3-8 relevant keywords (press Enter after each)</p>
            <input className="input text-base py-3" placeholder="e.g. diabetes mellitus, glycemic control, nursing care..."
              value={values.keywords || ''} onChange={e => setValues(v => ({ ...v, keywords: e.target.value }))} />
          </div>
        )}

        {/* Step 9: Writing Style */}
        {step === 9 && (
          <div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Citation style</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Choose your preferred citation format</p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {writingStyles.map(s => (
                <button key={s} onClick={() => setValues(v => ({ ...v, style: s }))}
                  className="p-4 rounded-xl border text-sm font-semibold transition-all"
                  style={{
                    borderColor: values.style === s ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: values.style === s ? 'var(--primary-light)' : 'var(--card)',
                    color: values.style === s ? 'var(--primary)' : 'var(--foreground)',
                  }}>
                  {s}
                </button>
              ))}
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Academic level</label>
                <select
                  className="input"
                  value={values.academicLevel || ''}
                  onChange={e => setValues(v => ({ ...v, academicLevel: e.target.value }))}
                >
                  <option value="">Select...</option>
                  <option>Undergraduate</option>
                  <option>Graduate / Masters</option>
                  <option>Doctoral</option>
                  <option>Diploma / Certificate</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Target word count</label>
                <input
                  type="number"
                  className="input"
                  placeholder="e.g. 1500"
                  value={values.wordCount || ''}
                  onChange={e => setValues(v => ({ ...v, wordCount: e.target.value }))}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Due date (optional)</label>
                <input
                  type="date"
                  className="input"
                  value={values.dueDate || ''}
                  onChange={e => setValues(v => ({ ...v, dueDate: e.target.value }))}
                />
              </div>
            </div>
          </div>
        )}

        {/* Step 10: Upload */}
        {step === 10 && (
          <div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Upload supporting documents</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Optional — upload PDFs, articles, or notes for AI to reference</p>
            <label
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const dropped = Array.from(e.dataTransfer.files)
                if (dropped.length) setPendingFiles(prev => [...prev, ...dropped])
              }}
              className="block border-2 border-dashed rounded-2xl p-12 text-center transition-colors hover:border-[var(--primary)] cursor-pointer"
              style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}
            >
              <Upload size={32} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
              <p className="text-sm font-medium mb-1">Drag & drop files here</p>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>PDF, DOCX, TXT — up to 10 files</p>
              <span className="btn-secondary mt-4 text-sm inline-flex">Browse Files</span>
              <input
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg"
                onChange={e => {
                  const selected = e.target.files ? Array.from(e.target.files) : []
                  if (selected.length) setPendingFiles(prev => [...prev, ...selected])
                  e.target.value = ''
                }}
              />
            </label>

            {pendingFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {pendingFiles.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm" style={{ borderColor: 'var(--border)' }}>
                    <span className="truncate">{f.name}</span>
                    <button
                      onClick={() => setPendingFiles(prev => prev.filter((_, idx) => idx !== i))}
                      className="text-xs font-medium shrink-0 ml-2"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl mt-6 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
            <AlertTriangle size={14} className="shrink-0" /> {error}
          </div>
        )}
        <div className="flex justify-between mt-4">
          {step > 0 && (
            <button onClick={() => setStep(s => s - 1)} className="btn-secondary">
              <ArrowLeft size={14} /> Back
            </button>
          )}
          <div className="ml-auto">
            <button onClick={handleNext} className="btn-primary" disabled={(step === 0 && !values.type) || loading}>
              {loading ? (uploadStatus ?? 'Creating document...') : step === steps.length - 1 ? 'Create Document' : 'Continue'}
              {!loading && <ArrowRight size={14} />}
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
