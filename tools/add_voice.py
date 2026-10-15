#!/usr/bin/env python3
"""Добавить живую озвучку слайда.
Использование: python3 tools/add_voice.py <номер 1-27> <файл.ogg|m4a|mp3|wav|opus>
   или:        python3 tools/add_voice.py <файл с номером в имени, напр. 07.ogg>
Нормализует громкость (loudnorm), обрезает тишину по краям, моно 48 кбит/с mp3,
кладёт в audio/slide_NN.mp3 и прописывает audio:"audio/slide_NN.mp3" в data.js
(номер = порядок блоков в data.js и в документе «Текст для озвучки»)."""
import re,subprocess,sys,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
a=sys.argv[1:]
if len(a)==1: n=int(re.search(r'\d+',os.path.basename(a[0])).group()); src=a[0]
elif len(a)==2: n=int(a[0]); src=a[1]
else: sys.exit(__doc__)
D=os.path.join(R,'data.js'); s=open(D,encoding='utf-8').read()
ms=list(re.finditer(r'\{sec:"[^"]*",title:"[^"]*",\s*',s))
if not 1<=n<=len(ms): sys.exit(f'номер должен быть 1..{len(ms)}')
out=f'audio/slide_{n:02d}.mp3'
af=('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,'
    'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.3,areverse,'
    'highpass=f=80,loudnorm=I=-16:TP=-1.5:LRA=11')
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',src,'-af',af,'-ac','1','-ar','44100',
  '-c:a','libmp3lame','-b:a','48k',os.path.join(R,out)],check=True)
m=ms[n-1]; rest=s[m.end():]
rest=re.sub(r'^audio:"[^"]*",\s*','',rest)
s=s[:m.end()]+f'audio:"{out}",\n  '+rest
open(D,'w',encoding='utf-8').write(s)
t=re.search(r'title:"([^"]*)"',m.group()).group(1)
print(f'OK: блок {n} «{t}» -> {out}. Не забудь поднять ?v= в index.html и window.AUDIO_V.')
