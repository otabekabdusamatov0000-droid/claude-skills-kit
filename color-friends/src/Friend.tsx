import React from 'react';

export type Kind = 'apple' | 'orange' | 'lemon' | 'leaf' | 'blueberry' | 'grapes';

export const PALETTE: Record<Kind, {main: string; light: string; word: string}> = {
  apple: {main: '#E5171F', light: '#FF7A7A', word: 'RED'},
  orange: {main: '#FF7A00', light: '#FFC27A', word: 'ORANGE'},
  lemon: {main: '#FFD400', light: '#FFF08A', word: 'YELLOW'},
  leaf: {main: '#2FBF2F', light: '#9BF08A', word: 'GREEN'},
  blueberry: {main: '#2457E6', light: '#8FB0FF', word: 'BLUE'},
  grapes: {main: '#8E3BD6', light: '#D2A2FF', word: 'PURPLE'},
};
export const ORDER: Kind[] = ['apple', 'orange', 'lemon', 'leaf', 'blueberry', 'grapes'];

const Face: React.FC<{y?: number; open?: boolean}> = ({y = 0, open}) => (
  <g transform={`translate(0 ${y})`}>
    <ellipse cx={-48} cy={-6} rx={15} ry={20} fill="#1b1b1b" />
    <ellipse cx={48} cy={-6} rx={15} ry={20} fill="#1b1b1b" />
    <circle cx={-43} cy={-14} r={6} fill="#fff" />
    <circle cx={53} cy={-14} r={6} fill="#fff" />
    <ellipse cx={-85} cy={30} rx={20} ry={12} fill="#FF8FA3" opacity={0.75} />
    <ellipse cx={85} cy={30} rx={20} ry={12} fill="#FF8FA3" opacity={0.75} />
    {open ? (
      <path d="M -26 30 Q 0 78 26 30 Z" fill="#7a1c1c" stroke="#1b1b1b" strokeWidth={5} strokeLinejoin="round" />
    ) : (
      <path d="M -26 32 Q 0 62 26 32" fill="none" stroke="#1b1b1b" strokeWidth={6} strokeLinecap="round" />
    )}
  </g>
);

const Gradient: React.FC<{id: string; kind: Kind}> = ({id, kind}) => (
  <radialGradient id={id} cx="35%" cy="28%" r="75%">
    <stop offset="0%" stopColor={PALETTE[kind].light} />
    <stop offset="55%" stopColor={PALETTE[kind].main} />
    <stop offset="100%" stopColor={PALETTE[kind].main} stopOpacity={1} />
  </radialGradient>
);

/** A cute fruit friend centered on (0,0), roughly 300 units wide. */
export const Friend: React.FC<{kind: Kind; open?: boolean}> = ({kind, open}) => {
  const id = `g-${kind}`;
  const fill = `url(#${id})`;
  const shine = <ellipse cx={-70} cy={-95} rx={34} ry={18} fill="#fff" opacity={0.45} transform="rotate(-35 -70 -95)" />;
  return (
    <g>
      <defs><Gradient id={id} kind={kind} /></defs>
      {kind === 'apple' && (
        <>
          <path d="M 0 -150 Q 6 -190 30 -205" stroke="#6b3d1a" strokeWidth={14} fill="none" strokeLinecap="round" />
          <path d="M 18 -170 Q 70 -225 120 -185 Q 80 -140 18 -170 Z" fill="#35B54A" />
          <path d="M -150 -20 C -150 -130 -60 -160 0 -135 C 60 -160 150 -130 150 -20 C 150 90 70 150 0 135 C -70 150 -150 90 -150 -20 Z" fill={fill} />
          {shine}<Face open={open} />
        </>
      )}
      {kind === 'orange' && (
        <>
          <circle r={150} fill={fill} />
          <path d="M 0 -148 Q 40 -205 95 -185 Q 70 -135 0 -148 Z" fill="#35B54A" />
          {shine}<Face open={open} />
        </>
      )}
      {kind === 'lemon' && (
        <>
          <path d="M -185 0 Q -150 -20 -120 -70 C -60 -150 60 -150 120 -70 Q 150 -20 185 0 Q 150 20 120 70 C 60 150 -60 150 -120 70 Q -150 20 -185 0 Z" fill={fill} />
          <path d="M 20 -125 Q 70 -190 130 -160 Q 90 -105 20 -125 Z" fill="#35B54A" />
          {shine}<Face open={open} />
        </>
      )}
      {kind === 'leaf' && (
        <>
          <path d="M -170 100 C -190 -80 -40 -190 170 -170 C 190 20 60 170 -170 100 Z" fill={fill} />
          <path d="M -170 100 Q -60 20 120 -120" stroke="#1f8f2a" strokeWidth={10} fill="none" strokeLinecap="round" />
          <path d="M -182 112 Q -200 130 -215 135" stroke="#1f8f2a" strokeWidth={12} fill="none" strokeLinecap="round" />
          <g transform="translate(0 10)"><Face open={open} /></g>
        </>
      )}
      {kind === 'blueberry' && (
        <>
          <circle r={140} fill={fill} />
          <polygon points="0,-165 -28,-132 28,-132" fill="#1a3da8" />
          <polygon points="-50,-150 -24,-128 -60,-122" fill="#1a3da8" />
          <polygon points="50,-150 24,-128 60,-122" fill="#1a3da8" />
          {shine}<Face open={open} />
        </>
      )}
      {kind === 'grapes' && (
        <>
          <path d="M 0 -150 Q 4 -190 40 -210" stroke="#6b3d1a" strokeWidth={12} fill="none" strokeLinecap="round" />
          <path d="M 30 -185 Q 90 -235 140 -190 Q 95 -145 30 -185 Z" fill="#35B54A" />
          {[[-85, -70], [85, -70], [0, -85], [-125, 40], [125, 40], [-45, 60], [45, 60], [0, 150]].map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r={72} fill={fill} stroke="#6a24a8" strokeWidth={3} />
          ))}
          <g transform="translate(0 5)"><Face open={open} /></g>
        </>
      )}
    </g>
  );
};
