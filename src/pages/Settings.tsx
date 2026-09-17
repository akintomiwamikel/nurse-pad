import { useState } from 'react'
import { User, Shield, CreditCard, Bell, Globe, Palette, Key, Trash2, ChevronRight, Sun, Moon, Monitor } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useTheme } from '../context/ThemeContext'

const tabs = [
  { id: 'general', label: 'General', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'language', label: 'Language', icon: Globe },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const { theme, toggleTheme } = useTheme()
  const [twoFa, setTwoFa] = useState(false)

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl">
        <h1 className="text-2xl font-extrabold mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Settings</h1>

        <div className="flex gap-8">
          {/* Tab sidebar */}
          <div className="w-48 shrink-0">
            <nav className="space-y-0.5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left`}
                  style={{
                    backgroundColor: activeTab === tab.id ? 'var(--primary-light)' : 'transparent',
                    color: activeTab === tab.id ? 'var(--primary)' : 'var(--foreground)',
                  }}
                >
                  <tab.icon size={15} />
                  {tab.label}
                </button>
              ))}
              <div className="pt-3 mt-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all">
                  <Trash2 size={15} /> Delete Account
                </button>
              </div>
            </nav>
          </div>

          {/* Tab content */}
          <div className="flex-1 space-y-5">
            {activeTab === 'general' && (
              <>
                <Section title="Profile Information" desc="Update your basic profile details">
                  <div className="grid grid-cols-2 gap-4">
                    {[['First Name', 'Amara'], ['Last Name', 'Okonkwo'], ['Email', 'amara@university.edu'], ['Phone', '+234 801 234 5678']].map(([label, val]) => (
                      <div key={label}>
                        <label className="block text-sm font-medium mb-1.5">{label}</label>
                        <input className="input" defaultValue={val} />
                      </div>
                    ))}
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Bio</label>
                      <textarea className="input resize-none" rows={3} defaultValue="Final year nursing student with a passion for evidence-based practice." />
                    </div>
                  </div>
                  <button className="btn-primary mt-2">Save Changes</button>
                </Section>

                <Section title="Academic Information" desc="Used for document formatting and templates">
                  <div className="grid grid-cols-2 gap-4">
                    {[['Institution', 'University of Lagos'], ['Programme', 'B.Sc Nursing'], ['Level', '400 Level'], ['Country', 'Nigeria']].map(([label, val]) => (
                      <div key={label}>
                        <label className="block text-sm font-medium mb-1.5">{label}</label>
                        <input className="input" defaultValue={val} />
                      </div>
                    ))}
                  </div>
                  <button className="btn-primary mt-2">Save Changes</button>
                </Section>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <Section title="Change Password" desc="Use a strong, unique password">
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Current password</label>
                      <input type="password" className="input" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">New password</label>
                      <input type="password" className="input" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Confirm new password</label>
                      <input type="password" className="input" placeholder="••••••••" />
                    </div>
                    <button className="btn-primary">Update Password</button>
                  </div>
                </Section>

                <Section title="Two-Factor Authentication" desc="Add an extra layer of security to your account">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Authenticator App</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{twoFa ? 'Enabled' : 'Disabled'} — use Google Authenticator or Authy</p>
                    </div>
                    <button onClick={() => setTwoFa(f => !f)}
                      className="w-11 h-6 rounded-full transition-colors relative"
                      style={{ backgroundColor: twoFa ? 'var(--primary)' : 'var(--border)' }}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${twoFa ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                </Section>

                <Section title="Active Sessions" desc="Manage devices that are signed in">
                  {[
                    { device: 'MacBook Pro 14"', location: 'Lagos, Nigeria', current: true, time: 'Now' },
                    { device: 'iPhone 15 Pro', location: 'Lagos, Nigeria', current: false, time: '2 days ago' },
                  ].map((s, i) => (
                    <div key={i} className="flex items-center justify-between py-3 border-b last:border-b-0" style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <p className="text-sm font-medium">{s.device}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{s.location} · {s.time}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {s.current && <span className="badge badge-success text-[10px]">Current</span>}
                        {!s.current && <button className="text-xs text-red-500 hover:underline">Sign out</button>}
                      </div>
                    </div>
                  ))}
                </Section>
              </>
            )}

            {activeTab === 'notifications' && (
              <Section title="Notification Preferences" desc="Choose what you want to be notified about">
                <div className="space-y-5">
                  {[
                    { category: 'Writing & Documents', items: [
                      { label: 'Writing reminders', desc: 'Daily prompts to meet your writing goal', on: true },
                      { label: 'Deadline alerts', desc: 'Get notified 24h before a deadline', on: true },
                      { label: 'Autosave confirmations', desc: 'Show autosave status in editor', on: false },
                    ]},
                    { category: 'AI & Features', items: [
                      { label: 'AI generation complete', desc: 'Notify when AI finishes generating', on: true },
                      { label: 'Credit usage alerts', desc: 'Alert when credits are running low', on: true },
                    ]},
                    { category: 'Account & Billing', items: [
                      { label: 'Subscription reminders', desc: 'Alert before subscription renews', on: true },
                      { label: 'Payment receipts', desc: 'Email on successful payments', on: true },
                    ]},
                  ].map(group => (
                    <div key={group.category}>
                      <p className="text-xs font-bold mb-3" style={{ color: 'var(--muted-foreground)' }}>{group.category.toUpperCase()}</p>
                      <div className="space-y-3">
                        {group.items.map(item => (
                          <div key={item.label} className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-medium">{item.label}</p>
                              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{item.desc}</p>
                            </div>
                            <button className="w-11 h-6 rounded-full transition-colors relative" style={{ backgroundColor: item.on ? 'var(--primary)' : 'var(--border)' }}>
                              <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${item.on ? 'translate-x-5' : 'translate-x-1'}`} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Section>
            )}

            {activeTab === 'appearance' && (
              <Section title="Appearance" desc="Customize how NURSE PAD looks">
                <div className="space-y-5">
                  <div>
                    <p className="text-sm font-medium mb-3">Theme</p>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Light', icon: Sun, value: 'light' },
                        { label: 'Dark', icon: Moon, value: 'dark' },
                        { label: 'System', icon: Monitor, value: 'system' },
                      ].map(t => (
                        <button
                          key={t.label}
                          onClick={() => theme !== t.value && toggleTheme()}
                          className="flex flex-col items-center gap-2 p-4 rounded-xl border transition-all"
                          style={{
                            borderColor: theme === t.value ? 'var(--primary)' : 'var(--border)',
                            backgroundColor: theme === t.value ? 'var(--primary-light)' : 'var(--card)',
                            color: theme === t.value ? 'var(--primary)' : 'var(--foreground)',
                          }}
                        >
                          <t.icon size={20} />
                          <span className="text-sm font-medium">{t.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-3">Font Size</p>
                    <div className="flex items-center gap-3">
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Small</span>
                      <input type="range" min="12" max="20" defaultValue="16" className="flex-1" />
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Large</span>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium mb-3">Editor Line Spacing</p>
                    <div className="flex gap-2">
                      {['1.5', '1.8', '2.0'].map(s => (
                        <button key={s} className={`px-4 py-2 rounded-xl border text-sm font-medium transition-all ${s === '1.8' ? 'border-[var(--primary)] bg-[var(--primary-light)] text-[var(--primary)]' : ''}`} style={{ borderColor: s === '1.8' ? 'var(--primary)' : 'var(--border)' }}>
                          {s}×
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </Section>
            )}

            {activeTab === 'api' && (
              <Section title="API Keys" desc="Use NURSE PAD programmatically with your applications">
                <div className="flex items-center justify-between p-4 rounded-xl border mb-4" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--muted)' }}>
                  <div>
                    <p className="text-sm font-medium">Production API Key</p>
                    <p className="font-mono text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>np_live_••••••••••••••••••••••••••</p>
                  </div>
                  <button className="btn-ghost text-xs">Reveal</button>
                </div>
                <button className="btn-secondary text-sm">+ Generate New Key</button>
                <div className="mt-4 p-4 rounded-xl text-sm" style={{ backgroundColor: 'var(--muted)' }}>
                  <p className="font-semibold mb-1">Rate limits</p>
                  <p style={{ color: 'var(--muted-foreground)' }}>Student Pro: 100 requests/hour · 5 concurrent requests</p>
                </div>
              </Section>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <h2 className="text-base font-bold mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h2>
      <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
      {children}
    </div>
  )
}
