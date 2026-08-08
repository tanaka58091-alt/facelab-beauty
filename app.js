// ===================================================================
// MAIN APP CONTROLLER - FaceLab Beauty
// ===================================================================
import {
  analyzeFace, detectProblems, determineFaceType,
  calcScore, gradeFromScore, buildMetricsList, FM,
} from './analyzer.js';
import { EXERCISES, getMeta, CONTRA_LABEL, TIME_OF_DAY_LABEL, TOOLS_LABEL, PRESCRIPTION_MAP, isExerciseAllowed } from './exercises.js';
import { pickTodayMenu, build30DayProgram } from './program.js';
import { getKnowledgeFor } from './knowledge.js';
import { buildMotionPlayerHTML, initMotionPlayer, buildStepPanelsHTML, buildHowListHTML, MOTION_DEFS } from './motion.js';
import {
  saveSnapshot, listSnapshots, clearHistory, deleteSnapshot,
  thumbnailFromCanvas, buildSnapshotMeta, KEY_METRICS, metricImprovement,
  currentJourneyDay, markDayDone, journeyStats, resetJourney,
  saveLastSession, getLastSession, clearLastSession,
} from './progress.js';
import {
  listProfiles, getActiveProfileId, setActiveProfileId,
  ns as profileNs, PREFS_KEY_BASE, importIntoActiveAccount, exportActiveAccount,
  isValidEmail, signInWithEmail, signOut, isSignedIn,
  getCurrentAccount, accountHasPin, setAccountPin, verifyAccountPin,
} from './profiles.js';

const $  = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

const els = {
  fileFace: $('#file-face'),
  canvasFace: $('#canvas-face'),
  previewFace: $('#preview-face'),
  btnAnalyze: $('#btn-analyze'),
  loader: $('#loader'),
  loaderText: $('#loader-text'),
  results: $('#results'),

  scoreArc: $('#score-arc'),
  scoreValue: $('#score-value'),
  scoreGrade: $('#score-grade'),
  scoreDesc: $('#score-desc'),
  faceType: $('#face-type'),
  faceTypeDesc: $('#face-type-desc'),
  faceTypeTags: $('#face-type-tags'),
  metricsList: $('#metrics-list'),
  overlayFace: $('#overlay-face'),

  problemsList: $('#problems-list'),
  knowledgeGrid: $('#knowledge-grid'),
  todayGrid: $('#today-grid'),
  programGrid: $('#program-grid'),
  phaseTabs: $('#phase-tabs'),

  modal: $('#modal'),
  modalBody: $('#modal-body'),
  btnPrint: $('#btn-print'),
  btnRestart: $('#btn-restart'),

  symptomChips: $('#symptom-chips'),
  symptomFree: $('#symptom-free'),
  symptomSummary: $('#symptom-summary'),
  todayReason: $('#today-reason'),
  programMeta: $('#program-meta'),

  // Progress
  progressStat: $('#progress-stat'),
  progressEmpty: $('#progress-empty'),
  progressTimeline: $('#progress-timeline'),
  btnCompare: $('#btn-compare'),
  btnClearHistory: $('#btn-clear-history'),
  baStage: $('#ba-stage'),
  baBefore: $('#ba-before'),
  baAfter: $('#ba-after'),
  baSlider: $('#ba-slider'),
  baMeta: $('#ba-meta'),
};

// 優先チップ: ⭐トグルボタン(スマホ対応)＋ダブルクリック(PC補助)で is-priority(最大3つ)
document.addEventListener('DOMContentLoaded', () => {
  const chipsRoot = document.getElementById('symptom-chips');
  if (!chipsRoot) return;

  function refreshStar(lbl){
    const star = lbl.querySelector('.chip-star');
    if (!star) return;
    const p = lbl.classList.contains('is-priority');
    star.textContent = p ? '⭐' : '☆';
    star.classList.toggle('on', p);
    star.setAttribute('aria-pressed', p ? 'true' : 'false');
  }
  function togglePriority(lbl){
    const cb = lbl.querySelector('input[type="checkbox"]');
    if (!cb) return;
    if (lbl.classList.contains('is-priority')){
      lbl.classList.remove('is-priority');
    } else {
      if (!cb.checked) cb.checked = true; // 優先にするなら選択も入れる
      const cur = chipsRoot.querySelectorAll('label.chip.is-priority');
      if (cur.length >= 3){ cur[0].classList.remove('is-priority'); refreshStar(cur[0]); } // 一番古い優先を外す
      lbl.classList.add('is-priority');
    }
    refreshStar(lbl);
  }

  // 各チップに ⭐ トグルボタンを付与（スマホのタップでも優先設定できる）
  chipsRoot.querySelectorAll('label.chip').forEach(lbl => {
    if (lbl.querySelector('.chip-star')) return;
    const star = document.createElement('button');
    star.type = 'button';
    star.className = 'chip-star';
    star.textContent = '☆';
    star.setAttribute('aria-label', '特に気になる（優先）に設定');
    star.setAttribute('aria-pressed', 'false');
    lbl.appendChild(star);
  });

  // ⭐ボタンのタップ
  chipsRoot.addEventListener('click', (e) => {
    const star = e.target.closest('.chip-star');
    if (!star) return;
    e.preventDefault(); e.stopPropagation(); // ラベルのチェック切替を止める
    const lbl = star.closest('label.chip');
    if (lbl) togglePriority(lbl);
  });
  // 選択を外したら優先も解除
  chipsRoot.addEventListener('change', (e) => {
    const cb = e.target.closest('input[type="checkbox"]');
    if (!cb || cb.checked) return;
    const lbl = cb.closest('label.chip');
    if (lbl && lbl.classList.contains('is-priority')){ lbl.classList.remove('is-priority'); refreshStar(lbl); }
  });
  // PC向けにダブルクリックも残す
  chipsRoot.addEventListener('dblclick', (e) => {
    const lbl = e.target.closest('label.chip');
    if (!lbl) return;
    e.preventDefault();
    togglePriority(lbl);
  });
});

const state = {
  imgFace: null,
  landmarker: null,
  result: null,
  problems: [],
  program: null,
  currentPhase: 1,
  symptoms: [],
  symptomFree: '',
  ageGroup: '30s',
  timeBudget: 5,        // 1日あたり目安(分): 3 / 5 / 10 / 15
  goal: 'overall',      // 'liftup' | 'symmetry' | 'antiAging' | 'shrink' | 'eyes' | 'overall'
  lifestyle: {          // 生活背景タグ
    sleep: '',          // 'short' | 'normal' | 'long'
    posture: '',        // 'smartphone' | 'desk' | 'normal'
    diet: '',           // 'hardChew' | 'softChew' | 'normal'
    stress: '',         // 'high' | 'mid' | 'low'
  },
  priorityKeys: [],     // ユーザーが選んだ TOP3 のお悩みキー
  contra: [],           // 既往症 ['tmj','skinSensitive','neckProblem','glaucoma','highBp']
  lifeStage: 'none',    // 'none' | 'pregnancy' | 'postpartum' | 'menstrual'
  timeOfDay: 'any',     // 'morning' | 'evening' | 'any' — 練習時間帯の好み
  season: detectSeason(),
};

// 月から季節を自動取得
function detectSeason(){
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5)  return 'spring';
  if (m >= 6 && m <= 8)  return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
}

function userPrefsKey(){ return profileNs(PREFS_KEY_BASE); }
function saveUserPrefs(){
  try {
    localStorage.setItem(userPrefsKey(), JSON.stringify({
      ageGroup: state.ageGroup, timeBudget: state.timeBudget, goal: state.goal,
      lifestyle: state.lifestyle, contra: state.contra,
      lifeStage: state.lifeStage, timeOfDay: state.timeOfDay,
    }));
  } catch {}
}
function loadUserPrefs(){
  try {
    const raw = localStorage.getItem(userPrefsKey());
    if (!raw) return;
    const p = JSON.parse(raw);
    if (p.ageGroup)  state.ageGroup  = p.ageGroup;
    if (p.timeBudget) state.timeBudget = p.timeBudget;
    if (p.goal)      state.goal      = p.goal;
    if (p.lifestyle) Object.assign(state.lifestyle, p.lifestyle);
    if (Array.isArray(p.contra)) state.contra = p.contra;
    if (p.lifeStage) state.lifeStage = p.lifeStage;
    if (p.timeOfDay) state.timeOfDay = p.timeOfDay;
  } catch {}
}

// ===== Symptom → Problem mapping (30 symptoms) =====
const SYMPTOM_MAP = {
  // 左右差
  asymEye:      { label:'目の左右差',           keys:['facialAsymmetry'], group:'左右差' },
  asymMouth:    { label:'口角の左右差',         keys:['facialAsymmetry','mouthCornerDown'], group:'左右差' },
  asymBrow:     { label:'眉の高さの左右差',     keys:['facialAsymmetry'], group:'左右差' },
  asymCheek:    { label:'頬の張り方の左右差',   keys:['facialAsymmetry','masseterHypertrophy'], group:'左右差' },
  // たるみ・輪郭
  sagJaw:       { label:'フェイスラインのたるみ', keys:['jawSagging'], group:'たるみ・輪郭' },
  doubleChin:   { label:'二重あご',             keys:['jawSagging'], group:'たるみ・輪郭' },
  sagCheek:     { label:'頬のたるみ',           keys:['jawSagging','nasolabialFold'], group:'たるみ・輪郭' },
  marionette:   { label:'マリオネットライン',   keys:['mouthCornerDown','jawSagging'], group:'たるみ・輪郭' },
  // ほうれい線・口元
  nasolabial:   { label:'ほうれい線',           keys:['nasolabialFold'], group:'口元' },
  mouthDown:    { label:'口角下がり',           keys:['mouthCornerDown'], group:'口元' },
  thinUpperLip: { label:'上唇が薄い・薄くなった', keys:['longPhiltrum','mouthCornerDown'], group:'口元' },
  longPhiltrum: { label:'人中が長く見える',     keys:['longPhiltrum'], group:'口元' },
  gummy:        { label:'笑うと歯茎が出る(ガミー)', keys:['gummySmile'], group:'口元' },
  // むくみ・循環
  eyeBag:       { label:'目の下のたるみ・くま', keys:['puffiness'], group:'むくみ' },
  puffyMorning: { label:'朝のむくみ',           keys:['puffiness'], group:'むくみ' },
  roundFace:    { label:'丸顔・小顔になりたい', keys:['puffiness','jawSagging'], group:'むくみ' },
  dullSkin:     { label:'顔色がくすむ',         keys:['puffiness'], group:'むくみ' },
  // 目元
  smallEye:     { label:'目を大きく見せたい',   keys:['hoodedEyelid','puffiness'], group:'目元' },
  hoodedEye:    { label:'まぶたが重い・厚い',   keys:['hoodedEyelid'], group:'目元' },
  droopyEye:    { label:'目尻が下がる',         keys:['droopyEyeOuter'], group:'目元' },
  oneEyeSmall:  { label:'片目だけ小さい',       keys:['facialAsymmetry','hoodedEyelid'], group:'目元' },
  // エラ・咬筋
  bruxism:      { label:'食いしばり・噛み癖',   keys:['masseterHypertrophy','facialAsymmetry'], group:'エラ' },
  jawAngular:   { label:'エラが張っている',     keys:['masseterHypertrophy'], group:'エラ' },
  hardCheek:    { label:'頬・側頭部が固い',     keys:['masseterHypertrophy','templeHollow'], group:'エラ' },
  // 痩せ・凹み
  flatCheek:    { label:'頬がコケて見える',     keys:['cheekHollow','nasolabialFold'], group:'凹み' },
  templeHollow: { label:'こめかみが凹む',       keys:['templeHollow'], group:'凹み' },
  // シワ
  foreheadWrinkle: { label:'額の横ジワ',         keys:['foreheadLines'], group:'シワ' },
  glabellarWrinkle:{ label:'眉間のタテジワ',     keys:['glabellarLines'], group:'シワ' },
  crowsFeet:    { label:'目尻の小ジワ',         keys:['droopyEyeOuter'], group:'シワ' },
  // バランス
  partsBalance: { label:'パーツのバランスが気になる', keys:['partsBalance'], group:'印象' },
};

