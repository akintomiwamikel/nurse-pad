import { useState } from 'react'
import { Search, BookOpen, Filter, Download, Bookmark, ExternalLink, Star } from 'lucide-react'
import AppLayout from '../components/AppLayout'

const categories = [
  { label: 'All', count: 1240 },
  { label: 'Medical Books', count: 234 },
  { label: 'Nursing Books', count: 189 },
  { label: 'Research Papers', count: 445 },
  { label: 'Clinical Guidelines', count: 98 },
  { label: 'Drug Manuals', count: 76 },
  { label: 'Care Plans', count: 54 },
  { label: 'WHO Resources', count: 67 },
  { label: 'CDC Resources', count: 43 },
  { label: 'NNC Resources', count: 34 },
]

const resources = [
  {
    title: 'Fundamentals of Nursing: Clinical Judgment and Client Care',
    author: 'LaFleur Brooks & Gillingham',
    type: 'Nursing Book',
    year: 2023,
    rating: 4.8,
    downloads: 12400,
    bookmarked: true,
    desc: 'Comprehensive nursing fundamentals covering clinical judgment, patient care, and evidence-based practice.',
    icon: '📘',
  },
  {
    title: 'Nursing Diagnoses: Definitions & Classification 2021-2023',
    author: 'NANDA International',
    type: 'Reference',
    year: 2021,
    rating: 4.9,
    downloads: 34200,
    bookmarked: true,
    desc: 'The official NANDA-I nursing diagnosis reference with updated diagnoses, defining characteristics, and interventions.',
    icon: '📗',
  },
  {
    title: 'Global Status Report on Noncommunicable Diseases 2024',
    author: 'World Health Organization',
    type: 'WHO Resource',
    year: 2024,
    rating: 4.7,
    downloads: 8900,
    bookmarked: false,
    desc: 'WHO report covering prevalence, risk factors, and interventions for NCDs including diabetes, hypertension, and cancer.',
    icon: '🌐',
  },
  {
    title: 'Pharmacology: Connections to Nursing Practice',
    author: 'Adams & Koch',
    type: 'Drug Manual',
    year: 2022,
    rating: 4.6,
    downloads: 21300,
    bookmarked: false,
    desc: 'Drug pharmacology text with nursing implications, patient teaching points, and clinical applications.',
    icon: '💊',
  },
  {
    title: 'Evidence-Based Nursing: A Guide to Clinical Practice',
    author: 'DiCenso, Guyatt & Ciliska',
    type: 'Research',
    year: 2022,
    rating: 4.7,
    downloads: 15600,
    bookmarked: false,
    desc: 'Comprehensive guide to applying evidence-based practice principles in clinical nursing settings.',
    icon: '🔬',
  },
  {
    title: 'Wound Care: A Collaborative Practice Manual for Health Professionals',
    author: 'Sussman & Bates-Jensen',
    type: 'Clinical Guidelines',
    year: 2023,
    rating: 4.5,
    downloads: 9800,
    bookmarked: false,
    desc: 'Evidence-based wound assessment, management protocols, and preventive strategies for healthcare teams.',
    icon: '🩹',
  },
]

export default function ResearchLibrary() {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')

  const filtered = resources.filter(r =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.author.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <AppLayout>
      <div className="p-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Research Library</h1>
          <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Access 1,240+ nursing textbooks, guidelines, and research papers</p>
        </div>

        {/* Search */}
        <div className="relative max-w-2xl mb-6">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
          <input
            className="input pl-11 py-3 text-base w-full"
            placeholder="Search titles, authors, topics..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-6">
          {/* Category sidebar */}
          <div className="w-48 shrink-0">
            <p className="text-xs font-bold mb-3" style={{ color: 'var(--muted-foreground)' }}>CATEGORIES</p>
            <div className="space-y-0.5">
              {categories.map(c => (
                <button
                  key={c.label}
                  onClick={() => setActiveCategory(c.label)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all"
                  style={{
                    backgroundColor: activeCategory === c.label ? 'var(--primary-light)' : 'transparent',
                    color: activeCategory === c.label ? 'var(--primary)' : 'var(--foreground)',
                  }}
                >
                  <span className="font-medium">{c.label}</span>
                  <span className="text-xs" style={{ color: activeCategory === c.label ? 'var(--primary)' : 'var(--muted-foreground)' }}>{c.count}</span>
                </button>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t" style={{ borderColor: 'var(--border)' }}>
              <p className="text-xs font-bold mb-3" style={{ color: 'var(--muted-foreground)' }}>MY LIBRARY</p>
              {['Bookmarks', 'Downloads', 'Recent Reads'].map(item => (
                <button key={item} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[var(--muted)] transition-all text-left">
                  {item === 'Bookmarks' ? <Bookmark size={13} /> : item === 'Downloads' ? <Download size={13} /> : <BookOpen size={13} />}
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Resource list */}
          <div className="flex-1 space-y-4">
            {filtered.map((resource, i) => (
              <div
                key={i}
                className="card-hover rounded-2xl border p-5"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              >
                <div className="flex gap-4">
                  <span className="text-4xl mt-1">{resource.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-base leading-snug mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{resource.title}</h3>
                        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{resource.author} · {resource.year}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <button className="p-1.5 rounded-lg hover:bg-[var(--muted)] transition-colors">
                          <Bookmark size={15} fill={resource.bookmarked ? 'var(--primary)' : 'none'} style={{ color: 'var(--primary)' }} />
                        </button>
                      </div>
                    </div>
                    <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--muted-foreground)' }}>{resource.desc}</p>
                    <div className="flex items-center gap-4 mt-3">
                      <span className="badge badge-primary text-[10px]">{resource.type}</span>
                      <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        <Star size={11} fill="#F59E0B" style={{ color: '#F59E0B' }} />
                        <span>{resource.rating}</span>
                      </div>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{resource.downloads.toLocaleString()} downloads</span>
                      <div className="flex items-center gap-2 ml-auto">
                        <button className="flex items-center gap-1.5 text-xs font-medium btn-ghost py-1">
                          <ExternalLink size={12} /> Open
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-medium btn-ghost py-1">
                          <Download size={12} /> Download
                        </button>
                        <button className="flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--primary)' }}>
                          Cite this
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}
