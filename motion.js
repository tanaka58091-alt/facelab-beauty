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
  const panels = m.steps.map((s, i) => {
    const overlay = s.overlay || '';
    const isDone = !overlay.trim();
    return `
      <figure class="step-panel${isDone ? ' is-done' : ''}">
        <div class="step-panel-num">${i + 1}</div>
        <div class="step-panel-stage">
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
      <div class="motion-stage">
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