// 自由記述 → 問題キー抽出
const KEYWORD_MAP = [
  { pat:/エラ|咬筋|噛み[しじ]め|食いしば/, key:'masseterHypertrophy' },
  { pat:/ガミ|歯[茎ぐき]/, key:'gummySmile' },
  { pat:/頬[がコこ]+ケ|こけて|頬の凹/, key:'cheekHollow' },
  { pat:/こめかみ|側頭部の凹/, key:'templeHollow' },
  { pat:/人中/, key:'longPhiltrum' },
  { pat:/まぶた|瞼|一重|奥二重/, key:'hoodedEyelid' },
  { pat:/目尻[がの]?下|たれ目/, key:'droopyEyeOuter' },
  { pat:/額.*シワ|おでこ.*シワ|前頭.*シワ/, key:'foreheadLines' },
  { pat:/眉間/, key:'glabellarLines' },
  { pat:/むくみ|浮腫|腫れ/, key:'puffiness' },
  { pat:/たるみ|フェイスライン|二重あご|二重顎/, key:'jawSagging' },
  { pat:/ほうれい|法令線/, key:'nasolabialFold' },
  { pat:/口角[がの]?下|への字/, key:'mouthCornerDown' },
  { pat:/左右差|非対称|歪み|ゆがみ/, key:'facialAsymmetry' },
  { pat:/小顔|顔.{0,3}大き/, key:'puffiness' },
];

function extractKeysFromText(text){
  if (!text) return [];
  const out = new Set();
  KEYWORD_MAP.forEach(({pat, key}) => { if (pat.test(text)) out.add(key); });
  return Array.from(out);
}

// 症状から導かれた追加問題のメタ (16カテゴリ)
const SYMPTOM_PROBLEM_META = {
  facialAsymmetry: { title:'顔の左右非対称', desc:'お悩みから推定。表情筋の使い方の偏り・噛み癖などが背景にある可能性が高いです。', tissues:{tight:['側頭筋(片側)','咬筋(片側)','広頸筋'], weak:['口角挙筋(反対側)','大頬骨筋(反対側)']} },
  mouthCornerDown: { title:'口角下がり', desc:'お悩みから推定。口角挙筋・大頬骨筋の弱化と、口角下制筋の過緊張が起こりやすい状態です。', tissues:{tight:['口角下制筋','下唇下制筋','広頸筋'], weak:['口角挙筋','大頬骨筋','小頬骨筋']} },
  nasolabialFold:  { title:'ほうれい線・頬下垂', desc:'お悩みから推定。中顔面の筋肉の弱化と頬脂肪体の下垂が起こりやすい状態です。', tissues:{tight:['咬筋','口輪筋'], weak:['大頬骨筋','上唇挙筋','上唇鼻翼挙筋']} },
  jawSagging:      { title:'フェイスラインのたるみ', desc:'お悩みから推定。広頸筋・咬筋の過緊張と、舌骨上筋群・首前面の弱化が要因です。', tissues:{tight:['広頸筋','咬筋','胸鎖乳突筋'], weak:['舌骨上筋群','顎二腹筋','頬筋']} },
  puffiness:       { title:'顔のむくみ', desc:'お悩みから推定。リンパの停滞と表情筋の循環不足が背景となります。', tissues:{tight:['咬筋','広頸筋'], weak:['眼輪筋','頬筋','顎二腹筋']} },
  partsBalance:    { title:'パーツバランスのズレ', desc:'お悩みから推定。骨格は変えられませんが、表情筋と姿勢で印象を整えられます。', tissues:{tight:['咬筋','側頭筋'], weak:['前頭筋','眼輪筋','大頬骨筋']} },
  masseterHypertrophy: { title:'咬筋肥大・エラ張り', desc:'お悩みから推定。食いしばり・片噛みで咬筋が肥大し、輪郭の張りやこめかみ陥凹を引き起こします。', tissues:{tight:['咬筋','側頭筋','広頸筋'], weak:['舌','頬筋','口角挙筋']} },
  cheekHollow:     { title:'頬コケ・中顔面の痩せ', desc:'お悩みから推定。頬筋・大頬骨筋の萎縮と脂肪減少で中顔面が陥凹して見える状態です。', tissues:{tight:['咬筋','口輪筋'], weak:['頬筋','大頬骨筋','上唇挙筋']} },
  longPhiltrum:    { title:'人中の伸び・上唇下垂', desc:'お悩みから推定。上唇挙筋・口輪筋上部の弱化、口呼吸習慣で人中が長く見えます。', tissues:{tight:['口輪筋下部','下唇下制筋'], weak:['上唇挙筋','上唇鼻翼挙筋','口輪筋上部']} },
  gummySmile:      { title:'ガミースマイル', desc:'お悩みから推定。上唇挙筋・小頬骨筋の過剰活動で上唇が引き上がりすぎる状態です。', tissues:{tight:['上唇挙筋','小頬骨筋'], weak:['口輪筋上部','上唇']} },
  hoodedEyelid:    { title:'まぶたの重さ・厚み', desc:'お悩みから推定。眼瞼挙筋の弱化と前頭筋の代償が起こりやすい状態です。', tissues:{tight:['皺眉筋','眼輪筋外側'], weak:['眼瞼挙筋','前頭筋','眼輪筋上部']} },
  droopyEyeOuter:  { title:'目尻下がり', desc:'お悩みから推定。眼輪筋外側と側頭筋膜のテンション低下が背景です。', tissues:{tight:['頬骨筋'], weak:['眼輪筋外側','側頭筋膜']} },
  templeHollow:    { title:'こめかみ陥凹', desc:'お悩みから推定。側頭筋疲労と循環低下で組織が萎縮して見えます。', tissues:{tight:['側頭筋','咬筋'], weak:['前頭筋外側']} },
  foreheadLines:   { title:'額の横ジワ', desc:'お悩みから推定。前頭筋の使い癖と眼瞼挙筋の代償が原因です。', tissues:{tight:['前頭筋'], weak:['眼瞼挙筋','眼輪筋上部']} },
  glabellarLines:  { title:'眉間の縦ジワ', desc:'お悩みから推定。皺眉筋・鼻根筋の収縮癖が刻まれた状態です。', tissues:{tight:['皺眉筋','鼻根筋'], weak:['前頭筋中央']} },
};

function buildSymptomProblemKeys(){
  const added = new Set();
  const out = [];
  state.symptoms.forEach(sym => {
    const def = SYMPTOM_MAP[sym]; if (!def) return;
    def.keys.forEach(k => {
      if (added.has(k)) return;
      added.add(k);
      out.push(k);
    });
  });
  // 自由記述からの抽出
  extractKeysFromText(state.symptomFree).forEach(k => {
    if (added.has(k)) return;
    added.add(k);
    out.push(k);
  });
  return out;
}

// 優先度に基づいて problems を並び替える(priorityKeys → severity → 残り)
function reorderProblems(problems){
  const priority = new Set(state.priorityKeys);
  const sevRank = { high:0, mid:1, low:2 };
  return problems.slice().sort((a,b) => {
    const pa = priority.has(a.key) ? 0 : 1;
    const pb = priority.has(b.key) ? 0 : 1;
    if (pa !== pb) return pa - pb;
    return (sevRank[a.severity] ?? 3) - (sevRank[b.severity] ?? 3);
  });
}

function collectHearing(){
  const ageEl  = document.querySelector('input[name="ageGroup"]:checked');
  const timeEl = document.querySelector('input[name="timeBudget"]:checked');
  const goalEl = document.querySelector('input[name="goal"]:checked');
  if (ageEl)  state.ageGroup  = ageEl.value;
  if (timeEl) state.timeBudget = +timeEl.value;
  if (goalEl) state.goal      = goalEl.value;
  ['sleep','posture','diet','stress'].forEach(g => {
    const el = document.querySelector(`input[name="${g}"]:checked`);
    if (el) state.lifestyle[g] = el.value;
  });
  // 既往症 (multi)
  state.contra = Array.from(document.querySelectorAll('input[name="contra"]:checked')).map(el => el.value);
  // ライフステージ
  const lsEl = document.querySelector('input[name="lifeStage"]:checked');
  if (lsEl) state.lifeStage = lsEl.value;
  // 妊娠中・産後は自動で禁忌に追加
  if (state.lifeStage === 'pregnancy' || state.lifeStage === 'postpartum') {
    if (!state.contra.includes('pregnancy')) state.contra = [...state.contra, 'pregnancy'];
  }
  // 時間帯
  const todEl = document.querySelector('input[name="timeOfDay"]:checked');
  if (todEl) state.timeOfDay = todEl.value;
  // 季節は自動再計算
  state.season = detectSeason();
  // 永続化
  saveUserPrefs();
  // 優先度: チップで .is-priority クラスが付いている上位3つ
  state.priorityKeys = [];
  const seen = new Set();
  document.querySelectorAll('#symptom-chips label.is-priority').forEach(lbl => {
    const cb = lbl.querySelector('input[type="checkbox"]');
    if (!cb || !cb.checked) return;
    const def = SYMPTOM_MAP[cb.value]; if (!def) return;
    def.keys.forEach(k => {
      if (seen.has(k)) return;
      seen.add(k);
      state.priorityKeys.push(k);
    });
  });
  state.priorityKeys = state.priorityKeys.slice(0, 3);
}
function makeSymptomProblem(key){
  const meta = SYMPTOM_PROBLEM_META[key] || SYMPTOM_PROBLEM_META.facialAsymmetry;
  return {
    key,
    severity:'mid',
    title: meta.title,
    description: meta.desc,
    tissues: meta.tissues,
    metric: 'お悩みベース',
    fromSymptom: true,
  };
}

// ===================================================================
// FILE INPUT
// ===================================================================
function setupFileInput(){
  const input = els.fileFace;
  const canvas = els.canvasFace;
  const preview = els.previewFace;
  const dropLabel = document.querySelector(`label[data-target="${input.id}"]`);

  ['dragover','dragleave','drop'].forEach(ev => {
    dropLabel.addEventListener(ev, e => {
      e.preventDefault();
      if (ev==='dragover') dropLabel.classList.add('is-drag');
      else dropLabel.classList.remove('is-drag');
      if (ev==='drop' && e.dataTransfer.files.length){
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event('change'));
      }
    });
  });

  input.addEventListener('change', () => {
    // ドラッグ&ドロップ等でのすり抜け防止: 未サインインなら保存先が無いためゲートへ
    if (!isSignedIn()){ input.value = ''; showSigninGate('email'); return; }
    const f = input.files[0]; if (!f) return;
    const url = URL.createObjectURL(f);
    const img = new Image();
    img.onload = () => {
      const maxW = 500;
      const ratio = Math.min(1, maxW / img.width);
      canvas.width  = img.width * ratio;
      canvas.height = img.height * ratio;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      preview.hidden = false;
      state.imgFace = img;
      updateAnalyzeBtn();
      // 入力中の1〜2分を使ってAIモデル(約13MB)を裏で先読み → 解析ボタンで待たせない
      preloadLandmarker();
    };
    img.src = url;
  });
}
setupFileInput();

function updateAnalyzeBtn(){ els.btnAnalyze.disabled = !state.imgFace; updateStickyCta(); }

// ===== スティッキー解析CTA =====
// 写真→解析ボタンはスマホで約3.6画面分離れている(70入力項目が間にある)ため、
// 写真選択後は画面下に固定ボタンを出して、どこからでも1タップで解析できるようにする。
// 表示条件: 写真あり・未解析(結果非表示)・ローダー非表示・本物のボタンが画面外・ゲート非表示
const stickyCta = document.getElementById('sticky-cta');
// 本物の解析ボタンが画面内にあるか(重複表示の回避)。IntersectionObserverは
// 環境により発火しないことがあるため、rect直接計算＋scrollイベントで確実に判定する。
function isAnalyzeBtnInView(){
  const r = els.btnAnalyze.getBoundingClientRect();
  return r.top < window.innerHeight - 10 && r.bottom > 0;
}
function updateStickyCta(){
  if (!stickyCta) return;
  const gate = document.getElementById('signin-gate');
  const gateOpen = !!(gate && !gate.hidden);
  const show = !!state.imgFace && els.results.hidden && els.loader.hidden
            && !els.btnAnalyze.disabled && !isAnalyzeBtnInView() && !gateOpen;
  stickyCta.hidden = !show;
}
// スロットルは setTimeout を使用(requestAnimationFrame は WebView 等で
// 発火しない環境があり、詰まると以後の更新が全て止まるため)
let _ctaTick = false;
function _ctaOnScroll(){
  if (_ctaTick) return;
  _ctaTick = true;
  setTimeout(() => { _ctaTick = false; updateStickyCta(); }, 120);
}
window.addEventListener('scroll', _ctaOnScroll, { passive: true });
window.addEventListener('resize', _ctaOnScroll, { passive: true });
const _stickyBtn = document.getElementById('sticky-analyze');
if (_stickyBtn) _stickyBtn.addEventListener('click', () => els.btnAnalyze.click());

