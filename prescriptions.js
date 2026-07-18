// ===================================================================
// PRESCRIPTIONS — お悩み別の処方 / 種目メタ / 禁忌
//
// EXERCISES(68種) に対する
//   - PRESCRIPTION_MAP : お悩み16種 → 効く種目（先頭ほど優先＝アンカー）
//   - EXERCISE_META    : zone / intensity / tier（プログラム生成のフィルタ）
//   - EXERCISE_META_EXT: 道具 / 時間帯 / 禁忌 / 注意文
// ===================================================================

export const PRESCRIPTION_MAP = {
  facialAsymmetry: { training: ['symmetrySmile','oneSideRelease','oneSideSmile','browSolo','chopstickTrain','mouthCornerLift','fullFlow','postureFace','aiueoTrain','balloonFace','tongueStretch'] },
  mouthCornerDown: { training: ['mouthCornerLift','cornerDepressorRelease','mouthCornerTongue','chopstickTrain','cheekLift','smileHold','aiueoTrain','beakPose','fullFlow','lipPucker'] },
  nasolabialFold:  { training: ['nasolabialStretch','cheekLiftAssist','balloonFace','cheekLift','tongueRoll','chinUpPose','mouthCornerTongue','upperLipTrain','cheekPump','fishFace'] },
  jawSagging:      { training: ['chinTuck','chinPress','neckFront','faceLymphDrain','octopusPose','jawSlide','tonguePress','swallowTrain','chinMassage','neckIso','beakPose'] },
  puffiness:       { training: ['faceLymphDrain','tongueOut','earYoga','cheekPump','cheekAir','clavicleLymph','neckMassage','faceMassage','breathGlow','bloodFlowPose','munchFace','chinMassage'] },
  partsBalance:    { training: ['fullFlow','freshFacePose','browRaise','eyeWideOpen','cheekLift','mouthCornerLift','symmetrySmile','aiueoTrain','smileHold'] },
  masseterHypertrophy: { training: ['masseterRelease','oneSideRelease','masseterTap','masseterStretch','templeRelease','earYoga','mouthOpen','jawSlide','faceRelax','neckSide'] },
  cheekHollow:     { training: ['cheekPump','balloonFace','cheekAir','cheekLift','cheekLiftAssist','tongueRoll','nasolabialStretch','cheekBoneMassage'] },
  longPhiltrum:    { training: ['upperLipTrain','lipPucker','bigO','mouthCornerTongue','aiueoTrain','cheekLift','lipOpenClose'] },
  gummySmile:      { training: ['upperLipTrain','mouthCornerLift','lipPucker','smileHold','symmetrySmile','cheekLift','aiueoTrain'] },
  hoodedEyelid:    { training: ['eyeWideOpen','binocularPose','browRaise','foreheadSmooth','hairlineLift','eyeRelease','lowerLidLift','blinkReset'] },
  droopyEyeOuter:  { training: ['outerEyeLift','binocularPose','eyeWideOpen','lowerLidLift','browRaise','eyeRelease','symmetrySmile'] },
  longLowerFace:   { training: ['chinTuck','tonguePress','neckFront','chinPress','octopusPose','postureFace','mouthOpen','faceRelax'] },
  templeHollow:    { training: ['templeRelease','earYoga','oneSideRelease','masseterRelease','browRaise','foreheadSmooth','faceMassage','faceRelax','hairlineLift'] },
  foreheadLines:   { training: ['foreheadSmooth','hairlineLift','browUpDown','browRaise','glabellaRelease','faceRelax','diaphragmBreath','templeRelease'] },
  glabellarLines:  { training: ['glabellaRelease','browUpDown','foreheadSmooth','faceRelax','diaphragmBreath','breathGlow','eyeRelease','templeRelease'] },
  general:         { training: ['fullFlow','cheekLift','mouthCornerLift','tongueRoll','aiueoTrain','chinTuck','browRaise','earYoga','faceLymphDrain','breathGlow','faceRelax','postureFace','smileHold','neckFront'] },
};

