// ===================================================================
// FACE TRAINING EXERCISES
// ほぼすべて表情筋トレ(顔ヨガ/運動学)。ストレッチ/リリース系は最小限。
// kind: 'training' (能動収縮) / 'stretch' (受動伸長・リリース)
// 1日4種目のうち stretch は最大1つに制限(program.js)
// ===================================================================

const svg = (inner) => `<svg viewBox="0 0 80 80" class="ex-svg">${inner}</svg>`;
const face = (extra='') => `
  <ellipse cx="40" cy="44" rx="22" ry="28" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>
  <circle cx="32" cy="38" r="2" fill="#0b1530"/>
  <circle cx="48" cy="38" r="2" fill="#0b1530"/>
  ${extra}
`;

export const EXERCISES = {

  // ============== 大頬骨筋・口角挙筋 (リフトアップ) ==============
  zygoLift: {
    id:'zygoLift', name:'頬骨リフト・スマイル', category:'training', kind:'training',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(face(`
      <path d="M30 50 Q40 56 50 50" stroke="#E07A8A" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M28 46 L22 40 M52 46 L58 40" stroke="#FFB7C5" stroke-width="2"/>
    `)),
    purpose:'大頬骨筋・口角挙筋を活性化し、口角と頬を物理的に引き上げる',
    targets:['大頬骨筋','小頬骨筋','口角挙筋','上唇挙筋'],
    how:[
      '前歯を8本見せるように口角を上げる(「イ」の口)',
      '頬の最も高い部分を、両方の人差し指で軽く支える',
      'そのまま5秒キープし、ゆっくり戻す',
      '10回 × 2セット',
    ],
    cues:{
      do:'頬の上部に明確な筋収縮を感じる位置で止める',
      dont:'眉間・首に力を入れない／目を細めすぎない',
    },
    why:'大頬骨筋は加齢で最も衰えやすい表情筋の一つ。意識的に収縮させることで頬全体のリフトと口角の上昇に直結する。',
  },

  cheekPress: {
    id:'cheekPress', name:'チークプッシュ・ホールド', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <circle cx="26" cy="46" r="3" fill="none" stroke="#E07A8A" stroke-width="1.5"/>
      <circle cx="54" cy="46" r="3" fill="none" stroke="#E07A8A" stroke-width="1.5"/>
      <path d="M34 54 Q40 58 46 54" stroke="#E07A8A" stroke-width="2" fill="none"/>
    `)),
    purpose:'頬を意識的に持ち上げ、頬骨上の脂肪体を本来の位置に戻す',
    targets:['大頬骨筋','頬筋','上唇挙筋'],
    how:[
      '人差し指の腹を頬骨の下に軽く置く',
      '指は固定したまま、頬の力だけで指を押し返すように頬を上げる',
      '5秒キープして脱力',
      '左右同時に10回',
    ],
    cues:{
      do:'頬の上端に筋肉の盛り上がりを意識する',
      dont:'指で頬を引き上げない(あくまで筋活動)',
    },
    why:'視覚的フィードバックで頬の動きが学習され、表情筋の独立した動員が促される。',
  },

  // ============== 口角・口輪筋 ==============
  mouthCornerUp: {
    id:'mouthCornerUp', name:'口角アップ・カウント', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <path d="M28 52 L34 48 M52 52 L46 48" stroke="#E07A8A" stroke-width="2.5" stroke-linecap="round"/>
      <path d="M34 48 Q40 52 46 48" stroke="#0b1530" stroke-width="1.5" fill="none"/>
    `)),
    purpose:'口角の挙上を担う筋肉を、対称的に動員する',
    targets:['口角挙筋','大頬骨筋','頬筋'],
    how:[
      '唇を軽く閉じたまま、片方ずつ口角を耳の方向へ上げる',
      '左口角→中央→右口角→中央 のリズムで',
      '左右5回ずつ × 2セット',
    ],
    cues:{
      do:'反対側の口角は動かさず、独立して動かす',
      dont:'顎をずらさない／首に力を入れない',
    },
    why:'片側ずつの収縮は左右非対称の改善に直結。表情の独立性が高まり、笑顔の質が変わる。',
  },

  pencilLift: {
    id:'pencilLift', name:'ペンくわえリフト', category:'training', kind:'training',
    duration:'1分', equipment:'ペン or 割り箸',
    illustration: svg(face(`
      <rect x="20" y="50" width="40" height="3" fill="#FFD93D"/>
      <path d="M28 54 Q40 58 52 54" stroke="#E07A8A" stroke-width="2" fill="none"/>
    `)),
    purpose:'口輪筋・口角挙筋を強く収縮させ、口元のたるみを引き締める',
    targets:['口輪筋','口角挙筋','大頬骨筋'],
    how:[
      'ペン(または割り箸)を前歯で軽く水平に挟む',
      '唇でペンを支えるように、口角だけを真上に引き上げる',
      '10秒キープ × 5セット',
    ],
    cues:{
      do:'ペンが平行を保つ高さで止める',
      dont:'噛みしめない／首に力を入れない',
    },
    why:'物理的目印で左右の高さを揃えやすく、口角挙筋の左右差是正に有効。',
  },

  // ============== 広頸筋・首前面 (フェイスライン) ==============
  platysmaActivation: {
    id:'platysmaActivation', name:'広頸筋アクティベーション', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(`
      <path d="M30 30 Q40 26 50 30 L52 50 Q40 56 28 50 Z" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>
      <path d="M30 50 L26 70 M50 50 L54 70" stroke="#E07A8A" stroke-width="2"/>
      <path d="M34 64 Q40 60 46 64" stroke="#FFD93D" stroke-width="2" fill="none"/>
    `),
    purpose:'首前面〜デコルテの広頸筋を引き締め、二重あごとフェイスラインを整える',
    targets:['広頸筋','胸鎖乳突筋','舌骨下筋群'],
    how:[
      '天井を見上げるように顎を上げる',
      '下唇を上唇に重ねるように突き出し、首前面が突っ張る位置をキープ',
      '5秒キープ × 10回',
    ],
    cues:{
      do:'首前面〜鎖骨の上に縦のスジが浮き出る感覚',
      dont:'首を反らしすぎない／肩を上げない',
    },
    why:'広頸筋は皮膚と直接つながり、たるみ・横ジワに直接影響する数少ない表情筋。',
  },

  chinTuck: {
    id:'chinTuck', name:'チンタック・舌押し', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(`
      <circle cx="40" cy="36" r="14" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>
      <path d="M40 50 L40 64" stroke="#E07A8A" stroke-width="2"/>
      <path d="M30 50 Q40 54 50 50" stroke="#FFD93D" stroke-width="2" fill="none"/>
      <path d="M36 44 Q40 48 44 44" stroke="#0b1530" stroke-width="1.2" fill="none"/>
    `),
    purpose:'舌骨上筋群と深層頸屈筋を使い、二重あごを内側から引き上げる',
    targets:['舌骨上筋群','顎二腹筋','深部頸屈筋'],
    how:[
      '背筋を伸ばして座る',
      '顎を軽く引き(後頭部を上から糸で引かれる感覚)、舌全体を上顎に強く押し付ける',
      '5秒キープ × 10回',
    ],
    cues:{
      do:'舌の付け根から押し上げる',
      dont:'顎を強く引きすぎない／呼吸を止めない',
    },
    why:'舌の位置(MFT)は顔の下半分の引き締めに直結。日中も舌が上顎に付く習慣を作る。',
  },

  jawlineSlide: {
    id:'jawlineSlide', name:'ジョーラインスライド', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <path d="M22 58 Q40 70 58 58" stroke="#E07A8A" stroke-width="2.5" fill="none"/>
      <circle cx="22" cy="58" r="2" fill="#FFD93D"/>
      <circle cx="58" cy="58" r="2" fill="#FFD93D"/>
    `)),
    purpose:'広頸筋とフェイスラインの皮下組織にメリハリを生む',
    targets:['広頸筋','咬筋','口角下制筋'],
    how:[
      '口角を「ニッ」と横に強く広げる(イーの形)',
      'その状態のまま下顎をゆっくり前に突き出す',
      '3秒キープ→戻す を10回',
    ],
    cues:{
      do:'首前面〜顎下の張りを感じる',
      dont:'肩を上げない／顎関節に痛みが出たら中止',
    },
    why:'広頸筋の縦線維と下顎の連動を再学習し、フェイスラインを明確化。',
  },

  // ============== 眼輪筋・前頭筋 (目元) ==============
  orbicularisLift: {
    id:'orbicularisLift', name:'眼輪筋スクイーズ', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <ellipse cx="32" cy="38" rx="5" ry="2.5" fill="none" stroke="#E07A8A" stroke-width="1.5"/>
      <ellipse cx="48" cy="38" rx="5" ry="2.5" fill="none" stroke="#E07A8A" stroke-width="1.5"/>
    `)),
    purpose:'眼輪筋を強化し、まぶたの開閉力とまぶたのたるみを改善',
    targets:['眼輪筋','上眼瞼挙筋'],
    how:[
      '額・眉に手を当てて固定(額の代償を防ぐ)',
      '下まぶただけで目を細める(下から上に押し上げる感覚)',
      '5秒キープ × 10回',
    ],
    cues:{
      do:'下まぶたの厚みが上に押し上がる感覚',
      dont:'眉間にシワを寄せない／額を上げない',
    },
    why:'眼輪筋の収縮力低下は目の小ささ・下まぶたのたるみの直接原因。',
  },

  browLift: {
    id:'browLift', name:'眉ピンポイントリフト', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <path d="M26 32 Q32 28 38 32" stroke="#E07A8A" stroke-width="2.5" fill="none"/>
      <path d="M42 32 Q48 28 54 32" stroke="#E07A8A" stroke-width="2.5" fill="none"/>
      <circle cx="32" cy="38" r="2" fill="#0b1530"/>
      <circle cx="48" cy="38" r="2" fill="#0b1530"/>
    `)),
    purpose:'前頭筋の独立した動員で、額・眉のリフトと左右差を整える',
    targets:['前頭筋','眼輪筋上部'],
    how:[
      '額に横ジワを作るのではなく、眉だけを真上に持ち上げる意識',
      '左→右→両側 の順に5秒キープ',
      '各5回 × 2セット',
    ],
    cues:{
      do:'眉頭ではなく眉山が上がる感覚',
      dont:'目を見開かない／額に深いシワを作らない',
    },
    why:'前頭筋の左右独立支配を取り戻すと、眉位置の左右差・まぶたのたるみ改善に。',
  },

  eyeOpener: {
    id:'eyeOpener', name:'パッチリ・アイ・オープナー', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <ellipse cx="32" cy="38" rx="5" ry="3.5" fill="#fff" stroke="#0b1530" stroke-width="1.5"/>
      <ellipse cx="48" cy="38" rx="5" ry="3.5" fill="#fff" stroke="#0b1530" stroke-width="1.5"/>
      <circle cx="32" cy="38" r="2" fill="#0b1530"/>
      <circle cx="48" cy="38" r="2" fill="#0b1530"/>
    `)),
    purpose:'上眼瞼挙筋を活性化し、まぶたの開きを大きく見せる',
    targets:['上眼瞼挙筋','前頭筋'],
    how:[
      '額を手で固定し、額の代償を抑える',
      'まぶただけで目を最大に開き、3秒キープ',
      'ゆっくり閉じる',
      '10回 × 2セット',
    ],
    cues:{
      do:'まぶたを引き上げる小さな筋肉の働きを感じる',
      dont:'眉を上げて代償しない',
    },
    why:'上眼瞼挙筋の弱化は眠そうな表情の主因。トレーニングで明らかに変化が出やすい部位。',
  },

  // ============== 噛みしめ・咬筋リリース ==============
  masseterRelease: {
    id:'masseterRelease', name:'咬筋ストレッチ・リリース', category:'training', kind:'stretch',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(face(`
      <circle cx="24" cy="50" r="4" fill="none" stroke="#FFD93D" stroke-width="2"/>
      <circle cx="56" cy="50" r="4" fill="none" stroke="#FFD93D" stroke-width="2"/>
      <path d="M30 58 Q40 64 50 58" stroke="#E07A8A" stroke-width="2" fill="none"/>
    `)),
    purpose:'過緊張した咬筋を緩め、エラ張り・フェイスラインの太さを軽減',
    targets:['咬筋','側頭筋'],
    how:[
      '上下の歯の間を指1本分空け、舌は上顎に',
      '頬骨下の咬筋のもっとも厚い部分を指の腹で5秒押す',
      '位置を少しずつ下にずらしながら計5箇所',
      '左右で実施',
    ],
    cues:{
      do:'痛気持ちいい強度で(痛すぎは逆効果)',
      dont:'食いしばりながら行わない',
    },
    why:'咬筋肥大はフェイスラインの最大の敵。緩めるだけで輪郭印象が即変わる。',
  },

  jawOpen: {
    id:'jawOpen', name:'下顎オープナー(あ-お)', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <ellipse cx="40" cy="54" rx="7" ry="9" fill="#fff" stroke="#E07A8A" stroke-width="1.5"/>
      <text x="36" y="58" font-size="9" fill="#0b1530">あ</text>
    `)),
    purpose:'咬筋・側頭筋を伸ばし、顎関節の可動域を回復',
    targets:['咬筋','側頭筋','顎二腹筋'],
    how:[
      '「あ」: 縦に大きく口を開く 5秒',
      '「お」: 唇を縦長に突き出す 5秒',
      '交互に8セット',
    ],
    cues:{
      do:'顎関節に違和感が出ない範囲で最大開口',
      dont:'カクッと音が鳴る範囲を超えない',
    },
    why:'咬筋の伸長は短縮の改善に。顎関節の動きが滑らかになると左右差も整いやすい。',
  },

  // ============== 舌・口腔周り ==============
  tongueRotation: {
    id:'tongueRotation', name:'舌回し(ベロ回し)', category:'training', kind:'training',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(face(`
      <ellipse cx="40" cy="50" rx="10" ry="6" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>
      <path d="M30 50 Q40 38 50 50 Q40 62 30 50" fill="none" stroke="#FFD93D" stroke-width="2"/>
      <path d="M48 46 L52 42" stroke="#FFD93D" stroke-width="2"/>
    `)),
    purpose:'ほうれい線と口元のたるみ、二重あごを総合改善',
    targets:['口輪筋','頬筋','舌筋','広頸筋'],
    how:[
      '口を閉じたまま、舌先で歯の外側(歯と頬の間)をゆっくりなぞる',
      '右回り20回 → 左回り20回',
      '舌の根元から大きく動かす',
    ],
    cues:{
      do:'頬の内側が押し上げられる感覚',
      dont:'肩・首に力を入れない／早く回さない',
    },
    why:'口の周囲の表情筋を内側から押し広げ、頬の脂肪体の位置調整にも寄与する定番メニュー。',
  },

  tongueUp: {
    id:'tongueUp', name:'舌スポット・プッシュ', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <ellipse cx="40" cy="50" rx="10" ry="6" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>
      <path d="M40 50 L40 38" stroke="#E07A8A" stroke-width="3" stroke-linecap="round"/>
    `)),
    purpose:'舌の正しいポジション(上顎)を学習し、二重あごとフェイスラインを改善',
    targets:['舌筋','舌骨上筋群','広頸筋'],
    how:[
      '口を閉じ、舌全体を上顎にぴったり付ける',
      '舌の前1/3を、上の前歯の少し後ろ(スポット)に強く押し付ける',
      '10秒キープ × 5回',
    ],
    cues:{
      do:'舌の根元まで持ち上げる',
      dont:'舌先だけで押さない／顎を引きすぎない',
    },
    why:'低位舌は二重あご・口呼吸・歯列・顎ラインの全てに悪影響。最も重要な習慣矯正。',
  },

  // ============== 表情統合 ==============
  ahIuEoTraining: {
    id:'ahIuEoTraining', name:'あ・い・う・え・お トレーニング', category:'training', kind:'training',
    duration:'2分', equipment:'なし',
    illustration: svg(face(`
      <ellipse cx="40" cy="54" rx="8" ry="6" fill="#fff" stroke="#E07A8A" stroke-width="1.5"/>
      <text x="34" y="58" font-size="9" fill="#0b1530">あいう</text>
    `)),
    purpose:'表情筋を総合的に動員し、口元のメリハリを作る',
    targets:['口輪筋','大頬骨筋','広頸筋','頬筋','オトガイ筋'],
    how:[
      '「あ」: 縦に大きく(5秒)',
      '「い」: 横に強く(5秒) ',
      '「う」: 前に突き出す(5秒)',
      '「え」: 下顎を引き、首前面を伸ばす(5秒)',
      '「お」: 縦長楕円(5秒)',
      '通しで3セット',
    ],
    cues:{
      do:'各音で表情筋の動員箇所が変わるのを意識',
      dont:'声を出す必要なし／首肩はリラックス',
    },
    why:'すべての表情筋をフルレンジで動員する基礎トレ。日々の積み重ねが効く。',
  },

  smileHold: {
    id:'smileHold', name:'10秒スマイルホールド', category:'training', kind:'training',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(face(`
      <path d="M26 50 Q40 60 54 50" stroke="#E07A8A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <circle cx="32" cy="38" r="2" fill="#0b1530"/>
      <circle cx="48" cy="38" r="2" fill="#0b1530"/>
    `)),
    purpose:'表情筋の持久力を鍛え、自然な笑顔を体に染み込ませる',
    targets:['大頬骨筋','口角挙筋','眼輪筋'],
    how:[
      '前歯8本を見せる最高の笑顔を作る',
      'そのまま10秒キープ',
      '5秒休んで、計5セット',
    ],
    cues:{
      do:'目元も微笑むデュシェンヌ・スマイルで',
      dont:'頬の力が抜けてきたら一度休む',
    },
    why:'表情筋は持久力が乏しい。意図的に長時間収縮させることで日常の表情の質が変わる。',
  },

  // ============== 左右非対称改善 ==============
  unilateralSmile: {
    id:'unilateralSmile', name:'片側スマイル・スイッチ', category:'training', kind:'training',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(face(`
      <path d="M30 50 Q35 56 40 52" stroke="#E07A8A" stroke-width="2.5" fill="none"/>
      <path d="M40 52 L50 50" stroke="#FFB7C5" stroke-width="2.5"/>
    `)),
    purpose:'左右の口角を独立して動員し、非対称を是正',
    targets:['口角挙筋','大頬骨筋','頬筋'],
    how:[
      '右の口角だけを耳に向けて引き上げる(左は動かさない)',
      '5秒キープ→脱力',
      '左側も同様に',
      '弱い方を多めに(左右非対称なら弱い側を2倍の回数)',
    ],
    cues:{
      do:'鏡を見て、動かしている側だけ動いていることを確認',
      dont:'反対側に力を入れない',
    },
    why:'左右独立した収縮の再学習が非対称改善の最短ルート。利き側だけ強くなる悪循環を断つ。',
  },

  evenChewing: {
    id:'evenChewing', name:'両側咀嚼ドリル', category:'training', kind:'training',
    duration:'1分', equipment:'ガム or 想像で',
    illustration: svg(face(`
      <circle cx="24" cy="50" r="3" fill="#FFD93D"/>
      <circle cx="56" cy="50" r="3" fill="#FFD93D"/>
      <path d="M30 56 Q40 60 50 56" stroke="#E07A8A" stroke-width="2" fill="none"/>
    `)),
    purpose:'噛み癖の偏りを修正し、咬筋・側頭筋の左右差をリセット',
    targets:['咬筋','側頭筋','内側翼突筋'],
    how:[
      'ガムを左奥歯だけで10回ゆっくり噛む',
      '右奥歯だけで10回',
      '中央(両側)で10回',
      '計3セット',
    ],
    cues:{
      do:'弱い側を意識的に多めに使う',
      dont:'顎関節に痛みが出たら中止',
    },
    why:'噛み癖は顔の左右差の元凶。意識的に両側を均等に使うクセを作る。',
  },

  // ============== むくみ・代謝アップ ==============
  cheekPump: {
    id:'cheekPump', name:'頬ふくらまし・ポンプ', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <ellipse cx="40" cy="48" rx="20" ry="20" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>
      <circle cx="32" cy="38" r="2" fill="#0b1530"/>
      <circle cx="48" cy="38" r="2" fill="#0b1530"/>
    `)),
    purpose:'頬の内側から圧をかけ、表情筋を内側から伸長＆代謝アップ',
    targets:['頬筋','口輪筋','広頸筋'],
    how:[
      '口を閉じ、思い切り頬を膨らます(5秒)',
      '空気を右頬→左頬→上唇→下唇に1秒ずつ移動',
      '3セット',
    ],
    cues:{
      do:'頬の内側がパツンと張る感覚',
      dont:'息を止めない／顔に強い緊張を入れすぎない',
    },
    why:'頬の脂肪体は外から押すより、内側から圧をかけるほうが本来の位置に戻りやすい。',
  },

  necklineStretch: {
    id:'necklineStretch', name:'デコルテ・首前面ストレッチ', category:'training', kind:'stretch',
    duration:'1分', equipment:'なし',
    illustration: svg(`
      <circle cx="40" cy="22" r="10" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>
      <path d="M30 32 L26 70 M50 32 L54 70" stroke="#E07A8A" stroke-width="2"/>
      <path d="M30 60 Q40 50 50 60" stroke="#FFD93D" stroke-width="2" fill="none"/>
    `),
    purpose:'広頸筋・胸鎖乳突筋を伸ばし、顔への血流とリンパの流れを改善',
    targets:['広頸筋','胸鎖乳突筋','斜角筋'],
    how:[
      '両手を鎖骨の下に置き、軽く下方向へ皮膚を引く',
      '天井を見上げ、首前面を最大に伸ばす',
      '舌を上に強く突き出して5秒',
      '元に戻して10回',
    ],
    cues:{
      do:'首前面〜デコルテに伸びを感じる',
      dont:'首後ろを潰さない／呼吸を止めない',
    },
    why:'首前面のリリースで顔のリンパが流れやすくなり、むくみがその場で抜けることも。',
  },

  // ============== 中顔面・ほうれい線 ==============
  lipNoseLift: {
    id:'lipNoseLift', name:'鼻翼挙筋アクティベーション', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <path d="M36 44 L40 40 L44 44" stroke="#E07A8A" stroke-width="2" fill="none"/>
      <path d="M36 50 Q40 54 44 50" stroke="#FFB7C5" stroke-width="2" fill="none"/>
    `)),
    purpose:'上唇鼻翼挙筋を動員し、ほうれい線の最上部を持ち上げる',
    targets:['上唇鼻翼挙筋','上唇挙筋'],
    how:[
      '上の前歯を見せるように上唇だけをグッと持ち上げる',
      '鼻の両脇に縦のシワが寄る位置で5秒キープ',
      '10回',
    ],
    cues:{
      do:'上唇と鼻翼の付け根を引き上げる感覚',
      dont:'下唇は動かさない／顎に力を入れない',
    },
    why:'ほうれい線の起点である鼻翼脇を直接トレーニング。普段使わない筋肉なので変化が出やすい。',
  },

  cheekHollow: {
    id:'cheekHollow', name:'頬すぼめ・キス顔', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <path d="M36 50 L36 56 M44 50 L44 56" stroke="#0b1530" stroke-width="2"/>
      <ellipse cx="40" cy="56" rx="5" ry="4" fill="none" stroke="#E07A8A" stroke-width="2"/>
    `)),
    purpose:'頬筋・口輪筋を強く収縮させ、頬の引き締めとリフトを促す',
    targets:['頬筋','口輪筋'],
    how:[
      '頬を内側に思い切り吸い込む(魚顔)',
      'その状態で口角を真上に持ち上げて5秒',
      '解いて唇を前に突き出す(キス顔) 5秒',
      '10セット',
    ],
    cues:{
      do:'頬骨の下が窪む感覚',
      dont:'眉間にシワを寄せない',
    },
    why:'頬筋は深層筋で外から触れにくいが、頬を吸い込む動きで明確に動員できる。',
  },

  // ============== 統合・複合トレ ==============
  fullFaceFlow: {
    id:'fullFaceFlow', name:'フルフェイス・フロー(統合)', category:'training', kind:'training',
    duration:'3〜4分', equipment:'なし',
    illustration: svg(face(`
      <path d="M30 50 Q40 56 50 50" stroke="#E07A8A" stroke-width="2.5" fill="none"/>
      <path d="M22 30 Q40 22 58 30" stroke="#FFD93D" stroke-width="2" fill="none"/>
    `)),
    purpose:'全表情筋を順番に動員する仕上げメニュー',
    targets:['全表情筋'],
    how:[
      '眉だけ上げる(5秒)',
      '目を見開く(5秒)',
      '鼻翼を引き上げる(5秒)',
      '頬骨リフト(5秒)',
      '口角アップ(5秒)',
      '首前面ストレッチ(5秒)',
      'すべて同時にデュシェンヌ・スマイル(10秒)',
      '2セット',
    ],
    cues:{
      do:'各パーツの独立動員を意識',
      dont:'代償の連動を許さない',
    },
    why:'部位別トレを統合する仕上げ。神経筋制御の精度が上がり日常の表情に直結。',
  },

  symmetryMirror: {
    id:'symmetryMirror', name:'ミラー・シンメトリー・チェック', category:'training', kind:'training',
    duration:'2分', equipment:'鏡',
    illustration: svg(`
      <rect x="22" y="14" width="36" height="52" rx="4" fill="none" stroke="#E07A8A" stroke-width="1.8"/>
      ${face(`<path d="M30 50 Q40 56 50 50" stroke="#E07A8A" stroke-width="2" fill="none"/>`)}
    `),
    purpose:'視覚フィードバックで左右の動きの精度を上げる',
    targets:['全表情筋'],
    how:[
      '鏡を顔の正面に置く',
      '目を閉じる→開く(左右差確認)',
      '左右の口角を順に上げる(高さを揃える)',
      '眉を順に上げる(高さを揃える)',
      '頬骨を順に上げる(高さを揃える)',
      'すべて両側同時に → 完璧な対称を目指す',
    ],
    cues:{
      do:'必ず鏡で左右差を確認しながら',
      dont:'感覚だけに頼らない',
    },
    why:'視覚フィードバックなしでは左右非対称は改善しない。鏡前訓練が決定打。',
  },

  postureLink: {
    id:'postureLink', name:'頭位リセット(顔と姿勢の連動)', category:'training', kind:'training',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(`
      <circle cx="40" cy="22" r="10" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>
      <path d="M40 32 L40 60" stroke="#E07A8A" stroke-width="2"/>
      <path d="M30 40 L50 40" stroke="#FFD93D" stroke-width="2"/>
      <path d="M40 60 L30 76 M40 60 L50 76" stroke="#E07A8A" stroke-width="2"/>
    `),
    purpose:'頭部前方位を解除し、フェイスラインを物理的に整える',
    targets:['深部頸屈筋','広頸筋','胸鎖乳突筋'],
    how:[
      '背筋を伸ばし、後頭部を上から糸で引っ張られるイメージ',
      '顎を軽く引いて二重あごを作る(チンタック)',
      '舌は上顎に',
      '10秒キープ × 5回',
    ],
    cues:{
      do:'目線は真っ直ぐ前',
      dont:'顎を強く引きすぎない',
    },
    why:'頭部前方位はフェイスラインの最大の敵。姿勢の改善なくして輪郭の改善はない。',
  },

  // ============== 追加トレーニング(顔ヨガ・運動学) ==============
  duchenneFocus: {
    id:'duchenneFocus', name:'デュシェンヌ・スマイル・フォーカス', category:'training', kind:'training',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(face(`
      <path d="M26 50 Q40 58 54 50" stroke="#E07A8A" stroke-width="3" fill="none" stroke-linecap="round"/>
      <path d="M28 36 Q32 33 36 36" stroke="#FFD93D" stroke-width="1.5" fill="none"/>
      <path d="M44 36 Q48 33 52 36" stroke="#FFD93D" stroke-width="1.5" fill="none"/>
    `)),
    purpose:'眼輪筋と大頬骨筋を同時収縮させ、"本物の笑顔"を解剖学的に再現する',
    targets:['大頬骨筋','眼輪筋','上唇挙筋'],
    how:[
      '頬骨を斜め上に押し上げる感覚で口角アップ',
      '同時に下まぶたを上に押し上げ、目尻に小ジワを作る',
      '5秒キープ × 10回',
    ],
    cues:{
      do:'目尻と頬の連動を実感／前歯は8本見せる',
      dont:'目を細めるだけにならない／眉を寄せない',
    },
    why:'デュシェンヌ・スマイルは心からの笑顔の解剖学的定義。意図的に再現できると印象が劇的に変わる。',
  },

  earSmile: {
    id:'earSmile', name:'耳ポイント・スマイル', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <path d="M30 50 L24 38" stroke="#E07A8A" stroke-width="2" stroke-dasharray="2,2"/>
      <path d="M50 50 L56 38" stroke="#E07A8A" stroke-width="2" stroke-dasharray="2,2"/>
      <path d="M30 50 Q40 56 50 50" stroke="#E07A8A" stroke-width="2.5" fill="none"/>
    `)),
    purpose:'口角を「耳の付け根」方向へ引き上げる、大頬骨筋の正しい繊維方向の収縮を学習',
    targets:['大頬骨筋','口角挙筋','頬筋'],
    how:[
      '唇は閉じたまま、口角を斜め上・耳の付け根に向けて引き上げる',
      '頬骨の高い位置に山ができることを鏡で確認',
      '5秒キープ → 戻す × 10回',
    ],
    cues:{
      do:'方向は「真上」ではなく「斜め後ろ上」',
      dont:'口角を横一直線に広げない',
    },
    why:'大頬骨筋は耳前の頬骨弓から口角に走る斜めの筋。繊維方向に沿った収縮が最大リフトを生む。',
  },

  modiolusPress: {
    id:'modiolusPress', name:'モディオラス・プレスアップ', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <circle cx="28" cy="52" r="3" fill="#FFD93D"/>
      <circle cx="52" cy="52" r="3" fill="#FFD93D"/>
      <path d="M30 52 Q40 56 50 52" stroke="#E07A8A" stroke-width="2" fill="none"/>
    `)),
    purpose:'口角結節(モディオラス)を活性化し、口元の8筋肉が集まる起点を起動する',
    targets:['口角挙筋','大頬骨筋','頬筋','口角下制筋'],
    how:[
      '人差し指で口角のすぐ外側のくぼみを軽く押さえる',
      '指を内側から押し返すように口角を引き上げる',
      '5秒キープ × 左右10回ずつ',
    ],
    cues:{
      do:'指先で外向きの圧を感じる位置',
      dont:'頬全体で持ち上げず、口角の一点で押し返す',
    },
    why:'モディオラスは8つの表情筋の集合点。ここの神経動員が口元全体の精度を上げる。',
  },

  lowerEyelidLift: {
    id:'lowerEyelidLift', name:'下まぶたシャイン', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <path d="M27 40 Q32 42 37 40" stroke="#E07A8A" stroke-width="2" fill="none"/>
      <path d="M43 40 Q48 42 53 40" stroke="#E07A8A" stroke-width="2" fill="none"/>
      <circle cx="32" cy="38" r="1.5" fill="#0b1530"/>
      <circle cx="48" cy="38" r="1.5" fill="#0b1530"/>
    `)),
    purpose:'下眼瞼の眼輪筋を独立動員し、目元のハリと涙袋の質感を整える',
    targets:['眼輪筋下部'],
    how:[
      '額・上まぶたは動かさず、下まぶただけを上に押し上げる',
      '視線は前方をキープ',
      '5秒キープ × 10回',
    ],
    cues:{
      do:'下まぶたに厚みの盛り上がりを感じる',
      dont:'眉を下げない／頬で押し上げない',
    },
    why:'下眼輪筋の弱化は目元のシワ・たるみの主因。独立収縮が再学習されると見え方が変わる。',
  },

  upperLipReach: {
    id:'upperLipReach', name:'上唇リーチ・アップ', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <path d="M34 46 Q40 42 46 46" stroke="#E07A8A" stroke-width="2.5" fill="none"/>
      <path d="M34 52 Q40 54 46 52" stroke="#FFB7C5" stroke-width="2" fill="none"/>
    `)),
    purpose:'上唇挙筋を独立動員し、中顔面のたるみ感を改善',
    targets:['上唇挙筋','上唇鼻翼挙筋'],
    how:[
      '下唇は動かさず、上唇だけを鼻に近づけるように引き上げる',
      '上の前歯を見せる感覚で5秒キープ',
      '10回',
    ],
    cues:{
      do:'鼻の脇に縦のシワが浮かぶ位置',
      dont:'下顎を動かさない／首肩に力を入れない',
    },
    why:'上唇挙筋の弱化は中顔面の縦伸び・ほうれい線上部のたるみに直結。短時間で覚醒しやすい。',
  },

  winkAlternate: {
    id:'winkAlternate', name:'交互ウィンク・コントロール', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <path d="M28 38 Q32 36 36 38" stroke="#0b1530" stroke-width="1.5" fill="none"/>
      <circle cx="48" cy="38" r="2" fill="#0b1530"/>
    `)),
    purpose:'左右の眼輪筋を独立支配し、目元の左右差を矯正',
    targets:['眼輪筋','上眼瞼挙筋'],
    how:[
      '片目だけを強くウィンク(3秒)、反対の目は普通に開けたまま',
      '戻す → 反対側を交互に10往復',
      '弱い側は2倍の回数で',
    ],
    cues:{
      do:'眉と口は動かさず、まぶただけで完結',
      dont:'頬で押し上げない',
    },
    why:'眼輪筋の左右独立支配は目元の対称性に直結。利き側だけ強くなる悪循環を断つ。',
  },

  midfaceHold: {
    id:'midfaceHold', name:'中顔面リフト・ホールド', category:'training', kind:'training',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(face(`
      <path d="M22 44 Q40 36 58 44" stroke="#E07A8A" stroke-width="2.5" fill="none"/>
      <path d="M28 48 L26 44 M52 48 L54 44" stroke="#FFD93D" stroke-width="2"/>
    `)),
    purpose:'中顔面(頬骨〜口角)を持続的にリフトし、表情筋の持久力を高める',
    targets:['大頬骨筋','小頬骨筋','上唇挙筋','頬筋'],
    how:[
      '頬骨全体を「斜め後ろ上」に押し上げる感覚をつくる',
      'その姿勢のまま30秒キープ',
      '15秒休んで × 3セット',
    ],
    cues:{
      do:'頬の高さを鏡で確認しながら維持',
      dont:'眉間にシワを寄せない／首肩を上げない',
    },
    why:'中顔面リフトは瞬発より持久。30秒持続できる頬は日常でも下がりにくい。',
  },

  cheekToCheekAir: {
    id:'cheekToCheekAir', name:'頬パス・トランスファー', category:'training', kind:'training',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(face(`
      <ellipse cx="30" cy="50" rx="6" ry="5" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>
      <ellipse cx="50" cy="50" rx="6" ry="5" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>
      <path d="M36 50 L44 50" stroke="#FFD93D" stroke-width="2" stroke-dasharray="2,2"/>
    `)),
    purpose:'頬の内圧をリズミカルに変化させ、頬筋と口輪筋を内側から強化＋代謝アップ',
    targets:['頬筋','口輪筋','広頸筋'],
    how:[
      '口を閉じ、左頬に空気を集める(3秒)',
      '素早く右頬へパス(3秒)',
      '上唇下・下唇下にも順番に移動',
      '1周 × 5セット',
    ],
    cues:{
      do:'頬の内側がパツンと張る圧を保つ',
      dont:'息漏れさせない／顎を動かさない',
    },
    why:'リズミカルな内圧変化は静的トレでは起きない神経動員を起こし、代謝を一気に上げる。',
  },

  swallowDrill: {
    id:'swallowDrill', name:'正しい嚥下ドリル', category:'training', kind:'training',
    duration:'1分', equipment:'少量の水',
    illustration: svg(face(`
      <ellipse cx="40" cy="50" rx="10" ry="6" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>
      <path d="M40 50 L40 38" stroke="#E07A8A" stroke-width="3" stroke-linecap="round"/>
      <circle cx="40" cy="58" r="2" fill="#FFD93D"/>
    `)),
    purpose:'舌全体で上顎を押して飲み込む「正しい嚥下」を再学習',
    targets:['舌筋','舌骨上筋群','広頸筋'],
    how:[
      '少量の水を口に含む',
      '舌先をスポット(前歯の少し後ろ)に置き、舌全体で上顎を押す',
      '口角・頬を動かさず、舌の力だけで飲み込む × 5回',
    ],
    cues:{
      do:'飲み込む瞬間に首前面が縦に張る感覚',
      dont:'頬で吸わない／口角に力を入れない',
    },
    why:'異常嚥下は二重あご・口呼吸・歯列の主因。1日600回以上自動で行われる動作だから矯正効果は絶大。',
  },

  mentalisRelief: {
    id:'mentalisRelief', name:'オトガイ筋スムージング', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`
      <path d="M34 60 Q40 64 46 60" stroke="#E07A8A" stroke-width="2" fill="none"/>
      <path d="M36 62 L36 66 M40 62 L40 66 M44 62 L44 66" stroke="#FFD93D" stroke-width="1.5"/>
    `)),
    purpose:'オトガイ筋の過緊張を意図的にON/OFFし、顎先の梅干しジワとしゃくれ感を抑える',
    targets:['オトガイ筋','下唇下制筋'],
    how:[
      '顎先に小さな梅干しジワを意識して作る(3秒)',
      '一気に脱力し、顎先を平らに(5秒)',
      'ON/OFFの差を体で覚える × 10回',
    ],
    cues:{
      do:'脱力時の顎の平面感を覚える',
      dont:'噛みしめない／首肩に力を入れない',
    },
    why:'オトガイ筋の慢性収縮が顎先の凹凸を生む。意図的な脱力習慣が顎ラインを変える。',
  },

  generalMaintain: {
    id:'generalMaintain', name:'美顔キープ・スマイル習慣', category:'training', kind:'training',
    duration:'2分', equipment:'なし',
    illustration: svg(face(`
      <path d="M28 50 Q40 58 52 50" stroke="#E07A8A" stroke-width="3" fill="none"/>
      <text x="36" y="20" font-size="8" fill="#FFD93D">★</text>
    `)),
    purpose:'良好な状態を維持するための日常スマイル習慣',
    targets:['大頬骨筋','口角挙筋','眼輪筋'],
    how:[
      '朝・昼・夜 各1分のスマイルキープ',
      '目元も微笑むデュシェンヌ・スマイル',
      '頬骨が上がっているかを毎回チェック',
    ],
    cues:{
      do:'日常の中で頬の高さを意識',
      dont:'力みすぎない',
    },
    why:'表情筋は使わないと急速に衰える。維持のための最小限の習慣化。',
  },
};

