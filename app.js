// ===================================================================
// MAIN APP CONTROLLER - FaceLab Beauty
// ===================================================================
import {
  analyzeFace, detectProblems, determineFaceType,
  calcScore, gradeFromScore, buildMetricsList, FM,
} from './analyzer.js';
import { EXERCISES } from './exercises.js';
import { pickTodayMenu, build30DayProgram } from './program.js';
import { getKnowledgeFor } from './knowledge.js';

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
};

const state = {
  imgFace: null,
  landmarker: null,
  result: null,
  problems: [],
  program: null,
  currentPhase: 1,
  symptoms: [],
  symptomFree: '',
};

// ===== Symptom → Problem mapping =====
const SYMPTOM_MAP = {
  asymEye:      { label:'目の左右差',           keys:['facialAsymmetry'] },
  asymMouth:    { label:'口角の左右差',         keys:['facialAsymmetry','mouthCornerDown'] },
  asymBrow:     { label:'眉の高さの左右差',     keys:['facialAsymmetry'] },
  sagJaw:       { label:'フェイスラインのたるみ', keys:['jawSagging'] },
  doubleChin:   { label:'二重あご',             keys:['jawSagging'] },
  sagCheek:     { label:'頬のたるみ',           keys:['jawSagging','nasolabialFold'] },
  nasolabial:   { label:'ほうれい線',           keys:['nasolabialFold'] },
  mouthDown:    { label:'口角下がり',           keys:['mouthCornerDown'] },
  eyeBag:       { label:'目の下のたるみ・くま', keys:['puffiness'] },
  puffyMorning: { label:'朝のむくみ',           keys:['puffiness'] },
  roundFace:    { label:'丸顔・小顔になりたい', keys:['puffiness','jawSagging'] },
  smallEye:     { label:'目を大きく見せたい',   keys:['puffiness','partsBalance'] },
  bruxism:      { label:'食いしばり・噛み癖',   keys:['facialAsymmetry','jawSagging'] },
  flatCheek:    { label:'頬がコケて見える',     keys:['nasolabialFold','partsBalance'] },
};

// 症状から導かれた追加問題のメタ
const SYMPTOM_PROBLEM_META = {
  facialAsymmetry: { title:'顔の左右非対称', desc:'お悩みから推定。表情筋の使い方の偏り・噛み癖などが背景にある可能性が高いです。', tissues:{tight:['側頭筋(片側)','咬筋(片側)','広頸筋'], weak:['口角挙筋(反対側)','大頬骨筋(反対側)']} },
  mouthCornerDown: { title:'口角下がり', desc:'お悩みから推定。口角挙筋・大頬骨筋の弱化と、口角下制筋の過緊張が起こりやすい状態です。', tissues:{tight:['口角下制筋','下唇下制筋','広頸筋'], weak:['口角挙筋','大頬骨筋','小頬骨筋']} },
  nasolabialFold:  { title:'ほうれい線・頬下垂', desc:'お悩みから推定。中顔面の筋肉の弱化と頬脂肪体の下垂が起こりやすい状態です。', tissues:{tight:['咬筋','口輪筋'], weak:['大頬骨筋','上唇挙筋','上唇鼻翼挙筋']} },
  jawSagging:      { title:'フェイスラインのたるみ', desc:'お悩みから推定。広頸筋・咬筋の過緊張と、舌骨上筋群・首前面の弱化が要因です。', tissues:{tight:['広頸筋','咬筋','胸鎖乳突筋'], weak:['舌骨上筋群','顎二腹筋','頬筋']} },
  puffiness:       { title:'顔のむくみ', desc:'お悩みから推定。リンパの停滞と表情筋の循環不足が背景となります。', tissues:{tight:['咬筋','広頸筋'], weak:['眼輪筋','頬筋','顎二腹筋']} },
  partsBalance:    { title:'パーツバランスのズレ', desc:'お悩みから推定。骨格は変えられませんが、表情筋と姿勢で印象を整えられます。', tissues:{tight:['咬筋','側頭筋'], weak:['前頭筋','眼輪筋','大頬骨筋']} },
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
  return out;
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
    state.result = analyzeFace(lms);

    setLoader('問題点を抽出 → 30日プログラムを構築中…');
    collectSymptoms();
    state.problems = detectProblems(state.result);

    // 症状ベースで補完
    const symptomKeys = buildSymptomProblemKeys();
    const existing = new Set(state.problems.map(p => p.key));
    symptomKeys.forEach(k => {
      if (existing.has(k)) return;
      state.problems.push(makeSymptomProblem(k));
    });
    if (state.problems.length > 1){
      state.problems = state.problems.filter(p => p.key !== 'general');
    }
    state.program = build30DayProgram(state.problems.map(p=>p.key));

    renderAll();
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
  renderProblems();
  renderKnowledge();
  renderToday();
  renderProgram(state.currentPhase);
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
  const { grade, desc } = gradeFromScore(score);
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
  els.knowledgeGrid.innerHTML = cards.map(c => `
    <div class="know-card">
      <span class="know-tag">${c.tag}</span>
      <div class="know-emoji">${c.emoji}</div>
      <h3>${c.title}</h3>
      <p>${c.body}</p>
    </div>
  `).join('');
}

// ===== Today menu =====
function renderToday(){
  const menu = pickTodayMenu(state.problems.map(p => p.key));
  els.todayGrid.innerHTML = menu.training.map(ex => exerciseCard(ex)).join('');
  bindExerciseCards(els.todayGrid);
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
        <p style="font-size:13px; color:var(--ink-2); margin:10px 0 0">${ex.purpose}</p>
      </div>
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
}
function openDayModal(d){
  els.modalBody.innerHTML = `
    <div style="margin-bottom:24px">
      <div style="font-family:'Inter',sans-serif; font-size:12px; color:var(--brand); letter-spacing:.1em; font-weight:700">PHASE ${d.phase} · DAY ${d.day} ${d.isRest?'· REST':''}</div>
      <h2 style="margin:6px 0 4px; font-size:26px">${d.theme}</h2>
      <p style="color:var(--muted); font-size:13px; margin:0">${d.isRest ? '今日は流して整える日。軽めの4種目で循環を上げましょう。' : '今日のトレーニング4種。クリックで詳細表示。'}</p>
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
