// ===================================================================
// FACE ANALYZER v2 (高精度版)
// MediaPipe Face Landmarker (468 points) を用いた顔解析エンジン
//   + 頭部姿勢の正規化(roll補正)
//   + 加齢補正(年代別の閾値・percentile表示)
//   + 21指標 / 15問題タイプ / 18顔タイプ
// ===================================================================

// ===== MediaPipe Face Landmarker 主要インデックス =====
export const FM = {
  // 目
  L_EYE_OUTER: 33,   L_EYE_INNER: 133,  L_EYE_TOP: 159,  L_EYE_BOTTOM: 145,
  R_EYE_OUTER: 263,  R_EYE_INNER: 362,  R_EYE_TOP: 386,  R_EYE_BOTTOM: 374,
  // 上まぶた中央(まぶた重さ判定用)
  L_UPPER_LID: 158,  R_UPPER_LID: 385,
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
  // 輪郭
  CHIN: 152,
  JAW_L: 172,  JAW_R: 397,
  CHEEK_L: 234, CHEEK_R: 454,
  FOREHEAD: 10,
  TEMPLE_L: 127, TEMPLE_R: 356,
  // 頬骨・もみあげ
  ZYGO_L: 117,  ZYGO_R: 346,
  // 下顎角(エラ)
  GONION_L: 132, GONION_R: 361,
  // ほうれい線基点
  NASOLABIAL_L: 207, NASOLABIAL_R: 427,
};

// ===== 幾何ユーティリティ =====
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const angleDeg = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;

// ===== 頭部姿勢の正規化 (roll補正) =====
// 両目を結んだ線が水平になるように、すべてのランドマークを回転
function normalizeLandmarks(lms){
  const lEye = midpoint(lms[FM.L_EYE_INNER], lms[FM.L_EYE_OUTER]);
  const rEye = midpoint(lms[FM.R_EYE_INNER], lms[FM.R_EYE_OUTER]);
  // 注: 画像座標は左右が反転している場合あり。lEye.x < rEye.x になるよう確認
  const roll = Math.atan2(rEye.y - lEye.y, rEye.x - lEye.x); // 水平からのズレ(rad)
  const center = midpoint(lEye, rEye);
  const cos = Math.cos(-roll), sin = Math.sin(-roll);
  return {
    rollDeg: roll * 180 / Math.PI,
    landmarks: lms.map(p => {
      const dx = p.x - center.x, dy = p.y - center.y;
      return { x: center.x + dx*cos - dy*sin, y: center.y + dx*sin + dy*cos, z: p.z };
    }),
  };
}

function faceScale(lms){
  const lEye = midpoint(lms[FM.L_EYE_INNER], lms[FM.L_EYE_OUTER]);
  const rEye = midpoint(lms[FM.R_EYE_INNER], lms[FM.R_EYE_OUTER]);
  return dist(lEye, rEye);
}

