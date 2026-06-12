// ===================================================================
// MOTION GUIDE v2 - 矢印オーバーレイ型（顔は静止、動きの方向を矢印で示す）
//
// 旧版: 顔SVG全体を変形させていたため、別の種目でも同じ動きに見える問題があった。
// 新版: 静止顔SVGをベースに、ターゲット(🎯) + 動く矢印(➜) でオーバーレイ。
//      ステップごとにオーバーレイを切り替える。
//      "どこに" "どの方向に" 動かすかが一目で分かる。
// ===================================================================

// 74エクササイズ → motion pattern (21パターン)
export const MOTION_MAP = {
  // 大頬骨筋・口角挙筋系
  zygoLift:'cheekLift', cheekPress:'cheekLift', mouthCornerUp:'mouthUp',
  pencilLift:'lipPress', antiGravityCheek:'cheekLift', cheekBoneIso:'cheekLift',
  diagonalLift:'cheekLift', smileWidener:'mouthWide', earSmile:'mouthWide',
  modiolusPress:'mouthUp', subZygoActivate:'cheekLift', cheekPump:'cheekPump',
  cheekToCheekAir:'cheekSide', innerCheekPush:'cheekPump', cheekPinpoint:'cheekLift',
  smileHold:'mouthUp', smileGrading:'mouthUp', duchenneFocus:'mouthUp',
  midfaceHold:'cheekLift', midfaceRoll:'cheekSide', fullFaceFlow:'fullFlow',
  micFace:'mouthUp', expressionPlay:'fullFlow',

  // 眉・目元・前頭筋
  browLift:'browLift', browSeparate:'browLift', foreheadIso:'browLift',
  foreheadSmooth:'browLift', glabellaRelease:'browLift', procerusEngage:'browLift',
  eyeOpener:'eyeOpen', eyeWindowOpen:'eyeOpen', lowerEyelidLift:'eyeLid',
  outerEyeUp:'eyeOuter', orbicularisLift:'eyeLid', winkAlternate:'winkAlt',

  // 口輪筋・上唇・人中・ガミー
  upperLipReach:'lipPress', upperLipHold:'lipPress', upperLipCoverBottom:'lipPress',
  philtrumShorten:'lipPress', gummyControl:'mouthUp', lipNoseLift:'lipPress',
  nasolabialFade:'cheekLift',

  // 舌・口腔
  tongueRotation:'tongueRotate', tongueUp:'tongueSpot', tongueStretch:'tongueRotate',
  tonguePushSide:'tongueRotate', palateContact:'tongueSpot', swallowDrill:'tongueSpot',
  swallowGuard:'tongueSpot',

  // 顎・首・広頸筋
  platysmaActivation:'neckStretch', platysmaPlank:'neckStretch',
  chinTuck:'chinTuck', necklineStretch:'neckStretch', jawlineSlide:'jawSlide',
  jawlineCarve:'jawSlide', supraHyoidIso:'chinTuck', jawOpen:'jawOpen',
  jawDropper:'jawOpen', chinDimple:'mouthUp', chinSlideControl:'jawSlide',
  mentalisRelief:'lipPress',

  // 咬筋・側頭筋系
  masseterRelease:'masseterTap', masseterTap:'masseterTap',
  temporalisRelease:'masseterTap', chewBalance:'masseterTap',
  evenChewing:'masseterTap',

  // 左右差・統合
  symmetryMirror:'asymSide', faceSymmetryDrill:'asymSide',
  unilateralSmile:'asymSide', cheekHollow:'cheekSide',

  // 発声・呼吸・姿勢・統合
  ahIuEoTraining:'mouthWide', breathFace:'breathGlow', postureLink:'chinTuck',
  generalMaintain:'breathGlow',
};

// ===================================================================
// 顔ベース (静止)
// ===================================================================
const FACE_BASE_SVG = `
<defs>
  <linearGradient id="mfaceg" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#FFE5EC"/>
    <stop offset="100%" stop-color="#FFC9D6"/>
  </linearGradient>
  <marker id="arrowHead" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto" markerUnits="strokeWidth">
    <path d="M0 0 L9 4.5 L0 9 L2.5 4.5 Z" fill="#FF4D7A"/>
  </marker>
  <marker id="arrowHeadBlue" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto" markerUnits="strokeWidth">
    <path d="M0 0 L9 4.5 L0 9 L2.5 4.5 Z" fill="#5BA8FF"/>
  </marker>
</defs>
<!-- 髪 -->
<path d="M40 75 Q42 28 100 26 Q158 28 160 75 Q145 65 100 65 Q55 65 40 75 Z" fill="#5B3F47"/>
<!-- 顔輪郭 -->
<ellipse cx="100" cy="120" rx="58" ry="78" fill="url(#mfaceg)" stroke="#E07A8A" stroke-width="2"/>
<!-- 眉 -->
<path d="M64 102 Q78 96 92 102" stroke="#3D2A2F" stroke-width="3" fill="none" stroke-linecap="round"/>
<path d="M108 102 Q122 96 136 102" stroke="#3D2A2F" stroke-width="3" fill="none" stroke-linecap="round"/>
<!-- 目 -->
<ellipse cx="78" cy="118" rx="9" ry="5" fill="#fff" stroke="#3D2A2F" stroke-width="1.5"/>
<circle cx="78" cy="118" r="3" fill="#3D2A2F"/>
<ellipse cx="122" cy="118" rx="9" ry="5" fill="#fff" stroke="#3D2A2F" stroke-width="1.5"/>
<circle cx="122" cy="118" r="3" fill="#3D2A2F"/>
<!-- 鼻 -->
<path d="M98 134 Q96 152 100 158 Q104 152 102 134" stroke="#E07A8A" stroke-width="1.5" fill="none"/>
<!-- 頬の薄い赤み -->
<ellipse cx="70" cy="148" rx="11" ry="8" fill="#FFB7C5" opacity="0.5"/>
<ellipse cx="130" cy="148" rx="11" ry="8" fill="#FFB7C5" opacity="0.5"/>
<!-- 口 -->
<path d="M82 178 Q100 184 118 178" stroke="#E07A8A" stroke-width="3" fill="none" stroke-linecap="round"/>
<circle cx="82" cy="178" r="2.5" fill="#E07A8A"/>
<circle cx="118" cy="178" r="2.5" fill="#E07A8A"/>
<!-- あご -->
<path d="M75 196 Q100 208 125 196" stroke="#E07A8A" stroke-width="1.5" fill="none" opacity="0.6"/>
`;

