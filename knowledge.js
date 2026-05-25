// ===================================================================
// FACE KNOWLEDGE CARDS
// 問題キー → 知っておきたい知識(豆知識)カード群
// 16カテゴリ × 平均3枚 + 共通 + NG行動 + 栄養/自律神経
// ===================================================================

// --- 解剖図SVG library (Phase 1-4) ---
const ANATOMY_SVG = {
  zygomaticus: `<svg viewBox="0 0 200 220" class="anatomy-svg" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="115" rx="65" ry="90" fill="#FFE3D5" stroke="#E2A98C" stroke-width="1.5"/><circle cx="78" cy="95" r="3" fill="#333"/><circle cx="122" cy="95" r="3" fill="#333"/><ellipse cx="100" cy="148" rx="14" ry="5" fill="none" stroke="#9B4B5C" stroke-width="1.5"/><path d="M70 78 Q85 115, 90 145" stroke="#FF4D7A" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M130 78 Q115 115, 110 145" stroke="#FF4D7A" stroke-width="3.5" fill="none" stroke-linecap="round"/><text x="100" y="205" text-anchor="middle" font-size="11" fill="#FF4D7A" font-weight="700">大頬骨筋 (Zygomaticus)</text></svg>`,
  masseter: `<svg viewBox="0 0 200 220" class="anatomy-svg" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="115" rx="65" ry="90" fill="#FFE3D5" stroke="#E2A98C" stroke-width="1.5"/><circle cx="78" cy="95" r="3" fill="#333"/><circle cx="122" cy="95" r="3" fill="#333"/><ellipse cx="100" cy="148" rx="12" ry="4" fill="none" stroke="#9B4B5C" stroke-width="1.5"/><ellipse cx="55" cy="135" rx="11" ry="24" fill="#FF4D7A" opacity=".7" transform="rotate(-12 55 135)"/><ellipse cx="145" cy="135" rx="11" ry="24" fill="#FF4D7A" opacity=".7" transform="rotate(12 145 135)"/><text x="100" y="205" text-anchor="middle" font-size="11" fill="#FF4D7A" font-weight="700">咬筋 (Masseter)</text></svg>`,
  orbicularisOculi: `<svg viewBox="0 0 200 220" class="anatomy-svg" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="115" rx="65" ry="90" fill="#FFE3D5" stroke="#E2A98C" stroke-width="1.5"/><ellipse cx="78" cy="95" rx="16" ry="12" fill="none" stroke="#FF4D7A" stroke-width="3"/><ellipse cx="122" cy="95" rx="16" ry="12" fill="none" stroke="#FF4D7A" stroke-width="3"/><circle cx="78" cy="95" r="3" fill="#333"/><circle cx="122" cy="95" r="3" fill="#333"/><ellipse cx="100" cy="148" rx="12" ry="4" fill="none" stroke="#9B4B5C" stroke-width="1.5"/><text x="100" y="205" text-anchor="middle" font-size="11" fill="#FF4D7A" font-weight="700">眼輪筋 (Orbicularis oculi)</text></svg>`,
  orbicularisOris: `<svg viewBox="0 0 200 220" class="anatomy-svg" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="115" rx="65" ry="90" fill="#FFE3D5" stroke="#E2A98C" stroke-width="1.5"/><circle cx="78" cy="95" r="3" fill="#333"/><circle cx="122" cy="95" r="3" fill="#333"/><ellipse cx="100" cy="148" rx="20" ry="10" fill="none" stroke="#FF4D7A" stroke-width="3.5"/><text x="100" y="205" text-anchor="middle" font-size="11" fill="#FF4D7A" font-weight="700">口輪筋 (Orbicularis oris)</text></svg>`,
  platysma: `<svg viewBox="0 0 200 220" class="anatomy-svg" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="95" rx="55" ry="72" fill="#FFE3D5" stroke="#E2A98C" stroke-width="1.5"/><circle cx="82" cy="80" r="2.5" fill="#333"/><circle cx="118" cy="80" r="2.5" fill="#333"/><ellipse cx="100" cy="125" rx="10" ry="3" fill="none" stroke="#9B4B5C" stroke-width="1.3"/><path d="M48 162 L72 215 L128 215 L152 162 Z" fill="#FF4D7A" opacity=".65"/><text x="100" y="200" text-anchor="middle" font-size="11" fill="#fff" font-weight="700">広頚筋 (Platysma)</text></svg>`,
  modiolus: `<svg viewBox="0 0 200 220" class="anatomy-svg" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="115" rx="65" ry="90" fill="#FFE3D5" stroke="#E2A98C" stroke-width="1.5"/><circle cx="78" cy="95" r="3" fill="#333"/><circle cx="122" cy="95" r="3" fill="#333"/><ellipse cx="100" cy="148" rx="14" ry="5" fill="none" stroke="#9B4B5C" stroke-width="1.5"/><circle cx="84" cy="148" r="6" fill="#FF4D7A"/><circle cx="116" cy="148" r="6" fill="#FF4D7A"/><g stroke="#FF4D7A" stroke-width="1.5"><line x1="84" y1="148" x2="62" y2="120"/><line x1="84" y1="148" x2="70" y2="170"/><line x1="84" y1="148" x2="90" y2="178"/><line x1="116" y1="148" x2="138" y2="120"/><line x1="116" y1="148" x2="130" y2="170"/><line x1="116" y1="148" x2="110" y2="178"/></g><text x="100" y="205" text-anchor="middle" font-size="11" fill="#FF4D7A" font-weight="700">モディオラス (口角結節点)</text></svg>`,
  frontalis: `<svg viewBox="0 0 200 220" class="anatomy-svg" xmlns="http://www.w3.org/2000/svg"><ellipse cx="100" cy="115" rx="65" ry="90" fill="#FFE3D5" stroke="#E2A98C" stroke-width="1.5"/><path d="M45 55 Q100 30, 155 55 L150 88 Q100 75, 50 88 Z" fill="#FF4D7A" opacity=".65"/><circle cx="78" cy="100" r="3" fill="#333"/><circle cx="122" cy="100" r="3" fill="#333"/><ellipse cx="100" cy="150" rx="12" ry="4" fill="none" stroke="#9B4B5C" stroke-width="1.3"/><text x="100" y="205" text-anchor="middle" font-size="11" fill="#FF4D7A" font-weight="700">前頭筋 (Frontalis)</text></svg>`,
};

