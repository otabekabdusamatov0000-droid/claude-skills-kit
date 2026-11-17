import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import {Friend, Kind, ORDER, PALETTE} from './Friend';

const FPS = 30;
const sec = (s: number) => Math.round(s * FPS);
export const TOTAL_FRAMES = sec(300);
const TAU = Math.PI * 2;

const INTRO = 15;
const VERSE = 36;
const VERSES_START = INTRO;
const REVIEW_START = INTRO + 6 * VERSE; // 231
const SLOT = 9;
const OUTRO_START = REVIEW_START + 6 * SLOT; // 285

const RAINBOW = ['#E5171F', '#FF7A00', '#FFD400', '#2FBF2F', '#2457E6', '#8E3BD6'];
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1);
const ease = (x: number) => {
  const c = clamp01(x);
  return c * c * (3 - 2 * c);
};

const useT = () => useCurrentFrame() / FPS;
const Stage: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: '#000'}}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>{children}</svg>
  </AbsoluteFill>
);

/** Rounded 3D-ish letters; each letter bobs in a slow wave. */
const Word: React.FC<{text: string; x: number; y: number; size: number; colors: string[]; t: number; anchor?: 'middle' | 'start'}> = ({text, x, y, size, colors, t, anchor = 'middle'}) => {
  const step = size * 0.8;
  const total = step * text.length;
  const startX = anchor === 'middle' ? x - total / 2 + step / 2 : x + step / 2;
  return (
    <g>
      {text.split('').map((ch, i) => (
        <text
          key={i}
          x={startX + i * step}
          y={y + 12 * Math.sin(TAU * (t / 3 - i * 0.1))}
          textAnchor="middle"
          fontFamily="'Arial Rounded MT Bold','Trebuchet MS','Verdana',sans-serif"
          fontWeight={900}
          fontSize={size}
          fill={colors[i % colors.length]}
          stroke="#fff"
          strokeWidth={size * 0.035}
          paintOrder="stroke"
        >
          {ch}
        </text>
      ))}
    </g>
  );
};

/** Slowly drifting confetti stars/dots in a given color, deterministic. */
const Confetti: React.FC<{colors: string[]; t: number}> = ({colors, t}) => (
  <g>
    {Array.from({length: 14}).map((_, i) => {
      const bx = (i * 331) % 1920;
      const by = (i * 197 + 80) % 1000;
      const x = bx + 30 * Math.sin(TAU * (t / 14 + i / 7));
      const y = by + 22 * Math.cos(TAU * (t / 11 + i / 5));
      const r = 10 + (i % 3) * 6;
      return <circle key={i} cx={x} cy={y} r={r} fill={colors[i % colors.length]} opacity={0.65} />;
    })}
  </g>
);

const Intro = () => {
  const t = useT();
  return (
    <Stage>
      <Confetti colors={RAINBOW} t={t} />
      <Word text="COLORS" x={960} y={330} size={260} colors={RAINBOW} t={t} />
      {ORDER.map((k, i) => {
        const rise = ease((t - 1 - i * 0.7) / 2.5);
        return (
          <g key={k} transform={`translate(${260 + i * 280} ${1180 - rise * 330 + 10 * Math.sin(TAU * (t / 3 + i / 6))}) scale(0.55)`}>
            <Friend kind={k} open />
          </g>
        );
      })}
    </Stage>
  );
};

const Verse: React.FC<{kind: Kind}> = ({kind}) => {
  const t = useT();
  const p = PALETTE[kind];
  const enter = ease(t / 3.5);
  const exit = ease((t - (VERSE - 3)) / 3);
  const slide = (1 - enter) * 1500 - exit * 1500;
  const bob = 22 * Math.sin(TAU * t / 4);
  const squash = 1 + 0.03 * Math.sin(TAU * t / 2);
  const talking = (t > 3 && t < 9.5) || (t > 20 && t < 26.5);
  const spin = 4 * Math.sin(TAU * t / 5);
  return (
    <Stage>
      <Confetti colors={[p.main, p.light]} t={t} />
      <g transform={`translate(${620 + slide} ${520 + bob}) rotate(${spin}) scale(${1.25 * squash} ${1.25 / squash})`}>
        <Friend kind={kind} open={talking && Math.floor(t * 4) % 2 === 0} />
      </g>
      <g transform={`translate(${slide * 1.2} 0)`}>
        <Word text={p.word} x={1310} y={640} size={p.word.length > 4 ? 165 : 240} colors={[p.main]} t={t} />
      </g>
    </Stage>
  );
};