// オーバーレイ生成ヘルパ
// target: 🎯 パルスする丸
const target = (cx, cy, r=8, label='') => `
  <g class="mv-target">
    <circle cx="${cx}" cy="${cy}" r="${r+4}" fill="none" stroke="#FF4D7A" stroke-width="2" opacity="0.5" class="mv-target-ring"/>
    <circle cx="${cx}" cy="${cy}" r="${r}" fill="#FF4D7A" opacity="0.85" class="mv-target-dot"/>
    ${label ? `<text x="${cx}" y="${cy-r-6}" text-anchor="middle" font-size="9" fill="#FF4D7A" font-weight="700">${label}</text>` : ''}
  </g>
`;
// arrow: 動く矢印 (始点→終点)
const arrow = (x1, y1, x2, y2, color='#FF4D7A') => {
  const marker = color === '#5BA8FF' ? 'arrowHeadBlue' : 'arrowHead';
  return `
    <line class="mv-arrow" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"
      stroke="${color}" stroke-width="3" stroke-linecap="round"
      marker-end="url(#${marker})" />
  `;
};
// curved arrow path
const arrowPath = (d, color='#FF4D7A') => {
  const marker = color === '#5BA8FF' ? 'arrowHeadBlue' : 'arrowHead';
  return `<path class="mv-arrow" d="${d}" stroke="${color}" stroke-width="3" fill="none" stroke-linecap="round" marker-end="url(#${marker})"/>`;
};
// hand/finger hint (for tapping/pressing exercises)
const handHint = (cx, cy) => `
  <g class="mv-hand" transform="translate(${cx},${cy})">
    <circle r="14" fill="#FFD93D" opacity="0.8"/>
    <text y="5" text-anchor="middle" font-size="16">✋</text>
  </g>
`;

// ===================================================================
// PATTERN PRESETS — 21パターン
//
// 各パターン構造:
//   name      : エクササイズの動きの名前
//   reps      : "5秒キープ × 3セット" のような表示
//   duration  : セッション秒数
//   steps     : [{ t, label, cue, overlay, count? }]
//   ※ overlay は各ステップで切替わるSVG断片(target+arrow群)
// ===================================================================

const P = {};

// 1) 頬を斜め上に持ち上げる(両側)
P.cheekLift = {
  name:'頬を斜め上に持ち上げる',
  reps:'5秒キープ × 3セット',
  duration: 36,
  steps:[
    { t:0,  label:'準備', cue:'頬の力を抜き、姿勢を整える',
      overlay: target(70,148,8,'ココ') + target(130,148,8,'ココ') },
    { t:3,  label:'引き上げる', cue:'頬の高い所を、こめかみ方向へ斜め上に', count:'1...2',
      overlay: target(70,148) + target(130,148)
             + arrow(70,148,55,108) + arrow(130,148,145,108) },
    { t:8,  label:'5秒キープ', cue:'頬の収縮を感じながら静止', count:'3...4...5...6...7',
      overlay: target(70,148,10) + target(130,148,10)
             + arrow(70,148,55,108) + arrow(130,148,145,108) },
    { t:15, label:'戻す', cue:'ゆっくり脱力',
      overlay: target(70,148) + target(130,148) },
    { t:18, label:'2回目 上げる', cue:'もう一度、耳に向けて引き上げる', count:'1...2',
      overlay: target(70,148) + target(130,148)
             + arrow(70,148,55,108) + arrow(130,148,145,108) },
    { t:23, label:'5秒キープ', cue:'前歯8本見せる気持ちで', count:'3...4...5...6...7',
      overlay: target(70,148,10) + target(130,148,10)
             + arrow(70,148,55,108) + arrow(130,148,145,108) },
    { t:30, label:'脱力 → 完了', cue:'ゆっくり戻して、おつかれさまでした 🌷',
      overlay: '' },
  ],
};

// 2) 口角を斜め上に
P.mouthUp = {
  name:'口角を斜め上に引き上げる',
  reps:'5秒キープ × 3セット',
  duration: 32,
  steps:[
    { t:0, label:'準備', cue:'唇を軽く閉じて力を抜く',
      overlay: target(82,178,6,'L') + target(118,178,6,'R') },
    { t:3, label:'口角UP', cue:'口角を耳の方向へ引き上げる', count:'1...2',
      overlay: target(82,178,6) + target(118,178,6)
             + arrow(82,178,62,158) + arrow(118,178,138,158) },
    { t:8, label:'5秒キープ', cue:'頬の上部が硬くなるのを感じる', count:'3...4...5...6...7',
      overlay: target(82,178,8) + target(118,178,8)
             + arrow(82,178,62,158) + arrow(118,178,138,158)
             + target(70,148,5) + target(130,148,5) },
    { t:15, label:'戻す', cue:'ゆっくり脱力',
      overlay: target(82,178,6) + target(118,178,6) },
    { t:18, label:'2回目', cue:'もう一度、口角を引き上げる', count:'1...2',
      overlay: target(82,178,6) + target(118,178,6)
             + arrow(82,178,62,158) + arrow(118,178,138,158) },
    { t:23, label:'5秒キープ', cue:'バランス良く左右対称に', count:'3...4...5...6...7',
      overlay: target(82,178,8) + target(118,178,8)
             + arrow(82,178,62,158) + arrow(118,178,138,158) },
    { t:30, label:'完了', cue:'おつかれさまでした 🌷', overlay:'' },
  ],
};

