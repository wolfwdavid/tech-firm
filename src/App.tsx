import { Header } from './components/Header'
import { Crystarium } from './components/Crystarium'
import { AgentDrawer } from './components/AgentDrawer'
import { AutomationLog } from './components/AutomationLog'
import { BootIntro } from './components/BootIntro'
import { useAutomationDriver } from './lib/automationDriver'

export default function App() {
  useAutomationDriver()
  return (
    <>
      <BootIntro />
      <Header />
      <Crystarium />
      <AgentDrawer />
      <AutomationLog />
    </>
  )
}
