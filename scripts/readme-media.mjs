// Records the animated GIFs shown in the README (GitHub and npm both render
// GIFs; npm does not play video). The clips are the real demo site running in
// headless Chrome: screenshots of the cubes are taken at a fixed rate and
// encoded with gifenc.
//
//   npm run build:demo && npm run media           both clips
//   npm run media -- hero                         only this one
//
// Needs a local Chrome or Edge (puppeteer-core does not download one); set
// CHROME_PATH if it is not in the usual place. Output: .github/media/*.gif

import { createServer } from 'node:http'
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import puppeteer from 'puppeteer-core'
import gifenc from 'gifenc'
import { PNG } from 'pngjs'

const { GIFEncoder, quantize, applyPalette } = gifenc
const ROOT = resolve(import.meta.dirname, '..')
const SITE = join(ROOT, 'example-dist')
const OUT = join(ROOT, '.github/media')
const FPS = 12
const SPEED = 0.7 // playback speed: below 1 plays the clips slower than real time, easier to follow

const chromePath = process.env.CHROME_PATH || [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].find((p) => existsSync(p))
if (!chromePath) { console.error('readme-media: no Chrome found, set CHROME_PATH'); process.exit(1) }
if (!existsSync(join(SITE, 'index.html'))) { console.error('readme-media: run `npm run build:demo` first'); process.exit(1) }

const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.png': 'image/png' }
const server = createServer((req, res) => {
  const url = req.url.split('?')[0]
  const file = join(SITE, url === '/' ? 'index.html' : url)
  if (!file.startsWith(SITE) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return }
  res.writeHead(200, { 'content-type': types[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
}).listen(0)
const base = `http://localhost:${server.address().port}/`

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// screenshot `clip` (or the viewport) for `seconds`, while `script` runs alongside
async function record(page, seconds, clip, script) {
  const frames = []
  const running = script ? script() : Promise.resolve()
  const t0 = Date.now()
  for (let i = 0; i < seconds * FPS; i++) {
    const due = t0 + (i * 1000) / FPS
    if (Date.now() < due) await sleep(due - Date.now())
    frames.push(PNG.sync.read(Buffer.from(await page.screenshot({ type: 'png', clip, optimizeForSpeed: true }))))
  }
  await running
  return frames
}

function encode(frames, file) {
  const { width, height } = frames[0]
  // one palette for the whole clip, sampled across it, keeps colours steady
  const step = Math.max(1, Math.floor(frames.length / 10))
  const picked = frames.filter((_, i) => i % step === 0)
  const sample = new Uint8Array(picked.length * width * height * 4)
  picked.forEach((f, i) => sample.set(f.data, i * width * height * 4))
  const palette = quantize(sample, 128)
  const gif = GIFEncoder()
  for (const f of frames) gif.writeFrame(applyPalette(f.data, palette), width, height, { palette, delay: Math.round(1000 / FPS / SPEED) })
  gif.finish()
  writeFileSync(file, gif.bytes())
  console.log(`readme-media: ${file.split(/[\\/]/).pop()}  ${(statSync(file).size / 1024).toFixed(0)} KB, ${frames.length} frames`)
}

const CLIPS = {
  // the three cubes on the demo page scrambling and solving themselves
  async hero(page) {
    await page.setViewport({ width: 1100, height: 620 })
    await page.goto(base, { waitUntil: 'networkidle0' })
    await sleep(2500) // let the cubes settle into their loop
    const box = await (await page.$('.row')).boundingBox()
    return record(page, 8, { x: box.x, y: box.y, width: box.width, height: box.height })
  },
  // click a cube to open the playground and turn faces with the notation buttons
  async playground(page) {
    await page.setViewport({ width: 900, height: 760, deviceScaleFactor: 0.7 })
    await page.goto(base, { waitUntil: 'networkidle0' })
    await sleep(1500)
    await page.click('figure [role="button"]')
    await sleep(1400)
    // crop to the playground cube and the control panel
    const clip = await page.evaluate(() => {
      const canvas = [...document.querySelectorAll('canvas')].pop().getBoundingClientRect()
      const label = [...document.querySelectorAll('p')].find((p) => p.textContent.trim() === 'Controls')
      const panel = label.parentElement.parentElement.getBoundingClientRect()
      const x = Math.min(canvas.left, panel.left) - 16
      const y = Math.min(canvas.top, panel.top) - 16
      return { x, y, width: Math.max(canvas.right, panel.right) + 16 - x, height: Math.max(canvas.bottom, panel.bottom) + 16 - y }
    })
    const moves = ['R', 'U', "R'", 'F', "U'", 'L', 'D', "F'"]
    return record(page, 5, clip, async () => {
      await sleep(300)
      for (const m of moves) {
        await page.evaluate((label) => {
          [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === label)?.click()
        }, m)
        await sleep(560)
      }
    })
  },
}

const browser = await puppeteer.launch({
  executablePath: chromePath,
  headless: true,
  args: ['--force-device-scale-factor=1', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'],
})
mkdirSync(OUT, { recursive: true })
const wanted = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(CLIPS)
try {
  for (const name of wanted) {
    if (!CLIPS[name]) { console.warn(`readme-media: unknown clip "${name}"`); continue }
    const page = await browser.newPage()
    const frames = await CLIPS[name](page)
    encode(frames, join(OUT, `${name}.gif`))
    if (process.env.SHEET) { // contact sheet of 12 frames, to check a clip without a GIF viewer
      const { width, height } = frames[0]
      const sheet = new PNG({ width: width * 4, height: height * 3 })
      for (let i = 0; i < 12; i++) PNG.bitblt(frames[Math.floor(((i + 0.5) / 12) * frames.length)], sheet, 0, 0, width, height, (i % 4) * width, Math.floor(i / 4) * height)
      writeFileSync(join(process.env.SHEET, `cubex-${name}-sheet.png`), PNG.sync.write(sheet))
    }
    await page.close()
  }
} finally {
  await browser.close()
  server.close()
}
