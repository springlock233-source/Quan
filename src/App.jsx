import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Avatar helpers ───────────────────────────────────────────────────────────
function avatarBg(speaker) {
  if (speaker === 'Warren Buffett') return '#0d2040'
  if (speaker === 'Charlie Munger') return '#3d0a00'
  return null
}
function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2)
}

// ─── Constants ────────────────────────────────────────────────────────────────
const FONTS = [
  { label: 'Cardo', value: "'Cardo', Georgia, serif" },
  { label: 'Lora', value: "'Lora', Georgia, serif" },
  { label: 'Merriweather', value: "'Merriweather', Georgia, serif" },
  { label: 'Source Serif', value: "'Source Serif 4', Georgia, serif" },
  { label: 'Literata', value: "'Literata', Georgia, serif" },
  { label: 'Sans', value: "'Outfit', system-ui, sans-serif" },
]
const FS_MIN = 13
const FS_MAX = 25
const FS_STEP = 2
const LINE_HEIGHTS = [
  { label: 'Tight', value: 'tight' },
  { label: 'Normal', value: 'normal' },
  { label: 'Airy', value: 'airy' },
]
const WIDTHS = [
  { label: 'Narrow', value: 'narrow' },
  { label: 'Normal', value: 'normal' },
  { label: 'Wide', value: 'wide' },
]

// ─── CSS ──────────────────────────────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400&family=IBM+Plex+Mono:wght@400;500&family=Lora:ital,wght@0,400;0,600;1,400&family=Merriweather:ital,wght@0,300;0,400;1,300;1,400&family=Outfit:wght@200;300;400;500&family=Source+Serif+4:ital,opsz,wght@0,8..60,300;0,8..60,400;1,8..60,300;1,8..60,400&family=Literata:ital,opsz,wght@0,7..72,300;0,7..72,400;1,7..72,300;1,7..72,400&family=Noto+Serif+SC&family=Noto+Serif+TC&display=swap');

[data-lh="tight"] { --rd-lh: 1.6; }
[data-lh="normal"] { --rd-lh: 1.75; }
[data-lh="airy"] { --rd-lh: 1.95; }
[data-width="narrow"] { --rd-max: 600px; --rd-measure: 32rem; }
[data-width="normal"] { --rd-max: 700px; --rd-measure: 36rem; }
[data-width="wide"] { --rd-max: 840px; --rd-measure: 47rem; }
[data-align="justify"] .sg-en, [data-align="justify"] .sg-zh { text-align: justify; hyphens: auto; }

[data-theme="light"] {
  --bg: #ffffff; --bg2: #fafafa; --bg3: #f3f3f3;
  --border: #e8e8e8; --border2: #d8d8d8;
  --fg: #111111; --fg2: #444444; --fg3: #777777; --fg4: #888888; --fg5: #cccccc;
  --hl-bg: rgba(0,0,0,0.07); --hl-border: rgba(0,0,0,0.22);
  --inv-bg: #111; --inv-fg: #fff;
  --cover-filter: grayscale(100%) contrast(1.05);
  --hero-filter: grayscale(100%) contrast(1.1) brightness(0.85);
  --hero-grad: linear-gradient(to top, var(--bg) 0%, rgba(255,255,255,0.5) 50%, transparent 100%);
  --sel-bg: #111; --sel-fg: #fff;
}
[data-theme="sepia"] {
  --bg: #f6efe2; --bg2: #f0e8d7; --bg3: #e9dfc9;
  --border: #e2d7bd; --border2: #d3c5a4;
  --fg: #33291a; --fg2: #4c4130; --fg3: #7c6c51; --fg4: #98876a; --fg5: #cfc2a6;
  --hl-bg: rgba(80,60,20,0.10); --hl-border: rgba(80,60,20,0.30);
  --inv-bg: #33291a; --inv-fg: #f6efe2;
  --cover-filter: grayscale(80%) sepia(25%) contrast(1.02);
  --hero-filter: grayscale(80%) sepia(25%) contrast(1.05) brightness(0.9);
  --hero-grad: linear-gradient(to top, var(--bg) 0%, rgba(246,239,226,0.5) 50%, transparent 100%);
  --sel-bg: #33291a; --sel-fg: #f6efe2;
}
[data-theme="dark"] {
  --bg: #1a1815; --bg2: #221f1b; --bg3: #2a2722;
  --border: #302c27; --border2: #3e3930;
  --fg: #f0ead6; --fg2: #d4c9b0; --fg3: #9e9082; --fg4: #6e6558; --fg5: #4a4440;
  --hl-bg: rgba(240,234,214,0.1); --hl-border: rgba(240,234,214,0.3);
  --inv-bg: #f0ead6; --inv-fg: #1a1815;
  --cover-filter: grayscale(100%) contrast(1.05) brightness(0.7);
  --hero-filter: grayscale(100%) contrast(1.1) brightness(0.45);
  --hero-grad: linear-gradient(to top, var(--bg) 0%, rgba(26,24,21,0.6) 50%, transparent 100%);
  --sel-bg: #f0ead6; --sel-fg: #1a1815;
}
*, *::before, *::after { box-sizing: border-box; }
body {
  background: var(--bg); color: var(--fg);
  font-family: 'Cardo', Georgia, serif;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  transition: background 0.3s, color 0.3s;
  margin: 0;
}
::selection { background: var(--sel-bg); color: var(--sel-fg); }

.nav {
  position: sticky; top: 0; z-index: 100; height: 52px;
  padding: 0 40px; display: flex; align-items: center;
  justify-content: space-between;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  transition: transform 0.25s ease;
}
.nav.nav-hidden { transform: translateY(-100%); }
.read-progress { position: fixed; top: 0; left: 0; width: 100%; height: 2px; background: var(--fg); transform: scaleX(0); transform-origin: 0 0; z-index: 300; pointer-events: none; }
button:focus-visible, select:focus-visible, input:focus-visible { outline: 1px solid var(--fg3); outline-offset: 2px; }
.nav-brand { cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 17px; font-weight: 500; letter-spacing: -0.01em; }
.nav-brand span { font-weight: 200; color: var(--fg4); }
.nav-r { display: flex; align-items: center; gap: 4px; }
.nb {
  font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 400;
  text-transform: uppercase; letter-spacing: 0.04em;
  background: transparent; border: 1px solid transparent;
  color: var(--fg4); padding: 5px 11px; cursor: pointer;
  transition: color 0.15s, border-color 0.15s, background 0.15s;
}
.nb:hover { color: var(--fg); }
.nb.on { color: var(--fg); border-color: var(--border2); }
.nb.inv { background: var(--inv-bg); color: var(--inv-fg); border-color: var(--inv-bg); }
.nb.inv:hover { opacity: 0.85; }

.gp { max-width: 920px; margin: 0 auto; padding: 48px 40px 120px; }
.gp-hdr { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 44px; }
.gp-hdr h1 { font-family: 'Cardo', Georgia, serif; font-size: 36px; font-weight: 400; margin: 0; }
.gp-d { font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 300; color: var(--fg3); margin: 0; }
.gp-count { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--fg4); text-transform: uppercase; }
.sort-btn { font-family: 'IBM Plex Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.06em; background: none; border: 1px solid var(--border); color: var(--fg4); padding: 6px 12px; cursor: pointer; line-height: 1; transition: color 0.15s, border-color 0.15s; }
.sort-btn:hover { color: var(--fg); border-color: var(--border2); }
.nb-star { font-size: 14px; padding: 3px 10px; line-height: 1; }
.yc-soon { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; min-height: 200px; padding: 48px 24px; background: var(--bg); }
.yc-soon-t { font-family: 'Cardo', Georgia, serif; font-size: 17px; font-style: italic; color: var(--fg3); }
.yc-soon-s { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.08em; color: var(--fg4); text-transform: uppercase; }
.gr { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1px; background: var(--border); border: 1px solid var(--border); }
.yc-wrap { position: relative; background: var(--bg); }
.yc-del { position: absolute; top: 8px; right: 8px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; font-family: 'IBM Plex Mono', monospace; font-size: 12px; cursor: pointer; opacity: 0; transition: opacity 0.15s; background: var(--bg); border: 1px solid var(--border); color: var(--fg3); z-index: 2; }
.yc-wrap:hover .yc-del { opacity: 1; }
.yc { background: var(--bg); cursor: pointer; transition: background 0.15s; }
.yc:hover { background: var(--bg2); }
.yc-i { aspect-ratio: 3 / 2; overflow: hidden; background: var(--bg3); }
.yc-i img { width: 100%; height: 100%; object-fit: cover; filter: var(--cover-filter); transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
.yc:hover .yc-i img { transform: scale(1.02); }
.yc-b { padding: 20px 24px 24px; }
.yc-y { font-family: 'Cardo', Georgia, serif; font-size: 34px; font-weight: 400; line-height: 1; }
.yc-s { font-family: 'Cardo', Georgia, serif; font-size: 15px; font-style: italic; color: var(--fg2); margin-top: 4px; }
.yc-c { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--fg4); text-transform: uppercase; margin-top: 10px; }
.yc-add { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 48px 24px; min-height: 200px; cursor: pointer; background: var(--bg); transition: background 0.15s; }
.yc-add:hover { background: var(--bg2); }
.yc-add-icon { width: 34px; height: 34px; border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-size: 20px; color: var(--fg4); }
.yc-add-label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--fg4); text-transform: uppercase; }
.grid-pag { display: flex; align-items: center; justify-content: center; gap: 12px; padding: 24px 0; border-top: 1px solid var(--border); }
.grid-pag-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; background: none; border: 1px solid var(--border); color: var(--fg4); padding: 8px 16px; cursor: pointer; }
.grid-pag-btn:hover:not(:disabled) { color: var(--fg); border-color: var(--border2); }
.grid-pag-btn:disabled { opacity: 0.3; cursor: not-allowed; }
.grid-pag-info { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--fg4); min-width: 60px; text-align: center; }

