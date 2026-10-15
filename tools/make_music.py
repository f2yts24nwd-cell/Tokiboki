#!/usr/bin/env python3
"""Erzeugt die Festival-Tracks für Tokiboki (eigene Kompositionen, gemeinfrei / CC0).

Alles wird hier mit numpy synthetisiert – keine Samples, keine fremde Musik.
Aufruf:  python3 tools/make_music.py   (benötigt numpy und ffmpeg)
Ergebnis: audio/track1.mp3 … audio/track3.mp3 (jeweils 32 Takte, nahtlos loopbar)
"""
import os
import subprocess
import sys

import numpy as np

SR = 44100
OUT = os.path.join(os.path.dirname(__file__), '..', 'audio')

NOTE = {n: i for i, n in enumerate(['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'])}


def hz(name, octave):
    return 440.0 * 2 ** ((NOTE[name] + 12 * (octave + 1) - 69) / 12)


class Track:
    def __init__(self, bpm, bars=32, seed=1):
        self.bpm = bpm
        self.beat = 60.0 / bpm
        self.bars = bars
        self.n = int(round(bars * 4 * self.beat * SR))
        self.rng = np.random.default_rng(seed)
        self.dry = np.zeros((2, self.n))
        self.wet = np.zeros((2, self.n))  # geht durch den Hall
        self.duck = np.ones(self.n)

    def t(self, beats):
        return int(round(beats * self.beat * SR))

    def add(self, sig, at_beats, pan=0.0, gain=1.0, wet=0.0):
        i = self.t(at_beats)
        sig = np.asarray(sig) * gain
        idx = (np.arange(len(sig)) + i) % self.n  # Überhang wickelt auf den Anfang -> nahtloser Loop
        l, r = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        np.add.at(self.dry[0], idx, sig * l * (1 - wet * 0.5))
        np.add.at(self.dry[1], idx, sig * r * (1 - wet * 0.5))
        if wet:
            np.add.at(self.wet[0], idx, sig * l * wet)
            np.add.at(self.wet[1], idx, sig * r * wet)

    # ---------- Instrumente ----------
    def kick(self):
        n = int(0.42 * SR)
        t = np.arange(n) / SR
        f = 46 + 150 * np.exp(-t / 0.032)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.27)
        s += self.rng.standard_normal(n) * np.exp(-t / 0.003) * 0.25
        return np.tanh(1.8 * s) * 0.75

    def hat(self, open_=False):
        n = int((0.22 if open_ else 0.05) * SR)
        x = self.rng.standard_normal(n)
        x = np.diff(np.diff(x, prepend=0), prepend=0)
        t = np.arange(n) / SR
        return x * np.exp(-t / (0.07 if open_ else 0.012)) * 0.28

    def clap(self):
        n = int(0.4 * SR)
        x = self.rng.standard_normal(n)
        X = np.fft.rfft(x)
        f = np.fft.rfftfreq(n, 1 / SR)
        X *= np.exp(-((f - 1400) / 800) ** 2)
        x = np.fft.irfft(X, n)
        x /= np.abs(x).max()
        t = np.arange(n) / SR
        e = sum((t >= d) * np.exp(-np.clip(t - d, 0, None) / (0.007 if d < 0.02 else 0.13)) for d in (0, 0.01, 0.021))
        return x * e * 0.55

    def noise_riser(self, beats):
        n = self.t(beats)
        x = self.rng.standard_normal(n)
        X = np.fft.rfft(x)
        f = np.fft.rfftfreq(n, 1 / SR)
        X *= np.exp(-((f - 3500) / 3000) ** 2)
        x = np.fft.irfft(X, n)
        x /= np.abs(x).max()
        ramp = np.linspace(0, 1, n) ** 2.2
        return x * ramp * 0.22

    def saw(self, freq, n, cutoff, reso=0.0, voices=1, detune=0.0, maxh=60):
        t = np.arange(n) / SR
        cut = np.broadcast_to(np.asarray(cutoff, dtype=float), (n,))
        out = np.zeros(n)
        for v in range(voices):
            fv = freq * (1 + detune * (2 * v / max(1, voices - 1) - 1)) if voices > 1 else freq
            ph = self.rng.random() * 2 * np.pi
            k = 1
            while k * fv < 14000 and k <= maxh:
                fk = k * fv
                amp = (1.0 / k) / np.sqrt(1 + (fk / cut) ** 4)
                if reso:
                    amp = amp * (1 + reso * np.exp(-((fk - cut) / (0.18 * cut)) ** 2))
                out += amp * np.sin(2 * np.pi * fk * t + ph * k)
                k += 1
        return out / voices

    def adsr(self, n, a=0.005, d=0.1, s=0.6, r=0.05):
        t = np.arange(n) / SR
        dur = n / SR
        e = np.where(t < a, t / a, s + (1 - s) * np.exp(-(t - a) / d))
        rel = np.clip((dur - t) / r, 0, 1)
        return e * rel

    def sidechain(self, at_beats, depth=0.75):
        i = self.t(at_beats)
        n = self.t(1)
        t = np.arange(n) / SR
        g = 1 - depth * np.exp(-t / (self.beat * 0.28))
        idx = (np.arange(n) + i) % self.n
        self.duck[idx] = np.minimum(self.duck[idx], g)

    # ---------- Mischung ----------
    def render(self, name, title):
        # Hall: exponentiell abklingendes Rauschen, zirkulär gefaltet (Loop bleibt nahtlos)
        ir_n = int(2.2 * SR)
        t = np.arange(ir_n) / SR
        out = self.dry.copy()
        for ch in range(2):
            ir = self.rng.standard_normal(ir_n) * np.exp(-t / 0.55)
            ir[: int(0.012 * SR)] = 0
            ir /= np.sqrt((ir ** 2).sum())
            h = np.zeros(self.n)
            h[:ir_n] = ir
            out[ch] += np.real(np.fft.ifft(np.fft.fft(self.wet[ch]) * np.fft.fft(h))) * 0.9
        out *= self.duck_apply
        out += self.drums
        out = out / np.abs(out).max()
        out = np.tanh(out * 2.4) / np.tanh(2.4) * 0.94  # sanfte Sättigung = mehr Lautheit
        os.makedirs(OUT, exist_ok=True)
        wav = os.path.join(OUT, name + '.wav')
        pcm = (out.T * 32767).astype('<i2')
        import wave
        with wave.open(wav, 'wb') as w:
            w.setnchannels(2)
            w.setsampwidth(2)
            w.setframerate(SR)
            w.writeframes(pcm.tobytes())
        m4a = os.path.join(OUT, name + '.mp3')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-c:a', 'libmp3lame', '-b:a', '128k',
                        '-metadata', f'title={title}', '-metadata', 'artist=Tokiboki',
                        '-metadata', 'copyright=CC0 – eigene Komposition, gemeinfrei', m4a], check=True)
        os.remove(wav)
        print('geschrieben:', m4a, f'{self.n / SR:.1f}s')