function collectSymptoms(){
  state.symptoms = Array.from(
    els.symptomChips.querySelectorAll('input[type="checkbox"]:checked')
  ).map(el => el.value);
  state.symptomFree = (els.symptomFree.value || '').trim();
}

// ===================================================================
// MEDIAPIPE FACE LANDMARKER
// ===================================================================
// モデル読み込みの実体（UIを触らない純粋な処理）
async function createLandmarker(){
  const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/vision_bundle.mjs');
  const fileset = await vision.FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
  );
  return vision.FaceLandmarker.createFromOptions(fileset, {
    baseOptions: {
      modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
      delegate: 'GPU',
    },
    runningMode: 'IMAGE',
    numFaces: 1,
    minFaceDetectionConfidence: 0.5,
    minFacePresenceConfidence: 0.5,
    minTrackingConfidence: 0.5,
    outputFacialTransformationMatrixes: false,
    outputFaceBlendshapes: false,
  });
}

// メモ化promiseで多重呼び出しを1本化。
// 写真選択時に silent:true で先読みしておくと、解析ボタンを押した時には
// モデル(約13MB)のダウンロードが終わっていて待ちゼロで解析が始まる。
let _landmarkerPromise = null;
async function loadLandmarker({ silent = false } = {}){
  if (state.landmarker) return state.landmarker;   // 取得済み(テストスタブ含む)
  if (!_landmarkerPromise){
    _landmarkerPromise = createLandmarker();
  }
  try {
    const lm = await _landmarkerPromise;
    state.landmarker = lm;
    return lm;
  } catch (e){
    _landmarkerPromise = null;   // 失敗はリセットして次回(ボタン押下時)に再試行できるように
    if (silent) throw e;         // 先読み失敗は呼び出し元で握りつぶす
    const err = new Error('MODEL_LOAD_FAILED');
    err.cause = e;
    throw err;
  }
}

// 写真を選んだ瞬間に裏で先読み開始（悩み・ヒアリング入力中にDLが終わる）。
// 失敗しても何も出さない（解析ボタン押下時に通常経路で再試行される）。
function preloadLandmarker(){
  loadLandmarker({ silent: true }).catch(() => {});
}

async function detectFace(image){
  const lm = await loadLandmarker();
  const result = lm.detect(image);
  if (!result.faceLandmarks || result.faceLandmarks.length === 0) return null;
  return result.faceLandmarks[0]; // 468 landmarks
}

// ===================================================================
// LOADER
// ===================================================================
function setLoader(text){
  els.loader.hidden = false;
  els.loaderText.textContent = text;
  els.btnAnalyze.disabled = true;
  updateStickyCta();
}
function hideLoader(){
  els.loader.hidden = true;
  els.btnAnalyze.disabled = false;
  updateStickyCta();
}

// ===================================================================
// ANALYZE FLOW
// ===================================================================
els.btnAnalyze.addEventListener('click', async () => {
  if (!isSignedIn()){ showSigninGate('email'); return; }
  try {
    // 先読みが済んでいれば即解析。まだならモデル読み込み中である旨を正直に表示
    setLoader(state.landmarker
      ? '顔写真を解析中… 468点のランドマークを検出しています'
      : 'AIの準備をしています…（初回のみ・少し時間がかかります）');
    const lms = await detectFace(state.imgFace);
    if (!lms){
      hideLoader();
      // 行き止まりにしない: 原因のチェックリスト+その場で写真を選び直せる導線を出す
      const reselect = await uiConfirm({
        title: '顔を見つけられませんでした',
        message: `写真の条件が原因のことがほとんどで、<strong>あなたの顔のせいではありません</strong>。<br>次の4点をチェックして、もう一度お試しください：
          <ul style="margin:10px 0 0; padding-left:20px; line-height:2;">
            <li>💡 <strong>明るい場所</strong>で（逆光・夜の室内はNG）</li>
            <li>😐 <strong>正面</strong>を向く（斜め・うつむきはNG）</li>
            <li>🔍 顔が<strong>画面に大きく</strong>写るように</li>
            <li>👓 <strong>メガネ・前髪・マスク</strong>は外して</li>
          </ul>`,
        okText: '写真を選び直す',
        cancelText: '閉じる',
      });
      if (reselect && els.fileFace) els.fileFace.click();  // その場でファイル選択を再オープン
      return;
    }
    state.result = analyzeFace(lms, { image: state.imgFace });
    // 解析警告を表示 (照明・表情・ヨー)
    surfaceAnalysisWarnings(state.result.warnings || []);

    setLoader('問題点を抽出 → 30日プログラムを構築中…');
    collectSymptoms();
    collectHearing();
    state.problems = detectProblems(state.result, { ageGroup: state.ageGroup });

    // 症状ベース・自由記述ベースで補完
    const symptomKeys = buildSymptomProblemKeys();
    const existing = new Set(state.problems.map(p => p.key));
    symptomKeys.forEach(k => {
      if (existing.has(k)) return;
      state.problems.push(makeSymptomProblem(k));
    });
    if (state.problems.length > 1){
      state.problems = state.problems.filter(p => p.key !== 'general');
    }
    // 優先度順に並び替え
    state.problems = reorderProblems(state.problems);
    state.program = build30DayProgram(state.problems.map(p=>p.key), {
      timeBudget: state.timeBudget,
      goal: state.goal,
      priorityKeys: state.priorityKeys,
      ageGroup: state.ageGroup,
      lifestyle: state.lifestyle,
      contra: state.contra,
      lifeStage: state.lifeStage,
      timeOfDay: state.timeOfDay,
      season: state.season,
      history: listSnapshots(),
    });

    renderAll();
    // 履歴を保存 (サムネ+スコア+メタ)
    try {
      const score = calcScore(state.result, state.problems);
      const { grade, percentile } = gradeFromScore(score, { ageGroup: state.ageGroup });
      const type = determineFaceType(state.problems, state.result.metrics);
      const thumb = thumbnailFromCanvas(els.canvasFace, 480);
      const meta = buildSnapshotMeta({
        score, grade, percentile,
        faceType: type.name,
        ageGroup: state.ageGroup,
        goal: state.goal,
        problems: state.problems,
        metrics: state.result.metrics,
      });
      saveSnapshot({ thumbDataUrl: thumb, meta });
      // 前回セッションを保存(写真なしで結果・プログラムを再表示できるように)
      persistLastSession({ score, grade, percentile, faceTypeName: type.name, thumb });
      renderProgress();
    } catch(e){ console.warn('[progress] save failed', e); }
    renderResumeBanner();

    hideLoader();
    els.results.hidden = false;
    els.results.classList.add('fade-in');
    updateStickyCta();
    setTimeout(() => els.results.scrollIntoView({behavior:'smooth', block:'start'}), 100);

  } catch (e){
    console.error(e);
    hideLoader(); // ボタンを再度押せる状態に戻す（＝再試行できる）
    if (e && e.message === 'MODEL_LOAD_FAILED'){
      const retry = await uiConfirm({
        title: 'AIの準備ができませんでした',
        message: `通信環境（Wi-Fi・モバイル回線）をご確認のうえ、もう一度お試しください。<br><small>社内ネットワーク等で通信が制限されている場合は、別の回線でお試しください。</small>`,
        okText: 'もう一度試す',
        cancelText: '閉じる',
      });
      if (retry) els.btnAnalyze.click();  // 1タップで再試行
    } else {
      uiAlert({ title: '解析中にエラーが発生しました', message: `もう一度お試しください。<br><small>${escapeHtml(e && e.message ? e.message : '')}</small>` });
    }
  }
});

// ===================================================================
// RENDER
// ===================================================================
function renderAll(){
  renderScoreAndType();
  renderMetrics();
  renderOverlay();
  renderSymptomSummary();
  renderSideScores();
  renderProblems();
  renderPrescriptionLink();
  renderKnowledge();
  renderToday();
  renderProgramMeta();
  renderProgram(state.currentPhase);
  renderProgress();
}

// ===== 前回セッションの保存・復元（写真なしで結果・プログラムを再表示） =====
function persistLastSession({ score, grade, percentile, faceTypeName, thumb }){
  const r = state.result || {};
  saveLastSession({
    createdAt: new Date().toISOString(),
    score, grade, percentile, faceTypeName,
    problems: state.problems,
    result: { metrics: r.metrics, sideScores: r.sideScores, warnings: r.warnings, rollDeg: r.rollDeg, yaw: r.yaw, expression: r.expression },
    landmarksRaw: r.landmarksRaw,
    thumb,
    symptoms: state.symptoms, symptomFree: state.symptomFree,
    prefs: {
      ageGroup: state.ageGroup, timeBudget: state.timeBudget, goal: state.goal,
      priorityKeys: state.priorityKeys, lifestyle: state.lifestyle, contra: state.contra,
      lifeStage: state.lifeStage, timeOfDay: state.timeOfDay, season: state.season,
    },
  });
}

async function restoreLastSession(){
  const s = getLastSession();
  if (!s){ return; }
  const p = s.prefs || {};
  state.ageGroup = p.ageGroup || state.ageGroup;
  state.timeBudget = p.timeBudget || state.timeBudget;
  state.goal = p.goal || state.goal;
  state.priorityKeys = p.priorityKeys || [];
  state.lifestyle = Object.assign({}, state.lifestyle, p.lifestyle || {});
  state.contra = p.contra || [];
  state.lifeStage = p.lifeStage || 'none';
  state.timeOfDay = p.timeOfDay || 'any';
  state.season = p.season || state.season;
  state.symptoms = s.symptoms || [];
  state.symptomFree = s.symptomFree || '';
  state.result = { ...(s.result || {}), landmarksRaw: s.landmarksRaw };
  state.problems = s.problems || [];
  // overlay 用の画像をサムネから復元（無ければオーバーレイは自動で非表示）
  state.imgFace = null;
  if (s.thumb){
    await new Promise(res => { const img = new Image(); img.onload = () => { state.imgFace = img; res(); }; img.onerror = res; img.src = s.thumb; });
  }
  state.program = build30DayProgram(state.problems.map(pr => pr.key), {
    timeBudget: state.timeBudget, goal: state.goal, priorityKeys: state.priorityKeys,
    ageGroup: state.ageGroup, lifestyle: state.lifestyle, contra: state.contra,
    lifeStage: state.lifeStage, timeOfDay: state.timeOfDay, season: state.season,
    history: listSnapshots(),
  });
  surfaceAnalysisWarnings(state.result.warnings || []);
  renderAll();
  els.results.hidden = false;
  els.results.classList.add('fade-in');
  updateStickyCta();
  setTimeout(() => els.results.scrollIntoView({ behavior:'smooth', block:'start' }), 100);
}

// 起動時・プロフィール切替時: 前回の診断があれば「続きを見る」バナーを出す
function renderResumeBanner(){
  const host = document.getElementById('resume-banner');
  if (!host) return;
  const s = getLastSession();
  if (!s){ host.hidden = true; host.innerHTML = ''; return; }
  const d = new Date(s.createdAt);
  const dateStr = `${d.getMonth()+1}/${d.getDate()}`;
  const dayNum = currentJourneyDay();
  host.hidden = false;
  host.innerHTML = `
    <div class="resume-inner">
      <div class="resume-text">
        <span class="resume-title">📋 前回の診断があります</span>
        <span class="resume-sub">${dateStr}・スコア ${s.score ?? '--'}${s.faceTypeName ? `（${escapeHtml(s.faceTypeName)}）` : ''}・今日は Day ${dayNum}/30</span>
      </div>
      <button class="resume-btn" id="resume-btn" type="button">続きを見る（写真不要）→</button>
    </div>
    <div class="resume-note">📸 新しく診断する場合は、下の写真アップロードへ。</div>`;
  const btn = document.getElementById('resume-btn');
  if (btn) btn.addEventListener('click', () => restoreLastSession());
}

