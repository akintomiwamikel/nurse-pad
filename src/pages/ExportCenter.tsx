import { useState } from 'react'
import { FileText, Download, Mail, Cloud, Printer, CheckCircle, Sparkles, ChevronDown } from 'lucide-react'
import AppLayout from '../components/AppLayout'

const exportFormats = [
  { id: 'docx', label: 'Microsoft Word', ext: '.docx', icon: '📄', desc: 'Fully formatted .docx with styles, headings, and tables', popular: true },
  { id: 'pdf', label: 'PDF Document', ext: '.pdf', icon: '📕', desc: 'High-quality PDF with embedded fonts and layout', popular: true },
  { id: 'rtf', label: 'Rich Text Format', ext: '.rtf', icon: '📃', desc: 'Universal format compatible with any word processor', popular: false },
  { id: 'md', label: 'Markdown', ext: '.md', icon: '🗒', desc: 'Clean markdown for GitHub, Notion, or Obsidian', popular: false },
  { id: 'html', label: 'HTML Page', ext: '.html', icon: '🌐', desc: 'Publish online as a standalone web page', popular: false },
  { id: 'epub', label: 'EPUB eBook', ext: '.epub', icon: '📚', desc: 'Readable on Kindle, iBooks, and e-readers', popular: false },
]

const actionOptions = [
  { id: 'print', label: 'Print', icon: Printer, desc: 'Send directly to a printer' },
  { id: 'email', label: 'Email', icon: Mail, desc: 'Send as attachment to any email' },
  { id: 'cloud', label: 'Cloud Backup', icon: Cloud, desc: 'Save to Google Drive or Dropbox' },
]

const recentExports = [
  { name: 'Nursing Care Plan: DM Type II', format: 'PDF', date: 'Today, 2:40 PM', size: '284 KB' },
  { name: 'Clinical Posting Report — Pediatrics', format: 'Word', date: 'Yesterday', size: '512 KB' },
  { name: 'Drug Study: Metformin 500mg', format: 'PDF', date: 'Dec 8, 2025', size: '198 KB' },
]

