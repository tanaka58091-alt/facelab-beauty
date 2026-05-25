// ===================================================================
// MAIN APP CONTROLLER - FaceLab Beauty
// ===================================================================
import {
  analyzeFace, detectProblems, determineFaceType,
  calcScore, gradeFromScore, buildMetricsList, FM,
} from './analyzer.js';
import { EXERCISES, getMeta, CONTRA_LABEL, TIME_OF_DAY_LABEL, TOOLS_LABEL } from './exercises.js';
import { pickTodayMenu, build30DayProgram } from './program.js';
import { getKnowledgeFor } from './knowledge.js';
import { buildMotionPlayerHTML, initMotionPlayer } from './motion.js';
import {
  saveSnapshot, listSnapshots, clearHistory, deleteSnapshot,
  thumbnailFromCanvas, buildSnapshotMeta,
} from './progress.js';

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

// 優先チップ: ダブルクリックで is-priority トグル(最大3つ)
document.addEventListener('DOMContentLoaded', () => {
  const chipsRoot = document.getElementById('symptom-chips');
  if (!chipsRoot) return;
  chipsRoot.addEventListener('dblclick', (e) => {
    const lbl = e.target.closest('label.chip');
    if (!lbl) return;
    const cb = lbl.querySelector('input[type="checkbox"]');
    if (!cb) return;
    // 優先化はチェックが入っているもののみ
    if (!cb.checked) cb.checked = true;
    if (lbl.classList.contains('is-priority')){
      lbl.classList.remove('is-priority');
    } else {
      const current = chipsRoot.querySelectorAll('label.chip.is-priority').length;
      if (current >= 3){
        // 一番古い優先(=最初の要素)を外す
        const first = chipsRoot.querySelector('label.chip.is-priority');
        first?.classList.remove('is-priority');
      }
      lbl.classList.add('is-priority');
    }
    e.preventDefault();
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

const USER_PREFS_KEY = 'facelab.userPrefs.v1';
function saveUserPrefs(){
  try {
    localStorage.setItem(USER_PREFS_KEY, JSON.stringify({
      ageGroup: state.ageGroup, timeBudget: state.timeBudget, goal: state.goal,
      lifestyle: state.lifestyle, contra: state.contra,
      lifeStage: state.lifeStage, timeOfDay: state.timeOfDay,
    }));
  } catch {}
}
function loadUserPrefs(){
  try {
    const raw = localStorage.getItem(USER_PREFS_KEY);
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
    };
    img.src = url;
  });
}
setupFileInput();

function updateAnalyzeBtn(){ els.btnAnalyze.disabled = !state.imgFace; }

function collectSymptoms(){
  state.symptoms = Array.from(
    els.symptomChips.querySelectorAll('input[type="checkbox"]:checked')
  ).map(el => el.value);
  state.symptomFree = (els.symptomFree.value || '').trim();
}

// ===================================================================
// MEDIAPIPE FACE LANDMARKER
// ===================================================================
async function loadLandmarker(){
  if (state.landmarker) return state.landmarker;
  setLoader('MediaPipe Visionモデルを読み込んでいます…');
  const vision = await import('https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/vision_bundle.mjs');
  const fileset = await vision.FilesetResolver.forVisionTasks(
    'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.9/wasm'
  );
  setLoader('顔ランドマーク推定モデル(468点)を初期化中…');
  state.landmarker = await vision.FaceLandmarker.createFromOptions(fileset, {
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
  return state.landmarker;
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
}
function hideLoader(){
  els.loader.hidden = true;
  els.btnAnalyze.disabled = false;
}

// ===================================================================
// ANALYZE FLOW
// ===================================================================
els.btnAnalyze.addEventListener('click', async () => {
  try {
    setLoader('顔写真を解析中… 468点のランドマークを検出しています');
    const lms = await detectFace(state.imgFace);
    if (!lms){
      alert('顔を検出できませんでした。正面でピントの合った写真をご使用ください。');
      hideLoader();
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
      const thumb = thumbnailFromCanvas(els.canvasFace, 240);
      const meta = buildSnapshotMeta({
        score, grade, percentile,
        faceType: type.name,
        ageGroup: state.ageGroup,
        goal: state.goal,
        problems: state.problems,
        metrics: state.result.metrics,
      });
      saveSnapshot({ thumbDataUrl: thumb, meta });
      renderProgress();
    } catch(e){ console.warn('[progress] save failed', e); }

    hideLoader();
    els.results.hidden = false;
    els.results.classList.add('fade-in');
    setTimeout(() => els.results.scrollIntoView({behavior:'smooth', block:'start'}), 100);

  } catch (e){
    console.error(e);
    alert('解析中にエラーが発生しました。\n\n' + e.message);
    hideLoader();
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
  renderKnowledge();
  renderToday();
  renderProgramMeta();
  renderProgram(state.currentPhase);
  renderProgress();
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

// ===== Progress (履歴) =====
const METRIC_LABEL = {
  midlineTilt:'中心軸の傾き', eyeHeightDiff:'目の高さ差', browHeightDiff:'眉の高さ差',
  mouthTilt:'口角の傾き', jawSlackRatio:'フェイスラインのたるみ', mouthCornerDrop:'口角の下がり',
  nasolabialDepth:'ほうれい線の深さ', puffinessIdx:'むくみ指数',
};
function renderProgress(){
  const snaps = listSnapshots();
  if (els.progressStat) els.progressStat.textContent = `履歴: ${snaps.length}件`;
  if (els.btnCompare) els.btnCompare.disabled = snaps.length < 2;
  if (!els.progressTimeline) return;
  if (snaps.length === 0){
    els.progressEmpty.hidden = false;
    els.progressTimeline.innerHTML = '';
    if (els.baStage) els.baStage.hidden = true;
    return;
  }
  els.progressEmpty.hidden = true;
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
      <button class="progress-del" data-id="${s.id}" title="削除">×</button>
    </div>
  `;
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
  const metricRows = Object.keys(km2)
    .filter(k => k in km1)
    .map(k => {
      const d = (km2[k] - km1[k]);
      const dStr = (d >= 0 ? '+' : '') + (Math.round(d*1000)/1000);
      // 多くの指標は 0 に近いほど良いので、|after| - |before| を改善符号とする
      const improve = Math.abs(km2[k]) - Math.abs(km1[k]); // - なら改善
      const cls = improve < 0 ? 'up' : improve > 0 ? 'down' : 'flat';
      return `<div class="ba-row ${cls}"><span>${METRIC_LABEL[k] || k}</span><i>${km1[k]} → ${km2[k]}</i><b>${dStr}</b></div>`;
    }).join('');
  els.baMeta.innerHTML = `
    <div class="ba-summary"><strong>${days}日</strong> でスコア <span class="ba-delta ${tone}">${sign}${sd}</span> 変化</div>
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
// 起動時にも履歴表示を更新(結果未表示でも履歴は残るが、UIは hidden 内なので影響なし)
document.addEventListener('DOMContentLoaded', () => {
  loadUserPrefs();
  // 保存済プリファレンスをフォームに反映
  applyUserPrefsToForm();
  renderProgress();
});

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
  const { grade, desc } = gradeFromScore(score, { ageGroup: state.ageGroup });
  els.scoreValue.textContent = score;
  els.scoreGrade.textContent = grade;
  els.scoreDesc.textContent = desc;
  const circ = 2 * Math.PI * 52;
  els.scoreArc.setAttribute('stroke-dashoffset', circ - (score/100) * circ);

  const type = determineFaceType(state.problems, state.result.metrics);
  els.faceType.textContent = type.name;
  els.faceTypeDesc.textContent = type.desc;
  els.faceTypeTags.innerHTML = type.tags.map(t => `<span>${t}</span>`).join('');
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
              <strong>🔴 短縮 / 過緊張</strong>
              <ul>${p.tissues.tight.map(t=>`<li>${t}</li>`).join('') || '<li>—</li>'}</ul>
            </div>
            <div class="tissue weak">
              <strong>🟡 弱化 / 機能低下</strong>
              <ul>${p.tissues.weak.map(t=>`<li>${t}</li>`).join('') || '<li>—</li>'}</ul>
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
  // 30日プログラムの Day1 の training を流用(同じ設計ロジック)
  const day1 = state.program?.[0];
  if (!day1) return;
  els.todayGrid.innerHTML = day1.training.map(ex => exerciseCard(ex)).join('');
  bindExerciseCards(els.todayGrid);
  if (els.todayReason && day1.reason){
    els.todayReason.innerHTML = `<span class="reason-title">🎯 なぜ今日この${day1.training.length}種なのか</span>${escapeHtml(day1.reason)}`;
  }
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
  els.programGrid.innerHTML = days.map(d => dayCard(d)).join('');
  els.programGrid.querySelectorAll('.day-card').forEach(card => {
    card.addEventListener('click', () => {
      const day = +card.dataset.day;
      openDayModal(state.program.find(d => d.day === day));
    });
  });
}
function dayCard(d){
  return `
    <div class="day-card ${d.isRest?'rest':''}" data-day="${d.day}">
      <span class="day-badge">${d.isRest?'REST':'WORK'}</span>
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
    <div class="modal-ex-head">
      <div class="modal-ex-illust">${ex.illustration}</div>
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
      <h4>🎬 動画ガイド (タイマー付き)</h4>
      ${buildMotionPlayerHTML(ex.id)}
    </div>
    <div class="modal-section">
      <h4>🎯 ターゲット筋</h4>
      <ul>${ex.targets.map(t=>`<li>${t}</li>`).join('')}</ul>
    </div>
    <div class="modal-section">
      <h4>📋 やり方</h4>
      <ol>${ex.how.map(s=>`<li>${s}</li>`).join('')}</ol>
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
  // 動画ガイドプレイヤー初期化
  const player = els.modalBody.querySelector('.motion-player');
  if (player) initMotionPlayer(player, ex.id);
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
function closeModal(){ els.modal.hidden = true; document.body.style.overflow = ''; }
els.modal.addEventListener('click', e => { if (e.target.matches('[data-close]')) closeModal(); });
document.addEventListener('keydown', e => { if (e.key==='Escape' && !els.modal.hidden) closeModal(); });

els.btnRestart.addEventListener('click', () => {
  els.results.hidden = true;
  document.getElementById('upload-section').scrollIntoView({behavior:'smooth'});
});
els.btnPrint.addEventListener('click', () => window.print());
