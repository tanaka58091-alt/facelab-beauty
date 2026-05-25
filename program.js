// ===================================================================
// 30-DAY FACE TRAINING PROGRAM (オーダーメイド設計)
// Phase 1 (Day 1-10):  覚醒(Awakening)   - 動かしていない表情筋に火を入れる
// Phase 2 (Day 11-20): 強化(Activation)  - 弱化筋を集中強化
// Phase 3 (Day 21-30): 定着(Integration) - 統合・習慣化・印象の定着
// Day 7, 14, 21, 28 はアクティブレスト
//
// オプション:
//   timeBudget:   1日あたりの目安(分) 3 / 5 / 10 / 15 → 種目数 3〜6
//   goal:         'liftup' | 'symmetry' | 'antiAging' | 'shrink' | 'eyes' | 'overall'
//   priorityKeys: ユーザーが選んだ TOP3 のお悩みキー(該当エクササイズを優先)
//   ageGroup:     '10s' .. '60s'(中年代以上はlight強度寄り、若年は強度を上げる)
//   lifestyle:    { sleep, posture, diet, stress } 生活背景タグ(出力理由文に反映)
// ===================================================================
import { EXERCISES, EXERCISE_META, PRESCRIPTION_MAP } from './exercises.js';

const COUNT_BY_TIME = { 3:3, 5:4, 10:5, 15:6 };

// goal → 好まれる zone (重みダウン = 選ばれやすい)
const GOAL_ZONE_BIAS = {
  liftup:    { mid:-0.4, lower:-0.2, upper:0.1 },
  symmetry:  { mid:-0.1, lower:-0.1, upper:-0.1 },
  antiAging: { upper:-0.4, mid:-0.1, lower:0.0 },
  shrink:    { lower:-0.3, mid:-0.2, upper:0.1 },
  eyes:      { upper:-0.5, mid:0.0, lower:0.1 },
  overall:   { mid:0.0, lower:0.0, upper:0.0 },
};

// goal → 「目的に合う」エクササイズID(優先プール)
const GOAL_FAVORITE = {
  liftup:    ['zygoLift','midfaceHold','antiGravityCheek','cheekPress','subZygoActivate','duchenneFocus','smileHold','cheekBoneIso'],
  symmetry:  ['symmetryMirror','faceSymmetryDrill','unilateralSmile','winkAlternate','evenChewing','chewBalance','tonguePushSide','diagonalLift'],
  antiAging: ['foreheadSmooth','glabellaRelease','foreheadIso','browLift','eyeOpener','orbicularisLift','outerEyeUp','smileGrading'],
  shrink:    ['platysmaActivation','platysmaPlank','chinTuck','jawlineSlide','jawlineCarve','swallowDrill','cheekPump','necklineStretch'],
  eyes:      ['eyeOpener','eyeWindowOpen','outerEyeUp','lowerEyelidLift','orbicularisLift','browLift','foreheadIso','winkAlternate'],
  overall:   ['fullFaceFlow','duchenneFocus','smileHold','zygoLift','platysmaActivation','tongueRotation','postureLink','expressionPlay'],
};

// 年代 → 強度のバイアス(高年齢は heavy にペナルティ、若年は heavy をやや優先)
function intensityPenalty(intensity, ageGroup){
  const ageNum = parseInt(ageGroup||'30s', 10) || 30;
  if (intensity === 'heavy'){
    if (ageNum >= 50) return 0.3;
    if (ageNum <= 20) return -0.1;
    return 0.0;
  }
  if (intensity === 'light'){
    if (ageNum >= 50) return -0.1;
    return 0.0;
  }
  return 0.0;
}

// 問題キー → トレーニング候補プール
function buildPool(problemKeys){
  const pool = new Set();
  problemKeys.forEach(k => {
    const map = PRESCRIPTION_MAP[k] || PRESCRIPTION_MAP.general;
    map.training.forEach(id => pool.add(id));
  });
  PRESCRIPTION_MAP.general.training.forEach(id => pool.add(id));
  return Array.from(pool).filter(id => EXERCISES[id]);
}

// アンカー: 優先キーの上位2 + 全キーの上位1
function buildAnchors(problemKeys, priorityKeys){
  const anchors = new Set();
  (priorityKeys||[]).forEach(k => {
    const map = PRESCRIPTION_MAP[k];
    if (!map) return;
    if (map.training[0]) anchors.add(map.training[0]);
    if (map.training[1]) anchors.add(map.training[1]);
    if (map.training[2]) anchors.add(map.training[2]);
  });
  problemKeys.forEach(k => {
    const map = PRESCRIPTION_MAP[k] || PRESCRIPTION_MAP.general;
    if (map.training[0]) anchors.add(map.training[0]);
  });
  return anchors;
}

