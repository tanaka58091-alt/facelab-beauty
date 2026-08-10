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
  // 虹彩(468〜477。モデルが返す478点のうち後ろの10点)
  // 468=左虹彩の中心 / 469〜472=その輪郭、473=右虹彩の中心 / 474〜477=その輪郭
  IRIS_L: 468, IRIS_R: 473,
};

// 角膜の横径(HVID)の代表値[mm]。
// 個人差は概ね ±5% 程度に収まり、年齢・性別・体格による変動が非常に小さいため、
// 「写真の中の1ピクセルが何mmか」を求める物差しとして使える。
// ※ あくまで代表値なので、絶対値は「およそ」の表示に留める。
//    一方、同じ人の Before/After 比較では同じ虹彩が基準になるため、差分は正確に出る。
const HVID_MM = 11.7;

// ===== 幾何ユーティリティ =====
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const midpoint = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
const angleDeg = (a, b) => Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;

// ===================================================================
// 【重要】アスペクト比の補正 — 全ての幾何計算の前提
//
// MediaPipe の正規化座標は x = ピクセルX / 画像幅、y = ピクセルY / 画像高さ で、
// x と y で単位が異なる(異方空間)。この空間のまま Math.hypot で距離を測ると、
// 同じ顔でも画像のトリミング比率が変わるだけで全ての距離・比率・角度が変わる。
//
// そこで解析の最初に一度だけ y に (高さ/幅) を掛けて、
// 「1単位 = 画像幅の1」の等方空間へ変換する。以降の距離・角度・roll補正は
// すべてこの空間で行われるため、トリミングに依存しない再現性のある値になる。
//
// 画像サイズが不明な場合は 1.0(正方形扱い)にフォールバックする。
// ===================================================================
function toIsotropic(lms, aspect){
  if (!aspect || !isFinite(aspect) || aspect === 1) return lms;
  return lms.map(p => ({ x: p.x, y: p.y * aspect, z: p.z }));
}
function imageAspect(image){
  if (!image) return 1;
  const w = image.naturalWidth || image.width;
  const h = image.naturalHeight || image.height;
  if (!w || !h) return 1;
  return h / w;   // 縦長なら > 1
}

// ===== 頭部姿勢の正規化 (roll補正) =====
// 両目を結んだ線が水平になるように、すべてのランドマークを回転
// ※ 等方空間で呼ぶこと(異方空間で回転すると顔が歪み、偽の左右差を生む)
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

// === 頭部 Yaw 推定 (Phase 3-14 斜め45度写真対応) ===
// 鼻先(NOSE_TIP)が両目中点からどれだけ横にズレているかでヨー角を推定。
// MediaPipe FaceMesh の Z 座標も併用してより安定させる。
function estimateYaw(lms){
  const lEye = midpoint(lms[FM.L_EYE_INNER], lms[FM.L_EYE_OUTER]);
  const rEye = midpoint(lms[FM.R_EYE_INNER], lms[FM.R_EYE_OUTER]);
  const eyeMid = midpoint(lEye, rEye);
  const eyeDist = dist(lEye, rEye) || 1;
  const noseTip = lms[FM.NOSE_TIP];
  // 鼻先の眼線中点からの相対横ズレ(目間距離で正規化)
  const offset = (noseTip.x - eyeMid.x) / eyeDist;
  // 経験則: offset ~= sin(yaw). 1.0 で約 90°。実用的にはオフセット 0.3 で約 17°
  const yawDeg = Math.asin(Math.max(-1, Math.min(1, offset))) * 180 / Math.PI;
  return { yawDeg, yawOffset: offset };
}

// === 頭部 Pitch(あおり・うつむき)の推定 ===
// スマホを顔より下や上で構えると起こる、自撮りで最も多い角度ずれ。
// 顔の中心線(額→顎)が奥行き方向にどれだけ倒れているかで見る。
// 注: MediaPipe の z はカメラ距離に依存する相対値のため、角度の絶対値は
//     厳密ではない。そのため「大きく傾いているか」の判定にのみ使い、
//     ユーザーには角度の数値ではなく、傾いている旨だけを伝える。
function estimatePitch(lms){
  const top = lms[FM.FOREHEAD], bottom = lms[FM.CHIN];
  const dy = bottom.y - top.y;
  if (!dy) return { pitchDeg: 0, reliable: false };
  const dz = (bottom.z ?? 0) - (top.z ?? 0);
  // 正面・直立の顔でも顔の丸みで数度のオフセットが出るため、それを差し引く
  const BASELINE_DEG = 2.5;
  const raw = Math.atan2(dz, dy) * 180 / Math.PI;
  return { pitchDeg: raw - BASELINE_DEG, reliable: true };
}

