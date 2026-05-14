// ===================================================================
// FACE ANALYZER
// MediaPipe Face Landmarker (468 points) を用いた顔解析エンジン
// 出力:
//   - metrics: 数値指標
//   - problems: 検出された問題(severity, tissues, etc.)
//   - score: 100点満点
//   - faceType: 顔タイプ
// ===================================================================

// ===== MediaPipe Face Landmarker 主要インデックス =====
// 参考: https://developers.google.com/mediapipe/solutions/vision/face_landmarker
export const FM = {
  // 目
  L_EYE_OUTER: 33,   L_EYE_INNER: 133,  L_EYE_TOP: 159,  L_EYE_BOTTOM: 145,
  R_EYE_OUTER: 263,  R_EYE_INNER: 362,  R_EYE_TOP: 386,  R_EYE_BOTTOM: 374,

  // 眉
  L_BROW_INNER: 55,  L_BROW_PEAK: 65,   L_BROW_OUTER: 105,
  R_BROW_INNER: 285, R_BROW_PEAK: 295,  R_BROW_OUTER: 334,

  // 鼻
  NOSE_TIP: 1,       NOSE_BRIDGE: 6,    NOSE_BOTTOM: 2,
  NOSE_L: 129,       NOSE_R: 358,

  // 口
  MOUTH_L: 61,       MOUTH_R: 291,
  MOUTH_TOP: 13,     MOUTH_BOTTOM: 14,
  UPPER_LIP_TOP: 0,  LOWER_LIP_BOTTOM: 17,

  // 輪郭(フェイスライン)
  CHIN: 152,
  JAW_L: 172,  JAW_R: 397,
  CHEEK_L: 234, CHEEK_R: 454,
  FOREHEAD: 10,
  TEMPLE_L: 127, TEMPLE_R: 356,

  // 頬骨・もみあげ
  ZYGO_L: 117,  ZYGO_R: 346,

  // ほうれい線(目印)
  NASOLABIAL_L: 207, NASOLABIAL_R: 427,
};

// ===== 幾何ユーティリティ =====
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const angleDeg = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;

// 顔の基準スケール(瞳孔間距離≒目の中心間距離)
function faceScale(lms){
  const lEye = midpoint(lms[FM.L_EYE_INNER], lms[FM.L_EYE_OUTER]);
  const rEye = midpoint(lms[FM.R_EYE_INNER], lms[FM.R_EYE_OUTER]);
  return dist(lEye, rEye); // 単位スケール
}

