import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Clock, Coins, Trash2, Search, AlertCircle, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { deleteAiOperation, listAiOperations } from '../lib/api'
import type { AiOperationRow } from '../lib/api'

const typeColors: Record<string, string> = {
  analysis: '#0F766E',
  research: '#10B981',
  outline: '#3B82F6',
  draft: '#8B5CF6',
  review: '#F59E0B',
  other: '#6B7280',
}

export default function AIHistory() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [operations, setOperations] = useState<AiOperationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => {
    setError(null)
    return listAiOperations()
      .then(setOperations)
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load AI history'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  const handleDelete = async (id: string) => {
    try {
      await deleteAiOperation(id)
      refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not delete this entry')
    }
  }

  const filtered = operations.filter(op =>
    op.operation_type.toLowerCase().includes(search.toLowerCase()) ||
    (op.assignment_topic ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (op.provider ?? '').toLowerCase().includes(search.toLowerCase())
  )

  const totalCredits = operations.reduce((sum, op) => sum + (op.credits_consumed ?? 0), 0)
  const totalTokens = operations.reduce((sum, op) => sum + op.input_tokens + op.output_tokens, 0)

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
      <div className="p-6 max-w-4xl">
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI History</h1>
          <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            A record of every AI operation run on your account — real usage, not a preview of the content itself.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'Total Operations', value: String(operations.length), icon: Sparkles, color: '#0F766E' },
            { label: 'Credits Used', value: String(totalCredits), icon: Coins, color: '#F59E0B' },
            { label: 'Tokens Used', value: totalTokens.toLocaleString(), icon: Clock, color: '#3B82F6' },
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
          <input className="input pl-9 py-2.5" placeholder="Search by type, assignment, or provider..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* History list */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed" style={{ borderColor: 'var(--border)' }}>
            <Sparkles size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              {operations.length === 0 ? 'No AI operations yet — try "Generate with AI" on an assignment\'s Analysis tab.' : 'No results match your search.'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(op => (
              <div key={op.id} className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
                    style={{ backgroundColor: `${typeColors[op.operation_type] ?? typeColors.other}18` }}>
                    <Sparkles size={16} style={{ color: typeColors[op.operation_type] ?? typeColors.other }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 mb-1">
                      <p
                        className="text-sm font-medium capitalize cursor-pointer hover:underline"
                        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                        onClick={() => op.assignment_id && navigate(`/assignment/${op.assignment_id}`)}
                      >
                        {op.operation_type}{op.assignment_topic ? ` — ${op.assignment_topic}` : ''}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        {op.status === 'completed' && <CheckCircle2 size={14} style={{ color: 'var(--success)' }} />}
                        {op.status === 'failed' && <XCircle size={14} style={{ color: '#EF4444' }} />}
                        <button onClick={() => handleDelete(op.id)} className="btn-ghost p-1" style={{ color: 'var(--muted-foreground)' }}>
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                    {op.status === 'failed' && op.error_message && (
                      <p className="text-xs mb-1" style={{ color: '#EF4444' }}>{op.error_message}</p>
                    )}
                    <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      <span className="flex items-center gap-1"><Clock size={11} /> {new Date(op.created_at).toLocaleString()}</span>
                      {op.provider && <span>{op.provider}{op.model ? ` · ${op.model}` : ''}</span>}
                      <span>{(op.input_tokens + op.output_tokens).toLocaleString()} tokens</span>
                      <span>{op.credits_consumed} credit{op.credits_consumed === 1 ? '' : 's'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