const KNOWLEDGE = {
  // --- 左右非対称 ---
  facialAsymmetry: [
    {
      tag: '解剖', emoji: '🪞',
      title: '左右非対称は誰にでもある',
      body: '完全に対称な顔は存在しません。重要なのは「気になる差」が固定化していないか。表情筋の使い方の偏り・噛み癖・寝姿勢・頬杖など、生活習慣が左右差を作り出します。',
    },
    {
      tag: 'メカニズム', emoji: '🦷',
      title: '噛み癖と顔の関係',
      body: 'いつも同じ側で噛むと、咬筋・側頭筋がその側だけ発達し、フェイスラインの太さや高さに左右差が生まれます。意識的に両側で噛むだけで、3週間で印象は変わります。',
      svg: ANATOMY_SVG.masseter,
    },
    {
      tag: '習慣', emoji: '🛏️',
      title: '寝姿勢と顔のゆがみ',
      body: '横向き寝・うつ伏せ寝は、片側の頬・口角に体重がかかり続け、長期で顔の左右差を強めます。仰向け寝に近づけるだけでも、顔の対称性は守れます。',
    },
  ],

  // --- 口角下がり ---
  mouthCornerDown: [
    {
      tag: '筋肉学', emoji: '😌',
      title: '口角下がりは"使わない罪"',
      body: '口角を上げる筋肉(大頬骨筋・口角挙筋)は、意識しないと1日数分しか使われません。一方、下げる筋肉(口角下制筋)は普段の表情で頻繁に使われます。バランスを取るには上げる筋を鍛えるしかありません。',
      svg: ANATOMY_SVG.zygomaticus,
    },
    {
      tag: '印象', emoji: '✨',
      title: '口角3mmで印象は変わる',
      body: '口角の位置が3mm上がるだけで、第一印象が大きく変わるという研究があります。トレーニングは目に見える変化が出やすい部位です。',
    },
    {
      tag: '構造', emoji: '🌟',
      title: 'モディオラスを意識する',
      body: '口角の少し外側にある「モディオラス」は、9つの表情筋が集まる結節点。ここがしっかり上方向に引かれている人は、安静時でも口角が上がって見えます。',
      svg: ANATOMY_SVG.modiolus,
    },
  ],

  // --- ほうれい線 ---
  nasolabialFold: [
    {
      tag: '構造', emoji: '🍑',
      title: 'ほうれい線の正体',
      body: 'ほうれい線は皮膚のシワではなく、頬の脂肪体が下垂して鼻翼の脇でせき止められてできる"段差"です。大頬骨筋・上唇挙筋の弱化が脂肪を支えきれなくなるのが原因。',
    },
    {
      tag: 'ケア', emoji: '💆',
      title: '保湿だけでは消えない',
      body: 'ほうれい線は皮下組織の構造的問題なので、保湿クリームだけでは深さは変わりません。表情筋トレ＋姿勢＋噛み癖の見直しが本質的な対策です。',
    },
    {
      tag: 'メカニズム', emoji: '🎈',
      title: '頬の脂肪体は"重力袋"',
      body: '中顔面の脂肪体(マラーファット)は加齢で支えを失うと下方移動。下に落ちた分だけ口横が膨らみ、ほうれい線が深く見える錯視を生みます。鍵は中顔面の挙上筋。',
    },
  ],

  // --- フェイスラインのたるみ ---
  jawSagging: [
    {
      tag: '輪郭', emoji: '👤',
      title: 'フェイスラインを決める2つの筋',
      body: '広頸筋(首の前)と舌骨上筋群(顎の下)の活動が、フェイスラインのシャープさを決めます。スマホ姿勢で首を前に出している人ほど、これらが衰えやすい。',
      svg: ANATOMY_SVG.platysma,
    },
    {
      tag: '舌', emoji: '👅',
      title: '舌の位置で二重あごは変わる',
      body: '舌が上顎にぴったり付いている(スポットポジション)状態は、フェイスライン引き締めに直結します。1日中、舌が下に落ちている人は要注意。',
    },
    {
      tag: '姿勢', emoji: '🧍‍♀️',
      title: 'ストレートネックは顔がたるむ',
      body: '頭が前に出ると首前面が緩み、顎下の皮膚と脂肪がたわみます。耳と肩を一直線に保つだけで、顎ラインの見え方は劇的に変わります。',
    },
  ],

  // --- むくみ ---
  puffiness: [
    {
      tag: '循環', emoji: '💧',
      title: 'むくみの90%はリンパの停滞',
      body: '顔のむくみのほとんどは、首・鎖骨周りのリンパの流れの悪化が原因。表情筋を動かすこと自体がリンパポンプの役割を果たします。',
    },
    {
      tag: '生活', emoji: '🌙',
      title: '寝起きのむくみ対策',
      body: '寝る前の塩分・アルコール、横向き寝のクセが朝のむくみを作ります。起床後すぐの表情筋トレで、循環を一気に戻せます。',
    },
    {
      tag: '水分', emoji: '🥤',
      title: '水を減らすとむくむ',
      body: '水を控えると体は水分を抱え込もうとして逆にむくみます。1日1.5L前後を分割摂取し、ナトリウムは控えめが基本です。',
    },
  ],

  // --- パーツバランス ---
  partsBalance: [
    {
      tag: '黄金比', emoji: '📐',
      title: '三庭五眼とは',
      body: '額〜眉、眉〜鼻、鼻〜顎の縦バランスを"三庭"、顔幅が目幅の5倍であることを"五眼"と呼びます。これに近いほど整った印象を与えます。骨格は変えられませんが、姿勢・むくみ・表情筋で見え方は変わります。',
    },
    {
      tag: '印象', emoji: '🌸',
      title: '骨格より大切なのは"動き"',
      body: '美しさの正体は静的なパーツより、動的な表情筋の働きと血流。フォトジェニックなパーツより、ライブで魅力的な人を目指す方が現実的で効果的です。',
    },
    {
      tag: '錯視', emoji: '👁️',
      title: '余白が"顔の大きさ"を決める',
      body: '顔の物理的サイズより、パーツ間の余白量が「小顔」印象を作ります。中顔面の引き上げと頬コケの解消で、骨格を変えずに余白比率を整えられます。',
    },
  ],

  // --- 咬筋肥大(エラ張り) ---
  masseterHypertrophy: [
    {
      tag: '筋肉学', emoji: '🦴',
      title: 'エラ張りの正体は"骨"より"筋"',
      body: '生まれつきの骨格だけでなく、咬筋(噛む筋肉)の肥大が輪郭の張り出しを作っています。咬筋は使えば太くなる随意筋。脱力ケアで小さくできます。',
    },
    {
      tag: '習慣', emoji: '😬',
      title: '無意識の食いしばりに注意',
      body: '集中時・スマホ操作時・就寝中の食いしばりは咬筋を24時間ハードに鍛え続ける行為。「上下の歯は触れない」が基本ポジションです。',
    },
    {
      tag: 'ケア', emoji: '🌿',
      title: 'ガム・硬い食材を見直す',
      body: '長時間ガムを噛む・硬煎餅やスルメを毎日噛む習慣は、咬筋トレーニングそのもの。エラを気にする人は咀嚼回数より食材の硬度を意識して。',
    },
  ],

  // --- 頬コケ ---
  cheekHollow: [
    {
      tag: '構造', emoji: '🍂',
      title: '頬コケは"痩せ"より"萎縮"',
      body: '頬がコケて見えるのは、頬の脂肪減少だけでなく、頬筋・大頬骨筋の萎縮による陥凹も原因。表情筋を太く保てば、ふっくら感は戻せます。',
    },
    {
      tag: 'ケア', emoji: '🎈',
      title: '頬の内側から空気で押す',
      body: '頬の内側に空気を入れて押し広げるエクササイズは、頬粘膜・頬筋を動かし、外見の凹みを目立たなくします。1日3セットでも変化します。',
    },
    {
      tag: '生活', emoji: '🍽️',
      title: '極端な糖質制限は頬を削る',
      body: '急激なダイエットは脂肪より先に表情筋を削り、頬コケと老け見えを進めます。タンパク質を切らさず、ゆるやかな減量が美容には正解です。',
    },
  ],

  // --- 人中長め ---
  longPhiltrum: [
    {
      tag: '構造', emoji: '👄',
      title: '人中の"見た目長さ"は変えられる',
      body: '人中(鼻下〜上唇)は骨格で長さが決まりますが、上唇の厚みと上唇挙筋の活動で「見た目の長さ」は短く見せられます。鍵は上唇を上げる動き。',
    },
    {
      tag: '印象', emoji: '🌷',
      title: '上唇が薄いと人中が長く見える',
      body: '上唇のボリュームが下がると相対的に人中の余白が広く見えます。口輪筋・上唇挙筋のトレーニングで上唇に厚みを取り戻せます。',
    },
    {
      tag: '姿勢', emoji: '🪞',
      title: '口呼吸が人中を伸ばす',
      body: '慢性的な口呼吸は上唇を下方向に引き伸ばし、人中が長く見える原因に。鼻呼吸と舌のスポットポジションが人中を引き締める基本です。',
    },
  ],

  // --- ガミースマイル ---
  gummySmile: [
    {
      tag: '筋肉学', emoji: '😬',
      title: 'ガミースマイルは"引きすぎ"',
      body: '笑うと歯茎が見えるのは、上唇挙筋・小頬骨筋が過剰に強く働き、上唇を引き上げ過ぎるため。挙上量をコントロールするトレーニングで改善できます。',
    },
    {
      tag: '印象', emoji: '🌸',
      title: '"歯を見せる量"は自分で決められる',
      body: '笑顔の幅と上唇の上げ幅を分離して動かせるようになると、写真写りのガミー感は格段に減ります。日々の鏡前トレーニングで身につきます。',
    },
  ],

  // --- まぶた(hooded) ---
  hoodedEyelid: [
    {
      tag: '解剖', emoji: '👁️',
      title: 'まぶたの重さは前頭筋とのバランス',
      body: '上まぶたを開く眼瞼挙筋と、額の前頭筋・眉を下げる皺眉筋の力関係でまぶたの軽さが決まります。前頭筋の使い方を覚えるとまぶたが軽く見えます。',
      svg: ANATOMY_SVG.frontalis,
    },
    {
      tag: '印象', emoji: '✨',
      title: '"目力"は瞳より上まぶた',
      body: '目元の印象は瞳サイズより、上まぶたが瞳をどれだけ露出しているかで決まります。眼輪筋上部のトレーニングで瞼裂を広げられます。',
      svg: ANATOMY_SVG.orbicularisOculi,
    },
    {
      tag: '生活', emoji: '📱',
      title: 'スマホ近距離視聴で目元は重くなる',
      body: '近距離ピント固定は眼輪筋・前頭筋を硬直させ、まぶたの可動域を狭めます。1時間ごとに遠方を見るだけでもまぶたの動きは戻ります。',
    },
  ],

  // --- 目尻下がり ---
  droopyEyeOuter: [
    {
      tag: '構造', emoji: '🌙',
      title: '目尻の角度は印象の半分',
      body: '目尻が下がると優しげに、上がるとクールに見えます。目尻の上下は外眼角周辺の眼輪筋・側頭筋膜のテンションで微調整できる範囲があります。',
    },
    {
      tag: 'ケア', emoji: '💆',
      title: 'こめかみの引き上げが目尻を救う',
      body: '側頭部・こめかみの組織は目尻と連結。側頭筋を緩めてから引き上げる手順で、目尻のリフト感を出せます。',
    },
  ],

  // --- こめかみ痩せ ---
  templeHollow: [
    {
      tag: '構造', emoji: '🌑',
      title: 'こめかみのへこみは老け見えの直行サイン',
      body: 'こめかみは加齢で最初に脂肪が減る部位の一つ。ここが凹むと頭蓋骨の輪郭が浮き、老け印象が一気に強まります。側頭筋ケアで改善方向に。',
    },
    {
      tag: 'ケア', emoji: '🌿',
      title: '咬筋疲労を抜くとこめかみが復活',
      body: 'こめかみの陥凹は咬筋・側頭筋の慢性疲労と血流低下が背景。咬筋脱力ケアでこめかみの血色とハリは戻りやすくなります。',
    },
  ],

  // --- 額のシワ ---
  foreheadLines: [
    {
      tag: '筋肉学', emoji: '🌊',
      title: '額のシワは"前頭筋の使い癖"',
      body: '額の横ジワは前頭筋を縦に縮める癖の蓄積。眉を上げて目を開く癖がある人は、まぶたの代わりに額で目を開いている状態です。',
    },
    {
      tag: 'ケア', emoji: '☁️',
      title: 'まぶたを鍛えれば額は休める',
      body: '眼輪筋・眼瞼挙筋がしっかり働けば、額で目を開く必要がなくなり、結果として額のシワが浅くなります。額を直接揉むより根本的です。',
    },
  ],

  // --- 眉間のシワ ---
  glabellarLines: [
    {
      tag: '心理', emoji: '🧠',
      title: '眉間ジワは"集中の置き土産"',
      body: '眉間の縦ジワは皺眉筋・鼻根筋の収縮癖。集中・不機嫌・眩しさで無意識に寄せている時間が長いほど深くなります。',
    },
    {
      tag: 'ケア', emoji: '🌷',
      title: '深呼吸と眉間ほぐしで止められる',
      body: '眉間ジワは老化より「使いすぎ」が主因。1日数回の眉間リリースと深呼吸で、進行は十分止められます。',
    },
  ],

  // --- 一般 ---
  general: [
    {
      tag: '基礎', emoji: '🌷',
      title: '表情筋は60種類以上',
      body: '顔には60以上の表情筋があり、日常で使うのはごく一部。意識的に動かすだけで、印象は明らかに変わります。',
    },
    {
      tag: '習慣', emoji: '☀️',
      title: '毎日5分の積み重ねが効く',
      body: '表情筋は小さな筋肉なので、長時間より「短時間×毎日」のほうが効果的。30日続けると、写真で変化が確認できるようになります。',
    },
    {
      tag: '心理', emoji: '😊',
      title: '笑顔は脳もだませる',
      body: '口角を上げる動作だけで、脳は「楽しい」と錯覚し気分が上がります。表情筋トレは美容と同時にメンタルケアでもあります。',
    },
  ],
};