// zone: upper(額・目・眉) / mid(頬・鼻・口輪) / lower(口角・あご・首)
// intensity: light / medium / heavy    tier: 1(基礎) / 2(標準) / 3(応用)
export const EXERCISE_META = {
  // 額・眉間
  browRaise:        { zone:'upper', intensity:'light',  tier:1 },
  browUpDown:       { zone:'upper', intensity:'light',  tier:1 },
  foreheadSmooth:   { zone:'upper', intensity:'light',  tier:1 },
  glabellaRelease:  { zone:'upper', intensity:'light',  tier:1 },
  hairlineLift:     { zone:'upper', intensity:'light',  tier:2 },
  browSolo:         { zone:'upper', intensity:'medium', tier:3 },
  // 目
  eyeWideOpen:      { zone:'upper', intensity:'light',  tier:1 },
  binocularPose:    { zone:'upper', intensity:'medium', tier:2 },
  lowerLidLift:     { zone:'upper', intensity:'light',  tier:2 },
  outerEyeLift:     { zone:'upper', intensity:'medium', tier:2 },
  munchFace:        { zone:'upper', intensity:'medium', tier:2 },
  eyeRelease:       { zone:'upper', intensity:'light',  tier:1 },
  eyeRoll:          { zone:'upper', intensity:'light',  tier:2 },
  blinkReset:       { zone:'upper', intensity:'light',  tier:1 },
  // 頬
  cheekLift:        { zone:'mid',   intensity:'medium', tier:1 },
  cheekLiftAssist:  { zone:'mid',   intensity:'medium', tier:2 },
  cheekPump:        { zone:'mid',   intensity:'light',  tier:1 },
  balloonFace:      { zone:'mid',   intensity:'medium', tier:2 },
  cheekAir:         { zone:'mid',   intensity:'light',  tier:2 },
  cheekBoneMassage: { zone:'mid',   intensity:'light',  tier:2 },
  nasolabialStretch:{ zone:'mid',   intensity:'medium', tier:2 },
  fishFace:         { zone:'mid',   intensity:'medium', tier:2 },
  // 口・唇
  mouthCornerLift:  { zone:'lower', intensity:'light',  tier:1 },
  mouthCornerTongue:{ zone:'lower', intensity:'medium', tier:3 },
  aiueoTrain:       { zone:'mid',   intensity:'heavy',  tier:1 },
  chopstickTrain:   { zone:'lower', intensity:'medium', tier:2 },
  beakPose:         { zone:'lower', intensity:'medium', tier:2 },
  upperLipTrain:    { zone:'lower', intensity:'medium', tier:2 },
  lipOpenClose:     { zone:'lower', intensity:'light',  tier:1 },
  lipPucker:        { zone:'lower', intensity:'light',  tier:1 },
  lipRelease:       { zone:'lower', intensity:'light',  tier:2 },
  bigO:             { zone:'lower', intensity:'medium', tier:2 },
  // 舌
  tongueRoll:       { zone:'mid',   intensity:'medium', tier:1 },
  tonguePress:      { zone:'lower', intensity:'light',  tier:1 },
  tongueOut:        { zone:'mid',   intensity:'medium', tier:2 },
  tongueStretch:    { zone:'lower', intensity:'medium', tier:2 },
  lionPose:         { zone:'mid',   intensity:'heavy',  tier:2 },
  swallowTrain:     { zone:'lower', intensity:'light',  tier:2 },
  // あご
  chinTuck:         { zone:'lower', intensity:'medium', tier:1 },
  chinPress:        { zone:'lower', intensity:'medium', tier:2 },
  chinMassage:      { zone:'lower', intensity:'light',  tier:2 },
  jawSlide:         { zone:'lower', intensity:'medium', tier:2 },
  mouthOpen:        { zone:'lower', intensity:'light',  tier:2 },
  octopusPose:      { zone:'lower', intensity:'medium', tier:2 },
  chinUpPose:       { zone:'lower', intensity:'medium', tier:2 },
  // エラ・こめかみ
  masseterRelease:  { zone:'mid',   intensity:'light',  tier:1 },
  masseterTap:      { zone:'mid',   intensity:'light',  tier:2 },
  templeRelease:    { zone:'upper', intensity:'light',  tier:2 },
  masseterStretch:  { zone:'mid',   intensity:'light',  tier:2 },
  // 首・肩
  neckFront:        { zone:'lower', intensity:'medium', tier:1 },
  neckSide:         { zone:'lower', intensity:'light',  tier:1 },
  neckBack:         { zone:'lower', intensity:'light',  tier:1 },
  neckDiagonal:     { zone:'lower', intensity:'light',  tier:2 },
  neckIso:          { zone:'lower', intensity:'heavy',  tier:3 },
  neckMassage:      { zone:'lower', intensity:'light',  tier:2 },
  clavicleLymph:    { zone:'lower', intensity:'light',  tier:2 },
  shoulderRoll:     { zone:'lower', intensity:'light',  tier:1 },
  // 全体・呼吸・姿勢・左右差
  fullFlow:         { zone:'mid',   intensity:'heavy',  tier:1 },
  faceRelax:        { zone:'mid',   intensity:'light',  tier:1 },
  breathGlow:       { zone:'mid',   intensity:'light',  tier:1 },
  diaphragmBreath:  { zone:'mid',   intensity:'light',  tier:1 },
  bloodFlowPose:    { zone:'mid',   intensity:'medium', tier:2 },
  freshFacePose:    { zone:'mid',   intensity:'medium', tier:2 },
  faceMassage:      { zone:'mid',   intensity:'light',  tier:1 },
  postureFace:      { zone:'lower', intensity:'light',  tier:1 },
  symmetrySmile:    { zone:'mid',   intensity:'medium', tier:2 },
  oneSideSmile:     { zone:'lower', intensity:'medium', tier:2 },
  smileHold:        { zone:'mid',   intensity:'medium', tier:1 },
  // 網羅性強化（v6.2 追加）
  earYoga:          { zone:'mid',   intensity:'light',  tier:1 },
  oneSideRelease:   { zone:'lower', intensity:'light',  tier:2 },
  faceLymphDrain:   { zone:'mid',   intensity:'light',  tier:1 },
  cornerDepressorRelease: { zone:'lower', intensity:'light', tier:2 },
};

