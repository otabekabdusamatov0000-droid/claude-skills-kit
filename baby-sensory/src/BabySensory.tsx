import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';

const FPS = 30;
const SCENE = 60 * FPS;
const FADE = 3 * FPS; // slow 3s cross-fade between scenes
export const TOTAL_FRAMES = 10 * SCENE;

const BLACK = '#000000';
const WHITE = '#FFFFFF';
const RED = '#FF0000';
const CX = 960;
const CY = 540;
const TAU = Math.PI * 2;

/** seconds elapsed inside the current scene (continues during overlap) */
const useT = () => useCurrentFrame() / FPS;
const wave = (t: number, period: number, phase = 0) => Math.sin((TAU * t) / period + phase);
const smooth = (x: number) => x * x * (3 - 2 * x);

const Stage: React.FC<{bg: string; children: React.ReactNode}> = ({bg, children}) => (
  <AbsoluteFill style={{backgroundColor: bg}}>
    <svg width={1920} height={1080} viewBox="0 0 1920 1080" style={{position: 'absolute'}}>
      {children}
    </svg>
  </AbsoluteFill>
);

/* ---------- 1. Moving black circle ---------- */
const MovingCircle = () => {
  const t = useT();
  return (
    <Stage bg={WHITE}>
      <circle cx={CX + 520 * wave(t, 60)} cy={CY} r={230} fill={BLACK} />
    </Stage>
  );
};

/* ---------- 2. Concentric circles ---------- */
const Concentric = () => {
  const t = useT();
  const scale = 1.02 + 0.2 * wave(t, 20 );
  return (
    <Stage bg={WHITE}>
      {[100, 200, 300, 400].map((r) => (
        <circle key={r} cx={CX} cy={CY} r={r * scale} fill="none" stroke={BLACK} strokeWidth={26} />
      ))}
    </Stage>
  );
};

/* ---------- 3. Smiling face (outlined) ---------- */
const Smile: React.FC<{x: number; y: number; s: number; filled?: boolean}> = ({x, y, s, filled}) => {
  const fg = filled ? WHITE : BLACK;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <circle r={300} fill={filled ? BLACK : WHITE} stroke={BLACK} strokeWidth={28} />
      <circle cx={-110} cy={-60} r={42} fill={fg} />
      <circle cx={110} cy={-60} r={42} fill={fg} />
      <path d="M -120 80 Q 0 190 120 80" fill="none" stroke={fg} strokeWidth={26} strokeLinecap="round" />
    </g>
  );
};
const FriendlyFace = () => {
  const t = useT();
  return (
    <Stage bg={WHITE}>
      <Smile x={CX + 480 * wave(t, 60)} y={CY} s={0.95} />
    </Stage>
  );
};

/* ---------- 4. Stripes ---------- */
const Stripes = () => {
  const t = useT();
  const period = 480; // 240 stripe + 240 gap
  const offset = (t * 20) % period;
  return (
    <Stage bg={WHITE}>
      {Array.from({length: 7}).map((_, i) => (
        <rect key={i} x={-period + i * period + offset + 120} y={0} width={240} height={1080} fill={BLACK} />
      ))}
    </Stage>
  );
};

/* ---------- 5. Butterfly ---------- */
const Butterfly = () => {
  const t = useT();
  const p = Math.min(t / 60, 1);
  const x = interpolate(p, [0, 1], [520, 1400]);
  const y = interpolate(p, [0, 1], [800, 280]);
  const open = 0.5 + 0.5 * Math.cos((TAU * t) / 10); // 10s flap cycle
  const sx = 0.3 + 0.7 * open;
  const wing = (dir: number) => (
    <g transform={`scale(${dir * sx} 1)`}>
      <ellipse cx={170} cy={-90} rx={190} ry={130} transform="rotate(-25 170 -90)" fill={BLACK} />
      <ellipse cx={130} cy={110} rx={130} ry={90} transform="rotate(20 130 110)" fill={BLACK} />
    </g>
  );
  return (
    <Stage bg={WHITE}>
      <g transform={`translate(${x} ${y})`}>
        {wing(1)}
        {wing(-1)}
        <rect x={-20} y={-130} width={40} height={300} rx={20} fill={BLACK} />
        <path d="M -8 -125 Q -50 -220 -100 -240 M 8 -125 Q 50 -220 100 -240" stroke={BLACK} strokeWidth={10} fill="none" strokeLinecap="round" />
      </g>
    </Stage>
  );
};

/* ---------- 6. Red intro ---------- */
const RedIntro = () => {
  const t = useT();
  const s = wave(t, 40);
  const blackIn = smooth(Math.min(Math.max((t - 6) / 6, 0), 1)); // black circle eases in
  return (
    <Stage bg={WHITE}>
      <circle cx={600 + 150 * s} cy={CY} r={230} fill={RED} />
      <circle cx={1400 - 150 * s} cy={CY} r={130} fill={BLACK} opacity={blackIn} />
    </Stage>
  );
};