def build(name, title, bpm, prog, seed, style):
    tr = Track(bpm, seed=seed)
    drums = Track(bpm, seed=seed + 100)
    drums.n = tr.n
    drums.dry = np.zeros((2, tr.n))
    drums.wet = np.zeros((2, tr.n))
    K, HC, HO, CL = tr.kick(), tr.hat(), tr.hat(True), tr.clap()
    s16 = 0.25
    bars = tr.bars
    for bar in range(bars):
        chord = prog[bar % len(prog)]
        root = chord[0]
        breakdown = 16 <= bar < 20
        intro = bar < 4
        drop = bar >= 20
        for b in range(4):
            beat = bar * 4 + b
            if not breakdown:
                drums.add(K, beat, gain=1.0)
                tr.sidechain(beat, 0.7 if drop else 0.55)
            if not breakdown or bar >= 18:
                drums.add(HC, beat + 0.5, pan=0.25, gain=0.9 if not intro else 0.6)
                if style.get('hat16') and not intro:
                    drums.add(HC, beat + 0.25, pan=-0.3, gain=0.35)
                    drums.add(HC, beat + 0.75, pan=0.3, gain=0.4)
            if bar >= 4 and not intro and (not breakdown) and bar % 2 == 1 and b == 3:
                drums.add(HO, beat + 0.5, pan=-0.2, gain=0.8)
            if bar >= 4 and b in (1, 3) and not breakdown:
                tr.add(CL, beat, pan=0.05, gain=0.9, wet=0.25)
        # Snare-Roll vor dem Drop
        if bar in (18, 19):
            step = 0.5 if bar == 18 else 0.25
            k = 0
            while k < 4:
                tr.add(CL * 0.6, bar * 4 + k, gain=0.35 + 0.4 * (k / 4 + (bar - 18) * 0.5), wet=0.3)
                k += step
        if bar == 18:
            tr.add(tr.noise_riser(8), bar * 4, gain=1.0, wet=0.4)
        # Bass: rollende 16tel zwischen den Kicks
        if bar >= 4 and not breakdown:
            for b in range(4):
                for k in style['bass_steps']:
                    pos = bar * 4 + b + k * s16
                    n = tr.t(s16 * 0.92)
                    note = hz(root, 1) * (2 if (k == 3 and style.get('octave_bass')) else 1)
                    cut0 = style['bass_cut'] * (0.55 if bar < 8 else 1.0)
                    cut = cut0 * (1 + 3 * np.exp(-np.arange(n) / SR / 0.04))
                    if style.get('acid'):
                        lfo = 0.5 + 0.5 * np.sin(2 * np.pi * (bar * 4 + b) / 16)
                        cut = cut * (0.5 + 1.6 * lfo)
                    sig = tr.saw(note, n, cut, reso=style.get('reso', 0.0), maxh=40) * tr.adsr(n, 0.002, 0.06, 0.5, 0.02)
                    tr.add(sig, pos, gain=style['bass_gain'])
        # Pad-Akkord (breiter, mit Hall)
        if bar >= 8:
            n = tr.t(4)
            for i, nn in enumerate(chord):
                f = hz(nn, 3 if i == 0 else 4)
                cut = 900 + 1800 * (bar >= 20) + 400 * np.sin(np.linspace(0, np.pi, n))
                sig = tr.saw(f, n, cut, voices=3, detune=0.006, maxh=24) * tr.adsr(n, 0.25, 0.8, 0.7, 0.3)
                tr.add(sig, bar * 4, pan=(-0.5, 0.5, 0)[i % 3], gain=style['pad_gain'], wet=0.6)
        # Lead-Arpeggio
        if bar >= 16:
            pattern = style['arp']
            for step in range(16):
                deg = pattern[step % len(pattern)]
                nn = chord[deg % len(chord)]
                octv = 4 + deg // len(chord) + style.get('lead_oct', 0)
                f = hz(nn, octv)
                n = tr.t(s16 * 0.85)
                if breakdown:
                    cut = 500 + (bar - 16 + step / 16) / 4 * 3500
                else:
                    cut = 3200 + 1400 * np.sin(2 * np.pi * (bar * 16 + step) / 64)
                sig = tr.saw(f, n, cut, voices=5, detune=0.012, maxh=30) * tr.adsr(n, 0.003, 0.09, 0.35, 0.03)
                tr.add(sig, bar * 4 + step * s16, pan=0.35 * np.sin(step), gain=style['lead_gain'] * (0.7 if breakdown else 1.0), wet=0.35)
    # Mischung zusammensetzen
    tr.drums = drums.dry
    tr.duck_apply = tr.duck[None, :]
    tr.render(name, title)


