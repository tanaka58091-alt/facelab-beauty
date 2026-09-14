// ===================================================================
// MOTION GUIDE v6 — 顔ヨガ120種・イラストと文章の「1ソース統合」
//
// ★設計: 手順は steps 配列 1箇所だけに定義する（部位別データファイル）。
//   - 絵 (buildStepPanelsHTML) … label + cue + overlay
//   - 文 (buildHowListHTML)    … text
//   どちらも同じ steps から同じ番号で生成されるため、
//   「①の絵」と「①の文」が構造的に必ず一致する。
//
// ★データの出どころ: 顔ヨガ／表情筋トレの一般的なメソッドと、
//   8週間の顔ヨガ研究（浅い層＝ゆるめる／機能筋＝鍛える）を踏まえて構成。
//
// ★id重複バグ対策: <defs> は MOTION_DEFS としてモーダルに1回だけ挿入（app.js）
// ===================================================================
import { MOTION_DEFS, FACE_BODY, UPPER_BODY } from './motion-helpers.js';
import { UPPER_MOTIONS } from './motion-data-upper.js';
import { MID_MOTIONS }   from './motion-data-mid.js';
import { LOWER_MOTIONS } from './motion-data-lower.js';
import { WHOLE_MOTIONS } from './motion-data-whole.js';
import { EXT_MOTIONS }   from './motion-data-ext.js';
// 生成済みの手順イラスト一覧（publish_steps.sh が illust/steps/*.webp から自動生成）
import { STEP_IMAGES } from './illust/steps-index.js';

export { MOTION_DEFS };

// 120種（既存76種 + 拡張44種）
const MOTIONS = {
  ...UPPER_MOTIONS,
  ...MID_MOTIONS,
  ...LOWER_MOTIONS,
  ...WHOLE_MOTIONS,
  ...EXT_MOTIONS,
};

export function listMotionIds(){ return Object.keys(MOTIONS); }

// ===================================================================
// 手順イラスト（画像版）
//   illust/steps/<種目ID>-<連番2桁>.webp を優先表示し、無ければ従来のSVGに戻す。
//   絵の無いステップ（「戻す」「完了」等）は共有画像を使う:
//     途中の絵なし → _shared-neutral（基準の無表情）／最後 → _shared-done（微笑み）
//   文とパネル番号は同じ steps[] から出るので、画像化しても「①の絵＝①の文」は崩れない。
// ===================================================================
export const STEP_IMG_BASE = './illust/steps/';
export function stepImageKey(exerciseId, steps, idx, base){
  const s = steps[idx];
  const hasOverlay = !!(s && (s.overlay || '').trim());
  const suffix = base === 'body' ? '-body' : '';   // 上半身ベースは上半身の共有画像を使う
  if (!hasOverlay) return (idx === steps.length - 1 ? '_shared-done' : '_shared-neutral') + suffix;
  return `${exerciseId}-${String(idx + 1).padStart(2, '0')}`;
}
export function stepImageSrc(exerciseId, steps, idx, base){
  if (base === undefined) base = (MOTIONS[exerciseId] || {}).base;
  return `${STEP_IMG_BASE}${stepImageKey(exerciseId, steps, idx, base)}.webp`;
}
// その種目の全ステップぶんの画像が揃っているか。
// 揃っていない種目は従来のSVGで表示し、1つの種目の中で画像とSVGが混ざらないようにする。
export function exerciseHasImages(exerciseId){
  const m = MOTIONS[exerciseId]; if (!m) return false;
  return m.steps.every((_, i) => STEP_IMAGES.has(stepImageKey(exerciseId, m.steps, i, m.base)));
}
// 一覧カード用の「代表ステップ」: キープ系 → 矢印のある最初のステップ → 2番目 の順で選ぶ
export function heroStepIndex(exerciseId){
  const steps = getMotion(exerciseId).steps;
  const has = (s, re) => re.test(s.overlay || '');
  let i = steps.findIndex((s, k) => k > 0 && k < steps.length - 1 && /キープ/.test(s.label || '') && (s.overlay || '').trim());
  if (i < 0) i = steps.findIndex((s, k) => k > 0 && k < steps.length - 1 && has(s, /mv-arrow/));
  if (i < 0) i = steps.findIndex((s, k) => k > 0 && k < steps.length - 1 && (s.overlay || '').trim());
  return i < 0 ? 0 : i;
}
export function heroImageSrc(exerciseId){
  if (!exerciseHasImages(exerciseId)) return null;
  const m = getMotion(exerciseId);
  return stepImageSrc(exerciseId, m.steps, heroStepIndex(exerciseId), m.base);
}

