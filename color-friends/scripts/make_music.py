"""Synthesizes a gentle, cheerful 5-minute nursery-style backing track (no external services)."""
import numpy as np, wave, sys
SR, DUR = 44100, 300
N = SR * DUR
out = np.zeros((2, N), dtype=np.float32)
BPM = 96
BEAT = 60 / BPM

def pluck(f, dur, amp):
    t = np.arange(int(dur * SR)) / SR
    s = np.sin(2*np.pi*f*t) + 0.35*np.sin(4*np.pi*f*t) + 0.12*np.sin(6*np.pi*f*t)
    return (s * np.minimum(t/0.01, 1) * np.exp(-t*4.5) * amp).astype(np.float32)

def add(sig, start, pan=0.5):
    i = int(start*SR); j = min(i+len(sig), N)
    if i < N:
        out[0, i:j] += sig[:j-i]*(1-pan); out[1, i:j] += sig[:j-i]*pan

C = {'C3':130.81,'D3':146.83,'E3':164.81,'F3':174.61,'G3':196.0,'A3':220.0,'B3':246.94,
     'C4':261.63,'D4':293.66,'E4':329.63,'F4':349.23,'G4':392.0,'A4':440.0,'B4':493.88,
     'C5':523.25,'D5':587.33,'E5':659.25,'G5':783.99}
prog = [('C3',['C4','E4','G4']), ('G3',['B3','D4','G4']), ('A3',['C4','E4','A4']), ('F3',['A3','C4','F4'])]
mel = [['E5','D5','C5','D5','E5','E5','E5','-'], ['D5','D5','D5','-','E5','G5','G5','-'],
       ['E5','D5','C5','D5','E5','E5','E5','E5'], ['D5','D5','E5','D5','C5','-','-','-']]
bar = 0
t = 0.0
while t < DUR - 1:
    root, ch = prog[bar % 4]
    add(pluck(C[root]/2 if False else C[root], 1.2, 0.30), t, 0.5)               # bass
    for k in range(8):                                                           # arpeggio, eighth notes
        add(pluck(C[ch[k % 3]], 0.8, 0.12), t + k*BEAT/2, 0.35 + 0.3*(k % 2))
    if (bar // 4) % 2 == 1:                                                      # melody on alternate phrases
        for k, n in enumerate(mel[bar % 4]):
            if n != '-': add(pluck(C[n], 1.0, 0.16), t + k*BEAT/2, 0.6)
    bar += 1; t += 4*BEAT/2 * 2 / 2 * 1.0 if False else 2*BEAT*1.0                # 4/4 bar = 4 beats? see below
    # (a bar of 8 eighth-notes is 4 beats)
    t += 2*BEAT
for d, g in ((0.30, .30), (0.55, .20)):
    k = int(d*SR); out[:, k:] += out[:, :-k]*g
fade = np.ones(N, dtype=np.float32); fi, fo = 4*SR, 10*SR
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
out *= fade; out *= 0.6/np.abs(out).max()
pcm = (out.T*32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
