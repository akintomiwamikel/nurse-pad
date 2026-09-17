import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, FileText, FolderOpen, BookOpen, Stethoscope, Pill, ClipboardList,
  Library, GraduationCap, Sparkles, Search, BookMarked, Quote, Download, Users,
  Bell, CreditCard, Settings, HelpCircle, ChevronLeft, ChevronRight,
  Heart, Microscope, FileStack, MessageSquare
} from 'lucide-react'
import Logo from './Logo'
import { getTotalStorageUsedBytes } from '../lib/storage'

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const navGroups = [
  {
    label: 'Workspace',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: FileText, label: 'My Documents', path: '/documents' },
      { icon: FolderOpen, label: 'Projects', path: '/documents?type=project' },
    ],
  },
  {
    label: 'Document Types',
    items: [
      { icon: BookOpen, label: 'Assignments', path: '/documents?type=assignment' },
      { icon: ClipboardList, label: 'Case Studies', path: '/documents?type=case-study' },
      { icon: Heart, label: 'Care Plans', path: '/documents?type=care-plan' },
      { icon: Pill, label: 'Drug Studies', path: '/documents?type=drug-study' },
      { icon: Stethoscope, label: 'Clinical Reports', path: '/documents?type=clinical' },
      { icon: Microscope, label: 'Literature Reviews', path: '/documents?type=literature' },
      { icon: FileStack, label: 'Templates', path: '/templates' },
    ],
  },
  {
    label: 'AI Tools',
    items: [
      { icon: Sparkles, label: 'AI Assistant', path: '/ai-assistant' },
      { icon: GraduationCap, label: 'AI History', path: '/ai-history' },
      { icon: Library, label: 'Research Library', path: '/research' },
      { icon: Quote, label: 'Citation Manager', path: '/citations' },
      { icon: BookMarked, label: 'References', path: '/references' },
      { icon: Download, label: 'Export Center', path: '/export' },
    ],
  },
  {
    label: 'Collaboration',
    items: [
      { icon: Users, label: 'Team Workspace', path: '/team' },
      { icon: MessageSquare, label: 'Shared Documents', path: '/shared' },
    ],
  },
  {
    label: 'Account',
    items: [
      { icon: Bell, label: 'Notifications', path: '/notifications', badge: 3 },
      { icon: CreditCard, label: 'Billing', path: '/billing' },
      { icon: Settings, label: 'Settings', path: '/settings' },
      { icon: HelpCircle, label: 'Help Center', path: '/help' },
    ],
  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()
  const [storage, setStorage] = useState<{ bytes: number; fileCount: number } | null>(null)

  useEffect(() => {
    getTotalStorageUsedBytes().then(setStorage).catch(() => setStorage(null))
  }, [location.pathname])

  const isActive = (path: string) => {
    const [basePath, query] = path.split('?')

    // Assignment workspace/editor pages have no dedicated nav item — treat them as "My Documents"
    if (basePath === '/documents' && !query && location.pathname.startsWith('/assignment/')) {
      return true
    }

    if (location.pathname !== basePath) return false

    // Items sharing '/documents' as a base path (the type filters) must match on their
    // query param too, or every one of them would light up together whenever on /documents.
    const currentType = new URLSearchParams(location.search).get('type')
    const itemType = query ? new URLSearchParams(query).get('type') : null
    return currentType === itemType
  }

  return (
    <aside
      className="h-screen flex flex-col border-r transition-all duration-300 shrink-0"
      style={{
        width: collapsed ? '64px' : '240px',
        backgroundColor: 'var(--sidebar-bg)',
        borderColor: 'var(--sidebar-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-3 py-4 border-b" style={{ borderColor: 'var(--sidebar-border)' }}>
        {!collapsed && (
          <Link to="/dashboard">
            <Logo size="sm" />
          </Link>
        )}
        {collapsed && (
          <Link to="/dashboard" className="mx-auto">
            <Logo size="sm" showText={false} />
          </Link>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="p-1.5 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        )}
      </div>

      {/* New Document Button */}
      {!collapsed ? (
        <div className="px-3 py-3">
          <Link
            to="/new-document"
            className="btn-primary w-full justify-center text-sm py-2"
            style={{ textDecoration: 'none' }}
          >
            <span>+ New Document</span>
          </Link>
        </div>
      ) : (
        <div className="px-2 py-3">
          <Link
            to="/new-document"
            className="flex items-center justify-center w-10 h-10 rounded-xl mx-auto text-white transition-all hover:opacity-90"
            style={{ backgroundColor: 'var(--primary)', textDecoration: 'none' }}
            title="New Document"
          >
            <span className="text-lg font-bold">+</span>
          </Link>
        </div>
      )}

      {/* Nav Items */}
      <nav className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
        {navGroups.map(group => (
          <div key={group.label}>
            {!collapsed && (
              <p className="px-2 mb-1 text-[10px] font-semibold uppercase tracking-widest" style={{ color: 'var(--muted-foreground)' }}>
                {group.label}
              </p>
            )}
            <div className="space-y-0.5">
              {group.items.map(item => {
                const active = isActive(item.path)
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-2.5 px-2 py-2 rounded-lg text-sm font-medium transition-all ${
                      active
                        ? 'text-white'
                        : 'text-[var(--foreground)] hover:bg-[var(--muted)]'
                    } ${collapsed ? 'justify-center' : ''}`}
                    style={{
                      backgroundColor: active ? 'var(--primary)' : undefined,
                      textDecoration: 'none',
                    }}
                  >
                    <item.icon size={16} className="shrink-0" />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {'badge' in item && item.badge && (
                          <span className="text-xs font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Expand button when collapsed */}
      {collapsed && (
        <div className="px-2 py-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
          <button
            onClick={() => setCollapsed(false)}
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors mx-auto"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Storage indicator */}
      {!collapsed && (
        <div className="px-3 py-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>
            {storage ? `Storage: ${formatBytes(storage.bytes)} used` : 'Storage: 0 B used'}
          </div>
        </div>
      )}
    </aside>
  )
}