// ===================================================================
// 虹彩による絶対スケール(mm)の取得
//
// これまで全ての指標は「目の間の距離の何倍か」という相対値で、
// 「0.047」のような単位のない数字しか出せなかった。
// 虹彩の横径はほぼ誰でも約11.7mmなので、これを物差しにすると
// 「約2mm」のように現実の大きさで伝えられる。
//
// 注意点:
//  - 縦径はまぶたに隠れる影響でモデルの推定が小さめに出る(実測で横径比 -15%程度)
//    ため、横径のみを使う
//  - 顔が横を向くと横径は短く写るので、左右の大きい方を採用する
// ===================================================================
function irisScale(rawLms, image){
  const none = { irisPx: null, mmPerPx: null, mmPerUnit: null, reliable: false };
  if (!rawLms || rawLms.length < FM.IRIS_R + 5) return none;   // 虹彩なしのモデル/スタブ
  const W = image ? (image.naturalWidth || image.width) : 0;
  const H = image ? (image.naturalHeight || image.height) : 0;
  if (!W || !H) return none;
  // 正規化座標→ピクセル座標(ここは実ピクセルなのでアスペクト補正は不要)
  const px = p => ({ x: p.x * W, y: p.y * H });
  const hDiameter = base => {
    const a = px(rawLms[base + 1]), b = px(rawLms[base + 3]);   // 輪郭の対向2点=横径
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const irisPx = Math.max(hDiameter(FM.IRIS_L), hDiameter(FM.IRIS_R));
  if (!isFinite(irisPx) || irisPx < 4) return none;             // 小さすぎる=信頼できない
  const mmPerPx = HVID_MM / irisPx;
  return {
    irisPx,
    mmPerPx,
    // 等方空間では「1単位 = 画像の横幅」なので、mm換算は画像幅(px)を掛ける
    mmPerUnit: mmPerPx * W,
    reliable: true,
  };
}

// ===================================================================
// 頭の向き(yaw/pitch/roll)をモデルの変換行列から取得
//
// これまでは「鼻先の横ズレ」「額と顎の奥行き差」から推定していたが、
// どちらも顔の造作に左右される近似だった。モデルは同じ計算の中で
// 既に正確な姿勢行列を持っているので、それを受け取るだけでよい(追加費用なし)。
//
// 行列は列優先の4x4。第2列が「顔の正面方向ベクトル」で、
// そのY成分が上下の傾き(あおり/うつむき)にあたる。
// モデル空間はY軸が上向き、画像座標はY軸が下向きなので、
// pitch と roll は符号を反転して画像基準に合わせる(実測で確認済み)。
// ===================================================================
function poseFromMatrix(matrix){
  const data = matrix && (matrix.data || matrix);
  if (!data || data.length < 16) return null;
  const at = (row, col) => data[col * 4 + row];
  const clamp = v => Math.max(-1, Math.min(1, v));
  const yawDeg   =  Math.atan2(at(0, 2), at(2, 2)) * 180 / Math.PI;
  const pitchDeg =  Math.asin(clamp(at(1, 2))) * 180 / Math.PI;   // +であおり(あご上がり)
  const rollDeg  = -Math.atan2(at(1, 0), at(1, 1)) * 180 / Math.PI;
  if (![yawDeg, pitchDeg, rollDeg].every(isFinite)) return null;
  return { yawDeg, pitchDeg, rollDeg, reliable: true, source: 'matrix' };
}

// ===================================================================
// 表情の判定をモデルの blendshape から行う
//
// 自作の閾値判定には構造的な弱点があった。「口角の上がり具合」は
// もともと口角が上向きの人／下向きの人で基準値が違うため、
// 前者は常に笑顔扱いで口元の指標が毎回除外され、後者は笑っていても
// 検出されない、という個人差による取りこぼしが起きる。
// モデルは表情そのものを学習した52個の係数を返すので、それを使う。
//
// あわせて「目を閉じている(まばたき)」も取得する。従来は検出手段が無く、
// 目をつむった写真でも、まぶたや目の開き具合を平然と計測していた。
// ===================================================================
function expressionFromBlendshapes(blendshapes){
  const cats = blendshapes && (blendshapes.categories || blendshapes);
  if (!Array.isArray(cats) || !cats.length) return null;
  const v = {};
  for (const c of cats){
    const name = c.categoryName || c.displayName;
    if (name) v[name] = c.score;
  }
  const pair = (a, b) => ((v[a] || 0) + (v[b] || 0)) / 2;
  const smile   = pair('mouthSmileLeft', 'mouthSmileRight');
  const frown   = pair('mouthFrownLeft', 'mouthFrownRight');
  const jawOpen = v.jawOpen || 0;
  const blink   = Math.max(v.eyeBlinkLeft || 0, v.eyeBlinkRight || 0);

  let kind = 'neutral', confidence = 0;
  if (smile > 0.25){
    kind = 'smile';   confidence = Math.min(1, (smile - 0.25) / 0.35);
  } else if (jawOpen > 0.30){
    kind = 'openMouth'; confidence = Math.min(1, (jawOpen - 0.30) / 0.30);
  } else if (frown > 0.25){
    kind = 'frown';   confidence = Math.min(1, (frown - 0.25) / 0.35);
  }
  return {
    kind, confidence,
    smile, frown, jawOpen, blink,
    eyesClosed: blink > 0.5,
    source: 'blendshapes',
  };
}

// === 表情判定 (Phase 3-13 表情正規化) ===
// blendshape が使えない場合(テスト用スタブ等)のフォールバック。
// 笑顔検出: 口角が口中央より十分上、口横幅/縦幅比が大、上下唇間がある
function detectExpression(lms, scale){
  const mL = lms[FM.MOUTH_L], mR = lms[FM.MOUTH_R];
  const mT = lms[FM.MOUTH_TOP], mB = lms[FM.MOUTH_BOTTOM];
  const mouthW = dist(mL, mR);
  const mouthH = dist(mT, mB);
  const widthHeightRatio = mouthW / Math.max(1e-6, mouthH);
  // 口角の引き上げ
  const cornerLiftL = (midpoint(mT, mB).y - mL.y) / scale; // +で上に引かれている
  const cornerLiftR = (midpoint(mT, mB).y - mR.y) / scale;
  const cornerLift = (cornerLiftL + cornerLiftR) / 2;
  // 上下唇の隙間 (歯が見える=笑顔の可能性)
  const lipGap = mouthH / scale;

  let kind = 'neutral';
  let confidence = 0;
  // widthHeightRatio は閉口時でも 9〜48 になるため条件として機能しない(常に真)。
  // 口角の引き上げ量だけで判定する。
  if (cornerLift > 0.018){
    kind = 'smile';
    confidence = Math.min(1, (cornerLift - 0.018) * 25);
  } else if (lipGap > 0.11){
    // 唇の厚みぶんの隙間(実測 0.06〜0.09)では発火しない値にする。
    // ここを超えるのは、はっきり口が開いている場合。
    kind = 'openMouth';
    confidence = Math.min(1, (lipGap - 0.11) * 8);
  } else if (cornerLift < -0.02){
    kind = 'frown';
    confidence = Math.min(1, (-0.02 - cornerLift) * 25);
  }
  return { kind, confidence, cornerLift, widthHeightRatio, lipGap };
}

// === ピクセルベース分析 (Phase 3-13 照明補正 + Phase 3-15 テクスチャ) ===
// 画像の特定領域を矩形でサンプリングし、平均輝度・分散を返す。
function sampleRegion(imageData, cx, cy, halfW, halfH){
  const { data, width, height } = imageData;
  const x0 = Math.max(0, Math.floor(cx - halfW));
  const y0 = Math.max(0, Math.floor(cy - halfH));
  const x1 = Math.min(width - 1, Math.floor(cx + halfW));
  const y1 = Math.min(height - 1, Math.floor(cy + halfH));
  if (x1 <= x0 || y1 <= y0) return null;
  let sumL = 0, sumL2 = 0, sumR = 0, sumG = 0, sumB = 0, n = 0;
  for (let y = y0; y <= y1; y++){
    for (let x = x0; x <= x1; x++){
      const i = (y * width + x) * 4;
      const r = data[i], g = data[i+1], b = data[i+2];
      const L = 0.299*r + 0.587*g + 0.114*b;
      sumL += L; sumL2 += L*L;
      sumR += r; sumG += g; sumB += b;
      n++;
    }
  }
  if (n === 0) return null;
  const meanL = sumL / n;
  const varL = (sumL2 / n) - (meanL * meanL);
  return {
    n,
    luminanceMean: meanL,
    luminanceStd: Math.sqrt(Math.max(0, varL)),
    rMean: sumR / n, gMean: sumG / n, bMean: sumB / n,
  };
}

// 顔の skin 領域のピクセルを束ねて取得 → 照明 + テクスチャ + トーンを返す
function analyzePixels(image, lms, scale){
  if (!image) return null;
  // imageの自然サイズを利用してCanvasに描画
  const W = image.naturalWidth || image.width;
  const H = image.naturalHeight || image.height;
  if (!W || !H) return null;
  // ランドマークは正規化 (0-1) なのでピクセル座標へ変換
  const px = (p) => ({ x: p.x * W, y: p.y * H });
  let canvas, ctx;
  try {
    canvas = document.createElement('canvas');
    canvas.width = W; canvas.height = H;
    ctx = canvas.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, W, H);
  } catch (e) {
    return null;
  }
  let imgData;
  try { imgData = ctx.getImageData(0, 0, W, H); }
  catch(e){ return null; }

  // サンプル領域: 左頬、右頬、額、鼻、顎下
  // 頬: ZYGO と CHEEK の中間
  const lZ = px(lms[FM.ZYGO_L]), rZ = px(lms[FM.ZYGO_R]);
  const lC = px(lms[FM.CHEEK_L]), rC = px(lms[FM.CHEEK_R]);
  const fh = px(lms[FM.FOREHEAD]);
  const chin = px(lms[FM.CHIN]);
  const nb = px(lms[FM.NOSE_BRIDGE]);
  const noseTip = px(lms[FM.NOSE_TIP]);
  // 顔幅の概算
  const fw = Math.abs(rC.x - lC.x) || 100;
  const half = fw * 0.05; // サンプル矩形の半径

  const leftCheek  = sampleRegion(imgData, (lZ.x + lC.x)/2 + half*0.4, (lZ.y + lC.y)/2, half, half);
  const rightCheek = sampleRegion(imgData, (rZ.x + rC.x)/2 - half*0.4, (rZ.y + rC.y)/2, half, half);
  // 額: FOREHEAD は眉のすぐ上付近なので、眉間と FOREHEAD の中間に少し上をサンプル
  const foreheadCx = fh.x;
  const foreheadCy = fh.y - half * 0.5;
  const forehead   = sampleRegion(imgData, foreheadCx, foreheadCy, half * 1.2, half * 0.6);
  const noseRegion = sampleRegion(imgData, noseTip.x, (nb.y + noseTip.y) / 2, half * 0.5, half * 0.8);
  const chinRegion = sampleRegion(imgData, chin.x, chin.y - half * 0.4, half * 0.8, half * 0.4);

  // 照明: 左右頬の平均輝度比
  const lumLC = leftCheek?.luminanceMean ?? 0;
  const lumRC = rightCheek?.luminanceMean ?? 0;
  const lumMean = (lumLC + lumRC) / 2 || 1;
  const lightingBalance = Math.abs(lumLC - lumRC) / lumMean; // 0=均一, 0.2 以上で偏り強
  // 全体明るさ (0-255)
  const luminanceOverall = (
    (leftCheek?.luminanceMean ?? 0) +
    (rightCheek?.luminanceMean ?? 0) +
    (forehead?.luminanceMean ?? 0)
  ) / 3;

  // テクスチャ: 各領域のσ(local stddev)。シワが多い領域ほど高い。
  const textureLC = leftCheek?.luminanceStd ?? 0;
  const textureRC = rightCheek?.luminanceStd ?? 0;
  const textureFH = forehead?.luminanceStd ?? 0;
  // 顔のスケール(輝度的)で正規化
  const textureNorm = (luminanceOverall + 1);
  const wrinkleIdx = ((textureLC + textureRC) / 2 + textureFH * 1.2) / textureNorm;

  // トーン均一性: 各領域のRGB平均差の合計
  const regions = [leftCheek, rightCheek, forehead, noseRegion, chinRegion].filter(Boolean);
  let toneVarSum = 0; let toneN = 0;
  if (regions.length >= 2){
    const meanR = regions.reduce((s,r)=>s+r.rMean,0) / regions.length;
    const meanG = regions.reduce((s,r)=>s+r.gMean,0) / regions.length;
    const meanB = regions.reduce((s,r)=>s+r.bMean,0) / regions.length;
    regions.forEach(r => {
      toneVarSum += Math.hypot(r.rMean - meanR, r.gMean - meanG, r.bMean - meanB);
      toneN++;
    });
  }
  const toneUnevenness = toneN ? (toneVarSum / toneN) / 255 : 0;
  const toneEvenness = Math.max(0, 1 - toneUnevenness * 4);

  // 画像端で顔が切れ、頬/額の矩形サンプルが取れないと 0 が『完璧な肌』に化ける。
  // 有効サンプルが不足する場合は指標を null(=計測不能・非表示)にする。
  const validTexture = [leftCheek, rightCheek, forehead].filter(Boolean).length;

  return {
    luminanceOverall,
    lightingBalance,
    leftCheekLum: lumLC, rightCheekLum: lumRC,
    wrinkleIdx: validTexture >= 2 ? wrinkleIdx : null,
    leftCheekTexture: textureLC,
    rightCheekTexture: textureRC,
    foreheadTexture: textureFH,
    toneEvenness: regions.length >= 3 ? toneEvenness : null,
    toneUnevenness,
  };
}

