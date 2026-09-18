import { useEffect, useState } from 'react'
import { Search, BookOpen, ExternalLink, Star, Plus, X, AlertCircle, Loader2, Trash2 } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { addCitation, addSavedResource, deleteSavedResource, listSavedResources, toggleSavedResourceStar } from '../lib/api'
import type { SavedResource, SaveResourceInput } from '../lib/api'

const resourceTypes = ['Article', 'Book', 'Research Paper', 'Clinical Guideline', 'Drug Manual', 'Report', 'Website', 'Other']
const typeIcon: Record<string, string> = {
  Article: '📄', Book: '📘', 'Research Paper': '🔬', 'Clinical Guideline': '📋',
  'Drug Manual': '💊', Report: '📊', Website: '🌐', Other: '📎',
}

export default function ResearchLibrary() {
  const [resources, setResources] = useState<SavedResource[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState<'All' | 'Starred' | string>('All')
  const [modalOpen, setModalOpen] = useState(false)
  const [citedId, setCitedId] = useState<string | null>(null)

  const refresh = () => {
    setError(null)
    return listSavedResources()
      .then(setResources)
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load your library'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  const typeCounts = resourceTypes.reduce<Record<string, number>>((acc, t) => {
    acc[t] = resources.filter(r => r.resource_type === t).length
    return acc
  }, {})

  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || (r.author ?? '').toLowerCase().includes(search.toLowerCase())
    const matchFilter = activeFilter === 'All' || (activeFilter === 'Starred' ? r.starred : r.resource_type === activeFilter)
    return matchSearch && matchFilter
  })

  const handleToggleStar = async (r: SavedResource) => {
    try {
      await toggleSavedResourceStar(r.id, !r.starred)
      setResources(prev => prev.map(x => x.id === r.id ? { ...x, starred: !x.starred } : x))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not update')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteSavedResource(id)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not remove resource')
    }
  }

  const handleCiteThis = async (r: SavedResource) => {
    setError(null)
    try {
      const citationText = `${r.author ?? 'Unknown author'} (${r.year ?? 'n.d.'}). ${r.title}.${r.url ? ` ${r.url}` : ''}`
      await addCitation({
        authors: r.author ?? undefined,
        year: r.year ?? undefined,
        title: r.title,
        reference_type: r.resource_type,
        citation_text: citationText,
        source_url: r.url ?? undefined,
      })
      setCitedId(r.id)
      setTimeout(() => setCitedId(null), 2500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create citation')
    }
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
      <div className="p-6">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Research Library</h1>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {resources.length} saved resource{resources.length === 1 ? '' : 's'} — links and notes you've saved, not a browsable catalog
            </p>
          </div>
          <button onClick={() => setModalOpen(true)} className="btn-primary text-sm py-2 shrink-0">
            <Plus size={14} /> Add Resource
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        <div className="relative max-w-2xl mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            className="input pl-11 py-3 text-base w-full"
            placeholder="Search your saved resources..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-6">
          {/* Filter sidebar */}
          <div className="w-48 shrink-0">
            <p className="text-xs font-bold mb-3" style={{ color: 'var(--muted-foreground)' }}>FILTER</p>
            <div className="space-y-0.5">
              {[
                { label: 'All', count: resources.length },
                { label: 'Starred', count: resources.filter(r => r.starred).length },
                ...resourceTypes.filter(t => typeCounts[t] > 0).map(t => ({ label: t, count: typeCounts[t] })),
              ].map(c => (
                <button
                  key={c.label}
                  onClick={() => setActiveFilter(c.label)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: activeFilter === c.label ? 'var(--primary-light)' : 'transparent',
                    color: activeFilter === c.label ? 'var(--primary)' : 'var(--foreground)',
                  }}
                >
                  <span className="font-medium">{c.label}</span>
                  <span className="text-xs" style={{ color: activeFilter === c.label ? 'var(--primary)' : 'var(--muted-foreground)' }}>{c.count}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resource list */}
          <div className="flex-1 space-y-4">
            {filtered.length === 0 ? (
              <div className="text-center py-16 rounded-2xl border border-dashed" style={{ borderColor: 'var(--border)' }}>
                <BookOpen size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
                <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                  {resources.length === 0 ? 'Nothing saved yet — add a resource you found elsewhere to keep track of it.' : 'No resources match your search/filter.'}
                </p>
              </div>
            ) : (
              filtered.map(resource => (
                <div key={resource.id} className="card-hover rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="flex gap-4">
                    <span className="text-4xl mt-1">{typeIcon[resource.resource_type] ?? '📎'}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="font-bold text-base leading-snug mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{resource.title}</h3>
                          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{resource.author}{resource.year ? ` · ${resource.year}` : ''}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button onClick={() => handleToggleStar(resource)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors">
                            <Star size={15} fill={resource.starred ? '#F59E0B' : 'none'} style={{ color: resource.starred ? '#F59E0B' : 'var(--muted-foreground)' }} />
                          </button>
                          <button onClick={() => handleDelete(resource.id)} className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors">
                            <Trash2 size={14} style={{ color: 'var(--muted-foreground)' }} />
                          </button>
                        </div>
                      </div>
                      {resource.notes && <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{resource.notes}</p>}
                      <div className="flex items-center gap-3 mt-3 flex-wrap">
                        <span className="badge badge-primary text-[10px]">{resource.resource_type}</span>
                        <div className="flex items-center gap-2 ml-auto">
                          {resource.url && (
                            <a href={resource.url} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium btn-ghost py-1">
                              <ExternalLink size={12} /> Open
                            </a>
                          )}
                          <button
                            onClick={() => handleCiteThis(resource)}
                            className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg"
                            style={{ backgroundColor: citedId === resource.id ? 'var(--success)' : 'var(--primary)' }}
                          >
                            {citedId === resource.id ? 'Added to Citations ✓' : 'Cite this'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {modalOpen && (
        <AddResourceModal onClose={() => setModalOpen(false)} onSaved={() => { setModalOpen(false); refresh() }} />
      )}
    </AppLayout>
  )
}

function AddResourceModal({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = useState('')
  const [author, setAuthor] = useState('')
  const [year, setYear] = useState('')
  const [resourceType, setResourceType] = useState('Article')
  const [url, setUrl] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSave = async () => {
    if (!title.trim()) { setError('Title is required'); return }
    setSaving(true)
    setError(null)
    const input: SaveResourceInput = {
      title, author: author || undefined, year: year ? Number(year) : undefined,
      resource_type: resourceType, url: url || undefined, notes: notes || undefined,
    }
    try {
      await addSavedResource(input)
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save resource')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Add Resource</h2>
          <button onClick={onClose} className="btn-ghost p-1.5"><X size={16} /></button>
        </div>
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-lg text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
              <AlertCircle size={13} className="shrink-0" /> {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium mb-1.5">Title *</label>
            <input className="input" value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1.5">Author(s)</label>
              <input className="input" value={author} onChange={e => setAuthor(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Year</label>
              <input className="input" type="number" value={year} onChange={e => setYear(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Type</label>
            <select className="input" value={resourceType} onChange={e => setResourceType(e.target.value)}>
              {resourceTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">URL (optional)</label>
            <input className="input" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5">Notes (optional)</label>
            <textarea className="input resize-none text-sm" rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
          </div>
          <button onClick={handleSave} className="btn-primary w-full justify-center py-2.5" disabled={saving}>
            {saving ? 'Saving...' : 'Save Resource'}
          </button>
        </div>
      </div>
    </div>
  )
}
