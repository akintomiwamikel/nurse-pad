interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showText?: boolean
  white?: boolean
}

export default function Logo({ size = 'md', showText = true, white = false }: LogoProps) {
  const sizes = { sm: 28, md: 36, lg: 48 }
  const textSizes = { sm: 'text-base', md: 'text-xl', lg: 'text-3xl' }
  const s = sizes[size]

  return (
    <div className="flex items-center gap-2.5 select-none">
      <svg width={s} height={s} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Notebook base */}
        <rect x="6" y="5" width="26" height="32" rx="3" fill={white ? 'rgba(255,255,255,0.15)' : '#CCFBF1'} />
        <rect x="6" y="5" width="26" height="32" rx="3" stroke={white ? 'rgba(255,255,255,0.6)' : '#0F766E'} strokeWidth="1.5" />
        {/* Spine lines */}
        <rect x="6" y="5" width="4" height="32" rx="2" fill={white ? 'rgba(255,255,255,0.25)' : '#0F766E'} />
        {/* Binding dots */}
        <circle cx="8" cy="13" r="1.5" fill={white ? 'white' : '#14B8A6'} />
        <circle cx="8" cy="20" r="1.5" fill={white ? 'white' : '#14B8A6'} />
        <circle cx="8" cy="27" r="1.5" fill={white ? 'white' : '#14B8A6'} />
        {/* Nursing cross */}
        <rect x="17" y="13" width="6" height="14" rx="1.5" fill={white ? 'rgba(255,255,255,0.9)' : '#0F766E'} />
        <rect x="13" y="17" width="14" height="6" rx="1.5" fill={white ? 'rgba(255,255,255,0.9)' : '#0F766E'} />
        {/* AI sparkle top-right */}
        <circle cx="31" cy="9" r="4" fill={white ? 'rgba(255,255,255,0.2)' : '#F0FDFB'} />
        <path d="M31 6.5L31.8 8.2L33.5 9L31.8 9.8L31 11.5L30.2 9.8L28.5 9L30.2 8.2L31 6.5Z" fill={white ? 'white' : '#0F766E'} />
      </svg>
      {showText && (
        <span
          className={`${textSizes[size]} font-extrabold tracking-tight`}
          style={{
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            color: white ? 'white' : 'var(--primary)',
          }}
        >
          NURSE<span style={{ color: white ? 'rgba(255,255,255,0.7)' : 'var(--secondary)' }}>PAD</span>
        </span>
      )}
    </div>
  )
}