// ===================================================================
// 顔分析: lms → metrics
// ===================================================================
export function analyzeFace(rawLms, opts={}){
  const norm = normalizeLandmarks(rawLms);
  const lms = norm.landmarks;
  const scale = faceScale(lms);

  // === 1. 左右非対称 ===
  const noseBridge = lms[FM.NOSE_BRIDGE];
  const chin = lms[FM.CHIN];
  const midlineTilt = angleDeg(noseBridge, chin) - 90;

  const lEyeCtr = midpoint(lms[FM.L_EYE_INNER], lms[FM.L_EYE_OUTER]);
  const rEyeCtr = midpoint(lms[FM.R_EYE_INNER], lms[FM.R_EYE_OUTER]);
  const eyeHeightDiff = (rEyeCtr.y - lEyeCtr.y) / scale;

  const lBrow = lms[FM.L_BROW_PEAK];
  const rBrow = lms[FM.R_BROW_PEAK];
  const browHeightDiff = (rBrow.y - lBrow.y) / scale;

  const mL = lms[FM.MOUTH_L];
  const mR = lms[FM.MOUTH_R];
  const mouthTilt = (mR.y - mL.y) / scale;

  const asymmetryScore =
    (Math.abs(eyeHeightDiff) * 600) +
    (Math.abs(browHeightDiff) * 500) +
    (Math.abs(mouthTilt) * 700) +
    (Math.abs(midlineTilt) * 4);

  // === 2. 口角下がり ===
  const lipMidY = midpoint(lms[FM.MOUTH_TOP], lms[FM.MOUTH_BOTTOM]).y;
  const lCornerDrop = (mL.y - lipMidY) / scale;
  const rCornerDrop = (mR.y - lipMidY) / scale;
  const mouthCornerDrop = (lCornerDrop + rCornerDrop) / 2;

  // === 3. ほうれい線 ===
  const nasoL = dist(lms[FM.NOSE_L], lms[FM.MOUTH_L]) / scale;
  const nasoR = dist(lms[FM.NOSE_R], lms[FM.MOUTH_R]) / scale;
  const nasolabialIndex = (nasoL + nasoR) / 2;

  // === 4. フェイスラインのシャープさ ===
  const zL = lms[FM.CHEEK_L];
  const zR = lms[FM.CHEEK_R];
  const jawSharpness = (() => {
    const a = angleDeg(zL, chin);
    const b = angleDeg(zR, chin);
    return Math.abs(a - b);
  })();

  // 頬位置(下垂)
  const eyeLineY = (lEyeCtr.y + rEyeCtr.y) / 2;
  const cheekDrop = ((zL.y + zR.y)/2 - eyeLineY) / scale;

  // === 5. むくみ ===
  const forehead = lms[FM.FOREHEAD];
  const faceWidth  = dist(lms[FM.CHEEK_L], lms[FM.CHEEK_R]);
  const faceHeight = dist(forehead, chin);
  const faceWHRatio = faceWidth / faceHeight;

  const lEyeH = dist(lms[FM.L_EYE_TOP], lms[FM.L_EYE_BOTTOM]) / scale;
  const rEyeH = dist(lms[FM.R_EYE_TOP], lms[FM.R_EYE_BOTTOM]) / scale;
  const eyeOpenness = (lEyeH + rEyeH) / 2;

  // === 6. 三庭・五眼 ===
  const browY = (lBrow.y + rBrow.y) / 2;
  const noseBottomY = lms[FM.NOSE_BOTTOM].y;
  const t1 = (browY - forehead.y);
  const t2 = (noseBottomY - browY);
  const t3 = (chin.y - noseBottomY);
  const tSum = t1 + t2 + t3;
  const triPct = [t1/tSum, t2/tSum, t3/tSum];

  const eyeW = dist(lms[FM.L_EYE_INNER], lms[FM.L_EYE_OUTER]);
  const fiveEyesIdx = faceWidth / eyeW;
  const interocular = dist(lms[FM.L_EYE_INNER], lms[FM.R_EYE_INNER]);
  const interocularIdx = interocular / eyeW;
  const noseWidth = dist(lms[FM.NOSE_L], lms[FM.NOSE_R]);
  const noseWidthIdx = noseWidth / eyeW;
  const mouthWidth = dist(mL, mR);
  const mouthWidthIdx = mouthWidth / eyeW;

  // === 7. NEW: エラ張り(下顎角の張り出し) ===
  // ゴニオン(下顎角)が頬骨より外に張り出しているか
  const mandibleWidth = dist(lms[FM.GONION_L], lms[FM.GONION_R]);
  const mandibleProminence = mandibleWidth / faceWidth; // 大きいほどエラ張り傾向

  // === 8. NEW: 頬コケ(zygo→cheek間の凹み) ===
  // 頬骨(zygo)と頬輪郭(cheek)の縦差。大きいほど頬骨が前に出てコケ印象
  const cheekHollowIdx = (lms[FM.CHEEK_L].y + lms[FM.CHEEK_R].y - lms[FM.ZYGO_L].y - lms[FM.ZYGO_R].y) / (2 * scale);

  // === 9. NEW: 人中の長さ ===
  // 鼻下端→上唇上端 の距離 / 鼻翼幅
  const philtrumLength = (lms[FM.UPPER_LIP_TOP].y - lms[FM.NOSE_BOTTOM].y) / scale;
  const philtrumIdx = philtrumLength; // 大きい=長い

  // === 10. NEW: まぶた重さ(フード度) ===
  // 眉→上まぶたの距離。小さいほどフード/まぶた重い
  const lBrowToLid = (lms[FM.L_UPPER_LID].y - lBrow.y) / scale;
  const rBrowToLid = (lms[FM.R_UPPER_LID].y - rBrow.y) / scale;
  const browLidGap = (lBrowToLid + rBrowToLid) / 2;

  // === 11. NEW: 目尻の角度(垂れ目/つり目) ===
  // 内→外の傾き。+ で目尻下がり(垂れ目)、- でつり目
  const lEyeSlant = (lms[FM.L_EYE_OUTER].y - lms[FM.L_EYE_INNER].y) / scale;
  const rEyeSlant = (lms[FM.R_EYE_OUTER].y - lms[FM.R_EYE_INNER].y) / scale;
  const eyeSlant = (lEyeSlant + rEyeSlant) / 2; // +で下垂

  // === 12. NEW: 顎の長さ(下顔面の縦) ===
  // 鼻下端→顎先 ÷ 顔幅
  const lowerFaceLength = (chin.y - noseBottomY) / scale;

  return {
    scale,
    landmarksRaw: rawLms,
    landmarksNorm: lms,
    rollDeg: norm.rollDeg,
    metrics: {
      // 既存
      midlineTilt, eyeHeightDiff, browHeightDiff, mouthTilt, asymmetryScore,
      mouthCornerDrop, nasolabialIndex, jawSharpness, cheekDrop,
      faceWHRatio, eyeOpenness, triPct, fiveEyesIdx,
      interocularIdx, noseWidthIdx, mouthWidthIdx,
      // 新規
      mandibleProminence, cheekHollowIdx, philtrumIdx, browLidGap, eyeSlant,
      lowerFaceLength,
    },
  };
}