const COMMON = [
  {
    tag: '基礎', emoji: '🧠',
    title: '表情筋は唯一"皮膚に付く"筋肉',
    body: '体の筋肉のほとんどは骨と骨をつなぎますが、表情筋は片端が皮膚に付着します。つまりトレーニングの効果が見た目に直結する、特殊な筋肉群なのです。',
  },
  {
    tag: '生活', emoji: '📱',
    title: 'スマホ顔に注意',
    body: 'うつむき姿勢は、頭の重さ(約5kg)が首前面と顎下にのしかかり、たるみとシワを加速させます。スマホ時間=フェイスラインの劣化時間と心得て。',
  },
  {
    tag: '栄養', emoji: '🥗',
    title: 'タンパク質不足は表情筋を削る',
    body: '体重×1g/日のタンパク質が不足すると、最初に減るのは小さな随意筋=表情筋。美容食はカロリーより、まずタンパク質量。',
  },
  {
    tag: '睡眠', emoji: '🌙',
    title: '睡眠不足で顔は1日で老ける',
    body: '睡眠が5時間を切ると、リンパ排出と成長ホルモン分泌が大幅低下。むくみ・くま・たるみが同時進行で起こります。',
  },
  {
    tag: '習慣', emoji: '🪞',
    title: '鏡を"敵"でなく"パートナー"に',
    body: '1日30秒、鏡で自分の表情をチェックする習慣があるかどうかで、3ヶ月後の顔は変わります。動的な表情を意識する人は若く見えます。',
  },
];