// 解析警告のレンダリング (照明・表情・ヨー)
function surfaceAnalysisWarnings(warnings){
  const host = document.getElementById('analysis-warnings');
  if (!host) return;
  if (!warnings || warnings.length === 0){ host.hidden = true; host.innerHTML = ''; return; }
  host.hidden = false;
  host.innerHTML = warnings.map(w => `
    <div class="analysis-warning ${w.severity || 'mid'}">
      <span class="aw-ico">${w.kind==='lighting'?'💡':w.kind==='yaw'?'↪':w.kind==='expression'?'😊':'⚠'}</span>
      <span class="aw-msg">${w.message}</span>
    </div>
  `).join('');
}

// 左右独立スコアのレンダリング (Phase 3-12)
function renderSideScores(){
  const host = document.getElementById('side-scores');
  if (!host) return;
  const s = state.result?.sideScores;
  if (!s){ host.hidden = true; host.innerHTML = ''; return; }
  host.hidden = false;
  const labels = { eye:'目', naso:'ほうれい線', corner:'口角', browLid:'眉まぶた', eyeSlant:'目尻', jaw:'頬下垂' };
  const row = (side, data) => {
    const items = Object.entries(labels).map(([k,lbl]) => {
      const v = Math.round(data[k]);
      const cls = v >= 70 ? 'good' : v >= 45 ? 'mid' : 'bad';
      return `<li class="ss-item ${cls}"><span class="ss-lbl">${lbl}</span><span class="ss-val">${v}</span></li>`;
    }).join('');
    const overall = Math.round(data.overall);
    return `
      <div class="ss-side">
        <div class="ss-side-head">
          <span class="ss-side-name">${side}</span>
          <span class="ss-side-overall">${overall}</span>
        </div>
        <ul class="ss-list">${items}</ul>
      </div>`;
  };
  // 顔の向かって左 = 写真の右、向かって右 = 写真の左 (一般ユーザー向けに見た目で表記)
  const lr = Math.round(s.left.overall - s.right.overall);
  const diffNote = Math.abs(lr) >= 8
    ? `<div class="ss-diff-note">左右差: <strong>${Math.abs(lr)}pt</strong>（${lr>0?'左側':'右側'}がやや高評価）</div>`
    : `<div class="ss-diff-note">左右差: ${Math.abs(lr)}pt（バランス良好）</div>`;
  host.innerHTML = `
    <h3 class="ss-title">📐 左右独立スコア</h3>
    <p class="ss-sub">部位ごとに左右別の0-100スコア。差が大きいほど非対称が強いことを示します。</p>
    <div class="ss-grid">
      ${row('左', s.left)}
      ${row('右', s.right)}
    </div>
    ${diffNote}
  `;
}

// ===== お悩み → 効く顔トレ の明示連動 (③) =====
function renderPrescriptionLink(){
  const host = document.getElementById('prescription-link');
  if (!host) return;
  const probs = (state.problems || []).filter(p => p.key && p.key !== 'general');
  if (!probs.length){ host.hidden = true; host.innerHTML = ''; return; }
  const prioritySet = new Set(state.priorityKeys || []);
  // 優先お悩みを前に
  const ordered = [...probs].sort((a, b) =>
    (prioritySet.has(b.key) ? 1 : 0) - (prioritySet.has(a.key) ? 1 : 0));

  const cards = ordered.slice(0, 6).map(p => {
    const map = PRESCRIPTION_MAP[p.key];
    const ids = (map ? map.training : [])
      .filter(id => EXERCISES[id] && isExerciseAllowed(id, state.contra))
      .slice(0, 4);
    if (!ids.length) return '';
    const chips = ids.map(id =>
      `<button class="rx-ex" data-ex="${id}" type="button">${EXERCISES[id].name}</button>`).join('');
    const star = prioritySet.has(p.key) ? '<span class="rx-star">⭐優先</span>' : '';
    return `
      <div class="rx-card${prioritySet.has(p.key) ? ' is-priority' : ''}">
        <div class="rx-problem">${escapeHtml(p.title || p.key)}${star}</div>
        <div class="rx-arrow">この悩みに効く顔トレ ↓</div>
        <div class="rx-exs">${chips}</div>
      </div>`;
  }).filter(Boolean).join('');

  if (!cards){ host.hidden = true; host.innerHTML = ''; return; }

  const freeNote = state.symptomFree
    ? `<p class="rx-free">📝 あなたの記述「${escapeHtml(state.symptomFree)}」もキーワード解析して処方に反映しています。</p>`
    : '';
  host.hidden = false;
  host.innerHTML = `
    <div class="rx-head">
      <h3>🎯 あなたのお悩み → 効く顔トレ</h3>
      <p class="muted">気になるお悩みに<strong>直結する顔トレだけ</strong>を自動で選びました。種目名をタップすると、やり方が見られます。</p>
    </div>
    ${freeNote}
    <div class="rx-grid">${cards}</div>
  `;
  host.querySelectorAll('.rx-ex').forEach(b => {
    b.addEventListener('click', () => {
      const ex = EXERCISES[b.dataset.ex];
      if (ex) openExerciseModal(ex);
    });
  });
}

// ===== Progress (履歴) =====
// 進捗で見せる指標は progress.js の KEY_METRICS が正本(キー名は analyzer と一致)
const METRIC_LABEL = Object.fromEntries(KEY_METRICS.map(m => [m.key, m.label]));
const METRIC_DIR   = Object.fromEntries(KEY_METRICS.map(m => [m.key, m.dir]));
function renderProgress(){
  const snaps = listSnapshots();
  if (els.progressStat) els.progressStat.textContent = `履歴: ${snaps.length}件`;
  if (els.btnCompare) els.btnCompare.disabled = snaps.length < 2;
  if (!els.progressTimeline) return;
  if (snaps.length === 0){
    els.progressEmpty.hidden = false;
    els.progressTimeline.innerHTML = '';
    const trendHost = document.getElementById('score-trend');
    if (trendHost){ trendHost.hidden = true; trendHost.innerHTML = ''; }
    if (els.baStage) els.baStage.hidden = true;
    return;
  }
  els.progressEmpty.hidden = true;
  renderScoreTrend(snaps);
  els.progressTimeline.innerHTML = snaps.map((s, i) => progressItemHTML(s, i, snaps.length)).join('');
  els.progressTimeline.querySelectorAll('.progress-item').forEach(it => {
    it.addEventListener('click', e => {
      if (e.target.closest('.progress-del')) return;
      // クリックで最新と比較表示
      const id = it.dataset.id;
      const other = snaps.find(x => x.id === id);
      const latest = snaps[0];
      if (!other || other.id === latest.id) return;
      showBeforeAfter(other, latest);
    });
  });
  els.progressTimeline.querySelectorAll('.progress-del').forEach(b => {
    b.addEventListener('click', e => {
      e.stopPropagation();
      const id = b.dataset.id;
      deleteSnapshot(id);
      renderProgress();
    });
  });
}
function progressItemHTML(s, i, total){
  const date = new Date(s.createdAt);
  const dateStr = `${date.getMonth()+1}/${date.getDate()} ${String(date.getHours()).padStart(2,'0')}:${String(date.getMinutes()).padStart(2,'0')}`;
  const badge = i === 0 ? '<span class="progress-badge latest">最新</span>' : '';
  const thumb = s.thumb
    ? `<img class="progress-thumb" src="${s.thumb}" alt="snapshot"/>`
    : `<div class="progress-thumb noimg">no img</div>`;
  return `
    <div class="progress-item" data-id="${s.id}">
      ${thumb}
      <div class="progress-meta">
        <div class="progress-score">${s.score ?? '--'}<small>/100</small> <span class="progress-grade">${s.grade ?? ''}</span> ${badge}</div>
        <div class="progress-date">${dateStr}</div>
        <div class="progress-type">${s.faceType ?? ''}</div>
      </div>
      <button class="progress-del" data-id="${s.id}" title="削除" aria-label="この履歴を削除">×</button>
    </div>
  `;
}
// ===== スコア推移グラフ (② 変化を追える) =====
// snaps は最新→古い順。チャートは古い→最新で描画する。
function renderScoreTrend(snapsNewestFirst){
  const host = document.getElementById('score-trend');
  if (!host) return;
  const snaps = (snapsNewestFirst || []).slice().reverse(); // 古い→最新
  const pts = snaps.filter(s => typeof s.score === 'number');
  if (pts.length < 2){
    host.hidden = true; host.innerHTML = '';
    return;
  }
  host.hidden = false;

  const scores = pts.map(s => s.score);
  const first = scores[0];
  const last  = scores[scores.length - 1];
  const best  = Math.max(...scores);
  const delta = last - first;

  // 描画範囲(読みやすさのため動的レンジ、0-100でクランプ)
  const lo = Math.max(0, Math.min(...scores) - 6);
  const hi = Math.min(100, Math.max(...scores) + 6);
  const span = Math.max(1, hi - lo);

  const W = 560, H = 190, padL = 34, padR = 16, padT = 16, padB = 30;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const x = i => padL + (pts.length === 1 ? innerW/2 : (i / (pts.length - 1)) * innerW);
  const y = v => padT + (1 - (v - lo) / span) * innerH;

  // グリッド(横線4本)
  const gridVals = [lo, lo + span*0.33, lo + span*0.66, hi].map(v => Math.round(v));
  const gridLines = gridVals.map(v => {
    const gy = y(v);
    return `<line x1="${padL}" y1="${gy.toFixed(1)}" x2="${W-padR}" y2="${gy.toFixed(1)}" class="trend-grid"/>
            <text x="${padL-6}" y="${(gy+3).toFixed(1)}" class="trend-axis-y">${v}</text>`;
  }).join('');

  const linePts = pts.map((s, i) => `${x(i).toFixed(1)},${y(s.score).toFixed(1)}`).join(' ');
  const areaPath = `M ${padL},${(padT+innerH).toFixed(1)} L ${pts.map((s,i)=>`${x(i).toFixed(1)},${y(s.score).toFixed(1)}`).join(' L ')} L ${(W-padR).toFixed(1)},${(padT+innerH).toFixed(1)} Z`;

  const dots = pts.map((s, i) => {
    const isLast = i === pts.length - 1;
    const isFirst = i === 0;
    const r = (isLast || isFirst) ? 4.5 : 3;
    const cls = isLast ? 'trend-dot last' : 'trend-dot';
    return `<circle cx="${x(i).toFixed(1)}" cy="${y(s.score).toFixed(1)}" r="${r}" class="${cls}"><title>${s.score}点 (${fmtShortDate(s.createdAt)})</title></circle>`;
  }).join('');

  // 値ラベル(初回・最新)
  const firstLabel = `<text x="${x(0).toFixed(1)}" y="${(y(first)-10).toFixed(1)}" class="trend-pt-label">${first}</text>`;
  const lastLabel  = `<text x="${x(pts.length-1).toFixed(1)}" y="${(y(last)-10).toFixed(1)}" class="trend-pt-label strong" text-anchor="end">${last}</text>`;

  const firstDate = `<text x="${padL}" y="${H-8}" class="trend-axis-x">${fmtShortDate(pts[0].createdAt)}</text>`;
  const lastDate  = `<text x="${W-padR}" y="${H-8}" class="trend-axis-x" text-anchor="end">${fmtShortDate(pts[pts.length-1].createdAt)}</text>`;

  const sign = delta > 0 ? '+' : '';
  const tone = delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  const deltaArrow = delta > 0 ? '▲' : delta < 0 ? '▼' : '→';

  // 主要指標の初回→最新の改善サマリ(絶対値が小さいほど改善)
  const kmFirst = pts[0].keyMetrics || {};
  const kmLast  = pts[pts.length-1].keyMetrics || {};
  const metricRows = Object.keys(kmLast)
    .filter(k => k in kmFirst && (k in METRIC_LABEL))
    .map(k => {
      const improve = metricImprovement(METRIC_DIR[k], kmFirst[k], kmLast[k]); // - で改善(方向考慮)
      const cls = improve < -0.002 ? 'up' : improve > 0.002 ? 'down' : 'flat';
      const ico = cls === 'up' ? '▲改善' : cls === 'down' ? '▼悪化' : '→維持';
      return `<div class="trend-metric ${cls}"><span>${METRIC_LABEL[k]}</span><b>${ico}</b></div>`;
    }).join('');

  host.innerHTML = `
    <div class="trend-head">
      <h3 class="trend-title">📈 スコアの推移</h3>
      <div class="trend-stats">
        <span class="trend-stat"><i>初回</i><b>${first}</b></span>
        <span class="trend-stat"><i>最新</i><b>${last}</b></span>
        <span class="trend-stat"><i>最高</i><b>${best}</b></span>
        <span class="trend-stat delta ${tone}"><i>変化</i><b>${deltaArrow} ${sign}${delta}</b></span>
      </div>
    </div>
    <div class="trend-chart-wrap">
      <svg viewBox="0 0 ${W} ${H}" class="trend-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="スコア推移グラフ">
        ${gridLines}
        <path d="${areaPath}" class="trend-area"/>
        <polyline points="${linePts}" class="trend-line"/>
        ${dots}
        ${firstLabel}${lastLabel}
        ${firstDate}${lastDate}
      </svg>
    </div>
    ${metricRows ? `<div class="trend-metrics"><span class="trend-metrics-cap">主要指標（初回→最新）</span>${metricRows}</div>` : ''}
  `;
}
function fmtShortDate(iso){
  const d = new Date(iso);
  return `${d.getMonth()+1}/${d.getDate()}`;
}

