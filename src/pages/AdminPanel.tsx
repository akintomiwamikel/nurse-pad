import { useState } from 'react'
import { Users, CreditCard, BarChart3, FileText, Sparkles, Bell, Shield, Settings, TrendingUp, TrendingDown, AlertCircle, ChevronRight, Search, Filter } from 'lucide-react'
import Logo from '../components/Logo'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

const adminNav = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'users', label: 'Users', icon: Users },
  { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
  { id: 'payments', label: 'Payments', icon: TrendingUp },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'content', label: 'Templates', icon: FileText },
  { id: 'tickets', label: 'Support Tickets', icon: AlertCircle },
  { id: 'ai', label: 'AI Usage', icon: Sparkles },
  { id: 'logs', label: 'System Logs', icon: Shield },
  { id: 'settings', label: 'Settings', icon: Settings },
]

const users = [
  { name: 'Ngozi Adeyemi', email: 'ngozi@university.edu', plan: 'Student Pro', docs: 47, joined: 'Mar 2024', status: 'Active' },
  { name: 'Emmanuel Nwosu', email: 'e.nwosu@luth.ng', plan: 'Premium', docs: 134, joined: 'Jan 2024', status: 'Active' },
  { name: 'Kemi Osei-Bonsu', email: 'k.osei@ug.edu.gh', plan: 'Institution', docs: 312, joined: 'Oct 2023', status: 'Active' },
  { name: 'Fatima Aliyu', email: 'f.aliyu@abuth.ng', plan: 'Free', docs: 5, joined: 'Dec 2025', status: 'Pending' },
  { name: 'Chidi Okafor', email: 'c.okafor@unth.ng', plan: 'Student Pro', docs: 28, joined: 'Nov 2025', status: 'Active' },
]

const revenueData = [
  { month: 'Jul', amount: 4200 },
  { month: 'Aug', amount: 5100 },
  { month: 'Sep', amount: 6300 },
  { month: 'Oct', amount: 7800 },
  { month: 'Nov', amount: 9200 },
  { month: 'Dec', amount: 11400 },
]

