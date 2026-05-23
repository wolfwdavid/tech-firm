import { Header } from './components/Header'
import { Crystarium } from './components/Crystarium'
import { AgentDrawer } from './components/AgentDrawer'
import { AutomationLog } from './components/AutomationLog'
import { BootIntro } from './components/BootIntro'
import { Onboarding } from './components/Onboarding'
import { useAutomationDriver } from './lib/automationDriver'
import { useOnboarded } from './store'

export default function App() {
  const onboarded = useOnboarded()
  useAutomationDriver()
  return (
    <>
      {!onboarded && <Onboarding />}
      {onboarded && <BootIntro />}
      <Header />
      <Crystarium />
      <AgentDrawer />
      <AutomationLog />
    </>
  )
}
