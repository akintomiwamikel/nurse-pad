import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles, FileText, TrendingUp, Clock, Star, Bell, HardDrive, ArrowRight,
  CheckCircle, ChevronRight, Plus, Zap, BookOpen, BarChart3, Activity
} from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useAuth } from '../context/AuthContext'
import { getCreditBalance, listAssignments, listProjects } from '../lib/api'
import { getTotalStorageUsedBytes } from '../lib/storage'
import type { AiCreditBalance, NursingAssignment, Project } from '../lib/types'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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

const statusVerb: Record<string, string> = {
  draft: 'created',
  analysis: 'analyzed',
  research: 'added research to',
  outline: 'outlined',
  drafting: 'started drafting',
  review: 'submitted for review',
  completed: 'completed',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const [newDocOpen, setNewDocOpen] = useState(false)
  const { user } = useAuth()
  const [assignments, setAssignments] = useState<NursingAssignment[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [creditBalance, setCreditBalance] = useState<AiCreditBalance | null>(null)
  const [storage, setStorage] = useState<{ bytes: number; fileCount: number } | null>(null)

  useEffect(() => {
    listAssignments().then(setAssignments).catch(() => setAssignments([]))
    listProjects().then(setProjects).catch(() => setProjects([]))
    getCreditBalance().then(setCreditBalance).catch(() => setCreditBalance(null))
    getTotalStorageUsedBytes().then(setStorage).catch(() => setStorage(null))
  }, [])

  const totalCredits = creditBalance
    ? creditBalance.included_credits_remaining + creditBalance.topup_credits_remaining
    : 0
  const firstName = user?.user_metadata?.full_name?.split(' ')?.[0] || user?.email?.split('@')[0] || 'there'

  const inProgress = assignments
    .filter(a => a.status !== 'completed')
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
  const continueWorking = inProgress[0] ?? null

  const upcoming = assignments
    .filter(a => a.due_date && a.status !== 'completed')
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 4)

  const recentActivity = [...assignments]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 5)

  const assignmentCountByProject = (projectId: string) =>
    assignments.filter(a => a.project_id === projectId).length

  const docTypes = [
    { name: 'Care Plan', icon: '🩺', color: '#0F766E' },
    { name: 'Drug Study', icon: '💊', color: '#10B981' },
    { name: 'Case Study', icon: '🔬', color: '#3B82F6' },
    { name: 'Clinical Report', icon: '📋', color: '#8B5CF6' },
    { name: 'Research Paper', icon: '📄', color: '#F59E0B' },
    { name: 'Assignment', icon: '📝', color: '#EF4444' },
    { name: 'Literature Review', icon: '📚', color: '#06B6D4' },
    { name: 'Reflection Journal', icon: '📔', color: '#EC4899' },
    { name: 'Seminar Paper', icon: '🎓', color: '#84CC16' },
    { name: 'Proposal', icon: '📊', color: '#F97316' },
    { name: 'Presentation', icon: '🖥', color: '#6366F1' },
    { name: 'Health Education', icon: '🏥', color: '#14B8A6' },
  ]

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Good morning, {firstName} 👋
            </h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
              {assignments.length} assignment{assignments.length === 1 ? '' : 's'} in progress
            </p>
          </div>
          <button
            onClick={() => setNewDocOpen(true)}
            className="btn-primary"
          >
            <Plus size={16} /> New Document
          </button>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Documents', value: String(assignments.length), sub: 'Across all projects', icon: FileText, color: '#0F766E' },
            { label: 'AI Credits Left', value: String(totalCredits), sub: creditBalance ? `${creditBalance.included_credits_remaining} included + ${creditBalance.topup_credits_remaining} top-up` : 'No plan yet', icon: Sparkles, color: '#10B981' },
            { label: 'Completed', value: String(assignments.filter(a => a.status === 'completed').length), sub: 'Assignments finished', icon: CheckCircle, color: '#F59E0B' },
            { label: 'Storage Used', value: storage ? formatBytes(storage.bytes) : '0 B', sub: storage ? `${storage.fileCount} file${storage.fileCount === 1 ? '' : 's'} uploaded` : 'No files yet', icon: HardDrive, color: '#3B82F6' },
          ].map(stat => (
            <div
              key={stat.label}
              className="rounded-2xl p-5 border"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{stat.label}</p>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${stat.color}18` }}>
                  <stat.icon size={16} style={{ color: stat.color }} />
                </div>
              </div>
              <p className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: stat.color }}>{stat.value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{stat.sub}</p>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Recent Docs + AI suggestions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Working */}
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                <Sparkles size={16} style={{ color: 'var(--primary)' }} />
                <h2 className="font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Continue Working</h2>
              </div>
              {continueWorking ? (
                <div className="flex items-center gap-3 px-5 py-3.5">
                  <p className="text-sm flex-1 truncate" style={{ color: 'var(--foreground)' }}>
                    <span className="font-medium">{continueWorking.topic}</span>
                    {' — '}
                    <span style={{ color: 'var(--muted-foreground)' }}>currently at {continueWorking.status}</span>
                  </p>
                  <button
                    onClick={() => navigate(['drafting', 'review'].includes(continueWorking.status) ? `/assignment/${continueWorking.id}/editor` : `/assignment/${continueWorking.id}`)}
                    className="text-xs font-semibold whitespace-nowrap hover:underline shrink-0 flex items-center gap-1"
                    style={{ color: 'var(--primary)' }}
                  >
                    Continue <ArrowRight size={12} />
                  </button>
                </div>
              ) : (
                <div className="px-5 py-6 text-sm text-center" style={{ color: 'var(--muted-foreground)' }}>
                  Nothing in progress — create your first assignment to get started.
                </div>
              )}
            </div>

            {/* Recent Documents */}
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Clock size={16} style={{ color: 'var(--primary)' }} />
                  <h2 className="font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent Documents</h2>
                </div>
                <Link to="/documents" className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)', textDecoration: 'none' }}>
                  View all →
                </Link>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {assignments.length === 0 && (
                  <div className="px-5 py-8 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    No assignments yet — create your first one to get started.
                  </div>
                )}
                {assignments.slice(0, 5).map(a => (
                  <div
                    key={a.id}
                    onClick={() => navigate(['drafting', 'review', 'completed'].includes(a.status) ? `/assignment/${a.id}/editor` : `/assignment/${a.id}`)}
                    className="flex items-start gap-3 px-5 py-3.5 cursor-pointer hover:bg-[var(--muted)] transition-colors"
                  >
                    <span className="text-xl mt-0.5">📝</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{a.topic}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {a.academic_level && <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.academic_level}</span>}
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>·</span>
                        <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{new Date(a.updated_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className={`badge text-[10px] shrink-0 ${a.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>
                      {a.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pinned Projects */}
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                <Star size={16} style={{ color: 'var(--primary)' }} />
                <h2 className="font-semibold text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Pinned Projects</h2>
              </div>
              <div className="p-5 grid sm:grid-cols-3 gap-4">
                {projects.length === 0 && (
                  <p className="text-sm sm:col-span-3 text-center py-4" style={{ color: 'var(--muted-foreground)' }}>
                    No projects yet
                  </p>
                )}
                {projects.slice(0, 6).map(p => (
                  <div
                    key={p.id}
                    onClick={() => navigate('/documents')}
                    className="cursor-pointer rounded-xl p-4 border hover:shadow-md transition-all"
                    style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
                  >
                    <div className="w-8 h-8 rounded-lg mb-3" style={{ backgroundColor: 'var(--primary-light)' }}>
                      <div className="w-full h-full rounded-lg flex items-center justify-center">
                        <FolderIcon color="var(--primary)" />
                      </div>
                    </div>
                    <p className="text-sm font-semibold mb-1 leading-snug" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{p.title}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {assignmentCountByProject(p.id)} assignment{assignmentCountByProject(p.id) === 1 ? '' : 's'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: sidebar widgets */}
          <div className="space-y-6">
            {/* AI Credits */}
            <div
              className="rounded-2xl p-5 text-white"
              style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #14B8A6 100%)' }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="badge text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white' }}>
                  AI Credits
                </span>
                <Zap size={16} className="text-white/80" />
              </div>
              <p className="font-semibold text-sm mb-1">{totalCredits} credit{totalCredits === 1 ? '' : 's'} remaining</p>
              <p className="text-xs text-white/70 mb-3">
                {creditBalance ? `${creditBalance.included_credits_remaining} included · ${creditBalance.topup_credits_remaining} top-up` : 'No plan yet'}
              </p>
              <Link
                to="/billing"
                className="text-xs font-semibold underline text-white/90"
                style={{ textDecoration: 'underline' }}
              >
                {totalCredits === 0 ? 'Get more credits →' : 'Manage billing →'}
              </Link>
            </div>

            {/* Storage */}
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 mb-3">
                <HardDrive size={15} style={{ color: 'var(--primary)' }} />
                <h3 className="text-sm font-semibold">Cloud Storage</h3>
              </div>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                {storage ? `${formatBytes(storage.bytes)} used across ${storage.fileCount} file${storage.fileCount === 1 ? '' : 's'}` : 'No files uploaded yet'}
              </p>
            </div>

            {/* Upcoming Deadlines */}
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-5 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--border)' }}>
                <Bell size={15} style={{ color: 'var(--primary)' }} />
                <h3 className="text-sm font-semibold">Upcoming Deadlines</h3>
              </div>
              {upcoming.length === 0 ? (
                <p className="px-5 py-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>No due dates set</p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {upcoming.map(a => {
                    const due = new Date(a.due_date!)
                    const urgent = due.getTime() - Date.now() < 1000 * 60 * 60 * 48
                    return (
                      <div
                        key={a.id}
                        onClick={() => navigate(`/assignment/${a.id}`)}
                        className="px-5 py-3 flex items-start justify-between gap-2 cursor-pointer hover:bg-[var(--muted)] transition-colors"
                      >
                        <div>
                          <p className="text-xs font-medium" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{a.topic}</p>
                          <p className="text-xs mt-0.5" style={{ color: urgent ? '#EF4444' : 'var(--muted-foreground)' }}>
                            {due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        {urgent && <span className="badge badge-error text-[10px] shrink-0">Soon</span>}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Recent Activity */}
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-semibold">Recent Activity</h3>
              </div>
              {recentActivity.length === 0 ? (
                <p className="px-5 py-4 text-xs" style={{ color: 'var(--muted-foreground)' }}>Nothing yet</p>
              ) : (
                <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {recentActivity.map(a => (
                    <div key={a.id} className="flex items-start gap-3 px-5 py-3">
                      <Activity size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">You {statusVerb[a.status] ?? 'updated'} "{a.topic}"</p>
                        <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{timeAgo(a.updated_at)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Document Modal */}
      {newDocOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setNewDocOpen(false)} />
          <div
            className="relative w-full max-w-2xl rounded-2xl border shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <div>
                <h2 className="text-xl font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>New Document</h2>
                <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Choose a document type to get started</p>
              </div>
              <button onClick={() => setNewDocOpen(false)} className="btn-ghost p-2">✕</button>
            </div>
            <div className="p-6 grid grid-cols-3 sm:grid-cols-4 gap-3">
              {docTypes.map(dt => (
                <button
                  key={dt.name}
                  onClick={() => { setNewDocOpen(false); navigate('/new-document') }}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border hover:border-[var(--primary)] hover:bg-[var(--primary-light)] transition-all group text-center"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span className="text-2xl">{dt.icon}</span>
                  <span className="text-xs font-medium leading-tight" style={{ color: 'var(--foreground)' }}>{dt.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}

function FolderIcon({ color }: { color: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color} xmlns="http://www.w3.org/2000/svg">
      <path d="M3 7C3 5.9 3.9 5 5 5H10L12 7H19C20.1 7 21 7.9 21 9V17C21 18.1 20.1 19 19 19H5C3.9 19 3 18.1 3 17V7Z" />
    </svg>
  )
}