// ===================================================================
// 年代別の参照範囲(集団基準)
// 各指標の「理想」「許容」「要対策」を年代でシフトさせて percentile を出す
// ===================================================================
const AGE_REFERENCE = {
  // 加齢で悪化しやすい指標は、年代が上がるほど閾値を緩く設定
  // [okMax, midMax] = 理想範囲上限 / 要対策ライン
  '10s': { nasolabial:[0.46, 0.40], cornerDrop:[0.005, 0.020], sharpness:[12, 8],  cheekDrop:[0.45, 0.55] },
  '20s': { nasolabial:[0.44, 0.38], cornerDrop:[0.010, 0.025], sharpness:[10, 7],  cheekDrop:[0.50, 0.58] },
  '30s': { nasolabial:[0.42, 0.36], cornerDrop:[0.015, 0.030], sharpness:[9,  6.5],cheekDrop:[0.52, 0.60] },
  '40s': { nasolabial:[0.40, 0.34], cornerDrop:[0.020, 0.038], sharpness:[8,  6],  cheekDrop:[0.54, 0.62] },
  '50s': { nasolabial:[0.38, 0.32], cornerDrop:[0.025, 0.045], sharpness:[7,  5],  cheekDrop:[0.56, 0.65] },
  '60s': { nasolabial:[0.36, 0.30], cornerDrop:[0.030, 0.052], sharpness:[6,  4.5],cheekDrop:[0.58, 0.68] },
};

function getAgeRef(ageGroup){
  return AGE_REFERENCE[ageGroup] || AGE_REFERENCE['30s'];
}