// ===================================================================
// 画像の上に「動かす場所・向き」を重ねるための座標変換
//   手順データの座標系(200×230・顔ベース)は、基準イラストの顔ランドマークを
//   実測して最小二乗で対応づけてある（誤差 約12〜16px / 1024px）。
//   これにより、矢印や目印は AI に描かせず、既存の手順データから正確な位置に重ねられる。
//   上半身ベース(base:'body')は上半身の基準画像から別途較正する（未較正なら重ねない）。
// ===================================================================
// 顔ベース: 線形（目・あご・口・眉・エラ 12点の最小二乗。誤差 約12〜16px）
const FACE_CAL = { sx: 4.312, tx: 76.1, sy: 3.385, ty: -21.7 };
// 上半身ベース: 手順データの体は首が長めなので、縦は区間ごとの補間で合わせる
//   （頭頂17→65 / 目46→269 / あご75→434 / 肩110→505 / 胸135→640 / お腹170→1000）
const BODY_CAL = { sx: 5.4, tx: -36,
  yKnots: [[17,65],[46,269],[75,434],[110,505],[135,640],[170,1000],[216,1200]] };
export function overlayCalibration(m){ return (m.base === 'body') ? BODY_CAL : FACE_CAL; }

function interp(knots, v){
  if (v <= knots[0][0]) { const [[a,b],[c,d]] = knots; return b + (v - a) * (d - b) / (c - a); }
  for (let i = 1; i < knots.length; i++){
    const [a,b] = knots[i-1], [c,d] = knots[i];
    if (v <= c) return b + (v - a) * (d - b) / (c - a);
  }
  const [a,b] = knots[knots.length-2], [c,d] = knots[knots.length-1];
  return b + (v - a) * (d - b) / (c - a);
}
export function remapOverlay(ov, cal){
  if (!ov || !cal) return '';
  const X = v => (cal.sx * v + cal.tx).toFixed(1);
  const Y = v => (cal.yKnots ? interp(cal.yKnots, v) : (cal.sy * v + cal.ty)).toFixed(1);
  const S = cal.yKnots ? cal.sx : (cal.sx + cal.sy) / 2;
  const path = d => d.replace(/([MLQTCS])\s*([^MLQTCSZmlqtcsz]+)/g, (_, c, nums) =>
    c + nums.trim().split(/[\s,]+/).map((n, i) => (i % 2 === 0 ? X(+n) : Y(+n))).join(' '));
  return ov
    .replace(/\bcx="(-?[\d.]+)"/g, (_, v) => `cx="${X(+v)}"`)
    .replace(/\bcy="(-?[\d.]+)"/g, (_, v) => `cy="${Y(+v)}"`)
    .replace(/\br="(-?[\d.]+)"/g,  (_, v) => `r="${(+v * S).toFixed(1)}"`)
    .replace(/\bx1="(-?[\d.]+)"/g, (_, v) => `x1="${X(+v)}"`)
    .replace(/\bx2="(-?[\d.]+)"/g, (_, v) => `x2="${X(+v)}"`)
    .replace(/\by1="(-?[\d.]+)"/g, (_, v) => `y1="${Y(+v)}"`)
    .replace(/\by2="(-?[\d.]+)"/g, (_, v) => `y2="${Y(+v)}"`)
    .replace(/<text x="(-?[\d.]+)" y="(-?[\d.]+)"/g, (_, x, y) => `<text x="${X(+x)}" y="${Y(+y)}"`)
    .replace(/translate\((-?[\d.]+),(-?[\d.]+)\)/g, (_, x, y) => `translate(${X(+x)},${Y(+y)})`)
    .replace(/\bd="([^"]+)"/g, (_, d) => `d="${path(d)}"`);
}

export function getMotion(exerciseId){
  const m = MOTIONS[exerciseId] || MOTIONS.cheekLift;
  const n = m.steps.length;
  const dur = m.duration || (n * 4);
  // step.t が無ければ均等割りで補完（アニメ再生用）
  const steps = m.steps.map((s, i) => ({ ...s, t: (s.t != null ? s.t : Math.round(i * dur / n)) }));
  return { ...m, duration: dur, steps };
}

