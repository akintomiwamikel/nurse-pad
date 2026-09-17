import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Grid3X3, List, Search, Filter, Star, Trash2, Archive, FolderOpen, Clock, Plus } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { listAssignments } from '../lib/api'
import type { NursingAssignment } from '../lib/types'

const filters = ['All', 'Recent', 'Favorites', 'Shared', 'Archived', 'Deleted']
const typeFilters = ['All Types', 'draft', 'analysis', 'research', 'outline', 'drafting', 'review', 'completed']

export default function Documents() {
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [search, setSearch] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All Types')
  const [docs, setDocs] = useState<NursingAssignment[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    listAssignments().then(setDocs).catch(() => setDocs([]))
  }, [])

  const openAssignment = (a: NursingAssignment) => {
    navigate(['drafting', 'review', 'completed'].includes(a.status) ? `/assignment/${a.id}/editor` : `/assignment/${a.id}`)
  }

  const filtered = docs.filter(d => {
    const matchSearch = d.topic.toLowerCase().includes(search.toLowerCase()) || d.assignment_question.toLowerCase().includes(search.toLowerCase())
    const matchType = typeFilter === 'All Types' || d.status === typeFilter
    return matchSearch && matchType
  })

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Documents</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{docs.length} documents</p>
          </div>
          <button onClick={() => navigate('/new-document')} className="btn-primary">
            <Plus size={15} /> New Document
          </button>
        </div>

        {/* Search + controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
            <input
              className="input pl-9 py-2.5"
              placeholder="Search documents..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            className="input py-2.5 w-auto"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            {typeFilters.map(t => <option key={t}>{t}</option>)}
          </select>
          <div className="flex items-center border rounded-xl overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <button onClick={() => setView('grid')} className={`px-3 py-2.5 transition-colors ${view === 'grid' ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}>
              <Grid3X3 size={15} />
            </button>
            <button onClick={() => setView('list')} className={`px-3 py-2.5 transition-colors ${view === 'list' ? 'bg-[var(--primary)] text-white' : 'text-[var(--muted-foreground)] hover:bg-[var(--muted)]'}`}>
              <List size={15} />
            </button>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-1 mb-6 border-b pb-3" style={{ borderColor: 'var(--border)' }}>
          {filters.map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                backgroundColor: activeFilter === f ? 'var(--primary-light)' : 'transparent',
                color: activeFilter === f ? 'var(--primary)' : 'var(--muted-foreground)',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Grid View */}
        {view === 'grid' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(doc => (
              <div
                key={doc.id}
                onClick={() => openAssignment(doc)}
                className="card-hover rounded-2xl border p-5 cursor-pointer group relative"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl">📝</span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={e => e.stopPropagation()} className="p-1 rounded hover:bg-[var(--muted)]">
                      <Star size={13} style={{ color: 'var(--muted-foreground)' }} />
                    </button>
                    <button onClick={e => e.stopPropagation()} className="p-1 rounded hover:bg-[var(--muted)]">
                      <Trash2 size={13} style={{ color: 'var(--muted-foreground)' }} />
                    </button>
                  </div>
                </div>
                <h3 className="text-sm font-semibold mb-2 line-clamp-2 leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{doc.topic}</h3>
                <div className="flex items-center gap-2 mb-3">
                  {doc.academic_level && <span className="badge badge-primary text-[10px]">{doc.academic_level}</span>}
                  <span className={`badge text-[10px] ${doc.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{doc.status}</span>
                </div>
                <div className="flex items-center justify-between text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  <span>{doc.word_count ? `${doc.word_count} words target` : '—'}</span>
                  <div className="flex items-center gap-1">
                    <Clock size={11} />
                    {new Date(doc.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* List View */}
        {view === 'list' && (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full">
              <thead>
                <tr className="border-b text-left" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                  <th className="px-5 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Document</th>
                  <th className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Type</th>
                  <th className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Words</th>
                  <th className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Status</th>
                  <th className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Modified</th>
                  <th className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                {filtered.map(doc => (
                  <tr
                    key={doc.id}
                    onClick={() => openAssignment(doc)}
                    className="cursor-pointer hover:bg-[var(--muted)] transition-colors"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">📝</span>
                        <span className="text-sm font-medium truncate max-w-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{doc.topic}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="badge badge-primary text-[10px]">{doc.academic_level || 'Assignment'}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      {doc.word_count ?? '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`badge text-[10px] ${doc.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{doc.status}</span>
                    </td>
                    <td className="px-4 py-3.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>{new Date(doc.updated_at).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1" onClick={e => e.stopPropagation()}>
                        <button className="p-1 rounded hover:bg-[var(--border)]"><Star size={13} style={{ color: 'var(--muted-foreground)' }} /></button>
                        <button className="p-1 rounded hover:bg-[var(--border)]"><Archive size={13} style={{ color: 'var(--muted-foreground)' }} /></button>
                        <button className="p-1 rounded hover:bg-[var(--border)]"><Trash2 size={13} style={{ color: 'var(--muted-foreground)' }} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <FolderOpen size={48} className="mx-auto mb-4" style={{ color: 'var(--border)' }} />
            <h3 className="text-lg font-semibold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No documents found</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Try a different search term or create a new document.</p>
            <button onClick={() => navigate('/new-document')} className="btn-primary">
              <Plus size={15} /> Create Document
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
