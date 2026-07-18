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

// スコア・主要指標・タイプ名から保存メタを構築
export function buildSnapshotMeta({ score, grade, faceType, ageGroup, goal, problems, metrics, percentile }){
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
      return { startDate:j.startDate||null, done:(j.done&&typeof j.done==='object')?j.done:{}, streak:j.streak||0, lastDoneDate:j.lastDoneDate||null };
    }
  } catch(e){}
  return { startDate:null, done:{}, streak:0, lastDoneDate:null };
}
function saveJourney(j){ try { localStorage.setItem(journeyKey(), JSON.stringify(j)); } catch(e){} }

// 今日取り組むDay = 未完了の最小Day(1..30)。全部済みなら30を返す。
export function currentJourneyDay(){
  const j = getJourney();
  for (let d=1; d<=30; d++){ if (!j.done[d]) return d; }
  return 30;
}

export function markDayDone(day){
  const j = getJourney();
  const today = ymd(new Date());
  if (!j.startDate) j.startDate = today;
  if (!j.done[day]){
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