const maxRevenue = Math.max(...revenueData.map(d => d.amount))

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const { theme, toggleTheme } = useTheme()

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--background)' }}>
      {/* Admin Sidebar */}
      <aside className="w-56 shrink-0 border-r flex flex-col" style={{ backgroundColor: 'var(--sidebar-bg)', borderColor: 'var(--sidebar-border)' }}>
        <div className="px-4 py-4 border-b flex items-center gap-2" style={{ borderColor: 'var(--sidebar-border)' }}>
          <Logo size="sm" />
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: 'var(--primary)', color: 'white' }}>ADMIN</span>
        </div>
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {adminNav.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-left"
              style={{
                backgroundColor: activeTab === item.id ? 'var(--primary)' : 'transparent',
                color: activeTab === item.id ? 'white' : 'var(--foreground)',
              }}
            >
              <item.icon size={15} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t" style={{ borderColor: 'var(--sidebar-border)' }}>
          <div className="flex items-center gap-2">
            <img src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=28&h=28&fit=crop&auto=format" alt="Admin" className="w-7 h-7 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold truncate">Super Admin</p>
              <p className="text-[10px] truncate" style={{ color: 'var(--muted-foreground)' }}>admin@nursepad.ai</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Admin Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex items-center justify-between px-6 border-b shrink-0" style={{ backgroundColor: 'var(--background)', borderColor: 'var(--border)' }}>
          <h1 className="text-lg font-bold capitalize" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {adminNav.find(n => n.id === activeTab)?.label}
          </h1>
          <div className="flex items-center gap-2">
            <button onClick={toggleTheme} className="btn-ghost p-2">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button className="badge badge-error text-xs px-2 py-1">3 alerts</button>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Total Users', value: '12,847', change: '+18%', up: true, icon: Users, color: '#0F766E' },
                  { label: 'Monthly Revenue', value: '$11,400', change: '+24%', up: true, icon: CreditCard, color: '#10B981' },
                  { label: 'Active Subscriptions', value: '4,231', change: '+12%', up: true, icon: TrendingUp, color: '#3B82F6' },
                  { label: 'AI Credits Used', value: '2.4M', change: '+31%', up: true, icon: Sparkles, color: '#8B5CF6' },
                ].map(kpi => (
                  <div key={kpi.label} className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <div className="flex justify-between mb-3">
                      <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{kpi.label}</p>
                      <kpi.icon size={15} style={{ color: kpi.color }} />
                    </div>
                    <p className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: kpi.color }}>{kpi.value}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {kpi.up ? <TrendingUp size={11} style={{ color: '#22C55E' }} /> : <TrendingDown size={11} style={{ color: '#EF4444' }} />}
                      <span className="text-xs" style={{ color: kpi.up ? '#22C55E' : '#EF4444' }}>{kpi.change} this month</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Revenue chart */}
              <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Monthly Revenue</h2>
                  <span className="badge badge-success text-[10px]">+$2,200 vs last month</span>
                </div>
                <div className="flex items-end gap-3 h-36">
                  {revenueData.map(d => (
                    <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                      <span className="text-xs font-semibold" style={{ color: 'var(--primary)' }}>
                        ${(d.amount / 1000).toFixed(1)}k
                      </span>
                      <div
                        className="w-full rounded-t-lg transition-all"
                        style={{
                          height: `${(d.amount / maxRevenue) * 100}%`,
                          backgroundColor: d.month === 'Dec' ? 'var(--primary)' : 'var(--primary-light)',
                          minHeight: '8px',
                        }}
                      />
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{d.month}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan distribution + recent signups */}
              <div className="grid lg:grid-cols-2 gap-5">
                <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <h2 className="font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Subscription Distribution</h2>
                  <div className="space-y-3">
                    {[
                      { plan: 'Free', users: 7234, pct: 56, color: '#94A3B8' },
                      { plan: 'Student Pro', users: 3891, pct: 30, color: '#0F766E' },
                      { plan: 'Premium', users: 1246, pct: 10, color: '#10B981' },
                      { plan: 'Institution', users: 342, pct: 3, color: '#3B82F6' },
                      { plan: 'Enterprise', users: 134, pct: 1, color: '#8B5CF6' },
                    ].map(p => (
                      <div key={p.plan}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">{p.plan}</span>
                          <span style={{ color: 'var(--muted-foreground)' }}>{p.users.toLocaleString()} ({p.pct}%)</span>
                        </div>
                        <div className="h-2 rounded-full" style={{ backgroundColor: 'var(--border)' }}>
                          <div className="h-2 rounded-full" style={{ width: `${p.pct}%`, backgroundColor: p.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                    <h2 className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent Signups</h2>
                  </div>
                  <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {users.slice(0, 4).map((u, i) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-sm" style={{ backgroundColor: 'var(--primary)' }}>
                          {u.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{u.name}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{u.email}</p>
                        </div>
                        <span className={`badge text-[10px] ${u.plan === 'Free' ? 'badge-warning' : u.plan === 'Premium' ? 'badge-success' : 'badge-accent'}`}>
                          {u.plan}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* USERS TAB */}
          {activeTab === 'users' && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                  <input className="input pl-9 py-2" placeholder="Search users..." />
                </div>
                <button className="btn-secondary text-sm py-2"><Filter size={13} /> Filter</button>
                <button className="btn-primary text-sm py-2"><Users size={13} /> Export Users</button>
              </div>

              <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                      {['User', 'Plan', 'Documents', 'Joined', 'Status', 'Actions'].map(h => (
                        <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                    {users.map((u, i) => (
                      <tr key={i} className="hover:bg-[var(--muted)] transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-white text-xs" style={{ backgroundColor: 'var(--primary)' }}>
                              {u.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{u.name}</p>
                              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{u.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className={`badge text-[10px] ${u.plan === 'Free' ? 'badge-warning' : u.plan === 'Premium' || u.plan === 'Institution' ? 'badge-success' : 'badge-accent'}`}>
                            {u.plan}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-sm">{u.docs}</td>
                        <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>{u.joined}</td>
                        <td className="px-5 py-3.5">
                          <span className={`badge text-[10px] ${u.status === 'Active' ? 'badge-success' : 'badge-warning'}`}>{u.status}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <button className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>Manage</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Other tabs placeholder */}
          {!['dashboard', 'users'].includes(activeTab) && (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: 'var(--primary-light)' }}>
                {(() => {
                  const Icon = adminNav.find(n => n.id === activeTab)?.icon ?? BarChart3
                  return <Icon size={24} style={{ color: 'var(--primary)' }} />
                })()}
              </div>
              <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {adminNav.find(n => n.id === activeTab)?.label}
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Full admin panel for this section — navigate via the sidebar.
              </p>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}
