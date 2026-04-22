#!/usr/bin/env node

const runs = Number(process.env.RUNS || 3);
const url = process.env.URL || 'https://tim.waldin.net/';

async function main() {
  const { chromium } = await import('playwright');
  const results = [];

  for (let i = 0; i < runs; i++) {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      bypassCSP: true,
    });
    const page = await context.newPage();

    const startedAt = Date.now();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    try {
      await page.waitForFunction(
        () => Boolean((window).__termTti?.['term:ready-for-input']),
        { timeout: 15000 },
      );
    } catch {
      // best effort; we'll still report whatever marks were collected
    }

    const marks = await page.evaluate(() => {
      return (window).__termTti || {};
    });

    results.push({
      run: i + 1,
      totalMs: Date.now() - startedAt,
      promptMs: marks['term:first-prompt'] ?? null,
      welcomeMs: marks['term:welcome-typed'] ?? null,
      readyMs: marks['term:ready-for-input'] ?? null,
      socketMs: marks['term:socket-connected'] ?? null,
      firstOutputMs: marks['term:first-output'] ?? null,
    });

    await context.close();
    await browser.close();
  }

  const fmt = (v) => (typeof v === 'number' ? `${Math.round(v)}ms` : 'n/a');
  const avg = (key) => {
    const vals = results.map((r) => r[key]).filter((v) => typeof v === 'number');
    if (!vals.length) return null;
    return vals.reduce((a, b) => a + b, 0) / vals.length;
  };

  console.log(`URL: ${url}`);
  for (const r of results) {
    console.log(
      `run ${r.run}: socket=${fmt(r.socketMs)} firstOutput=${fmt(r.firstOutputMs)} ` +
      `zshPrompt=${fmt(r.promptMs)} welcomeTyped=${fmt(r.welcomeMs)} ready=${fmt(r.readyMs)} total=${fmt(r.totalMs)}`,
    );
  }

  console.log(
    `avg: socket=${fmt(avg('socketMs'))} firstOutput=${fmt(avg('firstOutputMs'))} ` +
    `zshPrompt=${fmt(avg('promptMs'))} welcomeTyped=${fmt(avg('welcomeMs'))} ready=${fmt(avg('readyMs'))} total=${fmt(avg('totalMs'))}`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
