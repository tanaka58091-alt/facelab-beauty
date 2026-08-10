// ===================================================================
// PROGRESS TRACKING - 進捗履歴 (localStorage)
// 解析するたびにスナップショット(サムネ+スコア+主要指標+日時)を保存し、
// タイムライン表示・Before/After スライダー比較を可能にする。
// ===================================================================

import { ns, HISTORY_KEY_BASE } from './profiles.js';

const MAX_SNAPSHOTS = 30; // 上限(古いものから自動削除)

// ===================================================================
// 履歴で追跡する主要指標の正本(キー名は analyzer.js の metrics と一致必須)
//   dir: 'zero'=0に近いほど良い / 'lower'=小さいほど良い / 'higher'=大きいほど良い
// この配列を pickKeyMetrics(保存) / app.js(Before-After・推移) /
// program.js(履歴ブースト) の3箇所で共有し、キー名と方向の齟齬を防ぐ。
// ===================================================================
export const KEY_METRICS = [
  { key:'midlineTilt',     label:'中心軸の傾き',           dir:'zero'   },
  { key:'eyeHeightDiff',   label:'目の高さ差',             dir:'zero'   },
  { key:'browHeightDiff',  label:'眉の高さ差',             dir:'zero'   },
  { key:'mouthTilt',       label:'口角の傾き',             dir:'zero'   },
  { key:'mouthCornerDrop', label:'口角の下がり',           dir:'lower'  },
  { key:'cheekDrop',       label:'フェイスラインのたるみ', dir:'lower'  },
  { key:'nasolabialIndex', label:'ほうれい線',             dir:'higher' },
  { key:'faceWHRatio',     label:'むくみ(顔の横縦比)',     dir:'lower'  },
  { key:'wrinkleIdx',      label:'肌のハリ・シワ',         dir:'lower'  },
  { key:'toneEvenness',    label:'肌トーン均一度',         dir:'higher' },
];
const KEY_METRIC_LABEL = Object.fromEntries(KEY_METRICS.map(m => [m.key, m.label]));

// 改善量を「負=改善」の符号で返す(方向を考慮)
export function metricImprovement(dir, before, after){
  if (dir === 'higher') return before - after;            // 増えたら改善→負
  if (dir === 'lower')  return after - before;            // 減ったら改善→負
  return Math.abs(after) - Math.abs(before);              // zero: 0へ近づくと改善→負
}

// アクティブな講座生プロフィールに紐づく履歴キー
function storageKey(){ return ns(HISTORY_KEY_BASE); }

