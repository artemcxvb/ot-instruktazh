#!/usr/bin/env python3
"""Сгенерировать «говорящую голову» инструктора для слайда по его живой озвучке.
Использование: python3 tools/add_avatar.py NN [--out файл.mp4] [--audio путь.mp3]
 Берёт озвучку (по умолчанию /workspace/ot_audio_backup/slide_NN.mp3; или AUDIO_DIR /
 --audio), анимирует портрет /workspace/avatar/instructor.jpg
 (покачивание головы + моргание, mkbase.py) и синхронизирует губы Wav2Lip (CPU, ~4 мин на 40 с).
 Без --out: кладёт video/slide_NN.mp4 + video/slide_NN.jpg через tools/add_video.py (прописывает в data.js).
Окружение: /workspace/avatar/{venv,Wav2Lip,ck/wav2lip_gan.pth,mkbase.py}."""
import sys,os,subprocess,tempfile
R=os.path.dirname(os.path.dirname(os.path.abspath(__file__)));A=os.environ.get('AVATAR_DIR','/workspace/avatar')
BACKUP=os.environ.get('AUDIO_DIR','/workspace/ot_audio_backup')
a=sys.argv[1:]
if not a: sys.exit(__doc__)
n=int(a[0]);out=a[a.index('--out')+1] if '--out' in a else None
au=a[a.index('--audio')+1] if '--audio' in a else os.path.join(BACKUP,f'slide_{n:02d}.mp3')
if not os.path.exists(au):
  # fallback: старый путь в репозитории
  alt=os.path.join(R,f'audio/slide_{n:02d}.mp3')
  if os.path.exists(alt): au=alt
  else: sys.exit('нет '+au+' (и нет '+alt+')')
py=os.path.join(A,'venv/bin/python')
d=float(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',au]))
t=tempfile.mkdtemp();base=os.path.join(t,'base.mp4');raw=os.path.join(t,'raw.mp4')
subprocess.run([py,os.path.join(A,'mkbase.py'),str(d),base,os.path.join(A,'instructor.jpg')],check=True)
subprocess.run([py,'inference.py','--checkpoint_path',os.path.join(A,'ck/wav2lip_gan.pth'),'--face',base,'--audio',au,
  '--outfile',raw,'--pads','0','25','0','0','--face_det_batch_size','8','--wav2lip_batch_size','64'],cwd=os.path.join(A,'Wav2Lip'),check=True)
if out:
  subprocess.run(['ffmpeg','-y','-loglevel','error','-i',raw,'-vf','scale=360:360:flags=lanczos,format=yuv420p','-c:v','libx264','-profile:v','main',
   '-crf','26','-preset','slow','-c:a','aac','-ac','1','-b:a','64k','-movflags','+faststart',out],check=True);print('OK ->',out)
else:
  subprocess.run([sys.executable,os.path.join(R,'tools/add_video.py'),str(n),raw,'--no-trim'],check=True)
