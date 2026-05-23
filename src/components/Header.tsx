import { Sparkles, RotateCcw } from 'lucide-react'
import { useBusiness, useCrystariumStore, useRealtimeStatus } from '../store'

function formatMoney(n: number): string {
  return `$${n.toLocaleString()}`
}

export function Header() {
  const business = useBusiness()
  const resetToSeed = useCrystariumStore((s) => s.resetToSeed)

  const handleReset = () => {
    if (window.confirm('Reset the Crystarium to its seed state? (Clones, chat, and automations will clear.)')) {
      resetToSeed()
      try {
        localStorage.removeItem('crystarium-v1')
      } catch {
        // ignore
      }
      window.location.reload()
    }
  }

  return (
    <header
      className="fixed inset-x-0 top-0 z-50 flex h-16 items-center justify-between px-8 backdrop-blur-md"
      style={{
        background: 'rgba(22, 24, 48, 0.82)',
        borderBottom: '1px solid rgba(160,180,255,0.18)',
      }}
    >
      {/* Left: brand + live indicator */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{
            background:
              'radial-gradient(circle at 50% 40%, #f5c45e, #9c7a2e)',
            boxShadow: '0 0 16px rgba(245,196,94,0.45)',
          }}
        >
          <Sparkles size={16} color="rgba(255,255,255,0.95)" strokeWidth={1.8} />
        </div>
        <div>
          <div
            className="text-[18px] font-bold uppercase"
            style={{
              letterSpacing: '0.18em',
              color: '#e8e9ff',
            }}
          >
            {business.name}
          </div>
          <div
            className="text-[10px] uppercase"
            style={{
              letterSpacing: '0.20em',
              color: '#a8aacc',
            }}
          >
            One-person AI business · Crystarium
          </div>
        </div>
        <LiveIndicator />
      </div>

      {/* Right: KPI cluster */}
      <div className="flex items-center gap-6">
        <Kpi label="MRR" value={formatMoney(business.mrr)} accent="#5fdba0" />
        <Divider />
        <Kpi label="Customers" value={business.customerCount.toString()} accent="#4fd0e8" />
        <Divider />
        <Kpi label="Today" value={business.todayActivity.toString()} accent="#f5c45e" />
        <Divider />
        <button
          onClick={handleReset}
          aria-label="Reset demo"
          title="Reset demo"
          className="flex h-8 w-8 items-center justify-center rounded-md transition-colors hover:bg-white/5"
          style={{ color: '#5b5d80' }}
        >
          <RotateCcw size={13} />
        </button>
      </div>
    </header>
  )
}

function Kpi({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="flex flex-col items-end">
      <div
        className="text-[10px] font-medium uppercase"
        style={{
          letterSpacing: '0.20em',
          color: '#a8aacc',
        }}
      >
        {label}
      </div>
      <div
        className="text-[22px] font-semibold tabular-nums"
        style={{
          color: '#e8e9ff',
          textShadow: `0 0 12px ${accent}40`,
          letterSpacing: '-0.01em',
        }}
      >
        {value}
      </div>
    </div>
  )
}

function Divider() {
  return (
    <div
      className="h-8 w-px"
      style={{ background: 'rgba(255,255,255,0.08)' }}
      aria-hidden
    />
  )
}

function LiveIndicator() {
  const status = useRealtimeStatus()
  const map = {
    idle: { label: 'Local', color: '#5b5d80', dot: '#5b5d80', pulse: false },
    connecting: { label: 'Connecting', color: '#f5c45e', dot: '#f5c45e', pulse: true },
    live: { label: 'Live', color: '#5fdba0', dot: '#5fdba0', pulse: true },
    error: { label: 'Offline', color: '#f06a6a', dot: '#f06a6a', pulse: false },
  }
  const cfg = map[status]
  return (
    <div
      className="ml-2 flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase"
      title={
        status === 'live'
          ? 'Subscribed to Supabase Realtime — storefront events pulse live'
          : status === 'idle'
            ? 'Running on the local timer driver — no remote bus configured'
            : status === 'connecting'
              ? 'Connecting to Supabase Realtime…'
              : 'Remote bus error — falling back to local driver'
      }
      style={{
        background: 'rgba(10,11,26,0.6)',
        border: `1px solid ${cfg.color}33`,
        color: cfg.color,
        letterSpacing: '0.16em',
      }}
    >
      <span
        className="inline-block rounded-full"
        style={{
          width: 6,
          height: 6,
          background: cfg.dot,
          boxShadow: cfg.pulse ? `0 0 8px ${cfg.dot}` : 'none',
          animation: cfg.pulse ? 'live-dot-pulse 1.6s ease-in-out infinite' : 'none',
        }}
        aria-hidden
      />
      {cfg.label}
    </div>
  )
}