function showBeforeAfter(before, after){
  if (!els.baStage) return;
  if (!before.thumb || !after.thumb){
    alert('サムネイル未保存のため比較表示できません');
    return;
  }
  els.baBefore.src = before.thumb;
  els.baAfter.src  = after.thumb;
  els.baStage.hidden = false;
  els.baSlider.value = 50;
  updateBaClip(50);
  // メタ
  const days = Math.round((new Date(after.createdAt) - new Date(before.createdAt)) / 86400000);
  const sd   = (after.score ?? 0) - (before.score ?? 0);
  const sign = sd >= 0 ? '+' : '';
  const tone = sd > 0 ? 'up' : sd < 0 ? 'down' : 'flat';
  const km1 = before.keyMetrics || {}, km2 = after.keyMetrics || {};
  // 各指標の変化を集計(絶対値が小さいほど改善)
  const changes = Object.keys(km2)
    .filter(k => k in km1 && (k in METRIC_LABEL))
    .map(k => {
      const d = km2[k] - km1[k];
      const improve = metricImprovement(METRIC_DIR[k], km1[k], km2[k]); // - なら改善(方向考慮)
      return { k, label: METRIC_LABEL[k], from: km1[k], to: km2[k], d, improve };
    });
  const metricRows = changes.map(c => {
    const dStr = (c.d >= 0 ? '+' : '') + (Math.round(c.d*1000)/1000);
    const cls = c.improve < -0.002 ? 'up' : c.improve > 0.002 ? 'down' : 'flat';
    const badge = cls === 'up' ? '改善' : cls === 'down' ? '悪化' : '維持';
    return `<div class="ba-row ${cls}"><span>${c.label}</span><i>${c.from} → ${c.to}</i><b>${dStr} <em>${badge}</em></b></div>`;
  }).join('');

  // === 変化点のハイライト ===
  const improved = changes.filter(c => c.improve < -0.002).sort((a,b) => a.improve - b.improve);
  const worsened = changes.filter(c => c.improve >  0.002).sort((a,b) => b.improve - a.improve);
  let highlight = '';
  const chips = [];
  if (improved.length){
    chips.push(`<span class="ba-hl-chip up">✨ 最も改善：${improved[0].label}</span>`);
    if (improved.length > 1) chips.push(`<span class="ba-hl-chip up soft">他 ${improved.length-1} 項目も改善</span>`);
  }
  if (worsened.length){
    chips.push(`<span class="ba-hl-chip down">⚠ 注意：${worsened[0].label}</span>`);
  }
  if (!improved.length && !worsened.length){
    chips.push(`<span class="ba-hl-chip flat">大きな変化なし（現状維持）</span>`);
  }
  const headline = sd > 0
    ? `スコアが <b>${sd}pt</b> アップ！この調子で続けましょう 🌸`
    : sd < 0
      ? `スコアは <b>${Math.abs(sd)}pt</b> ダウン。撮影条件（光・表情・角度）も影響します。`
      : `スコアは横ばい。フォームを見直して継続を 💪`;
  highlight = `
    <div class="ba-highlight ${tone}">
      <div class="ba-hl-head">${headline}</div>
      <div class="ba-hl-chips">${chips.join('')}</div>
    </div>`;

  els.baMeta.innerHTML = `
    <div class="ba-summary"><strong>${days}日</strong> でスコア <span class="ba-delta ${tone}">${sign}${sd}</span> 変化</div>
    ${highlight}
    <div class="ba-metric-cap">指標ごとの変化（数値が0に近いほど良好）</div>
    <div class="ba-metric-list">${metricRows}</div>
  `;
  els.baStage.scrollIntoView({behavior:'smooth', block:'center'});
}
function updateBaClip(v){
  if (!els.baAfter) return;
  els.baAfter.style.clipPath = `inset(0 0 0 ${v}%)`;
}
if (els.baSlider){
  els.baSlider.addEventListener('input', e => updateBaClip(+e.target.value));
}
if (els.btnCompare){
  els.btnCompare.addEventListener('click', () => {
    const snaps = listSnapshots();
    if (snaps.length < 2) return;
    showBeforeAfter(snaps[snaps.length - 1], snaps[0]); // 最古 vs 最新
  });
}
if (els.btnClearHistory){
  els.btnClearHistory.addEventListener('click', () => {
    if (!confirm('履歴をすべて削除しますか？この操作は元に戻せません。')) return;
    clearHistory();
    renderProgress();
    if (els.baStage) els.baStage.hidden = true;
  });
}
// ===== 起動: メール式サインイン・ゲート =====
document.addEventListener('DOMContentLoaded', () => {
  initAuthGate();
});

function initAuthGate(){
  if (isSignedIn()){
    const acc = getCurrentAccount();
    if (acc && accountHasPin(acc.id)){ showSigninGate('pin', acc); }
    else { enterApp(); }
  } else {
    // 未サインインでもランディング(価値説明)は見られるようにし、
    // 「診断を始める瞬間」(写真選択)にゲートを出す。個人データは従来どおりサインイン後のみ。
    renderSignedOutState();
  }
}

// 未サインイン状態: アカウントバーを隠し、サインイン案内バーを表示
function renderSignedOutState(){
  const bar = document.getElementById('account-bar');
  if (bar) bar.hidden = true;
  const prompt = document.getElementById('signin-prompt');
  if (prompt) prompt.hidden = false;
  updateStickyCta();
}
// 案内バーのボタン → ゲートを開く
const _signinPromptBtn = document.getElementById('signin-prompt-btn');
if (_signinPromptBtn) _signinPromptBtn.addEventListener('click', () => showSigninGate('email'));
// 写真選択(タップ)をサインインの発動点に: 未サインインならファイル選択を開かずゲート表示
const _uploadLabel = document.querySelector('label[data-target="file-face"]');
if (_uploadLabel) _uploadLabel.addEventListener('click', (e) => {
  if (!isSignedIn()){ e.preventDefault(); showSigninGate('email'); }
}, true);

// サインイン後にアプリ本体を初期化・表示
function enterApp(){
  const gate = document.getElementById('signin-gate');
  if (gate) gate.hidden = true;
  document.body.style.overflow = '';
  const bar = document.getElementById('account-bar');
  if (bar) bar.hidden = false;
  const prompt = document.getElementById('signin-prompt');
  if (prompt) prompt.hidden = true;
  initAccountBar();
  loadUserPrefs();
  applyUserPrefsToForm();
  renderProgress();
  renderResumeBanner();
  updateStickyCta();
}

// ゲート表示（email入力 / PINロック）
function showSigninGate(mode, acc){
  const gate = document.getElementById('signin-gate');
  const body = document.getElementById('signin-body');
  if (!gate || !body) return;
  gate.hidden = false;
  document.body.style.overflow = 'hidden';
  updateStickyCta();

  if (mode === 'pin'){
    body.innerHTML = `
      <p class="signin-lead">${escapeHtml(acc.name || acc.email)} さん、おかえりなさい。<br>PINを入力してください。</p>
      <input type="password" inputmode="numeric" class="signin-input" id="signin-pin" placeholder="PIN" maxlength="8" autocomplete="off" />
      <div class="signin-err" id="signin-err" hidden></div>
      <button class="signin-submit" id="signin-go" type="button">入る</button>
      <button class="signin-alt" id="signin-switch" type="button">別のメールでサインイン</button>`;
    const go = () => {
      const pin = document.getElementById('signin-pin').value;
      if (verifyAccountPin(acc.id, pin)){ enterApp(); }
      else { const e = document.getElementById('signin-err'); e.hidden = false; e.textContent = 'PINが違います。'; }
    };
    document.getElementById('signin-go').addEventListener('click', go);
    document.getElementById('signin-pin').addEventListener('keydown', ev => { if (ev.key === 'Enter') go(); });
    document.getElementById('signin-switch').addEventListener('click', () => { signOut(); showSigninGate('email'); });
    setTimeout(() => document.getElementById('signin-pin')?.focus(), 40);
  } else {
    body.innerHTML = `
      <p class="signin-lead">診断結果と30日プログラムを<strong>あなた専用に保存する</strong>ため、<br>メールアドレスでサインインします。</p>
      <input type="email" class="signin-input" id="signin-email" placeholder="メールアドレス" autocomplete="email" />
      <input type="text" class="signin-input" id="signin-name" placeholder="お名前（任意）" autocomplete="name" />
      <div class="signin-err" id="signin-err" hidden></div>
      <button class="signin-submit" id="signin-go" type="button">はじめる / ログイン</button>
      <button class="signin-alt" id="signin-later" type="button">← 先にページを見る</button>
      <p class="signin-note">※ データはこの端末の中だけに保存されます（外部送信なし・別の端末には移りません）。共有端末の方はログイン後に「🔒 PIN設定」をおすすめします。</p>`;
    const go = () => {
      const email = document.getElementById('signin-email').value;
      const name = document.getElementById('signin-name').value;
      const err = document.getElementById('signin-err');
      if (!isValidEmail(email)){ err.hidden = false; err.textContent = 'メールアドレスの形式を確認してください。'; return; }
      const { account } = signInWithEmail(email, name);
      if (accountHasPin(account.id)){ showSigninGate('pin', account); }
      else { enterApp(); }
    };
    document.getElementById('signin-go').addEventListener('click', go);
    document.getElementById('signin-name').addEventListener('keydown', ev => { if (ev.key === 'Enter') go(); });
    // 「先にページを見る」: 未サインインのままランディングへ戻る(個人データは表示されないので安全)
    const later = document.getElementById('signin-later');
    if (later) later.addEventListener('click', () => {
      gate.hidden = true;
      document.body.style.overflow = '';
      renderSignedOutState();
    });
    setTimeout(() => document.getElementById('signin-email')?.focus(), 40);
  }
}

// ===== アカウントバー（サインイン後） =====
function renderAccountBar(){
  const acc = getCurrentAccount();
  const nameEl = document.getElementById('account-name');
  const emailEl = document.getElementById('account-email');
  if (nameEl) nameEl.textContent = acc ? `${acc.name || acc.email.split('@')[0]} さん` : '';
  if (emailEl) emailEl.textContent = acc ? acc.email : '';
}

