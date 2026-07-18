// ===================================================================
// MOTION HELPERS — 手順イラストの共通部品
//
// ★id重複バグ対策: <defs>(グラデ/矢印マーカー)は MOTION_DEFS として
//   モーダルに1回だけ挿入する（app.js）。各パネルSVGは FACE_BODY のみ。
//
// 座標の目安（viewBox 0 0 200 230）
//   生えぎわ100,70 ／ 額100,88 ／ 眉78,102・122,102 ／ 眉間100,104
//   目78,118・122,118 ／ 目尻64,118・136,118 ／ 目の下78,128・122,128
//   こめかみ58,110・142,110 ／ ほお70,148・130,148 ／ 鼻の下100,166
//   口100,178（口角82,178・118,178）／ エラ58,158・142,158
//   あご100,200 ／ あご下100,208 ／ 首100,220 ／ 鎖骨100,228
// ===================================================================

export const MOTION_DEFS = `<defs>
  <linearGradient id="mfaceg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FFE5EC"/><stop offset="100%" stop-color="#FFC9D6"/>
  </linearGradient>
  <marker id="arrowHead" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L9 4.5 L0 9 L2.5 4.5 Z" fill="#FF4D7A"/></marker>
  <marker id="arrowHeadBlue" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto" markerUnits="strokeWidth"><path d="M0 0 L9 4.5 L0 9 L2.5 4.5 Z" fill="#5BA8FF"/></marker>
</defs>`;

// 顔ベース（静止・defs無し）
export const FACE_BODY = `
<path d="M40 75 Q42 28 100 26 Q158 28 160 75 Q145 65 100 65 Q55 65 40 75 Z" fill="#5B3F47"/>
<ellipse cx="100" cy="120" rx="58" ry="78" fill="url(#mfaceg)" stroke="#E07A8A" stroke-width="2"/>
<path d="M64 102 Q78 96 92 102" stroke="#3D2A2F" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M108 102 Q122 96 136 102" stroke="#3D2A2F" stroke-width="3" fill="none" stroke-linecap="round"/>
<ellipse cx="78" cy="118" rx="9" ry="5" fill="#fff" stroke="#3D2A2F" stroke-width="1.5"/><circle cx="78" cy="118" r="3" fill="#3D2A2F"/>
<ellipse cx="122" cy="118" rx="9" ry="5" fill="#fff" stroke="#3D2A2F" stroke-width="1.5"/><circle cx="122" cy="118" r="3" fill="#3D2A2F"/>
<path d="M98 134 Q96 152 100 158 Q104 152 102 134" stroke="#E07A8A" stroke-width="1.5" fill="none"/>
<ellipse cx="70" cy="148" rx="11" ry="8" fill="#FFB7C5" opacity="0.5"/><ellipse cx="130" cy="148" rx="11" ry="8" fill="#FFB7C5" opacity="0.5"/>
<path d="M82 178 Q100 184 118 178" stroke="#E07A8A" stroke-width="3" fill="none" stroke-linecap="round"/>
<circle cx="82" cy="178" r="2.5" fill="#E07A8A"/><circle cx="118" cy="178" r="2.5" fill="#E07A8A"/>
<path d="M75 196 Q100 208 125 196" stroke="#E07A8A" stroke-width="1.5" fill="none" opacity="0.6"/>
`;

// 上半身ベース（姿勢・呼吸・肩など、顔だけでは動きが伝わらない種目用）
//   座標の目安（viewBox 0 0 200 230）
//   頭のてっぺん100,17 ／ 目90/110,46 ／ あご100,75 ／ 肩52/148,110
//   胸100,135 ／ お腹(へそ)100,170 ／ 坐骨(お尻の骨)100,216
export const UPPER_BODY = `
<path d="M74 40 Q76 15 100 14 Q124 15 126 40 Q114 33 100 33 Q86 33 74 40 Z" fill="#5B3F47"/>
<ellipse cx="100" cy="46" rx="25" ry="29" fill="url(#mfaceg)" stroke="#E07A8A" stroke-width="2"/>
<circle cx="90" cy="46" r="2.4" fill="#3D2A2F"/><circle cx="110" cy="46" r="2.4" fill="#3D2A2F"/>
<path d="M92 58 Q100 62 108 58" stroke="#E07A8A" stroke-width="2" fill="none" stroke-linecap="round"/>
<path d="M90 72 L90 90 Q100 96 110 90 L110 72 Z" fill="#FFD9E0"/>
<path d="M38 112 Q60 96 100 95 Q140 96 162 112 Q170 130 172 230 L28 230 Q30 130 38 112 Z" fill="#FCE7EC" stroke="#E9A6B4" stroke-width="1.6"/>
<line x1="100" y1="96" x2="100" y2="220" stroke="#E9A6B4" stroke-width="1.3" stroke-dasharray="5 5" opacity="0.75"/>
`;

// 動かす場所（ピンクの●）
export const target = (cx, cy, r=8, label='') => `
  <g class="mv-target">
    <circle cx="${cx}" cy="${cy}" r="${r+4}" fill="none" stroke="#FF4D7A" stroke-width="2" opacity="0.5" class="mv-target-ring"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#FF4D7A" opacity="0.85" class="mv-target-dot"/>
    ${label ? `<text x="${cx}" y="${cy-r-6}" text-anchor="middle" font-size="9" fill="#FF4D7A" font-weight="700">${label}</text>` : ''}
  </g>`;

// 動かす向き（ピンク矢印／青矢印＝ふくらます・前へ・息）
export const arrow = (x1, y1, x2, y2, color='#FF4D7A') => {
  const marker = color === '#5BA8FF' ? 'arrowHeadBlue' : 'arrowHead';
  return `<line class="mv-arrow" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" stroke-linecap="round" marker-end="url(#${marker})"/>`;
};
export const arrowPath = (d, color='#FF4D7A') => {
  const marker = color === '#5BA8FF' ? 'arrowHeadBlue' : 'arrowHead';
  return `<path class="mv-arrow" d="${d}" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" marker-end="url(#${marker})"/>`;
};

// 手・指（黄色の✋）
export const hand = (cx, cy) => `<g class="mv-hand" transform="translate(${cx},${cy})"><circle r="14" fill="#FFD93D" opacity="0.85"/><text y="5" text-anchor="middle" font-size="16">✋</text></g>`;

// 小さな円マッサージの軌跡（ゆるめる系で使用）
export const circleRub = (cx, cy, r=9, color='#FF4D7A') =>
  arrowPath(`M${cx} ${cy-r} Q${cx+r} ${cy-r} ${cx+r} ${cy} Q${cx+r} ${cy+r} ${cx} ${cy+r} Q${cx-r} ${cy+r} ${cx-r} ${cy}`, color);
