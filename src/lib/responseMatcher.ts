export const STOP_WORDS = new Set([
  'the', 'and', 'for', 'you', 'are', 'with', 'that', 'this', 'what', 'when',
  'why', 'how', 'can', 'will', 'would', 'could', 'should', 'have', 'has',
  'was', 'were', 'but', 'all', 'any', 'some', 'into', 'from', 'about',
  'them', 'they', 'their', 'there', 'here', 'just', 'over', 'than', 'then',
  'your', 'yours', 'mine', 'ours', 'his', 'her', 'hers', 'its',
])

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w))
}

function hashStr(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

export function pickResponse(
  userText: string,
  candidates: string[],
  recentlyUsed: string[],
): string {
  if (!candidates.length) return ''
  const recentSet = new Set(recentlyUsed.slice(-3))
  const userTokens = tokenize(userText)
  const userTokenSet = new Set(userTokens)

  const scored = candidates.map((c, idx) => {
    const cTokens = tokenize(c)
    let matchCount = 0
    for (const t of cTokens) if (userTokenSet.has(t)) matchCount++
    return {
      idx,
      candidate: c,
      score: matchCount + 1 / Math.max(c.length, 1),
      keywordMatches: matchCount,
      recentlyUsed: recentSet.has(c),
    }
  })

  // Prefer non-recently-used
  let pool = scored.filter((s) => !s.recentlyUsed)
  if (pool.length === 0) pool = scored

  pool.sort((a, b) => b.score - a.score)

  // If top has no keyword matches, do round-robin based on hash of userText
  if (pool[0].keywordMatches === 0) {
    const hash = hashStr(userText)
    const idx = hash % pool.length
    return pool[idx].candidate
  }

  return pool[0].candidate
}
