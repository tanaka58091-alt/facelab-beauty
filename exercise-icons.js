// ===================================================================
// EXERCISE ICONS — 一覧カード用の部位アイコン
// exercises.js と exercises-ext.js の両方から使う共有部品。
// （手順の本体は motion.js の手順パネル）
// ===================================================================
const svg = (inner) => `<svg viewBox="0 0 80 80" class="ex-svg">${inner}</svg>`;
const face = (extra='') => `
  <ellipse cx="40" cy="44" rx="22" ry="28" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>
  <circle cx="32" cy="38" r="2" fill="#0b1530"/>
  <circle cx="48" cy="38" r="2" fill="#0b1530"/>
  ${extra}
`;
const smile = `<path d="M33 55 Q40 58 47 55" stroke="#E07A8A" stroke-width="1.5" fill="none" stroke-linecap="round"/>`;

// 一覧カード用の部位アイコン（手順の本体は motion.js の手順パネル）
export const ICON = {
  brow:   svg(face(`<path d="M27 33 Q32 30 37 33 M43 33 Q48 30 53 33" stroke="#3D2A2F" stroke-width="1.5" fill="none"/><path d="M40 29 l0 -5 m-2 2 l2 -2 l2 2" stroke="#FF8FA8" stroke-width="1.5" fill="none" stroke-linecap="round"/>${smile}`)),
  eye:    svg(face(`<circle cx="32" cy="38" r="4.5" fill="none" stroke="#3D2A2F" stroke-width="1.5"/><circle cx="48" cy="38" r="4.5" fill="none" stroke="#3D2A2F" stroke-width="1.5"/>${smile}`)),
  cheek:  svg(face(`<circle cx="27" cy="48" r="6" fill="#FFB7C5" opacity="0.65"/><circle cx="53" cy="48" r="6" fill="#FFB7C5" opacity="0.65"/><path d="M31 55 Q40 51 49 55" stroke="#E07A8A" stroke-width="2" fill="none" stroke-linecap="round"/>`)),
  mouth:  svg(face(`<path d="M31 56 Q40 52 49 56" stroke="#E07A8A" stroke-width="2" fill="none" stroke-linecap="round"/><path d="M31 56 l-3 -3 M49 56 l3 -3" stroke="#FF8FA8" stroke-width="2" stroke-linecap="round"/>`)),
  tongue: svg(face(`<circle cx="40" cy="54" r="7" fill="none" stroke="#FF8FA8" stroke-width="1.5" stroke-dasharray="2 2"/><path d="M47 54 l-2 -2 M47 54 l-2 2" stroke="#FF8FA8" stroke-width="1.5" fill="none"/>`)),
  chin:   svg(face(`<path d="M28 60 Q40 70 52 60" stroke="#E07A8A" stroke-width="2" fill="none"/><path d="M52 60 l4 -2" stroke="#FF8FA8" stroke-width="2" stroke-linecap="round"/>${smile}`)),
  jaw:    svg(face(`<circle cx="25" cy="52" r="5" fill="#FFB7C5" opacity="0.7"/><text x="25" y="55" text-anchor="middle" font-size="9">✋</text>${smile}`)),
  neck:   svg(face(`<path d="M40 70 l0 7 m-3 -3 l3 3 l3 -3" stroke="#FF8FA8" stroke-width="2" fill="none" stroke-linecap="round"/>${smile}`)),
  whole:  svg(face(`<path d="M31 54 Q40 60 49 54" stroke="#E07A8A" stroke-width="2" fill="none" stroke-linecap="round"/><text x="22" y="30" font-size="9">✨</text><text x="52" y="54" font-size="9">✨</text>`)),
  breath: svg(face(`<circle cx="40" cy="58" r="3" fill="none" stroke="#5BA8FF" stroke-width="1.5"/><circle cx="47" cy="62" r="2" fill="none" stroke="#5BA8FF" stroke-width="1"/>${smile}`)),
  relax:  svg(face(`<text x="40" y="26" text-anchor="middle" font-size="9">✋</text><path d="M30 28 L50 28" stroke="#FFB7C5" stroke-width="1.5"/>${smile}`)),
};