.rd { max-width: var(--rd-max, 700px); margin: 0 auto; padding: 0 40px 120px; }
.rh { width: 100vw; margin-left: calc(-50vw + 50%); height: 280px; overflow: hidden; position: relative; background: var(--bg3); }
.rh img { width: 100%; height: 100%; object-fit: cover; filter: var(--hero-filter); }
.rh-ov { position: absolute; inset: 0; background: var(--hero-grad); display: flex; flex-direction: column; justify-content: flex-end; padding: 0 40px 40px; }
.rh-in { max-width: var(--rd-max, 700px); margin: 0 auto; }
.rh-y { font-family: 'Cardo', Georgia, serif; font-size: 72px; font-weight: 400; letter-spacing: -0.03em; line-height: 1; }
.rh-s { font-family: 'Cardo', Georgia, serif; font-size: 20px; font-style: italic; color: var(--fg3); margin-top: 4px; }
.vr { padding: 14px 0 0; }
.vr-link { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg4); text-decoration: none; transition: color 0.15s; }
.vr-link:hover { color: var(--fg); }
.qa-ix { display: flex; flex-wrap: wrap; align-items: center; gap: 6px; margin: 20px 0 0; }
.qa-ix-lbl { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--fg4); margin-right: 4px; }
.qa-ix-chip { font-family: 'IBM Plex Mono', monospace; font-size: 9px; letter-spacing: 0.04em; padding: 5px 9px; border: 1px solid var(--border); background: none; color: var(--fg4); cursor: pointer; transition: color 0.15s, border-color 0.15s; }
.qa-ix-chip:hover { color: var(--fg); border-color: var(--border2); }
.qa-ix-chip.on { background: var(--inv-bg); color: var(--inv-fg); border-color: var(--inv-bg); }
.bbk { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; color: var(--fg4); background: none; border: none; cursor: pointer; padding: 20px 0; display: block; letter-spacing: 0.04em; }
.bbk:hover { color: var(--fg); }
.reader-tabs { display: flex; border-bottom: 1px solid var(--border); margin: 20px 0 0; }
.reader-tab { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; padding: 10px 16px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--fg4); cursor: pointer; letter-spacing: 0.04em; }
.reader-tab.on { color: var(--fg); border-bottom-color: var(--fg); }
.reader-tab-pdf { margin-left: auto; }
.editor-banner { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--fg4); text-transform: uppercase; padding: 12px 0; letter-spacing: 0.04em; }
.qa-empty { text-align: center; padding: 80px 0; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 300; color: var(--fg4); }
.yr-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 0 8px; }
.yr-nb { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; padding: 9px 0; border: none; background: none; color: var(--fg4); cursor: pointer; letter-spacing: 0.04em; transition: color 0.15s; }
.yr-nb:hover { color: var(--fg); }

.sg { margin-bottom: 44px; }
.sg:last-child { margin-bottom: 0; }
.sg-h { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
.sg-guest .sg-h { justify-content: flex-end; }
.sg-guest .sg-st { margin-left: 0; }
.sg-av { width: 22px; height: 22px; border-radius: 50%; background: var(--inv-bg); color: var(--inv-fg); font-family: 'IBM Plex Mono', monospace; font-size: 7.5px; font-weight: 500; display: flex; align-items: center; justify-content: center; flex-shrink: 0; text-transform: uppercase; }
.sg-nm { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.06em; color: var(--fg4); }
.sg-ord { display: flex; flex-direction: column; gap: 1px; }
.sg-ord button { font-family: 'IBM Plex Mono', monospace; font-size: 9px; border: 1px solid var(--border); background: none; color: var(--fg4); padding: 2px 6px; cursor: pointer; line-height: 1; }
.sg-ord button:hover:not(:disabled) { color: var(--fg); }
.sg-ord button:disabled { opacity: 0.3; cursor: default; }
.sg-qa { font-family: 'IBM Plex Mono', monospace; font-size: 8px; text-transform: uppercase; padding: 3px 6px; border: 1px solid var(--border); background: none; color: var(--fg4); cursor: pointer; }
.sg-qa.on { background: var(--inv-bg); color: var(--inv-fg); border-color: var(--inv-bg); }
.sg-edit, .sg-del { font-family: 'IBM Plex Mono', monospace; font-size: 12px; background: none; border: none; color: var(--fg5); cursor: pointer; padding: 0 2px; }
.sg-edit:hover, .sg-del:hover { color: var(--fg); }
.sg-st { margin-left: auto; font-size: 15px; background: none; border: none; color: var(--fg5); cursor: pointer; padding: 0; }
.sg-st:hover { color: var(--fg2); }
.sg-st.on { color: var(--fg); }
.sg-en { line-height: var(--rd-lh, 1.75); color: var(--fg2); letter-spacing: 0.005em; white-space: pre-wrap; overflow-wrap: break-word; margin: 0; max-width: var(--rd-measure, 36rem); text-wrap: pretty; }
.sg-en.ed { cursor: text; }
.sg-zh { font-family: 'Noto Serif TC', 'Noto Serif SC', serif; line-height: calc(var(--rd-lh, 1.75) + 0.15); color: var(--fg4); margin-top: 14px; padding-top: 14px; position: relative; white-space: pre-wrap; overflow-wrap: break-word; margin-bottom: 0; max-width: var(--rd-measure, 36rem); }
.sg-zh::before { content: ''; position: absolute; top: 0; left: 0; width: 36px; border-top: 1px solid var(--border2); }
.sg-hdg { border-bottom: none; margin-top: 44px; margin-bottom: 24px; padding-bottom: 0; }
.sg-hdg:first-child { margin-top: 0; }
.sg-hdg-inner { border-left: 2px solid var(--border2); padding-left: 14px; }
.sg-hdg-text { font-weight: 400; letter-spacing: 0; color: var(--fg); margin: 0; line-height: 1.35; text-wrap: balance; }
.sg-img img { width: 100%; object-fit: contain; filter: var(--cover-filter); }
.sg-img-cap { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--fg4); letter-spacing: 0.06em; text-align: center; margin-top: 10px; }
.hl { background: var(--hl-bg); border-bottom: 1.5px solid var(--hl-border); padding: 1px 0; }
.note-mk { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border-radius: 50%; background: var(--fg4); color: var(--bg); font-family: 'IBM Plex Mono', monospace; font-size: 7.5px; font-weight: 500; margin-left: 2px; vertical-align: middle; position: relative; top: -1px; cursor: pointer; }
.note-mk:hover { background: var(--fg); }

.stb { position: fixed; z-index: 200; background: var(--inv-bg); padding: 3px; display: flex; gap: 1px; transform: translate(-50%, -100%); animation: ti 0.1s ease-out; }
.stb-b { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--inv-fg); text-transform: uppercase; letter-spacing: 0.04em; padding: 7px 14px; background: none; border: none; cursor: pointer; opacity: 0.7; }
.stb-b:hover { opacity: 1; }

.note-pop { position: fixed; z-index: 250; background: var(--bg); border: 1px solid var(--border2); padding: 18px 20px 16px; width: 290px; max-height: min(70vh, 460px); box-shadow: 0 8px 32px rgba(0,0,0,0.12); animation: fi 0.12s ease-out; display: flex; flex-direction: column; }
.note-pop-hd { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.note-pop-hd span { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--fg4); text-transform: uppercase; }
.note-pop-hd button { background: none; border: none; cursor: pointer; color: var(--fg4); font-size: 16px; line-height: 1; padding: 0; }
.note-pop-body { font-family: 'Cardo', Georgia, serif; font-size: 14px; line-height: 1.65; color: var(--fg2); white-space: pre-wrap; overflow-y: auto; flex: 1; }
.note-pop-del { font-family: 'IBM Plex Mono', monospace; font-size: 9px; color: var(--fg5); background: none; border: none; border-top: 1px solid var(--border); padding: 10px 0 0; cursor: pointer; margin-top: 12px; text-align: left; }
.note-pop-del:hover { color: var(--fg3); }

.mbg { position: fixed; inset: 0; background: rgba(128,128,128,0.2); backdrop-filter: blur(3px); z-index: 300; animation: fi 0.12s; display: flex; align-items: center; justify-content: center; }
.mbox { background: var(--bg); border: 1px solid var(--border); padding: 32px; width: 420px; max-width: 92vw; animation: mi 0.15s ease-out; }
.mbox h3 { font-family: 'Outfit', sans-serif; font-size: 18px; font-weight: 500; margin: 0 0 20px; }
.mbox label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg4); display: block; margin-bottom: 6px; margin-top: 14px; }
.mbox label:first-of-type { margin-top: 0; }
.mbox input, .mbox textarea { width: 100%; box-sizing: border-box; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 300; padding: 10px 12px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); outline: none; }
.mbox input:focus, .mbox textarea:focus { border-color: var(--fg3); }
.mbox textarea { min-height: 90px; resize: vertical; }
.mbox-exc { font-family: 'Cardo', Georgia, serif; font-size: 15px; font-style: italic; color: var(--fg3); padding: 10px 14px; background: var(--bg2); border-left: 2px solid var(--fg); margin-bottom: 16px; }
.mbox-acts { display: flex; gap: 8px; margin-top: 20px; justify-content: flex-end; }
.btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; padding: 9px 20px; border: 1px solid var(--border); background: var(--bg); color: var(--fg3); cursor: pointer; }
.btn:hover { border-color: var(--border2); color: var(--fg); }
.btn.p { background: var(--inv-bg); color: var(--inv-fg); border-color: var(--inv-bg); }
.btn.p:hover { opacity: 0.85; }
.btn:disabled { opacity: 0.4; cursor: not-allowed; }
.mta { width: 100%; box-sizing: border-box; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 300; padding: 10px 12px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); min-height: 90px; resize: vertical; outline: none; }
.mta:focus { border-color: var(--fg3); }

.ep { position: fixed; top: 52px; right: 0; width: 380px; height: calc(100vh - 52px); background: var(--bg); border-left: 1px solid var(--border); z-index: 150; overflow-y: auto; display: flex; flex-direction: column; animation: sr 0.2s ease-out; }
.ep-head { padding: 20px 28px 0; display: flex; justify-content: space-between; align-items: center; }
.ep-head h3 { font-family: 'Cardo', Georgia, serif; font-size: 20px; font-weight: 400; margin: 0; }
.ep-tabs { display: flex; padding: 0 28px; border-bottom: 1px solid var(--border); margin-top: 16px; }
.ep-tab { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; padding: 10px 16px; background: none; border: none; border-bottom: 2px solid transparent; color: var(--fg4); cursor: pointer; }
.ep-tab.on { color: var(--fg); border-bottom-color: var(--fg); }
.ep-body { padding: 20px 28px; flex: 1; }
.ep-field { margin-bottom: 16px; }
.ep-field label { font-family: 'IBM Plex Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg4); display: block; margin-bottom: 6px; }
.ep-field input, .ep-field textarea { width: 100%; box-sizing: border-box; font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 300; padding: 8px 10px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); outline: none; }
.ep-field input:focus, .ep-field textarea:focus { border-color: var(--fg3); }
.ep-field textarea { min-height: 80px; resize: vertical; }
.ep-btn { width: 100%; font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; padding: 10px; border: 1px solid var(--inv-bg); background: var(--inv-bg); color: var(--inv-fg); cursor: pointer; letter-spacing: 0.04em; }
.ep-btn:hover { opacity: 0.85; }
.ep-section-lbl { font-family: 'IBM Plex Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.08em; color: var(--fg4); margin-bottom: 12px; }
.ep-err { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: #c0392b; margin-bottom: 8px; }
.ep hr { border: none; border-top: 1px solid var(--border); margin: 24px 0; }
.cover-preview { aspect-ratio: 16 / 9; background: var(--bg3); overflow: hidden; margin-top: 8px; }
.cover-preview img { width: 100%; height: 100%; object-fit: cover; filter: var(--cover-filter); }
.pos-slider { width: 100%; }
.ep-set-row { display: flex; gap: 8px; align-items: flex-end; }
.ep-set-row input { flex: 1; }
.ep-set-btn { font-family: 'IBM Plex Mono', monospace; font-size: 9px; text-transform: uppercase; padding: 8px 12px; border: 1px solid var(--border); background: none; color: var(--fg4); cursor: pointer; white-space: nowrap; }
.ep-set-btn:hover { color: var(--fg); border-color: var(--border2); }

.lg { max-width: 320px; margin: 120px auto; padding: 0 40px; text-align: center; }
.lg h2 { font-family: 'Cardo', Georgia, serif; font-size: 28px; font-weight: 400; margin: 0 0 12px; }
.lg p { font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 300; color: var(--fg4); margin-bottom: 24px; }
.lg-in { width: 100%; box-sizing: border-box; font-family: 'Outfit', sans-serif; font-size: 15px; font-weight: 300; padding: 14px 16px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); text-align: center; letter-spacing: 0.06em; outline: none; display: block; margin-bottom: 12px; }
.lg-in:focus { border-color: var(--fg3); }
.lg-e { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--fg4); margin-bottom: 12px; min-height: 16px; }

