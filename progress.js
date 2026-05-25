// ===================================================================
// PROGRESS TRACKING - 進捗履歴 (localStorage)
// 解析するたびにスナップショット(サムネ+スコア+主要指標+日時)を保存し、
// タイムライン表示・Before/After スライダー比較を可能にする。
// ===================================================================

const STORAGE_KEY = 'facelab.history.v1';
const MAX_SNAPSHOTS = 30; // 上限(古いものから自動削除)

// 安全に localStorage を扱う(プライベートブラウズで失敗する環境用)
function safeRead(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch(e){ return []; }
}
function safeWrite(arr){
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(arr)); }
  catch(e){ console.warn('[progress] localStorage write failed', e); }
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
  try { return tmp.toDataURL('image/jpeg', 0.72); }
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
  const keys = ['midlineTilt','eyeHeightDiff','browHeightDiff','mouthTilt','jawSlackRatio','mouthCornerDrop','nasolabialDepth','puffinessIdx','wrinkleIdx','toneEvenness'];
  const out = {};
  keys.forEach(k => { if (k in m) out[k] = round3(m[k]); });
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
  safeWrite(arr);
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
  try { localStorage.removeItem(STORAGE_KEY); } catch(e){}
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