// --- NG行動カード (Phase 1-5) ---
// 「やってはいけない」習慣を do/dont 形式で提示。
const NG_ACTIONS = [
  {
    tag: 'NG行動', emoji: '🚫', kind: 'ng',
    title: 'ゴリゴリ強マッサージは逆効果',
    body: '強圧で皮下組織を擦ると、コラーゲン繊維を断裂させてたるみを加速させます。',
    dont: ['痛みを感じる強さで擦る','金属ローラーで毎日ゴリゴリ','摩擦で肌が赤くなるまで擦る'],
    do:   ['滑り材(オイル/クリーム)を必ず使う','圧は「気持ちいい」止まり','同じ場所は3往復まで'],
  },
  {
    tag: 'NG行動', emoji: '🚫', kind: 'ng',
    title: '無意識クセが顔を歪める',
    body: '日中の何気ない癖が、3ヶ月で顔の左右差を作ります。',
    dont: ['いつも同じ側で噛む','頬杖を1日10分以上','片側だけで電話を持つ','うつ伏せ/横向き寝固定'],
    do:   ['左右交互に噛む意識','頬杖は20秒以内で解除','スピーカー通話に切替','仰向け寝に近づける'],
  },
  {
    tag: 'NG行動', emoji: '🚫', kind: 'ng',
    title: '表情筋トレの落とし穴',
    body: 'やりすぎ・間違った力みは逆効果。質>量です。',
    dont: ['毎日同じ部位を限界まで','力みすぎて他の筋を緊張','痛みを我慢して続行','口角だけ過度に上げる'],
    do:   ['週4〜5日で休息日を入れる','狙った筋以外は脱力','痛み・違和感は即中止','左右バランスを確認'],
  },
  {
    tag: 'NG行動', emoji: '🚫', kind: 'ng',
    title: '紫外線とブルーライト対策',
    body: 'たるみ・シミの最大要因は摩擦より「光老化」。',
    dont: ['曇りの日にUV対策をしない','室内・車内でも無防備','スマホ画面の至近距離注視'],
    do:   ['SPF30+を毎朝塗布','曇天・室内でも継続','画面距離30cm以上を維持'],
  },
  {
    tag: 'NG行動', emoji: '🚫', kind: 'ng',
    title: 'シワを増やす表情癖',
    body: '同じ表情の繰り返しが固定ジワを作ります。',
    dont: ['集中時に眉間を寄せる','口を尖らせて考える','片眉だけ上げる癖','頬杖+斜め目線'],
    do:   ['1時間ごとに表情リセット','鏡で安静時表情を確認','左右対称を意識','深呼吸で顔を緩める'],
  },
];