/* ---------- 7. Stars ---------- */
const starPoints = (R: number) => {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? R : R * 0.382;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    pts.push(`${(r * Math.cos(a)).toFixed(2)},${(r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(' ');
};
const Stars = () => {
  const t = useT();
  const s = wave(t, 40);
  return (
    <Stage bg={BLACK}>
      <polygon points={starPoints(230)} fill={WHITE} transform={`translate(${560 + 110 * s} ${CY + 10})`} />
      <polygon points={starPoints(230)} fill={WHITE} transform={`translate(${1360 - 110 * s} ${CY + 10})`} />
    </Stage>
  );
};

/* ---------- 8. Animals ---------- */
const Panda: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} ${CY})`}>
    <circle cx={-210} cy={-210} r={105} fill={BLACK} />
    <circle cx={210} cy={-210} r={105} fill={BLACK} />
    <circle r={300} fill={WHITE} stroke={BLACK} strokeWidth={22} />
    <ellipse cx={-120} cy={-30} rx={75} ry={105} transform="rotate(30 -120 -30)" fill={BLACK} />
    <ellipse cx={120} cy={-30} rx={75} ry={105} transform="rotate(-30 120 -30)" fill={BLACK} />
    <circle cx={-110} cy={-40} r={26} fill={WHITE} />
    <circle cx={110} cy={-40} r={26} fill={WHITE} />
    <ellipse cx={0} cy={60} rx={52} ry={36} fill={BLACK} />
    <path d="M -80 130 Q 0 200 80 130" fill="none" stroke={BLACK} strokeWidth={20} strokeLinecap="round" />
  </g>
);
const Bear: React.FC<{x: number}> = ({x}) => (
  <g transform={`translate(${x} ${CY})`}>
    <circle cx={-215} cy={-215} r={95} fill={BLACK} />
    <circle cx={215} cy={-215} r={95} fill={BLACK} />
    <circle r={300} fill={WHITE} stroke={BLACK} strokeWidth={22} />
    <circle cx={-105} cy={-60} r={34} fill={BLACK} />
    <circle cx={105} cy={-60} r={34} fill={BLACK} />
    <ellipse cx={0} cy={80} rx={120} ry={90} fill={WHITE} stroke={BLACK} strokeWidth={20} />
    <ellipse cx={0} cy={40} rx={44} ry={30} fill={BLACK} />
    <path d="M -70 100 Q 0 170 70 100" fill="none" stroke={BLACK} strokeWidth={18} strokeLinecap="round" />
  </g>
);
const Animals = () => {
  const t = useT();
  const x = CX + 400 * wave(t, 30);
  const pandaOp = interpolate(t, [27, 33], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const bearOp = 1 - pandaOp;
  return (
    <Stage bg={WHITE}>
      <g opacity={pandaOp}><Panda x={x} /></g>
      <g opacity={bearOp}><Bear x={CX + 400 * wave(t - 30, 30)} /></g>
    </Stage>
  );
};

/* ---------- 9. Square + red circle ---------- */
const Shapes = () => {
  const t = useT();
  const s = wave(t, 60);
  return (
    <Stage bg={WHITE}>
      <rect x={CX + 520 * s - 140} y={320 - 140} width={280} height={280} fill={BLACK} />
      <circle cx={CX - 520 * s} cy={770} r={150} fill={RED} />
    </Stage>
  );
};

/* ---------- 10. Calm final ---------- */
const Final = () => {
  const t = useT();
  const amp = 60 * (1 - smooth(Math.min(Math.max((t - 45) / 15, 0), 1)));
  const opacity = 1 - smooth(Math.min(Math.max((t - 52) / 7, 0), 1));
  return (
    <Stage bg={WHITE}>
      <g opacity={opacity}>
        <Smile x={CX + amp * wave(t, 20)} y={CY} s={1.05} filled />
      </g>
    </Stage>
  );
};

const SCENES = [MovingCircle, Concentric, FriendlyFace, Stripes, Butterfly, RedIntro, Stars, Animals, Shapes, Final];

const FadeLayer: React.FC<{index: number; children: React.ReactNode}> = ({index, children}) => {
  const frame = useCurrentFrame();
  const opacity = index === 0 ? 1 : interpolate(frame, [0, FADE], [0, 1], {extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity}}>{children}</AbsoluteFill>;
};

export const BabySensory: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: WHITE}}>
    <Audio src={staticFile('calm-music.mp3')} volume={0.8} />
    {SCENES.map((Scene, i) => {
      // incoming scene starts FADE frames early and fades in over the previous one
      const from = i === 0 ? 0 : i * SCENE - FADE;
      const duration = TOTAL_FRAMES - from > SCENE + FADE ? SCENE + FADE : TOTAL_FRAMES - from;
      return (
        <Sequence key={i} from={from} durationInFrames={duration} layout="none">
          <FadeLayer index={i}>
            <Scene />
          </FadeLayer>
        </Sequence>
      );
    })}
  </AbsoluteFill>
);
