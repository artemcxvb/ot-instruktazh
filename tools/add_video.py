#!/usr/bin/env python3
"""Добавить видео-кружок к слайду.
Использование: python3 tools/add_video.py <номер 1-27> <файл.mp4|mov> [--no-trim]
   или:        python3 tools/add_video.py <файл с номером в имени, напр. 07.mp4>
Кроп по центру в квадрат 360x360, H.264 main CRF 28 + AAC моно 64k (loudnorm), faststart,
лёгкая обрезка тишины по краям; постер jpg. Пишет video/slide_NN.mp4 + .jpg и video/poster в data.js."""
import re,subprocess,sys,os,json
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a=[x for x in sys.argv[1:] if not x.startswith('--')];notrim='--no-trim' in sys.argv
if len(a)==1: n=int(re.search(r'\d+',os.path.basename(a[0])).group()); src=a[0]
elif len(a)==2: n=int(a[0]); src=a[1]
else: sys.exit(__doc__)
D=os.path.join(R,'data.js'); s=open(D,encoding='utf-8').read()
ms=list(re.finditer(r'\{sec:"[^"]*",title:"[^"]*",\s*',s))
if not 1<=n<=len(ms): sys.exit(f'номер должен быть 1..{len(ms)}')
os.makedirs(os.path.join(R,'video'),exist_ok=True)
out=f'video/slide_{n:02d}.mp4';pos=f'video/slide_{n:02d}.jpg'
dur=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',src]))
ss,to=0.0,dur
if not notrim:  # найти речь: первая/последняя не-тишина, оставить запас 0.25 с
  log=subprocess.run(['ffmpeg','-i',src,'-af','silencedetect=n=-40dB:d=0.4','-f','null','-'],capture_output=True,text=True).stderr
  st=[float(x) for x in re.findall(r'silence_start: ([\d.]+)',log)];en=[float(x) for x in re.findall(r'silence_end: ([\d.]+)',log)]
  if st and st[0]<0.05 and en: ss=max(0,en[0]-0.25)
  if st and (len(en)<len(st)) : to=min(dur,st[-1]+0.35)
vf='crop=min(iw\\,ih):min(iw\\,ih),scale=360:360:flags=lanczos,setsar=1,format=yuv420p'
subprocess.run(['ffmpeg','-y','-loglevel','error','-ss',str(ss),'-to',str(to),'-i',src,'-vf',vf,'-r','25',
  '-c:v','libx264','-profile:v','main','-preset','slow','-crf','28','-af','highpass=f=80,loudnorm=I=-16:TP=-1.5:LRA=11',
  '-ac','1','-ar','44100','-c:a','aac','-b:a','64k','-movflags','+faststart',os.path.join(R,out)],check=True)
subprocess.run(['ffmpeg','-y','-loglevel','error','-ss','0.5','-i',os.path.join(R,out),'-frames:v','1','-q:v','4',os.path.join(R,pos)],check=True)
m=ms[n-1]; rest=s[m.end():]
rest=re.sub(r'^((?:audio|video|poster):"[^"]*",\s*)*',lambda g:re.sub(r'(video|poster):"[^"]*",\s*','',g.group()),rest)
s=s[:m.end()]+f'video:"{out}",poster:"{pos}",\n  '+rest
open(D,'w',encoding='utf-8').write(s)
print(f'OK: блок {n} -> {out} ({to-ss:.1f} с). Подними ?v= в index.html и window.AUDIO_V.')
