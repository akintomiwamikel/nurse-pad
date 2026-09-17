import { useEffect, useRef, useState } from 'react'
import { Camera, FileText, TrendingUp, CheckCircle, Star, Edit3, Save, Loader2 } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { getMyProfile, getWritingStats, updateMyProfile } from '../lib/api'
import type { WritingStats } from '../lib/api'
import { uploadAvatar } from '../lib/storage'
import type { Profile } from '../lib/types'

const nurseRoles: { value: NonNullable<Profile['nurse_role']>; label: string }[] = [
  { value: 'student', label: 'Nursing Student' },
  { value: 'intern', label: 'Nursing Intern' },
  { value: 'professional', label: 'Professional / Registered Nurse' },
  { value: 'other', label: 'Other' },
]

const prefLabels: { key: keyof NonNullable<Profile['preferences']>; label: string; desc: string }[] = [
  { key: 'email_notifications', label: 'Email notifications', desc: 'Writing reminders, deadline alerts' },
  { key: 'ai_suggestions', label: 'AI suggestions', desc: 'Show AI recommendations while writing' },
  { key: 'autosave', label: 'Autosave', desc: 'Save drafts automatically as you type' },
  { key: 'grammar_check', label: 'Grammar check', desc: 'Highlight grammar issues as you type' },
]

export default function Profile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<WritingStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Edit form state
  const [fullName, setFullName] = useState('')
  const [bio, setBio] = useState('')
  const [institution, setInstitution] = useState('')
  const [nurseRole, setNurseRole] = useState<Profile['nurse_role']>(null)

  const refresh = () => {
    setError(null)
    return Promise.all([getMyProfile(), getWritingStats()])
      .then(([p, s]) => {
        setProfile(p)
        setStats(s)
        if (p) {
          setFullName(p.full_name ?? '')
          setBio(p.bio ?? '')
          setInstitution(p.institution ?? '')
          setNurseRole(p.nurse_role)
        }
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load profile'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { refresh() }, [])

  const handleAvatarClick = () => fileInputRef.current?.click()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    setError(null)
    try {
      const url = await uploadAvatar(file)
      const updated = await updateMyProfile({ avatar_url: url })
      setProfile(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload photo')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const updated = await updateMyProfile({
        full_name: fullName,
        bio,
        institution,
        nurse_role: nurseRole,
      })
      setProfile(updated)
      setEditing(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save profile')
    } finally {
      setSaving(false)
    }
  }

  const togglePreference = async (key: keyof NonNullable<Profile['preferences']>) => {
    if (!profile) return
    const nextPrefs = { ...profile.preferences, [key]: !profile.preferences?.[key] }
    setProfile({ ...profile, preferences: nextPrefs }) // optimistic
    try {
      await updateMyProfile({ preferences: nextPrefs })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save preference')
      refresh() // revert on failure
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

  const initials = (profile?.full_name || profile?.email || 'U').trim().charAt(0).toUpperCase()

  return (
    <AppLayout>
      <div className="p-6 max-w-4xl">
        <h1 className="text-2xl font-extrabold mb-8" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>My Profile</h1>

        {error && (
          <div className="text-xs p-3 rounded-lg mb-4" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>{error}</div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Profile card */}
          <div className="lg:col-span-1 space-y-5">
            <div className="rounded-2xl border p-6 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="relative inline-block mb-4">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Profile" className="w-20 h-20 rounded-2xl object-cover" />
                ) : (
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-2xl font-bold text-white"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    {initials}
                  </div>
                )}
                <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleAvatarChange} />
                <button
                  onClick={handleAvatarClick}
                  disabled={uploadingAvatar}
                  className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg flex items-center justify-center border-2 border-white"
                  style={{ backgroundColor: 'var(--primary)' }}
                >
                  {uploadingAvatar ? <Loader2 size={12} className="text-white animate-spin" /> : <Camera size={12} className="text-white" />}
                </button>
              </div>
              <h2 className="text-xl font-bold mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {profile?.full_name || 'Add your name'}
              </h2>
              <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>{profile?.email}</p>
              {profile?.nurse_role && (
                <div className="flex flex-wrap justify-center gap-1.5 mt-3">
                  <span className="badge badge-primary text-[10px]">
                    {nurseRoles.find(r => r.value === profile.nurse_role)?.label}
                  </span>
                </div>
              )}

              {profile?.institution && (
                <div className="mt-5 pt-5 border-t space-y-2 text-left" style={{ borderColor: 'var(--border)' }}>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: 'var(--muted-foreground)' }}>Institution</span>
                    <span className="font-medium">{profile.institution}</span>
                  </div>
                </div>
              )}

              <button onClick={() => setEditing(e => !e)} className="btn-secondary w-full mt-5 justify-center text-sm">
                <Edit3 size={13} /> {editing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          {/* Right: Stats + edit form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Writing stats — all derived from real data */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: 'Documents', value: String(stats?.totalAssignments ?? 0), icon: FileText, color: '#0F766E' },
                { label: 'Words Written', value: stats && stats.totalWords >= 1000 ? `${(stats.totalWords / 1000).toFixed(1)}K` : String(stats?.totalWords ?? 0), icon: TrendingUp, color: '#10B981' },
                { label: 'Completed', value: String(stats?.completedCount ?? 0), icon: CheckCircle, color: '#F59E0B' },
                { label: 'Avg. Review Score', value: stats?.averageReviewScore != null ? `${stats.averageReviewScore}/100` : '—', icon: Star, color: '#3B82F6' },
              ].map(s => (
                <div key={s.label} className="rounded-2xl border p-4 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                  <s.icon size={20} className="mx-auto mb-2" style={{ color: s.color }} />
                  <p className="text-xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: s.color }}>{s.value}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* Bio / Edit form */}
            <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="font-semibold mb-5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {editing ? 'Edit Profile' : 'About'}
              </h3>

              {!editing ? (
                <div>
                  <p className="text-sm leading-relaxed" style={{ color: profile?.bio ? 'var(--foreground)' : 'var(--muted-foreground)' }}>
                    {profile?.bio || 'No bio yet — click Edit Profile to add one.'}
                  </p>
                  {profile?.created_at && (
                    <div className="mt-4 pt-4 border-t space-y-2" style={{ borderColor: 'var(--border)' }}>
                      <div className="flex justify-between text-sm">
                        <span style={{ color: 'var(--muted-foreground)' }}>Member Since</span>
                        <span className="font-medium">
                          {new Date(profile.created_at).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Full Name</label>
                    <input className="input" value={fullName} onChange={e => setFullName(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Bio</label>
                    <textarea className="input resize-none" rows={4} value={bio} onChange={e => setBio(e.target.value)} placeholder="Tell us a bit about yourself" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Institution</label>
                      <input className="input" value={institution} onChange={e => setInstitution(e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">I am a</label>
                      <select className="input" value={nurseRole ?? ''} onChange={e => setNurseRole(e.target.value as Profile['nurse_role'])}>
                        <option value="">Select...</option>
                        {nurseRoles.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <button onClick={handleSave} className="btn-primary flex items-center gap-1.5" disabled={saving}>
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>

            {/* Preferences */}
            <div className="rounded-2xl border p-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="font-semibold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Preferences</h3>
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
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