// ===================================================================
// 撮影品質のチェック（解析の前に走らせる）
//
// 入力の質が結果の質を決めるため、明らかに解析に向かない写真は
// 結果を出す前に気づけるようにする。判定は「ブロックする(block)」と
// 「注意して進む(warn)」の2段階。
// ここでは顔の内部状態は一切判定せず、写真の写り方だけを見る。
// ===================================================================
export function checkPhotoQuality(rawLms, opts={}){
  const issues = [];
  const image = opts.image;
  const W = image ? (image.naturalWidth || image.width) : 0;
  const H = image ? (image.naturalHeight || image.height) : 0;

  // 顔の写っている範囲(正規化座標)
  let minX=1, maxX=0, minY=1, maxY=0;
  for (const p of rawLms){
    if (p.x < minX) minX = p.x; if (p.x > maxX) maxX = p.x;
    if (p.y < minY) minY = p.y; if (p.y > maxY) maxY = p.y;
  }
  const faceW = maxX - minX, faceH = maxY - minY;

  // 1) 顔が画面からはみ出している
  const margin = 0.005;
  if (minX < -margin || maxX > 1+margin || minY < -margin || maxY > 1+margin){
    issues.push({ level:'block', kind:'crop',
      title:'顔が画面からはみ出しています',
      hint:'顔全体（額から下あごまで）が写るように、少し引いて撮ってください。' });
  }
  // 2) 顔が小さすぎる(細部が測れない)
  if (faceW < 0.22 || faceH < 0.22){
    issues.push({ level:'block', kind:'small',
      title:'顔が小さく写っています',
      hint:'顔が画面の半分くらいを占めるように、もう少し近づいて撮ってください。' });
  } else if (faceW < 0.32 && faceH < 0.32){
    issues.push({ level:'warn', kind:'small',
      title:'顔がやや小さめです',
      hint:'もう少し近づくと、細かい部分まで見られます。' });
  }
  // 3) 画像の解像度が低い / 顔のピクセル数が少ない
  if (W && H){
    const facePx = Math.min(faceW * W, faceH * H);
    if (facePx < 180){
      issues.push({ level:'block', kind:'lowres',
        title:'画像が粗いようです',
        hint:'カメラで撮り直すか、圧縮されていない写真をお選びください。' });
    } else if (facePx < 300){
      issues.push({ level:'warn', kind:'lowres',
        title:'画像がやや粗めです',
        hint:'より鮮明な写真だと、細かい部分まで見られます。' });
    }
  }
  // 4) 顔の向き(変換行列が取れている場合のみ)
  // 横や上下を向いた写真は、輪郭・左右差・口元がまとめて実際と違って写る。
  // 解析後の警告では「結果を見たあと」になってしまうので、ここで先に気づけるようにする。
  const pose = poseFromMatrix(opts.matrix);
  if (pose){
    const yawAbs = Math.abs(pose.yawDeg), pitchAbs = Math.abs(pose.pitchDeg);
    if (yawAbs > 28){
      issues.push({ level:'block', kind:'yaw',
        title:`顔が横を向いています（約${yawAbs.toFixed(0)}°）`,
        hint:'カメラをまっすぐ見て、正面から撮ってください。' });
    } else if (yawAbs > 15){
      issues.push({ level:'warn', kind:'yaw',
        title:'顔がやや斜めを向いています',
        hint:'正面に近いほど、左右差や輪郭を正確に見られます。' });
    }
    if (pitchAbs > 22){
      issues.push({ level:'block', kind:'pitch',
        title: pose.pitchDeg > 0 ? `あごが上がっています（約${pitchAbs.toFixed(0)}°）` : `うつむいています（約${pitchAbs.toFixed(0)}°）`,
        hint:'カメラを目の高さに構えて、まっすぐ撮ってください。' });
    } else if (pitchAbs > 12){
      issues.push({ level:'warn', kind:'pitch',
        title: pose.pitchDeg > 0 ? 'あごがやや上がっています' : 'やや下を向いています',
        hint:'カメラを目の高さに合わせると、輪郭や口元をより正確に見られます。' });
    }
  }

  const blocked = issues.some(i => i.level === 'block');
  return { ok: !blocked, blocked, issues, pose };
}