// ===================================================================
// 問題タイプ検出 (15種類)
// ===================================================================
export function detectProblems(result, opts={}){
  const m = result.metrics;
  const ageGroup = opts.ageGroup || '30s';
  const ref = getAgeRef(ageGroup);
  const out = [];

  // 1. 左右非対称
  if (m.asymmetryScore > 7 || Math.abs(m.midlineTilt) > 2.5){
    out.push({
      key:'facialAsymmetry',
      severity: m.asymmetryScore > 15 ? 'high' : m.asymmetryScore > 10 ? 'mid' : 'low',
      title:'顔の左右非対称',
      description:'目・眉・口角の高さに左右差が見られます。表情筋の使い方の偏り・噛み癖・寝姿勢が原因となりやすい状態です。',
      tissues:{ tight:['側頭筋(片側)','咬筋(片側)','広頸筋','胸鎖乳突筋'], weak:['口角挙筋(反対側)','大頬骨筋(反対側)','眼輪筋(下垂側)'] },
      metric: `非対称スコア ${m.asymmetryScore.toFixed(1)} / 中心軸ズレ ${m.midlineTilt.toFixed(1)}°`,
    });
  }
  // 2. 口角下がり
  if (m.mouthCornerDrop > ref.cornerDrop[0]){
    out.push({
      key:'mouthCornerDown',
      severity: m.mouthCornerDrop > ref.cornerDrop[1] ? 'high' : m.mouthCornerDrop > ((ref.cornerDrop[0]+ref.cornerDrop[1])/2) ? 'mid' : 'low',
      title:'口角下がり',
      description:'口角が下唇中央より下にある状態です。口角挙筋・大頬骨筋の弱化と、口角下制筋の過緊張が起こりやすい状態です。',
      tissues:{ tight:['口角下制筋','下唇下制筋','広頸筋','オトガイ筋'], weak:['口角挙筋','大頬骨筋','小頬骨筋','頬筋'] },
      metric:`口角下垂指数 ${m.mouthCornerDrop.toFixed(3)}`,
    });
  }
  // 3. ほうれい線
  if (m.nasolabialIndex < ref.nasolabial[0]){
    out.push({
      key:'nasolabialFold',
      severity: m.nasolabialIndex < ref.nasolabial[1] ? 'high' : m.nasolabialIndex < ((ref.nasolabial[0]+ref.nasolabial[1])/2) ? 'mid' : 'low',
      title:'ほうれい線・頬下垂',
      description:'鼻翼から口角の距離が短く、頬の脂肪体が下方に落ちている可能性。大頬骨筋・上唇挙筋の弱化が背景。',
      tissues:{ tight:['咬筋','口輪筋','下唇下制筋'], weak:['大頬骨筋','小頬骨筋','上唇挙筋','上唇鼻翼挙筋'] },
      metric:`鼻翼-口角距離指数 ${m.nasolabialIndex.toFixed(3)}`,
    });
  }
  // 4. フェイスラインたるみ
  if (m.jawSharpness < ref.sharpness[0] || m.cheekDrop > ref.cheekDrop[0]){
    out.push({
      key:'jawSagging',
      severity: m.jawSharpness < ref.sharpness[1] ? 'high' : m.jawSharpness < ((ref.sharpness[0]+ref.sharpness[1])/2) ? 'mid' : 'low',
      title:'フェイスラインのたるみ',
      description:'顎先から頬骨へのラインが鈍く、輪郭がぼやけている状態。広頸筋・咬筋の過緊張と、舌骨上筋群・首前面の弱化が要因。',
      tissues:{ tight:['広頸筋','咬筋','胸鎖乳突筋','側頭筋'], weak:['舌骨上筋群','顎二腹筋','頬筋','口角挙筋'] },
      metric:`輪郭シャープネス ${m.jawSharpness.toFixed(1)} / 頬下垂 ${m.cheekDrop.toFixed(2)}`,
    });
  }
  // 5. むくみ
  if (m.faceWHRatio > 0.78 || m.eyeOpenness < 0.085){
    out.push({
      key:'puffiness',
      severity: m.faceWHRatio > 0.85 ? 'high' : m.faceWHRatio > 0.81 ? 'mid' : 'low',
      title:'顔のむくみ',
      description:'顔の横幅が広く、目元が腫れぼったい印象。リンパの停滞、表情筋の循環不足、塩分・水分代謝が背景となります。',
      tissues:{ tight:['咬筋','広頸筋','胸鎖乳突筋'], weak:['眼輪筋','頬筋','顎二腹筋','舌筋'] },
      metric:`顔W/H ${m.faceWHRatio.toFixed(2)} / 開瞼度 ${m.eyeOpenness.toFixed(3)}`,
    });
  }
  // 6. パーツバランス
  const triDev = Math.max(Math.abs(m.triPct[0]-0.333), Math.abs(m.triPct[1]-0.333), Math.abs(m.triPct[2]-0.333));
  const fiveEyesDev = Math.abs(m.fiveEyesIdx - 5.0);
  if (triDev > 0.05 || fiveEyesDev > 0.6){
    out.push({
      key:'partsBalance',
      severity: (triDev > 0.08 || fiveEyesDev > 1.0) ? 'mid' : 'low',
      title:'パーツバランスのズレ',
      description:'三庭または五眼の理想バランスからズレがあります。骨格は変えられませんが筋肉と姿勢で印象は変えられます。',
      tissues:{ tight:['咬筋','側頭筋','後頭下筋群'], weak:['前頭筋','眼輪筋','大頬骨筋'] },
      metric:`三庭偏差 ${(triDev*100).toFixed(1)}% / 五眼指数 ${m.fiveEyesIdx.toFixed(2)}`,
    });
  }
  // 7. NEW エラ張り
  if (m.mandibleProminence > 0.92){
    out.push({
      key:'masseterHypertrophy',
      severity: m.mandibleProminence > 1.0 ? 'high' : m.mandibleProminence > 0.96 ? 'mid' : 'low',
      title:'エラ張り(咬筋肥大)',
      description:'下顎角が頬骨より外側に張り出しています。噛みしめ・食いしばりで咬筋が肥大している可能性。',
      tissues:{ tight:['咬筋','側頭筋','内側翼突筋'], weak:['顎二腹筋','広頸筋','頬筋'] },
      metric:`下顎角プロミネンス ${m.mandibleProminence.toFixed(2)}`,
    });
  }
  // 8. NEW 頬コケ
  if (m.cheekHollowIdx > 0.18){
    out.push({
      key:'cheekHollow',
      severity: m.cheekHollowIdx > 0.26 ? 'high' : m.cheekHollowIdx > 0.22 ? 'mid' : 'low',
      title:'頬コケ・中顔面痩せ',
      description:'頬骨と頬輪郭の落差が大きく、頬がコケて見える状態。頬筋の萎縮や脂肪体の下垂が背景。',
      tissues:{ tight:['咬筋','側頭筋'], weak:['頬筋','大頬骨筋','上唇挙筋'] },
      metric:`頬コケ指数 ${m.cheekHollowIdx.toFixed(2)}`,
    });
  }
  // 9. NEW 人中長め
  if (m.philtrumIdx > 0.32){
    out.push({
      key:'longPhiltrum',
      severity: m.philtrumIdx > 0.42 ? 'mid' : 'low',
      title:'人中の長さ',
      description:'鼻下〜上唇の距離が標準より長め。上唇挙筋の弱化で上唇全体が下がっていることもあります。',
      tissues:{ tight:['オトガイ筋','下唇下制筋'], weak:['上唇挙筋','大頬骨筋','口輪筋上部'] },
      metric:`人中指数 ${m.philtrumIdx.toFixed(2)}`,
    });
  }
  // 10. NEW まぶた重い(フード)
  if (m.browLidGap < 0.18){
    out.push({
      key:'hoodedEyelid',
      severity: m.browLidGap < 0.12 ? 'high' : m.browLidGap < 0.15 ? 'mid' : 'low',
      title:'まぶたの重み・フード',
      description:'眉と上まぶたの距離が近く、まぶたが目に覆いかぶさり気味。前頭筋・上眼瞼挙筋の動員不足が背景。',
      tissues:{ tight:['後頭下筋群','側頭筋'], weak:['前頭筋','上眼瞼挙筋','眼輪筋上部'] },
      metric:`眉-まぶた間 ${m.browLidGap.toFixed(2)}`,
    });
  }
  // 11. NEW 目尻下垂(垂れ目強め)
  if (m.eyeSlant > 0.025){
    out.push({
      key:'droopyEyeOuter',
      severity: m.eyeSlant > 0.045 ? 'mid' : 'low',
      title:'目尻の下垂',
      description:'目尻が内側より下がっており、優しげな印象を超えて疲れた印象になりやすい状態。眼輪筋外側の動員不足。',
      tissues:{ tight:['側頭筋','咬筋'], weak:['眼輪筋外側部','前頭筋外側'] },
      metric:`目尻角度指数 ${m.eyeSlant.toFixed(3)}`,
    });
  }
  // 12. NEW 顔の長さ過剰(下顔面ロング)
  if (m.lowerFaceLength > 1.1){
    out.push({
      key:'longLowerFace',
      severity: m.lowerFaceLength > 1.25 ? 'mid' : 'low',
      title:'下顔面の縦長感',
      description:'鼻下〜顎先の距離が長く、顔の縦が強調されている状態。表情筋の動員で印象を引き締められます。',
      tissues:{ tight:['オトガイ筋'], weak:['口輪筋','頬筋','広頸筋'] },
      metric:`下顔面比 ${m.lowerFaceLength.toFixed(2)}`,
    });
  }
  // 13. 何もなければ general
  if (out.length === 0){
    out.push({
      key:'general',
      severity:'low',
      title:'美顔キープ',
      description:'大きな問題は検出されませんでした。表情筋の柔軟性とリフトアップを維持しましょう。',
      tissues:{ tight:[], weak:[] },
      metric:'良好',
    });
  }
  return out;
}