.bp { max-width: 700px; margin: 48px auto; padding: 0 40px 120px; }
.bp-hdr { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
.bp-hdr h2 { font-family: 'Cardo', Georgia, serif; font-size: 36px; font-weight: 400; margin: 0; }
.emp { text-align: center; padding: 80px 0; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 300; color: var(--fg4); }
.bi { padding: 20px 0; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s, padding 0.15s, margin 0.15s; }
.bi:hover { background: var(--bg2); margin: 0 -8px; padding: 20px 8px; }
.bi-m { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--fg4); text-transform: uppercase; margin-bottom: 8px; }
.bi-t { font-family: 'Cardo', Georgia, serif; font-size: 16px; color: var(--fg2); line-height: 1.6; }

.site-footer { text-align: center; padding: 28px 40px; border-top: 1px solid var(--border); }
.site-footer-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; letter-spacing: 0.06em; background: none; border: none; color: var(--fg4); cursor: pointer; text-transform: uppercase; }
.site-footer-btn:hover { color: var(--fg); }
.scroll-top { position: fixed; bottom: 28px; right: 22px; width: 38px; height: 38px; border-radius: 50%; background: var(--inv-bg); color: var(--inv-fg); border: none; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 12px rgba(0,0,0,0.18); opacity: 0.82; z-index: 90; }
.scroll-top:hover { opacity: 1; }
.load-wrap { position: fixed; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; background: var(--bg); }
.load-brand { font-family: 'Outfit', sans-serif; font-size: 20px; font-weight: 500; }
.load-brand span { font-weight: 200; color: var(--fg4); }
.load-track { width: 100px; height: 1px; background: var(--border); overflow: hidden; }
.load-bar { width: 40%; height: 100%; background: var(--fg3); animation: ld 1.1s ease-in-out infinite; }

.sp { position: fixed; top: 52px; right: 0; width: 300px; height: calc(100vh - 52px); background: var(--bg); border-left: 1px solid var(--border); z-index: 140; overflow-y: auto; padding: 24px; box-sizing: border-box; animation: sr 0.2s ease-out; }
.sp h4 { font-family: 'IBM Plex Mono', monospace; font-size: 9px; text-transform: uppercase; letter-spacing: 0.1em; color: var(--fg4); margin: 0 0 12px; }
.sp-section { margin-bottom: 28px; }
.sp-row { display: flex; gap: 6px; flex-wrap: wrap; }
.sp-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; letter-spacing: 0.04em; padding: 6px 12px; border: 1px solid var(--border); background: var(--bg); color: var(--fg4); cursor: pointer; }
.sp-btn:hover { color: var(--fg); border-color: var(--border2); }
.sp-btn.on { background: var(--inv-bg); color: var(--inv-fg); border-color: var(--inv-bg); }
.sp select { width: 100%; font-family: 'IBM Plex Mono', monospace; font-size: 10px; padding: 7px 10px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); outline: none; cursor: pointer; }
.sp-divider { border: none; border-top: 1px solid var(--border); margin: 0 0 28px; }
.sp-spp { display: flex; align-items: center; gap: 10px; }
.sp-spp input { flex: 1; font-family: 'IBM Plex Mono', monospace; font-size: 11px; padding: 6px 8px; border: 1px solid var(--border); background: var(--bg); color: var(--fg); outline: none; width: 60px; }
.sp-spp label { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--fg4); }
.sp-stepper { align-items: center; }
.sp-stepper-val { font-family: 'IBM Plex Mono', monospace; font-size: 11px; color: var(--fg2); min-width: 44px; text-align: center; }
.sp-close { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 16px; color: var(--fg4); cursor: pointer; }
.sp-close:hover { color: var(--fg); }

.book-wrap { width: 100vw; margin-left: calc(-50vw + 50%); display: flex; flex-direction: column; min-height: calc(100vh - 52px); }
.book-spread { display: grid; grid-template-columns: 1fr 1fr; flex: 1; border-top: 1px solid var(--border); }
.book-page { padding: 48px 52px; overflow: hidden; min-height: 0; box-sizing: border-box; border-right: 1px solid var(--border); }
.book-page:last-child { border-right: none; }
.book-page-label { font-family: 'IBM Plex Mono', monospace; font-size: 8px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--fg5); margin-bottom: 32px; display: flex; justify-content: space-between; }
.book-nav { display: flex; align-items: center; justify-content: space-between; padding: 20px 52px; background: var(--bg); }
.book-nav-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; padding: 9px 0; border: none; background: none; color: var(--fg4); cursor: pointer; letter-spacing: 0.04em; transition: color 0.15s; }
.book-nav-btn:hover:not(:disabled) { color: var(--fg); }
.book-nav-btn:disabled { opacity: 0.25; cursor: not-allowed; }
.book-nav-info { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--fg4); text-align: center; }

.pnav { display: flex; align-items: center; justify-content: space-between; padding: 28px 0 0; border-top: 1px solid var(--border); margin-top: 32px; }
.pnav-btn { font-family: 'IBM Plex Mono', monospace; font-size: 10px; text-transform: uppercase; padding: 9px 0; border: none; background: none; color: var(--fg4); cursor: pointer; letter-spacing: 0.04em; transition: color 0.15s; }
.pnav-btn:hover:not(:disabled) { color: var(--fg); }
.pnav-btn:disabled { opacity: 0.25; cursor: not-allowed; }
.pnav-info { font-family: 'IBM Plex Mono', monospace; font-size: 10px; color: var(--fg4); }

@keyframes ld { 0% { transform: translateX(-100%) } 100% { transform: translateX(100%) } }
@keyframes fi { from { opacity: 0 } }
@keyframes mi { from { opacity: 0; transform: translateY(4px) } }
@keyframes ti { from { opacity: 0; transform: translateY(3px) } }
@keyframes sr { from { transform: translateX(100%) } }

