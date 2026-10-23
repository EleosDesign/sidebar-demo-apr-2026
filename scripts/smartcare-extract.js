// Runs inside the SmartCare page (via Chrome AppleScript). Returns JSON of the visible note UI.
(() => {
  const vis = e => { const r = e.getBoundingClientRect(), s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
  const st = e => { const s = getComputedStyle(e); return { font: s.font, color: s.color, bg: s.backgroundColor, border: s.border, borderBottom: s.borderBottom, padding: s.padding }; };
  const rect = e => { const r = e.getBoundingClientRect(); return [Math.round(r.x), Math.round(r.y), Math.round(r.width), Math.round(r.height)].map(Number); };
  const label = e => (e.id && document.querySelector(`label[for="${e.id}"]`)?.innerText.trim()) || e.closest('tr,td,div')?.innerText.trim().slice(0, 120) || '';
  const controls = [...document.querySelectorAll('input,select,textarea,button')].filter(vis).map(e => ({
    tag: e.tagName, type: e.type, id: e.id, label: label(e), rect: rect(e), style: st(e),
    checked: e.checked, value: e.tagName === 'SELECT' ? undefined : e.value,
    options: e.tagName === 'SELECT' ? [...e.options].map(o => o.text) : undefined,
  }));
  const texts = [...document.querySelectorAll('body *')].filter(e => vis(e) && [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()))
    .map(e => ({ text: [...e.childNodes].filter(n => n.nodeType === 3).map(n => n.textContent.trim()).join(' ').slice(0, 300), tag: e.tagName, rect: rect(e), style: st(e) }));
  const panels = [...document.querySelectorAll('div,td,table,fieldset')].filter(e => vis(e) && e.getBoundingClientRect().width > 200 && getComputedStyle(e).borderTopWidth !== '0px' && getComputedStyle(e).borderTopStyle !== 'none')
    .map(e => ({ id: e.id, tag: e.tagName, rect: rect(e), style: st(e) }));
  const scroller = [...document.querySelectorAll('*')].filter(e => e.scrollHeight > e.clientHeight + 20 && /auto|scroll/.test(getComputedStyle(e).overflowY)).sort((a, b) => b.clientHeight - a.clientHeight)[0];
  return JSON.stringify({ title: document.title, url: location.pathname, viewport: [innerWidth, innerHeight], scrollerId: scroller?.id || null, controls, texts, panels });
})()