// ===== 顔分析の中核 =====
// 463x face landmark → metrics
export function analyzeFace(lms){
  const scale = faceScale(lms);

  // --- 1. 左右非対称(目・眉・口の高さ差) ---
  // 顔の中心線: 鼻ブリッジ→鼻先→顎の傾き
  const noseBridge = lms[FM.NOSE_BRIDGE];
  const chin = lms[FM.CHIN];
  const midlineTilt = angleDeg(noseBridge, chin) - 90; // 垂直からのズレ(deg)

  // 目の高さ差
  const lEyeCtr = midpoint(lms[FM.L_EYE_INNER], lms[FM.L_EYE_OUTER]);
  const rEyeCtr = midpoint(lms[FM.R_EYE_INNER], lms[FM.R_EYE_OUTER]);
  const eyeHeightDiff = (rEyeCtr.y - lEyeCtr.y) / scale; // 比率

  // 眉の高さ差
  const lBrow = lms[FM.L_BROW_PEAK];
  const rBrow = lms[FM.R_BROW_PEAK];
  const browHeightDiff = (rBrow.y - lBrow.y) / scale;

  // 口角の高さ差
  const mL = lms[FM.MOUTH_L];
  const mR = lms[FM.MOUTH_R];
  const mouthTilt = (mR.y - mL.y) / scale; // +なら右下がり

  // 総合非対称スコア(0-100, 0=完全対称)
  const asymmetryScore =
    (Math.abs(eyeHeightDiff) * 600) +
    (Math.abs(browHeightDiff) * 500) +
    (Math.abs(mouthTilt) * 700) +
    (Math.abs(midlineTilt) * 4);

  // --- 2. 口角下がり ---
  // 口角と上唇中央の縦位置を比較。下がり=口角が下唇中央より下にある度合い。
  const lipMidY = midpoint(lms[FM.MOUTH_TOP], lms[FM.MOUTH_BOTTOM]).y;
  const lCornerDrop = (mL.y - lipMidY) / scale; // +で下がり
  const rCornerDrop = (mR.y - lipMidY) / scale;
  const mouthCornerDrop = (lCornerDrop + rCornerDrop) / 2;

  // --- 3. ほうれい線の深さ(間接推定) ---
  // 鼻翼から口角への距離 × 頬の幅。深いほど短くなり頬が落ちる。
  const nasoL = dist(lms[FM.NOSE_L], lms[FM.MOUTH_L]) / scale;
  const nasoR = dist(lms[FM.NOSE_R], lms[FM.MOUTH_R]) / scale;
  const nasolabialIndex = (nasoL + nasoR) / 2; // 小さいほど"落ちている"

  // --- 4. たるみ・フェイスラインのシャープさ ---
  // 顎先(152)から両頬骨(234/454)へのライン角度。
  // 鋭角=シャープ、鈍角=丸み/たるみ
  const zL = lms[FM.CHEEK_L];
  const zR = lms[FM.CHEEK_R];
  const jawSharpness = (() => {
    const a = angleDeg(zL, chin);
    const b = angleDeg(zR, chin);
    return Math.abs(a - b); // 大きいほどシャープ
  })();

  // 頬位置(高さ): 頬骨が目線よりどれだけ下にあるか(下がるほど"たるみ")
  const eyeLineY = (lEyeCtr.y + rEyeCtr.y) / 2;
  const cheekDrop = ((zL.y + zR.y)/2 - eyeLineY) / scale;

  // --- 5. むくみ(下まぶた・フェイスライン幅) ---
  // 顔の横幅 / 縦幅。値が大きいほど"丸顔・むくみ寄り"
  const forehead = lms[FM.FOREHEAD];
  const faceWidth  = dist(lms[FM.CHEEK_L], lms[FM.CHEEK_R]);
  const faceHeight = dist(forehead, chin);
  const faceWHRatio = faceWidth / faceHeight; // 黄金比=約0.67

  // 下まぶたの腫れ(目の縦幅と相対比較)
  const lEyeH = dist(lms[FM.L_EYE_TOP], lms[FM.L_EYE_BOTTOM]) / scale;
  const rEyeH = dist(lms[FM.R_EYE_TOP], lms[FM.R_EYE_BOTTOM]) / scale;
  const eyeOpenness = (lEyeH + rEyeH) / 2; // 小さい=むくみ/疲労感

  // --- 6. パーツバランス(三庭五眼・黄金比) ---
  // 三庭: 額〜眉、眉〜鼻、鼻〜顎 がほぼ等しい
  const browY = (lBrow.y + rBrow.y) / 2;
  const noseBottomY = lms[FM.NOSE_BOTTOM].y;
  const t1 = (browY - forehead.y); // 上庭
  const t2 = (noseBottomY - browY); // 中庭
  const t3 = (chin.y - noseBottomY); // 下庭
  const tSum = t1 + t2 + t3;
  const triPct = [t1/tSum, t2/tSum, t3/tSum]; // 理想 [0.33,0.33,0.33]

  // 五眼: 顔幅 = 目幅 × 5
  const eyeW = dist(lms[FM.L_EYE_INNER], lms[FM.L_EYE_OUTER]);
  const fiveEyesIdx = faceWidth / eyeW; // 理想 5.0

  // 目の間隔(目幅基準)
  const interocular = dist(lms[FM.L_EYE_INNER], lms[FM.R_EYE_INNER]);
  const interocularIdx = interocular / eyeW; // 理想 ≒ 1.0

  // 鼻幅(目幅比)
  const noseWidth = dist(lms[FM.NOSE_L], lms[FM.NOSE_R]);
  const noseWidthIdx = noseWidth / eyeW; // 理想 ≒ 1.0

  // 口幅(目幅比)
  const mouthWidth = dist(mL, mR);
  const mouthWidthIdx = mouthWidth / eyeW; // 理想 ≒ 1.5

  return {
    scale,
    landmarksRaw: lms,
    metrics: {
      midlineTilt,         // deg
      eyeHeightDiff,
      browHeightDiff,
      mouthTilt,
      asymmetryScore,
      mouthCornerDrop,
      nasolabialIndex,
      jawSharpness,
      cheekDrop,
      faceWHRatio,
      eyeOpenness,
      triPct,
      fiveEyesIdx,
      interocularIdx,
      noseWidthIdx,
      mouthWidthIdx,
    },
  };
}

