#!/usr/bin/env python3
"""Touch signature pad: scrollY must not change; strokes must persist after resize."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import threading, json, sys
from playwright.sync_api import sync_playwright

ROOT = Path(__file__).resolve().parent

class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)
    def log_message(self, *a): pass

httpd = ThreadingHTTPServer(('127.0.0.1', 0), H)
threading.Thread(target=httpd.serve_forever, daemon=True).start()
port = httpd.server_address[1]
url = f'http://127.0.0.1:{port}/'

fails = []
with sync_playwright() as p:
    browser = p.chromium.launch()
    context = browser.new_context(
        viewport={'width': 390, 'height': 664},
        has_touch=True,
        is_mobile=True,
        user_agent='Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
    )
    page = context.new_page()
    page.goto(url, wait_until='domcontentloaded')
    page.evaluate("""() => {
      S.fio='Тест Подпись'; S.inn='500100732259'; S.phone='+79001112233';
      S.type='pick'; S.photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
      S.photoAt=new Date().toISOString(); S.score=10; S.tries=1;
      S.consent={v:'1.0',at:new Date().toISOString()};
      document.body.style.minHeight='2000px';
      sign();
      window.scrollTo(0,120);
    }""")
    page.wait_for_selector('#sig')
    before = page.evaluate("""() => {
      const c=document.querySelector('#sig');
      const cs=getComputedStyle(c);
      return {
        y: window.scrollY,
        touchAction: cs.touchAction,
        userSelect: cs.userSelect || cs.webkitUserSelect,
        overscroll: cs.overscrollBehavior,
      };
    }""")
    if before['touchAction'] != 'none':
        fails.append(f"touch-action={before['touchAction']}")
    box = page.locator('#sig').bounding_box()
    assert box, 'no canvas box'
    path = [{'x': box['x'] + 30 + i * 12, 'y': box['y'] + 40 + __import__('math').sin(i / 3) * 30} for i in range(21)]
    mid = page.evaluate("""async (path) => {
      const c = document.querySelector('#sig');
      const y0 = window.scrollY;
      const fire = (type, x, y) => {
        const t = new Touch({identifier:1,target:c,clientX:x,clientY:y,pageX:x+window.scrollX,pageY:y+window.scrollY,radiusX:10,radiusY:10,rotationAngle:0,force:0.5});
        c.dispatchEvent(new TouchEvent(type,{bubbles:true,cancelable:true,touches:type==='touchend'?[]:[t],targetTouches:type==='touchend'?[]:[t],changedTouches:[t]}));
      };
      const pfire = (type, x, y, buttons=1) => {
        c.dispatchEvent(new PointerEvent(type,{bubbles:true,cancelable:true,pointerId:1,pointerType:'touch',clientX:x,clientY:y,buttons,isPrimary:true}));
      };
      const count = () => {
        const x=c.getContext('2d'); const d=x.getImageData(0,0,c.width,c.height).data; let n=0;
        for(let i=3;i<d.length;i+=4) if(d[i]>10) n++; return n;
      };
      fire('touchstart', path[0].x, path[0].y);
      pfire('pointerdown', path[0].x, path[0].y);
      for (let i=1;i<path.length;i++){
        fire('touchmove', path[i].x, path[i].y);
        pfire('pointermove', path[i].x, path[i].y);
        await new Promise(r=>requestAnimationFrame(r));
      }
      const during = {y: window.scrollY, signing: document.body.classList.contains('signing'), y0};
      // mid-draw resize must be ignored
      window.dispatchEvent(new Event('resize'));
      const pixelsMid = count();
      fire('touchend', path[path.length-1].x, path[path.length-1].y);
      pfire('pointerup', path[path.length-1].x, path[path.length-1].y, 0);
      await new Promise(r=>requestAnimationFrame(r));
      await new Promise(r=>requestAnimationFrame(r));
      const beforeResize = count();
      window.__sigPad.fit(false);
      window.dispatchEvent(new Event('resize'));
      if (window.visualViewport) window.visualViewport.dispatchEvent(new Event('resize'));
      await new Promise(r=>setTimeout(r,40));
      return {
        during, afterY: window.scrollY, pixelsMid, beforeResize,
        pixelsAfterResize: count(), len: window.__sigPad.len(),
        signingAfter: document.body.classList.contains('signing'),
        hintH: document.querySelector('#sighint').getBoundingClientRect().height,
      };
    }""", path)

    print(json.dumps({'before': before, 'mid': mid}, ensure_ascii=False, indent=2))

    if mid['during']['y'] != mid['during']['y0']:
        fails.append(f"scroll changed during draw: {mid['during']['y0']} -> {mid['during']['y']}")
    if not mid['during']['signing']:
        fails.append('body.signing not set during draw')
    if mid['pixelsMid'] < 20:
        fails.append(f'too few ink pixels mid-draw: {mid["pixelsMid"]}')
    if mid['beforeResize'] < 50:
        fails.append(f'too few ink pixels after stroke: {mid["beforeResize"]}')
    if mid['pixelsAfterResize'] < 50:
        fails.append(f'strokes lost after resize: {mid["pixelsAfterResize"]}')
    if mid['len'] < 10:
        fails.append(f'len too small: {mid["len"]}')
    if mid['signingAfter']:
        fails.append('still signing after pointerup')
    if mid['hintH'] < 10:
        fails.append(f'hint height not reserved: {mid["hintH"]}')

    # Also use Playwright native touchscreen drag
    page.evaluate("() => { document.querySelector('#clr').click(); window.scrollTo(0, 80); }")
    y_before_drag = page.evaluate('() => window.scrollY')
    page.touchscreen.tap(box['x'] + 50, box['y'] + 50)
    # drag via mouse with touch? use locator
    page.locator('#sig').dispatch_event('pointerdown', {'button': 0, 'clientX': box['x']+40, 'clientY': box['y']+60})
    for i in range(15):
        page.locator('#sig').dispatch_event('pointermove', {'button': 0, 'clientX': box['x']+40+i*10, 'clientY': box['y']+60+i})
    page.locator('#sig').dispatch_event('pointerup', {'button': 0, 'clientX': box['x']+190, 'clientY': box['y']+75})
    y_after_drag = page.evaluate('() => window.scrollY')
    # with body fixed, reported scrollY may be 0 while locked; after unlock should restore
    ink2 = page.evaluate("""() => {
      const c=document.querySelector('#sig'); const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data; let n=0;
      for(let i=3;i<d.length;i+=4) if(d[i]>10) n++; return n;
    }""")
    print('native-ish drag', {'y_before': y_before_drag, 'y_after': y_after_drag, 'ink': ink2})

    out = ROOT / 'shots' / 'sig_touch_390x664.png'
    out.parent.mkdir(exist_ok=True)
    page.screenshot(path=str(out), full_page=False)

    browser.close()
httpd.shutdown()

if fails:
    print('FAIL:', fails, file=sys.stderr)
    sys.exit(1)
print('PASS: scroll stable, strokes persist, touch-action none, hint reserved')