// 軽量メニュー(アクティブレスト用)
const REST_FRIENDLY = [
  'tongueRotation','tongueUp','postureLink','smileHold',
  'generalMaintain','mentalisRelief','swallowDrill','cheekToCheekAir',
  'duchenneFocus','necklineStretch','breathFace','palateContact',
];

const isStretch = (id) => EXERCISES[id]?.kind === 'stretch';

function pickLeastUsed(idList, usage, count, opts){
  const { anchors, excludeIds=[], maxStretch=1, goal='overall', ageGroup='30s', goalFavorites } = opts;
  const zoneBias = GOAL_ZONE_BIAS[goal] || GOAL_ZONE_BIAS.overall;

  const score = (id) => {
    const meta = EXERCISE_META[id] || {};
    let s = usage[id] || 0;
    // アンカー: 強い優先
    if (anchors.has(id)) s -= 0.5;
    // ゴール好みのリスト
    if (goalFavorites.has(id)) s -= 0.35;
    // ストレッチには僅かペナルティ
    if (isStretch(id)) s += 0.25;
    // ゾーンバイアス
    s += zoneBias[meta.zone] || 0;
    // 年代別強度ペナルティ
    s += intensityPenalty(meta.intensity, ageGroup);
    // tier 1 を僅か優先
    if (meta.tier === 1) s -= 0.05;
    if (meta.tier === 3) s += 0.05;
    return s;
  };

  const sortFn = (a, b) => {
    const sa = score(a), sb = score(b);
    if (sa !== sb) return sa - sb;
    const aa = anchors.has(a) ? 0 : 1;
    const ab = anchors.has(b) ? 0 : 1;
    return aa - ab;
  };

  const primary = idList.filter(id => !excludeIds.includes(id)).sort(sortFn);
  const picked = [];
  let stretchCount = 0;
  for (const id of primary){
    if (picked.length >= count) break;
    if (isStretch(id)){
      if (stretchCount >= maxStretch) continue;
      stretchCount++;
    }
    picked.push(id);
  }
  if (picked.length < count){
    const fallback = idList.filter(id => !picked.includes(id)).sort(sortFn);
    for (const id of fallback){
      if (picked.length >= count) break;
      if (isStretch(id)){
        if (stretchCount >= maxStretch) continue;
        stretchCount++;
      }
      picked.push(id);
    }
  }
  return picked.map(id => EXERCISES[id]).filter(Boolean);
}

// 今日のメニュー
export function pickTodayMenu(problemKeys, opts={}){
  const program = build30DayProgram(problemKeys, opts);
  return { training: program[0].training };
}

// 30日プログラム生成
export function build30DayProgram(problemKeys, opts={}){
  const {
    timeBudget = 5,
    goal = 'overall',
    priorityKeys = [],
    ageGroup = '30s',
    lifestyle = {},
  } = opts;

  const count = COUNT_BY_TIME[timeBudget] || 4;
  const pool = buildPool(problemKeys);
  const anchors = buildAnchors(problemKeys, priorityKeys);
  const goalFavorites = new Set(GOAL_FAVORITE[goal] || GOAL_FAVORITE.overall);
  const restPool = pool.filter(id => REST_FRIENDLY.includes(id));
  const usage = Object.fromEntries(pool.map(id => [id, 0]));

  const days = [];
  for (let day = 1; day <= 30; day++){
    const phase  = day <= 10 ? 1 : day <= 20 ? 2 : 3;
    const isRest = (day % 7 === 0);
    const dayInPhase = day <= 10 ? day : day <= 20 ? day-10 : day-20;

    const prev1 = days[days.length - 1];
    const prev2 = days[days.length - 2];
    const prevIds = [
      ...(prev1 ? (prev1.training || []).map(e => e.id) : []),
      ...(prev2 ? (prev2.training || []).map(e => e.id) : []),
    ];

    const sourceList = isRest && restPool.length >= count ? restPool : pool;
    const dayCount = isRest ? Math.max(3, count - 1) : count;
    const training = pickLeastUsed(sourceList, usage, dayCount, {
      anchors, excludeIds: prevIds, maxStretch: 1,
      goal, ageGroup, goalFavorites,
    });
    training.forEach(ex => { usage[ex.id] = (usage[ex.id] || 0) + 1; });

    days.push({
      day, phase, isRest,
      theme: themeFor(phase, dayInPhase, isRest),
      training,
      reason: buildDayReason({ day, phase, isRest, training, priorityKeys, goal, lifestyle, ageGroup, timeBudget }),
    });
  }
  return days;
}

