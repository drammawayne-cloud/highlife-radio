#!/usr/bin/env python3
"""One A/V output: AzuraCast is the audio master; OBS picture is selected by content time.
All live media is held in a bounded RAM buffer. No recording or credentials in logs.
"""
import av,numpy as np,time,json,threading,os
from collections import deque
from fractions import Fraction
from pathlib import Path

RATE=25;WINDOW=320;BIN=200
lock=threading.RLock()
video_frames=deque();obs_energy=deque(maxlen=2000);radio_energy=deque(maxlen=1600)
state={'mode':'station','confidence':0,'offset':None,'last_obs':0,'last_match':0,'consistent':0}

class Energy:
 def __init__(self,target,relative=False):
  self.resampler=av.AudioResampler(format='fltp',layout='mono',rate=8000)
  self.target=target;self.pending=np.empty(0,dtype=np.float32);self.base=None;self.relative=relative;self.origin=None
 def feed(self,frame):
  for f in self.resampler.resample(frame):
   stamp=float(f.pts*f.time_base) if f.pts is not None else (self.base or 0)+len(self.pending)/8000
   if self.origin is None:self.origin=stamp
   if self.relative:stamp-=self.origin
   if self.base is None:self.base=stamp
   expected=self.base+len(self.pending)/8000
   if abs(stamp-expected)>.2:self.pending=np.empty(0,dtype=np.float32);self.base=stamp
   self.pending=np.concatenate((self.pending,f.to_ndarray().reshape(-1)))
   count=len(self.pending)//BIN
   if count:
    levels=np.sqrt(np.mean(self.pending[:count*BIN].reshape(count,BIN)**2,axis=1))
    with lock:
     for i,value in enumerate(levels):self.target.append((self.base+(i+.5)/40,float(value)))
    self.pending=self.pending[count*BIN:];self.base+=count/40

def observe(url):
 while True:
  try:
   energy=Energy(obs_energy)
   with av.open(url,timeout=(15,15)) as source:
    for packet in source.demux(video=0,audio=0):
     for f in packet.decode():
      if isinstance(f,av.VideoFrame):
       if f.pts is None:continue
       stamp=float(f.pts*f.time_base)
       with lock:
        video_frames.append((stamp,f));state['last_obs']=time.monotonic()
        while video_frames and stamp-video_frames[0][0]>25:video_frames.popleft()
      else:energy.feed(f)
  except Exception as error:
   print(json.dumps({'event':'obs_reconnect','error_type':type(error).__name__}),flush=True)
   with lock:state.update(mode='station',offset=None,consistent=0);video_frames.clear();obs_energy.clear()
   time.sleep(2)

def align():
 previous=None
 while True:
  time.sleep(1)
  with lock:r=list(radio_energy);v=list(obs_energy)
  if len(r)<WINDOW+4 or len(v)<WINDOW+4:continue
  # Equal 100 ms smoothing, then a unique eight-second content match.
  rv=np.convolve(np.array([x[1] for x in r]),np.ones(4)/4,'valid')[-WINDOW:]
  vv=np.convolve(np.array([x[1] for x in v]),np.ones(4)/4,'valid')
  windows=np.lib.stride_tricks.sliding_window_view(vv,WINDOW)
  rv=rv-rv.mean();variance=float(np.dot(rv,rv))
  if variance<1e-10:continue
  centered=windows-windows.mean(axis=1,keepdims=True)
  denominator=np.sqrt(np.sum(centered*centered,axis=1)*variance)
  scores=np.divide(centered@rv,denominator,out=np.zeros(len(windows)),where=denominator>1e-10)
  best=int(np.argmax(scores));confidence=float(scores[best]);competitors=scores.copy();competitors[max(0,best-4):best+5]=-1
  margin=confidence-float(competitors.max())
  # The final smoothed sample has the same timing shift in both histories.
  offset=v[best+WINDOW+2][0]-r[-1][0]
  now=time.monotonic()
  with lock:
   state['confidence']=round(confidence,5);state['margin']=round(margin,5)
   if confidence>.90 and margin>.035:
    consistent=previous is not None and abs(offset-previous)<.10
    state['consistent']=state['consistent']+1 if consistent else 1
    previous=offset
    if state['consistent']>=2:
     state.update(offset=offset,last_match=now,mode='live')
   elif state['offset'] is not None and confidence>.65 and abs(offset-state['offset'])<.10:
    state['last_match']=now
   else:
    previous=None;state['consistent']=0
   if now-state['last_match']>3:state['mode']='station'
   public={k:value for k,value in state.items() if k not in ('last_obs','last_match')}
   public.update(checked_at=time.time(),obs_frames=len(video_frames))
  Path('/run/highlife-program/status.json').write_text(json.dumps(public))