// ===================================================================
// PROBLEM DETECTION
// metrics → 問題リスト(severity, tissues)
// ===================================================================
export function detectProblems(result){
  const m = result.metrics;
  const out = [];

  // 1. 左右非対称
  if (m.asymmetryScore > 7 || Math.abs(m.midlineTilt) > 2.5){
    out.push({
      key: 'facialAsymmetry',
      severity: m.asymmetryScore > 15 ? 'high' : m.asymmetryScore > 10 ? 'mid' : 'low',
      title: '顔の左右非対称',
      description: '目・眉・口角の高さに左右差が見られます。表情筋の使い方の偏り、噛み癖、頬杖・寝姿勢などが要因となりやすい状態です。',
      tissues: {
        tight: ['側頭筋(片側)','咬筋(片側)','広頸筋','胸鎖乳突筋'],
        weak: ['口角挙筋(反対側)','大頬骨筋(反対側)','眼輪筋(下垂側)'],
      },
      metric: `非対称スコア ${m.asymmetryScore.toFixed(1)} / 中心軸ズレ ${m.midlineTilt.toFixed(1)}°`,
    });
  }

  // 2. 口角下がり
  if (m.mouthCornerDrop > 0.015){
    out.push({
      key: 'mouthCornerDown',
      severity: m.mouthCornerDrop > 0.04 ? 'high' : m.mouthCornerDrop > 0.025 ? 'mid' : 'low',
      title: '口角下がり',
      description: '口角が下唇中央より下にある状態です。口角下制筋の過緊張と、口角挙筋・大頬骨筋の弱化が起こりやすく、表情が暗く見える原因に。',
      tissues: {
        tight: ['口角下制筋','下唇下制筋','広頸筋','オトガイ筋'],
        weak: ['口角挙筋','大頬骨筋','小頬骨筋','頬筋'],
      },
      metric: `口角下垂指数 ${m.mouthCornerDrop.toFixed(3)}`,
    });
  }

  // 3. ほうれい線(頬の下垂)
  if (m.nasolabialIndex < 0.42){
    out.push({
      key: 'nasolabialFold',
      severity: m.nasolabialIndex < 0.34 ? 'high' : m.nasolabialIndex < 0.38 ? 'mid' : 'low',
      title: 'ほうれい線・頬下垂',
      description: '鼻翼から口角の距離が短く、頬の脂肪体が下方に落ちている可能性があります。大頬骨筋・上唇挙筋の弱化と、SMAS筋膜の緩みが背景に。',
      tissues: {
        tight: ['咬筋','口輪筋','下唇下制筋'],
        weak: ['大頬骨筋','小頬骨筋','上唇挙筋','上唇鼻翼挙筋'],
      },
      metric: `鼻翼-口角距離指数 ${m.nasolabialIndex.toFixed(3)}`,
    });
  }

  // 4. たるみ(フェイスライン不鮮明)
  if (m.jawSharpness < 8 || m.cheekDrop > 0.55){
    out.push({
      key: 'jawSagging',
      severity: m.jawSharpness < 5 ? 'high' : m.jawSharpness < 7 ? 'mid' : 'low',
      title: 'フェイスラインのたるみ',
      description: '顎先から頬骨へのラインが鈍く、輪郭がぼやけている状態。広頸筋・咬筋の過緊張と、舌骨上筋群・首前面の弱化が要因です。',
      tissues: {
        tight: ['広頸筋','咬筋','胸鎖乳突筋','側頭筋'],
        weak: ['舌骨上筋群','顎二腹筋','頬筋','口角挙筋'],
      },
      metric: `輪郭シャープネス ${m.jawSharpness.toFixed(1)} / 頬下垂 ${m.cheekDrop.toFixed(2)}`,
    });
  }

  // 5. むくみ(丸顔指数・目の腫れぼったさ)
  if (m.faceWHRatio > 0.78 || m.eyeOpenness < 0.085){
    out.push({
      key: 'puffiness',
      severity: m.faceWHRatio > 0.85 ? 'high' : m.faceWHRatio > 0.81 ? 'mid' : 'low',
      title: '顔のむくみ',
      description: '顔の横幅が広く、目元が腫れぼったい印象です。リンパの滞り、表情筋の循環不足、塩分・水分代謝が背景となります。',
      tissues: {
        tight: ['咬筋','広頸筋','胸鎖乳突筋'],
        weak: ['眼輪筋','頬筋','顎二腹筋','舌筋'],
      },
      metric: `顔W/H ${m.faceWHRatio.toFixed(2)} / 開瞼度 ${m.eyeOpenness.toFixed(3)}`,
    });
  }

  // 6. パーツバランス(黄金比からのズレ)
  const triDev = Math.max(
    Math.abs(m.triPct[0] - 0.333),
    Math.abs(m.triPct[1] - 0.333),
    Math.abs(m.triPct[2] - 0.333),
  );
  const fiveEyesDev = Math.abs(m.fiveEyesIdx - 5.0);
  if (triDev > 0.05 || fiveEyesDev > 0.6){
    out.push({
      key: 'partsBalance',
      severity: (triDev > 0.08 || fiveEyesDev > 1.0) ? 'mid' : 'low',
      title: 'パーツバランスのズレ',
      description: '三庭(額・中顔面・下顔面)または五眼(顔幅 ÷ 目幅 ≒ 5)の理想バランスからズレがあります。骨格は変えられませんが、筋肉と姿勢で印象は変えられます。',
      tissues: {
        tight: ['咬筋','側頭筋','後頭下筋群'],
        weak: ['前頭筋','眼輪筋','大頬骨筋'],
      },
      metric: `三庭最大偏差 ${(triDev*100).toFixed(1)}% / 五眼指数 ${m.fiveEyesIdx.toFixed(2)}`,
    });
  }

  // 7. 何もなければ general
  if (out.length === 0){
    out.push({
      key: 'general',
      severity: 'low',
      title: '美顔キープ',
      description: '大きな問題は検出されませんでした。表情筋の柔軟性とリフトアップを維持しましょう。',
      tissues: { tight: [], weak: [] },
      metric: '良好',
    });
  }

  return out;
}