// 日ごとの「なぜこのメニュー」テキスト生成
function buildDayReason({ day, phase, isRest, training, priorityKeys, goal, lifestyle, ageGroup, timeBudget }){
  if (isRest){
    return `Day${day}は循環優先のアクティブレスト。${timeBudget}分以内・軽強度のみで構成し、明日からの集中強化に備えます。`;
  }
  const phaseLabel = phase === 1 ? '覚醒期(使えていない筋に火を入れる段階)'
                  : phase === 2 ? '強化期(弱化筋を集中で太くする段階)'
                  : '定着期(統合と習慣化の段階)';

  const goalLabel = {
    liftup:'リフトアップ', symmetry:'左右対称化', antiAging:'シワ対策',
    shrink:'小顔・むくみ', eyes:'目元印象', overall:'総合バランス',
  }[goal] || '総合バランス';

  const priorities = (priorityKeys||[]).slice(0,3).map(k => PROBLEM_LABEL[k] || k).filter(Boolean);
  const priorityText = priorities.length
    ? `特に「${priorities.join('・')}」へ最短ルートで効くトレーニング`
    : '弱化筋を中心に効率重視で配列';

  const lifeNote = lifestyleNote(lifestyle);
  const ageNote = ageGroup ? `${ageGroup.replace('s','代')}の組織変化を考慮し、強度を最適化しています。` : '';

  return `${phaseLabel}。今日の${training.length}種は、${priorityText}を中心に、過去2日と重複しないよう自動選定。ゴール「${goalLabel}」のゾーンを重点配置。${ageNote}${lifeNote}`;
}

function lifestyleNote(life){
  const notes = [];
  if (life.posture === 'smartphone' || life.posture === 'desk'){
    notes.push('スマホ・デスク姿勢の影響を考慮し、姿勢×顔の連動メニューを定期的に挟みます。');
  }
  if (life.diet === 'hardChew'){
    notes.push('硬い物を多く噛む習慣があるため、咬筋脱力の機会を多めに含めています。');
  }
  if (life.stress === 'high'){
    notes.push('ストレス負荷が高いため、眉間・額の緊張をリセットする要素を優先しています。');
  }
  if (life.sleep === 'short'){
    notes.push('短時間睡眠でむくみが起きやすいため、循環系メニューを織り込んでいます。');
  }
  return notes.join(' ');
}

// 問題キーの日本語ラベル
const PROBLEM_LABEL = {
  facialAsymmetry:'左右非対称',
  mouthCornerDown:'口角下がり',
  nasolabialFold:'ほうれい線',
  jawSagging:'フェイスラインのたるみ',
  puffiness:'むくみ',
  partsBalance:'パーツバランス',
  masseterHypertrophy:'エラ張り',
  cheekHollow:'頬コケ',
  longPhiltrum:'人中の長さ',
  gummySmile:'ガミースマイル',
  hoodedEyelid:'まぶたの重さ',
  droopyEyeOuter:'目尻下がり',
  templeHollow:'こめかみ凹',
  foreheadLines:'額のシワ',
  glabellarLines:'眉間のシワ',
};

function themeFor(phase, dayInPhase, isRest){
  if (isRest) return 'アクティブレスト・流して整える';
  const themes = {
    1: [
      '導入・表情筋を知る',
      '口角と頬骨の覚醒',
      '眉と目元の独立動員',
      '舌ポジションの再学習',
      '首前面の解放',
      '左右差の発見',
      '休息日 (Rest)',
      '咬筋の脱力',
      '中顔面の起動',
      'Phase 1総仕上げ',
    ],
    2: [
      '大頬骨筋の集中強化',
      'フェイスラインを彫る',
      '眼輪筋の活性化',
      'ほうれい線エリア集中',
      '舌・口腔の総合トレ',
      '左右非対称の是正',
      '休息日 (Rest)',
      '統合スマイルホールド',
      '頬の引き上げと持久',
      'Phase 2総仕上げ',
    ],
    3: [
      '統合・全表情筋フロー',
      '日常表情への定着',
      'シンメトリー仕上げ',
      '姿勢と顔の連動',
      '中顔面の最終調整',
      'スマイルの質を上げる',
      '休息日 (Rest)',
      '印象を磨く',
      '習慣化の確認',
      '30日プログラム卒業',
    ],
  };
  return themes[phase][dayInPhase-1];
}
