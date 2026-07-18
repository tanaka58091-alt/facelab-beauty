// ===================================================================
// PROFILES - 講座生ごとの個人データ管理 (localStorage)
// 各講座生は自分の端末に名前付きプロフィールを作り、履歴(snapshots)と
// ヒアリング設定(userPrefs)をプロフィール単位で蓄積していく。
// データはプロフィールIDで名前空間化して保存する:
//   facelab.history.v1::<profileId>
//   facelab.userPrefs.v1::<profileId>
// バックアップ用に JSON 書き出し / 読み込みも提供する。
// ===================================================================

const PROFILES_KEY = 'facelab.profiles.v1';
const ACTIVE_KEY   = 'facelab.activeProfile.v1';
const HISTORY_BASE = 'facelab.history.v1';
const PREFS_BASE   = 'facelab.userPrefs.v1';

function safeRead(key, fallback){
  try { const r = localStorage.getItem(key); return r ? JSON.parse(r) : fallback; }
  catch(e){ return fallback; }
}
function safeWrite(key, val){
  try { localStorage.setItem(key, JSON.stringify(val)); }
  catch(e){ console.warn('[profiles] write failed', e); }
}

export function listProfiles(){ return safeRead(PROFILES_KEY, []); }
function persistProfiles(arr){ safeWrite(PROFILES_KEY, arr); }

function rawActiveId(){
  try { return localStorage.getItem(ACTIVE_KEY); } catch(e){ return null; }
}
export function setActiveProfileId(id){
  try { if (id) localStorage.setItem(ACTIVE_KEY, id); } catch(e){}
}

export function createProfile(name){
  const arr = listProfiles();
  const id = 'p_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const prof = { id, name: (name || '').trim() || '名称未設定', createdAt: new Date().toISOString() };
  arr.push(prof);
  persistProfiles(arr);
  return prof;
}

export function renameProfile(id, name){
  const arr = listProfiles();
  const p = arr.find(x => x.id === id);
  if (p){ p.name = (name || '').trim() || p.name; persistProfiles(arr); }
  return p;
}

export function deleteProfile(id){
  let arr = listProfiles().filter(x => x.id !== id);
  persistProfiles(arr);
  // 名前空間データも削除
  [HISTORY_BASE, PREFS_BASE].forEach(base => {
    try { localStorage.removeItem(`${base}::${id}`); } catch(e){}
  });
  // 最後の1件を消したら既定プロフィールを再生成(ensureInit は _inited ガードで効かないため直接)
  if (arr.length === 0){
    const prof = createProfile('わたし');
    setActiveProfileId(prof.id);
  } else if (rawActiveId() === id){
    setActiveProfileId(arr[0].id);
  }
  return listProfiles();
}

// ===== 初期化 & レガシーデータ移行 =====
let _inited = false;
export function ensureInit(){
  if (_inited) return;
  _inited = true;
  let arr = listProfiles();
  if (arr.length === 0){
    const prof = createProfile('わたし');
    setActiveProfileId(prof.id);
    migrateLegacy(prof.id);
    arr = listProfiles();
  }
  const cur = rawActiveId();
  if (!cur || !arr.find(p => p.id === cur)){
    setActiveProfileId(arr[0].id);
  }
}

// 旧バージョン(名前空間なし)のデータを既定プロフィールに引き継ぐ
function migrateLegacy(id){
  [HISTORY_BASE, PREFS_BASE].forEach(base => {
    try {
      const legacy = localStorage.getItem(base);
      const target = `${base}::${id}`;
      if (legacy && !localStorage.getItem(target)){
        localStorage.setItem(target, legacy);
      }
    } catch(e){}
  });
}

export function getActiveProfileId(){ ensureInit(); return rawActiveId(); }
export function getActiveProfile(){
  const id = getActiveProfileId();
  return listProfiles().find(p => p.id === id) || null;
}

// 名前空間化したキーを返す (progress.js / app.js から利用)
export function ns(baseKey){
  ensureInit();
  const id = rawActiveId();
  return id ? `${baseKey}::${id}` : baseKey;
}
export const HISTORY_KEY_BASE = HISTORY_BASE;
export const PREFS_KEY_BASE   = PREFS_BASE;

// ===== バックアップ書き出し / 読み込み =====
export function exportActiveProfile(){
  const id = getActiveProfileId();
  const prof = getActiveProfile();
  return {
    app: 'facelab',
    kind: 'profileBackup',
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: prof,
    history: safeRead(`${HISTORY_BASE}::${id}`, []),
    prefs:   safeRead(`${PREFS_BASE}::${id}`, null),
  };
}

export function importProfileData(obj){
  if (!obj || obj.kind !== 'profileBackup'){
    throw new Error('FaceLab のバックアップファイルではありません。');
  }
  const baseName = (obj.profile && obj.profile.name) ? obj.profile.name : '読み込み';
  const prof = createProfile(`${baseName}（読込）`);
  // 破損バックアップで進捗描画が例外化しないよう history 要素を検証してから保存
  const cleanHistory = Array.isArray(obj.history)
    ? obj.history.filter(x => x && typeof x === 'object' && typeof x.id === 'string' && x.createdAt)
    : [];
  safeWrite(`${HISTORY_BASE}::${prof.id}`, cleanHistory);
  if (obj.prefs && typeof obj.prefs === 'object') safeWrite(`${PREFS_BASE}::${prof.id}`, obj.prefs);
  setActiveProfileId(prof.id);
  return prof;
}