// ===================================================================
// 顔タイプ判定 (18種類)
// ===================================================================
export function determineFaceType(problems, metrics){
  const keys = new Set(problems.map(p => p.key));
  const has = k => keys.has(k);
  const heavy = problems.filter(p => p.severity === 'high').length;

  // 複合タイプ優先
  if (has('facialAsymmetry') && has('jawSagging')){
    return { name:'左右差・たるみ複合タイプ', desc:'表情筋の使い方の偏りと輪郭の緩みが同居。左右対称化と引き上げを並行で行うのが効果的。', tags:['#左右差','#フェイスライン','#リフトアップ'] };
  }
  if (has('masseterHypertrophy') && has('facialAsymmetry')){
    return { name:'エラ張り・噛みしめ偏りタイプ', desc:'噛み癖と咬筋肥大で輪郭が左右非対称に。咬筋の左右均等化が鍵。', tags:['#エラ張り','#噛みしめ','#左右差'] };
  }
  if (has('mouthCornerDown') && has('nasolabialFold')){
    return { name:'下顔面下垂タイプ', desc:'口角下がりとほうれい線が目立つ状態。大頬骨筋・口角挙筋の活性が鍵。', tags:['#口角UP','#ほうれい線','#中顔面'] };
  }
  if (has('cheekHollow') && has('nasolabialFold')){
    return { name:'中顔面コケ・痩せ複合タイプ', desc:'頬コケとほうれい線で顔がやつれた印象に。内側から頬を起こすアプローチが有効。', tags:['#頬コケ','#中顔面','#ボリューム'] };
  }
  if (has('puffiness') && metrics.faceWHRatio > 0.8){
    return { name:'むくみ・丸顔タイプ', desc:'リンパの停滞と表情筋の循環低下が特徴。流して動かすアプローチが有効。', tags:['#むくみ','#リンパ','#小顔'] };
  }
  if (has('jawSagging') && has('puffiness')){
    return { name:'二重あご・スマホ顔タイプ', desc:'前方頭位と首前面の弱化で輪郭がぼやけがち。姿勢から立て直しを。', tags:['#二重あご','#姿勢','#スマホ顔'] };
  }
  if (has('hoodedEyelid') && has('droopyEyeOuter')){
    return { name:'まぶた重め・憂いタイプ', desc:'上まぶたと目尻が同時に下がり気味。眼輪筋と前頭筋の連携トレで開眼の窓が広がります。', tags:['#まぶた','#目尻','#開眼'] };
  }
  // 単独主役タイプ
  if (has('masseterHypertrophy')){
    return { name:'エラ張り・咬筋肥大タイプ', desc:'下顎角の張り出しが特徴。咬筋リリース＋噛みしめ習慣の改善で柔らかな印象に。', tags:['#エラ','#咬筋','#リリース'] };
  }
  if (has('cheekHollow')){
    return { name:'中顔面コケ・繊細タイプ', desc:'頬がコケて見える状態。内側から頬を膨らませる動員で立体感が戻ります。', tags:['#頬コケ','#中顔面','#ボリューム'] };
  }
  if (has('longPhiltrum')){
    return { name:'人中長め・大人っぽタイプ', desc:'落ち着いた印象の人中。上唇の動員量で印象を自在に調整可能。', tags:['#人中','#上唇','#大人顔'] };
  }
  if (has('hoodedEyelid')){
    return { name:'まぶた重め・憂いタイプ', desc:'まぶたが目を覆い気味。前頭筋と上眼瞼挙筋の独立トレで開眼力UP。', tags:['#まぶた','#開眼','#眠そう改善'] };
  }
  if (has('droopyEyeOuter')){
    return { name:'目尻下がり・たれ目タイプ', desc:'優しい印象だが疲れて見えやすい。目尻の眼輪筋トレで生き生きとした目元に。', tags:['#垂れ目','#目尻','#印象UP'] };
  }
  if (has('longLowerFace')){
    return { name:'縦長下顔面タイプ', desc:'下顔面が縦に長め。口輪筋・頬筋の動員で横方向のメリハリを足すと印象が引き締まる。', tags:['#縦長','#下顔面','#メリハリ'] };
  }
  if (has('partsBalance')){
    return { name:'パーツバランス調整タイプ', desc:'骨格そのものは変えられませんが、表情筋・姿勢・血流で印象を整えることは十分可能です。', tags:['#黄金比','#三庭五眼','#印象UP'] };
  }
  if (has('facialAsymmetry')){
    return { name:'左右非対称タイプ', desc:'噛み癖・頬杖・寝姿勢のクセが出ている可能性。両側均等な筋活動を取り戻します。', tags:['#左右差','#噛み癖','#バランス'] };
  }
  if (has('jawSagging')){
    return { name:'フェイスラインたるみタイプ', desc:'広頸筋・咬筋の緊張をリセットしつつ、首前面と舌骨上筋群を起こします。', tags:['#二重あご','#輪郭','#首前面'] };
  }
  if (has('mouthCornerDown')){
    return { name:'口角下がり・印象クールタイプ', desc:'口角挙筋・大頬骨筋の活性で表情が明るく見えるように。', tags:['#口角UP','#印象','#スマイル'] };
  }
  if (has('nasolabialFold')){
    return { name:'中顔面ほうれい線タイプ', desc:'頬の脂肪体を本来位置へ。大頬骨筋＋上唇挙筋の動員で溝が浅くなります。', tags:['#ほうれい線','#中顔面','#リフト'] };
  }
  if (has('puffiness')){
    return { name:'むくみ・朝顔タイプ', desc:'循環の停滞が特徴。表情筋を動かしてリンパポンプを起動。', tags:['#むくみ','#朝顔','#代謝'] };
  }
  return { name:'美顔キープタイプ', desc:'良好な状態。維持トレーニングで未来の自分への投資を。', tags:['#維持','#予防','#美顔'] };
}