let _accountBarWired = false;
function initAccountBar(){
  renderAccountBar();
  if (_accountBarWired) return;
  _accountBarWired = true;

  const btnLogout = document.getElementById('btn-logout');
  if (btnLogout) btnLogout.addEventListener('click', async () => {
    const ok = await uiConfirm({ title:'ログアウト', message:'ログアウトします。データはこの端末に残り、次回同じメールで入れば続きから使えます。', okText:'ログアウト' });
    if (!ok) return;
    signOut();
    if (els.results) els.results.hidden = true;
    if (els.baStage) els.baStage.hidden = true;
    // 共有端末対策: 前の人の写真プレビュー・前回診断バナーを画面から消す
    state.imgFace = null;
    if (els.previewFace) els.previewFace.hidden = true;
    if (els.fileFace) els.fileFace.value = '';
    const rb = document.getElementById('resume-banner');
    if (rb){ rb.hidden = true; rb.innerHTML = ''; }
    updateAnalyzeBtn();
    renderSignedOutState();
    showSigninGate('email');
  });

  const btnPin = document.getElementById('btn-account-pin');
  if (btnPin) btnPin.addEventListener('click', async () => {
    const acc = getCurrentAccount(); if (!acc) return;
    if (accountHasPin(acc.id)){
      const ok = await uiConfirm({ title:'PINロック', message:'この端末のPINロックを解除しますか？', okText:'解除する' });
      if (ok){ setAccountPin(acc.id, null); await uiAlert({ title:'解除しました', message:'PINロックを解除しました。' }); }
      return;
    }
    const pin = await uiPrompt({ title:'PINを設定', label:'4〜8桁の数字（共有端末で他の人に開かれないようにします）', placeholder:'例: 1234', okText:'設定' });
    if (pin === null) return;
    if (!/^\d{4,8}$/.test(pin.trim())){ await uiAlert({ title:'PINの形式', message:'4〜8桁の数字で入力してください。' }); return; }
    setAccountPin(acc.id, pin.trim());
    await uiAlert({ title:'設定しました', message:'次回この端末で開くときにPINの入力が必要になります。' });
  });

  const btnExport = document.getElementById('btn-profile-export');
  if (btnExport) btnExport.addEventListener('click', () => {
    const data = exportActiveAccount();
    const acc = getCurrentAccount();
    const safeName = (acc?.name || acc?.email || 'account').replace(/[^\w\u3040-\u30ff\u4e00-\u9faf-]+/g, '_');
    const stamp = new Date().toISOString().slice(0,10);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `facelab_${safeName}_${stamp}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });

  const btnImport = document.getElementById('btn-profile-import');
  const importFile = document.getElementById('profile-import-file');
  if (btnImport && importFile){
    btnImport.addEventListener('click', () => importFile.click());
    importFile.addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const obj = JSON.parse(reader.result);
          importIntoActiveAccount(obj);   // 今のアカウントに取り込む
          loadUserPrefs(); applyUserPrefsToForm(); renderProgress(); renderResumeBanner();
          uiAlert({ title:'読み込み完了', message:'バックアップをこのアカウントに読み込みました。' });
        } catch(err){
          uiAlert({ title:'読み込みに失敗しました', message: escapeHtml(err?.message || String(err)) });
        }
      };
      reader.readAsText(file);
      importFile.value = '';
    });
  }
}

function applyUserPrefsToForm(){
  const setRadio = (name, val) => {
    const el = document.querySelector(`input[name="${name}"][value="${val}"]`);
    if (el) el.checked = true;
  };
  setRadio('ageGroup', state.ageGroup);
  setRadio('timeBudget', String(state.timeBudget));
  setRadio('goal', state.goal);
  ['sleep','posture','diet','stress'].forEach(g => {
    if (state.lifestyle[g]) setRadio(g, state.lifestyle[g]);
  });
  setRadio('lifeStage', state.lifeStage);
  setRadio('timeOfDay', state.timeOfDay);
  // contra (multi)
  (state.contra || []).forEach(v => {
    const el = document.querySelector(`input[name="contra"][value="${v}"]`);
    if (el) el.checked = true;
  });
}

function renderSymptomSummary(){
  const has = state.symptoms.length > 0 || state.symptomFree;
  if (!has){ els.symptomSummary.hidden = true; return; }
  const tags = state.symptoms.map(s => SYMPTOM_MAP[s]?.label).filter(Boolean)
    .map(l => `<span>${l}</span>`).join('');
  els.symptomSummary.innerHTML = `
    <strong>🌷 あなたのお悩み</strong>
    <span class="ss-tags">${tags || '<span>未選択</span>'}</span>
    ${state.symptomFree ? `<span class="ss-free">📝 ${escapeHtml(state.symptomFree)}</span>` : ''}
  `;
  els.symptomSummary.hidden = false;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderScoreAndType(){
  const score = calcScore(state.result, state.problems);
  const { grade, desc, percentile } = gradeFromScore(score, { ageGroup: state.ageGroup });
  els.scoreValue.textContent = score;
  els.scoreGrade.textContent = grade;
  // ポジティブ枠: 伸びしろ文 + (上位半分のときだけ)同年代の目安 + あなたの強み(部位)
  const pctNote = (percentile && percentile <= 50) ? ` 同年代で上位${percentile}%の目安。` : '';
  const strength = bestSideStrength();
  const strengthNote = strength ? ` あなたの強みは「${strength}」。` : '';
  els.scoreDesc.textContent = desc + pctNote + strengthNote;
  const circ = 2 * Math.PI * 52;
  els.scoreArc.setAttribute('stroke-dashoffset', circ - (score/100) * circ);

  const type = determineFaceType(state.problems, state.result.metrics);
  els.faceType.textContent = type.name;
  els.faceTypeDesc.textContent = type.desc;
  els.faceTypeTags.innerHTML = type.tags.map(t => `<span>${t}</span>`).join('');
}

// 左右独立スコアから最も高い部位を「強み」として返す(60未満なら無し)
function bestSideStrength(){
  const s = state.result?.sideScores;
  if (!s) return '';
  const labels = { eye:'目の開き', naso:'ほうれい線まわり', corner:'口角', browLid:'まぶたの余白', eyeSlant:'目尻', jaw:'フェイスライン' };
  let best = null;
  ['left','right'].forEach(side => {
    Object.entries(labels).forEach(([k,lbl]) => {
      const v = s[side]?.[k];
      if (typeof v === 'number' && (!best || v > best.v)) best = { v, lbl };
    });
  });
  return best && best.v >= 60 ? best.lbl : '';
}

function renderMetrics(){
  const items = buildMetricsList(state.result);
  els.metricsList.innerHTML = items.map(it => `
    <div class="metric ${it.sev}">
      <div class="metric-name">${it.name}</div>
      <div class="metric-value">${it.value}</div>
      <div class="metric-bar"><i style="width:${it.pct}%"></i></div>
      <div class="metric-detail">${it.detail}</div>
    </div>
  `).join('');
}

// ===== Overlay 描画 =====
function renderOverlay(){
  const cv = els.overlayFace;
  const img = state.imgFace;
  const lmsRaw = state.result?.landmarksRaw;
  // 画像やランドマークが無い(前回結果の復元で画像未保存など)場合はオーバーレイ枠ごと非表示
  const pane = cv ? cv.closest('.overlay-grid') : null;
  if (!img || !img.width || !lmsRaw){
    if (pane) pane.hidden = true;
    return;
  }
  if (pane) pane.hidden = false;
  const ctx = cv.getContext('2d');
  const maxW = 520;
  const ratio = Math.min(1, maxW / img.width);
  cv.width  = img.width * ratio;
  cv.height = img.height * ratio;
  ctx.drawImage(img, 0, 0, cv.width, cv.height);

  const lms = state.result.landmarksRaw;
  const m = state.result.metrics;
  const P = (i) => ({ x: lms[i].x * cv.width, y: lms[i].y * cv.height });

  // --- 中心線(鼻ブリッジ→顎) ---
  const nb = P(FM.NOSE_BRIDGE);
  const chin = P(FM.CHIN);
  ctx.strokeStyle = Math.abs(m.midlineTilt) > 2.5 ? '#FF6B8A' : '#FF8FA8';
  ctx.lineWidth = 2; ctx.setLineDash([6,6]);
  ctx.beginPath(); ctx.moveTo(nb.x, 0); ctx.lineTo(nb.x, cv.height); ctx.stroke();
  ctx.setLineDash([]);

  // 中心軸(実際の線)
  ctx.strokeStyle = '#E07A8A';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(nb.x, nb.y); ctx.lineTo(chin.x, chin.y); ctx.stroke();

  // --- 目ライン ---
  const lEye = midp(P(FM.L_EYE_INNER), P(FM.L_EYE_OUTER));
  const rEye = midp(P(FM.R_EYE_INNER), P(FM.R_EYE_OUTER));
  drawHLine(ctx, lEye, rEye, Math.abs(m.eyeHeightDiff) > 0.012 ? '#FFC966' : '#A8D8B9');

  // --- 眉ライン ---
  const lBrow = P(FM.L_BROW_PEAK);
  const rBrow = P(FM.R_BROW_PEAK);
  drawHLine(ctx, lBrow, rBrow, Math.abs(m.browHeightDiff) > 0.012 ? '#FFC966' : '#A8D8B9');

  // --- 口ライン ---
  const mL = P(FM.MOUTH_L);
  const mR = P(FM.MOUTH_R);
  drawHLine(ctx, mL, mR, Math.abs(m.mouthTilt) > 0.012 ? '#FFC966' : '#A8D8B9');

  // --- フェイスライン(輪郭の主要点) ---
  ctx.strokeStyle = 'rgba(224,122,138,0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const pts = [
    P(FM.TEMPLE_L), P(FM.CHEEK_L), P(FM.JAW_L), P(FM.CHIN), P(FM.JAW_R), P(FM.CHEEK_R), P(FM.TEMPLE_R),
  ];
  ctx.moveTo(pts[0].x, pts[0].y);
  pts.slice(1).forEach(p => ctx.lineTo(p.x, p.y));
  ctx.stroke();

  // --- ほうれい線エリア ---
  const nL = P(FM.NOSE_L), nR = P(FM.NOSE_R);
  ctx.strokeStyle = '#FFB7C5';
  ctx.lineWidth = 1.6;
  drawLine(ctx, nL, mL);
  drawLine(ctx, nR, mR);

  // --- ランドマーク点 ---
  [
    [lEye,'#FF8FA8'],[rEye,'#FF8FA8'],
    [lBrow,'#FFB7C5'],[rBrow,'#FFB7C5'],
    [mL,'#E07A8A'],[mR,'#E07A8A'],
    [nb,'#FFD93D'],[chin,'#FFD93D'],
  ].forEach(([p,c]) => drawCircle(ctx, p, 4, c));

  // --- ラベル ---
  labelTag(ctx, lEye, '左目');
  labelTag(ctx, rEye, '右目');
  labelTag(ctx, mL, '左口角');
  labelTag(ctx, mR, '右口角');
  labelTag(ctx, chin, '顎');
}

function midp(a,b){ return { x:(a.x+b.x)/2, y:(a.y+b.y)/2 }; }
function drawLine(ctx,a,b){ ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.lineTo(b.x,b.y); ctx.stroke(); }
function drawHLine(ctx, a, b, color){
  ctx.strokeStyle = color; ctx.lineWidth = 2.5;
  drawLine(ctx, a, b);
  drawCircle(ctx, a, 3.5, color);
  drawCircle(ctx, b, 3.5, color);
}
function drawCircle(ctx, p, r, color){
  ctx.fillStyle = '#fff';
  ctx.beginPath(); ctx.arc(p.x, p.y, r+1.5, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = color;
  ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2); ctx.fill();
}
function labelTag(ctx, p, text){
  ctx.font = 'bold 10px "Noto Sans JP", sans-serif';
  const w = ctx.measureText(text).width + 8;
  ctx.fillStyle = 'rgba(11,21,48,0.78)';
  ctx.fillRect(p.x + 8, p.y - 10, w, 16);
  ctx.fillStyle = '#fff';
  ctx.fillText(text, p.x + 12, p.y + 2);
}

// ===== Problems =====
// 筋肉名 → 一般人にわかる場所の言葉（技術名は小さく併記）
const MUSCLE_GLOSS = {
  '咬筋':'エラ（噛む筋肉）', '側頭筋膜':'こめかみ', '側頭筋':'こめかみ', '広頸筋':'首の前',
  '胸鎖乳突筋':'首の横すじ', '内側翼突筋':'奥の噛む筋肉', '後頭下筋群':'後頭部の付け根',
  '口角挙筋':'口角を上げる筋肉', '大頬骨筋':'ほおを上げる筋肉', '小頬骨筋':'ほおの内側',
  '頬筋':'ほおの奥', '口角下制筋':'口角を下げる筋肉', '下唇下制筋':'下唇を下げる筋肉',
  'オトガイ筋':'あご先', '上唇鼻翼挙筋':'小鼻〜上唇', '上唇挙筋':'上唇を上げる筋肉',
  '舌骨上筋群':'あご下', '顎二腹筋':'あご下', '前頭筋外側':'おでこの外側', '前頭筋中央':'おでこ中央',
  '前頭筋':'おでこ', '上眼瞼挙筋':'まぶたを上げる筋肉', '眼瞼挙筋':'まぶたを上げる筋肉',
  '皺眉筋':'眉間', '鼻根筋':'鼻の付け根', '眼輪筋外側部':'目尻', '眼輪筋外側':'目尻',
  '眼輪筋上部':'目の上ふち', '眼輪筋':'目のまわり', '口輪筋上部':'口のまわり（上）',
  '口輪筋下部':'口のまわり（下）', '口輪筋':'口のまわり', '舌筋':'舌', '舌':'舌',
};
const MUSCLE_KEYS = Object.keys(MUSCLE_GLOSS).sort((a,b)=>b.length-a.length); // 長い名前を先に照合
function glossMuscle(raw){
  for (const key of MUSCLE_KEYS){
    if (raw.startsWith(key)){
      const suffix = raw.slice(key.length); // (片側)(反対側) 等
      return `${MUSCLE_GLOSS[key]}${suffix}<small class="tissue-tech">${raw}</small>`;
    }
  }
  return raw;
}

function renderProblems(){
  els.problemsList.innerHTML = state.problems.map(p => {
    const sevText = p.severity === 'high' ? '重' : p.severity === 'mid' ? '中' : '軽';
    const sevPct  = p.severity === 'high' ? '85' : p.severity === 'mid' ? '55' : '30';
    return `
      <div class="problem sev-${p.severity}">
        <div class="problem-sev">
          <strong>${sevPct}</strong><span>${sevText}度</span>
        </div>
        <div class="problem-body">
          <h3>${p.title}</h3>
          <div class="problem-meta">
            <span>計測値: <strong>${p.metric}</strong></span>
            <span>重症度: <strong>${sevText}</strong></span>
          </div>
          <div class="problem-desc">${p.description}</div>
          <div class="tissue-list">
            <div class="tissue tight">
              <strong>🔴 こわばっている所（ゆるめる）</strong>
              <ul>${p.tissues.tight.map(t=>`<li>${glossMuscle(t)}</li>`).join('') || '<li>—</li>'}</ul>
            </div>
            <div class="tissue weak">
              <strong>🟡 使えていない所（鍛える）</strong>
              <ul>${p.tissues.weak.map(t=>`<li>${glossMuscle(t)}</li>`).join('') || '<li>—</li>'}</ul>
            </div>
          </div>
        </div>
        <div class="problem-side">${problemIllust(p.key)}</div>
      </div>
    `;
  }).join('');
}

function problemIllust(key){
  const face = (inner) => `<svg class="problem-svg" viewBox="0 0 80 100">
    <ellipse cx="40" cy="50" rx="22" ry="30" fill="#FFE5EC" stroke="#0b1530" stroke-width="1.5"/>
    ${inner}</svg>`;
  const ill = {
    facialAsymmetry: face(`
      <path d="M40 22 L40 80" stroke="#FF6B8A" stroke-width="1" stroke-dasharray="3 3"/>
      <circle cx="32" cy="42" r="2" fill="#0b1530"/>
      <circle cx="48" cy="40" r="2" fill="#0b1530"/>
      <path d="M30 60 Q40 65 50 58" stroke="#FF6B8A" stroke-width="1.8" fill="none"/>
    `),
    mouthCornerDown: face(`
      <circle cx="32" cy="40" r="2" fill="#0b1530"/>
      <circle cx="48" cy="40" r="2" fill="#0b1530"/>
      <path d="M30 64 Q40 58 50 64" stroke="#FF6B8A" stroke-width="2.5" fill="none"/>
    `),
    nasolabialFold: face(`
      <circle cx="32" cy="40" r="2" fill="#0b1530"/>
      <circle cx="48" cy="40" r="2" fill="#0b1530"/>
      <path d="M34 50 Q30 60 32 70" stroke="#FF6B8A" stroke-width="1.8" fill="none"/>
      <path d="M46 50 Q50 60 48 70" stroke="#FF6B8A" stroke-width="1.8" fill="none"/>
    `),
    jawSagging: face(`
      <circle cx="32" cy="40" r="2" fill="#0b1530"/>
      <circle cx="48" cy="40" r="2" fill="#0b1530"/>
      <path d="M22 60 Q40 85 58 60" stroke="#FF6B8A" stroke-width="2" fill="none" stroke-dasharray="3 2"/>
    `),
    puffiness: face(`
      <circle cx="32" cy="42" r="3" fill="#FFC9D6"/>
      <circle cx="48" cy="42" r="3" fill="#FFC9D6"/>
      <ellipse cx="40" cy="50" rx="24" ry="30" fill="none" stroke="#FFC966" stroke-width="2"/>
    `),
    partsBalance: face(`
      <line x1="18" y1="32" x2="62" y2="32" stroke="#FFC966" stroke-width="1" stroke-dasharray="2 2"/>
      <line x1="18" y1="50" x2="62" y2="50" stroke="#FFC966" stroke-width="1" stroke-dasharray="2 2"/>
      <line x1="18" y1="68" x2="62" y2="68" stroke="#FFC966" stroke-width="1" stroke-dasharray="2 2"/>
    `),
    general: face(`
      <circle cx="32" cy="42" r="2" fill="#0b1530"/>
      <circle cx="48" cy="42" r="2" fill="#0b1530"/>
      <path d="M30 62 Q40 70 50 62" stroke="#10b981" stroke-width="2.5" fill="none"/>
    `),
  };
  return ill[key] || ill.general;
}

// ===== Knowledge =====
function renderKnowledge(){
  const cards = getKnowledgeFor(state.problems.map(p => p.key));
  els.knowledgeGrid.innerHTML = cards.map(c => {
    const kindClass = c.kind ? ` know-${c.kind}` : '';
    const svgBlock = c.svg ? `<div class="know-anatomy">${c.svg}</div>` : '';
    let actionBlock = '';
    if (c.kind === 'ng' && (c.dont || c.do)) {
      const dontList = (c.dont||[]).map(s => `<li>${s}</li>`).join('');
      const doList   = (c.do||[]).map(s => `<li>${s}</li>`).join('');
      actionBlock = `
        <div class="know-action-grid">
          ${c.dont ? `<div class="know-act dont"><strong>❌ DON'T</strong><ul>${dontList}</ul></div>` : ''}
          ${c.do   ? `<div class="know-act do"><strong>✅ DO</strong><ul>${doList}</ul></div>` : ''}
        </div>`;
    }
    return `
      <div class="know-card${kindClass}">
        <span class="know-tag">${c.tag}</span>
        <div class="know-emoji">${c.emoji}</div>
        <h3>${c.title}</h3>
        <p>${c.body}</p>
        ${svgBlock}
        ${actionBlock}
      </div>
    `;
  }).join('');
}

// ===== Today menu =====
function renderToday(){
  // ジャーニーの「今日のDay」を表示(未完了の最小Day)。毎回Day1固定にしない。
  const dayNum = currentJourneyDay();
  const today = state.program?.[dayNum - 1] || state.program?.[0];
  if (!today) return;
  renderJourneyBar(dayNum);
  els.todayGrid.innerHTML = today.training.map(ex => exerciseCard(ex)).join('');
  bindExerciseCards(els.todayGrid);
  if (els.todayReason && today.reason){
    els.todayReason.innerHTML = `<span class="reason-title">🎯 なぜ今日この${today.training.length}種なのか（Day ${dayNum}）</span>${escapeHtml(today.reason)}`;
  }
}

// 継続の仕組み: Day進行・連続日数・30マス進捗・完了ボタン
function renderJourneyBar(dayNum){
  const host = document.getElementById('journey-bar');
  if (!host) return;
  const st = journeyStats();
  const allDone = st.doneCount >= 30;
  const dots = Array.from({ length: 30 }, (_, i) => {
    const d = i + 1;
    const done = !!st.done[d];
    const isToday = d === dayNum && !allDone;
    return `<span class="jr-dot${done ? ' done' : ''}${isToday ? ' today' : ''}" title="Day ${d}${done ? '（完了）' : ''}"></span>`;
  }).join('');
  const gapNote = (!allDone && st.gapDays != null && st.gapDays >= 2)
    ? `<div class="jr-gap">前回から${st.gapDays}日ぶり。今日から気軽に再開しましょう 🌷</div>` : '';
  host.hidden = false;
  host.innerHTML = `
    <div class="jr-top">
      <div class="jr-day">${allDone ? '🎉 30日プログラム達成！' : `今日は <strong>Day ${dayNum}</strong> <small>/ 30</small>`}</div>
      <div class="jr-stats">
        <span class="jr-streak">🔥 連続 ${st.streak}日</span>
        <span class="jr-count">達成 ${st.doneCount}/30</span>
      </div>
    </div>
    <div class="jr-dots" aria-label="30日の進捗">${dots}</div>
    ${gapNote}
    ${allDone
      ? `<button class="jr-done-btn is-done" type="button" disabled>すべて完了しました 🌸</button>`
      : `<button class="jr-done-btn" id="jr-done-btn" type="button">Day ${dayNum} を完了する ✓</button>`}
  `;
  const btn = document.getElementById('jr-done-btn');
  if (btn) btn.addEventListener('click', () => {
    markDayDone(dayNum);
    renderToday();      // 次のDayへ進む
    renderProgram(state.currentPhase); // プログラム側の✓も更新
  });
}

function renderProgramMeta(){
  if (!els.programMeta) return;
  const goalLabel = { liftup:'リフトアップ', symmetry:'左右対称', antiAging:'シワ対策', shrink:'小顔・むくみ', eyes:'目元印象UP', overall:'総合バランス' }[state.goal] || '総合バランス';
  const priorityNames = state.priorityKeys.map(k => ({
    facialAsymmetry:'左右非対称', mouthCornerDown:'口角下がり', nasolabialFold:'ほうれい線',
    jawSagging:'たるみ', puffiness:'むくみ', partsBalance:'バランス',
    masseterHypertrophy:'エラ張り', cheekHollow:'頬コケ', longPhiltrum:'人中',
    gummySmile:'ガミー', hoodedEyelid:'まぶた', droopyEyeOuter:'目尻',
    templeHollow:'こめかみ', foreheadLines:'額シワ', glabellarLines:'眉間シワ',
  })[k] || k);
  const priText = priorityNames.length ? priorityNames.join('・') : '自動選定';
  els.programMeta.innerHTML = `
    <span><strong>年代:</strong>${state.ageGroup.replace('s','代')}</span>
    <span><strong>1日:</strong>${state.timeBudget}分</span>
    <span><strong>ゴール:</strong>${goalLabel}</span>
    <span><strong>優先:</strong>${priText}</span>
  `;
}
function exerciseCard(ex){
  return `
    <div class="exercise-card" data-ex="${ex.id}">
      <div class="ex-illust">${ex.illustration}</div>
      <div class="ex-info">
        <span class="ex-cat training">トレーニング</span>
        <h4>${ex.name}</h4>
        <div class="ex-meta">
          <span><strong>⏱</strong> ${ex.duration}</span>
          <span><strong>🛠</strong> ${ex.equipment}</span>
        </div>
        <div class="ex-purpose">${ex.purpose}</div>
      </div>
    </div>
  `;
}
function bindExerciseCards(parent){
  parent.querySelectorAll('.exercise-card').forEach(card => {
    card.addEventListener('click', () => openExerciseModal(EXERCISES[card.dataset.ex]));
  });
}

// ===== 30-day program =====
function renderProgram(phase){
  state.currentPhase = phase;
  $$('.phase-tab').forEach(t => t.classList.toggle('active', +t.dataset.phase === phase));
  const days = state.program.filter(d => d.phase === phase);
  const doneSet = journeyStats().done;
  els.programGrid.innerHTML = days.map(d => dayCard(d, doneSet)).join('');
  els.programGrid.querySelectorAll('.day-card').forEach(card => {
    card.addEventListener('click', () => {
      const day = +card.dataset.day;
      openDayModal(state.program.find(d => d.day === day));
    });
  });
}
function dayCard(d, doneSet){
  const done = doneSet && doneSet[d.day];
  return `
    <div class="day-card ${d.isRest?'rest':''}${done?' done':''}" data-day="${d.day}">
      <span class="day-badge">${done?'✓ 済':d.isRest?'REST':'WORK'}</span>
      <div class="day-num">DAY ${String(d.day).padStart(2,'0')}</div>
      <div class="day-theme">${d.theme}</div>
      <ul class="day-list">
        ${d.training.slice(0,4).map(ex => `<li>${ex.name}</li>`).join('')}
      </ul>
    </div>
  `;
}
els.phaseTabs.addEventListener('click', e => {
  const btn = e.target.closest('.phase-tab');
  if (!btn) return;
  renderProgram(+btn.dataset.phase);
});

// ===== Modal =====
function openExerciseModal(ex){
  const meta = getMeta(ex.id);
  const todChips = (meta.timeOfDay||[]).map(t => `<span class="meta-chip tod">${TIME_OF_DAY_LABEL[t]||t}</span>`).join('');
  const toolChips = (meta.tools||[]).map(t => `<span class="meta-chip tool">🛠 ${TOOLS_LABEL[t]||t}</span>`).join('');
  const contraChips = (meta.contra||[]).map(c => `<span class="meta-chip contra">⚠ ${CONTRA_LABEL[c]||c}</span>`).join('');
  const warningBlock = meta.warning ? `<div class="ex-warning">⚠️ <strong>注意:</strong> ${meta.warning}</div>` : '';
  const contraBlock = contraChips ? `<div class="ex-contra-row"><span class="ex-contra-label">禁忌:</span>${contraChips}</div>` : '';

  els.modalBody.innerHTML = `
    <svg width="0" height="0" style="position:absolute" aria-hidden="true">${MOTION_DEFS}</svg>
    <div class="modal-ex-head" style="display:block">
      <div class="modal-ex-info">
        <span class="ex-cat training">トレーニング</span>
        <h2>${ex.name}</h2>
        <div class="ex-meta">
          <span><strong>所要</strong> ${ex.duration}</span>
          <span><strong>道具</strong> ${ex.equipment}</span>
        </div>
        <div class="ex-meta-chips">${todChips}${toolChips}</div>
        <p style="font-size:13px; color:var(--ink-2); margin:10px 0 0">${ex.purpose}</p>
      </div>
    </div>
    ${warningBlock}
    ${contraBlock}
    <div class="modal-section">
      <h4>🎬 やり方イラスト（手順を1コマずつ）</h4>
      <p class="modal-section-sub">下の絵と言葉のとおりに動かせばOK。番号の順に進めてください。</p>
      ${buildStepPanelsHTML(ex.id)}
    </div>
    <div class="modal-section">
      <h4>📋 やり方（上の絵と同じ順番）</h4>
      <p class="modal-section-sub">番号は上のイラストと対応しています。①の絵＝①の文です。</p>
      ${buildHowListHTML(ex.id)}
    </div>
    <div class="modal-section">
      <h4>🎯 どこに効く？</h4>
      <ul>${ex.targets.map(t=>`<li>${t}</li>`).join('')}</ul>
    </div>
    <div class="modal-section">
      <h4>✨ コツ</h4>
      <div class="modal-cues">
        <div class="cue-box do"><strong>✅ DO</strong>${ex.cues.do}</div>
        <div class="cue-box dont"><strong>❌ DON'T</strong>${ex.cues.dont}</div>
      </div>
    </div>
    <div class="modal-section">
      <h4>💡 なぜ効くのか</h4>
      <p>${ex.why}</p>
    </div>
  `;
  showModal();
  // アニメは <details> を開いたとき初回だけ生成・初期化（遅延ロード）
  const anim = els.modalBody.querySelector('.step-anim');
  if (anim){
    anim.addEventListener('toggle', () => {
      if (!anim.open) return;
      const mount = anim.querySelector('.step-anim-mount');
      if (!mount || mount.dataset.ready === '1') return;
      mount.innerHTML = buildMotionPlayerHTML(ex.id);
      const player = mount.querySelector('.motion-player');
      if (player) initMotionPlayer(player, ex.id);
      mount.dataset.ready = '1';
    });
  }
}
function openDayModal(d){
  els.modalBody.innerHTML = `
    <div style="margin-bottom:24px">
      <div style="font-family:'Inter',sans-serif; font-size:12px; color:var(--brand); letter-spacing:.1em; font-weight:700">PHASE ${d.phase} · DAY ${d.day} ${d.isRest?'· REST':''}</div>
      <h2 style="margin:6px 0 4px; font-size:26px">${d.theme}</h2>
      <p style="color:var(--muted); font-size:13px; margin:0">${d.isRest ? '今日は流して整える日。軽めの種目で循環を上げましょう。' : 'クリックで各エクササイズの詳細を表示します。'}</p>
      ${d.reason ? `<div class="reason-box" style="margin-top:14px"><span class="reason-title">🎯 この日の設計理由</span>${escapeHtml(d.reason)}</div>` : ''}
    </div>
    <div style="display:grid; gap:14px">
      ${d.training.map(ex => `
        <div class="exercise-card" data-ex="${ex.id}">
          <div class="ex-illust">${ex.illustration}</div>
          <div class="ex-info">
            <span class="ex-cat training">トレーニング</span>
            <h4>${ex.name}</h4>
            <div class="ex-meta"><span><strong>⏱</strong> ${ex.duration}</span><span><strong>🛠</strong> ${ex.equipment}</span></div>
            <div class="ex-purpose">${ex.purpose}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
  bindExerciseCards(els.modalBody);
  showModal();
}
function showModal(){ els.modal.hidden = false; document.body.style.overflow = 'hidden'; }
function closeModal(){ els.modal.hidden = true; document.body.style.overflow = ''; settleDialog(DIALOG_CANCEL); }
els.modal.addEventListener('click', e => { if (e.target.matches('[data-close]')) closeModal(); });
document.addEventListener('keydown', e => { if (e.key==='Escape' && !els.modal.hidden) closeModal(); });

// ===== アプリ内ダイアログ（ネイティブ prompt/confirm/alert の置き換え） =====
const DIALOG_CANCEL = Symbol('cancel');
let _dialogResolve = null;
function settleDialog(val){ if (_dialogResolve){ const r = _dialogResolve; _dialogResolve = null; r(val); } }
function uiPrompt({ title, label='', value='', placeholder='', okText='決定' }){
  return new Promise(resolve => {
    _dialogResolve = (v) => resolve(v === DIALOG_CANCEL ? null : v);
    els.modalBody.innerHTML = `
      <div class="ui-dialog">
        <h3>${escapeHtml(title)}</h3>
        ${label ? `<label class="ui-dialog-label" for="ui-dialog-input">${escapeHtml(label)}</label>` : ''}
        <input type="text" class="ui-dialog-input" id="ui-dialog-input" value="${escapeHtml(value)}" placeholder="${escapeHtml(placeholder)}" />
        <div class="ui-dialog-actions">
          <button class="btn-ghost" id="ui-cancel" type="button">キャンセル</button>
          <button class="btn-primary" id="ui-ok" type="button">${escapeHtml(okText)}</button>
        </div>
      </div>`;
    showModal();
    const input = document.getElementById('ui-dialog-input');
    setTimeout(() => { input.focus(); input.select(); }, 30);
    const ok = () => { const v = input.value; settleDialog(v); closeModal(); };
    document.getElementById('ui-ok').addEventListener('click', ok);
    document.getElementById('ui-cancel').addEventListener('click', () => closeModal());
    input.addEventListener('keydown', e => { if (e.key === 'Enter'){ e.preventDefault(); ok(); } });
  });
}
function uiConfirm({ title, message, okText='実行', cancelText='キャンセル', danger=false }){
  return new Promise(resolve => {
    _dialogResolve = (v) => resolve(v === true);
    els.modalBody.innerHTML = `
      <div class="ui-dialog">
        <h3>${escapeHtml(title)}</h3>
        <p class="ui-dialog-msg">${message}</p>
        <div class="ui-dialog-actions">
          <button class="btn-ghost" id="ui-cancel" type="button">${escapeHtml(cancelText)}</button>
          <button class="btn-primary${danger ? ' danger' : ''}" id="ui-ok" type="button">${escapeHtml(okText)}</button>
        </div>
      </div>`;
    showModal();
    document.getElementById('ui-ok').addEventListener('click', () => { settleDialog(true); closeModal(); });
    document.getElementById('ui-cancel').addEventListener('click', () => closeModal());
  });
}
function uiAlert({ title, message }){
  return new Promise(resolve => {
    _dialogResolve = () => resolve();
    els.modalBody.innerHTML = `
      <div class="ui-dialog">
        <h3>${escapeHtml(title)}</h3>
        <p class="ui-dialog-msg">${message}</p>
        <div class="ui-dialog-actions">
          <button class="btn-primary" id="ui-ok" type="button">OK</button>
        </div>
      </div>`;
    showModal();
    document.getElementById('ui-ok').addEventListener('click', () => { settleDialog(); closeModal(); });
  });
}

els.btnRestart.addEventListener('click', () => {
  els.results.hidden = true;
  updateStickyCta();
  document.getElementById('upload-section').scrollIntoView({behavior:'smooth'});
});
els.btnPrint.addEventListener('click', () => window.print());

// ===== 法的情報モーダル（プライバシー/利用規約/免責） =====
const LEGAL = {
  privacy: { title:'プライバシーポリシー', body:`
    <p>本ツールは、あなたのプライバシーを最優先に設計しています。</p>
    <ul>
      <li><strong>顔写真</strong>は、お使いのブラウザの中だけで解析され、<strong>外部のサーバーには一切送信されません</strong>。</li>
      <li>診断の履歴・設定・プロフィールは、この端末の中（ブラウザのローカルストレージ）にのみ保存されます。</li>
      <li>年代・既往症・生活習慣などの入力は、<strong>あなた専用メニューの最適化のためだけ</strong>に使われ、外部に共有されません。</li>
      <li>データが端末の外に出るのは、あなたが自分で「バックアップ」を書き出したときだけです。</li>
      <li>履歴の消去・プロフィールの削除は、いつでもご自身で行えます。</li>
    </ul>` },
  terms: { title:'利用規約', body:`
    <ul>
      <li>本ツールは、表情筋のセルフケアを目的とした<strong>参考情報</strong>を提供するものです。</li>
      <li>体調不良・痛み・違和感があるときは、無理をせず中止してください。</li>
      <li>顎関節症・緑内障・高血圧・首の不調・妊娠中などに該当する方は、事前に医師にご相談ください（該当する種目は自動で除外されます）。</li>
      <li>本ツールの利用は自己責任でお願いします。</li>
    </ul>` },
  disclaimer: { title:'免責事項', body:`
    <ul>
      <li>本ツールは教育・セルフケア目的の参考情報であり、<strong>医師・美容医療従事者による診断・治療を代替するものではありません</strong>。</li>
      <li>診断結果・スコアはあくまで目安であり、医学的な判断を示すものではありません。</li>
      <li>感じ方・変化には個人差があります。</li>
      <li>本ツールの利用によって生じたいかなる結果についても、開発者は責任を負いかねます。</li>
    </ul>` },
};
function openLegalModal(kind){
  const l = LEGAL[kind]; if (!l) return;
  els.modalBody.innerHTML = `<div class="legal-modal"><h2>${l.title}</h2>${l.body}<p class="legal-updated">最終更新: 2026年7月</p></div>`;
  showModal();
}
document.querySelectorAll('.foot-link').forEach(b => {
  b.addEventListener('click', () => openLegalModal(b.dataset.legal));
});