// 3) 口を大きく動かす あいうえお
P.mouthWide = {
  name:'あ・い・う・え・お トレーニング',
  reps:'各2秒 × 2周',
  duration: 30,
  steps:[
    { t:0,  label:'あ', cue:'口を縦に大きく開ける', count:'2秒',
      overlay: target(100,178,14,'縦に大きく') + arrow(100,170,100,148) + arrow(100,186,100,208) },
    { t:3,  label:'い', cue:'口角を横に強く引く', count:'2秒',
      overlay: target(82,178,6) + target(118,178,6)
             + arrow(82,178,55,178) + arrow(118,178,145,178) },
    { t:6,  label:'う', cue:'唇を前にすぼめて突き出す', count:'2秒',
      overlay: target(100,178,10,'前へ') + arrow(100,178,100,200,'#5BA8FF') },
    { t:9,  label:'え', cue:'頬を上げながら口を横へ', count:'2秒',
      overlay: target(70,148,6) + target(130,148,6)
             + arrow(82,178,62,148) + arrow(118,178,138,148) },
    { t:12, label:'お', cue:'口を縦長の楕円に', count:'2秒',
      overlay: target(100,178,10,'丸く') + arrowPath('M85 178 Q100 195 115 178') },
    { t:15, label:'2周目 あ', cue:'もう一周、大きく', count:'2秒',
      overlay: target(100,178,14) + arrow(100,170,100,148) + arrow(100,186,100,208) },
    { t:18, label:'い', cue:'口角しっかり外側へ', count:'2秒',
      overlay: arrow(82,178,55,178) + arrow(118,178,145,178) },
    { t:21, label:'う', cue:'前へ突き出す', count:'2秒',
      overlay: target(100,178,10) + arrow(100,178,100,200,'#5BA8FF') },
    { t:24, label:'え', cue:'頬を上に', count:'2秒',
      overlay: arrow(82,178,62,148) + arrow(118,178,138,148) },
    { t:27, label:'お', cue:'丸く開く', count:'2秒',
      overlay: target(100,178,10) },
  ],
};

// 4) 頬を膨らます/しぼめる
P.cheekPump = {
  name:'頬を膨らませる → へこませる',
  reps:'3秒×6回',
  duration: 30,
  steps:[
    { t:0, label:'準備', cue:'口を閉じて軽く息を吸う', overlay: target(100,148,8,'頬') },
    { t:2, label:'膨らます', cue:'頬いっぱいに空気を入れる', count:'3秒',
      overlay: target(70,148,14,'外へ') + target(130,148,14,'外へ')
             + arrow(85,148,55,148,'#5BA8FF') + arrow(115,148,145,148,'#5BA8FF') },
    { t:6, label:'へこます', cue:'空気を抜いて頬を内側へ', count:'3秒',
      overlay: target(70,148,6) + target(130,148,6)
             + arrow(55,148,80,148) + arrow(145,148,120,148) },
    { t:10, label:'膨らます', cue:'再び空気を入れる', count:'3秒',
      overlay: arrow(85,148,55,148,'#5BA8FF') + arrow(115,148,145,148,'#5BA8FF') },
    { t:14, label:'へこます', cue:'内側へ', count:'3秒',
      overlay: arrow(55,148,80,148) + arrow(145,148,120,148) },
    { t:18, label:'膨らます', cue:'最後の1回', count:'3秒',
      overlay: arrow(85,148,55,148,'#5BA8FF') + arrow(115,148,145,148,'#5BA8FF') },
    { t:22, label:'へこます', cue:'最後の1回', count:'3秒',
      overlay: arrow(55,148,80,148) + arrow(145,148,120,148) },
    { t:26, label:'完了', cue:'おつかれさまでした 🌷', overlay:'' },
  ],
};

// 5) 頬を左右に動かす
P.cheekSide = {
  name:'空気を左右の頬に移動',
  reps:'左右×6往復',
  duration: 30,
  steps:[
    { t:0, label:'準備', cue:'口を閉じて空気を含む', overlay: target(100,148,10) },
    { t:2, label:'右へ', cue:'右の頬に空気を寄せる', count:'2秒',
      overlay: target(130,148,12) + arrow(100,148,128,148,'#5BA8FF') },
    { t:5, label:'左へ', cue:'左の頬へ移動', count:'2秒',
      overlay: target(70,148,12) + arrow(100,148,72,148,'#5BA8FF') },
    { t:8, label:'右へ', cue:'もう一度', count:'2秒',
      overlay: target(130,148,12) + arrow(100,148,128,148,'#5BA8FF') },
    { t:11, label:'左へ', cue:'左へ', count:'2秒',
      overlay: target(70,148,12) + arrow(100,148,72,148,'#5BA8FF') },
    { t:14, label:'右へ', cue:'右へ', count:'2秒',
      overlay: target(130,148,12) + arrow(100,148,128,148,'#5BA8FF') },
    { t:17, label:'左へ', cue:'左へ', count:'2秒',
      overlay: target(70,148,12) + arrow(100,148,72,148,'#5BA8FF') },
    { t:20, label:'右へ', cue:'最後の往復', count:'2秒',
      overlay: target(130,148,12) + arrow(100,148,128,148,'#5BA8FF') },
    { t:23, label:'左へ', cue:'戻す', count:'2秒',
      overlay: target(70,148,12) + arrow(100,148,72,148,'#5BA8FF') },
    { t:26, label:'完了', cue:'空気を吐いて脱力 🌷', overlay:'' },
  ],
};

