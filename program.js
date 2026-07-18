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
import { EXERCISES, EXERCISE_META, PRESCRIPTION_MAP, getMeta, isExerciseAllowed } from './exercises.js';
import { KEY_METRICS, metricImprovement } from './progress.js';

// === 季節バイアス (Phase 2-9) ===
// 各季節で特に意識したいゾーン/種目に弱い優先付与
const SEASON_BIAS = {
  spring: { focus:'mid',    note:'乾燥緩和とむくみ排出、表情筋の起動に集中' },
  summer: { focus:'lower',  note:'紫外線後のたるみ予防と冷房むくみ対策' },
  autumn: { focus:'mid',    note:'夏疲労リセットと血流回復を優先' },
  winter: { focus:'upper',  note:'乾燥・血流低下対策と眼精疲労ケア' },
};
// 季節おすすめ種目 (やんわり優先)
const SEASON_FAVORITE = {
  spring: ['cheekPump','neckFront','breathGlow','fullFlow','faceRelax','bloodFlowPose','freshFacePose'],
  summer: ['neckFront','chinTuck','jawSlide','neckSide','cheekAir','clavicleLymph','neckMassage','tongueOut'],
  autumn: ['breathGlow','faceRelax','tongueRoll','fullFlow','postureFace','faceMassage','diaphragmBreath'],
  winter: ['eyeWideOpen','foreheadSmooth','browRaise','breathGlow','templeRelease','bloodFlowPose','eyeRelease'],
};
// 月経・PMS期にはハード強度や息止め系を控えめに
const LIFESTAGE_AVOID = {
  menstrual:  ['breathGlow','aiueoTrain','lionPose','neckIso','bloodFlowPose'],
  postpartum: ['breathGlow','lionPose','neckIso'],
};

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
  liftup:    ['cheekLift','cheekLiftAssist','mouthCornerLift','nasolabialStretch','cheekPump','balloonFace','fullFlow','smileHold','chinUpPose'],
  symmetry:  ['symmetrySmile','oneSideSmile','browSolo','chopstickTrain','aiueoTrain','balloonFace','mouthCornerTongue'],
  antiAging: ['foreheadSmooth','glabellaRelease','hairlineLift','browUpDown','browRaise','eyeWideOpen','faceRelax','breathGlow','faceMassage'],
  shrink:    ['chinTuck','chinPress','neckFront','octopusPose','jawSlide','cheekPump','masseterRelease','clavicleLymph','neckMassage'],
  eyes:      ['eyeWideOpen','binocularPose','outerEyeLift','lowerLidLift','munchFace','eyeRelease','browRaise','eyeRoll'],
  overall:   ['fullFlow','cheekLift','mouthCornerLift','tongueRoll','chinTuck','freshFacePose','smileHold','breathGlow'],
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

// 問題キー → 「悩みに直接効く」処方セット（score で強く優先される）
function buildPrescribed(problemKeys){
  const s = new Set();
  problemKeys.forEach(k => {
    const map = PRESCRIPTION_MAP[k] || PRESCRIPTION_MAP.general;
    map.training.forEach(id => s.add(id));
  });
  PRESCRIPTION_MAP.general.training.forEach(id => s.add(id));
  return s;
}