if __name__ == '__main__':
    tracks = [
        ('track1', 'Tokiland Hymne', 128, [['A', 'C', 'E'], ['F', 'A', 'C'], ['C', 'E', 'G'], ['G', 'B', 'D']], 11,
         dict(bass_steps=(1, 2, 3), bass_cut=420, bass_gain=0.85, pad_gain=0.42, lead_gain=0.55, arp=[0, 1, 2, 3, 2, 1, 0, 2, 4, 3, 2, 1, 2, 3, 4, 5], hat16=True)),
        ('track2', 'Neonwald', 124, [['D', 'F', 'A'], ['D', 'F', 'A'], ['A#', 'D', 'F'], ['C', 'E', 'G']], 22,
         dict(bass_steps=(1, 2, 3), bass_cut=380, bass_gain=0.9, reso=2.5, acid=True, pad_gain=0.34, lead_gain=0.42, arp=[0, 2, 1, 3, 0, 4, 2, 1], lead_oct=-1)),
        ('track3', 'Raketenstart', 132, [['E', 'G', 'B'], ['C', 'E', 'G'], ['G', 'B', 'D'], ['D', 'F#', 'A']], 33,
         dict(bass_steps=(1, 2, 3), bass_cut=520, bass_gain=0.85, octave_bass=True, pad_gain=0.4, lead_gain=0.56, arp=[0, 2, 4, 2, 5, 4, 2, 1, 0, 2, 3, 5, 4, 3, 2, 1], hat16=True)),
    ]
    only = sys.argv[1:] or None
    for name, title, bpm, prog, seed, style in tracks:
        if only and name not in only:
            continue
        build(name, title, bpm, prog, seed, style)