// 6) 舌で口腔内を回す
P.tongueRotate = {
  name:'舌で歯の外側を一周',
  reps:'左右各5周',
  duration: 40,
  steps:[
    { t:0, label:'準備', cue:'口を閉じて舌を上の歯茎の外側に',
      overlay: target(100,168,8,'舌') },
    { t:2, label:'右回り 1周', cue:'歯の外側に沿ってゆっくり', count:'4秒',
      overlay: arrowPath('M85 168 Q100 152 115 168 Q100 188 85 168','#5BA8FF') },
    { t:6, label:'右回り 2周', cue:'頬の内側を伸ばすように', count:'4秒',
      overlay: arrowPath('M85 168 Q100 152 115 168 Q100 188 85 168','#5BA8FF') },
    { t:10, label:'右回り 3周', cue:'ペースを保って', count:'4秒',
      overlay: arrowPath('M85 168 Q100 152 115 168 Q100 188 85 168','#5BA8FF') },
    { t:14, label:'右回り 4周', cue:'もう少し', count:'4秒',
      overlay: arrowPath('M85 168 Q100 152 115 168 Q100 188 85 168','#5BA8FF') },
    { t:18, label:'右回り 5周', cue:'右回り終了', count:'4秒',
      overlay: arrowPath('M85 168 Q100 152 115 168 Q100 188 85 168','#5BA8FF') },
    { t:22, label:'左回り 1周', cue:'逆方向に', count:'4秒',
      overlay: arrowPath('M115 168 Q100 152 85 168 Q100 188 115 168') },
    { t:26, label:'左回り 2周', cue:'続けて', count:'4秒',
      overlay: arrowPath('M115 168 Q100 152 85 168 Q100 188 115 168') },
    { t:30, label:'左回り 3周', cue:'頬の内側を意識', count:'4秒',
      overlay: arrowPath('M115 168 Q100 152 85 168 Q100 188 115 168') },
    { t:34, label:'左回り 4-5周', cue:'最後まで', count:'8秒',
      overlay: arrowPath('M115 168 Q100 152 85 168 Q100 188 115 168') },
  ],
};

// 7) 舌を上顎に押し付ける
P.tongueSpot = {
  name:'舌を上顎にスポット押し',
  reps:'5秒キープ × 5回',
  duration: 35,
  steps:[
    { t:0,  label:'準備', cue:'口を閉じる',
      overlay: target(100,158,8,'上顎') + arrow(100,178,100,160,'#5BA8FF') },
    { t:2,  label:'1回目 押す', cue:'舌先を上の前歯のすぐ後ろに押し当てる', count:'5秒',
      overlay: target(100,158,12) + arrow(100,178,100,160,'#5BA8FF') },
    { t:8,  label:'脱力', cue:'力を抜く', count:'2秒',
      overlay: target(100,158,6) },
    { t:11, label:'2回目', cue:'もう一度しっかり押す', count:'5秒',
      overlay: target(100,158,12) + arrow(100,178,100,160,'#5BA8FF') },
    { t:17, label:'脱力', cue:'抜く', count:'2秒',
      overlay: target(100,158,6) },
    { t:20, label:'3回目', cue:'押し続ける', count:'5秒',
      overlay: target(100,158,12) + arrow(100,178,100,160,'#5BA8FF') },
    { t:26, label:'4-5回目', cue:'2回繰り返す', count:'10秒',
      overlay: target(100,158,12) + arrow(100,178,100,160,'#5BA8FF') },
  ],
};

// 8) 眉を上に
P.browLift = {
  name:'眉を上げる/下げる',
  reps:'3秒キープ × 5回',
  duration: 30,
  steps:[
    { t:0, label:'準備', cue:'おでこを軽く触れる',
      overlay: target(78,102,7) + target(122,102,7) + handHint(100,80) },
    { t:2, label:'上げる', cue:'眉を額の生え際に向けて持ち上げる', count:'3秒',
      overlay: target(78,102,7) + target(122,102,7)
             + arrow(78,102,72,82) + arrow(122,102,128,82) },
    { t:7, label:'下げる', cue:'眉を下げて目を細める', count:'3秒',
      overlay: target(78,102,7) + target(122,102,7)
             + arrow(78,90,78,108,'#5BA8FF') + arrow(122,90,122,108,'#5BA8FF') },
    { t:12, label:'上げる', cue:'もう一度上げる', count:'3秒',
      overlay: arrow(78,102,72,82) + arrow(122,102,128,82) },
    { t:17, label:'下げる', cue:'下げる', count:'3秒',
      overlay: arrow(78,90,78,108,'#5BA8FF') + arrow(122,90,122,108,'#5BA8FF') },
    { t:22, label:'上げる', cue:'最後の上げ', count:'3秒',
      overlay: arrow(78,102,72,82) + arrow(122,102,128,82) },
    { t:27, label:'脱力', cue:'力を抜いて完了 🌷', overlay:'' },
  ],
};

// 9) 目を大きく開く
P.eyeOpen = {
  name:'目を大きく見開く',
  reps:'5秒キープ × 3回',
  duration: 30,
  steps:[
    { t:0, label:'準備', cue:'眉が動かないよう、おでこを押さえる',
      overlay: target(78,118,8) + target(122,118,8) + handHint(100,82) },
    { t:2, label:'目を見開く', cue:'眉を上げずに、まぶただけで大きく開く', count:'1...2',
      overlay: arrow(78,123,78,108,'#5BA8FF') + arrow(122,123,122,108,'#5BA8FF')
             + arrow(78,113,78,128) + arrow(122,113,122,128) },
    { t:6, label:'5秒キープ', cue:'眼輪筋に効いている感覚', count:'1...2...3...4...5',
      overlay: target(78,118,12) + target(122,118,12) },
    { t:13, label:'脱力 → 2回目', cue:'一度緩めて、もう一度', count:'',
      overlay: target(78,118,8) + target(122,118,8) },
    { t:16, label:'5秒キープ', cue:'眉は動かさない！', count:'1...2...3...4...5',
      overlay: arrow(78,123,78,108,'#5BA8FF') + arrow(122,123,122,108,'#5BA8FF') },
    { t:23, label:'3回目 5秒', cue:'最後の1回', count:'1...2...3...4...5',
      overlay: target(78,118,12) + target(122,118,12) },
  ],
};