// --- 栄養・自律神経カード (Phase 1-6) ---
const NUTRITION_ANS = [
  {
    tag: '栄養', emoji: '🥚', kind: 'nutrition',
    title: 'タンパク質: 1日体重×1g以上',
    body: '表情筋は皮膚に付着する随意筋。タンパク質不足の時、体は真っ先に小さな随意筋から削ります。1食20g(卵3個+肉100gなど)を3食×3日で表情の張りが変わります。',
  },
  {
    tag: '栄養', emoji: '💧', kind: 'nutrition',
    title: 'むくみ三大ミネラル',
    body: 'カリウム(野菜/海藻)・マグネシウム(豆/ナッツ)・水分1.5L以上。塩分を減らすより、これらを足す方が顔のむくみは早く取れます。',
  },
  {
    tag: '栄養', emoji: '🐟', kind: 'nutrition',
    title: 'コラーゲン合成のビタミンC+鉄',
    body: 'タンパク質を肌のハリに変換するにはビタミンC(柑橘・パプリカ)と鉄(赤身肉・あさり)が必要。サプリより食事優先で。',
  },
  {
    tag: '栄養', emoji: '🍵', kind: 'nutrition',
    title: '糖質"摂りすぎ"の顔への影響',
    body: '過剰な糖質は糖化反応(AGEs)を起こし、肌の黄ばみ・たるみ・くすみの原因に。白米→雑穀、菓子→ナッツに置き換えるだけで2週間で違いが出ます。',
  },
  {
    tag: '栄養', emoji: '🌿', kind: 'nutrition',
    title: '朝食を抜くと顔が老ける',
    body: '夜間〜朝の絶食12時間以上で自食(オートファジー)が進む反面、表情筋の合成も止まります。朝はタンパク質+果物だけでも摂取を。',
  },
  {
    tag: '自律神経', emoji: '🌬', kind: 'ans',
    title: '浅い呼吸はたるみを加速',
    body: '胸式呼吸が癖になると、首の補助筋(斜角筋・胸鎖乳突筋)が緊張し、顔のリンパ排出が滞ります。1日3回、4-7-8呼吸(吸う4秒/止める7秒/吐く8秒)を試して。',
  },
  {
    tag: '自律神経', emoji: '🌙', kind: 'ans',
    title: '副交感神経で美容ホルモン分泌',
    body: '成長ホルモン・メラトニンは副交感神経優位の深い睡眠時に最大分泌。寝る90分前のスマホoff・湯舟15分・部屋を暗くする、これだけで肌の修復速度は変わります。',
  },
  {
    tag: '自律神経', emoji: '☀️', kind: 'ans',
    title: '朝日5分で1日が整う',
    body: '起床後5分以内に朝日を浴びるとセロトニン分泌が始まり、14〜16時間後にメラトニンへ変換され深い眠りに。顔のターンオーバーが整います。',
  },
  {
    tag: '自律神経', emoji: '🧘', kind: 'ans',
    title: 'ストレスで眉間と口角が下がる',
    body: '交感神経優位が続くと、皺眉筋・口角下制筋が無意識に緊張。表情の暗さは性格でなく神経の状態です。深呼吸→肩回し→笑顔の順で、神経をリセット。',
  },
  {
    tag: '自律神経', emoji: '🛁', kind: 'ans',
    title: '入浴温度40°C×15分の意味',
    body: '40〜41°Cの湯に15分浸かると深部体温が一時的に上がり、その後の急降下で深い眠りに入りやすくなります。シャワーだけでは得られない美容効果です。',
  },
];