// ===================================================================
// 顔分析: lms → metrics
// ===================================================================
export function analyzeFace(rawLms, opts={}){
  // 1) まずアスペクト比を補正して等方空間へ(全計算の前提。これが無いと
  //    同じ顔でもトリミング比率が変わるだけで指標が最大78%変動する)
  const aspect = opts.aspect || imageAspect(opts.image);
  const isoLms = toIsotropic(rawLms, aspect);
  // 2) 等方空間で roll 補正(異方空間で回すと顔が歪み、偽の左右差を生む)
  const norm = normalizeLandmarks(isoLms);
  const lms = norm.landmarks;
  const scale = faceScale(lms);

  // 目の高さの左右差:
  //   roll補正は「両目を結ぶ線」を水平化するため、補正後に両目の高さ差を測ると
  //   構造的に必ず 0 になる(＝目の左右差は原理的に検出できない)。
  //   かといって補正前に測ると、首の傾き(roll)と本当の左右差が混ざる。
  //   そこで「顔自身の縦軸(額→顎)」に対する各目の位置を比べる。
  //   顔ごと傾いても軸も一緒に傾くため、首の傾きに影響されず左右差だけを取り出せる。
  const eyeHeightDiff = (() => {
    const top = isoLms[FM.FOREHEAD], bottom = isoLms[FM.CHIN];
    const axLen = dist(top, bottom);
    if (!axLen) return 0;
    const ax = { x: (bottom.x - top.x) / axLen, y: (bottom.y - top.y) / axLen }; // 顔の縦軸(下向き単位ベクトル)
    const l = midpoint(isoLms[FM.L_EYE_INNER], isoLms[FM.L_EYE_OUTER]);
    const r = midpoint(isoLms[FM.R_EYE_INNER], isoLms[FM.R_EYE_OUTER]);
    const along = p => (p.x - top.x) * ax.x + (p.y - top.y) * ax.y;  // 縦軸に沿った位置
    const s = dist(l, r) || 1;
    return (along(r) - along(l)) / s;   // +で右目(画像右)が下がっている
  })();

  // === 頭の向き ===
  // モデルの変換行列があればそれを使う(実測値)。無ければ従来の推定式にフォールバック。
  const pose = poseFromMatrix(opts.matrix);
  const yaw = pose ? { yawDeg: pose.yawDeg, yawOffset: Math.sin(pose.yawDeg * Math.PI/180) }
                   : estimateYaw(lms);
  const pitch = pose ? { pitchDeg: pose.pitchDeg, reliable: true }
                     : estimatePitch(lms);
  // === 表情判定 ===
  // blendshape があればモデルの出力を使う。無ければ従来の幾何ベース判定。
  const expression = expressionFromBlendshapes(opts.blendshapes) || detectExpression(lms, scale);
  // === 虹彩による絶対スケール(mm) ===
  const iris = irisScale(rawLms, opts.image);
  // === Phase 3-13/3-15: ピクセル分析 (画像が渡された場合のみ) ===
  const pixels = opts.image ? analyzePixels(opts.image, rawLms, scale) : null;

  // 警告フラグ
  const warnings = [];
  if (Math.abs(yaw.yawDeg) > 12){
    warnings.push({ kind:'yaw', severity: Math.abs(yaw.yawDeg) > 22 ? 'high':'mid',
      message:`顔が${Math.abs(yaw.yawDeg).toFixed(0)}°斜めを向いています。可能な限り正面を向いた写真で再撮影すると精度が上がります。` });
  }
  if (pitch.reliable && Math.abs(pitch.pitchDeg) > 12){
    warnings.push({ kind:'pitch', severity: Math.abs(pitch.pitchDeg) > 20 ? 'high' : 'mid',
      message: pitch.pitchDeg > 0
        ? 'あごが上がった角度（あおり）で写っているようです。カメラを目の高さに合わせると、輪郭や口元がより正確に見られます。'
        : 'うつむいた角度で写っているようです。カメラを目の高さに合わせると、輪郭や口元がより正確に見られます。' });
  }
  // 表情が入っていると、口元まわりの指標は「安静時の状態」を表さない。
  // 警告を出すだけでなく、該当指標を計測対象から外す(下の mouthUnreliable)。
  const mouthUnreliable = (expression.kind === 'smile' && expression.confidence > 0.25)
                       || (expression.kind === 'openMouth' && expression.confidence > 0.25);
  if (expression.kind === 'smile' && expression.confidence > 0.25){
    warnings.push({ kind:'expression', severity:'mid',
      message:'笑顔で写っているため、口角とほうれい線まわりは今回の計測から外しました。無表情の写真だと、この2つも見られます。' });
  } else if (expression.kind === 'openMouth' && expression.confidence > 0.25){
    warnings.push({ kind:'expression', severity:'mid',
      message:'口が開いているため、口元まわりは今回の計測から外しました。口を軽く閉じた写真だと、この部分も見られます。' });
  }
  // 目を閉じている(まばたきの瞬間)と、まぶた・目の開き具合は本来の状態を表さない。
  // これまでは検出手段が無く、つむった目をそのまま計測していた。
  const eyesUnreliable = !!expression.eyesClosed;
  if (eyesUnreliable){
    warnings.push({ kind:'expression', severity:'mid',
      message:'目を閉じた瞬間の写真のようです。まぶたと目元まわりは今回の計測から外しました。目を開けた写真だと、この部分も見られます。' });
  }
  if (pixels){
    if (pixels.luminanceOverall < 70) warnings.push({ kind:'lighting', severity:'high', message:'写真がやや暗めです。明るい場所で再撮影すると精度が上がります。' });
    else if (pixels.luminanceOverall > 220) warnings.push({ kind:'lighting', severity:'mid', message:'写真がやや明るすぎます。直射光のない柔らかい光で再撮影してください。' });
    if (pixels.lightingBalance > 0.18) warnings.push({ kind:'lighting', severity:'mid', message:`左右で明るさに偏り(${(pixels.lightingBalance*100).toFixed(0)}%)があります。左右非対称の判定に影響する可能性があります。` });
  }

  // === 1. 左右非対称 ===
  const noseBridge = lms[FM.NOSE_BRIDGE];
  const chin = lms[FM.CHIN];
  const midlineTilt = angleDeg(noseBridge, chin) - 90;

  const lEyeCtr = midpoint(lms[FM.L_EYE_INNER], lms[FM.L_EYE_OUTER]);
  const rEyeCtr = midpoint(lms[FM.R_EYE_INNER], lms[FM.R_EYE_OUTER]);
  // eyeHeightDiff は上部で「顔の縦軸に対する各目の位置」から算出済み
  // (ここで両目中点の y 差を取ると roll 補正の副作用で必ず 0 になるため)

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
  let mouthCornerDrop = (lCornerDrop + rCornerDrop) / 2;
  // 笑顔補正: 笑顔の場合、口角が上がるので mouthCornerDrop が過小評価される
  // 表情の confidence に応じて、安静時推定値を加算
  if (expression.kind === 'smile' && expression.confidence > 0){
    mouthCornerDrop += expression.confidence * 0.018;
  }

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

  // === Phase 3-12: 左右独立スコア (部位別) ===
  // 各部位の左右別 0-100 スコア。高いほど良好。
  // 注: 写真の左右と顔の左右は鏡像なので、ここでは画像の左=ユーザーの右(向かって左)として扱う。
  const sideScores = (() => {
    // 部位別スコアは「ふつうの顔が概ね60〜85に収まり、目立つ偏りだけが50未満に落ちる」
    // よう較正する(厳しすぎると全員が低スコアになり自己否定的になるため)。
    // 目: 開眼度 (大きいほど良好)
    const lEyeOpenScore = clamp01((lEyeH - 0.015) / 0.030) * 100;
    const rEyeOpenScore = clamp01((rEyeH - 0.015) / 0.030) * 100;
    // ほうれい線: 距離が大きいほど良好
    const lNasoScore = clamp01((nasoL - 0.27) / 0.15) * 100;
    const rNasoScore = clamp01((nasoR - 0.27) / 0.15) * 100;
    // 口角: 下垂 0 以下が理想
    const lCornerScore = clamp01(1 - Math.max(0, lCornerDrop) / 0.055) * 100;
    const rCornerScore = clamp01(1 - Math.max(0, rCornerDrop) / 0.055) * 100;
    // 眉-まぶた: 大きいほど良好
    const lBrowLidScore = clamp01((lBrowToLid - 0.08) / 0.13) * 100;
    const rBrowLidScore = clamp01((rBrowToLid - 0.08) / 0.13) * 100;
    // 目尻の傾き: 0 が理想(ゆるい下がりは自然なので許容幅を広めに)
    const lEyeSlantScore = clamp01(1 - Math.abs(lEyeSlant) / 0.09) * 100;
    const rEyeSlantScore = clamp01(1 - Math.abs(rEyeSlant) / 0.09) * 100;
    // フェイスライン(頬下垂): 値が小さいほど良好
    const lJawScore = clamp01(1 - Math.max(0, lms[FM.CHEEK_L].y - eyeLineY) / scale / 0.62) * 100;
    const rJawScore = clamp01(1 - Math.max(0, lms[FM.CHEEK_R].y - eyeLineY) / scale / 0.62) * 100;
    return {
      left: {
        eye: lEyeOpenScore, naso: lNasoScore, corner: lCornerScore,
        browLid: lBrowLidScore, eyeSlant: lEyeSlantScore, jaw: lJawScore,
        overall: avg([lEyeOpenScore, lNasoScore, lCornerScore, lBrowLidScore, lEyeSlantScore, lJawScore]),
      },
      right: {
        eye: rEyeOpenScore, naso: rNasoScore, corner: rCornerScore,
        browLid: rBrowLidScore, eyeSlant: rEyeSlantScore, jaw: rJawScore,
        overall: avg([rEyeOpenScore, rNasoScore, rCornerScore, rBrowLidScore, rEyeSlantScore, rJawScore]),
      },
    };
  })();

  return {
    scale,
    landmarksRaw: rawLms,
    landmarksNorm: lms,
    rollDeg: pose ? pose.rollDeg : norm.rollDeg,
    yaw,
    pose,
    iris,
    expression,
    pixels,
    warnings,
    sideScores,
    metrics: {
      // 既存
      midlineTilt, eyeHeightDiff, browHeightDiff, mouthTilt, asymmetryScore,
      mouthCornerDrop, nasolabialIndex, jawSharpness, cheekDrop,
      faceWHRatio, eyeOpenness, triPct, fiveEyesIdx,
      interocularIdx, noseWidthIdx, mouthWidthIdx,
      // 新規
      mandibleProminence, cheekHollowIdx, philtrumIdx, browLidGap, eyeSlant,
      lowerFaceLength,
      // Phase 3-15: テクスチャ(画像があれば)
      wrinkleIdx: pixels?.wrinkleIdx ?? null,
      toneEvenness: pixels?.toneEvenness ?? null,
      // 頭の向き(変換行列があれば実測値、無ければ推定値)
      yawDeg: yaw.yawDeg,
      pitchDeg: pitch.reliable ? pitch.pitchDeg : null,
      poseSource: pose ? 'matrix' : 'estimate',
      // 虹彩による絶対スケール。1単位(=画像の横幅)が何mmにあたるか。
      // これがあると、比率でしか出せなかった値を「約◯mm」で伝えられる。
      mmPerUnit: iris.mmPerUnit,
      // 指標の多くは「目の間の距離の何倍か」で表しているので、
      // その1倍ぶんが何mmかを持っておくと、そのまま掛けて実寸に直せる。
      mmPerScale: iris.mmPerUnit ? iris.mmPerUnit * scale : null,
      // 表情のせいで口元まわりが安静時を表していない場合のフラグ。
      // detectProblems はこれを見て、口角・ほうれい線の判定を行わない。
      mouthUnreliable,
      // 目を閉じている場合のフラグ(まぶた・目元の判定を行わない)
      eyesUnreliable,
    },
  };
}