def run():
 config=json.loads(Path('/etc/highlife-obs-bridge/relay.json').read_text())
 if not os.environ.get('HIGHLIFE_OFFAIR'):threading.Thread(target=observe,args=(config['input'],),daemon=True).start()
 threading.Thread(target=align,daemon=True).start()
 radio=os.environ.get('HIGHLIFE_RADIO_URL','https://richrow-radio.129-213-164-255.sslip.io/listen/rich_row_radio/radio.mp3')
 target=os.environ.get('HIGHLIFE_PROGRAM_TARGET','udp://127.0.0.1:10090?pkt_size=1316')
 output=av.open(target,mode='w',format='mpegts',options={'mpegts_flags':'resend_headers','flush_packets':'1'})
 vs=output.add_stream('libx264',rate=RATE);vs.width=640;vs.height=360;vs.pix_fmt='yuv420p';vs.bit_rate=650000
 vs.options={'preset':'ultrafast','tune':'zerolatency','g':'50','keyint_min':'50','sc_threshold':'0','bf':'0'}
 aus=output.add_stream('aac',rate=48000);aus.layout='stereo';aus.bit_rate=192000
 resampler=av.AudioResampler(format='fltp',layout='stereo',rate=48000)
 radio_meter=Energy(radio_energy,relative=True)
 blank=np.zeros((360,640,3),dtype=np.uint8)
 samples=0;video_index=0;start=time.monotonic()
 with av.open(radio,timeout=(15,15)) as source:
  for frame in source.decode(audio=0):
   radio_meter.feed(frame)
   for audio in resampler.resample(frame):
    end=(samples+audio.samples)/48000
    while video_index/RATE<end:
     t=video_index/RATE
     with lock:
      desired=t+(state['offset'] or 0)
      usable=state['mode']=='live' and time.monotonic()-state['last_obs']<3
      candidates=list(video_frames) if usable else []
     chosen=min(candidates,key=lambda item:abs(item[0]-desired)) if candidates else None
     if chosen and abs(chosen[0]-desired)<.12:
      with lock:state['picture_error_ms']=round((chosen[0]-desired)*1000,2)
      picture=av.VideoFrame.from_ndarray(chosen[1].to_ndarray(format='rgb24'),format='rgb24')
     else:picture=av.VideoFrame.from_ndarray(blank,format='rgb24')
     picture.pts=video_index;picture.time_base=Fraction(1,RATE)
     for packet in vs.encode(picture):output.mux(packet)
     video_index+=1
    audio.pts=samples;audio.time_base=Fraction(1,48000);samples+=audio.samples
    for packet in aus.encode(audio):output.mux(packet)
    # The listener server may send an initial burst. Output uses one real-time clock.
    ahead=samples/48000-(time.monotonic()-start)
    if ahead>.1:time.sleep(min(ahead,.5))
 for stream in (vs,aus):
  for packet in stream.encode(None):output.mux(packet)
 output.close()

if __name__=='__main__':
 try:run()
 except Exception as error:
  print(json.dumps({'event':'program_restart','error_type':type(error).__name__}),flush=True)
  raise SystemExit(1)