export default function ExportCenter() {
  const [selectedFormat, setSelectedFormat] = useState<string | null>('docx')
  const [selectedDoc, setSelectedDoc] = useState('Nursing Care Plan: Type II Diabetes Mellitus')
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)
  const [paperSize, setPaperSize] = useState('A4')
  const [includeRefs, setIncludeRefs] = useState(true)
  const [includeToC, setIncludeToC] = useState(true)

  const handleExport = () => {
    setExporting(true)
    setTimeout(() => { setExporting(false); setDone(true) }, 2000)
    setTimeout(() => setDone(false), 5000)
  }

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl">
        <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Export Center</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>Export your documents in any format</p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: export options */}
          <div className="lg:col-span-2 space-y-6">
            {/* Document selector */}
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Select Document</h2>
              <div className="relative">
                <FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                <select className="input pl-9 py-2.5" value={selectedDoc} onChange={e => setSelectedDoc(e.target.value)}>
                  {[
                    'Nursing Care Plan: Type II Diabetes Mellitus',
                    'Clinical Posting Report — Pediatrics Ward, LUTH',
                    'Drug Study: Metformin 500mg',
                    'Literature Review: Wound Care Protocols',
                  ].map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div className="mt-3 text-xs flex gap-4" style={{ color: 'var(--muted-foreground)' }}>
                <span>3,240 words</span>
                <span>12 pages</span>
                <span>4 references</span>
                <span>Last edited 2h ago</span>
              </div>
            </div>

            {/* Format grid */}
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Choose Format</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {exportFormats.map(fmt => (
                  <button
                    key={fmt.id}
                    onClick={() => setSelectedFormat(fmt.id)}
                    className="relative flex flex-col items-start p-4 rounded-xl border text-left transition-all hover:shadow-md"
                    style={{
                      borderColor: selectedFormat === fmt.id ? 'var(--primary)' : 'var(--border)',
                      backgroundColor: selectedFormat === fmt.id ? 'var(--primary-light)' : 'var(--background)',
                      boxShadow: selectedFormat === fmt.id ? '0 0 0 2px var(--primary)' : 'none',
                    }}
                  >
                    {fmt.popular && (
                      <span className="absolute top-2 right-2 badge badge-success text-[9px] px-1.5">Popular</span>
                    )}
                    <span className="text-2xl mb-2">{fmt.icon}</span>
                    <p className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: selectedFormat === fmt.id ? 'var(--primary)' : 'var(--foreground)' }}>
                      {fmt.label}
                    </p>
                    <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--muted-foreground)' }}>{fmt.ext}</p>
                    <p className="text-xs mt-1.5 leading-snug" style={{ color: 'var(--muted-foreground)' }}>{fmt.desc}</p>
                    {selectedFormat === fmt.id && (
                      <CheckCircle size={14} className="absolute top-2 right-2" style={{ color: 'var(--primary)' }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Export settings */}
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Export Settings</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Paper Size</label>
                  <select className="input" value={paperSize} onChange={e => setPaperSize(e.target.value)}>
                    {['A4', 'Letter', 'Legal', 'A3'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">Citation Style</label>
                  <select className="input">
                    {['APA 7th', 'Harvard', 'MLA 9th', 'Vancouver', 'Chicago'].map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Include Table of Contents', value: includeToC, set: setIncludeToC },
                  { label: 'Include References / Bibliography', value: includeRefs, set: setIncludeRefs },
                  { label: 'Include cover / title page', value: true, set: () => {} },
                  { label: 'Include page numbers', value: true, set: () => {} },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-sm">{item.label}</span>
                    <button
                      onClick={() => item.set((v: boolean) => !v)}
                      className="w-10 h-5.5 rounded-full relative transition-colors"
                      style={{ backgroundColor: item.value ? 'var(--primary)' : 'var(--border)', width: '44px', height: '24px' }}
                    >
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${item.value ? 'translate-x-5' : 'translate-x-1'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Other actions */}
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <h2 className="font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Other Actions</h2>
              <div className="grid grid-cols-3 gap-3">
                {actionOptions.map(a => (
                  <button key={a.id} className="flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all hover:border-[var(--primary)] hover:bg-[var(--primary-light)] group"
                    style={{ borderColor: 'var(--border)' }}>
                    <a.icon size={22} style={{ color: 'var(--primary)' }} />
                    <span className="text-sm font-semibold">{a.label}</span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{a.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Right: preview + export button */}
          <div className="space-y-5">
            {/* Export button */}
            <div className="rounded-2xl border p-5 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--primary-light)' }}>
                <span className="text-3xl">
                  {exportFormats.find(f => f.id === selectedFormat)?.icon ?? '📄'}
                </span>
              </div>
              <p className="font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {exportFormats.find(f => f.id === selectedFormat)?.label ?? 'Select format'}
              </p>
              <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>
                Est. file size: ~{selectedFormat === 'docx' ? '512' : selectedFormat === 'pdf' ? '284' : '128'} KB
              </p>

              {done ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle size={32} style={{ color: 'var(--primary)' }} />
                  <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Export successful!</p>
                  <button className="btn-primary w-full justify-center mt-1 text-sm">
                    <Download size={13} /> Download File
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleExport}
                  disabled={!selectedFormat || exporting}
                  className="btn-primary w-full justify-center py-3 disabled:opacity-60"
                >
                  {exporting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download size={15} /> Export Now
                    </>
                  )}
                </button>
              )}
            </div>

            {/* AI export tips */}
            <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'rgba(15,118,110,0.2)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={15} style={{ color: 'var(--primary)' }} />
                <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>Before you export</span>
              </div>
              <ul className="space-y-2 text-xs" style={{ color: 'var(--primary)' }}>
                <li>• Document review score: 88/100</li>
                <li>• 2 missing sections detected</li>
                <li>• 4 citations need page numbers</li>
              </ul>
              <button className="mt-3 text-xs font-semibold underline" style={{ color: 'var(--primary)' }}>Run review first →</button>
            </div>

            {/* Recent exports */}
            <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                <p className="text-sm font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Recent Exports</p>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {recentExports.map((e, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <span className="text-lg">📄</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">{e.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{e.format} · {e.size} · {e.date}</p>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-[var(--muted)]">
                      <Download size={13} style={{ color: 'var(--primary)' }} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