// 「やり方（文章）」— パネルと同じ steps・同じ番号から生成
export function buildHowListHTML(exerciseId){
  const m = getMotion(exerciseId);
  return `<ol class="how-list">${m.steps.map(s => `<li>${s.text || s.cue || ''}</li>`).join('')}</ol>`;
}

// ===================================================================
// STEP PANELS — 手順パネル式イラスト（絵だけで手順が追える）
// ===================================================================
export function buildStepPanelsHTML(exerciseId){
  const m = getMotion(exerciseId);
  const baseBody = m.base === 'body' ? UPPER_BODY : FACE_BODY;
  const cal = overlayCalibration(m);
  const useImg = exerciseHasImages(exerciseId);
  const panels = m.steps.map((s, i) => {
    const overlay = s.overlay || '';
    const isDone = !overlay.trim();
    const onImg = useImg ? remapOverlay(overlay, cal) : '';
    return `
      <figure class="step-panel${isDone ? ' is-done' : ''}">
        <div class="step-panel-num">${i + 1}</div>
        <div class="step-panel-stage${useImg ? '' : ' no-img'}">
          ${useImg ? `<img class="step-panel-img" src="${stepImageSrc(exerciseId, m.steps, i, m.base)}" alt="${(s.label || '').replace(/"/g,'')}"
               loading="lazy" decoding="async" onerror="this.parentNode.classList.add('no-img')">` : ''}
          ${onImg ? `<svg viewBox="0 0 1024 1024" class="step-panel-overlay-img" aria-hidden="true">${onImg}</svg>` : ''}
          <svg viewBox="0 0 200 230" class="step-panel-svg" preserveAspectRatio="xMidYMid meet" role="img" aria-label="${(s.label || '').replace(/"/g,'')}">
            ${baseBody}
            <g class="step-panel-overlay">${overlay}</g>
          </svg>
        </div>
        <figcaption class="step-panel-cap">
          <div class="step-panel-label">${s.label || ''}${s.count ? ` <span class="step-panel-count">${s.count}</span>` : ''}</div>
          <div class="step-panel-cue">${s.cue || ''}</div>
        </figcaption>
      </figure>`;
  }).join('');

  return `
    <div class="step-guide" data-ex="${exerciseId}">
      <div class="step-guide-head">
        <div>
          <div class="step-guide-title">${m.name}</div>
          <div class="step-guide-reps">${m.reps || ''}</div>
        </div>
        <div class="step-legend">
          <span class="legend-item"><span class="legend-dot"></span>動かす場所</span>
          <span class="legend-item"><span class="legend-arrow pink">➜</span>動かす向き</span>
          <span class="legend-item"><span class="legend-arrow blue">➜</span>ふくらます/前へ/息</span>
        </div>
      </div>
      <div class="step-panels">${panels}</div>
      <details class="step-anim">
        <summary>▶ アニメで通して見る（タイマー付き）</summary>
        <div class="step-anim-mount" data-ex="${exerciseId}"></div>
      </details>
    </div>
  `;
}

export function buildMotionPlayerHTML(exerciseId){
  const m = getMotion(exerciseId);
  const baseBody = m.base === 'body' ? UPPER_BODY : FACE_BODY;
  return `
    <div class="motion-player" data-pattern="${exerciseId}" data-duration="${m.duration}">
      <div class="motion-stage${exerciseHasImages(exerciseId) ? '' : ' no-img'}">
        <div class="motion-img-wrap">
          <img class="motion-img" src="${STEP_IMG_BASE}_shared-neutral${m.base === 'body' ? '-body' : ''}.webp" alt="" decoding="async"
               onerror="this.closest('.motion-stage').classList.add('no-img')">
          <svg viewBox="0 0 1024 1024" class="motion-overlay-img" aria-hidden="true"></svg>
        </div>
        <svg viewBox="0 0 200 230" class="motion-svg" preserveAspectRatio="xMidYMid meet">
          ${baseBody}
          <g class="motion-overlay"></g>
        </svg>
        <div class="motion-badge">
          <span class="mv-name">${m.name}</span>
          <span class="mv-reps">${m.reps || ''}</span>
        </div>
      </div>
      <div class="motion-controls">
        <button class="motion-btn play" type="button" aria-label="再生">
          <span class="play-ico">▶</span><span class="pause-ico" hidden>❚❚</span>
        </button>
        <div class="motion-progress"><div class="motion-bar"></div></div>
        <div class="motion-time"><span class="motion-elapsed">0</span> / ${m.duration}秒</div>
        <button class="motion-btn reset" type="button" aria-label="リセット">↺</button>
      </div>
      <div class="motion-step">
        <div class="motion-step-row">
          <span class="motion-step-label">準備</span>
          <span class="motion-step-count"></span>
        </div>
        <div class="motion-step-cue">▶ ボタンで開始</div>
      </div>
    </div>
  `;
}