// 問題キー → NGアクションのおすすめペア
const NG_BY_PROBLEM = {
  facialAsymmetry: 1,    // 「無意識クセ」
  nasolabialFold: 0,     // 「ゴリゴリ強マッサージ」
  jawSagging: 1,         // 「無意識クセ」
  eyeBag: 3,             // 「紫外線対策」
  foreheadWrinkle: 4,    // 「シワを増やす表情癖」
  glabellarLine: 4,
  mouthCornerDown: 4,
  hoodedEye: 2,          // 「表情筋トレの落とし穴」
  outerEyeDown: 2,
};

// 問題キー → 栄養/自律神経カードの優先インデックス
const NUTRI_BY_PROBLEM = {
  puffinessIdx: [1],         // むくみ三大ミネラル
  jawSagging: [0, 4],
  facialAsymmetry: [8],
  nasolabialFold: [3, 0],
  eyeBag: [5, 6],
  foreheadWrinkle: [8],
  glabellarLine: [8, 5],
  hoodedEye: [5],
};

export function getKnowledgeFor(problemKeys){
  const seen = new Set();
  const pickFirst = (arr, n) => {
    const out = [];
    for (const c of arr){
      if (!c || seen.has(c.title)) continue;
      seen.add(c.title);
      out.push(c);
      if (out.length >= n) break;
    }
    return out;
  };

  // 1) 問題キー → 解剖/メカニズム系を最大6枚
  const problemCards = [];
  problemKeys.forEach(k => (KNOWLEDGE[k] || []).forEach(c => problemCards.push(c)));
  const topProblem = pickFirst(problemCards, 6);

  // 2) NG行動カード — 関連優先 + デフォルト1〜2枚
  const ngOrder = [];
  problemKeys.forEach(k => {
    const idx = NG_BY_PROBLEM[k];
    if (idx != null && NG_ACTIONS[idx]) ngOrder.push(NG_ACTIONS[idx]);
  });
  // フォールバック
  NG_ACTIONS.forEach(c => ngOrder.push(c));
  const ngCards = pickFirst(ngOrder, 2);

  // 3) 栄養・自律神経カード — 関連優先 + デフォルト1〜2枚
  const nutriOrder = [];
  problemKeys.forEach(k => {
    (NUTRI_BY_PROBLEM[k] || []).forEach(idx => {
      if (NUTRITION_ANS[idx]) nutriOrder.push(NUTRITION_ANS[idx]);
    });
  });
  NUTRITION_ANS.forEach(c => nutriOrder.push(c));
  const nutriCards = pickFirst(nutriOrder, 2);

  // 4) 共通カード
  const commonCards = pickFirst(COMMON, 2);

  // 並びは: 解剖→NG→栄養/自律神経→共通 でリズム良く
  return [...topProblem, ...ngCards, ...nutriCards, ...commonCards].slice(0, 12);
}