// 候補プール = 悩みへの処方セットが主役。
// ただし「昨日と同じ種目」を避けるには1日分の2倍+αの候補が要るため、
// 足りないぶんだけ全種目から補充する（オーダーメイド性と多様性の両立）。
function buildPool(problemKeys, count=4, contra=[]){
  const ok = (id) => EXERCISES[id] && isExerciseAllowed(id, contra);
  const pool = new Set(Array.from(buildPrescribed(problemKeys)).filter(ok));
  // 「昨日と同じ」を避けるには1日分の2倍+α、
  // 「30日飽きない」には最低24種は欲しい（不足分は全種目から補充）
  const need = Math.max(count * 2 + 2, 24);
  if (pool.size < need){
    for (const id of Object.keys(EXERCISES)){
      if (pool.size >= need) break;
      if (ok(id)) pool.add(id);
    }
  }
  return Array.from(pool);
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
  // 軽く流す日（Day7/14/21/28）向け＝ゆるめる・呼吸・整える系
  'tongueRoll','tonguePress','postureFace','faceRelax','breathGlow','diaphragmBreath',
  'cheekAir','neckSide','neckBack','neckMassage','clavicleLymph','shoulderRoll',
  'mouthCornerLift','cheekPump','foreheadSmooth','glabellaRelease','templeRelease',
  'masseterTap','lipPucker','lipRelease','eyeRelease','blinkReset','eyeRoll',
  'chinMassage','cheekBoneMassage','faceMassage','hairlineLift','lipOpenClose',
];

const isStretch = (id) => EXERCISES[id]?.kind === 'stretch';

