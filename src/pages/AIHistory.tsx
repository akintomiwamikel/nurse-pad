import { useState } from 'react'
import { Sparkles, Clock, Coins, RotateCcw, Trash2, Search, ChevronDown, ChevronRight } from 'lucide-react'
import AppLayout from '../components/AppLayout'

const history = [
  {
    id: 1,
    prompt: 'Generate nursing care plan for patient with Type II Diabetes Mellitus, 54 years, male, FBS 18.4 mmol/L',
    document: 'Nursing Care Plan: Type II Diabetes Mellitus',
    date: 'Dec 10, 2025 · 2:30 PM',
    tokens: 3240,
    credits: 8,
    cost: '$0.04',
    type: 'Care Plan',
    expanded: false,
    preview: 'The nursing care plan for this patient addresses ineffective health management related to knowledge deficit regarding medication adherence and glycemic control...',
  },
  {
    id: 2,
    prompt: 'Expand the Nursing Interventions section with evidence-based rationale for each intervention',
    document: 'Nursing Care Plan: Type II Diabetes Mellitus',
    date: 'Dec 10, 2025 · 3:15 PM',
    tokens: 1120,
    credits: 3,
    cost: '$0.01',
    type: 'Expand',
    expanded: false,
    preview: 'Evidence-based rationale has been added for each nursing intervention based on ADA clinical standards (2024) and NANDA-I classifications...',
  },
  {
    id: 3,
    prompt: 'Rewrite the Introduction section in academic tone suitable for final year undergraduate submission',
    document: 'Clinical Posting Report — Pediatrics Ward',
    date: 'Dec 9, 2025 · 10:45 AM',
    tokens: 890,
    credits: 2,
    cost: '$0.01',
    type: 'Rewrite',
    expanded: false,
    preview: 'This clinical posting report documents nursing observations and interventions conducted during a four-week rotation in the Pediatrics Ward...',
  },
  {
    id: 4,
    prompt: 'Generate complete drug study for Metformin 500mg including mechanism of action, nursing implications, and patient education',
    document: 'Drug Study: Metformin 500mg',
    date: 'Dec 8, 2025 · 4:20 PM',
    tokens: 2890,
    credits: 7,
    cost: '$0.03',
    type: 'Drug Study',
    expanded: false,
    preview: 'Metformin hydrochloride (Glucophage) belongs to the biguanide class of antidiabetic agents. Mechanism of action involves activation of AMP-activated protein kinase...',
  },
  {
    id: 5,
    prompt: 'Generate APA 7th edition references list for all citations used in the document',
    document: 'Literature Review: Wound Care Protocols',
    date: 'Dec 8, 2025 · 11:00 AM',
    tokens: 640,
    credits: 2,
    cost: '$0.01',
    type: 'References',
    expanded: false,
    preview: 'References\n\nOsei-Bonsu, K., Adeyemi, N., & Nwosu, E. (2023). Wound care protocols in Sub-Saharan Africa...',
  },
]

const typeColors: Record<string, string> = {
  'Care Plan': '#0F766E',
  'Drug Study': '#10B981',
  'Expand': '#3B82F6',
  'Rewrite': '#8B5CF6',
  'References': '#F59E0B',
}

export default function AIHistory() {
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<number | null>(null)

  const filtered = history.filter(h =>
    h.prompt.toLowerCase().includes(search.toLowerCase()) ||
    h.document.toLowerCase().includes(search.toLowerCase())
  )

  const totalCredits = history.reduce((sum, h) => sum + h.credits, 0)
  const totalTokens = history.reduce((sum, h) => sum + h.tokens, 0)

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI History</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Every AI generation saved for reference</p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Generations', value: history.length, icon: Sparkles, color: '#0F766E' },
            { label: 'Credits Used', value: `${totalCredits} / 200`, icon: Coins, color: '#F59E0B' },
            { label: 'Tokens Generated', value: totalTokens.toLocaleString(), icon: Clock, color: '#3B82F6' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border p-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                <s.icon size={15} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input className="input pl-9 py-2.5" placeholder="Search history..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* History list */}
        <div className="space-y-3">
          {filtered.map(item => (
            <div key={item.id} className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div
                className="flex items-start gap-4 p-5 cursor-pointer hover:bg-[var(--muted)] transition-colors"
                onClick={() => setExpanded(expanded === item.id ? null : item.id)}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                  style={{ backgroundColor: `${typeColors[item.type] ?? '#0F766E'}18` }}>
                  <Sparkles size={16} style={{ color: typeColors[item.type] ?? '#0F766E' }} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <p className="text-sm font-medium line-clamp-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.prompt}</p>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="badge text-[10px]" style={{ backgroundColor: `${typeColors[item.type] ?? '#0F766E'}18`, color: typeColors[item.type] ?? '#0F766E' }}>
                        {item.type}
                      </span>
                      {expanded === item.id ? <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} /> : <ChevronRight size={14} style={{ color: 'var(--muted-foreground)' }} />}
                    </div>
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>📄 {item.document}</p>
                  <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span className="flex items-center gap-1"><Clock size={11} /> {item.date}</span>
                    <span className="flex items-center gap-1"><Sparkles size={11} /> {item.tokens.toLocaleString()} tokens</span>
                    <span>{item.credits} credits · {item.cost}</span>
                  </div>
                </div>
              </div>

              {/* Expanded view */}
              {expanded === item.id && (
                <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                  <div className="p-5">
                    <p className="text-xs font-bold mb-2" style={{ color: 'var(--muted-foreground)' }}>AI OUTPUT PREVIEW</p>
                    <p className="text-sm leading-relaxed mb-4 font-mono" style={{ color: 'var(--foreground)', backgroundColor: 'var(--muted)', padding: '12px', borderRadius: '8px' }}>
                      {item.preview}
                    </p>
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1.5 btn-primary text-sm py-2">
                        <RotateCcw size={13} /> Restore to Document
                      </button>
                      <button className="flex items-center gap-1.5 btn-secondary text-sm py-2">
                        Regenerate
                      </button>
                      <button className="flex items-center gap-1.5 btn-ghost text-sm py-2 text-red-500 ml-auto">
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
