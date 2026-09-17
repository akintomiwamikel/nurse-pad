import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Shield, CheckCircle, ArrowRight, AlertCircle } from 'lucide-react'
import Logo from '../components/Logo'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { Sun, Moon } from 'lucide-react'

type AuthMode = 'login' | 'signup' | 'forgot' | 'reset' | 'verify' | '2fa'

export default function Auth() {
  const [params] = useSearchParams()
  const [mode, setMode] = useState<AuthMode>((params.get('mode') as AuthMode) || 'login')
  const [showPass, setShowPass] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Form fields
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')

  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const { signIn, signUp, sendPasswordReset, updatePassword, resendConfirmation, signInWithProvider, user } = useAuth()
  const [resendState, setResendState] = useState<'idle' | 'sending' | 'sent'>('idle')

  const handleOAuth = async (provider: 'google' | 'azure' | 'apple') => {
    setErrorMsg(null)
    const { error } = await signInWithProvider(provider)
    // On success this navigates away to the provider's login page immediately,
    // so an error here means the redirect itself failed (e.g. provider not enabled).
    if (error) setErrorMsg(error)
  }

  // If a confirmation link (or an already-active session) lands us here, move on automatically.
  // Skip during password recovery — Supabase also creates a session for that link, and we want
  // the person to see the "set a new password" screen instead of being redirected away from it.
  useEffect(() => {
    if (user && mode !== 'reset') {
      navigate('/dashboard')
    }
  }, [user, mode, navigate])

  const handleResend = async () => {
    setResendState('sending')
    setErrorMsg(null)
    const { error } = await resendConfirmation(email)
    if (error) { setErrorMsg(error); setResendState('idle'); return }
    setResendState('sent')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    setLoading(true)
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password)
        if (error) { setErrorMsg(error); return }
        navigate('/dashboard')
      } else if (mode === 'signup') {
        if (password !== confirmPassword) { setErrorMsg('Passwords do not match'); return }
        const { error } = await signUp(email, password, {
          full_name: `${firstName} ${lastName}`.trim(),
        })
        if (error) { setErrorMsg(error); return }
        setMode('verify')
      } else if (mode === 'forgot') {
        const { error } = await sendPasswordReset(email)
        if (error) { setErrorMsg(error); return }
        setMode('reset')
      } else if (mode === 'reset') {
        if (password !== confirmPassword) { setErrorMsg('Passwords do not match'); return }
        const { error } = await updatePassword(password)
        if (error) { setErrorMsg(error); return }
        setMode('login')
      } else if (mode === '2fa') {
        navigate('/dashboard')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleOtp = (i: number, val: string) => {
    if (!/^\d?$/.test(val)) return
    const next = [...otpValues]
    next[i] = val
    setOtpValues(next)
    if (val && i < 5) {
      const el = document.getElementById(`otp-${i + 1}`)
      el?.focus()
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--background)' }}>
      {/* Left branding panel */}
      <div
        className="hidden lg:flex lg:w-[45%] xl:w-1/2 flex-col relative overflow-hidden"
        style={{ background: 'linear-gradient(145deg, #0A4F4A 0%, #0F766E 40%, #14B8A6 80%, #10B981 100%)' }}
      >
        {/* Decorative circles */}
        <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full" style={{ background: 'rgba(255,255,255,0.06)' }} />
        <div className="absolute bottom-16 -left-16 w-64 h-64 rounded-full" style={{ background: 'rgba(255,255,255,0.05)' }} />
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />

        <div className="relative z-10 flex flex-col h-full p-12">
          <Logo size="md" white />

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-white">
              <h2 className="text-4xl xl:text-5xl font-extrabold mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                The smartest way to write nursing documents
              </h2>
              <p className="text-white/70 text-lg mb-10 leading-relaxed">
                Join 12,000+ nursing students and professionals who write better, faster, and more confidently.
              </p>

              <div className="space-y-4">
                {[
                  'AI-guided document creation in minutes',
                  'All nursing document types covered',
                  'Auto-citations in APA, Harvard & more',
                  'Academic quality scoring & review',
                ].map(f => (
                  <div key={f} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-white/80 shrink-0" />
                    <span className="text-white/90 text-sm font-medium">{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonial */}
          <div className="relative z-10 rounded-2xl p-5" style={{ backgroundColor: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}>
            <p className="text-white/90 text-sm italic leading-relaxed mb-3">
              "NURSE PAD saved me weeks of work. My final year project has never looked more professional."
            </p>
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=36&h=36&fit=crop&auto=format"
                alt="Student"
                className="w-8 h-8 rounded-full"
              />
              <div>
                <p className="text-white text-xs font-semibold">Ngozi Adeyemi</p>
                <p className="text-white/60 text-xs">Nursing Student, UNTH</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4">
          <div className="lg:hidden">
            <Logo size="sm" />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={toggleTheme} className="btn-ghost p-2">
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            {mode === 'login' ? (
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                No account?{' '}
                <button onClick={() => setMode('signup')} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                  Sign up
                </button>
              </span>
            ) : (
              <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                Have an account?{' '}
                <button onClick={() => setMode('login')} className="font-semibold hover:underline" style={{ color: 'var(--primary)' }}>
                  Sign in
                </button>
              </span>
            )}
          </div>
        </div>

        {/* Form area */}
        <div className="flex-1 flex items-center justify-center px-6 py-8">
          <div className="w-full max-w-md">

            {/* Back button for sub-modes */}
            {['forgot', 'reset', 'verify', '2fa'].includes(mode) && (
              <button
                onClick={() => setMode('login')}
                className="flex items-center gap-1.5 text-sm mb-6 hover:underline"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <ArrowLeft size={14} /> Back to sign in
              </button>
            )}

            {/* ===== LOGIN ===== */}
            {mode === 'login' && (
              <>
                <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Welcome back</h1>
                <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>Sign in to your NURSE PAD workspace</p>

                {/* Social logins */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Google', initial: 'G', provider: 'google' as const },
                    { label: 'Microsoft', initial: 'M', provider: 'azure' as const },
                    { label: 'Apple', initial: '🍎', provider: 'apple' as const },
                  ].map(({ label, initial, provider }) => (
                    <button
                      key={label}
                      onClick={() => handleOAuth(provider)}
                      className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-[var(--muted)]"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}
                    >
                      <span className="text-base font-bold">{initial}</span>
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>or continue with email</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
                    <AlertCircle size={14} className="shrink-0" /> {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                      <input type="email" className="input pl-9" placeholder="you@university.edu" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1.5">
                      <label className="text-sm font-medium">Password</label>
                      <button type="button" onClick={() => setMode('forgot')} className="text-xs font-medium hover:underline" style={{ color: 'var(--primary)' }}>
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                      <input type={showPass ? 'text' : 'password'} className="input pl-9 pr-10" placeholder="••••••••" required value={password} onChange={e => setPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input type="checkbox" id="remember" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} className="w-4 h-4 rounded accent-teal-600" />
                    <label htmlFor="remember" className="text-sm" style={{ color: 'var(--muted-foreground)' }}>Remember me for 30 days</label>
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'} {!loading && <ArrowRight size={16} />}
                  </button>
                </form>

                <p className="text-center text-xs mt-4" style={{ color: 'var(--muted-foreground)' }}>
                  Protected by 256-bit SSL encryption
                </p>
              </>
            )}

            {/* ===== SIGNUP ===== */}
            {mode === 'signup' && (
              <>
                <h1 className="text-3xl font-extrabold mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Create your account</h1>
                <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>Start writing smarter nursing documents today</p>

                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    { label: 'Google', initial: 'G' },
                    { label: 'Microsoft', initial: 'M' },
                    { label: 'Apple', initial: '🍎' },
                  ].map(({ label, initial }) => (
                    <button key={label} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:bg-[var(--muted)]"
                      style={{ borderColor: 'var(--border)', color: 'var(--foreground)' }}>
                      <span className="text-base font-bold">{initial}</span>
                      <span className="hidden sm:inline">{label}</span>
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                  <span className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>or with email</span>
                  <div className="flex-1 h-px" style={{ backgroundColor: 'var(--border)' }} />
                </div>

                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
                    <AlertCircle size={14} className="shrink-0" /> {errorMsg}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-1.5">First name</label>
                      <div className="relative">
                        <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                        <input className="input pl-9" placeholder="Amara" required value={firstName} onChange={e => setFirstName(e.target.value)} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1.5">Last name</label>
                      <input className="input" placeholder="Okonkwo" required value={lastName} onChange={e => setLastName(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                      <input type="email" className="input pl-9" placeholder="you@university.edu" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                      <input type={showPass ? 'text' : 'password'} className="input pl-9 pr-10" placeholder="Min. 8 characters" required value={password} onChange={e => setPassword(e.target.value)} minLength={8} />
                      <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                      <input type={showConfirm ? 'text' : 'password'} className="input pl-9 pr-10" placeholder="Repeat password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <input type="checkbox" id="terms" checked={acceptTerms} onChange={e => setAcceptTerms(e.target.checked)} className="w-4 h-4 mt-0.5 rounded accent-teal-600" required />
                    <label htmlFor="terms" className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
                      I agree to the{' '}
                      <a href="#" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>Terms of Service</a>
                      {' '}and{' '}
                      <a href="#" className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>Privacy Policy</a>
                    </label>
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading || !acceptTerms}>
                    {loading ? 'Creating account...' : 'Create Account'} {!loading && <ArrowRight size={16} />}
                  </button>
                </form>
              </>
            )}

            {/* ===== FORGOT PASSWORD ===== */}
            {mode === 'forgot' && (
              <>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <Mail size={22} style={{ color: 'var(--primary)' }} />
                </div>
                <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Reset your password</h1>
                <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
                  Enter your email and we'll send you a reset link.
                </p>
                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
                    <AlertCircle size={14} className="shrink-0" /> {errorMsg}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Email address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                      <input type="email" className="input pl-9" placeholder="you@university.edu" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                    {loading ? 'Sending...' : 'Send Reset Link'} {!loading && <ArrowRight size={16} />}
                  </button>
                </form>
              </>
            )}

            {/* ===== RESET PASSWORD ===== */}
            {mode === 'reset' && (
              <>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <Lock size={22} style={{ color: 'var(--primary)' }} />
                </div>
                <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Set new password</h1>
                <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>Choose a strong password for your account.</p>
                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
                    <AlertCircle size={14} className="shrink-0" /> {errorMsg}
                  </div>
                )}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1.5">New password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                      <input type={showPass ? 'text' : 'password'} className="input pl-9 pr-10" placeholder="Min. 8 characters" required value={password} onChange={e => setPassword(e.target.value)} minLength={8} />
                      <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                        {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1.5">Confirm password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                      <input type={showConfirm ? 'text' : 'password'} className="input pl-9 pr-10" placeholder="Repeat password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                      <button type="button" onClick={() => setShowConfirm(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }}>
                        {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Password'} {!loading && <ArrowRight size={16} />}
                  </button>
                </form>
              </>
            )}

            {/* ===== EMAIL VERIFICATION ===== */}
            {mode === 'verify' && (
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <Mail size={28} style={{ color: 'var(--primary)' }} />
                </div>
                <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Check your email</h1>
                <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
                  We sent a confirmation link to
                </p>
                <p className="font-semibold mb-8">{email}</p>
                <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
                  Click the link in that email to activate your account — this page will continue automatically
                  once it's confirmed.
                </p>
                {errorMsg && (
                  <div className="flex items-center gap-2 p-3 rounded-xl mb-4 text-xs text-left" style={{ backgroundColor: '#FEE2E2', color: '#B91C1C' }}>
                    <AlertCircle size={14} className="shrink-0" /> {errorMsg}
                  </div>
                )}
                <button
                  onClick={handleResend}
                  className="btn-secondary w-full justify-center py-3"
                  disabled={resendState === 'sending'}
                >
                  {resendState === 'sending' ? 'Sending...' : resendState === 'sent' ? 'Email sent again ✓' : 'Resend email'}
                </button>
                <button onClick={() => setMode('login')} className="btn-ghost w-full justify-center mt-3 text-sm">
                  Back to sign in
                </button>
              </div>
            )}

            {/* ===== 2FA ===== */}
            {mode === '2fa' && (
              <>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5" style={{ backgroundColor: 'var(--primary-light)' }}>
                  <Shield size={22} style={{ color: 'var(--primary)' }} />
                </div>
                <h1 className="text-3xl font-extrabold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Two-factor authentication</h1>
                <p className="text-sm mb-8" style={{ color: 'var(--muted-foreground)' }}>
                  Enter the 6-digit code from your authenticator app.
                </p>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex gap-2 justify-center">
                    {otpValues.map((v, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={v}
                        onChange={e => handleOtp(i, e.target.value)}
                        className="w-11 h-14 text-center text-xl font-bold border rounded-xl outline-none transition-all"
                        style={{
                          borderColor: v ? 'var(--primary)' : 'var(--border)',
                          backgroundColor: 'var(--background)',
                          color: 'var(--foreground)',
                        }}
                      />
                    ))}
                  </div>
                  <button type="submit" className="btn-primary w-full justify-center py-3" disabled={loading}>
                    {loading ? 'Verifying...' : 'Verify'} {!loading && <ArrowRight size={16} />}
                  </button>
                </form>
                <p className="text-center text-sm mt-4" style={{ color: 'var(--muted-foreground)' }}>
                  Lost your device?{' '}
                  <button className="font-medium hover:underline" style={{ color: 'var(--primary)' }}>Use recovery code</button>
                </p>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
