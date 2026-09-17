import { useEffect, useState } from 'react'
import { CheckCircle, CreditCard, Zap, ArrowRight, Download, X } from 'lucide-react'
import AppLayout from '../components/AppLayout'
import { getCreditBalance } from '../lib/api'
import type { AiCreditBalance } from '../lib/types'

const plans = [
  {
    name: 'Free',
    price: { monthly: 0, yearly: 0 },
    features: ['5 documents/month', '10 AI credits', 'Basic templates', 'APA citations', 'PDF export'],
    highlight: false,
    current: false,
  },
  {
    name: 'Student Pro',
    price: { monthly: 9.99, yearly: 7.99 },
    features: ['Unlimited documents', '200 AI credits/month', 'All document types', 'All citation styles', 'Word & PDF export', 'Research library'],
    highlight: false,
    current: false, // was falsely marked "current" — no real subscription exists yet
  },
  {
    name: 'Premium',
    price: { monthly: 19.99, yearly: 15.99 },
    features: ['Everything in Student Pro', '500 AI credits/month', 'Team collaboration', 'AI History', 'Cloud backup', 'API access'],
    highlight: true,
    current: false,
  },
  {
    name: 'Institution',
    price: { monthly: 49.99, yearly: 39.99 },
    features: ['Everything in Premium', 'Unlimited AI credits', 'Up to 50 users', 'Admin dashboard', 'Custom templates', 'SSO'],
    highlight: false,
    current: false,
  },
]

const invoices = [
  { id: 'INV-2025-012', date: 'Dec 1, 2025', plan: 'Student Pro', amount: '$9.99', status: 'Paid' },
  { id: 'INV-2025-011', date: 'Nov 1, 2025', plan: 'Student Pro', amount: '$9.99', status: 'Paid' },
  { id: 'INV-2025-010', date: 'Oct 1, 2025', plan: 'Student Pro', amount: '$9.99', status: 'Paid' },
]

const paymentMethods = [
  { type: 'Visa', last4: '4242', expiry: '12/27', isDefault: true },
]

