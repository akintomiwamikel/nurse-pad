import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle, ArrowRight, ArrowLeft, SkipForward } from 'lucide-react'
import Logo from '../components/Logo'

const steps = [
  {
    key: 'institution',
    title: 'Where do you study or work?',
    subtitle: 'Help us personalize your experience',
    field: 'Institution / Workplace',
    type: 'text',
    placeholder: 'e.g. University of Lagos, LUTH, ...',
  },
  {
    key: 'school',
    title: 'Which school or faculty?',
    subtitle: 'We will suggest relevant templates',
    field: 'School / Faculty',
    type: 'text',
    placeholder: 'e.g. College of Medicine',
  },
  {
    key: 'department',
    title: 'Your department',
    subtitle: 'For department-specific document formats',
    field: 'Department',
    type: 'text',
    placeholder: 'e.g. Department of Nursing Science',
  },
  {
    key: 'programme',
    title: 'Your programme',
    subtitle: 'We tailor AI writing style to your level',
    field: 'Programme',
    type: 'select',
    options: ['B.Sc Nursing', 'RN Diploma', 'Post-Basic Nursing', 'M.Sc Nursing', 'Ph.D Nursing', 'MPH', 'Other'],
  },
  {
    key: 'level',
    title: 'Academic level',
    subtitle: 'Adjusts writing complexity and depth',
    field: 'Level',
    type: 'select',
    options: ['100 Level', '200 Level', '300 Level', '400 Level', '500 Level', 'Postgraduate', 'Professional'],
  },
  {
    key: 'country',
    title: 'Your country',
    subtitle: 'For localized guidelines and resources',
    field: 'Country',
    type: 'select',
    options: ['Nigeria', 'Ghana', 'Kenya', 'South Africa', 'Uganda', 'Tanzania', 'Ethiopia', 'United Kingdom', 'United States', 'Other'],
  },
  {
    key: 'citation',
    title: 'Preferred citation style',
    subtitle: 'We will auto-format all your references',
    field: 'Citation Style',
    type: 'cards',
    options: ['APA 7th', 'Harvard', 'MLA 9th', 'Vancouver', 'Chicago 17th'],
  },
  {
    key: 'goal',
    title: "What's your main writing goal?",
    subtitle: 'Personalizes your dashboard and AI suggestions',
    field: 'Writing Goal',
    type: 'cards',
    options: ['Complete assignments faster', 'Improve academic quality', 'Research & literature review', 'Clinical documentation', 'Thesis / dissertation', 'Continuing education'],
  },
  {
    key: 'experience',
    title: 'Your writing experience level',
    subtitle: 'Adjusts AI assistance and guidance',
    field: 'Experience',
    type: 'cards',
    options: ['Beginner — needs lots of guidance', 'Intermediate — some experience', 'Advanced — just need AI tools', 'Expert — minimal assistance'],
  },
]

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [values, setValues] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const current = steps[step]
  const progress = ((step + 1) / steps.length) * 100

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1)
    } else {
      setLoading(true)
      setTimeout(() => navigate('/dashboard'), 1200)
    }
  }

  const handleSkip = () => navigate('/dashboard')

  const canProceed = !!values[current.key]

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
        <Logo size="sm" />
        <button onClick={handleSkip} className="flex items-center gap-1.5 text-sm btn-ghost">
          <SkipForward size={14} />
          Skip setup
        </button>
      </div>

      {/* Progress */}
      <div className="h-1" style={{ backgroundColor: 'var(--muted)' }}>
        <div
          className="h-1 transition-all duration-500"
          style={{ width: `${progress}%`, backgroundColor: 'var(--primary)' }}
        />
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
              Step {step + 1} of {steps.length}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {current.title}
          </h1>
          <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
            {current.subtitle}
          </p>

          {/* Input */}
          {current.type === 'text' && (
            <input
              className="input text-base py-3"
              placeholder={current.placeholder}
              value={values[current.key] || ''}
              onChange={e => setValues(v => ({ ...v, [current.key]: e.target.value }))}
              autoFocus
            />
          )}

          {current.type === 'select' && (
            <select
              className="input text-base py-3"
              value={values[current.key] || ''}
              onChange={e => setValues(v => ({ ...v, [current.key]: e.target.value }))}
            >
              <option value="">Select {current.field}...</option>
              {current.options?.map(o => <option key={o} value={o}>{o}</option>)}
            </select>
          )}

          {current.type === 'cards' && (
            <div className="grid grid-cols-2 gap-3">
              {current.options?.map(o => (
                <button
                  key={o}
                  onClick={() => setValues(v => ({ ...v, [current.key]: o }))}
                  className="p-4 rounded-xl border text-left text-sm font-medium transition-all"
                  style={{
                    borderColor: values[current.key] === o ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: values[current.key] === o ? 'var(--primary-light)' : 'var(--card)',
                    color: values[current.key] === o ? 'var(--primary)' : 'var(--foreground)',
                    boxShadow: values[current.key] === o ? '0 0 0 2px var(--primary)' : 'none',
                  }}
                >
                  {values[current.key] === o && (
                    <CheckCircle size={14} className="mb-1.5" style={{ color: 'var(--primary)' }} />
                  )}
                  {o}
                </button>
              ))}
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => setStep(s => Math.max(0, s - 1))}
              disabled={step === 0}
              className="flex items-center gap-1.5 text-sm btn-ghost disabled:opacity-40"
            >
              <ArrowLeft size={14} />
              Back
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed || loading}
              className="btn-primary px-6 py-2.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? 'Setting up...' : step === steps.length - 1 ? 'Go to Dashboard' : 'Continue'}
              {!loading && <ArrowRight size={14} />}
            </button>
          </div>
        </div>

        {/* Step dots */}
        <div className="flex gap-1.5 mt-10">
          {steps.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all"
              style={{
                width: i === step ? '24px' : '8px',
                height: '8px',
                backgroundColor: i <= step ? 'var(--primary)' : 'var(--border)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