// 10) 下まぶたを引き上げる
P.eyeLid = {
  name:'下まぶたを引き上げる',
  reps:'5秒キープ × 4回',
  duration: 32,
  steps:[
    { t:0, label:'準備', cue:'目を半開きにする',
      overlay: target(78,124,5) + target(122,124,5) },
    { t:2, label:'下から上へ', cue:'下まぶただけ持ち上げる(目を細める感覚)', count:'1...2',
      overlay: arrow(78,128,78,118,'#5BA8FF') + arrow(122,128,122,118,'#5BA8FF') },
    { t:6, label:'5秒キープ', cue:'目尻のシワは出さない', count:'1...2...3...4...5',
      overlay: target(78,124,7) + target(122,124,7)
             + arrow(78,128,78,118,'#5BA8FF') + arrow(122,128,122,118,'#5BA8FF') },
    { t:13, label:'脱力', cue:'戻す', count:'',
      overlay: target(78,124,5) + target(122,124,5) },
    { t:16, label:'2回目 5秒', cue:'もう一度引き上げる', count:'1...2...3...4...5',
      overlay: arrow(78,128,78,118,'#5BA8FF') + arrow(122,128,122,118,'#5BA8FF') },
    { t:24, label:'3-4回目', cue:'続けて2回', count:'10秒',
      overlay: arrow(78,128,78,118,'#5BA8FF') + arrow(122,128,122,118,'#5BA8FF') },
  ],
};

// 11) 目尻を外上方向に
P.eyeOuter = {
  name:'目尻を外上に',
  reps:'5秒キープ × 3回',
  duration: 28,
  steps:[
    { t:0, label:'準備', cue:'目尻を意識する',
      overlay: target(87,118,5) + target(113,118,5) },
    { t:2, label:'外上へ', cue:'目尻だけを耳に向けて引き上げる', count:'1...2',
      overlay: target(87,118,7) + target(113,118,7)
             + arrow(87,118,73,103) + arrow(113,118,127,103) },
    { t:6, label:'5秒キープ', cue:'こめかみの硬さを感じる', count:'1...2...3...4...5',
      overlay: arrow(87,118,73,103) + arrow(113,118,127,103) },
    { t:13, label:'戻す', cue:'脱力', count:'', overlay: target(87,118,5) + target(113,118,5) },
    { t:16, label:'2回目 5秒', cue:'もう一度', count:'1...2...3...4...5',
      overlay: arrow(87,118,73,103) + arrow(113,118,127,103) },
    { t:23, label:'3回目 5秒', cue:'最後', count:'1...2...3...4...5',
      overlay: arrow(87,118,73,103) + arrow(113,118,127,103) },
  ],
};

// 12) ウィンク交互
P.winkAlt = {
  name:'左右ウィンク交互',
  reps:'各5回',
  duration: 25,
  steps:[
    { t:0, label:'準備', cue:'目をリラックス',
      overlay: target(78,118,6) + target(122,118,6) },
    { t:2, label:'右目を閉じる', cue:'右だけ閉じる(左は開けたまま)', count:'1秒',
      overlay: target(122,118,10) + arrow(122,113,122,123,'#5BA8FF') },
    { t:4, label:'左目を閉じる', cue:'左だけ閉じる', count:'1秒',
      overlay: target(78,118,10) + arrow(78,113,78,123,'#5BA8FF') },
    { t:6,  label:'右', cue:'右', count:'1秒', overlay: target(122,118,10) + arrow(122,113,122,123,'#5BA8FF') },
    { t:8,  label:'左', cue:'左', count:'1秒', overlay: target(78,118,10) + arrow(78,113,78,123,'#5BA8FF') },
    { t:10, label:'右', cue:'右', count:'1秒', overlay: target(122,118,10) + arrow(122,113,122,123,'#5BA8FF') },
    { t:12, label:'左', cue:'左', count:'1秒', overlay: target(78,118,10) + arrow(78,113,78,123,'#5BA8FF') },
    { t:14, label:'右', cue:'右', count:'1秒', overlay: target(122,118,10) + arrow(122,113,122,123,'#5BA8FF') },
    { t:16, label:'左', cue:'左', count:'1秒', overlay: target(78,118,10) + arrow(78,113,78,123,'#5BA8FF') },
    { t:18, label:'右', cue:'最後 右', count:'1秒', overlay: target(122,118,10) + arrow(122,113,122,123,'#5BA8FF') },
    { t:20, label:'左', cue:'最後 左', count:'1秒', overlay: target(78,118,10) + arrow(78,113,78,123,'#5BA8FF') },
    { t:22, label:'完了', cue:'おつかれさまでした 🌷', overlay:'' },
  ],
};

// 13) 顎を開ける
P.jawOpen = {
  name:'顎をしっかり開く',
  reps:'5秒キープ × 4回',
  duration: 32,
  steps:[
    { t:0, label:'準備', cue:'力を抜いてリラックス', overlay: target(100,178,8) },
    { t:2, label:'大きく開く', cue:'顎を下にしっかり落とす', count:'1...2',
      overlay: target(100,200,10,'下へ') + arrow(100,178,100,210,'#5BA8FF') },
    { t:6, label:'5秒キープ', cue:'顎の付け根が伸びる感覚', count:'1...2...3...4...5',
      overlay: target(100,200,12) + arrow(100,178,100,210,'#5BA8FF') },
    { t:13, label:'閉じる', cue:'ゆっくり閉じる', count:'',
      overlay: arrow(100,210,100,178) },
    { t:16, label:'2回目 開く', cue:'もう一度', count:'5秒',
      overlay: target(100,200,12) + arrow(100,178,100,210,'#5BA8FF') },
    { t:24, label:'3-4回目', cue:'続けて2回', count:'10秒',
      overlay: target(100,200,12) + arrow(100,178,100,210,'#5BA8FF') },
  ],
};

