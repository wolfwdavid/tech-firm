import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react'
import { useCrystariumStore, useNodes, useOnboarded } from '../store'
import { roleVisuals } from './nodes/CrystalNode'
import type { BusinessSeed, NodeRole } from '../store/types'

type StepIndex = 0 | 1 | 2

interface FormState {
  name: string
  niche: string
  mrr: string
  customers: string
  hours: string
}

const initialForm: FormState = {
  name: '',
  niche: '',
  mrr: '',
  customers: '',
  hours: '',
}

const placeholderForm: FormState = {
  name: 'Pour Decisions',
  niche: 'coffee subscription',
  mrr: '2340',
  customers: '47',
  hours: '15',
}

function pitchFor(role: NodeRole, niche: string): string {
  const n = niche.trim() || 'your business'
  switch (role) {
    case 'manager':
      return `I'll keep the room. I read every other agent and tell you what matters this morning.`
    case 'storefront':
      return `I'll keep your ${n} landing page sharp and converting.`
    case 'customer':
      return `I'll handle support — friendly, terse, in your voice.`
    case 'email':
      return `I'll write campaigns and protect your sender reputation.`
    case 'content':
      return `I'll keep your content calendar full in your voice.`
    case 'payments':
      return `I'll process receipts, flag failed cards, and tell you when something's odd.`
    case 'analytics':
      return `I'll watch the numbers and surface signals — never the dashboard noise.`
    case 'automations':
      return `I'll wire your other agents together so they trigger each other automatically.`
  }
}

