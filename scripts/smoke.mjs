import { chromium } from 'playwright'

const URL = 'http://localhost:5173/'

async function main() {
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true,
  })
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  })
  const page = await ctx.newPage()

  const errors = []
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
  page.on('console', (msg) => {
    if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`)
  })

  // -------- Phase A: visit fresh, capture the onboarding wizard ----------
  await page.goto(URL, { waitUntil: 'domcontentloaded', timeout: 20000 })
  await page.evaluate(() => localStorage.clear())
  await page.reload({ waitUntil: 'networkidle', timeout: 20000 })

  await page.waitForSelector('text=Enter the Crystarium', { timeout: 10000 })
  await page.screenshot({
    path: 'scripts/smoke-onboarding-step1.png',
    fullPage: false,
  })

  // Click through to step 2
  await page.locator('button:has-text("Next")').first().click()
  await page.waitForTimeout(300)
  // Click through to step 3
  await page.locator('button:has-text("Next")').first().click()
  await page.waitForTimeout(300)
  await page.screenshot({
    path: 'scripts/smoke-onboarding-step3.png',
    fullPage: false,
  })
  // Final click — enter the Crystarium
  await page.locator('button:has-text("Enter the Crystarium")').click()

  // -------- Phase B: verify the Crystarium now renders ----------
  await page.waitForSelector('.react-flow__node', { timeout: 15000 })

  // Wait for the auto-open Manager drawer to appear (3.1s after mount)
  await page.waitForTimeout(4000)

  // Count crystals
  const nodeCount = await page
    .locator('.react-flow__node')
    .count()
  const edgeCount = await page.locator('.react-flow__edge').count()

  // Header content
  const brand = await page.locator('text=POUR DECISIONS').first().isVisible()
  const mrr = await page.locator('text=$2,340').first().isVisible()

  // Manager drawer auto-opened?
  const briefingVisible = await page
    .locator('text=Morning Briefing')
    .first()
    .isVisible()
    .catch(() => false)

  // Take a screenshot for visual confirmation
  await page.screenshot({
    path: 'scripts/smoke-screenshot.png',
    fullPage: false,
  })

  // Send a chat message to test the agent loop
  if (briefingVisible) {
    const textarea = page.locator('textarea').first()
    await textarea.fill('What should I prioritize this morning?')
    await textarea.press('Enter')
    await page.waitForTimeout(1500)
  }

  await page.screenshot({
    path: 'scripts/smoke-screenshot-after-chat.png',
    fullPage: false,
  })

  await browser.close()

  console.log(JSON.stringify({
    nodeCount,
    edgeCount,
    brand,
    mrr,
    briefingVisible,
    errors,
  }, null, 2))

  if (errors.length > 0) {
    console.error('Runtime errors detected')
    process.exit(1)
  }
  if (nodeCount < 8) {
    console.error(`Expected ≥8 nodes, got ${nodeCount}`)
    process.exit(1)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(2)
})