export default function Billing() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')
  const [payModalOpen, setPayModalOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')
  const [creditBalance, setCreditBalance] = useState<AiCreditBalance | null>(null)

  useEffect(() => {
    getCreditBalance().then(setCreditBalance).catch(() => setCreditBalance(null))
  }, [])

  const totalCredits = creditBalance
    ? creditBalance.included_credits_remaining + creditBalance.topup_credits_remaining
    : 0

  return (
    <AppLayout>
      <div className="p-6 max-w-5xl">
        <h1 className="text-2xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Billing & Subscription</h1>
        <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>Manage your plan, payment methods, and invoices</p>

        {/* Current plan banner */}
        <div className="rounded-2xl p-5 mb-8 flex items-center justify-between gap-4"
          style={{ background: 'linear-gradient(135deg, var(--primary) 0%, #14B8A6 100%)' }}>
          <div className="text-white">
            <p className="text-xs font-medium opacity-80 mb-1">Plan Status</p>
            <p className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>No active subscription</p>
            <p className="text-sm opacity-80 mt-1">You're on trial AI credits — choose a plan below to subscribe</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-1.5 text-white text-sm">
              <Zap size={14} />
              <span>{totalCredits} AI credit{totalCredits === 1 ? '' : 's'} remaining</span>
            </div>
            {creditBalance && (
              <p className="text-xs text-white/70">
                {creditBalance.included_credits_remaining} included · {creditBalance.topup_credits_remaining} top-up
              </p>
            )}
          </div>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Available Plans</h2>
          <div className="inline-flex items-center gap-1 p-1 rounded-xl border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
            {(['monthly', 'yearly'] as const).map(b => (
              <button key={b} onClick={() => setBilling(b)} className="px-3 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all"
                style={{ backgroundColor: billing === b ? 'var(--primary)' : 'transparent', color: billing === b ? 'white' : 'var(--foreground)' }}>
                {b} {b === 'yearly' && <span className="text-[10px] opacity-80">−20%</span>}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {plans.map(plan => (
            <div key={plan.name} className={`relative rounded-2xl border p-5 flex flex-col ${plan.highlight ? 'ring-2 ring-[var(--primary)]' : ''}`}
              style={{ backgroundColor: plan.current ? 'var(--primary-light)' : 'var(--card)', borderColor: plan.highlight ? 'var(--primary)' : 'var(--border)' }}>
              {plan.highlight && (
                <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                  <span className="badge badge-accent text-[10px] px-2">Popular</span>
                </div>
              )}
              {plan.current && (
                <div className="absolute -top-2.5 right-3">
                  <span className="badge badge-success text-[10px] px-2">Your Plan</span>
                </div>
              )}
              <h3 className="font-bold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{plan.name}</h3>
              <div className="mb-4">
                <span className="text-3xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--primary)' }}>
                  {plan.price[billing] === 0 ? 'Free' : `$${plan.price[billing]}`}
                </span>
                {plan.price[billing] > 0 && <span className="text-xs ml-1" style={{ color: 'var(--muted-foreground)' }}>/mo</span>}
              </div>
              <ul className="space-y-2 mb-5 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-xs">
                    <CheckCircle size={13} className="mt-0.5 shrink-0" style={{ color: 'var(--primary)' }} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => { setSelectedPlan(plan.name); setPayModalOpen(true) }}
                disabled={plan.current}
                className={`py-2 px-4 rounded-xl text-sm font-semibold transition-all ${plan.current ? 'opacity-50 cursor-not-allowed' : ''}`}
                style={{
                  backgroundColor: plan.current ? 'var(--muted)' : 'var(--primary)',
                  color: plan.current ? 'var(--muted-foreground)' : 'white',
                }}
              >
                {plan.current ? 'Current Plan' : plan.name === 'Institution' ? 'Contact Sales' : `Upgrade to ${plan.name}`}
              </button>
            </div>
          ))}
        </div>

        {/* Payment Methods */}
        <div className="rounded-2xl border p-5 mb-6" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Payment Methods</h2>
            <button className="btn-secondary text-sm py-1.5">+ Add Payment Method</button>
          </div>
          {paymentMethods.map(pm => (
            <div key={pm.last4} className="flex items-center justify-between p-4 rounded-xl border" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: '#1A1F71' }}>VISA</div>
                <div>
                  <p className="text-sm font-medium">•••• {pm.last4}</p>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Expires {pm.expiry}</p>
                </div>
              </div>
              {pm.isDefault && <span className="badge badge-success text-[10px]">Default</span>}
            </div>
          ))}
          <div className="mt-3 p-3 rounded-xl border-dashed border-2 text-center text-sm" style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)' }}>
            Also supports: Paystack, Flutterwave, Apple Pay, Google Pay, Bank Transfer
          </div>
        </div>

        {/* Billing History */}
        <div className="rounded-2xl border overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h2 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Billing History</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                {['Invoice', 'Date', 'Plan', 'Amount', 'Status', ''].map(h => (
                  <th key={h} className="px-5 py-3 text-left text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
              {invoices.map(inv => (
                <tr key={inv.id}>
                  <td className="px-5 py-3.5 text-sm font-mono">{inv.id}</td>
                  <td className="px-5 py-3.5 text-sm" style={{ color: 'var(--muted-foreground)' }}>{inv.date}</td>
                  <td className="px-5 py-3.5 text-sm">{inv.plan}</td>
                  <td className="px-5 py-3.5 text-sm font-semibold">{inv.amount}</td>
                  <td className="px-5 py-3.5"><span className="badge badge-success text-[10px]">{inv.status}</span></td>
                  <td className="px-5 py-3.5">
                    <button className="flex items-center gap-1 text-xs hover:underline" style={{ color: 'var(--primary)' }}>
                      <Download size={12} /> PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment modal */}
      {payModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPayModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border shadow-2xl overflow-hidden" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-5 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-lg font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Upgrade to {selectedPlan}</h2>
              <button onClick={() => setPayModalOpen(false)} className="btn-ghost p-1"><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="rounded-xl p-4 border" style={{ backgroundColor: 'var(--muted)', borderColor: 'var(--border)' }}>
                <p className="text-sm font-semibold mb-1">{selectedPlan} Plan</p>
                <p className="text-2xl font-extrabold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: 'var(--primary)' }}>
                  {selectedPlan === 'Premium' ? '$19.99' : selectedPlan === 'Institution' ? '$49.99' : '$9.99'}
                  <span className="text-sm font-normal ml-1" style={{ color: 'var(--muted-foreground)' }}>/month</span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Card Number</label>
                <div className="relative">
                  <CreditCard size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                  <input className="input pl-9" placeholder="1234 5678 9012 3456" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1.5">Expiry</label>
                  <input className="input" placeholder="MM/YY" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1.5">CVV</label>
                  <input className="input" placeholder="•••" />
                </div>
              </div>

              <div className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                Or pay with: Paystack · Flutterwave · Apple Pay · Google Pay
              </div>

              <button onClick={() => setPayModalOpen(false)} className="btn-primary w-full justify-center py-3">
                Pay Now <ArrowRight size={15} />
              </button>

              <p className="text-xs text-center" style={{ color: 'var(--muted-foreground)' }}>
                Secured by 256-bit SSL encryption. Cancel anytime.
              </p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
