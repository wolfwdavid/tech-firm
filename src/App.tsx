import { Header } from './components/Header'
import { Crystarium } from './components/Crystarium'
import { AgentDrawer } from './components/AgentDrawer'
import { AutomationLog } from './components/AutomationLog'
import { BootIntro } from './components/BootIntro'
import { Onboarding } from './components/Onboarding'
import { DemoPanel } from './components/DemoPanel'
import { HotkeyOverlay } from './components/HotkeyOverlay'
import { useAutomationDriver } from './lib/automationDriver'
import { useRealtimeAutomations } from './lib/realtimeAutomations'
import { useOnboarded } from './store'

export default function App() {
  const onboarded = useOnboarded()
  useRealtimeAutomations()
  useAutomationDriver()
  return (
    <>
      {!onboarded && <Onboarding />}
      {onboarded && <BootIntro />}
      <Header />
      <Crystarium />
      <AgentDrawer />
      <AutomationLog />
      {onboarded && <DemoPanel />}
      <HotkeyOverlay />
    </>
  )
}
