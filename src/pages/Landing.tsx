import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles, CheckCircle, ChevronDown, ArrowRight, Play, Star,
  FileText, Brain, Users, Shield, Zap, Globe, BookOpen,
  Sun, Moon, Menu, X, Quote
} from 'lucide-react'
import Logo from '../components/Logo'
import { useTheme } from '../context/ThemeContext'

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Writing',
    desc: 'Generate structured nursing documents with intelligent AI that understands medical terminology, clinical guidelines, and academic standards.',
    color: '#0F766E',
  },
  {
    icon: FileText,
    title: 'Guided Document Wizard',
    desc: 'Step-by-step form-based creation flow for care plans, drug studies, case studies, clinical reports, and research papers.',
    color: '#10B981',
  },
  {
    icon: BookOpen,
    title: 'Research Library',
    desc: 'Access thousands of nursing textbooks, WHO guidelines, CDC resources, and peer-reviewed journals right inside the app.',
    color: '#3B82F6',
  },
  {
    icon: Quote,
    title: 'Citation Manager',
    desc: 'Auto-generate APA, Harvard, MLA, Vancouver, and Chicago citations. Import DOI, PDF, or add manually.',
    color: '#8B5CF6',
  },
  {
    icon: Users,
    title: 'Team Collaboration',
    desc: 'Real-time editing, comments, suggestions, and version history for lecturers and student teams.',
    color: '#F59E0B',
  },
  {
    icon: Shield,
    title: 'Academic Integrity',
    desc: 'Built-in plagiarism awareness, hallucination detection, and academic quality scoring on every document.',
    color: '#EF4444',
  },
]

const steps = [
  { num: '01', title: 'Choose Document Type', desc: 'Select from 12+ nursing document formats including care plans, drug studies, and research papers.' },
  { num: '02', title: 'Fill Guided Form', desc: 'Answer structured questions about your topic, objectives, methodology, and institution.' },
  { num: '03', title: 'AI Generates Draft', desc: 'Watch AI build your document through 7 intelligent stages — understanding, structuring, writing, and reviewing.' },
  { num: '04', title: 'Edit & Refine', desc: 'Use the rich document editor with AI sidebar to rewrite, expand, cite, and format with one click.' },
  { num: '05', title: 'Export & Submit', desc: 'Export as Word, PDF, APA-formatted document, or share directly with your supervisor.' },
]

const testimonials = [
  {
    name: 'Ngozi Adeyemi',
    role: 'Final Year Nursing Student, UNTH',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=56&h=56&fit=crop&auto=format',
    text: "NURSE PAD changed my academic life. I submitted my care plan in 2 hours instead of 2 days. The AI understands nursing language perfectly — it's not just generic ChatGPT output.",
    rating: 5,
  },
  {
    name: 'Dr. Kemi Osei-Bonsu',
    role: 'Nursing Lecturer, University of Ghana',
    avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=56&h=56&fit=crop&auto=format',
    text: "I recommend NURSE PAD to all my students. The citation manager alone saves hours of manual formatting. The academic quality scoring helps students understand what good writing looks like.",
    rating: 5,
  },
  {
    name: 'Emmanuel Nwosu',
    role: 'Registered Nurse, Lagos University Teaching Hospital',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=56&h=56&fit=crop&auto=format',
    text: "For clinical report writing, nothing comes close. The structured wizard forces you to think through every section. My reports are now 40% longer and significantly more professional.",
    rating: 5,
  },
]

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    desc: 'For exploring the platform',
    features: ['5 documents/month', '10 AI credits', 'Basic templates', 'APA citations', 'PDF export'],
    cta: 'Get Started Free',
    highlight: false,
  },
  {
    name: 'Student Pro',
    price: { monthly: 9.99, yearly: 7.99 },
    desc: 'Perfect for nursing students',
    features: ['Unlimited documents', '200 AI credits/month', 'All document types', 'All citation styles', 'Word & PDF export', 'Research library access', 'Priority support'],
    cta: 'Start Student Pro',
    highlight: false,
  },
  {
    name: 'Premium',
    price: { monthly: 19.99, yearly: 15.99 },
    desc: 'For nurses & researchers',
    features: ['Everything in Student Pro', '500 AI credits/month', 'Team collaboration (5 users)', 'AI History & versioning', 'Cloud backup', 'API access', 'Dedicated support'],
    cta: 'Go Premium',
    highlight: true,
  },
  {
    name: 'Institution',
    price: { monthly: 49.99, yearly: 39.99 },
    desc: 'For schools & hospitals',
    features: ['Everything in Premium', 'Unlimited AI credits', 'Up to 50 users', 'Admin dashboard', 'Custom templates', 'SSO integration', 'SLA guarantee'],
    cta: 'Contact Sales',
    highlight: false,
  },
]

