"""Synthesizes a calm 10-minute lullaby-style ambient track (no external services)."""
import numpy as np, wave, sys
SR = 44100
DUR = 600
N = SR * DUR
rng = np.random.default_rng(7)
out = np.zeros((2, N), dtype=np.float32)

def note(freq, dur, amp=1.0):
    t = np.arange(int(dur * SR)) / SR
    s = (np.sin(2*np.pi*freq*t) + 0.25*np.sin(2*np.pi*2*freq*t) + 0.08*np.sin(2*np.pi*3*freq*t))
    a = np.minimum(t/0.08, 1) * np.exp(-t/ (dur*0.45))   # soft bell/music-box decay
    return (s * a * amp).astype(np.float32)

def add(sig, start, pan=0.5):
    i = int(start * SR); j = min(i + len(sig), N)
    if i >= N: return
    seg = sig[:j-i]
    out[0, i:j] += seg * (1-pan); out[1, i:j] += seg * pan

# C major pentatonic, gentle
P = {'C4':261.63,'D4':293.66,'E4':329.63,'G4':392.0,'A4':440.0,'C5':523.25,'D5':587.33,'E5':659.25,'G5':783.99}
mel = ['E4','G4','A4','G4','E4','D4','C4','D4','E4','G4','E5','D5','C5','A4','G4','E4']
beat = 1.6  # slow
t0 = 0.0; k = 0
while t0 < DUR:
    n = mel[k % len(mel)]
    add(note(P[n], 5.0, 0.20), t0, 0.35 + 0.3*((k % 4)/3))
    if k % 4 == 0:
        add(note(P['C4']/2, 8.0, 0.18), t0, 0.5)   # warm bass
    k += 1; t0 += beat
# soft pad chords (C - Am - F - G), slow swell
chords = [(130.81,164.81,196.0),(110.0,164.81,220.0),(174.61,220.0,261.63),(98.0,196.0,246.94)]
for c in range(0, DUR, 16):
    for f in chords[(c//16) % 4]:
        t = np.arange(int(20*SR)) / SR
        env = np.sin(np.pi * np.clip(t/20, 0, 1))**2
        s = (np.sin(2*np.pi*f*t) + np.sin(2*np.pi*f*1.003*t)) * env * 0.06
        add(s.astype(np.float32), c, 0.5)
# simple reverb-ish echo
for d, g in ((0.37, .35), (0.61, .25), (0.93, .15)):
    k_ = int(d*SR); out[:, k_:] += out[:, :-k_] * g
# global fade in/out, normalize
fade = np.ones(N, dtype=np.float32)
fi, fo = 8*SR, 20*SR
fade[:fi] = np.linspace(0, 1, fi); fade[-fo:] = np.linspace(1, 0, fo)
out *= fade
out *= 0.55 / np.abs(out).max()
pcm = (out.T * 32767).astype('<i2')
with wave.open(sys.argv[1], 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
