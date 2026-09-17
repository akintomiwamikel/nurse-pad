import { useState, useRef, useEffect } from 'react'
import { Sparkles, Send, RefreshCw, Copy, ThumbsUp, ThumbsDown, Plus, ChevronDown } from 'lucide-react'
import AppLayout from '../components/AppLayout'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

const suggestions = [
  'Write nursing interventions for a patient with hyperglycemia',
  'Generate an APA citation for a WHO report',
  'Explain SBAR communication format with examples',
  'Create a care plan for post-operative appendectomy patient',
  'Summarize the nursing process in 5 steps',
  'What are the NANDA-I nursing diagnoses for heart failure?',
]

const initialMessages: Message[] = [
  {
    id: 1,
    role: 'assistant',
    content: "Hello! I'm your NURSE PAD AI Assistant, specialized in nursing documentation and academic writing.\n\nI can help you:\n• **Write and improve** nursing documents\n• **Generate** care plans, drug studies, and clinical reports\n• **Format citations** in APA, Harvard, Vancouver, and more\n• **Explain** clinical concepts and nursing diagnoses\n• **Review** your writing for academic quality\n\nWhat would you like to work on today?",
    timestamp: 'Just now',
  },
]

export default function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [context, setContext] = useState('General')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = (text?: string) => {
    const msg = text || input.trim()
    if (!msg) return

    const userMsg: Message = { id: Date.now(), role: 'user', content: msg, timestamp: 'Just now' }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    setTimeout(() => {
      const aiResponse = generateResponse(msg)
      setMessages(m => [...m, { id: Date.now() + 1, role: 'assistant', content: aiResponse, timestamp: 'Just now' }])
      setLoading(false)
    }, 1600)
  }

  const generateResponse = (prompt: string): string => {
    if (prompt.toLowerCase().includes('care plan') || prompt.toLowerCase().includes('hyperglycemia')) {
      return "Here are evidence-based **nursing interventions** for a patient with hyperglycemia:\n\n**1. Monitor Blood Glucose**\n- Check blood glucose every 4 hours per protocol\n- Report readings above 15 mmol/L to physician immediately\n- Document trends in patient care record\n\n**2. Administer Prescribed Medications**\n- Administer insulin per sliding scale or basal-bolus protocol\n- Verify correct dose, time, and route before administration\n- Monitor for signs of hypoglycemia post-administration\n\n**3. Dietary Management**\n- Collaborate with dietitian for meal planning\n- Encourage consistent carbohydrate intake\n- Monitor fluid intake — encourage 2–2.5 L/day unless contraindicated\n\n**4. Patient Education**\n- Educate on importance of medication adherence\n- Teach self-monitoring blood glucose technique\n- Explain signs of hypoglycemia (shaking, sweating, confusion)\n\n**Rationale:** These interventions align with the NANDA-I nursing diagnosis of *Ineffective health management related to knowledge deficit* and are grounded in ADA clinical standards (2024)."
    }
    if (prompt.toLowerCase().includes('sbar')) {
      return "**SBAR Communication Format**\n\nSBAR is a standardized communication tool used in clinical handoff and emergency situations:\n\n**S — Situation**\nState the current situation clearly and briefly.\n*Example: \"Mrs. Okafor in Bed 4 is experiencing acute shortness of breath.\"*\n\n**B — Background**\nProvide relevant clinical background.\n*Example: \"She is a 68-year-old female admitted for COPD exacerbation, currently on 2L O₂ via nasal cannula.\"*\n\n**A — Assessment**\nShare your clinical assessment.\n*Example: \"Her SpO₂ has dropped from 94% to 88% in the last 30 minutes. Lung sounds show increased wheeze bilaterally.\"*\n\n**R — Recommendation**\nState what action you need.\n*Example: \"I recommend increasing oxygen to 4L and requesting respiratory therapy review. Would you like to come and assess the patient?\"*\n\n---\n*SBAR is endorsed by WHO, The Joint Commission, and ISBAR guidelines.*"
    }
    return "I've analyzed your request. Here's a detailed, evidence-based response tailored for nursing documentation:\n\nBased on current nursing standards and clinical guidelines, the information you need has been structured according to the **nursing process framework** (Assessment → Diagnosis → Planning → Implementation → Evaluation).\n\nWould you like me to:\n- **Expand** this into a full document section?\n- **Add citations** in your preferred format?\n- **Adjust the academic tone** for your submission level?\n- **Generate a full document** on this topic?"
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-56px)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b shrink-0" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--card)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'var(--primary)' }}>
              <Sparkles size={18} className="text-white" />
            </div>
            <div>
              <h1 className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>AI Assistant</h1>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Specialized for nursing documentation</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <select className="input text-sm py-1.5 pr-8 appearance-none" value={context} onChange={e => setContext(e.target.value)}
                style={{ width: 'auto' }}>
                {['General', 'Care Plan', 'Drug Study', 'Research', 'Clinical Report', 'Assignment'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <button onClick={() => setMessages(initialMessages)} className="btn-ghost text-xs flex items-center gap-1.5 py-1.5">
              <RefreshCw size={13} /> New Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {messages.map(msg => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${msg.role === 'assistant' ? '' : ''}`}
                style={{ backgroundColor: msg.role === 'assistant' ? 'var(--primary)' : 'var(--muted)' }}>
                {msg.role === 'assistant' ? (
                  <Sparkles size={14} className="text-white" />
                ) : (
                  <span className="text-xs font-bold">AO</span>
                )}
              </div>

              {/* Bubble */}
              <div className={`max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line"
                  style={{
                    backgroundColor: msg.role === 'user' ? 'var(--primary)' : 'var(--card)',
                    color: msg.role === 'user' ? 'white' : 'var(--foreground)',
                    border: msg.role === 'assistant' ? '1px solid var(--border)' : 'none',
                    borderRadius: msg.role === 'user' ? '1rem 1rem 0.25rem 1rem' : '1rem 1rem 1rem 0.25rem',
                  }}
                  dangerouslySetInnerHTML={{
                    __html: msg.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\*(.*?)\*/g, '<em>$1</em>')
                      .replace(/\n/g, '<br/>'),
                  }}
                />
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1 ml-1">
                    <button className="p-1 rounded-lg hover:bg-[var(--muted)] transition-colors"><Copy size={11} style={{ color: 'var(--muted-foreground)' }} /></button>
                    <button className="p-1 rounded-lg hover:bg-[var(--muted)] transition-colors"><ThumbsUp size={11} style={{ color: 'var(--muted-foreground)' }} /></button>
                    <button className="p-1 rounded-lg hover:bg-[var(--muted)] transition-colors"><ThumbsDown size={11} style={{ color: 'var(--muted-foreground)' }} /></button>
                    <span className="text-[10px] ml-1" style={{ color: 'var(--muted-foreground)' }}>{msg.timestamp}</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Loading */}
          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: 'var(--primary)' }}>
                <Sparkles size={14} className="text-white" />
              </div>
              <div className="px-4 py-3.5 rounded-2xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', borderRadius: '1rem 1rem 1rem 0.25rem' }}>
                <div className="flex gap-1.5 items-center">
                  {[0, 1, 2].map(i => (
                    <span key={i} className="w-2 h-2 rounded-full" style={{ backgroundColor: 'var(--primary)', animation: `typing-dot 1.2s ${i * 0.2}s ease-in-out infinite` }} />
                  ))}
                  <span className="text-xs ml-1" style={{ color: 'var(--muted-foreground)' }}>AI is thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div className="px-6 pb-3">
            <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)' }}>SUGGESTIONS</p>
            <div className="flex gap-2 flex-wrap">
              {suggestions.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="px-3 py-1.5 rounded-full border text-xs font-medium transition-all hover:border-[var(--primary)] hover:text-[var(--primary)] hover:bg-[var(--primary-light)]"
                  style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="px-6 pb-6 pt-3 border-t shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative">
              <textarea
                rows={1}
                className="input resize-none pr-12 py-3"
                placeholder="Ask AI about nursing documentation, citations, clinical concepts..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
                }}
                style={{ maxHeight: '120px', overflowY: 'auto' }}
              />
              <span className="absolute right-3 bottom-3 text-[10px] font-mono" style={{ color: 'var(--muted-foreground)' }}>⏎</span>
            </div>
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all disabled:opacity-40"
              style={{ backgroundColor: 'var(--primary)', color: 'white' }}
            >
              <Send size={16} />
            </button>
          </div>
          <p className="text-[10px] text-center mt-2" style={{ color: 'var(--muted-foreground)' }}>
            AI responses should always be reviewed. Not a substitute for clinical judgment.
          </p>
        </div>
      </div>
    </AppLayout>
  )
}