export function initMotionPlayer(rootEl, exerciseId){
  const m = getMotion(exerciseId);
  const playBtn  = rootEl.querySelector('.motion-btn.play');
  const resetBtn = rootEl.querySelector('.motion-btn.reset');
  const playIco  = playBtn.querySelector('.play-ico');
  const pauseIco = playBtn.querySelector('.pause-ico');
  const bar      = rootEl.querySelector('.motion-bar');
  const elapsedEl= rootEl.querySelector('.motion-elapsed');
  const labelEl  = rootEl.querySelector('.motion-step-label');
  const countEl  = rootEl.querySelector('.motion-step-count');
  const cueEl    = rootEl.querySelector('.motion-step-cue');
  const overlayG = rootEl.querySelector('.motion-overlay');
  const stage    = rootEl.querySelector('.motion-stage');
  const imgEl    = rootEl.querySelector('.motion-img');
  const imgOvG   = rootEl.querySelector('.motion-overlay-img');
  const cal      = overlayCalibration(m);
  // 画像版の手順イラストがある場合は、ステップごとに画像を差し替える（無ければSVGのまま）
  function setImage(idx){
    if (!imgEl || stage.classList.contains('no-img')) return;
    const src = idx == null ? `${STEP_IMG_BASE}_shared-neutral${m.base === 'body' ? '-body' : ''}.webp` : stepImageSrc(exerciseId, m.steps, idx, m.base);
    if (imgEl.getAttribute('src') !== src) imgEl.setAttribute('src', src);
    if (imgOvG) imgOvG.innerHTML = idx == null ? '' : remapOverlay(m.steps[idx].overlay || '', cal);
  }

  let playing = false, timerId = null, start = 0, elapsed = 0, currentStep = -1;

  function setOverlay(html){ overlayG.innerHTML = html || ''; }
  function findStep(t){
    let idx = 0;
    for (let i = 0; i < m.steps.length; i++){ if (m.steps[i].t <= t) idx = i; else break; }
    return idx;
  }
  function applyStep(idx){
    if (idx === currentStep) return;
    currentStep = idx;
    const s = m.steps[idx];
    if (!s) return;
    labelEl.textContent = s.label || '';
    countEl.textContent = s.count ? `(${s.count})` : '';
    cueEl.textContent = s.cue || '';
    setOverlay(s.overlay || '');
    setImage(idx);
  }
  function tick(){
    if (!playing) return;
    elapsed = (Date.now() - start) / 1000;
    if (elapsed >= m.duration){
      elapsed = m.duration;
      applyStep(m.steps.length - 1);
      bar.style.width = '100%';
      elapsedEl.textContent = Math.floor(elapsed);
      stop();
      labelEl.textContent = '完了';
      countEl.textContent = '';
      cueEl.textContent = 'おつかれさまでした 🌷';
      setOverlay('');
      return;
    }
    bar.style.width = ((elapsed / m.duration) * 100).toFixed(1) + '%';
    elapsedEl.textContent = Math.floor(elapsed);
    applyStep(findStep(elapsed));
  }
  function play(){
    if (playing) return;
    if (elapsed >= m.duration){ elapsed = 0; currentStep = -1; } // 完了後に▶を押したら最初から再生
    playing = true;
    start = Date.now() - elapsed * 1000;
    stage.classList.add('is-playing');
    playIco.hidden = true; pauseIco.hidden = false;
    if (timerId) clearInterval(timerId);
    timerId = setInterval(tick, 100);
    tick();
  }
  function pause(){
    playing = false;
    stage.classList.remove('is-playing');
    playIco.hidden = false; pauseIco.hidden = true;
    if (timerId){ clearInterval(timerId); timerId = null; }
  }
  function stop(){ pause(); }
  function reset(){
    pause(); elapsed = 0; currentStep = -1;
    bar.style.width = '0%'; elapsedEl.textContent = '0';
    applyStep(0);
  }
  playBtn.addEventListener('click', () => { playing ? pause() : play(); });
  resetBtn.addEventListener('click', reset);
  applyStep(0);
}