/* ── Print / PDF export ── */
.print-root { display: none; }
@page { size: portrait; margin: 20mm 18mm; }
@media print {
  [data-printing] #root > *:not(.print-root) { display: none !important; }
  .nav, .scroll-top, .sp, .ix, .ep, .stb, .note-pop, .read-progress, .site-footer { display: none !important; }
  body { background: #fff !important; color: #111 !important; }
  .print-root { display: block; }
  .print-title { break-after: page; page-break-after: always; padding-top: 55mm; text-align: center; }
  .print-kicker { font-family: 'IBM Plex Mono', monospace; font-size: 9pt; letter-spacing: 0.1em; text-transform: uppercase; color: #666; margin-bottom: 18pt; }
  .print-title h1 { font-size: 44pt; font-weight: 400; margin: 0; color: #111; }
  .print-sub { font-size: 15pt; font-style: italic; color: #444; margin-top: 8pt; }
  .print-date { font-family: 'IBM Plex Mono', monospace; font-size: 8pt; color: #888; margin-top: 24pt; }
  .print-seg { break-inside: avoid; page-break-inside: avoid; margin-bottom: 14pt; }
  .print-hdg { margin-top: 26pt; break-after: avoid; page-break-after: avoid; }
  .print-hdg p { font-size: 15pt; color: #111; margin: 0; border-left: 2pt solid #999; padding-left: 9pt; line-height: 1.3; }
  .print-year-hd { font-size: 20pt; color: #111; margin: 28pt 0 14pt; break-after: avoid; page-break-after: avoid; }
  .print-speaker { font-family: 'IBM Plex Mono', monospace; font-size: 7.5pt; text-transform: uppercase; letter-spacing: 0.08em; color: #666; margin-bottom: 5pt; break-after: avoid; page-break-after: avoid; }
  .print-en { font-size: 11.5pt; line-height: 1.6; color: #111; margin: 0; white-space: pre-wrap; overflow-wrap: break-word; orphans: 3; widows: 3; }
  .print-zh { font-family: 'Noto Serif TC', 'Noto Serif SC', serif; font-size: 10.5pt; line-height: 1.7; color: #444; margin: 6pt 0 0; white-space: pre-wrap; overflow-wrap: break-word; orphans: 3; widows: 3; }
  .print-img img { max-width: 100%; }
  .print-cap { font-family: 'IBM Plex Mono', monospace; font-size: 8pt; color: #666; text-align: center; margin-top: 4pt; }
  .print-root .hl { background: none !important; border-bottom: 1px solid #bbb; padding: 0; }
  .print-root .note-mk { display: none !important; }
}

@media (max-width: 768px) {
  .nav { padding: 0 16px; }
  .gp, .rd, .bp { padding-left: 20px; padding-right: 20px; }
  .gr { grid-template-columns: 1fr; }
  .gp-hdr { flex-direction: column; gap: 8px; }
  .rh { height: 260px; }
  .rh-y { font-size: 48px; }
  .ep { width: 100%; }
  .nb { padding: 5px 8px; font-size: 9px; }
  .book-spread { grid-template-columns: 1fr; }
  .book-page { padding: 28px 24px; }
  .sp { width: 100%; }
}
`

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  // ── State ──
  const [theme, setTheme] = useState(() => {
    const v = localStorage.getItem('bk_theme')
    return v === 'dark' || v === 'sepia' ? v : 'light'
  })
  const [page, setPage] = useState('grid')
  const [years, setYears] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentYear, setCurrentYear] = useState(null)
  const [chineseMode, setChineseMode] = useState(() => {
    const v = localStorage.getItem('bk_ch')
    return v === 'trad' || v === 'simp' ? 'trad' : 'none'
  })
  const [fontIdx, setFontIdx] = useState(() => {
    const v = parseInt(localStorage.getItem('bk_font'))
    return v >= 0 && v < FONTS.length ? v : 0
  })
  const [fontSize, setFontSize] = useState(() => {
    const v = parseInt(localStorage.getItem('bk_fs'))
    return v >= FS_MIN && v <= FS_MAX ? v : 17
  })
  const [lineHeight, setLineHeight] = useState(() => localStorage.getItem('bk_lh') || 'normal')
  const [contentWidth, setContentWidth] = useState(() => localStorage.getItem('bk_width') || 'normal')
  const [textAlign, setTextAlign] = useState(() => localStorage.getItem('bk_align') || 'left')
  const [isEditor, setIsEditor] = useState(false)
  const [editorPanelOpen, setEditorPanelOpen] = useState(false)
  const [editorTab, setEditorTab] = useState('year')
  const [passwordInput, setPasswordInput] = useState('')
  const [loginError, setLoginError] = useState('')
  const [loginLoading, setLoginLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState('idle')
  const passwordRef = useRef('')
  const [highlights, setHighlights] = useState({})
  const [sidenotes, setSidenotes] = useState({})
  const [bookmarks, setBookmarks] = useState(new Set())
  const [selToolbar, setSelToolbar] = useState(null)
  const [sidenoteModal, setSidenoteModal] = useState(null)
  const [sidenotePopover, setSidenotePopover] = useState(null)
  const [editorForm, setEditorForm] = useState({ speaker: 'Warren Buffett', en: '', zh: '' })
  const [editorError, setEditorError] = useState('')
  const [sortAsc, setSortAsc] = useState(false)
  const [gridPage, setGridPage] = useState(0)
  const [sidenoteText, setSidenoteText] = useState('')
  const readerReady = useRef(false)
  const [imageForm, setImageForm] = useState({ url: '', caption: '' })
  const [headingInput, setHeadingInput] = useState('')
  const [addYearModalOpen, setAddYearModalOpen] = useState(false)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [editingSegment, setEditingSegment] = useState(null)
  const [readerTab, setReaderTab] = useState('transcript')
  const [newYearForm, setNewYearForm] = useState({ year: '', title: '' })
  const [readingMode, setReadingMode] = useState(() => localStorage.getItem('bk_mode') || 'scroll')
  const [readerPage, setReaderPage] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [segmentsPerPage, setSegmentsPerPage] = useState(() => parseInt(localStorage.getItem('bk_spp') || '15'))
  const [printJob, setPrintJob] = useState(null)
  const progressRef = useRef(null)
  const progressValRef = useRef(0)
  const navRef = useRef(null)
  const navHiddenRef = useRef(false)
  const lastScrollYRef = useRef(0)

  // ── Derived values ──
  const currentYearData = years.find(y => y.year === currentYear)
  const sortedYears = [...years].sort((a, b) => sortAsc ? a.year - b.year : b.year - a.year)
  const totalGridPages = Math.ceil(sortedYears.length / 9)
  const pageYears = sortedYears.slice(gridPage * 9, (gridPage + 1) * 9)
  const sortedYearNums = [...years].map(y => y.year).sort((a, b) => a - b)
  const currentYearIdx = sortedYearNums.indexOf(currentYear)

  const currentSegments = readerTab === 'transcript'
    ? (currentYearData?.segments || [])
    : (currentYearData?.segments || []).filter(s => s.isQA)

  const totalReaderPages = Math.max(1, Math.ceil(currentSegments.length / segmentsPerPage))
  const pageSegments = currentSegments.slice(readerPage * segmentsPerPage, (readerPage + 1) * segmentsPerPage)
  const leftPageSegs = pageSegments.slice(0, Math.ceil(pageSegments.length / 2))
  const rightPageSegs = pageSegments.slice(Math.ceil(pageSegments.length / 2))

  const qaIndex = (currentYearData?.segments || []).filter(s => s.isQA && s.type === 'heading')

  function getSegmentPage(segId) {
    const segs = readerTab === 'transcript'
      ? (currentYearData?.segments || [])
      : (currentYearData?.segments || []).filter(s => s.isQA)
    const idx = segs.findIndex(s => s.id === segId)
    return idx === -1 ? 0 : Math.floor(idx / segmentsPerPage)
  }

  // ── Effects ──
  useEffect(() => {
    fetch('/api/data')
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        setYears(Array.isArray(data) ? data : (data.years || []))
        setLoading(false)
      })
      .catch(() => setLoading(false))

    const onPop = (e) => {
      const s = e.state
      if (s?.page === 'reader') {
        setPage('reader')
        setCurrentYear(s.year)
        setReaderPage(0)
      } else {
        setPage('grid')
        setCurrentYear(null)
      }
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  useEffect(() => {
    fetch('/api/reader')
      .then(r => r.ok ? r.json() : {})
      .then(data => {
        if (data.highlights) setHighlights(data.highlights)
        if (data.sidenotes) setSidenotes(data.sidenotes)
        if (data.bookmarks) setBookmarks(new Set(data.bookmarks))
        setTimeout(() => { readerReady.current = true }, 200)
      })
      .catch(() => { readerReady.current = true })
  }, [])

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('bk_theme', theme)
  }, [theme])

  // Apply & persist reading preferences
  useEffect(() => {
    const el = document.documentElement
    el.setAttribute('data-lh', lineHeight)
    el.setAttribute('data-width', contentWidth)
    el.setAttribute('data-align', textAlign)
    localStorage.setItem('bk_lh', lineHeight)
    localStorage.setItem('bk_width', contentWidth)
    localStorage.setItem('bk_align', textAlign)
  }, [lineHeight, contentWidth, textAlign])

  useEffect(() => {
    localStorage.setItem('bk_font', String(fontIdx))
    localStorage.setItem('bk_fs', String(fontSize))
    localStorage.setItem('bk_ch', chineseMode)
  }, [fontIdx, fontSize, chineseMode])

  // Auto-save years
  const saveYearsTimer = useRef(null)
  useEffect(() => {
    if (!isEditor || !passwordRef.current) return
    if (saveYearsTimer.current) clearTimeout(saveYearsTimer.current)
    saveYearsTimer.current = setTimeout(() => {
      setSaveStatus('saving')
      fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordRef.current, years }),
      })
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(() => { setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000) })
        .catch(() => { setSaveStatus('error'); setTimeout(() => setSaveStatus('idle'), 3000) })
    }, 2500)
    return () => clearTimeout(saveYearsTimer.current)
  }, [years, isEditor])

  // Auto-save reader
  const saveReaderTimer = useRef(null)
  useEffect(() => {
    if (!readerReady.current) return
    if (saveReaderTimer.current) clearTimeout(saveReaderTimer.current)
    saveReaderTimer.current = setTimeout(() => {
      fetch('/api/reader', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ highlights, sidenotes, bookmarks: [...bookmarks] }),
      }).catch(() => {})
    }, 1500)
    return () => clearTimeout(saveReaderTimer.current)
  }, [highlights, sidenotes, bookmarks])

  // Scroll listener — progress bar and nav visibility mutate DOM via refs
  // (inner components remount on every render, so per-frame setState is off-limits)
  useEffect(() => {
    const panelsOpen = showSettings || editorPanelOpen
    const autoHide = page === 'reader' && readingMode === 'scroll' && !panelsOpen
    if (!autoHide) {
      navHiddenRef.current = false
      navRef.current?.classList.remove('nav-hidden')
    }
    const onScroll = () => {
      const y = window.scrollY
      setShowScrollTop(y > 400)
      if (progressRef.current) {
        const max = document.documentElement.scrollHeight - window.innerHeight
        const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0
        progressValRef.current = p
        progressRef.current.style.transform = `scaleX(${p})`
      }
      const goingDown = y > lastScrollYRef.current
      lastScrollYRef.current = y
      const hidden = autoHide && goingDown && y > 300
      if (hidden !== navHiddenRef.current) {
        navHiddenRef.current = hidden
        navRef.current?.classList.toggle('nav-hidden', hidden)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [page, readingMode, showSettings, editorPanelOpen])

  // Nav remounts whenever App re-renders; re-apply ref-driven UI state after each render
  useEffect(() => {
    navRef.current?.classList.toggle('nav-hidden', navHiddenRef.current)
    if (progressRef.current) progressRef.current.style.transform = `scaleX(${progressValRef.current})`
  })

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (page === 'reader' && readingMode === 'book') {
        if (e.key === 'ArrowLeft' && readerPage > 0) prevPage()
        if (e.key === 'ArrowRight' && readerPage < totalReaderPages - 1) nextPage()
      }
      if (e.key === 'Escape') {
        setShowSettings(false)
        setEditorPanelOpen(false)
        setSelToolbar(null)
        setSidenoteModal(null)
        setSidenotePopover(null)
        setAddYearModalOpen(false)
        setEditingSegment(null)
        setReportModalOpen(false)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [page, readingMode, readerPage, totalReaderPages])

  // Persist reading mode
  useEffect(() => {
    localStorage.setItem('bk_mode', readingMode)
    setReaderPage(0)
  }, [readingMode])

  // Persist segments per page
  useEffect(() => {
    localStorage.setItem('bk_spp', String(segmentsPerPage))
  }, [segmentsPerPage])

  // Print / PDF export: show print view, wait for fonts+images, open dialog
  useEffect(() => {
    if (!printJob) return
    let cancelled = false
    let done = false
    const prevTitle = document.title
    const root = document.documentElement
    root.setAttribute('data-printing', '1')
    document.title = printJob.scope === 'bookmarks'
      ? 'Berkshire — Saved Passages'
      : `Berkshire ${currentYear} — ${printJob.scope === 'qa' ? 'Q&A' : 'Transcript'}`
    const cleanup = () => {
      if (done) return
      done = true
      root.removeAttribute('data-printing')
      document.title = prevTitle
      setPrintJob(null)
    }
    window.addEventListener('afterprint', cleanup)
    const imgs = [...document.querySelectorAll('.print-root img')]
    const waits = imgs.map(img => img.complete
      ? Promise.resolve()
      : new Promise(res => { img.onload = img.onerror = res }))
    if (document.fonts?.ready) waits.push(document.fonts.ready)
    Promise.race([Promise.all(waits), new Promise(res => setTimeout(res, 3000))]).then(() => {
      if (cancelled) return
      window.print()
      // Chrome blocks until the dialog closes; Safari returns early and fires afterprint
      setTimeout(cleanup, 500)
    })
    return () => {
      cancelled = true
      window.removeEventListener('afterprint', cleanup)
      if (!done) {
        root.removeAttribute('data-printing')
        document.title = prevTitle
      }
    }
  }, [printJob])

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [readerPage])

  // Reset reader page when tab or year changes
  useEffect(() => {
    setReaderPage(0)
  }, [readerTab, currentYear])

  // ── Navigation ──
  function goToReader(year) {
    setCurrentYear(year)
    setPage('reader')
    setReaderPage(0)
    setReaderTab('transcript')
    window.history.pushState({ page: 'reader', year }, '')
    window.scrollTo(0, 0)
  }

  function goToGrid() {
    setPage('grid')
    setCurrentYear(null)
    setEditorPanelOpen(false)
    setShowSettings(false)
    window.history.pushState({ page: 'grid' }, '')
    window.scrollTo(0, 0)
  }

  function prevPage() {
    if (readerPage > 0) setReaderPage(p => p - 1)
  }
  function nextPage() {
    if (readerPage < totalReaderPages - 1) setReaderPage(p => p + 1)
  }

  // ── Login ──
  async function handleLogin(e) {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const r = await fetch('/api/data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput, verify: true }),
      })
      const data = await r.json()
      if (data.ok) {
        passwordRef.current = passwordInput
        setIsEditor(true)
        setPasswordInput('')
        setPage('grid')
      } else {
        setLoginError('Incorrect password')
      }
    } catch {
      setLoginError('Connection error')
    }
    setLoginLoading(false)
  }

  function handleLogout() {
    setIsEditor(false)
    passwordRef.current = ''
    setEditorPanelOpen(false)
  }

  // ── Highlights & Sidenotes ──
  function handleMouseUp(e, segId) {
    if (e.target.closest('.stb') || e.target.closest('.note-pop')) return
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.toString().trim()) {
      setSelToolbar(null)
      return
    }
    const range = sel.getRangeAt(0)
    const rect = range.getBoundingClientRect()
    setSelToolbar({
      x: rect.left + rect.width / 2,
      y: rect.top + window.scrollY,
      text: sel.toString().trim(),
      segId,
    })
  }

  function addHighlight(segId, text) {
    setHighlights(prev => {
      const arr = prev[segId] ? [...prev[segId]] : []
      if (!arr.includes(text)) arr.push(text)
      return { ...prev, [segId]: arr }
    })
    setSelToolbar(null)
    window.getSelection()?.removeAllRanges()
  }

  function openSidenoteModal(segId, text) {
    setSidenoteModal({ segId, excerpt: text })
    setSidenoteText('')
    setSelToolbar(null)
    window.getSelection()?.removeAllRanges()
  }

  function saveSidenote(segId, text, noteText) {
    if (!noteText.trim()) return
    setSidenotes(prev => {
      const arr = prev[segId] ? [...prev[segId]] : []
      arr.push({ excerpt: text, note: noteText })
      return { ...prev, [segId]: arr }
    })
    setSidenoteModal(null)
    setSidenoteText('')
  }

  function deleteSidenote(segId, idx) {
    setSidenotes(prev => {
      const arr = [...(prev[segId] || [])]
      arr.splice(idx, 1)
      return { ...prev, [segId]: arr }
    })
    setSidenotePopover(null)
  }

  // ── Bookmarks ──
  function toggleBookmark(segId) {
    setBookmarks(prev => {
      const s = new Set(prev)
      if (s.has(segId)) s.delete(segId)
      else s.add(segId)
      return s
    })
  }

  // ── renderText ──
  function renderText(text, segId, hls, notes) {
    if (!text) return null
    const displayText = text

    const segHls = hls[segId] || []
    const segNotes = notes[segId] || []

    if (segHls.length === 0 && segNotes.length === 0) return displayText

    // Build annotation markers sorted by position in text
    const markers = []
    for (const hl of segHls) {
      let start = 0
      let idx
      while ((idx = displayText.indexOf(hl, start)) !== -1) {
        markers.push({ type: 'hl', start: idx, end: idx + hl.length, text: hl })
        start = idx + hl.length
      }
    }
    for (let ni = 0; ni < segNotes.length; ni++) {
      const { excerpt } = segNotes[ni]
      const idx = displayText.indexOf(excerpt)
      if (idx !== -1) {
        markers.push({ type: 'note', start: idx, end: idx + excerpt.length, idx: ni })
      }
    }
    markers.sort((a, b) => a.start - b.start)

    // Merge overlapping and build nodes
    const nodes = []
    let cursor = 0
    for (const m of markers) {
      if (m.start < cursor) continue
      if (m.start > cursor) nodes.push(displayText.slice(cursor, m.start))
      if (m.type === 'hl') {
        nodes.push(<span key={`hl-${m.start}`} className="hl">{displayText.slice(m.start, m.end)}</span>)
      } else {
        const noteIdx = m.idx
        nodes.push(
          <span key={`note-${m.start}`}>
            {displayText.slice(m.start, m.end)}
            <span
              className="note-mk"
              onClick={(e) => {
                e.stopPropagation()
                const rect = e.currentTarget.getBoundingClientRect()
                setSidenotePopover({
                  segId, idx: noteIdx,
                  note: segNotes[noteIdx].note,
                  x: rect.left, y: rect.bottom + window.scrollY + 6,
                })
              }}
            >{noteIdx + 1}</span>
          </span>
        )
      }
      cursor = m.end
    }
    if (cursor < displayText.length) nodes.push(displayText.slice(cursor))
    return nodes
  }

  // ── renderSegment ──
  function renderSegment(seg, index, allSegs) {
    const isBookmarked = bookmarks.has(seg.id)
    const fontStyle = { fontFamily: FONTS[fontIdx].value, fontSize }

    if (seg.type === 'heading') {
      return (
        <div key={seg.id} className="sg sg-hdg">
          <div className="sg-hdg-inner">
            {isEditor && (
              <div className="sg-h" style={{ marginBottom: 6 }}>
                {allSegs && index > 0 && (
                  <div className="sg-ord">
                    <button onClick={() => moveSegment(seg.id, -1)} disabled={index === 0}>▲</button>
                    <button onClick={() => moveSegment(seg.id, 1)} disabled={index === allSegs.length - 1}>▼</button>
                  </div>
                )}
                <button className={`sg-qa${seg.isQA ? ' on' : ''}`} onClick={() => toggleSegQA(seg.id)}>QA</button>
                <button className="sg-edit" onClick={() => setEditingSegment({ ...seg })}>✎</button>
                <button className="sg-del" onClick={() => deleteSegment(seg.id)}>✕</button>
              </div>
            )}
            <p className="sg-hdg-text" style={{ ...fontStyle, fontSize: Math.round(fontSize * 1.3) }}>{seg.text}</p>
          </div>
        </div>
      )
    }

    if (seg.type === 'image') {
      return (
        <div key={seg.id} className="sg sg-img">
          {isEditor && (
            <div className="sg-h">
              <button className="sg-del" onClick={() => deleteSegment(seg.id)}>✕</button>
            </div>
          )}
          {seg.url && <img src={seg.url} alt={seg.caption || ''} />}
          {seg.caption && <p className="sg-img-cap">{seg.caption}</p>}
        </div>
      )
    }

    const bg = avatarBg(seg.speaker)
    const avStyle = bg ? { background: bg, color: '#fff' } : {}

    return (
      <div key={seg.id} className={`sg${bg ? '' : ' sg-guest'}`} onMouseUp={e => handleMouseUp(e, seg.id)}>
        <div className="sg-h">
          <div className="sg-av" style={avStyle}>{initials(seg.speaker || '')}</div>
          <span className="sg-nm">{seg.speaker || 'Speaker'}</span>
          {isEditor && allSegs && (
            <>
              <div className="sg-ord">
                <button onClick={() => moveSegment(seg.id, -1)} disabled={index === 0}>▲</button>
                <button onClick={() => moveSegment(seg.id, 1)} disabled={index === allSegs.length - 1}>▼</button>
              </div>
              <button className={`sg-qa${seg.isQA ? ' on' : ''}`} onClick={() => toggleSegQA(seg.id)}>QA</button>
              <button className="sg-edit" onClick={() => setEditingSegment({ ...seg })}>✎</button>
              <button className="sg-del" onClick={() => deleteSegment(seg.id)}>✕</button>
            </>
          )}
          <button className={`sg-st${isBookmarked ? ' on' : ''}`} onClick={() => toggleBookmark(seg.id)}>
            {isBookmarked ? '★' : '☆'}
          </button>
        </div>
        <p className="sg-en" style={fontStyle}>
          {renderText(seg.en, seg.id, highlights, sidenotes)}
        </p>
        {seg.zh && chineseMode !== 'none' && (
          <p className="sg-zh" style={{ fontSize: fontSize - 1 }}>
            {renderText(seg.zh, seg.id, highlights, sidenotes)}
          </p>
        )}
      </div>
    )
  }

  // ── Editor helpers ──
  function updateYearField(field, value) {
    setYears(prev => prev.map(y => y.year === currentYear ? { ...y, [field]: value } : y))
  }

  function addSegment(type) {
    const id = `seg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    let seg = { id, type }
    if (type === 'text') seg = { ...seg, speaker: editorForm.speaker, en: editorForm.en, zh: editorForm.zh, isQA: false }
    if (type === 'heading') seg = { ...seg, text: headingInput, isQA: false }
    if (type === 'image') seg = { ...seg, url: imageForm.url, caption: imageForm.caption }
    setYears(prev => prev.map(y => y.year === currentYear
      ? { ...y, segments: [...(y.segments || []), seg] }
      : y))
    if (type === 'text') setEditorForm({ speaker: 'Warren Buffett', en: '', zh: '' })
    if (type === 'heading') setHeadingInput('')
    if (type === 'image') setImageForm({ url: '', caption: '' })
  }

  function deleteSegment(segId) {
    setYears(prev => prev.map(y => y.year === currentYear
      ? { ...y, segments: (y.segments || []).filter(s => s.id !== segId) }
      : y))
  }

  function moveSegment(segId, dir) {
    setYears(prev => prev.map(y => {
      if (y.year !== currentYear) return y
      const segs = [...(y.segments || [])]
      const i = segs.findIndex(s => s.id === segId)
      if (i < 0) return y
      const ni = i + dir
      if (ni < 0 || ni >= segs.length) return y
      ;[segs[i], segs[ni]] = [segs[ni], segs[i]]
      return { ...y, segments: segs }
    }))
  }

  function toggleSegQA(segId) {
    setYears(prev => prev.map(y => y.year !== currentYear ? y : {
      ...y,
      segments: (y.segments || []).map(s => s.id === segId ? { ...s, isQA: !s.isQA } : s),
    }))
  }

  function saveEditingSegment() {
    if (!editingSegment) return
    setYears(prev => prev.map(y => y.year !== currentYear ? y : {
      ...y,
      segments: (y.segments || []).map(s => s.id === editingSegment.id ? { ...editingSegment } : s),
    }))
    setEditingSegment(null)
  }

  function addYear() {
    const yr = parseInt(newYearForm.year)
    if (!yr || years.find(y => y.year === yr)) {
      setEditorError('Invalid or duplicate year')
      return
    }
    const newY = { year: yr, title: newYearForm.title || `Annual Meeting ${yr}`, segments: [], coverUrl: '', videoUrl: '' }
    setYears(prev => [...prev, newY])
    setNewYearForm({ year: '', title: '' })
    setAddYearModalOpen(false)
    goToReader(yr)
  }

  function deleteYear(yr) {
    if (!window.confirm(`Delete ${yr}?`)) return
    setYears(prev => prev.filter(y => y.year !== yr))
    if (currentYear === yr) goToGrid()
  }

  function manualSave() {
    if (!passwordRef.current) return
    setSaveStatus('saving')
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordRef.current, years }),
    })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(() => { setSaveStatus('saved'); setTimeout(() => setSaveStatus('idle'), 2000) })
      .catch(() => { setSaveStatus('error'); setTimeout(() => setSaveStatus('idle'), 3000) })
  }

  // ── Export ──
  function openPrint(scope) {
    setPrintJob({ scope })
  }

  function exportBookmarks() {
    const items = []
    years.forEach(y => {
      ;(y.segments || []).forEach(seg => {
        if (bookmarks.has(seg.id)) items.push({ year: y.year, seg })
      })
    })
    if (items.length === 0) return
    const html = `<html><body style="font-family:Georgia,serif;max-width:700px;margin:40px auto;padding:0 20px">
<h1 style="font-size:28px;margin-bottom:32px">Berkshire Hathaway — Saved Passages</h1>
${items.map(({ year, seg }) => `
<div style="margin-bottom:32px;padding-bottom:32px;border-bottom:1px solid #eee">
  <div style="font-family:monospace;font-size:11px;color:#888;margin-bottom:8px">${year} · ${seg.speaker || ''}</div>
  <p style="line-height:1.8;color:#333">${seg.en || ''}</p>
  ${seg.zh ? `<p style="line-height:1.9;color:#999;font-size:14px">${seg.zh}</p>` : ''}
</div>`).join('')}
</body></html>`
    const dateStr = new Date().toISOString().slice(0, 10)
    const blob = new Blob([html], { type: 'application/msword' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `berkshire-passages-${dateStr}.doc`
    a.click()
    URL.revokeObjectURL(url)
  }

  // ─── Components ───────────────────────────────────────────────────────────

  function LoadingScreen() {
    return (
      <div className="load-wrap" data-theme={theme}>
        <div className="load-brand">Berkshire <span>Letters</span></div>
        <div className="load-track"><div className="load-bar" /></div>
      </div>
    )
  }

  function Nav() {
    const chLabel = chineseMode === 'trad' ? '繁中' : '中'
    const saveLabel = saveStatus === 'saving' ? 'Saving…' : saveStatus === 'saved' ? '✓ Saved' : saveStatus === 'error' ? 'Err' : 'Save'
    return (
      <nav className="nav" ref={navRef}>
        <div className="nav-brand" onClick={goToGrid}>
          Berkshire <span>Letters</span>
        </div>
        <div className="nav-r">
          <button className="nb" onClick={() => setTheme(t => t === 'light' ? 'sepia' : t === 'sepia' ? 'dark' : 'light')}>
            {theme === 'light' ? '●' : theme === 'sepia' ? '◐' : '○'}
          </button>
          <button className={`nb nb-star${bookmarks.size > 0 ? ' on' : ''}`} onClick={() => { setPage('bookmarks'); window.history.pushState({ page: 'bookmarks' }, '') }}>
            ★
          </button>
          {page === 'reader' && (
            <button className="nb" onClick={() => setChineseMode(m => m === 'none' ? 'trad' : 'none')}>
              {chLabel}
            </button>
          )}
          <button className={`nb${showSettings ? ' on' : ''}`} onClick={() => { setShowSettings(v => !v); setEditorPanelOpen(false) }}>
            Aa
          </button>
          {isEditor && page === 'reader' && (
            <button className={`nb${editorPanelOpen ? ' on' : ''}`} onClick={() => { setEditorPanelOpen(v => !v); setShowSettings(false) }}>
              {editorPanelOpen ? 'Close' : '+ Edit'}
            </button>
          )}
          {isEditor && (
            <>
              <button className="nb" onClick={manualSave} disabled={saveStatus === 'saving'}>
                {saveLabel}
              </button>
              <button className="nb" onClick={handleLogout}>Logout</button>
            </>
          )}
          {!isEditor && (
            <button className="nb" style={{ fontSize: 18, letterSpacing: 0, padding: '4px 10px' }} onClick={() => { setPage('login'); window.history.pushState({ page: 'login' }, '') }}>♝</button>
          )}
        </div>
      </nav>
    )
  }

  function GridPage() {
    return (
      <div className="gp">
        <div className="gp-hdr">
          <div>
            <p className="gp-d">Annual Shareholders Meeting Transcripts, 1994–2026</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="gp-count">{years.length} years</span>
            <button className="sort-btn" onClick={() => { setSortAsc(v => !v); setGridPage(0) }} title="Sort order">
              {sortAsc ? 'Oldest' : 'Newest'}
            </button>
          </div>
        </div>
        <div className="gr">
          {pageYears.map(y => (
            <div key={y.year} className="yc-wrap">
              {isEditor && (
                <button className="yc-del" onClick={() => deleteYear(y.year)}>✕</button>
              )}
              <div className="yc" onClick={() => goToReader(y.year)}>
                <div className="yc-i">
                  {y.cover ? <img src={y.cover} alt={String(y.year)} style={y.coverPos ? { objectPosition: `center ${y.coverPos}%` } : {}} /> : null}
                </div>
                <div className="yc-b">
                  <div className="yc-y">{y.year}</div>
                  {y.title && <div className="yc-s">{y.title}</div>}
                  <div className="yc-c">{(y.segments || []).filter(s => s.type === 'text').length} conversations</div>
                </div>
              </div>
            </div>
          ))}
          {isEditor && (
            <div className="yc-wrap">
              <div className="yc-add" onClick={() => setAddYearModalOpen(true)}>
                <div className="yc-add-icon">+</div>
                <span className="yc-add-label">Add Year</span>
              </div>
            </div>
          )}
          {!isEditor && gridPage >= totalGridPages - 1 && (
            <div className="yc-wrap">
              <div className="yc-soon">
                <div className="yc-soon-t">More years on the way</div>
                <div className="yc-soon-s">New transcripts added regularly</div>
              </div>
            </div>
          )}
        </div>
        {totalGridPages > 1 && (
          <div className="grid-pag">
            <button className="grid-pag-btn" disabled={gridPage === 0} onClick={() => setGridPage(p => p - 1)}>← Prev</button>
            <span className="grid-pag-info">{gridPage + 1} / {totalGridPages}</span>
            <button className="grid-pag-btn" disabled={gridPage >= totalGridPages - 1} onClick={() => setGridPage(p => p + 1)}>Next →</button>
          </div>
        )}
      </div>
    )
  }

  function ReaderHero() {
    const yd = currentYearData
    return (
      <>
        {yd?.coverUrl ? (
          <div className="rh">
            <img src={yd.coverUrl} alt={String(currentYear)} style={yd.coverPos ? { objectPosition: `center ${yd.coverPos}%` } : {}} />
            <div className="rh-ov">
              <div className="rh-in">
                <div className="rh-y">{currentYear}</div>
                {yd.title && <div className="rh-s">{yd.title}</div>}
              </div>
            </div>
          </div>
        ) : (
          <div className="rh" style={{ display: 'flex', alignItems: 'flex-end', padding: '0 40px 40px' }}>
            <div className="rh-in">
              <div className="rh-y">{currentYear}</div>
              {yd?.title && <div className="rh-s">{yd.title}</div>}
            </div>
          </div>
        )}
        {yd?.videoUrl && (
          <div className="vr">
            <a className="vr-link" href={yd.videoUrl} target="_blank" rel="noopener noreferrer">▶&nbsp;&nbsp;Watch the meeting</a>
          </div>
        )}
      </>
    )
  }

  function ReaderScrollPage() {
    const segs = currentSegments
    const allSegs = currentYearData?.segments || []
    return (
      <div className="rd">
        <button className="bbk" onClick={goToGrid}>← All Years</button>
        {ReaderHero()}
        <div className="reader-tabs">
          <button className={`reader-tab${readerTab === 'transcript' ? ' on' : ''}`} onClick={() => setReaderTab('transcript')}>Transcript</button>
          <button className={`reader-tab${readerTab === 'qa' ? ' on' : ''}`} onClick={() => setReaderTab('qa')}>Q&A</button>
          <button className="reader-tab reader-tab-pdf" onClick={() => openPrint(readerTab === 'qa' ? 'qa' : 'transcript')}>PDF ↓</button>
        </div>
        {isEditor && <div className="editor-banner">Editor mode — {(currentYearData?.segments || []).length} total segments</div>}
        {QAIndex()}
        <div style={{ paddingTop: 24 }}>
          {pageSegments.length === 0 && (
            <div className="qa-empty">No content for this section.</div>
          )}
          {pageSegments.map((seg, i) => renderSegment(seg, allSegs.indexOf(seg), allSegs))}
        </div>
        <div className="pnav">
          <button className="pnav-btn" disabled={readerPage === 0} onClick={prevPage}>← Previous</button>
          <span className="pnav-info">Page {readerPage + 1} of {totalReaderPages}</span>
          <button className="pnav-btn" disabled={readerPage >= totalReaderPages - 1} onClick={nextPage}>Next →</button>
        </div>
        {YearNav()}
      </div>
    )
  }

  function ReaderBookPage() {
    const allSegs = currentYearData?.segments || []
    return (
      <div className="rd" style={{ maxWidth: '100%', padding: 0 }}>
        <div style={{ maxWidth: 'var(--rd-max, 700px)', margin: '0 auto', padding: '0 40px' }}>
          <button className="bbk" onClick={goToGrid}>← All Years</button>
          {ReaderHero()}
          <div className="reader-tabs">
            <button className={`reader-tab${readerTab === 'transcript' ? ' on' : ''}`} onClick={() => setReaderTab('transcript')}>Transcript</button>
            <button className={`reader-tab${readerTab === 'qa' ? ' on' : ''}`} onClick={() => setReaderTab('qa')}>Q&A</button>
            <button className="reader-tab reader-tab-pdf" onClick={() => openPrint(readerTab === 'qa' ? 'qa' : 'transcript')}>PDF ↓</button>
          </div>
          {isEditor && <div className="editor-banner">Editor mode — {(currentYearData?.segments || []).length} total segments</div>}
          {QAIndex()}
        </div>
        <div className="book-wrap">
          <div className="book-spread">
            <div className="book-page">
              <div className="book-page-label">
                <span>Berkshire Letters · {currentYear}</span>
                <span>{currentYearData?.title}</span>
              </div>
              {leftPageSegs.map((seg) => renderSegment(seg, allSegs.indexOf(seg), allSegs))}
            </div>
            <div className="book-page">
              <div className="book-page-label">
                <span>{readerTab === 'qa' ? 'Q&A' : 'Transcript'}</span>
                <span>Page {readerPage + 1}</span>
              </div>
              {rightPageSegs.map((seg) => renderSegment(seg, allSegs.indexOf(seg), allSegs))}
              {rightPageSegs.length === 0 && (
                <div style={{ color: 'var(--fg5)', fontFamily: 'IBM Plex Mono', fontSize: 10 }}>End of section</div>
              )}
            </div>
          </div>
          <div className="book-nav">
            <button className="book-nav-btn" disabled={readerPage === 0} onClick={prevPage}>← Previous Spread</button>
            <div className="book-nav-info">
              {readerPage + 1} / {totalReaderPages}
            </div>
            <button className="book-nav-btn" disabled={readerPage >= totalReaderPages - 1} onClick={nextPage}>Next Spread →</button>
          </div>
        </div>
        <div style={{ maxWidth: 'var(--rd-max, 700px)', margin: '0 auto', padding: '0 40px' }}>
          {YearNav()}
        </div>
      </div>
    )
  }

  function YearNav() {
    const prevYear = currentYearIdx > 0 ? sortedYearNums[currentYearIdx - 1] : null
    const nextYear = currentYearIdx < sortedYearNums.length - 1 ? sortedYearNums[currentYearIdx + 1] : null
    return (
      <div className="yr-nav">
        {prevYear ? (
          <button className="yr-nb" onClick={() => goToReader(prevYear)}>← {prevYear}</button>
        ) : <span />}
        {nextYear ? (
          <button className="yr-nb" onClick={() => goToReader(nextYear)}>{nextYear} →</button>
        ) : <span />}
      </div>
    )
  }

  function LoginPage() {
    return (
      <div className="lg">
        <h2>Editor Access</h2>
        <p>Enter your editor password to manage content.</p>
        <form onSubmit={handleLogin}>
          <input
            className="lg-in"
            type="password"
            placeholder="Password"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            autoFocus
          />
          <div className="lg-e">{loginError}</div>
          <button className="btn p" type="submit" disabled={loginLoading} style={{ width: '100%' }}>
            {loginLoading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    )
  }

  function BookmarksPage() {
    const savedItems = []
    years.forEach(y => {
      ;(y.segments || []).forEach(seg => {
        if (bookmarks.has(seg.id)) savedItems.push({ year: y.year, seg })
      })
    })
    return (
      <div className="bp">
        <div className="bp-hdr">
          <h2>Saved Passages</h2>
          {savedItems.length > 0 && (
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => openPrint('bookmarks')}>Export PDF</button>
              <button className="btn" onClick={exportBookmarks}>Export .doc</button>
            </div>
          )}
        </div>
        {savedItems.length === 0 ? (
          <div className="emp">No saved passages yet. Star segments while reading to save them.</div>
        ) : (
          savedItems.map(({ year, seg }) => (
            <div key={seg.id} className="bi" onClick={() => goToReader(year)}>
              <div className="bi-m">{year} · {seg.speaker || ''}</div>
              <div className="bi-t" style={{ fontFamily: FONTS[fontIdx].value }}>
                {(seg.en || '').slice(0, 180)}{(seg.en || '').length > 180 ? '…' : ''}
              </div>
            </div>
          ))
        )}
      </div>
    )
  }

  function PrintView() {
    const scope = printJob.scope
    const fontFamily = FONTS[fontIdx].value
    const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

    function printSegment(seg) {
      if (seg.type === 'heading') {
        return (
          <div key={seg.id} className="print-seg print-hdg">
            <p style={{ fontFamily }}>{seg.text}</p>
          </div>
        )
      }
      if (seg.type === 'image') {
        return (
          <div key={seg.id} className="print-seg print-img">
            {seg.url && <img src={seg.url} alt={seg.caption || ''} />}
            {seg.caption && <p className="print-cap">{seg.caption}</p>}
          </div>
        )
      }
      return (
        <div key={seg.id} className="print-seg">
          <div className="print-speaker">{seg.speaker || 'Speaker'}</div>
          <p className="print-en" style={{ fontFamily }}>
            {renderText(seg.en, seg.id, highlights, sidenotes)}
          </p>
          {seg.zh && chineseMode !== 'none' && (
            <p className="print-zh">
              {renderText(seg.zh, seg.id, highlights, sidenotes)}
            </p>
          )}
        </div>
      )
    }

    if (scope === 'bookmarks') {
      const groups = []
      ;[...years].sort((a, b) => a.year - b.year).forEach(y => {
        const segs = (y.segments || []).filter(s => bookmarks.has(s.id))
        if (segs.length > 0) groups.push({ year: y.year, title: y.title, segs })
      })
      return (
        <div className="print-root">
          <div className="print-title">
            <div className="print-kicker">Berkshire Hathaway Annual Shareholders Meeting</div>
            <h1 style={{ fontFamily }}>Saved Passages</h1>
            <div className="print-date">{dateStr}</div>
          </div>
          {groups.map(g => (
            <div key={g.year}>
              <div className="print-year-hd" style={{ fontFamily }}>{g.year}{g.title ? ` — ${g.title}` : ''}</div>
              {g.segs.map(printSegment)}
            </div>
          ))}
        </div>
      )
    }

    const yd = currentYearData
    const segs = scope === 'qa'
      ? (yd?.segments || []).filter(s => s.isQA)
      : (yd?.segments || [])
    return (
      <div className="print-root">
        <div className="print-title">
          <div className="print-kicker">Berkshire Hathaway Annual Shareholders Meeting — {scope === 'qa' ? 'Q&A' : 'Transcript'}</div>
          <h1 style={{ fontFamily }}>{currentYear}</h1>
          {yd?.title && <div className="print-sub" style={{ fontFamily }}>{yd.title}</div>}
          <div className="print-date">{dateStr}</div>
        </div>
        {segs.map(printSegment)}
      </div>
    )
  }

  function SettingsPanel() {
    return (
      <div className="sp" style={{ position: 'fixed' }}>
        <button className="sp-close" onClick={() => setShowSettings(false)}>✕</button>

        <div className="sp-section">
          <h4>Reading Mode</h4>
          <div className="sp-row">
            <button className={`sp-btn${readingMode === 'scroll' ? ' on' : ''}`} onClick={() => setReadingMode('scroll')}>Scroll</button>
            <button className={`sp-btn${readingMode === 'book' ? ' on' : ''}`} onClick={() => setReadingMode('book')}>Book</button>
          </div>
        </div>

        <hr className="sp-divider" />

        <div className="sp-section">
          <h4>Font</h4>
          <select value={fontIdx} onChange={e => setFontIdx(Number(e.target.value))}>
            {FONTS.map((f, i) => <option key={f.label} value={i}>{f.label}</option>)}
          </select>
        </div>

        <div className="sp-section">
          <h4>Size</h4>
          <div className="sp-row sp-stepper">
            <button className="sp-btn" disabled={fontSize <= FS_MIN} onClick={() => setFontSize(s => Math.max(FS_MIN, s - FS_STEP))}>A−</button>
            <span className="sp-stepper-val">{fontSize}px</span>
            <button className="sp-btn" disabled={fontSize >= FS_MAX} onClick={() => setFontSize(s => Math.min(FS_MAX, s + FS_STEP))}>A+</button>
          </div>
        </div>

        <div className="sp-section">
          <h4>Line Height</h4>
          <div className="sp-row">
            {LINE_HEIGHTS.map(lh => (
              <button key={lh.value} className={`sp-btn${lineHeight === lh.value ? ' on' : ''}`} onClick={() => setLineHeight(lh.value)}>{lh.label}</button>
            ))}
          </div>
        </div>

        <div className="sp-section">
          <h4>Width</h4>
          <div className="sp-row">
            {WIDTHS.map(w => (
              <button key={w.value} className={`sp-btn${contentWidth === w.value ? ' on' : ''}`} onClick={() => setContentWidth(w.value)}>{w.label}</button>
            ))}
          </div>
        </div>

        <div className="sp-section">
          <h4>Align</h4>
          <div className="sp-row">
            <button className={`sp-btn${textAlign === 'left' ? ' on' : ''}`} onClick={() => setTextAlign('left')}>Left</button>
            <button className={`sp-btn${textAlign === 'justify' ? ' on' : ''}`} onClick={() => setTextAlign('justify')}>Justify</button>
          </div>
        </div>

        <div className="sp-section">
          <h4>Theme</h4>
          <div className="sp-row">
            <button className={`sp-btn${theme === 'light' ? ' on' : ''}`} onClick={() => setTheme('light')}>Light</button>
            <button className={`sp-btn${theme === 'sepia' ? ' on' : ''}`} onClick={() => setTheme('sepia')}>Sepia</button>
            <button className={`sp-btn${theme === 'dark' ? ' on' : ''}`} onClick={() => setTheme('dark')}>Dark</button>
          </div>
        </div>

        <hr className="sp-divider" />

        <div className="sp-section">
          <h4>Chinese</h4>
          <div className="sp-row">
            <button className={`sp-btn${chineseMode === 'none' ? ' on' : ''}`} onClick={() => setChineseMode('none')}>Off</button>
            <button className={`sp-btn${chineseMode === 'trad' ? ' on' : ''}`} onClick={() => setChineseMode('trad')}>繁體</button>
          </div>
        </div>

        <hr className="sp-divider" />

        <div className="sp-section">
          <h4>Page Length</h4>
          <div className="sp-spp">
            <input
              type="number"
              min={1}
              max={100}
              value={segmentsPerPage}
              onChange={e => {
                const v = parseInt(e.target.value)
                if (v > 0 && v <= 100) { setSegmentsPerPage(v); setReaderPage(0) }
              }}
            />
            <label>segments per page</label>
          </div>
          {readingMode === 'book' && (
            <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 9, color: 'var(--fg4)', marginTop: 8 }}>
              Book mode: half per column
            </p>
          )}
        </div>
      </div>
    )
  }

  function QAIndex() {
    if (readerTab !== 'qa' || qaIndex.length === 0) return null
    return (
      <div className="qa-ix">
        <span className="qa-ix-lbl">Jump to</span>
        {qaIndex.map((item, i) => (
          <button
            key={item.id}
            className={`qa-ix-chip${getSegmentPage(item.id) === readerPage ? ' on' : ''}`}
            title={item.text}
            onClick={() => setReaderPage(getSegmentPage(item.id))}
          >
            Q{i + 1}
          </button>
        ))}
      </div>
    )
  }

  function EditorPanel() {
    const yd = currentYearData
    return (
      <div className="ep">
        <div className="ep-head">
          <h3>Editor</h3>
          <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--fg4)', fontSize: 18 }} onClick={() => setEditorPanelOpen(false)}>✕</button>
        </div>
        <div className="ep-tabs">
          <button className={`ep-tab${editorTab === 'year' ? ' on' : ''}`} onClick={() => setEditorTab('year')}>Year</button>
          <button className={`ep-tab${editorTab === 'add' ? ' on' : ''}`} onClick={() => setEditorTab('add')}>Add Segment</button>
          <button className={`ep-tab${editorTab === 'report' ? ' on' : ''}`} onClick={() => setEditorTab('report')}>Report</button>
        </div>
        <div className="ep-body">
          {editorTab === 'year' && yd && (
            <>
              <div className="ep-field">
                <label>Title</label>
                <input value={yd.title || ''} onChange={e => updateYearField('title', e.target.value)} />
              </div>
              <div className="ep-field">
                <label>Video URL</label>
                <input value={yd.videoUrl || ''} onChange={e => updateYearField('videoUrl', e.target.value)} placeholder="https://youtube.com/..." />
              </div>
              <hr />
              <div className="ep-section-lbl">Cover Image</div>
              <div className="ep-field">
                <div className="ep-set-row">
                  <input value={yd.coverUrl || ''} onChange={e => updateYearField('coverUrl', e.target.value)} placeholder="Image URL" />
                </div>
              </div>
              {yd.coverUrl && (
                <>
                  <div className="cover-preview">
                    <img src={yd.coverUrl} alt="cover" />
                  </div>
                  <div className="ep-field" style={{ marginTop: 10 }}>
                    <label>Vertical position ({yd.coverPos || 50}%)</label>
                    <input
                      type="range" min={0} max={100}
                      value={yd.coverPos || 50}
                      onChange={e => updateYearField('coverPos', Number(e.target.value))}
                      className="pos-slider"
                    />
                  </div>
                </>
              )}
              <hr />
              <div className="ep-section-lbl">{(yd.segments || []).length} segments total</div>
            </>
          )}

          {editorTab === 'add' && (
            <>
              <div className="ep-section-lbl">Text Segment</div>
              <div className="ep-field">
                <label>Speaker</label>
                <input value={editorForm.speaker} onChange={e => setEditorForm(f => ({ ...f, speaker: e.target.value }))} />
              </div>
              <div className="ep-field">
                <label>English</label>
                <textarea value={editorForm.en} onChange={e => setEditorForm(f => ({ ...f, en: e.target.value }))} />
              </div>
              <div className="ep-field">
                <label>Chinese (optional)</label>
                <textarea value={editorForm.zh} onChange={e => setEditorForm(f => ({ ...f, zh: e.target.value }))} />
              </div>
              {editorError && <div className="ep-err">{editorError}</div>}
              <button className="ep-btn" onClick={() => {
                if (!editorForm.en.trim()) { setEditorError('English text required'); return }
                setEditorError('')
                addSegment('text')
              }}>Add Text Segment</button>

              <hr />
              <div className="ep-section-lbl">Heading</div>
              <div className="ep-field">
                <input value={headingInput} onChange={e => setHeadingInput(e.target.value)} placeholder="Heading text" />
              </div>
              <button className="ep-btn" onClick={() => {
                if (!headingInput.trim()) return
                addSegment('heading')
              }}>Add Heading</button>

              <hr />
              <div className="ep-section-lbl">Image</div>
              <div className="ep-field">
                <label>Image URL</label>
                <input value={imageForm.url} onChange={e => setImageForm(f => ({ ...f, url: e.target.value }))} placeholder="https://..." />
              </div>
              <div className="ep-field">
                <label>Caption</label>
                <input value={imageForm.caption} onChange={e => setImageForm(f => ({ ...f, caption: e.target.value }))} />
              </div>
              <button className="ep-btn" onClick={() => {
                if (!imageForm.url.trim()) return
                addSegment('image')
              }}>Add Image</button>
            </>
          )}

          {editorTab === 'report' && (
            <>
              <div className="ep-section-lbl">Data Report</div>
              <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--fg4)', lineHeight: 1.7 }}>
                Year: {currentYear}<br />
                Total segments: {(currentYearData?.segments || []).length}<br />
                QA segments: {(currentYearData?.segments || []).filter(s => s.isQA).length}<br />
                Headings: {(currentYearData?.segments || []).filter(s => s.type === 'heading').length}<br />
                Images: {(currentYearData?.segments || []).filter(s => s.type === 'image').length}<br />
                With Chinese: {(currentYearData?.segments || []).filter(s => s.zh).length}
              </p>
            </>
          )}
        </div>
      </div>
    )
  }

  function SelectionToolbar() {
    if (!selToolbar) return null
    return (
      <div
        className="stb"
        style={{ left: selToolbar.x, top: selToolbar.y + window.scrollY }}
        onMouseDown={e => e.preventDefault()}
      >
        <button className="stb-b" onClick={() => addHighlight(selToolbar.segId, selToolbar.text)}>Highlight</button>
        <button className="stb-b" onClick={() => openSidenoteModal(selToolbar.segId, selToolbar.text)}>Note</button>
        <button className="stb-b" onClick={() => setSelToolbar(null)}>✕</button>
      </div>
    )
  }

  function SidenoteModal() {
    if (!sidenoteModal) return null
    return (
      <div className="mbg" onClick={() => setSidenoteModal(null)}>
        <div className="mbox" onClick={e => e.stopPropagation()}>
          <h3>Add Note</h3>
          <div className="mbox-exc">"{sidenoteModal.excerpt}"</div>
          <textarea
            className="mta"
            placeholder="Your note…"
            value={sidenoteText}
            onChange={e => setSidenoteText(e.target.value)}
            autoFocus
          />
          <div className="mbox-acts">
            <button className="btn" onClick={() => setSidenoteModal(null)}>Cancel</button>
            <button className="btn p" onClick={() => saveSidenote(sidenoteModal.segId, sidenoteModal.excerpt, sidenoteText)}>Save Note</button>
          </div>
        </div>
      </div>
    )
  }

  function SidenotePopover() {
    if (!sidenotePopover) return null
    const { x, y, note, segId, idx } = sidenotePopover
    return (
      <div
        className="note-pop"
        style={{ left: Math.min(x, window.innerWidth - 310), top: y }}
      >
        <div className="note-pop-hd">
          <span>Note {idx + 1}</span>
          <button onClick={() => setSidenotePopover(null)}>✕</button>
        </div>
        <div className="note-pop-body">{note}</div>
        <button className="note-pop-del" onClick={() => deleteSidenote(segId, idx)}>Delete note</button>
      </div>
    )
  }

  function AddYearModal() {
    return (
      <div className="mbg" onClick={() => setAddYearModalOpen(false)}>
        <div className="mbox" onClick={e => e.stopPropagation()}>
          <h3>Add Year</h3>
          <label>Year</label>
          <input
            type="number"
            value={newYearForm.year}
            onChange={e => setNewYearForm(f => ({ ...f, year: e.target.value }))}
            placeholder="e.g. 1994"
            autoFocus
          />
          <label>Title</label>
          <input
            value={newYearForm.title}
            onChange={e => setNewYearForm(f => ({ ...f, title: e.target.value }))}
            placeholder="Annual Meeting Title"
          />
          {editorError && <div style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: '#c0392b', marginTop: 8 }}>{editorError}</div>}
          <div className="mbox-acts">
            <button className="btn" onClick={() => { setAddYearModalOpen(false); setEditorError('') }}>Cancel</button>
            <button className="btn p" onClick={addYear}>Add Year</button>
          </div>
        </div>
      </div>
    )
  }

  function EditSegmentModal() {
    if (!editingSegment) return null
    const seg = editingSegment
    return (
      <div className="mbg" onClick={() => setEditingSegment(null)}>
        <div className="mbox" onClick={e => e.stopPropagation()}>
          <h3>Edit Segment</h3>
          {seg.type === 'text' && (
            <>
              <label>Speaker</label>
              <input value={seg.speaker || ''} onChange={e => setEditingSegment(s => ({ ...s, speaker: e.target.value }))} />
              <label>English</label>
              <textarea value={seg.en || ''} onChange={e => setEditingSegment(s => ({ ...s, en: e.target.value }))} />
              <label>Chinese</label>
              <textarea value={seg.zh || ''} onChange={e => setEditingSegment(s => ({ ...s, zh: e.target.value }))} />
            </>
          )}
          {seg.type === 'heading' && (
            <>
              <label>Heading Text</label>
              <input value={seg.text || ''} onChange={e => setEditingSegment(s => ({ ...s, text: e.target.value }))} autoFocus />
            </>
          )}
          {seg.type === 'image' && (
            <>
              <label>Image URL</label>
              <input value={seg.url || ''} onChange={e => setEditingSegment(s => ({ ...s, url: e.target.value }))} />
              <label>Caption</label>
              <input value={seg.caption || ''} onChange={e => setEditingSegment(s => ({ ...s, caption: e.target.value }))} />
            </>
          )}
          <div className="mbox-acts">
            <button className="btn" onClick={() => setEditingSegment(null)}>Cancel</button>
            <button className="btn p" onClick={saveEditingSegment}>Save</button>
          </div>
        </div>
      </div>
    )
  }

  function ReportModal() {
    return (
      <div className="mbg" onClick={() => setReportModalOpen(false)}>
        <div className="mbox" onClick={e => e.stopPropagation()}>
          <h3>Archive Report</h3>
          <p style={{ fontFamily: 'IBM Plex Mono', fontSize: 10, color: 'var(--fg4)', lineHeight: 2 }}>
            Total years: {years.length}<br />
            Total segments: {years.reduce((a, y) => a + (y.segments || []).length, 0)}<br />
            Bookmarks: {bookmarks.size}<br />
            Highlights: {Object.values(highlights).reduce((a, v) => a + v.length, 0)}<br />
            Notes: {Object.values(sidenotes).reduce((a, v) => a + v.length, 0)}
          </p>
          <div className="mbox-acts">
            <button className="btn p" onClick={() => setReportModalOpen(false)}>Close</button>
          </div>
        </div>
      </div>
    )
  }

  function SiteFooter() {
    return (
      <footer className="site-footer">
        <button className="site-footer-btn" onClick={() => setReportModalOpen(true)}>
          Berkshire Letters Archive
        </button>
      </footer>
    )
  }

  // ── Render ──
  return (
    <>
      <style>{css}</style>
      {loading && LoadingScreen()}
      {!loading && (
        <>
          {Nav()}
          {page === 'reader' && readingMode === 'scroll' && <div className="read-progress" ref={progressRef} />}
          {page === 'grid' && GridPage()}
          {page === 'reader' && readingMode === 'scroll' && ReaderScrollPage()}
          {page === 'reader' && readingMode === 'book' && ReaderBookPage()}
          {page === 'login' && LoginPage()}
          {page === 'bookmarks' && BookmarksPage()}
          {showSettings && page === 'reader' && SettingsPanel()}
          {isEditor && editorPanelOpen && page === 'reader' && EditorPanel()}
          {SiteFooter()}
          {showScrollTop && page === 'reader' && readingMode === 'scroll' && (
            <button className="scroll-top" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>♠</button>
          )}
          {selToolbar && SelectionToolbar()}
          {sidenoteModal && SidenoteModal()}
          {sidenotePopover && SidenotePopover()}
          {addYearModalOpen && AddYearModal()}
          {editingSegment && EditSegmentModal()}
          {reportModalOpen && ReportModal()}
          {printJob && PrintView()}
        </>
      )}
    </>
  )
}