const Review = () => {
  const t = useT();
  const active = Math.min(5, Math.floor(t / SLOT));
  const local = t - active * SLOT;
  return (
    <Stage>
      <Confetti colors={RAINBOW} t={t} />
      {ORDER.map((k, i) => {
        const on = i === active;
        const pulse = on ? 1 + 0.12 * ease(Math.min(local, 1)) * (1 + 0.15 * Math.sin(TAU * local / 1.5)) : 1;
        const up = on ? -40 * ease(Math.min(local, 1)) : 0;
        return (
          <g key={k} transform={`translate(${210 + i * 300} ${480 + up}) scale(${0.62 * pulse})`} opacity={on ? 1 : 0.5}>
            <Friend kind={k} open={on && local > 1 && local < 2} />
          </g>
        );
      })}
      <Word text={PALETTE[ORDER[active]].word} x={960} y={900} size={200} colors={[PALETTE[ORDER[active]].main]} t={t} />
    </Stage>
  );
};

const Outro = () => {
  const t = useT();
  const fade = 1 - ease((t - 9) / 5.5);
  return (
    <Stage>
      <g opacity={fade}>
        <Confetti colors={RAINBOW} t={t} />
        <Word text="BYE BYE" x={960} y={330} size={240} colors={RAINBOW} t={t} />
        {ORDER.map((k, i) => (
          <g key={k} transform={`translate(${260 + i * 280} ${700 + 14 * Math.sin(TAU * (t / 2.5 + i / 6))}) rotate(${8 * Math.sin(TAU * (t / 2 + i / 6))}) scale(0.55)`}>
            <Friend kind={k} open={t < 6} />
          </g>
        ))}
      </g>
    </Stage>
  );
};

const Voice: React.FC<{name: string; at: number}> = ({name, at}) => (
  <Sequence from={sec(at)}>
    <Audio src={staticFile(`voice/${name}.mp3`)} volume={1} />
  </Sequence>
);

const FadeIn: React.FC<{children: React.ReactNode}> = ({children}) => {
  const f = useCurrentFrame();
  return <AbsoluteFill style={{opacity: interpolate(f, [0, 15], [0, 1], {extrapolateRight: 'clamp'})}}>{children}</AbsoluteFill>;
};

export const ColorFriends: React.FC = () => {
  const names = ['red', 'orange', 'yellow', 'green', 'blue', 'purple'];
  return (
    <AbsoluteFill style={{backgroundColor: '#000'}}>
      <Audio src={staticFile('music.mp3')} volume={0.28} />
      <Sequence from={0} durationInFrames={sec(INTRO)}><Intro /></Sequence>
      {ORDER.map((k, i) => (
        <Sequence key={k} from={sec(VERSES_START + i * VERSE)} durationInFrames={sec(VERSE)}>
          <FadeIn><Verse kind={k} /></FadeIn>
        </Sequence>
      ))}
      <Sequence from={sec(REVIEW_START)} durationInFrames={sec(6 * SLOT)}><Review /></Sequence>
      <Sequence from={sec(OUTRO_START)} durationInFrames={sec(15)}><Outro /></Sequence>

      <Voice name="intro" at={1.5} />
      {names.map((n, i) => (
        <React.Fragment key={n}>
          <Voice name={n} at={VERSES_START + i * VERSE + 4} />
          <Voice name={n} at={VERSES_START + i * VERSE + 21} />
          <Voice name={`r_${n}`} at={REVIEW_START + i * SLOT + 1} />
        </React.Fragment>
      ))}
      <Voice name="outro" at={OUTRO_START + 1} />
    </AbsoluteFill>
  );
};
