import { useState } from 'react'
import { Search, Plus, Upload, Link, PenLine, Copy, Trash2, Download, BookOpen, X, CheckCircle } from 'lucide-react'
import AppLayout from '../components/AppLayout'

type Style = 'APA 7th' | 'Harvard' | 'MLA 9th' | 'Chicago' | 'Vancouver'

const styles: Style[] = ['APA 7th', 'Harvard', 'MLA 9th', 'Chicago', 'Vancouver']

const savedCitations = [
  {
    id: 1,
    authors: 'World Health Organization',
    title: 'Global Status Report on Noncommunicable Diseases 2024',
    year: 2024,
    type: 'Report',
    apa: 'World Health Organization. (2024). *Global status report on noncommunicable diseases 2024*. WHO Press.',
    harvard: 'World Health Organization (2024) *Global status report on noncommunicable diseases 2024*. Geneva: WHO Press.',
  },
  {
    id: 2,
    authors: 'Potter, P. A., Perry, A. G., Stockert, P. A., & Hall, A.',
    title: 'Fundamentals of Nursing',
    year: 2023,
    type: 'Book',
    apa: 'Potter, P. A., Perry, A. G., Stockert, P. A., & Hall, A. (2023). *Fundamentals of nursing* (11th ed.). Elsevier.',
    harvard: 'Potter, P.A., Perry, A.G., Stockert, P.A. and Hall, A. (2023) *Fundamentals of nursing*. 11th edn. St Louis: Elsevier.',
  },
  {
    id: 3,
    authors: 'Osei-Bonsu, K., Adeyemi, N., & Nwosu, E.',
    title: 'Wound Care Protocols in Sub-Saharan Africa: A Systematic Review',
    year: 2023,
    type: 'Journal Article',
    apa: 'Osei-Bonsu, K., Adeyemi, N., & Nwosu, E. (2023). Wound care protocols in Sub-Saharan Africa: A systematic review. *Journal of Advanced Nursing, 79*(4), 1234–1248. https://doi.org/10.1111/jan.15000',
    harvard: 'Osei-Bonsu, K., Adeyemi, N. and Nwosu, E. (2023) "Wound care protocols in Sub-Saharan Africa: A systematic review," *Journal of Advanced Nursing*, 79(4), pp. 1234–1248.',
  },
  {
    id: 4,
    authors: 'NANDA International',
    title: 'Nursing Diagnoses: Definitions & Classification 2021–2023',
    year: 2021,
    type: 'Book',
    apa: 'NANDA International. (2021). *Nursing diagnoses: Definitions & classification 2021–2023* (12th ed.). Thieme.',
    harvard: 'NANDA International (2021) *Nursing diagnoses: Definitions & classification 2021–2023*. 12th edn. New York: Thieme.',
  },
]

type ModalType = 'doi' | 'pdf' | 'manual' | null

