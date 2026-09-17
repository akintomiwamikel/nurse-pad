import { useState } from 'react'
import { Users, Plus, Link, Mail, Clock, MessageSquare, Edit3, Eye, Shield, Trash2, X, CheckCircle } from 'lucide-react'
import AppLayout from '../components/AppLayout'

const members = [
  { name: 'Dr. Kemi Osei-Bonsu', email: 'k.osei@university.edu', role: 'Owner', avatar: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=40&h=40&fit=crop&auto=format', online: true },
  { name: 'Ngozi Adeyemi', email: 'n.adeyemi@university.edu', role: 'Editor', avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=40&h=40&fit=crop&auto=format', online: true },
  { name: 'Emmanuel Nwosu', email: 'e.nwosu@luth.ng', role: 'Viewer', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&auto=format', online: false },
  { name: 'Amara Okonkwo', email: 'amara@university.edu', role: 'Editor', avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=40&h=40&fit=crop&auto=format', online: true },
]

const sharedDocs = [
  { title: 'Literature Review: Wound Care Protocols in Sub-Saharan Africa', editors: 3, comments: 7, lastEdit: '2 hours ago', status: 'Editing' },
  { title: 'Clinical Posting Report — Pediatrics Ward, LUTH', editors: 2, comments: 3, lastEdit: 'Yesterday', status: 'Review' },
  { title: 'Group Research Paper: Geriatric Nursing in Nigeria', editors: 4, comments: 12, lastEdit: '3 days ago', status: 'Draft' },
]

const activity = [
  { user: 'Dr. Kemi', action: 'commented on Introduction section', doc: 'Literature Review', time: '30 min ago', icon: '💬' },
  { user: 'Ngozi', action: 'edited Methodology chapter', doc: 'Group Research Paper', time: '2 hours ago', icon: '✏️' },
  { user: 'Emmanuel', action: 'viewed Clinical Posting Report', doc: 'Clinical Posting Report', time: '3 hours ago', icon: '👁' },
  { user: 'Dr. Kemi', action: 'approved changes in Nursing Interventions', doc: 'Literature Review', time: 'Yesterday', icon: '✅' },
]

export default function Team() {
  const [inviteOpen, setInviteOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('Editor')
  const [linkCopied, setLinkCopied] = useState(false)

  const copyLink = () => {
    setLinkCopied(true)
    setTimeout(() => setLinkCopied(false), 2000)
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Team Workspace</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Collaborate on documents in real time</p>
          </div>
          <button onClick={() => setInviteOpen(true)} className="btn-primary">
            <Plus size={15} /> Invite Member
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Shared Documents */}
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
                <h2 className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Shared Documents</h2>
                <button className="btn-ghost text-sm py-1.5"><Plus size={13} /> Add Document</button>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {sharedDocs.map((doc, i) => (
                  <div key={i} className="flex items-center gap-4 px-5 py-4 hover:bg-[var(--muted)] transition-colors cursor-pointer">
                    <span className="text-2xl">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{doc.title}</p>
                      <div className="flex items-center gap-3 mt-0.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <span className="flex items-center gap-1"><Edit3 size={10} /> {doc.editors} editors</span>
                        <span className="flex items-center gap-1"><MessageSquare size={10} /> {doc.comments} comments</span>
                        <span className="flex items-center gap-1"><Clock size={10} /> {doc.lastEdit}</span>
                      </div>
                    </div>
                    <span className={`badge text-[10px] ${doc.status === 'Editing' ? 'badge-warning' : doc.status === 'Review' ? 'badge-accent' : 'badge-primary'}`}>
                      {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity Timeline */}
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Activity Timeline</h2>
              </div>
              <div className="p-5 space-y-4">
                {activity.map((a, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="text-lg">{a.icon}</span>
                    <div className="flex-1">
                      <p className="text-sm">
                        <strong>{a.user}</strong> {a.action}
                        <span className="text-[var(--muted-foreground)]"> in <em>{a.doc}</em></span>
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{a.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Members panel */}
          <div className="space-y-5">
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
                <h2 className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Members ({members.length})</h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 px-5 py-3.5">
                    <div className="relative">
                      <img src={m.avatar} alt={m.name} className="w-9 h-9 rounded-xl object-cover" />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${m.online ? 'bg-green-400' : 'bg-gray-300'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{m.name}</p>
                      <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{m.email}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`badge text-[10px] ${m.role === 'Owner' ? 'badge-primary' : m.role === 'Editor' ? 'badge-accent' : 'badge-warning'}`}>
                        {m.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-5 py-3 border-t" style={{ borderColor: 'var(--border)' }}>
                <button onClick={copyLink}
                  className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border text-sm font-medium transition-all hover:bg-[var(--muted)]"
                  style={{ borderColor: 'var(--border)', color: linkCopied ? 'var(--primary)' : 'var(--foreground)' }}>
                  {linkCopied ? <CheckCircle size={14} /> : <Link size={14} />}
                  {linkCopied ? 'Link copied!' : 'Copy invite link'}
                </button>
              </div>
            </div>

            {/* Permissions legend */}
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h3 className="text-sm font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Permissions</h3>
              <div className="space-y-2.5">
                {[
                  { role: 'Owner', desc: 'Full access, billing, member management', icon: Shield, color: '#0F766E' },
                  { role: 'Editor', desc: 'Edit, comment, share documents', icon: Edit3, color: '#3B82F6' },
                  { role: 'Viewer', desc: 'Read-only access, can comment', icon: Eye, color: '#F59E0B' },
                ].map(p => (
                  <div key={p.role} className="flex items-start gap-2">
                    <p.icon size={14} className="mt-0.5" style={{ color: p.color }} />
                    <div>
                      <span className="text-xs font-bold">{p.role}</span>
                      <span className="text-xs ml-1.5" style={{ color: 'var(--muted-foreground)' }}>{p.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Invite modal */}
      {inviteOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setInviteOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-bold text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Invite Team Member</h2>
              <button onClick={() => setInviteOpen(false)} className="btn-ghost p-1.5"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                  <input className="input pl-9" placeholder="colleague@university.edu" value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} autoFocus />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Role</label>
                <select className="input" value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                  <option>Editor</option>
                  <option>Viewer</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5">Personal message (optional)</label>
                <textarea className="input resize-none" rows={3} placeholder="I'd like to collaborate on our group project..." />
              </div>
              <button onClick={() => setInviteOpen(false)} className="btn-primary w-full justify-center py-3">
                <Mail size={15} /> Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
