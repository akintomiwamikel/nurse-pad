import { useEffect, useState } from 'react'
import { Search, Plus, PenLine, Copy, Trash2, Download, BookOpen, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { addCitation, deleteCitation, listCitations, updateCitation } from '../lib/api'
import type { Citation, SaveCitationInput } from '../lib/api'

const styleOptions = ['APA 7th', 'Harvard', 'MLA 9th', 'Chicago', 'Vancouver', 'Other']
const referenceTypes = ['Journal Article', 'Book', 'Book Chapter', 'Website', 'Report', 'Thesis', 'Conference Paper']

export default function CitationManager() {
  const [citations, setCitations] = useState<Citation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [styleFilter, setStyleFilter] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Citation | null>(null)
  const [copied, setCopied] = useState<string | null>(null)

  const refresh = () => {
    setError(null)
    return listCitations()
      .then(setCitations)
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load citations'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  const filtered = citations.filter(c => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase()) || (c.authors ?? '').toLowerCase().includes(search.toLowerCase())
    const matchStyle = !styleFilter || c.style_label === styleFilter
    return matchSearch && matchStyle
  })

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCitation(id)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete citation')
    }
  }

  const handleCopyAll = () => {
    const text = filtered.map(c => c.citation_text).join('\n\n')
    navigator.clipboard.writeText(text).catch(() => {})
  }

  const handleExport = () => {
    const text = filtered.map(c => c.citation_text).join('\n\n')
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'bibliography.txt'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="p-6 flex items-center justify-center min-h-[60vh]">
          <Loader2 size={24} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Citation Manager</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{citations.length} citation{citations.length === 1 ? '' : 's'} saved</p>
          </div>
          <button onClick={() => { setEditing(null); setModalOpen(true) }} className="btn-primary text-sm py-2">
            <Plus size={14} /> Add Citation
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        {/* Style filter */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <span className="text-sm font-medium mr-1" style={{ color: 'var(--muted-foreground)' }}>Filter by style:</span>
          <button
            onClick={() => setStyleFilter(null)}
            className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border"
            style={{
              backgroundColor: !styleFilter ? 'var(--primary)' : 'transparent',
              borderColor: !styleFilter ? 'var(--primary)' : 'var(--border)',
              color: !styleFilter ? 'white' : 'var(--foreground)',
            }}
          >
            All
          </button>
          {styleOptions.map(s => (
            <button
              key={s}
              onClick={() => setStyleFilter(s)}
              className="px-3 py-1.5 rounded-lg text-sm font-semibold transition-all border"
              style={{
                backgroundColor: styleFilter === s ? 'var(--primary)' : 'transparent',
                borderColor: styleFilter === s ? 'var(--primary)' : 'var(--border)',
                color: styleFilter === s ? 'white' : 'var(--foreground)',
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
        {filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed mb-8" style={{ borderColor: 'var(--border)' }}>
            <BookOpen size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {citations.length === 0 ? 'No citations yet — add your first one.' : 'No citations match your search/filter.'}
            </p>
          </div>
        ) : (
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
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{c.authors}{c.year ? ` · ${c.year}` : ''}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="badge badge-accent text-[10px]">{c.reference_type}</span>
                        {c.style_label && <span className="badge text-[10px]" style={{ backgroundColor: 'var(--muted)' }}>{c.style_label}</span>}
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-xl text-xs font-mono leading-relaxed" style={{ backgroundColor: 'var(--muted)', color: 'var(--foreground)' }}>
                      {c.citation_text}
                    </div>
                    <div className="flex items-center gap-2 mt-3">
                      <button
                        onClick={() => handleCopy(c.id, c.citation_text)}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:bg-[var(--muted)]"
                        style={{ borderColor: 'var(--border)', color: copied === c.id ? 'var(--primary)' : 'var(--foreground)' }}
                      >
                        {copied === c.id ? <CheckCircle size={12} /> : <Copy size={12} />}
                        {copied === c.id ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={() => { setEditing(c); setModalOpen(true) }}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:bg-[var(--muted)]"
                        style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                      >
                        <PenLine size={12} /> Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all hover:bg-red-50 text-red-500"
                        style={{ borderColor: 'var(--border)' }}
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Bibliography */}
        {filtered.length > 0 && (
          <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Bibliography</h2>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  {styleFilter ?? 'All styles'} · {filtered.length} reference{filtered.length === 1 ? '' : 's'} · Alphabetical by author
                </p>
              </div>
              <div className="flex gap-2">
                <button onClick={handleCopyAll} className="btn-secondary text-sm py-2"><Copy size={13} /> Copy All</button>
                <button onClick={handleExport} className="btn-primary text-sm py-2"><Download size={13} /> Export</button>
              </div>
            </div>
            <div className="rounded-xl p-4 space-y-3" style={{ backgroundColor: 'var(--muted)' }}>
              {filtered.map((c, i) => (
                <p key={i} className="text-xs font-mono leading-relaxed pl-6 -indent-6" style={{ color: 'var(--foreground)' }}>
                  {c.citation_text}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <CitationModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSaved={() => { setModalOpen(false); refresh() }}
        />
      )}
    </AppLayout>
  )
}

function CitationModal({ initial, onClose, onSaved }: { initial: Citation | null; onClose: () => void; onSaved: () => void }) {
  const [authors, setAuthors] = useState(initial?.authors ?? '')
  const [year, setYear] = useState(initial?.year ? String(initial.year) : '')
  const [title, setTitle] = useState(initial?.title ?? '')
  const [referenceType, setReferenceType] = useState(initial?.reference_type ?? 'Journal Article')
  const [citationText, setCitationText] = useState(initial?.citation_text ?? '')
  const [styleLabel, setStyleLabel] = useState(initial?.style_label ?? 'APA 7th')
  const [sourceUrl, setSourceUrl] = useState(initial?.source_url ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!title.trim() || !citationText.trim()) {
      setError('Title and the full citation text are both required')
      return
    }
    setSaving(true)
    setError(null)
    const input: SaveCitationInput = {
      authors: authors || undefined,
      year: year ? Number(year) : undefined,
      title,
      reference_type: referenceType,
      citation_text: citationText,
      style_label: styleLabel,
      source_url: sourceUrl || undefined,
    }
    try {
      if (initial) await updateCitation(initial.id, input)
      else await addCitation(input)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save citation')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{initial ? 'Edit Citation' : 'Add Citation'}</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
              <AlertCircle size={13} className="shrink-0" /> {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1.5">Title *</label>
              <input className="input" value={title} onChange={e => setTitle(e.target.value)} placeholder="Article/book title" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Authors</label>
              <input className="input" value={authors} onChange={e => setAuthors(e.target.value)} placeholder="Last, F. I., & ..." />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Year</label>
              <input className="input" type="number" value={year} onChange={e => setYear(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Reference type</label>
              <select className="input" value={referenceType} onChange={e => setReferenceType(e.target.value)}>
                {referenceTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Style</label>
              <select className="input" value={styleLabel} onChange={e => setStyleLabel(e.target.value)}>
                {styleOptions.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Full citation text *</label>
            <textarea className="input resize-none text-sm" rows={3} value={citationText} onChange={e => setCitationText(e.target.value)} placeholder="Paste or type the full formatted citation" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Source URL (optional)</label>
            <input className="input" value={sourceUrl} onChange={e => setSourceUrl(e.target.value)} placeholder="https://doi.org/..." />
          </div>
          <button onClick={handleSave} className="btn-primary w-full justify-center py-2.5" disabled={saving}>
            {saving ? 'Saving...' : initial ? 'Save Changes' : 'Save Citation'}
          </button>
        </div>
      </div>
    </div>
  )
}