// 14) アゴ引き
P.chinTuck = {
  name:'顎を後ろに引く(チンタック)',
  reps:'5秒キープ × 5回',
  duration: 30,
  steps:[
    { t:0, label:'準備', cue:'背筋を伸ばす', overlay: target(100,196,8) },
    { t:2, label:'後ろへ', cue:'二重あごを作るように顎を引く', count:'1...2',
      overlay: target(100,196,10) + arrow(100,196,100,172) },
    { t:6, label:'5秒キープ', cue:'首の前が伸びる', count:'1...2...3...4...5',
      overlay: arrow(100,196,100,172) },
    { t:13, label:'戻す', cue:'脱力', count:'',
      overlay: target(100,196,6) },
    { t:16, label:'2回目', cue:'もう一度引く', count:'5秒',
      overlay: target(100,196,10) + arrow(100,196,100,172) },
    { t:23, label:'3-5回目', cue:'続けて3回', count:'15秒',
      overlay: target(100,196,10) + arrow(100,196,100,172) },
  ],
};

// 15) 顎を左右にスライド
P.jawSlide = {
  name:'顎を左右にスライド',
  reps:'左右×6往復',
  duration: 30,
  steps:[
    { t:0, label:'準備', cue:'歯を軽く合わせる', overlay: target(100,196,7) },
    { t:2, label:'右へ', cue:'下顎だけ右へスライド', count:'2秒',
      overlay: target(120,196,9) + arrow(100,196,120,196) },
    { t:5, label:'左へ', cue:'反対へ', count:'2秒',
      overlay: target(80,196,9) + arrow(100,196,80,196,'#5BA8FF') },
    { t:8,  label:'右', cue:'右へ', count:'2秒', overlay: target(120,196,9) + arrow(100,196,120,196) },
    { t:11, label:'左', cue:'左へ', count:'2秒', overlay: target(80,196,9) + arrow(100,196,80,196,'#5BA8FF') },
    { t:14, label:'右', cue:'右へ', count:'2秒', overlay: target(120,196,9) + arrow(100,196,120,196) },
    { t:17, label:'左', cue:'左へ', count:'2秒', overlay: target(80,196,9) + arrow(100,196,80,196,'#5BA8FF') },
    { t:20, label:'右', cue:'右へ', count:'2秒', overlay: target(120,196,9) + arrow(100,196,120,196) },
    { t:23, label:'左', cue:'左へ', count:'2秒', overlay: target(80,196,9) + arrow(100,196,80,196,'#5BA8FF') },
    { t:26, label:'中央へ', cue:'戻す', count:'', overlay: target(100,196,7) },
  ],
};

// 16) 首前面ストレッチ
P.neckStretch = {
  name:'首の前面を伸ばす',
  reps:'10秒キープ × 2回',
  duration: 30,
  steps:[
    { t:0, label:'準備', cue:'背筋を伸ばす', overlay: target(100,200,8) },
    { t:3, label:'上を向く', cue:'天井を見上げる', count:'1...2',
      overlay: arrow(100,200,100,225,'#5BA8FF') + target(100,200,10) },
    { t:6, label:'10秒キープ', cue:'首前面が伸びるのを感じる', count:'1...2...3...4...5...6...7...8...9...10',
      overlay: arrowPath('M85 200 Q100 230 115 200','#5BA8FF') + target(100,200,12) },
    { t:18, label:'戻す', cue:'ゆっくり下を向く', count:'',
      overlay: target(100,200,8) },
    { t:21, label:'2回目 10秒', cue:'もう一度ゆっくり', count:'10秒',
      overlay: arrowPath('M85 200 Q100 230 115 200','#5BA8FF') + target(100,200,12) },
  ],
};

// 17) 左右非対称用 (弱い側だけ動かす)
P.asymSide = {
  name:'弱い側の口角を意識して上げる',
  reps:'5秒×3回 (鏡を見ながら)',
  duration: 30,
  steps:[
    { t:0, label:'準備', cue:'鏡で左右を確認(上がりにくい側はどちら?)',
      overlay: target(82,178,6,'L') + target(118,178,6,'R') + handHint(150,178) },
    { t:3, label:'弱い側 UP', cue:'下がっている側だけ強く意識', count:'1...2',
      overlay: target(82,178,10) + arrow(82,178,62,158) },
    { t:8, label:'5秒キープ', cue:'バランスを取り戻す', count:'1...2...3...4...5',
      overlay: target(82,178,10) + arrow(82,178,62,158) },
    { t:15, label:'2回目', cue:'もう一度', count:'5秒',
      overlay: target(82,178,10) + arrow(82,178,62,158) },
    { t:22, label:'3回目', cue:'最後', count:'5秒',
      overlay: target(82,178,10) + arrow(82,178,62,158) },
  ],
};

// 18) 唇を内側に
P.lipPress = {
  name:'上唇を下に伸ばす(人中短縮)',
  reps:'5秒×4回',
  duration: 32,
  steps:[
    { t:0, label:'準備', cue:'軽く口を閉じる', overlay: target(100,170,6) },
    { t:2, label:'上唇を下へ', cue:'上唇を下の歯にかぶせるイメージ', count:'1...2',
      overlay: target(100,170,9) + arrow(100,165,100,182,'#5BA8FF') },
    { t:6, label:'5秒キープ', cue:'人中が伸びるのを感じる', count:'1...2...3...4...5',
      overlay: target(100,170,11) + arrow(100,165,100,182,'#5BA8FF') },
    { t:13, label:'戻す', cue:'脱力',
      overlay: target(100,170,6) },
    { t:16, label:'2回目', cue:'もう一度', count:'5秒',
      overlay: arrow(100,165,100,182,'#5BA8FF') + target(100,170,11) },
    { t:24, label:'3-4回目', cue:'続けて2回', count:'10秒',
      overlay: arrow(100,165,100,182,'#5BA8FF') + target(100,170,11) },
  ],
};

