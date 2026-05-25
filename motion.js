// ===================================================================
// MOTION GUIDE (アニメ動画ガイド) for 74 exercises
// 各エクササイズに動きパターンを割り当て、SVG + CSS keyframes で動きを再現。
// セッションタイマー(30秒〜2分) と 4カウントキューを提供。
// ===================================================================

// 12 motion patterns + base face SVG (animated parts via CSS keyframes)
//
// keyframe class naming: anim-<pattern>-<part>
// All animations are 4s loops by default. The container .motion-stage controls timing.

// id → pattern
export const MOTION_MAP = {
  // 大頬骨筋・口角挙筋系 (頬を上げる動き)
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

// ---- パターン定義 ----
// stage(svg): 顔の各パーツに class を付けたSVG
// timeline: ステップ(time / label / cue)
// duration: デフォルトのセッション秒数
const FACE_BASE = (extra='') => `
<svg viewBox="0 0 200 220" class="motion-svg">
  <defs>
    <linearGradient id="mfaceg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFE5EC"/>
      <stop offset="100%" stop-color="#FFC9D6"/>
    </linearGradient>
  </defs>
  <!-- 顔輪郭 -->
  <ellipse cx="100" cy="110" rx="60" ry="80" fill="url(#mfaceg)" stroke="#E07A8A" stroke-width="2"/>
  <!-- 髪 -->
  <path d="M40 80 Q40 30 100 28 Q160 30 160 80 Q140 70 100 70 Q60 70 40 80 Z" fill="#5B3F47"/>
  <!-- 眉(左右) -->
  <path class="m-brow-l" d="M65 95 Q78 90 92 95" stroke="#3D2A2F" stroke-width="3" fill="none" stroke-linecap="round"/>
  <path class="m-brow-r" d="M108 95 Q122 90 135 95" stroke="#3D2A2F" stroke-width="3" fill="none" stroke-linecap="round"/>
  <!-- 目(左右) -->
  <g class="m-eye-l">
    <ellipse cx="78" cy="112" rx="9" ry="5" fill="#fff" stroke="#3D2A2F" stroke-width="1.5"/>
    <circle cx="78" cy="112" r="3" fill="#3D2A2F"/>
  </g>
  <g class="m-eye-r">
    <ellipse cx="122" cy="112" rx="9" ry="5" fill="#fff" stroke="#3D2A2F" stroke-width="1.5"/>
    <circle cx="122" cy="112" r="3" fill="#3D2A2F"/>
  </g>
  <!-- 頬チーク(左右) -->
  <ellipse class="m-cheek-l" cx="70" cy="138" rx="11" ry="8" fill="#FFB7C5" opacity="0.7"/>
  <ellipse class="m-cheek-r" cx="130" cy="138" rx="11" ry="8" fill="#FFB7C5" opacity="0.7"/>
  <!-- 鼻 -->
  <path d="M98 128 Q96 145 100 152 Q104 145 102 128" stroke="#E07A8A" stroke-width="1.5" fill="none"/>
  <!-- 口(左右口角 + 中央) -->
  <g class="m-mouth">
    <path class="m-lip" d="M82 168 Q100 175 118 168" stroke="#E07A8A" stroke-width="3" fill="none" stroke-linecap="round"/>
    <circle class="m-corner-l" cx="82" cy="168" r="2.5" fill="#E07A8A"/>
    <circle class="m-corner-r" cx="118" cy="168" r="2.5" fill="#E07A8A"/>
  </g>
  <!-- 舌(初期は隠れ) -->
  <ellipse class="m-tongue" cx="100" cy="170" rx="0" ry="0" fill="#FF8FA8" opacity="0"/>
  <!-- あご -->
  <path class="m-chin" d="M75 188 Q100 200 125 188" stroke="#E07A8A" stroke-width="1.5" fill="none"/>
  ${extra}
</svg>
`;

export const MOTION_PRESETS = {
  cheekLift: {
    name:'頬を持ち上げる動き',
    duration: 40,
    steps: [
      { t:0,  label:'準備', cue:'頬の力を抜く・姿勢を整える' },
      { t:4,  label:'上げる', cue:'頬の高い所を斜め上に持ち上げる', count:'1...2...3' },
      { t:10, label:'キープ', cue:'5秒ホールド(頬の収縮を感じる)', count:'4...5' },
      { t:16, label:'戻す',   cue:'ゆっくり力を抜く' },
      { t:20, label:'上げる', cue:'2回目・耳に向けて引き上げる', count:'1...2...3' },
      { t:26, label:'キープ', cue:'5秒ホールド', count:'4...5' },
      { t:32, label:'戻す',   cue:'ゆっくり脱力' },
      { t:36, label:'完了',   cue:'おつかれさまでした 🌷' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-cheekLift',
  },
  mouthUp: {
    name:'口角を上げる動き',
    duration: 40,
    steps: [
      { t:0,  label:'準備', cue:'唇の力を抜く' },
      { t:3,  label:'上げる', cue:'口角を耳の方向へ', count:'1...2' },
      { t:8,  label:'キープ', cue:'5秒ホールド', count:'3...4...5' },
      { t:14, label:'戻す',   cue:'力を抜く' },
      { t:18, label:'上げる', cue:'2回目・笑顔をつくる', count:'1...2' },
      { t:23, label:'キープ', cue:'前歯8本見せる気持ち', count:'3...4...5' },
      { t:29, label:'戻す',   cue:'脱力' },
      { t:33, label:'完了',   cue:'バランスを意識して終了' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-mouthUp',
  },
  mouthWide: {
    name:'口を大きく動かす',
    duration: 30,
    steps: [
      { t:0, label:'あ', cue:'口を縦に大きく開ける', count:'2秒' },
      { t:4, label:'い', cue:'口角を横に引く', count:'2秒' },
      { t:8, label:'う', cue:'唇を前に突き出す', count:'2秒' },
      { t:12, label:'え', cue:'頬を上に上げる', count:'2秒' },
      { t:16, label:'お', cue:'口を丸く開ける', count:'2秒' },
      { t:20, label:'もう1セット', cue:'あ→い→う→え→お' },
      { t:28, label:'完了', cue:'おつかれさま 🌸' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-mouthWide',
  },
  cheekPump: {
    name:'頬をふくらませる',
    duration: 30,
    steps: [
      { t:0, label:'吸う', cue:'息を吸って準備' },
      { t:3, label:'ふくらます', cue:'頬に空気を入れて膨らませる', count:'5秒' },
      { t:10, label:'キープ', cue:'頬粘膜を内側から押す' },
      { t:15, label:'吐く', cue:'ゆっくり息を吐く' },
      { t:18, label:'2回目', cue:'頬を最大まで膨らます' },
      { t:25, label:'戻す', cue:'脱力' },
      { t:28, label:'完了', cue:'頬の血色を感じて終了' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-cheekPump',
  },
  cheekSide: {
    name:'頬の空気を左右に',
    duration: 30,
    steps: [
      { t:0, label:'吸う', cue:'頬に空気を入れる' },
      { t:3, label:'右へ', cue:'空気を右頬に寄せる', count:'5秒' },
      { t:9, label:'中央', cue:'空気を中央に戻す' },
      { t:12, label:'左へ', cue:'空気を左頬に寄せる', count:'5秒' },
      { t:18, label:'中央', cue:'中央に戻す' },
      { t:21, label:'もう1往復', cue:'右→中央→左' },
      { t:27, label:'完了', cue:'息を吐いて終了' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-cheekSide',
  },
  tongueRotate: {
    name:'舌で口の中をなぞる',
    duration: 40,
    steps: [
      { t:0, label:'準備', cue:'口を閉じる' },
      { t:3, label:'右回り', cue:'舌で歯茎の外側をなぞる', count:'5周' },
      { t:18, label:'休憩', cue:'力を抜く' },
      { t:21, label:'左回り', cue:'逆方向に5周' },
      { t:36, label:'完了', cue:'頬・口周りの活性を感じて終了' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-tongueRotate',
  },
  tongueSpot: {
    name:'舌をスポットポジションに',
    duration: 30,
    steps: [
      { t:0, label:'準備', cue:'口を閉じて鼻呼吸' },
      { t:3, label:'舌先を上', cue:'舌先を上の歯茎の少し後ろに当てる' },
      { t:8, label:'押し付ける', cue:'舌全体を上顎に密着', count:'10秒' },
      { t:18, label:'飲み込む', cue:'唾を1回飲み込む(舌は付けたまま)' },
      { t:22, label:'もう1回', cue:'舌を上顎に押し付ける' },
      { t:28, label:'完了', cue:'このポジションを日常で意識' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-tongueSpot',
  },
  browLift: {
    name:'眉を上げる動き',
    duration: 30,
    steps: [
      { t:0, label:'準備', cue:'額の力を抜く' },
      { t:3, label:'上げる', cue:'眉をぐっと上に持ち上げる', count:'1...2...3' },
      { t:9, label:'キープ', cue:'目を大きく開ける', count:'5秒' },
      { t:14, label:'戻す', cue:'ゆっくり脱力' },
      { t:18, label:'2回目', cue:'眉と目を一緒に開く' },
      { t:26, label:'完了', cue:'まぶたが軽くなる感覚を意識' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-browLift',
  },
  eyeOpen: {
    name:'目を大きく開く',
    duration: 30,
    steps: [
      { t:0, label:'準備', cue:'目元の力を抜く' },
      { t:3, label:'見開く', cue:'瞳を中心に目を最大まで開く', count:'5秒' },
      { t:9, label:'戻す', cue:'ゆっくり閉じる' },
      { t:13, label:'ギュッと', cue:'目を強く閉じる', count:'3秒' },
      { t:17, label:'開く', cue:'目を見開く' },
      { t:22, label:'もう1セット', cue:'見開く→閉じる' },
      { t:28, label:'完了', cue:'目元の活性を感じて終了' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-eyeOpen',
  },
  eyeLid: {
    name:'下まぶたを引き上げる',
    duration: 30,
    steps: [
      { t:0, label:'準備', cue:'上まぶたは動かさない意識' },
      { t:3, label:'下を上げる', cue:'下まぶたで瞳の下半分を覆うつもりで', count:'5秒' },
      { t:9, label:'戻す', cue:'力を抜く' },
      { t:13, label:'2回目', cue:'下まぶただけ' },
      { t:22, label:'完了', cue:'眼輪筋下部の収縮を感じて終了' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-eyeLid',
  },
  eyeOuter: {
    name:'目尻を上げる',
    duration: 30,
    steps: [
      { t:0, label:'準備', cue:'頬骨に手を添える' },
      { t:3, label:'目尻を上に', cue:'目尻だけを耳の上に引き上げる', count:'5秒' },
      { t:9, label:'戻す', cue:'力を抜く' },
      { t:13, label:'2回目', cue:'こめかみまで持ち上げる気持ち' },
      { t:22, label:'完了', cue:'おつかれさま' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-eyeOuter',
  },
  winkAlt: {
    name:'交互ウィンク',
    duration: 30,
    steps: [
      { t:0, label:'左ウィンク', cue:'左目だけ閉じる' },
      { t:3, label:'戻す', cue:'両目を開く' },
      { t:5, label:'右ウィンク', cue:'右目だけ閉じる' },
      { t:8, label:'戻す', cue:'両目を開く' },
      { t:10, label:'繰り返す', cue:'左→右をリズミカルに10回' },
      { t:28, label:'完了', cue:'独立した動員ができたら成功' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-winkAlt',
  },
  jawOpen: {
    name:'顎を縦に開ける',
    duration: 30,
    steps: [
      { t:0, label:'準備', cue:'肩の力を抜く' },
      { t:3, label:'開ける', cue:'顎を縦にゆっくり開ける', count:'5秒' },
      { t:9, label:'最大', cue:'指3本入る幅まで' },
      { t:13, label:'閉じる', cue:'ゆっくり閉じる' },
      { t:17, label:'2回目', cue:'もう一度大きく開ける' },
      { t:27, label:'完了', cue:'顎関節の可動を感じて終了' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-jawOpen',
  },
  chinTuck: {
    name:'チンタック(顎引き)',
    duration: 30,
    steps: [
      { t:0, label:'準備', cue:'背筋を伸ばす' },
      { t:3, label:'引く', cue:'顎を水平に後ろへ引く(うなずきではない)', count:'5秒' },
      { t:9, label:'キープ', cue:'首前面が伸びる感覚' },
      { t:14, label:'戻す', cue:'ニュートラルへ' },
      { t:18, label:'2回目', cue:'背中→首→顎の連動' },
      { t:27, label:'完了', cue:'頭位がリセットされた状態' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-chinTuck',
  },
  jawSlide: {
    name:'顎ラインを刻む',
    duration: 30,
    steps: [
      { t:0, label:'準備', cue:'下顎の力を抜く' },
      { t:3, label:'前に出す', cue:'下顎を真っ直ぐ前にスライド', count:'3秒' },
      { t:7, label:'戻す', cue:'中央に戻す' },
      { t:10, label:'右へ', cue:'下顎を右にスライド' },
      { t:14, label:'左へ', cue:'下顎を左にスライド' },
      { t:18, label:'もう1セット', cue:'前→右→左' },
      { t:28, label:'完了', cue:'おつかれさま' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-jawSlide',
  },
  neckStretch: {
    name:'首前面を伸ばす',
    duration: 30,
    steps: [
      { t:0, label:'準備', cue:'肩を下げる' },
      { t:3, label:'顎を上げる', cue:'天井を見上げる', count:'5秒' },
      { t:9, label:'首前面伸ばす', cue:'広頸筋を意識' },
      { t:13, label:'下唇を下げる', cue:'下唇を下げて首前面を強化' },
      { t:17, label:'戻す', cue:'ゆっくり正面へ' },
      { t:22, label:'2回目', cue:'広頸筋に刺激を入れる' },
      { t:28, label:'完了', cue:'フェイスラインが整った感覚' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-neckStretch',
  },
  asymSide: {
    name:'左右独立で動かす',
    duration: 30,
    steps: [
      { t:0, label:'準備', cue:'鏡を正面で見る' },
      { t:3, label:'左口角', cue:'左口角だけ上げる', count:'3秒' },
      { t:7, label:'戻す', cue:'中央へ' },
      { t:10, label:'右口角', cue:'右口角だけ上げる', count:'3秒' },
      { t:14, label:'戻す', cue:'中央へ' },
      { t:17, label:'左右交互', cue:'リズミカルに5回' },
      { t:28, label:'完了', cue:'左右差の解消を意識' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-asymSide',
  },
  lipPress: {
    name:'上唇を上に持ち上げる',
    duration: 30,
    steps: [
      { t:0, label:'準備', cue:'唇の力を抜く' },
      { t:3, label:'上唇を上に', cue:'上唇を上の歯に向けて引き上げる', count:'5秒' },
      { t:9, label:'戻す', cue:'力を抜く' },
      { t:13, label:'2回目', cue:'人中を短くするイメージ' },
      { t:22, label:'完了', cue:'おつかれさま' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-lipPress',
  },
  masseterTap: {
    name:'咬筋をほぐす',
    duration: 30,
    steps: [
      { t:0, label:'準備', cue:'咬筋(エラの少し前)に指を置く' },
      { t:3, label:'タッピング', cue:'指の腹で軽くトントン', count:'15秒' },
      { t:18, label:'円を描く', cue:'指で小さく円を描いて緩める' },
      { t:25, label:'深呼吸', cue:'息を吐きながら脱力' },
      { t:28, label:'完了', cue:'咬筋の温度が変わった感覚' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-masseterTap',
  },
  fullFlow: {
    name:'全表情筋フロー',
    duration: 60,
    steps: [
      { t:0,  label:'準備', cue:'深呼吸' },
      { t:4,  label:'眉上げ', cue:'眉を上に上げる', count:'5秒' },
      { t:10, label:'目見開き', cue:'目を最大に開く', count:'5秒' },
      { t:16, label:'頬上げ', cue:'頬を斜め上に', count:'5秒' },
      { t:22, label:'口角アップ', cue:'デュシェンヌスマイル', count:'5秒' },
      { t:28, label:'舌を上に', cue:'上顎にスポット' },
      { t:34, label:'首前面', cue:'天井を見て広頸筋' },
      { t:42, label:'全部一緒', cue:'全パーツを同時にホールド', count:'10秒' },
      { t:54, label:'脱力', cue:'全部の力を抜く' },
      { t:58, label:'完了', cue:'おつかれさまでした 👑' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-fullFlow',
  },
  breathGlow: {
    name:'呼吸と表情筋',
    duration: 30,
    steps: [
      { t:0,  label:'準備', cue:'肩の力を抜く' },
      { t:3,  label:'吸う', cue:'4秒で鼻から吸う', count:'1...2...3...4' },
      { t:8,  label:'止める', cue:'2秒キープ' },
      { t:11, label:'吐く', cue:'6秒で口から吐く', count:'1...2...3...4...5...6' },
      { t:18, label:'2回目', cue:'同じリズムで' },
      { t:28, label:'完了', cue:'血流が戻った感覚' },
    ],
    svg: FACE_BASE(),
    cls: 'anim-breathGlow',
  },
};

export function getMotion(exerciseId){
  const key = MOTION_MAP[exerciseId] || 'breathGlow';
  return MOTION_PRESETS[key];
}

// HTMLを返すヘルパー(モーダル内に挿入)
export function buildMotionPlayerHTML(exerciseId){
  const m = getMotion(exerciseId);
  return `
    <div class="motion-player" data-duration="${m.duration}">
      <div class="motion-stage ${m.cls}">
        ${m.svg}
        <div class="motion-overlay-hint" id="motion-hint">▶︎ 再生で動画ガイドが始まります</div>
      </div>
      <div class="motion-controls">
        <button type="button" class="motion-btn play" data-action="play">
          <span class="play-ico">▶︎</span><span class="play-label">再生</span>
        </button>
        <button type="button" class="motion-btn reset" data-action="reset">⟲ リセット</button>
        <div class="motion-progress"><div class="motion-bar" id="motion-bar"></div></div>
        <div class="motion-time"><span id="motion-elapsed">0</span> / ${m.duration}秒</div>
      </div>
      <div class="motion-step">
        <div class="motion-step-label" id="motion-step-label">準備</div>
        <div class="motion-step-cue" id="motion-step-cue">▶︎ ボタンを押して開始</div>
        <div class="motion-step-count" id="motion-step-count"></div>
      </div>
    </div>
  `;
}

// プレイヤーの動作を初期化(modal の motion-player 要素に対して)
export function initMotionPlayer(rootEl, exerciseId){
  const m = getMotion(exerciseId);
  const stage = rootEl.querySelector('.motion-stage');
  const playBtn = rootEl.querySelector('[data-action="play"]');
  const resetBtn = rootEl.querySelector('[data-action="reset"]');
  const bar = rootEl.querySelector('#motion-bar');
  const elapsedEl = rootEl.querySelector('#motion-elapsed');
  const labelEl = rootEl.querySelector('#motion-step-label');
  const cueEl = rootEl.querySelector('#motion-step-cue');
  const countEl = rootEl.querySelector('#motion-step-count');
  const hintEl = rootEl.querySelector('#motion-hint');
  const duration = m.duration;

  let state = { running:false, t:0, startedAt:0, raf:null };

  const updateStep = (t) => {
    let cur = m.steps[0];
    for (const s of m.steps){
      if (s.t <= t) cur = s;
    }
    labelEl.textContent = cur.label;
    cueEl.textContent = cur.cue;
    countEl.textContent = cur.count || '';
  };

  const tick = () => {
    const now = performance.now();
    state.t = (now - state.startedAt) / 1000;
    if (state.t >= duration){
      state.t = duration;
      elapsedEl.textContent = duration.toFixed(0);
      bar.style.width = '100%';
      labelEl.textContent = '完了';
      cueEl.textContent = 'おつかれさまでした 🌷';
      countEl.textContent = '';
      stop();
      stage.classList.remove('is-playing');
      return;
    }
    elapsedEl.textContent = state.t.toFixed(1);
    bar.style.width = (state.t / duration * 100) + '%';
    updateStep(state.t);
    state.raf = requestAnimationFrame(tick);
  };

  const play = () => {
    if (state.running) return;
    state.running = true;
    state.startedAt = performance.now() - state.t * 1000;
    stage.classList.add('is-playing');
    if (hintEl) hintEl.style.display = 'none';
    playBtn.querySelector('.play-ico').textContent = '⏸';
    playBtn.querySelector('.play-label').textContent = '一時停止';
    state.raf = requestAnimationFrame(tick);
  };

  const stop = () => {
    state.running = false;
    if (state.raf) cancelAnimationFrame(state.raf);
    state.raf = null;
    playBtn.querySelector('.play-ico').textContent = '▶︎';
    playBtn.querySelector('.play-label').textContent = '再生';
  };

  const reset = () => {
    stop();
    state.t = 0;
    elapsedEl.textContent = '0';
    bar.style.width = '0%';
    stage.classList.remove('is-playing');
    updateStep(0);
  };

  playBtn.addEventListener('click', () => {
    if (state.running) stop();
    else play();
  });
  resetBtn.addEventListener('click', reset);
  updateStep(0);
}
