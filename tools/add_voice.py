#!/usr/bin/env python3
"""Добавить живую озвучку слайда (файл для дальнейшего видео-кружка).
Использование: python3 tools/add_voice.py <номер 1-27> <файл.ogg|m4a|mp3|wav|opus>
   или:        python3 tools/add_voice.py <файл с номером в имени, напр. 07.ogg>
Нормализует громкость (loudnorm), обрезает тишину по краям, моно 48 кбит/с mp3,
кладёт в AUDIO_DIR (по умолчанию /workspace/ot_audio_backup/slide_NN.mp3).
На сайт mp3 не публикуются — дальше: python3 tools/add_avatar.py NN."""
import re,subprocess,sys,os
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BACKUP=os.environ.get('AUDIO_DIR','/workspace/ot_audio_backup')
a=sys.argv[1:]
if len(a)==1: n=int(re.search(r'\d+',os.path.basename(a[0])).group()); src=a[0]
elif len(a)==2: n=int(a[0]); src=a[1]
else: sys.exit(__doc__)
D=os.path.join(R,'data.js'); s=open(D,encoding='utf-8').read()
ms=list(re.finditer(r'\{sec:"[^"]*",title:"[^"]*",\s*',s))
if not 1<=n<=len(ms): sys.exit(f'номер должен быть 1..{len(ms)}')
os.makedirs(BACKUP,exist_ok=True)
out=os.path.join(BACKUP,f'slide_{n:02d}.mp3')
af=('silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.15,areverse,'
    'silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.3,areverse,'
    'highpass=f=80,loudnorm=I=-16:TP=-1.5:LRA=11')
subprocess.run(['ffmpeg','-y','-loglevel','error','-i',src,'-af',af,'-ac','1','-ar','44100',
  '-c:a','libmp3lame','-b:a','48k',out],check=True)
t=re.search(r'title:"([^"]*)"',ms[n-1].group()).group(1)
print(f'OK: блок {n} «{t}» -> {out}. Дальше: python3 tools/add_avatar.py {n}')