// 19) 咬筋タップ/ほぐし
P.masseterTap = {
  name:'咬筋を指でほぐす',
  reps:'30秒(左右各15秒)',
  duration: 35,
  steps:[
    { t:0, label:'準備', cue:'歯を食いしばって咬筋(エラ上)を確認', overlay: handHint(135,158) + target(135,158,8,'咬筋') },
    { t:3, label:'右側タップ', cue:'指の腹で軽くトントン叩く', count:'10秒',
      overlay: handHint(150,158) + target(135,158,10) },
    { t:14, label:'右側 円マッサージ', cue:'円を描いてほぐす', count:'5秒',
      overlay: handHint(150,158) + arrowPath('M125 158 Q135 148 145 158 Q135 168 125 158') },
    { t:20, label:'左側タップ', cue:'反対側も同じく', count:'10秒',
      overlay: handHint(50,158) + target(65,158,10) },
    { t:31, label:'左側 円マッサージ', cue:'ほぐす', count:'5秒',
      overlay: handHint(50,158) + arrowPath('M55 158 Q65 148 75 158 Q65 168 55 158') },
  ],
};

// 20) 全体フロー(複数箇所)
P.fullFlow = {
  name:'顔全体のフロー',
  reps:'各3秒',
  duration: 30,
  steps:[
    { t:0,  label:'眉', cue:'眉を上げる', count:'3秒',
      overlay: target(78,102,8) + target(122,102,8) + arrow(78,102,72,82) + arrow(122,102,128,82) },
    { t:4,  label:'目', cue:'目を見開く', count:'3秒',
      overlay: target(78,118,10) + target(122,118,10) },
    { t:8,  label:'頬', cue:'頬を上げる', count:'3秒',
      overlay: target(70,148,10) + target(130,148,10) + arrow(70,148,55,108) + arrow(130,148,145,108) },
    { t:12, label:'口', cue:'口角を上げる', count:'3秒',
      overlay: target(82,178,8) + target(118,178,8) + arrow(82,178,62,158) + arrow(118,178,138,158) },
    { t:16, label:'顎', cue:'顎を引く', count:'3秒',
      overlay: target(100,196,10) + arrow(100,196,100,172) },
    { t:20, label:'首', cue:'首前面を伸ばす', count:'3秒',
      overlay: target(100,200,10) + arrowPath('M85 200 Q100 225 115 200','#5BA8FF') },
    { t:24, label:'全体スマイル', cue:'全部の動きを統合', count:'6秒',
      overlay: target(70,148,8) + target(130,148,8) + target(82,178,8) + target(118,178,8)
             + arrow(70,148,60,110) + arrow(130,148,140,110) },
  ],
};

// 21) 呼吸+表情リセット
P.breathGlow = {
  name:'呼吸とリセット',
  reps:'4秒吸う・4秒止める・8秒吐く × 4回',
  duration: 64,
  steps:[
    { t:0,  label:'吸う', cue:'鼻からゆっくり吸う', count:'4秒',
      overlay: target(100,140,16) + arrow(100,210,100,180,'#5BA8FF') },
    { t:5,  label:'止める', cue:'息を止める', count:'4秒', overlay: target(100,140,12) },
    { t:10, label:'吐く', cue:'口からゆっくり吐く', count:'8秒',
      overlay: target(100,140,10) + arrow(100,178,100,210) },
    { t:19, label:'吸う', cue:'もう一度吸う', count:'4秒',
      overlay: arrow(100,210,100,180,'#5BA8FF') + target(100,140,16) },
    { t:24, label:'止める', cue:'静かに止める', count:'4秒', overlay: target(100,140,12) },
    { t:29, label:'吐く', cue:'長く吐く', count:'8秒',
      overlay: target(100,140,10) + arrow(100,178,100,210) },
    { t:38, label:'吸う', cue:'3回目', count:'4秒',
      overlay: arrow(100,210,100,180,'#5BA8FF') + target(100,140,16) },
    { t:43, label:'止める', cue:'静止', count:'4秒', overlay: target(100,140,12) },
    { t:48, label:'吐く', cue:'リラックス', count:'8秒',
      overlay: target(100,140,10) + arrow(100,178,100,210) },
    { t:57, label:'最後の1サイクル', cue:'吸う→止める→吐く', count:'16秒',
      overlay: target(100,140,12) },
  ],
};

export const MOTION_PRESETS = P;

// ===================================================================
// Public API
// ===================================================================
export function getMotion(exerciseId){
  const pat = MOTION_MAP[exerciseId] || 'fullFlow';
  const preset = MOTION_PRESETS[pat] || MOTION_PRESETS.fullFlow;
  return { pattern: pat, ...preset };
}