// ===================================================================
// スコアリング & グレード (年代別キャリブレーション)
// ===================================================================
export function calcScore(result, problems, opts={}){
  let score = 100;
  problems.forEach(p => {
    if (p.key === 'general') return;
    score -= p.severity === 'high' ? 16 : p.severity === 'mid' ? 9 : 4;
  });
  return Math.max(35, Math.min(100, Math.round(score)));
}

export function gradeFromScore(score, opts={}){
  const ageGroup = opts.ageGroup || '30s';
  // 同年代でのおおよその percentile を推定(score → 上位%)
  const percentile = scoreToPercentile(score, ageGroup);
  let grade, desc;
  if (score >= 90)      { grade='S'; desc='完成度の高い理想バランス。維持と予防が中心です。'; }
  else if (score >= 80) { grade='A'; desc='良好。気になる箇所をピンポイントで整えれば完璧に。'; }
  else if (score >= 70) { grade='B'; desc='伸びしろあり。表情筋トレで明確な変化が出る段階。'; }
  else if (score >= 60) { grade='C'; desc='改善の好機。30日で見た目印象は変えられます。'; }
  else                  { grade='D'; desc='優先的にケアが必要。まずは習慣化から始めましょう。'; }
  return { grade, desc, percentile };
}

function scoreToPercentile(score, ageGroup){
  // 年代別の平均スコア推定(集団基準値)
  const meanMap = { '10s':82, '20s':78, '30s':73, '40s':68, '50s':63, '60s':58 };
  const mean = meanMap[ageGroup] || 73;
  const sd = 10;
  // 正規分布近似で上位%を推定
  const z = (score - mean) / sd;
  const phi = 0.5 * (1 + erf(z / Math.SQRT2));
  const top = Math.max(1, Math.min(99, Math.round((1 - phi) * 100)));
  return top; // 上位 top% に位置
}