// ===================================================================
// PRESCRIPTION MAP
// 問題キー → トレーニング処方(優先度順)
// ※ セルフケアは扱わない(トレーニングのみ)
// ===================================================================
export const PRESCRIPTION_MAP = {
  facialAsymmetry: {
    training: [
      'symmetryMirror','unilateralSmile','winkAlternate','evenChewing',
      'mouthCornerUp','modiolusPress','browLift','postureLink',
      'ahIuEoTraining','tongueRotation','duchenneFocus',
    ],
  },
  mouthCornerDown: {
    training: [
      'mouthCornerUp','zygoLift','earSmile','modiolusPress',
      'pencilLift','duchenneFocus','smileHold','midfaceHold',
      'cheekPress','ahIuEoTraining','fullFaceFlow',
    ],
  },
  nasolabialFold: {
    training: [
      'zygoLift','lipNoseLift','upperLipReach','cheekHollow',
      'midfaceHold','tongueRotation','cheekPress','mentalisRelief',
      'cheekPump','smileHold','fullFaceFlow',
    ],
  },
  jawSagging: {
    training: [
      'platysmaActivation','chinTuck','jawlineSlide','tongueUp',
      'swallowDrill','mentalisRelief','postureLink','jawOpen',
      'masseterRelease','necklineStretch',
    ],
  },
  puffiness: {
    training: [
      'cheekPump','cheekToCheekAir','tongueRotation','platysmaActivation',
      'jawOpen','swallowDrill','chinTuck','fullFaceFlow',
      'necklineStretch','masseterRelease',
    ],
  },
  partsBalance: {
    training: [
      'fullFaceFlow','browLift','eyeOpener','lowerEyelidLift',
      'duchenneFocus','zygoLift','lipNoseLift','midfaceHold',
      'postureLink','symmetryMirror','ahIuEoTraining',
    ],
  },
  general: {
    training: [
      'duchenneFocus','smileHold','zygoLift','tongueRotation',
      'earSmile','ahIuEoTraining','generalMaintain','fullFaceFlow',
      'midfaceHold','platysmaActivation','postureLink',
    ],
  },
};
