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

  // ============== 追加トレ: 大頬骨筋・口角挙筋 系 ==============
  antiGravityCheek: {
    id:'antiGravityCheek', name:'重力に逆らう頬リフト', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M28 50 L26 38 M52 50 L54 38" stroke="#E07A8A" stroke-width="2.5" stroke-linecap="round"/><path d="M30 50 Q40 56 50 50" stroke="#FFD93D" stroke-width="2" fill="none"/>`)),
    purpose:'頬を真上ではなく「斜め後ろ上」に動員する、大頬骨筋の最大収縮ベクトルを学習',
    targets:['大頬骨筋','小頬骨筋','頬筋'],
    how:['頬骨の高い点を耳の上方向に押し上げる意識','3秒キープ→脱力 × 10回','左右の高さを鏡で揃える'],
    cues:{ do:'頬の山の位置を毎回確認', dont:'眉間や首に力を入れない' },
    why:'重力方向の真逆を意識して動員すると、普段の表情では使われない最深部の筋線維が動く。',
  },
  cheekBoneIso: {
    id:'cheekBoneIso', name:'頬骨アイソメトリック・ホールド', category:'training', kind:'training',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(face(`<circle cx="28" cy="44" r="3" fill="none" stroke="#E07A8A" stroke-width="1.5"/><circle cx="52" cy="44" r="3" fill="none" stroke="#E07A8A" stroke-width="1.5"/>`)),
    purpose:'頬骨上の筋肉を等尺性収縮で持久強化',
    targets:['大頬骨筋','上唇挙筋','頬筋'],
    how:['頬骨の高さを「ニッ」と引き上げて固定','20秒キープ × 3セット','30秒インターバル'],
    cues:{ do:'頬の山が動かないように固定', dont:'呼吸を止めない' },
    why:'等尺性収縮は表情筋の持久力を急速に高める。短時間で結果が出やすい。',
  },
  diagonalLift: {
    id:'diagonalLift', name:'斜めリフト・ストロー', category:'training', kind:'training',
    duration:'1分', equipment:'ストロー or 指',
    illustration: svg(face(`<rect x="36" y="44" width="3" height="14" fill="#FFD93D" transform="rotate(20 38 50)"/>`)),
    purpose:'口角→こめかみの斜めラインで頬を最大引き上げ',
    targets:['大頬骨筋','頬筋'],
    how:['ストローを口角からこめかみへ斜めに当てる','その方向に口角を上げて5秒キープ','左右各10回'],
    cues:{ do:'物理的目印で方向を学習', dont:'首を傾けない' },
    why:'視覚＋触覚フィードバックで動員方向の精度が一気に上がる。',
  },
  smileWidener: {
    id:'smileWidener', name:'スマイル・ワイドナー', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M22 50 Q40 58 58 50" stroke="#E07A8A" stroke-width="3" fill="none"/>`)),
    purpose:'口角の横方向の動員域を広げる',
    targets:['大頬骨筋','頬筋','広頸筋'],
    how:['口を閉じたまま口角を最大限まで横に開く','「イ」の口で5秒キープ','10回'],
    cues:{ do:'頬の前面が引っ張られる感覚', dont:'歯を強く食いしばらない' },
    why:'横方向の動員域は加齢で最も狭くなる。意識的に最大可動域を維持する。',
  },

  // ============== 追加トレ: 眼輪筋・前頭筋・眉間 ==============
  foreheadIso: {
    id:'foreheadIso', name:'前頭筋アイソメトリック', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M24 24 L56 24" stroke="#E07A8A" stroke-width="3"/>`)),
    purpose:'額の前頭筋を等尺性収縮で活性化',
    targets:['前頭筋'],
    how:['眉を真上に上げ、額に横ジワが浮かぶ位置で止める','10秒キープ × 5回','間にゆっくり脱力'],
    cues:{ do:'眉のラインで止める', dont:'目を見開きすぎない' },
    why:'前頭筋の活動低下は眉位置低下とまぶたの覆いかぶさりの原因。',
  },
  procerusEngage: {
    id:'procerusEngage', name:'鼻根筋プレス(眉間)', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M36 32 L44 32 L40 26 Z" fill="none" stroke="#E07A8A" stroke-width="2"/>`)),
    purpose:'鼻根筋の動員と過緊張のリセット',
    targets:['鼻根筋','皺眉筋'],
    how:['眉間に意識的に縦ジワを作る(3秒)','一気に脱力し眉間を平らに(5秒)','差分を体で覚える × 10回'],
    cues:{ do:'脱力時の平面感を覚える', dont:'力みすぎない' },
    why:'眉間ジワは慢性的な無意識収縮が原因。ON/OFF制御で日常の脱力を学習。',
  },
  glabellaRelease: {
    id:'glabellaRelease', name:'眉間スムージング', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M36 34 Q40 32 44 34" stroke="#E07A8A" stroke-width="2" fill="none"/>`)),
    purpose:'眉間ジワの原因となる皺眉筋・鼻根筋を意識的に弛緩',
    targets:['皺眉筋','鼻根筋'],
    how:['眉間に「○」を描くイメージで広げる','5秒キープ × 10回','呼吸はゆっくり'],
    cues:{ do:'眉間が広がる感覚', dont:'眉を上げすぎない' },
    why:'集中・スマホで生じる無意識の眉間収縮を解除する習慣化トレ。',
  },
  outerEyeUp: {
    id:'outerEyeUp', name:'目尻アップ・トーン', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M26 36 L34 38 M46 38 L54 36" stroke="#E07A8A" stroke-width="2.5"/>`)),
    purpose:'目尻周辺の眼輪筋外側を集中動員し、目尻下がりを改善',
    targets:['眼輪筋外側部','外側皺眉筋'],
    how:['目尻を斜め上に「キュッ」と引き上げる意識','5秒キープ × 10回','頬は動かさない'],
    cues:{ do:'目尻に小さなシワが浮かぶ位置', dont:'頬を巻き込まない' },
    why:'目尻の眼輪筋は加齢で最も下垂しやすい。独立動員が印象を変える鍵。',
  },
  eyeWindowOpen: {
    id:'eyeWindowOpen', name:'目の窓を開く', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<ellipse cx="32" cy="38" rx="6" ry="4" fill="#fff" stroke="#0b1530" stroke-width="1.5"/><ellipse cx="48" cy="38" rx="6" ry="4" fill="#fff" stroke="#0b1530" stroke-width="1.5"/>`)),
    purpose:'上眼瞼挙筋と前頭筋の協調動員で、まぶたの「窓」を最大化',
    targets:['上眼瞼挙筋','前頭筋','眼輪筋'],
    how:['額を手で固定','まぶたを最大に開いて5秒','閉じる × 10回'],
    cues:{ do:'眉ではなくまぶたで開く', dont:'代償で眉を上げない' },
    why:'眼瞼下垂感は上眼瞼挙筋の動員不足。意識的に動かすと変化が出やすい。',
  },
  browSeparate: {
    id:'browSeparate', name:'眉間ワイドナー', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M22 32 L36 30 M44 30 L58 32" stroke="#E07A8A" stroke-width="2"/>`)),
    purpose:'眉同士を外側に開く意識で、眉間の閉じグセを解除',
    targets:['前頭筋外側','皺眉筋(伸長)'],
    how:['眉を真横に外へ広げる','5秒キープ × 10回','眉間を広げる感覚'],
    cues:{ do:'眉間の幅が広がる', dont:'眉が下がらないように' },
    why:'眉間が狭まると険しい印象に。眉のスタートポジションを再学習。',
  },
  foreheadSmooth: {
    id:'foreheadSmooth', name:'額スムージング・ロール', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M22 20 Q40 18 58 20" stroke="#FFD93D" stroke-width="3" fill="none"/>`)),
    purpose:'額の前頭筋を均一に動かし、横ジワの偏在を予防',
    targets:['前頭筋'],
    how:['眉を1本ずつ順番に上げる(左→右→両側)','各3秒 × 5セット','額のシワを左右均等に意識'],
    cues:{ do:'左右の動員量を揃える', dont:'同じ位置だけシワを作らない' },
    why:'額のシワは「同じ位置だけ動かす」習慣で固定化する。均一動員で予防。',
  },

  // ============== 追加トレ: 広頸筋・首前面 ==============
  platysmaPlank: {
    id:'platysmaPlank', name:'広頸筋プランク', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(`<path d="M22 24 Q40 20 58 24 L58 64 L22 64 Z" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/><path d="M28 56 L52 56" stroke="#FFD93D" stroke-width="2"/>`),
    purpose:'広頸筋の持久力を高め、首前面のたるみと縦ジワを予防',
    targets:['広頸筋','胸鎖乳突筋'],
    how:['天井を見上げる','下唇を上に被せる','首前面に縦スジが浮かぶ位置で30秒キープ','15秒休憩 × 3セット'],
    cues:{ do:'首前面の張りを持続', dont:'肩を上げない' },
    why:'広頸筋は皮膚と直接繋がる薄い筋。持続収縮で薄皮の張りが回復する。',
  },
  jawlineCarve: {
    id:'jawlineCarve', name:'ジョーライン・カーブ刻み', category:'training', kind:'training',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(face(`<path d="M22 60 Q40 70 58 60" stroke="#E07A8A" stroke-width="3" fill="none"/>`)),
    purpose:'顎下のラインを動的に動かし、フェイスラインの彫りを深める',
    targets:['広頸筋','顎二腹筋','舌骨上筋群'],
    how:['口角を「ニッ」と最大に広げる','下顎を前→左→右→中央 とゆっくり動かす','各5秒 × 3周'],
    cues:{ do:'顎下の動きを感じる', dont:'顎関節に痛みが出たら中止' },
    why:'静的トレに動的要素を加えることで、日常の動きにフェイスラインが定着する。',
  },
  supraHyoidIso: {
    id:'supraHyoidIso', name:'舌骨上筋プレス', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(`<circle cx="40" cy="36" r="14" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/><circle cx="40" cy="56" r="4" fill="#FFD93D"/>`),
    purpose:'顎下〜舌骨間の深部筋を等尺性で強化',
    targets:['舌骨上筋群','顎二腹筋','顎舌骨筋'],
    how:['両手の親指を顎下に当てる','舌を上顎に押し付け、同時に顎下を押し下げる','押し合いを5秒キープ × 10回'],
    cues:{ do:'顎下と舌の押し合いを感じる', dont:'首を反らさない' },
    why:'顎下の深部筋は加齢で最も衰えやすく、二重あごの本質原因。',
  },
  swallowGuard: {
    id:'swallowGuard', name:'嚥下プロテクト・ホールド', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M28 56 Q40 60 52 56" stroke="#E07A8A" stroke-width="2" fill="none"/><path d="M40 58 L40 66" stroke="#FFD93D" stroke-width="2"/>`)),
    purpose:'嚥下時の頬・口角の代償を抑え、舌の力で飲み込む筋制御を学習',
    targets:['舌筋','舌骨上筋群','広頸筋'],
    how:['唇に指を軽く当てる(動かないようガード)','唾を5回ゆっくり飲み込む','頬・口角を動かさず舌だけで完結'],
    cues:{ do:'舌の力だけを使う', dont:'頬で吸わない' },
    why:'日常の嚥下姿勢を矯正する。1日数百回の動作だから効果が大きい。',
  },

  // ============== 追加トレ: 咬筋・側頭筋 ==============
  masseterTap: {
    id:'masseterTap', name:'咬筋タッピング・リリース', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<circle cx="22" cy="48" r="2" fill="#FFD93D"/><circle cx="24" cy="52" r="2" fill="#FFD93D"/><circle cx="22" cy="56" r="2" fill="#FFD93D"/>`)),
    purpose:'咬筋の過緊張を軽快なタッピングで解除',
    targets:['咬筋','側頭筋'],
    how:['人差し指・中指で咬筋を1秒間に3回のリズムで軽くタップ','頬骨下〜エラまで縦に20往復','左右同時'],
    cues:{ do:'痛みのない強度', dont:'食いしばりながら行わない' },
    why:'タッピングは静的圧迫より浅層筋膜への刺激が均一。日常的に取り入れやすい。',
  },
  temporalisRelease: {
    id:'temporalisRelease', name:'側頭筋リリース', category:'training', kind:'stretch',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(`<circle cx="40" cy="40" r="22" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/><circle cx="22" cy="32" r="3" fill="#FFD93D"/><circle cx="58" cy="32" r="3" fill="#FFD93D"/>`),
    purpose:'こめかみ周辺の側頭筋を緩め、頭部の張りと噛みしめを軽減',
    targets:['側頭筋','咬筋(腱)'],
    how:['指の腹で側頭部を円を描くようにマッサージ','時計回り15回 → 反時計回り15回','左右同時'],
    cues:{ do:'痛気持ちいい強度', dont:'強く押しすぎない' },
    why:'側頭筋の緊張は噛みしめ・頭痛・顔の張りに直結。緩めるとフェイスライン全体が変わる。',
  },
  jawDropper: {
    id:'jawDropper', name:'顎ドロップ・脱力', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<ellipse cx="40" cy="58" rx="5" ry="7" fill="#fff" stroke="#E07A8A" stroke-width="1.5"/>`)),
    purpose:'下顎を完全脱力させ、咬筋・側頭筋の慢性緊張をリセット',
    targets:['咬筋(伸長)','側頭筋(伸長)'],
    how:['口を軽く開けて顎の力を抜く','「あ」と「ん」の中間の口で20秒','3セット'],
    cues:{ do:'顎の重さを感じる', dont:'歯を噛み合わせない' },
    why:'食いしばり癖は無意識下で続く。意図的な脱力時間で神経パターンを書き換える。',
  },
  chewBalance: {
    id:'chewBalance', name:'咀嚼バランス・カウント', category:'training', kind:'training',
    duration:'1分', equipment:'ガム or 想像で',
    illustration: svg(face(`<circle cx="24" cy="50" r="3" fill="#FFD93D"/><circle cx="56" cy="50" r="3" fill="#FFD93D"/>`)),
    purpose:'左右の咀嚼回数を均等化し、咬筋の左右差を予防',
    targets:['咬筋','側頭筋','内側翼突筋'],
    how:['左奥歯で20回噛む','右奥歯で20回噛む','両側で20回噛む','弱い側は2倍に増やす'],
    cues:{ do:'弱い側を意識', dont:'痛みが出たら中止' },
    why:'噛み癖の改善は顔の左右差是正の最短ルート。',
  },

  // ============== 追加トレ: 舌・口腔 ==============
  tongueStretch: {
    id:'tongueStretch', name:'舌伸展・最大ストレッチ', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<ellipse cx="40" cy="56" rx="5" ry="10" fill="#FFB7C5"/>`)),
    purpose:'舌を最大に伸ばし、舌筋全体の可動域を回復',
    targets:['舌筋','舌骨上筋群','広頸筋'],
    how:['口を大きく開ける','舌を顎先に向けて最大に伸ばす','5秒キープ × 10回'],
    cues:{ do:'舌の根元から伸ばす', dont:'首肩に力を入れない' },
    why:'舌の可動域は加齢で確実に低下する。最大伸展で舌全体の若さを保つ。',
  },
  tonguePushSide: {
    id:'tonguePushSide', name:'舌サイドプッシュ', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M30 50 L50 50" stroke="#FFD93D" stroke-width="3"/>`)),
    purpose:'舌を頬の内側に強く押し付け、頬筋と口輪筋の左右非対称を矯正',
    targets:['舌筋','頬筋'],
    how:['口を閉じて舌先を右頬内側に強く押す(5秒)','左頬内側にも強く押す(5秒)','交互に10往復'],
    cues:{ do:'頬が外側にふくらむのが見える', dont:'痛むほど押さない' },
    why:'舌の押す力は左右非対称になりやすい。意識的な往復で頬の左右差も整う。',
  },
  palateContact: {
    id:'palateContact', name:'口蓋接触ホールド', category:'training', kind:'training',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(face(`<path d="M40 50 L40 38" stroke="#E07A8A" stroke-width="3"/><path d="M32 38 Q40 32 48 38" stroke="#FFD93D" stroke-width="2" fill="none"/>`)),
    purpose:'舌全体を上顎にぴったり接触させる持久ホールド',
    targets:['舌筋','舌骨上筋群'],
    how:['口を閉じる','舌を根元から先まで上顎にぴったり付ける','1分キープ × 3セット(日常化が目標)'],
    cues:{ do:'飲み込みも舌で完結', dont:'舌先だけにならない' },
    why:'低位舌は二重あご・口呼吸・歯列の根本原因。これが正しい舌のホームポジション。',
  },

  // ============== 追加トレ: 中顔面・ほうれい線 ==============
  subZygoActivate: {
    id:'subZygoActivate', name:'頬骨下スマイル', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M26 46 Q40 50 54 46" stroke="#E07A8A" stroke-width="2.5" fill="none"/>`)),
    purpose:'頬骨直下の領域を集中的に持ち上げ、ほうれい線の起点をリフト',
    targets:['上唇挙筋','上唇鼻翼挙筋','大頬骨筋'],
    how:['上唇と頬の境界に意識を置く','その部分だけを上に引き上げて5秒','10回'],
    cues:{ do:'ほうれい線の上端が浅くなる感覚', dont:'頬全体で持ち上げない' },
    why:'ほうれい線の出発点は頬骨下のこの領域。ピンポイント動員が最も効く。',
  },
  midfaceRoll: {
    id:'midfaceRoll', name:'中顔面ロール', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M30 44 Q40 40 50 44 Q40 48 30 44" fill="none" stroke="#FFD93D" stroke-width="2"/>`)),
    purpose:'頬の内側から舌で円を描き、頬の脂肪体を本来位置にロール戻し',
    targets:['頬筋','口輪筋','大頬骨筋'],
    how:['口を閉じる','舌先で上の歯ぐきを外側からなぞる(右回り10周)','左回り10周'],
    cues:{ do:'頬が内側から押される感覚', dont:'早く回さない' },
    why:'舌回しの中顔面ターゲット版。脂肪体の位置調整に直接効く。',
  },
  nasolabialFade: {
    id:'nasolabialFade', name:'ほうれい線フェード', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M36 42 Q34 50 36 56" stroke="#E07A8A" stroke-width="2"/><path d="M44 42 Q46 50 44 56" stroke="#E07A8A" stroke-width="2"/>`)),
    purpose:'舌で頬の内側からほうれい線の溝を内側から押し出す',
    targets:['口輪筋','頬筋','口角挙筋'],
    how:['舌先でほうれい線の溝の真裏(頬内側)を押す','5秒キープ × 左右10回','押す位置を上下にずらしながら'],
    cues:{ do:'溝が内側から浮き上がる', dont:'頬を膨らませない' },
    why:'外からのマッサージより、内側からの圧で脂肪体が本来位置に戻りやすい。',
  },
  innerCheekPush: {
    id:'innerCheekPush', name:'内側頬プッシュアウト', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<ellipse cx="30" cy="48" rx="6" ry="5" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/><ellipse cx="50" cy="48" rx="6" ry="5" fill="#FFE5EC" stroke="#E07A8A" stroke-width="1.5"/>`)),
    purpose:'頬を内側から強く膨らませ、頬筋の伸長性を高める',
    targets:['頬筋','口輪筋'],
    how:['口を閉じて右頬だけ最大にふくらます(5秒)','左頬だけふくらます(5秒)','交互に10往復'],
    cues:{ do:'片側だけパツンと張る', dont:'息を漏らさない' },
    why:'頬筋の伸長性は加齢で低下しコケる原因に。最大伸長で柔軟性を維持。',
  },

  // ============== 追加トレ: オトガイ筋・下顎 ==============
  chinDimple: {
    id:'chinDimple', name:'顎ディンプル解除', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M36 60 Q40 64 44 60" stroke="#E07A8A" stroke-width="2" fill="none"/>`)),
    purpose:'オトガイ筋の梅干しジワを意図的に解除する習慣化',
    targets:['オトガイ筋','下唇下制筋'],
    how:['鏡で顎先の梅干しジワをチェック','顎を平らに保ったまま口を開閉 × 20回'],
    cues:{ do:'顎先の平面感を維持', dont:'顎に力みが戻ったら一度脱力' },
    why:'オトガイ筋の慢性収縮は無意識のクセ。動きながら脱力を保つ訓練が日常化に必要。',
  },
  chinSlideControl: {
    id:'chinSlideControl', name:'顎スライド・コントロール', category:'training', kind:'training',
    duration:'1〜2分', equipment:'なし',
    illustration: svg(face(`<path d="M30 60 L40 64 L50 60" stroke="#E07A8A" stroke-width="2" fill="none"/>`)),
    purpose:'下顎の左右・前後の動きをコントロールし、顎関節と表情筋の連動を整える',
    targets:['咬筋','側頭筋','外側翼突筋'],
    how:['下顎をゆっくり前→中央→左→中央→右→中央','5秒ずつ × 3周','顎関節の動きを意識'],
    cues:{ do:'痛みのない可動域内で', dont:'カクッと音が鳴る範囲を超えない' },
    why:'顎関節の可動性は顔の左右差・噛みしめ・歪みに連動。動きの質が大事。',
  },

  // ============== 追加トレ: 人中・上唇・ガミー対策 ==============
  philtrumShorten: {
    id:'philtrumShorten', name:'人中ショート・トレ', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M40 46 L40 54" stroke="#E07A8A" stroke-width="2"/>`)),
    purpose:'上唇全体を引き上げ、人中の縦長感を視覚的に短縮',
    targets:['上唇挙筋','口輪筋','大頬骨筋'],
    how:['上唇全体を鼻に近づけるように引き上げる','上前歯を見せる位置で5秒キープ','10回'],
    cues:{ do:'上唇の中央が短くなる感覚', dont:'下顎を上げない' },
    why:'人中の見え方は上唇の動員量で大きく変わる。骨格は変えられなくても印象は変わる。',
  },
  upperLipHold: {
    id:'upperLipHold', name:'上唇ホールド・カバー', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M30 50 Q40 46 50 50" stroke="#E07A8A" stroke-width="3" fill="none"/>`)),
    purpose:'上唇を下唇の上に被せ、口輪筋全体を持久収縮',
    targets:['口輪筋','上唇挙筋'],
    how:['上唇を下唇に被せて10秒キープ','5秒休んで × 5セット'],
    cues:{ do:'上唇の輪郭がはっきり', dont:'顎に力を入れない' },
    why:'口輪筋の張りは口元全体の若々しさに直結。短時間で習慣化しやすい。',
  },
  upperLipCoverBottom: {
    id:'upperLipCoverBottom', name:'上唇カバー・スマイル', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<path d="M30 50 Q40 52 50 50" stroke="#E07A8A" stroke-width="2.5" fill="none"/>`)),
    purpose:'上唇を下げた状態で口角を上げ、ガミースマイルを制御',
    targets:['口輪筋','大頬骨筋'],
    how:['上唇をやや下に伸ばす意識','その状態で口角だけを上げる','5秒キープ × 10回'],
    cues:{ do:'歯ぐきが見えすぎないラインを覚える', dont:'笑顔の質を犠牲にしない' },
    why:'ガミースマイルは上唇挙筋の過収縮が主因。逆方向の制御で笑顔のラインが整う。',
  },
  gummyControl: {
    id:'gummyControl', name:'ガミースマイル・コントロール', category:'training', kind:'training',
    duration:'1分', equipment:'鏡',
    illustration: svg(face(`<path d="M28 50 Q40 56 52 50" stroke="#E07A8A" stroke-width="2.5" fill="none"/><rect x="34" y="46" width="12" height="3" fill="#fff" stroke="#0b1530"/>`),
    ),
    purpose:'鏡を見ながら歯茎の見え量を3段階で制御',
    targets:['上唇挙筋','口輪筋','大頬骨筋'],
    how:['鏡前で「微笑→中スマイル→満面スマイル」を3段階で見せる','歯茎の見え量を覚える','各3秒 × 5回'],
    cues:{ do:'TPOで使い分け可能に', dont:'急激に変えない' },
    why:'スマイルは段階制御できる技術。意識的に身につけば写真も対面も自由自在に。',
  },

  // ============== 追加トレ: 表情統合・応用 ==============
  expressionPlay: {
    id:'expressionPlay', name:'表情筋プレイ・5パターン', category:'training', kind:'training',
    duration:'2分', equipment:'なし',
    illustration: svg(face(`<path d="M28 50 Q40 56 52 50" stroke="#E07A8A" stroke-width="2.5" fill="none"/><text x="35" y="24" font-size="6" fill="#FFD93D">★★★★★</text>`)),
    purpose:'喜・驚・困・優・楽 の5表情を順に作り、表情筋の引き出しを増やす',
    targets:['全表情筋'],
    how:['喜:満面スマイル','驚:目を見開く','困:眉を寄せて口角下げ','優:目を細めて柔らかく','楽:満面スマイル+目尻','各5秒 × 2セット'],
    cues:{ do:'感情を込めて', dont:'機械的にやらない' },
    why:'表情の引き出しは魅力に直結。表情筋の総動員域を広げる総合トレ。',
  },
  smileGrading: {
    id:'smileGrading', name:'スマイル・5段階グレーディング', category:'training', kind:'training',
    duration:'1〜2分', equipment:'鏡',
    illustration: svg(face(`<path d="M30 50 Q40 53 50 50" stroke="#FFB7C5" stroke-width="2" fill="none"/><path d="M30 52 Q40 56 50 52" stroke="#E07A8A" stroke-width="3" fill="none"/>`)),
    purpose:'スマイル強度を5段階で出し分けるTPO対応力を獲得',
    targets:['大頬骨筋','口角挙筋','眼輪筋'],
    how:['Lv1:微笑(口閉じ) → Lv5:満面 を順に作る','各3秒で1段階ずつ強める','3セット'],
    cues:{ do:'各段階を明確に出し分け', dont:'すべて同じ強度にしない' },
    why:'写真・接客・プライベートで使い分けられる笑顔は実用的な「美容スキル」。',
  },
  micFace: {
    id:'micFace', name:'マイクロ表情ドリル', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<circle cx="32" cy="38" r="1" fill="#0b1530"/><circle cx="48" cy="38" r="1" fill="#0b1530"/><path d="M36 50 Q40 52 44 50" stroke="#E07A8A" stroke-width="2" fill="none"/>`)),
    purpose:'瞬間的な小さな表情変化を制御し、表情の精度を高める',
    targets:['口角挙筋','眼輪筋','頬筋'],
    how:['ほんの少しだけ口角を上げる(0.5秒)','ほんの少しだけ目を細める(0.5秒)','交互に20回'],
    cues:{ do:'最小限の動きで意図を出す', dont:'大きく動かしすぎない' },
    why:'微細表情の制御は会話中の魅力に直結。表情筋の精緻なコントロール力を磨く。',
  },
  cheekPinpoint: {
    id:'cheekPinpoint', name:'頬ピンポイント・スマイル', category:'training', kind:'training',
    duration:'1分', equipment:'なし',
    illustration: svg(face(`<circle cx="28" cy="46" r="2" fill="#E07A8A"/><circle cx="52" cy="46" r="2" fill="#E07A8A"/>`)),
    purpose:'頬の特定ポイントだけを動員する精度向上',
    targets:['大頬骨筋','頬筋'],
    how:['左頬の最も高い点だけを5秒上げる','右頬も同様に','左右独立で10往復'],
    cues:{ do:'頬の山を点で意識', dont:'全体で持ち上げない' },
    why:'点での動員精度は全体の動きのクオリティを引き上げる。',
  },
  breathFace: {
    id:'breathFace', name:'呼吸連動フェイス', category:'training', kind:'training',
    duration:'2分', equipment:'なし',
    illustration: svg(face(`<path d="M40 50 Q40 38 48 38" stroke="#FFD93D" stroke-width="2" fill="none"/>`)),
    purpose:'呼吸と表情筋の連動でリラックスとリフトを同時に獲得',
    targets:['表情筋全体','広頸筋','横隔膜'],
    how:['鼻から4秒吸気→口角と頬を斜め上に上げる','口から6秒呼気→ゆっくり脱力','10サイクル'],
    cues:{ do:'呼吸のリズムに表情を乗せる', dont:'力みすぎない' },
    why:'自律神経と表情筋の連動で、リラックスしながら効果的にトレできる。',
  },
  faceSymmetryDrill: {
    id:'faceSymmetryDrill', name:'シンメトリー精密ドリル', category:'training', kind:'training',
    duration:'2分', equipment:'鏡',
    illustration: svg(`<rect x="22" y="14" width="36" height="52" rx="4" fill="none" stroke="#E07A8A" stroke-width="1.8"/><path d="M40 14 L40 66" stroke="#FFD93D" stroke-width="1" stroke-dasharray="3,3"/>`),
    purpose:'鏡の中央線を基準に、表情の左右対称性を精密に追い込む',
    targets:['全表情筋'],
    how:['鏡に縦の中央線を意識','口角・眉・頬骨を左右同時に動かして対称チェック','非対称があれば弱い側を増やす × 5項目'],
    cues:{ do:'必ず鏡で確認', dont:'感覚に頼らない' },
    why:'視覚フィードバックなしでは左右非対称の細かい違いは認識できない。',
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
      'symmetryMirror','faceSymmetryDrill','unilateralSmile','winkAlternate',
      'evenChewing','chewBalance','mouthCornerUp','modiolusPress',
      'browLift','postureLink','ahIuEoTraining','tongueRotation',
      'tonguePushSide','duchenneFocus','chinSlideControl',
    ],
  },
  mouthCornerDown: {
    training: [
      'mouthCornerUp','zygoLift','earSmile','modiolusPress','pencilLift',
      'antiGravityCheek','duchenneFocus','smileHold','smileGrading',
      'midfaceHold','cheekPress','cheekPinpoint','ahIuEoTraining',
      'fullFaceFlow','expressionPlay',
    ],
  },
  nasolabialFold: {
    training: [
      'zygoLift','lipNoseLift','upperLipReach','subZygoActivate',
      'nasolabialFade','midfaceRoll','cheekHollow','midfaceHold',
      'tongueRotation','cheekPress','mentalisRelief','cheekPump',
      'innerCheekPush','smileHold','fullFaceFlow',
    ],
  },
  jawSagging: {
    training: [
      'platysmaActivation','platysmaPlank','chinTuck','jawlineSlide',
      'jawlineCarve','supraHyoidIso','tongueUp','palateContact',
      'swallowDrill','swallowGuard','mentalisRelief','postureLink',
      'jawOpen','masseterRelease','necklineStretch',
    ],
  },
  puffiness: {
    training: [
      'cheekPump','cheekToCheekAir','tongueRotation','midfaceRoll',
      'platysmaActivation','jawOpen','swallowDrill','chinTuck',
      'breathFace','fullFaceFlow','necklineStretch','masseterRelease',
    ],
  },
  partsBalance: {
    training: [
      'fullFaceFlow','browLift','eyeOpener','lowerEyelidLift','outerEyeUp',
      'duchenneFocus','zygoLift','lipNoseLift','midfaceHold',
      'postureLink','symmetryMirror','ahIuEoTraining','expressionPlay',
    ],
  },
  // ---- 新規問題タイプ ----
  masseterHypertrophy: {
    training: [
      'masseterRelease','masseterTap','temporalisRelease','jawDropper',
      'chewBalance','chinSlideControl','jawOpen','postureLink',
      'platysmaActivation','smileHold','tongueRotation',
    ],
  },
  cheekHollow: {
    training: [
      'cheekPump','cheekToCheekAir','innerCheekPush','midfaceRoll',
      'subZygoActivate','cheekBoneIso','midfaceHold','zygoLift',
      'cheekPress','smileHold','tongueRotation',
    ],
  },
  longPhiltrum: {
    training: [
      'philtrumShorten','upperLipReach','upperLipHold','lipNoseLift',
      'subZygoActivate','duchenneFocus','smileGrading','zygoLift',
      'midfaceHold','antiGravityCheek',
    ],
  },
  gummySmile: {
    training: [
      'gummyControl','upperLipCoverBottom','smileGrading','upperLipHold',
      'philtrumShorten','duchenneFocus','smileHold','expressionPlay',
      'micFace','zygoLift',
    ],
  },
  hoodedEyelid: {
    training: [
      'eyeOpener','foreheadIso','eyeWindowOpen','browLift',
      'lowerEyelidLift','outerEyeUp','foreheadSmooth','orbicularisLift',
      'browSeparate','expressionPlay',
    ],
  },
  droopyEyeOuter: {
    training: [
      'outerEyeUp','eyeOpener','duchenneFocus','lowerEyelidLift',
      'browLift','winkAlternate','smileHold','micFace',
      'eyeWindowOpen','foreheadIso',
    ],
  },
  templeHollow: {
    training: [
      'temporalisRelease','foreheadIso','foreheadSmooth','browLift',
      'expressionPlay','smileWidener','postureLink','breathFace',
      'fullFaceFlow','symmetryMirror',
    ],
  },
  foreheadLines: {
    training: [
      'foreheadSmooth','foreheadIso','browLift','glabellaRelease',
      'browSeparate','eyeOpener','breathFace','postureLink',
      'symmetryMirror','expressionPlay',
    ],
  },
  glabellarLines: {
    training: [
      'glabellaRelease','procerusEngage','browSeparate','foreheadSmooth',
      'breathFace','foreheadIso','expressionPlay','smileHold',
      'duchenneFocus','postureLink',
    ],
  },
  general: {
    training: [
      'duchenneFocus','smileHold','smileGrading','zygoLift',
      'tongueRotation','earSmile','ahIuEoTraining','generalMaintain',
      'fullFaceFlow','midfaceHold','platysmaActivation','postureLink',
      'expressionPlay','breathFace',
    ],
  },
};

