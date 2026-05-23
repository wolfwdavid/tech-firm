// End-to-end smoke for the Supabase Realtime loop.
//
// 1. Open the Crystarium (clears localStorage, runs through onboarding)
// 2. Read the current automation log count
// 3. Insert a row into automation_events via the REST API
// 4. Wait for the Crystarium to receive the Realtime event and pulse the edge
// 5. Read the count again — should have grown
//
// Reads VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY from .env.local

import { chromium } from 'playwright'
import { readFileSync } from 'fs'

const URL = 'http://localhost:5173/'

function loadEnv() {
  const env = {}
  try {
    const raw = readFileSync('.env.local', 'utf8')
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/)
      if (m) env[m[1]] = m[2].trim()
    }
  } catch {
    // ignore
  }
  return env
}

async function insertEvent(supaUrl, supaKey, label) {
  const res = await fetch(`${supaUrl}/rest/v1/automation_events`, {
    method: 'POST',
    headers: {
      apikey: supaKey,
      Authorization: `Bearer ${supaKey}`,
      'content-type': 'application/json',
      Prefer: 'return=representation',
    },
    body: JSON.stringify({
      from_node: 'node-storefront',
      to_node: 'node-email',
      label,
    }),
  })
  if (!res.ok) {
    throw new Error(`Insert failed ${res.status}: ${await res.text()}`)
  }
  return await res.json()
}

async function main() {
  const env = loadEnv()
  const supaUrl = env.VITE_SUPABASE_URL
  const supaKey = env.VITE_SUPABASE_ANON_KEY
  if (!supaUrl || !supaKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local')
    process.exit(2)
  }

  const browser = await chromium.launch({ channel: 'msedge', headless: true })
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await ctx.newPage()

  const errors = []
  const subscribeMessages = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => {
    const t = msg.text()
    if (msg.type() === 'error') errors.push(`console.error: ${t}`)
    if (t.includes('crystarium')) subscribeMessages.push(t)
  })

  // Phase A: open + onboard
  await page.goto(URL, { waitUntil: 'domcontentloaded' })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle' })
  await page.waitForSelector('text=Enter the Crystarium', { timeout: 10000 })
  await page.locator('button:has-text("Next")').first().click()
  await page.waitForTimeout(250)
  await page.locator('button:has-text("Next")').first().click()
  await page.waitForTimeout(250)
  await page.locator('button:has-text("Enter the Crystarium")').click()

  await page.waitForSelector('.react-flow__node', { timeout: 12000 })
  // Wait for Realtime subscription to land
  await page.waitForTimeout(2200)

  // Close the auto-opened manager drawer so the automation pill is reachable in the corner
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)

  // Phase B: read current automation count from the pill
  const beforeText = await page.locator('button:has-text("Automations")').innerText().catch(() => '')
  const beforeCount = parseInt(beforeText.replace(/[^0-9]/g, ''), 10) || 0

  // Phase C: insert a row via REST
  const label = `Realtime smoke ping ${Date.now()}`
  const [inserted] = await insertEvent(supaUrl, supaKey, label)

  // Phase D: wait for the Crystarium to pick it up (Realtime usually < 1s)
  let afterCount = beforeCount
  for (let i = 0; i < 20; i++) {
    await page.waitForTimeout(250)
    const text = await page.locator('button:has-text("Automations")').innerText().catch(() => '')
    afterCount = parseInt(text.replace(/[^0-9]/g, ''), 10) || 0
    if (afterCount > beforeCount) break
  }

  // Phase E: open the log to verify the label landed
  await page.locator('button:has-text("Automations")').click()
  await page.waitForTimeout(400)
  const labelVisible = await page.locator(`text=${label}`).first().isVisible().catch(() => false)

  await page.screenshot({ path: 'scripts/smoke-realtime.png', fullPage: false })
  await browser.close()

  console.log(
    JSON.stringify(
      {
        beforeCount,
        afterCount,
        delta: afterCount - beforeCount,
        labelVisible,
        insertedId: inserted?.id,
        subscribeMessages,
        errors,
      },
      null,
      2,
    ),
  )

  if (errors.length > 0) {
    console.error('Runtime errors during smoke')
    process.exit(1)
  }
  if (afterCount <= beforeCount) {
    console.error('Automation log did not grow after Realtime insert')
    process.exit(1)
  }
  if (!labelVisible) {
    console.error('Inserted label not found in the log')
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