// ---- helper utils ----
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const avg = (arr) => arr.length ? arr.reduce((s,v)=>s+v,0) / arr.length : 0;

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

  // 1. 左右非対称 (斜め写真・照明差では過大評価されやすいので閾値と重症度を控えめに補正)
  const yawBig = Math.abs(m.yawDeg || 0) > 12;
  const asymThresh = yawBig ? 16 : 10;   // 斜めのときは基準を上げて誤検出を抑える
  if (m.asymmetryScore > asymThresh || Math.abs(m.midlineTilt) > 3.5){
    let asymSev = m.asymmetryScore > 24 ? 'high' : m.asymmetryScore > 15 ? 'mid' : 'low';
    let note = '';
    if (yawBig){ asymSev = asymSev === 'high' ? 'mid' : 'low'; note = '（斜め/角度の影響あり・参考値）'; }
    out.push({
      key:'facialAsymmetry',
      severity: asymSev,
      title:'顔の左右非対称',
      description:'写真では、目・眉・口角の高さに左右差が見られました。左右差は誰にでも自然にあるもので、撮影時の角度や表情でも見え方が変わります。写真だけで原因は判断できません。',
      tissues:{ tight:['側頭筋(片側)','咬筋(片側)','広頸筋','胸鎖乳突筋'], weak:['口角挙筋(反対側)','大頬骨筋(反対側)','眼輪筋(下垂側)'] },
      metric: `非対称スコア ${m.asymmetryScore.toFixed(1)} / 中心軸ズレ ${m.midlineTilt.toFixed(1)}°${note}`,
    });
  }
  // 2. 口角下がり (笑顔・開口時は安静時の状態を表さないため判定しない)
  if (!m.mouthUnreliable && m.mouthCornerDrop > ref.cornerDrop[0]){
    out.push({
      key:'mouthCornerDown',
      severity: m.mouthCornerDrop > ref.cornerDrop[1] ? 'high' : m.mouthCornerDrop > ((ref.cornerDrop[0]+ref.cornerDrop[1])/2) ? 'mid' : 'low',
      title:'口角下がり',
      description:'写真では、口角の位置が下唇の中央より下に見えました。口元の力の入り方や撮影時の表情でも見え方は変わります。',
      tissues:{ tight:['口角下制筋','下唇下制筋','広頸筋','オトガイ筋'], weak:['口角挙筋','大頬骨筋','小頬骨筋','頬筋'] },
      metric:`口角下垂指数 ${m.mouthCornerDrop.toFixed(3)}`,
    });
  }
  // 3. ほうれい線 (笑顔・開口時は口元が動くため判定しない)
  if (!m.mouthUnreliable && m.nasolabialIndex < ref.nasolabial[0]){
    out.push({
      key:'nasolabialFold',
      severity: m.nasolabialIndex < ref.nasolabial[1] ? 'high' : m.nasolabialIndex < ((ref.nasolabial[0]+ref.nasolabial[1])/2) ? 'mid' : 'low',
      title:'ほうれい線・頬下垂',
      description:'写真では、小鼻から口角までの距離が短めに見えました。ほうれい線の見え方は、光の向き・表情・撮影角度でも大きく変わります。',
      tissues:{ tight:['咬筋','口輪筋','下唇下制筋'], weak:['大頬骨筋','小頬骨筋','上唇挙筋','上唇鼻翼挙筋'] },
      metric:`鼻翼-口角距離指数 ${m.nasolabialIndex.toFixed(3)}`,
    });
  }
  // 4. フェイスラインたるみ
  // 頬下垂 cheekDrop を主指標にする。jawSharpness(頬→顎の開き角)は絶対値が顔幅に強く依存し
  // 年代別閾値(度スケール)の較正が難しいため、検出・重症度には使わず参考値として併記する。
  if (m.cheekDrop > ref.cheekDrop[0]){
    const midDrop = (ref.cheekDrop[0] + ref.cheekDrop[1]) / 2;
    out.push({
      key:'jawSagging',
      severity: m.cheekDrop > ref.cheekDrop[1] ? 'high' : m.cheekDrop > midDrop ? 'mid' : 'low',
      title:'フェイスラインのたるみ',
      description:'写真では、フェイスラインの輪郭がやや不明瞭に見えました。あごの引き方・カメラの高さ・むくみやすい時間帯でも見え方は変化します。',
      tissues:{ tight:['広頸筋','咬筋','胸鎖乳突筋','側頭筋'], weak:['舌骨上筋群','顎二腹筋','頬筋','口角挙筋'] },
      metric:`頬下垂 ${m.cheekDrop.toFixed(2)} / 輪郭角 ${m.jawSharpness.toFixed(0)}°`,
    });
  }
  // 5. むくみ
  // ※目の開き具合はまばたきで大きく変わるため、目を閉じている写真では顔幅のみで見る
  if (m.faceWHRatio > 0.78 || (!m.eyesUnreliable && m.eyeOpenness < 0.085)){
    out.push({
      key:'puffiness',
      severity: m.faceWHRatio > 0.85 ? 'high' : m.faceWHRatio > 0.81 ? 'mid' : 'low',
      title:'顔のむくみ',
      description:'写真では、顔の横幅がやや広めで、目元に張りが見られました。むくみの見え方は時間帯・前日の食事・睡眠・撮影距離でも変わります。',
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
      description:'写真では、パーツの配置が一般的な目安の比率とは少し異なって見えました。これは個性であり、良し悪しではありません。表情や姿勢で印象は変えられます。',
      tissues:{ tight:['咬筋','側頭筋','後頭下筋群'], weak:['前頭筋','眼輪筋','大頬骨筋'] },
      metric:`三庭偏差 ${(triDev*100).toFixed(1)}% / 五眼指数 ${m.fiveEyesIdx.toFixed(2)}`,
    });
  }
  // 7. NEW エラ張り (下顎角は個人差が大きいので基準を上げ過検出を抑える)
  if (m.mandibleProminence > 0.96){
    out.push({
      key:'masseterHypertrophy',
      severity: m.mandibleProminence > 1.05 ? 'high' : m.mandibleProminence > 1.0 ? 'mid' : 'low',
      title:'あごの角まわりの張り',
      description:'写真では、あごの角の部分が頬骨よりやや外側に見えました。骨格による個人差が大きい部分で、写真だけで原因は判断できません。',
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
      description:'写真では、頬骨と頬の輪郭の落差がやや大きく見えました。光の当たり方で影ができると、実際より強調されて写ることがあります。',
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
      description:'写真では、鼻の下から上唇までの距離が長めに見えました。骨格による個人差が大きく、カメラの高さでも見え方が変わります。',
      tissues:{ tight:['オトガイ筋','下唇下制筋'], weak:['上唇挙筋','大頬骨筋','口輪筋上部'] },
      metric:`人中指数 ${m.philtrumIdx.toFixed(2)}`,
    });
  }
  // 10. NEW まぶた重い(フード)
  if (!m.eyesUnreliable && m.browLidGap < 0.18){
    out.push({
      key:'hoodedEyelid',
      severity: m.browLidGap < 0.12 ? 'high' : m.browLidGap < 0.15 ? 'mid' : 'low',
      title:'まぶたの重み・フード',
      description:'写真では、眉と上まぶたの距離が近めに見えました。まぶたの見え方は生まれつきの個性が大きく、撮影時の眠気や光でも変わります。',
      tissues:{ tight:['後頭下筋群','側頭筋'], weak:['前頭筋','上眼瞼挙筋','眼輪筋上部'] },
      metric:`眉-まぶた間 ${m.browLidGap.toFixed(2)}`,
    });
  }
  // 11. NEW 目尻下垂(垂れ目強め)
  // ※目頭・目尻の位置はまばたきで動かないため、目を閉じていても判定できる
  if (m.eyeSlant > 0.025){
    out.push({
      key:'droopyEyeOuter',
      severity: m.eyeSlant > 0.045 ? 'mid' : 'low',
      title:'目尻の下垂',
      description:'写真では、目尻が目頭よりやや下がって見えました。目の形は生まれつきの個性で、そのままでも魅力になります。',
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
      description:'写真では、鼻の下からあご先までの距離が長めに見えました。骨格による個人差が大きい部分です。',
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
      description:'写真からは、気になる大きな偏りは見られませんでした。今のバランスが保てています。',
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
    return { name:'左右差・たるみ複合タイプ', desc:'左右差と輪郭の両方が気になるタイプ。バランスを整える動きと引き上げの動きを並行して行います。', tags:['#左右差','#フェイスライン','#リフトアップ'] };
  }
  if (has('masseterHypertrophy') && has('facialAsymmetry')){
    return { name:'あご角＋左右差タイプ', desc:'エラまわりと左右差の両方が気になるタイプ。左右を均等に使う練習と、あごまわりをゆるめるケアが中心です。', tags:['#エラ張り','#噛みしめ','#左右差'] };
  }
  if (has('mouthCornerDown') && has('nasolabialFold')){
    return { name:'下顔面下垂タイプ', desc:'口元まわりが気になるタイプ。口角とほおを引き上げる動きを重ねていきます。', tags:['#口角UP','#ほうれい線','#中顔面'] };
  }
  if (has('cheekHollow') && has('nasolabialFold')){
    return { name:'中顔面コケ・痩せ複合タイプ', desc:'頬まわりの立体感が気になるタイプ。内側から頬をふくらませる動きが中心になります。', tags:['#頬コケ','#中顔面','#ボリューム'] };
  }
  if (has('puffiness') && metrics.faceWHRatio > 0.8){
    return { name:'むくみ・丸顔タイプ', desc:'顔まわりのめぐりが気になるタイプ。流すケアと動かす動きを組み合わせます。', tags:['#むくみ','#リンパ','#小顔'] };
  }
  if (has('jawSagging') && has('puffiness')){
    return { name:'二重あご・スマホ顔タイプ', desc:'フェイスラインとむくみが重なるタイプ。首・姿勢を含めたケアから整えていきます。', tags:['#二重あご','#姿勢','#スマホ顔'] };
  }
  if (has('hoodedEyelid') && has('droopyEyeOuter')){
    return { name:'まぶた重め・憂いタイプ', desc:'目元まわりが気になるタイプ。まぶたと目尻をやさしく動かすケアが中心です。', tags:['#まぶた','#目尻','#開眼'] };
  }
  // 単独主役タイプ
  if (has('masseterHypertrophy')){
    return { name:'あご角しっかりタイプ', desc:'あごの角まわりが気になるタイプ。あごまわりをゆるめるケアと、噛みしめに気づく習慣づくりが中心です。', tags:['#エラ','#咬筋','#リリース'] };
  }
  if (has('cheekHollow')){
    return { name:'中顔面コケ・繊細タイプ', desc:'頬の立体感が気になるタイプ。内側から頬をふくらませる動きを中心にします。', tags:['#頬コケ','#中顔面','#ボリューム'] };
  }
  if (has('longPhiltrum')){
    return { name:'人中長め・大人っぽタイプ', desc:'鼻の下から口元の距離が長めのタイプ。上唇まわりの動きで印象を変えていけます。', tags:['#人中','#上唇','#大人顔'] };
  }
  if (has('hoodedEyelid')){
    return { name:'まぶた重め・憂いタイプ', desc:'まぶたまわりが気になるタイプ。まぶたを目的の方向に動かす練習が中心です。', tags:['#まぶた','#開眼','#眠そう改善'] };
  }
  if (has('droopyEyeOuter')){
    return { name:'目尻下がり・たれ目タイプ', desc:'目尻が下がり気味のタイプ。やわらかな印象はそのままに、目元まわりを動かすケアを行います。', tags:['#垂れ目','#目尻','#印象UP'] };
  }
  if (has('longLowerFace')){
    return { name:'縦長下顔面タイプ', desc:'下顔面が縦に長めのタイプ。横方向のメリハリをつける動きで印象が変わります。', tags:['#縦長','#下顔面','#メリハリ'] };
  }
  if (has('partsBalance')){
    return { name:'パーツバランス調整タイプ', desc:'パーツの配置に個性があるタイプ。骨格はそのままに、表情と姿勢で印象を整えていけます。', tags:['#黄金比','#三庭五眼','#印象UP'] };
  }
  if (has('facialAsymmetry')){
    return { name:'左右非対称タイプ', desc:'左右差が気になるタイプ。左右を均等に動かす練習を中心にします。', tags:['#左右差','#噛み癖','#バランス'] };
  }
  if (has('jawSagging')){
    return { name:'フェイスラインたるみタイプ', desc:'フェイスラインが気になるタイプ。首まわりをゆるめる動きと、あご下を動かす動きを組み合わせます。', tags:['#二重あご','#輪郭','#首前面'] };
  }
  if (has('mouthCornerDown')){
    return { name:'口角下がり・印象クールタイプ', desc:'口角が気になるタイプ。口角を引き上げる動きで、表情の印象が変わります。', tags:['#口角UP','#印象','#スマイル'] };
  }
  if (has('nasolabialFold')){
    return { name:'中顔面ほうれい線タイプ', desc:'ほうれい線まわりが気になるタイプ。ほおを引き上げる動きが中心になります。', tags:['#ほうれい線','#中顔面','#リフト'] };
  }
  if (has('puffiness')){
    return { name:'むくみ・朝顔タイプ', desc:'むくみが気になるタイプ。顔まわりを動かして流すケアが中心です。', tags:['#むくみ','#朝顔','#代謝'] };
  }
  return { name:'美顔キープタイプ', desc:'大きな偏りが見られないタイプ。今の状態をキープするケアが中心です。', tags:['#維持','#予防','#美顔'] };
}

// ===================================================================
// スコアリング & グレード (年代別キャリブレーション)
// ===================================================================
export function calcScore(result, problems, opts={}){
  let score = 100;
  let symptomPenalty = 0;
  problems.forEach(p => {
    if (p.key === 'general') return;
    if (p.fromSymptom){
      // 自己申告のお悩みは実測ではないため軽め、かつ合計に上限を設ける
      symptomPenalty += 3;
      return;
    }
    score -= p.severity === 'high' ? 13 : p.severity === 'mid' ? 8 : 3;
  });
  score -= Math.min(12, symptomPenalty);
  // 下限45(=Dでも「伸びしろ」の枠)。ふつうの顔はB〜Cに収まる較正。
  return Math.max(45, Math.min(100, Math.round(score)));
}

// 状態ラベル。他人との比較(S/A/B/C/D の成績記号や「上位◯%」)は使わない。
// この数値は「美しさの点数」ではなく、写真から測れた項目が目安の範囲にどれだけ
// 収まっていたかを表す自分基準の指標(=次に取り組む量の目安)。
export function gradeFromScore(score, opts={}){
  let grade, desc;
  if (score >= 90)      { grade='ととのっている'; desc='写真から測れた範囲では、大きな偏りは見られませんでした。今の状態をキープするケアが中心です。'; }
  else if (score >= 80) { grade='おおむね良好';   desc='全体的に整っています。気になるところをピンポイントで整えると、印象がさらに引き締まります。'; }
  else if (score >= 70) { grade='のびしろあり';   desc='変化を実感しやすい段階です。まずは最優先テーマから取り組みましょう。'; }
  else if (score >= 60) { grade='じっくり取り組む'; desc='取り組むテーマがいくつかあります。30日で見た目の印象は十分に変えられます。'; }
  else                  { grade='ここからスタート'; desc='今がはじめどきです。1日数分の習慣から、変化を積み上げていきましょう。'; }
  return { grade, desc };
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

  // 虹彩を物差しにして、比率で表していた値を実際の大きさ(mm)に直す。
  // 個人差があるため「およそ」の値として添えるだけにする。
  const mm = ratio => (m.mmPerScale ? `約${Math.abs(ratio * m.mmPerScale).toFixed(1)}mm` : null);
  const withMm = (text, ratio) => { const s = mm(ratio); return s ? `${text}（${s}）` : text; };

  const items = [
    { name:'中心軸の傾き', value:`${m.midlineTilt.toFixed(1)}°`, detail:'鼻ブリッジ→顎の垂直からのズレ', ...sev(m.midlineTilt,[2.5,5]) },
    { name:'非対称スコア', value:m.asymmetryScore.toFixed(1), detail:'目・眉・口角の高さ差の総合', ...sev(m.asymmetryScore,[12,26]) },
    { name:'口角の位置', value: m.mouthCornerDrop > 0 ? `下垂 ${(m.mouthCornerDrop*100).toFixed(1)}` : `上向き ${(Math.abs(m.mouthCornerDrop)*100).toFixed(1)}`, detail: withMm('下唇中央に対する口角の位置', m.mouthCornerDrop), ...sev(Math.max(0,m.mouthCornerDrop),[0.015,0.035]) },
    { name:'ほうれい線指数', value:m.nasolabialIndex.toFixed(3), detail:'鼻翼→口角の距離(大きいほど良好)', ...sev(Math.max(0,0.46-m.nasolabialIndex),[0.02,0.06]) },
    { name:'フェイスラインの締まり', value:`${m.jawSharpness.toFixed(0)}°`, detail:'頬→顎の開き角(小さいほど締まり・大きいほどたるみ)。バーは頬下垂で評価', ...sev(Math.max(0, m.cheekDrop - 0.48),[0.07,0.14]) },
    { name:'顔の横/縦比', value:m.faceWHRatio.toFixed(2), detail:'理想 ≒ 0.67(小さいほど縦長・引き締まり)', ...sev(Math.max(0,m.faceWHRatio-0.7),[0.05,0.12]) },
    { name:'下顎プロミネンス', value:m.mandibleProminence.toFixed(2), detail:'頬骨幅に対する下顎角幅(大きい=エラ張り)', ...sev(Math.max(0,m.mandibleProminence-0.88),[0.05,0.10]) },
    { name:'頬コケ指数', value:m.cheekHollowIdx.toFixed(2), detail:'頬骨と頬輪郭の落差', ...sev(Math.max(0,m.cheekHollowIdx-0.15),[0.05,0.10]) },
    { name:'人中指数', value:m.philtrumIdx.toFixed(2), detail:'鼻下→上唇の長さ(大きい=長め)', ...sev(Math.max(0,m.philtrumIdx-0.28),[0.04,0.10]) },
    { name:'眉-まぶた間', value:m.browLidGap.toFixed(2), detail: withMm('眉と上まぶたの距離(小さい=まぶた重め)', m.browLidGap), ...sev(Math.max(0,0.20-m.browLidGap),[0.05,0.10]) },
    { name:'目尻の傾き', value:m.eyeSlant.toFixed(3), detail:'+で目尻下がり / -でつり目', ...sev(Math.max(0,Math.abs(m.eyeSlant)-0.01),[0.015,0.03]) },
    { name:'五眼指数', value:m.fiveEyesIdx.toFixed(2), detail:'顔幅 ÷ 目幅(理想 5.0)', ...sev(Math.abs(m.fiveEyesIdx-5.0),[0.4,0.8]) },
    { name:'三庭バランス', value:m.triPct.map(p=>(p*100).toFixed(0)+'%').join(' / '), detail:'上庭/中庭/下庭(理想 33%/33%/33%)', ...sev(Math.max(Math.abs(m.triPct[0]-0.333),Math.abs(m.triPct[1]-0.333),Math.abs(m.triPct[2]-0.333)),[0.04,0.08]) },
  ];
  // Phase 3-15: 画像があれば、シワ・トーン指標を追加
  if (typeof m.wrinkleIdx === 'number'){
    items.push({ name:'肌テクスチャ指数', value:m.wrinkleIdx.toFixed(3), detail:'頬/額の局所コントラスト(小さいほど滑らか)', ...sev(Math.max(0, m.wrinkleIdx - 0.04), [0.01, 0.025]) });
  }
  if (typeof m.toneEvenness === 'number'){
    const pct = Math.round(m.toneEvenness * 100);
    items.push({ name:'肌トーン均一度', value:`${pct}%`, detail:'各部位の色差ばらつき(大きいほど均一)', sev: pct >= 75 ? 'good' : pct >= 55 ? 'mid' : 'bad', pct: pct });
  }
  // 顔の向き。指標そのものではなく「今回の写真がどれだけ正面だったか」を示す参考値。
  // 変換行列から取れているときは、上下の傾き(あおり・うつむき)も併記する。
  if (typeof m.yawDeg === 'number'){
    const exact = m.poseSource === 'matrix';
    const yawAbs = Math.abs(m.yawDeg), pitchAbs = Math.abs(m.pitchDeg || 0);
    // 数度のズレは「向いている」と言うほどではないので、正面として扱う
    const updown = (exact && pitchAbs >= 3)
      ? ` / 上下 ${m.pitchDeg > 0 ? 'あおり' : 'うつむき'} ${pitchAbs.toFixed(0)}°` : '';
    const leftright = yawAbs >= 3 ? `左右 ${yawAbs.toFixed(0)}°` : '';
    const value = (leftright || updown)
      ? `${leftright}${updown}`.replace(/^ \/ /, '')
      : 'ほぼ正面';
    items.push({
      name:'顔の向き',
      value,
      detail: exact ? '0°が正面。正面に近いほど、他の項目も正確に見られます'
                    : '0°が正面(推定値)',
      ...sev(Math.max(Math.abs(m.yawDeg), exact ? Math.abs(m.pitchDeg || 0) : 0), [8, 18]),
    });
  }

  return items.map(it => ({ ...it, pct: Math.max(15, Math.min(100, it.pct)) }));
}
