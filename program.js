// ===================================================================
// 30-DAY FACE TRAINING PROGRAM
// 各日: 4種目(すべてトレーニング・セルフケアなし)
// Phase 1 (Day 1-10):  覚醒(Awakening)   - 動かしていない表情筋に火を入れる
// Phase 2 (Day 11-20): 強化(Activation)  - 弱化筋を集中強化
// Phase 3 (Day 21-30): 定着(Integration) - 統合・習慣化・印象の定着
// Day 7, 14, 21, 28 はアクティブレスト(軽めメニュー4種)
// ===================================================================
import { EXERCISES, PRESCRIPTION_MAP } from './exercises.js';

// 問題キー(優先度順) → トレーニング候補プール
function buildPool(problemKeys){
  const pool = new Set();
  problemKeys.forEach(k => {
    const map = PRESCRIPTION_MAP[k] || PRESCRIPTION_MAP.general;
    map.training.forEach(id => pool.add(id));
  });
  PRESCRIPTION_MAP.general.training.forEach(id => pool.add(id));
  return Array.from(pool);
}

// アンカー = 各問題の最重要種目(被ってOK)
function buildAnchors(problemKeys){
  const anchors = new Set();
  problemKeys.forEach(k => {
    const map = PRESCRIPTION_MAP[k] || PRESCRIPTION_MAP.general;
    if (map.training[0]) anchors.add(map.training[0]);
    if (map.training[1]) anchors.add(map.training[1]); // 上位2つをアンカー
  });
  return anchors;
}

// 軽量メニュー候補(アクティブレスト用)
const REST_FRIENDLY = [
  'tongueRotation','tongueUp','postureLink','smileHold',
  'generalMaintain','mentalisRelief','swallowDrill','cheekToCheekAir',
  'duchenneFocus','necklineStretch',
];

const isStretch = (id) => EXERCISES[id]?.kind === 'stretch';

function pickLeastUsed(idList, usage, count, anchors, excludeIds, maxStretch=1){
  const score = (id) => {
    const raw = usage[id] || 0;
    // アンカーは優先(score半減)、ストレッチは控えめ(僅かなペナルティ)
    if (anchors.has(id)) return raw * 0.5;
    if (isStretch(id))   return raw + 0.25;
    return raw;
  };

  const sortFn = (a, b) => {
    const sa = score(a), sb = score(b);
    if (sa !== sb) return sa - sb;
    const aa = anchors.has(a) ? 0 : 1;
    const ab = anchors.has(b) ? 0 : 1;
    return aa - ab;
  };

  // 1st pass: 過去2日と被らない候補のみ
  const primary = idList
    .filter(id => !excludeIds.includes(id))
    .sort(sortFn);

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

  // 2nd pass: 不足なら除外条件を緩めて補充(ただしストレッチ上限は維持)
  if (picked.length < count){
    const fallback = idList
      .filter(id => !picked.includes(id))
      .sort(sortFn);
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

// 今日のメニュー: トレーニング4種
export function pickTodayMenu(problemKeys){
  const pool = buildPool(problemKeys);
  const training = pool.slice(0, 4).map(id => EXERCISES[id]);
  return { training };
}

// 30日プログラム生成
export function build30DayProgram(problemKeys){
  const pool = buildPool(problemKeys);
  const anchors = buildAnchors(problemKeys);
  const restPool = pool.filter(id => REST_FRIENDLY.includes(id));
  const usage = Object.fromEntries(pool.map(id => [id, 0]));

  const days = [];
  for (let day = 1; day <= 30; day++){
    const phase  = day <= 10 ? 1 : day <= 20 ? 2 : 3;
    const isRest = (day % 7 === 0);
    const dayInPhase = day <= 10 ? day : day <= 20 ? day-10 : day-20;

    // 過去2日のメニューを除外して被りを最小化
    const prev1 = days[days.length - 1];
    const prev2 = days[days.length - 2];
    const prevIds = [
      ...(prev1 ? (prev1.training || []).map(e => e.id) : []),
      ...(prev2 ? (prev2.training || []).map(e => e.id) : []),
    ];

    const sourceList = isRest && restPool.length >= 4 ? restPool : pool;
    const training = pickLeastUsed(sourceList, usage, 4, anchors, prevIds, 1);
    training.forEach(ex => { usage[ex.id] = (usage[ex.id] || 0) + 1; });

    days.push({
      day, phase, isRest,
      theme: themeFor(phase, dayInPhase, isRest),
      training,
    });
  }
  return days;
}

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