const faqs = [
  { q: 'Is NURSE PAD only for students?', a: 'No. NURSE PAD serves nursing students, registered nurses, nurse researchers, and nursing lecturers. Each user type has tailored document templates and AI prompts.' },
  { q: 'How is it different from ChatGPT?', a: "Unlike general AI chatbots, NURSE PAD has a structured guided form, understands nursing-specific terminology, applies clinical frameworks (NANDA, SBAR, etc.), formats references automatically, and scores your document's academic quality." },
  { q: 'Can my institution use NURSE PAD?', a: "Yes. Our Institution and Enterprise plans include admin dashboards, user management, custom templates, SSO integration, and volume pricing. Contact us for a custom quote." },
  { q: "Is my work safe and private?", a: "Absolutely. All documents are encrypted at rest and in transit. We never use your content to train AI models. You retain full ownership of everything you write." },
  { q: 'What citation styles are supported?', a: 'APA 7th edition, Harvard, MLA 9th edition, Chicago 17th edition, and Vancouver are fully supported with automatic bibliography generation.' },
  { q: 'Can I export to Microsoft Word?', a: 'Yes. Export to .docx, PDF, RTF, Markdown, HTML, EPUB, or print directly. Documents retain all formatting including tables, headings, and references.' },
]

export default function Landing() {
  const { theme, toggleTheme } = useTheme()
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [mobileMenu, setMobileMenu] = useState(false)

  return (
    <div style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
      {/* Navigation */}
      <nav
        className="sticky top-0 z-50 glass"
        style={{ borderBottom: '1px solid var(--border)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          <Logo size="sm" />

          <div className="hidden md:flex items-center gap-1 flex-1">
            {['Features', 'How It Works', 'Pricing', 'Research'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-[var(--muted)]"
                style={{ color: 'var(--foreground)', textDecoration: 'none' }}
              >
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button onClick={toggleTheme} className="btn-ghost p-2">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link to="/auth?mode=login" className="btn-ghost text-sm" style={{ textDecoration: 'none' }}>Sign in</Link>
            <Link to="/auth?mode=signup" className="btn-primary text-sm" style={{ textDecoration: 'none' }}>
              Start Writing <ArrowRight size={14} />
            </Link>
            <button className="md:hidden p-2 rounded-lg" onClick={() => setMobileMenu(m => !m)}>
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenu && (
          <div className="md:hidden border-t px-4 py-3 space-y-1" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            {['Features', 'How It Works', 'Pricing', 'Research'].map(item => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(' ', '-')}`}
                className="block px-3 py-2 rounded-lg text-sm font-medium hover:bg-[var(--muted)]"
                style={{ color: 'var(--foreground)', textDecoration: 'none' }}
                onClick={() => setMobileMenu(false)}
              >
                {item}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="hero-glow relative overflow-hidden pt-16 pb-20 md:pt-24 md:pb-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 animate-fadeInUp"
              style={{ borderColor: 'var(--primary)', color: 'var(--primary)', backgroundColor: 'var(--primary-light)' }}>
              <Sparkles size={14} />
              AI-powered nursing writing platform — trusted by 12,000+ nurses
            </div>

            <h1
              className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight animate-fadeInUp"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", animationDelay: '0.1s', opacity: 0 }}
            >
              Write Better
              <br />
              <span className="gradient-text">Nursing Documents</span>
              <br />
              in Minutes
            </h1>

            <p
              className="text-lg md:text-xl mb-10 max-w-2xl mx-auto animate-fadeInUp"
              style={{ color: 'var(--muted-foreground)', animationDelay: '0.2s', opacity: 0, lineHeight: 1.7 }}
            >
              NURSE PAD combines guided forms, intelligent AI writing, citation management, and real-time collaboration into one beautiful platform — built specifically for nursing professionals.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10 animate-fadeInUp" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <Link to="/auth?mode=signup" className="btn-primary text-base px-6 py-3" style={{ textDecoration: 'none' }}>
                Start Writing Free <ArrowRight size={16} />
              </Link>
              <Link to="/auth?mode=signup" className="btn-secondary text-base px-6 py-3" style={{ textDecoration: 'none' }}>
                <Sparkles size={16} /> Try AI Now
              </Link>
              <button className="btn-ghost text-base px-6 py-3">
                <Play size={16} className="fill-current" /> Watch Demo
              </button>
            </div>

            <div className="flex items-center justify-center gap-6 text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {['No credit card required', 'Free plan available', 'GDPR compliant'].map(t => (
                <div key={t} className="flex items-center gap-1.5">
                  <CheckCircle size={14} style={{ color: 'var(--primary)' }} />
                  {t}
                </div>
              ))}
            </div>
          </div>

          {/* Hero image / dashboard preview */}
          <div className="mt-16 relative mx-auto max-w-5xl">
            <div
              className="rounded-2xl overflow-hidden border shadow-2xl animate-float"
              style={{ borderColor: 'var(--border)', boxShadow: '0 30px 80px rgba(15,118,110,0.15)' }}
            >
              {/* Mock browser chrome */}
              <div className="flex items-center gap-1.5 px-4 py-3 border-b" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="flex-1 mx-4 rounded-full px-3 py-1 text-xs text-center" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>
                  app.nursepad.ai
                </div>
              </div>
              {/* Dashboard preview mockup */}
              <div className="flex" style={{ backgroundColor: 'var(--background)', height: '360px' }}>
                {/* Sidebar mini */}
                <div className="w-44 shrink-0 border-r p-3 space-y-1" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--border)' }}>
                  <div className="h-6 w-24 rounded-md skeleton mb-4" />
                  {[100, 80, 95, 70, 85].map((w, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded skeleton" />
                      <div className="h-3 rounded skeleton" style={{ width: `${w}%` }} />
                    </div>
                  ))}
                </div>
                {/* Main area */}
                <div className="flex-1 p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="h-6 w-48 rounded skeleton mb-1.5" />
                      <div className="h-3.5 w-32 rounded skeleton" />
                    </div>
                    <div className="h-9 w-32 rounded-lg" style={{ backgroundColor: 'var(--primary)', opacity: 0.8 }} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {[['Documents', '47'], ['AI Credits', '186'], ['Streak', '12 days']].map(([label, val]) => (
                      <div key={label} className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                        <div className="text-xl font-bold" style={{ color: 'var(--primary)', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>{val}</div>
                        <div className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="rounded-xl p-3.5 border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                        <div className="h-4 w-36 rounded skeleton mb-2" />
                        <div className="h-3 w-24 rounded skeleton" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social proof strip */}
      <div className="py-8 border-y" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-center text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Trusted by nursing schools and healthcare institutions across Africa & beyond
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold" style={{ color: 'var(--muted-foreground)' }}>
            {['University of Lagos', 'UITH Ilorin', 'University of Ghana', 'CMUL', 'OAUTH Teaching Hospital', 'LUTH'].map(s => (
              <span key={s}>{s}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Features */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="badge badge-primary mb-4">Platform Features</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Everything a nursing professional needs
            </h2>
            <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
              Purpose-built AI tools, guided workflows, and academic resources in one unified workspace.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div
                key={f.title}
                className="card-hover rounded-2xl p-6 border"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                  style={{ backgroundColor: `${f.color}18` }}
                >
                  <f.icon size={22} style={{ color: f.color }} />
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 md:py-28" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="badge badge-primary mb-4">How It Works</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              From blank page to polished document
            </h2>
            <p className="text-lg" style={{ color: 'var(--muted-foreground)' }}>
              Our guided workflow removes the anxiety of starting from scratch.
            </p>
          </div>

          <div className="relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute left-1/2 top-8 bottom-8 w-px" style={{ backgroundColor: 'var(--border)', transform: 'translateX(-50%)' }} />

            <div className="space-y-8">
              {steps.map((step, i) => (
                <div
                  key={step.num}
                  className={`flex items-start gap-8 ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'}`}
                >
                  <div className="lg:w-1/2 flex justify-end">
                    <div
                      className={`max-w-sm rounded-2xl p-6 border ${i % 2 !== 0 ? 'lg:ml-auto' : ''}`}
                      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                    >
                      <div
                        className="text-5xl font-extrabold mb-3"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--primary)', opacity: 0.15 }}
                      >
                        {step.num}
                      </div>
                      <h3 className="text-xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{step.title}</h3>
                      <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{step.desc}</p>
                    </div>
                  </div>

                  {/* Center dot */}
                  <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full border-4 shrink-0 mt-6"
                    style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--background)' }}>
                    <Zap size={16} className="text-white" />
                  </div>

                  <div className="lg:w-1/2" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Workflow Visual */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="badge badge-primary mb-4">AI Writing Engine</div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-6" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Watch AI build your document in real time
              </h2>
              <p className="text-lg mb-8" style={{ color: 'var(--muted-foreground)', lineHeight: 1.7 }}>
                Our AI doesn't just dump text. It goes through 7 intelligent stages — understanding your topic, building structure, writing with nursing terminology, formatting citations, and humanizing the output.
              </p>
              <div className="space-y-3">
                {[
                  'Understanding your topic & objectives',
                  'Building document structure',
                  'Writing clinical content',
                  'Checking nursing terminology',
                  'Formatting references & citations',
                  'Humanizing the writing style',
                  'Final quality review',
                ].map((stage, i) => (
                  <div key={stage} className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                      style={{ backgroundColor: 'var(--primary)' }}
                    >
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium">{stage}</span>
                  </div>
                ))}
              </div>
              <Link to="/auth?mode=signup" className="btn-primary mt-8 inline-flex" style={{ textDecoration: 'none' }}>
                Try AI Writing Free <ArrowRight size={16} />
              </Link>
            </div>

            {/* AI generation animation mockup */}
            <div
              className="rounded-2xl border overflow-hidden"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI Writing Engine</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Generating your document...</p>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: 'Understanding your topic', done: true },
                  { label: 'Building structure', done: true },
                  { label: 'Writing content', done: true, active: true },
                  { label: 'Checking nursing terminology', done: false },
                  { label: 'Formatting references', done: false },
                  { label: 'Humanizing writing', done: false },
                  { label: 'Final review', done: false },
                ].map((stage, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${stage.done ? '' : 'border'}`}
                      style={{
                        backgroundColor: stage.done ? 'var(--primary)' : 'transparent',
                        borderColor: stage.active ? 'var(--primary)' : 'var(--border)',
                      }}>
                      {stage.done && <CheckCircle size={12} className="text-white" />}
                      {stage.active && !stage.done && (
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--primary)' }} />
                      )}
                    </div>
                    <span
                      className="text-sm"
                      style={{ color: stage.done || stage.active ? 'var(--foreground)' : 'var(--muted-foreground)', fontWeight: stage.active ? 600 : 400 }}
                    >
                      {stage.label}
                    </span>
                    {stage.active && (
                      <span className="ml-auto flex gap-1">
                        {[0, 1, 2].map(d => (
                          <span
                            key={d}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: 'var(--primary)', animation: `typing-dot 1.2s ${d * 0.2}s ease-in-out infinite` }}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                ))}

                <div className="mt-4 rounded-xl p-4" style={{ backgroundColor: 'var(--muted)' }}>
                  <div className="space-y-2">
                    <div className="h-3 w-full rounded skeleton" />
                    <div className="h-3 w-5/6 rounded skeleton" />
                    <div className="h-3 w-4/6 rounded skeleton" />
                    <div className="h-3 w-full rounded skeleton" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 md:py-28" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="badge badge-primary mb-4">Pricing</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Invest in your writing career
            </h2>
            <p className="text-lg mb-8" style={{ color: 'var(--muted-foreground)' }}>
              Start free. Upgrade when you need more power.
            </p>

            {/* Billing toggle */}
            <div className="inline-flex items-center gap-2 p-1 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              {(['monthly', 'yearly'] as const).map(b => (
                <button
                  key={b}
                  onClick={() => setBilling(b)}
                  className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all capitalize"
                  style={{
                    backgroundColor: billing === b ? 'var(--primary)' : 'transparent',
                    color: billing === b ? 'white' : 'var(--foreground)',
                  }}
                >
                  {b} {b === 'yearly' && <span className="text-[10px] ml-1 opacity-80">Save 20%</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {plans.map(plan => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 flex flex-col ${plan.highlight ? 'shadow-2xl' : ''}`}
                style={{
                  backgroundColor: plan.highlight ? 'var(--primary)' : 'var(--card)',
                  borderColor: plan.highlight ? 'var(--primary)' : 'var(--border)',
                  color: plan.highlight ? 'white' : 'var(--foreground)',
                }}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="badge badge-accent text-xs px-3 py-1 shadow-lg">Most Popular</span>
                  </div>
                )}
                <div className="mb-4">
                  <h3 className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{plan.name}</h3>
                  <p className="text-sm mt-0.5" style={{ opacity: 0.7 }}>{plan.desc}</p>
                </div>
                <div className="mb-6">
                  <span className="text-4xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {plan.price[billing] === 0 ? 'Free' : `$${plan.price[billing]}`}
                  </span>
                  {plan.price[billing] > 0 && <span className="text-sm ml-1 opacity-70">/mo</span>}
                </div>
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle size={15} className="mt-0.5 shrink-0" style={{ color: plan.highlight ? 'rgba(255,255,255,0.8)' : 'var(--primary)' }} />
                      <span style={{ opacity: plan.highlight ? 0.9 : 1 }}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/auth?mode=signup"
                  className="text-center py-2.5 px-4 rounded-xl font-semibold text-sm transition-all block"
                  style={{
                    backgroundColor: plan.highlight ? 'white' : 'var(--primary)',
                    color: plan.highlight ? 'var(--primary)' : 'white',
                    textDecoration: 'none',
                  }}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <div className="badge badge-primary mb-4">Testimonials</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Loved by nursing professionals
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div
                key={t.name}
                className="card-hover rounded-2xl border p-6"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={14} fill="var(--warning)" style={{ color: 'var(--warning)' }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: 'var(--foreground)' }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section id="faqs" className="py-20 md:py-28" style={{ backgroundColor: 'var(--muted)' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <div className="badge badge-primary mb-4">FAQs</div>
            <h2 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Common questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border overflow-hidden"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                >
                  <span className="font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    style={{
                      color: 'var(--muted-foreground)',
                      transform: openFaq === i ? 'rotate(180deg)' : 'none',
                      transition: 'transform 0.2s',
                    }}
                  />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-20 md:py-28">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div
            className="rounded-3xl p-12 md:p-16"
            style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #14B8A6 50%, #10B981 100%)' }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Ready to write smarter?
            </h2>
            <p className="text-white/80 text-lg mb-8">
              Join 12,000+ nursing students and professionals who write better with AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to="/auth?mode=signup"
                className="px-8 py-3.5 rounded-xl font-bold text-base transition-all hover:shadow-xl hover:-translate-y-0.5"
                style={{ backgroundColor: 'white', color: 'var(--primary)', textDecoration: 'none' }}
              >
                Start Writing Free
              </Link>
              <Link
                to="/auth?mode=signup"
                className="px-8 py-3.5 rounded-xl font-bold text-base border-2 border-white/30 text-white transition-all hover:bg-white/10"
                style={{ textDecoration: 'none' }}
              >
                <Sparkles size={16} className="inline mr-2" /> Try AI Now
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2">
              <Logo size="sm" />
              <p className="mt-3 text-sm max-w-xs" style={{ color: 'var(--muted-foreground)' }}>
                The intelligent writing platform built exclusively for nursing professionals and students.
              </p>
              <div className="flex gap-2 mt-4">
                {['Twitter', 'LinkedIn', 'Instagram'].map(s => (
                  <button key={s} className="btn-ghost text-xs px-2 py-1">{s}</button>
                ))}
              </div>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Templates', 'AI Assistant', 'API'] },
              { title: 'Resources', links: ['Documentation', 'Research Library', 'Blog', 'Webinars', 'Help Center'] },
              { title: 'Company', links: ['About', 'Careers', 'Privacy Policy', 'Terms of Service', 'Contact'] },
            ].map(col => (
              <div key={col.title}>
                <p className="text-sm font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{col.title}</p>
                <ul className="space-y-2">
                  {col.links.map(l => (
                    <li key={l}>
                      <a href="#" className="text-sm hover:text-[var(--primary)] transition-colors" style={{ color: 'var(--muted-foreground)', textDecoration: 'none' }}>{l}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t pt-6 flex flex-col md:flex-row items-center justify-between gap-3" style={{ borderColor: 'var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              © 2025 NURSE PAD. All rights reserved.
            </p>
            <div className="flex items-center gap-1">
              <Globe size={14} style={{ color: 'var(--muted-foreground)' }} />
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>English</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
