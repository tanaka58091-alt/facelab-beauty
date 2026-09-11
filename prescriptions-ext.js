// ===================================================================
// PRESCRIPTIONS EXT — 拡張44種（v6.11）のメタ情報と処方
//
// prescriptions.js から読み込んでマージする。
// このファイルは他モジュールに依存しない純粋なデータ（循環importを避けるため）。
// ===================================================================

// zone: upper(額・目・眉) / mid(頬・鼻・口輪) / lower(口角・あご・首)
// intensity: light / medium / heavy    tier: 1(基礎) / 2(標準) / 3(応用)
export const META_ADD = {
  // 額・眉間
  browInnerLift:     { zone:'upper', intensity:'light',  tier:3 },
  foreheadHold:      { zone:'upper', intensity:'medium', tier:2 },
  browBonePress:     { zone:'upper', intensity:'light',  tier:1 },
  foreheadTap:       { zone:'upper', intensity:'light',  tier:1 },
  // 目
  upperLidHold:      { zone:'upper', intensity:'medium', tier:3 },
  squintHold:        { zone:'upper', intensity:'medium', tier:3 },
  eyeSqueeze:        { zone:'upper', intensity:'medium', tier:1 },
  orbitPress:        { zone:'upper', intensity:'light',  tier:2 },
  palming:           { zone:'upper', intensity:'light',  tier:1 },
  eyeFigure8:        { zone:'upper', intensity:'light',  tier:2 },
  // 頬
  cheekBoneLift:     { zone:'mid',   intensity:'medium', tier:2 },
  cheekResist:       { zone:'mid',   intensity:'heavy',  tier:3 },
  smileSquint:       { zone:'mid',   intensity:'medium', tier:2 },
  cheekTongueSweep:  { zone:'mid',   intensity:'medium', tier:2 },
  midfaceLift:       { zone:'mid',   intensity:'medium', tier:2 },
  cheekHoldOne:      { zone:'mid',   intensity:'medium', tier:3 },
  // 口・唇
  strawPose:         { zone:'lower', intensity:'medium', tier:1 },
  lipRollIn:         { zone:'lower', intensity:'medium', tier:2 },
  whistlePose:       { zone:'lower', intensity:'light',  tier:1 },
  mouthWideI:        { zone:'lower', intensity:'medium', tier:1 },
  lipCornerPull:     { zone:'lower', intensity:'medium', tier:3 },
  lipUpDownAir:      { zone:'lower', intensity:'light',  tier:2 },
  // 舌
  tongueUpHold:      { zone:'lower', intensity:'light',  tier:1 },
  tongueSidePush:    { zone:'mid',   intensity:'heavy',  tier:3 },
  tongueGumTrace:    { zone:'mid',   intensity:'light',  tier:2 },
  tongueDownPress:   { zone:'lower', intensity:'heavy',  tier:3 },
  // あご・フェイスライン
  chinKissUp:        { zone:'lower', intensity:'medium', tier:2 },
  jawResist:         { zone:'lower', intensity:'medium', tier:3 },
  submentalPush:     { zone:'lower', intensity:'heavy',  tier:3 },
  jawLineTrace:      { zone:'lower', intensity:'light',  tier:1 },
  chinSideTuck:      { zone:'lower', intensity:'medium', tier:2 },
  // エラ・こめかみ
  masseterDeep:      { zone:'mid',   intensity:'light',  tier:2 },
  templeCircle:      { zone:'upper', intensity:'light',  tier:1 },
  jawDrop:           { zone:'lower', intensity:'light',  tier:1 },
  innerCheekRelease: { zone:'mid',   intensity:'light',  tier:3 },
  // 首・肩・姿勢
  chestOpen:         { zone:'lower', intensity:'light',  tier:1 },
  scapulaSqueeze:    { zone:'lower', intensity:'medium', tier:1 },
  sternoRelease:     { zone:'lower', intensity:'light',  tier:2 },
  wallPosture:       { zone:'lower', intensity:'light',  tier:1 },
  headSlideBack:     { zone:'lower', intensity:'medium', tier:1 },
  // 全体・呼吸・リラックス
  noseBreathTrain:   { zone:'mid',   intensity:'light',  tier:1 },
  faceTapAll:        { zone:'mid',   intensity:'light',  tier:1 },
  parotidDrain:      { zone:'lower', intensity:'light',  tier:1 },
  nightReset:        { zone:'mid',   intensity:'light',  tier:1 },
};