// ===================================================================
// FACE TYPE (顔タイプ)
// ===================================================================
export function determineFaceType(problems, metrics){
  const keys = new Set(problems.map(p => p.key));

  if (keys.has('facialAsymmetry') && keys.has('jawSagging')){
    return {
      name: '左右差・たるみ複合タイプ',
      desc: '表情筋の使い方の偏りと輪郭の緩みが同居しています。左右バランスの調整と引き上げを並行で行うのが効果的。',
      tags: ['#左右差','#フェイスライン','#リフトアップ'],
    };
  }
  if (keys.has('mouthCornerDown') && keys.has('nasolabialFold')){
    return {
      name: '下顔面下垂タイプ',
      desc: '口角下がりとほうれい線が目立つ状態。大頬骨筋・口角挙筋の活性が鍵です。',
      tags: ['#口角UP','#ほうれい線','#中顔面'],
    };
  }
  if (keys.has('puffiness') && metrics.faceWHRatio > 0.8){
    return {
      name: 'むくみ・丸顔タイプ',
      desc: 'リンパの停滞と表情筋の循環低下が特徴。流して動かすアプローチが有効。',
      tags: ['#むくみ','#リンパ','#小顔'],
    };
  }
  if (keys.has('partsBalance')){
    return {
      name: 'パーツバランス調整タイプ',
      desc: '骨格そのものは変えられませんが、表情筋・姿勢・血流で印象を整えることは十分可能です。',
      tags: ['#黄金比','#三庭五眼','#印象UP'],
    };
  }
  if (keys.has('facialAsymmetry')){
    return {
      name: '左右非対称タイプ',
      desc: '噛み癖・頬杖・寝姿勢のクセが出ている可能性。両側均等な筋活動を取り戻します。',
      tags: ['#左右差','#噛み癖','#バランス'],
    };
  }
  if (keys.has('jawSagging')){
    return {
      name: 'フェイスラインたるみタイプ',
      desc: '広頸筋・咬筋の緊張をリセットしつつ、首前面と舌骨上筋群を起こします。',
      tags: ['#二重あご','#輪郭','#首前面'],
    };
  }
  return {
    name: '美顔キープタイプ',
    desc: '良好な状態。維持トレーニングで未来の自分への投資を。',
    tags: ['#維持','#予防','#美顔'],
  };
}

