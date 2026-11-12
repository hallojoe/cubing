// The GitHub-hosted Ubuntu runner includes Chrome. Set CHROME_BIN for Chromium locally.
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, resolve, sep } from 'node:path';
import { chromium } from 'playwright-core';

const dist = resolve('dist');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.webmanifest': 'application/manifest+json', '.png': 'image/png' };
let nextRelease = false;
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/cubing/app') { res.writeHead(301, { Location: path + '/' }).end(); return; }
  const file = resolve(dist, '.' + path.slice('/cubing'.length) + (path.endsWith('/') ? 'index.html' : ''));
  if (!path.startsWith('/cubing/') || !file.startsWith(dist + sep)) { res.writeHead(404).end(); return; }
  try {
    let body = await readFile(file);
    if (nextRelease && path.endsWith('/cubing-sw.js'))
      body = body.toString().replace("const cacheName = prefix + '", "const cacheName = prefix + 'release2-");
    if (nextRelease && path.endsWith('app/index.html'))
      body = body.toString().replace('<title>Cubing</title>', '<title>Cubing updated</title>');
    res.writeHead(200, { 'Content-Type': types[extname(file)], 'Cache-Control': 'no-store' }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/cubing/`;
let browser;
try {
  browser = await chromium.launch({
    ...(process.env.CHROME_BIN ? { executablePath: process.env.CHROME_BIN } : { channel: 'chrome' }),
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader']
  });
  const context = await browser.newContext({ viewport: { width: 1240, height: 860 } });
  const page = await context.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const button = name => page.getByRole('button', { name, exact: true });
  await page.goto(base);
  await button('Solve').click();
  await page.keyboard.press('KeyI');
  await page.keyboard.press('KeyU');
  await button('Frame 2, Rw').waitFor();
  await button('Undo').click();
  await button('Frame 3, Undo 2R′ + R′').waitFor();
  const history = page.getByRole('region', { name: 'Recorded frames' });
  const canvas = page.locator('canvas');
  await button('Frame 1, R').click();
  const first = await canvas.screenshot();
  await button('Frame 2, Rw').click();
  assert.notDeepEqual(await canvas.screenshot(), first);
  await button('Frame 3, Undo 2R′ + R′').click();
  assert.deepEqual(await canvas.screenshot(), first, 'undo frame should restore the same visible cube');
  await button('Frame 0, Start').click();
  await history.getByRole('combobox').selectOption('5000');
  await history.getByRole('button', { name: 'Play', exact: true }).click();
  await page.getByText('Frame 1 of 3').waitFor();
  await history.getByRole('button', { name: 'Pause', exact: true }).click();
  await history.getByRole('combobox').selectOption('500');
  await history.getByRole('button', { name: 'Play', exact: true }).click();
  await page.getByText('Frame 3 of 3').waitFor();
  await history.getByRole('button', { name: 'Back to live' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  await button('Move history').click();
  await page.getByRole('dialog', { name: 'Move history' }).waitFor();
  await page.keyboard.press('Escape');
  assert.equal(await button('Move history').evaluate(el => el === document.activeElement), true);
  await page.goto(base + 'app');
  await page.waitForFunction(() => navigator.serviceWorker.controller !== null);
  await button('Choose your cube').click();
  await button('2×2').click();
  await button('Close Choose your cube').click();
  await button('Settings').click();
  await page.getByText('Ready for offline use').waitFor();
  await button('Close Settings').click();
  const client = await context.newCDPSession(page);
  const manifest = await client.send('Page.getAppManifest');
  assert.equal(manifest.errors.length, 0);
  assert.equal(JSON.parse(manifest.data).display, 'standalone');
  await context.setOffline(true);
  await page.reload();
  await button('Solve').click();
  await page.keyboard.press('KeyI');
  await button('Move history').click();
  await button('Frame 1, R').waitFor();
  await button('Close Move history').click();
  nextRelease = true;
  await context.setOffline(false);
  await button('Settings').click();
  await button('Restart to update').waitFor();
  assert.equal(await page.title(), 'Cubing', 'reconnect must preserve the active session');
  await button('Restart to update').click();
  await page.waitForFunction(() => document.title === 'Cubing updated');
  await context.setOffline(true);
  await page.goto(base + 'app/');
  assert.equal(await page.title(), 'Cubing updated');
  assert.deepEqual(errors, []);
  console.log('Desktop replay, mobile drawer, offline cube and online update passed.');
} finally {
  await browser?.close();
  server.closeAllConnections();
  await new Promise(resolve => server.close(resolve));
}
