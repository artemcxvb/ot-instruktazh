from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import threading, math, sys
from playwright.sync_api import sync_playwright
ROOT=Path(__file__).resolve().parent
class H(SimpleHTTPRequestHandler):
    def __init__(s,*a,**k): super().__init__(*a,directory=str(ROOT),**k)
    def log_message(s,*a): pass
h=ThreadingHTTPServer(('127.0.0.1',0),H);threading.Thread(target=h.serve_forever,daemon=True).start()
with sync_playwright() as p:
    b=p.chromium.launch();ctx=b.new_context(viewport={'width':390,'height':664},has_touch=True,is_mobile=True,device_scale_factor=3)
    pg=ctx.new_page();pg.goto(f'http://127.0.0.1:{h.server_address[1]}/')
    pg.evaluate("""()=>{S.fio='Т';S.inn='500100732259';S.phone='+79001112233';S.type='pick';S.photo='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';S.score=10;S.tries=1;S.consent={v:'1',at:''};sign()}""")
    pg.wait_for_selector('#sig');pg.locator('#sig').scroll_into_view_if_needed();pg.wait_for_timeout(100);bx=pg.locator('#sig').bounding_box()
    cx,cy,r=bx['x']+bx['width']/2,bx['y']+bx['height']/2,min(bx['width'],bx['height'])/2-15
    pg.evaluate("()=>{window.__ev=[];for(const t of ['pointerdown','pointermove','pointerup','touchstart'])document.addEventListener(t,e=>__ev.push(t+':'+(e.target.id||e.target.tagName)),true)}");cdp=ctx.new_cdp_session(pg);N=24  # fast: 15deg steps
    pts=[(cx+r*math.cos(2*math.pi*i/N),cy+r*math.sin(2*math.pi*i/N)) for i in range(N+1)]
    cdp.send('Input.dispatchTouchEvent',{'type':'touchStart','touchPoints':[{'x':pts[0][0],'y':pts[0][1]}]})
    for i,(x,y) in enumerate(pts[1:]):
        cdp.send('Input.dispatchTouchEvent',{'type':'touchMove','touchPoints':[{'x':x,'y':y}]})
        if i%3==2: pg.wait_for_timeout(16)
    cdp.send('Input.dispatchTouchEvent',{'type':'touchEnd','touchPoints':[]})
    pg.wait_for_timeout(200)
    res=pg.evaluate("""([cx,cy,r,bx,by])=>{const c=document.querySelector('#sig'),k=c.width/c.getBoundingClientRect().width,d=c.getContext('2d').getImageData(0,0,c.width,c.height).data;
      const hit=(x,y)=>{for(let dx=-12;dx<=12;dx++)for(let dy=-12;dy<=12;dy++){const X=Math.round(x+dx),Y=Math.round(y+dy);if(d[(Y*c.width+X)*4+3]>40)return true}return false};
      // sample along chord polygon (what straight/curved strokes should cover; tolerance 4 device px)
      let miss=[],n=0;const N=24;for(let i=0;i<N;i++){const a0=2*Math.PI*i/N,a1=2*Math.PI*(i+1)/N;for(let t=0;t<1;t+=0.05){n++;
        const px=cx+r*Math.cos(a0)*(1-t)+r*Math.cos(a1)*t, py=cy+r*Math.sin(a0)*(1-t)+r*Math.sin(a1)*t;
        if(!hit((px-cx)*k+c.width/2,(py-cy)*k+c.height/2))miss.push(i)}}return{n,miss:miss.length,segs:[...new Set(miss)],k}}""",[cx,cy,r,bx['x'],bx['y']])
    print(res, pg.evaluate('__ev.slice(0,8)'), bx);pg.locator('#sig').screenshot(path='shots/sig_circle.png')
    sys.exit(1 if res['miss'] else 0)