// ===================================================================
// SCORE
// ===================================================================
export function calcScore(result, problems){
  let score = 100;
  problems.forEach(p => {
    if (p.key === 'general') return;
    score -= p.severity === 'high' ? 18 : p.severity === 'mid' ? 11 : 5;
  });
  return Math.max(35, Math.min(100, Math.round(score)));
}

export function gradeFromScore(score){
  if (score >= 90) return { grade: 'S', desc: '完成度の高い理想バランス。維持と予防が中心です。' };
  if (score >= 80) return { grade: 'A', desc: '良好。気になる箇所をピンポイントで整えれば完璧に。' };
  if (score >= 70) return { grade: 'B', desc: '伸びしろあり。表情筋トレで明確な変化が出る段階。' };
  if (score >= 60) return { grade: 'C', desc: '改善の好機。30日で見た目印象は変えられます。' };
  return { grade: 'D', desc: '優先的にケアが必要。まずは習慣化から始めましょう。' };
}

// ===================================================================
// METRICS LIST (表示用)
// ===================================================================
export function buildMetricsList(result){
  const m = result.metrics;

  function sev(value, [okMax, midMax]){
    const v = Math.abs(value);
    if (v <= okMax) return { sev:'good', pct: 100 - (v/okMax*40) };
    if (v <= midMax) return { sev:'mid',  pct: 60 - ((v-okMax)/(midMax-okMax)*30) };
    return { sev:'bad', pct: 25 };
  }

  const items = [
    {
      name: '中心軸の傾き',
      raw: m.midlineTilt,
      value: `${m.midlineTilt.toFixed(1)}°`,
      detail: '鼻ブリッジ→顎の垂直からのズレ',
      ...sev(m.midlineTilt, [1.5, 3.5]),
    },
    {
      name: '非対称スコア',
      raw: m.asymmetryScore,
      value: m.asymmetryScore.toFixed(1),
      detail: '目・眉・口角の高さ差の総合',
      ...sev(m.asymmetryScore, [7, 15]),
    },
    {
      name: '口角の位置',
      raw: m.mouthCornerDrop,
      value: m.mouthCornerDrop > 0 ? `下垂 ${(m.mouthCornerDrop*100).toFixed(1)}` : `上向き ${(Math.abs(m.mouthCornerDrop)*100).toFixed(1)}`,
      detail: '下唇中央に対する口角の位置',
      ...sev(Math.max(0, m.mouthCornerDrop), [0.015, 0.035]),
    },
    {
      name: 'ほうれい線指数',
      raw: m.nasolabialIndex,
      value: m.nasolabialIndex.toFixed(3),
      detail: '鼻翼→口角の距離(大きいほど良好)',
      ...sev(Math.max(0, 0.46 - m.nasolabialIndex), [0.02, 0.06]),
    },
    {
      name: '輪郭シャープネス',
      raw: m.jawSharpness,
      value: m.jawSharpness.toFixed(1),
      detail: '頬骨→顎先のライン角度(大きいほど明瞭)',
      ...sev(Math.max(0, 10 - m.jawSharpness), [2, 5]),
    },
    {
      name: '顔の横/縦比',
      raw: m.faceWHRatio,
      value: m.faceWHRatio.toFixed(2),
      detail: '理想 ≒ 0.67(小さいほど縦長・引き締まり)',
      ...sev(Math.max(0, m.faceWHRatio - 0.7), [0.05, 0.12]),
    },
    {
      name: '五眼指数',
      raw: m.fiveEyesIdx,
      value: m.fiveEyesIdx.toFixed(2),
      detail: '顔幅 ÷ 目幅(理想 5.0)',
      ...sev(Math.abs(m.fiveEyesIdx - 5.0), [0.4, 0.8]),
    },
    {
      name: '三庭バランス',
      raw: 0,
      value: m.triPct.map(p => (p*100).toFixed(0) + '%').join(' / '),
      detail: '上庭/中庭/下庭(理想 33% / 33% / 33%)',
      ...sev(Math.max(
        Math.abs(m.triPct[0]-0.333),
        Math.abs(m.triPct[1]-0.333),
        Math.abs(m.triPct[2]-0.333),
      ), [0.04, 0.08]),
    },
  ];

  return items.map(it => ({ ...it, pct: Math.max(15, Math.min(100, it.pct)) }));
}
