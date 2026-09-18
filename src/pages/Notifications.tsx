import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, CheckCircle, Sparkles, AlertCircle, X, Loader2 } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { deleteNotification, listNotifications, markAllNotificationsRead, markNotificationRead } from '../lib/api'
import type { NotificationRow } from '../lib/api'

const typeIcon: Record<string, { icon: typeof CheckCircle; color: string }> = {
  success: { icon: CheckCircle, color: '#22C55E' },
  warning: { icon: AlertCircle, color: '#F59E0B' },
  info: { icon: Sparkles, color: '#3B82F6' },
}

function timeAgo(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(iso).toLocaleDateString()
}

export default function Notifications() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<NotificationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refresh = () => {
    setError(null)
    return listNotifications()
      .then(setNotifications)
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load notifications'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  const unread = notifications.filter(n => !n.read).length

  const handleClick = async (n: NotificationRow) => {
    if (!n.read) {
      try { await markNotificationRead(n.id) } catch { /* non-critical */ }
      setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x))
    }
    if (n.link) navigate(n.link)
  }

  const handleDismiss = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    try {
      await deleteNotification(id)
      setNotifications(prev => prev.filter(n => n.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not dismiss notification')
    }
  }

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not mark all as read')
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
      <div className="p-6 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Notifications</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {unread} unread notification{unread !== 1 ? 's' : ''}
            </p>
          </div>
          {unread > 0 && <button onClick={handleMarkAllRead} className="btn-ghost text-sm">Mark all as read</button>}
        </div>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        {notifications.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed" style={{ borderColor: 'var(--border)' }}>
            <Bell size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Nothing yet — notifications appear here as things happen: assignment status changes, AI generations, and credit alerts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map(n => {
              const meta = typeIcon[n.type] ?? typeIcon.info
              return (
                <div
                  key={n.id}
                  onClick={() => handleClick(n)}
                  className="flex gap-4 p-4 rounded-2xl border transition-colors cursor-pointer"
                  style={{
                    backgroundColor: !n.read ? 'var(--primary-light)' : 'var(--card)',
                    borderColor: !n.read ? 'rgba(15,118,110,0.2)' : 'var(--border)',
                  }}
                >
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${meta.color}18` }}>
                    <meta.icon size={18} style={{ color: meta.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{n.title}</p>
                    {n.body && <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{n.body}</p>}
                    <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>{timeAgo(n.created_at)}</p>
                  </div>
                  <div className="flex items-start gap-1 shrink-0">
                    {!n.read && <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: 'var(--primary)' }} />}
                    <button onClick={e => handleDismiss(e, n.id)} className="p-1 rounded hover:bg-[var(--muted)] transition-colors">
                      <X size={13} style={{ color: 'var(--muted-foreground)' }} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </AppLayout>
  )
}