function pickLeastUsed(idList, usage, count, opts){
  const { anchors, excludeIds=[], avoidIds=[], maxStretch=1, goal='overall', ageGroup='30s',
          goalFavorites, prescribed=new Set(), contra=[], timeOfDay='any', season=null,
          seasonFavorites=new Set(), lifeStageAvoid=new Set(), historyBoost={}, phase=1 } = opts;
  const zoneBias = GOAL_ZONE_BIAS[goal] || GOAL_ZONE_BIAS.overall;
  const seasonBias = season && SEASON_BIAS[season] ? SEASON_BIAS[season] : null;

  // 禁忌種目はそもそも候補から除外
  idList = idList.filter(id => isExerciseAllowed(id, contra));

  const score = (id) => {
    const meta = EXERCISE_META[id] || {};
    const fullMeta = getMeta(id);
    let s = usage[id] || 0;
    // アンカー: 強い優先
    if (anchors.has(id)) s -= 0.5;
    // 悩みに直接効く処方種目を優先（オーダーメイドの核）
    if (prescribed.has(id)) s -= 0.45;
    // ゴール好みのリスト
    if (goalFavorites.has(id)) s -= 0.35;
    // 季節おすすめ
    if (seasonFavorites.has(id)) s -= 0.18;
    // ライフステージ回避 (重いペナルティ、強制除外ではなく劣後)
    if (lifeStageAvoid.has(id)) s += 0.6;
    // 履歴ベース: 改善が遅い問題向けの種目に弱い優先
    if (historyBoost[id]) s -= historyBoost[id];
    // ストレッチには僅かペナルティ（ただし、その悩みの主力＝アンカーは免除。
    // 例: エラ張りの主力「エラほぐし」等はゆるめる系でも優先配置する）
    if (isStretch(id) && !anchors.has(id)) s += 0.25;
    // ゾーンバイアス
    s += zoneBias[meta.zone] || 0;
    // 季節フォーカスゾーンに僅か優先
    if (seasonBias && meta.zone === seasonBias.focus) s -= 0.08;
    // 時間帯マッチング (好みと一致なら弱い優先、不一致は弱いペナルティ)
    const tods = fullMeta.timeOfDay || ['any'];
    if (timeOfDay !== 'any'){
      if (tods.includes(timeOfDay)) s -= 0.12;
      else if (!tods.includes('any')) s += 0.1;
    }
    // 年代別強度ペナルティ
    s += intensityPenalty(meta.intensity, ageGroup);
    // フェーズごとに主役の tier を入れ替える
    //   Phase1=基礎を覚える / Phase2=標準を足す / Phase3=応用で仕上げる
    //   → 30日を通して顔ぶれが変わり、飽きずに段階的にレベルが上がる
    if (phase === 1){
      if (meta.tier === 1) s -= 0.55;
      if (meta.tier === 3) s += 0.5;
    } else if (phase === 2){
      if (meta.tier === 2) s -= 0.4;
      if (meta.tier === 3) s -= 0.1;
    } else {
      if (meta.tier === 3) s -= 0.5;
      if (meta.tier === 2) s -= 0.2;
      if (meta.tier === 1) s += 0.25;
    }
    return s;
  };

  const sortFn = (a, b) => {
    const sa = score(a), sb = score(b);
    if (sa !== sb) return sa - sb;
    const aa = anchors.has(a) ? 0 : 1;
    const ab = anchors.has(b) ? 0 : 1;
    return aa - ab;
  };

  const picked = [];
  let stretchCount = 0;
  const takeFrom = (list) => {
    for (const id of list){
      if (picked.length >= count) break;
      if (picked.includes(id)) continue;
      if (isStretch(id)){
        if (stretchCount >= maxStretch) continue;
        stretchCount++;
      }
      picked.push(id);
    }
  };
  // 段階的に条件を緩める（「昨日と同じ種目」は最後まで避ける = 飽きさせない）
  // 1) 過去2日に出た種目を避ける
  takeFrom(idList.filter(id => !excludeIds.includes(id)).sort(sortFn));
  // 2) 足りなければ、一昨日は許容。昨日の種目だけは避ける
  if (picked.length < count) takeFrom(idList.filter(id => !avoidIds.includes(id)).sort(sortFn));
  // 3) それでも足りなければ全体から（候補が1日分の2倍未満の極小プール時のみ）
  if (picked.length < count) takeFrom(idList.slice().sort(sortFn));
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
    contra = [],
    lifeStage = 'none',
    timeOfDay = 'any',
    season = null,
    history = [],
  } = opts;

  const count = COUNT_BY_TIME[timeBudget] || 4;
  // 禁忌種目を除外しつつ、重複回避に必要な数まで候補を確保
  const pool = buildPool(problemKeys, count, contra);
  const prescribed = buildPrescribed(problemKeys);
  const anchors = buildAnchors(problemKeys, priorityKeys);
  const goalFavorites = new Set(GOAL_FAVORITE[goal] || GOAL_FAVORITE.overall);
  const seasonFavorites = new Set(season ? (SEASON_FAVORITE[season] || []) : []);
  const lifeStageAvoid = new Set(LIFESTAGE_AVOID[lifeStage] || []);
  const historyBoost = buildHistoryBoost(history, problemKeys);
  const restPool = REST_FRIENDLY.filter(id => EXERCISES[id] && isExerciseAllowed(id, contra));
  const usage = Object.fromEntries(pool.map(id => [id, 0]));

  const days = [];
  for (let day = 1; day <= 30; day++){
    const phase  = day <= 10 ? 1 : day <= 20 ? 2 : 3;
    const isRest = (day % 7 === 0);
    const dayInPhase = day <= 10 ? day : day <= 20 ? day-10 : day-20;

    const prev1 = days[days.length - 1];
    const prev2 = days[days.length - 2];
    const prev1Ids = prev1 ? (prev1.training || []).map(e => e.id) : [];
    const prev2Ids = prev2 ? (prev2.training || []).map(e => e.id) : [];
    const prevIds = [...prev1Ids, ...prev2Ids];

    const sourceList = isRest && restPool.length >= count ? restPool : pool;
    const dayCount = isRest ? Math.max(3, count - 1) : count;
    const training = pickLeastUsed(sourceList, usage, dayCount, {
      anchors, excludeIds: prevIds, avoidIds: prev1Ids, maxStretch: 2, phase,
      goal, ageGroup, goalFavorites, prescribed,
      contra, timeOfDay, season, seasonFavorites, lifeStageAvoid, historyBoost,
    });
    training.forEach(ex => { usage[ex.id] = (usage[ex.id] || 0) + 1; });

    days.push({
      day, phase, isRest,
      theme: themeFor(phase, dayInPhase, isRest),
      training,
      reason: buildDayReason({ day, phase, isRest, training, priorityKeys, goal, lifestyle, ageGroup, timeBudget, contra, lifeStage, timeOfDay, season, history, historyBoostActive: Object.keys(historyBoost).length > 0 }),
    });
  }
  return days;
}

