import { useEffect, useState } from 'react'
import { FileText, Download, Printer, CheckCircle, Sparkles, AlertCircle, Loader2 } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { getLatestDraft, getLatestReview, listAssignments, listResearch } from '../lib/api'
import type { AssignmentReview, NursingAssignment } from '../lib/types'

const exportFormats = [
  { id: 'md', label: 'Markdown', ext: '.md', icon: '🗒', desc: 'Clean markdown for GitHub, Notion, or Obsidian', available: true },
  { id: 'html', label: 'HTML Page', ext: '.html', icon: '🌐', desc: 'Standalone web page with a real table of contents', available: true },
  { id: 'txt', label: 'Plain Text', ext: '.txt', icon: '📃', desc: 'Universal format compatible with anything', available: true },
  { id: 'docx', label: 'Microsoft Word', ext: '.docx', icon: '📄', desc: 'Not available yet — needs a document-generation library', available: false },
  { id: 'pdf', label: 'PDF Document', ext: '.pdf', icon: '📕', desc: 'Not available yet — needs a PDF-generation library', available: false },
  { id: 'epub', label: 'EPUB eBook', ext: '.epub', icon: '📚', desc: 'Not available yet', available: false },
]

// --- Real, dependency-free HTML conversion helpers ---

function parseHtml(html: string): HTMLDivElement {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

function htmlToPlainText(html: string): string {
  const div = parseHtml(html)
  return (div.textContent ?? '').replace(/\n{3,}/g, '\n\n').trim()
}

function htmlToMarkdown(html: string): string {
  const div = parseHtml(html)
  const walk = (node: ChildNode): string => {
    if (node.nodeType === Node.TEXT_NODE) return node.textContent ?? ''
    if (node.nodeType !== Node.ELEMENT_NODE) return ''
    const el = node as HTMLElement
    const inner = Array.from(el.childNodes).map(walk).join('')
    switch (el.tagName) {
      case 'H1': return `\n# ${inner}\n\n`
      case 'H2': return `\n## ${inner}\n\n`
      case 'H3': return `\n### ${inner}\n\n`
      case 'P': return `${inner}\n\n`
      case 'STRONG': case 'B': return `**${inner}**`
      case 'EM': case 'I': return `*${inner}*`
      case 'BR': return '\n'
      case 'LI': return `- ${inner}\n`
      case 'UL': case 'OL': return `\n${inner}\n`
      default: return inner
    }
  }
  return Array.from(div.childNodes).map(walk).join('').replace(/\n{3,}/g, '\n\n').trim()
}

function extractHeadings(html: string): { level: number; text: string }[] {
  const div = parseHtml(html)
  return Array.from(div.querySelectorAll('h1, h2, h3')).map(h => ({
    level: Number(h.tagName[1]),
    text: h.textContent ?? '',
  }))
}

function downloadFile(filename: string, content: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function ExportCenter() {
  const [assignments, setAssignments] = useState<NursingAssignment[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedFormat, setSelectedFormat] = useState('md')
  const [content, setContent] = useState<string | null>(null)
  const [wordCount, setWordCount] = useState(0)
  const [review, setReview] = useState<AssignmentReview | null>(null)
  const [citationCount, setCitationCount] = useState(0)
  const [includeToC, setIncludeToC] = useState(true)
  const [includeRefs, setIncludeRefs] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingDoc, setLoadingDoc] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    listAssignments()
      .then(list => {
        setAssignments(list)
        if (list.length > 0) setSelectedId(list[0].id)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load assignments'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedId) return
    setLoadingDoc(true)
    setError(null)
    Promise.all([
      getLatestDraft(selectedId),
      getLatestReview(selectedId),
      listResearch(selectedId),
    ])
      .then(([draft, rev, research]) => {
        setContent(draft?.content ?? null)
        setWordCount(draft?.word_count ?? 0)
        setReview(rev)
        setCitationCount(research.filter(r => r.source_citation).length)
      })
      .catch(err => setError(err instanceof Error ? err.message : 'Could not load this document'))
      .finally(() => setLoadingDoc(false))
  }, [selectedId])

  const selectedAssignment = assignments.find(a => a.id === selectedId)
  const format = exportFormats.find(f => f.id === selectedFormat)

  const buildExportText = (): { filename: string; text: string; mime: string } => {
    const title = selectedAssignment?.topic ?? 'Untitled'
    const safeName = title.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'document'
    const body = content ?? ''
    const headings = includeToC ? extractHeadings(body) : []

    if (selectedFormat === 'html') {
      const tocHtml = headings.length
        ? `<nav><h2>Table of Contents</h2><ul>${headings.map(h => `<li style="margin-left:${(h.level - 1) * 16}px">${h.text}</li>`).join('')}</ul></nav><hr/>`
        : ''
      const refsHtml = includeRefs && citationCount > 0
        ? `<hr/><p><em>${citationCount} reference${citationCount === 1 ? '' : 's'} logged for this assignment — see the References tab in the app for full citations.</em></p>`
        : ''
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>${title}</title></head><body><h1>${title}</h1>${tocHtml}${body}${refsHtml}</body></html>`
      return { filename: `${safeName}.html`, text: html, mime: 'text/html' }
    }

    if (selectedFormat === 'md') {
      const tocMd = headings.length
        ? `## Table of Contents\n\n${headings.map(h => `${'  '.repeat(h.level - 1)}- ${h.text}`).join('\n')}\n\n---\n\n`
        : ''
      const refsMd = includeRefs && citationCount > 0
        ? `\n\n---\n\n*${citationCount} reference${citationCount === 1 ? '' : 's'} logged for this assignment — see the References tab in the app for full citations.*`
        : ''
      return { filename: `${safeName}.md`, text: `# ${title}\n\n${tocMd}${htmlToMarkdown(body)}${refsMd}`, mime: 'text/markdown' }
    }

    // txt
    const tocTxt = headings.length ? `TABLE OF CONTENTS\n${headings.map(h => `${'  '.repeat(h.level - 1)}- ${h.text}`).join('\n')}\n\n${'—'.repeat(20)}\n\n` : ''
    const refsTxt = includeRefs && citationCount > 0 ? `\n\n${'—'.repeat(20)}\n${citationCount} reference(s) logged for this assignment.` : ''
    return { filename: `${safeName}.txt`, text: `${title.toUpperCase()}\n\n${tocTxt}${htmlToPlainText(body)}${refsTxt}`, mime: 'text/plain' }
  }

  const handleExport = () => {
    if (!content || !format?.available) return
    setExporting(true)
    setDone(false)
    setTimeout(() => {
      const { filename, text, mime } = buildExportText()
      downloadFile(filename, text, mime)
      setExporting(false)
      setDone(true)
      setTimeout(() => setDone(false), 4000)
    }, 400)
  }

  const handlePrint = () => {
    if (!content) return
    const win = window.open('', '_blank')
    if (!win) return
    win.document.write(`<!doctype html><html><head><title>${selectedAssignment?.topic ?? 'Document'}</title></head><body>${content}</body></html>`)
    win.document.close()
    win.focus()
    win.print()
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
        <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Export Center</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>Export your documents in a real, working format</p>

        {error && (
          <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
            <AlertCircle size={14} className="shrink-0" /> {error}
          </div>
        )}

        {assignments.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed" style={{ borderColor: 'var(--border)' }}>
            <FileText size={24} className="mx-auto mb-2" style={{ color: 'var(--muted-foreground)' }} />
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>No assignments yet — create one first.</p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {/* Document selector */}
              <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h2 className="font-bold mb-3" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Select Document</h2>
                <div className="relative">
                  <FileText size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                  <select className="input pl-9 py-2.5" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                    {assignments.map(a => <option key={a.id} value={a.id}>{a.topic}</option>)}
                  </select>
                </div>
                {loadingDoc ? (
                  <p className="mt-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>Loading...</p>
                ) : (
                  <div className="mt-3 text-xs flex gap-4 flex-wrap" style={{ color: 'var(--muted-foreground)' }}>
                    <span>{wordCount.toLocaleString()} words</span>
                    <span>{citationCount} reference{citationCount === 1 ? '' : 's'}</span>
                    {!content && <span style={{ color: '#F59E0B' }}>No draft written yet</span>}
                  </div>
                )}
              </div>

              {/* Format grid */}
              <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h2 className="font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Choose Format</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {exportFormats.map(fmt => (
                    <button
                      key={fmt.id}
                      onClick={() => fmt.available && setSelectedFormat(fmt.id)}
                      disabled={!fmt.available}
                      className="relative flex flex-col items-start p-4 rounded-xl border text-left transition-all hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
                      style={{
                        borderColor: selectedFormat === fmt.id ? 'var(--primary)' : 'var(--border)',
                        backgroundColor: selectedFormat === fmt.id ? 'var(--primary-light)' : 'var(--background)',
                        boxShadow: selectedFormat === fmt.id ? '0 0 0 2px var(--primary)' : 'none',
                      }}
                    >
                      {!fmt.available && <span className="absolute top-2 right-2 badge text-[9px] px-1.5" style={{ backgroundColor: 'var(--muted)', color: 'var(--muted-foreground)' }}>Coming soon</span>}
                      <span className="text-2xl mb-2">{fmt.icon}</span>
                      <p className="text-sm font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: selectedFormat === fmt.id ? 'var(--primary)' : 'var(--foreground)' }}>{fmt.label}</p>
                      <p className="text-[10px] mt-0.5 font-mono" style={{ color: 'var(--muted-foreground)' }}>{fmt.ext}</p>
                      <p className="text-xs mt-1.5 leading-snug" style={{ color: 'var(--muted-foreground)' }}>{fmt.desc}</p>
                      {selectedFormat === fmt.id && fmt.available && (
                        <CheckCircle size={14} className="absolute top-2 right-2" style={{ color: 'var(--primary)' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Export settings */}
              <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h2 className="font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Export Settings</h2>
                <div className="space-y-3">
                  {[
                    { label: 'Include Table of Contents (generated from headings)', value: includeToC, set: setIncludeToC },
                    { label: 'Note reference count at the end', value: includeRefs, set: setIncludeRefs },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-sm">{item.label}</span>
                      <button
                        onClick={() => item.set(v => !v)}
                        className="rounded-full relative transition-colors"
                        style={{ backgroundColor: item.value ? 'var(--primary)' : 'var(--border)', width: '44px', height: '24px' }}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${item.value ? 'translate-x-5' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Print */}
              <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <h2 className="font-bold mb-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Other Actions</h2>
                <button
                  onClick={handlePrint}
                  disabled={!content}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl border text-center transition-all hover:border-[var(--primary)] hover:bg-[var(--primary-light)] disabled:opacity-50 w-full sm:w-48"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <Printer size={22} style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-semibold">Print</span>
                  <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Opens your browser's print dialog</span>
                </button>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-5">
              <div className="rounded-2xl border p-5 text-center" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <span className="text-3xl">{format?.icon ?? '📄'}</span>
                </div>
                <p className="font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{format?.label}</p>
                <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>{wordCount.toLocaleString()} words</p>

                {done ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle size={32} style={{ color: 'var(--primary)' }} />
                    <p className="text-sm font-semibold" style={{ color: 'var(--primary)' }}>Downloaded</p>
                  </div>
                ) : (
                  <button
                    onClick={handleExport}
                    disabled={!content || exporting || !format?.available}
                    className="btn-primary w-full justify-center py-3 disabled:opacity-60"
                  >
                    {exporting ? (
                      <><div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Exporting...</>
                    ) : (
                      <><Download size={15} /> Export Now</>
                    )}
                  </button>
                )}
                {!content && <p className="text-xs mt-2" style={{ color: '#F59E0B' }}>Write a draft first in the Editor</p>}
              </div>

              {/* Real review status, not fabricated */}
              <div className="rounded-2xl border p-5" style={{ backgroundColor: 'var(--primary-light)', borderColor: 'rgba(15,118,110,0.2)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={15} style={{ color: 'var(--primary)' }} />
                  <span className="text-sm font-bold" style={{ color: 'var(--primary)' }}>Before you export</span>
                </div>
                {review ? (
                  <ul className="space-y-1.5 text-xs" style={{ color: 'var(--primary)' }}>
                    <li>• Review score: {review.score ?? '—'}/100</li>
                    {review.issues?.length > 0 && <li>• {review.issues.length} issue{review.issues.length === 1 ? '' : 's'} flagged in review</li>}
                  </ul>
                ) : (
                  <p className="text-xs" style={{ color: 'var(--primary)' }}>No review saved yet for this assignment.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