// ===================================================================
// EXERCISE META: zone / intensity / tier
// オーダーメイドプログラム生成用のフィルタタグ
//   zone:      upper(額・目・眉) / mid(頬・鼻) / lower(口・顎・首)
//   intensity: light / medium / heavy
//   tier:      1 (必須/基礎) / 2 (標準) / 3 (応用)
// ===================================================================
export const EXERCISE_META = {
  // 既存
  zygoLift:           { zone:'mid',   intensity:'medium', tier:1 },
  cheekPress:         { zone:'mid',   intensity:'light',  tier:2 },
  mouthCornerUp:      { zone:'lower', intensity:'light',  tier:1 },
  pencilLift:         { zone:'lower', intensity:'medium', tier:2 },
  platysmaActivation: { zone:'lower', intensity:'medium', tier:1 },
  chinTuck:           { zone:'lower', intensity:'medium', tier:1 },
  jawlineSlide:       { zone:'lower', intensity:'medium', tier:2 },
  orbicularisLift:    { zone:'upper', intensity:'light',  tier:1 },
  browLift:           { zone:'upper', intensity:'light',  tier:1 },
  eyeOpener:          { zone:'upper', intensity:'light',  tier:1 },
  masseterRelease:    { zone:'mid',   intensity:'light',  tier:2 },
  jawOpen:            { zone:'lower', intensity:'light',  tier:2 },
  tongueRotation:     { zone:'mid',   intensity:'medium', tier:1 },
  tongueUp:           { zone:'lower', intensity:'light',  tier:1 },
  ahIuEoTraining:     { zone:'mid',   intensity:'heavy',  tier:1 },
  smileHold:          { zone:'mid',   intensity:'medium', tier:1 },
  unilateralSmile:    { zone:'lower', intensity:'medium', tier:2 },
  evenChewing:        { zone:'lower', intensity:'light',  tier:2 },
  cheekPump:          { zone:'mid',   intensity:'light',  tier:2 },
  necklineStretch:    { zone:'lower', intensity:'light',  tier:2 },
  lipNoseLift:        { zone:'mid',   intensity:'medium', tier:2 },
  cheekHollow:        { zone:'mid',   intensity:'medium', tier:2 },
  fullFaceFlow:       { zone:'mid',   intensity:'heavy',  tier:1 },
  symmetryMirror:     { zone:'mid',   intensity:'medium', tier:2 },
  postureLink:        { zone:'lower', intensity:'light',  tier:1 },
  generalMaintain:    { zone:'mid',   intensity:'light',  tier:1 },
  duchenneFocus:      { zone:'mid',   intensity:'medium', tier:1 },
  earSmile:           { zone:'mid',   intensity:'medium', tier:2 },
  modiolusPress:      { zone:'lower', intensity:'medium', tier:2 },
  lowerEyelidLift:    { zone:'upper', intensity:'light',  tier:2 },
  upperLipReach:      { zone:'mid',   intensity:'light',  tier:2 },
  winkAlternate:      { zone:'upper', intensity:'medium', tier:2 },
  midfaceHold:        { zone:'mid',   intensity:'heavy',  tier:1 },
  cheekToCheekAir:    { zone:'mid',   intensity:'medium', tier:2 },
  swallowDrill:       { zone:'lower', intensity:'light',  tier:1 },
  mentalisRelief:     { zone:'lower', intensity:'light',  tier:2 },
  // 新規
  antiGravityCheek:   { zone:'mid',   intensity:'medium', tier:1 },
  cheekBoneIso:       { zone:'mid',   intensity:'heavy',  tier:2 },
  diagonalLift:       { zone:'mid',   intensity:'medium', tier:3 },
  smileWidener:       { zone:'lower', intensity:'medium', tier:2 },
  foreheadIso:        { zone:'upper', intensity:'medium', tier:2 },
  procerusEngage:     { zone:'upper', intensity:'light',  tier:2 },
  glabellaRelease:    { zone:'upper', intensity:'light',  tier:2 },
  outerEyeUp:         { zone:'upper', intensity:'medium', tier:2 },
  eyeWindowOpen:      { zone:'upper', intensity:'medium', tier:2 },
  browSeparate:       { zone:'upper', intensity:'light',  tier:3 },
  foreheadSmooth:     { zone:'upper', intensity:'light',  tier:2 },
  platysmaPlank:      { zone:'lower', intensity:'heavy',  tier:2 },
  jawlineCarve:       { zone:'lower', intensity:'medium', tier:2 },
  supraHyoidIso:      { zone:'lower', intensity:'medium', tier:2 },
  swallowGuard:       { zone:'lower', intensity:'light',  tier:2 },
  masseterTap:        { zone:'mid',   intensity:'light',  tier:2 },
  temporalisRelease:  { zone:'upper', intensity:'light',  tier:2 },
  jawDropper:         { zone:'lower', intensity:'light',  tier:2 },
  chewBalance:        { zone:'lower', intensity:'light',  tier:2 },
  tongueStretch:      { zone:'lower', intensity:'medium', tier:2 },
  tonguePushSide:     { zone:'mid',   intensity:'medium', tier:3 },
  palateContact:      { zone:'lower', intensity:'light',  tier:1 },
  subZygoActivate:    { zone:'mid',   intensity:'medium', tier:2 },
  midfaceRoll:        { zone:'mid',   intensity:'medium', tier:2 },
  nasolabialFade:     { zone:'mid',   intensity:'medium', tier:3 },
  innerCheekPush:     { zone:'mid',   intensity:'medium', tier:2 },
  chinDimple:         { zone:'lower', intensity:'light',  tier:2 },
  chinSlideControl:   { zone:'lower', intensity:'light',  tier:3 },
  philtrumShorten:    { zone:'mid',   intensity:'medium', tier:2 },
  upperLipHold:       { zone:'lower', intensity:'light',  tier:2 },
  upperLipCoverBottom:{ zone:'lower', intensity:'medium', tier:2 },
  gummyControl:       { zone:'lower', intensity:'medium', tier:3 },
  expressionPlay:     { zone:'mid',   intensity:'heavy',  tier:2 },
  smileGrading:       { zone:'mid',   intensity:'medium', tier:2 },
  micFace:            { zone:'mid',   intensity:'light',  tier:3 },
  cheekPinpoint:      { zone:'mid',   intensity:'light',  tier:3 },
  breathFace:         { zone:'mid',   intensity:'light',  tier:1 },
  faceSymmetryDrill:  { zone:'mid',   intensity:'medium', tier:3 },
};