export function Onboarding() {
  const onboarded = useOnboarded()
  const nodes = useNodes()
  const completeOnboarding = useCrystariumStore((s) => s.completeOnboarding)
  const [step, setStep] = useState<StepIndex>(0)
  const [form, setForm] = useState<FormState>(initialForm)

  // ESC doesn't dismiss — onboarding is mandatory on first run.
  // But once onboarded, this component never mounts (App.tsx guards).

  const isFinal = step === 2
  const isFirst = step === 0

  const finishedForm = useMemo<BusinessSeed>(
    () => ({
      name: (form.name || placeholderForm.name).toUpperCase(),
      mrr: Number(form.mrr || placeholderForm.mrr),
      customerCount: Number(form.customers || placeholderForm.customers),
      todayActivity: 3,
    }),
    [form],
  )

  const handleEnter = () => {
    completeOnboarding(
      finishedForm,
      (form.niche || placeholderForm.niche).trim(),
    )
  }

  // Don't render if user already onboarded (App.tsx also guards, this is belt+suspenders)
  if (onboarded) return null

  return (
    <AnimatePresence>
      <motion.div
        key="onboarding"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.35 }}
        className="fixed inset-0 z-[90] flex items-center justify-center px-6"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, #10112a 0%, #05060d 70%)',
        }}
      >
        <BackdropStars />

        <motion.div
          initial={{ y: 14, scale: 0.97, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
          className="relative z-10 flex w-full max-w-[580px] flex-col overflow-hidden rounded-2xl"
          style={{
            background: 'rgba(22,24,48,0.92)',
            border: '1px solid rgba(160,180,255,0.18)',
            boxShadow:
              '0 24px 64px rgba(0,0,0,0.6), 0 0 32px rgba(245,196,94,0.12)',
            backdropFilter: 'blur(16px)',
          }}
        >
          <Header step={step} />

          <div className="px-7 pb-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ x: 16, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -16, opacity: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
              >
                {step === 0 && (
                  <StepIdentity form={form} setForm={setForm} />
                )}
                {step === 1 && (
                  <StepMetrics form={form} setForm={setForm} />
                )}
                {step === 2 && (
                  <StepTeam niche={form.niche || placeholderForm.niche} nodes={nodes} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <Footer
            isFirst={isFirst}
            isFinal={isFinal}
            onBack={() => setStep((s) => (Math.max(0, s - 1) as StepIndex))}
            onNext={() =>
              isFinal ? handleEnter() : setStep((s) => ((s + 1) as StepIndex))
            }
          />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

function Header({ step }: { step: StepIndex }) {
  return (
    <div className="flex flex-col items-center pb-2 pt-7">
      <div
        className="mb-3 flex h-10 w-10 items-center justify-center"
        style={{
          clipPath:
            'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
          background: `radial-gradient(circle at 50% 40%, ${roleVisuals.manager.bright}, ${roleVisuals.manager.base})`,
          boxShadow: `0 0 18px ${roleVisuals.manager.glow}`,
        }}
      >
        <Sparkles size={16} color="rgba(255,255,255,0.94)" strokeWidth={1.8} />
      </div>
      <div
        className="text-[10px] font-medium uppercase"
        style={{ color: '#a8aacc', letterSpacing: '0.30em' }}
      >
        Enter the Crystarium
      </div>
      <StepDots step={step} />
    </div>
  )
}

function StepDots({ step }: { step: StepIndex }) {
  return (
    <div className="mt-3 flex items-center gap-2">
      {[0, 1, 2].map((i) => {
        const active = i === step
        const done = i < step
        return (
          <span
            key={i}
            className="inline-block transition-all"
            style={{
              width: active ? 24 : 10,
              height: 6,
              borderRadius: 3,
              background: active
                ? `linear-gradient(90deg, ${roleVisuals.manager.bright}, ${roleVisuals.manager.base})`
                : done
                  ? roleVisuals.manager.glow
                  : 'rgba(255,255,255,0.10)',
              boxShadow: active ? `0 0 10px ${roleVisuals.manager.glow}` : 'none',
            }}
          />
        )
      })}
    </div>
  )
}

function StepIdentity({
  form,
  setForm,
}: {
  form: FormState
  setForm: (next: FormState) => void
}) {
  return (
    <div className="flex flex-col gap-4 py-3">
      <Title>What's the business?</Title>
      <Caption>
        We'll personalize the Crystarium to your niche. Leave blank to ride the
        "Pour Decisions" demo defaults.
      </Caption>
      <Field
        label="Business name"
        value={form.name}
        onChange={(v) => setForm({ ...form, name: v })}
        placeholder={placeholderForm.name}
      />
      <Field
        label="Niche (one line)"
        value={form.niche}
        onChange={(v) => setForm({ ...form, niche: v })}
        placeholder={placeholderForm.niche}
      />
    </div>
  )
}

function StepMetrics({
  form,
  setForm,
}: {
  form: FormState
  setForm: (next: FormState) => void
}) {
  return (
    <div className="flex flex-col gap-4 py-3">
      <Title>Where are you now?</Title>
      <Caption>
        Roughly. Zeros are fine — the Crystarium runs the same either way; this
        just seeds the header KPIs.
      </Caption>
      <div className="grid grid-cols-3 gap-3">
        <NumberField
          label="MRR ($)"
          value={form.mrr}
          onChange={(v) => setForm({ ...form, mrr: v })}
          placeholder={placeholderForm.mrr}
        />
        <NumberField
          label="Customers"
          value={form.customers}
          onChange={(v) => setForm({ ...form, customers: v })}
          placeholder={placeholderForm.customers}
        />
        <NumberField
          label="Hrs / week"
          value={form.hours}
          onChange={(v) => setForm({ ...form, hours: v })}
          placeholder={placeholderForm.hours}
        />
      </div>
    </div>
  )
}

function StepTeam({
  niche,
  nodes,
}: {
  niche: string
  nodes: { id: string; role: NodeRole; name: string; parentId?: string }[]
}) {
  const baseNodes = nodes.filter((n) => !n.parentId)
  return (
    <div className="flex flex-col gap-3 py-3">
      <Title>Your starter team</Title>
      <Caption>
        Eight specialized AI agents, one role each. You can clone any of them
        into a sub-specialist later (Wand icon in their drawer).
      </Caption>
      <div className="scrollbar-mystic mt-1 grid max-h-[280px] grid-cols-2 gap-2.5 overflow-y-auto pr-1">
        {baseNodes.map((n) => {
          const v = roleVisuals[n.role]
          const Icon = v.icon
          return (
            <div
              key={n.id}
              className="flex items-start gap-2.5 rounded-lg px-3 py-2.5"
              style={{
                background: 'rgba(10,11,26,0.65)',
                border: `1px solid ${v.glow}`,
              }}
            >
              <div
                className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center"
                style={{
                  clipPath:
                    'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                  background: `radial-gradient(circle at 50% 40%, ${v.bright}, ${v.base})`,
                  boxShadow: `0 0 8px ${v.glow}`,
                }}
              >
                <Icon size={13} color="rgba(255,255,255,0.94)" strokeWidth={1.8} />
              </div>
              <div className="flex-1 leading-tight">
                <div
                  className="text-[11px] font-semibold uppercase"
                  style={{ color: v.bright, letterSpacing: '0.08em' }}
                >
                  {n.name}
                </div>
                <div
                  className="mt-0.5 text-[11.5px]"
                  style={{ color: '#cfd0ee' }}
                >
                  {pitchFor(n.role, niche)}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Footer({
  isFirst,
  isFinal,
  onBack,
  onNext,
}: {
  isFirst: boolean
  isFinal: boolean
  onBack: () => void
  onNext: () => void
}) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-7 py-4"
      style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
    >
      <button
        onClick={onBack}
        disabled={isFirst}
        className="flex items-center gap-1.5 rounded-md px-3 py-2 text-[11px] font-semibold uppercase transition-all"
        style={{
          background: 'transparent',
          color: isFirst ? '#3a3c5c' : '#a8aacc',
          letterSpacing: '0.16em',
          cursor: isFirst ? 'not-allowed' : 'pointer',
        }}
      >
        <ChevronLeft size={13} />
        Back
      </button>
      <button
        onClick={onNext}
        className="flex items-center gap-1.5 rounded-md px-4 py-2 text-[11px] font-semibold uppercase transition-all"
        style={{
          background: `linear-gradient(135deg, ${roleVisuals.manager.bright}, ${roleVisuals.manager.base})`,
          color: '#0a0b1a',
          letterSpacing: '0.16em',
          boxShadow: `0 0 16px ${roleVisuals.manager.glow}`,
        }}
      >
        {isFinal ? 'Enter the Crystarium' : 'Next'}
        <ChevronRight size={13} />
      </button>
    </div>
  )
}

function Title({ children }: { children: ReactNode }) {
  return (
    <div
      className="font-semibold uppercase"
      style={{
        fontSize: 18,
        color: '#e8e9ff',
        letterSpacing: '0.12em',
        textShadow: '0 0 14px rgba(245,196,94,0.25)',
      }}
    >
      {children}
    </div>
  )
}

function Caption({ children }: { children: ReactNode }) {
  return (
    <div
      className="text-[12.5px] leading-relaxed"
      style={{ color: '#a8aacc' }}
    >
      {children}
    </div>
  )
}

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[10px] font-medium uppercase"
        style={{ color: '#a8aacc', letterSpacing: '0.20em' }}
      >
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md px-3 py-2.5 text-[13.5px] outline-none transition-colors"
        style={{
          background: 'rgba(10,11,26,0.75)',
          color: '#e8e9ff',
          border: '1px solid rgba(160,180,255,0.18)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = roleVisuals.manager.bright
          e.currentTarget.style.boxShadow = `0 0 14px ${roleVisuals.manager.glow}`
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(160,180,255,0.18)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    </label>
  )
}

function NumberField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span
        className="text-[10px] font-medium uppercase"
        style={{ color: '#a8aacc', letterSpacing: '0.20em' }}
      >
        {label}
      </span>
      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-md px-3 py-2.5 text-[13.5px] tabular-nums outline-none transition-colors"
        style={{
          background: 'rgba(10,11,26,0.75)',
          color: '#e8e9ff',
          border: '1px solid rgba(160,180,255,0.18)',
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = roleVisuals.manager.bright
          e.currentTarget.style.boxShadow = `0 0 14px ${roleVisuals.manager.glow}`
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = 'rgba(160,180,255,0.18)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      />
    </label>
  )
}

function BackdropStars() {
  const stars = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() < 0.7 ? 1 : 2,
        opacity: 0.10 + Math.random() * 0.18,
      })),
    [],
  )
  return (
    <div className="pointer-events-none absolute inset-0">
      {stars.map((s) => (
        <div
          key={s.id}
          className="absolute rounded-full bg-white"
          style={{
            top: `${s.top}%`,
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
          }}
        />
      ))}
    </div>
  )
}

// Quietly export for App.tsx
export const useShouldShowOnboarding = (): boolean => !useOnboarded()