export default function CitationManager() {
  const [activeStyle, setActiveStyle] = useState<Style>('APA 7th')
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<ModalType>(null)
  const [doiValue, setDoiValue] = useState('')
  const [copied, setCopied] = useState<number | null>(null)

  const filtered = savedCitations.filter(c =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.authors.toLowerCase().includes(search.toLowerCase())
  )

  const handleCopy = (id: number, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const getCitationText = (c: typeof savedCitations[0]) => {
    if (activeStyle === 'APA 7th') return c.apa
    if (activeStyle === 'Harvard') return c.harvard
    return c.apa
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Citation Manager</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{savedCitations.length} citations saved</p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setModal('doi')} className="btn-secondary text-sm py-2">
              <Link size={14} /> Import DOI
            </button>
            <button onClick={() => setModal('pdf')} className="btn-secondary text-sm py-2">
              <Upload size={14} /> Import PDF
            </button>
            <button onClick={() => setModal('manual')} className="btn-primary text-sm py-2">
              <Plus size={14} /> Add Citation
            </button>
          </div>
        </div>

        {/* Citation style selector */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm font-medium mr-2" style={{ color: 'var(--muted-foreground)' }}>Format:</span>
          {styles.map(s => (
            <button
              key={s}
              onClick={() => setActiveStyle(s)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border"
              style={{
                backgroundColor: activeStyle === s ? 'var(--primary)' : 'transparent',
                borderColor: activeStyle === s ? 'var(--primary)' : 'var(--border)',
                color: activeStyle === s ? 'white' : 'var(--foreground)',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative mb-5">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input className="input pl-9 py-2.5" placeholder="Search citations..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Citation list */}
        <div className="space-y-3 mb-8">
          {filtered.map(c => (
            <div key={c.id} className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <BookOpen size={16} style={{ color: 'var(--primary)' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3 mb-1">
                    <div>
                      <p className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{c.title}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{c.authors} · {c.year}</p>
                    </div>
                    <span className="badge badge-accent text-[10px] shrink-0">{c.type}</span>
                  </div>
                  <div
                    className="mt-3 p-3 rounded-xl text-xs font-mono leading-relaxed"
                    style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}
                  >
                    {getCitationText(c)}
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => handleCopy(c.id, getCitationText(c))}
                      className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:bg-[var(--muted)]"
                      style={{ borderColor: 'var(--border)', color: copied === c.id ? 'var(--primary)' : 'var(--foreground)' }}
                    >
                      {copied === c.id ? <CheckCircle size={12} /> : <Copy size={12} />}
                      {copied === c.id ? 'Copied!' : 'Copy'}
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:bg-[var(--muted)]"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                      <PenLine size={12} /> Edit
                    </button>
                    <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:bg-red-50 text-red-500"
                      style={{ borderColor: 'var(--border)' }}>
                      <Trash2 size={12} /> Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Generate Bibliography */}
        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Generated Bibliography</h2>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{activeStyle} format · {savedCitations.length} references · Alphabetical order</p>
            </div>
            <div className="flex gap-2">
              <button className="btn-secondary text-sm py-2"><Copy size={13} /> Copy All</button>
              <button className="btn-primary text-sm py-2"><Download size={13} /> Export</button>
            </div>
          </div>
          <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--muted)' }}>
            {savedCitations
              .slice()
              .sort((a, b) => a.authors.localeCompare(b.authors))
              .map((c, i) => (
                <p key={i} className="text-xs font-mono leading-relaxed pl-6 -indent-6" style={{ color: 'var(--foreground)' }}>
                  {getCitationText(c)}
                </p>
              ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModal(null)} />
          <div className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {modal === 'doi' ? 'Import by DOI' : modal === 'pdf' ? 'Import from PDF' : 'Add Citation Manually'}
              </h2>
              <button onClick={() => setModal(null)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              {modal === 'doi' && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">DOI or URL</label>
                    <input className="input" placeholder="e.g. 10.1111/jan.15000" value={doiValue} onChange={e => setDoiValue(e.target.value)} autoFocus />
                    <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>Paste a DOI, PubMed ID, or full article URL</p>
                  </div>
                  <button onClick={() => setModal(null)} className="btn-primary w-full justify-center py-2.5">
                    <Search size={14} /> Fetch Citation
                  </button>
                </>
              )}
              {modal === 'pdf' && (
                <>
                  <div className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer hover:border-[var(--primary)] transition-colors" style={{ borderColor: 'var(--border)' }}>
                    <Upload size={28} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                    <p className="text-sm font-medium mb-1">Drop PDF here or click to browse</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>AI will extract citation details automatically</p>
                  </div>
                  <button onClick={() => setModal(null)} className="btn-primary w-full justify-center py-2.5">Extract Citation</button>
                </>
              )}
              {modal === 'manual' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {[['Authors', 'Last, F. I., & Last, F. I.'], ['Year', '2024'], ['Title', 'Article title here'], ['Journal / Publisher', 'Journal Name']].map(([label, ph]) => (
                      <div key={label} className={label === 'Title' ? 'col-span-2' : ''}>
                        <label className="block text-sm font-medium mb-1.5">{label}</label>
                        <input className="input" placeholder={ph} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Reference type</label>
                    <select className="input">
                      {['Journal Article', 'Book', 'Book Chapter', 'Website', 'Report', 'Thesis', 'Conference Paper'].map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                  <button onClick={() => setModal(null)} className="btn-primary w-full justify-center py-2.5">Save Citation</button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
