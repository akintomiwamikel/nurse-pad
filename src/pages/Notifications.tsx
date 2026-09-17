import { Bell, CheckCircle, CreditCard, Users, Sparkles, AlertCircle, X } from 'lucide-react'
import AppLayout from '../components/AppLayout'

const notifications = [
  { id: 1, type: 'success', icon: CheckCircle, iconColor: '#22C55E', title: 'Document generation complete', body: 'Your Care Plan: Type II Diabetes Mellitus is ready to review.', time: '2 minutes ago', read: false },
  { id: 2, type: 'warning', icon: AlertCircle, iconColor: '#F59E0B', title: 'AI credits running low', body: 'You have 14 AI credits remaining this month. Upgrade to Premium for more.', time: '1 hour ago', read: false },
  { id: 3, type: 'info', icon: Sparkles, iconColor: '#3B82F6', title: 'New feature: Citation Import', body: 'You can now import citations directly from DOI or PubMed. Try it in Citation Manager.', time: '3 hours ago', read: false },
  { id: 4, type: 'collaboration', icon: Users, iconColor: '#8B5CF6', title: 'Dr. Osei commented on your document', body: '"Great work on the nursing diagnoses section — consider expanding the rationale for each intervention." — Literature Review: Wound Care', time: 'Yesterday', read: true },
  { id: 5, type: 'billing', icon: CreditCard, iconColor: '#0F766E', title: 'Payment successful', body: 'Your Student Pro subscription has been renewed for December 2025. Invoice: INV-2025-012', time: 'Dec 1, 2025', read: true },
  { id: 6, type: 'success', icon: CheckCircle, iconColor: '#22C55E', title: 'Export completed', body: 'Clinical Posting Report has been exported as PDF. Check your downloads.', time: 'Dec 1, 2025', read: true },
]

export default function Notifications() {
  const unread = notifications.filter(n => !n.read).length

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
          <button className="btn-ghost text-sm">Mark all as read</button>
        </div>

        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n.id}
              className="flex gap-4 p-4 rounded-2xl border transition-colors"
              style={{
                backgroundColor: !n.read ? 'var(--primary-light)' : 'var(--card)',
                borderColor: !n.read ? 'rgba(15,118,110,0.2)' : 'var(--border)',
              }}
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${n.iconColor}18` }}>
                <n.icon size={18} style={{ color: n.iconColor }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{n.title}</p>
                <p className="text-sm mt-0.5 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{n.body}</p>
                <p className="text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>{n.time}</p>
              </div>
              <div className="flex items-start gap-1 shrink-0">
                {!n.read && (
                  <div className="w-2 h-2 rounded-full mt-1.5" style={{ backgroundColor: 'var(--primary)' }} />
                )}
                <button className="p-1 rounded hover:bg-[var(--muted)] transition-colors">
                  <X size={13} style={{ color: 'var(--muted-foreground)' }} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  )
}