// 履歴 → 改善遅い問題向けの種目ブースト
function buildHistoryBoost(history, problemKeys){
  if (!history || history.length < 2) return {};
  // 最新2スナップを比較し、悪化/停滞している指標に紐づく種目を強化
  // 注: スナップショットは平坦化され keyMetrics に主要指標を持つ(progress.js saveSnapshot)
  const latest = history[0];
  const prev   = history[1];
  const lm = latest?.keyMetrics;
  const pm = prev?.keyMetrics;
  if (!lm || !pm) return {};
  const boost = {};
  KEY_METRICS.forEach(({ key, dir }) => {
    if (typeof lm[key] !== 'number' || typeof pm[key] !== 'number') return;
    // pm=前回(before) / lm=最新(after)。improve<0 が改善。指標の方向を考慮する。
    const improve = metricImprovement(dir, pm[key], lm[key]);
    if (improve >= -0.005) {
      // 改善が乏しい/悪化 → その問題に紐づくPRESCRIPTION_MAP種目をブースト
      const probKey = METRIC_TO_PROBLEM[key];
      if (probKey && PRESCRIPTION_MAP[probKey]) {
        PRESCRIPTION_MAP[probKey].training.slice(0,3).forEach(id => {
          boost[id] = (boost[id] || 0) + 0.15;
        });
      }
    }
  });
  return boost;
}

// キー名は analyzer.js の metrics(= keyMetrics 保存名)と一致させる
const METRIC_TO_PROBLEM = {
  midlineTilt: 'facialAsymmetry',
  eyeHeightDiff: 'facialAsymmetry',
  browHeightDiff: 'facialAsymmetry',
  mouthTilt: 'facialAsymmetry',
  cheekDrop: 'jawSagging',
  mouthCornerDrop: 'mouthCornerDown',
  nasolabialIndex: 'nasolabialFold',
  faceWHRatio: 'puffiness',
};

// 日ごとの「なぜこのメニュー」テキスト生成
function buildDayReason({ day, phase, isRest, training, priorityKeys, goal, lifestyle, ageGroup, timeBudget, contra=[], lifeStage='none', timeOfDay='any', season=null, history=[], historyBoostActive=false }){
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
  const contraNote = (contra && contra.length)
    ? `既往症「${contra.map(c => CONTRA_LABEL_SHORT[c]||c).join('・')}」に該当する種目は自動で除外しています。`
    : '';
  const lifeStageNote = lifeStage === 'pregnancy' ? '妊娠中のため、息止め・うつ伏せ姿勢系は除外。'
                      : lifeStage === 'postpartum' ? '産後3ヶ月以内のため、強負荷種目を控えめに配列。'
                      : lifeStage === 'menstrual' ? 'PMS/月経期は軽強度寄りに調整しています。'
                      : '';
  const seasonNote = season && SEASON_BIAS[season]
    ? `${SEASON_LABEL[season]}は${SEASON_BIAS[season].note}。`
    : '';
  const todNote = timeOfDay === 'morning' ? '朝向けの覚醒系種目を優先しています。'
                : timeOfDay === 'evening' ? '夜向けのリリース・脱力系種目を優先しています。'
                : '';
  const histNote = historyBoostActive
    ? `過去スナップショット${history.length}件と比較し、改善が遅い指標向けの種目を弱く優先しています。`
    : '';

  return `${phaseLabel}。今日の${training.length}種は、${priorityText}を中心に、過去2日と重複しないよう自動選定。ゴール「${goalLabel}」のゾーンを重点配置。${ageNote}${lifeNote}${contraNote}${lifeStageNote}${seasonNote}${todNote}${histNote}`;
}

const CONTRA_LABEL_SHORT = {
  tmj:'顎関節症', skinSensitive:'敏感肌', pregnancy:'妊娠中',
  highBp:'高血圧', neckProblem:'首の不調', glaucoma:'緑内障',
};
const SEASON_LABEL = { spring:'春', summer:'夏', autumn:'秋', winter:'冬' };

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