export const CONTRA_LABEL = {
  tmj:           '顎関節症・顎の痛み',
  skinSensitive: '敏感肌・皮膚疾患',
  pregnancy:     '妊娠中・産後3ヶ月以内',
  highBp:        '高血圧・心疾患',
  neckProblem:   '首・頸椎の不調',
  glaucoma:      '緑内障・眼圧の高い方',
};
export const TIME_OF_DAY_LABEL = { morning:'🌅 朝向け', evening:'🌙 夜向け', any:'⏱ いつでも' };
export const TOOLS_LABEL = { none:'手ぶら', fingers:'指(手)', pen:'ペン・割り箸', mirror:'鏡' };

export const EXERCISE_META_EXT = {
  // --- 指でほぐす系（敏感肌は注意） ---
  foreheadSmooth:  { tools:['fingers'], contra:['skinSensitive'], timeOfDay:['evening'] },
  glabellaRelease: { tools:['fingers'], contra:['skinSensitive'], timeOfDay:['evening'] },
  hairlineLift:    { tools:['fingers'], contra:['skinSensitive'] },
  eyeRelease:      { tools:['fingers'], contra:['skinSensitive','glaucoma'], timeOfDay:['evening'], warning:'目のまわりは皮ふが薄いので、なでるだけの力で' },
  cheekBoneMassage:{ tools:['fingers'], contra:['skinSensitive'] },
  lipRelease:      { tools:['fingers'], contra:['skinSensitive'] },
  masseterRelease: { tools:['fingers'], contra:['tmj','skinSensitive'], timeOfDay:['evening'], warning:'痛みのない範囲で。強く押しすぎないこと' },
  masseterTap:     { tools:['fingers'], contra:['skinSensitive'], timeOfDay:['evening'] },
  templeRelease:   { tools:['fingers'], contra:['skinSensitive'], timeOfDay:['evening'] },
  chinMassage:     { tools:['fingers'], contra:['skinSensitive'] },
  neckMassage:     { tools:['fingers'], contra:['skinSensitive','neckProblem'] },
  clavicleLymph:   { tools:['fingers'], contra:['skinSensitive'], warning:'鎖骨の上は強く押さないこと' },
  faceMassage:     { tools:['fingers'], contra:['skinSensitive'], timeOfDay:['evening'] },

  // --- あご・顎関節を動かす系 ---
  jawSlide:        { contra:['tmj'], warning:'あごに痛みや引っかかりが出たら中止してください' },
  mouthOpen:       { contra:['tmj'], warning:'痛みや音が出たら無理をしないこと' },
  masseterStretch: { tools:['fingers'], contra:['tmj'], warning:'痛みが出たら中止' },
  lionPose:        { contra:['tmj'], timeOfDay:['morning'] },
  bigO:            { contra:['tmj'] },

  // --- 首まわり（頸椎注意） ---
  neckFront:       { contra:['neckProblem'], timeOfDay:['evening'], warning:'首を反らしすぎず、痛みのない範囲で' },
  neckSide:        { contra:['neckProblem'], timeOfDay:['evening'], warning:'頭を強く引っ張らないこと' },
  neckBack:        { contra:['neckProblem'], timeOfDay:['evening'] },
  neckDiagonal:    { contra:['neckProblem'], timeOfDay:['evening'] },
  neckIso:         { contra:['neckProblem','highBp'], warning:'息を止めないこと' },
  chinTuck:        { contra:['neckProblem'] },
  octopusPose:     { tools:['fingers'], contra:['neckProblem'], warning:'首を反らしすぎないこと' },
  chinUpPose:      { contra:['neckProblem'] },
  postureFace:     { contra:['neckProblem'], timeOfDay:['morning'] },
  shoulderRoll:    { timeOfDay:['morning'] },

  // --- 目元（緑内障＝眼圧注意） ---
  eyeWideOpen:     { contra:['glaucoma'], timeOfDay:['morning'] },
  binocularPose:   { tools:['fingers','mirror'], contra:['glaucoma'], timeOfDay:['morning'] },
  lowerLidLift:    { contra:['glaucoma'] },
  outerEyeLift:    { tools:['mirror'], contra:['glaucoma'] },
  munchFace:       { tools:['mirror'], contra:['glaucoma'] },
  eyeRoll:         { contra:['glaucoma'], timeOfDay:['evening'] },
  blinkReset:      { timeOfDay:['evening'] },

  // --- 鏡・道具を使う ---
  mouthCornerLift:  { tools:['mirror'] },
  mouthCornerTongue:{ tools:['mirror'] },
  symmetrySmile:    { tools:['mirror'] },
  oneSideSmile:     { tools:['mirror'] },
  smileHold:        { tools:['mirror'] },
  browSolo:         { tools:['mirror'] },
  chopstickTrain:   { tools:['pen','mirror'], warning:'割り箸は強く噛まないこと' },
  lipPucker:        { tools:['none'] },
  cheekLift:        { tools:['fingers','mirror'] },
  cheekLiftAssist:  { tools:['fingers','mirror'] },
  chinPress:        { tools:['fingers'] },
  swallowTrain:     { tools:['fingers'] },

  // --- 呼吸系（妊娠中・高血圧は注意） ---
  breathGlow:      { contra:['highBp','pregnancy'], timeOfDay:['evening'], warning:'息を止めず、めまいが出たら中止' },
  diaphragmBreath: { contra:['pregnancy'], timeOfDay:['evening'] },
  bloodFlowPose:   { contra:['highBp','pregnancy'], warning:'立ちくらみ・めまいが出たら中止' },
  tongueOut:       { contra:['highBp'], timeOfDay:['morning'] },

  // --- 朝のスイッチ系 ---
  fullFlow:        { timeOfDay:['morning'] },
  aiueoTrain:      { timeOfDay:['morning'] },
  tongueRoll:      { timeOfDay:['morning'] },
  freshFacePose:   { tools:['mirror'], contra:['tmj'], timeOfDay:['morning'], warning:'あごが痛むときは無理に大きく開けない' },
  // --- 夜のリラックス系 ---
  faceRelax:       { timeOfDay:['evening'] },
  // --- 網羅性強化（v6.2 追加） ---
  earYoga:                { tools:['none'] },
  oneSideRelease:         { tools:['fingers'], contra:['skinSensitive'] },
  faceLymphDrain:         { tools:['fingers'], contra:['skinSensitive'] },
  cornerDepressorRelease: { tools:['fingers'], contra:['skinSensitive'] },
};

export function getMeta(id){
  const base = EXERCISE_META[id] || { zone:'mid', intensity:'medium', tier:2 };
  const ext  = EXERCISE_META_EXT[id] || {};
  return {
    ...base,
    tools:    ext.tools    || ['none'],
    timeOfDay:ext.timeOfDay|| ['any'],
    contra:   ext.contra   || [],
    warning:  ext.warning  || null,
  };
}

// 禁忌ユーザー設定で除外すべきかを判定
export function isExerciseAllowed(id, userContra = []){
  if (!userContra || userContra.length === 0) return true;
  const m = getMeta(id);
  if (!m.contra || m.contra.length === 0) return true;
  return !m.contra.some(c => userContra.includes(c));
}