function erf(x){
  // Abramowitz & Stegun 7.1.26
  const sign = x >= 0 ? 1 : -1;
  x = Math.abs(x);
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const t = 1 / (1 + p*x);
  const y = 1 - (((((a5*t + a4)*t) + a3)*t + a2)*t + a1)*t*Math.exp(-x*x);
  return sign * y;
}

// ===================================================================
// 表示用 指標リスト
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
    { name:'中心軸の傾き', value:`${m.midlineTilt.toFixed(1)}°`, detail:'鼻ブリッジ→顎の垂直からのズレ', ...sev(m.midlineTilt,[1.5,3.5]) },
    { name:'非対称スコア', value:m.asymmetryScore.toFixed(1), detail:'目・眉・口角の高さ差の総合', ...sev(m.asymmetryScore,[7,15]) },
    { name:'口角の位置', value: m.mouthCornerDrop > 0 ? `下垂 ${(m.mouthCornerDrop*100).toFixed(1)}` : `上向き ${(Math.abs(m.mouthCornerDrop)*100).toFixed(1)}`, detail:'下唇中央に対する口角の位置', ...sev(Math.max(0,m.mouthCornerDrop),[0.015,0.035]) },
    { name:'ほうれい線指数', value:m.nasolabialIndex.toFixed(3), detail:'鼻翼→口角の距離(大きいほど良好)', ...sev(Math.max(0,0.46-m.nasolabialIndex),[0.02,0.06]) },
    { name:'輪郭シャープネス', value:m.jawSharpness.toFixed(1), detail:'頬骨→顎先のライン角度(大きいほど明瞭)', ...sev(Math.max(0,10-m.jawSharpness),[2,5]) },
    { name:'顔の横/縦比', value:m.faceWHRatio.toFixed(2), detail:'理想 ≒ 0.67(小さいほど縦長・引き締まり)', ...sev(Math.max(0,m.faceWHRatio-0.7),[0.05,0.12]) },
    { name:'下顎プロミネンス', value:m.mandibleProminence.toFixed(2), detail:'頬骨幅に対する下顎角幅(大きい=エラ張り)', ...sev(Math.max(0,m.mandibleProminence-0.88),[0.05,0.10]) },
    { name:'頬コケ指数', value:m.cheekHollowIdx.toFixed(2), detail:'頬骨と頬輪郭の落差', ...sev(Math.max(0,m.cheekHollowIdx-0.15),[0.05,0.10]) },
    { name:'人中指数', value:m.philtrumIdx.toFixed(2), detail:'鼻下→上唇の長さ(大きい=長め)', ...sev(Math.max(0,m.philtrumIdx-0.28),[0.04,0.10]) },
    { name:'眉-まぶた間', value:m.browLidGap.toFixed(2), detail:'眉と上まぶたの距離(小さい=まぶた重め)', ...sev(Math.max(0,0.20-m.browLidGap),[0.05,0.10]) },
    { name:'目尻の傾き', value:m.eyeSlant.toFixed(3), detail:'+で目尻下がり / -でつり目', ...sev(Math.max(0,Math.abs(m.eyeSlant)-0.01),[0.015,0.03]) },
    { name:'五眼指数', value:m.fiveEyesIdx.toFixed(2), detail:'顔幅 ÷ 目幅(理想 5.0)', ...sev(Math.abs(m.fiveEyesIdx-5.0),[0.4,0.8]) },
    { name:'三庭バランス', value:m.triPct.map(p=>(p*100).toFixed(0)+'%').join(' / '), detail:'上庭/中庭/下庭(理想 33%/33%/33%)', ...sev(Math.max(Math.abs(m.triPct[0]-0.333),Math.abs(m.triPct[1]-0.333),Math.abs(m.triPct[2]-0.333)),[0.04,0.08]) },
  ];

  return items.map(it => ({ ...it, pct: Math.max(15, Math.min(100, it.pct)) }));
}
