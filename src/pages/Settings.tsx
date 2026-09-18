import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Shield, CreditCard, Bell, Palette, Trash2, Sun, Moon, AlertCircle, Loader2 } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { getMyProfile, updateMyProfile } from '../lib/api'
import type { Profile } from '../lib/types'

const tabs = [
  { id: 'general', label: 'General', icon: User },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'billing', label: 'Billing', icon: CreditCard },
]

const prefLabels: { key: keyof NonNullable<Profile['preferences']>; label: string; desc: string }[] = [
  { key: 'email_notifications', label: 'Email notifications', desc: 'Writing reminders, deadline alerts' },
  { key: 'ai_suggestions', label: 'AI suggestions', desc: 'Show AI recommendations while writing' },
  { key: 'autosave', label: 'Autosave', desc: 'Save drafts automatically as you type' },
  { key: 'grammar_check', label: 'Grammar check', desc: 'Highlight grammar issues as you type' },
]

export default function Settings() {
  const [activeTab, setActiveTab] = useState('general')
  const { theme, toggleTheme } = useTheme()
  const { updatePassword } = useAuth()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // General tab form state
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [institution, setInstitution] = useState('')
  const [programme, setProgramme] = useState('')
  const [level, setLevel] = useState('')
  const [country, setCountry] = useState('')
  const [savingGeneral, setSavingGeneral] = useState(false)
  const [generalError, setGeneralError] = useState<string | null>(null)
  const [generalSaved, setGeneralSaved] = useState(false)

  // Security tab
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordSaved, setPasswordSaved] = useState(false)

  const refresh = () => getMyProfile().then(p => {
    setProfile(p)
    if (p) {
      setFullName(p.full_name ?? '')
      setPhone(p.phone ?? '')
      setBio(p.bio ?? '')
      setInstitution(p.institution ?? '')
      setProgramme(p.onboarding?.programme ?? '')
      setLevel(p.onboarding?.level ?? '')
      setCountry(p.onboarding?.country ?? '')
    }
  }).finally(() => setLoading(false))

  useEffect(() => { refresh() }, [])

  const handleSaveGeneral = async () => {
    setSavingGeneral(true)
    setGeneralError(null)
    setGeneralSaved(false)
    try {
      const updated = await updateMyProfile({
        full_name: fullName,
        phone,
        bio,
        institution,
        onboarding: { ...(profile?.onboarding ?? {}), programme, level, country },
      })
      setProfile(updated)
      setGeneralSaved(true)
    } catch (err) {
      setGeneralError(err instanceof Error ? err.message : 'Could not save changes')
    } finally {
      setSavingGeneral(false)
    }
  }

  const handleChangePassword = async () => {
    setPasswordError(null)
    setPasswordSaved(false)
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters'); return }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match'); return }
    setPasswordSaving(true)
    try {
      const { error } = await updatePassword(newPassword)
      if (error) { setPasswordError(error); return }
      setPasswordSaved(true)
      setNewPassword('')
      setConfirmPassword('')
    } finally {
      setPasswordSaving(false)
    }
  }

  const togglePreference = async (key: keyof NonNullable<Profile['preferences']>) => {
    if (!profile) return
    const nextPrefs = { ...profile.preferences, [key]: !profile.preferences?.[key] }
    setProfile({ ...profile, preferences: nextPrefs })
    try {
      await updateMyProfile({ preferences: nextPrefs })
    } catch {
      refresh()
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
      <div className="p-6 max-w-5xl">
        <h1 className="text-2xl font-extrabold mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Settings</h1>

        <div className="flex gap-8">
          {/* Tab sidebar */}
          <div className="w-48 shrink-0">
            <nav className="space-y-0.5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => tab.id === 'billing' ? navigate('/billing') : setActiveTab(tab.id)}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left"
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
                <button
                  onClick={() => alert('Account deletion isn\'t available yet — this needs a server-side process we haven\'t built. Contact support for now.')}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition-all"
                >
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
                  {generalError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
                      <AlertCircle size={14} className="shrink-0" /> {generalError}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Full Name</label>
                      <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Email</label>
                      <input className="input" value={profile?.email ?? ''} disabled style={{ opacity: 0.6, cursor: 'not-allowed' }} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Phone</label>
                      <input className="input" value={phone} onChange={e => setPhone(e.target.value)} placeholder="Optional" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium mb-1.5">Bio</label>
                      <textarea className="input resize-none" rows={3} value={bio} onChange={e => setBio(e.target.value)} />
                    </div>
                  </div>
                </Section>

                <Section title="Academic Information" desc="Used for document formatting and templates">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Institution</label>
                      <input className="input" value={institution} onChange={e => setInstitution(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Programme</label>
                      <input className="input" value={programme} onChange={e => setProgramme(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Level</label>
                      <input className="input" value={level} onChange={e => setLevel(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Country</label>
                      <input className="input" value={country} onChange={e => setCountry(e.target.value)} />
                    </div>
                  </div>
                  <button onClick={handleSaveGeneral} className="btn-primary mt-4" disabled={savingGeneral}>
                    {savingGeneral ? 'Saving...' : 'Save Changes'}
                  </button>
                  {generalSaved && <span className="ml-3 text-xs" style={{ color: 'var(--success)' }}>Saved</span>}
                </Section>
              </>
            )}

            {activeTab === 'security' && (
              <>
                <Section title="Change Password" desc="Use a strong, unique password">
                  {passwordError && (
                    <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
                      <AlertCircle size={14} className="shrink-0" /> {passwordError}
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">New password</label>
                      <input type="password" className="input" placeholder="Min. 8 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Confirm new password</label>
                      <input type="password" className="input" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                    </div>
                    <button onClick={handleChangePassword} className="btn-primary" disabled={passwordSaving}>
                      {passwordSaving ? 'Updating...' : 'Update Password'}
                    </button>
                    {passwordSaved && <span className="ml-3 text-xs" style={{ color: 'var(--success)' }}>Password updated</span>}
                  </div>
                </Section>

                <Section title="Two-Factor Authentication" desc="Add an extra layer of security to your account">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Authenticator App</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Not available yet — coming in a future update</p>
                    </div>
                    <span className="badge text-[10px]" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>Coming soon</span>
                  </div>
                </Section>
              </>
            )}

            {activeTab === 'notifications' && (
              <Section title="Notification Preferences" desc="Choose what you want to be notified about">
                <div className="space-y-4">
                  {prefLabels.map(pref => {
                    const on = !!profile?.preferences?.[pref.key]
                    return (
                      <div key={pref.key} className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{pref.label}</p>
                          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{pref.desc}</p>
                        </div>
                        <button
                          onClick={() => togglePreference(pref.key)}
                          className="w-11 h-6 rounded-full transition-colors relative"
                          style={{ backgroundColor: on ? 'var(--primary)' : 'var(--border)' }}
                        >
                          <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${on ? 'translate-x-5' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs mt-5 pt-4 border-t" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
                  These same preferences are shared with your Profile page.
                </p>
              </Section>
            )}

            {activeTab === 'appearance' && (
              <Section title="Appearance" desc="Customize how NURSE PAD looks">
                <div>
                  <p className="text-sm font-medium mb-3">Theme</p>
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    {[
                      { label: 'Light', icon: Sun, value: 'light' },
                      { label: 'Dark', icon: Moon, value: 'dark' },
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