export const META_EXT_ADD = {
  // --- 指でほぐす系（敏感肌は注意） ---
  browBonePress:     { tools:['fingers'], contra:['skinSensitive','glaucoma'], timeOfDay:['evening'], warning:'目の玉は絶対に押さないこと' },
  foreheadTap:       { tools:['fingers'], contra:['skinSensitive'] },
  orbitPress:        { tools:['fingers'], contra:['skinSensitive','glaucoma'], timeOfDay:['evening'], warning:'骨の上だけを押し、眼球は押さないこと' },
  jawLineTrace:      { tools:['fingers'], contra:['skinSensitive'] },
  templeCircle:      { tools:['fingers'], contra:['skinSensitive'], timeOfDay:['evening'] },
  faceTapAll:        { tools:['fingers'], contra:['skinSensitive'] },
  parotidDrain:      { tools:['fingers'], contra:['skinSensitive'], warning:'なでるだけの弱さで。強く押さないこと' },
  sternoRelease:     { tools:['fingers'], contra:['skinSensitive','neckProblem'], timeOfDay:['evening'], warning:'強くつままないこと' },
  masseterDeep:      { tools:['fingers'], contra:['tmj','skinSensitive'], timeOfDay:['evening'], warning:'痛みが出るほど押さない。あごが痛むときは中止' },
  innerCheekRelease: { tools:['fingers'], contra:['tmj','skinSensitive'], timeOfDay:['evening'], warning:'必ず手を洗ってから。強くつままないこと' },

  // --- 目元（緑内障＝眼圧注意） ---
  upperLidHold:      { tools:['fingers','mirror'], contra:['glaucoma'], timeOfDay:['morning'] },
  squintHold:        { tools:['mirror'], contra:['glaucoma'] },
  eyeSqueeze:        { contra:['glaucoma'], timeOfDay:['morning'] },
  eyeFigure8:        { contra:['glaucoma'], timeOfDay:['evening'] },
  palming:           { timeOfDay:['evening'] },
  foreheadHold:      { tools:['fingers','mirror'], contra:['glaucoma'] },

  // --- あご・顎関節を動かす系 ---
  jawResist:         { tools:['fingers'], contra:['tmj'], warning:'あごに痛みや音が出たら中止してください' },
  jawDrop:           { timeOfDay:['evening'] },
  tongueSidePush:    { tools:['fingers'], contra:['tmj'], warning:'あごが痛むときは中止' },
  tongueDownPress:   { tools:['fingers'], warning:'のど仏の上は押さないこと' },
  submentalPush:     { tools:['fingers'], warning:'のど仏の上は押さない。息を止めないこと' },

  // --- 首まわり（頸椎注意） ---
  chinKissUp:        { contra:['neckProblem'], warning:'のけぞりすぎない。首が痛むときは中止' },
  chinSideTuck:      { contra:['neckProblem'], warning:'あごを上げないこと' },
  headSlideBack:     { contra:['neckProblem'] },
  wallPosture:       { contra:['neckProblem'], timeOfDay:['morning'], warning:'あごを上げて無理に頭をつけないこと' },
  chestOpen:         { contra:['neckProblem'], timeOfDay:['morning'], warning:'腰を反らせないこと' },
  scapulaSqueeze:    { timeOfDay:['morning'] },

  // --- 鏡を使う ---
  browInnerLift:     { tools:['mirror'] },
  cheekBoneLift:     { tools:['mirror'] },
  smileSquint:       { tools:['mirror'] },
  cheekHoldOne:      { tools:['mirror'] },
  mouthWideI:        { tools:['mirror'] },
  lipCornerPull:     { tools:['mirror'] },
  midfaceLift:       { tools:['fingers','mirror'] },
  cheekResist:       { tools:['fingers'], warning:'強く押しすぎない。息を止め続けないこと' },

  // --- 呼吸系 ---
  noseBreathTrain:   { contra:['pregnancy'], warning:'苦しくなるまで我慢しないこと' },
  // --- 夜のリセット ---
  nightReset:        { timeOfDay:['evening'] },
};

// お悩み → 追加する種目（既存リストの後ろに足す）
export const PRESCRIPTION_ADD = {
  facialAsymmetry:     ['cheekHoldOne','lipCornerPull','chinSideTuck','browInnerLift','tongueSidePush'],
  mouthCornerDown:     ['lipCornerPull','mouthWideI','smileSquint','strawPose','cheekBoneLift'],
  nasolabialFold:      ['midfaceLift','cheekTongueSweep','cheekBoneLift','whistlePose','lipUpDownAir','strawPose','tongueGumTrace'],
  jawSagging:          ['tongueUpHold','submentalPush','tongueDownPress','jawLineTrace','chinSideTuck','headSlideBack','mouthWideI','chinKissUp'],
  puffiness:           ['parotidDrain','faceTapAll','jawLineTrace','sternoRelease','noseBreathTrain'],
  partsBalance:        ['cheekBoneLift','smileSquint','midfaceLift','mouthWideI','wallPosture'],
  masseterHypertrophy: ['masseterDeep','jawDrop','innerCheekRelease','templeCircle','jawResist','lionPose'],
  cheekHollow:         ['cheekResist','cheekTongueSweep','cheekBoneLift','midfaceLift'],
  longPhiltrum:        ['whistlePose','strawPose','lipUpDownAir','lipRollIn','tongueGumTrace','lipRelease'],
  gummySmile:          ['lipRollIn','smileSquint','lipCornerPull','strawPose'],
  hoodedEyelid:        ['upperLidHold','foreheadHold','browBonePress','eyeSqueeze','orbitPress','palming','eyeRoll'],
  droopyEyeOuter:      ['squintHold','upperLidHold','smileSquint','eyeFigure8'],
  longLowerFace:       ['tongueUpHold','headSlideBack','jawDrop','chestOpen','submentalPush','chinKissUp'],
  templeHollow:        ['templeCircle','masseterDeep','foreheadTap','faceTapAll'],
  foreheadLines:       ['foreheadHold','foreheadTap','browInnerLift','browBonePress'],
  glabellarLines:      ['browBonePress','browInnerLift','nightReset','palming','foreheadTap'],
  general:             ['faceTapAll','tongueUpHold','cheekBoneLift','headSlideBack','noseBreathTrain',
                        'nightReset','chestOpen','smileSquint','mouthWideI','scapulaSqueeze',
                        'eyeSqueeze','jawDrop','parotidDrain','strawPose','jawLineTrace',
                        'shoulderRoll','neckBack','neckDiagonal','tongueGumTrace','chinKissUp'],
};