// 安全に localStorage を扱う(プライベートブラウズで失敗する環境用)
function safeRead(){
  try {
    const raw = localStorage.getItem(storageKey());
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch(e){ return []; }
}
function safeWrite(arr){
  try { localStorage.setItem(storageKey(), JSON.stringify(arr)); return true; }
  catch(e){ console.warn('[progress] localStorage write failed', e); return false; }
}

// 解析後の Canvas をサムネ化(JPEG, 最大 200px 幅)
export function thumbnailFromCanvas(canvas, maxW = 200){
  if (!canvas) return null;
  const w = canvas.width, h = canvas.height;
  if (!w || !h) return null;
  const ratio = Math.min(1, maxW / w);
  const tw = Math.round(w * ratio);
  const th = Math.round(h * ratio);
  const tmp = document.createElement('canvas');
  tmp.width = tw; tmp.height = th;
  tmp.getContext('2d').drawImage(canvas, 0, 0, tw, th);
  try { return tmp.toDataURL('image/jpeg', 0.82); }
  catch(e){ return null; }
}

// ===================================================================
// Before/After の「比較できるか」判定
//
// 同じ人でも、顔の向き・明るさ・写る大きさが変われば、指標は動く。
// 条件が違う2枚を並べて「改善しました」と言うのは、事実ではない。
// そこで撮影条件を一緒に保存しておき、条件が変わっている指標は
// 「比べられません」と正直に示す。
//
// どの条件がどの指標を狂わせるか:
//   pose  … 顔の向き。輪郭・左右差・口元の位置がまとめて変わる
//   light … 明るさ。肌のきめ・トーンの見え方が変わる
//   size  … 顔の写る大きさ。細かいテクスチャの解像度が変わる
// ===================================================================
const SENSITIVE_TO = {
  midlineTilt:     ['pose'],
  eyeHeightDiff:   ['pose'],
  browHeightDiff:  ['pose'],
  mouthTilt:       ['pose'],
  mouthCornerDrop: ['pose'],
  cheekDrop:       ['pose'],
  nasolabialIndex: ['pose'],
  faceWHRatio:     ['pose'],
  wrinkleIdx:      ['light', 'size'],
  toneEvenness:    ['light'],
};
// この差を超えたら「条件が変わった」とみなす
const SHOT_TOLERANCE = {
  yawDeg:   10,    // 左右の向き(度)
  pitchDeg:  8,    // 上下の向き(度)
  bright:   45,    // 平均の明るさ(0-255)
  sizeRatio: 1.30, // 顔の写る大きさの比
};

// 解析結果から「撮影条件」を取り出す
export function buildShotConditions({ metrics, pixels, photoQuality }){
  const num = v => (typeof v === 'number' && isFinite(v)) ? Math.round(v * 100) / 100 : null;
  return {
    yawDeg:   num(metrics?.yawDeg),
    pitchDeg: num(metrics?.pitchDeg),
    // 向きが推定値のときは判定に使わない(推定の誤差を「条件の違い」と誤認しないため)
    poseExact: metrics?.poseSource === 'matrix',
    bright:   num(pixels?.luminanceOverall),
    faceSize: num(photoQuality?.faceW),
  };
}

// 2枚の撮影条件を比べ、どの条件がそろっていないかを返す
export function compareShotConditions(before, after){
  const a = before?.shot, b = after?.shot;
  if (!a || !b) return { known: false, broken: new Set(), notes: [] };
  const broken = new Set();
  const notes = [];
  if (a.poseExact && b.poseExact){
    const dYaw = Math.abs((b.yawDeg ?? 0) - (a.yawDeg ?? 0));
    const dPit = Math.abs((b.pitchDeg ?? 0) - (a.pitchDeg ?? 0));
    if (dYaw > SHOT_TOLERANCE.yawDeg){
      broken.add('pose');
      notes.push(`顔の向き（左右）が前回と ${dYaw.toFixed(0)}° 違います`);
    }
    if (dPit > SHOT_TOLERANCE.pitchDeg){
      broken.add('pose');
      notes.push(`顔の向き（上下）が前回と ${dPit.toFixed(0)}° 違います`);
    }
  }
  if (a.bright != null && b.bright != null && Math.abs(b.bright - a.bright) > SHOT_TOLERANCE.bright){
    broken.add('light');
    notes.push(b.bright > a.bright ? '前回より明るい場所で撮られています' : '前回より暗い場所で撮られています');
  }
  if (a.faceSize && b.faceSize){
    const ratio = Math.max(a.faceSize, b.faceSize) / Math.min(a.faceSize, b.faceSize);
    if (ratio > SHOT_TOLERANCE.sizeRatio){
      broken.add('size');
      notes.push(b.faceSize > a.faceSize ? '前回より顔が大きく写っています' : '前回より顔が小さく写っています');
    }
  }
  return { known: true, broken, notes };
}

// その指標が今回の2枚で比べられるか
export function isMetricComparable(metricKey, broken){
  if (!broken || !broken.size) return true;
  const sensitive = SENSITIVE_TO[metricKey];
  if (!sensitive) return true;
  return !sensitive.some(kind => broken.has(kind));
}

// スコア・主要指標・タイプ名から保存メタを構築
export function buildSnapshotMeta({ score, grade, faceType, ageGroup, goal, problems, metrics, percentile, pixels, photoQuality }){
  const topProblems = (problems || []).slice(0, 3).map(p => ({
    key: p.key, title: p.title, severity: p.severity,
  }));
  return {
    score: score ?? null,
    grade: grade ?? null,
    percentile: percentile ?? null,
    faceType: faceType ?? null,
    ageGroup: ageGroup ?? null,
    goal: goal ?? null,
    topProblems,
    // 主要 4 指標のみ保存して比較しやすくする
    keyMetrics: pickKeyMetrics(metrics),
    // 撮影条件(次回との比較可能性を判定するため)
    shot: buildShotConditions({ metrics, pixels, photoQuality }),
  };
}
function pickKeyMetrics(m){
  if (!m) return {};
  const out = {};
  KEY_METRICS.forEach(({ key }) => {
    if (key in m && m[key] != null && !Number.isNaN(+m[key])) out[key] = round3(m[key]);
  });
  return out;
}
function round3(v){
  const n = +v; if (Number.isNaN(n)) return v;
  return Math.round(n * 1000) / 1000;
}

// 保存(ID は ISO 日時、自動上限管理)
export function saveSnapshot({ thumbDataUrl, meta }){
  const arr = safeRead();
  const item = {
    id: 'snap_' + Date.now(),
    createdAt: new Date().toISOString(),
    thumb: thumbDataUrl || null,
    ...meta,
  };
  arr.unshift(item);
  if (arr.length > MAX_SNAPSHOTS) arr.length = MAX_SNAPSHOTS;
  // 容量超過(QuotaExceeded)時は履歴を無言で失わないよう段階的に間引いて再試行する。
  let ok = safeWrite(arr);
  for (let i = arr.length - 1; i >= 0 && !ok; i--){
    if (arr[i].thumb){ arr[i].thumb = null; ok = safeWrite(arr); } // 1) 古い順にサムネを外す
  }
  while (!ok && arr.length > 1){
    arr.pop(); ok = safeWrite(arr);                                // 2) それでも入らねば最古スナップを削除
  }
  return item;
}

export function listSnapshots(){
  return safeRead();
}

export function deleteSnapshot(id){
  const arr = safeRead().filter(x => x.id !== id);
  safeWrite(arr);
  return arr;
}

export function clearHistory(){
  try { localStorage.removeItem(storageKey()); } catch(e){}
}

// ===================================================================
// 30日ジャーニー(継続の仕組み) — 開始日・各Dayの完了・連続日数
//   プロフィール名前空間で localStorage に保持:
//     facelab.journey.v1::<profileId> = { startDate, done:{"1":"YYYY-MM-DD",..}, streak, lastDoneDate }
// ===================================================================
const JOURNEY_BASE = 'facelab.journey.v1';
function journeyKey(){ return ns(JOURNEY_BASE); }
function ymd(d){ return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export function getJourney(){
  try {
    const r = localStorage.getItem(journeyKey());
    const j = r ? JSON.parse(r) : null;
    if (j && typeof j === 'object'){
      return { startDate:j.startDate||null, done:(j.done&&typeof j.done==='object')?j.done:{}, streak:j.streak||0, lastDoneDate:j.lastDoneDate||null, log:(j.log&&typeof j.log==='object')?j.log:{}, checkins:(j.checkins&&typeof j.checkins==='object')?j.checkins:{} };
    }
  } catch(e){}
  return { startDate:null, done:{}, streak:0, lastDoneDate:null, log:{}, checkins:{} };
}
function saveJourney(j){ try { localStorage.setItem(journeyKey(), JSON.stringify(j)); } catch(e){} }

// 今日取り組むDay = 未完了の最小Day(1..30)。全部済みなら30を返す。
export function currentJourneyDay(){
  const j = getJourney();
  for (let d=1; d<=30; d++){ if (!j.done[d]) return d; }
  return 30;
}

// 実施の記録。
//   level: 'full'(できた) / 'partial'(一部できた) / 'skip'(できなかった)
//   feel : 'easy'(かんたん) / 'ok'(ちょうどいい) / 'hard'(きつい) / 'pain'(違和感あり)
// レベルと体感は、あとで「途中評価」と「メニューの自動調整」に使う。
export function markDayDone(day, opts={}){
  const j = getJourney();
  const today = ymd(new Date());
  const level = opts.level || 'full';
  if (!j.startDate) j.startDate = today;
  if (!j.log) j.log = {};
  j.log[day] = { date: today, level, feel: opts.feel || null };
  // 「できなかった」は連続日数の対象にしない(記録だけ残す)
  if (level !== 'skip' && !j.done[day]){
    j.done[day] = today;
    if (j.lastDoneDate !== today){       // 同じ日に複数完了してもストリークは1回だけ加算
      const yst = new Date(); yst.setDate(yst.getDate()-1);
      j.streak = (j.lastDoneDate === ymd(yst)) ? (j.streak||0)+1 : 1;
      j.lastDoneDate = today;
    }
  }
  saveJourney(j);
  return j;
}

// ===================================================================
// 途中評価とメニューの自動調整
//   Day7 / 14 / 21 のタイミングで、それまでの実施状況を振り返る。
//   ここで得た「実施率」と「体感」を使って、次の期間のメニュー量と
//   強度を調整する(初日に作った30日を固定しない)。
// ===================================================================
export const CHECKIN_DAYS = [7, 14, 21];

// 直近の期間(前回チェックイン〜今)の実施状況を集計
export function reviewStats(uptoDay){
  const j = getJourney();
  const log = j.log || {};
  const from = Math.max(1, uptoDay - 6);
  let full=0, partial=0, skip=0, planned=0;
  const feels = [];
  for (let d = from; d <= uptoDay; d++){
    planned++;
    const e = log[d];
    if (!e){ if (j.done[d]) full++; continue; }   // 旧データ(記録なし)は完了なら full 扱い
    if (e.level === 'full') full++;
    else if (e.level === 'partial') partial++;
    else skip++;
    if (e.feel) feels.push(e.feel);
  }
  const doneRate = planned ? (full + partial * 0.5) / planned : 0;
  const count = f => feels.filter(x => x === f).length;
  return {
    from, uptoDay, planned, full, partial, skip, doneRate,
    feels, hardCount: count('hard'), easyCount: count('easy'), painCount: count('pain'),
  };
}

// 集計 → 次の期間への調整方針(プログラム生成に渡す)
export function suggestAdjustment(rv){
  // 違和感の報告が1回でもあれば、まず強度を落として様子を見る
  if (rv.painCount > 0) return { kind:'ease', countDelta:-1, intensity:'light',
    message:'違和感があったとのことなので、次の1週間は軽めのメニューに切り替えます。痛みがあるときは中止してください。' };
  if (rv.doneRate < 0.5) return { kind:'reduce', countDelta:-1, intensity:'light',
    message:'続けるのが大変だったようですね。次の1週間は種目数を減らして、まず習慣にすることを優先します。' };
  if (rv.hardCount >= 3) return { kind:'ease', countDelta:0, intensity:'light',
    message:'きついと感じた日が多かったので、次の1週間は強度を少し下げます。' };
  if (rv.doneRate >= 0.85 && rv.easyCount >= 3) return { kind:'levelUp', countDelta:+1, intensity:'up',
    message:'よく続けられていて、余裕もありそうです。次の1週間は少しレベルを上げます。' };
  return { kind:'keep', countDelta:0, intensity:'keep',
    message:'いいペースです。次の1週間もこの調子で続けましょう。' };
}

// チェックインの記録(同じDayで何度も出さないため)
export function isCheckinDone(day){ const j = getJourney(); return !!(j.checkins && j.checkins[day]); }
export function saveCheckin(day, data){
  const j = getJourney();
  if (!j.checkins) j.checkins = {};
  j.checkins[day] = { at: ymd(new Date()), ...data };
  saveJourney(j);
  return j;
}
// 保存済みの調整方針(最新のもの)を返す
export function currentAdjustment(){
  const j = getJourney();
  const days = Object.keys(j.checkins || {}).map(Number).sort((a,b)=>b-a);
  if (!days.length) return null;
  return (j.checkins[days[0]] || {}).adjustment || null;
}

export function unmarkDayDone(day){
  const j = getJourney();
  if (j.done[day]){ delete j.done[day]; saveJourney(j); }
  return j;
}

export function resetJourney(){ try { localStorage.removeItem(journeyKey()); } catch(e){} }

export function journeyStats(){
  const j = getJourney();
  const doneCount = Object.keys(j.done).length;
  const today = ymd(new Date());
  const doneToday = Object.values(j.done).includes(today);
  let gapDays = null;
  if (j.lastDoneDate){
    const last = new Date(j.lastDoneDate + 'T00:00:00');
    gapDays = Math.round((new Date(today + 'T00:00:00') - last) / 86400000);
  }
  return { doneCount, streak:j.streak||0, doneToday, gapDays, startDate:j.startDate, done:j.done };
}

// 2件比較(差分): a が新しい、b が古い → score差・指標差を返す
export function diffSnapshots(a, b){
  if (!a || !b) return null;
  const out = {
    scoreDelta: (a.score ?? 0) - (b.score ?? 0),
    days: Math.round((new Date(a.createdAt) - new Date(b.createdAt)) / (1000*60*60*24)),
    metrics: {},
  };
  const km = a.keyMetrics || {}; const kmB = b.keyMetrics || {};
  Object.keys(km).forEach(k => {
    if (k in kmB) out.metrics[k] = round3(km[k] - kmB[k]);
  });
  return out;
}

// ===================================================================
// 前回セッション — 写真なしで結果・30日プログラムを復元するための保存
//   プロフィール名前空間: facelab.lastSession.v1::<profileId>
//   ここには「解析やり直し不要で結果を再表示」できる最小限を保存する。
// ===================================================================
const LAST_SESSION_BASE = 'facelab.lastSession.v1';
function lastSessionKey(){ return ns(LAST_SESSION_BASE); }

export function saveLastSession(obj){
  try { localStorage.setItem(lastSessionKey(), JSON.stringify(obj)); return true; }
  catch(e){
    // 容量超過時は重い landmarks/thumb を落として最小限で再試行（結果・プログラムは残す）
    try {
      const slim = { ...obj }; delete slim.landmarksRaw; delete slim.thumb;
      localStorage.setItem(lastSessionKey(), JSON.stringify(slim)); return true;
    } catch(e2){ console.warn('[lastSession] save failed', e2); return false; }
  }
}
export function getLastSession(){
  try { const r = localStorage.getItem(lastSessionKey()); const o = r ? JSON.parse(r) : null; return (o && typeof o === 'object') ? o : null; }
  catch(e){ return null; }
}
export function clearLastSession(){ try { localStorage.removeItem(lastSessionKey()); } catch(e){} }
