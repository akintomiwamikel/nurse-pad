import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Bell, Sun, Moon, ChevronDown, Sparkles, Plus } from 'lucide-react'
import Sidebar from './Sidebar'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { getMyProfile, listNotifications } from '../lib/api'
import type { Profile } from '../lib/types'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { theme, toggleTheme } = useTheme()
  const { user, signOut } = useAuth()
  const [searchOpen, setSearchOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    getMyProfile().then(setProfile).catch(() => setProfile(null))
    listNotifications().then(list => setUnreadCount(list.filter(n => !n.read).length)).catch(() => setUnreadCount(0))
  }, [user?.id])

  const displayName = profile?.full_name || (user?.user_metadata?.full_name as string) || user?.email?.split('@')[0] || 'Account'
  const initials = displayName.trim().charAt(0).toUpperCase() || 'U'

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navigation */}
        <header
          className="h-14 flex items-center gap-3 px-4 border-b shrink-0"
          style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}
        >
          {/* Search */}
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm flex-1 max-w-xs text-left transition-colors hover:border-[var(--primary)]"
            style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}
          >
            <Search size={14} />
            <span>Search documents...</span>
            <span className="ml-auto text-[11px] font-mono px-1 py-0.5 rounded" style={{ backgroundColor: 'var(--muted)' }}>⌘K</span>
          </button>

          <div className="flex items-center gap-1 ml-auto">
            {/* AI Quick Action */}
            <Link
              to="/ai-assistant"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-white transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--primary)', textDecoration: 'none' }}
            >
              <Sparkles size={13} />
              <span className="hidden sm:inline">Ask AI</span>
            </Link>

            {/* New Doc */}
            <Link
              to="/new-document"
              className="p-2 rounded-lg transition-colors hover:bg-[var(--muted)]"
              style={{ color: 'var(--foreground)', textDecoration: 'none' }}
              title="New Document"
            >
              <Plus size={18} />
            </Link>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg transition-colors hover:bg-[var(--muted)]"
              style={{ color: 'var(--foreground)' }}
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Notifications */}
            <Link
              to="/notifications"
              className="relative p-2 rounded-lg transition-colors hover:bg-[var(--muted)]"
              style={{ color: 'var(--foreground)', textDecoration: 'none' }}
            >
              <Bell size={18} />
              {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500" />}
            </Link>

            {/* Profile */}
            <div className="relative">
              <button
                onClick={() => setProfileOpen(p => !p)}
                className="flex items-center gap-2 p-1.5 rounded-lg transition-colors hover:bg-[var(--muted)]"
                style={{ color: 'var(--foreground)' }}
              >
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt="Profile"
                    className="w-7 h-7 rounded-full object-cover"
                  />
                ) : (
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {initials}
                  </div>
                )}
                <ChevronDown size={14} />
              </button>

              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setProfileOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-1 w-52 rounded-xl border shadow-xl z-20 overflow-hidden"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                  >
                    <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                      <p className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{displayName}</p>
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{user?.email}</p>
                    </div>
                    {[
                      { label: 'Profile', path: '/profile' },
                      { label: 'Settings', path: '/settings' },
                      { label: 'Billing', path: '/billing' },
                    ].map(item => (
                      <button
                        key={item.path}
                        onClick={() => { navigate(item.path); setProfileOpen(false) }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--muted)] transition-colors"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {item.label}
                      </button>
                    ))}
                    <div className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto" style={{ backgroundColor: 'var(--background)' }}>
          {children}
        </main>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)} />
          <div
            className="relative w-full max-w-xl rounded-2xl border shadow-2xl overflow-hidden"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
          >
            <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
              <Search size={18} style={{ color: 'var(--muted-foreground)' }} />
              <input
                autoFocus
                placeholder="Search documents, templates, citations..."
                className="flex-1 bg-transparent outline-none text-sm"
                style={{ color: 'var(--foreground)', fontFamily: 'Inter, sans-serif' }}
              />
              <kbd className="text-xs px-1.5 py-0.5 rounded border" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>ESC</kbd>
            </div>
            <div className="p-3">
              <p className="text-xs font-semibold px-2 mb-2" style={{ color: 'var(--muted-foreground)' }}>RECENT DOCUMENTS</p>
              {[
                'Fundamentals of Nursing Care Plan',
                'Clinical Posting Report - Pediatrics Ward',
                'Drug Study: Metformin 500mg',
              ].map(doc => (
                <button
                  key={doc}
                  onClick={() => { navigate('/editor'); setSearchOpen(false) }}
                  className="w-full text-left px-3 py-2.5 rounded-lg text-sm hover:bg-[var(--muted)] transition-colors flex items-center gap-2.5"
                  style={{ color: 'var(--foreground)' }}
                >
                  <span className="text-base">📄</span>
                  {doc}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