// ===================================================================
// 拡張メタ (Phase 1: 警告・時間帯・道具)
//   tools:     ['none','fingers','pen','mirror'] 必要な道具
//   timeOfDay: ['morning','evening','any']       推奨時間帯
//   contra:    ['tmj','skinSensitive','pregnancy','highBp','neckProblem','glaucoma'] 禁忌
//   warning:   表示用注意文字列
// ===================================================================
export const CONTRA_LABEL = {
  tmj:           '顎関節症・顎の痛み',
  skinSensitive: '敏感肌・皮膚疾患',
  pregnancy:     '妊娠中・産後3ヶ月以内',
  highBp:        '高血圧・心疾患',
  neckProblem:   '首・頸椎の不調',
  glaucoma:      '緑内障・眼圧の高い方',
};
export const TIME_OF_DAY_LABEL = { morning:'🌅 朝向け', evening:'🌙 夜向け', any:'⏱ いつでも' };
export const TOOLS_LABEL = { none:'手ぶら', fingers:'指(手)', pen:'ペン', mirror:'鏡' };

export const EXERCISE_META_EXT = {
  // 顎を大きく動かす系 → 顎関節症は注意
  jawOpen:          { contra:['tmj'], warning:'顎の音や痛みが出たら中止してください' },
  jawDropper:       { contra:['tmj'] },
  jawlineSlide:     { contra:['tmj'] },
  jawlineCarve:     { contra:['tmj'] },
  chinSlideControl: { contra:['tmj'] },
  supraHyoidIso:    { contra:['tmj','neckProblem'] },
  evenChewing:      { contra:['tmj'] },
  chewBalance:      { contra:['tmj'] },

  // 指で押す/タップする系 → 敏感肌は注意
  cheekPress:       { tools:['fingers'], contra:['skinSensitive'], warning:'こすらず、軽く支える程度に' },
  cheekPinpoint:    { tools:['fingers'], contra:['skinSensitive'] },
  earSmile:         { tools:['fingers'] },
  pencilLift:       { tools:['pen'] },
  masseterRelease:  { tools:['fingers'], contra:['tmj','skinSensitive'], timeOfDay:['evening'], warning:'痛みのない範囲で。強圧禁止' },
  masseterTap:      { tools:['fingers'], contra:['tmj','skinSensitive'], warning:'指の腹で軽くトントンする程度' },
  temporalisRelease:{ tools:['fingers'], contra:['skinSensitive'], timeOfDay:['evening'] },
  innerCheekPush:   { tools:['fingers'] },

  // 首・広頸筋系 → 頸椎注意
  necklineStretch:  { timeOfDay:['evening'], contra:['neckProblem'], warning:'痛みのない範囲でゆっくり' },
  platysmaActivation:{ contra:['neckProblem'] },
  platysmaPlank:    { contra:['neckProblem','tmj','highBp'] },
  chinTuck:         { contra:['neckProblem'] },
  postureLink:      { contra:['neckProblem'], timeOfDay:['morning'] },

  // 目元 → 緑内障注意(眼圧を上げる動作)
  eyeOpener:        { contra:['glaucoma'], timeOfDay:['morning'] },
  eyeWindowOpen:    { contra:['glaucoma'], timeOfDay:['morning'] },
  orbicularisLift:  { contra:['glaucoma'], timeOfDay:['evening'] },
  lowerEyelidLift:  { contra:['glaucoma'] },
  outerEyeUp:       { contra:['glaucoma'] },
  winkAlternate:    { contra:['glaucoma'] },

  // 鏡を使う系
  symmetryMirror:   { tools:['mirror'] },
  faceSymmetryDrill:{ tools:['mirror'] },
  micFace:          { tools:['mirror'] },
  smileGrading:     { tools:['mirror'] },
  unilateralSmile:  { tools:['mirror'] },

  // 呼吸系 → 妊娠中・高血圧注意
  breathFace:       { contra:['highBp','pregnancy'], timeOfDay:['evening'], warning:'息止めは無理しないこと' },

  // 朝のシャキッと系
  fullFaceFlow:     { timeOfDay:['morning'] },
  smileHold:        { timeOfDay:['morning'] },
  duchenneFocus:    { timeOfDay:['morning'] },
  ahIuEoTraining:   { timeOfDay:['morning'] },
  tongueRotation:   { timeOfDay:['morning'] },
  expressionPlay:   { timeOfDay:['morning'] },

  // 夜のリラックス系
  generalMaintain:  { timeOfDay:['any'] },
  glabellaRelease:  { timeOfDay:['evening'] },
  foreheadSmooth:   { timeOfDay:['evening'] },
  mentalisRelief:   { timeOfDay:['evening'] },
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
// userContra: ['tmj','skinSensitive',...]
export function isExerciseAllowed(id, userContra = []){
  if (!userContra || userContra.length === 0) return true;
  const m = getMeta(id);
  if (!m.contra || m.contra.length === 0) return true;
  return !m.contra.some(c => userContra.includes(c));
}