// ===================================================================
// STEP PANELS — 手順パネル式イラスト (静止画だけで分かる)
// 各ステップを「番号 + 顔イラスト(動かす場所・方向) + 大きな説明文」の
// パネルに変換し、マンガのコマのように並べて見せる。
// 解剖学を知らなくても、絵と短い言葉だけで手順が追えることがゴール。
// ===================================================================
export function buildStepPanelsHTML(exerciseId){
  const m = getMotion(exerciseId);
  const panels = m.steps.map((s, i) => {
    const overlay = s.overlay || '';
    const isDone = !overlay.trim(); // 完了/脱力ステップは "おつかれさま" 系
    return `
      <figure class="step-panel${isDone ? ' is-done' : ''}">
        <div class="step-panel-num">${i + 1}</div>
        <div class="step-panel-stage">
          <svg viewBox="0 0 200 230" class="step-panel-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${(s.label || '').replace(/"/g,'')}">
            ${FACE_BASE_SVG}
            <g class="step-panel-overlay">${overlay}</g>
          </svg>
        </div>
        <figcaption class="step-panel-cap">
          <div class="step-panel-label">${s.label || ''}${s.count ? ` <span class="step-panel-count">${s.count}</span>` : ''}</div>
          <div class="step-panel-cue">${s.cue || ''}</div>
        </figcaption>
      </figure>`;
  }).join('');

  return `
    <div class="step-guide" data-pattern="${m.pattern}">
      <div class="step-guide-head">
        <div>
          <div class="step-guide-title">${m.name}</div>
          <div class="step-guide-reps">${m.reps || ''}</div>
        </div>
        <div class="step-legend">
          <span class="legend-item"><span class="legend-dot"></span>動かす場所</span>
          <span class="legend-item"><span class="legend-arrow pink">➜</span>動かす方向</span>
          <span class="legend-item"><span class="legend-arrow blue">➜</span>ふくらます/押し出す</span>
        </div>
      </div>
      <div class="step-panels">${panels}</div>
      <details class="step-anim">
        <summary>▶ アニメで通して見る（タイマー付き）</summary>
        <div class="step-anim-mount" data-ex="${exerciseId}"></div>
      </details>
    </div>
  `;
}

export function buildMotionPlayerHTML(exerciseId){
  const m = getMotion(exerciseId);
  return `
    <div class="motion-player" data-pattern="${m.pattern}" data-duration="${m.duration}">
      <div class="motion-stage">
        <svg viewBox="0 0 200 230" class="motion-svg" preserveAspectRatio="xMidYMid meet">
          ${FACE_BASE_SVG}
          <g class="motion-overlay"></g>
        </svg>
        <div class="motion-badge">
          <span class="mv-name">${m.name}</span>
          <span class="mv-reps">${m.reps || ''}</span>
        </div>
      </div>
      <div class="motion-controls">
        <button class="motion-btn play" type="button" aria-label="再生">
          <span class="play-ico">▶</span><span class="pause-ico" hidden>❚❚</span>
        </button>
        <div class="motion-progress">
          <div class="motion-bar"></div>
        </div>
        <div class="motion-time"><span class="motion-elapsed">0</span> / ${m.duration}秒</div>
        <button class="motion-btn reset" type="button" aria-label="リセット">↺</button>
      </div>
      <div class="motion-step">
        <div class="motion-step-row">
          <span class="motion-step-label">準備</span>
          <span class="motion-step-count"></span>
        </div>
        <div class="motion-step-cue">▶ ボタンで開始</div>
      </div>
    </div>
  `;
}

export function initMotionPlayer(rootEl, exerciseId){
  const m = getMotion(exerciseId);
  const playBtn  = rootEl.querySelector('.motion-btn.play');
  const resetBtn = rootEl.querySelector('.motion-btn.reset');
  const playIco  = playBtn.querySelector('.play-ico');
  const pauseIco = playBtn.querySelector('.pause-ico');
  const bar      = rootEl.querySelector('.motion-bar');
  const elapsedEl= rootEl.querySelector('.motion-elapsed');
  const labelEl  = rootEl.querySelector('.motion-step-label');
  const countEl  = rootEl.querySelector('.motion-step-count');
  const cueEl    = rootEl.querySelector('.motion-step-cue');
  const overlayG = rootEl.querySelector('.motion-overlay');
  const stage    = rootEl.querySelector('.motion-stage');

  let playing = false;
  let timerId = null;
  let start = 0;
  let elapsed = 0;
  let currentStep = -1;

  function setOverlay(html){
    overlayG.innerHTML = html || '';
  }
  function findStep(t){
    let idx = 0;
    for (let i = 0; i < m.steps.length; i++){
      if (m.steps[i].t <= t) idx = i; else break;
    }
    return idx;
  }
  function applyStep(idx){
    if (idx === currentStep) return;
    currentStep = idx;
    const s = m.steps[idx];
    if (!s) return;
    labelEl.textContent = s.label || '';
    countEl.textContent = s.count ? `(${s.count})` : '';
    cueEl.textContent = s.cue || '';
    setOverlay(s.overlay || '');
  }
  function tick(){
    if (!playing) return;
    elapsed = (Date.now() - start) / 1000;
    if (elapsed >= m.duration){
      elapsed = m.duration;
      applyStep(m.steps.length - 1);
      bar.style.width = '100%';
      elapsedEl.textContent = Math.floor(elapsed);
      stop();
      labelEl.textContent = '完了';
      countEl.textContent = '';
      cueEl.textContent = 'おつかれさまでした 🌷';
      setOverlay('');
      return;
    }
    bar.style.width = ((elapsed / m.duration) * 100).toFixed(1) + '%';
    elapsedEl.textContent = Math.floor(elapsed);
    applyStep(findStep(elapsed));
  }
  function play(){
    if (playing) return;
    playing = true;
    start = Date.now() - elapsed * 1000;
    stage.classList.add('is-playing');
    playIco.hidden = true; pauseIco.hidden = false;
    if (timerId) clearInterval(timerId);
    timerId = setInterval(tick, 100);
    tick();
  }
  function pause(){
    playing = false;
    stage.classList.remove('is-playing');
    playIco.hidden = false; pauseIco.hidden = true;
    if (timerId){ clearInterval(timerId); timerId = null; }
  }
  function stop(){
    pause();
  }
  function reset(){
    pause();
    elapsed = 0;
    currentStep = -1;
    bar.style.width = '0%';
    elapsedEl.textContent = '0';
    applyStep(0);
  }
  playBtn.addEventListener('click', () => { playing ? pause() : play(); });
  resetBtn.addEventListener('click', reset);
  // 初期状態: step0 を表示
  applyStep(0);
}
